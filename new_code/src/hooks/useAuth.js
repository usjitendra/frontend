"use client";

import { 
  removeToken, 
  removeIsOnboardingDone, 
  removeHasSubscription, 
  removeUserId,
  removeUserEmail 
} from "@/_utils/cookies";  // adjust path as needed
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();

  const logout = () => {
    removeToken();
    removeIsOnboardingDone();
    removeHasSubscription();
    removeUserId();
    removeUserEmail();
    router.push("/login");
  };

  return { logout };
};