// src/services/api.js - Updated for new backend API
import axios from 'axios';

// Base URL for the API - Updated to match your backend
const BASE_URL = 'https://mineazy.co.zw/api';
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
};

const deepNormalizeImages = (value) => {
  if (Array.isArray(value)) {
    return value.map(deepNormalizeImages);
  }

  if (value && typeof value === 'object') {
    const normalized = {};
    Object.keys(value).forEach((key) => {
      const field = value[key];

      if (key === 'images' && Array.isArray(field)) {
        normalized[key] = field.map(normalizeImageUrl);
      } else if ((key === 'image' || key === 'featuredImage' || key === 'thumbnail') && typeof field === 'string') {
        normalized[key] = normalizeImageUrl(field);
      } else {
        normalized[key] = deepNormalizeImages(field);
      }
    });
    return normalized;
  }

  return value;
};

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add guest session ID for cart operations if no token
    const sessionId = localStorage.getItem('sessionId');
    if (!token && sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
    
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    if (response?.data && typeof response.data === 'object' && response.config?.responseType !== 'blob') {
      response.data = deepNormalizeImages(response.data);
    }

    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't redirect if already on login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        const protectedPaths = ['/account', '/orders', '/checkout', '/settings'];
        if (protectedPaths.some(path => currentPath.startsWith(path))) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced Authentication API
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Store auth data if provided
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store auth data
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('❌ Logout API failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('❌ Get profile failed:', error);
      throw error;
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      // Update stored user data
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Update profile failed:', error);
      throw error;
    }
  },
  
  verifyEmail: async (data) => {
    try {
      const response = await api.post('/auth/verify-email', data);
      return response;
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      throw error;
    }
  },
  
  resendVerification: async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response;
    } catch (error) {
      console.error('❌ Resend verification failed:', error);
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      throw error;
    }
  },
  
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response;
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      throw error;
    }
  },
  
  changePassword: async (passwords) => {
    try {
      const response = await api.post('/auth/change-password', passwords);
      return response;
    } catch (error) {
      console.error('❌ Change password failed:', error);
      throw error;
    }
  }
};

// Enhanced Cart API matching your backend endpoints
export const cartAPI = {
  get: async () => {
    try {
      const response = await api.get('/cart');
      
      // Store sessionId if provided (for guest users)
      if (response.data?.sessionId && !localStorage.getItem('authToken')) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Cart GET failed:', error);
      
      // Return empty cart structure for 404s
      if (error.response?.status === 404) {
        return {
          data: {
            success: true,
            cart: { items: [], totalItems: 0, subtotal: 0, total: 0 },
            sessionId: localStorage.getItem('sessionId') || `guest-${Date.now()}`
          }
        };
      }
      
      throw error;
    }
  },

  add: async (productId, quantity = 1, branchId = null) => {
    try {
      const requestBody = { productId, quantity };
      if (branchId) requestBody.branchId = branchId;
      
      const response = await api.post('/cart/items', requestBody);
      
      // Store sessionId if provided
      if (response.data?.sessionId && !localStorage.getItem('authToken')) {
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Cart ADD failed:', error);
      throw error;
    }
  },

  update: async (itemId, quantity) => {
    try {
      
      if (quantity === 0) {
        // Remove item if quantity is 0
        return await cartAPI.remove(itemId);
      }
      
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response;
    } catch (error) {
      console.error('❌ Cart UPDATE failed:', error);
      throw error;
    }
  },

  incrementItem: async (itemId) => {
    try {
      const response = await api.put(`/cart/items/${itemId}/increment`);
      return response;
    } catch (error) {
      console.error('❌ Cart INCREMENT failed:', error);
      throw error;
    }
  },

  decrementItem: async (itemId) => {
    try {
      const response = await api.put(`/cart/items/${itemId}/decrement`);
      return response;
    } catch (error) {
      console.error('❌ Cart DECREMENT failed:', error);
      throw error;
    }
  },

  remove: async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response;
    } catch (error) {
      console.error('❌ Cart REMOVE failed:', error);
      throw error;
    }
  },

  clear: async () => {
    try {
      const response = await api.delete('/cart');
      return response;
    } catch (error) {
      console.error('❌ Cart CLEAR failed:', error);
      throw error;
    }
  },

  getCount: async () => {
    try {
      const response = await api.get('/cart/count');
      return response;
    } catch (error) {
      console.error('❌ Cart COUNT failed:', error);
      throw error;
    }
  },

  mergeGuestCart: async (guestSessionId) => {
    try {
      const response = await api.post('/cart/merge', { guestSessionId });
      return response;
    } catch (error) {
      console.error('❌ Cart MERGE failed:', error);
      throw error;
    }
  },

  validate: async () => {
    try {
      const response = await api.post('/cart/validate');
      return response;
    } catch (error) {
      console.error('❌ Cart VALIDATE failed:', error);
      throw error;
    }
  },

  getSummary: async () => {
    try {
      const response = await api.get('/cart/summary');
      return response;
    } catch (error) {
      console.error('❌ Cart SUMMARY failed:', error);
      throw error;
    }
  }
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    try {
      const cleanParams = {};
      
      if (params.page && params.page > 0) cleanParams.page = params.page;
      if (params.limit && params.limit > 0) cleanParams.limit = Math.min(params.limit, 100);
      if (params.category) cleanParams.category = params.category;
      if (params.search) cleanParams.search = params.search.trim();
      if (params.minPrice !== undefined) cleanParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) cleanParams.maxPrice = params.maxPrice;
      if (params.inStock !== undefined) cleanParams.inStock = params.inStock;
      if (params.featured !== undefined) cleanParams.featured = params.featured;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;
      
      const response = await api.get('/products', { params: cleanParams });
      return response;
    } catch (error) {
      console.error('❌ Products fetch failed:', error);
      throw error;
    }
  },

  getFeatured: async (limit = 8) => {
    try {
      const response = await api.get('/products', { 
        params: { featured: true, limit, page: 1 } 
      });
      return response;
    } catch (error) {
      console.error('❌ Featured products fetch failed:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Product fetch failed:', error);
      throw error;
    }
  },

  getRelated: async (id) => {
    try {
      const response = await api.get(`/products/${id}/related`);
      return response;
    } catch (error) {
      console.error('❌ Related products fetch failed:', error);
      throw error;
    }
  },

  search: async (query, params = {}) => {
    try {
      const response = await api.get('/products/search', {
        params: { q: query, ...params }
      });
      return response;
    } catch (error) {
      console.error('❌ Product search failed:', error);
      throw error;
    }
  },

  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query }
      });
      return response;
    } catch (error) {
      console.error('❌ Search suggestions failed:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response;
    } catch (error) {
      console.error('❌ Categories fetch failed:', error);
      throw error;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Category fetch failed:', error);
      throw error;
    }
  },

  getCategoryBySlug: async (slug, params = {}) => {
    try {
      const response = await api.get(`/categories/slug/${slug}`, { params });
      return response;
    } catch (error) {
      console.error('❌ Category by slug fetch failed:', error);
      throw error;
    }
  },

  getCategoryTree: async () => {
    try {
      const response = await api.get('/categories/tree');
      return response;
    } catch (error) {
      console.error('❌ Category tree fetch failed:', error);
      throw error;
    }
  }
};

// Orders API
export const ordersAPI = {
  /**
   * Get all orders for the authenticated user
   * @param {Object} params - Query parameters (page, limit, status, search)
   * @returns {Promise} Response with orders array and pagination
   */
  getAll: async (params = {}) => {
    try {
      
      const cleanParams = {};
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
      if (params.status) cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
      
      const response = await api.get('/orders', { params: cleanParams });
      return response;
    } catch (error) {
      console.error('❌ Orders fetch failed:', error);
      throw error;
    }
  },
  
  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise} Response with order details
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Order fetch failed:', error);
      throw error;
    }
  },
  
  /**
   * Create new order
   * ⚠️ IMPORTANT: Backend requires items array to be sent
   * 
   * @param {Object} orderData - Order data
   * @param {string} orderData.paymentMethod - Payment method (required)
   *                                            Options: 'paynow', 'cash_on_delivery', 'collection'
   * @param {Array} orderData.items - Order items array (required)
   * @param {string} orderData.items[].productId - Product ID (required)
   * @param {number} orderData.items[].quantity - Quantity (required, must be > 0)
   * @param {number} orderData.items[].price - Unit price (required, must be >= 0)
   * @param {string} orderData.notes - Special delivery instructions (optional)
   * @param {Object} orderData.customerInfo - Customer information (REQUIRED for guest users only)
   * @param {string} orderData.customerInfo.firstName - First name (required for guests)
   * @param {string} orderData.customerInfo.lastName - Last name (required for guests)
   * @param {string} orderData.customerInfo.email - Email address (required for guests)
   * @param {string} orderData.customerInfo.phone - Phone number (required for guests)
   * @param {Object} orderData.customerInfo.address - Shipping address (required for guests)
   * @param {string} orderData.customerInfo.address.street - Street address
   * @param {string} orderData.customerInfo.address.city - City
   * @param {string} orderData.customerInfo.address.state - State/Province
   * @param {string} orderData.customerInfo.address.zipCode - Postal/ZIP code
   * @param {string} orderData.customerInfo.address.country - Country (default: 'Zimbabwe')
   * @param {string} orderData.sessionId - Guest session ID (optional, for guest users)
   * 
   * @returns {Promise} Response with created order including:
   *                    - order._id
   *                    - order.orderNumber (format: ORD-YYYYMMDD-XXXXXX)
   *                    - order.status
   *                    - order.paymentStatus
   *                    - order.total, subtotal, tax, shipping
   * 
   * Backend automatically:
   * - Validates stock availability for all items
   * - Generates unique order number (ORD-YYYYMMDD-XXXXXX)
   * - Calculates totals (subtotal, tax 15.5%, shipping, total)
   * - Sends confirmation email to customer
   * - Reduces stock quantities
   * - Clears cart (for authenticated users)
   * 
   * @example
   * // For authenticated users:
   * const order = await ordersAPI.create({
   *   paymentMethod: 'cash_on_delivery',
   *   items: [
   *     { 
   *       productId: '507f1f77bcf86cd799439011', 
   *       quantity: 2, 
   *       price: 150.00 
   *     },
   *     { 
   *       productId: '507f1f77bcf86cd799439012', 
   *       quantity: 1, 
   *       price: 500.00 
   *     }
   *   ],
   *   notes: 'Please call before delivery'
   * });
   * 
   * @example
   * // For guest users:
   * const order = await ordersAPI.create({
   *   paymentMethod: 'paynow',
   *   items: [
   *     { 
   *       productId: '507f1f77bcf86cd799439013', 
   *       quantity: 1, 
   *       price: 500.00 
   *     }
   *   ],
   *   notes: 'Leave at front door',
   *   customerInfo: {
   *     firstName: 'John',
   *     lastName: 'Doe',
   *     email: 'john@example.com',
   *     phone: '+263771234567',
   *     address: {
   *       street: '123 Main St',
   *       city: 'Harare',
   *       state: 'Harare',
   *       zipCode: '00263',
   *       country: 'Zimbabwe'
   *     }
   *   },
   *   sessionId: 'guest-1234567890'
   * });
   */
  create: async (orderData) => {
    try {
      
      // ✅ Validate required fields
      if (!orderData.paymentMethod) {
        throw new Error('Payment method is required');
      }
      
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }
      
      // ✅ Validate each item in the order
      orderData.items.forEach((item, index) => {
        if (!item.productId) {
          throw new Error(`Item ${index + 1}: Product ID is required`);
        }
        if (!item.quantity || item.quantity < 1) {
          throw new Error(`Item ${index + 1}: Valid quantity is required (must be at least 1)`);
        }
        if (item.price === undefined || item.price === null || item.price < 0) {
          throw new Error(`Item ${index + 1}: Valid price is required (must be 0 or greater)`);
        }
      });
      
      // For debugging: Log request type
      const isGuest = !localStorage.getItem('authToken') && !localStorage.getItem('token');
      
      if (isGuest && !orderData.customerInfo) {
        console.warn('⚠️ Guest checkout but no customerInfo provided - order may fail');
      }
      
      if (isGuest && !orderData.sessionId) {
        console.warn('⚠️ Guest checkout but no sessionId provided');
      }
      
      // ✅ Make API request
      // Backend expects this exact structure:
      // {
      //   paymentMethod: string (required)
      //   items: array (required) - [{ productId, quantity, price }]
      //   notes: string (optional)
      //   customerInfo: object (required for guests)
      //   sessionId: string (optional for guests)
      // }
      // Backend will automatically:
      // - Validate stock availability
      // - Generate orderNumber
      // - Calculate totals
      // - Send confirmation email
      // - Reduce stock
      // - Clear cart
      
      const response = await api.post('/orders', orderData);
      
      
      // ✅ Extract order from response (handles different structures)
      let order = null;
      if (response.data?.success && response.data?.order) {
        order = response.data.order;
      } else if (response.data?.order) {
        order = response.data.order;
      } else if (response.data?.data?.order) {
        order = response.data.data.order;
      } else if (response.data?.data) {
        order = response.data.data;
      } else {
        order = response.data;
      }
      
      // ✅ Validate order response
      if (!order || !order._id) {
        console.error('❌ Invalid order response structure:', response.data);
        throw new Error('Invalid order response from server');
      }
      
      
      return response;
      
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      
      // ✅ Enhanced error logging
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        
        // Log validation errors specifically
        if (error.response.data?.errors) {
          console.error('❌ Validation errors:', error.response.data.errors);
        }
      } else if (error.request) {
        console.error('❌ No response received from server');
        console.error('❌ Request:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      // ✅ Re-throw with better error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          const errorMessages = errors.map(err => {
            const field = err.path || err.param || 'field';
            const message = err.msg || err.message || 'Invalid value';
            return `${field}: ${message}`;
          }).join(', ');
          throw new Error(errorMessages);
        } else if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(String(errors));
        }
      }
      
      throw error;
    }
  },
  
  /**
   * Cancel an order
   * @param {string} id - Order ID
   * @param {string} reason - Cancellation reason (optional)
   * @returns {Promise} Response confirming cancellation
   */
  cancel: async (id, reason = 'Customer requested cancellation') => {
    try {
      const response = await api.put(`/orders/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('❌ Order cancellation failed:', error);
      throw error;
    }
  },
  
  /**
   * Track order by order number and email (for guests)
   * @param {string} orderNumber - Order number (ORD-YYYYMMDD-XXXXXX)
   * @param {string} email - Customer email
   * @returns {Promise} Response with order tracking info
   */
  track: async (orderNumber, email) => {
    try {
      const response = await api.get(`/orders/track/${orderNumber}/${email}`);
      return response;
    } catch (error) {
      console.error('❌ Order tracking failed:', error);
      throw error;
    }
  },
  
  /**
   * Update order status (admin only)
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @param {string} notes - Status update notes (optional)
   * @returns {Promise} Response with updated order
   */
  updateStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status, notes });
      return response;
    } catch (error) {
      console.error('❌ Order status update failed:', error);
      throw error;
    }
  },
  
  /**
   * Process payment for an order
   * @param {string} orderId - Order ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Response with payment result
   */
  processPayment: async (orderId, paymentData) => {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, paymentData);
      return response;
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      throw error;
    }
  }
};

// Checkout API
export const checkoutAPI = {
  validate: async () => {
    try {
      const response = await api.post('/checkout/validate');
      return response;
    } catch (error) {
      console.error('❌ Checkout validate failed:', error);
      throw error;
    }
  },

  calculate: async (data) => {
    try {
      const response = await api.post('/checkout/calculate', data);
      return response;
    } catch (error) {
      console.error('❌ Checkout calculate failed:', error);
      throw error;
    }
  },

  validateAddress: async (address) => {
    try {
      const response = await api.post('/checkout/validate-address', address);
      return response;
    } catch (error) {
      console.error('❌ Address validation failed:', error);
      throw error;
    }
  },

  validateCustomer: async (customerData) => {
    try {
      const response = await api.post('/checkout/validate-customer', customerData);
      return response;
    } catch (error) {
      console.error('❌ Customer validation failed:', error);
      throw error;
    }
  },

  guest: async () => {
    try {
      const response = await api.post('/checkout/guest');
      return response;
    } catch (error) {
      console.error('❌ Guest checkout validation failed:', error);
      throw error;
    }
  },

  getShippingMethods: async (params = {}) => {
    try {
      const response = await api.get('/checkout/shipping-methods', { params });
      return response;
    } catch (error) {
      console.error('❌ Shipping methods fetch failed:', error);
      throw error;
    }
  },

  applyCoupon: async (couponCode) => {
    try {
      const response = await api.post('/checkout/apply-coupon', { couponCode });
      return response;
    } catch (error) {
      console.error('❌ Apply coupon failed:', error);
      throw error;
    }
  }
};

// Payments API
export const paymentsAPI = {
  /**
   * Get available payment methods
   * @returns {Promise} Available payment methods
   */
  getMethods: async () => {
    try {
      const response = await api.get('/payments/methods');
      return response;
    } catch (error) {
      console.error('❌ Payment methods fetch failed:', error);
      throw error;
    }
  },

  /**
   * Initiate Paynow payment
   * @param {string} orderId - Order ID
   * @returns {Promise} Payment initiation response with redirectUrl
   */
  initiatePaynow: async (orderId) => {
    try {
      
      const response = await api.post('/payments/paynow/initiate', { orderId });
      
      
      return response;
    } catch (error) {
      console.error('❌ Paynow initiate failed:', error);
      
      // Enhanced error messaging
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid order or payment already processed');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found');
      }
      
      throw error;
    }
  },

  /**
   * Check Paynow payment status
   * @param {string} orderId - Order ID
   * @returns {Promise} Payment status
   */
  checkPaynowStatus: async (orderId) => {
    try {
      
      const response = await api.get(`/orders/${orderId}`);
      
      const order = response.data?.success ? response.data.data : response.data;
      
      
      return {
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        order: order
      };
    } catch (error) {
      console.error('❌ Payment status check failed:', error);
      throw error;
    }
  },

  /**
   * Process Cash on Delivery
   * @param {string} orderId - Order ID
   * @returns {Promise} COD confirmation
   */
  processCOD: async (orderId) => {
    try {
      const response = await api.post('/payments/cash-on-delivery', { orderId });
      return response;
    } catch (error) {
      console.error('❌ COD process failed:', error);
      throw error;
    }
  },

  /**
   * Process Collection payment
   * @param {string} orderId - Order ID
   * @returns {Promise} Collection confirmation
   */
  processCollection: async (orderId) => {
    try {
      const response = await api.post('/payments/collection', { orderId });
      return response;
    } catch (error) {
      console.error('❌ Collection process failed:', error);
      throw error;
    }
  },
  /**
   * Find order by Paynow reference
   * @param {string} reference - Paynow reference number
   * @returns {Promise} Order details
   */
  getOrderByReference: async (reference) => {
    try {
      
      const response = await api.get('/payments/paynow/order-by-reference', {
        params: { reference }
      });
      
      return response;
    } catch (error) {
      console.error('❌ Order by reference fetch failed:', error);
      throw error;
    }
  },

  /**
   * Verify payment webhook (for backend callback)
   * @param {Object} webhookData - Webhook payload from Paynow
   * @returns {Promise} Verification response
   */
  verifyWebhook: async (webhookData) => {
    try {
      const response = await api.post('/payments/paynow/webhook', webhookData);
      return response;
    } catch (error) {
      console.error('❌ Webhook verification failed:', error);
      throw error;
    }
  }
};
// Invoice API
export const invoiceAPI = {
  getByOrderId: async (orderId, format = 'json') => {
    try {
      const response = await api.get(`/invoices/${orderId}`, {
        params: { format },
        responseType: format === 'pdf' ? 'blob' : 'json'
      });
      return response;
    } catch (error) {
      console.error('❌ Invoice fetch failed:', error);
      throw error;
    }
  },

  getGuestInvoice: async (orderNumber, email) => {
    try {
      const response = await api.get(`/invoices/guest/${orderNumber}/${email}`);
      return response;
    } catch (error) {
      console.error('❌ Guest invoice fetch failed:', error);
      throw error;
    }
  },

  download: async (orderId) => {
    try {
      const response = await api.get(`/invoices/${orderId}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ Invoice download failed:', error);
      throw error;
    }
  },

  send: async (orderId) => {
    try {
      const response = await api.post(`/invoices/${orderId}/send`);
      return response;
    } catch (error) {
      console.error('❌ Invoice send failed:', error);
      throw error;
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response;
    } catch (error) {
      console.error('❌ Invoices fetch failed:', error);
      throw error;
    }
  }
};

// Quotes API
export const quotesAPI = {
  create: async (quoteData) => {
    try {
      const response = await api.post('/quotes', quoteData);
      return response;
    } catch (error) {
      console.error('❌ Quote creation failed:', error);
      throw error;
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await api.get('/quotes', { params });
      return response;
    } catch (error) {
      console.error('❌ Quotes fetch failed:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/quotes/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Quote fetch failed:', error);
      throw error;
    }
  },

  accept: async (id) => {
    try {
      const response = await api.put(`/quotes/${id}/accept`);
      return response;
    } catch (error) {
      console.error('❌ Quote accept failed:', error);
      throw error;
    }
  },

  reject: async (id, reason) => {
    try {
      const response = await api.put(`/quotes/${id}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('❌ Quote reject failed:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/quotes/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Quote delete failed:', error);
      throw error;
    }
  }
};

// Blog API
// src/services/api.js - Updated Blog API Section
// Add this to replace your existing blogAPI section in src/services/api.js

export const blogAPI = {
  // Get all blog posts with pagination and filters
  getAll: async (params = {}) => {
    try {
      
      const cleanParams = {};
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
      if (params.category) cleanParams.category = params.category;
      if (params.tag) cleanParams.tag = params.tag;
      if (params.search) cleanParams.search = params.search;
      if (params.status) cleanParams.status = params.status;
      
      const response = await api.get('/blog/posts', { params: cleanParams });
      return response;
    } catch (error) {
      console.error('❌ Blog posts fetch failed:', error);
      throw error;
    }
  },

  // Get published posts (convenience method)
  getPublished: async (params = {}) => {
    try {
      return await blogAPI.getAll({ ...params, status: 'published' });
    } catch (error) {
      console.error('❌ Published posts fetch failed:', error);
      throw error;
    }
  },

  // Get single post by slug
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/blog/posts/${slug}`);
      return response;
    } catch (error) {
      console.error('❌ Blog post fetch failed:', error);
      throw error;
    }
  },

  // Get related posts
  getRelated: async (slug, params = {}) => {
    try {
      const response = await api.get(`/blog/posts/related/${slug}`, { params });
      return response;
    } catch (error) {
      console.error('❌ Related posts fetch failed:', error);
      throw error;
    }
  },

  // Get blog categories
  getCategories: async () => {
    try {
      const response = await api.get('/blog/categories');
      return response;
    } catch (error) {
      console.error('❌ Blog categories fetch failed:', error);
      throw error;
    }
  },

  // Get blog by category
  getByCategory: async (categoryId, params = {}) => {
    try {
      const response = await blogAPI.getAll({ ...params, category: categoryId });
      return response;
    } catch (error) {
      console.error('❌ Posts by category fetch failed:', error);
      throw error;
    }
  },

  // Get popular tags
  getTags: async () => {
    try {
      const response = await api.get('/blog/tags');
      return response;
    } catch (error) {
      console.error('❌ Blog tags fetch failed:', error);
      throw error;
    }
  },

  // Get featured/popular posts
  getFeatured: async (params = {}) => {
    try {
      const response = await api.get('/blog/featured', { params });
      return response;
    } catch (error) {
      console.error('❌ Featured posts fetch failed:', error);
      throw error;
    }
  },

  // Alias for featured posts
  getPopular: async (params = {}) => {
    return await blogAPI.getFeatured(params);
  },

  // Get blog archive
  getArchive: async (params = {}) => {
    try {
      const response = await api.get('/blog/archive', { params });
      return response;
    } catch (error) {
      console.error('❌ Blog archive fetch failed:', error);
      throw error;
    }
  },

  // Search blog posts
  search: async (params = {}) => {
    try {
      return await blogAPI.getAll(params);
    } catch (error) {
      console.error('❌ Blog search failed:', error);
      throw error;
    }
  },

  // Get posts by author
  getByAuthor: async (authorId, params = {}) => {
    try {
      // Note: Adjust this if your backend has a specific author endpoint
      const response = await blogAPI.getAll({ ...params, author: authorId });
      return response;
    } catch (error) {
      console.error('❌ Posts by author fetch failed:', error);
      throw error;
    }
  },

  // Get posts by tag
  getByTag: async (tag, params = {}) => {
    try {
      const response = await blogAPI.getAll({ ...params, tag });
      return response;
    } catch (error) {
      console.error('❌ Posts by tag fetch failed:', error);
      throw error;
    }
  },

  // Create blog post (admin only)
  create: async (postData) => {
    try {
      const response = await api.post('/blog/posts', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      console.error('❌ Blog post creation failed:', error);
      throw error;
    }
  },

  // Update blog post (admin only)
  update: async (postId, postData) => {
    try {
      const response = await api.put(`/blog/posts/${postId}`, postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      console.error('❌ Blog post update failed:', error);
      throw error;
    }
  },

  // Delete blog post (admin only)
  delete: async (postId) => {
    try {
      const response = await api.delete(`/blog/posts/${postId}`);
      return response;
    } catch (error) {
      console.error('❌ Blog post deletion failed:', error);
      throw error;
    }
  },

  // Create category (admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/blog/categories', categoryData);
      return response;
    } catch (error) {
      console.error('❌ Blog category creation failed:', error);
      throw error;
    }
  },

  // Update category (admin only)
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/blog/categories/${categoryId}`, categoryData);
      return response;
    } catch (error) {
      console.error('❌ Blog category update failed:', error);
      throw error;
    }
  },

  // Delete category (admin only)
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/blog/categories/${categoryId}`);
      return response;
    } catch (error) {
      console.error('❌ Blog category deletion failed:', error);
      throw error;
    }
  }
};
// Contact API
export const contactAPI = {
  /**
   * Submit contact form
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Customer name (required)
   * @param {string} contactData.email - Customer email (required)
   * @param {string} contactData.phone - Customer phone (optional)
   * @param {string} contactData.subject - Message subject (required)
   * @param {string} contactData.message - Message content (required)
   * @returns {Promise} Response confirming submission
   */
  submit: async (contactData) => {
    try {
      
      // Validate required fields
      if (!contactData.name) {
        throw new Error('Name is required');
      }
      if (!contactData.email) {
        throw new Error('Email is required');
      }
      if (!contactData.subject) {
        throw new Error('Subject is required');
      }
      if (!contactData.message) {
        throw new Error('Message is required');
      }
      
      // Clean data to match backend schema
      const cleanData = {
        name: contactData.name.trim(),
        email: contactData.email.trim(),
        phone: contactData.phone?.trim() || '',
        subject: contactData.subject.trim(),
        message: contactData.message.trim()
      };
      
      const response = await api.post('/contact', cleanData);
      return response;
    } catch (error) {
      console.error('❌ Contact form submission failed:', error);
      throw error;
    }
  },
  
  // Admin endpoints (if needed later)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/contact', { params });
      return response;
    } catch (error) {
      console.error('❌ Contact messages fetch failed:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/contact/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Contact message fetch failed:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await api.put(`/contact/${id}`, data);
      return response;
    } catch (error) {
      console.error('❌ Contact message update failed:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/contact/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Contact message delete failed:', error);
      throw error;
    }
  }
};

// Pages API
export const pagesAPI = {
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/pages/${slug}`);
      return response;
    } catch (error) {
      console.error('❌ Page fetch failed:', error);
      throw error;
    }
  }
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Initialize auth token on app start
const initializeAuth = () => {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
};

initializeAuth();

// Cache utilities
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = () => {
  cache.clear();
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }
};

export default api;
