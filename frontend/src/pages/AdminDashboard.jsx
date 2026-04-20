import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, Users, FileText, BarChart, ExternalLink, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'notes'
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ users: 0, notes: 0, engagement: 0 });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchNotes();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/admin/moderation-log');
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user and all of their uploaded notes? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        // Re-fetch notes and stats since deleting a user could delete notes
        fetchNotes();
        fetchStats();
      } catch (error) {
        console.error('Failed to delete user', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleOverride = async (id, newStatus) => {
    if (newStatus === 'deleted' && !window.confirm("Are you sure you want to permanently delete this note and its file? This action cannot be undone.")) {
        return;
    }
    
    try {
      await api.patch(`/admin/moderation-override/${id}`, { newStatus });
      // Optimistically remove or update from the list based on action
      if (newStatus === 'deleted') {
         setNotes(notes.filter(n => n._id !== id));
      } else {
         setNotes(notes.map(n => n._id === id ? { ...n, status: 'active' } : n));
      }
      fetchStats();
    } catch (error) {
      console.error('Failed to override', error);
      alert('Failed to execute override');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="p-4 sm:p-8 animate-fade-in-up max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <ShieldIcon className="h-8 w-8 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Moderation Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Platform control and administration.</p>
        </div>
      </div>

      {/* Stat Widgets */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatWidget 
          icon={<Users className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />} 
          title="Total Users" 
          value={stats.users} 
          delay={0.1}
        />
        <StatWidget 
          icon={<FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />} 
          title="Total Notes" 
          value={stats.notes} 
          delay={0.2}
        />
        <StatWidget 
          icon={<BarChart className="h-6 w-6 text-purple-500 dark:text-purple-400" />} 
          title="Total Engagement" 
          value={stats.engagement} 
          delay={0.3}
        />
      </motion.div>

      {/* Tab Controls */}
      <div className="flex space-x-6 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`relative pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'users' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
          User Management
          {activeTab === 'users' && (
            <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`relative pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'notes' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
        >
          Content Moderation
          {activeTab === 'notes' && (
            <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400" />
          )}
        </button>
      </div>

      {/* Tables */}
      <motion.div 
        key={activeTab} // Add key to force re-animation when switching tabs
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
      >
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700">
                  <th className="py-4 px-6 text-sm">ID</th>
                  <th className="py-4 px-6 text-sm">Name</th>
                  <th className="py-4 px-6 text-sm">Email</th>
                  <th className="py-4 px-6 text-sm">Role</th>
                  <th className="py-4 px-6 text-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 text-xs font-mono text-gray-500 dark:text-gray-400">{u._id}</td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.role !== 'admin' && ( // Prevent admin from deleting themselves
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 p-2 rounded-xl transition-colors inline-flex items-center justify-center font-bold"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700">
                  <th className="py-4 px-6 text-sm">Document Info</th>
                  <th className="py-4 px-6 text-sm">AI Decision</th>
                  <th className="py-4 px-6 text-sm">AI Reasoning</th>
                  <th className="py-4 px-6 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {notes.map(note => (
                  <tr key={note._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={note.title}>{note.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.uploadedBy?.name || 'Unknown'} • {new Date(note.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold 
                        ${note.aiAnalysis?.actionTaken === 'auto-approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                          note.aiAnalysis?.actionTaken === 'auto-rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                        {note.aiAnalysis?.actionTaken?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <p className="text-xs mt-2 font-mono text-gray-500">Status: {note.status}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${note.aiAnalysis?.spamScore > 80 ? 'text-rose-500' : note.aiAnalysis?.spamScore > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {note.aiAnalysis?.spamScore}% SPAM
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-[250px]">{note.aiAnalysis?.reason}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end space-x-2 items-center">
                        <a 
                          href={note.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-700/50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                          title="View Original Document"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        
                        {note.status !== 'active' && (
                          <button 
                            onClick={() => handleOverride(note._id, 'active')}
                            className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 p-2 rounded-xl transition-colors inline-flex items-center"
                            title="Override: Force Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        <button 
                          onClick={() => handleOverride(note._id, 'deleted')}
                          className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 p-2 rounded-xl transition-colors inline-flex items-center"
                          title="Override: Permanently Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {notes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500 dark:text-gray-400">No logs found in the moderation system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ShieldIcon = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const StatWidget = ({ icon, title, value }) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group transition-all"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700/20 dark:to-slate-600/20 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
