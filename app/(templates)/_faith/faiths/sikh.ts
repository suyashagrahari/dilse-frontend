// ─── Anand Karaj: the Sikh wedding's profile ────────────────────────────────
// Ivory and gold. The hero is the arch over Sri Guru Granth Sahib Ji (the
// Khanda on its stand, gold lanterns, white roses) with Ik Onkar in gold foil
// and the Fateh; peach peonies garland the top and fill the lower corners; the
// Golden Temple sits at the foot of the opening. English + Punjabi (Gurmukhi).
// Default scripture: Guru Amar Das Ji, Ang 788 ("ek jot doe moorti").

import { sikhWeddingDay } from "../../_valentine/days/sikh-wedding-invitation";
import { FAITH_ASSETS } from "../assets";
import { ICONS } from "../icons";
import type { FaithProfile, Strings } from "../types";

const A = FAITH_ASSETS["faith-sikh"];
const S = FAITH_ASSETS.shared;

const en: Strings = {
  open: "Break the seal",
  openHint: "Tap the wax seal to open your invitation",
  dear: "Dear",
  invited: "You're invited",
  togetherWith: "With the blessings of Waheguru",
  gettingMarried: "invite you to their Anand Karaj",
  shubh: "Anand Karaj",
  invitation: "The invitation",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the Laavan",
  story: "Our story",
  storyEyebrow: "Pressed between pages",
  events: "The celebrations",
  eventsEyebrow: "Functions",
  film: "Our film",
  gallery: "Moments",
  galleryEyebrow: "The album",
  goodToKnow: "Good to know",
  guestsEyebrow: "For our guests",
  gettingThere: "Getting there",
  rsvp: "Will you join us?",
  rsvpEyebrow: "Kindly respond",
  blessingsEyebrow: "Asees",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Leave your blessings",
  blessingsIntro: "A line from you, kept by the couple forever.",
  closing: "With love",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  done: "Anand Karaj complete",
  directions: "Directions",
  dress: "Dress code",
  tba: "Time to be announced",
  play: "Play the film",
  and: "&",
  scroll: "Scroll",
  dateEyebrow: "Save the date",
  venueEyebrow: "The venue",
  upasthiti: "Your presence is our blessing",
  copy: "Copy link",
  copied: "Link copied",
  contacts: "Any questions? Call us",
  contactsIntro: "The family is a phone call away.",
  call: "Call",
  shagun: "Shagun",
  shagunIntro: "Your blessings are all we wish for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "Waheguru Ji Ka Khalsa · Waheguru Ji Ki Fateh",
  seal: "ੴ",
};

const pa: Strings = {
  open: "ਮੋਹਰ ਤੋੜੋ",
  openHint: "ਸੱਦਾ ਖੋਲ੍ਹਣ ਲਈ ਮੋਹਰ ਨੂੰ ਛੂਹੋ",
  dear: "ਪਿਆਰੇ",
  invited: "ਆਪ ਜੀ ਨੂੰ ਸਾਦਰ ਸੱਦਾ ਹੈ",
  togetherWith: "ਵਾਹਿਗੁਰੂ ਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ",
  gettingMarried: "ਦੇ ਅਨੰਦ ਕਾਰਜ ਵਿੱਚ ਆਪ ਜੀ ਨੂੰ ਸੱਦਾ ਹੈ",
  shubh: "ਅਨੰਦ ਕਾਰਜ",
  invitation: "ਸੱਦਾ ਪੱਤਰ",
  blessingsOf: "ਅਸ਼ੀਰਵਾਦ ਸਹਿਤ",
  families: "ਸਾਡੇ ਪਰਿਵਾਰ",
  brideSide: "ਲੜਕੀ ਵਾਲੇ",
  groomSide: "ਲੜਕੇ ਵਾਲੇ",
  countdown: "ਲਾਵਾਂ ਵਿੱਚ ਬਾਕੀ ਸਮਾਂ",
  story: "ਸਾਡੀ ਕਹਾਣੀ",
  storyEyebrow: "ਯਾਦਾਂ ਦੇ ਪੰਨੇ",
  events: "ਸ਼ੁਭ ਸਮਾਗਮ",
  eventsEyebrow: "ਸਮਾਗਮ",
  film: "ਸਾਡੀ ਫ਼ਿਲਮ",
  gallery: "ਯਾਦਾਂ",
  galleryEyebrow: "ਐਲਬਮ",
  goodToKnow: "ਜ਼ਰੂਰੀ ਜਾਣਕਾਰੀ",
  guestsEyebrow: "ਮਹਿਮਾਨਾਂ ਲਈ",
  gettingThere: "ਕਿਵੇਂ ਪਹੁੰਚਣਾ ਹੈ",
  rsvp: "ਕੀ ਆਪ ਜੀ ਪਧਾਰੋਗੇ?",
  rsvpEyebrow: "ਕਿਰਪਾ ਕਰਕੇ ਜਵਾਬ ਦਿਓ",
  blessingsEyebrow: "ਅਸੀਸਾਂ",
  rsvpIntro: "ਪੂਰੇ ਪਰਿਵਾਰ ਵੱਲੋਂ ਇੱਕ ਜਵਾਬ। ਜਿਨ੍ਹਾਂ ਸਮਾਗਮਾਂ ਵਿੱਚ ਆਓਗੇ, ਉਹ ਚੁਣੋ।",
  blessings: "ਆਪਣੀਆਂ ਅਸੀਸਾਂ ਦਿਓ",
  blessingsIntro: "ਤੁਹਾਡੀ ਇੱਕ ਸਤਰ, ਜੋ ਜੋੜੀ ਸਦਾ ਸਾਂਭ ਕੇ ਰੱਖੇਗੀ।",
  closing: "ਪਿਆਰ ਸਹਿਤ",
  whatsapp: "WhatsApp",
  replyBy: "ਕਿਰਪਾ ਕਰਕੇ ਜਵਾਬ ਦਿਓ",
  units: { d: "ਦਿਨ", h: "ਘੰਟੇ", m: "ਮਿੰਟ", s: "ਸਕਿੰਟ" },
  done: "ਅਨੰਦ ਕਾਰਜ ਸੰਪੂਰਨ",
  directions: "ਰਸਤਾ ਦੇਖੋ",
  dress: "ਪਹਿਰਾਵਾ",
  tba: "ਸਮਾਂ ਜਲਦੀ ਦੱਸਿਆ ਜਾਵੇਗਾ",
  play: "ਫ਼ਿਲਮ ਚਲਾਓ",
  and: "ਤੇ",
  scroll: "ਅੱਗੇ ਦੇਖੋ",
  dateEyebrow: "ਸ਼ੁਭ ਤਾਰੀਖ਼",
  venueEyebrow: "ਸਥਾਨ",
  upasthiti: "ਆਪ ਜੀ ਦੀ ਹਾਜ਼ਰੀ ਸਾਡੇ ਲਈ ਅਸੀਸ ਹੈ",
  copy: "ਲਿੰਕ ਕਾਪੀ ਕਰੋ",
  copied: "ਲਿੰਕ ਕਾਪੀ ਹੋ ਗਿਆ",
  contacts: "ਕੋਈ ਸਵਾਲ? ਸਾਨੂੰ ਫ਼ੋਨ ਕਰੋ",
  contactsIntro: "ਪਰਿਵਾਰ ਬੱਸ ਇੱਕ ਫ਼ੋਨ ਦੀ ਦੂਰੀ 'ਤੇ ਹੈ।",
  call: "ਫ਼ੋਨ ਕਰੋ",
  shagun: "ਸ਼ਗਨ",
  shagunIntro: "ਤੁਹਾਡੀਆਂ ਅਸੀਸਾਂ ਹੀ ਸਾਡਾ ਤੋਹਫ਼ਾ ਹਨ। ਜਿਨ੍ਹਾਂ ਨੇ ਪੁੱਛਿਆ ਹੈ, ਉਨ੍ਹਾਂ ਲਈ:",
  payUpi: "UPI ਨਾਲ ਭੇਜੋ",
  copyUpi: "UPI ID ਕਾਪੀ ਕਰੋ",
  live: "ਲਾਈਵ ਦੇਖੋ",
  liveSoon: "ਲਾਈਵ ਪ੍ਰਸਾਰਣ 30 ਮਿੰਟ ਪਹਿਲਾਂ ਸ਼ੁਰੂ ਹੋਵੇਗਾ",
  liveIntro: "ਨਾ ਆ ਸਕੋ ਤਾਂ ਔਨਲਾਈਨ ਜੁੜੋ।",
  close: "ਬੰਦ ਕਰੋ",
  showMap: "ਨਕਸ਼ਾ ਦੇਖੋ",
  greeting: "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ · ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਹਿ",
  seal: "ੴ",
};

const ARCH_MASK = 'url("/wedding-v3/faith-sikh/sk-arch-720.webp")';

const css = `
.fh-root.is-sikh { --fw-script: #7c4515; --fw-wax1: #c98f34; --fw-wax2: #93601a; --fw-env: #f3e6cc; --fw-env-2: #e8d3ab; --fw-liner: #fbf2de; }
.fh-root.is-sikh[data-wk-theme="blush"] { --fw-script: #8a3f3a; --fw-env: #f5e2d6; --fw-env-2: #ebcdbb; --fw-liner: #fcf0e8; }
.fh-root.is-sikh[data-wk-theme="powder"] { --fw-script: #4a5a7c; --fw-env: #e7e8ee; --fw-env-2: #d6d9e3; --fw-liner: #f3f4f8; }
/* the arch: Ik Onkar, the Fateh and the names live in its ivory field, above the gutka stand */
.fh-hero.is-sikh .fh-card { --fh-ar: 1200 / 1680; --fh-arn: .714; --fh-in-t: 12.5%; --fh-in-b: 36.5%; --fh-in-x: 15%; --fh-reserve: 140px; --fh-mask: ${ARCH_MASK}; }
.fh-hero.is-sikh .fh-names { --fh-names: 10.4cqw; }
.fh-hero.is-sikh .fh-inv.is-sikh { font-size: 12.5cqw; }
.fh-hero.is-sikh .fh-greet { font-size: 2.2cqw; letter-spacing: .08em; white-space: nowrap; }
.fh-hero.is-sikh .fh-eyebrow { letter-spacing: .16em; margin-top: 1.8cqw; }
.fh-hero.is-sikh .fh-date { margin-top: 2.2cqw; padding: 1.3cqw 2cqw; }
.fh-hero.is-sikh .fh-venue { font-size: 3.3cqw; margin-top: 1.4cqw; }
.fh-hero.is-sikh .fh-top { width: max(100%, 900px); top: -1px; -webkit-mask-image: linear-gradient(180deg, #000 55%, transparent); mask-image: linear-gradient(180deg, #000 55%, transparent); }
/* the peony corner pieces are top corners: turned, they rise from the foot */
.fh-root.is-sikh .fh-corner.is-l { rotate: 180deg; }
.fh-root.is-sikh .fh-corner.is-r { rotate: 180deg; }
.fh-root.is-sikh .fh-corner { width: clamp(110px, 26vw, 260px); }
.fh-root.is-sikh .fw-env-corner { width: clamp(110px, 26vw, 260px); }
.fh-root.is-sikh .fw-env-corner.is-l, .fh-root.is-sikh .fw-env-corner.is-r { transform: rotate(180deg); }
.fh-root.is-sikh .fw-env-clouds { width: min(118vw, 760px); opacity: 0; -webkit-mask-image: linear-gradient(180deg, transparent, #000 35%); mask-image: linear-gradient(180deg, transparent, #000 35%); }
.fh-root.is-sikh .fw-env.is-ready .fw-env-clouds { opacity: .55; }
.fh-root.is-sikh .fh-env-top { width: max(100%, 900px); }
.fh-root.is-sikh .fw-card-bloom { height: 20%; bottom: -7%; }
.fh-root.is-sikh .fh-base { width: min(118%, 900px); --fh-base-o: .55; }
.fh-root.is-sikh .fw-env-sprig { rotate: -18deg; height: calc(var(--seal) * .8); margin: calc(var(--seal) * -.2) 0 0 calc(var(--seal) * -1.25); }
.fh-root.is-sikh .fw-rw-wash { opacity: .7; }
.fh-root.is-sikh .fh-rw-figure { width: 94%; bottom: 14% !important; }
.fh-root.is-sikh .fw-sheet-roses { width: clamp(120px, 30vw, 210px); }
.fh-root.is-sikh .fw-portrait-bloom.is-t { rotate: -20deg; } .fh-root.is-sikh .fw-portrait-bloom.is-b { rotate: 160deg; scale: 1; }
.fh-root.is-sikh .fw-datecard-wax b { font: 400 28px/1 var(--font-wk-guru), serif; }
.fh-root.is-sikh .fw-wax b { font: 400 34px/1 var(--font-wk-guru), serif; }
@media (min-width: 1024px) {
  .fh-hero.is-sikh .fh-card { --fh-reserve: 130px; }
  .fh-hero.is-sikh .fh-top { width: min(76vw, 1080px); top: -3%; -webkit-mask-image: radial-gradient(62% 120% at 50% 0%, #000 58%, transparent 100%); mask-image: radial-gradient(62% 120% at 50% 0%, #000 58%, transparent 100%); }
  .fh-hero.is-sikh .fh-base { width: min(96vw, 1400px); --fh-base-o: .38; }
}
`;

export const SIKH: FaithProfile = {
  id: "sikh",
  slug: "sikh-wedding-invitation",
  name: "Anand Karaj",
  art: {
    paper: S.paper,
    paperSoft: S.paperSoft,
    swirl: S.swirl,
    swirlSm: S.swirlSm,
    bloom: A["sk-bloom"],
    bloomAlt: A["sk-bloom"],
    sheetCorner: A["sk-peony-r"],
    corner: A["sk-peony-l"],
    cornerR: A["sk-peony-r"],
    sprig: A["sk-bloom"],
    rsvpWash: A["sk-wash"],
    rsvpFigure: A["sk-temple-gold"],
    heroBg: A["sk-arch"],
    heroBgSm: A["sk-arch-720"],
    heroTop: A["sk-peony-garland"],
    envTop: A["sk-peony-garland"],
    envBank: A["sk-temple-gold"],
    heroBank: A["sk-temple-gold"],
  },
  T: { en, pa },
  local: {
    code: "pa",
    short: "ਪੰ",
    locale: "pa-IN",
    dir: "ltr",
    messageLabel: "ਪੰਜਾਬੀ ਵਿੱਚ (optional)",
    messagePlaceholder: "ਵਾਹਿਗੁਰੂ ਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ…",
    openInLabel: "Open the invitation in Punjabi (guests can switch)",
  },
  mainRe: /anand\s*karaj|ਅਨੰਦ|laav|lavan|wedding|marriage/i,
  verse: {
    text: "They are not called husband and wife who merely sit together; they alone are husband and wife who have one light in two bodies.",
    ref: "Sri Guru Granth Sahib Ji · Ang 788",
    local: "ਏਕ ਜੋਤਿ ਦੁਇ ਮੂਰਤੀ ਧਨ ਪਿਰੁ ਕਹੀਐ ਸੋਇ ॥",
  },
  invocationLabel: "Ik Onkar and the Fateh on the invitation",
  eventArt: [
    { re: /anand|ਅਨੰਦ|laav|lavan|wedding/i, icon: ICONS.khanda },
    { re: /path|paath|sukhmani|kirtan|ardas|gurdwara/i, icon: ICONS.book },
    { re: /roka|kurmai|shagan|engagement|chunni|thaka|sagai|ring/i, icon: ICONS.ring },
    { re: /maiyan|maiya|vatna|haldi|batna/i, icon: ICONS.bowl },
    { re: /mehndi|mehendi|henna/i, icon: ICONS.henna },
    { re: /jaggo|jago/i, icon: ICONS.diya },
    { re: /sangeet|ladies|dholki|gidha|bhangra|music/i, icon: ICONS.dhol },
    { re: /chooda|choora|kalire|kaleera/i, icon: ICONS.bangles },
    { re: /doli|vidaai|vidai/i, icon: ICONS.doli },
    { re: /reception|dinner|party|cocktail/i, icon: ICONS.glasses },
    { re: /./, icon: ICONS.heart },
  ],
  css,
  wax: { light: "#e8c27c", mid: "#c98f34", deep: "#93601a" },
  day: sikhWeddingDay,
  quickFunctions: [
    { title: "Roka & Kurmai", dress: "Soft pastels", color: "#F1B89E" },
    { title: "Sri Akhand Path Sahib", dress: "Modest, heads covered", color: "#F1E6D6" },
    { title: "Maiyan", dress: "Yellows", color: "#F2C94C" },
    { title: "Mehndi", dress: "Greens and pastels", color: "#9DB89A" },
    { title: "Jaggo", dress: "Phulkari and bright suits", color: "#EE9A5E" },
    { title: "Chooda & Kalire", dress: "Reds and pinks", color: "#E7A3AE" },
    { title: "Anand Karaj", dress: "Traditional; heads covered", color: "#F3D9A4" },
    { title: "Doli", dress: "Traditional", color: "#A3122B" },
    { title: "Reception", dress: "Black tie", color: "#2A2622" },
  ],
  kit: {
    rsvp: { namePh: "e.g. Sandhu family", notePh: "Congratulations! Can't wait for the Jaggo…" },
    blessings: { placeholder: "May Waheguru keep you both in chardi kala…" },
    sample: [
      { id: "s1", name: "Nani ji", message: "ਵਾਹਿਗੁਰੂ ਤੁਹਾਡੀ ਜੋੜੀ ਸਦਾ ਸਲਾਮਤ ਰੱਖੇ। ❤️", createdAt: "" },
      { id: "s2", name: "Jas & Rimpy", message: "To a lifetime of bhangra together at every Lohri. Love you both!", createdAt: "" },
      { id: "s3", name: "Bhua ji", message: "May your home always be full of kirtan, laughter and hot parathe.", createdAt: "" },
    ],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Punjabi", "Mention our families", "Keep it short"],
  aiPlaceholder: "Simran and Harjot are getting married on 20 Feb 2027 at Gurdwara Singh Sabha, Ludhiana. Akhand Path on the 17th, Maiyan, Mehndi and Jaggo on the 18th, Anand Karaj at 9:30 am, reception at The Grand Orchard…",
};
