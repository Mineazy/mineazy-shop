// src/components/Auth/AuthGuard.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';

const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  authenticatedRedirect = '/',
  loadingText = 'Checking authentication...',
  requireEmailVerified = false,
  allowedRoles = [],
  fallbackComponent = null
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Show loading while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text={loadingText} />
      </div>
    );
  }

  // Handle routes that require authentication
  if (requireAuth) {
    // User not authenticated - redirect to login
    if (!isAuthenticated) {
      return <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />;
    }
    
    // Check email verification requirement
    if (requireEmailVerified && user && !user.isEmailVerified) {
      return <Navigate 
        to="/verify-email" 
        state={{ from: location }} 
        replace 
      />;
    }
    
    // Check role-based access
    if (allowedRoles.length > 0 && user) {
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
      const hasRequiredRole = allowedRoles.some(role => 
        userRoles.includes(role)
      );
      
      if (!hasRequiredRole) {
        // User doesn't have required role
        if (fallbackComponent) {
          return fallbackComponent;
        }
        
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page. Required role: {allowedRoles.join(', ')}
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Go Back
                </button>
                <Navigate to={authenticatedRedirect} replace />
              </div>
            </div>
          </div>
        );
      }
    }
    
    // All authentication checks passed
    return children;
  }
  
  // Handle routes that should NOT be accessible when authenticated (login, register, etc.)
  if (!requireAuth && isAuthenticated) {
    // Get the return URL from location state or use default
    const from = location.state?.from?.pathname || authenticatedRedirect;
    return <Navigate to={from} replace />;
  }
  
  // User not authenticated and doesn't need to be - render children
  return children;
};

export default AuthGuard;