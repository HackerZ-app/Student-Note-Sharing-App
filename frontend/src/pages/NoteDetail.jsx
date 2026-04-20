import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Heart, Bookmark, ExternalLink, Send, X, PlayCircle, Settings2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NoteChat from '../components/NoteChat';

const NoteDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [note, setNote] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizConfig, setQuizConfig] = useState({ count: 5, timer: true });
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data } = await api.get(`/notes/${id}`);
        setNote(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNote();
  }, [id]);

  const handleLike = async () => {
    if (!user) return alert('Please log in to like notes');
    
    // Optimistic UI toggle
    const isCurrentlyLiked = note.likes.includes(user._id);
    setNote(prev => ({
      ...prev,
      likes: isCurrentlyLiked ? prev.likes.filter(id => id !== user._id) : [...prev.likes, user._id]
    }));

    try {
      await api.post(`/interactions/like/${id}`);
    } catch(err) {
      // Revert if failed
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!user) return alert('Please log in to save notes');
    
    // Optimistic UI toggle
    const isCurrentlySaved = note.saves.includes(user._id);
    setNote(prev => ({
      ...prev,
      saves: isCurrentlySaved ? prev.saves.filter(id => id !== user._id) : [...prev.saves, user._id]
    }));

    try {
      await api.post(`/interactions/save/${id}`);
    } catch(err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if(!commentText || !user) return;
    try {
      const { data: newComment } = await api.post(`/interactions/comment/${id}`, { commentText });
      setNote(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
      setCommentText('');
    } catch (error) {
      console.error(error);
    }
  };

  const isLiked = note?.likes?.includes(user?._id);
  const isSaved = note?.saves?.includes(user?._id);

  if (!note) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400">Loading note details...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up flex flex-col lg:flex-row gap-8">
      {/* Left Column: Note Details & Comments */}
      <div className="lg:w-2/3 flex flex-col space-y-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 space-y-6 transition-colors duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{note.title}</h1>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">{note.subject}</span>
              <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">{note.topic}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleLike} 
              className={`p-3 rounded-full transition-colors flex items-center shadow-sm space-x-2 ${isLiked ? 'text-rose-500 bg-rose-100 dark:bg-rose-900/40' : 'text-gray-500 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 dark:bg-slate-700/50 dark:hover:bg-rose-900/20'}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold text-sm">{note.likes?.length || 0}</span>
            </button>
            <button 
              onClick={handleSave} 
              className={`p-3 rounded-full transition-colors flex items-center shadow-sm space-x-2 ${isSaved ? 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40' : 'text-gray-500 hover:text-indigo-500 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-700/50 dark:hover:bg-indigo-900/20'}`}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="font-semibold text-sm">{note.saves?.length || 0}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
          <div className="h-10 w-10 bg-indigo-200 dark:bg-indigo-600 rounded-full flex items-center justify-center text-indigo-700 dark:text-white font-bold mr-4">
            {note.uploadedBy?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{note.uploadedBy?.name || 'Unknown User'}</p>
            <p className="text-xs">Uploaded on {new Date(note.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* PDF Preview Area */}
        <div className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-gray-100 dark:border-slate-600 shadow-inner bg-gray-50 dark:bg-slate-900">
          <iframe 
            src={note.fileUrl} 
            title="PDF Preview"
            className="w-full h-full border-none"
            loading="lazy"
          >
            <p>Your browser does not support PDFs. <a href={note.fileUrl}>Download the PDF</a>.</p>
          </iframe>
        </div>

        <a 
          href={note.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-xl font-medium shadow-md transition-transform hover:scale-[1.01]"
        >
          <ExternalLink className="h-5 w-5" />
          <span>Open Original Document / Download</span>
        </a>

        <button
          onClick={() => setShowQuizModal(true)}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 rounded-xl font-medium shadow-md transition-transform hover:scale-[1.01]"
        >
          <PlayCircle className="h-5 w-5" />
          <span>Generate Practice Quiz (AI)</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 transition-colors duration-200">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Discussion</h2>
        
        <form onSubmit={handleComment} className="flex space-x-3 mb-8">
          <input 
            type="text" 
            placeholder="Add a meaningful comment..." 
            className="flex-1 border border-gray-200 dark:border-slate-600 bg-transparent dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center hover:bg-indigo-700 transition-colors">
            <Send className="h-4 w-4 mr-2" /> Post
          </button>
        </form>

        <div className="space-y-4">
          {!note.comments || note.comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">No comments yet. Be the first to start the discussion!</p>
          ) : (
            note.comments.map((comment, index) => (
              <div key={index} className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{comment.user?.name || 'Unknown User'}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

      {/* Right Column: AI Chat */}
      <div className="lg:w-1/3 flex flex-col">
        <div className="sticky top-24">
          <NoteChat noteId={note._id} />
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                <Settings2 className="h-5 w-5" />
                Configure Quiz
              </h3>
              <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
                <div className="flex gap-4">
                  {[5, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => setQuizConfig({ ...quizConfig, count: num })}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${quizConfig.count === num ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Timer Mode (1 min/question)</label>
                <button
                  onClick={() => setQuizConfig({ ...quizConfig, timer: !quizConfig.timer })}
                  className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${quizConfig.timer ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                >
                  {quizConfig.timer ? 'Timer: ON' : 'Timer: OFF'}
                </button>
              </div>

              <button
                onClick={() => {
                  setShowQuizModal(false);
                  navigate(`/note/${note._id}/quiz`, { state: quizConfig });
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-5 w-5" />
                Start Practice Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetail;
