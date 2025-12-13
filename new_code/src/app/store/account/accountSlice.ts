import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AccountState {
  profileData: any,
  companyData: any,
  currentSubscriptionData: any,
  billingUsageData: any
}

const initialState: AccountState = {
  profileData: {},
  companyData: {},
  currentSubscriptionData: {},
  billingUsageData: {}
}

export const counterSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    storeData: (state,action: PayloadAction<any>) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
        state.profileData = action?.payload
      },
      storeCompanyData: (state,action: PayloadAction<any>) => {
        state.companyData = action?.payload
      },
      storeCurrentSubscriptionData: (state,action: PayloadAction<any>) => {
        state.currentSubscriptionData = action?.payload
      },
      storeBillingUsageData: (state,action: PayloadAction<any>) => {
        state.billingUsageData = action?.payload
      }
  },
})

// Action creators are generated for each case reducer function
export const { storeData,storeCompanyData,storeCurrentSubscriptionData,storeBillingUsageData } = counterSlice.actions

export default counterSlice.reducer