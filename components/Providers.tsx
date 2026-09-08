"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { checkAuth, hydrateAuth } from "@/store/authSlice";
import { fetchFavorites } from "@/store/favoritesSlice";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import PwaProvider from "@/components/PwaProvider";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

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

        // This redirect flow never dispatches googleLogin, so the redux
        // analytics middleware cannot see it. Without this call, every login
        // that happens on a subdomain would be missing from the funnel.
        track(EVENTS.LOGIN, { method: "google_bridge" });
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
          <AnalyticsProvider />
          <PwaProvider>
            <TooltipProvider>
              {/* No toast host here on purpose. There is exactly one toast in
                  this app — components/toast/ToastHost — and it is mounted per
                  route group beside the share, feedback and paywall hosts. Two
                  more used to be mounted at this level: shadcn's <Toaster/>,
                  which nothing had called in a long time, and <Sonner/>, which
                  two components in the `app` template used. Both shipped in
                  every bundle for every visitor. See lib/toast/toastBus.ts. */}
              {children}
            </TooltipProvider>
          </PwaProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
