// ─── /showcase — the unlisted video wall ─────────────────────────────────────
//
// Twelve template walkthroughs, each available from our own CDN, YouTube and
// Instagram. Built to be handed to somebody as a link.
//
// ── WHY IT IS UNLISTED RATHER THAN PRIVATE ──────────────────────────────────
//
// The ask was "the page exists but a user cannot reach it from any button, tab
// or menu — only the link". That is unlisted, not private, and the difference
// matters: anybody with the URL can open it, so nothing confidential belongs
// here. What it does buy is that the page is not part of the site's navigation
// and not advertised to search engines.
//
// Three things enforce that, because any one of them alone leaks:
//
//   1. NOTHING LINKS HERE. No nav item, no footer column, no card. `grep -rn
//      "/showcase"` finds this file and lib/site-routes.ts and nothing else.
//   2. `robots: noindex, nofollow` below — the meta tag crawlers actually read.
//   3. `/showcase` is registered in NON_INDEXABLE_ROUTES, which keeps it out of
//      app/sitemap.ts. Without that entry `npm run seo:check` fails, which is
//      deliberate: an unclassified route is a bug in this codebase, so the page
//      cannot be added without a decision being recorded about indexing it.
//
// A visitor who guesses the URL still gets the page. If it ever needs to be
// genuinely private, it needs auth, not a quieter URL.

import type { Metadata } from "next";

import ShowcaseClient from "./ShowcaseClient";

export const metadata: Metadata = {
  title: "Template walkthroughs | SubhSandesh",
  description:
    "Every SubhSandesh template, built start to finish on video. Watch here, on YouTube, or on Instagram.",
  // Belt and braces with NON_INDEXABLE_ROUTES: the sitemap omission stops us
  // advertising it, this stops a crawler that arrives some other way.
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
