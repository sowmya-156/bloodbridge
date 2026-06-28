// src/context/AuthContext.jsx
// Global authentication state context
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, reload } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Call this after the user clicks the verification link in their email,
  // then comes back to the app — Firebase doesn't push emailVerified changes
  // live, so we have to explicitly reload the user object.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    setUser({ ...auth.currentUser });
  }, []);

  const isEmailVerified = !!user?.emailVerified;

  return (
    <AuthContext.Provider value={{ user, loading, isEmailVerified, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
