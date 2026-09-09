// src/components/Checkout/OrderSummary.jsx
import React from 'react';
import { useCart } from '../../context/CartContext';
import productPlaceholder from '../../assets/prodduct-placeholder.webp';

const OrderSummary = () => {
  const { items, summary } = useCart();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {/* Items Preview */}
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item._id} className="flex items-center space-x-3 text-sm">
            <img
              src={item.productId.images?.[0] || productPlaceholder}
              alt={item.productId.name}
              className="w-10 h-10 object-cover rounded"
              onError={(e) => { e.target.src = productPlaceholder; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {item.productId.name}
              </p>
              <p className="text-gray-500">Qty: {item.quantity}</p>
            </div>
            <span className="font-medium">
              ${item.totalPrice?.USD?.toLocaleString() || 'N/A'}
            </span>
          </div>
        ))}
      </div>
      
      {/* Summary */}
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
            <div className="text-primary">
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
  );
};

export default OrderSummary;
