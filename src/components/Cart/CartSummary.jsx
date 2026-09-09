/ src/components/Cart/CartSummary.jsx
import React from 'react';
import { Truck, Shield, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartSummary = ({ showActions = true, compact = false }) => {
  const { summary, loading } = useCart();
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            ${summary?.subtotal?.USD?.toLocaleString() || '0.00'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">
            ${summary?.tax?.USD?.toLocaleString() || '0.00'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <div className="text-right">
            <div className="text-primary">
              ${summary?.total?.USD?.toLocaleString() || '0.00'}
            </div>
            {summary?.total?.ZWG && (
              <div className="text-sm text-gray-500 font-normal">
                ZWG {summary.total.ZWG.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="space-y-3">
          <a
            href="/checkout"
            className="w-full btn-primary text-center text-lg py-3 block"
          >
            Proceed to Checkout
          </a>
          
          <a
            href="/shop"
            className="w-full btn-outline text-center block"
          >
            Continue Shopping
          </a>
        </div>
      )}
      
      {!compact && (
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Free shipping on all orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>30-day return policy</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
