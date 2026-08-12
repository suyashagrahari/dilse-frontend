/** One card on the Wall. Exactly what `/api/wall` returns — nothing more. */
export interface WallEntry {
  id: string;
  templateType: string;
  /** The builder slug, e.g. "court-of-love". Also the `/wall/<slug>` segment. */
  templateSlug: string;
  templateName: string;
  creatorFirstName: string;
  recipientFirstName: string;
  /** "for" → "A made this for B". "and" → "A & B". */
  pairing: "for" | "and";
  /** Team-made showcase entry. Badged, and excluded from every count. */
  isExample: boolean;
  createdAt: string;
}

/** One filter chip. Only ever built from templates that actually have entries. */
export interface WallFacet {
  slug: string;
  label: string;
  count: number;
}

export interface WallData {
  entries: WallEntry[];
  facets: WallFacet[];
  /**
   * Real count of published creations, or null when the count could not be
   * taken. Null means the headline line is omitted — never approximated.
   */
  totalCreations: number | null;
  /** Real count of approved, non-example entries. */
  sharedCount: number;
  hasMore: boolean;
  /**
   * When this data was read, as epoch ms.
   *
   * Every relative date on the page is bucketed against this one value rather
   * than against a clock read during render. Two reasons: a component reading
   * the clock is impure, and — more importantly — the server and the client must
   * bucket an entry sitting near a boundary identically or React reports a
   * hydration mismatch.
   */
  renderedAt: number;
}

export type WallSort = "recent" | "popular";
