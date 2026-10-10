// ─── The gallery's server shell ──────────────────────────────────────────────
//
// The gallery itself is a client component: filters, a search modal and Redux
// favourites. This wrapper exists for one reason — to resolve which templates
// are hidden BEFORE the HTML goes out.
//
// Without it the gallery renders the whole catalogue, then removes the thirty-odd
// entries an admin has switched off once a client fetch lands. Held-back
// templates were on screen, and in the crawled markup, on every single load.
//
// ── WHY NOT IN `(app)/layout.tsx`, WHICH WOULD COVER BOTH CONSUMERS ─────────
//
// Because that layout also wraps `/blog`, whose pages revalidate hourly. A route
// takes the lowest revalidate of anything in it, so a 60-second fetch up there
// would quietly pull ~870 blog pages down to regenerating every minute. The two
// pages that actually read this list ask for it themselves instead.

import { TemplateVisibilityProvider } from "@/components/TemplateVisibilityProvider";
import { getHiddenTemplatesServer } from "@/lib/templateVisibility.server";
import { getSeasonServer } from "@/lib/season.server";
import { SeasonProvider } from "@/hooks/useSeason";
import TemplatesPageClient from "./TemplatesPageClient";

export default async function TemplatesPage() {
  const [hidden, season] = await Promise.all([getHiddenTemplatesServer(), getSeasonServer()]);

  return (
    <TemplateVisibilityProvider hidden={hidden}>
      <SeasonProvider season={season}>
        <TemplatesPageClient />
      </SeasonProvider>
    </TemplateVisibilityProvider>
  );
}
