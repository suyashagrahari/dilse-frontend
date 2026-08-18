// ─── Nutrition Facts — demo data + the wire converters ───────────────────────
//
// `types.ts` is the frozen contract and holds no data. This file holds the
// seed the gallery renders, the editor form starts from, and `useStoryFill`
// diffs against to decide what the sender has actually touched — plus the two
// converters that move a `NutritionData` across the wire.
//
// ── THE COPY IS THE TEMPLATE ─────────────────────────────────────────────────
//
// There is no illustration, no animation and no colour here. A visitor decides
// whether to make one of these entirely from the words below, so the demo is
// written to be read, not to be filled in over. Two rules it follows and any
// edit to it should keep:
//
//   1. THE PANEL NEVER WINKS. Every nutrient is phrased as though a compliance
//      department wrote it. The moment a row tries to be funny it stops being
//      funny — the humour comes from the gap between the register and the
//      subject, and the register is the half we control.
//   2. THE MESSAGE DROPS THE ACT COMPLETELY. No nutrition vocabulary, no
//      percentages, no callback to the rows above. The whole template is built
//      to earn that tonal break, and a joke in the last paragraph spends it.

import type { NutritionData } from "./types";

/** Where the editor is. Mirrors every other template in the repo. */
export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const DEMO_NUTRITION: NutritionData = {
  productName: "Meera Sharma",
  servingSize: "1 Meera",
  servingsPerContainer: "1 (there is only one)",
  // FREE TEXT. Printed exactly as written, here and everywhere downstream.
  calories: "∞",
  caloriesNote: "worth every one",

  nutrients: [
    {
      label: "Total Loyalty",
      amount: "112g",
      dv: "140%",
      bold: true,
      indent: 0,
      note: "Drove to Whitefield at midnight because I said, on the phone, that I was fine.",
    },
    {
      label: "Saturated Loyalty",
      amount: "108g",
      dv: "135%",
      indent: 1,
      note: "The kind that does not thin out the moment it becomes inconvenient.",
    },
    {
      label: "Total Chaos",
      amount: "48g",
      dv: "310%",
      bold: true,
      indent: 0,
      note: "Has never once left a house without going back inside for something.",
    },
    {
      // Over 24 characters on purpose — the panel must wrap somewhere.
      label: "Of which, Group Chat Chaos",
      amount: "41g",
      dv: "290%",
      indent: 1,
      note: "Forty-one messages about a restaurant we did not, in the end, go to.",
    },
    {
      label: "Unsolicited Advice",
      amount: "9g",
      dv: "88%",
      bold: true,
      indent: 0,
      note: "Almost always right, which is the genuinely annoying part of it.",
    },
    {
      label: "Dietary Nonsense",
      amount: "16g",
      dv: "220%",
      bold: true,
      indent: 0,
      note: "Has explained the LBW rule to me on three separate occasions. I still do not know the LBW rule.",
    },
    {
      // The longest label on the label. Twenty-nine characters.
      label: "Emotionally Available Protein",
      amount: "31g",
      dv: "62%",
      bold: true,
      indent: 0,
      note: "Asks the second question. Almost nobody asks the second question.",
    },
    {
      // No amount. Rows without one show the label and the daily value only.
      label: "Being Around",
      dv: "100%",
      bold: true,
      indent: 0,
      note: "No quantity given. In eleven years there has not been a shortage.",
    },
    {
      label: "Of which, At 2 A.M.",
      amount: "0.4g",
      dv: "100%",
      indent: 1,
      note: "Answers, says hi like it is the middle of the afternoon, and stays on.",
    },
  ],

  vitamins: [
    {
      label: "Vitamin D (Sunlight)",
      dv: "90%",
      note: "Rooms are measurably brighter. I have checked this against a control.",
    },
    {
      label: "Iron (Will)",
      dv: "200%",
      note: "Finished the degree everybody, including me, told her to drop.",
    },
    {
      label: "Potassium (Backbone)",
      dv: "180%",
      note: "Said the unpopular thing at the table and then did not take it back.",
    },
  ],

  notSignificantSource: [
    "patience",
    "punctuality",
    "restraint",
    "small talk",
    "second thoughts",
  ],

  footnote:
    "2,000 calories a day is used for general nutrition advice. One Meera a day is used for everything else.",

  ingredients: [
    "unsolicited playlists (14%)",
    "stubbornness",
    "filter coffee",
    "opinions about films she has not finished",
    "water",
    "contains one or more of the following: kindness, sarcasm, both",
    "voice notes (E621)",
    "stolen fries",
    "an unreasonable number of tote bags",
    "loyalty (may contain traces of guilt)",
  ],

  allergen: "CONTAINS: sarcasm, strong opinions",

  message: [
    "You are the only person I know who picks up at two in the morning and doesn't make it a thing. You just say hi, like it's the middle of the afternoon, and then you stay on the line until I've run out of whatever it was.",
    "I don't think I've ever said that to you properly. It turns out to be much easier to send you a fake label about protein than to say out loud that I would be a considerably worse person without you in it.",
    "So — no recommended intake, no daily value. Just come over whenever you're free. I'll make the bad coffee you've been politely pretending to like since 2014.",
  ],

  distributedBy: "Rohan Menon, Bengaluru",
};

// ─── Wire format ─────────────────────────────────────────────────────────────
//
// Field names here === server model field names === wire keys. The payload is
// flat and whitelisted, so a stray key in editor state can never reach Mongo.

export const NUTRITION_CONTENT_KEYS: (keyof NutritionData)[] = [
  "productName",
  "servingSize",
  "servingsPerContainer",
  "calories",
  "caloriesNote",
  "nutrients",
  "vitamins",
  "notSignificantSource",
  "footnote",
  "ingredients",
  "allergen",
  "message",
  "photoUrl",
  "distributedBy",
];

/** UI state → flat body for POST/PUT. `password` empty means "no gate". */
export function nutritionDataToBody(data: NutritionData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of NUTRITION_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

const asLines = (v: unknown, cap: number): string[] =>
  Array.isArray(v) ? v.map(asString).filter((s) => s.length > 0).slice(0, cap) : [];

const asIndent = (v: unknown): 0 | 1 | 2 => (v === 1 ? 1 : v === 2 ? 2 : 0);

/**
 * DB / share response → UI state.
 *
 * `calories` and every `dv` come through `asString` and nothing else. There is
 * no Number() anywhere in this function and there must never be one: the demo
 * ships an infinity sign as a calorie count, and a coercion here would print
 * "NaN" on a published page.
 */
export function dbToNutritionData(db: Record<string, unknown> | null | undefined): NutritionData {
  const src = db ?? {};

  const nutrients = Array.isArray(src.nutrients)
    ? (src.nutrients as unknown[])
        .map((n) => {
          const o = (n && typeof n === "object" ? n : {}) as Record<string, unknown>;
          const amount = asString(o.amount);
          const note = asString(o.note);
          return {
            label: asString(o.label),
            ...(amount ? { amount } : {}),
            dv: asString(o.dv),
            bold: o.bold === true,
            indent: asIndent(o.indent),
            ...(note ? { note } : {}),
          };
        })
        .filter((n) => n.label.length > 0)
        .slice(0, 15)
    : [];

  const vitamins = Array.isArray(src.vitamins)
    ? (src.vitamins as unknown[])
        .map((v) => {
          const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
          const note = asString(o.note);
          return { label: asString(o.label), dv: asString(o.dv), ...(note ? { note } : {}) };
        })
        .filter((v) => v.label.length > 0)
        .slice(0, 8)
    : [];

  const photoUrl = asString(src.photoUrl);
  const distributedBy = asString(src.distributedBy);

  return {
    productName: asString(src.productName) || DEMO_NUTRITION.productName,
    servingSize: asString(src.servingSize),
    servingsPerContainer: asString(src.servingsPerContainer),
    calories: asString(src.calories),
    caloriesNote: asString(src.caloriesNote),
    nutrients: nutrients.length ? nutrients : [],
    vitamins,
    notSignificantSource: asLines(src.notSignificantSource, 10),
    footnote: asString(src.footnote),
    ingredients: asLines(src.ingredients, 20),
    allergen: asString(src.allergen),
    message: asLines(src.message, 8),
    ...(photoUrl ? { photoUrl } : {}),
    ...(distributedBy ? { distributedBy } : {}),
  };
}
