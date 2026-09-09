// src/context/CartContext.jsx - Updated for new backend API
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  summary: {
    totalItems: 0,
    totalQuantity: 0,
    subtotal: { USD: 0, ZWG: 0 },
    tax: { USD: 0, ZWG: 0 },
    shipping: { USD: 0, ZWG: 0 },
    total: { USD: 0, ZWG: 0 },
  },
  loading: false,
  error: null,
  sessionId: null, // For guest users
};

// Action types
const CART_ACTIONS = {
  LOAD_CART_START: 'LOAD_CART_START',
  LOAD_CART_SUCCESS: 'LOAD_CART_SUCCESS',
  LOAD_CART_FAILURE: 'LOAD_CART_FAILURE',
  ADD_ITEM_START: 'ADD_ITEM_START',
  ADD_ITEM_SUCCESS: 'ADD_ITEM_SUCCESS',
  ADD_ITEM_FAILURE: 'ADD_ITEM_FAILURE',
  UPDATE_ITEM_START: 'UPDATE_ITEM_START',
  UPDATE_ITEM_SUCCESS: 'UPDATE_ITEM_SUCCESS',
  UPDATE_ITEM_FAILURE: 'UPDATE_ITEM_FAILURE',
  REMOVE_ITEM_START: 'REMOVE_ITEM_START',
  REMOVE_ITEM_SUCCESS: 'REMOVE_ITEM_SUCCESS',
  REMOVE_ITEM_FAILURE: 'REMOVE_ITEM_FAILURE',
  CLEAR_CART_START: 'CLEAR_CART_START',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  CLEAR_CART_FAILURE: 'CLEAR_CART_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SESSION_ID: 'SET_SESSION_ID',
};

// Helper function to normalize cart response from API
const normalizeCartResponse = (response) => {
  
  let cartData = { items: [], summary: null, sessionId: null };
  
  if (response.data?.success) {
    // Response format: { success: true, cart: { items: [...] }, sessionId?: "..." }
    if (response.data.cart) {
      cartData.items = Array.isArray(response.data.cart.items) ? response.data.cart.items : [];
      cartData.summary = response.data.cart.summary || null;
    }
    cartData.sessionId = response.data.sessionId || null;
  } else if (response.data?.cart) {
    // Direct cart object
    cartData.items = Array.isArray(response.data.cart.items) ? response.data.cart.items : [];
    cartData.summary = response.data.cart.summary || null;
    cartData.sessionId = response.data.sessionId || null;
  }
  
  
  return cartData;
};

// Calculate cart summary from items
const calculateCartSummary = (items) => {
  
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      totalQuantity: 0,
      subtotal: { USD: 0, ZWG: 0 },
      tax: { USD: 0, ZWG: 0 },
      shipping: { USD: 0, ZWG: 0 },
      total: { USD: 0, ZWG: 0 },
    };
  }

  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  
  const subtotalUSD = items.reduce((sum, item) => {
    const quantity = parseInt(item.quantity) || 0;
    const unitPrice = item.price || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const taxRate = 0.155; // 15.5% tax
  const exchangeRate = 25; // 1 USD = 25 ZWG
  
  const taxUSD = subtotalUSD * taxRate;
  const totalUSD = subtotalUSD + taxUSD; // Free shipping

  const summary = {
    totalItems: items.length,
    totalQuantity,
    subtotal: { 
      USD: Math.round(subtotalUSD * 100) / 100, 
      ZWG: Math.round(subtotalUSD * exchangeRate * 100) / 100 
    },
    tax: { 
      USD: Math.round(taxUSD * 100) / 100, 
      ZWG: Math.round(taxUSD * exchangeRate * 100) / 100 
    },
    shipping: { USD: 0, ZWG: 0 }, // Free shipping
    total: { 
      USD: Math.round(totalUSD * 100) / 100, 
      ZWG: Math.round(totalUSD * exchangeRate * 100) / 100 
    },
  };
  
  return summary;
};

// Reducer
const cartReducer = (state, action) => {
  
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART_START:
    case CART_ACTIONS.ADD_ITEM_START:
    case CART_ACTIONS.UPDATE_ITEM_START:
    case CART_ACTIONS.REMOVE_ITEM_START:
    case CART_ACTIONS.CLEAR_CART_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CART_ACTIONS.LOAD_CART_SUCCESS:
    case CART_ACTIONS.ADD_ITEM_SUCCESS:
    case CART_ACTIONS.UPDATE_ITEM_SUCCESS:
    case CART_ACTIONS.REMOVE_ITEM_SUCCESS:
      const newItems = action.payload.items || [];
      const calculatedSummary = calculateCartSummary(newItems);
      
      return {
        ...state,
        items: newItems,
        summary: action.payload.summary || calculatedSummary,
        sessionId: action.payload.sessionId || state.sessionId,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return {
        ...state,
        items: [],
        summary: {
          totalItems: 0,
          totalQuantity: 0,
          subtotal: { USD: 0, ZWG: 0 },
          tax: { USD: 0, ZWG: 0 },
          shipping: { USD: 0, ZWG: 0 },
          total: { USD: 0, ZWG: 0 },
        },
        loading: false,
        error: null,
      };

    case CART_ACTIONS.LOAD_CART_FAILURE:
    case CART_ACTIONS.ADD_ITEM_FAILURE:
    case CART_ACTIONS.UPDATE_ITEM_FAILURE:
    case CART_ACTIONS.REMOVE_ITEM_FAILURE:
    case CART_ACTIONS.CLEAR_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || 'An error occurred',
      };

    case CART_ACTIONS.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload,
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      // For guest users, we might still want to load their cart if they have a session
      const guestSessionId = localStorage.getItem('sessionId');
      if (guestSessionId && !isAuthenticated) {
        loadCart();
      } else if (!guestSessionId && !isAuthenticated) {
        // Clear cart state for completely new guests
        dispatch({
          type: CART_ACTIONS.CLEAR_CART_SUCCESS,
          payload: {}
        });
      }
    }
  }, [isAuthenticated, user]);

  // Load cart function
  const loadCart = async () => {
    dispatch({ type: CART_ACTIONS.LOAD_CART_START });
    
    try {
      const response = await cartAPI.get();
      const normalizedData = normalizeCartResponse(response);
      
      // Store session ID for guest users
      if (normalizedData.sessionId && !isAuthenticated) {
        localStorage.setItem('sessionId', normalizedData.sessionId);
        dispatch({ type: CART_ACTIONS.SET_SESSION_ID, payload: normalizedData.sessionId });
      }
      
      dispatch({
        type: CART_ACTIONS.LOAD_CART_SUCCESS,
        payload: normalizedData,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Load cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load cart';
      
      dispatch({
        type: CART_ACTIONS.LOAD_CART_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Add item to cart
  const addItem = async (productId, quantity = 1, branchId = null) => {
    
    if (!productId) {
      const error = 'Product ID is required';
      console.error('❌', error);
      return { success: false, error };
    }

    if (quantity < 1) {
      const error = 'Quantity must be at least 1';
      console.error('❌', error);
      return { success: false, error };
    }

    dispatch({ type: CART_ACTIONS.ADD_ITEM_START });
    
    try {
      const response = await cartAPI.add(productId, quantity, branchId);
      const normalizedData = normalizeCartResponse(response);
      
      // Store session ID for guest users
      if (normalizedData.sessionId && !isAuthenticated) {
        localStorage.setItem('sessionId', normalizedData.sessionId);
        dispatch({ type: CART_ACTIONS.SET_SESSION_ID, payload: normalizedData.sessionId });
      }
      
      dispatch({
        type: CART_ACTIONS.ADD_ITEM_SUCCESS,
        payload: normalizedData,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      
      dispatch({
        type: CART_ACTIONS.ADD_ITEM_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Update item quantity
  const updateItem = async (itemId, quantity) => {
    
    if (!itemId) {
      const error = 'Item ID is required';
      console.error('❌', error);
      return { success: false, error };
    }
    
    if (quantity < 0) {
      const error = 'Quantity cannot be negative';
      console.error('❌', error);
      return { success: false, error };
    }
    
    dispatch({ type: CART_ACTIONS.UPDATE_ITEM_START });
    
    try {
      const response = await cartAPI.update(itemId, quantity);
      const normalizedData = normalizeCartResponse(response);
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_SUCCESS,
        payload: normalizedData,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Update cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update item';
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    
    if (!itemId) {
      const error = 'Item ID is required';
      console.error('❌', error);
      return { success: false, error };
    }
    
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM_START });
    
    try {
      const response = await cartAPI.remove(itemId);
      const normalizedData = normalizeCartResponse(response);
      
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM_SUCCESS,
        payload: normalizedData,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Remove cart item error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item';
      
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART_START });
    
    try {
      await cartAPI.clear();
      
      // Clear session ID as well
      localStorage.removeItem('sessionId');
      
      dispatch({ 
        type: CART_ACTIONS.CLEAR_CART_SUCCESS,
        payload: {}
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
      
      dispatch({
        type: CART_ACTIONS.CLEAR_CART_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Increment item quantity
  const incrementItem = async (itemId) => {
    dispatch({ type: CART_ACTIONS.UPDATE_ITEM_START });
    
    try {
      const response = await cartAPI.incrementItem(itemId);
      const normalizedData = normalizeCartResponse(response);
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_SUCCESS,
        payload: normalizedData,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Increment item error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to increment item';
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Decrement item quantity
  const decrementItem = async (itemId) => {
    dispatch({ type: CART_ACTIONS.UPDATE_ITEM_START });
    
    try {
      const response = await cartAPI.decrementItem(itemId);
      const normalizedData = normalizeCartResponse(response);
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_SUCCESS,
        payload: normalizedData,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Decrement item error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to decrement item';
      
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Merge guest cart after login
  const mergeGuestCart = async (guestSessionId) => {
    
    try {
      await cartAPI.mergeGuestCart(guestSessionId);
      // Reload cart after merge
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('❌ Merge guest cart error:', error);
      return { success: false, error: error.message };
    }
  };

  // Validate cart
  const validateCart = async () => {
    try {
      const response = await cartAPI.validate();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Cart validation error:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper functions
  const getItemCount = () => {
    return Array.isArray(state.items) 
      ? state.items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0)
      : 0;
  };

  const isInCart = (productId) => {
    if (!productId || !Array.isArray(state.items)) return false;
    
    return state.items.some(item => {
      const itemProductId = item.productId?._id || item.productId || item.product?._id || item.product;
      return itemProductId === productId;
    });
  };

  const getItemQuantity = (productId) => {
    if (!productId || !Array.isArray(state.items)) return 0;
    
    const item = state.items.find(item => {
      const itemProductId = item.productId?._id || item.productId || item.product?._id || item.product;
      return itemProductId === productId;
    });
    
    return item ? parseInt(item.quantity) || 0 : 0;
  };

  const getCartItem = (productId) => {
    if (!productId || !Array.isArray(state.items)) return null;
    
    return state.items.find(item => {
      const itemProductId = item.productId?._id || item.productId || item.product?._id || item.product;
      return itemProductId === productId;
    });
  };

  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    incrementItem,
    decrementItem,
    mergeGuestCart,
    validateCart,
    getItemCount,
    isInCart,
    getItemQuantity,
    getCartItem,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
