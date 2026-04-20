import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Zap, Activity, Coins, PowerOff, ExternalLink, KeyRound } from 'lucide-react';
import axios from '../api/axios';

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Connection Form State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchWallet = async () => {
    try {
      const { data } = await axios.get('/users/wallet');
      setWalletData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsConnecting(true);

    if (!apiKeyInput.trim().startsWith('AIza') || apiKeyInput.trim().length < 39) {
      setFormError('Invalid Google API Key format. It should start with "AIza".');
      setIsConnecting(false);
      return;
    }

    try {
      await axios.post('/users/wallet/key', { geminiApiKey: apiKeyInput });
      await fetchWallet();
      setApiKeyInput('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to connect engine.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.delete('/users/wallet/key');
      await fetchWallet();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <AnimatePresence mode="wait">
        {!walletData?.hasKey ? (
          <motion.div
            key="onboarding"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
          >
            <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-full mb-4">
              <KeyRound className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Engine Disconnected</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Please connect your key to view usage stats and access AI features.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Daily Coin Dashboard
                </motion.h1>
                <motion.p variants={itemVariants} className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Track your personal AI usage
                </motion.p>
              </div>
              <motion.button
                variants={itemVariants}
                onClick={handleDisconnect}
                className="flex items-center text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium transition-colors bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 px-4 py-2 rounded-lg"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Disconnect Key
              </motion.button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1: Daily Allowance */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-700 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 mb-4">
                  <Zap className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Daily Allowance</h3>
                </div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                  1,500
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Total coins available
                </div>
              </motion.div>

              {/* Card 2: Coins Used */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl shadow-lg border border-purple-100 dark:border-slate-700 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center space-x-3 text-purple-600 dark:text-purple-400 mb-4">
                  <Activity className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Coins Used</h3>
                </div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                  {walletData.dailyCoinsUsed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Consumed today
                </div>
              </motion.div>

              {/* Card 3: Coins Remaining */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl shadow-lg border relative overflow-hidden group ${
                  1500 - walletData.dailyCoinsUsed < 100 
                  ? 'border-orange-300 dark:border-orange-500/50' 
                  : 'border-emerald-100 dark:border-slate-700'
                }`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Coins className={`w-16 h-16 ${1500 - walletData.dailyCoinsUsed < 100 ? 'text-orange-500' : 'text-emerald-500 dark:text-emerald-400'}`} />
                </div>
                <div className={`flex items-center space-x-3 mb-4 ${1500 - walletData.dailyCoinsUsed < 100 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  <Coins className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Coins Remaining</h3>
                </div>
                <div className={`text-4xl font-extrabold tabular-nums ${1500 - walletData.dailyCoinsUsed < 100 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                  {(1500 - walletData.dailyCoinsUsed).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  {1500 - walletData.dailyCoinsUsed < 100 ? 'Running low on coins!' : 'Available for use'}
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="text-center mt-8">
              <p className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold shadow-sm">
                <Zap className="w-4 h-4 mr-2" />
                Your coins automatically refill every night at midnight.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wallet;
