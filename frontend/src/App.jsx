import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import NoteDetail from './pages/NoteDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizPage from './pages/QuizPage';
import Wallet from './pages/Wallet';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import KeyOnboardingModal from './components/KeyOnboardingModal';

function App() {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && user.hasKey === false) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <Toaster position="top-right" />
      {showModal && <KeyOnboardingModal onClose={() => setShowModal(false)} />}
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<Home />} />
          <Route path="/note/:id" element={<NoteDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/note/:id/quiz" element={<QuizPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
