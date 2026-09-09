// src/pages/EmailVerification.jsx - Fixed to prevent infinite renders
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, isAuthenticated } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const verificationAttemptedRef = useRef(false);

  const verificationToken = useMemo(() => {
    const tokenFromParams = params.token || params['*']; // Handle /verify-email/TOKEN
    const tokenFromQuery = searchParams.get('token'); // Handle ?token=TOKEN
    return tokenFromParams || tokenFromQuery || '';
  }, [params, searchParams]);

  // Memoized verification function
  const performVerification = useCallback(async (token) => {
    if (verificationAttemptedRef.current) {
      return;
    }

    verificationAttemptedRef.current = true;
    setStatus('verifying');
    setMessage('Verifying your email...');
    
    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting...');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          if (result.loggedIn || isAuthenticated) {
            navigate('/', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }, 2000);
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      
      // Provide helpful error messages
      let errorMessage = 'Email verification failed. ';
      
      if (error.message.includes('429') || error.message.toLowerCase().includes('too many')) {
        errorMessage += 'Too many attempts were made. Please wait a few minutes, then request a fresh verification email.';
      } else if (error.message.includes('expired')) {
        errorMessage += 'Your verification link has expired. Please request a new one.';
      } else if (error.message.includes('invalid')) {
        errorMessage += 'The verification link is invalid. Please check your email.';
      } else if (error.message.includes('already verified')) {
        errorMessage += 'Your email is already verified. You can log in now.';
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        errorMessage += error.message || 'Please try again or request a new verification link.';
      }
      
      setMessage(errorMessage);
    }
  }, [verifyEmail, navigate, isAuthenticated]);

  useEffect(() => {
    if (!verificationToken) {
      console.error('No verification token found');
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    performVerification(verificationToken);
  }, [verificationToken, performVerification]);

  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      const result = await resendVerification();
      
      if (result.success) {
        setMessage('Verification email sent! Please check your inbox.');
        setTimeout(() => {
          setMessage('If you did not receive the email, please check your spam folder or try again.');
        }, 5000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      setMessage('Failed to resend verification email. ' + (error.message || 'Please try again later.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          {/* Message */}
          <p className={`text-center mb-6 ${
            status === 'success' ? 'text-green-700' : 
            status === 'error' ? 'text-red-700' : 
            'text-gray-600'
          }`}>
            {message}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={() => navigate(isAuthenticated ? '/' : '/login')}
                className="w-full flex items-center justify-center space-x-2 bg-[#0000fe] text-white py-3 px-4 rounded-lg hover:bg-[#1f2a6b] transition-colors font-medium"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {status === 'error' && (
              <>
                {isAuthenticated ? (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full flex items-center justify-center space-x-2 bg-[#0000fe] text-white py-3 px-4 rounded-lg hover:bg-[#1f2a6b] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-[#0000fe] text-white py-3 px-4 rounded-lg hover:bg-[#1f2a6b] transition-colors font-medium"
                    >
                      Go to Login
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="w-full border-2 border-[#0000fe] text-[#0000fe] py-3 px-4 rounded-lg hover:bg-[#0000fe] hover:text-white transition-colors font-medium"
                    >
                      Create New Account
                    </button>
                  </div>
                )}
              </>
            )}

            {status === 'verifying' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help?{' '}
              <a href="/contact" className="text-[#0000fe] hover:underline font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
