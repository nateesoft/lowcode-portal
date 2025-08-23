import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Crown, Zap, Star } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { UserTier } from '@/lib/types';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserTier;
}

const PLAN_FEATURES = {
  Junior: {
    icon: <Star className="w-6 h-6" />,
    color: 'bg-slate-500',
    features: ['1 Project', '3 Exports/month', 'Up to 20 nodes', 'Community Support']
  },
  Senior: {
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-blue-500',
    features: ['5 Projects', '20 Exports/month', 'Up to 100 nodes', 'Email Support', 'Advanced Templates']
  },
  Specialist: {
    icon: <Crown className="w-6 h-6" />,
    color: 'bg-purple-500',
    features: ['Unlimited Projects', 'Unlimited Exports', 'Unlimited Nodes', 'Priority Support', 'All Templates', 'Custom Integrations', 'White-label Options']
  }
};

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier
}) => {
  const router = useRouter();
  const { getPricing } = useCurrency();
  const pricing = getPricing();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleUpgrade = (planName: string) => {
    if (planName === currentTier) {
      onClose();
      return;
    }
    
    router.push(`/checkout?plan=${planName}&billing=${billingCycle}`);
    onClose();
  };

  const getUpgradeButtonText = (planName: string) => {
    if (planName === currentTier) return 'Current Plan';
    
    const tierOrder = { Junior: 0, Senior: 1, Specialist: 2 };
    const currentOrder = tierOrder[currentTier];
    const targetOrder = tierOrder[planName as keyof typeof tierOrder];
    
    if (targetOrder < currentOrder) return 'Downgrade';
    return 'Upgrade Now';
  };

  const isDowngrade = (planName: string) => {
    const tierOrder = { Junior: 0, Senior: 1, Specialist: 2 };
    const currentOrder = tierOrder[currentTier];
    const targetOrder = tierOrder[planName as keyof typeof tierOrder];
    return targetOrder < currentOrder;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Currently on <span className="font-medium text-slate-900 dark:text-white">{currentTier}</span> plan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Annual</span>
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {(['Junior', 'Senior', 'Specialist'] as const).map((planName, index) => {
              const plan = PLAN_FEATURES[planName];
              const isCurrentPlan = planName === currentTier;
              const isPremium = index === 1; // Senior plan is premium
              
              return (
                <div
                  key={planName}
                  className={`relative bg-white dark:bg-slate-800 rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                    isCurrentPlan 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : isPremium 
                        ? 'border-purple-500 ring-2 ring-purple-500/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Popular Badge for Senior */}
                  {isPremium && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${plan.color} text-white mb-4`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {planName}
                    </h3>
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      {planName === 'Junior' ? (
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          Free
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {(() => {
                            const planPricing = pricing[planName as keyof typeof pricing];
                            const monthlyPrice = parseInt(planPricing?.monthly?.replace(/[^0-9]/g, '') || '0');
                            
                            return billingCycle === 'yearly' ? (
                              <>
                                ${Math.round(monthlyPrice * 12 * 0.8)}
                                <div className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                                  per year
                                </div>
                              </>
                            ) : (
                              <>
                                ${monthlyPrice}
                                <div className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                                  per month
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpgrade(planName)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      isCurrentPlan
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : isDowngrade(planName)
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          : isPremium
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {getUpgradeButtonText(planName)}
                  </button>
                </div>
              );
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">
              Need help choosing?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start with the Junior plan to explore our platform, then upgrade as your needs grow. 
              All plans come with a 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;