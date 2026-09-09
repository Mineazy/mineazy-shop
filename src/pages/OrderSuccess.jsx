// src/pages/OrderSuccess.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, Package, Truck, Mail, Phone, MapPin, 
  Download, ArrowLeft, Clock, Calendar,
  AlertCircle, CreditCard, Building2, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Common/Loading';
import productPlaceholder from '../assets/prodduct-placeholder.webp';

const API_URL = 'https://mining-equipment-backend.onrender.com/api';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      console.error('❌ No order ID provided');
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId, isAuthenticated]);

 const fetchOrderDetails = async () => {
  try {
    setLoading(true);
    setError(null);


    // ===== TRY 1: Check if order is cached (for guests) =====
    const cachedOrder = localStorage.getItem(`guestOrder_${orderId}`);
    if (cachedOrder && !isAuthenticated) {
      const parsedOrder = JSON.parse(cachedOrder);
      setOrder(parsedOrder);
      setLoading(false);
      return;
    }

    // ===== TRY 2: Fetch from backend =====
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    // ✅ GET EMAIL FROM URL OR LOCALSTORAGE FOR GUEST USERS
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const guestEmail = emailFromUrl || (() => {
      const savedOrderInfo = localStorage.getItem('guestOrderInfo');
      if (savedOrderInfo) {
        const orderInfo = JSON.parse(savedOrderInfo);
        return orderInfo.email;
      }
      return null;
    })();


    let response;

    if (token) {
      // ✅ AUTHENTICATED USER
      response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } else if (guestEmail) {
      // ✅ GUEST USER - Use guest endpoint
      response = await fetch(
        `${API_URL}/orders/guest/${orderId}?email=${encodeURIComponent(guestEmail)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      throw new Error('No authentication token or email provided. Please sign in to view your order.');
    }


    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found. Please check your order number and email.');
      } else if (response.status === 401) {
        throw new Error('Please sign in to view your order details.');
      } else {
        throw new Error('Failed to load order details. Please try again.');
      }
    }

    const data = await response.json();

    // ===== EXTRACT ORDER FROM RESPONSE =====
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

    // Cache for guests
    if (!isAuthenticated && guestEmail) {
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

  } catch (err) {
    console.error('❌ Failed to fetch order:', err);
    setError(err.message || 'Failed to load order details');
  } finally {
    setLoading(false);
  }
};

  const handleDownloadInvoice = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const invoiceUrl = `${API_URL}/invoices/${orderId}?format=pdf`;
    
    if (token) {
      window.open(`${invoiceUrl}&token=${token}`, '_blank');
      return;
    }

    const guestEmail = order?.customerInfo?.email || (() => {
      const savedOrderInfo = localStorage.getItem('guestOrderInfo');
      if (savedOrderInfo) {
        try {
          const parsed = JSON.parse(savedOrderInfo);
          return parsed.email;
        } catch (error) {
          return null;
        }
      }
      return null;
    })();

    const orderNumber = order?.orderNumber;

    if (guestEmail && orderNumber) {
      const guestInvoiceUrl = `${API_URL}/invoices/guest/${encodeURIComponent(orderNumber)}/${encodeURIComponent(guestEmail)}?format=pdf`;
      window.open(guestInvoiceUrl, '_blank');
      return;
    }

    alert('Invoice is not ready yet. Please sign in or contact support.');
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'paynow': 'Paynow',
      'cash_on_delivery': 'Cash on Delivery',
      'collection': 'Pay on Collection',
      'bank_transfer': 'Bank Transfer'
    };
    return methods[method] || method || 'N/A';
  };

  const getMoneyAmount = (...values) => {
    for (const value of values) {
      if (value === null || value === undefined || value === '') continue;
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') return Number(value);
      if (typeof value === 'object') {
        if (value.USD !== undefined) return Number(value.USD);
        if (value.usd !== undefined) return Number(value.usd);
        if (value.amount !== undefined) return Number(value.amount);
      }
    }
    return undefined;
  };

  const getOrderDate = (orderData) => {
    return orderData.createdAt || orderData.orderDate || orderData.date || orderData.created_at;
  };

  const getPaymentMethod = (orderData) => {
    return orderData.paymentMethod || orderData.payment?.method || orderData.paymentDetails?.method;
  };

  const getOrderItemDetails = (item) => {
    const product = item.productId || item.product || {};
    const quantity = parseInt(item.quantity, 10) || 1;
    const unitPrice = getMoneyAmount(item.unitPrice, item.price, product.price) || 0;
    const totalPrice = getMoneyAmount(item.totalPrice, item.total) ?? (quantity * unitPrice);

    return {
      product,
      quantity,
      unitPrice,
      totalPrice,
      name: item.name || product.name || 'Unknown Product',
      sku: item.sku || product.sku || 'N/A',
      image: product.images?.[0] || item.image || item.imageUrl || productPlaceholder
    };
  };

  const getAddressLines = (address = {}) => {
    const cityLine = [address.city, address.state || address.province].filter(Boolean).join(', ');
    return [
      address.street,
      address.suburb,
      cityLine,
      address.country || 'Zimbabwe',
      address.zipCode || address.postalCode
    ].filter(Boolean);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-indigo-600 bg-indigo-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '$0.00';
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) return '$0.00';
    return `$${numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <Loading size="lg" text="Loading your order..." />
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Order Not Found</h2>
              <p className="text-red-700 mb-6">{error || 'Unable to load order details'}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go to Homepage
                </button>
                
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/orders')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View All Orders
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login', { state: { from: location } })}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== SUCCESS STATE =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-12 py-20">
        {/* Success Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully! 🎉
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your order. We've received it and will start processing it right away.
            </p>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="px-6 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-xl font-bold text-secondary">
                  {order.orderNumber || `#${order._id?.slice(-8)}`}
                </p>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(getMoneyAmount(order.total, order.summary?.total))}
                </p>
              </div>
            </div>

            {/* Order Status */}
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
              <Clock className="w-4 h-4" />
              <span className="font-semibold capitalize">{order.status || 'pending'}</span>
            </div>

            {/* Email Confirmation Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Confirmation Email Sent
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    We've sent an order confirmation to{' '}
                    <span className="font-semibold">
                      {order.customerInfo?.email || user?.email || 'your email'}
                    </span>
                    . Your invoice is included as an attachment when available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Order Items ({order.items?.length || 0})</span>
              </h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const itemDetails = getOrderItemDetails(item);
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={itemDetails.image}
                        alt={itemDetails.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { e.target.src = productPlaceholder; }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {itemDetails.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SKU: {itemDetails.sku}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {itemDetails.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(itemDetails.totalPrice)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(itemDetails.unitPrice)} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Information */}
            {(order.shippingAddress || order.customerInfo?.address) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Shipping Address</span>
                </h2>
                
                <div className="text-gray-600 space-y-1">
                  {(() => {
                    const address = order.shippingAddress || order.customerInfo?.address || {};
                    const addressLines = getAddressLines(address);
                    return (
                      <>
                        {addressLines.length > 0
                          ? addressLines.map((line) => <p key={line}>{line}</p>)
                          : <p>N/A</p>}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Contact Information (for guests) */}
            {order.customerInfo && !isAuthenticated && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Contact Information</span>
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{order.customerInfo.email}</span>
                  </div>
                  
                  {order.customerInfo.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.customerInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {getMoneyAmount(order.subtotal, order.summary?.subtotal) !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(getMoneyAmount(order.subtotal, order.summary?.subtotal))}</span>
                  </div>
                )}
                
                {getMoneyAmount(order.tax, order.summary?.tax) !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (15.5%):</span>
                    <span>{formatCurrency(getMoneyAmount(order.tax, order.summary?.tax))}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-secondary">
                    {formatCurrency(getMoneyAmount(order.total, order.summary?.total))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method:</span>
                  <div className="flex items-center space-x-2">
                    {getPaymentMethod(order) === 'paynow' && <CreditCard className="w-4 h-4" />}
                    {getPaymentMethod(order) === 'cash_on_delivery' && <Truck className="w-4 h-4" />}
                    {getPaymentMethod(order) === 'collection' && <Building2 className="w-4 h-4" />}
                    <span className="font-medium">
                      {getPaymentMethodDisplay(getPaymentMethod(order))}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${
                    order.paymentStatus === 'completed' || order.paymentStatus === 'paid'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Date */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(getOrderDate(order))}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Package className="w-5 h-5" />
                    <span>View All Orders</span>
                  </button>
                  
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Invoice</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Invoice</span>
                  </button>

                  <button
                    onClick={() => navigate('/register', { state: { from: location } })}
                    className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Account to Track Order
                  </button>
                  
                  <button
                    onClick={() => navigate('/login', { state: { from: location } })}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
              
              <button
                onClick={() => navigate('/shop')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+263 712290 046</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@mineazy.co.zw</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
