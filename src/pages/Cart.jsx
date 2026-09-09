// src/pages/Cart.jsx - Updated with Guest Checkout Support
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import Loading from '../components/Common/Loading';
import aboutBanner from '../assets/about-us-banner-mineazy.webp';
import productPlaceholder from '../assets/prodduct-placeholder.webp';

const Cart = () => {
  const { 
    items, 
    summary, 
    loading, 
    error, 
    updateItem, 
    removeItem, 
    clearCart,
    incrementItem,
    decrementItem
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const { selectedBranch } = useBranch();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Helper functions remain the same
  const getProductFromItem = (item) => {
    if (!item) return null;
    if (item.productId && typeof item.productId === 'object') {
      return item.productId;
    } else if (item.product && typeof item.product === 'object') {
      return item.product;
    }
    return {
      _id: item.productId || item.product,
      name: item.name || 'Unknown Product',
      images: item.images || [],
      sku: item.sku || '',
    };
  };

  const getItemId = (item) => {
    return item._id || item.id;
  };

  const getUnitPrice = (item) => {
    if (item.price && typeof item.price === 'number') return item.price;
    if (item.unitPrice && typeof item.unitPrice === 'number') return item.unitPrice;
    const product = getProductFromItem(item);
    if (product?.price && typeof product.price === 'number') return product.price;
    if (product?.salePrice) return product.salePrice;
    return 0;
  };

  const getTotalPrice = (item) => {
    const quantity = parseInt(item.quantity) || 0;
    const unitPrice = getUnitPrice(item);
    return quantity * unitPrice;
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 0) return;
    
    const itemId = getItemId(item);
    if (!itemId) return;

    const product = getProductFromItem(item);
    const maxStock = product?.stockQuantity || product?.stock || 999;
    
    if (newQuantity > maxStock) {
      alert(`Maximum available quantity is ${maxStock}`);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const result = await updateItem(itemId, newQuantity);
      if (!result.success) {
        alert(result.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleIncrement = async (item) => {
    const itemId = getItemId(item);
    if (!itemId) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const result = await incrementItem(itemId);
      if (!result.success) {
        alert(result.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to increment:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleDecrement = async (item) => {
    const itemId = getItemId(item);
    if (!itemId) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const result = await decrementItem(itemId);
      if (!result.success) {
        alert(result.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to decrement:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (item) => {
    const itemId = getItemId(item);
    const product = getProductFromItem(item);
    
    if (!itemId) return;

    if (!window.confirm(`Remove "${product.name}" from your cart?`)) {
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const result = await removeItem(itemId);
      if (!result.success) {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Remove all items from your cart? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await clearCart();
      if (!result.success) {
        alert(result.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  // NEW: Handle checkout - supports both guest and authenticated users
  const handleCheckout = () => {
    // No authentication check - allow guest checkout
    navigate('/checkout');
  };

  if (loading && (!items || items.length === 0)) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Loading size="lg" text="Loading your cart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Cart</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-16 lg:pb-20 bg-gradient-to-br from-secondary/90 to-secondary text-white">
        <div className="absolute inset-0">
          <img
            src={aboutBanner}
            alt="Shopping Cart"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/80"></div>
        </div>
        
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            Your Shopping Cart
          </h1>
          <p className="text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto">
            Review your selected mining equipment and proceed to checkout
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <p className="text-gray-600 text-sm md:text-base">
            {!items || items.length === 0
              ? 'Your cart is empty'
              : `${items.length} item${items.length > 1 ? 's' : ''} in your cart`
            }
          </p>
          <Link
            to="/shop"
            className="btn-outline flex items-center space-x-2 text-sm md:text-base py-2 px-4 md:py-3 md:px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {!items || items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start shopping to add products to your cart. We have a wide selection of mining equipment available.
            </p>
            
            <Link to="/shop" className="btn-primary text-lg px-8 py-3">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Branch Info */}
              {selectedBranch && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Selected Branch:</span> {selectedBranch.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Prices and availability shown for this location
                  </p>
                </div>
              )}

              {/* Cart Items List */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Items in Cart</h2>
                    {items.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        disabled={loading}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Clearing...' : 'Clear All'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {items.map((item, index) => {
                      const product = getProductFromItem(item);
                      const itemId = getItemId(item);
                      const isUpdating = updatingItems.has(itemId);
                      const unitPrice = getUnitPrice(item);
                      const totalPrice = getTotalPrice(item);
                      const quantity = parseInt(item.quantity) || 0;
                      
                      return (
                        <div
                          key={item._id || index}
                          className={`cart-item p-3 md:p-4 border border-gray-200 rounded-lg transition-opacity ${
                            isUpdating ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Top row: image + name + delete */}
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.images?.[0] || productPlaceholder}
                                alt={product.name || 'Product'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => { e.target.src = productPlaceholder; }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/product/${product._id}`}
                                className="text-sm md:text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                              >
                                {product.name || 'Unknown Product'}
                              </Link>
                              <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku || 'N/A'}</p>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item)}
                              disabled={isUpdating}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                              aria-label="Remove item"
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                              )}
                            </button>
                          </div>

                          {/* Bottom row: qty controls + price */}
                          <div className="flex items-center justify-between mt-3 pl-0 md:pl-0">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleDecrement(item)}
                                disabled={quantity <= 1 || isUpdating}
                                className="p-1.5 md:p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                              </button>
                              <span className="px-3 py-1.5 text-center font-medium min-w-[2.5rem] flex items-center justify-center text-sm md:text-base">
                                {isUpdating ? (
                                  <div className="w-3 h-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                ) : quantity}
                              </span>
                              <button
                                onClick={() => handleIncrement(item)}
                                disabled={isUpdating}
                                className="p-1.5 md:p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-base md:text-lg font-semibold text-gray-900">
                                ${totalPrice.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">${unitPrice.toLocaleString()} each</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Order Summary</h2>
                    <div className="bg-white/20 rounded-full px-3 py-1">
                      <span className="text-sm font-medium">
                        {items?.length || 0} {items?.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Price Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Price Breakdown
                    </h3>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Subtotal</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(summary?.subtotal?.USD || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Tax (15.5%)</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(summary?.tax?.USD || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Shipping</span>
                      </div>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>

                    <div className="border-t-2 border-gray-200 my-4"></div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-secondary">
                            ${(summary?.total?.USD || 0).toLocaleString()}
                          </div>
                          {summary?.total?.ZWG && (
                            <div className="text-sm text-gray-500 font-medium mt-1">
                              ≈ ZWG {summary.total.ZWG.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white text-center text-lg font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Proceed to Checkout</span>
                    </button>
                    
                    {/* Guest Checkout Notice */}
                    {!isAuthenticated && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">
                          Continue as guest or{' '}
                          <Link to="/login" className="text-secondary font-medium hover:underline">
                            sign in
                          </Link>
                        </p>
                      </div>
                    )}
                    
                    <Link
                      to="/shop"
                      className="w-full bg-white border-2 border-gray-200 hover:border-secondary text-gray-700 hover:text-secondary text-center font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-50 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      <span>Continue Shopping</span>
                    </Link>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900">SSL SECURED CHECKOUT</p>
                        <p className="text-xs text-gray-600">Your information is protected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
