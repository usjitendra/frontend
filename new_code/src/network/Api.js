import { ENDPOINT } from "./EndPoints";
import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest,
  patchRequest,
} from "./ApiRequest";
import { endOfDay } from "date-fns";

//  AUTH API's -------
export const loginApi = (payload) => {
  return postRequest(ENDPOINT.CODE, payload);
};

export const loginOtpApi = (payload) => {
  // return postRequest(ENDPOINT.LOGIN+`?Email=${payload?.email}&Code=${payload?.otp}`);
  return postRequest(ENDPOINT.LOGIN, payload);
};

export const signupOtpApi = (payload) => {
  return postRequest(ENDPOINT.SIGN_UP, payload);
};

export const verifyOtpApi = (payload) => {
  return postRequest(ENDPOINT.VERIFY_OTP, payload);
};

export const setPasswordApi = (payload) => {
  return postRequest(ENDPOINT.SET_PASSWORD, payload);
};

export const resetPasswordApi = (payload) => {
  return postRequest(ENDPOINT.RESET_PASSWORD, payload);
};

export const onboardingApi = (payload) => {
  return postRequest(ENDPOINT.ONBOARDING, payload);
};

export const getAssistantListApi = (page, page_size) => {
  return getRequest(ENDPOINT.ASSISTANT_LIST + `?page=${page}&page_size=${page_size}`);
};

export const getVapi_keyApi = () => {
  return getRequest(ENDPOINT.VAPI_KEY)
}

export const getProfileApi = () => {
  return getRequest(ENDPOINT.USER_PROFILE);
};

export const getCallListApi = (page, page_size) => {
  return getRequest(ENDPOINT.CALL_LIST + `?page=${page}&page_size=${page_size}`);
};

export const feedbackApi = (id, payload) => {
  return postRequest(ENDPOINT.feedback + id, payload)
}

export const getCallDetailsApi = (id) => {
  return getRequest(ENDPOINT.CALL + id);
};

export const deletPhoneNumber = (id) => {
  return deleteRequest(ENDPOINT.PHONE_REALES + id)
}

export const getCallAssistantApi = (id, page, page_size) => {
  return getRequest(ENDPOINT.CALL_ASSISTANT + id + `?page=${page}&page_size=${page_size}`);
};

export const getCompanyApi = () => {
  return getRequest(ENDPOINT.COMPANY);
};

export const createAssistantApi = (payload) => {
  return postRequest(ENDPOINT.ASSISTANT, payload);
};

export const getAvailablePhoneNumberListApi = (queryParams) => {
  return getRequest(ENDPOINT.AVAILABLE_PHONE_NUMBER_LIST + `?${queryParams}&limit=100`);
};

export const purchasePhoneNumberApi = (payload) => {
  return postRequest(ENDPOINT.PURCHASE_PHONE_NUMBER, payload);
};

export const buyPhoneNumberStripeApi = (payload) => {
  return postRequest(ENDPOINT.BUY_PHONE_NUMBER_STRIPE, payload);
};


export const updateAssistantApi = (id, payload) => {
  return putRequest(ENDPOINT.ASSISTANT + id, payload);
};

export const deleteAssistantApi = (id) => {
  return deleteRequest(ENDPOINT.ASSISTANT + id);
};

export const getPhoneNumbersApi = () => {
  return getRequest(ENDPOINT.PHONE_NUMBERS);
};

export const assignAssistantToPhoneNumberApi = (phone_number_id, payload) => {
  return putRequest(ENDPOINT.ASSIGN_ASSISTANT_TO_PHONE_NUMBER + "/" + phone_number_id, payload);
};

export const getAssistantDetailsApi = (id) => {
  return getRequest(ENDPOINT.ASSISTANT + id);
};

export const googleAuthApi = (payload) => {
  return postRequest(ENDPOINT.GOOGLE_AUTH, payload);
};

//Action API's

export const createActionApi = (payload) => {
  return postRequest(ENDPOINT.CREATE_ACTION, payload);
};

export const getActionsApi = () => {
  return getRequest(ENDPOINT.ACTIONS + "?page=1&page_size=50");
};

export const getActionByIdApi = (id) => {
  return getRequest(ENDPOINT.CREATE_ACTION + id);
};

export const updateActionApi = (id, payload) => {
  return putRequest(ENDPOINT.CREATE_ACTION + id, payload);
};

export const deleteActionApi = (id) => {
  return deleteRequest(ENDPOINT.CREATE_ACTION + id);
};

export const getActionAgentListApi = (id) => {
  return getRequest(ENDPOINT.ACTION_AGENT_LIST + id);
};

export const getSubscriptionApi = () => {
  return getRequest(ENDPOINT.SUBSCRIPTION);
};

export const getStripeInvoiceApi = () => {
  return getRequest(ENDPOINT.STRIPE_INVOICE);
};

export const pauseSubscriptionApi = (subscription_id) => {
  return postRequest(ENDPOINT.SUBSCRIPTION + "/" + subscription_id + "/pause");
};

export const getWalletBalanceApi = () => {
  return getRequest(ENDPOINT.GEt_BELLING_PLAN);
}

export const addWalletBalanceApi = (payload) => {
  return postRequest(ENDPOINT.ADD_WALLET_BALANCE, payload);
}

export const AutoReLoadApi = (payload) => {
  return postRequest(ENDPOINT.AUTO_RELOAD, payload)
}

export const walletHistory = () => {
  return getRequest(ENDPOINT.WALLET_HISTORY)
}

export const saveCardApi = () => {
  return getRequest(ENDPOINT.SAVE_CARD)
}

export const getBillingPlanApi = () => {
  return getRequest(ENDPOINT.BILLING_PLAN);
};

export const getBillingCheckoutApi = (plan_id, currency) => {
  return getRequest(ENDPOINT.BILLING_CHECKOUT + plan_id + `?currency=${currency}`);
};

export const getCurrentSubscriptionApi = () => {
  return getRequest(ENDPOINT.CURRENT_SUBSCRIPTION);
};

export const upgradeSubscriptionApi = (subscription_id, payload) => {
  return postRequest(ENDPOINT.CURRENT_SUBSCRIPTION + "/" + subscription_id + "/upgrade", payload);
};

export const cancelSubscriptionApi = (subscription_id) => {
  return postRequest(ENDPOINT.CURRENT_SUBSCRIPTION + "/" + subscription_id + "/cancel");
};

//service api's

export const createServiceApi = (payload) => {
  return postRequest(ENDPOINT.CREATE_SERVICE, payload);
};

export const getServiceListApi = () => {
  return getRequest(ENDPOINT.SERVICE_LIST);
};

export const updateServiceApi = (id, payload) => {
  return putRequest(ENDPOINT.CREATE_SERVICE + id, payload);
};

export const deleteServiceApi = (id) => {
  return deleteRequest(ENDPOINT.CREATE_SERVICE + id);
};

export const deleteCardApi = (id) => {
  return deleteRequest(`${ENDPOINT.CARD_DELETE}/${id}`)
}

export const defaultCardApi = (payload) => {
  return putRequest(ENDPOINT.CARD_DEFAULT, payload)
}

//knowledgebase api's

export const uploadDocumentApi = (payload) => {
  return postRequest(ENDPOINT.UPLOAD_DOCUMENT, payload);
};

export const getDocumentListApi = () => {
  return getRequest(ENDPOINT.DOCUMENT_LIST);
};

export const deleteDocumentApi = (id) => {
  return deleteRequest(ENDPOINT.DELETE_DOCUMENT + id);
};

//calendar api's

export const getCalendarListApi = () => {
  return getRequest(ENDPOINT.CALENDAR_LIST);
};

export const fetchLatestCalendarApi = () => {
  return getRequest(ENDPOINT.CALENDAR_FETCH_LATEST);
};

export const removeCalendarAccountApi = (id) => {
  return deleteRequest(ENDPOINT.CALENDAR_REMOVE + id);
};

export const connectCalendarApi = (payload) => {
  return postRequest(ENDPOINT.CONNECT_CALENDAR, payload);
};

export const disconnectCalendarApi = (id) => {
  return deleteRequest(ENDPOINT.CALENDAR + id);
};


//Provider API's

export const createProviderApi = (payload) => {
  return postRequest(ENDPOINT.CREATE_PROVIDER, payload);
};

export const getProviderListApi = () => {
  return getRequest(ENDPOINT.PROVIDER_LIST);
};

export const deleteProviderApi = (id) => {
  return deleteRequest(ENDPOINT.DELETE_PROVIDER + id);
};

export const getProviderDetailsApi = (id) => {
  return getRequest(ENDPOINT.DELETE_PROVIDER + id);
};

export const updateProviderApi = (id, payload) => {
  return putRequest(ENDPOINT.DELETE_PROVIDER + id, payload);
};

export const updateProviderKnowledgeBaseApi = (id, payload) => {
  return putRequest(ENDPOINT.DELETE_PROVIDER + id + "/knowledge-base", payload);
};

export const deleteProviderKnowledgeBaseApi = (id) => {
  return deleteRequest(ENDPOINT.DELETE_PROVIDER + id + "/knowledge-base");
};

//webcall
export const getWebcallApi = (id) => {
  return getRequest(ENDPOINT.ASSISTANT_WEBCALL + id);
};

//Global Variable API's

export const createGlobalVariableApi = (payload) => {
  return postRequest(ENDPOINT.FOLDER, payload);
};

export const cardAddressAddApi = (payload) => {
  return postRequest(ENDPOINT.CARD_ADDRESS, payload)
}
export const cardAddressUpdateApi = (id, payload) => {
  return putRequest(ENDPOINT.CARD_ADDRESS, payload);
};


export const getCardAddressApi = () => {
  return getRequest(ENDPOINT.CARD_ADDRESS)
}

export const replaceCardApi = (payload) => {
  return postRequest(ENDPOINT.REPLACE_CARD, payload)
}
export const getGlobalVariableApi = () => {
  return getRequest(ENDPOINT.FOLDER);
};

export const updateGlobalVariableApi = (id, payload) => {
  return putRequest(ENDPOINT.FOLDER + "/" + id, payload);
};

export const deleteGlobalVariableApi = (id) => {
  return deleteRequest(ENDPOINT.FOLDER + "/" + id);
};

export const cloneGlobalVariableApi = (id, payload) => {
  return putRequest(ENDPOINT.FOLDER + "/" + id + "/clone", payload);
};

//Transaction History API's

// export const getTransactionHistoryApi = () => {
//   return getRequest(ENDPOINT.TRANSACTION_HISTORY);
// };

//User Profile Picture API's

export const uploadUserProfilePictureApi = (payload) => {
  return postRequest(ENDPOINT.USER_PROFILE_PICTURE, payload);
};

//Update Passwords
export const updatePasswordApi = (payload) => {
  return putRequest(ENDPOINT.UPDATE_PASSWORD, payload);
};

//Company Statistics API's

export const getCompanyStatisticsApi = () => {
  return getRequest(ENDPOINT.COMPANY_STATISTICS);
};

export const getBillingUsageApi = () => {
  return getRequest(ENDPOINT.BILLING_USAGE);
};

export const profileUpdate = (payload) => {
  return putRequest(ENDPOINT.PROFILE_UPDATE, payload)
}
//SMTP API's

export const getSMTPListApi = () => {
  return getRequest(ENDPOINT.SMTP_LIST);
};

export const updateSMTPApi = (payload) => {
  return putRequest(ENDPOINT.SMTP_LIST, payload);
};

export const addTools = (payload) => {
  console.log("this is Api payload", payload);
  return postRequest('https://680dafaaa2de.ngrok-free.app/create_tool', payload);
};


//HOSPITAL TOKEN UPDATE API
export const updateUserTokenApi = (payload, token) => {
  return putRequest(ENDPOINT.USER_TOKEN_UPDATE.replace(':companyId', payload.companyId), { avaros_token: payload.token });
}
