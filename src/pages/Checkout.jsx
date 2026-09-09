// src/pages/Checkout.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Truck, Shield, Check, ArrowLeft, AlertCircle, 
  User, Building2, Package, Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import productPlaceholder from '../assets/prodduct-placeholder.webp';

const API_URL = 'https://mining-equipment-backend.onrender.com/api';

const PROVINCES = [
  'Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central',
  'Mashonaland East', 'Mashonaland West', 'Masvingo',
  'Matabeleland North', 'Matabeleland South', 'Midlands'
];

const PAYMENT_METHODS = [
  {
    id: 'paynow',
    name: 'Paynow',
    description: 'Pay online with EcoCash, OneMoney, or Visa/Mastercard',
    icon: CreditCard,
    popular: true,
    note: 'You will be redirected to Paynow to complete payment'
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    description: 'Pay cash when your order is delivered',
    icon: Truck,
    note: 'Please have exact amount ready for the delivery person'
  },
  {
    id: 'collection',
    name: 'Pay on Collection',
    description: 'Pay when you collect your items',
    icon: Building2,
    note: 'Pick up from our location and pay on collection'
  }
];

const STEPS = [
  { number: 1, title: 'Information', description: 'Contact & shipping' },
  { number: 2, title: 'Payment', description: 'Payment method' },
  { number: 3, title: 'Review', description: 'Order confirmation' }
];

const Checkout = () => {
  const { items, summary, clearCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [formData, setFormData] = useState({
    customerInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '' // Always collect phone
    },
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || 'Harare',
      zipCode: user?.address?.zipCode || '',
      country: 'Zimbabwe'
    },
    paymentMethod: 'cash_on_delivery', // Default to COD (more reliable)
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!cartLoading && (!items || items.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [items, cartLoading, navigate]);

  // Helper functions
  const getProductIdFromItem = (item) => {
    const normalizeId = (value) => (typeof value === 'string' ? value.trim() : '');

    const productIdFromProductIdField =
      normalizeId(item?.productId?._id) ||
      normalizeId(item?.productId?.id) ||
      normalizeId(item?.productId);

    if (productIdFromProductIdField) return productIdFromProductIdField;

    const productIdFromProductField =
      normalizeId(item?.product?._id) ||
      normalizeId(item?.product?.id) ||
      normalizeId(item?.product);

    if (productIdFromProductField) return productIdFromProductField;

    // Never fall back to cart item _id - backend expects a real product id.
    return null;
  };

  const getProductFromItem = (item) => {
    if (item.productId && typeof item.productId === 'object') return item.productId;
    if (item.product && typeof item.product === 'object') return item.product;
    return { _id: getProductIdFromItem(item), name: 'Unknown Product' };
  };

  const getItemPrice = (item) => {
    if (typeof item.price === 'number') return item.price;
    if (item.unitPrice && typeof item.unitPrice === 'number') return item.unitPrice;
    
    const product = getProductFromItem(item);
    if (typeof product.price === 'number') return product.price;
    if (product.price?.regular_price) return product.price.regular_price;
    
    return 0;
  };

  const validateStep = (stepNumber) => {
    const errors = {};
    
    if (stepNumber === 1) {
      // For guest users - require name and email
      if (!isAuthenticated) {
        if (!formData.customerInfo.firstName.trim()) {
          errors.firstName = 'First name is required';
        }
        if (!formData.customerInfo.lastName.trim()) {
          errors.lastName = 'Last name is required';
        }
        if (!formData.customerInfo.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
          errors.email = 'Please enter a valid email address';
        }
      }
      
      // Phone is REQUIRED for ALL users
      if (!formData.customerInfo.phone.trim()) {
        errors.phone = 'Phone number is required for delivery coordination';
      } else if (formData.customerInfo.phone.trim().length < 10) {
        errors.phone = 'Please enter a valid phone number (at least 10 digits)';
      }
      
      // Address validation
      if (!formData.shippingAddress.street.trim()) {
        errors.street = 'Street address is required';
      }
      if (!formData.shippingAddress.city.trim()) {
        errors.city = 'City is required';
      }
      if (!formData.shippingAddress.state) {
        errors.state = 'Province is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return;
    
    setOrderLoading(true);
    setOrderError(null);

    try {
      // Validate cart
      if (!items || items.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Prepare order items
      const orderItems = items.map((item, index) => {
        const productId = getProductIdFromItem(item);
        const price = getItemPrice(item);
        const quantity = parseInt(item.quantity) || 1;

        if (!productId) {
          throw new Error(`Missing product reference for cart item ${index + 1}. Please refresh your cart and try again.`);
        }
        if (!price || price <= 0) {
          throw new Error(`Invalid price for item ${index + 1}`);
        }
        if (quantity < 1) {
          throw new Error(`Invalid quantity for item ${index + 1}`);
        }

        return { productId, quantity, price };
      });


      // Prepare headers
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const hasValidAuthSession = Boolean(isAuthenticated && user && token);
      let sessionId = localStorage.getItem('sessionId');

      if (isAuthenticated && user && !token) {
        throw new Error('Your login session has expired. Please sign in again to place your order.');
      }

      // Ensure guest orders always include a session id for backend cart lookup.
      if (!hasValidAuthSession && !sessionId) {
        sessionId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('sessionId', sessionId);
      }

      const headers = { 'Content-Type': 'application/json' };
      if (hasValidAuthSession) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      // Build order data
      const orderData = {
        items: orderItems,
        paymentMethod: formData.paymentMethod
      };

      if (formData.notes?.trim()) {
        orderData.notes = formData.notes.trim();
      }

      // Add customer info - REQUIRED for both authenticated and guest users
      const phone = formData.customerInfo.phone.trim();
      if (!phone) {
        throw new Error('Phone number is required. Please go back and enter your phone number.');
      }

      if (hasValidAuthSession) {
        // For authenticated users - still send customer info (backend requires it)
        orderData.customerInfo = {
          firstName: user.firstName || formData.customerInfo.firstName || 'Customer',
          lastName: user.lastName || formData.customerInfo.lastName || '',
          email: user.email || formData.customerInfo.email?.trim().toLowerCase() || '',
          phone: phone,
          address: {
            street: formData.shippingAddress.street.trim(),
            city: formData.shippingAddress.city.trim(),
            state: formData.shippingAddress.state,
            zipCode: formData.shippingAddress.zipCode.trim() || '00263',
            country: 'Zimbabwe'
          }
        };
      } else {
        // For guest users
        orderData.customerInfo = {
          firstName: formData.customerInfo.firstName.trim(),
          lastName: formData.customerInfo.lastName.trim(),
          email: formData.customerInfo.email.trim().toLowerCase(),
          phone: phone,
          address: {
            street: formData.shippingAddress.street.trim(),
            city: formData.shippingAddress.city.trim(),
            state: formData.shippingAddress.state,
            zipCode: formData.shippingAddress.zipCode.trim() || '00263',
            country: 'Zimbabwe'
          }
        };

      }

      if (!orderData.customerInfo?.email) {
        throw new Error('Email address is required to place your order.');
      }

      if (!hasValidAuthSession && sessionId) {
        orderData.sessionId = sessionId;
      }


      // Create order
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('❌ Server returned error:', responseData);

        if (response.status === 400 && responseData.errors) {
          const errorMessages = Array.isArray(responseData.errors)
            ? responseData.errors.map(err => `${err.path || 'field'}: ${err.msg || err.message}`).join(', ')
            : String(responseData.errors);
          
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(responseData.message || responseData.error || 'Failed to create order');
      }

      // Extract order from response
      let order = null;
      if (responseData.success && responseData.order) {
        order = responseData.order;
      } else if (responseData.order) {
        order = responseData.order;
      } else if (responseData.data?.order) {
        order = responseData.data.order;
      } else if (responseData.data) {
        order = responseData.data;
      } else {
        order = responseData;
      }

      if (!order || !order._id) {
        console.error('❌ Invalid order in response:', responseData);
        throw new Error('Invalid order response from server');
      }


      // Handle payment processing
  if (formData.paymentMethod === 'paynow') {
  
  try {
    const paymentResponse = await fetch(`${API_URL}/payments/paynow/initiate`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ orderId: order._id })
    });

    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      
      const redirectUrl = paymentData.redirectUrl || paymentData.data?.redirectUrl;
      
      if (redirectUrl) {
        
        // ✅ CRITICAL: Save order info for guest users
        const guestOrderInfo = {
          orderId: paymentData.orderId || order._id,
          orderNumber: paymentData.orderNumber || order.orderNumber,
          email: order.customerInfo?.email || formData.customerInfo.email,
          isGuest: order.isGuest || !hasValidAuthSession,
          paynowReference: paymentData.reference,
          timestamp: Date.now()
        };
        
        localStorage.setItem('guestOrderInfo', JSON.stringify(guestOrderInfo));
        
        await clearCart();
        localStorage.removeItem('sessionId');
        
        // Redirect to Paynow
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
        
        return;
      } else {
        console.warn('⚠️ No redirect URL in Paynow response');
        throw new Error('No redirect URL received from payment gateway');
      }
    } else {
      const errorData = await paymentResponse.json();
      console.error('❌ Paynow initiation failed:', errorData);
      throw new Error(errorData.message || 'Failed to initiate payment');
    }
  } catch (paymentError) {
    console.error('❌ Paynow error:', paymentError);
    setOrderError('Failed to initiate payment. Please try again or choose another payment method.');
    return; // Don't continue to success page
  }
} else if (formData.paymentMethod === 'cash_on_delivery') {
        try {
          await fetch(`${API_URL}/payments/cash-on-delivery`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ orderId: order._id })
          });
        } catch (codError) {
          console.warn('⚠️ COD processing error (non-critical):', codError);
        }
      } else if (formData.paymentMethod === 'collection') {
        try {
          await fetch(`${API_URL}/payments/collection`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ orderId: order._id })
          });
        } catch (collectionError) {
          console.warn('⚠️ Collection processing error (non-critical):', collectionError);
        }
      }

      // Clear cart and redirect
      await clearCart();
      localStorage.removeItem('sessionId');
      
      // Cache order for guests
      if (!hasValidAuthSession) {
        const orderCache = {
          ...order,
          items: orderItems.map((item, index) => ({
            productId: {
              _id: item.productId,
              name: items[index]?.productId?.name || items[index]?.product?.name || 'Product',
              images: items[index]?.productId?.images || items[index]?.product?.images || []
            },
            quantity: item.quantity,
            unitPrice: { USD: item.price },
            totalPrice: { USD: item.quantity * item.price }
          })),
          summary: {
            subtotal: { USD: summary?.subtotal?.USD || 0 },
            tax: { USD: summary?.tax?.USD || 0 },
            shipping: { USD: 0 },
            total: { USD: summary?.total?.USD || 0 }
          },
          shippingAddress: formData.shippingAddress,
          paymentMethod: formData.paymentMethod,
          customerInfo: formData.customerInfo
        };
        
        localStorage.setItem(`guestOrder_${order._id}`, JSON.stringify(orderCache));
        setTimeout(() => {
          localStorage.removeItem(`guestOrder_${order._id}`);
        }, 24 * 60 * 60 * 1000);
      }
      
      navigate(`/order-success/${order._id}`, { replace: true });

    } catch (error) {
      console.error('❌ Order placement failed:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.message.includes('cart') || error.message.includes('empty')) {
        errorMessage = 'Your cart is empty. Please add items to your cart.';
        setTimeout(() => navigate('/cart'), 2000);
      } else if (error.message.includes('stock')) {
        errorMessage = 'Some items are out of stock. Please review your cart.';
        setTimeout(() => navigate('/cart'), 2000);
      } else if (error.message.includes('Phone number')) {
        errorMessage = error.message;
      } else if (error.message.includes('Validation')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setOrderError(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  };

  // Render step 1
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">
        {isAuthenticated ? 'Shipping Information' : 'Contact & Shipping Information'}
      </h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isAuthenticated && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.customerInfo.firstName}
                  onChange={(e) => handleNestedInputChange('customerInfo', 'firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                    formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.customerInfo.lastName}
                  onChange={(e) => handleNestedInputChange('customerInfo', 'lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                    formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) => handleNestedInputChange('customerInfo', 'email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </>
          )}

          <div className={!isAuthenticated ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.customerInfo.phone}
              onChange={(e) => handleNestedInputChange('customerInfo', 'phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                formErrors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+263 77 123 4567"
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Required for order updates and delivery coordination
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.shippingAddress.street}
              onChange={(e) => handleNestedInputChange('shippingAddress', 'street', e.target.value)}
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
              City *
            </label>
            <input
              type="text"
              value={formData.shippingAddress.city}
              onChange={(e) => handleNestedInputChange('shippingAddress', 'city', e.target.value)}
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
              value={formData.shippingAddress.state}
              onChange={(e) => handleNestedInputChange('shippingAddress', 'state', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${
                formErrors.state ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {PROVINCES.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            {formErrors.state && (
              <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.shippingAddress.zipCode}
              onChange={(e) => handleNestedInputChange('shippingAddress', 'zipCode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
              placeholder="00263"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Instructions (Optional)
        </label>
        <textarea
          rows="3"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
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
  );

  // Render step 2
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Payment Method</h2>

      <div className="space-y-4">
        {PAYMENT_METHODS.map(method => (
          <label
            key={method.id}
            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.paymentMethod === method.id
                ? 'border-secondary bg-secondary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={formData.paymentMethod === method.id}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-5 h-5 text-secondary border-gray-300 focus:ring-secondary/50 mt-0.5"
              />
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <method.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  {method.popular && (
                    <span className="bg-primary text-secondary text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                <p className="text-xs text-gray-500 italic">{method.note}</p>
              </div>
            </div>
          </label>
        ))}
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
  );

  // Render step 3
  const renderStep3 = () => (
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

      {!isAuthenticated && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Contact Information</span>
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {formData.customerInfo.firstName} {formData.customerInfo.lastName}</p>
            <p><span className="font-medium">Email:</span> {formData.customerInfo.email}</p>
            <p><span className="font-medium">Phone:</span> {formData.customerInfo.phone}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Package className="w-4 h-4" />
          <span>Order Items ({items.length})</span>
        </h3>
        <div className="space-y-4">
          {items.map((item, index) => {
            const product = getProductFromItem(item);
            const unitPrice = getItemPrice(item);
            const quantity = parseInt(item.quantity) || 1;
            const totalPrice = quantity * unitPrice;
            
            return (
              <div key={item._id || index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white">
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
                  <p className="font-semibold text-gray-900">${totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">${unitPrice.toLocaleString()} each</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Truck className="w-4 h-4" />
          <span>Shipping Information</span>
        </h3>
        <div className="text-sm text-gray-600">
          <p>{formData.shippingAddress.street}</p>
          <p>{formData.shippingAddress.city}, {formData.shippingAddress.state}</p>
          <p>{formData.shippingAddress.country} {formData.shippingAddress.zipCode}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          {formData.paymentMethod === 'paynow' && <CreditCard className="w-4 h-4" />}
          {formData.paymentMethod === 'cash_on_delivery' && <Truck className="w-4 h-4" />}
          {formData.paymentMethod === 'collection' && <Building2 className="w-4 h-4" />}
          <span>Payment Information</span>
        </h3>
        <div className="text-sm text-gray-600">
          <p><span className="font-medium">Method:</span> {PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.name}</p>
        </div>
      </div>

      {formData.notes && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
          <p className="text-sm text-gray-600">{formData.notes}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={handlePreviousStep}
          disabled={orderLoading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
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
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>{formData.paymentMethod === 'paynow' ? 'Proceed to Payment' : 'Place Order'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render order summary
  const renderOrderSummary = () => (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        {items.slice(0, 3).map((item, index) => {
          const product = getProductFromItem(item);
          const unitPrice = getItemPrice(item);
          const quantity = parseInt(item.quantity) || 1;
          const totalPrice = quantity * unitPrice;
          
          return (
            <div key={item._id || index} className="flex justify-between text-sm">
              <span className="text-gray-600 flex-1 mr-2">
                {product.name} × {quantity}
              </span>
              <span className="font-medium whitespace-nowrap">${totalPrice.toLocaleString()}</span>
            </div>
          );
        })}
        {items.length > 3 && (
          <p className="text-xs text-gray-500 text-center py-2">
            +{items.length - 3} more items
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${summary?.subtotal?.USD?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (15.5%)</span>
          <span className="font-medium">${summary?.tax?.USD?.toLocaleString() || '0'}</span>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <div className="text-right">
            <div className="text-secondary">${summary?.total?.USD?.toLocaleString() || '0'}</div>
            {summary?.total?.ZWG && (
              <div className="text-sm text-gray-500 font-normal">ZWG {summary.total.ZWG.toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-gray-900">Secure Checkout</span>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <p>✓ SSL encrypted transaction</p>
          <p>✓ 256-bit security encryption</p>
          <p>✓ PCI DSS compliant</p>
          <p>✓ Your payment info is safe</p>
        </div>
      </div>

      {step >= 2 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            {formData.paymentMethod === 'paynow' && <CreditCard className="w-4 h-4 text-blue-600" />}
            {formData.paymentMethod === 'cash_on_delivery' && <Truck className="w-4 h-4 text-blue-600" />}
            {formData.paymentMethod === 'collection' && <Building2 className="w-4 h-4 text-blue-600" />}
            <span className="text-xs font-medium text-blue-900">
              {PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.name}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center mb-2">Need help?</p>
        <div className="flex justify-center space-x-4 text-xs">
          <a href="tel:+263712290046" className="text-secondary hover:underline">+263 712290 046</a>
          <a href="mailto:info@mineazy.co.zw" className="text-secondary hover:underline">Email Us</a>
        </div>
      </div>
    </div>
  );

  // Main render
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">
            {isAuthenticated ? 'Complete your order securely' : 'Continue as guest or sign in'}
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Already have an account?</p>
                <p className="text-xs text-blue-700">Sign in for faster checkout and order tracking</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {STEPS.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepItem.number 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepItem.number ? <Check className="w-5 h-5" /> : stepItem.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`font-medium ${step >= stepItem.number ? 'text-secondary' : 'text-gray-600'}`}>
                    {stepItem.title}
                  </div>
                  <div className="text-sm text-gray-500">{stepItem.description}</div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${step > stepItem.number ? 'bg-secondary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>
          </div>

          <div className="lg:col-span-1">
            {renderOrderSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
