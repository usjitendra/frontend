"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PUBLIC_ROUTES } from "@/_utils/constants";
import { getIsOnboardingDone, getIsSuspended, getIsVerified, getToken } from "@/_utils/cookies";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useDispatch } from "react-redux";
import { fetchBillingUsageAction, fetchCompanyAction, fetchCompanyDetailAction, fetchCurrentSubscriptionAction } from "./store/account/action";
import { AppDispatch } from "./store/store";

const AuthProvider = ({ children }: any) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = getToken();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>()
  const isOnboardingDone: string = getIsOnboardingDone()
  const isVerified: any = getIsVerified()
  const isSuspended: any = getIsSuspended()

  useEffect(() => {
    if (token) {
      dispatch(fetchCompanyDetailAction())
      
      if(isOnboardingDone == "true" && isVerified == "true"){
        dispatch(fetchCompanyAction())
        dispatch(fetchCurrentSubscriptionAction())
        dispatch(fetchBillingUsageAction())
      }
    }
  }, [token, isOnboardingDone])


  useEffect(() => {
    const queryString = searchParams.toString(); // Converts search parameters to a query string
    const currentPathWithParams = `${pathname}${queryString ? `?${queryString}` : ""}`;
    if (token) {
      setIsAuthenticated(true);

      // Check if user is suspended
      if (isSuspended === "true") {
        // Redirect to suspend page if user is suspended
        router.push("/suspend");
        return;
      }

      // Check if user is verified
      if (isOnboardingDone === "true" && isVerified === "false") {
        // Redirect to verification pending page if user is not verified
        router.push("/verification-pending");
        return;
      }

      if (pathname?.includes("/login") || pathname === "/") {
        if (isOnboardingDone === "true") {
          router.push("/");
        } else {
          router.push("/onboarding");
        }
      } else {
        if (isOnboardingDone === "true") {
          // Retain both the pathname and search parameters
          router.push(currentPathWithParams);
        } else {
          router.push("/onboarding");
        }
      }
    } else {
      setIsAuthenticated(false);
      if (pathname?.includes("/login/otp")) {
        router.push(currentPathWithParams);
      } else if (pathname?.includes("/suspend")) {
        router.push(currentPathWithParams);
      } else {
        router.push(PUBLIC_ROUTES.LOGIN);
      }
    }
  }, [token, isVerified, isSuspended]);

  if (!isAuthenticated || isOnboardingDone == "false" || isVerified == "false" || isSuspended == "true") {
    return children; // or a loading spinner
  }

  return (    
    // <SidebarProvider>
      <div className="flex w-full h-[100vh]">
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>    
    // </SidebarProvider>
  );
};

export default AuthProvider;