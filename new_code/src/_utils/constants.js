export const COOKIES = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  ONBOARDING_DONE: "ONBOARDING_DONE",
  IS_VERIFIED: "IS_VERIFIED",
  IS_SUSPENDED: "IS_SUSPENDED",
  IS_FORGOT_PASSWORD: "IS_FORGOT_PASSWORD",
};
export const TOAST_TYPE = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  WRANING: "WRANING",
  INFO: "INFO",
};

export const PUBLIC_ROUTES = {
  LOGIN: "/login",
};

export const PRIVATE_ROUTES = {
  DASHBOARD: "/dashboard",
  OVERVIEW: "/overview",
};

export const LANGUAGES = [
  { value: "EN", label: "English" },
  { value: "HI", label: "Hindi" },
  { value: "ES", label: "Spanish" },
  { value: "FR", label: "French" },
  { value: "DE", label: "German" },
  { value: "ZH", label: "Chinese" },
  { value: "JA", label: "Japanese" },
  { value: "RU", label: "Russian" },
  { value: "AR", label: "Arabic" },
  { value: "PT", label: "Portuguese" },
  { value: "BN", label: "Bengali" },
  { value: "PA", label: "Punjabi" },
  { value: "TA", label: "Tamil" },
  { value: "TE", label: "Telugu" },
  { value: "ML", label: "Malayalam" },
  { value: "GU", label: "Gujarati" },
  { value: "UR", label: "Urdu" },
  { value: "IT", label: "Italian" },
  { value: "KO", label: "Korean" },
  { value: "TR", label: "Turkish" },
];

export const SYSTEM_VARIABLES = [
  "start_time",
  "end_time",
  "provider_id",
  "service_id",
  "urgent_appointment",
];

export const DEFAULT_VARIABLES = [
  "first_name",
  "last_name",
  "birthdate",
  "phone_number",
  "email_address",
  "reason_for_visit",
];