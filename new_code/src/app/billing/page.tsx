"use client";

import React, { useEffect, useState } from "react";
import { Check, Plane } from "lucide-react";
import {
  getBillingCheckoutApi,
  getBillingPlanApi,
  upgradeSubscriptionApi,
} from "@/network/Api";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { fetchCurrentSubscriptionAction } from "@/app/store/account/action";
import { AppDispatch } from "@/app/store/store";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Elsie } from "next/font/google";

type PlanType = {
  key: string;
  value: number;
};

const SubscriptionPage = () => {
  const [activePlan, setActivePlan] = useState("growth");
  const [activeTab, setActiveTab] = useState("appointment");
  const [selectedCurrency, setSelectedCurrency] = useState("CAD");
  const [plans, setPlans] = useState([]);
  const companyData = useSelector((state: any) => state.account.companyData);
  const currentSubscriptionData = useSelector(
    (state: any) => state.account.currentSubscriptionData
  );
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handlePlanClick = (plan: string) => {
    setActivePlan(plan);
  };

  const handleCurrencySwitch = (currency: string) => {
    setSelectedCurrency(currency);
  };

  const fetchSubscription = async () => {
    getBillingPlanApi()
      .then((res) => {
        if (res?.data) {
          if (res.data?.data && Array.isArray(res.data?.data)) {
            setPlans(res.data.data);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCheckout = (plan: any) => {
    setLoadingPlanId(plan.id);
    console.log("palne h bhai ??..", plan.id);
    console.log(
      "currentSubscriptionData?.plan",
      currentSubscriptionData?.plan?.name
    );
    if (
      !currentSubscriptionData?.plan ||
      currentSubscriptionData?.plan?.name === "Pay As You Go"
    ) {
      let checkoutUrl = "";
      getBillingCheckoutApi(plan.id, selectedCurrency.toLowerCase())
        .then((res: any) => {
          if (res?.data) {
            setLoadingPlanId(null);
            console.log("res.data.data", res.data);
            checkoutUrl = res.data.checkout_url;
            if (checkoutUrl) {
              window.location.href = checkoutUrl;
            }
          }
        })
        .catch((err) => {
          setLoadingPlanId(null);
          toast({
            title: "Error",
            description: err.message,
            variant: "default",
          });
        });
      return;
    }

    const subscriptionId = currentSubscriptionData?.stripe_subscription_id;

    if (!subscriptionId) {
      console.log("Subscription ID not found");
      setLoadingPlanId(null);
      return;
    }
    const payload = {
      new_plan_id: plan.id,
    };
    upgradeSubscriptionApi(subscriptionId, payload)
      .then((res: any) => {
        setLoadingPlanId(null);
        if (res?.data) {
          dispatch(fetchCurrentSubscriptionAction());
          toast({
            title: res.data.message,
            description: "You can now use the new plan",
          });
        }
      })
      .catch((err) => {
        setLoadingPlanId(null);
        console.log("Error updating subscription:", err);
        alert("Failed to update subscription. Please try again.");
      });
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (companyData?.subscription_plan) {
      setActivePlan(companyData.subscription_plan.toLowerCase());
    }
  }, [companyData]);

  const isCurrentPlan = (plan: any) => {
    return currentSubscriptionData?.plan?.id === plan.id;
  };
  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Get price in selected currency
  const getPriceInSelectedCurrency = (plan: any) => {
    const currency = selectedCurrency.toLowerCase();

    // If the plan has currency_options for the selected currency, use it
    if (plan.currency_options && plan.currency_options[currency]) {
      return plan.currency_options[currency];
    }

    // Fallback to base currency price
    return plan.price;
  };

  // Get overage costs in selected currency
  const getOverageCostInSelectedCurrency = (
    overageCosts: any,
    type: string
  ) => {
    const currency = selectedCurrency.toLowerCase();

    if (overageCosts && overageCosts[currency]) {
      return overageCosts[currency];
    }

    // Fallback to USD if available
    return overageCosts?.usd || 0;
  };

  // Sort plans by price (lowest to highest)
  const getSortedPlans = () => {
    if (!plans || plans.length === 0) return [];

    return [...plans].sort((a, b) => {
      const priceA = getPriceInSelectedCurrency(a);
      const priceB = getPriceInSelectedCurrency(b);
      return priceA - priceB;
    });
  };

  const sortedPlans = getSortedPlans();
  const renderPlanCard = (plan: any, index: number) => {
    const planName = plan.name.toLowerCase();
    const isActive = activePlan === planName;
    const isCurrent = isCurrentPlan(plan);
    const isPopular = planName === "growth";
    const priceInSelectedCurrency = getPriceInSelectedCurrency(plan);

    // Determine button text and action based on current subscription
    const getButtonConfig = () => {
      if (isCurrent) {
        return { text: "Current Plan", disabled: true, action: null };
      }

      if (!currentSubscriptionData?.plan) {
        return {
          text: isActive ? "Subscribe Now" : "Select Plan",
          disabled: false,
          action: () => handleCheckout(plan),
        };
      }

      // User has a subscription, determine if this is an upgrade or downgrade
      const currentPrice = currentSubscriptionData.plan.price;
      const targetPrice = plan.price;

      if (targetPrice > currentPrice) {
        return {
          text: "Upgrade",
          disabled: false,
          action: () => handleCheckout(plan),
        };
      } else if (targetPrice < currentPrice) {
        return {
          text: "Downgrade",
          disabled: false,
          action: () => handleCheckout(plan),
        };
      } else {
        // Same price, different plan
        return {
          text: "Switch Plan",
          disabled: false,
          action: () => handleCheckout(plan),
        };
      }
    };

    const handlePayAsYouGo = (Plane: any) => {
      router.push(`/billings?currency=${selectedCurrency}`);
    };

    const buttonConfig = getButtonConfig();

    return (
      <div
        key={plan.id}
        className={`rounded-2xl shadow-lg p-8 relative transition-all duration-300 ${
          isActive
            ? "border-2 border-indigo-500 transform scale-105 bg-white"
            : "bg-white hover:shadow-xl cursor-pointer"
        }`}
        onClick={() => handlePlanClick(planName)}
      >
        {isActive && isPopular && (
          <div className="absolute -top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Popular
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
          <p className="text-gray-500 mt-2">
            {plan.description ||
              `For ${
                planName === "essential"
                  ? "small"
                  : planName === "growth"
                  ? "growing"
                  : "enterprise"
              } businesses`}
          </p>
          {isCurrent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              Current Plan
            </span>
          )}
        </div>

        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-extrabold text-gray-900">
            {formatCurrency(priceInSelectedCurrency, selectedCurrency)}
          </span>
          <span className="ml-1 text-xl font-medium text-gray-500">
            /{plan.billing_cycle}
          </span>
        </div>

        <ul className="space-y-4 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>{plan.features.minutes_included} Minutes</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>{plan.features.sms_included} SMS Messages</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>{plan.features.emails_included} Email Notifications</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              {formatCurrency(
                getOverageCostInSelectedCurrency(
                  plan.features.overage_minute_cost,
                  "minute"
                ),
                selectedCurrency
              )}
              /Additional Minute
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              {formatCurrency(
                getOverageCostInSelectedCurrency(
                  plan.features.overage_sms_cost,
                  "sms"
                ),
                selectedCurrency
              )}
              /Additional SMS
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              {formatCurrency(
                getOverageCostInSelectedCurrency(
                  plan.features.overage_email_cost,
                  "email"
                ),
                selectedCurrency
              )}
              /Additional Email
            </span>
          </li>
          {/* <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Toll Free Number: {formatCurrency(getOverageCostInSelectedCurrency(plan.features.extra_phone_number_cost, 'phone'), selectedCurrency)}/month</span>
          </li> */}
        </ul>

        <Button
          className={`w-full py-3 px-4 rounded-lg font-medium transition ${
            isActive
              ? buttonConfig.disabled
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : buttonConfig.text === "Upgrade"
                ? "bg-green-600 text-white hover:bg-green-700"
                : buttonConfig.text === "Downgrade"
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => {
            if (plan.name === "Pay As You Go") {
              handlePayAsYouGo(plan);
            } else if (!buttonConfig.disabled && buttonConfig.action) {
              buttonConfig.action();
            }
          }}
          disabled={buttonConfig.disabled || loadingPlanId === plan.id}
        >
          {loadingPlanId === plan.id ? "Loading..." : buttonConfig.text}
        </Button>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Eccentric AI
            </span>{" "}
            Subscription Plans
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Choose the perfect plan for your business needs with our flexible
            AI-powered solutions.
          </p>
        </div>

        {/* Currency Switch */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-gray-200 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedCurrency === "USD"
                  ? "bg-white shadow-md text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleCurrencySwitch("USD")}
            >
              USD ($)
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedCurrency === "CAD"
                  ? "bg-white shadow-md text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleCurrencySwitch("CAD")}
            >
              CAD ($)
            </button>
          </div>
        </div>
        {/* Plans Display */}
        <div className="space-y-12">
          {activeTab === "appointment" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {sortedPlans.length > 0 ? (
                sortedPlans.map((plan, index) => renderPlanCard(plan, index))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">Loading subscription plans...</p>
                </div>
              )}
              {/* add wallate */}
            </div>
          )}

          {activeTab === "integration" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Third Party Integration Plans
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect with your favorite platforms seamlessly.
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Provider
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Essential
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Growth
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Premium
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Avaros
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          OceanMD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Accuro
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Contact Sales
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chatbot" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Chatbot Essential Plan */}
              <div className="rounded-2xl shadow-lg p-8 bg-white hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Essential Chatbot
                  </h3>
                  <p className="text-gray-500 mt-2">Basic AI assistance</p>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {selectedCurrency === "USD" ? "$59" : "$79"}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500">
                    /month
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>300,000 Tokens/Month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedCurrency === "USD" ? "$0.10" : "$0.13"} per
                      Additional 750 words
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Basic customization</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition">
                  Select Plan
                </button>
              </div>

              {/* Chatbot Growth Plan */}
              <div className="rounded-2xl shadow-lg p-8 bg-white hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Growth Chatbot
                  </h3>
                  <p className="text-gray-500 mt-2">Enhanced AI capabilities</p>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {selectedCurrency === "USD" ? "$179" : "$239"}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500">
                    /month
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>900,000 Tokens/Month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedCurrency === "USD" ? "$0.10" : "$0.13"} per
                      Additional 750 words
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Advanced customization</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition">
                  Select Plan
                </button>
              </div>

              {/* Chatbot Premium Plan */}
              <div className="rounded-2xl shadow-lg p-8 bg-white hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Premium Chatbot
                  </h3>
                  <p className="text-gray-500 mt-2">Enterprise AI solution</p>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {selectedCurrency === "USD" ? "$599" : "$799"}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500">
                    /month
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>3,000,000 Tokens/Month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {selectedCurrency === "USD" ? "$0.10" : "$0.13"} per
                      Additional 750 words
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Full enterprise customization</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition">
                  Select Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What's included in each plan?
              </h3>
              <p className="text-gray-600">
                Each plan includes the specified number of minutes, SMS
                messages, and email notifications. Additional resources can be
                purchased at the rates shown.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be applied at the start of your next billing cycle.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How do third-party integrations work?
              </h3>
              <p className="text-gray-600">
                Third-party integrations allow you to connect your Eccentric AI
                services with other platforms. Contact our sales team for custom
                pricing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What happens if I exceed my monthly limits?
              </h3>
              <p className="text-gray-600">
                If you exceed your monthly allocation, you'll be charged at the
                additional rates specified in your plan. You'll never be cut off
                unexpectedly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
