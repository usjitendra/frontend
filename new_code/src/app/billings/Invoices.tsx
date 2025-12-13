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
import WalletSection from "./WalletSection"; // Import the wallet component
import PlanUsage from "./PlanUsage";
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

export default function Invoices() {
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

  return (
    <div>
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Invoices</CardTitle>
              <CardDescription>View and manage your invoices</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {invoicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-medium text-slate-500 px-4 py-3">
                    Invoice #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 px-4 py-3">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 px-4 py-3">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 px-4 py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 px-4 py-3">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices && invoices.length > 0 ? (
                  invoices.map((invoice, idx) => (
                    <TableRow
                      key={invoice.id || idx}
                      className="hover:bg-slate-50"
                    >
                      <TableCell className="font-medium px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-slate-400" />
                          <span className="font-mono text-sm">
                            {invoice.number || invoice.id || `INV-${idx + 1}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {formatDate(invoice.created_at)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="font-semibold">
                          {formatAmount(
                            invoice.amount_due ||
                              invoice.total ||
                              invoice.amount,
                            invoice.currency || "USD"
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            invoice.status === "paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : invoice.status === "open"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : invoice.status === "overdue"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }
                        >
                          {invoice.status === "paid" && (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          {invoice.status === "overdue" && (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {invoice.status?.charAt(0).toUpperCase() +
                            invoice.status?.slice(1) || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {invoice.invoice_pdf && (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                            </a>
                          )}
                          {invoice.hosted_invoice_url && (
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-500 py-12 px-4"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Receipt className="h-12 w-12 text-slate-300" />
                        <div>
                          <p className="font-medium">No invoices found</p>
                          <p className="text-sm text-slate-400">
                            Your invoices will appear here once generated
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
