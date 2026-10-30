// ─── Shubh Vivah Marathi Wedding Invitation 🦚 (wedding tier, same limits as Royal) ─
//
// A Marathi wedding suite: Raja Ravi Varma's Maharashtrian lady (public domain) on a Paithani-magenta ground behind an ivory card with a Marathi
// textile border, the invocation in gold, jasmine, banana plants and a marigold toran.
// English + Marathi (मराठी). Shared engine: app/(templates)/_faith (profile: _faith/faiths/marathi.ts).
//
// Server twin: server/src/config/weddingDays/marathi-wedding-invitation.ts; keys and limits must match
// (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-30). */
export const MARATHI_SONGS: readonly SongSuggestion[] = [{"id": "hEHNef66HT0", "title": "Navrai Majhi", "artist": "Sunidhi Chauhan, Swanand Kirkire (English Vinglish)"}, {"id": "N7aEr1eR04I", "title": "Mangalashtaka", "artist": "Shankar Mahadevan (Basta)"}, {"id": "rqqhVInfzhU", "title": "Navri Ni Navryachi Swaari", "artist": "Avdhoot Gupte, Vaishali Samant (Mangalashtak Once More)"}, {"id": "0Ve0LE_Asfo", "title": "Sar Sukhachi Shravani", "artist": "Abhijeet Sawant, Bela Shende (Mangalashtak Once More)"}, {"id": "latcjCPksXI", "title": "Saaj Sonyacha", "artist": "Shubh Lagna Saavdhaan"}, {"id": "7baxnx8IJj8", "title": "Halad Lagali", "artist": "Anand Shinde, Adarsh Shinde (Nagarsevak)"}, {"id": "NInf8U2QpdQ", "title": "Lagnalu", "artist": "Avadhoot Gupte (Boyz)"}, {"id": "2gcsgfzqN8k", "title": "Zingaat", "artist": "Ajay-Atul (Sairat)"}];

/** The editor chrome. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFF8F6 0%, #F7E6EA 60%, #EFD3DC 100%)",
  base: "#FAEFF1",
  paper: "#FFFCFB",
  glass: "rgba(255,252,246,.84)",
  ink: "#3A1426",
  inkSoft: "#7A586A",
  paperInk: "#3A1426",
  accent: "#8E1F5C",
  accentDeep: "#6E1745",
  accentInk: "#FFF4F8",
  soft: "#F5E0E8",
  edge: "#E6C4D2",
  gold: "#B8924A",
  dark: false,
  particles: ["🦚", "✨", "🤍"],
  confetti: ["#B8862F", "#E9CF9A", "#8E1F5C", "#0F6B57"],
};

export const MARATHI_DEMO_EVENTS: WeddingEvent[] = [{"id": "sakhar-puda", "title": "Sakhar Puda", "date": "2027-02-07", "time": "11:00", "endTime": "14:00", "venue": "The Deshpande residence", "address": "Tilak Road, Sadashiv Peth, Pune", "mapUrl": "", "dressCode": "Soft pastels, silks", "dressColor": "#E9B8C8", "note": "An intimate morning: a packet of sugar and a saree for Gauri, a coconut for Aniket, the rings, and a family lunch."}, {"id": "halad", "title": "Halad Chadavane", "date": "2027-02-16", "time": "10:00", "endTime": "13:30", "venue": "Anandvan Lawns", "address": "Prabhat Road, Erandwane, Pune", "mapUrl": "", "dressCode": "Yellows", "dressColor": "#F2B705", "note": "The suhasinis apply haldi to Aniket with mango leaves first, then bring it to Gauri. Expect to go home a little yellow."}, {"id": "mehendi", "title": "Mehendi", "date": "2027-02-16", "time": "17:00", "endTime": "21:30", "venue": "Anandvan Lawns", "address": "Prabhat Road, Erandwane, Pune", "mapUrl": "", "dressCode": "Greens and pastels", "dressColor": "#7FA37A", "note": "Henna, mogra gajras, ukhane and an antakshari that the aunts will win."}, {"id": "seemant", "title": "Seemant Pujan & Sangeet", "date": "2027-02-17", "time": "18:30", "endTime": "23:00", "venue": "Sneh Mangal Karyalay", "address": "Karve Road, Erandwane, Pune", "mapUrl": "", "dressCode": "Jewel-tone silks; pheta for the men", "dressColor": "#5B2A6E", "note": "Gauri's mother welcomes Aniket and his family with aarti, followed by dinner and a Sangeet with a dhol-tasha surprise."}, {"id": "lagna", "title": "Shubh Vivah", "date": "2027-02-18", "time": "09:00", "endTime": "14:00", "venue": "Sneh Mangal Karyalay", "address": "Karve Road, Erandwane, Pune, Maharashtra", "mapUrl": "", "dressCode": "Paithani and nauvari; kurta-dhoti and pheta", "dressColor": "#A3195B", "note": "Gaurihar Puja at 9 am, then the Mangalashtak behind the antarpat. Akshata at the muhurt, 11:42 am, followed by kanyadaan, mangalsutra and the Saptapadi. A traditional pangat lunch follows, and the Paa"}, {"id": "reception", "title": "Reception", "date": "2027-02-19", "time": "19:30", "endTime": "23:00", "venue": "The Shaniwar Ballroom", "address": "Koregaon Park, Pune", "mapUrl": "", "dressCode": "Evening formal, a touch of gold", "dressColor": "#0E6B5C", "note": "Dinner and Gauri's first ukhana as a Kulkarni, which she has been practising for months."}];

export const marathiWeddingDay = makeFaithDay({
  slug: "marathi-wedding-invitation",
  title: "Shubh Vivah Marathi Wedding Invitation",
  local: { code: "mr", label: "मराठी" },
  theme: THEME,
  songs: MARATHI_SONGS,
  songsNote: "Marathi wedding favourites, the Mangalashtak and sanai-choughada · or paste any YouTube link",
  defaultSong: "hEHNef66HT0",
  emojiNav: { names: "🦚", details: "🪔" },
  demo: {
    gallery: [["rw-03", "The bride", "wide"], ["rw-11", "Mehendi"], ["rw-01"], ["rw-14"], ["rw-04"], ["rw-13", "Haldi"], ["rw-15"], ["rw-07", "Reception"], ["rw-12"], ["rw-08"], ["rw-02"], ["rw-10-sangeet", "Sangeet night"]],
    bride: "Gauri",
    groom: "Aniket",
    letter: "By the grace of Shri Ganesha and with the blessings of our elders, Gauri and Aniket joyfully invite you to their wedding in Pune.\n\nThere will be kelvan dinners that never seem to end, a haldi-yellow afternoon, an evening of mehendi and ukhane, and then the moment itself: the Mangalashtak rising behind the antarpat, the silk falling at 11:42 am, and a shower of akshata from everyone we love. Please come with your whole family and bless us. Your presence will make the day complete.",
    localMessage: "॥ श्री गणेशाय नमः ॥\nश्री गणरायाच्या कृपेने व वडीलधाऱ्यांच्या आशीर्वादाने चि. सौ. कां. गौरी आणि चि. अनिकेत यांचा शुभविवाह गुरुवार, दि. १८ फेब्रुवारी २०२७ रोजी सकाळी ११ वाजून ४२ मिनिटांच्या शुभमुहूर्तावर पुणे येथे करण्याचे योजिले आहे. तरी या मंगल प्रसंगी आपण सहकुटुंब सहपरिवार उपस्थित राहून वधूवरांस शुभाशीर्वाद द्यावेत, ही नम्र विनंती.",
    endLine: "With love, the Deshpande & Kulkarni families",
    events: MARATHI_DEMO_EVENTS,
    extras: {"brideFamily": "Shri Vinayak & Sau. Madhavi Deshpande", "groomFamily": "Shri Prakash & Sau. Sunanda Kulkarni", "brideNote": "Pune", "groomNote": "Nashik", "blessingsOf": "Kai. Shri Shankarrao Deshpande & Sau. Kusum Deshpande", "muhurat": "Muhurt 11:42 am", "hashtag": "#GauriAniketShubhMangal", "story": [{"when": "2018", "title": "A Ganeshotsav in Sadashiv Peth", "line": "She was on the dhol-tasha pathak. He was the boy who missed every beat on the tasha. She noticed, and so did everyone else.", "photo": 0}, {"when": "2021", "title": "Monsoon on Sinhagad", "line": "A rainy trek, a shared plate of kanda bhaji and pithla-bhakri at the top, and a long walk down that neither of us wanted to end.", "photo": 0}, {"when": "2025", "title": "The question at Shaniwar Wada", "line": "He asked her parents first, over poha and chaha, then asked her at sunset by the Delhi Darwaza. She said yes before he'd finished.", "photo": 17}, {"when": "2027", "title": "Shubhamangal saavdhaan", "line": "Now the antarpat falls and the akshata flies. Come and bless us.", "photo": 18}], "things": ["Akshata: Akshata will be handed out at the mandap. Please shower it on the couple only as the last Mangalashtak ends at 11:42 am.", "Aaher: Your blessings are the only aaher we wish for. Please, no gifts.", "Stay: Rooms are held at a hotel on Karve Road from 16 to 20 Feb. Just tell us your dates.", "Weather: Pune is pleasant in February, about 30°C by day and cool at night. Bring a light shawl for the Sangeet."], "gettingThere": "Pune airport is 30–40 minutes from Karve Road, and Pune Junction railway station (Deccan Queen and Shatabdi from Mumbai) is about 20 minutes away. Our family will meet you on arrival, and cars run between the hotel and Sneh Mangal Karyalay on the 17th and 18th.", "rsvpBy": "2027-01-25", "contacts": [{"name": "Siddharth Deshpande", "relation": "Gauri's brother", "phone": "+91 90000 00001"}, {"name": "Ketaki Kulkarni", "relation": "Aniket's sister", "phone": "+91 90000 00002"}]},
  },
  copy: {
    letterPlaceholder: "By the grace of Shri Ganesha and with the blessings of our elders, Gauri and Aniket joyfully invite you to the…",
    endLinePlaceholder: "With love, the Deshpande & Kulkarni families",
    sheetTitle: "Your Shubh Vivah invitation",
    storyTitle: "Describe your wedding 🦚",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Shubh Vivah 🦚 You're invited", accent: "#8E1F5C" },
});
