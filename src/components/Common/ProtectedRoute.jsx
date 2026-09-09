// src/components/Common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ 
  children, 
  fallback = '/login', 
  loadingText = 'Checking authentication...',
  requireEmailVerified = false 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text={loadingText} />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate 
      to={fallback} 
      state={{ from: location }} 
      replace 
    />;
  }
  
  // Check email verification if required
  if (requireEmailVerified && user && !user.isEmailVerified) {
    return <Navigate 
      to="/verify-email" 
      state={{ from: location }} 
      replace 
    />;
  }
  
  // Render protected content
  return children;
};

export default ProtectedRoute;