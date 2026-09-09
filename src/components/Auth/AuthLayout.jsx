import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/mineazy-logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/90 to-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img
              src={logo}
              alt="Mineazy Mining Solutions"
              className="h-16 w-auto transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <h2 className="text-3xl font-display font-bold text-white animate-fade-in">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-elegant-lg p-8 animate-slide-up">
          {children}
        </div>
      </div>

      {/* Footer Notice */}
      <div className="text-center mt-8 max-w-md w-full">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-primary/80 hover:text-primary underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary/80 hover:text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
