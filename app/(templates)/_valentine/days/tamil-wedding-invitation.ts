// ─── Tamil Kalyanam Wedding Invitation 🪔 (wedding tier, same limits as Royal) ─
//
// A Tamil wedding suite: William Hodges's aquatint of the Great Pagoda at Tanjore (1787, public domain) behind an ivory card with a Tamil
// textile border, the invocation in gold, jasmine, banana plants and a marigold toran.
// English + Tamil (தமிழ்). Shared engine: app/(templates)/_faith (profile: _faith/faiths/tamil.ts).
//
// Server twin: server/src/config/weddingDays/tamil-wedding-invitation.ts; keys and limits must match
// (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-30). */
export const TAMIL_SONGS: readonly SongSuggestion[] = [{"id": "509NqwF7I30", "title": "Mangala Vadyam (Nadaswaram & Thavil)", "artist": "INRECO Carnatic"}, {"id": "9ZLJiXSmnSw", "title": "Ketti Melam · Mangala Isai Nadaswaram", "artist": "Vijay Musicals"}, {"id": "uUzekS_cfdk", "title": "Kalyaana Maalai (Puthu Puthu Arthangal)", "artist": "Ilaiyaraaja, S. P. Balasubrahmanyam"}, {"id": "FzLpP8VBC6E", "title": "Nenjukkul Peidhidum (Vaaranam Aayiram)", "artist": "Harris Jayaraj, Hariharan"}, {"id": "rp3_FhRnIRw", "title": "Munbe Vaa (Sillunu Oru Kadhal)", "artist": "A. R. Rahman, Shreya Ghoshal, Naresh Iyer"}, {"id": "0zrLA90QdQA", "title": "Malargal Kaettaen (OK Kanmani)", "artist": "A. R. Rahman, K. S. Chithra"}, {"id": "EhhiY11Z9-U", "title": "Ennodu Nee Irundhaal (I)", "artist": "A. R. Rahman, Sid Sriram, Sunitha Sarathy"}, {"id": "ryD8BqVexJI", "title": "Mental Manadhil (OK Kanmani)", "artist": "A. R. Rahman, Jonita Gandhi"}];

/** The editor chrome. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFF9F0 0%, #F7EAD6 60%, #EFDCBC 100%)",
  base: "#FAF1E2",
  paper: "#FFFCF6",
  glass: "rgba(255,252,246,.84)",
  ink: "#3A1A14",
  inkSoft: "#7A5A4A",
  paperInk: "#3A1A14",
  accent: "#8A1C33",
  accentDeep: "#6E1426",
  accentInk: "#FFF6EE",
  soft: "#F5E4D2",
  edge: "#E6CDB0",
  gold: "#B8924A",
  dark: false,
  particles: ["🪔", "✨", "🤍"],
  confetti: ["#B8862F", "#E9CF9A", "#8A1C33", "#FFF3E0"],
};

export const TAMIL_DEMO_EVENTS: WeddingEvent[] = [{"id": "nichayathartham", "title": "Nichayathartham", "date": "2027-02-07", "time": "10:30", "endTime": "13:30", "venue": "Lotus Hall", "address": "Luz Church Road, Mylapore, Chennai", "mapUrl": "", "dressCode": "Silk sarees and veshti-shirts; soft rose", "dressColor": "#E7A3AE", "note": "The lagna patrikai is read, trays of silk and fruit change hands, and Meenakshi and Karthik exchange rings. Lunch follows on banana leaves."}, {"id": "pandakaal", "title": "Panda Kaal Muhurtham", "date": "2027-02-08", "time": "07:00", "endTime": "08:30", "venue": "The Raghavan residence", "address": "Venkatesa Agraharam Street, Mylapore, Chennai", "mapUrl": "", "dressCode": "Simple cottons; family only", "dressColor": "#E3A82B", "note": "The bamboo pole goes up at the gate under its mango-leaf thoranam. Filter coffee and pongal after."}, {"id": "mappillai-azhaippu", "title": "Mappillai Azhaippu", "date": "2027-02-10", "time": "17:30", "endTime": "19:00", "venue": "Sri Kamakshi Kalyana Mandapam", "address": "Venkatnarayana Road, T. Nagar, Chennai", "mapUrl": "", "dressCode": "Festive silks", "dressColor": "#A8235B", "note": "Karthik arrives from the Pillaiyar kovil in a jasmine-draped car with nadaswaram leading the way. Join the procession at 5:30 pm."}, {"id": "reception", "title": "Reception", "date": "2027-02-10", "time": "19:00", "endTime": "22:30", "venue": "Sri Kamakshi Kalyana Mandapam", "address": "Venkatnarayana Road, T. Nagar, Chennai", "mapUrl": "", "dressCode": "Evening silks and bandhgalas; jewel tones", "dressColor": "#5A1A1B", "note": "Meet the couple on stage to a light-music kutcheri, then dinner on banana leaves."}, {"id": "kashi-yatra", "title": "Kashi Yatra", "date": "2027-02-11", "time": "06:30", "endTime": "07:15", "venue": "Sri Kamakshi Kalyana Mandapam", "address": "Venkatnarayana Road, T. Nagar, Chennai", "mapUrl": "", "dressCode": "Veshti in white and gold", "dressColor": "#F7EFDD", "note": "Karthik sets off for Kashi with his umbrella and fan; Meenakshi's appa will talk him round. Early, but worth it."}, {"id": "maalai-oonjal", "title": "Maalai Maatral & Oonjal", "date": "2027-02-11", "time": "07:15", "endTime": "08:30", "venue": "Sri Kamakshi Kalyana Mandapam", "address": "Venkatnarayana Road, T. Nagar, Chennai", "mapUrl": "", "dressCode": "Bright Kanjeevaram silks; jasmine in the hair", "dressColor": "#C2185B", "note": "Uncles' shoulders, three garlands and a lot of cheering, then the Oonjal songs. Bring your voices."}, {"id": "muhurtham", "title": "Muhurtham", "date": "2027-02-11", "time": "09:00", "endTime": "10:30", "venue": "Sri Kamakshi Kalyana Mandapam", "address": "Venkatnarayana Road, T. Nagar, Chennai 600017", "mapUrl": "", "dressCode": "Traditional: Kanjeevaram silks; veshti and angavastram", "dressColor": "#B8862E", "note": "Kanyadaanam, then the thali is tied to the getti melam. Please be seated by 8:45 am; akshatai will be handed out. Lunch (sappadu) follows from 11:30."}, {"id": "nalangu", "title": "Nalangu", "date": "2027-02-11", "time": "16:00", "endTime": "18:00", "venue": "Sri Kamakshi Kalyana Mandapam", "address": "Venkatnarayana Road, T. Nagar, Chennai", "mapUrl": "", "dressCode": "Light silk-cottons; parrot green and mango", "dressColor": "#4E7A2E", "note": "Coconut rolling, the ring in the pot and a few songs. Cousins, sharpen your teasing."}];

export const tamilWeddingDay = makeFaithDay({
  slug: "tamil-wedding-invitation",
  title: "Tamil Kalyanam Wedding Invitation",
  local: { code: "ta", label: "தமிழ்" },
  theme: THEME,
  songs: TAMIL_SONGS,
  songsNote: "Nadaswaram mangala isai and Tamil love songs · or paste any YouTube link (your family's Oonjal song, a kutcheri piece)",
  defaultSong: "509NqwF7I30",
  emojiNav: { names: "🪔", details: "🪔" },
  demo: {
    gallery: [["rw-03", "The bride", "wide"], ["rw-11", "Mehendi"], ["rw-01"], ["rw-14"], ["rw-04"], ["rw-13", "Haldi"], ["rw-15"], ["rw-07", "Reception"], ["rw-12"], ["rw-08"], ["rw-02"], ["rw-10-sangeet", "Sangeet night"]],
    bride: "Meenakshi",
    groom: "Karthik",
    letter: "With the grace of Lord Ganesha and the blessings of our elders, Meenakshi and Karthik joyfully invite you and your family to their wedding.\n\nThree days of nadaswaram at dawn and jasmine at dusk: a Mappillai Azhaippu through the streets of T. Nagar, the swing of the Oonjal, and the moment the getti melam rises as the thali is tied. It would not be complete without you. Come, bless the couple, and stay for the banana-leaf feast.",
    localMessage: "நிகழும் மங்களகரமான பராபவ வருடம் தை மாதம், 2027 பிப்ரவரி 11-ஆம் தேதி வியாழக்கிழமை காலை 9.00 மணி முதல் 10.30 மணிக்குள் நடைபெறும் சுபமுகூர்த்தத்தில், சென்னை தி. நகர் ஸ்ரீ காமாட்சி கல்யாண மண்டபத்தில் எங்கள் அன்பு மகள் சௌ. மீனாட்சிக்கும், சி. கார்த்திக்கிற்கும் திருமணம் நடைபெற இறையருள் கூடியுள்ளதால், தாங்கள் சுற்றமும் நட்பும் சூழ வருகை தந்து மணமக்களை வாழ்த்தி ஆசீர்வதிக்குமாறு அன்புடன் அழைக்கிறோம்.",
    endLine: "With love, the Raghavan & Venkatesan families",
    events: TAMIL_DEMO_EVENTS,
    extras: {"brideFamily": "Thiru. R. Raghavan & Thirumathi. Lakshmi Raghavan", "groomFamily": "Thiru. S. Venkatesan & Thirumathi. Padma Venkatesan", "brideNote": "Chennai", "groomNote": "Madurai", "blessingsOf": "Thiru. K. Ramaswamy & Thirumathi. Kamala Ramaswamy", "muhurat": "Muhurtham 9:00–10:30 am", "hashtag": "#MeenaKarthikKalyanam", "story": [{"when": "2019", "title": "A December kutcheri", "line": "Margazhi season at the Music Academy. Two seats, one shared armrest and an argument about Thyagaraja that lasted through the canteen's filter coffee.", "photo": 0}, {"when": "2022", "title": "Chithirai in Madurai", "line": "She came for the Chithirai festival; he showed her the temple at dawn. Our appas found out before we told anyone.", "photo": 0}, {"when": "2025", "title": "The question at Marina", "line": "At sunrise on the beach, with a string of jasmine in his pocket, he asked. She said yes before he finished.", "photo": 17}, {"when": "2027", "title": "Three knots", "line": "Now the getti melam will play for us. Come and bless us.", "photo": 18}], "things": ["At the mandapam: Footwear is left at the entrance stand. The feast is vegetarian and served on banana leaves; please eat with us.", "Stay: Rooms are held at a hotel on G.N. Chetty Road, a five-minute walk from the mandapam, from 9 to 12 Feb. Just tell us your dates.", "Weather: Chennai in February is warm, about 30 °C by noon. Silks are lovely; carry a fan.", "Getting around: Shuttles run between the hotel and the mandapam from 6 am on the 11th, in time for the Kashi Yatra."], "gettingThere": "Chennai International Airport is 40 minutes from T. Nagar, and Chennai Central and Egmore stations are 25 minutes away. The mandapam is a 10-minute walk from the T. Nagar bus terminus and near the Mambalam suburban station. Our family will meet you at the airport or station; just send your arrival time.", "rsvpBy": "2027-01-20", "contacts": [{"name": "Srinivasan Raghavan", "relation": "Meenakshi's brother", "phone": "+91 90000 00001"}, {"name": "Divya Venkatesan", "relation": "Karthik's sister", "phone": "+91 90000 00002"}]},
  },
  copy: {
    letterPlaceholder: "With the grace of Lord Ganesha, Meenakshi and Karthik joyfully invite you to their wedding…",
    endLinePlaceholder: "With love, the Raghavan & Venkatesan families",
    sheetTitle: "Your Tamil wedding invitation",
    storyTitle: "Describe your wedding 🌼",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Tamil Kalyanam 🪔 You're invited", accent: "#8A1C33" },
});
