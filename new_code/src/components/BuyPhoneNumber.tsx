"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, MapPin, CheckCircle, Building, Phone } from "lucide-react";
import { buyPhoneNumberStripeApi, getAvailablePhoneNumberListApi, purchasePhoneNumberApi } from "@/network/Api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";

const formSchema = z.object({
    country: z.string().min(1, "Country is required"),
    areaCode: z.string().optional(),
    locality: z.string().optional(),
    searchType: z.enum(["areaCode", "locality"]).default("areaCode"),
});

interface BuyPhoneNumberProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (phoneNumber: string) => void;
}

const BuyPhoneNumber = ({ open, onOpenChange, onSuccess }: BuyPhoneNumberProps) => {
    const [selectedNumber, setSelectedNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [purchasedNumber, setPurchasedNumber] = useState("");
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const currentSubscriptionData = useSelector((state: any) => state.account.currentSubscriptionData);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            country: "CA",
            areaCode: "431",
            locality: "",
            searchType: "areaCode",
        },
    });

    const getAvailablePhoneNumberList = () => {
        const values = form.getValues();
        const queryParams = new URLSearchParams();

        queryParams.append("country", values.country);

        if (values.searchType === "areaCode" && values.areaCode) {
            queryParams.append("areaCode", values.areaCode);
        } else if (values.searchType === "locality" && values.locality) {
            queryParams.append("locality", values.locality);
        }

        getAvailablePhoneNumberListApi(queryParams.toString())
            .then((res) => {
                if (res.data?.data?.length > 0) {
                    setPhoneNumbers(res.data.data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleFindNumbers = (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        const queryParams = new URLSearchParams();
        queryParams.append("country", values.country);

        if (values.searchType === "areaCode" && values.areaCode) {
            queryParams.append("areaCode", values.areaCode);
        } else if (values.searchType === "locality" && values.locality) {
            queryParams.append("locality", values.locality);
        }

        getAvailablePhoneNumberListApi(queryParams.toString())
            .then((res) => {
                console.log(res);
                setPhoneNumbers(res?.data?.data?.numbers || []);
            })
            .catch((err) => {
                console.log(err);
                setPhoneNumbers([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleBuyNumber = () => {
        if (!selectedNumber) return;
        console.log("selectedNumber", selectedNumber);
        setIsSubmitting(true);
        const payload = {
            phone_number: selectedNumber,
        }
        
        purchasePhoneNumberApi(payload).then((res) => {
            if (res?.data?.data) {
                console.log(res?.data?.data);
                setPurchasedNumber(selectedNumber);
                setShowSuccessModal(true);
                if (onSuccess) {
                    onSuccess(selectedNumber);
                }
            }
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleSelectNumber = (id: string) => {
        setSelectedNumber(id);
    };

    const handleClose = () => {
        setSelectedNumber("");
        setPhoneNumbers([]);
        onOpenChange(false);
    };

    useEffect(() => {
        getAvailablePhoneNumberList();
    }, []);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="pb-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-xl font-semibold">Purchase Phone Number</DialogTitle>
                                <DialogDescription>Search and select your preferred phone number</DialogDescription>
                            </div>
                            <div className="flex space-x-3 mr-6">                              
                                <Button
                                    onClick={handleBuyNumber}
                                    disabled={isSubmitting || !selectedNumber}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Purchase"
                                    )}
                                </Button>
                            </div>
                        </div>
                        {selectedNumber && (
                            <div className="mt-3 text-sm text-gray-600">
                                <span className="font-medium text-blue-600">Selected: {selectedNumber}</span>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="space-y-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 160px)" }}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleFindNumbers)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Country</label>
                                                    <div className="relative">
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <SelectTrigger className="pl-10">
                                                                <SelectValue placeholder="Select Country" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="US">United States</SelectItem>
                                                                <SelectItem value="CA">Canada</SelectItem>
                                                                <SelectItem value="UK">United Kingdom</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Globe className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="searchType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Search By</label>
                                                    <Tabs
                                                        defaultValue={field.value}
                                                        onValueChange={field.onChange}
                                                        className="w-full"
                                                    >
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="areaCode">Area Code</TabsTrigger>
                                                            <TabsTrigger value="locality">City</TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent value="areaCode" className="mt-3">
                                                            <FormField
                                                                control={form.control}
                                                                name="areaCode"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="relative">
                                                                            <Input
                                                                                {...field}
                                                                                type="text"
                                                                                placeholder="e.g. 431"
                                                                                className="pl-10"
                                                                            />
                                                                            <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                                                        </div>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TabsContent>

                                                        <TabsContent value="locality" className="mt-3">
                                                            <FormField
                                                                control={form.control}
                                                                name="locality"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <div className="relative">
                                                                            <Input
                                                                                {...field}
                                                                                type="text"
                                                                                placeholder="e.g. Quebec"
                                                                                className="pl-10"
                                                                            />
                                                                            <Building className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                                                        </div>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TabsContent>
                                                    </Tabs>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        "Find Numbers"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="border rounded-lg">
                            <div className="px-4 py-2 border-b bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">Available Numbers</h3>
                                    {phoneNumbers.length > 0 && (
                                        <span className="text-sm text-gray-600">{phoneNumbers.length} found</span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                                        <span className="text-gray-600">Loading numbers...</span>
                                    </div>
                                ) : phoneNumbers?.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {phoneNumbers?.map((phone: any) => (
                                            <div
                                                key={phone?.phone_number}
                                                className={`p-5 border rounded-lg cursor-pointer transition-all ${
                                                    selectedNumber === phone.phone_number 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => handleSelectNumber(phone.phone_number)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 border-2 rounded-full ${
                                                            selectedNumber === phone.phone_number 
                                                                ? 'border-blue-500 bg-blue-500' 
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {selectedNumber === phone.phone_number && (
                                                                <div className="w-full h-full bg-white rounded-full scale-50"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-lg">{phone.friendly_name}</div>
                                                            <div className="text-sm text-gray-600">{phone.region}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <div className="font-semibold text-lg">
                                                            <div>CAD ${currentSubscriptionData?.plan?.features?.extra_phone_number_cost?.cad}/month</div>
                                                            <div className="text-sm text-gray-500">USD ${currentSubscriptionData?.plan?.features?.extra_phone_number_cost?.usd}/month</div>
                                                        </div>
                                                        <div className="flex gap-1 mt-1">
                                                            {phone.capabilities?.voice && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Voice</span>
                                                            )}
                                                            {phone.capabilities?.SMS && (
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">SMS</span>
                                                            )}
                                                            {phone.capabilities?.MMS && (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">MMS</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Phone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">No numbers available</p>
                                        <p className="text-sm text-gray-500 mt-1">Try different search criteria</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </DialogContent>
            </Dialog>

            {showSuccessModal && (
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className="sm:max-w-md">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold mb-2">Success!</DialogTitle>
                            <DialogDescription className="mb-6">
                                Phone number purchased successfully:
                                <div className="font-mono text-lg mt-2 p-2 bg-gray-100 rounded">
                                    {purchasedNumber}
                                </div>
                            </DialogDescription>
                            <Button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onOpenChange(false);
                                }}
                                className="w-full"
                            >
                                Continue
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default BuyPhoneNumber;