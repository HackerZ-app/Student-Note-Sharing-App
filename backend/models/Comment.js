const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Note',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    commentText: {
        type: String,
        required: [true, 'Please add comment text']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
