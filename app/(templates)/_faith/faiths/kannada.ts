// ─── Kannada Maduve: the Kannada wedding's profile ───────────────────────────
// On the shared faith-wedding engine. The hero is illustrated: the couple in wedding silks
// under a faint arch, a marigold toran and brass lamps above; the finale is an ivory card edged with a textile border, with the
// invocation at its head. English + Kannada (ಕನ್ನಡ). Functions, wording and verse researched
// for Kannada weddings (scratchpad/south/kannada.json in the build session).

import { kannadaWeddingDay } from "../../_valentine/days/kannada-wedding-invitation";
import { FAITH_ASSETS } from "../assets";
import { cdn } from "../../_wedding/media";
import { ICONS } from "../icons";
import type { FaithProfile, Strings } from "../types";

const A = FAITH_ASSETS["faith-south"];
const K = FAITH_ASSETS["faith-sikh"];
const S = FAITH_ASSETS.shared;

const en: Strings = {
  open: "Break the seal",
  openHint: "Tap the seal to open your lagna patrike",
  dear: "Dear",
  invited: "You are cordially invited",
  togetherWith: "With the grace of our kuladevata and the blessings of our elders",
  gettingMarried: "invite you to their Shubha Vivaha",
  shubh: "Shubha Vivaha",
  invitation: "The invitation",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the Dhare muhurtha",
  story: "Our story",
  storyEyebrow: "Pressed like mallige in a book",
  events: "The celebrations",
  eventsEyebrow: "Shastras & functions",
  film: "Our film",
  gallery: "Moments",
  galleryEyebrow: "The album",
  goodToKnow: "Good to know",
  guestsEyebrow: "For our guests",
  gettingThere: "Getting there",
  rsvp: "Will you grace us?",
  rsvpEyebrow: "Kindly respond",
  blessingsEyebrow: "Aashirvaada",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Leave your blessings",
  blessingsIntro: "A line from you, kept by the couple forever.",
  closing: "With love",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  done: "Shubha Vivaha complete",
  directions: "Directions",
  dress: "Dress code",
  tba: "Time to be announced",
  play: "Play the film",
  and: "&",
  scroll: "Scroll",
  dateEyebrow: "Save the date",
  venueEyebrow: "The kalyana mantapa",
  upasthiti: "Your presence is our blessing",
  copy: "Copy link",
  copied: "Link copied",
  contacts: "Any questions? Call us",
  contactsIntro: "The family is a phone call away.",
  call: "Call",
  shagun: "Udugore",
  shagunIntro: "Your blessings are the only gift we wish for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before",
  liveIntro: "Can't be there? Bless us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "Shri Ganeshaya Namah · Shubhamastu",
  seal: "ಶ್ರೀ",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
};

const kn: Strings = {
  open: "ಮುದ್ರೆ ತೆರೆಯಿರಿ",
  openHint: "ಲಗ್ನ ಪತ್ರಿಕೆ ತೆರೆಯಲು ಮುದ್ರೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ",
  dear: "ಆತ್ಮೀಯ",
  invited: "ತಮಗೆ ಆದರದ ಆಮಂತ್ರಣ",
  togetherWith: "ಕುಲದೇವರ ಕೃಪೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ",
  gettingMarried: "ಇವರ ಶುಭ ವಿವಾಹಕ್ಕೆ ತಮಗೆ ಆದರದ ಆಮಂತ್ರಣ",
  shubh: "ಶುಭ ವಿವಾಹ",
  invitation: "ಆಮಂತ್ರಣ ಪತ್ರಿಕೆ",
  blessingsOf: "ಇವರ ಶುಭಾಶೀರ್ವಾದಗಳೊಂದಿಗೆ",
  families: "ನಮ್ಮ ಕುಟುಂಬಗಳು",
  brideSide: "ವಧುವಿನ ಕಡೆಯವರು",
  groomSide: "ವರನ ಕಡೆಯವರು",
  countdown: "ಧಾರಾ ಮುಹೂರ್ತಕ್ಕೆ ಉಳಿದಿರುವ ಸಮಯ",
  story: "ನಮ್ಮ ಕಥೆ",
  storyEyebrow: "ನೆನಪಿನ ಪುಟಗಳು",
  events: "ಶುಭ ಕಾರ್ಯಕ್ರಮಗಳು",
  eventsEyebrow: "ಶಾಸ್ತ್ರಗಳು",
  film: "ನಮ್ಮ ವಿಡಿಯೋ",
  gallery: "ಸವಿನೆನಪುಗಳು",
  galleryEyebrow: "ಆಲ್ಬಮ್",
  goodToKnow: "ತಿಳಿದಿರಬೇಕಾದ ವಿಷಯಗಳು",
  guestsEyebrow: "ಅತಿಥಿಗಳಿಗಾಗಿ",
  gettingThere: "ತಲುಪುವ ಮಾರ್ಗ",
  rsvp: "ತಾವು ಆಗಮಿಸುವಿರಾ?",
  rsvpEyebrow: "ದಯವಿಟ್ಟು ತಿಳಿಸಿ",
  blessingsEyebrow: "ಆಶೀರ್ವಾದ",
  rsvpIntro: "ನಿಮ್ಮ ಕುಟುಂಬದ ಪರವಾಗಿ ಒಂದೇ ಉತ್ತರ. ನೀವು ಭಾಗವಹಿಸುವ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  blessings: "ನಿಮ್ಮ ಆಶೀರ್ವಾದ ನೀಡಿ",
  blessingsIntro: "ನಿಮ್ಮ ಒಂದು ಸಾಲು, ವಧೂವರರು ಎಂದೆಂದಿಗೂ ಜೋಪಾನವಾಗಿಡುವರು.",
  closing: "ಪ್ರೀತಿಯಿಂದ",
  whatsapp: "WhatsApp",
  replyBy: "ದಯವಿಟ್ಟು ಈ ದಿನಾಂಕದೊಳಗೆ ತಿಳಿಸಿ",
  done: "ಶುಭ ವಿವಾಹ ಸಂಪನ್ನವಾಯಿತು",
  directions: "ದಾರಿ ತೋರಿಸಿ",
  dress: "ಉಡುಗೆ",
  tba: "ಸಮಯವನ್ನು ಶೀಘ್ರದಲ್ಲೇ ತಿಳಿಸಲಾಗುವುದು",
  play: "ವಿಡಿಯೋ ನೋಡಿ",
  and: "ಮತ್ತು",
  scroll: "ಮುಂದೆ ನೋಡಿ",
  dateEyebrow: "ಶುಭ ದಿನಾಂಕ",
  venueEyebrow: "ಕಲ್ಯಾಣ ಮಂಟಪ",
  upasthiti: "ತಮ್ಮ ಉಪಸ್ಥಿತಿಯೇ ನಮಗೆ ಆಶೀರ್ವಾದ",
  copy: "ಲಿಂಕ್ ನಕಲಿಸಿ",
  copied: "ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ",
  contacts: "ಏನಾದರೂ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ? ನಮಗೆ ಕರೆ ಮಾಡಿ",
  contactsIntro: "ಕುಟುಂಬ ಕೇವಲ ಒಂದು ಕರೆಯ ದೂರದಲ್ಲಿದೆ.",
  call: "ಕರೆ ಮಾಡಿ",
  shagun: "ಉಡುಗೊರೆ",
  shagunIntro: "ನಿಮ್ಮ ಆಶೀರ್ವಾದವೇ ನಮಗೆ ದೊಡ್ಡ ಉಡುಗೊರೆ. ಕೇಳಿದವರಿಗಾಗಿ:",
  payUpi: "UPI ಮೂಲಕ ಕಳುಹಿಸಿ",
  copyUpi: "UPI ID ನಕಲಿಸಿ",
  live: "ನೇರಪ್ರಸಾರ ವೀಕ್ಷಿಸಿ",
  liveSoon: "ನೇರಪ್ರಸಾರ 30 ನಿಮಿಷ ಮೊದಲು ಆರಂಭವಾಗುತ್ತದೆ",
  liveIntro: "ಬರಲಾಗದಿದ್ದರೆ, ಆನ್‌ಲೈನ್‌ನಲ್ಲೇ ಆಶೀರ್ವದಿಸಿ.",
  close: "ಮುಚ್ಚಿ",
  showMap: "ನಕ್ಷೆ ತೋರಿಸಿ",
  greeting: "ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ · ಶುಭಮಸ್ತು",
  seal: "ಶ್ರೀ",
  units: { d: "ದಿನ", h: "ಗಂಟೆ", m: "ನಿಮಿಷ", s: "ಸೆಕೆಂಡು" },
};

const css = `
.fh-root.is-kannada { --fw-script: #7d1650; --fw-wax1: #b8862f; --fw-wax2: #7d1650; --fw-env: #f1e2d6; --fw-env-2: #e2c6b0; --fw-liner: #fbf0e8; }
/* The illustrated hero: an ivory room, a marigold toran and brass lamps along the top, banana plants at the edges; the couple under a faint mysore-palace on the left, the words on the right (the engine's split hero). The finale keeps the bordered card. */
.fh-hero.is-kannada { --fh-top: 0px; --fh-wall-bg: #fbf2e6; --fh-halo-o: .5; --fh-halo-h: 34%; --fh-halo-b: 3%; --fh-foot-w: 26%; --fh-wall: radial-gradient(ellipse 52% 62% at 27% 58%, rgba(190,40,110,.09), transparent 72%), radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,250,236,.85), transparent 70%), linear-gradient(180deg, rgba(251,244,230,.55), rgba(251,244,230,.2)), url("${cdn(S.paperSoft.src)}") 50% 50% / cover no-repeat, #fbf2e6; }
.fh-hero.is-kannada .fh-floor, .fh-hero.is-kannada .fh-top, .fh-hero.is-kannada .fh-base, .fh-hero.is-kannada .fh-corner, .fh-hero.is-kannada .fh-flank { display: none; }
/* the card: Ganesha (or the lamp), the blessing and the names in its ivory field, inside the woven border */
.fh-hero.is-kannada .fh-card { --fh-ar: 1000 / 1400; --fh-arn: .714; --fh-in-t: 16%; --fh-in-b: 9.5%; --fh-in-x: 13.5%; --fh-reserve: 0px; --fh-mask: url("/wedding-v3/faith-south/kn-panel-600.webp"); }
.fh-hero.is-kannada .fh-card-bg { filter: drop-shadow(0 34px 46px rgba(40,18,4,.42)) drop-shadow(0 6px 12px rgba(40,18,4,.22)); }
.fh-hero.is-kannada .fh-inv.is-img { width: 15cqw; height: auto; filter: drop-shadow(0 1px 0 rgba(255,255,255,.7)); }
.fh-hero.is-kannada .fh-names { --fh-names: 12.6cqw; margin-top: 1.2cqw; }
.fh-hero.is-kannada .fh-greet { font-size: 2.7cqw; letter-spacing: .05em; color: var(--wk-gold-ink); }
.fh-hero.is-kannada .fh-eyebrow { font-size: 3.05cqw; letter-spacing: .14em; margin-top: 3cqw; }
.fh-hero.is-kannada .fh-sub { font-size: 4.8cqw; margin-top: 2cqw; }
.fh-hero.is-kannada .fh-date { font-size: 3.4cqw; letter-spacing: .1em; white-space: nowrap; margin-top: 4cqw; padding: 2.6cqw 2cqw; }
.fh-hero.is-kannada .fh-venue { font-size: 4.2cqw; margin-top: 3cqw; }
.fh-root .fh-fin.is-kannada { --fh-seal-b: 8%; }
.fh-root .fh-fin.is-kannada .fh-card { --fh-in-t: 18%; --fh-in-b: 27%; }
/* the corners of the envelope and the last page: banana plants at the threshold, as at every South Indian door */
.fh-root.is-kannada .fh-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-kannada .fh-corner.is-r, .fh-root.is-kannada .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-kannada .fw-env-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-kannada .fh-env-top { width: min(110%, 760px); top: -2%; }
.fh-root.is-kannada .fw-rw-wash { opacity: .6; }
.fh-root.is-kannada .fh-rw-figure { width: 84%; bottom: 16% !important; }
.fh-root.is-kannada .fw-sheet-roses { width: clamp(84px, 20vw, 150px); }
.fh-root.is-kannada .fw-datecard-wax b, .fh-root.is-kannada .fw-wax b { font: 400 26px/1.3 var(--font-wk-kannada), serif; }
.fh-root.is-kannada .fw-lang button[lang="kn"] { font-family: var(--font-wk-kannada), serif; }
/* Wide screens: the finale's card, sized to the room. */
@media (min-width: 1024px) {
  .fh-hero.is-kannada { --fh-w: min(44vw, calc(90svh * .714)); }
}
/* Phones: the finale's card rises from the foot. */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-kannada { --fh-w: min(92vw, calc(64svh * .714)); }
  .fh-root .fh-hero.is-kannada .fh-stage { align-items: center; }
  .fh-root .fh-hero.is-kannada .fh-card { --fh-in-t: 15.5%; --fh-in-b: 9%; --fh-in-x: 12.5%; }
  .fh-root .fh-fin.is-kannada .fh-card { --fh-in-t: 18%; --fh-in-b: 33%; }
  .fh-root .fh-fin.is-kannada { --fh-seal-b: 6%; }
  .fh-root .fh-fin.is-kannada .fh-names { --fh-names: 11cqw; }
}
`;

export const KANNADA: FaithProfile = {
  id: "kannada",
  slug: "kannada-wedding-invitation",
  name: "Kannada Maduve",
  art: {
    paper: S.paper,
    paperSoft: S.paperSoft,
    swirl: S.swirl,
    swirlSm: S.swirlSm,
    bloom: A["so-jasmine"],
    bloomAlt: A["so-lotus"],
    sheetCorner: A["so-jasmine"],
    corner: A["so-banana-plant"],
    cornerR: A["so-banana-plant"],
    sprig: A["so-jasmine"],
    rsvpWash: K["sk-wash"],
    rsvpFigure: A["so-mysore-palace"],
    heroBg: A["kn-panel"],
    heroBgSm: A["kn-panel-600"],
    heroTop: A["so-toran"],
    heroHang: A["so-lamp-hanging"],
    heroSide: A["so-banana-plant"],
    heroHalo: A["so-mysore-palace"],
    heroFoot: A["so-diya-rangoli"],
    heroCouple: A["so-couple-veshti"],
    invocation: A["so-ganesha"],
    envTop: A["so-toran"],
    envBank: A["so-mysore-palace"],
  },
  T: { en, kn },
  local: {
    code: "kn",
    name: "Kannada",
    short: "ಕ",
    locale: "kn-IN",
    dir: "ltr",
    messageLabel: "ಕನ್ನಡದಲ್ಲಿ (optional)",
    messagePlaceholder: "ಕುಲದೇವರ ಕೃಪೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ…",
    openInLabel: "Open the invitation in Kannada (guests can switch)",
  },
  mainRe: /dhare|dhaare|muhurt|maduve|ಧಾರೆ|ಮುಹೂರ್ತ|ಮದುವೆ|ವಿವಾಹ|wedding|marriage/i,
  verseBoth: true,
  verse: {
    text: "By this sacred thread, the reason of my life, I tie the mangalya around your neck, O blessed one; may you live a hundred autumns.",
    ref: "The Mangalya Dharane mantra, chanted as the thaali is tied",
    local: "ಮಾಂಗಲ್ಯಂ ತಂತುನಾನೇನ ಮಮ ಜೀವನ ಹೇತುನಾ । ಕಂಠೇ ಬಧ್ನಾಮಿ ಸುಭಗೇ ತ್ವಂ ಜೀವ ಶರದಾಂ ಶತಮ್ ॥",
  },
  invocationLabel: "Shri Ganesha and the kalasha on the invitation",
  eventArt: [
    { re: /nishchit|ನಿಶ್ಚಿ|engage|ring/i, icon: ICONS.ring, art: A["so-bride-blue"] },
    { re: /chappara|ಚಪ್ಪರ|arishina|ಅರಿಶಿನ|haldi/i, icon: ICONS.bowl, art: A["so-haldi"] },
    { re: /devara|naandi|samaradhane|ದೇವರ|ನಾಂದಿ/i, icon: ICONS.diya, art: A["so-lamp-hanging"] },
    { re: /madarangi|mehendi|mehndi|ಮದರಂಗಿ/i, icon: ICONS.henna, art: A["so-mehndi"], fit: "scene" },
    { re: /varapooje|varapuja|aarathakshate|ವರಪೂಜೆ|ಆರತಕ್ಷತೆ|reception/i, icon: ICONS.glasses, art: A["so-mysore-palace"], fit: "scene" },
    { re: /kashi|ಕಾಶಿ/i, icon: ICONS.umbrella, art: A["so-umbrella"], fit: "scene" },
    { re: /okuli|ಓಕುಳಿ/i, icon: ICONS.heart, art: A["so-couple-veshti"] },
    { re: /griha|ಗೃಹ/i, icon: ICONS.kalash, art: A["so-kalash"] },
    { re: /dhare|dhaare|muhurt|maduve|ಧಾರೆ|ಮುಹೂರ್ತ|ಮದುವೆ|ವಿವಾಹ|kalyana|wedding|marriage/i, icon: ICONS.temple, art: A["so-arch-gold"] },
    { re: /./, icon: ICONS.heart, art: A["so-jasmine"], fit: "scene" },
  ],
  css,
  wax: { light: "#e6bc6e", mid: "#b8862f", deep: "#7d1650" },
  day: kannadaWeddingDay,
  quickFunctions: [{"title": "Nishchitartha", "dress": "Silk sarees and silk shirts", "color": "#C2185B"}, {"title": "Chappara Pooje", "dress": "Cotton sarees and kurtas", "color": "#6E8B3D"}, {"title": "Arishina Shastra", "dress": "Turmeric yellows", "color": "#E2A82B"}, {"title": "Devara Samaradhane & Naandi", "dress": "Traditional silks", "color": "#9E1B32"}, {"title": "Madarangi", "dress": "Greens and pastels", "color": "#7FA36B"}, {"title": "Varapooje & Aarathakshate", "dress": "Silk and festive", "color": "#5B1A3A"}, {"title": "Kashi Yatre", "dress": "Traditional", "color": "#E7C873"}, {"title": "Dhare Muhurtha", "dress": "Mysore silk, Kanjeevaram, panche", "color": "#B0215E"}, {"title": "Okuli", "dress": "Wedding silks", "color": "#D6604D"}, {"title": "Griha Pravesha", "dress": "Festive traditional", "color": "#C9A04A"}],
  kit: {
    rsvp: { namePh: "e.g. Rao family", notePh: "Congratulations! See you at the Varapooje…" },
    blessings: { placeholder: "May you both live a hundred happy years together…" },
    sample: [{"id": "s1", "name": "Ajji", "message": "ನೂರ್ಕಾಲ ಸುಖವಾಗಿ ಬಾಳಿ, ಮಕ್ಕಳೇ. ದೇವರು ಒಳ್ಳೆಯದು ಮಾಡಲಿ. ❤️", "createdAt": ""}, {"id": "s2", "name": "Pavan & Deepthi", "message": "To a lifetime of filter coffee mornings and Dasara nights together. Love you both!", "createdAt": ""}, {"id": "s3", "name": "Doddamma", "message": "May your home always smell of mallige, sambrani and fresh obbattu.", "createdAt": ""}],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Kannada", "Mention our families", "Keep it short"],
  aiPlaceholder: "Sinchana and Rakshith are getting married on 18 Feb 2027 at Sri Lakshmi Venkateshwara Kalyana Mantapa, Mysuru. Arishina on the 15th, Varapooje and Aarathakshate on the evening of the 17th, Dhare muhurtha at 9:12 am, Griha Pravesha in Bengaluru on the 19th…",
};
