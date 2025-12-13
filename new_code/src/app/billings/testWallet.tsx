"use client";

import React, { useEffect, useState } from "react";
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
import { Check } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  getWalletBalanceApi,
  addWalletBalanceApi,
  AutoReLoadApi,
  walletHistory,
  saveCardApi,
  deleteCardApi,
  defaultCardApi,
} from "@/network/Api";
import Swal from "sweetalert2";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

// Constants
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51S3tPp0BLH6O9PUasGogBYFvyycpNGX7ekO1MfUOT84d9YUcmgF0ezWj5WoXaJwziMCixhAGd8NpPDD1rI8w6vfo00IWot3End";
const MIN_RECHARGE_AMOUNT = 50;
const MIN_AUTO_RELOAD_AMOUNT = 50;
const MIN_AUTO_RELOAD_THRESHOLD = 10;

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Address Validation Schema
const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postal_code: z.string().min(5, "Postal code must be at least 5 characters"),
  country: z
    .string()
    .length(2, "Country code must be 2 characters")
    .default("US"),
});

type AddressFormData = z.infer<typeof addressSchema>;

// Types
interface WalletSectionProps {}

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  is_default: boolean;
}

interface Transaction {
  amount: number;
  date: string;
}

interface AutoReloadSettings {
  enabled: boolean;
  threshold_minutes: number;
  reload_amount: number;
}

interface CardValidationState {
  complete: boolean;
  empty: boolean;
  error?: {
    type: string;
    code: string;
    message: string;
  };
}

const WalletSection: React.FC<WalletSectionProps> = () => {
  // State Hooks
  const [rechargeAmountError, setRechargeAmountError] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletStep, setWalletStep] = useState(1);
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>(
    []
  );
  const [autoReloadThreshold, setAutoReloadThreshold] = useState<number>(0);
  const [autoReloadAmount, setAutoReloadAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("CAD");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [amountError, setAmountError] = useState<string>("");
  const [thresholdError, setThresholdError] = useState<string>("");
  const [loadingApi, setLoadingApi] = useState(false);

  // New states for card validation
  const [cardValidation, setCardValidation] = useState<CardValidationState>({
    complete: false,
    empty: true,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [cvv, setCvv] = useState<string>("");
  const [showCvvField, setShowCvvField] = useState(false);

  // Stripe refs
  const [stripeRef, setStripeRef] = useState<any>(null);
  const [elementsRef, setElementsRef] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);

  // Address Form
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
  });

  // Effects
  useEffect(() => {
    apiLocation();
  }, []);

  useEffect(() => {
    initializeStripe();
  }, []);

  useEffect(() => {
    if (elementsRef && selectedCardId === "new") {
      mountCardElement();
    }
  }, [selectedCardId, elementsRef]);

  useEffect(() => {
    getSavedCards();
    getTransactionHistory();
  }, []);

  // Update form validation when card or address changes
  useEffect(() => {
    if (selectedCardId === "new") {
      const isAddressValid = addressForm.formState.isValid;
      const isCardValid = cardValidation.complete;
      setIsFormValid(isAddressValid && isCardValid);
    } else {
      // For saved cards, just need CVV if required
      setIsFormValid(showCvvField ? cvv.length >= 3 : true);
    }
  }, [
    selectedCardId,
    cardValidation,
    addressForm.formState.isValid,
    cvv,
    showCvvField,
  ]);

  // API Functions
  const apiLocation = async () => {
    try {
      const { data } = await axios.get("https://ipapi.co/json");
      if (data?.country_code === "CA") {
        setCurrency("CAD");
        addressForm.setValue("country", "CA");
      } else if (data?.country_code === "US") {
        setCurrency("USD");
        addressForm.setValue("country", "US");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const initializeStripe = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;
    setStripeRef(stripe);

    const elements = stripe.elements();
    setElementsRef(elements);

    const style = {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    };

    const card = elements.create("card", {
      style,
      hidePostalCode: true,
    });

    setCardElement(card);

    // Listen for validation changes
    card.on("change", (event: any) => {
      setCardValidation({
        complete: event.complete,
        empty: event.empty,
        error: event.error,
      });
    });
  };

  const mountCardElement = () => {
    if (!cardElement || !selectedCardId || selectedCardId !== "new") return;

    const cardContainer = document.getElementById("card-element");
    if (cardContainer) cardContainer.innerHTML = "";

    if (cardContainer && !cardContainer.hasChildNodes()) {
      cardElement.mount("#card-element");
    }

    // For saved cards, show CVV field
    if (selectedCardId !== "new" && selectedCardId) {
      setShowCvvField(true);
    } else {
      setShowCvvField(false);
    }
  };

  // Helper Functions
  const formatWalletCurrency = (amount: number) => {
    // if (amount == null || isNaN(amount)) return 0;
    if (currency === "USD") return `$${amount}`;
    if (currency === "CAD") return `CA$${amount}`;
    return `$${amount}`;
  };

  const validateRechargeAmount = (amount: number): boolean => {
    return amount >= MIN_RECHARGE_AMOUNT;
  };

  const validateAutoReloadAmount = (amount: number): boolean => {
    return amount >= MIN_AUTO_RELOAD_AMOUNT;
  };

  const validateAutoReloadThreshold = (threshold: number): boolean => {
    return threshold >= MIN_AUTO_RELOAD_THRESHOLD;
  };

  // Modal Functions
  const openWalletModal = async () => {
    setWalletStep(1);
    setRechargeAmount(0);
    setIsWalletModalOpen(true);

    const stripe = await stripePromise;
    if (!stripe) return;

    const elements = stripe.elements();
    setStripeRef(stripe);
    setElementsRef(elements);

    const newCard = elements.create("card", {
      hidePostalCode: true,
      style: {
        base: { fontSize: "16px", color: "#32325d" },
        invalid: { color: "#fa755a" },
      },
    });

    setCardElement(newCard);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
    if (cardElement) {
      try {
        cardElement.unmount(); // ← this destroys Stripe iframe
      } catch {}
    }
    setTimeout(() => {
      setWalletStep(1);
      addressForm.reset();
      setCardValidation({ complete: false, empty: true });
      setCvv("");
      setShowCvvField(false);
    }, 300);
  };

  const proceedToPayment = () => {
    if (!validateRechargeAmount(rechargeAmount)) {
      toast({
        title: "Invalid Amount",
        description: `Please enter a valid amount (minimum ${formatWalletCurrency(
          MIN_RECHARGE_AMOUNT
        )}).`,
        variant: "destructive",
      });
      return;
    }
    setWalletStep(2);
    initializeCardSelection();
  };

  const initializeCardSelection = () => {
    if (savedCards.length > 0 && !selectedCardId) {
      setSelectedCardId(savedCards[0].id);
      setShowCvvField(true); // Show CVV for saved cards
    } else if (savedCards.length === 0) {
      setSelectedCardId("new");
    }
  };

  // API Data Functions
  const getTransactionHistory = async () => {
    try {
      setLoadingApi(true);
      const result = await walletHistory();
      const autoReload = result?.data?.data?.auto_reload;
      const cur = result?.data?.data?.wallet?.currency;

      if (cur) setCurrency(cur.toUpperCase());

      setAutoReloadEnabled(autoReload?.auto_reload_enabled);
      setAutoReloadThreshold(autoReload?.auto_reload_threshold);
      setAutoReloadAmount(autoReload?.reload_amount);
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

  const getSavedCards = async () => {
    try {
      const result = await saveCardApi();
      const data = result?.data?.data?.cards ?? [];
      if (data.length > 0) {
        const cards = data.map((c: any) => ({
          id: c.id,
          brand: c.brand || "Visa",
          last4: c.last4 || "4242",
          expiryMonth: c.exp_month || 12,
          expiryYear: c.exp_year || 2028,
          is_default: c.is_default,
        }));
        setSavedCards(cards);
      } else {
        setSavedCards([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Payment Functions
  const completePurchase = async () => {
    try {
      setIsLoading(true);

      if (!selectedCardId) {
        toast({
          title: "Error",
          description: "Please select a payment method",
          variant: "destructive",
        });
        return;
      }

      let paymentMethodId = selectedCardId;
      let saveCard = false;
      let billingDetails: any = null;

      if (selectedCardId === "new") {
        const paymentResult = await handleNewCardPayment();
        if (!paymentResult.success) return;

        paymentMethodId = paymentResult.paymentMethodId;
        saveCard = paymentResult.saveCard || false;
        billingDetails = paymentResult.billingDetails;
      } else {
        // For saved cards, we might need to add CVV
        // Note: Stripe doesn't support CVV in PaymentMethod for saved cards
        // You'll need to handle this differently on the backend
      }

      await processPayment(paymentMethodId, saveCard, billingDetails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Payment failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCardPayment = async () => {
    if (!stripeRef || !cardElement) {
      toast({
        title: "Error",
        description: "Payment system not loaded",
        variant: "destructive",
      });
      return { success: false };
    }

    // Validate address form
    const isValid = await addressForm.trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please check your address information",
        variant: "destructive",
      });
      return { success: false };
    }

    // Get address data
    const addressData = addressForm.getValues();

    // Validate card
    if (cardValidation.error) {
      toast({
        title: "Card Error",
        description: cardValidation.error.message,
        variant: "destructive",
      });
      return { success: false };
    }

    if (!cardValidation.complete) {
      toast({
        title: "Incomplete Card",
        description: "Please enter complete card information",
        variant: "destructive",
      });
      return { success: false };
    }

    const saveCard = (
      document.getElementById("save-card-checkbox") as HTMLInputElement
    )?.checked;

    // Create payment method with address
    const { paymentMethod, error } = await stripeRef.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: addressData.name,
        address: {
          line1: addressData.line1,
          line2: addressData.line2,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postal_code,
          country: addressData.country,
        },
      },
    });

    if (error) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    }

    return {
      success: true,
      paymentMethodId: paymentMethod.id,
      saveCard,
      billingDetails: paymentMethod.billing_details,
    };
  };

  const processPayment = async (
    paymentMethodId: string,
    saveCard: boolean,
    billingDetails: any
  ) => {
    const payload = {
      amount: rechargeAmount,
      currency: currency.toLowerCase(),
      payment_method_id: paymentMethodId,
      save_card: saveCard,
      billing_details: billingDetails,
      ...(cvv && { cvv: cvv }), // Include CVV for saved cards if provided
    };

    try {
      const result = await addWalletBalanceApi(payload);

      if (result?.data?.success) {
        toast({
          title: "Success",
          description: "Payment processed successfully",
          variant: "default",
        });

        // Refresh data
        getTransactionHistory();
        getSavedCards();

        setTimeout(() => {
          setWalletStep(3);
        }, 1000);
      } else {
        throw new Error(result?.data?.message || "Payment failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Could not process payment",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Auto Reload Functions
  const saveAutoReloadSettings = async () => {
    try {
      setIsLoading(true);

      const payload: AutoReloadSettings = {
        enabled: autoReloadEnabled,
        threshold_minutes: autoReloadThreshold,
        reload_amount: autoReloadAmount,
      };

      const result = await AutoReLoadApi(payload);
      if (result.data.data) {
        toast({
          title: "Success",
          description: result?.data?.data?.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      closeWalletModal();
      setIsLoading(false);
    }
  };

  // Card Management Functions
  const handleDefaultChange = async (cardId: string) => {
    const confirm = await Swal.fire({
      title: "Set as default?",
      text: "Do you want to make this card your default payment method?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, set default",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const payload = { payment_method_id: cardId };
      const result = await defaultCardApi(payload);

      if (result?.data?.success) {
        getSavedCards();
        toast({
          title: "Success",
          description: result?.data?.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This card will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const result = await deleteCardApi(cardId);
      if (result?.data?.success) {
        setTimeout(() => {
          getSavedCards();
        }, 200);
        toast({
          title: "Success",
          description: result?.data?.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Event Handlers
  const handleRechargeAmountChange = (value: number) => {
    setRechargeAmount(value);
    if (!validateRechargeAmount(value)) {
      setRechargeAmountError(
        `Minimum recharge amount required is ${MIN_RECHARGE_AMOUNT}.`
      );
    } else {
      setRechargeAmountError("");
    }
  };

  const handleAutoReloadAmountChange = (value: number) => {
    setAutoReloadAmount(value);
    if (!validateAutoReloadAmount(value)) {
      setAmountError(`Minimum amount should be ${MIN_AUTO_RELOAD_AMOUNT}`);
    } else {
      setAmountError("");
    }
  };

  const handleAutoReloadThresholdChange = (value: number) => {
    setAutoReloadThreshold(value);
    if (!validateAutoReloadThreshold(value)) {
      setThresholdError(
        `Minimum allowed is ${MIN_AUTO_RELOAD_THRESHOLD} minutes.`
      );
    } else {
      setThresholdError("");
    }
  };

  const handleCardSelection = (cardId: string) => {
    setSelectedCardId(cardId);
    if (cardId !== "new") {
      setShowCvvField(true); // Show CVV field for saved cards
    } else {
      setShowCvvField(false); // Hide CVV for new card (handled by Stripe)
    }
  };

  // Loading State
  if (loadingApi) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderWalletBalanceCard = () => (
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg border-none">
      <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h3 className="text-xl text-white font-extrabold">Total Balance</h3>
          <p className="text-5xl font-extrabold mt-1">
            {formatWalletCurrency(walletBalance)}
          </p>
        </div>
        <Button
          onClick={openWalletModal}
          className="mt-4 sm:mt-0 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition duration-150 transform hover:scale-105"
        >
          Load Wallet
        </Button>
      </CardContent>
    </Card>
  );

  const renderAutoReloadCard = () => (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Auto Reload Minutes
        </h2>
        <div className="text-gray-600">
          Auto-recharge is currently{" "}
          <span
            className={`font-bold ${
              autoReloadEnabled ? "text-green-600" : "text-red-500"
            }`}
          >
            {autoReloadEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        {autoReloadEnabled && (
          <div className="text-sm text-gray-500 mt-2">
            Recharges {autoReloadAmount} when balance drops below{" "}
            {autoReloadThreshold} minutes.
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSavedPaymentMethods = () => (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Saved Payment Methods
        </h2>
        <div className="space-y-3">
          {savedCards.length === 0 ? (
            <p className="text-gray-500 italic">
              No cards saved yet. Add one during your next recharge!
            </p>
          ) : (
            savedCards.map((card) => (
              <div
                key={card.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="saved-card"
                    checked={selectedCardId === card.id}
                    onChange={() => handleCardSelection(card.id)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span className="font-medium text-gray-700">
                    {card.brand} ending in {card.last4}
                  </span>
                  {card.is_default && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {card.expiryMonth}/{card.expiryYear}
                  </span>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTransactionHistory = () => (
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
                {walletTransactions.map((txn, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell className="font-semibold text-green-600 text-center">
                      {Number(txn.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-50 text-green-700 border-green-200">
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
  );

  const renderWalletModalStep1 = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800">
          Load Wallet - Step 1/3
        </DialogTitle>
        <DialogDescription>
          Enter the amount you want to add to your wallet
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-6">
        <label
          htmlFor="recharge-input"
          className="block text-sm font-medium text-gray-700"
        >
          Enter Recharge Amount {currency}
        </label>
        <div className="w-full">
          <div className="relative rounded-md shadow-sm h-[44px]">
            <Input
              type="number"
              id="recharge-input"
              value={rechargeAmount || ""}
              onChange={(e) =>
                handleRechargeAmountChange(parseFloat(e.target.value))
              }
              min="5"
              step="5"
              className="pl-7 pr-12 h-full"
            />

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currency}</span>
            </div>
          </div>

          {rechargeAmountError && (
            <p className="text-red-500 text-sm mt-1">{rechargeAmountError}</p>
          )}
        </div>
      </div>
      <DialogFooter className="mt-8 flex justify-end space-x-3">
        <Button variant="outline" onClick={closeWalletModal}>
          Cancel
        </Button>
        <Button
          onClick={proceedToPayment}
          disabled={!validateRechargeAmount(rechargeAmount)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          Proceed to Payment
        </Button>
      </DialogFooter>
    </>
  );

  const renderWalletModalStep2 = () => (
    <div className="max-h-[75vh] overflow-auto pr-1">
      <div className="p-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Payment Method - Step 2/3
          </DialogTitle>
          <DialogDescription>Select or add a payment method</DialogDescription>
        </DialogHeader>
        <div className="space-y-8 mt-6">
          <div className="text-lg font-semibold text-gray-800">
            Recharging:{" "}
            <span className="text-indigo-600">
              {formatWalletCurrency(rechargeAmount)}
            </span>
          </div>

          {savedCards.length > 0 && (
            <>
              <h3 className="text-md font-medium text-gray-700">
                Select a Saved Card:
              </h3>
              <div className="space-y-3">
                {savedCards.map((card) => (
                  <label
                    key={card.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      selectedCardId === card.id
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={card.id}
                      checked={selectedCardId === card.id}
                      onChange={() => handleCardSelection(card.id)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div className="ml-3 text-sm">
                      <p className="font-medium text-gray-900">
                        {card.brand} ending in {card.last4}
                        {card.is_default && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500">
                        Expires {card.expiryMonth}/{card.expiryYear}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {showCvvField && selectedCardId !== "new" && (
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV (Required for saved cards)</Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-32"
                  />
                  <p className="text-sm text-gray-500">
                    3 or 4 digit security code
                  </p>
                </div>
              )}
            </>
          )}

          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
              selectedCardId === "new"
                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value="new"
              checked={selectedCardId === "new"}
              onChange={() => handleCardSelection("new")}
              className="h-4 w-4 text-indigo-600"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">
              Use a new credit/debit card
            </span>
          </label>

          {selectedCardId === "new" && (
            <>
              <div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="card-element">Card Details</Label>
                  <div
                    id="card-element"
                    className="p-3 border rounded-md bg-white mt-1"
                  ></div>
                  {cardValidation.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {cardValidation.error.message}
                    </p>
                  )}
                </div>

                <Form {...addressForm}>
                  <form className="space-y-4">
                    <FormField
                      control={addressForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addressForm.control}
                      name="line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addressForm.control}
                      name="line2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt 4B" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addressForm.control}
                        name="postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>

                <div className="flex items-center">
                  <input
                    id="save-card-checkbox"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="save-card-checkbox"
                    className="ml-2 text-sm text-gray-900"
                  >
                    Save this card for future use
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setWalletStep(1)}
            disabled={isLoading}
          >
            ← Change Amount
          </Button>
          <Button
            onClick={completePurchase}
            disabled={isLoading || !isFormValid}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              `Pay ${formatWalletCurrency(rechargeAmount)}`
            )}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );

  const renderWalletModalStep3 = () => (
    <div className="max-h-[80vh] overflow-y-auto pr-1">
      <VisuallyHidden>
        <DialogTitle>Recharge Successful</DialogTitle>
      </VisuallyHidden>
      <div className="text-center">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-3xl font-bold text-gray-900">
          Recharge Successful!
        </h3>
        <p className="mt-1 text-lg text-gray-500">
          You added{" "}
          <span className="font-semibold text-indigo-600">
            {formatWalletCurrency(rechargeAmount)}
          </span>{" "}
          to your wallet.
        </p>
        <p className="mt-4 text-sm font-medium text-gray-700">
          Your new balance is{" "}
          <span className="text-indigo-600">
            {formatWalletCurrency(walletBalance + rechargeAmount)}
          </span>
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Enable Auto-Recharge
        </h3>

        <div className="flex items-center justify-between mb-6">
          <label className="text-lg font-medium text-gray-700">
            Automatically reload my wallet
          </label>
          <Switch
            checked={autoReloadEnabled}
            onCheckedChange={setAutoReloadEnabled}
          />
        </div>

        {autoReloadEnabled && (
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div>
              <label
                htmlFor="threshold-minutes"
                className="block text-sm font-medium text-gray-700"
              >
                Threshold Value (Minutes)
              </label>
              <Input
                type="number"
                id="threshold-minutes"
                value={autoReloadThreshold}
                onChange={(e) =>
                  handleAutoReloadThresholdChange(Number(e.target.value))
                }
                min="5"
                placeholder="e.g. 10"
                className="mt-1"
              />
              {thresholdError && (
                <p className="text-red-500 text-sm mt-1">{thresholdError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Recharge will trigger when your balance drops below this amount.
              </p>
            </div>
            <div>
              <label
                htmlFor="recharge-amount-auto"
                className="block text-sm font-medium text-gray-700"
              >
                Auto-Recharge Amount {currency}
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <Input
                  type="number"
                  id="recharge-amount-auto"
                  value={autoReloadAmount}
                  onChange={(e) =>
                    handleAutoReloadAmountChange(Number(e.target.value))
                  }
                  min="10"
                  step="10"
                  placeholder="e.g. 50"
                  className="pl-7 pr-12"
                />
                {amountError && (
                  <p className="text-red-600 text-sm mt-1">{amountError}</p>
                )}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{currency}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button
          onClick={saveAutoReloadSettings}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
          disabled={
            isLoading ||
            (autoReloadEnabled &&
              (!validateAutoReloadAmount(autoReloadAmount) ||
                !validateAutoReloadThreshold(autoReloadThreshold)))
          }
        >
          {isLoading ? (
            <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : autoReloadEnabled ? (
            "Save Settings"
          ) : (
            "Not Now, Return to Billing"
          )}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <>
      {renderWalletBalanceCard()}
      {renderAutoReloadCard()}
      {renderSavedPaymentMethods()}
      {renderTransactionHistory()}

      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8">
          {walletStep === 1 && renderWalletModalStep1()}
          {walletStep === 2 && renderWalletModalStep2()}
          {walletStep === 3 && renderWalletModalStep3()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletSection;

//  <Card>
//         <CardContent className="p-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Saved Payment Methods
//           </h2>
//           <div className="space-y-3">
//             {savedCards.length === 0 ? (
//               <p className="text-gray-500 italic">
//                 No cards saved yet. Add one during your next recharge!
//               </p>
//             ) : (
//               savedCards.map((card) => (
//                 <div
//                   key={card.id}
//                   className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-6 bg-blue-100 rounded flex items-center justify-center">
//                       <span className="text-xs font-semibold text-blue-800">
//                         {card.brand.slice(0, 2)}
//                       </span>
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-700">
//                         {card.brand} ending in {card.last4}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         Expires {card.expiryMonth}/{card.expiryYear}
//                       </div>
//                     </div>
//                     {card.is_default && (
//                       <Badge className="bg-green-100 text-green-800 text-xs">
//                         Default
//                       </Badge>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {!card.is_default && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDefaultCard(card.id)}
//                       >
//                         Set Default
//                       </Button>
//                     )}
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleDeleteCard(card.id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       Delete
//                     </Button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>
