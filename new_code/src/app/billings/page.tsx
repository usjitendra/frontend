"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { cancelSubscriptionApi, getStripeInvoiceApi } from "@/network/Api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AppDispatch } from "../store/store";
import {
  fetchBillingUsageAction,
  fetchCurrentSubscriptionAction,
} from "../store/account/action";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const WalletSection = dynamic(() => import("./WalletSection"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
}); // Import the wallet component

const Invoices = dynamic(
  () => import("./Invoices").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

const PlanUsage = dynamic(
  () => import("./PlanUsage").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

const SavedCardPage = dynamic(
  () => import("./recharge/SavedCard").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

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

const BillingsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const companyData = useSelector((state: any) => state?.account?.companyData);
  const currentSubscriptionData = useSelector(
    (state: any) => state.account.currentSubscriptionData
  );
  const billingUsageData = useSelector(
    (state: any) => state.account.billingUsageData
  );
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const currencyPageyogo = searchParams.get("currency");

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

  const fetchInvoices = async () => {
    setInvoicesLoading(true);
    getStripeInvoiceApi()
      .then((res) => {
        if (res.data) {
          setInvoices(res.data?.data?.invoices);
        }
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setInvoicesLoading(false);
      });
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    cancelSubscriptionApi(currentSubscriptionData?.stripe_subscription_id)
      .then((res) => {
        toast({
          title: res.data.message,
          description: "Your subscription has been cancelled",
        });
        dispatch(fetchCurrentSubscriptionAction());
        setCancelDialogOpen(false);
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setCancelLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
    dispatch(fetchBillingUsageAction());
  }, []);

  const defaultTab = tab === "wallet" || currencyPageyogo ? "wallet" : "plan";

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Billing & Usage
              </h1>
              <p className="mt-2 text-slate-600">
                Manage your subscription and monitor your usage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue={defaultTab} className="space-y-8">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <TabsTrigger
              value="plan"
              className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Plan & Usage
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="saved-card"
              className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Payment-Method
            </TabsTrigger>
          </TabsList>
          {currentSubscriptionData?.plan?.name ? (
            <TabsContent value="plan" className="space-y-6">
              {/* Current Plan Card */}
              <PlanUsage />
            </TabsContent>
          ) : (
            <TabsContent value="plan" className="space-y-6">
              {/* Current Plan Card */}
              <Card className="bg-white border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-white text-blue-700 border-blue-200"
                        >
                          Select Plan
                        </Badge>
                        <Crown className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                          Select Plan
                        </h2>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                        onClick={() => router.push("/billing")}
                      >
                        <Settings className="h-4 w-4" />
                        Select Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="invoices">
            <Invoices />
          </TabsContent>

          {/* Wallet Tab - Using the separate component */}
          <TabsContent value="wallet" className="space-y-6">
            <WalletSection />
          </TabsContent>
          <TabsContent value="saved-card" className="space-y-6">
            <SavedCardPage />
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
          <DialogHeader className="bg-blue-50 px-6 py-5 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-blue-800 mb-1">
                  Transaction Details
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  <span className="block">
                    Transaction ID:{" "}
                    <span className="font-mono text-[11px] text-slate-400">
                      {selectedTransaction?.id}
                    </span>
                  </span>
                  <span className="block">
                    Invoice ID:{" "}
                    <span className="font-mono text-[11px] text-slate-400">
                      {selectedTransaction?.invoice_id}
                    </span>
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedTransaction && (
            <div className="px-6 py-6 bg-white">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Amount Paid</div>
                  <div className="text-lg font-semibold text-green-700">
                    {formatAmount(
                      selectedTransaction.amount_paid,
                      selectedTransaction.currency
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Currency</div>
                  <div className="text-base font-medium text-slate-900 uppercase">
                    {selectedTransaction.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Payment Date
                  </div>
                  <div className="text-base font-medium text-slate-900">
                    {formatDate(selectedTransaction.payment_date)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Type</div>
                  <div className="text-base font-medium text-slate-900 capitalize">
                    {selectedTransaction.transaction_type}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold
                                          ${
                                            selectedTransaction.status ===
                                            "success"
                                              ? "bg-green-50 text-green-700"
                                              : "bg-red-50 text-red-700"
                                          }`}
                  >
                    {selectedTransaction.status === "success" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {selectedTransaction.status.charAt(0).toUpperCase() +
                      selectedTransaction.status.slice(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Period</div>
                  <div className="text-base font-medium text-slate-900">
                    {formatDate(selectedTransaction.period_start)} -{" "}
                    {formatDate(selectedTransaction.period_end)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                {selectedTransaction.invoice_pdf && (
                  <a
                    href={selectedTransaction.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </a>
                )}
                {selectedTransaction.hosted_invoice_url && (
                  <a
                    href={selectedTransaction.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View Invoice
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="bg-slate-50 px-6 py-4">
            <Button
              variant="secondary"
              onClick={() => setDetailsDialogOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Plan Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
          <DialogHeader className="bg-red-50 px-6 py-5 border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-red-800 mb-1">
                  Cancel Subscription
                </DialogTitle>
                <DialogDescription className="text-sm text-red-700">
                  Permanently cancel your subscription
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 bg-white">
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">
                  ⚠️ This action cannot be undone
                </h4>
                <ul className="text-sm text-red-700 space-y-1 ps-4">
                  <li>Your subscription will be cancelled immediately</li>
                  <li>You'll lose access to all premium features</li>
                  <li>All your data will be preserved for 30 days</li>
                  <li>No refunds will be issued for the current period</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">
                    Access Until
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Your access will end on{" "}
                  <strong>
                    {formatDate(currentSubscriptionData?.next_billing_date)}
                  </strong>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-50 px-6 py-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="flex-1"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                handleCancelSubscription();
              }}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingsPage;
