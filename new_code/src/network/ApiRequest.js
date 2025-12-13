import { axiosClient } from "./ApiClient";

export const getRequest = (url) => {
  return axiosClient.get(url);
};

export const postRequest = (url, payload) => {
  console.log("this is Api payload inside ", payload);
  return axiosClient.post(url, payload);
};

export const putRequest = (url, payload) => {
  return axiosClient.put(url, payload);
};

export const deleteRequest = (url) => {
  return axiosClient.delete(url);
};

export const patchRequest = (url, payload) => {
  return axiosClient.patch(url, payload);
};

export const getDownloadRequest = (url, payload) => {
  return axiosClient.get(url, {
    responseType: "blob",
  });
};

export const getSubscriptionType = () => {
  return axiosClient.get(url);
};

export const bulkUploadRequest = (url, payload) => {
  return axiosClient.post(url, payload, {
    timeout: 1200000, // 20 minutes timeout
  });
};