// src/components/Cart/AddToCartButton.jsx - Updated for new backend API
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, AlertCircle, Plus, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';

const AddToCartButton = ({ 
  product, 
  quantity = 1, 
  className = '', 
  size = 'medium',
  variant = 'primary',
  onSuccess,
  onError,
  requireAuth = false // Whether authentication is required to add to cart
}) => {
  const { addItem, isInCart, getItemQuantity, loading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { selectedBranch } = useBranch();
  
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const productId = product?._id;
  const inCart = productId ? isInCart(productId) : false;
  const cartQuantity = productId ? getItemQuantity(productId) : 0;
  const isOutOfStock = (product?.stockQuantity || product?.stock || 0) <= 0;
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-secondary hover:bg-secondary/90 text-white',
    outline: 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };

  // Clear success state after some time
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error state after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddToCart = async () => {
    
    // Check authentication if required
    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }
    
    if (!productId) {
      setError('Product information is missing');
      onError?.(new Error('Product information is missing'));
      return;
    }
    
    if (isOutOfStock) {
      setError('This product is currently out of stock');
      onError?.(new Error('Product out of stock'));
      return;
    }

    // Validate quantity
    const requestQuantity = parseInt(quantity);
    if (requestQuantity < 1) {
      setError('Invalid quantity');
      onError?.(new Error('Invalid quantity'));
      return;
    }

    // Check stock availability
    const availableStock = product?.stockQuantity || product?.stock || 0;
    if (requestQuantity > availableStock) {
      setError(`Only ${availableStock} items available`);
      onError?.(new Error('Insufficient stock'));
      return;
    }
    
    setIsAdding(true);
    setError(null);
    
    try {
      
      // For new backend API, we always call addItem with the new quantity to add
      // The backend will handle whether to create new item or update existing quantity
      const result = await addItem(productId, requestQuantity, selectedBranch?._id);
      
      if (result.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      
      let errorMessage = error.message || 'Failed to add item to cart';
      
      // Handle specific error types based on new backend
      if (errorMessage.includes('log in') || errorMessage.includes('authentication')) {
        if (!requireAuth) {
          // If auth is not required but server says it is, redirect to login
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
      } else if (errorMessage.includes('stock') || errorMessage.includes('available')) {
        // Stock-related errors
        errorMessage = 'Insufficient stock available';
      } else if (errorMessage.includes('invalid') || errorMessage.includes('validation')) {
        // Validation errors
        errorMessage = 'Invalid product or quantity';
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        // Network errors
        errorMessage = 'Connection error. Please try again.';
      }
      
      setError(errorMessage);
      onError?.(error);
    } finally {
      setIsAdding(false);
    }
  };

  // Show login prompt if auth required but user not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <button
        onClick={handleAddToCart}
        className={`${sizeClasses[size]} ${variantClasses.outline} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2 ${className}`}
      >
        <User className="w-5 h-5" />
        <span>Sign In to Add</span>
      </button>
    );
  }

  // Show success state
  if (success) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} ${variantClasses.success} rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center space-x-2 disabled:cursor-not-allowed ${className}`}
      >
        <Check className="w-5 h-5" />
        <span>Added to Cart!</span>
      </button>
    );
  }

  // Show error state
  if (error) {
    return (
      <button
        onClick={handleAddToCart}
        className={`${sizeClasses[size]} bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center space-x-2 ${className}`}
        title={error}
      >
        <AlertCircle className="w-5 h-5" />
        <span>Retry</span>
      </button>
    );
  }
  
  // If item is in cart, show "Add More" button
  if (inCart && cartQuantity > 0) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleAddToCart}
          disabled={isAdding || loading || isOutOfStock}
          className={`${sizeClasses[size]} ${variantClasses.primary} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2 ${className}`}
        >
          {isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Add More</span>
            </>
          )}
        </button>
        
        <div className="flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
          <ShoppingCart className="w-4 h-4" />
          <span>In Cart: {cartQuantity}</span>
        </div>
      </div>
    );
  }
  
  // Default "Add to Cart" button
  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || loading || isOutOfStock}
      className={`${sizeClasses[size]} ${
        isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : variantClasses[variant]
      } rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2 ${className}`}
    >
      {isAdding ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Adding...</span>
        </>
      ) : isOutOfStock ? (
        <>
          <AlertCircle className="w-5 h-5" />
          <span>Out of Stock</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
          {quantity > 1 && <span>({quantity})</span>}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;