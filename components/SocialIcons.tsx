import type { CSSProperties, ReactNode } from "react";
import { SOCIAL_ACCOUNTS, SOCIAL_LINK_ATTRS, type SocialId } from "@/lib/social";

// ── The brand's social profiles, as icon links ───────────────────────────────
//
// One component for every place the company's own accounts appear — the site
// footer and the blog — so the icons, the URLs (lib/social.ts) and the
// new-tab behaviour cannot drift between them. Not for the founder's personal
// profiles: those live on /about-us, see the note in lib/social.ts.

/*
 * One glyph per account in `SOCIAL_ACCOUNTS`. Keyed by id rather than listed in
 * order, so adding an account to lib/social.ts and forgetting a glyph here is a
 * type error at the call site rather than a silently mismatched icon.
 */
export const SOCIAL_GLYPH: Record<SocialId, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M11 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  /* The real X mark, not two crossed strokes — at 40px those read as a close
     button, which is an odd thing to put in a row of social links. */
  twitter: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.9 4H21l-6.9 7.9L21.6 20h-4.5l-4.5-5.9L7 20H4.9l7.2-8.2L4 4h4.6l4.2 5.5L18.9 4Z"
        fill="currentColor"
      />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5V17" strokeLinecap="round" />
      <circle cx="7.5" cy="7.3" r="1.05" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-3.6a2.1 2.1 0 0 1 4.2 0V17" strokeLinecap="round" />
    </svg>
  ),
};

const LIGHT: CSSProperties = {
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(61,12,17,0.14)",
  color: "#3d0c11",
};

/**
 * A row of icon links to every brand account. Each opens in a new tab and says
 * so to screen readers. `className` styles the <a> (the footer passes none and
 * styles it from its own scoped CSS); the light variant is for cream pages.
 */
export default function SocialIcons({
  variant = "light",
  size = 42,
  className = "",
}: {
  variant?: "light" | "bare";
  size?: number;
  className?: string;
}) {
  return (
    <>
      {SOCIAL_ACCOUNTS.map((a) => (
        <a
          key={a.id}
          href={a.href}
          aria-label={`SubhSandesh on ${a.label} (opens in a new tab)`}
          title={`SubhSandesh on ${a.label}`}
          {...SOCIAL_LINK_ATTRS}
          className={
            variant === "light"
              ? `inline-flex items-center justify-center rounded-full transition-colors hover:!bg-[#3d0c11] hover:!text-[#f5ede6] [&>svg]:h-[46%] [&>svg]:w-[46%] ${className}`
              : className
          }
          style={variant === "light" ? { ...LIGHT, width: size, height: size } : undefined}
        >
          {SOCIAL_GLYPH[a.id]}
        </a>
      ))}
    </>
  );
}
