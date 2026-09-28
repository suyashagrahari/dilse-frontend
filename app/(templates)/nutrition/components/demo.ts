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

import { DEMO_PHOTOS, parseLoveKit } from "../../_love/types";
import { NUTRITION_THEME_IDS } from "./themes";
import type { NutritionData } from "./types";

const GIF_CDN = "https://cdn.subhsandesh.in/gifts-media";

/** Where the editor is. Mirrors every other template in the repo. */
export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
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
      label: "Total Affection",
      amount: "112g",
      dv: "140%",
      bold: true,
      indent: 0,
      note: "Leaves the last bite on the plate for me, then acts surprised that I noticed.",
    },
    {
      label: "Saturated Affection",
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
      label: "Of which, Overthinking Texts",
      amount: "41g",
      dv: "290%",
      indent: 1,
      note: "Forty-one messages about a restaurant we did not, in the end, go to.",
    },
    {
      label: "Stolen Hoodies",
      amount: "3 units",
      dv: "100%",
      bold: true,
      indent: 0,
      note: "All three were mine. None of them are coming back. I have made my peace with it.",
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
      note: "No quantity given. In four years there has not been a shortage.",
    },
    {
      label: "Of which, At 2 A.M.",
      amount: "0.4g",
      dv: "100%",
      indent: 1,
      note: "Picks up, says hi like it is the middle of the afternoon, and stays on.",
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
      label: "Vitamin U",
      dv: "100%",
      note: "Required daily. Deficiency symptoms include checking my phone every four minutes.",
    },
  ],

  notSignificantSource: ["patience", "punctuality", "restraint around dessert", "small talk"],

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
    "forehead kisses (may contain traces of drama)",
  ],

  allergen: "CONTAINS: sarcasm, strong opinions, my whole heart",

  message: [],

  distributedBy: "Rohan, with love · Bengaluru",

  photos: [
    { ...DEMO_PHOTOS[0], caption: "batch no. 001 — the first sunset", note: "You said the sky looked like mango lassi. I have not been able to see a sunset any other way since." },
    { ...DEMO_PHOTOS[1], caption: "date night, original flavour", note: "You stole my fries and then my heart. In that order. Both were worth it." },
    { ...DEMO_PHOTOS[2], caption: "limited edition: cherry blossom", note: "Even the trees looked jealous. I took forty photos and you are laughing in all of them." },
    { ...DEMO_PHOTOS[3], caption: "best before: never", note: "Out of every version of my life, I would pick the one with you in it. Every time." },
  ],

  gifs: [
    `${GIF_CDN}/templates/train-ticket/dancing.gif`,
    `${GIF_CDN}/assets/court-of-love/penguin-hug.gif`,
    `${GIF_CDN}/assets/court-of-love/love-heart.gif`,
  ],

  letter:
    "Meera,\n\nYou are the only person I know who picks up at two in the morning and doesn't make it a thing. You just say hi, like it's the middle of the afternoon, and then you stay on the line until I've run out of whatever it was.\n\nIt turns out to be much easier to make you a fake label about protein than to say out loud that I would be a considerably worse person without you in it. So here it is, out loud: I love you. No recommended intake, no daily limit.\n\nCome over whenever you're free. I'll make the bad coffee you've been politely pretending to like since the first week.\n\n— Rohan",

  theme: "classic",
  lockQuestion: "",
  lockAnswer: "",
};

/** Printed on the wrapper when the sender leaves the lock question blank. */
export const DEFAULT_LOCK_QUESTION = "Read the directions before use?";
export const DEFAULT_LOCK_ANSWER = "tear it open 💌";

/**
 * The fresh form: the label jokes stay as a starting point, but never the demo
 * couple's name, photos or letter — and it keeps the packaging they were just
 * previewing.
 */
export function blankNutrition(theme: string): NutritionData {
  return {
    ...DEMO_NUTRITION,
    productName: "",
    servingSize: "",
    distributedBy: "",
    photos: [],
    letter: "",
    theme,
  };
}

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
  "photos",
  "gifs",
  "letter",
  "theme",
  "lockQuestion",
  "lockAnswer",
];

/** The letter as the legacy `message` paragraphs (blank-line separated). */
export function letterToParagraphs(letter: string): string[] {
  return letter
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((p) => p.slice(0, 600));
}

/** UI state → flat body for POST/PUT. `password` empty means "no gate". */
export function nutritionDataToBody(data: NutritionData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of NUTRITION_CONTENT_KEYS) body[k] = data[k];
  // Keep the legacy field in step so anything still reading `message` gets the letter.
  body.message = letterToParagraphs(data.letter ?? "");
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
  const message = asLines(src.message, 8);
  const kit = parseLoveKit(
    src,
    { photos: [], gifs: [], letter: "", theme: NUTRITION_THEME_IDS[0], lockQuestion: "", lockAnswer: "" },
    NUTRITION_THEME_IDS,
  );

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
    message,
    ...(photoUrl ? { photoUrl } : {}),
    ...(distributedBy ? { distributedBy } : {}),
    // Love kit. Pages from before it existed have none of these fields: they
    // get no photos / GIFs (never the demo couple's), the default packaging,
    // and their old `message` paragraphs become the letter.
    ...kit,
    letter: typeof src.letter === "string" && src.letter.trim() ? kit.letter : message.join("\n\n"),
  };
}
