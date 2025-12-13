/* eslint-disable no-undef */
import axios from "axios";
import { getToken, removeHasPhoneNumber, removeHasSubscription, removeIsOnboardingDone, removeToken } from "../_utils/cookies";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// export const axiosClient = axios.create({
//   baseURL: 'https://c540d7ceb9a4.ngrok-free.app',
//   timeout: 30000,
//   headers: {
//     Accept: "application/json",
//     "ngrok-skip-browser-warning": true,
//   },
// });

axiosClient.interceptors.request.use(
  (config) => {
    const hasAccessToken = getToken();
    hasAccessToken &&
      (config.headers.Authorization = `Bearer ${hasAccessToken}`);

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = "multipart/form-data";
    } else {
      config.headers['Content-Type'] = "application/json";
    }
    return config;
  },
  (error) => {
    // logError(error);
    return Promise.reject(error);
  },
  { synchronous: true }
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response) {
      return response;
    } else if (response.data) {
      return { ...response.data };
    }
    return Promise.reject(response.data);
  },
  (error) => {
    console.log("Error status:", error); // Log the error status
    // logError("error",error);

    switch (error?.response?.status) {
      case 400:
        return Promise.reject(error.response.data);
      case 401:
        console.log("About to call unauthorizeAccess"); // Log before calling
        unauthorizeAccess();
        return Promise.reject(error.response.data);
      case 403:
        unauthorizeAccess();
        return Promise.reject(error.response.data);
      case 404:
      // unauthorizeAccess();
      // return Promise.reject(error.response.data);
      case 405:
        return Promise.reject(error.response.data);
      case 500:
        return Promise.reject(error.response.data);
      case 501:
        return Promise.reject(error.response.data);
      case 502:
        return Promise.reject(error.response.data);
      case 422:
        unauthorizeAccess();
        return Promise.reject(error.response.data);
      default:
        return Promise.reject(error);
    }
  }
);

function getUrl(config) {
  if (config?.baseURL) {
    let _url = config?.url;
    return _url.replace(config?.baseURL, "");
  }
  return config?.url;
}

// const logError = (error) => {
//   console.log(
//     `% c#ERROR ${error?.response?.status} - ${getUrl(
//       error?.response?.config
//     )}: `,
//     "color: #f44336; font-weight: bold",
//     error?.response?.statusText
//   );
// };

const unauthorizeAccess = () => {
  console.log("Unauthorized access triggered");
  removeToken();
  removeIsOnboardingDone();
  setTimeout(() => {
    window.location.reload();
  }, 1000); // Small delay to ensure data is cleared
};