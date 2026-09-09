// src/components/Header/CartIcon.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartIcon = () => {
  const { getItemCount, summary } = useCart();
  const { isAuthenticated } = useAuth();
  
  const itemCount = getItemCount();
  
  return (
    <Link
      to="/cart"
      className="relative p-2 text-gray-600 hover:text-secondary transition-colors"
      aria-label={`Cart ${itemCount > 0 ? `with ${itemCount} items` : 'is empty'}`}
    >
      <ShoppingCart className="w-6 h-6" />
      
      {/* Cart Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-secondary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      
      {/* Tooltip for desktop */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
        {itemCount > 0 ? (
          <>
            {itemCount} item{itemCount > 1 ? 's' : ''} - ${summary?.total?.USD?.toLocaleString() || '0'}
          </>
        ) : (
          'Cart is empty'
        )}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </Link>
  );
};

export default CartIcon;