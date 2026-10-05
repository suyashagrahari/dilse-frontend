import type { Metadata } from "next";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import InfluencerLanding, { type PublicInfluencer } from "@/components/influencer/InfluencerLanding";
import { BRAND } from "@/lib/brand";

// /r/priya — the influencer's short link, for bios that want a path rather
// than a subdomain (and the only form that works on staging and localhost).

async function fetchInfluencer(code: string): Promise<PublicInfluencer | null> {
  try {
    const res = await fetch(`${API_URL}/influencer/public/${encodeURIComponent(code)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const body = await res.json();
    return body.success ? (body.data as PublicInfluencer) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const inf = await fetchInfluencer(code);
  const title = inf ? `${inf.name} invited you to SubhSandesh` : "SubhSandesh invite";
  return {
    title,
    description: "Make a heartfelt digital surprise for someone you love, free to start.",
    robots: { index: false, follow: true },
    openGraph: { title, description: "Make a heartfelt digital surprise for someone you love, free to start." },
  };
}

export default async function InviteShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const inf = await fetchInfluencer(code);
  if (inf) return <InfluencerLanding influencer={inf} />;
  return <InviteNotFound />;
}

function InviteNotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: BRAND.bg }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontSize: 52 }}>💌</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: BRAND.text, fontSize: 26, margin: "10px 0 6px" }}>
          This invite link isn&apos;t active
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
          The link may be misspelled, or the invite has ended. You can still make something lovely.
        </p>
        <Link
          href="/templates"
          style={{ display: "inline-block", marginTop: 18, padding: "12px 22px", borderRadius: 99, background: BRAND.gradient, color: "#f5ede6", fontWeight: 800, textDecoration: "none" }}
        >
          Browse templates
        </Link>
      </div>
    </main>
  );
}
