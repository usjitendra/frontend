"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, MapPin, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { getAvailablePhoneNumberListApi, purchasePhoneNumberApi } from "@/network/Api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    country: z.string().min(1, "Country is required"),
    areaCode: z.string().min(3, "Area code must be at least 3 digits"),
});

const PurchasePhoneNumber = () => {
    const [selectedNumber, setSelectedNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [purchasedNumber, setPurchasedNumber] = useState("");
    const router = useRouter();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const numbersPerPage = 5;

    const getAvailablePhoneNumberList = () => {
        getAvailablePhoneNumberListApi()
            .then((res) => {
                if (res.data?.data?.length > 0) {
                    setPhoneNumbers(res.data.data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            country: "CA",
            areaCode: "431",
        },
    });

    const handleFindNumbers = (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setCurrentPage(1); // Reset to first page when searching
        // getAvailablePhoneNumberListApi(values.country,values.areaCode)
        //     .then((res) => {
        //         console.log(res);
        //         // Update phone numbers with API response
        //         setPhoneNumbers(res?.data?.data?.numbers);
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     })
        //     .finally(() => {
        //         setIsLoading(false);
        //     });
    };

    const handleBuyNumber = () => {
        if (!selectedNumber) return;
        console.log("selectedNumber",selectedNumber);
        setIsSubmitting(true);
        const payload = {
            phone_number: selectedNumber,
        }
        purchasePhoneNumberApi(payload).then((res)=>{ 
            if(res?.data?.data){
                console.log(res?.data?.data);
                setPurchasedNumber(selectedNumber);
                setShowSuccessModal(true);
            }
        }).catch((err)=>{
            console.log(err);
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleSelectNumber = (id: string) => {
        setSelectedNumber(id);
    };

    // Calculate pagination
    const totalPages = Math.ceil(phoneNumbers?.length / numbersPerPage);
    const indexOfLastNumber = currentPage * numbersPerPage;
    const indexOfFirstNumber = indexOfLastNumber - numbersPerPage;
    const currentNumbers = phoneNumbers.slice(indexOfFirstNumber, indexOfLastNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="bg-gray-100 h-full">
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 transform transition-all animate-fade-in-up">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                            <p className="text-gray-600 mb-6">
                                You've successfully purchased the phone number:
                                <span className="block text-lg font-medium text-indigo-600 mt-2">{purchasedNumber}</span>
                            </p>
                            <div className="flex gap-3 w-full">
                                <Button 
                                    onClick={() => router.push('/phone-numbers')}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                                >
                                    View My Numbers
                                </Button>
                                <Button 
                                    onClick={() => setShowSuccessModal(false)}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 rounded-lg"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="w-full flex items-center justify-between p-4 border-b bg-[#fafafa]">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Purchase Phone Number</h2>
                    <p className="text-sm text-gray-500 mt-1">Select your preferred phone number</p>
                </div>
                <Button onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <div id="number-selection" className="container mx-auto py-8 px-4 max-w-3xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFindNumbers)} className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/2">
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="relative">
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm">
                                                        <SelectValue placeholder="Select Country" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="US">United States</SelectItem>
                                                        <SelectItem value="CA">Canada</SelectItem>
                                                        <SelectItem value="UK">United Kingdom</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Globe className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="w-full md:w-1/2">
                                <FormField
                                    control={form.control}
                                    name="areaCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Area Code"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                                />
                                                <MapPin className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                type="submit"
                                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
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
                        </div>
                    </form>
                </Form>

                <div id="available-numbers" className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Available Numbers</h3>
                        {phoneNumbers.length > 0 && (
                            <div className="text-sm text-gray-500">
                                Showing {indexOfFirstNumber + 1}-{Math.min(indexOfLastNumber, phoneNumbers.length)} of {phoneNumbers.length}
                            </div>
                        )}
                    </div>

                    {phoneNumbers?.length > 0 ? (
                        <>
                            <div className="max-h-[300px] overflow-y-auto">
                                {currentNumbers?.length > 0 && currentNumbers?.map((phone: any) => (
                                    <div
                                        key={phone?.phone_number}
                                        id={`number-card-${phone.phone_number}`}
                                        className={`bg-gray-50 rounded-lg p-3 mb-2 transition-all ${selectedNumber === phone.phone_number ? 'border-2 border-indigo-500' : 'border border-gray-200 hover:border-indigo-300 cursor-pointer'}`}
                                        onClick={() => handleSelectNumber(phone.phone_number)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 border-2 ${selectedNumber === phone.phone_number ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'} rounded-full flex items-center justify-center transition-colors`}>
                                                    {selectedNumber === phone.phone_number && (
                                                        <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-medium text-gray-900">{phone.friendly_name}</span>
                                                    <span className="text-xs text-gray-500">Region: {phone.region}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-medium text-indigo-600">${phone.monthly_price}/{phone.currency}</span>
                                                <div className="flex gap-1 mt-1">
                                                    {phone.capabilities?.voice && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">Voice</span>
                                                    )}
                                                    {phone.capabilities?.SMS && (
                                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">SMS</span>
                                                    )}
                                                    {phone.capabilities?.MMS && (
                                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">MMS</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-4 pt-2 border-t border-gray-100">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={prevPage} 
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={nextPage} 
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <div id="action-buttons" className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBuyNumber}
                                    disabled={isSubmitting || !selectedNumber}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Buy Number"
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No phone numbers available. Try a different area code.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchasePhoneNumber;