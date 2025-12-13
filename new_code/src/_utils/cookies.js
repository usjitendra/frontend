import Cookies from "js-cookie";
import { COOKIES } from "./constants";

//\\\\\\Token////////\\
export const setToken = (token) => {
  return Cookies.set(COOKIES.ACCESS_TOKEN, token, { expires: 60 });
};

export const setIsOnboardingDone = (isOnboardingDone) => {
  return Cookies.set(COOKIES.ONBOARDING_DONE, isOnboardingDone, { expires: 60 });
};

export const getToken = () => {
  return Cookies.get(COOKIES.ACCESS_TOKEN);
};
export const getIsOnboardingDone = () => {
  return Cookies.get(COOKIES.ONBOARDING_DONE);
};

export const removeToken = () => {
  return Cookies.remove(COOKIES.ACCESS_TOKEN);
};
export const removeIsOnboardingDone = () => {
  return Cookies.remove(COOKIES.ONBOARDING_DONE);
};

export const setIsVerified = (isVerified) => {
  return Cookies.set(COOKIES.IS_VERIFIED, isVerified);
};

export const getIsVerified = () => {
  return Cookies.get(COOKIES.IS_VERIFIED);
};

export const removeIsVerified = () => {
  return Cookies.remove(COOKIES.IS_VERIFIED);
};

export const setIsSuspended = (isSuspended) => {
  return Cookies.set(COOKIES.IS_SUSPENDED, isSuspended);
};

export const getIsSuspended = () => {
  return Cookies.get(COOKIES.IS_SUSPENDED);
};

export const removeIsSuspended = () => {
  return Cookies.remove(COOKIES.IS_SUSPENDED);
};
