import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingCart, Heart, Package, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useClickOutside } from '../../hooks';

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useClickOutside(() => setIsOpen(false));
  const cartItemCount = getItemCount();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Cart Icon */}
      <Link
        to="/cart"
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label={`Shopping cart with ${cartItemCount} items`}
      >
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary text-xs font-bold rounded-full flex items-center justify-center">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="User menu"
        >
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user.name?.split(' ')[0] || 'User'}
              </span>
            </div>
          ) : (
            <User className="w-6 h-6 text-gray-700" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-elegant border border-gray-200 z-50 overflow-hidden">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-secondary font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">My Account</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">My Orders</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    <Heart className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Wishlist</span>
                  </Link>

                  <Link
                    to="/account?tab=security"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Settings</span>
                  </Link>

                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-sm text-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Guest User */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Welcome!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to access your account and orders.
                  </p>

                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center space-x-2 btn-primary"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center space-x-2 btn-outline"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </Link>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Guest Menu Items */}
                <div className="p-2">
                  <Link
                    to="/help"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Help & Support</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
