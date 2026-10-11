"use client";

// ─── The running strip's place, held while the visitor's side resolves ───────
//
// With India and abroad wearing different seasons, the server render cannot
// know which strip this visitor gets (lib/season.server.ts), so the strip is
// left out of the first paint. When BOTH sides wear a drop, each side's strip
// has the same box (HalloweenOfferBar / FestivalOfferBar: 52px, 46px on
// phones, same rim and margin), so this holds exactly that box — a quiet,
// neutral bar — and the right strip replaces it without moving anything.
// Renders nothing in every other case (split off, already resolved, or one
// side showing no strip).

import { useSeasonPending } from "@/hooks/useSeason";
import { stripOnBothSides } from "@/lib/season";

export default function SeasonPendingStrip({ className = "" }: { className?: string }) {
  const pending = useSeasonPending();
  if (!stripOnBothSides(pending)) return null;
  // Carries the real strip's wrapper class too (`hwb-wrap` + the page's own
  // modifier, e.g. `hwb-home`), so the page CSS that places the strip places
  // this the same way.
  return (
    <div className={`hwb-wrap ssp-wrap ${className}`} aria-hidden data-season-pending="">
      <style>{SSP_CSS}</style>
      <span className="ssp" />
    </div>
  );
}

const SSP_CSS = `
html[data-hw-bar-off] .ssp-wrap { display: none !important; }
.ssp-wrap { position: relative; margin: 0 0 18px; padding: 2px; border-radius: 17px; }
.ssp { display: block; height: 52px; border-radius: 15px;
  background: linear-gradient(100deg, rgba(61,12,17,.05) 30%, rgba(61,12,17,.09) 50%, rgba(61,12,17,.05) 70%);
  background-size: 300% 100%; animation: sspShimmer 1.4s ease-in-out infinite; }
@keyframes sspShimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
@media (max-width: 640px) {
  .ssp-wrap { padding: 1.5px; border-radius: 14px; }
  .ssp { height: 46px; border-radius: 12.5px; }
}
@media (prefers-reduced-motion: reduce) { .ssp { animation: none; } }
`;
