// ─── Every heading and button, in English and Hindi ──────────────────────────
// The toggle (top-left) switches the whole page; Hindi blocks carry lang="hi".

import type { Lang } from "./types";

export interface Strings {
  open: string;
  opening: string;
  openHint: string;
  dear: string;
  invited: string;
  receptionOf: string;
  and: string;
  saveDate: string;
  saveAll: string;
  rsvpNow: string;
  whatsapp: string;
  invitation: string;
  together: string;
  blessingsOf: string;
  couple: string;
  coupleTitle: string;
  bride: string;
  groom: string;
  daughterOf: string;
  sonOf: string;
  countdown: string;
  countdownTitle: string;
  units: { d: string; h: string; m: string; s: string };
  done: string;
  storyEyebrow: string;
  story: string;
  eveningEyebrow: string;
  evening: string;
  directions: string;
  calendar: string;
  gcal: string;
  dress: string;
  tba: string;
  venueEyebrow: string;
  map: string;
  gettingThere: string;
  film: string;
  play: string;
  liveEyebrow: string;
  live: string;
  liveSoon: string;
  galleryEyebrow: string;
  gallery: string;
  goodToKnow: string;
  contactsEyebrow: string;
  contacts: string;
  call: string;
  rsvpEyebrow: string;
  rsvp: string;
  rsvpIntro: string;
  blessingsEyebrow: string;
  blessings: string;
  blessingsIntro: string;
  yourName: string;
  yourBlessing: string;
  sendBlessing: string;
  sending: string;
  blessingThanks: string;
  shagunEyebrow: string;
  shagun: string;
  shagunIntro: string;
  upiPay: string;
  upiCopy: string;
  shareEyebrow: string;
  share: string;
  shareMore: string;
  copy: string;
  copied: string;
  card: string;
  cardBusy: string;
  qr: string;
  closing: string;
  replay: string;
  sections: string;
  createOwn: string;
}

const en: Strings = {
  open: "Open the doors",
  opening: "Opening your invitation…",
  openHint: "Tap the doors · sound on for the music",
  dear: "Dear",
  invited: "You are cordially invited",
  receptionOf: "The wedding reception of",
  and: "and",
  saveDate: "Save the date",
  saveAll: "Save all dates",
  rsvpNow: "RSVP",
  whatsapp: "WhatsApp",
  invitation: "The invitation",
  together: "Together with their families",
  blessingsOf: "With the blessings of",
  couple: "The couple",
  coupleTitle: "Meet the newly-weds",
  bride: "The Bride",
  groom: "The Groom",
  daughterOf: "Daughter of",
  sonOf: "Son of",
  countdown: "Counting down",
  countdownTitle: "Until we raise a toast",
  units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  done: "Just married!",
  storyEyebrow: "How it began",
  story: "Our love story",
  eveningEyebrow: "The programme",
  evening: "The evening",
  directions: "Directions",
  calendar: "Add to calendar",
  gcal: "Google Calendar",
  dress: "Dress code",
  tba: "Time to be announced",
  venueEyebrow: "The venue",
  map: "Show the map",
  gettingThere: "Getting there",
  film: "Our film",
  play: "Play our film",
  liveEyebrow: "Can't make it?",
  live: "Watch live",
  liveSoon: "The live stream opens 30 minutes before the reception.",
  galleryEyebrow: "Moments",
  gallery: "Our gallery",
  goodToKnow: "Good to know",
  contactsEyebrow: "Questions?",
  contacts: "Who to call",
  call: "Call",
  rsvpEyebrow: "Kindly reply",
  rsvp: "Will you join us?",
  rsvpIntro: "Tell us who's coming and to which parts of the evening — it takes ten seconds.",
  blessingsEyebrow: "Blessings",
  blessings: "Leave your wishes",
  blessingsIntro: "Write a line for the couple. It appears on this wall for every guest.",
  yourName: "Your name",
  yourBlessing: "Your blessing for the couple",
  sendBlessing: "Send blessing",
  sending: "Sending…",
  blessingThanks: "Thank you! Your blessing is on the wall.",
  shagunEyebrow: "Shagun",
  shagun: "Send your blessings",
  shagunIntro: "Your presence is the greatest gift. If you wish to bless the couple from afar, you can send shagun here.",
  upiPay: "Pay with UPI",
  upiCopy: "Copy UPI ID",
  shareEyebrow: "Spread the joy",
  share: "Share the invitation",
  shareMore: "Share",
  copy: "Copy link",
  copied: "Copied",
  card: "Invitation card",
  cardBusy: "Drawing…",
  qr: "QR code",
  closing: "See you on the dance floor",
  replay: "Replay the opening",
  sections: "Sections",
  createOwn: "Create your own invitation",
};

const hi: Strings = {
  open: "द्वार खोलें",
  opening: "आपका निमंत्रण खुल रहा है…",
  openHint: "द्वार पर टैप करें · संगीत के लिए आवाज़ चालू रखें",
  dear: "प्रिय",
  invited: "आप सादर आमंत्रित हैं",
  receptionOf: "स्वागत समारोह",
  and: "और",
  saveDate: "तारीख़ सहेजें",
  saveAll: "सभी तारीख़ें सहेजें",
  rsvpNow: "उत्तर दें",
  whatsapp: "व्हाट्सऐप",
  invitation: "निमंत्रण",
  together: "परिवारों सहित",
  blessingsOf: "आशीर्वाद",
  couple: "वर-वधू",
  coupleTitle: "नवविवाहित जोड़ी",
  bride: "वधू",
  groom: "वर",
  daughterOf: "सुपुत्री",
  sonOf: "सुपुत्र",
  countdown: "उलटी गिनती",
  countdownTitle: "शुभ घड़ी में बाक़ी",
  units: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" },
  done: "विवाह संपन्न!",
  storyEyebrow: "शुरुआत",
  story: "हमारी प्रेम कहानी",
  eveningEyebrow: "कार्यक्रम",
  evening: "शाम का कार्यक्रम",
  directions: "रास्ता देखें",
  calendar: "कैलेंडर में जोड़ें",
  gcal: "गूगल कैलेंडर",
  dress: "पहनावा",
  tba: "समय जल्द बताया जाएगा",
  venueEyebrow: "स्थान",
  map: "नक्शा दिखाएँ",
  gettingThere: "कैसे पहुँचें",
  film: "हमारी फ़िल्म",
  play: "फ़िल्म चलाएँ",
  liveEyebrow: "नहीं आ पा रहे?",
  live: "सीधा प्रसारण देखें",
  liveSoon: "सीधा प्रसारण समारोह से 30 मिनट पहले शुरू होगा।",
  galleryEyebrow: "यादें",
  gallery: "तस्वीरें",
  goodToKnow: "ज़रूरी बातें",
  contactsEyebrow: "कोई सवाल?",
  contacts: "संपर्क करें",
  call: "कॉल करें",
  rsvpEyebrow: "कृपया उत्तर दें",
  rsvp: "क्या आप आएँगे?",
  rsvpIntro: "बताइए कौन आ रहा है और किस कार्यक्रम में — बस दस सेकंड।",
  blessingsEyebrow: "आशीर्वाद",
  blessings: "शुभकामनाएँ दें",
  blessingsIntro: "जोड़े के लिए दो पंक्तियाँ लिखें। वे सभी मेहमानों को दिखेंगी।",
  yourName: "आपका नाम",
  yourBlessing: "जोड़े के लिए आपका आशीर्वाद",
  sendBlessing: "आशीर्वाद भेजें",
  sending: "भेज रहे हैं…",
  blessingThanks: "धन्यवाद! आपका आशीर्वाद दीवार पर है।",
  shagunEyebrow: "शगुन",
  shagun: "शगुन भेजें",
  shagunIntro: "आपकी उपस्थिति ही सबसे बड़ा उपहार है। यदि आप दूर से आशीर्वाद देना चाहें, तो यहाँ शगुन भेज सकते हैं।",
  upiPay: "UPI से भेजें",
  upiCopy: "UPI ID कॉपी करें",
  shareEyebrow: "ख़ुशी बाँटें",
  share: "निमंत्रण भेजें",
  shareMore: "शेयर करें",
  copy: "लिंक कॉपी करें",
  copied: "कॉपी हो गया",
  card: "निमंत्रण कार्ड",
  cardBusy: "बन रहा है…",
  qr: "QR कोड",
  closing: "डांस फ़्लोर पर मिलते हैं",
  replay: "फिर से खोलें",
  sections: "भाग",
  createOwn: "अपना निमंत्रण बनाएँ",
};

export const T: Record<Lang, Strings> = { en, hi };

export const MONTHS_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
