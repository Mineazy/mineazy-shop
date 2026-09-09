// src/utils/cartHelpers.js - Helper functions for cart management
export const formatPrice = (price, currency = 'USD') => {
  if (!price && price !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

export const calculateCartTotal = (items) => {
  if (!items || items.length === 0) return { subtotal: 0, tax: 0, total: 0 };
  
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.totalPrice?.USD || (item.quantity * (item.unitPrice?.USD || 0));
    return sum + itemPrice;
  }, 0);
  
  const tax = subtotal * 0.155; // 15.5% tax rate
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
};

export const validateCartItem = (item) => {
  if (!item.productId || !item.productId._id) {
    return { isValid: false, error: 'Invalid product' };
  }
  
  if (!item.quantity || item.quantity < 1) {
    return { isValid: false, error: 'Invalid quantity' };
  }
  
  if (item.productId.stock <= 0) {
    return { isValid: false, error: 'Product out of stock' };
  }
  
  if (item.quantity > item.productId.stock) {
    return { isValid: false, error: 'Insufficient stock' };
  }
  
  return { isValid: true };
};
