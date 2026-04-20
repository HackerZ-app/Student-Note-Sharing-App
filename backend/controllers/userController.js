const User = require('../models/User');

// @desc    Get user wallet status
// @route   GET /api/users/wallet
// @access  Private
const getWallet = async (req, res) => {
    try {
        res.json({
            hasKey: !!req.user.geminiApiKey,
            dailyCoinsUsed: req.user.dailyCoinsUsed || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save gemini AI key to wallet
// @route   POST /api/users/wallet/key
// @access  Private
const saveWalletKey = async (req, res) => {
    try {
        const { geminiApiKey } = req.body;
        
        if (!geminiApiKey || typeof geminiApiKey !== 'string') {
            return res.status(400).json({ message: 'Invalid Google API Key format' });
        }
        
        // Basic validation for Google Gemini API key:
        // Must start with 'AIza' and be at least 39 characters
        if (!geminiApiKey.startsWith('AIza') || geminiApiKey.trim().length < 39) {
            return res.status(400).json({ message: 'Invalid Google API Key format' });
        }
        
        req.user.geminiApiKey = geminiApiKey.trim();
        await req.user.save();
        
        res.json({ message: 'Engine connected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove gemini AI key from wallet
// @route   DELETE /api/users/wallet/key
// @access  Private
const removeWalletKey = async (req, res) => {
    try {
        req.user.geminiApiKey = null;
        await req.user.save();
        
        res.json({ message: 'Engine disconnected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWallet,
    saveWalletKey,
    removeWalletKey
};
