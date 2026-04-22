import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleKeyUpdate = (e) => {
    e.preventDefault();
    // TODO: Wire this up to your backend PUT /api/users/key endpoint
    console.log("Updating key to:", apiKeyInput);
    setIsEditingKey(false);
  };

  if (!user) return <div className="text-center p-8 text-gray-900 dark:text-white">Loading profile...</div>;

  return (
    <div className="min-h-screen w-full flex justify-center p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account details and AI preferences.</p>
            </div>
            <div className="h-16 w-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center border-2 border-cyan-500">
              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user?.name || 'Student Explorer'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user?.email || 'student@example.com'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-1">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* AI Wallet & Key Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Wallet & Security</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Daily Coins Remaining</label>
                <p className="mt-1 text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {user?.coins !== undefined ? user.coins : '1,500'}
                </p>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Google Gemini API Key</label>
                {!isEditingKey ? (
                  <div className="flex gap-3">
                    <input 
                      type="password" 
                      readOnly 
                      value="••••••••••••••••••••••••••••••" 
                      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg block w-full p-2.5 opacity-70 cursor-not-allowed"
                    />
                    <button 
                      onClick={() => setIsEditingKey(true)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleKeyUpdate} className="flex flex-col gap-3">
                    <input 
                      type="password" 
                      required
                      placeholder="Paste new AIza... key here"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium text-sm">Save Key</button>
                      <button type="button" onClick={() => setIsEditingKey(false)} className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors font-medium text-sm">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl shadow p-6 border border-red-200 dark:border-red-900/30 mt-8">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">Logging out will clear your current session. You will need to sign back in to access your notes and AI tutor.</p>
          <button 
            onClick={logout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
