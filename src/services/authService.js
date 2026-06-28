// src/services/authService.js
// Authentication service functions using Firebase Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { auth } from './firebase';

// Custom error code thrown when login is blocked due to an unverified email.
// Pages can check err.code === 'auth/email-not-verified' to show the right message.
export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Please verify your email before signing in.');
    this.code = 'auth/email-not-verified';
  }
}

// Register new user — automatically sends a verification email.
// The account exists in Firebase right away (Firebase has no "pending" user
// concept), but we never let an unverified session reach the rest of the app —
// see loginUser below and ProtectedRoute for the actual enforcement.
export const registerUser = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
};

// Login user — rejects the attempt if the email has not been verified yet.
// We sign the user back out immediately so no unverified session lingers.
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await reload(userCredential.user); // get the freshest emailVerified value
  if (!userCredential.user.emailVerified) {
    await signOut(auth);
    throw new EmailNotVerifiedError();
  }
  return userCredential.user;
};

// Logout user
export const logoutUser = async () => {
  await signOut(auth);
};

// Reset password
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// Resend the verification email (used on the "please verify" screen)
export const resendVerificationEmail = async (user) => {
  if (!user) throw new Error('No user is currently signed in.');
  await sendEmailVerification(user);
};

// Re-fetches the user's latest state from Firebase so emailVerified reflects
// a click that just happened in another tab (Firebase doesn't push this live).
export const refreshEmailVerifiedStatus = async (user) => {
  if (!user) return false;
  await reload(user);
  return user.emailVerified;
};
