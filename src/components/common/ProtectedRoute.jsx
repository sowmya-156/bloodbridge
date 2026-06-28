// src/components/common/ProtectedRoute.jsx
// Wraps routes that require authentication AND a verified email.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading, isEmailVerified } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Defense in depth: even if an unverified session somehow exists (e.g. a
  // stale cached session from before this feature existed), block it here too.
  // The normal path never reaches this case, since Signup/Login both refuse
  // to leave an unverified session active.
  if (!isEmailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  return children;
}
