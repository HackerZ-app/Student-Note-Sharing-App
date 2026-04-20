import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please attach a file');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('topic', topic);
    formData.append('file', file);

    try {
      await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        toast.error("Please provide a Google API key to fully explore the app.", { style: { background: '#333', color: '#fff' } });
      } else {
        toast.error('Failed to upload note');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4 text-indigo-600">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Upload Note</h1>
          <p className="text-gray-500 mt-2">Share your wisdom with the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Subject</label>
              <input 
                type="text" 
                required 
                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 outline-none transition-all"
                value={subject} onChange={(e) => setSubject(e.target.value)} 
                placeholder="e.g. Physics"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Topic</label>
              <input 
                type="text" 
                required 
                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 outline-none transition-all"
                value={topic} onChange={(e) => setTopic(e.target.value)} 
                placeholder="e.g. Thermodynamics"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Title</label>
            <input 
              type="text" 
              required 
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 outline-none transition-all"
              value={title} onChange={(e) => setTitle(e.target.value)} 
              placeholder="Descriptive title for your notes..."
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 mt-6 hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              required 
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="font-medium text-indigo-600 mb-1">Click to upload or drag and drop</div>
              <p className="text-xs text-gray-500">PDF, TXT up to 10MB</p>
            </div>
            {file && (
              <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 rounded-xl text-center font-medium animate-pulse">
                Selected: {file.name}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mt-6 flex justify-center disabled:opacity-70"
          >
            {loading ? 'Uploading safely to Cloud storage...' : 'Publish Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
