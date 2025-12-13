"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assignAssistantToPhoneNumberApi, getPhoneNumbersApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";
import BuyPhoneNumber from "../BuyPhoneNumber";

const PhoneSetup = ({initialValues, onFormDataChange}: {initialValues: any, onFormDataChange: (data: any) => void}) => {
    const [phoneNumbers, setPhoneNumbers] = useState<any>([]);
    const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openBuyPhoneNumberModal, setOpenBuyPhoneNumberModal] = useState<boolean>(false);

    const getPhoneNumbers = () => {
        setIsLoading(true);
        getPhoneNumbersApi().then((res) => {
            if (res?.data?.data) {            
                const numbers = res?.data?.data?.phone_numbers;
                setPhoneNumbers(numbers);
            }
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setIsLoading(false);
        });
    }

    useEffect(() => {
        getPhoneNumbers();
    }, []);

    useEffect(() => {
        // Select the first number by default or the one from initialValues if it exists
        if (phoneNumbers.length > 0 && !selectedNumber) {
            setSelectedNumber(phoneNumbers[0]);
        }
    }, [phoneNumbers, selectedNumber]);

    const handleSelectNumber = (number:any) => {
        // Check if this number is already selected/assigned to this assistant
        if (number?.assistant_id === initialValues?.id) {
            // Deselect/unassign the number
            handleDeselectNumber(number);
        } else {
            // Select/assign the number
            setSelectedNumber(number?.phone_number);
            const payload = {
                assistant_id: initialValues?.id
            }
            assignAssistantToPhoneNumberApi(number.id, payload).then((res: any) => {
                if(res?.data?.data){
                    console.log(res);
                }
            }).catch((err: any) => {
                console.log(err);
                toast({
                    title: "Error",
                    description: "Failed to assign assistant to phone number",
                    variant: "destructive"
                });
            }).finally(() => {
                getPhoneNumbers();            
                toast({
                    title: "Assistant assigned to phone number",
                    description: "Assistant assigned to phone number successfully",
                    variant: "default"
                });
            });
        }
    };

    const handleDeselectNumber = (number: any) => {
        // Call API to unassign assistant from phone number by setting assistant_id to null
        const payload = {
            assistant_id: ""
        }
        assignAssistantToPhoneNumberApi(number.id, payload).then((res: any) => {
            if(res?.data?.data){
                console.log(res);
                setSelectedNumber(null);
            }
        }).catch((err: any) => {
            console.log(err);
            toast({
                title: "Error",
                description: "Failed to unassign assistant from phone number",
                variant: "destructive"
            });
        }).finally(() => {
            getPhoneNumbers();
            toast({
                title: "Assistant unassigned from phone number",
                description: "Assistant unassigned from phone number successfully",
                variant: "default"
            });
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-4">
            <Card>
                <CardHeader>
                    <CardTitle>Phone Numbers</CardTitle>
                    <CardDescription>
                        Select an existing phone number or purchase a new one for your assistant
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Available Phone Numbers</h3>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpenBuyPhoneNumberModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Buy New Number
                        </Button>
                    </div>
                    
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <span className="ml-2 text-gray-600">Loading phone numbers...</span>
                        </div>
                        ) : phoneNumbers?.length > 0 ? (
                            <div className="space-y-2">
                                {phoneNumbers?.map((number: any, index: number) => (
                                    <div 
                                        key={index} 
                                        className={`p-3 rounded-md flex items-center justify-between cursor-pointer transition-colors ${number?.assistant_id === initialValues?.id ? 'bg-indigo-50 border border-indigo-200 hover:bg-indigo-100' : 'hover:bg-gray-50 border border-gray-200'}`}
                                        onClick={() => handleSelectNumber(number)}
                                        title={number?.assistant_id === initialValues?.id ? 'Click to deselect this number' : 'Click to select this number'}
                                    >
                                        <div className="flex items-center">
                                            <Phone className="h-5 w-5 text-gray-500 mr-3" />
                                            <span className="font-medium">{number?.phone_number}</span>
                                        </div>
                                        {number?.assistant_id === initialValues?.id ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Selected</span>
                                                <span className="text-xs text-gray-500">(Click to deselect)</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Click to select</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Phone className="h-10 w-10 mb-2 opacity-50" />
                                <p>No phone numbers available</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Phone Settings</CardTitle>
                    <CardDescription>
                        Configure call options
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">                   
                    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-600 flex items-center">
                            <span className="font-medium mr-1">Coming Soon:</span> 
                            Voicemail and Call Forwarding features will be available in phase 2
                        </p>
                    </div>
                </CardContent>
            </Card>
            <BuyPhoneNumber open={openBuyPhoneNumberModal} onOpenChange={setOpenBuyPhoneNumberModal} onSuccess={() => {
                getPhoneNumbers();
            }} />
        </div>
    );
};

export default PhoneSetup;