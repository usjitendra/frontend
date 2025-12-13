"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Router, ArrowBigLeft } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  addWalletBalanceApi,
  saveCardApi,
  cardAddressAddApi,
} from "@/network/Api";

// Address Validation Schema
const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postal_code: z
    .string()
    .regex(/^\d{5,9}$/, "Postal code must be 5 to 9 digits"),
  country: z.string().regex(/^[A-Z]{2}$/, "Select Country "),
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

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  is_default: boolean;
}
import { useRouter } from "next/navigation";

const RechargePage = () => {
  // New states for card validation
  const [cardValidation, setCardValidation] = useState<any>("");
  const [amount, setAmount] = useState<any>(50);
  const [currency, setCurrency] = useState("CAD");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cvv, setCvv] = useState("");
  const router = useRouter();

  // Stripe elements
  const [stripeRef, setStripeRef] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [cardValid, setCardValid] = useState<any>(false);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "CA",
    },
  });

  const apiLocation = async () => {
    try {
      const { data } = await axios.get("https://ipapi.co/json");
      if (data?.country_code === "CA") {
        setCurrency("CAD");
      } else if (data?.country_code === "US") {
        setCurrency("USD");
      }
    } catch (error) {
      // console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    initializeStripe();
    apiLocation();
    // Uncomment when API is ready:
    // getSavedCards();

    // Mock data for demo
    // setSavedCards([
    //   {
    //     id: "card_1",
    //     brand: "Visa",
    //     last4: "4242",
    //     expiryMonth: 12,
    //     expiryYear: 2028,
    //     is_default: true,
    //   },
    // ]);
    // setSelectedCardId("card_1");
  }, []);

  useEffect(() => {
    if (cardElement && selectedCardId === "new") {
      mountCardElement();
    }
  }, [selectedCardId, cardElement]);

  const initializeStripe = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;
    setStripeRef(stripe);

    const elements = stripe.elements();
    const card = elements.create("card", {
      hidePostalCode: true,
      style: {
        base: {
          color: "#32325d",
          fontSize: "16px",
          "::placeholder": { color: "#aab7c4" },
        },
        invalid: { color: "#fa755a" },
      },
    });

    card.on("change", (event: any) => {
      setCardValid({
        complete: event.complete,
        empty: event.empty,
        error: event.error
          ? {
              type: event.error.type,
              code: event.error.code,
              message: event.error.message,
            }
          : null,
      });
    });

    setCardElement(card);
  };

  const mountCardElement = () => {
    if (!cardElement) return;
    const container = document.getElementById("card-element");
    if (container) {
      container.innerHTML = "";
      cardElement.mount("#card-element");
    }
  };
  const [loadingApi, setLoadingApi] = useState(false);
  // const getSavedCards = async () => {
  //   try {
  //     setLoadingApi(true);
  //     const result = await saveCardApi();
  //     const data = result?.data?.data?.cards ?? [];
  //     if (data.length > 0) {
  //       const cards = data.map((c: any) => ({
  //         id: c.id,
  //         brand: c.brand || "Visa",
  //         last4: c.last4 || "4242",
  //         expiryMonth: c.exp_month || 12,
  //         expiryYear: c.exp_year || 2028,
  //         is_default: c.is_default,
  //       }));
  //       setSavedCards(cards);
  //     } else {
  //       setSavedCards([]);
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message || error.detail || error?.data?.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoadingApi(false);
  //   }
  // };

  const getSavedCards = async () => {
    try {
      setLoadingApi(true);
      const result = await saveCardApi();
      const data = result?.data?.data?.cards ?? [];

      if (data.length > 0) {
        // 👉 Only first card pick karo
        const c = data[0];

        const card = {
          id: c.id,
          brand: c.brand || "Visa",
          last4: c.last4 || "4242",
          expiryMonth: c.exp_month || 12,
          expiryYear: c.exp_year || 2028,
          is_default: c.is_default,
        };

        // 👉 Sirf 1 card store
        setSavedCards([card]);
      } else {
        setSavedCards([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || error.detail || error?.data?.message,
        variant: "destructive",
      });
    } finally {
      setLoadingApi(false);
    }
  };

  useEffect(() => {
    getSavedCards();
  }, []);

  const formatCurrency = (amt: number) => {
    return currency === "USD" ? `$${amt}` : `CA$ ${amt}`;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let payload: any;
      let addreshPayoad: any;
      if (selectedCardId === "new") {
        // New card payment
        if (!stripeRef || !cardElement || !cardValid) {
          toast({
            title: "Invalid Card",
            description: "Please enter valid card details",
            variant: "destructive",
          });
          return;
        }
        const addressData = addressForm.getValues();

        console.log("all addresh", addressData);
        addreshPayoad = {
          name: addressData.name,
          line1: addressData.line1,
          line2: addressData.line2,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postal_code,
          country: addressData.country.toUpperCase(),
        };

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
              country: addressData.country.toUpperCase(),
            },
          },
        });

        if (error) {
          toast({
            title: "Card Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        console.log("addreshPayoad", addreshPayoad);
        await cardAddressAddApi(addreshPayoad);
        payload = {
          amount: amount,
          currency: currency.toLowerCase(),
          newCard: true,
          existing: false,
          payment_method_id: paymentMethod.id,
          // card_number: paymentMethod.card.last4, // This would be full number from form
        };
      } else {
        // Existing card payment
        const selectedCard = savedCards.find((c) => c.id === selectedCardId);
        payload = {
          amount: amount,
          currency: currency.toLowerCase(),
          newCard: false,
          existing: true,
          selectedCardId: selectedCardId,
        };
      }

      // Uncomment when API is ready:
      const result = await addWalletBalanceApi(payload);
      console.log("wallet resp[onse", result?.data);
      if (result?.data?.success) {
        const url = result?.data?.data?.checkout_url;
        console.log("wallet", url);
        // window.open(url, "_blank");
        window.location.href = url; // same tab
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description:
          error.message || error.detail || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (amount < 50) return false;
    if (selectedCardId === "new") {
      return cardValid;
    } else {
      return selectedCardId;
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between pb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Recharge Wallet
              </h1>

              <Button
                type="button"
                className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-700 text-white px-2"
                onClick={() => {
                  router.push("/billings?tab=wallet");
                }}
              >
                <ArrowBigLeft
                  style={{ width: 20, height: 20 }}
                  className="text-white"
                />
                Back to Wallet
              </Button>
            </div>

            {/* Amount Section */}
            <div className="space-y-4 p-6  from-indigo-50/20 bg-gray-50/30 rounded-lg mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Recharge Amount
                </h3>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {currency === "USD" ? "$" : "CA$"}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-lg font-semibold"
                  />
                </div>
                {amount < 50 && amount !== 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Minimum amount should be 50
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {[50, 100, 200, 500, 1000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={amount === amt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(amt)}
                    className="flex-1 min-w-[80px]"
                  >
                    {formatCurrency(amt)}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Payment Method Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Method
              </h3>

              {/* Saved Cards */}
              {savedCards.length > 0 && (
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <label
                      key={card.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                        selectedCardId === card.id
                          ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-400"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="card"
                          value={card.id}
                          checked={selectedCardId === card.id}
                          onChange={() => setSelectedCardId(card.id)}
                          className="h-4 w-4 text-indigo-500"
                        />
                        <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-500 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {card.brand.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {card.brand} •••• {card.last4}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires {card.expiryMonth}/{card.expiryYear}
                          </div>
                        </div>
                      </div>
                      {card.is_default && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 ">
                          <Check className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              )}
              {/* New Card Option */}
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  selectedCardId === "new"
                    ? "border-indigo-400 bg-gray-50 ring-2 ring-indigo-400"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="card"
                  value="new"
                  checked={selectedCardId === "new"}
                  onChange={() => setSelectedCardId("new")}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="ml-3 font-medium text-gray-900">
                  Add New Card
                </span>
              </label>

              {/* New Card Form */}
              {selectedCardId === "new" && (
                <>
                  <div className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50/50">
                    <div>
                      <Label htmlFor="card-element">Card Details</Label>
                      <div
                        id="card-element"
                        className="p-3 border rounded-md bg-white mt-1"
                      ></div>
                      {cardValid?.error && (
                        <p className="text-red-500 text-sm mt-1">
                          {cardValid?.error.message}
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
                                <Input
                                  className="bg-white"
                                  placeholder="John Doe"
                                  {...field}
                                />
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
                                <Input
                                  className="bg-white"
                                  placeholder="123 Main "
                                  {...field}
                                />
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
                                <Input
                                  className="bg-white"
                                  placeholder="Apt 4B"
                                  {...field}
                                />
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
                                  <Input
                                    className="bg-white"
                                    placeholder="New York"
                                    {...field}
                                  />
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
                                  <Input
                                    className="bg-white"
                                    placeholder="NY"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Postal Code */}
                          <FormField
                            control={addressForm.control}
                            name="postal_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input
                                    className="bg-white h-10"
                                    placeholder="10001"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Country Code */}
                          <FormField
                            control={addressForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <select
                                    {...field}
                                    className="
                                     bg-white border border-input
                                              h-10 
                                                 rounded-md 
                                               px-3 
                                               text-sm 
                                          outline-none 
                                                focus:ring-2 
                                       focus:ring-white
                                                 w-full
                                                  "
                                  >
                                    <option value="">Select Country</option>
                                    <option value="US">
                                      United States (US)
                                    </option>
                                    <option value="CA">Canada (CA)</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>

                    {/* <div className="flex items-center">
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
                    </div> */}
                  </div>
                </>
              )}
            </div>

            {/* Submit Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(amount)}
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !isFormValid()}
                  size="lg"
                  className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Pay ${formatCurrency(amount)}`
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Payments are processed securely through
              Stripe. Your card information is encrypted and never stored on our
              servers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RechargePage;
