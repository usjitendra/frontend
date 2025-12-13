'use client'

import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, Calendar, Clock, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSubscriptionApi } from '@/network/Api';
import { useSelector } from 'react-redux';

const SuccessSubscriptionPage = () => {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const companyData = useSelector((state: any) => state.account.companyData);
  const currentSubscriptionData = useSelector((state: any) => state.account.currentSubscriptionData);
  console.log("companyData", companyData);

  const handleGoBack = () => {
    router.push('/billing');
  };

  useEffect(() => {
    if (companyData?.subscription_status=="active"||companyData?.subscription_plan) {
        setLoading(false)
      setSubscription(companyData?.subscription_plan);
    }
  }, [companyData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-sm">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-5 text-xs"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Return to Dashboard
        </button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold">Subscription Successful!</h1>
            <p className="opacity-90 mt-1 text-sm">Thank you for subscribing to Eccentric AI</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Subscription Details</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-1">
                        <Package className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-gray-600 font-medium text-xs">Plan</span>
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        {subscription || 'NA'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-gray-600 font-medium text-xs">Plan Type</span>
                      </div>
                      <p className="text-base font-semibold text-gray-800">Monthly</p>
                    </div>
                    
                    {/* <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-gray-600 font-medium text-xs">Next Billing Date</span>
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        {formatDate(subscription?.current_period_end)}
                      </p>
                    </div> */}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h3 className="text-base font-medium text-blue-800 mb-1">What's Next?</h3>
                  <p className="text-blue-700 text-xs">
                    Your subscription is now active. You can start using all the premium features of Eccentric AI.
                    If you have any questions or need assistance, our support team is here to help.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGoBack}
                    className="py-2 px-4 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-xs"
                  >
                    Return to Subscription
                  </button>
                  <button
                    onClick={() => window.open('mailto:support@eccentricai.com')}
                    className="py-2 px-4 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                  >
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>A confirmation email has been sent to your registered email address.</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessSubscriptionPage;
