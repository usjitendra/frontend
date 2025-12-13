"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Banknote, Check, CreditCard, Loader2, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getWalletBalanceApi,
  walletHistory,
  saveCardApi,
  deleteCardApi,
  defaultCardApi,
  AutoReLoadApi,
} from "@/network/Api";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  is_default: boolean;
}
import Swal from "sweetalert2";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const autoReloadSchema = z
  .object({
    autoReloadEnabled: z.boolean(),

    autoReloadThreshold: z
      .number()
      .min(10, "Minimum 10 minutes required")
      .optional(),

    autoReloadAmount: z.number().min(50, "Minimum amount is 50").optional(),
  })
  .refine(
    (data) => {
      if (data.autoReloadEnabled) {
        return data.autoReloadAmount && data.autoReloadThreshold;
      }
      return true;
    },
    {
      message: "Both fields are required when auto reload is enabled",
      path: ["autoReloadAmount"],
    }
  );

const WalletPage: React.FC = () => {
  const router = useRouter();
  const [walletTransactions, setWalletTransactions] = useState<any | []>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<"USD" | "CAD">("USD");
  const [checked, setCheck] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    resolver: zodResolver(autoReloadSchema),
    mode: "onChange",
    defaultValues: {
      autoReloadEnabled: false,
      autoReloadThreshold: undefined,
      autoReloadAmount: undefined,
    },
  });

  const autoReloadEnabled = watch("autoReloadEnabled");

  const getTransactionHistory = async () => {
    try {
      setLoadingApi(true);
      const result = await walletHistory();
      const autoReload = result?.data?.data?.auto_reload;
      const cur = result?.data?.data?.wallet?.currency;
      // if (autoReload?.auto_reload_enabled) {
      //   setCheck(true);
      // } else {
      //   setCheck(false);
      // }

      if (cur) setCurrency(cur.toUpperCase());
      setValue("autoReloadEnabled", autoReload?.auto_reload_enabled ?? false);
      setValue("autoReloadThreshold", autoReload?.auto_reload_threshold ?? 10);
      setValue("autoReloadAmount", autoReload?.reload_amount ?? 50);
      setWalletBalance(result?.data?.data?.wallet?.balance_amount);

      const transactions = result?.data?.data?.transactions;
      if (transactions?.length > 0) {
        const transactionHistory = transactions.map((t: any) => ({
          amount: t.amount,
          date: new Date(t.created_at).toLocaleDateString(),
        }));
        setWalletTransactions(transactionHistory);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingApi(false);
    }
  };

  useEffect(() => {
    getTransactionHistory();
  }, []);

  const formatCurrency = (amount: number) => {
    if (currency === "USD") return `$${amount}`;
    if (currency === "CAD") return `CA$ ${amount}`;
    return `$${amount}`;
  };

  const handleLoadWallet = () => {
    router.push("/billings/recharge");
  };

  const [loadingWallet, setLoadingWallet] = useState(false);
  // Auto reload
  const onSubmit = async (data: any) => {
    console.log("this is ");
    try {
      const payload = {
        enabled: data.autoReloadEnabled,
        threshold_minutes: data.autoReloadThreshold,
        reload_amount: data.autoReloadAmount,
      };
      const actionText = data.autoReloadEnabled
        ? "enable auto-reload"
        : "disable auto-reload";
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: `Do you really want to ${actionText}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#ef4444",
      });
      if (!confirm.isConfirmed) return;
      setLoadingWallet(true);
      console.log("Auto Reload Settings payload:", payload);

      const result = await AutoReLoadApi(payload);

      console.log("this is auto reload", result?.data);
      getTransactionHistory();
      if (result.data.success) {
        toast({
          title: "Success",
          description: result?.data?.message || result.data.data.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || error.detail,
        variant: "destructive",
      });
    } finally {
      setLoadingWallet(false);
    }
  };

  if (loadingApi) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-6">
        {/* LEFT: Wallet Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 flex flex-col">
          <div className="p-8 flex flex-col h-full">
            {/* HEADER → ICON + TITLE */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br bg-blue-500  rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
                {/* <img src="/Frame.svg" alt="Frame" className=" w-6 h-6" /> */}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Wallet Balance
              </h3>
            </div>

            {/* TOTAL BALANCE */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-6 flex-grow flex items-center justify-center">
              {/* <p className="text-sm text-gray-600">Total Balance</p> */}
              <p className="text-4xl font-extrabold text-gray-700">
                {formatCurrency(walletBalance)}
              </p>
            </div>

            {/* BUTTON */}
            <div className="mt-auto">
              <Button onClick={handleLoadWallet} className="w-full">
                Load Wallet
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Auto Reload Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="h-full">
          <div className="bg-white shadow-xl rounded-2xl border border-gray-100 h-full flex flex-col">
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Auto-Reload Settings
                </h3>
              </div>

              {/* Switch */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-4">
                <label className="text-lg font-medium text-gray-700">
                  Automatically reload my wallet
                </label>

                <Switch
                  checked={autoReloadEnabled}
                  onCheckedChange={(val) => setValue("autoReloadEnabled", val)}
                />
              </div>

              {/* Extra Fields */}
              <div className="flex-grow">
                {autoReloadEnabled && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4">
                    {/* Threshold */}
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Threshold Value (Minutes)
                      </label>

                      <Input
                        type="number"
                        {...register("autoReloadThreshold", {
                          valueAsNumber: true,
                        })}
                        placeholder=""
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />

                      {errors.autoReloadThreshold && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.autoReloadThreshold.message}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-1.5">
                        Reload when balance is below
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Auto-Recharge Amount
                        {/* ({currency}) */}
                      </label>

                      <div className="relative">
                        <Input
                          type="number"
                          {...register("autoReloadAmount", {
                            valueAsNumber: true,
                          })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {errors.autoReloadAmount && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.autoReloadAmount.message}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-1.5">
                        Amount to add automatically
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={!isValid || loadingWallet}
              >
                Save Settings
                {loadingWallet ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  ""
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {/* Transaction History */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Wallet Transaction History
          </h2>
          {walletTransactions.length === 0 ? (
            <p className="text-gray-500 mt-4">No recent transactions found.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Date</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletTransactions.map((txn: any, idx: any) => (
                    <TableRow key={idx}>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell className="font-semibold text-green-600 text-center">
                        {formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-green-50 hover:bg-gray-100 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
