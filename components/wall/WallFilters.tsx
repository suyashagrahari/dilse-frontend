import Link from "next/link";
import type { WallFacet, WallSort } from "@/lib/wall/types";
import { UI } from "./ui";

/**
 * Filter chips and the sort control.
 *
 * Plain links, no client JavaScript: each chip is its own indexable URL, which
 * is most of the reason the Wall is worth building. Selecting a filter is a
 * navigation, so a crawler follows it and a reader can share it.
 *
 * Templates with no entries have no chip. A chip reading "Proposal 0" would
 * advertise an absence and invite the fix of filling it with something invented.
 */
export default function WallFilters({
  facets,
  activeSlug,
  sort,
}: {
  facets: WallFacet[];
  activeSlug: string | null;
  sort: WallSort;
}) {
  if (facets.length === 0) return null;

  const sortSuffix = sort === "popular" ? "?sort=popular" : "";
  const chip = (active: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 13px",
    borderRadius: 999,
    fontSize: 13,
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
    border: `1px solid ${active ? UI.text : UI.border}`,
    background: active ? UI.text : "rgba(255,255,255,0.6)",
    color: active ? UI.bgSoft : UI.textMuted,
  });

  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          // The scrollbar on a chip row is noise on desktop and unnecessary on
          // touch, where the gesture is discoverable without it.
          scrollbarWidth: "none",
        }}
      >
        <Link href={`/wall${sortSuffix}`} style={chip(activeSlug === null)}>
          All
        </Link>

        {facets.map((f) => (
          <Link
            key={f.slug}
            href={`/wall/${f.slug}${sortSuffix}`}
            style={chip(activeSlug === f.slug)}
          >
            {f.label}
            <span style={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{f.count}</span>
          </Link>
        ))}
      </div>

      {/* Both orders are real: "Recent" is newest-first, "Most made" ranks by
          the same counts printed on the chips above. */}
      <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 12 }}>
        {(["recent", "popular"] as const).map((s) => {
          const active = sort === s;
          const base = activeSlug ? `/wall/${activeSlug}` : "/wall";
          return (
            <Link
              key={s}
              href={s === "popular" ? `${base}?sort=popular` : base}
              style={{
                textDecoration: "none",
                color: active ? UI.text : UI.textFaint,
                fontWeight: active ? 600 : 400,
                borderBottom: active ? `1px solid ${UI.text}` : "1px solid transparent",
                paddingBottom: 2,
              }}
            >
              {s === "recent" ? "Recent" : "Most made"}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
