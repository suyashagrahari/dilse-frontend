// ─── Tamil Kalyanam: the Tamil wedding's profile ───────────────────────────
// On the shared faith-wedding engine. The hero is illustrated: the couple in wedding silks
// under a faint arch, a marigold toran and brass lamps above; the finale is an ivory card edged with a textile border, with the
// invocation at its head. English + Tamil (தமிழ்). Functions, wording and verse researched
// for Tamil weddings (scratchpad/south/tamil.json in the build session).

import { tamilWeddingDay } from "../../_valentine/days/tamil-wedding-invitation";
import { FAITH_ASSETS } from "../assets";
import { cdn } from "../../_wedding/media";
import { ICONS } from "../icons";
import type { FaithProfile, Strings } from "../types";

const A = FAITH_ASSETS["faith-south"];
const K = FAITH_ASSETS["faith-sikh"];
const S = FAITH_ASSETS.shared;

const en: Strings = {
  open: "Break the seal",
  openHint: "Tap the seal to open your invitation",
  dear: "Dear",
  invited: "You're invited",
  togetherWith: "With the blessings of Lord Ganesha and our elders",
  gettingMarried: "invite you to their wedding",
  shubh: "Subha Muhurtham",
  invitation: "Thirumana Azhaippithazh",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the Muhurtham",
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
  blessingsEyebrow: "Aasirvadham",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Leave your blessings",
  blessingsIntro: "A line from you, kept by the couple forever.",
  closing: "With love",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  done: "The thali is tied. Thank you for your blessings",
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
  shagun: "Moi",
  shagunIntro: "Your blessings are all we wish for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before the Muhurtham",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "Sri Ganeshaya Namaha · Subha Muhurtham",
  seal: "உ",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
};

const ta: Strings = {
  open: "முத்திரையைத் திறவுங்கள்",
  openHint: "அழைப்பிதழைத் திறக்க முத்திரையைத் தொடுங்கள்",
  dear: "அன்புள்ள",
  invited: "தங்களை அன்புடன் அழைக்கிறோம்",
  togetherWith: "விநாயகப் பெருமான் மற்றும் பெரியோர்களின் நல்லாசியுடன்",
  gettingMarried: "ஆகியோரின் திருமணத்திற்குத் தங்களை அன்புடன் அழைக்கிறோம்",
  shubh: "சுப முகூர்த்தம்",
  invitation: "திருமண அழைப்பிதழ்",
  blessingsOf: "நல்லாசிகளுடன்",
  families: "எங்கள் குடும்பங்கள்",
  brideSide: "மணமகள் வீட்டார்",
  groomSide: "மணமகன் வீட்டார்",
  countdown: "முகூர்த்தத்திற்கு இன்னும்",
  story: "எங்கள் கதை",
  storyEyebrow: "நினைவுப் பக்கங்கள்",
  events: "சுப நிகழ்ச்சிகள்",
  eventsEyebrow: "நிகழ்ச்சிகள்",
  film: "எங்கள் காணொளி",
  gallery: "நினைவுகள்",
  galleryEyebrow: "புகைப்படத் தொகுப்பு",
  goodToKnow: "அறிந்துகொள்ள வேண்டியவை",
  guestsEyebrow: "விருந்தினர்களுக்கு",
  gettingThere: "வந்தடையும் வழி",
  rsvp: "தாங்கள் வருகை தருவீர்களா?",
  rsvpEyebrow: "தயவுசெய்து பதில் அளியுங்கள்",
  blessingsEyebrow: "ஆசீர்வாதம்",
  rsvpIntro: "குடும்பத்திற்கு ஒரே பதில் போதும். நீங்கள் கலந்துகொள்ளும் நிகழ்ச்சிகளைத் தேர்ந்தெடுங்கள்.",
  blessings: "உங்கள் வாழ்த்துகளைப் பகிருங்கள்",
  blessingsIntro: "உங்கள் ஒரு வரி வாழ்த்தை மணமக்கள் என்றும் போற்றிப் பாதுகாப்பார்கள்.",
  closing: "அன்புடன்",
  whatsapp: "WhatsApp",
  replyBy: "இந்தத் தேதிக்குள் பதில் அளியுங்கள்",
  done: "திருமணம் இனிதே நிறைவுற்றது",
  directions: "வழி காண",
  dress: "ஆடை முறை",
  tba: "நேரம் விரைவில் அறிவிக்கப்படும்",
  play: "காணொளியை இயக்கு",
  and: "&",
  scroll: "கீழே காண்க",
  dateEyebrow: "சுப தினம்",
  venueEyebrow: "நிகழ்விடம்",
  upasthiti: "தங்கள் வருகையே எங்களுக்கு ஆசீர்வாதம்",
  copy: "இணைப்பை நகலெடு",
  copied: "இணைப்பு நகலெடுக்கப்பட்டது",
  contacts: "சந்தேகமா? எங்களை அழையுங்கள்",
  contactsIntro: "குடும்பத்தினர் ஒரு அழைப்புத் தொலைவில் இருக்கிறார்கள்.",
  call: "அழைக்க",
  shagun: "மொய்",
  shagunIntro: "உங்கள் ஆசீர்வாதமே எங்களுக்குப் பெரும் பரிசு. கேட்டவர்களுக்காக:",
  payUpi: "UPI மூலம் அனுப்புக",
  copyUpi: "UPI ID-ஐ நகலெடு",
  live: "நேரலையில் காண்க",
  liveSoon: "முகூர்த்தத்திற்கு 30 நிமிடங்கள் முன் நேரலை தொடங்கும்",
  liveIntro: "நேரில் வர இயலவில்லையா? இணையத்தில் இணைந்திருங்கள்.",
  close: "மூடு",
  showMap: "வரைபடத்தைக் காண்க",
  greeting: "ஸ்ரீ கணேசாய நமஹ · சுப முகூர்த்தம்",
  seal: "உ",
  units: { d: "நாட்கள்", h: "மணி", m: "நிமிடம்", s: "விநாடி" },
};

const css = `
.fh-root.is-tamil { --fw-script: #7a1a2c; --fw-wax1: #b8862f; --fw-wax2: #7a1a2c; --fw-env: #f3e3cc; --fw-env-2: #e6cca4; --fw-liner: #fbf1de; }
/* The illustrated hero: an ivory room, a marigold toran and brass lamps along the top, banana plants at the edges; the couple under a faint gopuram on the left, the words on the right (the engine's split hero). The finale keeps the bordered card. */
.fh-hero.is-tamil { --fh-top: 0px; --fh-wall-bg: #fbf3e3; --fh-halo-o: .26; --fh-wall: radial-gradient(ellipse 52% 62% at 27% 58%, rgba(232,160,70,.16), transparent 72%), radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,250,236,.85), transparent 70%), linear-gradient(180deg, rgba(251,244,230,.55), rgba(251,244,230,.2)), url("${cdn(S.paperSoft.src)}") 50% 50% / cover no-repeat, #fbf3e3; }
.fh-hero.is-tamil .fh-floor, .fh-hero.is-tamil .fh-top, .fh-hero.is-tamil .fh-base, .fh-hero.is-tamil .fh-corner, .fh-hero.is-tamil .fh-flank { display: none; }
/* the card: Ganesha (or the lamp), the blessing and the names in its ivory field, inside the woven border */
.fh-hero.is-tamil .fh-card { --fh-ar: 1000 / 1400; --fh-arn: .714; --fh-in-t: 16%; --fh-in-b: 9.5%; --fh-in-x: 13.5%; --fh-reserve: 0px; --fh-mask: url("/wedding-v3/faith-south/ta-panel-600.webp"); }
.fh-hero.is-tamil .fh-card-bg { filter: drop-shadow(0 34px 46px rgba(40,18,4,.42)) drop-shadow(0 6px 12px rgba(40,18,4,.22)); }
.fh-hero.is-tamil .fh-inv.is-img { width: 15cqw; height: auto; filter: drop-shadow(0 1px 0 rgba(255,255,255,.7)); }
.fh-hero.is-tamil .fh-names { --fh-names: 12.6cqw; margin-top: 1.2cqw; }
.fh-hero.is-tamil .fh-greet { font-size: 2.7cqw; letter-spacing: .05em; color: var(--wk-gold-ink); }
.fh-hero.is-tamil .fh-eyebrow { font-size: 3.05cqw; letter-spacing: .14em; margin-top: 3cqw; }
.fh-hero.is-tamil .fh-sub { font-size: 4.8cqw; margin-top: 2cqw; }
.fh-hero.is-tamil .fh-date { font-size: 3.4cqw; letter-spacing: .1em; white-space: nowrap; margin-top: 4cqw; padding: 2.6cqw 2cqw; }
.fh-hero.is-tamil .fh-venue { font-size: 4.2cqw; margin-top: 3cqw; }
.fh-root .fh-fin.is-tamil { --fh-seal-b: 8%; }
.fh-root .fh-fin.is-tamil .fh-card { --fh-in-t: 18%; --fh-in-b: 27%; }
/* the corners of the envelope and the last page: banana plants at the threshold, as at every South Indian door */
.fh-root.is-tamil .fh-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-tamil .fh-corner.is-r, .fh-root.is-tamil .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-tamil .fw-env-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-tamil .fh-env-top { width: min(110%, 760px); top: -2%; }
.fh-root.is-tamil .fw-rw-wash { opacity: .6; }
.fh-root.is-tamil .fh-rw-figure { width: 84%; bottom: 16% !important; }
.fh-root.is-tamil .fw-sheet-roses { width: clamp(84px, 20vw, 150px); }
.fh-root.is-tamil .fw-datecard-wax b, .fh-root.is-tamil .fw-wax b { font: 400 26px/1.3 var(--font-wk-tamil), serif; }
.fh-root.is-tamil .fw-lang button[lang="ta"] { font-family: var(--font-wk-tamil), serif; }
/* Wide screens: the finale's card, sized to the room. */
@media (min-width: 1024px) {
  .fh-hero.is-tamil { --fh-w: min(44vw, calc(90svh * .714)); }
}
/* Phones: the finale's card rises from the foot. */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-tamil { --fh-w: min(92vw, calc(64svh * .714)); }
  .fh-root .fh-hero.is-tamil .fh-stage { align-items: center; }
  .fh-root .fh-hero.is-tamil .fh-card { --fh-in-t: 15.5%; --fh-in-b: 9%; --fh-in-x: 12.5%; }
  .fh-root .fh-fin.is-tamil .fh-card { --fh-in-t: 18%; --fh-in-b: 33%; }
  .fh-root .fh-fin.is-tamil { --fh-seal-b: 6%; }
  .fh-root .fh-fin.is-tamil .fh-names { --fh-names: 11cqw; }
}
`;

export const TAMIL: FaithProfile = {
  id: "tamil",
  slug: "tamil-wedding-invitation",
  name: "Tamil Kalyanam",
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
    rsvpFigure: A["so-gopuram-gold"],
    heroBg: A["ta-panel"],
    heroBgSm: A["ta-panel-600"],
    heroTop: A["so-toran"],
    heroHang: A["so-lamp-hanging"],
    heroSide: A["so-banana-plant"],
    heroHalo: A["so-gopuram-gold"],
    heroFoot: A["so-lotus"],
    heroCouple: A["so-couple-veshti"],
    invocation: A["so-ganesha"],
    envTop: A["so-toran"],
    envBank: A["so-gopuram"],
  },
  T: { en, ta },
  local: {
    code: "ta",
    name: "Tamil",
    short: "த",
    locale: "ta-IN",
    dir: "ltr",
    messageLabel: "தமிழில் (optional)",
    messagePlaceholder: "நிகழும் மங்களகரமான … வருடம் … மாதம் … சுபமுகூர்த்தத்தில் …",
    openInLabel: "Open the invitation in Tamil (guests can switch)",
  },
  /** the Muhurtham itself, not the Panda Kaal Muhurtham days before */
  mainRe: /^(?!.*(?:panda|pandha|பந்த))(?=.*(?:muhurt|முகூர்த்த|thali|thaali|தாலி|kalyanam|கல்யாண|thirumanam|திருமண|wedding|marriage))/i,
  verseBoth: true,
  verse: {
    text: "If home life holds love and virtue, that is both its grace and its fruit.",
    ref: "Thirukkural · 45",
    local: "அன்பும் அறனும் உடைத்தாயின் இல்வாழ்க்கை\nபண்பும் பயனும் அது.",
  },
  invocationLabel: "Pillaiyar suzhi (உ) and the Ganesha line on the invitation",
  eventArt: [
    { re: /nichay|நிச்சய|engage|ring/i, icon: ICONS.ring, art: A["so-bride-teal"] },
    { re: /panda|pandha|பந்த/i, icon: ICONS.leaf, art: A["so-banana-plant"], fit: "scene" },
    { re: /naandi|vratham|விரத|நாந்தி/i, icon: ICONS.diya, art: A["so-diya-rangoli"], fit: "scene" },
    { re: /mappillai|janavas|அழைப்|ஜானவாச/i, icon: ICONS.temple, art: A["so-elephant"], fit: "scene" },
    { re: /kashi|காசி/i, icon: ICONS.umbrella, art: A["so-umbrella"], fit: "scene" },
    { re: /maalai|oonjal|ஊஞ்சல்|மாலை/i, icon: ICONS.heart, art: A["so-couple-veshti"] },
    { re: /saptapadi|சப்தபதி/i, icon: ICONS.diya, art: A["so-lotus"], fit: "scene" },
    { re: /nalangu|நலங்கு/i, icon: ICONS.kalash, art: A["so-kalash"] },
    { re: /reception|வரவேற்/i, icon: ICONS.glasses, art: A["so-bride-green"] },
    { re: /muhurt|முகூர்த்த|thali|thaali|தாலி|kalyan|கல்யாண|thirumanam|திருமண|wedding|marriage/i, icon: ICONS.temple, art: A["so-gopuram"] },
    { re: /./, icon: ICONS.heart, art: A["so-jasmine"], fit: "scene" },
  ],
  css,
  wax: { light: "#e3b768", mid: "#b8862f", deep: "#7a1a2c" },
  day: tamilWeddingDay,
  quickFunctions: [{"title": "Nichayathartham", "dress": "Silk sarees and veshti-shirts", "color": "#E7A3AE"}, {"title": "Panda Kaal Muhurtham", "dress": "Simple cottons; family only", "color": "#E3A82B"}, {"title": "Sumangali Prarthanai", "dress": "Madisar or nine-yard silks for the ladies", "color": "#C9A24A"}, {"title": "Naandi & Vratham", "dress": "Veshti and angavastram; silk sarees", "color": "#F3E2C0"}, {"title": "Mappillai Azhaippu", "dress": "Festive silks", "color": "#A8235B"}, {"title": "Reception", "dress": "Evening silks and bandhgalas", "color": "#5A1A1B"}, {"title": "Kashi Yatra", "dress": "Veshti in white and gold", "color": "#F7EFDD"}, {"title": "Maalai Maatral & Oonjal", "dress": "Bright Kanjeevaram silks", "color": "#C2185B"}, {"title": "Muhurtham", "dress": "Traditional: Kanjeevaram silks, veshti", "color": "#B8862E"}, {"title": "Nalangu", "dress": "Light silk-cottons", "color": "#4E7A2E"}],
  kit: {
    rsvp: { namePh: "e.g. The Raghavan family", notePh: "Congratulations! Wouldn't miss the Oonjal for anything…" },
    blessings: { placeholder: "May you both be blessed with the sixteen fortunes and a long, happy life…" },
    sample: [{"id": "s1", "name": "Paati", "message": "பதினாறும் பெற்றுப் பெருவாழ்வு வாழ்க! 🙏", "createdAt": ""}, {"id": "s2", "name": "Ramya & Arun", "message": "From the Mylapore kutcheri queue to the oonjal, so proud of you two. Love you both!", "createdAt": ""}, {"id": "s3", "name": "Chithi", "message": "May your home always smell of filter coffee and fresh jasmine, and be full of laughter.", "createdAt": ""}],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Tamil", "Mention our families", "Keep it short"],
  aiPlaceholder: "Meenakshi and Karthik are getting married on 11 Feb 2027 at Sri Kamakshi Kalyana Mandapam, T. Nagar, Chennai. Nichayathartham on the 7th, Mappillai Azhaippu and the reception on the 10th, Muhurtham 9:00–10:30 am, Nalangu in the afternoon…",
};
