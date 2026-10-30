// ─── Telugu Pelli: the Telugu wedding's profile ───────────────────────────
// On the shared faith-wedding engine. The hero is illustrated: the couple in wedding silks
// under a faint arch, a marigold toran and brass lamps above; the finale is an ivory card edged with a textile border, with the
// invocation at its head. English + Telugu (తెలుగు). Functions, wording and verse researched
// for Telugu weddings (scratchpad/south/telugu.json in the build session).

import { teluguWeddingDay } from "../../_valentine/days/telugu-wedding-invitation";
import { FAITH_ASSETS } from "../assets";
import { cdn } from "../../_wedding/media";
import { ICONS } from "../icons";
import type { FaithProfile, Strings } from "../types";

const A = FAITH_ASSETS["faith-south"];
const K = FAITH_ASSETS["faith-sikh"];
const S = FAITH_ASSETS.shared;

const en: Strings = {
  open: "Break the seal",
  openHint: "Tap the seal to open your Shubhalekha",
  dear: "Dear",
  invited: "You're invited",
  togetherWith: "By the grace of Sri Venkateswara and the blessings of our elders",
  gettingMarried: "invite you to their Kalyanam",
  shubh: "Kalyanam",
  invitation: "The Shubhalekha",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the muhurtham",
  story: "Our story",
  storyEyebrow: "From our pelli pustakam",
  events: "The celebrations",
  eventsEyebrow: "Functions",
  film: "Our film",
  gallery: "Moments",
  galleryEyebrow: "The album",
  goodToKnow: "Good to know",
  guestsEyebrow: "For our guests",
  gettingThere: "Getting there",
  rsvp: "Will you bless us in person?",
  rsvpEyebrow: "Kindly respond",
  blessingsEyebrow: "Aseervachanam",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Send your akshinthalu",
  blessingsIntro: "A line from you, kept by the couple forever.",
  closing: "With love and regards",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  done: "The Kalyanam is complete",
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
  shagun: "Chadivimpulu",
  shagunIntro: "Your blessings are all we wish for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "Srirastu · Subhamastu · Avighnamastu",
  seal: "శ్రీ",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
};

const te: Strings = {
  open: "ముద్ర తెరవండి",
  openHint: "శుభలేఖ తెరవడానికి ముద్రను తాకండి",
  dear: "ప్రియమైన",
  invited: "మీకు సాదర ఆహ్వానం",
  togetherWith: "శ్రీ వేంకటేశ్వర స్వామి వారి కృపతో, పెద్దల ఆశీస్సులతో",
  gettingMarried: "వివాహ మహోత్సవానికి మీకు సాదర ఆహ్వానం",
  shubh: "కల్యాణం",
  invitation: "శుభలేఖ",
  blessingsOf: "ఆశీస్సులతో",
  families: "మా కుటుంబాలు",
  brideSide: "ఆడపెళ్లివారు",
  groomSide: "మగపెళ్లివారు",
  countdown: "సుముహూర్తానికి ఇంకా",
  story: "మా కథ",
  storyEyebrow: "మా పెళ్లి పుస్తకం నుండి",
  events: "శుభ కార్యక్రమాలు",
  eventsEyebrow: "వేడుకలు",
  film: "మా వీడియో",
  gallery: "జ్ఞాపకాలు",
  galleryEyebrow: "ఆల్బమ్",
  goodToKnow: "తెలుసుకోవలసినవి",
  guestsEyebrow: "అతిథుల కోసం",
  gettingThere: "ఎలా చేరుకోవాలి",
  rsvp: "మీరు విచ్చేస్తారా?",
  rsvpEyebrow: "దయచేసి తెలియజేయండి",
  blessingsEyebrow: "ఆశీర్వచనం",
  rsvpIntro: "మీ కుటుంబం తరఫున ఒకే జవాబు. మీరు హాజరయ్యే వేడుకలను ఎంచుకోండి.",
  blessings: "మీ అక్షింతలు పంపండి",
  blessingsIntro: "మీ ఒక్క మాట, వధూవరులు జీవితాంతం దాచుకుంటారు.",
  closing: "ప్రేమతో",
  whatsapp: "WhatsApp",
  replyBy: "దయచేసి ఈ తేదీలోగా తెలియజేయండి",
  done: "కల్యాణం శుభంగా జరిగింది",
  directions: "దారి చూడండి",
  dress: "వస్త్రధారణ",
  tba: "సమయం త్వరలో తెలియజేస్తాము",
  play: "వీడియో చూడండి",
  and: "మరియు",
  scroll: "కిందకు చూడండి",
  dateEyebrow: "శుభ తేదీ",
  venueEyebrow: "వేదిక",
  upasthiti: "మీ రాకే మాకు ఆశీర్వాదం",
  copy: "లింక్ కాపీ చేయండి",
  copied: "లింక్ కాపీ అయింది",
  contacts: "సందేహాలుంటే మాకు ఫోన్ చేయండి",
  contactsIntro: "కుటుంబం ఒక్క ఫోన్ కాల్ దూరంలోనే ఉంది.",
  call: "ఫోన్ చేయండి",
  shagun: "చదివింపులు",
  shagunIntro: "మీ ఆశీస్సులే మాకు పెద్ద కానుక. అడిగిన వారి కోసం:",
  payUpi: "UPI ద్వారా పంపండి",
  copyUpi: "UPI ID కాపీ చేయండి",
  live: "ప్రత్యక్ష ప్రసారం చూడండి",
  liveSoon: "ప్రత్యక్ష ప్రసారం 30 నిమిషాల ముందు ప్రారంభమవుతుంది",
  liveIntro: "రాలేకపోతున్నారా? ఇంటి నుంచే మాతో కలవండి.",
  close: "మూసివేయండి",
  showMap: "మ్యాప్ చూడండి",
  greeting: "శ్రీరస్తు · శుభమస్తు · అవిఘ్నమస్తు",
  seal: "శ్రీ",
  units: { d: "రోజులు", h: "గంటలు", m: "నిమిషాలు", s: "సెకన్లు" },
};

const css = `
.fh-root.is-telugu { --fw-script: #8e1530; --fw-wax1: #c98a14; --fw-wax2: #8e1530; --fw-env: #f6e4c4; --fw-env-2: #ebcc96; --fw-liner: #fdf3df; }
/* The illustrated hero: an ivory room, a marigold toran and brass lamps along the top, banana plants at the edges; the couple under a faint arch-pink on the left, the words on the right (the engine's split hero). The finale keeps the bordered card. */
.fh-hero.is-telugu { --fh-top: 0px; --fh-wall-bg: #fcf1e4; --fh-halo-o: .42; --fh-foot-w: 22%; --fh-wall: radial-gradient(ellipse 52% 62% at 27% 58%, rgba(214,60,70,.10), transparent 72%), radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,250,236,.85), transparent 70%), linear-gradient(180deg, rgba(251,244,230,.55), rgba(251,244,230,.2)), url("${cdn(S.paperSoft.src)}") 50% 50% / cover no-repeat, #fcf1e4; }
.fh-hero.is-telugu .fh-floor, .fh-hero.is-telugu .fh-top, .fh-hero.is-telugu .fh-base, .fh-hero.is-telugu .fh-corner, .fh-hero.is-telugu .fh-flank { display: none; }
/* the card: Ganesha (or the lamp), the blessing and the names in its ivory field, inside the woven border */
.fh-hero.is-telugu .fh-card { --fh-ar: 1000 / 1400; --fh-arn: .714; --fh-in-t: 16%; --fh-in-b: 9.5%; --fh-in-x: 13.5%; --fh-reserve: 0px; --fh-mask: url("/wedding-v3/faith-south/te-panel-600.webp"); }
.fh-hero.is-telugu .fh-card-bg { filter: drop-shadow(0 34px 46px rgba(40,18,4,.42)) drop-shadow(0 6px 12px rgba(40,18,4,.22)); }
.fh-hero.is-telugu .fh-inv.is-img { width: 15cqw; height: auto; filter: drop-shadow(0 1px 0 rgba(255,255,255,.7)); }
.fh-hero.is-telugu .fh-names { --fh-names: 12.6cqw; margin-top: 1.2cqw; }
.fh-hero.is-telugu .fh-greet { font-size: 2.7cqw; letter-spacing: .05em; color: var(--wk-gold-ink); }
.fh-hero.is-telugu .fh-eyebrow { font-size: 3.05cqw; letter-spacing: .14em; margin-top: 3cqw; }
.fh-hero.is-telugu .fh-sub { font-size: 4.8cqw; margin-top: 2cqw; }
.fh-hero.is-telugu .fh-date { font-size: 3.4cqw; letter-spacing: .1em; white-space: nowrap; margin-top: 4cqw; padding: 2.6cqw 2cqw; }
.fh-hero.is-telugu .fh-venue { font-size: 4.2cqw; margin-top: 3cqw; }
.fh-root .fh-fin.is-telugu { --fh-seal-b: 8%; }
.fh-root .fh-fin.is-telugu .fh-card { --fh-in-t: 18%; --fh-in-b: 27%; }
/* the corners of the envelope and the last page: banana plants at the threshold, as at every South Indian door */
.fh-root.is-telugu .fh-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-telugu .fh-corner.is-r, .fh-root.is-telugu .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-telugu .fw-env-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-telugu .fh-env-top { width: min(110%, 760px); top: -2%; }
.fh-root.is-telugu .fw-rw-wash { opacity: .6; }
.fh-root.is-telugu .fh-rw-figure { width: 84%; bottom: 16% !important; }
.fh-root.is-telugu .fw-sheet-roses { width: clamp(84px, 20vw, 150px); }
.fh-root.is-telugu .fw-datecard-wax b, .fh-root.is-telugu .fw-wax b { font: 400 26px/1.3 var(--font-wk-telugu), serif; }
.fh-root.is-telugu .fw-lang button[lang="te"] { font-family: var(--font-wk-telugu), serif; }
/* Wide screens: the finale's card, sized to the room. */
@media (min-width: 1024px) {
  .fh-hero.is-telugu { --fh-w: min(44vw, calc(90svh * .714)); }
}
/* Phones: the finale's card rises from the foot. */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-telugu { --fh-w: min(92vw, calc(64svh * .714)); }
  .fh-root .fh-hero.is-telugu .fh-stage { align-items: center; }
  .fh-root .fh-hero.is-telugu .fh-card { --fh-in-t: 15.5%; --fh-in-b: 9%; --fh-in-x: 12.5%; }
  .fh-root .fh-fin.is-telugu .fh-card { --fh-in-t: 18%; --fh-in-b: 33%; }
  .fh-root .fh-fin.is-telugu { --fh-seal-b: 6%; }
  .fh-root .fh-fin.is-telugu .fh-names { --fh-names: 11cqw; }
}
`;

export const TELUGU: FaithProfile = {
  id: "telugu",
  slug: "telugu-wedding-invitation",
  name: "Telugu Pelli",
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
    rsvpFigure: A["so-arch-gold"],
    heroBg: A["te-panel"],
    heroBgSm: A["te-panel-600"],
    heroTop: A["so-toran"],
    heroHang: A["so-lamp-hanging"],
    heroSide: A["so-banana-plant"],
    heroHalo: A["so-arch-pink"],
    heroFoot: A["so-jasmine"],
    heroCouple: A["so-couple-veshti"],
    invocation: A["so-ganesha"],
    envTop: A["so-toran"],
    envBank: A["so-gopuram-gold"],
  },
  T: { en, te },
  local: {
    code: "te",
    name: "Telugu",
    short: "తె",
    locale: "te-IN",
    dir: "ltr",
    messageLabel: "తెలుగులో (optional)",
    messagePlaceholder: "శ్రీ వేంకటేశ్వర స్వామి వారి కృపతో, పెద్దల ఆశీస్సులతో…",
    openInLabel: "Open the invitation in Telugu (guests can switch)",
  },
  /** the Kalyanam, not the Pellikuthuru / Pellikoduku (which also say "pelli") */
  mainRe: /kalyan|subha\s*muhurt|jeelakarra|vivah|వివాహ|కల్యాణ|కళ్యాణ|wedding|marriage/i,
  verseBoth: true,
  verse: {
    text: "This is the sacred thread, the reason of my life. I tie it around your neck, O auspicious one; may you live a hundred autumns.",
    ref: "Mangalya Dharana mantra · chanted as the mangalasutram is tied",
    local: "మాంగల్యం తంతునానేన మమ జీవన హేతునా । కంఠే బధ్నామి సుభగే త్వం జీవ శరదాం శతమ్ ॥",
  },
  invocationLabel: "Sri and Srirastu Subhamastu on the invitation",
  eventArt: [
    { re: /nischit|నిశ్చి|engage|ring/i, icon: ICONS.ring, art: A["so-bride-red"] },
    { re: /pellikuthuru|pellikoduku|pendli|mangala\s*snan|haldi|పెళ్లికూతురు|పెళ్లికొడుకు/i, icon: ICONS.bowl, art: A["so-haldi"] },
    { re: /mehendi|mehndi|sangeet|గోరింట|మెహందీ/i, icon: ICONS.henna, art: A["so-mehndi"], fit: "scene" },
    { re: /kasi|kashi|snathak|కాశీ|స్నాతక/i, icon: ICONS.umbrella, art: A["so-umbrella"], fit: "scene" },
    { re: /edurukol|ఎదురుకోల/i, icon: ICONS.kalash, art: A["so-elephant"], fit: "scene" },
    { re: /appagint|అప్పగింత|vidaai/i, icon: ICONS.doli, art: A["so-bride-blue"] },
    { re: /reception|రిసెప్షన్/i, icon: ICONS.glasses, art: A["so-arch-pink"], fit: "scene" },
    { re: /vratham|satyanarayana|వ్రత/i, icon: ICONS.diya, art: A["so-diya-rangoli"], fit: "scene" },
    { re: /kalyan|pelli|muhurt|vivah|వివాహ|కల్యాణ|కళ్యాణ|పెళ్లి|wedding|marriage|jeelakarra/i, icon: ICONS.temple, art: A["so-couple-veshti"] },
    { re: /./, icon: ICONS.heart, art: A["so-jasmine"], fit: "scene" },
  ],
  css,
  wax: { light: "#f0c25a", mid: "#c98a14", deep: "#8e1530" },
  day: teluguWeddingDay,
  quickFunctions: [{"title": "Nischitartham", "dress": "Silks in soft pastels", "color": "#E9A9A0"}, {"title": "Pellikuthuru & Pellikoduku", "dress": "Turmeric yellows and leaf greens", "color": "#F2C230"}, {"title": "Mehendi & Sangeet", "dress": "Greens and festive pastels", "color": "#8DB580"}, {"title": "Snathakam & Kasi Yatra", "dress": "Cream and gold", "color": "#F1E4C8"}, {"title": "Edurukolu", "dress": "Festive marigold silks", "color": "#E8892B"}, {"title": "Kalyanam", "dress": "Kanchi and Dharmavaram silks", "color": "#C9962F"}, {"title": "Appagintalu", "dress": "Traditional silks", "color": "#8E1B2C"}, {"title": "Reception", "dress": "Black tie, a touch of gold", "color": "#2B2421"}, {"title": "Satyanarayana Vratham", "dress": "Simple silks", "color": "#F4E3C1"}],
  kit: {
    rsvp: { namePh: "e.g. Vemuri family", notePh: "Congratulations! Saving my best pattu saree for the muhurtham…" },
    blessings: { placeholder: "May you both live a hundred years, happy and together…" },
    sample: [{"id": "s1", "name": "Ammamma", "message": "నూరేళ్లు పచ్చని కాపురం చేయండి, చల్లగా ఉండండి. ❤️", "createdAt": ""}, {"id": "s2", "name": "Ravi & Keerthi", "message": "From kite fights on Sankranti to talambralu fights at midnight. Go easy on each other with the rice!", "createdAt": ""}, {"id": "s3", "name": "Peddananna", "message": "May your home always smell of ghee, jasmine and filter coffee.", "createdAt": ""}],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Telugu", "Mention our families", "Keep it short"],
  aiPlaceholder: "Sravya and Karthik are getting married on 11 Feb 2027 at Sri Durga Kalyana Vedika, Vijayawada. Pellikuthuru on the 10th, Mehendi & Sangeet that night, Edurukolu at 8 pm on the 11th, muhurtham at 11:42 pm, reception at The Riverside Grand on the 13th…",
};
