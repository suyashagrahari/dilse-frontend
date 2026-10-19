// A small, quiet card under the FREE wedding templates (/wedding-shaadi,
// /shaadi-card) pointing to the paid wedding invitation websites. Not an
// upsell wall: the free page keeps its own keywords and flow; this is one
// crawlable block of related links below it. Server component, no JS.
import Link from "next/link";

const VARIANTS = {
  shaadi: {
    heading: "Want a full wedding website?",
    body: "Put every function, your love story, a Pinterest-style photo gallery and RSVP per function on one link, with foil-gold themes and a cinematic opening.",
    links: [
      { href: "/wedding-invitation", label: "Wedding Invitation — elegant invite with RSVP →" },
      { href: "/wedding-invitation-premium", label: "Wedding Invitation ✦ Premium — Haldi to Reception on one link →" },
      { href: "/royal-wedding-invitation", label: "Royal Wedding Invitation 👑 — palace gates & blessings wall →" },
    ],
  },
  card: {
    heading: "Going all out?",
    body: "Turn your shaadi card into a royal invitation: palace gates that open to shehnai, gold-foil monogram, every function with maps and a guest blessings wall.",
    links: [
      { href: "/royal-wedding-invitation", label: "See the Royal Wedding Invitation 👑 →" },
      { href: "/wedding-invitation", label: "Or an elegant invite with RSVP →" },
    ],
  },
} as const;

export default function WeddingTiersCrossLink({ variant }: { variant: keyof typeof VARIANTS }) {
  const v = VARIANTS[variant];
  return (
    <aside
      aria-label={v.heading}
      style={{ position: "relative", zIndex: 1, margin: "0 auto", padding: "28px 16px 96px", maxWidth: 720, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <div style={{ borderRadius: 18, padding: "20px 20px 16px", background: "linear-gradient(135deg, #3a0913, #5e1424)", color: "#fbecd4", boxShadow: "0 18px 40px -24px rgba(58,9,19,.6)" }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#efd08c" }}>{v.heading}</p>
        <p style={{ margin: "6px 0 12px", fontSize: 14.5, lineHeight: 1.55, opacity: 0.9 }}>{v.body}</p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
          {v.links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "#f3d98f", fontSize: 14.5, fontWeight: 600, textDecoration: "none" }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
