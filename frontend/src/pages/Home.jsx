import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Filter, Book, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import SkeletonCard from '../components/SkeletonCard';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Skip fetching if not logged in

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (subjectFilter) query.append('subject', subjectFilter);
        
        const { data } = await api.get(`/notes?${query.toString()}`);
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [search, subjectFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Animated Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors flex flex-col items-center text-center ${!user ? 'min-h-[calc(100vh-120px)] justify-center px-6 sm:px-12' : 'py-20 px-6 sm:px-12'}`}>
        
        {/* Subtle, glowing gradient mesh background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-purple-500/20 dark:bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-500/20 dark:bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
        
        {/* Floating 3D Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 dark:from-indigo-500/20 dark:to-purple-600/20 backdrop-blur-md rounded-2xl border border-white/50 dark:border-white/10 shadow-lg hidden md:block"
        />
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-32 h-20 bg-gradient-to-bl from-blue-400/30 to-teal-400/30 dark:from-blue-500/20 dark:to-teal-500/20 backdrop-blur-md rounded-xl border border-white/50 dark:border-white/10 shadow-lg hidden md:block"
        />

        {/* Content */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-700 to-gray-900 dark:from-white dark:via-indigo-300 dark:to-white max-w-4xl tracking-tight z-10"
        >
          Master Your Semesters with NoteShare
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl z-10"
        >
          Access, share, and summarize top-tier university notes instantly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 z-10"
        >
          {!user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  Log In
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="block px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                  Sign Up
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#explore" className="block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  Start Exploring
                </a>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/upload" className="block px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
                  Upload a Note
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {user && (
        <>
          {/* Search and Filters */}
      <div id="explore" className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 text-gray-900 bg-gray-50 dark:bg-slate-900 dark:text-white font-medium transition-colors outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <select 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 text-gray-900 bg-gray-50 dark:bg-slate-900 dark:text-white font-medium appearance-none transition-colors outline-none"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Math">Math</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex flex-col min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center transition-colors">
          <Book className="mr-2 text-indigo-600 dark:text-indigo-400 h-6 w-6" /> Recent Feed
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No notes found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <Link to={`/note/${note._id}`} key={note._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 block group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full uppercase tracking-wider transition-colors">{note.subject}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{note.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 transition-colors">{note.topic}</p>
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-50 dark:border-slate-700 transition-colors">
                  <UserAvatar name={note.uploadedBy?.name} />
                  <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">{note.uploadedBy?.name}</span>
                  <span className="mx-2 flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

const UserAvatar = ({ name = '?' }) => (
  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs transition-colors">
    {name.charAt(0)}
  </div>
);

export default Home;
