// ─── Wedding kit: the Hindi page and the function couples ───────────────────
// Shared by the wedding templates: which kind of function a title names (and
// so which illustrated couple dresses its card), a function's usual name in
// Hindi, how a Hindi invitation says a time, and the kit's RSVP and blessings
// forms in Hindi. The couple art (template14) is served from /public/wedding-v3.

import type { BlessingsText } from "./sections/BlessingsWall";
import type { RsvpText } from "./sections/RSVPBlock";

type Lang = "en" | "hi";
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Which illustrated couple (and glow) dresses a function's card, read from its title. */
export type FnKind = "haldi" | "mehndi" | "sangeet" | "reception" | "engagement" | "wedding";
const KIND_RE: [FnKind, RegExp][] = [
  ["haldi", /haldi|hald[iy]|turmeric|pithi|ubtan|हल्दी/i],
  ["mehndi", /meh[e]?n?di|mehandi|henna|मेहं?दी/i],
  ["sangeet", /sangeet|sangit|garba|dandiya|cocktail|dance|संगीत/i],
  ["reception", /reception|dinner|walima|banquet|रिसेप्शन|स्वागत/i],
  ["engagement", /engage|sagai|sagaai|\bring\b|roka|tilak|mangni|सगाई|तिलक|रोका/i],
  ["wedding", /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|kalyanam|anand karaj|marriage|lagna|matrimony|baraat|बारात|फेरे/i],
];
export function kindOf(title: string, i = 0): FnKind {
  for (const [k, re] of KIND_RE) if (re.test(title)) return k;
  const cycle: FnKind[] = ["engagement", "sangeet", "reception"];
  return cycle[i % cycle.length];
}

/** A function's usual name in Hindi, for the Hindi page ("Haldi Ceremony" → "हल्दी"). Unknown titles stay as typed. */
const HI_TITLES: [RegExp, string][] = [
  [/^\s*(the\s+)?haldi(\s+(ceremony|function|rasam))?\s*$/i, "हल्दी"],
  [/^\s*(the\s+)?(meh[e]?n?di|mehandi)(\s+(ceremony|function|night|rasam))?\s*$/i, "मेहंदी"],
  [/^\s*(the\s+)?sangeet(\s+(night|ceremony|sandhya))?\s*$/i, "संगीत संध्या"],
  [/^\s*(the\s+)?reception(\s+(dinner|party|night))?\s*$/i, "स्वागत समारोह"],
  [/^\s*(the\s+)?(engagement|sagai|sagaai|ring ceremony)(\s+ceremony)?\s*$/i, "सगाई"],
  [/^\s*(the\s+)?tilak(\s+ceremony)?\s*$/i, "तिलक"],
  [/^\s*(the\s+)?roka(\s+ceremony)?\s*$/i, "रोका"],
  [/^\s*(the\s+)?baraat\s*$/i, "बारात"],
  [/^\s*(the\s+)?(pheras?|saat pheras?)\s*$/i, "फेरे"],
  [/^\s*(the\s+)?cocktail(\s+(night|party))?\s*$/i, "कॉकटेल संध्या"],
  [/^\s*(the\s+)?(wedding|shaadi|vivah)(\s+ceremony)?(\s*\((the\s+)?pheras?\))?\s*$/i, "शुभ विवाह"],
];
export function fnTitle(title: string, lang: Lang): string {
  if (lang !== "hi") return title;
  for (const [re, hi] of HI_TITLES) if (re.test(title)) return hi;
  return title;
}

/** "शाम 7:30 बजे" — how a Hindi invitation says a time (सुबह / दोपहर / शाम / रात, 12-hour). */
export function hiTime(t: string): string {
  if (!TIME_RE.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  const part = h >= 4 && h < 12 ? "सुबह" : h >= 12 && h < 16 ? "दोपहर" : h >= 16 && h < 20 ? "शाम" : "रात";
  const h12 = h % 12 || 12;
  return `${part} ${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} बजे`;
}

/** The couple dressed for each kind of function (template14), with its intrinsic size. */
const T14 = "/wedding-v3/template14-couple-haldi-mehndi";
export const FN_COUPLE: Record<FnKind, { src: string; w: number; h: number }> = {
  haldi: { src: `${T14}/07-couple-haldi-yellow.webp`, w: 466, h: 800 },
  mehndi: { src: `${T14}/05-couple-mehndi-orange-saree.webp`, w: 581, h: 800 },
  sangeet: { src: `${T14}/03-couple-sangeet-dancing.webp`, w: 748, h: 800 },
  engagement: { src: `${T14}/06-couple-engagement-ivory-lehenga.webp`, w: 502, h: 800 },
  wedding: { src: `${T14}/08-couple-wedding-red-lehenga.webp`, w: 446, h: 800 },
  reception: { src: `${T14}/04-couple-reception-tux-gown.webp`, w: 604, h: 800 },
};

/** Each function's glow: the colour the family dresses in for it, softened. */
export const FN_TINT: Record<FnKind, string> = {
  haldi: "#F2C14E",
  mehndi: "#8DBB6A",
  sangeet: "#F09A72",
  reception: "#A9B5E4",
  engagement: "#E7C9B5",
  wedding: "#D9506A",
};

/** The kit's RSVP form in Hindi (English uses the kit's own words). */
export const RSVP_TEXT_HI: Partial<RsvpText> = {
  yes: "सहर्ष स्वीकार", yesSub: "हम अवश्य आएँगे", maybe: "अभी तय नहीं", maybeSub: "पूरी कोशिश करेंगे", no: "क्षमा करें", noSub: "आशीर्वाद भेज रहे हैं",
  veg: "शाकाहारी", nonveg: "मांसाहारी", jain: "जैन",
  replyBy: "उत्तर की अंतिम तिथि:", name: "आपका नाम", namePh: "जैसे शर्मा परिवार", attend: "क्या आप पधारेंगे?", party: "आपके साथ कितने अतिथि", fewer: "एक अतिथि कम", more: "एक अतिथि और",
  which: "किन कार्यक्रमों में?", meal: "भोजन", phone: "फ़ोन", optional: "(वैकल्पिक)", note: "दूल्हा-दुल्हन के लिए संदेश", notePh: "बहुत-बहुत बधाई! संगीत में मिलते हैं…", password: "निमंत्रण का पासवर्ड",
  send: "उत्तर भेजें", sending: "भेजा जा रहा है…", update: "उत्तर बदलें", preview: "पूर्वावलोकन — अतिथियों के उत्तर आपको ईमेल पर मिलेंगे।", errName: "कृपया अपना नाम लिखें, ताकि परिवार जान सके कौन आ रहा है।", errEvents: "कम से कम एक कार्यक्रम चुनें।",
  doneYes: "जल्द मिलते हैं", doneMaybe: "प्रेम सहित नोट किया", doneNo: "धन्यवाद", thanks: "धन्यवाद", thanksName: "धन्यवाद, {name}",
  sumYesMany: "आप सभी {n} अतिथि सूची में हैं", sumYesOne: "आप अतिथि सूची में हैं", sumCouple: " — {couple} आपके साथ उत्सव मनाने को उत्सुक हैं", sumMaybe: "हमने आपको 'शायद' में रखा है — कभी भी आकर पक्का करें।", sumNo: "आपकी कमी खलेगी। आपका आशीर्वाद परिवार के लिए अनमोल है।", change: "अपना उत्तर बदलें",
};

/** The kit's blessings form in Hindi. */
export const BLESSINGS_TEXT_HI: Partial<BlessingsText> = {
  name: "आपका नाम", blessing: "आपका आशीर्वाद", placeholder: "आपका प्रेम हर वर्ष और गहरा हो…", err: "अपना नाम और दूल्हा-दुल्हन के लिए एक पंक्ति लिखें।",
  send: "आशीर्वाद भेजें", sending: "भेजा जा रहा है…", another: "एक और आशीर्वाद", ok: "धन्यवाद — आपका आशीर्वाद दीवार पर है।", list: "आशीर्वाद",
};
