// ─── Holy Matrimony: the Christian wedding's profile ────────────────────────
// Ivory, sage and gold. The hero is a carved stone chapel arch crowned with a
// garland of white lilies, an ivory light inside it; the cross in gold with its
// rays, the names and the Holy Matrimony line; white roses rise from the lower
// corners and lilies lie along the foot. Doves in the RSVP window. English
// only. Default scripture: Mark 10:9.

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

const ARCH_MASK = 'url("/wedding-v3/faith-christian/ch-chapel-arch.webp")';

const css = `
.fh-root.is-christian { --fw-script: #4e5d49; --fw-wax1: #c9b28a; --fw-wax2: #9a7f52; --fw-env: #f1f1ea; --fw-env-2: #e4e6da; --fw-liner: #f8f9f4; }
.fh-root.is-christian[data-wk-theme="blush"] { --fw-script: #7c4a52; --fw-env: #f4e6e2; --fw-env-2: #eAd4cd; --fw-liner: #fbf3f0; }
.fh-root.is-christian[data-wk-theme="powder"] { --fw-script: #46587a; --fw-env: #e7ebf1; --fw-env-2: #d6dde7; --fw-liner: #f3f5f9; }
.fh-root.is-christian .fw-sheet, .fh-root.is-christian .fw-datecard { background: linear-gradient(180deg, #fffffb, #f7f8f2); }
/* Full screen: a soft sky over ivory and sage, a pale stone floor; the chapel arch stands at full height. */
.fh-hero.is-christian { --fh-top: 5svh; --fh-w: min(100vw, calc((100svh - var(--fh-top)) * .5625)); --fh-wall-bg: #f3f4ee; --fh-wall: radial-gradient(75% 60% at 50% 36%, rgba(255,254,248,.96), rgba(255,254,248,.55) 60%, rgba(255,254,248,.35) 100%), linear-gradient(180deg, rgba(250,248,238,.7), rgba(236,239,226,.75)), url("${cdn(A["ch-cloud"].src)}") center / cover no-repeat, #f3f2ea; --fh-floor: linear-gradient(180deg, rgba(240,241,233,0), #ebece2 35%, #dfe2d4); --fh-floor-h: 12svh; }
@media (max-width: 1023px) {
  /* the chapel stands the full height of the phone; its outer stonework runs off the edges */
  .fh-hero.is-christian { --fh-top: 0px; --fh-w: max(calc(100svh * .5625), 100vw); }
  .fh-hero.is-christian .fh-card { --fh-in-x: 22%; --fh-in-t: 20%; }
  .fh-hero.is-christian .fh-crown { top: -1%; }
  .fh-hero.is-christian .fh-sub { font-size: 4.5cqw; }
}
/* wide screens: a cloister: two smaller chapel arches either side of the great one */
@media (min-width: 1024px) {
  .fh-hero.is-christian { --fh-flank-h: 68svh; }
  .fh-hero.is-christian .fh-flank { display: block; opacity: 0; }
  .fh-hero.is-christian.is-open .fh-flank { opacity: .9; }
  .fh-hero.is-christian .fh-flank.is-l { right: calc(50% + var(--fh-w) * .56); }
  .fh-hero.is-christian .fh-flank.is-r { left: calc(50% + var(--fh-w) * .56); }
}
.fh-root .fh-fin.is-christian { --fh-seal-b: 16%; }
.fh-root .fh-fin.is-christian .fh-card { --fh-in-b: 30%; }
/* the chapel arch: an ivory light inside the carved stone, lilies over its crown */
.fh-hero.is-christian .fh-card { --fh-ar: 900 / 1600; --fh-arn: .5625; --fh-in-t: 19%; --fh-in-b: 12%; --fh-in-x: 18%; --fh-reserve: 150px; --fh-mask: ${ARCH_MASK}; }
.fh-hero.is-christian .fh-card::before { content: ""; position: absolute; z-index: 0; left: 13%; right: 13%; top: 7%; bottom: 1%; border-radius: 999px 999px 0 0; background: radial-gradient(85% 62% at 50% 44%, #fffffb, rgba(252,252,246,.97) 55%, rgba(246,247,239,.93) 88%); box-shadow: inset 0 0 40px rgba(255,255,255,.6); }
.fh-hero.is-christian .fh-card-bg { z-index: 1; }
.fh-hero.is-christian .fh-copy { z-index: 3; }
.fh-hero.is-christian .fh-crown { z-index: 2; left: -12%; width: 124%; top: -4.5%; opacity: 0; transform: translate3d(0, -12px, 0); transition: opacity 1.4s ease .5s, transform 1.8s var(--fw-ease) .5s; }
.fh-hero.is-christian.is-open .fh-crown { opacity: 1; transform: none; }
.fh-hero.is-christian .fh-names { --fh-names: 14cqw; }
.fh-hero.is-christian .fh-amp { font-size: 6.6cqw; }
.fh-hero.is-christian .fh-eyebrow { font-size: 3.4cqw; }
.fh-hero.is-christian .fh-sub { font-size: 4.9cqw; }
.fh-hero.is-christian .fh-date { font-size: 3cqw; letter-spacing: .12em; }
.fh-hero.is-christian .fh-venue { font-size: 4.3cqw; }
.fh-hero.is-christian .fh-inv.is-christian { width: 17cqw; height: 17cqw; }
.fh-root.is-christian .fh-base { width: min(130%, 1100px); bottom: -2%; -webkit-mask-image: none; mask-image: none; }
/* wide screens: the card stands a little higher and the lilies lie in front of its foot, as on an altar */
@media (min-width: 1024px) {
  .fh-root.is-christian .fh-base { z-index: 4; width: min(84vw, 1000px); bottom: -15%; }
}
.fh-root.is-christian .fh-hero.is-open .fh-base, .fh-hero.is-christian.is-open .fh-base { opacity: .95; }
.fh-root.is-christian .fh-corner { width: clamp(130px, 32vw, 300px); }
.fh-root.is-christian .fh-corner.is-r { scale: -1 1; }
.fh-root.is-christian .fw-env-corner.is-l { transform: none; } .fh-root.is-christian .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-christian .fh-env-top { width: min(110%, 760px); top: -6%; }
.fh-root.is-christian .fw-env-clouds { width: min(120vw, 820px); bottom: -2%; -webkit-mask-image: none; mask-image: none; }
.fh-root.is-christian .fw-card-bloom { height: 30%; bottom: -2%; }
.fh-root.is-christian .fw-env-sprig { rotate: -24deg; height: calc(var(--seal) * .62); margin: calc(var(--seal) * -.1) 0 0 calc(var(--seal) * -1.5); }
.fh-root.is-christian .fw-rw-wash { opacity: .6; }
.fh-root.is-christian .fh-rw-figure { width: 76%; bottom: 30% !important; }
.fh-root.is-christian .fw-sheet-roses { width: clamp(110px, 28vw, 190px); }
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
    sheetCorner: A["ch-corner-tl"],
    corner: A["ch-corner"],
    cornerR: A["ch-corner"],
    sprig: A["ch-lily-spray"],
    rsvpWash: A["ch-wash"],
    rsvpFigure: A["ch-doves"],
    heroBg: A["ch-chapel-arch"],
    heroBgSm: A["ch-chapel-arch"],
    heroCrown: A["ch-lily-arc"],
    heroFlank: A["ch-chapel-arch"],
    heroBank: A["ch-lily-spray"],
    envTop: A["ch-lily-arc"],
    envBank: A["ch-lily-spray"],
  },
  T: { en },
  local: null,
  mainRe: /holy\s*matrimony|nuptial|wedding\s*(ceremony|mass)|church|marriage|wedding/i,
  verse: { text: "Therefore what God has joined together, let no one separate.", ref: "Mark 10:9" },
  invocationLabel: "The cross on the invitation",
  eventArt: [
    { re: /holy|matrimony|nuptial|mass|church|ceremony|wedding/i, icon: ICONS.church, art: A["ch-lily-arc"], fit: "scene" },
    { re: /reception|dinner|toast|banquet|party/i, icon: ICONS.glasses, art: A["ch-lily-spray"], fit: "scene" },
    { re: /engagement|betrothal|ring|proposal/i, icon: ICONS.ring, art: A["ch-doves"], fit: "scene" },
    { re: /shower|tea|brunch|hen|bachelorette/i, icon: ICONS.cake, art: A["ch-bloom"], fit: "scene" },
    { re: /rehearsal/i, icon: ICONS.candles, art: A["ch-corner"], fit: "scene" },
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
