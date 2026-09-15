// ─── /feedback — what creators said ──────────────────────────────────────────
//
// The public wall. No sign-in, no account, no gate: the people this page is for
// are the ones deciding whether to try the product at all, and most of them
// have never logged in.
//
// ── WHY THE FIRST PAGE IS SERVER-RENDERED ───────────────────────────────────
//
// A wall of real quotes is worth something to a crawler and to anybody on a
// slow connection, and both of them see nothing if the content arrives only
// after a client fetch. So the first twenty-four are fetched here and handed to
// the client component as its initial state; the filters take over from there.
//
// `fetchPublicFeedback` swallows its own errors and answers with an empty page,
// which is the behaviour this needs: a testimonials page that 500s because the
// API hiccuped is worse than one that renders its empty state. `revalidate`
// keeps it off the API on every hit without ever being more than a few minutes
// stale — nobody is waiting on a five-minute-old rating.
//
// ── WHY THERE IS NO Review OR AggregateRating MARKUP ────────────────────────
//
// It would be the obvious thing to add and it is against Google's own rules.
// Review snippets are not allowed for reviews a business collects about ITSELF
// and shows on its own site; the documented outcome is a structured-data
// manual action, not a star in the results. The page is worth having for the
// people who read it, and the repo's SEO doctrine is to earn placements rather
// than claim them — see the note in app/(app)/showcase/page.tsx about not
// claiming videos that belong to the guides.

import type { Metadata } from "next";

import { buildMeta, SITE_URL } from "@/lib/seo";
import { fetchPublicFeedback } from "@/lib/feedback/publicFeedback";
import FeedbackWall from "./FeedbackWall";

export const revalidate = 300;

export const metadata: Metadata = buildMeta({
  title: "Feedback from creators — SubhSandesh",
  description:
    "Real ratings and words from people who made and sent a SubhSandesh page. Star ratings, what they said, and what they made — no sign-in needed.",
  alternates: { canonical: `${SITE_URL}/feedback` },
});

export default async function FeedbackPage() {
  const initial = await fetchPublicFeedback({ sort: "recent", limit: 24 });

  return (
    <main className="fbPage">
      <header className="fbHead">
        <p className="fbEyebrow">Feedback</p>
        <h1 className="fbTitle">What creators say</h1>
        <p className="fbLead">
          Every rating below was left by somebody the moment they finished a page and sent it to
          someone they love. Names are first names only — no email addresses, and never a link to
          anybody&rsquo;s card.
        </p>
      </header>

      <FeedbackWall initial={initial} />

      <style>{`
        .fbPage { min-height: 100dvh; background: #f5ede6; padding-top: 18px }
        .fbHead {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 26px 16px 22px;
          text-align: center;
        }
        @media (min-width: 600px) { .fbHead { padding: 40px 24px 28px } }
        /* 64px, not 52: the desktop nav is a floating pill over the page, and
           the eyebrow was landing about ten pixels under its edge. */
        @media (min-width: 1024px) { .fbHead { padding: 64px 32px 32px } }

        .fbEyebrow {
          margin: 0 0 10px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #a8823a;
        }
        .fbTitle {
          margin: 0;
          font-size: clamp(27px, 6.4vw, 44px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #2a0a0e;
        }
        .fbLead {
          margin: 14px auto 0;
          max-width: 62ch;
          font-size: 14.5px;
          line-height: 1.62;
          color: #7f5f5f;
        }
        @media (min-width: 600px) { .fbLead { font-size: 15.5px } }
      `}</style>
    </main>
  );
}
