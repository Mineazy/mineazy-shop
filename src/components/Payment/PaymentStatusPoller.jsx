// src/components/Payment/PaymentStatusPoller.jsx - COMPLETE VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const API_URL = 'https://mining-equipment-backend.onrender.com/api';

const PaymentStatusPoller = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking payment status...');
  const [order, setOrder] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  
  const orderId = searchParams.get('orderId') || searchParams.get('reference');
  const MAX_RETRIES = 10;
  const POLL_INTERVAL = 3000;

  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) {
      setStatus('error');
      setMessage('No order ID provided');
      return;
    }

    try {
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order status');
      }

      const data = await response.json();
      const orderData = data.success ? data.data : data;

      setOrder(orderData);

      if (orderData.paymentStatus === 'paid' || orderData.paymentStatus === 'completed') {
        setStatus('success');
        setMessage('Payment successful! Redirecting...');
        
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              navigate(`/order-success/${orderId}`, { replace: true });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } else if (orderData.paymentStatus === 'failed' || orderData.paymentStatus === 'cancelled') {
        setStatus('failed');
        setMessage('Payment was not successful. Please try again or choose another payment method.');
        
      } else if (orderData.paymentStatus === 'awaiting_payment' || orderData.paymentStatus === 'pending') {
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => checkPaymentStatus(), POLL_INTERVAL);
        } else {
          setStatus('error');
          setMessage('Payment verification timed out. Please check your order status in your account.');
        }
      }

    } catch (error) {
      console.error('❌ Payment status check failed:', error);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => checkPaymentStatus(), POLL_INTERVAL);
      } else {
        setStatus('error');
        setMessage('Unable to verify payment status. Please check your email or contact support.');
      }
    }
  }, [orderId, retryCount, navigate]);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus('checking');
    setMessage('Checking payment status...');
    checkPaymentStatus();
  };

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            {status === 'checking' && (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            
            {status === 'failed' && (
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

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'checking' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'error' && 'Verification Error'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'checking' && (
            <div className="mb-6">
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <span>Attempt {retryCount + 1} of {MAX_RETRIES}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((retryCount + 1) / MAX_RETRIES) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

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
                    order.paymentStatus === 'paid' ? 'text-green-600' : 
                    order.paymentStatus === 'failed' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={() => navigate(`/order-success/${orderId}`, { replace: true })}
                className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Order Details
              </button>
            )}

            {status === 'failed' && (
              <>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(`/order/${orderId}`)}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Order
                </button>
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
                <button
                  onClick={handleGoToOrders}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go to My Orders
                </button>
              </>
            )}

            {status !== 'success' && (
              <button
                onClick={handleGoHome}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Return to Homepage
              </button>
            )}
          </div>

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

export default PaymentStatusPoller;