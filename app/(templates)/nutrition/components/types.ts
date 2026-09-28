// ─── Nutrition Facts — frozen data contract ──────────────────────────────────
//
// A parody nutrition panel where the product is a person.
//
// This template lives or dies on TYPOGRAPHY, not on data. A real panel has a
// rule-weight hierarchy everybody recognises without being able to name it, and
// the copy only lands because the design is dead serious around it. The four
// weights are exported from this file rather than typed as literals in the
// renderer so there is exactly one place to get them wrong.

import type { LovePhoto } from "../../_love/types";

/**
 * The four rule weights, in the positions a real panel uses them.
 *
 * Applied as `border-top` on the element that FOLLOWS the rule — never as a
 * separate `<hr>`. An `<hr>` carries its own margins in most resets, and the
 * whole effect depends on the rules sitting flush against the rows.
 */
export const RULE = {
  /** Between nutrient rows. */
  hairline: 1,
  /** After the vitamins block. */
  medium: 4,
  /** Under "Amount Per Serving", above the % Daily Value line. */
  thick: 7,
  /** Under the "Nutrition Facts" title. The heaviest rule on the label. */
  extraThick: 10,
} as const;

/** The panel is a fixed block. It SCALES, it never reflows. See the wrapper. */
export const LABEL_WIDTH = 300;

/**
 * Above this many nutrients the label stops reading as a label and starts
 * reading as a spreadsheet. The renderer warns rather than silently truncating —
 * dropping a sender's line without telling them is worse than an ugly label.
 */
export const NUTRIENT_SOFT_MAX = 15;

export interface Nutrient {
  label: string;
  /**
   * "40g". OPTIONAL — rows without it show label and dv only.
   *
   * Renders in REGULAR weight even when `bold` is set on the label. That is a
   * real convention on real panels ("Total Fat **8g**" is bold label, regular
   * amount) and getting it wrong is the tell that this was drawn, not printed.
   */
  amount?: string;
  /** "40%" — free text, never parsed. Right-aligned, always bold. */
  dv: string;
  /** Major nutrients are bold. Sub-nutrients are not. */
  bold?: boolean;
  /** Sub-nutrients indent 10px per level. */
  indent?: 0 | 1 | 2;
  /**
   * The sender's note about this trait, revealed by tapping the row.
   *
   * This is the ONE interaction in the template. There is no chevron and no
   * affordance styling — a single "tap anything" line above the label is the
   * only hint, and discovering it is the point.
   */
  note?: string;
}

export interface Vitamin {
  label: string;
  dv: string;
  note?: string;
}

export interface NutritionData {
  /** "Meera Sharma" — the product. */
  productName: string;
  /** "1 Meera" */
  servingSize: string;
  /** "1 (there is only one)" */
  servingsPerContainer: string;
  /**
   * FREE TEXT. "∞" is a valid calorie count.
   *
   * Never `Number()` it, never compare it, never format it. It is printed at
   * 30px weight 800 and nothing else ever happens to it.
   */
  calories: string;
  /** "worth every one" — 9px italic beneath the calorie figure, right-aligned. */
  caloriesNote?: string;
  nutrients: Nutrient[];
  /** The smaller block below the medium rule. May be empty — skip block AND rule. */
  vitamins: Vitamin[];
  /**
   * "patience", "punctuality" …
   *
   * Joined into "Not a significant source of …". The funniest line on the label,
   * and it must be set in the driest type on the label. May be empty — then the
   * line is skipped entirely.
   */
  notSignificantSource: string[];
  /**
   * The custom half of the % Daily Value footnote — where the best joke lives.
   * A real panel explains percentages are based on a 2,000 calorie diet; this
   * one explains they are based on one person.
   */
  footnote: string;
  /** Dense, unbroken, deliberately hard to read. Joined with ", ". */
  ingredients: string[];
  /** "CONTAINS: sarcasm, strong opinions" — 9px bold caps. */
  allergen: string;
  /**
   * The sincere payload, BELOW the package frame in a readable serif.
   *
   * The tonal break from 8px regulatory density to real writing is the entire
   * emotional payload of this template. It must NOT be styled to match the label.
   */
  message: string[];
  /** Legacy single product shot. New pages use `photos[0]` as the front of pack. */
  photoUrl?: string;
  /** "Distributed by: <sender>, Bengaluru" — 7px, under the barcode. */
  distributedBy?: string;

  // ── Love kit ────────────────────────────────────────────────────────────
  /**
   * "Servings" — up to 10 photos, each framed in the editor with a caption and
   * a memory note. The first one is the product shot on the front of pack.
   */
  photos: LovePhoto[];
  /** Up to three GIFs — printed as "Side effects may include…". */
  gifs: string[];
  /**
   * The main letter — "Directions for use", folded inside the wrapper and torn
   * open at the very end. Supersedes `message`, which is kept in step on the
   * wire (paragraphs) so older readers of the row still get the sincere part.
   */
  letter: string;
  /** Packaging id — one of NUTRITION_THEMES. */
  theme: string;
  /** The question printed on the wrapper before it tears open ("" = default). */
  lockQuestion: string;
  /** The label of the button that tears it open ("" = default). */
  lockAnswer: string;
}
