const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleLike, toggleSave, addComment } = require('../controllers/interactionController');

router.post('/like/:noteId', protect, toggleLike);
router.post('/save/:noteId', protect, toggleSave);
router.post('/comment/:noteId', protect, addComment);

module.exports = router;
