// ─── /feedback — what creators said ──────────────────────────────────────────
//
// The public wall. No sign-in, no account, no gate: the people this page is for
// are the ones deciding whether to try the product at all, and most of them
// have never logged in. Nothing on this page reads the session, so it renders
// identically for a signed-out stranger and for the person who wrote the top
// review.
//
// ── WHAT THE COPY HAS TO DO ─────────────────────────────────────────────────
//
// One job: convince somebody that these are real people, not marketing. So the
// lead says who wrote them and what we do NOT do to them — no editing, no
// hiding the low ones — because that is the claim a testimonial page lives or
// dies on, and it is a claim this page can actually keep: the rows come
// straight out of the feedback modal, the distribution shows every star
// including the ones we would rather not, and there is no "featured" flag
// anywhere in the model to put a thumb on the scale with.
//
// An earlier version spent its lead explaining the privacy mechanics instead —
// first names only, no links to anybody's card. True, and the wrong thing to
// lead with: a reader who has not yet decided these are real people does not
// care how carefully we hide the parts we are not showing. The privacy promise
// is still kept, it is just kept in the projection on the server rather than
// announced in the headline.
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
    "Real, unedited reviews from people who made and sent a SubhSandesh page. Star ratings and their own words, open to everyone — no sign-in needed.",
  alternates: { canonical: `${SITE_URL}/feedback` },
});

export default async function FeedbackPage() {
  // ── WRITTEN REVIEWS FIRST, WITH A FALLBACK ───────────────────────────────
  //
  // Most people rate and leave; a wall that opens on a grid of bare stars is a
  // chart, not a testimonial page, and the sentences are the only part a
  // stranger can actually read. So the default view is the ones with words.
  //
  // The fallback matters more than it looks. Early on — a new deploy, a fresh
  // environment — there can be genuine ratings and not one sentence yet, and
  // defaulting to words would then render "nothing here yet" directly over a
  // real average. When there is nothing written, the page opens on everything
  // instead and the toggle starts off, so the wall is never emptier than the
  // data.
  const written = await fetchPublicFeedback({ sort: "recent", words: true, limit: 24 });
  const wordsFirst = written.items.length > 0 || written.stats.total === 0;
  const initial = wordsFirst
    ? written
    : await fetchPublicFeedback({ sort: "recent", limit: 24 });

  // The headline, lead and trust row live in the wall's maroon hero, beside
  // the summary they are the claim for — see FeedbackWall.
  return (
    <main className="fbPage">
      <FeedbackWall initial={initial} initialWords={wordsFirst} />
      <style>{`.fbPage { min-height: 100dvh; background: radial-gradient(900px 480px at 100% 0%, rgba(201,168,76,0.14), transparent 60%), #f5ede6 }`}</style>
    </main>
  );
}
