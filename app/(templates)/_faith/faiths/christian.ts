// ─── Holy Matrimony: the Christian wedding's profile ────────────────────────
// Ivory, sage and gold. The hero is Monet's Church at Varengeville at sunset
// (1882, public domain), full screen: the chapel on its cliff, the pines and
// the sea. The invitation is an ivory card under a pointed Gothic arch, edged
// with a sage band of gold quatrefoils and pearls and crowned with white
// lilies; the cross in gold with its rays, the names and the Holy Matrimony
// line. Doves in the RSVP window. English only. Default scripture: Mark 10:9.

import { christianWeddingDay } from "../../_valentine/days/christian-wedding-invitation";
import { FAITH_ASSETS } from "../assets";
import { cdn } from "../../_wedding/media";
import { ICONS } from "../icons";
import type { FaithProfile, Strings } from "../types";

const A = FAITH_ASSETS["faith-christian"];
const S = FAITH_ASSETS.shared;

const en: Strings = {
  open: "Break the seal",
  openHint: "Tap the wax seal to open your invitation",
  dear: "Dear",
  invited: "You're invited",
  togetherWith: "By the grace of God",
  gettingMarried: "request the honour of your presence at their Holy Matrimony",
  shubh: "Holy Matrimony",
  invitation: "The invitation",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to “I do”",
  story: "Our story",
  storyEyebrow: "Pressed between pages",
  events: "The celebrations",
  eventsEyebrow: "Events",
  film: "Our film",
  gallery: "Moments",
  galleryEyebrow: "The album",
  goodToKnow: "Good to know",
  guestsEyebrow: "For our guests",
  gettingThere: "Getting there",
  rsvp: "Will you join us?",
  rsvpEyebrow: "Kindly respond",
  blessingsEyebrow: "Blessings",
  rsvpIntro: "One reply for your family. Tick the events you'll attend.",
  blessings: "Leave your blessings",
  blessingsIntro: "A prayer or a wish from you, kept by the couple forever.",
  closing: "With love",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  done: "Just married",
  directions: "Directions",
  dress: "Dress code",
  tba: "Time to be announced",
  play: "Play the film",
  and: "&",
  scroll: "Scroll",
  dateEyebrow: "Save the date",
  venueEyebrow: "The church",
  upasthiti: "Your presence is the greatest gift",
  copy: "Copy link",
  copied: "Link copied",
  contacts: "Any questions? Call us",
  contactsIntro: "The family is a phone call away.",
  call: "Call",
  shagun: "Gifts",
  shagunIntro: "Your presence is the only gift we need. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "",
  seal: "✝",
};

const PANEL_MASK = 'url("/wedding-v3/faith-christian/ch-panel-600.webp")';

const css = `
.fh-root.is-christian { --fw-script: #4e5d49; --fw-wax1: #c9b28a; --fw-wax2: #9a7f52; --fw-env: #f1f1ea; --fw-env-2: #e4e6da; --fw-liner: #f8f9f4; }
.fh-root.is-christian[data-wk-theme="blush"] { --fw-script: #7c4a52; --fw-env: #f4e6e2; --fw-env-2: #eAd4cd; --fw-liner: #fbf3f0; }
.fh-root.is-christian[data-wk-theme="powder"] { --fw-script: #46587a; --fw-env: #e7ebf1; --fw-env-2: #d6dde7; --fw-liner: #f3f5f9; }
.fh-root.is-christian .fw-sheet, .fh-root.is-christian .fw-datecard { background: linear-gradient(180deg, #fffffb, #f7f8f2); }
/* Full screen: the chapel on the cliff at Varengeville in Monet's sunset light, slowly settling as the invitation
   opens; the card stands to the right of the chapel on wide screens and rises from the foot on phones. */
.fh-hero.is-christian { --fh-top: 0px; --fh-wall-bg: #dfe3cf; --fh-wall: linear-gradient(270deg, rgba(40,48,30,.26), rgba(40,48,30,.06) 40%, transparent 60%), linear-gradient(180deg, rgba(60,60,30,.14), transparent 24%, transparent 76%, rgba(40,48,30,.24)), url("${cdn(A["ch-varengeville"].src)}") 30% 32% / cover no-repeat, #dfe3cf; }
.fh-hero.is-christian .fh-wall { transform: scale(1.08); transform-origin: 25% 30%; transition: opacity 1.4s ease, transform 12s cubic-bezier(.2,.6,.2,1); }
.fh-hero.is-christian.is-open .fh-wall { transform: none; }
.fh-hero.is-christian .fh-floor, .fh-hero.is-christian .fh-base, .fh-hero.is-christian .fh-corner, .fh-hero.is-christian .fh-flank { display: none; }
/* the card: the cross, the names and the Holy Matrimony line in its ivory field, lilies over its point */
.fh-hero.is-christian .fh-card { --fh-ar: 1000 / 1400; --fh-arn: .714; --fh-in-t: 23%; --fh-in-b: 10%; --fh-in-x: 13.5%; --fh-reserve: 0px; --fh-mask: ${PANEL_MASK}; }
.fh-hero.is-christian .fh-card-bg { filter: drop-shadow(0 34px 46px rgba(30,40,20,.36)) drop-shadow(0 6px 12px rgba(30,40,20,.2)); }
.fh-hero.is-christian .fh-copy { z-index: 3; }
.fh-hero.is-christian .fh-crown { z-index: 2; left: 10%; width: 80%; top: -13.5%; opacity: 0; transform: translate3d(0, -12px, 0); transition: opacity 1.4s ease .5s, transform 1.8s var(--fw-ease) .5s; filter: drop-shadow(0 6px 10px rgba(40,50,30,.18)); }
.fh-hero.is-christian.is-open .fh-crown { opacity: 1; transform: none; }
.fh-hero.is-christian .fh-names { --fh-names: 13.5cqw; margin-top: 1cqw; }
.fh-hero.is-christian .fh-amp { font-size: 6.6cqw; }
.fh-hero.is-christian .fh-eyebrow { font-size: 3.3cqw; letter-spacing: .16em; margin-top: 3cqw; white-space: nowrap; }
.fh-hero.is-christian .fh-sub { font-size: 5cqw; margin-top: 2cqw; }
.fh-hero.is-christian .fh-date { font-size: 3.4cqw; letter-spacing: .1em; white-space: nowrap; margin-top: 4.2cqw; padding: 2.6cqw 2cqw; }
.fh-hero.is-christian .fh-venue { font-size: 4.3cqw; margin-top: 3cqw; }
.fh-hero.is-christian .fh-inv.is-christian { width: 16cqw; height: 16cqw; }
.fh-root .fh-fin.is-christian { --fh-seal-b: 8%; }
.fh-root .fh-fin.is-christian .fh-card { --fh-in-t: 25%; --fh-in-b: 25%; }
.fh-root .fh-fin.is-christian .fh-names { --fh-names: 12.5cqw; }
/* Wide screens: the card stands in the right of the room, clear of the chapel on its cliff. */
@media (min-width: 1024px) {
  .fh-hero.is-christian { --fh-w: min(44vw, calc(86svh * .714)); }
  .fh-hero.is-christian .fh-stage { justify-content: flex-end; align-items: flex-end; padding-bottom: 3svh; padding-right: max(4.5vw, calc(26vw - var(--fh-w) / 2)); }
}
/* Phones: the chapel, the pines and the evening sky fill the upper screen; the card rises from the foot. */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-christian { --fh-w: min(92vw, calc(62svh * .714)); --fh-wall: linear-gradient(180deg, rgba(60,60,30,.22), transparent 16%), linear-gradient(180deg, transparent calc(100vw * 1.117 - 34vw), #c9cfa9 calc(100vw * 1.117)), url("${cdn(A["ch-varengeville-tall"].src)}") 50% 0 / 100% auto no-repeat, linear-gradient(180deg, #c9cfa9, #b9c193); }
  .fh-root .fh-hero.is-christian .fh-wall { transform-origin: 30% 25%; }
  .fh-root .fh-hero.is-christian .fh-stage { align-items: flex-end; padding-bottom: max(14px, 2.5svh); }
  .fh-root .fh-hero.is-christian .fh-card { --fh-in-t: 23%; --fh-in-b: 9%; --fh-in-x: 12.5%; }
  .fh-root .fh-fin.is-christian .fh-card { --fh-in-t: 24.5%; --fh-in-b: 35%; }
  .fh-root .fh-fin.is-christian { --fh-seal-b: 5%; }
  .fh-root .fh-fin.is-christian .fh-names { --fh-names: 10.5cqw; }
}
.fh-root.is-christian .fh-corner { width: clamp(130px, 32vw, 300px); }
.fh-root.is-christian .fh-corner.is-r { scale: -1 1; }
.fh-root.is-christian .fw-env-corner.is-l { transform: none; } .fh-root.is-christian .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-christian .fh-env-top { width: min(110%, 760px); top: -6%; }
.fh-root.is-christian .fw-env-clouds { width: min(120vw, 820px); bottom: -2%; -webkit-mask-image: none; mask-image: none; }
.fh-root.is-christian .fw-card-bloom { height: 30%; bottom: -2%; }
.fh-root.is-christian .fw-env-sprig { rotate: -24deg; height: calc(var(--seal) * .62); margin: calc(var(--seal) * -.1) 0 0 calc(var(--seal) * -1.5); }
.fh-root.is-christian .fw-rw-wash { opacity: .6; }
.fh-root.is-christian .fh-rw-figure { width: 76%; bottom: 30% !important; }
.fh-root.is-christian .fw-sheet-roses { width: clamp(88px, 22vw, 160px); }
.fh-root.is-christian .fw-portrait-bloom.is-t { rotate: -8deg; } .fh-root.is-christian .fw-portrait-bloom.is-b { scale: 1; rotate: 0deg; }
.fh-root.is-christian .fw-datecard-wax b, .fh-root.is-christian .fw-wax b { font: 400 26px/1 var(--wk-font-display); }
`;

export const CHRISTIAN: FaithProfile = {
  id: "christian",
  slug: "christian-wedding-invitation",
  name: "Holy Matrimony",
  art: {
    paper: S.paper,
    paperSoft: S.paperSoft,
    swirl: S.swirl,
    swirlSm: S.swirlSm,
    bloom: A["ch-bloom"],
    bloomAlt: A["ch-bloom"],
    sheetCorner: A["ch-bloom"],
    corner: A["ch-corner"],
    cornerR: A["ch-corner"],
    sprig: A["ch-lily-spray"],
    rsvpWash: A["ch-wash"],
    rsvpFigure: A["ch-doves"],
    heroBg: A["ch-panel"],
    heroBgSm: A["ch-panel-600"],
    heroCrown: A["ch-lily-arc"],
    envTop: A["ch-lily-arc"],
    envBank: A["ch-lily-spray"],
  },
  T: { en },
  local: null,
  mainRe: /holy\s*matrimony|nuptial|wedding\s*(ceremony|mass)|church|marriage|wedding/i,
  verse: { text: "Therefore what God has joined together, let no one separate.", ref: "Mark 10:9" },
  invocationLabel: "The cross on the invitation",
  eventArt: [
    { re: /holy|matrimony|nuptial|mass|church|ceremony|wedding/i, icon: ICONS.church, art: A["ch-couple-vows"] },
    { re: /rehearsal/i, icon: ICONS.candles, art: A["ch-couple-rehearsal"] },
    { re: /reception|dinner|toast|banquet|party/i, icon: ICONS.glasses, art: A["ch-couple-dance"] },
    { re: /engagement|betrothal|ring|proposal/i, icon: ICONS.ring, art: A["ch-couple-ring"] },
    { re: /shower|tea|brunch|hen|bachelorette/i, icon: ICONS.cake, art: A["ch-couple-shower"] },
    { re: /roce|haldi|sangeet|mehndi|music/i, icon: ICONS.dove },
    { re: /./, icon: ICONS.dove },
  ],
  css,
  wax: { light: "#e6d6b6", mid: "#c9b28a", deep: "#9a7f52" },
  day: christianWeddingDay,
  quickFunctions: [
    { title: "Engagement", dress: "Soft pastels", color: "#E7B9B5" },
    { title: "Roce", dress: "Whites and yellows", color: "#F2C94C" },
    { title: "Bridal Shower", dress: "Florals and whites", color: "#F1E6D6" },
    { title: "Rehearsal Dinner", dress: "Smart casual", color: "#6F8FC2" },
    { title: "Holy Matrimony", dress: "Ivory, sage and pastels", color: "#E4EADF" },
    { title: "Reception", dress: "Black tie", color: "#2A2622" },
  ],
  kit: {
    rsvp: { namePh: "e.g. the D'Souza family", notePh: "Congratulations! Can't wait to see you walk down the aisle…" },
    blessings: { placeholder: "May God bless your marriage with joy and grace…" },
    sample: [
      { id: "s1", name: "Grandma", message: "May God bless your marriage with joy, patience and grace. ❤️", createdAt: "" },
      { id: "s2", name: "Ryan & Tessa", message: "To a lifetime of dancing badly together. Love you both!", createdAt: "" },
      { id: "s3", name: "Aunty Grace", message: "May your home always be full of laughter, faith and good food.", createdAt: "" },
    ],
  },
  aiChips: ["Make it warm", "Make it formal", "Add a Bible verse", "Mention our families", "Keep it short"],
  aiPlaceholder: "Anna and Daniel's Holy Matrimony is on 20 Feb 2027 at 3:30 pm at the Church of Our Lady of Hope, Fort Kochi, with the reception at The Lily Ballroom at 7 pm. Engagement on 24 Jan…",
};
