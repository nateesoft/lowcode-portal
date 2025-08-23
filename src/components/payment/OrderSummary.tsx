import React from 'react';
import { Check, Tag } from 'lucide-react';
import { PlanDetails } from '@/components/pages/CheckoutPage';

interface OrderSummaryProps {
  plan: PlanDetails;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ plan }) => {
  const basePrice = plan.billing === 'yearly' ? plan.price / 0.8 : plan.price; // Reverse calculate base price
  const discount = plan.billing === 'yearly' ? basePrice * 0.2 : 0;
  const tax = 0; // Could be calculated based on location
  const total = plan.price;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/20 h-fit">
      <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
        Order Summary
      </h3>
      
      {/* Plan Details */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            {plan.name} Plan
          </h4>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
            {plan.billing === 'yearly' ? 'Annual' : 'Monthly'}
          </span>
        </div>
        
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pricing Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{plan.name} Plan ({plan.billing})</span>
          <span>${plan.billing === 'yearly' ? Math.round(basePrice) : plan.price}</span>
        </div>
        
        {plan.billing === 'yearly' && discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              <span>Annual Discount (20%)</span>
            </div>
            <span>-${Math.round(discount)}</span>
          </div>
        )}
        
        {tax > 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Tax</span>
            <span>${tax}</span>
          </div>
        )}
        
        <hr className="border-slate-200 dark:border-slate-700" />
        
        <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
          <span>Total</span>
          <span>${total} {plan.billing === 'yearly' ? '/year' : '/month'}</span>
        </div>
      </div>
      
      {/* Money Back Guarantee */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-2 mr-3 flex-shrink-0">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h5 className="font-medium text-green-800 dark:text-green-300 mb-1">
              30-Day Money Back Guarantee
            </h5>
            <p className="text-sm text-green-700 dark:text-green-400">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </div>
      </div>
      
      {/* Benefits */}
      <div className="space-y-3">
        <h5 className="font-medium text-slate-900 dark:text-white">What you get:</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Check className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            <span>Instant access to all features</span>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Check className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            <span>24/7 customer support</span>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Check className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            <span>Regular updates & new features</span>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Check className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
      
      {plan.billing === 'yearly' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <Tag className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                You're saving ${Math.round(discount)} with annual billing!
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                That's {Math.round((discount / (basePrice * 12)) * 100)}% off compared to monthly
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;