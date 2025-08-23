import React from 'react';
import { CreditCard, Building2, Smartphone, Globe } from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  supported: boolean;
  comingSoon?: boolean;
}

interface PaymentGatewaySelectorProps {
  selectedGateway: string;
  onGatewayChange: (gateway: string) => void;
  isProcessing: boolean;
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Credit/Debit Cards, Apple Pay, Google Pay',
    supported: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Building2 className="w-6 h-6" />,
    description: 'PayPal Balance, Bank Account, Cards',
    supported: true,
    comingSoon: true
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: <Globe className="w-6 h-6" />,
    description: 'Bitcoin, Ethereum, TON, USDT',
    supported: true,
    comingSoon: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: <Building2 className="w-6 h-6" />,
    description: 'Direct bank transfer, Wire transfer',
    supported: true,
    comingSoon: true
  }
];

const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  selectedGateway,
  onGatewayChange,
  isProcessing
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Payment Method
      </h3>
      
      <div className="space-y-3">
        {PAYMENT_GATEWAYS.map((gateway) => (
          <div
            key={gateway.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedGateway === gateway.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            } ${
              gateway.comingSoon || isProcessing
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={() => {
              if (!gateway.comingSoon && !isProcessing) {
                onGatewayChange(gateway.id);
              }
            }}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-4 ${
                selectedGateway === gateway.id
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {gateway.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {gateway.name}
                  </h4>
                  {gateway.comingSoon && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {gateway.description}
                </p>
              </div>
              
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedGateway === gateway.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {selectedGateway === gateway.id && (
                  <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Stripe Payment Form (when Stripe is selected) */}
      {selectedGateway === 'stripe' && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <h4 className="font-medium mb-4 text-slate-900 dark:text-white">
            Card Information
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  disabled={isProcessing}
                />
                <div className="absolute right-3 top-3 flex space-x-1">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name on Card
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            * This is a demo interface. In production, card details would be handled securely by Stripe.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewaySelector;