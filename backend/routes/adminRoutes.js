const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const { getSystemStats, getAllUsers, getAllNotes, deleteNote, deleteUser, getModerationLog, overrideAIAction } = require('../controllers/adminController');

router.get('/stats', protect, admin, getSystemStats);
router.get('/notes', protect, admin, getAllNotes);
router.get('/users', protect, admin, getAllUsers);
router.delete('/notes/:id', protect, admin, deleteNote);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/moderation-log', protect, admin, getModerationLog);
router.patch('/moderation-override/:id', protect, admin, overrideAIAction);

module.exports = router;
