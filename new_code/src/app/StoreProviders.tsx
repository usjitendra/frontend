"use client";

import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";
import { store } from "./store/store";
import AuthProvider from "./AuthProvider";

export default function StoreProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </Provider>
  );
}