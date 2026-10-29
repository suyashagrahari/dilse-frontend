// ─── Faith weddings: what one faith brings to the shared engine ─────────────
//
// Anand Karaj (Sikh), Nikah (Muslim) and Holy Matrimony (Christian) share one
// guest page, one editor and the wedding kit's RSVP / blessings plumbing (all
// forked from Pampas & Peony). A FaithProfile is everything that differs: the
// art behind each role, the palette, the second language and every string in
// it, the invocation, the default verse, the functions' icons and the demo.

import type { DayConfig } from "../_valentine/types";
import type { WeddingAsset } from "./assets";

export type FaithId = "sikh" | "muslim" | "christian";
/** en is always there; pa (Punjabi, Gurmukhi) for Anand Karaj, ur (Urdu, right-to-left) for Nikah. */
export type Lang = "en" | "pa" | "ur";

/** Art every faith supplies. */
export type CoreRole =
  | "paper" | "paperSoft" | "swirl" | "swirlSm"
  /** a floral bunch for card corners, place cards, the date card, the RSVP window */
  | "bloom" | "bloomAlt"
  /** the invitation sheet's top-left / bottom-right corners */
  | "sheetCorner"
  /** the opening's and the finale's lower corners */
  | "corner" | "cornerR"
  /** tucked under the wax seal */
  | "sprig"
  | "rsvpWash" | "rsvpFigure"
  /** the hero: a full arched card the copy sits inside */
  | "heroBg" | "heroBgSm";
/** Art only some faiths have. */
export type OptRole = "heroFigure" | "heroFigureSm" | "heroTop" | "heroSide" | "heroBank" | "invocation" | "envTop" | "envBank" | "heroCrown" | "heroFlank";
export type ArtRole = CoreRole | OptRole;
export type FaithArt = Record<CoreRole, WeddingAsset> & Partial<Record<OptRole, WeddingAsset>>;

export type Keys =
  | "open" | "openHint" | "dear" | "invited" | "togetherWith" | "gettingMarried" | "shubh" | "invitation" | "blessingsOf" | "families"
  | "brideSide" | "groomSide" | "countdown" | "story" | "storyEyebrow" | "events" | "eventsEyebrow" | "film" | "gallery"
  | "galleryEyebrow" | "goodToKnow" | "guestsEyebrow" | "gettingThere" | "rsvp" | "rsvpEyebrow" | "blessingsEyebrow" | "rsvpIntro"
  | "blessings" | "blessingsIntro" | "closing" | "whatsapp" | "replyBy" | "done" | "directions" | "dress"
  | "tba" | "play" | "and" | "scroll" | "dateEyebrow" | "venueEyebrow" | "upasthiti" | "copy" | "copied"
  | "contacts" | "contactsIntro" | "call" | "shagun" | "shagunIntro"
  | "payUpi" | "copyUpi" | "live" | "liveSoon" | "liveIntro" | "close" | "showMap"
  /** the line under the hero's symbol (Sikh: the Fateh; Muslim: the salaam); "" = none */
  | "greeting"
  /** the date card's seal word */
  | "seal";

export type Strings = { [K in Keys]: string } & { units: { d: string; h: string; m: string; s: string } };

export interface LocalLang {
  code: "pa" | "ur";
  /** the toggle's label */
  short: string;
  /** Intl locale for dates and times */
  locale: string;
  dir: "ltr" | "rtl";
  /** the studio's label for the second-language message ("ਪੰਜਾਬੀ ਵਿੱਚ (optional)") */
  messageLabel: string;
  messagePlaceholder: string;
  /** "Open the invitation in Punjabi (guests can switch)" */
  openInLabel: string;
}

export interface FaithEventArt {
  /** matched against the function's title */
  re: RegExp;
  /** a gold line icon (24×24 viewBox paths) */
  icon: string;
  /** an illustration for the card's arched window (the icon then rides on a small medallion) */
  art?: WeddingAsset;
  /** how the illustration sits: a standing figure, or a wide scene / object */
  fit?: "figure" | "scene";
}

export interface FaithProfile {
  id: FaithId;
  slug: string;
  /** "Anand Karaj" — the template's name in the studio and the page's <title>-ish places */
  name: string;
  art: FaithArt;
  T: { en: Strings } & Partial<Record<"pa" | "ur", Strings>>;
  local: LocalLang | null;
  /** The main function (the wedding itself) among the events. */
  mainRe: RegExp;
  /** Scripture on the invitation card when the couple leaves `verse` empty. */
  verse: { text: string; ref: string; local?: string };
  /** The invocation above the invitation (studio label for the switch, e.g. "Ik Onkar on the invitation"). */
  invocationLabel: string;
  /** Per-function icons on the celebration cards (first match wins; the last entry should match anything). */
  eventArt: FaithEventArt[];
  /** Extra CSS: palette tokens and the hero's own composition. */
  css: string;
  /** Wax / envelope tints. */
  wax: { light: string; mid: string; deep: string };
  day: DayConfig<Record<string, unknown>>;
  /** Studio: quick-add functions. */
  quickFunctions: { title: string; dress: string; color: string }[];
  aiChips: string[];
  aiPlaceholder: string;
  /** The wedding kit's RSVP / blessings wording and the preview's sample blessings, in the faith's voice. */
  kit: {
    rsvp: { namePh: string; notePh: string };
    blessings: Partial<Record<"blessing" | "placeholder" | "send" | "another" | "ok" | "list", string>>;
    sample: { id: string; name: string; message: string; createdAt: string }[];
  };
}
