const mongoose = require('mongoose');

const savedNoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    noteId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Note',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only save a specific note once
savedNoteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

module.exports = mongoose.model('SavedNote', savedNoteSchema);
