import React from 'react';
import { CreditCard, Truck, Building2, CheckCircle } from 'lucide-react';
import paynowImage from '../../assets/paynow-image.png';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange, disabled = false }) => {
  const paymentMethods = [
    {
      id: 'paynow',
      name: 'Paynow',
      description: 'Pay online with Paynow (Cards, Mobile Money)',
      icon: CreditCard,
      logo: paynowImage,
      iconType: 'image',
      popular: true,
      features: ['Instant confirmation', 'Secure payment', 'All major cards accepted']
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay cash when your order is delivered',
      icon: Truck,
      iconType: 'icon',
      features: ['Pay on delivery', 'No upfront payment', 'Cash only']
    },
    {
      id: 'collection',
      name: 'Pay on Collection',
      description: 'Pay when you collect your items',
      icon: Building2,
      iconType: 'icon',
      features: ['Pay at store', 'Cash or card', 'Pick up in person']
    }
  ];

  return (
    <div className="space-y-4">
      {paymentMethods.map(method => (
        <label
          key={method.id}
          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
          } ${
            selectedMethod === method.id
              ? 'border-secondary bg-secondary/5 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start space-x-4">
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onMethodChange(e.target.value)}
              disabled={disabled}
              className="w-5 h-5 text-secondary border-gray-300 focus:ring-secondary/50 mt-1"
            />
            
            {/* Icon/Logo */}
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              {method.iconType === 'image' ? (
                <img 
                  src={method.logo} 
                  alt={method.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <method.icon className="w-7 h-7 text-gray-600" />
              )}
            </div>
            
            {/* Method Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900 text-lg">{method.name}</h4>
                {method.popular && (
                  <span className="bg-primary text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{method.description}</p>
              
              {/* Features */}
              <div className="space-y-1">
                {method.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected indicator */}
            {selectedMethod === method.id && (
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;