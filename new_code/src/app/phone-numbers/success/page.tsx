"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const PhoneNumberSuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(10);

    useEffect(() => {
        // Get session_id from URL
        const session_id = searchParams.get("session_id");
        setSessionId(session_id);

        // You could use this session_id to verify the purchase with your backend if needed
    }, [searchParams]);

    useEffect(() => {
        // Set up countdown timer for automatic redirect
        const timer = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer);
                    // Move the router.push call outside of the setState function
                    setTimeout(() => router.push("/phone-numbers"), 0);
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);

        // Clean up timer on component unmount
        return () => clearInterval(timer);
    }, [router]);

    const handleRedirect = () => {
        router.push("/phone-numbers");
    };

    return (
        <div className="container max-w-md mx-auto py-12 px-4">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Purchase Successful!</CardTitle>
                    <CardDescription>
                        Your phone number has been successfully purchased.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">
                        Thank you for your purchase. Your new phone number is now ready to use.
                    </p>
                    {sessionId && (
                        <p className="text-xs text-gray-500 mt-2 break-all px-4">
                            Transaction ID: {sessionId}
                        </p>
                    )}
                    <p className="text-sm text-indigo-600 mt-4">
                        Redirecting to Phone Numbers in {countdown} seconds...
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button 
                        onClick={handleRedirect}
                        className="w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
                    >
                        Go to Phone Numbers
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PhoneNumberSuccessPage;