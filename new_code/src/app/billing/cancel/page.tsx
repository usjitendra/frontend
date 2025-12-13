'use client'

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CancelSubscriptionPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/billing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscription
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Subscription Process Interrupted</h1>
            <p className="opacity-90 mt-1">Your subscription purchase was not completed</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-3">We noticed you didn't complete your subscription purchase</h2>
              <p className="text-gray-600 mb-4">
                You've been redirected to this page because you navigated away from the checkout process. 
                Your subscription has not been updated or purchased.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  If you encountered any issues during checkout or have questions about our subscription plans, 
                  please feel free to contact our support team.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="py-3 px-6 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Return to Subscription Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionPage;