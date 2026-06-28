// src/components/common/VerifyEmailBanner.jsx
// Persistent banner shown to logged-in users whose email is not yet verified.
import { useState } from 'react';
import { FiMail, FiAlertCircle, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { resendVerificationEmail } from '../../services/authService';
import toast from 'react-hot-toast';

export default function VerifyEmailBanner() {
  const { user, isEmailVerified, refreshUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  // Don't show anything if there's no user, or they're already verified
  if (!user || isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail(user);
      toast.success('Verification email sent! Please check your inbox (and spam folder).');
    } catch {
      toast.error('Could not resend the email right now. Please try again shortly.');
    } finally {
      setSending(false);
    }
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await refreshUser();
      toast.success('Rechecked your verification status.');
    } catch {
      toast.error('Could not refresh your status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 text-sm text-amber-800 dark:text-amber-300">
          <FiAlertCircle className="shrink-0 mt-0.5 sm:mt-0" size={16} />
          <p>
            <span className="font-semibold">Please verify your email</span> — we sent a link to{' '}
            <span className="font-medium">{user.email}</span>. Some features are limited until you verify.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors whitespace-nowrap"
          >
            <FiCheckCircle size={13} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking...' : "I've verified"}
          </button>
          <button
            onClick={handleResend}
            disabled={sending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            {sending ? <FiRefreshCw size={13} className="animate-spin" /> : <FiMail size={13} />}
            {sending ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
