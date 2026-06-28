// src/pages/VerifyEmail.jsx
//
// Design note on why this page needs a password field:
// By design, no unverified session is ever allowed to persist in this app —
// Signup.jsx signs the user out immediately, and loginUser() throws and signs
// out again if emailVerified is still false. That's what makes enforcement
// airtight. The trade-off is that sendEmailVerification() requires an active
// Firebase user object to call on, and we deliberately have none here. So to
// offer a working "Resend email" button, we briefly sign the user back in
// with their password, fire the verification email, then immediately sign
// out again — the user never reaches a usable, unverified session.
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiDroplet, FiLogIn, FiRefreshCw, FiLock } from 'react-icons/fi';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Enter your email and password to resend the verification link.');
      return;
    }
    setSending(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user.emailVerified) {
        // They're actually already verified — just sign out and send them to login normally.
        await signOut(auth);
        toast.success('Your email is already verified — please log in.');
        return;
      }
      await sendEmailVerification(cred.user);
      await signOut(auth); // never leave an unverified session active
      toast.success('Verification email sent! Check your inbox and spam folder.');
      setPassword('');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Incorrect email or password.'
        : 'Could not resend right now. Please try again shortly.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <FiDroplet className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Blood<span className="text-red-600">Bridge</span></span>
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiMail size={28} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify your email to continue</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your account can't be used until you click the verification link we emailed you.
            Already clicked it? Just <Link to="/login" className="text-red-600 hover:underline font-medium">log in</Link> now.
          </p>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Didn't get the email? Resend it
          </p>
          <form onSubmit={handleResend} className="space-y-3">
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
            >
              <FiRefreshCw size={14} className={sending ? 'animate-spin' : ''} />
              {sending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </form>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            We ask for your password here only to confirm it's really you — we don't keep you signed in.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            <FiLogIn size={14} /> Go to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
