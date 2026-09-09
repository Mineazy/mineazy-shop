// src/components/Checkout/CheckoutFlow.jsx - Updated for new backend API
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Shield, Check, ArrowLeft, AlertCircle, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import productPlaceholder from '../../assets/prodduct-placeholder.webp';

const CheckoutFlow = () => {
  const { items, summary, clearCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      suburb: user?.address?.suburb || '',
      city: user?.address?.city || '',
      province: user?.address?.province || 'Harare',
      country: 'Zimbabwe',
      postalCode: user?.address?.postalCode || ''
    },
    paymentMethod: 'paynow',
    paymentDetails: {
      phone: user?.phone || ''
    },
    specialInstructions: '',
    billingAddressSame: true,
    billingAddress: {}
  });
  const [formErrors, setFormErrors] = useState({});

  const provinces = [
    'Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central',
    'Mashonaland East', 'Mashonaland West', 'Masvingo',
    'Matabeleland North', 'Matabeleland South', 'Midlands'
  ];

  const paymentMethods = [
    {
      id: 'paynow',
      name: 'Paynow',
      description: 'Pay with EcoCash, OneMoney, or Visa/Mastercard',
      icon: CreditCard,
      popular: true
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay cash when your order is delivered',
      icon: Truck
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer', 
      description: 'Direct bank transfer to our account',
      icon: CreditCard
    }
  ];

  // Enhanced validation and redirect logic
  useEffect(() => {
      isAuthenticated,
      hasItems: !!(items && items.length > 0),
      itemCount: items?.length || 0,
      cartLoading,
      hasUser: !!user
    });

    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: { pathname: '/checkout' } },
        replace: true 
      });
      return;
    }

    // Wait for cart to load before checking items
    if (!cartLoading && (!items || items.length === 0)) {
      navigate('/cart', { replace: true });
      return;
    }
  }, [isAuthenticated, items, cartLoading, navigate, user]);

  // Helper functions for new backend structure
  const getProductIdFromItem = (item) => {
    if (item.productId?._id) return item.productId._id;
    if (typeof item.productId === 'string') return item.productId;
    if (item.product?._id) return item.product._id;
    if (typeof item.product === 'string') return item.product;
    return item._id;
  };

  const getProductFromItem = (item) => {
    if (item.productId && typeof item.productId === 'object') return item.productId;
    if (item.product && typeof item.product === 'object') return item.product;
    return { _id: getProductIdFromItem(item), name: 'Unknown Product' };
  };

  const getItemPrice = (item) => {
    // Handle different price structures from new backend
    if (typeof item.price === 'number') return item.price;
    if (item.unitPrice && typeof item.unitPrice === 'number') return item.unitPrice;
    if (item.price?.USD) return item.price.USD;
    if (item.unitPrice?.USD) return item.unitPrice.USD;
    
    const product = getProductFromItem(item);
    if (product.price?.regular_price) return product.price.regular_price;
    if (typeof product.price === 'number') return product.price;
    
    return 0;
  };

  const validateStep = (stepNumber) => {
    const errors = {};
    
    if (stepNumber === 1) {
      // Validate shipping address
      if (!formData.shippingAddress.street.trim()) {
        errors.street = 'Street address is required';
      }
      if (!formData.shippingAddress.city.trim()) {
        errors.city = 'City is required';
      }
      if (!formData.shippingAddress.province) {
        errors.province = 'Province is required';
      }
      if (!formData.shippingAddress.postalCode.trim()) {
        errors.postalCode = 'Postal code is required';
      }
    }
    
    if (stepNumber === 2) {
      // Validate payment details
      if (formData.paymentMethod === 'paynow' && !formData.paymentDetails.phone.trim()) {
        errors.phone = 'Phone number is required for Paynow';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return;
    
    
    if (!items || items.length === 0) {
      setOrderError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      // Prepare order items for new backend structure
      const orderItems = items.map((item, index) => {
        const productId = getProductIdFromItem(item);
        const unitPrice = getItemPrice(item);
        const quantity = parseInt(item.quantity) || 1;

        if (!productId) {
          throw new Error(`Invalid product in cart at position ${index + 1}`);
        }

          productId,
          quantity,
          price: unitPrice
        });

        return {
          productId,
          quantity,
          price: unitPrice
        };
      });

      // Prepare order data for new backend API
      const orderData = {
        items: orderItems,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddressSame 
          ? formData.shippingAddress 
          : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions || '',
        // Remove branchId as it's no longer used in new backend
      };

      
      const orderResponse = await ordersAPI.create(orderData);
      
      // Handle new backend response structure
      let order = null;
      if (orderResponse.data?.success && orderResponse.data?.data) {
        order = orderResponse.data.data;
      } else if (orderResponse.data) {
        // Fallback for different response structures
        order = orderResponse.data.order || orderResponse.data;
      }

      if (!order || !order._id) {
        console.error('❌ Invalid order response:', orderResponse.data);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Handle payment processing for new backend
      if (formData.paymentMethod === 'paynow') {
        try {
          // Use new payment processing endpoint
          const paymentResponse = await ordersAPI.processPayment(order._id, {
            paymentMethod: 'paynow',
            paymentDetails: formData.paymentDetails,
            amount: summary?.total?.USD || 0,
            currency: 'USD'
          });
          
          
          // Check for payment URL to redirect to payment gateway
          const paymentUrl = paymentResponse.data?.data?.paymentUrl || 
                            paymentResponse.data?.paymentUrl;
          
          if (paymentUrl) {
            window.location.href = paymentUrl;
            return;
          }
        } catch (paymentError) {
          console.error('❌ Payment processing failed:', paymentError);
          // Continue with order success even if payment setup fails
        }
      }

      // Clear cart and redirect to success page
      await clearCart();
      
      navigate(`/order-success/${order._id}`, { replace: true });

    } catch (error) {
      console.error('❌ Order creation failed:', error);
      
      // Handle new backend error structure
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.success === false) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid order data. Please check your information.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setOrderError(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Shipping', description: 'Delivery information' },
    { number: 2, title: 'Payment', description: 'Payment method' },
    { number: 3, title: 'Review', description: 'Order confirmation' }
  ];

  // Show loading while checking authentication and cart
  if (!isAuthenticated || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Don't render if cart is empty (will redirect)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order securely</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepItem.number 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepItem.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`font-medium ${
                    step >= stepItem.number ? 'text-secondary' : 'text-gray-600'
                  }`}>
                    {stepItem.title}
                  </div>
                  <div className="text-sm text-gray-500">{stepItem.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step > stepItem.number ? 'bg-secondary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.street}
                        onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                          formErrors.street ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="123 Main Street"
                      />
                      {formErrors.street && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suburb
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.suburb}
                        onChange={(e) => handleInputChange('shippingAddress', 'suburb', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="CBD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                          formErrors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Harare"
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        value={formData.shippingAddress.province}
                        onChange={(e) => handleInputChange('shippingAddress', 'province', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                          formErrors.province ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                      {formErrors.province && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.province}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.postalCode}
                        onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                          formErrors.postalCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="00263"
                      />
                      {formErrors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      rows="3"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange('', 'specialInstructions', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextStep}
                      className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Payment Method</h2>

                  <div className="space-y-4">
                    {paymentMethods.map(method => (
                      <label
                        key={method.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.paymentMethod === method.id
                            ? 'border-secondary bg-secondary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
                            className="w-5 h-5 text-secondary border-gray-300 focus:ring-secondary/50"
                          />
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <method.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{method.name}</h4>
                              {method.popular && (
                                <span className="bg-primary text-secondary text-xs px-2 py-1 rounded-full font-medium">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </label>
                    ))}

                    {/* Paynow Details */}
                    {formData.paymentMethod === 'paynow' && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4">Paynow Details</h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={formData.paymentDetails.phone}
                              onChange={(e) => handleInputChange('paymentDetails', 'phone', e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                                formErrors.phone ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="+263 77 123 4567"
                            />
                          </div>
                          {formErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer Details */}
                    {formData.paymentMethod === 'bank_transfer' && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4">Bank Transfer Instructions</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium">Bank:</span> Standard Chartered Bank</p>
                          <p><span className="font-medium">Account Name:</span> Mineazy Mining Solutions</p>
                          <p><span className="font-medium">Account Number:</span> 01234567890</p>
                          <p><span className="font-medium">Branch Code:</span> 20011</p>
                          <p className="text-xs text-orange-600 mt-3">
                            Please use your order number as reference when making the transfer.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handlePreviousStep}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Back to Shipping
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Review Your Order</h2>

                  {orderError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-900">Order Failed</h4>
                        <p className="text-sm text-red-700">{orderError}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {items.map((item, index) => {
                        const product = getProductFromItem(item);
                        const unitPrice = getItemPrice(item);
                        const quantity = parseInt(item.quantity) || 1;
                        const totalPrice = quantity * unitPrice;
                        
                        return (
                          <div key={item._id || index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                            <img
                              src={product.images?.[0] || productPlaceholder}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => { e.target.src = productPlaceholder; }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                              <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${totalPrice.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                ${unitPrice.toLocaleString()} each
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Information</h3>
                    <div className="text-sm text-gray-600">
                      <p>{formData.shippingAddress.street}</p>
                      {formData.shippingAddress.suburb && <p>{formData.shippingAddress.suburb}</p>}
                      <p>{formData.shippingAddress.city}, {formData.shippingAddress.province}</p>
                      <p>{formData.shippingAddress.country} {formData.shippingAddress.postalCode}</p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                    <div className="text-sm text-gray-600">
                      <p>Method: {paymentMethods.find(m => m.id === formData.paymentMethod)?.name}</p>
                      {formData.paymentMethod === 'paynow' && formData.paymentDetails.phone && (
                        <p>Phone: {formData.paymentDetails.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handlePreviousStep}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Back to Payment
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderLoading}
                      className="bg-secondary hover:bg-secondary/90 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {orderLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Place Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((item, index) => {
                  const product = getProductFromItem(item);
                  const unitPrice = getItemPrice(item);
                  const quantity = parseInt(item.quantity) || 1;
                  const totalPrice = quantity * unitPrice;
                  
                  return (
                    <div key={item._id || index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {product.name} × {quantity}
                      </span>
                      <span className="font-medium">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${summary?.subtotal?.USD?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ${summary?.tax?.USD?.toLocaleString() || '0'}
                  </span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-secondary">
                      ${summary?.total?.USD?.toLocaleString() || '0'}
                    </div>
                    {summary?.total?.ZWG && (
                      <div className="text-sm text-gray-500 font-normal">
                        ZWG {summary.total.ZWG.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">Secure Checkout</span>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>✓ SSL encrypted transaction</p>
                  <p>✓ 256-bit security encryption</p>
                  <p>✓ PCI DSS compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
