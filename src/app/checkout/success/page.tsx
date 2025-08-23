'use client'

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const plan = searchParams.get('plan');

  useEffect(() => {
    // TODO: Update user's subscription status
    console.log('Payment successful for plan:', plan);
  }, [plan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome to the {plan} plan, {user?.firstName}!
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 dark:text-green-300">
            Your account has been upgraded and you now have access to all {plan} plan features.
            A confirmation email has been sent to {user?.email}.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}