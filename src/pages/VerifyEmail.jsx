// src/pages/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiDroplet, FiCheckCircle, FiRefreshCw, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail, logoutUser } from '../services/authService';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const { user, isEmailVerified, refreshUser, loading } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  // If they're already verified (e.g. they clicked the link, then navigated
  // back here, or refreshed), send them straight to the dashboard.
  useEffect(() => {
    if (!loading && isEmailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, isEmailVerified, navigate]);

  // If there's no logged-in user at all, this page makes no sense — send to login.
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail(user);
      toast.success('Verification email sent! Check your inbox and spam folder.');
    } catch {
      toast.error('Could not resend right now. Please wait a moment and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await refreshUser();
      // The redirect effect above will fire automatically if it's now verified.
      toast('Status rechecked.', { icon: 'ℹ️' });
    } catch {
      toast.error('Could not refresh status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <FiDroplet className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Blood<span className="text-red-600">Bridge</span></span>
        </Link>

        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <FiMail size={28} className="text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify your email</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">We sent a verification link to</p>
        <p className="font-semibold text-red-600 mb-6">{user.email}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Click the link in that email, then come back here and tap <strong>"I've verified"</strong> below.
          Didn't get it? Check your spam folder, or resend it.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md text-sm"
          >
            <FiCheckCircle size={15} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking...' : "I've verified — continue"}
          </button>
          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            <FiRefreshCw size={14} className={sending ? 'animate-spin' : ''} />
            {sending ? 'Sending...' : 'Resend verification email'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-400 hover:text-red-500 transition-colors text-sm"
          >
            <FiLogOut size={13} /> Log out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
