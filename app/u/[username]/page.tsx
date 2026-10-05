"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import dynamic from "next/dynamic";
import InfluencerLanding, { type PublicInfluencer } from "@/components/influencer/InfluencerLanding";

// Lazy-load the full homepage — only rendered when subdomain is valid
const HomePage = dynamic(() => import("@/app/(app)/page"), { ssr: false });

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  return h;
}

type Status = "loading" | "found" | "influencer" | "not_found";

export default function SubdomainRootPage() {
  const params = useParams();
  const username = params.username as string;
  const [status, setStatus] = useState<Status>("loading");
  const [influencer, setInfluencer] = useState<PublicInfluencer | null>(null);

  useEffect(() => {
    if (!username) return;
    // An active influencer's subdomain root is their invite page; anyone else's
    // keeps the homepage it always served.
    const inf = fetch(`${API_URL}/influencer/public/${encodeURIComponent(username)}`, { headers: apiHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    const user = fetch(`${API_URL}/share/u/${username}`, { headers: apiHeaders() })
      .then((r) => r.json())
      .catch(() => null);
    Promise.all([inf, user]).then(([i, u]) => {
      if (i?.success) {
        setInfluencer(i.data);
        setStatus("influencer");
      } else setStatus(u?.success ? "found" : "not_found");
    });
  }, [username]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "var(--app-accent-a08)" }}
          >
            <Sparkles size={28} style={{ color: "var(--app-accent)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--app-bg)" }}
      >
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1
            className="text-2xl font-black mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--app-text)" }}
          >
            @{username} not found
          </h1>
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            This page doesn&apos;t exist or the user hasn&apos;t set up their profile yet.
          </p>
        </div>
      </div>
    );
  }

  if (status === "influencer" && influencer) return <InfluencerLanding influencer={influencer} />;

  // User exists — render the full homepage as-is
  return <HomePage />;
}
