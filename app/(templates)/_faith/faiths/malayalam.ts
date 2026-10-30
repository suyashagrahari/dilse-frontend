// ─── Kerala Kalyanam: the Malayalam wedding's profile ───────────────────────────
// On the shared faith-wedding engine. The hero is illustrated: the couple in wedding silks
// under a faint arch, a marigold toran and brass lamps above; the finale is an ivory card edged with a textile border, with the
// invocation at its head. English + Malayalam (മലയാളം). Functions, wording and verse researched
// for Malayalam weddings (scratchpad/south/malayalam.json in the build session).

import { malayalamWeddingDay } from "../../_valentine/days/malayalam-wedding-invitation";
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
  togetherWith: "With the blessings of Sree Guruvayurappan",
  gettingMarried: "invite you to their Thalikettu",
  shubh: "Thalikettu",
  invitation: "The invitation",
  blessingsOf: "With the blessings of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the muhurtham",
  story: "Our story",
  storyEyebrow: "Pressed like jasmine between pages",
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
  blessingsEyebrow: "Anugraham",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Leave your blessings",
  blessingsIntro: "A line from you, kept by the couple forever.",
  closing: "With love",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  done: "The thali is tied",
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
  shagun: "Gifts",
  shagunIntro: "Your blessings are all we wish for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before the muhurtham",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  greeting: "Shubha Muhurtham · Sree Guruvayurappan Thuna",
  seal: "ശ്രീ",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
};

const ml: Strings = {
  open: "മുദ്ര തുറക്കൂ",
  openHint: "ക്ഷണക്കത്ത് തുറക്കാൻ മുദ്രയിൽ തൊടൂ",
  dear: "പ്രിയപ്പെട്ട",
  invited: "താങ്കളെ സാദരം ക്ഷണിക്കുന്നു",
  togetherWith: "ശ്രീ ഗുരുവായൂരപ്പന്റെ അനുഗ്രഹത്താൽ",
  gettingMarried: "എന്നിവരുടെ വിവാഹത്തിലേക്ക് താങ്കളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു",
  shubh: "താലികെട്ട്",
  invitation: "ക്ഷണക്കത്ത്",
  blessingsOf: "അനുഗ്രഹാശിസ്സുകളോടെ",
  families: "ഞങ്ങളുടെ കുടുംബങ്ങൾ",
  brideSide: "വധുവിന്റെ കുടുംബം",
  groomSide: "വരന്റെ കുടുംബം",
  countdown: "ശുഭമുഹൂർത്തത്തിലേക്ക് ഇനി",
  story: "ഞങ്ങളുടെ കഥ",
  storyEyebrow: "ഓർമ്മയുടെ താളുകൾ",
  events: "ശുഭചടങ്ങുകൾ",
  eventsEyebrow: "ചടങ്ങുകൾ",
  film: "ഞങ്ങളുടെ വീഡിയോ",
  gallery: "നിമിഷങ്ങൾ",
  galleryEyebrow: "ആൽബം",
  goodToKnow: "അറിയേണ്ട കാര്യങ്ങൾ",
  guestsEyebrow: "അതിഥികൾക്കായി",
  gettingThere: "എങ്ങനെ എത്തിച്ചേരാം",
  rsvp: "താങ്കൾ എത്തിച്ചേരുമോ?",
  rsvpEyebrow: "ദയവായി മറുപടി നൽകുക",
  blessingsEyebrow: "അനുഗ്രഹം",
  rsvpIntro: "കുടുംബത്തിനായി ഒരൊറ്റ മറുപടി മതി. പങ്കെടുക്കുന്ന ചടങ്ങുകൾ തിരഞ്ഞെടുക്കുക.",
  blessings: "നിങ്ങളുടെ അനുഗ്രഹം കുറിക്കൂ",
  blessingsIntro: "നിങ്ങളുടെ ഒരു വരി, നവദമ്പതികൾ എന്നും നിധിപോലെ സൂക്ഷിക്കും.",
  closing: "സ്നേഹപൂർവ്വം",
  whatsapp: "WhatsApp",
  replyBy: "മറുപടി നൽകേണ്ട തീയതി",
  done: "താലികെട്ട് ശുഭമായി കഴിഞ്ഞു",
  directions: "വഴി കാണുക",
  dress: "വേഷം",
  tba: "സമയം പിന്നീട് അറിയിക്കും",
  play: "വീഡിയോ കാണൂ",
  and: "&",
  scroll: "താഴേക്ക്",
  dateEyebrow: "ശുഭദിനം",
  venueEyebrow: "വേദി",
  upasthiti: "താങ്കളുടെ സാന്നിദ്ധ്യമാണ് ഞങ്ങൾക്കുള്ള അനുഗ്രഹം",
  copy: "ലിങ്ക് പകർത്തുക",
  copied: "ലിങ്ക് പകർത്തി",
  contacts: "സംശയങ്ങൾക്ക് വിളിക്കൂ",
  contactsIntro: "കുടുംബം ഒരു ഫോൺ വിളിക്കപ്പുറം മാത്രം.",
  call: "വിളിക്കുക",
  shagun: "സമ്മാനം",
  shagunIntro: "നിങ്ങളുടെ അനുഗ്രഹം മാത്രമാണ് ഞങ്ങളുടെ ആഗ്രഹം. ചോദിച്ചവർക്കായി മാത്രം:",
  payUpi: "UPI വഴി അയയ്ക്കുക",
  copyUpi: "UPI ID പകർത്തുക",
  live: "തത്സമയം കാണുക",
  liveSoon: "മുഹൂർത്തത്തിന് 30 മിനിറ്റ് മുമ്പ് തത്സമയ സംപ്രേഷണം ആരംഭിക്കും",
  liveIntro: "എത്താൻ കഴിയില്ലേ? ഓൺലൈനായി ഒപ്പം ചേരൂ.",
  close: "അടയ്ക്കുക",
  showMap: "മാപ്പ് കാണുക",
  greeting: "ശുഭമുഹൂർത്തം · ശ്രീ ഗുരുവായൂരപ്പൻ തുണ",
  seal: "ശ്രീ",
  units: { d: "ദിവസം", h: "മണിക്കൂർ", m: "മിനിറ്റ്", s: "സെക്കൻഡ്" },
};

const css = `
.fh-root.is-malayalam { --fw-script: #6b4b17; --fw-wax1: #b8862f; --fw-wax2: #6b4b17; --fw-env: #f5ecd8; --fw-env-2: #e8d8b2; --fw-liner: #fdf8ec; }
/* The illustrated hero: an ivory room, a marigold toran and brass lamps along the top, banana plants at the edges; the couple under a faint arch-gold on the left, the words on the right (the engine's split hero). The finale keeps the bordered card. */
.fh-hero.is-malayalam { --fh-top: 0px; --fh-wall-bg: #f8f4e8; --fh-halo-o: .36; --fh-wall: radial-gradient(ellipse 52% 62% at 27% 58%, rgba(196,160,60,.14), transparent 72%), radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,250,236,.85), transparent 70%), linear-gradient(180deg, rgba(251,244,230,.55), rgba(251,244,230,.2)), url("${cdn(S.paperSoft.src)}") 50% 50% / cover no-repeat, #f8f4e8; }
.fh-hero.is-malayalam .fh-floor, .fh-hero.is-malayalam .fh-top, .fh-hero.is-malayalam .fh-base, .fh-hero.is-malayalam .fh-corner, .fh-hero.is-malayalam .fh-flank { display: none; }
/* the card: Ganesha (or the lamp), the blessing and the names in its ivory field, inside the woven border */
.fh-hero.is-malayalam .fh-card { --fh-ar: 1000 / 1400; --fh-arn: .714; --fh-in-t: 16%; --fh-in-b: 9.5%; --fh-in-x: 13.5%; --fh-reserve: 0px; --fh-mask: url("/wedding-v3/faith-south/ml-panel-600.webp"); }
.fh-hero.is-malayalam .fh-card-bg { filter: drop-shadow(0 34px 46px rgba(40,18,4,.42)) drop-shadow(0 6px 12px rgba(40,18,4,.22)); }
.fh-hero.is-malayalam .fh-inv.is-img { width: auto; height: 17cqw; filter: drop-shadow(0 1px 0 rgba(255,255,255,.7)); }
.fh-hero.is-malayalam .fh-names { --fh-names: 12.6cqw; margin-top: 1.2cqw; }
.fh-hero.is-malayalam .fh-greet { font-size: 2.7cqw; letter-spacing: .05em; color: var(--wk-gold-ink); }
.fh-hero.is-malayalam .fh-eyebrow { font-size: 3.05cqw; letter-spacing: .14em; margin-top: 3cqw; }
.fh-hero.is-malayalam .fh-sub { font-size: 4.8cqw; margin-top: 2cqw; }
.fh-hero.is-malayalam .fh-date { font-size: 3.4cqw; letter-spacing: .1em; white-space: nowrap; margin-top: 4cqw; padding: 2.6cqw 2cqw; }
.fh-hero.is-malayalam .fh-venue { font-size: 4.2cqw; margin-top: 3cqw; }
.fh-root .fh-fin.is-malayalam { --fh-seal-b: 8%; }
.fh-root .fh-fin.is-malayalam .fh-card { --fh-in-t: 18%; --fh-in-b: 27%; }
/* the corners of the envelope and the last page: banana plants at the threshold, as at every South Indian door */
.fh-root.is-malayalam .fh-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-malayalam .fh-corner.is-r, .fh-root.is-malayalam .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-malayalam .fw-env-corner { width: clamp(110px, 24vw, 230px); }
.fh-root.is-malayalam .fh-env-top { width: min(110%, 760px); top: -2%; }
.fh-root.is-malayalam .fw-rw-wash { opacity: .6; }
.fh-root.is-malayalam .fh-rw-figure { width: 84%; bottom: 16% !important; }
.fh-root.is-malayalam .fw-sheet-roses { width: clamp(84px, 20vw, 150px); }
.fh-root.is-malayalam .fw-datecard-wax b, .fh-root.is-malayalam .fw-wax b { font: 400 26px/1.3 var(--font-wk-malayalam), serif; }
.fh-root.is-malayalam .fw-lang button[lang="ml"] { font-family: var(--font-wk-malayalam), serif; }
/* Wide screens: the finale's card, sized to the room. */
@media (min-width: 1024px) {
  .fh-hero.is-malayalam { --fh-w: min(44vw, calc(90svh * .714)); }
}
/* Phones: the finale's card rises from the foot. */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-malayalam { --fh-w: min(92vw, calc(64svh * .714)); }
  .fh-root .fh-hero.is-malayalam .fh-stage { align-items: center; }
  .fh-root .fh-hero.is-malayalam .fh-card { --fh-in-t: 15.5%; --fh-in-b: 9%; --fh-in-x: 12.5%; }
  .fh-root .fh-fin.is-malayalam .fh-card { --fh-in-t: 18%; --fh-in-b: 33%; }
  .fh-root .fh-fin.is-malayalam { --fh-seal-b: 6%; }
  .fh-root .fh-fin.is-malayalam .fh-names { --fh-names: 11cqw; }
}
`;

export const MALAYALAM: FaithProfile = {
  id: "malayalam",
  slug: "malayalam-wedding-invitation",
  name: "Kerala Kalyanam",
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
    rsvpFigure: A["so-elephant-kerala"],
    heroBg: A["ml-panel"],
    heroBgSm: A["ml-panel-600"],
    heroTop: A["so-toran"],
    heroHang: A["so-lamp-hanging"],
    heroSide: A["so-palm"],
    heroHalo: A["so-arch-gold"],
    heroFoot: A["so-lotus"],
    heroCouple: A["so-couple-veshti"],
    invocation: A["so-lamp"],
    envTop: A["so-toran"],
    envBank: A["so-palms"],
  },
  T: { en, ml },
  local: {
    code: "ml",
    name: "Malayalam",
    short: "മ",
    locale: "ml-IN",
    dir: "ltr",
    messageLabel: "മലയാളത്തിൽ (optional)",
    messagePlaceholder: "ശ്രീ ഗുരുവായൂരപ്പന്റെ അനുഗ്രഹത്താൽ…",
    openInLabel: "Open the invitation in Malayalam (guests can switch)",
  },
  mainRe: /thali|താലി|muhur|മുഹൂർ|vivaham|wedding|marriage/i,
  verseBoth: true,
  verse: {
    text: "With this sacred thread, the reason of my life, I tie this mangalyam around your neck, O auspicious one. May you live a hundred autumns.",
    ref: "Mangalya Dharana mantra · chanted as the thali is tied",
    local: "മാംഗല്യം തന്തുനാനേന മമ ജീവനഹേതുനാ । കണ്ഠേ ബധ്നാമി സുഭഗേ ത്വം ജീവ ശരദാം ശതം ॥",
  },
  invocationLabel: "Sree and the Guruvayurappan blessing on the invitation",
  eventArt: [
    { re: /nischay|നിശ്ചയ|engage|ring/i, icon: ICONS.ring, art: A["so-bride-redgreen"] },
    { re: /mehendi|mehndi|mylanchi|മൈലാഞ്ചി/i, icon: ICONS.henna, art: A["so-mehndi"], fit: "scene" },
    { re: /haldi|മഞ്ഞൾ/i, icon: ICONS.bowl, art: A["so-haldi"] },
    { re: /ayaniyoon|അയനി/i, icon: ICONS.feast, art: A["so-banana-leaf"], fit: "scene" },
    { re: /dakshina|varavelp|ദക്ഷിണ|വരവേൽ/i, icon: ICONS.diya, art: A["so-lamp-hanging"] },
    { re: /sadya|sadhya|സദ്യ/i, icon: ICONS.leaf, art: A["so-sadya"], fit: "scene" },
    { re: /griha|ഗൃഹ/i, icon: ICONS.kalash, art: A["so-kalash"] },
    { re: /reception|റിസപ്ഷൻ/i, icon: ICONS.glasses, art: A["so-elephant-kerala"], fit: "scene" },
    { re: /thali|താലി|muhur|മുഹൂർ|kalyan|vivah|വിവാഹ|wedding|marriage/i, icon: ICONS.temple, art: A["so-couple-kerala"] },
    { re: /./, icon: ICONS.heart, art: A["so-palm"] },
  ],
  css,
  wax: { light: "#ecc978", mid: "#b8862f", deep: "#6b4b17" },
  day: malayalamWeddingDay,
  quickFunctions: [{"title": "Vivaha Nischayam", "dress": "Kerala silk and kasavu, soft pastels", "color": "#E9C9A0"}, {"title": "Mehendi (Mylanchi)", "dress": "Greens and kasavu with colour", "color": "#7FA36B"}, {"title": "Haldi", "dress": "Yellows and mustard", "color": "#F0C24B"}, {"title": "Ayaniyoonu", "dress": "Kerala festive: set-mundu, mundu and shirt", "color": "#D8B26A"}, {"title": "Dakshina & Varavelpu", "dress": "Kasavu mundu and set-mundu", "color": "#EFE3C8"}, {"title": "Thalikettu", "dress": "Traditional: kasavu saree / set-mundu, kasavu mundu & melmundu", "color": "#F3E7C9"}, {"title": "Kalyana Sadya", "dress": "As for the Thalikettu", "color": "#6E9A3C"}, {"title": "Grihapravesham", "dress": "Kerala silk", "color": "#C98B3A"}, {"title": "Reception", "dress": "Evening formal", "color": "#1F4A44"}],
  kit: {
    rsvp: { namePh: "e.g. Menon family", notePh: "Congratulations! Saving our appetite for the sadya…" },
    blessings: { placeholder: "May Guruvayurappan keep you both happy, always together…" },
    sample: [{"id": "s1", "name": "Ammamma", "message": "ദീർഘസുമംഗലീഭവ. ഗുരുവായൂരപ്പൻ എന്നും തുണയായിരിക്കട്ടെ. ❤️", "createdAt": ""}, {"id": "s2", "name": "Anju & Vishnu", "message": "To a lifetime of Onam sadyas, monsoon drives and three payasams each. Love you both!", "createdAt": ""}, {"id": "s3", "name": "Valiyachan", "message": "May your home always be lit like a nilavilakku, full of music and laughter.", "createdAt": ""}],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Malayalam", "Mention our families", "Keep it short"],
  aiPlaceholder: "Meera and Arjun are getting married on 21 Feb 2027 at Guruvayur temple. Muhurtham 10:30–11:15 am, sadya at Sreevalsam Auditorium after. Nischayam on 7 Feb, Mylanchi on the 19th, Ayaniyoonu on the 20th, reception at Bolgatty Palace, Kochi on the 22nd…",
};
