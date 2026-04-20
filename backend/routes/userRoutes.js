const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkCoinReset } = require('../middleware/coinResetMiddleware');
const { getWallet, saveWalletKey, removeWalletKey } = require('../controllers/userController');

// Wallet routes
router.route('/wallet')
    .get(protect, checkCoinReset, getWallet);

router.route('/wallet/key')
    .post(protect, saveWalletKey)
    .delete(protect, removeWalletKey);

module.exports = router;
