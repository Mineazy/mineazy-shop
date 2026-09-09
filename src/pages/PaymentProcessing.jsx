// src/pages/PaymentProcessing.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const API_URL = 'https://mining-equipment-backend.onrender.com/api';
const MAX_RETRIES = 20; // 20 attempts = 1 minute
const POLL_INTERVAL = 3000; // 3 seconds

const PaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Processing your payment...');
  const [order, setOrder] = useState(null);
  const [countdown, setCountdown] = useState(3);
  
  // ✅ FIX: Use ref to track retry count to prevent infinite loops
  const retryCountRef = useRef(0);
  const isCheckingRef = useRef(false);
  const timeoutRef = useRef(null);
  
  // Get order ID from URL params
  const orderId = searchParams.get('orderId') || 
                  searchParams.get('reference') ||
                  searchParams.get('orderNumber');
  

  // ✅ FIX: Proper cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ FIX: Single check function with proper state management
 const checkPaymentStatus = async () => {
  // Prevent concurrent checks
  if (isCheckingRef.current) {
    return;
  }

  if (!orderId) {
    console.error('❌ No order ID provided');
    
    // ✅ TRY TO GET FROM LOCALSTORAGE
    const savedOrderInfo = localStorage.getItem('guestOrderInfo');
    if (savedOrderInfo) {
      const orderInfo = JSON.parse(savedOrderInfo);
      
      // Redirect to payment processing with proper params
      const params = new URLSearchParams({
        orderId: orderInfo.orderId,
        email: orderInfo.email,
        orderNumber: orderInfo.orderNumber
      });
      
      window.location.href = `/payment-processing?${params.toString()}`;
      return;
    }
    
    setStatus('error');
    setMessage('No order information provided. Please check your email for order details.');
    return;
  }

  // Check if max retries reached
  if (retryCountRef.current >= MAX_RETRIES) {
    setStatus('timeout');
    setMessage('Payment verification timed out. Please check your email or contact support.');
    return;
  }

  isCheckingRef.current = true;
  retryCountRef.current += 1;

  setMessage(`Verifying payment... (${retryCountRef.current}/${MAX_RETRIES})`);

  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const email = searchParams.get('email');
    
    // ✅ CRITICAL: For guest users, get email from URL or localStorage
    const guestEmail = email || (() => {
      const savedOrderInfo = localStorage.getItem('guestOrderInfo');
      if (savedOrderInfo) {
        const orderInfo = JSON.parse(savedOrderInfo);
        return orderInfo.email;
      }
      return null;
    })();


    let response;
    
    // ✅ USE DIFFERENT ENDPOINTS FOR AUTHENTICATED vs GUEST USERS
    if (token) {
      // Authenticated user - use regular endpoint
      response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } else if (guestEmail) {
      // Guest user - use guest endpoint with email verification
      response = await fetch(
        `${API_URL}/payments/paynow/order-status/${orderId}?email=${encodeURIComponent(guestEmail)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      throw new Error('No authentication token or email provided');
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found');
      } else if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract order from different response formats
    let orderData = null;
    if (data.success && data.order) {
      orderData = data.order;
    } else if (data.order) {
      orderData = data.order;
    } else if (data._id) {
      orderData = data;
    }

    if (!orderData || !orderData._id) {
      throw new Error('Invalid order data received');
    }

    
    setOrder(orderData);

    // ✅ PROPER STATUS HANDLING
    const paymentStatus = orderData.paymentStatus?.toLowerCase();
    
    if (paymentStatus === 'paid' || paymentStatus === 'completed') {
      setStatus('success');
      setMessage('Payment successful! Redirecting...');
      
      // Cache order for guest users
      if (!token && guestEmail) {
        const orderCache = {
          ...orderData,
          timestamp: Date.now()
        };
        localStorage.setItem(`guestOrder_${orderId}`, JSON.stringify(orderCache));
        
        // Auto-cleanup after 24 hours
        setTimeout(() => {
          localStorage.removeItem(`guestOrder_${orderId}`);
        }, 24 * 60 * 60 * 1000);
      }
      
      // Start countdown and redirect
      let countdownValue = 3;
      setCountdown(countdownValue);
      
      const countdownInterval = setInterval(() => {
        countdownValue--;
        setCountdown(countdownValue);
        
        if (countdownValue <= 0) {
          clearInterval(countdownInterval);
          navigate(`/order-success/${orderId}`, { replace: true });
        }
      }, 1000);
      
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      setStatus('failed');
      setMessage('Payment was not successful. Please try again.');
      
    } else if (paymentStatus === 'awaiting_payment' || paymentStatus === 'pending') {
      
      // Schedule next check
      timeoutRef.current = setTimeout(() => {
        isCheckingRef.current = false;
        checkPaymentStatus();
      }, POLL_INTERVAL);
      
    } else {
      
      // Keep checking for unknown statuses
      timeoutRef.current = setTimeout(() => {
        isCheckingRef.current = false;
        checkPaymentStatus();
      }, POLL_INTERVAL);
    }

  } catch (error) {
    console.error('❌ Payment status check failed:', error);
    
    // For authentication errors, try guest endpoint if we have email
    if (error.message.includes('Authentication') || error.message.includes('401')) {
      const savedOrderInfo = localStorage.getItem('guestOrderInfo');
      if (savedOrderInfo) {
        const orderInfo = JSON.parse(savedOrderInfo);
        
        // Redirect with email parameter
        const params = new URLSearchParams({
          orderId: orderId,
          email: orderInfo.email,
          orderNumber: orderInfo.orderNumber || orderId
        });
        
        window.location.href = `/payment-processing?${params.toString()}`;
        return;
      }
    }
    
    // Network error - retry
    timeoutRef.current = setTimeout(() => {
      isCheckingRef.current = false;
      checkPaymentStatus();
    }, POLL_INTERVAL);
    
  } finally {
    // Only clear checking flag if we're done (success/failed/timeout)
    if (status !== 'checking') {
      isCheckingRef.current = false;
    }
  }
};

  // ✅ FIX: Start checking only once on mount
  useEffect(() => {
    
    if (!orderId) {
      setStatus('error');
      setMessage('No order information provided.');
      return;
    }

    // Start checking after a short delay
    const initialTimeout = setTimeout(() => {
      checkPaymentStatus();
    }, 500);

    return () => {
      clearTimeout(initialTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty deps - run only once

  const handleRetry = () => {
    retryCountRef.current = 0;
    isCheckingRef.current = false;
    setStatus('checking');
    setMessage('Checking payment status...');
    checkPaymentStatus();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/order-success/${orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'checking' && (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            
            {(status === 'failed' || status === 'timeout') && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-yellow-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'checking' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'timeout' && 'Verification Timeout'}
            {status === 'error' && 'Verification Error'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Progress */}
          {status === 'checking' && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(retryCountRef.current / MAX_RETRIES) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                This may take up to a minute. Please don't close this page.
              </p>
            </div>
          )}

          {/* Success countdown */}
          {status === 'success' && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Order details */}
          {order && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.orderNumber || order._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${order.total?.toLocaleString() || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-medium capitalize ${
                    order.paymentStatus === 'paid' || order.paymentStatus === 'completed' 
                      ? 'text-green-600' : 
                    order.paymentStatus === 'failed' 
                      ? 'text-red-600' : 
                      'text-yellow-600'
                  }`}>
                    {order.paymentStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={handleViewOrder}
                className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Order Details
              </button>
            )}

            {(status === 'failed' || status === 'timeout') && (
              <>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
                {orderId && (
                  <button
                    onClick={handleViewOrder}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Order Anyway
                  </button>
                )}
              </>
            )}

            {status === 'error' && (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Check Again</span>
                </button>
              </>
            )}

            {status !== 'success' && status !== 'checking' && (
              <button
                onClick={handleGoHome}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Return to Homepage
              </button>
            )}
          </div>

          {/* Help section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Need help?</p>
            <div className="flex justify-center space-x-4 text-xs">
              <a href="tel:+263712290046" className="text-secondary hover:underline">
                +263 712290 046
              </a>
              <a href="mailto:info@mineazy.co.zw" className="text-secondary hover:underline">
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;