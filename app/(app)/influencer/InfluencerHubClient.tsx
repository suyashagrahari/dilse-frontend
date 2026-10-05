"use client";

// /influencer — three states on one route, so every entry point (navbar,
// profile, drawer) can link here without knowing which one applies:
//   signed out → the pitch + sign in
//   signed in, not an influencer → instant signup (InfluencerJoin)
//   influencer → the dashboard

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import type { InfluencerDashboard } from "@/lib/influencer";
import InfluencerJoin from "@/components/influencer/InfluencerJoin";
import InfluencerPitch from "@/components/influencer/InfluencerPitch";
import InfluencerDashboardView from "@/components/influencer/InfluencerDashboardView";
import AuthModal from "@/components/AuthModal";

export default function InfluencerHubClient() {
  const { user, accessToken, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  const isInfluencer = !!user?.influencer;
  const [data, setData] = useState<InfluencerDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [terms, setTerms] = useState({ defaultCommissionPercent: 30, attributionDays: 60 });

  useEffect(() => {
    fetch(`${API_URL}/influencer/program`)
      .then((r) => r.json())
      .then((d) => d.success && setTerms(d.data))
      .catch(() => {});
  }, []);
  // Auth is read from localStorage on the client, so the server cannot know
  // which of the three states to render. Render nothing state-specific until
  // mounted, or hydration mismatches (React #418).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const load = useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    try {
      const r = await fetch(`${API_URL}/influencer/dashboard`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || "Failed to load");
      setData(d.data);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isInfluencer) void load();
  }, [isInfluencer, load]);

  const saveProfile = async (p: { instagram: string; upiId: string }) => {
    const r = await fetch(`${API_URL}/influencer/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(p),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.success) return d.error || "Could not save";
    await load();
    return null;
  };

  let body: React.ReactNode;
  if (!mounted) {
    body = <Spinner />;
  } else if (!isAuthenticated) {
    body = isLoading ? (
      <Spinner />
    ) : (
      <InfluencerPitch
        percent={terms.defaultCommissionPercent}
        attributionDays={terms.attributionDays}
        cta={{ label: "Start earning, it's free", onClick: () => setAuthOpen(true) }}
      />
    );
  } else if (!isInfluencer) {
    body = (
      <>
        <InfluencerPitch
          compact
          percent={terms.defaultCommissionPercent}
          attributionDays={terms.attributionDays}
          cta={{ label: "Claim my link", onClick: () => document.getElementById("join")?.scrollIntoView({ behavior: "smooth" }) }}
        />
        <InfluencerJoin onJoined={() => void load()} />
      </>
    );
  } else if (error) {
    body = (
      <div className="ihc-signin">
        <p>{error}</p>
        <button type="button" onClick={() => void load()}>Try again</button>
      </div>
    );
  } else if (!data) {
    body = <Spinner />;
  } else {
    body = <InfluencerDashboardView data={data} mode="self" onSaveProfile={saveProfile} />;
  }

  return (
    <main className="ihc">
      <style>{CSS}</style>
      <div className="ihc-wrap">{body}</div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} defaultMode="register" />}
    </main>
  );
}

function Spinner() {
  return (
    <div style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", color: BRAND.accent }}>
      <Loader2 size={26} style={{ animation: "ihc-spin 1s linear infinite" }} />
    </div>
  );
}

const CSS = `
  .ihc { min-height: 100vh; background: radial-gradient(120% 60% at 50% 0%, #fffaf3 0%, ${BRAND.bg} 55%); padding: 12px 0 120px; overflow-x: clip; }
  .ihc-wrap { width: min(1160px, 100%); margin: 0 auto; padding: 0 16px; box-sizing: border-box; }
  .ihc-signin { max-width: 460px; margin: 60px auto; text-align: center; padding: 32px 22px; border-radius: 24px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; }
  .ihc-signin h1 { margin: 12px 0 8px; font-family: 'Playfair Display', serif; font-size: 26px; color: ${BRAND.text}; }
  .ihc-signin p { margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.muted}; }
  .ihc-signin button { margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 24px; border-radius: 99px; border: none; background: ${BRAND.gradient}; color: #f5ede6; font-weight: 800; font-size: 14.5px; cursor: pointer; }
  @keyframes ihc-spin { to { transform: rotate(360deg); } }
  @media (min-width: 768px) { .ihc { padding-top: 96px; padding-bottom: 60px; } }
`;
