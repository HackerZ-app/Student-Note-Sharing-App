const Note = require('../models/Note');

// @desc    Toggle Like on a Note
// @route   POST /api/interactions/like/:noteId
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const isLiked = note.likes.includes(userId);

        if (isLiked) {
            note.likes.pull(userId);
            await note.save();
            res.json({ message: 'Note unliked' });
        } else {
            note.likes.push(userId);
            await note.save();
            res.status(201).json({ message: 'Note liked' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Save on a Note
// @route   POST /api/interactions/save/:noteId
// @access  Private
const toggleSave = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const isSaved = note.saves.includes(userId);

        if (isSaved) {
            note.saves.pull(userId);
            await note.save();
            res.json({ message: 'Note removed from saved' });
        } else {
            note.saves.push(userId);
            await note.save();
            res.status(201).json({ message: 'Note saved' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a comment
// @route   POST /api/interactions/comment/:noteId
// @access  Private
const addComment = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;
        const { commentText } = req.body;

        if (!commentText) {
            return res.status(400).json({ message: 'Please provide comment text' });
        }

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const newComment = {
            user: userId,
            text: commentText
        };

        note.comments.push(newComment);
        await note.save();

        // Populate the user field of the newest comment to return to the client
        await note.populate('comments.user', 'name');
        
        const populatedComment = note.comments[note.comments.length - 1];

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    toggleLike,
    toggleSave,
    addComment
};
