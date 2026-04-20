const User = require('../models/User');
const Note = require('../models/Note');
const cloudinary = require('cloudinary').v2;

// @desc    Get system-wide aggregates
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalNotes = await Note.countDocuments();
        
        // Aggregate engagement across all notes
        const aggregation = await Note.aggregate([
            {
                $project: {
                    totalLikes: { $size: { $ifNull: ["$likes", []] } },
                    totalComments: { $size: { $ifNull: ["$comments", []] } },
                    views: { $ifNull: ["$views", 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    allLikes: { $sum: "$totalLikes" },
                    allComments: { $sum: "$totalComments" },
                    allViews: { $sum: "$views" }
                }
            }
        ]);

        const eng = aggregation[0] || { allLikes: 0, allComments: 0, allViews: 0 };
        const totalEngagement = eng.allLikes + eng.allComments + eng.allViews;

        res.json({
            users: totalUsers,
            notes: totalNotes,
            engagement: totalEngagement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (students mostly)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notes
// @route   GET /api/admin/notes
// @access  Private/Admin
const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({})
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete any note by ID
// @route   DELETE /api/admin/notes/:id
// @access  Private/Admin
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        await note.deleteOne();

        res.json({ message: 'Note removed completely' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        
        // Optional: Also delete their notes
        await Note.deleteMany({ uploadedBy: req.params.id });

        res.json({ message: 'User and their notes removed completely' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get moderation log
// @route   GET /api/admin/moderation-log
// @access  Private/Admin
const getModerationLog = async (req, res) => {
    try {
        const notes = await Note.find({ aiAnalysis: { $exists: true } })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Override AI moderation action
// @route   PATCH /api/admin/moderation-override/:id
// @access  Private/Admin
const overrideAIAction = async (req, res) => {
    try {
        const { newStatus } = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (newStatus === 'active') {
            note.status = 'active';
            await note.save();
            return res.json(note);
        } else if (newStatus === 'deleted') {
            const urlParts = note.fileUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = `student_notes/${publicIdWithExtension.split('.')[0]}`;
            
            await cloudinary.uploader.destroy(publicId);
            await note.deleteOne();

            return res.json({ message: 'Note permanently deleted' });
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getAllUsers,
    getAllNotes,
    deleteNote,
    deleteUser,
    getModerationLog,
    overrideAIAction
};
