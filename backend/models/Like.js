const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Note',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // Gives us createdAt if we need to know when like happened
});

// Ensure a user can only like a specific note once
likeSchema.index({ noteId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
