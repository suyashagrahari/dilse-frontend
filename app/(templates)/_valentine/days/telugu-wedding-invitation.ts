// ─── Telugu Pelli Wedding Invitation 🌺 (wedding tier, same limits as Royal) ─
//
// A Telugu wedding suite: a Golconda Kalamkari (c. 1640, the Metropolitan Museum of Art, CC0) behind an ivory card with a Telugu
// textile border, the invocation in gold, jasmine, banana plants and a marigold toran.
// English + Telugu (తెలుగు). Shared engine: app/(templates)/_faith (profile: _faith/faiths/telugu.ts).
//
// Server twin: server/src/config/weddingDays/telugu-wedding-invitation.ts; keys and limits must match
// (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-30). */
export const TELUGU_SONGS: readonly SongSuggestion[] = [{"id": "osMXReitz0I", "title": "Srirastu Subhamastu", "artist": "S. P. Balasubrahmanyam, P. Susheela · Pelli Pustakam"}, {"id": "509NqwF7I30", "title": "Mangala Vadyam (Nadaswaram & Thavil)", "artist": "INRECO Carnatic"}, {"id": "tdVqEcdxSDM", "title": "Seetha Kalyana Vaibhogame", "artist": "Uthara Unnikrishnan · Thyagaraja"}, {"id": "ZsAXhlLwIV4", "title": "Kalyana Vaibhogame", "artist": "K. V. Mahadevan · Seetarama Kalyanam"}, {"id": "DYcBV9OoAag", "title": "Kalyanam Vaibhogam", "artist": "Mickey J. Meyer · Srinivasa Kalyanam"}, {"id": "xVcoYF--0mM", "title": "Vachindamma", "artist": "Sid Sriram · Geetha Govindam"}, {"id": "LPeZOE8ZIHI", "title": "Inkem Inkem Inkem Kaavaale", "artist": "Sid Sriram · Geetha Govindam"}, {"id": "Thf60JU8E98", "title": "Samajavaragamana", "artist": "Sid Sriram · Ala Vaikunthapurramuloo"}];

/** The editor chrome. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFF9EC 0%, #F8EACB 60%, #F0D9A6 100%)",
  base: "#FBF1DE",
  paper: "#FFFCF4",
  glass: "rgba(255,252,246,.84)",
  ink: "#3B1A10",
  inkSoft: "#7A5640",
  paperInk: "#3B1A10",
  accent: "#A3122E",
  accentDeep: "#7E0E24",
  accentInk: "#FFF6EA",
  soft: "#F7E6C4",
  edge: "#E8CF9E",
  gold: "#B8924A",
  dark: false,
  particles: ["🌺", "✨", "🤍"],
  confetti: ["#E3A51E", "#F6D98A", "#A3122E", "#FFF3E0"],
};

export const TELUGU_DEMO_EVENTS: WeddingEvent[] = [{"id": "nischitartham", "title": "Nischitartham", "date": "2027-02-07", "time": "11:00", "endTime": "14:00", "venue": "The Vemuri residence", "address": "Labbipet, Vijayawada", "mapUrl": "", "dressCode": "Silks in soft pastels", "dressColor": "#E9A9A0", "note": "The lagna patrika is read aloud, tamboolam is exchanged, rings and Sravya's first pattu saree from the Mullapudis. Lunch follows on banana leaves."}, {"id": "pellikuthuru", "title": "Pellikuthuru & Pellikoduku", "date": "2027-02-10", "time": "08:00", "endTime": "11:00", "venue": "The Vemuri residence", "address": "Labbipet, Vijayawada", "mapUrl": "", "dressCode": "Turmeric yellows and leaf greens", "dressColor": "#F2C230", "note": "Nalugu, mangala snanam and harathi for the bride. Karthik's Pellikoduku is at the same hour at The Riverside Grand, kajal dot and all. Wear something you don't mind getting turmeric on."}, {"id": "mehendi-sangeet", "title": "Mehendi & Sangeet", "date": "2027-02-10", "time": "18:00", "endTime": "23:00", "venue": "Krishna Riverside Lawns", "address": "Bhavanipuram, Vijayawada", "mapUrl": "", "dressCode": "Greens and festive pastels", "dressColor": "#8DB580", "note": "Henna by the river at sunset, then a night of old Telugu film songs, family performances and a dance-off between the two sides."}, {"id": "snathakam", "title": "Snathakam & Kasi Yatra", "date": "2027-02-11", "time": "17:00", "endTime": "19:30", "venue": "Sri Durga Kalyana Vedika", "address": "Moghalrajpuram, Vijayawada", "mapUrl": "", "dressCode": "Cream and gold; pancha and kanduva for men", "dressColor": "#F1E4C8", "note": "Karthik becomes a householder, then sets off 'for Kashi' with umbrella and walking stick. Harsha will bring him back, we promise."}, {"id": "edurukolu", "title": "Edurukolu", "date": "2027-02-11", "time": "20:00", "endTime": "21:30", "venue": "Sri Durga Kalyana Vedika", "address": "Moghalrajpuram, Vijayawada", "mapUrl": "", "dressCode": "Festive marigold and kumkum silks", "dressColor": "#E8892B", "note": "The Vemuris receive the Mullapudis at the gate with nadaswaram, harathi and rosewater. Dinner is served from 8 pm."}, {"id": "kalyanam", "title": "Kalyanam · Subha Muhurtham", "date": "2027-02-11", "time": "21:30", "endTime": "23:59", "venue": "Sri Durga Kalyana Vedika", "address": "Moghalrajpuram, Vijayawada, Andhra Pradesh", "mapUrl": "", "dressCode": "Kanchi and Dharmavaram silks, gold zari", "dressColor": "#C9962F", "note": "Gauri puja, then Sravya is carried in on the bamboo basket by her mamayyalu, followed by Kanyadanam. Jeelakarra bellam behind the terasala at the muhurtham, 11:42 pm. Mangalya dharanam, talambralu, Br"}, {"id": "appagintalu", "title": "Appagintalu", "date": "2027-02-12", "time": "09:00", "endTime": "10:30", "venue": "The Vemuri residence", "address": "Labbipet, Vijayawada", "mapUrl": "", "dressCode": "Traditional silks", "dressColor": "#8E1B2C", "note": "Our tender goodbye as Sravya is entrusted to the Mullapudis. Bring tissues, and a blessing."}, {"id": "reception", "title": "Reception", "date": "2027-02-13", "time": "19:30", "endTime": "23:00", "venue": "The Riverside Grand", "address": "MG Road, Vijayawada", "mapUrl": "", "dressCode": "Black tie or festive silks, a touch of gold", "dressColor": "#2B2421", "note": "Dinner, from pulihora and bobbatlu to biryani, and the newlyweds' first dance."}];

export const teluguWeddingDay = makeFaithDay({
  slug: "telugu-wedding-invitation",
  title: "Telugu Pelli Wedding Invitation",
  local: { code: "te", label: "తెలుగు" },
  theme: THEME,
  songs: TELUGU_SONGS,
  songsNote: "Telugu wedding favourites, from the nadaswaram to Sid Sriram · or paste any YouTube link (your Annamayya keerthana, your own song)",
  defaultSong: "osMXReitz0I",
  emojiNav: { names: "🌺", details: "🪔" },
  demo: {
    gallery: [["rw-03", "The bride", "wide"], ["rw-11", "Mehendi"], ["rw-01"], ["rw-14"], ["rw-04"], ["rw-13", "Haldi"], ["rw-15"], ["rw-07", "Reception"], ["rw-12"], ["rw-08"], ["rw-02"], ["rw-10-sangeet", "Sangeet night"]],
    bride: "Sravya",
    groom: "Karthik",
    letter: "By the grace of Sri Venkateswara Swamy and with the blessings of our elders, Sravya and Karthik joyfully invite you and your family to their Kalyanam.\n\nMango leaves at every door and turmeric on every threshold. There will be nadaswaram at the Edurukolu and, at 11:42 pm under the pandiri, jeelakarra bellam behind the terasala. Come and shower talambralu with us; the muhurtham would not be complete without your akshinthalu.",
    localMessage: "శ్రీ వేంకటేశ్వర స్వామి వారి కృపతో, పెద్దల ఆశీస్సులతో చి.ల.సౌ. శ్రావ్య మరియు చి. కార్తీక్ ల వివాహ మహోత్సవమునకు మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి, వధూవరులను ఆశీర్వదించవలసిందిగా కోరుచున్నాము. మీ రాకే మాకు ఆనందం.",
    endLine: "With love, the Vemuri & Mullapudi families",
    events: TELUGU_DEMO_EVENTS,
    extras: {"brideFamily": "Sri Vemuri Venkata Ramana Rao & Smt. Vemuri Padmavathi", "groomFamily": "Sri Mullapudi Srinivasa Rao & Smt. Mullapudi Annapurna", "brideNote": "Vijayawada", "groomNote": "Hyderabad", "blessingsOf": "Sri Vemuri Subba Rao & Smt. Vemuri Seethamma", "muhurat": "Jeelakarra bellam at 11:42 pm", "hashtag": "#KarthikSravyaPelli", "story": [{"when": "2019", "title": "A cut kite on Sankranti", "line": "Their kites tangled over a Kukatpally terrace. He came downstairs to apologise with a box of ariselu and stayed for the bhogi fire.", "photo": 0}, {"when": "2022", "title": "Pellichoopulu, officially", "line": "Two families, one plate of pesarattu and a lot of pretending we had never met. Our mothers worked it out before the coffee was served.", "photo": 0}, {"when": "2025", "title": "Yes on the ghats", "line": "At dusk on the Krishna, below Kanaka Durga's hill, he asked her father first and then her. She said yes before the harathi ended.", "photo": 17}, {"when": "2027", "title": "Seven steps", "line": "Jeelakarra bellam, talambralu and seven steps around the fire. Come and bless us.", "photo": 18}], "things": ["Night muhurtham: The muhurtham is at 11:42 pm and the rituals go on past midnight. Tiffin and filter coffee are served all night.", "At the mandapam: Shoes come off near the homam. Do come up to shower akshinthalu after the mangalasutram is tied.", "Stay: Rooms are held at The Riverside Grand from 10 to 13 Feb. Just tell us your dates.", "Weather: Vijayawada is warm in February, about 30°C by day; light silks and cottons are perfect."], "gettingThere": "Vijayawada Junction is on the main Chennai–Howrah and Hyderabad lines, and Vijayawada International Airport at Gannavaram is about 20 km from the city. Hyderabad is a 4½-hour drive on NH65. Our family will meet you at the station and the airport, and cars run between The Riverside Grand, the Vemuri home and Sri Durga Kalyana Vedika on the 10th and 11th.", "rsvpBy": "2027-01-15", "contacts": [{"name": "Harsha Vemuri", "relation": "Sravya's brother", "phone": "+91 90000 00001"}, {"name": "Divya Mullapudi", "relation": "Karthik's sister", "phone": "+91 90000 00002"}]},
  },
  copy: {
    letterPlaceholder: "By the grace of Sri Venkateswara Swamy and with the blessings of our elders, Sravya and Karthik joyfully invit…",
    endLinePlaceholder: "With love, the Vemuri & Mullapudi families",
    sheetTitle: "Your Telugu Pelli invitation",
    storyTitle: "Describe your wedding 🌺",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Telugu Pelli 🌺 You're invited", accent: "#A3122E" },
});
