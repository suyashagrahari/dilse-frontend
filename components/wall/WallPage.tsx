import { fetchWall } from "@/lib/wall/api";
import { wallCaption } from "@/lib/wall/format";
import type { WallSort } from "@/lib/wall/types";
import { SITE_URL } from "@/lib/config";
import WallFilters from "./WallFilters";
import WallGrid from "./WallGrid";
import WallEmpty from "./WallEmpty";
import { UI } from "./ui";

/**
 * The Wall, rendered on the server for both `/wall` and `/wall/<template>`.
 *
 * Every number printed here is counted, and the one line that could not be
 * counted is not printed. `totalCreations` arrives as null when the count
 * failed, and the headline disappears rather than degrading to an estimate.
 */
export default async function WallPage({
  slug = null,
  sort = "recent",
  heading,
  intro,
}: {
  slug?: string | null;
  sort?: WallSort;
  heading: string;
  intro?: string;
}) {
  const data = await fetchWall({ slug: slug ?? undefined, sort });

  // A filtered view with almost nothing in it gets the rest of the Wall
  // underneath, so the page still reads as composed. The two sets are labelled
  // and never silently merged.
  const thin = Boolean(slug) && data.entries.length > 0 && data.entries.length < 3;
  const more = thin ? await fetchWall({ limit: 8 }) : null;
  const moreEntries = more
    ? more.entries.filter((e) => !data.entries.some((d) => d.id === e.id))
    : [];

  // Stamped by the fetch, not read here: a component that reads the clock is
  // impure, and the server and client must bucket every date against the same
  // instant or React reports a hydration mismatch on any entry near a boundary.
  const now = data.renderedAt;

  // The headline needs both numbers to be present AND coherent.
  //
  // `totalCreations` is counted across 30 collections and cached for a minute,
  // while `sharedCount` is counted per request — so for up to 60 seconds after a
  // burst of new pages the total can lag behind the shared figure and produce
  // "3 pages made. 5 shared here.", which reads as broken arithmetic and
  // undermines the one thing these numbers are for. When they disagree the line
  // is dropped rather than patched up; it reappears on the next revalidate.
  const showCounts =
    data.totalCreations !== null &&
    data.sharedCount > 0 &&
    data.totalCreations >= data.sharedCount;

  return (
    // md:pt-[88px] clears the fixed desktop nav — the same offset the templates
    // gallery uses. Without it the H1 renders underneath the nav bar.
    <main className="md:pt-[88px]" style={{ background: UI.bg, minHeight: "100dvh" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 72px" }}>
        <header style={{ marginBottom: 26 }}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(28px, 5vw, 42px)",
              lineHeight: 1.12,
              color: UI.text,
              margin: 0,
            }}
          >
            {heading}
          </h1>

          {intro && (
            <p
              style={{
                fontSize: 15,
                color: UI.textMuted,
                lineHeight: 1.65,
                margin: "12px 0 0",
                maxWidth: 560,
              }}
            >
              {intro}
            </p>
          )}

          {showCounts && (
            <p style={{ fontSize: 13, color: UI.textFaint, margin: "12px 0 0" }}>
              {data.totalCreations!.toLocaleString("en-IN")} pages made.{" "}
              {data.sharedCount.toLocaleString("en-IN")} shared here.
            </p>
          )}
        </header>

        <WallFilters facets={data.facets} activeSlug={slug} sort={sort} />

        {data.entries.length === 0 ? (
          <WallEmpty slug={slug} />
        ) : (
          <>
            <WallGrid entries={data.entries} now={now} />

            {thin && moreEntries.length > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    margin: "44px 0 24px",
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: UI.border }} />
                  <span style={{ fontSize: 12, color: UI.textFaint, whiteSpace: "nowrap" }}>
                    More from the Wall
                  </span>
                  <span style={{ flex: 1, height: 1, background: UI.border }} />
                </div>
                <WallGrid entries={moreEntries} now={now} />
              </>
            )}
          </>
        )}

        {/* Structured data for the entries actually on the page. Examples are
            included here because they are genuinely on the page and badged as
            examples; they remain excluded from the counts above. */}
        {data.entries.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: heading,
                numberOfItems: data.entries.length,
                itemListElement: data.entries.map((e, i) => {
                  const c = wallCaption(e);
                  return {
                    "@type": "ListItem",
                    position: i + 1,
                    name: `${c.lead}${c.joiner}${c.trail}`,
                    url: `${SITE_URL}/${e.templateSlug}`,
                  };
                }),
              }),
            }}
          />
        )}
      </div>
    </main>
  );
}
