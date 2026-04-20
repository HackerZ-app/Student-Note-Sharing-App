const Note = require('../models/Note');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Configure Cloudinary (usually you put this in a config file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload Note
// @route   POST /api/notes
// @access  Private
const uploadNote = async (req, res) => {
    try {
        const { title, subject, topic } = req.body;

        if (!title || !subject || !topic) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // BYOK Limit Check
        if (!req.user.geminiApiKey) {
            return res.status(403).json({ message: "API Key required" });
        }
        if (req.user.dailyCoinsUsed >= 1500) {
            return res.status(429).json({ message: "Daily coin limit reached (1,500 coins). Please wait until midnight." });
        }

        // Upload to Cloudinary using streamifier
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'student_notes',
                        resource_type: 'auto' // Handle PDF and other files
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        // --- AI Content Moderation Pre-Screener ---
        const genAI = new GoogleGenerativeAI(req.user.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a strict content moderator for a student note-sharing platform. Analyze the attached document.
Respond ONLY with a JSON object matching this exact schema:
{ "isEducational": boolean, "spamScore": number(0-100), "reason": "string" }
Criteria: 
- isEducational is true if it's academic material/notes.
- spamScore (0-100) where 100 is pure spam/malware/advertising, 0 is perfect academic notes. Ensure reason briefly justifies this score.`;

        const pdfPart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype || "application/pdf"
            }
        };

        const aiResult = await model.generateContent({
            contents: [{ role: 'user', parts: [ { text: prompt }, pdfPart ] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const aiText = aiResult.response.text();
        const aiAnalysisObj = JSON.parse(aiText);
        
        let moderationStatus = 'active';
        let actionTaken = 'auto-approved';

        if (aiAnalysisObj.spamScore > 80 || !aiAnalysisObj.isEducational) {
            moderationStatus = 'rejected';
            actionTaken = 'auto-rejected';
        } else if (aiAnalysisObj.spamScore > 30) {
            moderationStatus = 'pending';
            actionTaken = 'flagged-for-review';
        }

        const newNote = await Note.create({
            title,
            subject,
            topic,
            fileUrl: result.secure_url,
            uploadedBy: req.user._id,
            status: moderationStatus,
            aiAnalysis: {
                spamScore: aiAnalysisObj.spamScore || 0,
                reason: aiAnalysisObj.reason || 'No reason provided',
                actionTaken: actionTaken
            }
        });

        if (moderationStatus === 'rejected') {
            return res.status(400).json({ message: 'Upload rejected by automated moderation' });
        }

        // Increment coins
        req.user.dailyCoinsUsed += 1;
        await req.user.save();

        res.status(201).json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload note' });
    }
};

// @desc    Get all active notes (with optional filtering)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const { subject, topic, search } = req.query;
        let query = { status: 'active' };

        if (subject) query.subject = { $regex: subject, $options: 'i' };
        if (topic) query.topic = { $regex: topic, $options: 'i' };
        if (search) query.title = { $regex: search, $options: 'i' };
        if (req.query.uploadedBy) query.uploadedBy = req.query.uploadedBy;

        const notes = await Note.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('uploadedBy', 'name email')
            .populate('comments.user', 'name');

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get saved notes for current user
// @route   GET /api/notes/saved
// @access  Private
const getSavedNotes = async (req, res) => {
    try {
        const notes = await Note.find({ saves: req.user._id })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chat with Note PDF
// @route   POST /api/notes/:id/chat
// @access  Private
const chatWithNote = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        // Download PDF
        const pdfResponse = await axios.get(note.fileUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(pdfResponse.data);

        // BYOK Limit Check
        if (!req.user.geminiApiKey) {
            return res.status(403).json({ message: 'No API key found. Please connect your engine in the Wallet.' });
        }
        if (req.user.dailyCoinsUsed >= 1500) {
            return res.status(429).json({ message: 'Daily coin limit reached (1,500 coins). Please wait until midnight.' });
        }

        // Call Gemini (Bypassing pdf-parse entirely!)
        const genAI = new GoogleGenerativeAI(req.user.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert study tutor. Answer the user's question ONLY based on the attached document. If the answer is not in the document, say "I cannot find the answer to that in this document."\n\nUser Question:\n${message}`;

        // Package the raw PDF for Gemini
        const pdfPart = {
            inlineData: {
                data: pdfBuffer.toString("base64"),
                mimeType: "application/pdf"
            }
        };

        // Send BOTH the prompt and the PDF file directly to the AI
        const result = await model.generateContent([prompt, pdfPart]);
        const response = await result.response;
        const text = response.text();

        // Increment coins
        req.user.dailyCoinsUsed += 1;
        await req.user.save();

        res.json({ answer: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to chat with note' });
    }
};

// @desc    Generate Quiz from Note PDF
// @route   POST /api/notes/:id/quiz
// @access  Private
const generateQuiz = async (req, res) => {
    try {
        const { questionCount = 5 } = req.body;

        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        // Download PDF
        const pdfResponse = await axios.get(note.fileUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(pdfResponse.data);

        // BYOK Limit Check
        if (!req.user.geminiApiKey) {
            return res.status(403).json({ message: 'No API key found. Please connect your engine in the Wallet.' });
        }
        if (req.user.dailyCoinsUsed >= 1500) {
            return res.status(429).json({ message: 'Daily coin limit reached (1,500 coins). Please wait until midnight.' });
        }

        // Call Gemini
        const genAI = new GoogleGenerativeAI(req.user.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert test-prep tutor. Generate a multiple-choice quiz based ONLY on the attached document.
Please generate exactly ${questionCount} questions.
Your output MUST be a JSON array of objects, with each object following this exact schema:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact string of the correct option",
    "explanation": "A brief explanation of why this answer is correct",
    "topic": "A short, 1-3 word specific sub-topic this question tests (e.g. 'Photosynthesis', 'Newton\\'s Laws')"
  }
]`;

        const pdfPart = {
            inlineData: {
                data: pdfBuffer.toString("base64"),
                mimeType: "application/pdf"
            }
        };

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [ { text: prompt }, pdfPart ] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const text = result.response.text();
        const quiz = JSON.parse(text);

        // Increment coins
        req.user.dailyCoinsUsed += 1;
        await req.user.save();

        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate quiz' });
    }
};

module.exports = {
    uploadNote,
    getNotes,
    getNoteById,
    getSavedNotes,
    chatWithNote,
    generateQuiz
};
