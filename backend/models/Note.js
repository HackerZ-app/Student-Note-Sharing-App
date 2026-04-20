const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    topic: {
        type: String,
        required: [true, 'Please add a topic']
    },
    fileUrl: {
        type: String, // Cloudinary or Firebase URL
        required: [true, 'Please upload a note file']
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'flagged', 'rejected', 'archived', 'removed'],
        default: 'pending'
    },
    aiAnalysis: {
        spamScore: Number,
        reason: String,
        actionTaken: {
            type: String,
            enum: ['auto-approved', 'flagged-for-review', 'auto-rejected']
        }
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    saves: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
