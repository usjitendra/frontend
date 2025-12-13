import { createAsyncThunk } from "@reduxjs/toolkit";
import { storeBillingUsageData, storeCompanyData, storeCurrentSubscriptionData, storeData } from "./accountSlice";
import { getBillingUsageApi, getCompanyApi, getCurrentSubscriptionApi, getProfileApi } from "@/network/Api";

export const fetchCompanyDetailAction = createAsyncThunk(
  "account/fetchCompanyDetailAction",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      getProfileApi().then((response:any)=>{
          if (response?.data) {
            dispatch(storeData(response?.data?.data));
          }
        })
        .catch((errors:any) => {
          console.log("errors", errors);
        });
    } catch (error) {
      console.log(error);
    }
  }
);

export const fetchCompanyAction = createAsyncThunk(
  "account/fetchCompanyAction",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      getCompanyApi().then((response:any)=>{
          if (response?.data) {
            dispatch(storeCompanyData(response?.data?.data));
          }
        })
        .catch((errors:any) => {
          console.log("errors", errors);
        });
    } catch (error) {
      console.log(error);
    }
  }
);

export const fetchCurrentSubscriptionAction = createAsyncThunk(
  "account/fetchCurrentSubscriptionAction",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      getCurrentSubscriptionApi().then((response:any)=>{
        if (response?.data) {
          dispatch(storeCurrentSubscriptionData(response?.data?.data?.subscription));
        }
      })
      .catch((errors:any) => {
        console.log("errors", errors);
      });
    } catch (error) {
      console.log(error);
    }
  }
);

export const fetchBillingUsageAction = createAsyncThunk(
  "account/fetchBillingUsageAction",
  async (_, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      getBillingUsageApi().then((response:any)=>{
        if (response?.data) {
          dispatch(storeBillingUsageData(response?.data?.data));
        } 
      })
      .catch((errors:any) => {
        console.log("errors", errors);
      });
    } catch (error) {
      console.log(error);
    }
  }
);