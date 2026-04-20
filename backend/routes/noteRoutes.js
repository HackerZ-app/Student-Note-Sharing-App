const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { checkCoinReset } = require('../middleware/coinResetMiddleware');
const { uploadNote, getNotes, getNoteById, getSavedNotes, chatWithNote, generateQuiz } = require('../controllers/noteController');

// Multer configured for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
    .get(protect, getNotes)
    .post(protect, upload.single('file'), uploadNote);

router.get('/saved', protect, getSavedNotes);

router.route('/:id').get(protect, getNoteById);
router.post('/:id/chat', protect, checkCoinReset, chatWithNote);
router.post('/:id/quiz', protect, checkCoinReset, generateQuiz);

module.exports = router;
