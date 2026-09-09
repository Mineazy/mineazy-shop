// src/pages/OrderDetails.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, Phone, Mail, 
  Truck, Download, CheckCircle, Clock, XCircle, AlertTriangle, CreditCard,
  User, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Common/Loading';
import productPlaceholder from '../assets/prodduct-placeholder.webp';

const API_URL = 'https://mining-equipment-backend.onrender.com/api';

const readInvoicePdfBlob = async (response) => {
  if (!response.ok) {
    try {
      const errorData = await response.clone().json();
      throw new Error(errorData.message || 'Failed to download invoice');
    } catch (error) {
      if (error.message && error.message !== 'Failed to download invoice') throw error;
      throw new Error('Failed to download invoice');
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

  if (!contentType.includes('application/pdf') || !isPdf) {
    throw new Error('Invoice download did not return a valid PDF.');
  }

  return new Blob([arrayBuffer], { type: 'application/pdf' });
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/order/${orderId}` } } });
      return;
    }

    fetchOrderDetails();
  }, [orderId, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        } else if (response.status === 404) {
          throw new Error('Order not found');
        } else {
          throw new Error('Failed to load order details');
        }
      }

      const data = await response.json();

      // Extract order from response
      let orderData = null;
      if (data.success && data.data) {
        orderData = data.data;
      } else if (data.order) {
        orderData = data.order;
      } else if (data._id) {
        orderData = data;
      }

      if (!orderData || !orderData._id) {
        throw new Error('Invalid order data received');
      }

      setOrder(orderData);

    } catch (err) {
      console.error('❌ Failed to fetch order:', err);
      setError(err.message || 'Failed to load order details');
      
      if (err.message.includes('session') || err.message.includes('expired')) {
        setTimeout(() => {
          navigate('/login', { state: { from: { pathname: `/order/${orderId}` } } });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancelLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      alert('Order cancelled successfully');
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please contact support.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        alert('Please sign in to download invoice');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/invoices/${orderId}?format=pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = await readInvoicePdfBlob(response);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      
    } catch (error) {
      console.error('❌ Invoice download failed:', error);
      alert('Failed to download invoice. Please try again or contact support.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
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
      address.country,
      address.zipCode || address.postalCode
    ].filter(Boolean);
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

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined || amount === '') return '$0.00';
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numericAmount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <Loading size="lg" text="Loading order details..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Order Not Found</h2>
              <p className="text-red-700 mb-6">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Back to Orders
                </button>
                <button 
                  onClick={fetchOrderDetails}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render order details
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber || order._id?.slice(-8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(getOrderDate(order))}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {order.status === 'pending' && !cancelLoading && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {cancelLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Order</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {downloadingInvoice ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Invoice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="font-semibold capitalize">{order.status}</span>
              </div>
              
              {order.paymentStatus && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.paymentStatus === 'completed' || order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Payment: {order.paymentStatus}
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-secondary">
                {formatCurrency(getMoneyAmount(order.total, order.summary?.total))}
              </p>
                {(order.summary?.total?.ZWG || order.total?.ZWG) && (
                <p className="text-sm text-gray-500">
                  ZWG {(order.summary?.total?.ZWG || order.total?.ZWG).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Items ({order.items?.length || 0})
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
                        onError={(e) => {
                          e.target.src = productPlaceholder;
                        }}
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

            {/* Order Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>
                
                <div className="space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStatusColor(history.status)}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <h3 className="font-semibold text-gray-900 capitalize">{history.status}</h3>
                          <span className="text-sm text-gray-500">{formatDate(history.timestamp)}</span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {getMoneyAmount(order.subtotal, order.summary?.subtotal) !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(getMoneyAmount(order.subtotal, order.summary?.subtotal))}</span>
                  </div>
                )}
                
                {(getMoneyAmount(order.tax, order.summary?.tax) || 0) > 0 && (
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
                  <div className="text-right">
                    <div className="text-secondary">{formatCurrency(getMoneyAmount(order.total, order.summary?.total))}</div>
                    {(order.summary?.total?.ZWG || order.total?.ZWG) && (
                      <div className="text-sm text-gray-500 font-normal">
                        ZWG {(order.summary?.total?.ZWG || order.total?.ZWG).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {(order.shippingAddress || order.customerInfo?.address) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Shipping Address</span>
                </h3>
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

            {/* Contact Information */}
            {order.customerInfo && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Contact</span>
                </h3>
                <div className="space-y-3">
                  {(order.customerInfo.firstName || order.customerInfo.lastName) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </span>
                    </div>
                  )}
                  
                  {order.customerInfo.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.customerInfo.email}</span>
                    </div>
                  )}
                  
                  {order.customerInfo.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.customerInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method:</span>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">
                      {getPaymentMethodDisplay(getPaymentMethod(order))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize font-medium ${
                    order.paymentStatus === 'completed' || order.paymentStatus === 'paid'
                      ? 'text-green-600'
                      : order.paymentStatus === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Tracking</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-mono font-medium">{order.trackingNumber}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Need Help with This Order?</h3>
          <p className="text-sm text-blue-700 mb-4">
            Contact our support team for assistance with your order.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:+263712290046"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900"
            >
              <Phone className="w-4 h-4" />
              <span>+263 712290 046</span>
            </a>
            <a
              href="mailto:info@mineazy.co.zw"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900"
            >
              <Mail className="w-4 h-4" />
              <span>info@mineazy.co.zw</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
