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
import PwaProvider from "@/components/PwaProvider";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function StoreHydrator() {
  useEffect(() => {
    // Consume auth tokens dropped in hash by the Google bridge redirect flow
    if (window.location.hash.includes("auth_access=")) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("auth_access");
      const refreshToken = hashParams.get("auth_refresh");
      if (accessToken && refreshToken) {
        localStorage.setItem("gifts_access_token", accessToken);
        localStorage.setItem("gifts_refresh_token", refreshToken);
        // Remove auth tokens from URL bar
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

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
          <PwaProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </PwaProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
