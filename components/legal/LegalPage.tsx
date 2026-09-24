import Link from "next/link";
import type { ReactNode } from "react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import BusinessDetails from "@/components/legal/BusinessDetails";
import { LEGAL_LINKS } from "@/lib/business";

// ── Shared shell for every legal policy page ─────────────────────────────────
//
// Terms and Privacy were two copies of the same ~150-line layout; the refund
// and shipping policies that Razorpay requires would have made four. They now
// share this, so the cream/maroon/gold treatment, the mandala corners and the
// type scale stay identical across all of them — and every policy ends with
// the same business-details card and links to its siblings, which is what a
// payment-gateway reviewer walks through.

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";
const CORNER_SRC = "https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg";

const INK = "#2a0a0e";
const MUTED = "#7a5555";
const GOLD = "#c9a84c";
// Bright gold is decorative only (bullets). As TEXT on cream it is 1.97:1 and
// fails WCAG; these are the same hue darkened to pass — the accent matches the
// landing hero's italic "Beautiful" (large text, >=3:1), the label gold clears
// 4.5:1 for small caps.
const GOLD_ACCENT = "#8a6a1c";
const GOLD_TEXT = "#7d5f18";
const CARD = { borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.82)" } as const;

export type LegalSection = { title: string; body: ReactNode };

/** A body paragraph in the policy type style. Strings in `body` get this automatically. */
export function LegalP({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] md:text-[17px] leading-[1.8] [&+p]:mt-3 [ul+&]:mt-3" style={{ color: MUTED }}>
      {children}
    </p>
  );
}

/** A bulleted list in the policy type style, with gold markers. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] md:text-[17px] leading-[1.7]" style={{ color: MUTED }}>
          <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalStrong({ children }: { children: ReactNode }) {
  return <strong style={{ color: INK, fontWeight: 700 }}>{children}</strong>;
}

export default function LegalPage({
  path,
  titleLead,
  titleAccent,
  effectiveDate,
  intro,
  sections,
  cta,
}: {
  /** This page's route, so the sibling-policy bar can mark it as current. */
  path: string;
  titleLead: string;
  titleAccent: string;
  effectiveDate: string;
  intro: ReactNode;
  sections: LegalSection[];
  cta: { title: string; text: ReactNode };
}) {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#f5ede6", color: INK, fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER_SRC} alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER_SRC} alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER_SRC} alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CORNER_SRC} alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>

      <LuxuryMobileTopBrand />

      <section className="relative z-[1] max-w-5xl mx-auto px-4 md:px-6 pt-10 pb-24 md:pt-32">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3 text-center" style={{ color: GOLD_TEXT }}>
          Legal
        </p>
        <h1 className="text-[40px] md:text-[70px] leading-[0.94] tracking-[-0.03em] text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          {titleLead}
          <em style={{ color: GOLD_ACCENT, fontStyle: "italic" }}> {titleAccent}</em>
        </h1>
        <p className="mt-4 text-center text-sm md:text-base" style={{ color: MUTED }}>
          Effective Date: {effectiveDate}
        </p>
        <div className="mt-5 text-center text-base md:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
          {intro}
        </div>

        <nav aria-label="Legal policies" className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {LEGAL_LINKS.map((l) => {
            const current = l.href === path;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={current ? "page" : undefined}
                className="inline-flex items-center rounded-full px-4 py-2 text-[13px] font-semibold"
                style={
                  current
                    ? { background: "#3d0c11", color: "#f5ede6", textDecoration: "none" }
                    : { background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: INK, textDecoration: "none" }
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-9 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border p-5 md:p-7" style={CARD}>
              <h2 className="text-[28px] md:text-[36px] leading-[1.04] tracking-[-0.02em] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                {section.title}
              </h2>
              {typeof section.body === "string" ? <LegalP>{section.body}</LegalP> : section.body}
            </article>
          ))}
        </div>

        <div className="mt-10">
          <BusinessDetails />
        </div>

        <div className="mt-6 rounded-3xl border p-5 md:p-7 text-center" style={CARD}>
          <h2 className="text-[30px] md:text-[42px] leading-[1.04] tracking-[-0.02em] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {cta.title}
          </h2>
          <div className="text-base md:text-lg" style={{ color: MUTED }}>
            {cta.text}
          </div>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact-us" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold" style={{ background: "#3d0c11", color: "#f5ede6", textDecoration: "none" }}>
              Contact Us
            </Link>
            <Link href="/help" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold" style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: INK, textDecoration: "none" }}>
              Help Centre
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
