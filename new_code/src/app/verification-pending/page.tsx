"use client";

import { useState, useEffect } from "react";
import { Hospital, CheckCircle, Clock, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  getIsOnboardingDone,
  getIsVerified,
  removeIsOnboardingDone,
  removeIsVerified,
  removeToken,
  setIsVerified,
} from "@/_utils/cookies";
import { getCompanyApi, getProfileApi } from "@/network/Api";
import { toast } from "@/hooks/use-toast";

const VerificationPendingPage = () => {
  const router = useRouter();
  const [isOnboardingDone, setIsOnboardingDone] = useState<string>("");
  const [isVerified, setIsVerifiedState] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsOnboardingDone(getIsOnboardingDone());
    setIsVerifiedState(getIsVerified());
  }, []);

  const handleLogout = () => {
    removeToken();
    removeIsOnboardingDone();
    removeIsVerified();
    router.push("/login");
  };

  const checkVerificationStatus = async () => {
    setIsChecking(true);
    try {
      const response = await getCompanyApi();
      if (response?.data?.data?.status == "approved") {
        setIsVerified("true");
        setIsVerifiedState("true");
        toast({
          title: "Verification Complete!",
          description: "Your account has been verified. You can now proceed.",
          variant: "default",
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast({
          title: "Still Pending",
          description:
            "Your account verification is still in progress. Please check back later.",
          variant: "default",
        });
      }
    } catch (error) {
      console.log("Error checking verification status:", error);
      toast({
        title: "Error",
        description: "Failed to check verification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-muted/50 to-background py-12 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Hospital className="h-10 w-10 text-white" />
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6 pb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-3">
              Verification Pending
            </h1>

            <div className="space-y-4 mb-6">
              <p className="text-muted-foreground">
                We're currently verifying your account. Once verified, you'll
                receive an email confirmation.
              </p>

              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Check your inbox for updates</span>
              </div>

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={checkVerificationStatus}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Verification Status
                  </>
                )}
              </Button>

              <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    VERIFICATION STEPS
                  </span>
                </div>
              </div>

              {isClient && (
                <ul className="space-y-3 text-sm text-left px-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Account registration completed</span>
                  </li>
                  <li className="flex items-start">
                    {isOnboardingDone === "true" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-amber-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                      </div>
                    )}
                    <span>Onboarding completed</span>
                  </li>
                  <li className="flex items-start">
                    {isVerified === "true" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-amber-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                      </div>
                    )}
                    <span>Verification in progress</span>
                  </li>
                  <li className="flex items-start text-muted-foreground">
                    {isVerified === "true" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted mr-2 flex-shrink-0 mt-0.5"></div>
                    )}
                    <span>Account activation</span>
                  </li>
                </ul>
              )}
            </div>

            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Return to Login
            </Button>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground mt-6">
          Need help? Contact our support team at support@eccentricbi.com
        </p>
      </div>
    </div>
  );
};

export default VerificationPendingPage;
