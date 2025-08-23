import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, CreditCard, Shield } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import PaymentGatewaySelector from '@/components/payment/PaymentGatewaySelector';
import OrderSummary from '@/components/payment/OrderSummary';
import { useAuth } from '@/contexts/AuthContext';

export interface PlanDetails {
  name: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly';
  features: string[];
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { getPricing } = useCurrency();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>('stripe');
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);

  // Extract plan details from URL parameters
  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing') as 'monthly' | 'yearly' || 'monthly';
    
    if (plan && ['Senior', 'Specialist'].includes(plan)) {
      const pricing = getPricing();
      const planPricing = pricing[plan as keyof typeof pricing];
      
      // Extract numeric value from pricing string (e.g., "$29" -> 29)
      const monthlyPrice = parseInt(planPricing?.monthly?.replace(/[^0-9]/g, '') || '0');
      
      const planData = {
        name: plan,
        price: billing === 'yearly' 
          ? Math.round(monthlyPrice * 12 * 0.8) // 20% discount for yearly
          : monthlyPrice,
        currency: 'USD', // This should come from currency context
        billing,
        features: getFeaturesByPlan(plan)
      };
      setPlanDetails(planData);
    } else {
      // Invalid plan, redirect back
      router.push('/landing');
    }
  }, [searchParams, getPricing, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout&' + searchParams.toString());
    }
  }, [isAuthenticated, router, searchParams]);

  const getFeaturesByPlan = (plan: string): string[] => {
    const features = {
      Senior: [
        '5 Projects',
        '20 Exports per month',
        'Up to 100 nodes',
        'Email Support',
        'Advanced Templates'
      ],
      Specialist: [
        'Unlimited Projects',
        'Unlimited Exports',
        'Unlimited Nodes',
        'Priority Support',
        'All Templates',
        'Custom Integrations',
        'White-label Options'
      ]
    };
    return features[plan as keyof typeof features] || [];
  };

  const handlePayment = async () => {
    if (!planDetails || !user) return;

    setIsProcessing(true);
    try {
      // TODO: Integrate with actual payment processor
      await simulatePayment(selectedGateway, planDetails);
      
      // Redirect to success page
      router.push('/checkout/success?plan=' + planDetails.name);
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle payment error
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = async (gateway: string, plan: PlanDetails): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // TODO: Replace with actual payment gateway integration
    console.log('Processing payment:', { gateway, plan, user: user?.email });
    
    // Simulate random success/failure for demo
    if (Math.random() > 0.1) { // 90% success rate
      return Promise.resolve();
    } else {
      throw new Error('Payment failed');
    }
  };

  if (!planDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Complete Your Purchase
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Payment Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/20">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-green-600 mr-2" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Secure Checkout
              </span>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                Billing Information
              </h3>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-900 dark:text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Payment Gateway Selector */}
            <PaymentGatewaySelector
              selectedGateway={selectedGateway}
              onGatewayChange={setSelectedGateway}
              isProcessing={isProcessing}
            />

            {/* Security Notice */}
            <div className="mt-6 flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Your payment is secure</p>
                <p>We use industry-standard encryption to protect your payment information.</p>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ${planDetails.price} {planDetails.billing === 'yearly' ? '/year' : '/month'}
                </>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <OrderSummary plan={planDetails} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;