"use client";

import { useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

// This page lives on the ROOT domain (subhsandesh.in / klyro.digital).
// When a user is on a subdomain and clicks "Continue with Google", we open
// this page as a small popup. Google's origin check sees the root domain
// (which is in the authorized JavaScript origins list), so the popup works.
// On success we postMessage the access_token back to the opener, then close.

export default function GoogleBridgePage() {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (window.opener) {
        window.opener.postMessage(
          { type: "GOOGLE_BRIDGE_SUCCESS", accessToken: tokenResponse.access_token },
          "*"
        );
      }
      window.close();
    },
    onError: () => {
      if (window.opener) {
        window.opener.postMessage({ type: "GOOGLE_BRIDGE_ERROR" }, "*");
      }
      window.close();
    },
  });

  useEffect(() => {
    // Auto-trigger the Google popup as soon as this page loads
    const t = setTimeout(() => login(), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 size={32} className="animate-spin text-violet-500" />
      <p className="text-sm text-gray-500 font-medium">Connecting with Google…</p>
    </div>
  );
}
