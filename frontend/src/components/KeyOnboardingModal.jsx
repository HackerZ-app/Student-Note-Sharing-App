import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, ExternalLink, KeyRound, X } from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const KeyOnboardingModal = ({ onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formError, setFormError] = useState('');
  const { refreshUser } = useContext(AuthContext);

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
      await refreshUser();
      toast.success("Engine connected successfully!", { style: { background: '#333', color: '#fff' } });
      // App.jsx will unmount this modal automatically when user.hasKey becomes true
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to connect engine.');
      toast.error("Failed to connect engine", { style: { background: '#333', color: '#fff' } });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 rounded-full text-white/90 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
          <div className="flex items-center space-x-3 mb-2 pr-8">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Connect your AI Engine</h1>
          </div>
          <p className="opacity-90 text-lg mt-2 font-medium">Power up your study sessions with a Bring-Your-Own-Key model.</p>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Setup Guide</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">1</div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold inline-flex items-center">Google AI Studio <ExternalLink className="w-3 h-3 ml-1" /></a> (it's completely free).
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">2</div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Click the blue <strong>"Create API Key"</strong> button to generate your unique key.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">3</div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Paste your secure key below to connect.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-750 p-6 rounded-xl border border-gray-100 dark:border-slate-600 flex flex-col justify-center">
              <form onSubmit={handleConnect} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Your Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 pr-12 placeholder-gray-400 dark:placeholder-gray-400 font-mono transition-shadow shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formError && <p className="text-rose-500 text-sm mt-2 font-medium">{formError}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Engine'}
                </button>

                <div className="flex items-start text-emerald-600 dark:text-emerald-400 mt-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                  <ShieldCheck className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    Your key is encrypted securely and never shared. We only use it to power your personal study sessions.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KeyOnboardingModal;
