// src/hooks/useCartSync.js - ENHANCED VERSION
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const useCartSync = () => {
  const { isAuthenticated, user } = useAuth();
  const { loadCart, mergeGuestCart } = useCart();
  const hasInitialized = useRef(false);
  const previousAuthState = useRef(isAuthenticated);
  
  useEffect(() => {
    // Only run when auth state changes
    if (previousAuthState.current === isAuthenticated) {
      return;
    }
    
    previousAuthState.current = isAuthenticated;
    
    const syncCart = async () => {
      if (isAuthenticated && user) {
        
        // Check if there's a guest session to merge
        const guestSessionId = localStorage.getItem('sessionId');
        
        if (guestSessionId && !hasInitialized.current) {
          try {
            await mergeGuestCart(guestSessionId);
            localStorage.removeItem('sessionId');
          } catch (error) {
            console.error('❌ Cart merge failed:', error);
          }
        }
        
        // Load user's cart
        await loadCart();
        hasInitialized.current = true;
      } else if (!isAuthenticated) {
        // User logged out, reset initialization
        hasInitialized.current = false;
      }
    };
    
    syncCart();
  }, [isAuthenticated, user, loadCart, mergeGuestCart]);
};