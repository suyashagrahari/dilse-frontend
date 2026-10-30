// ─── Shubh Vivah: the Marathi wedding's profile ───────────────────────────
// On the shared faith-wedding engine. The hero is illustrated: the couple in wedding silks
// under a faint arch, a marigold toran and brass lamps above; the finale is an ivory card edged with a textile border, with the
// invocation at its head. English + Marathi (मराठी). Functions, wording and verse researched
// for Marathi weddings (scratchpad/south/marathi.json in the build session).

import { marathiWeddingDay } from "../../_valentine/days/marathi-wedding-invitation";
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
  invited: "You're warmly invited",
  togetherWith: "By the grace of Shri Ganesha and the blessings of our elders",
  gettingMarried: "invite you to their wedding",
  shubh: "Shubh Vivah",
  invitation: "The invitation",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the Mangalashtak",
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
  blessingsEyebrow: "Ashirvaad",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Leave your blessings",
  blessingsIntro: "A line from you, kept by the couple forever.",
  closing: "With love",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  done: "Shubhamangal! The couple is wed",
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
  shagun: "Aaher",
  shagunIntro: "Your blessings are the only aaher we wish for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "Shri Ganeshaya Namah · Shubhamangal Saavdhaan",
  seal: "श्री",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
};

const mr: Strings = {
  open: "मोहोर उघडा",
  openHint: "निमंत्रण उघडण्यासाठी मोहोरेला स्पर्श करा",
  dear: "प्रिय",
  invited: "आपणांस सस्नेह निमंत्रण",
  togetherWith: "श्री गणरायाच्या कृपेने व वडीलधाऱ्यांच्या आशीर्वादाने",
  gettingMarried: "यांच्या शुभविवाहाचे सस्नेह निमंत्रण",
  shubh: "शुभविवाह",
  invitation: "निमंत्रण पत्रिका",
  blessingsOf: "शुभाशीर्वाद",
  families: "आमचे कुटुंबीय",
  brideSide: "वधूपक्ष",
  groomSide: "वरपक्ष",
  countdown: "मंगलाष्टकांसाठी उरलेला वेळ",
  story: "आमची कहाणी",
  storyEyebrow: "आठवणींच्या पानांतून",
  events: "मंगल कार्यक्रम",
  eventsEyebrow: "कार्यक्रम",
  film: "आमचा चित्रपट",
  gallery: "क्षणचित्रे",
  galleryEyebrow: "अल्बम",
  goodToKnow: "महत्त्वाची माहिती",
  guestsEyebrow: "पाहुण्यांसाठी",
  gettingThere: "कसे पोहोचाल",
  rsvp: "आपण नक्की याल ना?",
  rsvpEyebrow: "कृपया कळवावे",
  blessingsEyebrow: "आशीर्वाद",
  rsvpIntro: "संपूर्ण कुटुंबाकडून एकच उत्तर. ज्या कार्यक्रमांना याल ते निवडा.",
  blessings: "आपले शुभाशीर्वाद द्या",
  blessingsIntro: "आपली एक ओळ, जी वधूवर कायम जपून ठेवतील.",
  closing: "स्नेहपूर्वक",
  whatsapp: "WhatsApp",
  replyBy: "कृपया उत्तर कळवावे",
  done: "शुभमंगल संपन्न",
  directions: "मार्ग पाहा",
  dress: "पोशाख",
  tba: "वेळ लवकरच कळवू",
  play: "चित्रपट पाहा",
  and: "आणि",
  scroll: "पुढे पाहा",
  dateEyebrow: "शुभ दिनांक",
  venueEyebrow: "कार्यस्थळ",
  upasthiti: "आपली उपस्थिती प्रार्थनीय",
  copy: "लिंक कॉपी करा",
  copied: "लिंक कॉपी झाली",
  contacts: "काही प्रश्न? आम्हाला फोन करा",
  contactsIntro: "कुटुंबीय फक्त एका फोनच्या अंतरावर आहेत.",
  call: "फोन करा",
  shagun: "आहेर",
  shagunIntro: "आपले आशीर्वाद हाच आमचा आहेर. ज्यांनी आवर्जून विचारले, त्यांच्यासाठी:",
  payUpi: "UPI ने पाठवा",
  copyUpi: "UPI आयडी कॉपी करा",
  live: "थेट पाहा",
  liveSoon: "थेट प्रक्षेपण ३० मिनिटे आधी सुरू होईल",
  liveIntro: "येणे शक्य नसल्यास ऑनलाइन सहभागी व्हा.",
  close: "बंद करा",
  showMap: "नकाशा पाहा",
  greeting: "॥ श्री गणेशाय नमः ॥ शुभमंगल सावधान",
  seal: "श्री",
  units: { d: "दिवस", h: "तास", m: "मिनिटे", s: "सेकंद" },
};

const css = `
.fh-root.is-marathi { --fw-script: #7a1747; --fw-wax1: #b8862f; --fw-wax2: #7a1747; --fw-env: #f4e1e6; --fw-env-2: #e6c4cf; --fw-liner: #fcf1f4; }
/* The illustrated hero: an ivory room, a marigold toran and brass lamps along the top, banana plants at the edges; the couple under a faint arch-green on the left, the words on the right (the engine's split hero). The finale keeps the bordered card. */
.fh-hero.is-marathi { --fh-top: 0px; --fh-wall-bg: #fcf2ea; --fh-halo-o: .2; --fh-foot-w: 28%; --fh-wall: radial-gradient(ellipse 52% 62% at 27% 58%, rgba(150,30,90,.10), transparent 72%), radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,250,236,.85), transparent 70%), linear-gradient(180deg, rgba(251,244,230,.55), rgba(251,244,230,.2)), url("${cdn(S.paperSoft.src)}") 50% 50% / cover no-repeat, #fcf2ea; }
.fh-hero.is-marathi .fh-floor, .fh-hero.is-marathi .fh-top, .fh-hero.is-marathi .fh-base, .fh-hero.is-marathi .fh-corner, .fh-hero.is-marathi .fh-flank { display: none; }
/* the card: Ganesha (or the lamp), the blessing and the names in its ivory field, inside the woven border */
.fh-hero.is-marathi .fh-card { --fh-ar: 1000 / 1400; --fh-arn: .714; --fh-in-t: 16%; --fh-in-b: 9.5%; --fh-in-x: 13.5%; --fh-reserve: 0px; --fh-mask: url("/wedding-v3/faith-south/mr-panel-600.webp"); }
.fh-hero.is-marathi .fh-card-bg { filter: drop-shadow(0 34px 46px rgba(40,18,4,.42)) drop-shadow(0 6px 12px rgba(40,18,4,.22)); }
.fh-hero.is-marathi .fh-inv.is-img { width: 15cqw; height: auto; filter: drop-shadow(0 1px 0 rgba(255,255,255,.7)); }
.fh-hero.is-marathi .fh-names { --fh-names: 12.6cqw; margin-top: 1.2cqw; }
.fh-hero.is-marathi .fh-greet { font-size: 2.7cqw; letter-spacing: .05em; color: var(--wk-gold-ink); }
.fh-hero.is-marathi .fh-eyebrow { font-size: 3.05cqw; letter-spacing: .14em; margin-top: 3cqw; }
.fh-hero.is-marathi .fh-sub { font-size: 4.8cqw; margin-top: 2cqw; }
.fh-hero.is-marathi .fh-date { font-size: 3.4cqw; letter-spacing: .1em; white-space: nowrap; margin-top: 4cqw; padding: 2.6cqw 2cqw; }
.fh-hero.is-marathi .fh-venue { font-size: 4.2cqw; margin-top: 3cqw; }
.fh-root .fh-fin.is-marathi { --fh-seal-b: 8%; }
.fh-root .fh-fin.is-marathi .fh-card { --fh-in-t: 18%; --fh-in-b: 27%; }
/* the corners of the envelope and the last page: banana plants at the threshold, as at every South Indian door */
.fh-root.is-marathi .fh-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-marathi .fh-corner.is-r, .fh-root.is-marathi .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-marathi .fw-env-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-marathi .fh-env-top { width: min(110%, 760px); top: -2%; }
.fh-root.is-marathi .fw-rw-wash { opacity: .6; }
.fh-root.is-marathi .fh-rw-figure { width: 84%; bottom: 16% !important; }
.fh-root.is-marathi .fw-sheet-roses { width: clamp(84px, 20vw, 150px); }
.fh-root.is-marathi .fw-datecard-wax b, .fh-root.is-marathi .fw-wax b { font: 400 26px/1.3 var(--font-wk-marathi), serif; }
.fh-root.is-marathi .fw-lang button[lang="mr"] { font-family: var(--font-wk-marathi), serif; }
/* Wide screens: the finale's card, sized to the room. */
@media (min-width: 1024px) {
  .fh-hero.is-marathi { --fh-w: min(44vw, calc(90svh * .714)); }
}
/* Phones: the finale's card rises from the foot. */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-marathi { --fh-w: min(92vw, calc(64svh * .714)); }
  .fh-root .fh-hero.is-marathi .fh-stage { align-items: center; }
  .fh-root .fh-hero.is-marathi .fh-card { --fh-in-t: 15.5%; --fh-in-b: 9%; --fh-in-x: 12.5%; }
  .fh-root .fh-fin.is-marathi .fh-card { --fh-in-t: 18%; --fh-in-b: 33%; }
  .fh-root .fh-fin.is-marathi { --fh-seal-b: 6%; }
  .fh-root .fh-fin.is-marathi .fh-names { --fh-names: 11cqw; }
}
`;

export const MARATHI: FaithProfile = {
  id: "marathi",
  slug: "marathi-wedding-invitation",
  name: "Shubh Vivah",
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
    rsvpFigure: A["so-peacock-gold"],
    heroBg: A["mr-panel"],
    heroBgSm: A["mr-panel-600"],
    heroTop: A["so-toran"],
    heroHang: A["so-lamp-hanging"],
    heroSide: A["so-banana-plant"],
    heroHalo: A["so-arch-green"],
    heroFoot: A["so-peacock-gold"],
    heroCouple: A["so-couple-veshti"],
    invocation: A["so-ganesha"],
    envTop: A["so-toran"],
    envBank: A["so-peacock"],
  },
  T: { en, mr },
  local: {
    code: "mr",
    name: "Marathi",
    short: "म",
    locale: "mr-IN",
    dir: "ltr",
    messageLabel: "मराठीत (optional)",
    messagePlaceholder: "श्री गणरायाच्या कृपेने व वडीलधाऱ्यांच्या आशीर्वादाने…",
    openInLabel: "Open the invitation in Marathi (guests can switch)",
  },
  mainRe: /shubh\s*vivah|vivah|विवाह|lagna|लग्न|mangalashtak|wedding|marriage/i,
  verseBoth: true,
  verse: {
    text: "Hail Shri Ganesha, lord of the ganas, the elephant-faced: Moreshwar, the giver of success; Ballaleshwar; Vinayaka of Mahad; Chintamani of Theur; Girijatmaj of Lenyadri; the boon-giving Vighneshwar of Ozar; and the Ganapati of Ranjangaon. May he ever bring us auspiciousness. Shubhamangal saavdhaan!",
    ref: "Mangalashtak · the Ashtavinayak vandana that opens every Marathi wedding",
    local: "स्वस्ति श्री गणनायकं गजमुखं मोरेश्वरं सिद्धिदम् ।\nबल्लाळं मुरुडं विनायकमहं चिन्तामणिं थेवरम् ॥\nलेण्याद्रिं गिरिजात्मजं सुवरदं विघ्नेश्वरं ओझरम् ।\nग्रामे रांजणसंस्थितं गणपतिः कुर्यात् सदा मङ्गलम् ॥\n॥ शुभमंगल सावधान ॥",
  },
  invocationLabel: "Shri Ganeshaya Namah on the invitation",
  eventArt: [
    { re: /sakhar|साखर|engage|ring/i, icon: ICONS.ring, art: A["so-bride-paithani"] },
    { re: /kelvan|केळवण/i, icon: ICONS.feast, art: A["so-sadya"], fit: "scene" },
    { re: /halad|haldi|हळद/i, icon: ICONS.bowl, art: A["so-haldi"] },
    { re: /mehendi|mehndi|मेहंदी/i, icon: ICONS.henna, art: A["so-mehndi"], fit: "scene" },
    { re: /seemant|सीमांत|sangeet/i, icon: ICONS.dhol, art: A["so-diya-rangoli"], fit: "scene" },
    { re: /gaurihar|गौरीहर/i, icon: ICONS.diya, art: A["so-saree-drape"] },
    { re: /varat|paathavani|वरात|vidaai/i, icon: ICONS.doli, art: A["so-elephant"], fit: "scene" },
    { re: /griha|laxmi|गृहप्रवेश/i, icon: ICONS.kalash, art: A["so-kalash"] },
    { re: /reception|स्वागत/i, icon: ICONS.glasses, art: A["so-bride-red"] },
    { re: /vivah|विवाह|lagna|लग्न|mangalashtak|wedding|marriage/i, icon: ICONS.temple, art: A["so-peacock"] },
    { re: /./, icon: ICONS.heart, art: A["so-feather"] },
  ],
  css,
  wax: { light: "#e9c07a", mid: "#b8862f", deep: "#7a1747" },
  day: marathiWeddingDay,
  quickFunctions: [{"title": "Sakhar Puda", "dress": "Soft pastels, silks", "color": "#E9B8C8"}, {"title": "Kelvan", "dress": "Festive traditional", "color": "#E7A54A"}, {"title": "Halad", "dress": "Yellows", "color": "#F2B705"}, {"title": "Mehendi", "dress": "Greens and pastels", "color": "#7FA37A"}, {"title": "Seemant Pujan & Sangeet", "dress": "Jewel-tone silks; pheta", "color": "#5B2A6E"}, {"title": "Gaurihar Puja", "dress": "Haldi-yellow and ivory", "color": "#F4D35E"}, {"title": "Shubh Vivah", "dress": "Paithani and nauvari; kurta-dhoti and pheta", "color": "#A3195B"}, {"title": "Varat & Paathavani", "dress": "Traditional", "color": "#B3122E"}, {"title": "Grihapravesh & Laxmi Pujan", "dress": "Silk saree", "color": "#C9A24A"}, {"title": "Reception", "dress": "Evening formal, a touch of gold", "color": "#0E6B5C"}],
  kit: {
    rsvp: { namePh: "e.g. Deshpande family", notePh: "Abhinandan! Can't wait for the Mangalashtak…" },
    blessings: { placeholder: "Write a blessing for the couple…" },
    sample: [{"id": "s1", "name": "Aaji", "message": "सुखी राहा, आनंदी राहा. तुमचा संसार सोन्याचा होवो! ❤️", "createdAt": ""}, {"id": "s2", "name": "Mama & Mami", "message": "From the Gaurihar to the Grihapravesh, we'll be right there. So proud of you both!", "createdAt": ""}, {"id": "s3", "name": "Rohan & the Kothrud gang", "message": "Save us a seat at the pangat and a spot in the Varat. Shubhamangal!", "createdAt": ""}],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Marathi", "Mention our families", "Keep it short"],
  aiPlaceholder: "Gauri and Aniket are getting married on 18 Feb 2027 in Pune. Muhurt 11:42 am at Sneh Mangal Karyalay, Karve Road. Halad and Mehendi on the 16th, Seemant Pujan and Sangeet on the 17th, reception at The Shaniwar Ballroom on the 19th…",
};
