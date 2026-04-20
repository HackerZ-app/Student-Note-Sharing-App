const checkCoinReset = async (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }

        const now = new Date();
        const lastActive = req.user.lastActiveDate ? new Date(req.user.lastActiveDate) : new Date(0);
        
        // Reset if the last active date is from a different calendar day
        if (now.getDate() !== lastActive.getDate() || 
            now.getMonth() !== lastActive.getMonth() || 
            now.getFullYear() !== lastActive.getFullYear()) {
            
            req.user.dailyCoinsUsed = 0;
            req.user.lastActiveDate = now;
            await req.user.save();
        }
        next();
    } catch (error) {
        console.error("Coin reset middleware error:", error);
        next();
    }
};

module.exports = { checkCoinReset };
