"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { checkAuth, hydrateAuth } from "@/store/authSlice";
import { fetchFavorites } from "@/store/favoritesSlice";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function StoreHydrator() {
  useEffect(() => {
    store.dispatch(hydrateAuth());
    const token = localStorage.getItem("gifts_access_token");
    if (token) {
      store.dispatch(checkAuth()).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          store.dispatch(fetchFavorites());
        }
      });
    }
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <StoreHydrator />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
