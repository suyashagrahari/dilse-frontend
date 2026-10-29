// ─── Nikah: the Muslim wedding's profile ────────────────────────────────────
// Ivory, sage and gold. The hero is the Mughal arch (jaali panels, gold
// vines, two lanterns whose flames breathe) with the Bismillah in gold, the
// names on one line, and the couple seated either side of the floral partition
// at its foot; urns of roses with lanterns flank it on wide screens. Lanterns,
// crescents and stars hang (still) over the opening. English + Urdu
// (Nastaliq, right-to-left). Default scripture: Surah Ar-Rum 30:21.

import { muslimWeddingDay } from "../../_valentine/days/muslim-wedding-invitation";
import { FAITH_ASSETS } from "../assets";
import { ICONS } from "../icons";
import type { FaithProfile, Strings } from "../types";

const A = FAITH_ASSETS["faith-nikah"];
const C = FAITH_ASSETS["faith-shared"];
/** The palace wall: an eight-pointed-star jaali in gold on sage, drawn (tileable, crisp at any size). */
const JAALI = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><g fill="none" stroke="#b8924a" stroke-width=".9" opacity=".55"><rect x="22" y="22" width="28" height="28"/><rect x="22" y="22" width="28" height="28" transform="rotate(45 36 36)"/><path d="M0 0 22 22M72 0 50 22M0 72 22 50M72 72 50 50M36 0v16.2M36 72V55.8M0 36h16.2M72 36H55.8"/><circle cx="36" cy="36" r="5"/></g><g fill="#b8924a" opacity=".45"><circle cx="0" cy="0" r="2"/><circle cx="72" cy="0" r="2"/><circle cx="0" cy="72" r="2"/><circle cx="72" cy="72" r="2"/></g></svg>')}")`;
const S = FAITH_ASSETS.shared;

const en: Strings = {
  open: "Break the seal",
  openHint: "Tap the wax seal to open your invitation",
  dear: "Dear",
  invited: "You're invited",
  togetherWith: "With the blessings of Allah",
  gettingMarried: "request the honour of your presence at their Nikah",
  shubh: "Nikah",
  invitation: "The invitation",
  blessingsOf: "With the duas of",
  families: "Our families",
  brideSide: "The bride's family",
  groomSide: "The groom's family",
  countdown: "Counting down to the Nikah",
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
  blessingsEyebrow: "Duas",
  rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
  blessings: "Leave your duas",
  blessingsIntro: "A prayer from you, kept by the couple forever.",
  closing: "With love and duas",
  whatsapp: "WhatsApp",
  replyBy: "Kindly reply by",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  done: "Nikah Mubarak",
  directions: "Directions",
  dress: "Dress code",
  tba: "Time to be announced",
  play: "Play the film",
  and: "&",
  scroll: "Scroll",
  dateEyebrow: "Save the date",
  venueEyebrow: "The venue",
  upasthiti: "Your presence and duas will be our honour",
  copy: "Copy link",
  copied: "Link copied",
  contacts: "Any questions? Call us",
  contactsIntro: "The family is a phone call away.",
  call: "Call",
  shagun: "Salami",
  shagunIntro: "Your duas are the only gift we ask for. For those who have asked:",
  payUpi: "Send by UPI",
  copyUpi: "Copy UPI ID",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before",
  liveIntro: "Can't be there? Join us online.",
  close: "Close",
  showMap: "Show the map",
  // The Bismillah is the gold calligraphy itself: no second line under it.
  greeting: "",
  seal: "نکاح",
};

const ur: Strings = {
  open: "مہر توڑیں",
  openHint: "دعوت نامہ کھولنے کے لیے مہر کو چھوئیں",
  dear: "محترم",
  invited: "آپ کو دلی دعوت دی جاتی ہے",
  togetherWith: "اللہ تعالیٰ کے فضل و کرم سے",
  gettingMarried: "کے نکاح کی تقریب میں آپ کی شرکت باعثِ عزت ہوگی",
  shubh: "نکاح",
  invitation: "دعوت نامہ",
  blessingsOf: "کی دعاؤں کے ساتھ",
  families: "ہمارے خاندان",
  brideSide: "دلہن کا خاندان",
  groomSide: "دولہا کا خاندان",
  countdown: "نکاح میں باقی وقت",
  story: "ہماری کہانی",
  storyEyebrow: "یادوں کے صفحات",
  events: "تقریبات",
  eventsEyebrow: "پروگرام",
  film: "ہماری فلم",
  gallery: "یادیں",
  galleryEyebrow: "البم",
  goodToKnow: "ضروری معلومات",
  guestsEyebrow: "مہمانوں کے لیے",
  gettingThere: "کیسے پہنچیں",
  rsvp: "کیا آپ تشریف لائیں گے؟",
  rsvpEyebrow: "براہِ کرم جواب دیں",
  blessingsEyebrow: "دعائیں",
  rsvpIntro: "پورے خاندان کی طرف سے ایک جواب۔ جن تقریبات میں آئیں گے، انہیں منتخب کریں۔",
  blessings: "اپنی دعائیں دیں",
  blessingsIntro: "آپ کی ایک دعا، جسے دولہا دلہن ہمیشہ سنبھال کر رکھیں گے۔",
  closing: "محبت اور دعاؤں کے ساتھ",
  whatsapp: "WhatsApp",
  replyBy: "براہِ کرم جواب دیں",
  units: { d: "دن", h: "گھنٹے", m: "منٹ", s: "سیکنڈ" },
  done: "نکاح مبارک",
  directions: "راستہ دیکھیں",
  dress: "لباس",
  tba: "وقت جلد بتایا جائے گا",
  play: "فلم چلائیں",
  and: "اور",
  scroll: "آگے دیکھیں",
  dateEyebrow: "تاریخ یاد رکھیں",
  venueEyebrow: "مقام",
  upasthiti: "آپ کی شرکت اور دعائیں ہمارے لیے باعثِ مسرت ہوں گی",
  copy: "لنک کاپی کریں",
  copied: "لنک کاپی ہو گیا",
  contacts: "کوئی سوال؟ ہمیں فون کریں",
  contactsIntro: "خاندان بس ایک فون کی دوری پر ہے۔",
  call: "فون کریں",
  shagun: "سلامی",
  shagunIntro: "آپ کی دعائیں ہی ہمارا تحفہ ہیں۔ جنہوں نے پوچھا ہے، ان کے لیے:",
  payUpi: "UPI سے بھیجیں",
  copyUpi: "UPI ID کاپی کریں",
  live: "لائیو دیکھیں",
  liveSoon: "لائیو نشریات 30 منٹ پہلے شروع ہوں گی",
  liveIntro: "تشریف نہ لا سکیں تو آن لائن شامل ہوں۔",
  close: "بند کریں",
  showMap: "نقشہ دیکھیں",
  greeting: "",
  seal: "نکاح",
};

const ARCH_MASK = 'url("/wedding-v3/faith-nikah/mn-arch.webp")';

const css = `
.fh-root.is-muslim { --fw-script: #3f5a3c; --fw-wax1: #6f8c69; --fw-wax2: #435e40; --fw-env: #eef0e1; --fw-env-2: #dfe4cb; --fw-liner: #f7f8ee; }
.fh-root.is-muslim[data-wk-theme="blush"] { --fw-script: #7a4250; --fw-env: #f3e3de; --fw-env-2: #e9cfc7; --fw-liner: #fbf1ee; }
.fh-root.is-muslim[data-wk-theme="powder"] { --fw-script: #46587a; --fw-env: #e5e9ef; --fw-env-2: #d3dae4; --fw-liner: #f2f4f8; }
.fh-root.is-muslim .fw-sheet, .fh-root.is-muslim .fw-datecard { background: linear-gradient(180deg, #fffef8, #f7f7ec); }
/* Full screen: a sage palace wall of gold jaali, a cream floor, lanterns overhead; the Mughal arch stands on the
   floor at full height, flanked on wide screens by two cream jharokha arches with urns of roses in them. */
.fh-hero.is-muslim { --fh-w: min(100vw, calc((100svh - var(--fh-top)) * .806)); --fh-wall-bg: #dce3cf; --fh-wall: ${JAALI} center top / 72px 72px repeat, radial-gradient(120% 90% at 50% 35%, #eff2e6 0%, #dde4d0 55%, #c8d3b7 100%); --fh-floor: linear-gradient(180deg, rgba(246,243,231,0), #f1ecda 30%, #e6dec6); --fh-floor-h: 13svh; --fh-flank-h: 76svh; }
.fh-hero.is-muslim .fh-top { width: max(100%, 980px); top: -2%; opacity: 0; }
/* the panels' straight top and bottom edges melt softly into the wall and the floor */
.fh-hero.is-muslim .fh-card-bg { -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 6%, #000 97%, rgba(0,0,0,.6) 100%); mask-image: linear-gradient(180deg, transparent 0, #000 6%, #000 97%, rgba(0,0,0,.6) 100%); }
.fh-hero.is-muslim .fh-flank { -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 7%, #000 93%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0, #000 7%, #000 93%, transparent 100%); }
.fh-hero.is-muslim.is-open .fh-top { opacity: .95; }
/* Phones: the arch with lengthened pillars stands the full height of the screen (the hero and the last page). */
@media (max-width: 1023px) {
  .fh-root .fh-hero.is-muslim { --fh-top: 0px; --fh-w: max(calc(100svh * .433), 92vw); }
  .fh-root .fh-hero.is-muslim .fh-top { display: none; }
  .fh-root .fh-hero.is-muslim .fh-card { --fh-ar: 928 / 2143; --fh-in-t: 6%; --fh-in-b: 29%; --fh-in-x: 16.5%; --fh-mask: url("/wedding-v3/faith-nikah/mn-arch-tall.webp"); }
  .fh-root .fh-hero.is-muslim .fh-names { --fh-names: 15.5cqw; margin-top: 2.4cqw; flex-direction: column; align-items: center; line-height: 1.08; }
  .fh-root .fh-hero.is-muslim .fh-amp { font-size: 7cqw; margin: -.1em 0; }
  .fh-root .fh-hero.is-muslim .fh-inv.is-muslim { width: 36cqw; }
  .fh-root .fh-hero.is-muslim .fh-eyebrow { font-size: 3.3cqw; margin-top: 4cqw; letter-spacing: .14em; }
  .fh-root .fh-hero.is-muslim .fh-sub { font-size: 5cqw; max-width: 64cqw; margin-top: 2.4cqw; }
  .fh-root .fh-hero.is-muslim .fh-date { font-size: 3.5cqw; letter-spacing: .09em; margin-top: 4.5cqw; padding: 2.6cqw 2cqw; white-space: nowrap; }
  .fh-root .fh-hero.is-muslim .fh-venue { font-size: 4.2cqw; margin-top: 2.8cqw; }
  .fh-root .fh-hero.is-muslim .fh-figure { width: 76%; bottom: .5%; }
  .fh-root .fh-hero.is-muslim .fh-glow { top: 11.4%; width: 20%; }
  .fh-root .fh-hero.is-muslim .fh-card-bg { -webkit-mask-image: none; mask-image: none; }
  .fh-root .fh-fin.is-muslim { --fh-seal-b: 23%; }
  .fh-root .fh-fin.is-muslim .fh-card { --fh-in-b: 37%; }
}
@media (min-width: 1024px) {
  .fh-hero.is-muslim .fh-top { display: none; }
  /* the two jharokhas are shown whole: as wide as the room beside the great arch allows (tucked 9% behind it) */
  .fh-hero.is-muslim { --fh-fw: min(calc((100vw - var(--fh-w)) / 2 + var(--fh-w) * .09 - 18px), calc(var(--fh-flank-h) * .716)); }
  .fh-hero.is-muslim .fh-flank { display: block; width: var(--fh-fw); height: auto; bottom: 1.5svh; filter: drop-shadow(0 18px 26px rgba(70,80,50,.16)); }
  .fh-hero.is-muslim .fh-flank.is-l { right: calc(50% + var(--fh-w) * .41); }
  .fh-hero.is-muslim .fh-flank.is-r { left: calc(50% + var(--fh-w) * .41); }
  .fh-hero.is-muslim .fh-side { z-index: 2; height: min(34svh, calc(var(--fh-fw) * .62)); width: auto; bottom: 1.5svh; }
  .fh-hero.is-muslim .fh-side.is-l { left: auto; right: calc(50% + var(--fh-w) * .41 + var(--fh-fw) / 2 - min(34svh, calc(var(--fh-fw) * .62)) * .333); }
  .fh-hero.is-muslim .fh-side.is-r { right: auto; left: calc(50% + var(--fh-w) * .41 + var(--fh-fw) / 2 - min(34svh, calc(var(--fh-fw) * .62)) * .333); }
  .fh-hero.is-muslim .fh-corner { width: clamp(150px, 13vw, 240px); }
}
/* the last page: the goodbye sits higher in the arch, the seal is pressed just above the couple */
.fh-root .fh-fin.is-muslim { --fh-seal-b: 33%; }
.fh-root .fh-fin.is-muslim .fh-card { --fh-in-b: 46%; }
/* the Mughal arch: the Bismillah and the names in its field, the couple seated at its foot */
.fh-hero.is-muslim .fh-card { --fh-ar: 928 / 1152; --fh-arn: .806; --fh-in-t: 8%; --fh-in-b: 38%; --fh-in-x: 16.5%; --fh-reserve: 136px; --fh-mask: ${ARCH_MASK}; }
.fh-hero.is-muslim .fh-names { flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: baseline; column-gap: .22em; --fh-names: 10.6cqw; }
.fh-hero.is-muslim .fh-amp { margin: 0; font-size: 5cqw; }
.fh-hero.is-muslim .fh-inv.is-muslim { width: 23cqw; }
.fh-hero.is-muslim .fh-sub { font-size: 3.8cqw; max-width: 56cqw; }
.fh-hero.is-muslim .fh-eyebrow { letter-spacing: .15em; }
.fh-hero.is-muslim .fh-date { margin-top: 2.2cqw; padding: 1.3cqw 2cqw; }
.fh-hero.is-muslim .fh-venue { font-size: 3.3cqw; margin-top: 1.2cqw; }
.fh-hero.is-muslim .fh-figure { left: 50%; bottom: 1.2%; width: 56%; translate: -50% 0; opacity: 0; transform: translate3d(0, 14px, 0); transition: opacity 1.4s ease .9s, transform 1.6s var(--fw-ease) .9s; filter: drop-shadow(0 10px 12px rgba(60,70,40,.18)); }
.fh-hero.is-muslim.is-open .fh-figure { opacity: 1; transform: none; }
/* the arch's two lanterns: their light breathes */
.fh-hero.is-muslim .fh-glow { display: block; position: absolute; z-index: 1; top: 18.5%; width: 17%; aspect-ratio: 1; border-radius: 50%; translate: -50% 0; background: radial-gradient(closest-side, rgba(255,226,150,.85), rgba(255,214,120,.35) 45%, rgba(255,214,120,0) 72%); mix-blend-mode: screen; opacity: 0; }
.fh-hero.is-muslim .fh-glow.is-l { left: 16.6%; } .fh-hero.is-muslim .fh-glow.is-r { left: 83.4%; }
.fw-hero.fh-hero.is-muslim.is-open .fh-glow { animation: fh-breathe 4.2s ease-in-out infinite; }
.fw-hero.fh-hero.is-muslim.is-open .fh-glow.is-r { animation-delay: -2.1s; }
.fh-root.is-muslim .fh-corner { width: clamp(120px, 30vw, 300px); }
.fh-root.is-muslim .fh-corner.is-r { scale: -1 1; }
.fh-root.is-muslim .fw-env-corner.is-l { transform: none; } .fh-root.is-muslim .fw-env-corner.is-r { transform: scaleX(-1); }
.fh-root.is-muslim .fh-side { width: clamp(150px, 13vw, 230px); }
@media (max-width: 1023px) { .fh-hero.is-muslim .fh-corner { display: none; } }

.fh-root.is-muslim .fw-card-bloom { height: 40%; }
.fh-root.is-muslim .fw-env-sprig { rotate: -30deg; height: calc(var(--seal) * 1.05); }
.fh-root.is-muslim .fw-rw-wash { opacity: 1; object-fit: cover; object-position: 50% 0; }
.fh-root.is-muslim .fh-rw-figure { width: 92%; bottom: 7% !important; }
.fh-root.is-muslim .fw-sheet-roses { width: clamp(96px, 24vw, 160px); }
.fh-root.is-muslim .fw-portrait-bloom.is-t { rotate: 0deg; left: -12%; top: -8%; }
.fh-root.is-muslim .fw-datecard-wax b, .fh-root.is-muslim .fw-wax b { font: 600 20px/1.6 var(--font-wk-urdu), serif; direction: rtl; }
.fh-root.is-muslim .fw-wax b { font-size: 24px; }
.fh-root.is-ur .fw-lang button[lang="ur"] { font-family: var(--font-wk-urdu), serif; font-size: 14px; }
.fh-root.is-muslim .fw-lang button[lang="ur"] { font-family: var(--font-wk-urdu), serif; line-height: 1; padding-top: 4px; }
`;

export const MUSLIM: FaithProfile = {
  id: "muslim",
  slug: "muslim-wedding-invitation",
  name: "Nikah",
  art: {
    paper: S.paper,
    paperSoft: S.paperSoft,
    swirl: S.swirl,
    swirlSm: S.swirlSm,
    bloom: A["mn-blush-corner-l"],
    bloomAlt: A["mn-rose-corner"],
    sheetCorner: A["mn-rose-corner"],
    corner: A["mn-blush-corner-l"],
    cornerR: A["mn-blush-corner-l"],
    sprig: A["mn-rose-corner"],
    rsvpWash: A["mn-jharokha"],
    rsvpFigure: A["mn-couple-seated-600"],
    heroBg: A["mn-arch"],
    heroBgSm: A["mn-arch"],
    heroBgTall: A["mn-arch-tall"],
    heroFigure: A["mn-couple-seated"],
    heroFigureSm: A["mn-couple-seated-600"],
    heroSide: A["mn-urn"],
    heroFlank: A["mn-jharokha"],
    heroTop: A["mn-lanterns"],
    invocation: A["mn-bismillah"],
    envTop: A["mn-lanterns"],
  },
  T: { en, ur },
  local: {
    code: "ur",
    short: "اُردو",
    locale: "ur-IN",
    dir: "rtl",
    messageLabel: "اردو میں (optional)",
    messagePlaceholder: "اللہ تعالیٰ کے فضل و کرم سے…",
    openInLabel: "Open the invitation in Urdu (guests can switch)",
  },
  mainRe: /nikah|nikkah|نکاح|wedding|marriage/i,
  verse: {
    text: "And among His signs is that He created for you spouses from among yourselves, that you may find tranquillity in them; and He placed between you affection and mercy.",
    ref: "Qur'an · Surah Ar-Rum 30:21",
    local: "اور اس کی نشانیوں میں سے یہ ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے بنائے تاکہ تم ان سے سکون پاؤ، اور تمہارے درمیان محبت اور رحمت رکھ دی۔",
  },
  invocationLabel: "The Bismillah on the invitation",
  eventArt: [
    { re: /nikah|nikkah|نکاح/i, icon: ICONS.crescent, art: A["mn-couple-seated-600"], fit: "scene" },
    { re: /walima|valima|reception|dawat|dinner/i, icon: ICONS.feast, art: A["mn-couple-standing"] },
    { re: /rukhsati|rukhsat|vidaai|farewell|baraat|barat/i, icon: ICONS.lantern, art: C["fs-bride-green"] },
    { re: /mangni|engagement|ring|istikhara|rishta/i, icon: ICONS.ring, art: C["fs-bride-pink"] },
    { re: /manjha|manja|ubtan|haldi|mayun|mayoun/i, icon: ICONS.bowl, art: C["fs-bride-orange"] },
    { re: /mehndi|mehendi|henna/i, icon: ICONS.henna, art: C["fs-mehndi-stage"], fit: "scene" },
    { re: /dholki|dholak|qawwali|sangeet|music/i, icon: ICONS.dhol, art: C["fs-dholak"], fit: "scene" },
    { re: /masjid|mosque|milad|quran|khatam|dua/i, icon: ICONS.mosque, art: A["mn-urn"] },
    { re: /./, icon: ICONS.lantern, art: C["fs-sofa"], fit: "scene" },
  ],
  css,
  wax: { light: "#a9bfa3", mid: "#6f8c69", deep: "#435e40" },
  day: muslimWeddingDay,
  quickFunctions: [
    { title: "Mangni", dress: "Pastel sharara and sherwani", color: "#E7B9B5" },
    { title: "Manjha & Ubtan", dress: "Shades of yellow", color: "#F2C94C" },
    { title: "Mehndi", dress: "Greens and pastels", color: "#9DB89A" },
    { title: "Dholki", dress: "Bright and festive", color: "#EE9A5E" },
    { title: "Nikah", dress: "Ivory, sage and gold", color: "#F1E6D6" },
    { title: "Rukhsati", dress: "Traditional", color: "#A3122B" },
    { title: "Walima", dress: "Formal, a touch of gold", color: "#2A2622" },
  ],
  kit: {
    rsvp: { namePh: "e.g. Siddiqui family", notePh: "Mubarak ho! See you at the Nikah…" },
    blessings: { blessing: "Your dua", placeholder: "May Allah bless you both with love and barakah…", send: "Send dua", another: "Add another dua", ok: "JazakAllah — your dua is on the wall.", list: "Duas" },
    sample: [
      { id: "s1", name: "Nani Ammi", message: "اللہ تم دونوں کو ہمیشہ خوش رکھے، آمین۔ ❤️", createdAt: "" },
      { id: "s2", name: "Sana & Rehan", message: "Mubarak ho! To a lifetime of chai, long drives and good biryani.", createdAt: "" },
      { id: "s3", name: "Khala Jaan", message: "May Allah fill your home with barakah, laughter and good food.", createdAt: "" },
    ],
  },
  aiChips: ["Make it warm", "Make it formal", "Add Urdu", "Mention our families", "Keep it short"],
  aiPlaceholder: "Zoya and Ayaan's Nikah is on 20 Feb 2027 after Asr at The Nawab Courtyard, Lucknow. Mehndi on the 18th, Rukhsati at 9 pm, Walima on the 21st at The Ivory Pavilion…",
};
