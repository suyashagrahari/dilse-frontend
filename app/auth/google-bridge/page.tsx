"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { API_URL, SITE_URL } from "@/lib/config";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleBridgePage() {
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const hashParams = new URLSearchParams(hash);
    const googleAccessToken = hashParams.get("access_token");
    const stateParam = hashParams.get("state");

    if (googleAccessToken) {
      // Phase 2: returned from Google with access_token in hash
      const returnTo = stateParam ? decodeURIComponent(stateParam) : "/";

      (async () => {
        try {
          const userInfoRes = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${googleAccessToken}` } }
          );
          const profile = await userInfoRes.json();

          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credential: googleAccessToken,
              profile: {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                sub: profile.sub,
              },
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Auth failed");

          const { accessToken: jwt, refreshToken } = data.data;

          // Redirect back to the originating subdomain page with tokens in hash
          const destination = new URL(returnTo);
          destination.hash = `auth_access=${jwt}&auth_refresh=${encodeURIComponent(refreshToken)}`;
          window.location.href = destination.toString();
        } catch {
          setError("Google sign-in failed. Please go back and try again.");
        }
      })();
    } else {
      // Phase 1: redirect this page to Google OAuth
      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get("return_to") || "/";

      if (!GOOGLE_CLIENT_ID) {
        setError("Google login is not configured.");
        return;
      }

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${SITE_URL}/auth/google-bridge`,
        response_type: "token",
        scope: "openid email profile",
        state: encodeURIComponent(returnTo),
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-red-600 font-medium text-sm">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
      <Loader2 size={28} className="animate-spin text-violet-500" />
      <p className="text-sm text-gray-500">Connecting with Google…</p>
    </div>
  );
}
