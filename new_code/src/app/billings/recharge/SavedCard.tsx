"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loadStripe } from "@stripe/stripe-js";
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
  cardAddressAddApi,
  cardAddressUpdateApi,
  getCardAddressApi,
  replaceCardApi,
  saveCardApi,
} from "@/network/Api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postal_code: z
    .string()
    .regex(/^\d{5,9}$/, "Postal code must be 5 to 9 digits"),
  country: z.string().regex(/^[A-Z]{2}$/, "Select Country"),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  is_default: boolean;
}

const SavedCardPage = () => {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [stripeRef, setStripeRef] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [cardValid, setCardValid] = useState<any>(false);
  const [disableinputs, setDisableinputs] = useState<boolean>(true);
  const [cardId, setCardId] = useState<string>("");

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
      country: "US",
    },
  });

  const [existingCard, setExistingCard] = useState<any>(false);

  const fetchAddress = async () => {
    try {
      const res = await getCardAddressApi();
      const data = res?.data?.data; // adjust based on API response structure
      console.log("Address Data:", data);
      setCardId(data.id);

      if (data) {
        addressForm.setValue("name", data.name || "");
        addressForm.setValue("line1", data.line1 || "");
        addressForm.setValue("line2", data.line2 || "");
        addressForm.setValue("city", data.city || "");
        addressForm.setValue("state", data.state || "");
        addressForm.setValue("postal_code", data.postal_code || "");
        addressForm.setValue("country", data.country || "CA");
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  useEffect(() => {
    initializeStripe();
    getSavedCards();
  }, []);

  useEffect(() => {
    if (cardElement && showAddCard) {
      mountCardElement();
    }
  }, [showAddCard, cardElement]);

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

  const getSavedCards = async () => {
    try {
      setLoadingApi(true);
      const result = await saveCardApi();
      const data = result?.data?.data?.cards ?? [];
      if (data.length > 0) {
        setExistingCard(true);
        const c = data[0];
        const card = {
          id: c.id,
          brand: c.brand || "Visa",
          last4: c.last4 || "4242",
          expiryMonth: c.exp_month || 12,
          expiryYear: c.exp_year || 2028,
          is_default: c.is_default,
        };
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!stripeRef || !cardElement || !cardValid.complete) {
        toast({
          title: "Invalid Card",
          description: "Please enter valid card details",
          variant: "destructive",
        });
        return;
      }

      const addressData = addressForm.getValues();

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

      const addreshUpdatePayload = {
        name: addressData.name,
        line1: addressData.line1,
        line2: addressData.line2,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        country: addressData.country.toUpperCase(),
      };
      await cardAddressUpdateApi(cardId, addreshUpdatePayload);
      if (error) {
        toast({
          title: "Card Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const payload = {
        payment_method_id: paymentMethod.id,
      };

      console.log("Payload", payload);
      // return;

      const result = await replaceCardApi(payload);

      if (result?.data?.success) {
        toast({
          title: "Success",
          description: result.data.message || result.data.data.message,
          variant: "default",
        });
        setShowAddCard(false);
        addressForm.reset();
        getSavedCards();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || error.detail || "Failed to add card",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingApi) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between pb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
                <p className="text-gray-500 mt-1">
                  Manage your payment methods
                </p>
              </div>

              {!showAddCard && (
                <Button
                  onClick={() => setShowAddCard(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {!existingCard ? "Add Card" : "Update Card"}
                </Button>
              )}
            </div>

            <Separator className="mb-6" />

            {showAddCard && (
              <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Add New Card
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddCard(false);
                      addressForm.reset();
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="card-element"
                      className="text-gray-700 font-medium"
                    >
                      Card Details
                    </Label>
                    <div
                      id="card-element"
                      className="p-4 border-2 border-gray-300 rounded-lg bg-white mt-2 focus-within:border-indigo-500 transition-colors"
                    ></div>
                    {cardValid?.error && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {cardValid?.error.message}
                      </p>
                    )}
                  </div>

                  <Form {...addressForm}>
                    <div className="space-y-4">
                      <FormField
                        control={addressForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardholder Name</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-white border-2"
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
                                className="bg-white border-2"
                                placeholder="123 Main Street"
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
                                className="bg-white border-2"
                                placeholder="Apt 4B"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-white border-2"
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
                                  className="bg-white border-2"
                                  placeholder="NY"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="postal_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-white border-2"
                                  placeholder="10001"
                                  {...field}
                                />
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
                                <select
                                  {...field}
                                  className="bg-white border-2 border-input h-10 rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                >
                                  <option value="">Select Country</option>
                                  <option value="US">United States (US)</option>
                                  <option value="CA">Canada (CA)</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </Form>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddCard(false);
                        addressForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !cardValid.complete}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 min-w-[120px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <span>
                          {!existingCard ? "Add Card" : "Update Card"}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!showAddCard && savedCards.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No cards added yet
                </h3>
                <p className="text-gray-500">
                  Add your first card to get started
                </p>
              </div>
            )}

            {!showAddCard && savedCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedCards.map((card) => (
                  <div key={card.id} className="relative">
                    <div className="relative w-full h-60 bg-gradient-to-br from-[#0D0D0D] via-[#2B0A53] to-[#7549a1] rounded-2xl p-6 shadow-2xl transform transition-all duration-300 ">
                      <div className="absolute top-5 left-6 text-white text-lg font-light tracking-wide ">
                        world
                      </div>

                      <div className="absolute top-5 right-6 text-white opacity-70">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="rotate-90"
                        >
                          <path
                            d="M8 12C8 9.79086 9.79086 8 12 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 12C6 8.68629 8.68629 6 12 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 12C4 7.58172 7.58172 4 12 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div className="w-14 h-11 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-md mt-10 shadow-lg">
                        <div className="grid grid-cols-3 gap-0.5 p-1.5 h-full">
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              className="bg-yellow-600/20 rounded-sm"
                            ></div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 text-white font-mono text-xl tracking-[0.3em]">
                        •••• •••• •••• {card.last4}
                      </div>

                      <div className="flex  items-end">
                        <div></div>
                        <div className="text-right">
                          <div className="text-[10px] text-white font-bold tracking-wider mb-1">
                            VALID THRU
                          </div>
                          <div className="text-md text-white font-bold">
                            {String(card.expiryMonth).padStart(2, "0")}/
                            {String(card.expiryYear).slice(-2)}
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-6 right-6">
                        {card.brand.toLowerCase() === "mastercard" ? (
                          <div className="flex">
                            <div className="w-9 h-9 bg-red-500 rounded-full opacity-90"></div>
                            <div className="w-9 h-9 bg-orange-400 rounded-full opacity-90 -ml-4"></div>
                          </div>
                        ) : card.brand.toLowerCase() === "visa" ? (
                          <div className="text-white font-bold text-2xl italic translate-y-[8px]">
                            {/* VISA */}
                            {card.brand.toUpperCase()}
                          </div>
                        ) : (
                          <div className="text-white font-bold text-xl">
                            {card.brand.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {card.is_default && (
                        <div className="absolute top-5 left-1/2 -translate-x-1/2">
                          <Badge className="bg-green-500 hover:bg-green-500 even: text-white shadow-lg">
                            <Check className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  <strong>Secure Payment Processing</strong>
                </p>
                <p className="text-sm text-blue-800">
                  All payments are processed securely through Stripe. Your card
                  information is encrypted and never stored on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SavedCardPage;
