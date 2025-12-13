"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Badge } from "@/components/ui/badge";
import {
  Download,
  Phone,
  MessageSquare,
  Mail,
  Crown,
  Check,
  AlertCircle,
  CreditCard,
  Calendar,
  Receipt,
  ArrowUpRight,
  Settings,
  X,
  Flag,
} from "lucide-react";
import Swal from "sweetalert2";

import { getBillingUsageApi } from "@/network/Api";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { AppDispatch } from "../store/store";
import { fetchBillingUsageAction } from "../store/account/action";

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatAmount(amount: number, currency: string) {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function planUsage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const companyData = useSelector((state: any) => state?.account?.companyData);
  const currentSubscriptionData = useSelector(
    (state: any) => state.account.currentSubscriptionData
  );
  const billingUsageData = useSelector(
    (state: any) => state.account.billingUsageData
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  console.log("plane usage", currentSubscriptionData);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to get currency-specific cost
  const getCurrencySpecificCost = (costObject: any, currency: string) => {
    if (!costObject) return 0;
    return costObject[currency] || costObject["usd"] || 0;
  };

  // Get current currency
  const getCurrentCurrency = () => {
    return currentSubscriptionData?.plan?.base_currency?.toLowerCase() || "usd";
  };

  // Get overage costs for current currency
  const getOverageCosts = () => {
    const features = currentSubscriptionData?.plan?.features;
    const currency = getCurrentCurrency();

    return {
      minute: getCurrencySpecificCost(features?.overage_minute_cost, currency),
      sms: getCurrencySpecificCost(features?.overage_sms_cost, currency),
      email: getCurrencySpecificCost(features?.overage_email_cost, currency),
      phoneNumber: getCurrencySpecificCost(
        features?.extra_phone_number_cost,
        currency
      ),
    };
  };

  const calculateMinutesProgress = () => {
    if (!isMounted) return 0;
    const minutesUsed = billingUsageData?.minutes || 0;
    const minutesIncluded =
      currentSubscriptionData?.plan?.features?.minutes_included || 0;
    if (!minutesUsed || !minutesIncluded) return 0;
    return Math.min(100, (minutesUsed / minutesIncluded) * 100);
  };

  const calculateSmsProgress = () => {
    if (!isMounted) return 0;
    const smsUsed = billingUsageData?.sms || 0;
    const smsIncluded =
      currentSubscriptionData?.plan?.features?.sms_included || 0;
    if (!smsUsed || !smsIncluded) return 0;
    return Math.min(100, (smsUsed / smsIncluded) * 100);
  };

  const calculateEmailsProgress = () => {
    if (!isMounted) return 0;
    const emailsUsed = billingUsageData?.email || 0;
    const emailsIncluded =
      currentSubscriptionData?.plan?.features?.emails_included || 0;
    if (!emailsUsed || !emailsIncluded) return 0;
    return Math.min(100, (emailsUsed / emailsIncluded) * 100);
  };

  // Calculate additional charges
  const calculateAdditionalCharges = () => {
    if (!isMounted) return 0;
    const features = currentSubscriptionData?.plan?.features;
    const overageCosts = getOverageCosts();

    let totalCharges = 0;

    // Minutes overage
    const minutesUsed = billingUsageData?.minutes || 0;
    const minutesIncluded = features?.minutes_included || 0;
    if (minutesUsed > minutesIncluded) {
      const overageMinutes = minutesUsed - minutesIncluded;
      totalCharges += overageMinutes * overageCosts.minute;
    }

    // SMS overage
    const smsUsed = billingUsageData?.sms || 0;
    const smsIncluded = features?.sms_included || 0;
    if (smsUsed > smsIncluded) {
      const overageSms = smsUsed - smsIncluded;
      totalCharges += overageSms * overageCosts.sms;
    }

    // Email overage
    const emailsUsed = billingUsageData?.email || 0;
    const emailsIncluded = features?.emails_included || 0;
    if (emailsUsed > emailsIncluded) {
      const overageEmails = emailsUsed - emailsIncluded;
      totalCharges += overageEmails * overageCosts.email;
    }

    return totalCharges;
  };

  const hasAdditionalCharges = () => {
    if (!isMounted) return false;
    const features = currentSubscriptionData?.plan?.features;
    const minutesUsed = billingUsageData?.minutes || 0;
    const smsUsed = billingUsageData?.sms || 0;
    const emailsUsed = billingUsageData?.email || 0;

    return (
      minutesUsed > (features?.minutes_included || 0) ||
      smsUsed > (features?.sms_included || 0) ||
      emailsUsed > (features?.emails_included || 0)
    );
  };

  const [isPay, setIsPay] = useState<boolean>(false);
  const [email, setEmail] = useState();
  const [emailCharge, setEmailCharge] = useState();
  const [minute, setMinute] = useState();
  const [minuteCharge, setMinuteCharege] = useState();
  const [sms, setSms] = useState();
  const [smsCharge, setSmsCharge] = useState();
  const [cur, setCur] = useState();

  const handelWalletBelling = async () => {
    try {
      const result = await getBillingUsageApi();
      const data = result?.data;
      const additional = result?.data?.data?.additional;
      console.log("wallet", data?.data?.is_payg);
      setIsPay(data?.data?.is_payg);
      //
      setEmail(additional?.email);
      setEmailCharge(additional?.email_charges);
      //
      setMinute(additional?.minutes);
      setMinuteCharege(additional?.minutes_charges);
      //
      setSms(additional?.sms);
      setSmsCharge(additional?.sms_charges);
      //
      setCur(additional?.currency);
    } catch (error) {}
  };

  console.log("kare", cur);

  useEffect(() => {
    handelWalletBelling();
    dispatch(fetchBillingUsageAction());
  }, []);
  return (
    <div className=" gap-6">
      <Card className="bg-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white text-blue-700 border-blue-200"
                >
                  Current Plan
                </Badge>
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {isMounted
                    ? currentSubscriptionData?.plan?.name || "Pro Plan"
                    : "Loading..."}
                </h2>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {isMounted
                    ? formatAmount(
                        currentSubscriptionData?.plan?.price,
                        currentSubscriptionData?.plan?.base_currency
                      )
                    : "$0.00"}
                  <span className="text-lg font-normal text-slate-600">
                    /month
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Next billing date:{" "}
                  {isMounted
                    ? formatDate(currentSubscriptionData?.next_billing_date)
                    : "Loading..."}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {!currentSubscriptionData?.cancel_at_period_end && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                  onClick={() => router.push("/billing")}
                >
                  <Settings className="h-4 w-4" />
                  {!currentSubscriptionData?.cancel_at_period_end
                    ? "Change Plan"
                    : "Buy Plan"}
                </Button>
              )}
              {!currentSubscriptionData?.cancel_at_period_end && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200"
                  onClick={() => {
                    setCancelDialogOpen(true);
                  }}
                >
                  <X className="h-4 w-4" />
                  Cancel Plan
                </Button>
              )}
              {currentSubscriptionData?.cancel_at_period_end && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      Plan Cancelled
                    </span>
                  </div>
                  <p className="text-sm text-red-700">
                    Your subscription will end on{" "}
                    <strong>
                      {formatDate(currentSubscriptionData?.cancel_at)}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
        {/* Call Minutes */}
        <Card className="border border-slate-200 hover:border-blue-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Call Minutes</h3>
                <p className="text-sm text-slate-600">Voice calls this month</p>
              </div>
            </div>
            <div className="space-y-4">
              {!isPay && (
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-slate-900">
                      {isMounted
                        ? (billingUsageData?.minutes || 0).toFixed(0)
                        : "0"}
                    </span>
                    <span className="text-sm text-slate-600">
                      of{" "}
                      {isMounted
                        ? (
                            currentSubscriptionData?.plan?.features
                              ?.minutes_included || 0
                          ).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                  <Progress
                    value={calculateMinutesProgress()}
                    className="h-2"
                  />

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {calculateMinutesProgress().toFixed(0)}% used
                    </span>
                    <span className="text-slate-600">
                      {isMounted
                        ? Math.max(
                            0,
                            (currentSubscriptionData?.plan?.features
                              ?.minutes_included || 0) -
                              (billingUsageData?.minutes || 0)
                          )
                        : 0}{" "}
                      remaining
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Additional Usage
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Extra
                  </Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-900">
                    {minute}
                    {/* {isMounted
                      ? Math.max(
                          0,
                          (billingUsageData?.minutes || 0) -
                            (currentSubscriptionData?.plan?.features
                              ?.minutes_included || 0)
                        )
                      : 0} */}
                  </span>
                  <span className="text-sm text-amber-600">
                    {minuteCharge}
                    {/* +
                    {isMounted
                      ? formatAmount(
                          Math.max(
                            0,
                            (billingUsageData?.minutes || 0) -
                              (currentSubscriptionData?.plan?.features
                                ?.minutes_included || 0)
                          ) * getOverageCosts().minute,
                          currentSubscriptionData?.plan?.base_currency || "USD"
                        )
                      : "$0.00"} */}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Messages */}
        <Card className="border border-slate-200 hover:border-green-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">SMS Messages</h3>
                <p className="text-sm text-slate-600">
                  Text messages this month
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {!isPay && (
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-slate-900">
                      {isMounted ? billingUsageData?.sms || 0 : 0}
                    </span>
                    <span className="text-sm text-slate-600">
                      of{" "}
                      {isMounted
                        ? (
                            currentSubscriptionData?.plan?.features
                              ?.sms_included || 0
                          ).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                  <Progress value={calculateSmsProgress()} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {calculateSmsProgress().toFixed(0)}% used
                    </span>
                    <span className="text-slate-600">
                      {isMounted
                        ? Math.max(
                            0,
                            (currentSubscriptionData?.plan?.features
                              ?.sms_included || 0) -
                              (billingUsageData?.sms || 0)
                          )
                        : 0}{" "}
                      remaining
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Additional Usage
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Extra
                  </Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-900">
                    {/* {isMounted
                      ? Math.max(
                          0,
                          (billingUsageData?.sms || 0) -
                            (currentSubscriptionData?.plan?.features
                              ?.sms_included || 0)
                        )
                      : 0} */}
                    {sms}
                  </span>
                  <span className="text-sm text-amber-600">
                    {/* +
                    {isMounted
                      ? formatAmount(
                          Math.max(
                            0,
                            (billingUsageData?.sms || 0) -
                              (currentSubscriptionData?.plan?.features
                                ?.sms_included || 0)
                          ) * getOverageCosts().sms,
                          currentSubscriptionData?.plan?.base_currency || "USD"
                        )
                      : "$0.00"} */}
                    {smsCharge}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails */}
        <Card className="border border-slate-200 hover:border-purple-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Email Messages</h3>
                <p className="text-sm text-slate-600">Emails sent this month</p>
              </div>
            </div>
            <div className="space-y-4">
              {!isPay && (
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-slate-900">
                      {isMounted ? billingUsageData?.email || 0 : 0}
                    </span>
                    <span className="text-sm text-slate-600">
                      of{" "}
                      {isMounted
                        ? (
                            currentSubscriptionData?.plan?.features
                              ?.emails_included || 0
                          ).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                  <Progress value={calculateEmailsProgress()} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {calculateEmailsProgress().toFixed(0)}% used
                    </span>
                    <span className="text-slate-600">
                      {isMounted
                        ? Math.max(
                            0,
                            (currentSubscriptionData?.plan?.features
                              ?.emails_included || 0) -
                              (billingUsageData?.email || 0)
                          )
                        : 0}{" "}
                      remaining
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Additional Usage
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Extra
                  </Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-900">
                    {/* {isMounted
                      ? Math.max(
                          0,
                          (billingUsageData?.email || 0) -
                            (currentSubscriptionData?.plan?.features
                              ?.emails_included || 0)
                        )
                      : 0} */}
                    {email}
                  </span>
                  <span className="text-sm text-amber-600">
                    {/* +
                    {isMounted
                      ? formatAmount(
                          Math.max(
                            0,
                            (billingUsageData?.email || 0) -
                              (currentSubscriptionData?.plan?.features
                                ?.emails_included || 0)
                          ) * getOverageCosts().email,
                          currentSubscriptionData?.plan?.base_currency || "USD"
                        )
                      : "$0.00"} */}
                    {emailCharge}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Additional Charges */}
      {hasAdditionalCharges() && (
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Total Additional Charges
                  </h3>
                  <p className="text-sm text-slate-600">
                    Extra usage costs this month
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {isMounted
                    ? formatAmount(
                        calculateAdditionalCharges(),
                        currentSubscriptionData?.plan?.base_currency || "USD"
                      )
                    : "$0.00"}
                </p>
                <p className="text-sm text-amber-600">Additional charges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
