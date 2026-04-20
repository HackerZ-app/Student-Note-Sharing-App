import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 animate-fade-in-up py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join to share and discover amazing notes.</p>
        </div>
        
        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-6 font-medium text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Full Name</label>
            <input 
              type="text" 
              required 
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 outline-none transition-all"
              value={name} onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Email</label>
            <input 
              type="email" 
              required 
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Password</label>
            <input 
              type="password" 
              required 
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 outline-none transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)} 
              minLength="6"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Role</label>
            <div className="flex space-x-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer hover:bg-gray-50">
                <input type="radio" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} className="mr-2 text-indigo-600" />
                <span className="font-medium">Student</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer hover:bg-gray-50">
                <input type="radio" value="admin" checked={role === 'admin'} onChange={(e) => setRole(e.target.value)} className="mr-2 text-indigo-600" />
                <span className="font-medium">Admin</span>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">*Admin role allows managing all notes (Demo purpose)</p>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 mt-2">
            Sign Up
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
