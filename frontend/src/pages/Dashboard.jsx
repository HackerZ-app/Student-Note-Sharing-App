import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, Eye, Zap, Book, Clock } from 'lucide-react';
import api from '../api/axios';
import SkeletonCard from '../components/SkeletonCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'saved'
  const [uploads, setUploads] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user) {
          // Fetch user's uploads
          const uploadRes = await api.get(`/notes?uploadedBy=${user._id}`);
          setUploads(uploadRes.data);
          
          // Fetch user's saved notes
          const savedRes = await api.get('/notes/saved');
          setSavedNotes(savedRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const activeNotes = activeTab === 'uploads' ? uploads : savedNotes;

  const totalViews = uploads.reduce((acc, note) => acc + (note.views || 0), 0);
  const totalLikes = uploads.reduce((acc, note) => acc + (note.likes?.length || 0), 0);
  const totalComments = uploads.reduce((acc, note) => acc + (note.comments?.length || 0), 0);
  const reputationScore = (totalLikes * 5) + (totalComments * 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-6 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 dark:from-indigo-600/10 dark:to-purple-600/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="h-20 w-20 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg z-10">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center font-medium">
            <Zap className="h-4 w-4 mr-1 text-amber-500" /> You're on a 3-day learning streak!
          </p>
        </div>
      </motion.div>

      {/* Stat Widgets */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatWidget 
          icon={<UploadCloud className="h-6 w-6 text-indigo-500" />} 
          title="Total Uploads" 
          value={uploads.length} 
        />
        <StatWidget 
          icon={<Eye className="h-6 w-6 text-blue-500" />} 
          title="Views / Downloads" 
          value={totalViews}
        />
        <StatWidget 
          icon={<Book className="h-6 w-6 text-purple-500" />} 
          title="Reputation Score" 
          value={reputationScore}
        />
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-8 border-b border-gray-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`relative pb-4 text-sm font-bold transition-colors uppercase tracking-wider ${activeTab === 'uploads' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          My Uploads
          {activeTab === 'uploads' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`relative pb-4 text-sm font-bold transition-colors uppercase tracking-wider ${activeTab === 'saved' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          Saved Notes
          {activeTab === 'saved' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
      </div>

      {/* Content Grid */}
      <div className="min-h-[40vh]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : activeNotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm text-center"
          >
            <div className="h-20 w-20 bg-indigo-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="h-10 w-10 text-indigo-400 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No notes found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-lg">
              {activeTab === 'uploads' 
                ? "You haven't uploaded any notes yet. Share your knowledge with the community!" 
                : "You haven't saved any notes yet. Explore the feed and bookmark your favorites."}
            </p>
            {activeTab === 'uploads' && (
              <Link to="/upload" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-1 block">
                Upload your first note
              </Link>
            )}
            {activeTab === 'saved' && (
              <Link to="/" className="px-8 py-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 block">
                Explore Feed
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeNotes.map(note => (
              <motion.div key={note._id} variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }} className="w-full">
                <Link to={`/note/${note._id}`} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm block w-full h-full relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 rounded-2xl transition-colors pointer-events-none" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full uppercase tracking-wider">{note.subject}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{note.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{note.topic}</p>
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-50 dark:border-slate-700">
                    <Clock className="h-3 w-3 mr-1" /> {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

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
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-slate-700/50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;