// ─── The landing's server shell ──────────────────────────────────────────────
//
// The landing itself is a client tree (HomePageClient). This wrapper exists to
// resolve the season before the HTML goes out, so the running Halloween strip
// and the hero's seasonal button are in the first paint rather than appearing —
// and pushing the hero down — once a client fetch lands. 60s matches the
// endpoint's own cache; see lib/season.server.ts.

import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const season = await getSeasonServer();
  return (
    <SeasonProvider season={season}>
      <HomePageClient />
    </SeasonProvider>
  );
}
