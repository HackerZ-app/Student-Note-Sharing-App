import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { BookOpen, LogOut, Upload as UploadIcon, User, Shield, Sun, Moon, Wallet as WalletIcon, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md border-b border-gray-100 dark:border-slate-700 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight transition-transform hover:scale-105">
            <BookOpen className="h-6 w-6" />
            <span>NoteShare</span>
          </Link>

          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              user.role === 'admin' ? (
                <>
                  <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                    View Live Site
                  </Link>
                  <Link to="/admin" className="flex items-center text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium transition-colors">
                    <Shield className="h-4 w-4 mr-1" /> Admin Panel
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-all ml-4"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/feed" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                    Feed
                  </Link>
                  <Link to="/upload" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                    <UploadIcon className="h-4 w-4 mr-1" /> Upload
                  </Link>
                  <Link to="/dashboard" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                    <User className="h-4 w-4 mr-1" /> Dashboard
                  </Link>
                  <Link to="/wallet" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                    <WalletIcon className="h-4 w-4 mr-1" /> Wallet
                  </Link>
                  <Link to="/profile" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                    <Settings className="h-4 w-4 mr-1" /> Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-all ml-4"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-transform hover:scale-105">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
