// ─── The brand's social accounts ─────────────────────────────────────────────
//
// One place for the company's own profiles, so a footer, an About page, a
// share sheet and a JSON-LD `sameAs` cannot disagree about where we are.
//
// ── WHY THIS IS NOT THE LIST ON /about-us ───────────────────────────────────
//
// `app/(app)/about-us/page.tsx` has its own `LINKS` object with a LinkedIn, an
// X and an Instagram in it. Those are the FOUNDER'S personal accounts, sitting
// on a founder bio card, and they are correctly scoped to that page. Merging
// the two lists would eventually point the site footer at a personal profile,
// which is why they stay separate and this comment exists.
//
// ── WHY THERE ARE ONLY FOUR ─────────────────────────────────────────────────
//
// The footer used to render Instagram, X, WhatsApp, Facebook and YouTube, every
// one of them `href="#"`. A dead link in a footer is worse than an absent one:
// it looks maintained, it wastes a tap, and crawlers follow it. There is no
// WhatsApp channel and no Facebook page, so those two are gone rather than
// stubbed. Add an entry here when an account actually exists.
//
// Reddit was named when this list was written but no URL was supplied, so it is
// deliberately absent rather than guessed at.

export type SocialId = "instagram" | "youtube" | "twitter" | "linkedin";

export interface SocialAccount {
  id: SocialId;
  /** Accessible name. "X" rather than "Twitter" — it is what the site says. */
  label: string;
  href: string;
}

/**
 * Display order: the two we actually publish to first, then the rest.
 *
 * Instagram and YouTube are where the template walkthroughs go, so they are
 * the two most likely to be worth a tap from a footer.
 */
export const SOCIAL_ACCOUNTS: readonly SocialAccount[] = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/subhsandesh_official" },
  { id: "youtube",   label: "YouTube",   href: "https://www.youtube.com/@SubhSandesh_official" },
  { id: "twitter",   label: "X",         href: "https://x.com/SubhSandes75655" },
  { id: "linkedin",  label: "LinkedIn",  href: "https://www.linkedin.com/company/subhsandesh" },
] as const;

/** Keyed lookup, for a caller that wants one by name. */
export const SOCIAL: Record<SocialId, string> = Object.fromEntries(
  SOCIAL_ACCOUNTS.map((a) => [a.id, a.href])
) as Record<SocialId, string>;

/**
 * The attributes every outbound social link needs.
 *
 * `noopener` is the one that matters — without it the opened tab gets a
 * `window.opener` handle back into this origin.
 */
export const SOCIAL_LINK_ATTRS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
