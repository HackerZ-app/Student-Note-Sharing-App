import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const NoteChat = ({ noteId }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am your AI study tutor. What would you like to know about this document?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await api.post(`/notes/${noteId}/chat`, { message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: data.answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      if (error.response?.status === 403) {
        toast.error("Please provide a Google API key to fully explore the app.", { style: { background: '#333', color: '#fff' } });
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error processing your request. Please try again.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
      <div className="bg-indigo-600 dark:bg-indigo-900/80 p-4 border-b border-indigo-700 dark:border-indigo-800 flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center text-sm md:text-base">
          <Bot className="mr-2 h-5 w-5" />
          Document AI Tutor
        </h3>
        <span className="text-indigo-200 text-xs flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></span>
          Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/50 ml-3' : 'bg-rose-100 dark:bg-rose-900/50 mr-3'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> : <Bot className="h-4 w-4 text-rose-600 dark:text-rose-300" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700/80 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-slate-600 shadow-sm'
                  }`}
                style={msg.role === 'user' ? { wordBreak: 'break-word', whiteSpace: 'pre-wrap' } : { wordBreak: 'break-word' }}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm prose-indigo dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700/80 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm italic">Analyzing PDF...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question about this document..."
            className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:dark:bg-slate-600 disabled:opacity-50 text-white rounded-xl p-2 transition-colors flex flex-shrink-0 items-center justify-center h-10 w-10 shadow-sm hover:shadow-md"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NoteChat;
