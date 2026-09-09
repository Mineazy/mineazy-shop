import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = ({ token }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(null);

  const resetToken = token || params.token || searchParams.get('token');

  useEffect(() => {
    // Validate token on component mount
    if (!resetToken) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [resetToken]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authAPI.resetPassword({
        token: resetToken,
        password: formData.password
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Invalid or missing token
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <a href="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-secondary font-bold text-lg">MMS</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">MINEAZY</h1>
                <p className="text-xs text-gray-600 -mt-1">MINING SOLUTIONS</p>
              </div>
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Reset Link
            </h2>
            
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-4">
              <a
                href="/forgot-password"
                className="w-full btn-primary text-center"
              >
                Request New Link
              </a>
              
              <a
                href="/login"
                className="w-full text-primary hover:text-primary/80 font-medium"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <a href="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-secondary font-bold text-lg">MMS</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">MINEAZY</h1>
                <p className="text-xs text-gray-600 -mt-1">MINING SOLUTIONS</p>
              </div>
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successful
            </h2>
            
            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            <a
              href="/login"
              className="w-full btn-primary text-center"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-secondary font-bold text-lg">MMS</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">MINEAZY</h1>
              <p className="text-xs text-gray-600 -mt-1">MINING SOLUTIONS</p>
            </div>
          </a>
          
          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a strong password for your account
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className={`flex items-center space-x-2 ${
                  formData.password.length >= 8 ? 'text-green-600' : ''
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    formData.password.length >= 8 ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <span>At least 8 characters long</span>
                </li>
                <li className={`flex items-center space-x-2 ${
                  /(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    /(?=.*[a-z])/.test(formData.password) ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <span>Contains lowercase letters</span>
                </li>
                <li className={`flex items-center space-x-2 ${
                  /(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    /(?=.*[A-Z])/.test(formData.password) ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <span>Contains uppercase letters</span>
                </li>
                <li className={`flex items-center space-x-2 ${
                  /(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    /(?=.*\d)/.test(formData.password) ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <span>Contains at least one number</span>
                </li>
                <li className={`flex items-center space-x-2 ${
                  formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : ''
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    formData.password === formData.confirmPassword && formData.confirmPassword ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a href="/contact" className="text-primary hover:text-primary/80">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
