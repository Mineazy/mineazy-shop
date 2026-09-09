// src/pages/Orders.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Package, Calendar, DollarSign, MapPin, Phone, Eye, Download, 
  RefreshCw, Search, Truck, Mail, CheckCircle, Clock, 
  XCircle, AlertTriangle, ArrowLeft, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

const Orders = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const orderStatuses = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [filters, isAuthenticated]);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      
      // Get auth token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const url = `${API_URL}/orders?${queryParams.toString()}`;

      const response = await fetch(url, {
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
          // No orders found - not an error
          setOrders([]);
          setPagination(null);
          setLoading(false);
          return;
        } else {
          throw new Error('Failed to fetch orders. Please try again.');
        }
      }

      const data = await response.json();

      // Extract orders and pagination from response
      let ordersData = [];
      let paginationData = null;

      if (data.success) {
        // Response format: { success: true, data: { orders: [...], pagination: {...} } }
        if (data.data) {
          ordersData = data.data.orders || data.data || [];
          paginationData = data.data.pagination || data.pagination || null;
        }
      } else if (data.orders) {
        // Alternative format: { orders: [...], pagination: {...} }
        ordersData = data.orders;
        paginationData = data.pagination;
      } else if (Array.isArray(data)) {
        // Direct array
        ordersData = data;
      }

      setOrders(ordersData);
      setPagination(paginationData);

    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
      
      // If auth error, redirect to login
      if (err.message.includes('session') || err.message.includes('expired')) {
        setTimeout(() => {
          navigate('/login', { state: { from: { pathname: '/orders' } } });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when changing filters
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

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
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please contact support if this continues.');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      
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
      
      // Get order number from the orders array
      const order = orders.find(o => o._id === orderId);
      const orderNumber = order?.orderNumber || orderId.slice(-8);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      
    } catch (error) {
      console.error('❌ Invoice download failed:', error);
      alert('Failed to download invoice. The invoice may not be ready yet. Please try again later or contact support.');
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
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-22">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <Loading size="lg" text="Loading your orders..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/account')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Account</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">
                {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Track and manage your orders'}
              </p>
            </div>
            
            {orders.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-secondary">
                  {pagination?.totalOrders || orders.length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, product name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary min-w-[150px]"
              >
                {orderStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchOrders}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Orders</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  {error.includes('session') && (
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Sign In Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && !loading && orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status 
                ? 'No orders match your current filters. Try adjusting your search criteria.'
                : 'You haven\'t placed any orders yet. Start shopping to see your orders here.'
              }
            </p>
            {!filters.search && !filters.status ? (
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </button>
            ) : (
              <button
                onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!error && orders.length > 0 && (
          <>
            <div className="space-y-6">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order._id);
                
                return (
                  <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.orderNumber || order._id?.slice(-8)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{formatCurrency(order.total || order.summary?.total?.USD)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Package className="w-4 h-4" />
                                <span>{order.items?.length || 0} items</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status || 'pending'}</span>
                            </span>
                            
                            {order.paymentStatus && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.paymentStatus === 'completed' || order.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Invoice</span>
                          </button>

                          <button
                            onClick={() => toggleOrderExpanded(order._id)}
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Order Details */}
                    {isExpanded && (
                      <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Items */}
                          <div className="lg:col-span-2">
                            <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                            <div className="space-y-3">
                              {order.items?.map((item, index) => {
                                const product = item.productId || item.product || {};
                                const quantity = parseInt(item.quantity) || 1;
                                const unitPrice = item.unitPrice?.USD || item.price || 0;
                                const totalPrice = item.totalPrice?.USD || (quantity * unitPrice);
                                
                                return (
                                  <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <img
                                      src={product.images?.[0] || productPlaceholder}
                                      alt={product.name || 'Product'}
                                      className="w-12 h-12 object-cover rounded-lg"
                                      onError={(e) => { e.target.src = productPlaceholder; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">
                                        {product.name || 'Unknown Product'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Qty: {quantity} × {formatCurrency(unitPrice)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900">
                                        {formatCurrency(totalPrice)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Order Info */}
                          <div className="space-y-4">
                            {/* Shipping Address */}
                            {order.shippingAddress && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>Shipping</span>
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>{order.shippingAddress.street}</p>
                                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                  <p>{order.shippingAddress.country}</p>
                                </div>
                              </div>
                            )}

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {order.paymentMethod?.replace('_', ' ') || 'N/A'}
                              </p>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
                              <div className="space-y-2 text-sm">
                                {order.subtotal && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span>{formatCurrency(order.subtotal || order.summary?.subtotal?.USD)}</span>
                                  </div>
                                )}
                                {order.tax && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Tax:</span>
                                    <span>{formatCurrency(order.tax || order.summary?.tax?.USD)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Shipping:</span>
                                  <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t font-semibold">
                                  <span>Total:</span>
                                  <span className="text-secondary">
                                    {formatCurrency(order.total || order.summary?.total?.USD)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, filters.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          filters.page === pageNum
                            ? 'bg-primary text-secondary border-primary font-semibold'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {pagination.totalPages > 5 && filters.page < pagination.totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          filters.page === pagination.totalPages
                            ? 'bg-primary text-secondary border-primary font-semibold'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page >= pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Orders Summary */}
            {pagination && (
              <div className="mt-8 text-center text-sm text-gray-600">
                Showing {Math.min(filters.limit, orders.length)} of {pagination.totalOrders || orders.length} orders
                {filters.status && ` (filtered by: ${filters.status})`}
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Need Help with Your Orders?</h3>
          <p className="text-sm text-blue-700 mb-4">
            Our customer support team is here to help you with any questions about your orders.
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

export default Orders;
