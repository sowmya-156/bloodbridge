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

// Register new user — automatically sends a verification email
export const registerUser = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  // Fire off the verification email right after account creation
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
};

// Login user
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

// Resend the verification email (used on the "please verify" banner / page)
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
