// ─── Kannada Maduve Wedding Invitation 🌸 (wedding tier, same limits as Royal) ─
//
// A Kannada wedding suite: the Colebrooke views of Seringapatam across the Kaveri (1805, public domain) behind an ivory card with a Kannada
// textile border, the invocation in gold, jasmine, banana plants and a marigold toran.
// English + Kannada (ಕನ್ನಡ). Shared engine: app/(templates)/_faith (profile: _faith/faiths/kannada.ts).
//
// Server twin: server/src/config/weddingDays/kannada-wedding-invitation.ts; keys and limits must match
// (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-30). */
export const KANNADA_SONGS: readonly SongSuggestion[] = [{"id": "ckQv4fBzoQ0", "title": "Thaali Kattuva Shubha Vele", "artist": "S. P. Balasubrahmanyam · Benkiyalli Aralida Hoovu"}, {"id": "509NqwF7I30", "title": "Mangala Vadyam (Nadaswaram & Thavil)", "artist": "INRECO Carnatic"}, {"id": "s4Rr0X7dbCI", "title": "Kannoonjal · Mangala Vadyam", "artist": "T. E. Palaniswamy"}, {"id": "Q9Sj8a_2GbE", "title": "Madarangi", "artist": "Rajesh Krishnan, Shreya Ghoshal · Milana"}, {"id": "-xmRjO2G05c", "title": "Ninnindale", "artist": "Sonu Nigam · Milana"}, {"id": "nlsLKA6hlVQ", "title": "Anisuthide", "artist": "Sonu Nigam · Mungaru Male"}, {"id": "Xv1NQFN9Kd8", "title": "Ondu Malebillu", "artist": "Arjun Janya · Chakravarthy"}, {"id": "ebz20FHrT44", "title": "Belageddu", "artist": "Vijay Prakash · Kirik Party"}];

/** The editor chrome. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFF9F3 0%, #F6E8E0 60%, #EED8CC 100%)",
  base: "#FAF0EA",
  paper: "#FFFCF8",
  glass: "rgba(255,252,246,.84)",
  ink: "#3A1630",
  inkSoft: "#7A5A6C",
  paperInk: "#3A1630",
  accent: "#9C1C5C",
  accentDeep: "#7D1650",
  accentInk: "#FFF4F8",
  soft: "#F5E2EA",
  edge: "#E6C8D6",
  gold: "#B8924A",
  dark: false,
  particles: ["🌸", "✨", "🤍"],
  confetti: ["#B8862F", "#E9CF9A", "#9C1C5C", "#1F6B4A"],
};

export const KANNADA_DEMO_EVENTS: WeddingEvent[] = [{"id": "nishchitartha", "title": "Nishchitartha", "date": "2027-02-07", "time": "11:00", "endTime": "14:00", "venue": "The Prakash residence", "address": "Kuvempunagar, Mysuru", "mapUrl": "", "dressCode": "Silk sarees and silk shirts", "dressColor": "#C2185B", "note": "Tambula on silver plates, rings, a Mysore silk saree for Sinchana and the lagna patrike read by our purohit. Lunch follows."}, {"id": "chappara", "title": "Chappara Pooje & Arishina Shastra", "date": "2027-02-15", "time": "09:00", "endTime": "13:00", "venue": "The Prakash residence", "address": "Kuvempunagar, Mysuru", "mapUrl": "", "dressCode": "Turmeric yellows", "dressColor": "#E2A82B", "note": "The coconut-frond chappara goes up over the gate, then turmeric, songs and a splash of water. Wear something you don't mind getting yellow."}, {"id": "devara-samaradhane", "title": "Devara Samaradhane & Naandi", "date": "2027-02-16", "time": "08:00", "endTime": "12:00", "venue": "The Prakash residence", "address": "Kuvempunagar, Mysuru", "mapUrl": "", "dressCode": "Traditional silks", "dressColor": "#9E1B32", "note": "Worship of our kuladevata, the Naandi kalasha and the first invitation offered to God, followed by a simple oota on banana leaves."}, {"id": "madarangi", "title": "Madarangi", "date": "2027-02-16", "time": "17:00", "endTime": "21:00", "venue": "Chamundi Vihar Gardens", "address": "Nazarbad, Mysuru", "mapUrl": "", "dressCode": "Greens and pastels", "dressColor": "#7FA36B", "note": "Henna for the bride, bhavageethe and film songs, chaats and jasmine for everyone."}, {"id": "varapooje", "title": "Varapooje & Aarathakshate", "date": "2027-02-17", "time": "18:00", "endTime": "22:00", "venue": "Sri Lakshmi Venkateshwara Kalyana Mantapa", "address": "Saraswathipuram, Mysuru", "mapUrl": "", "dressCode": "Silk and festive", "dressColor": "#5B1A3A", "note": "The bride's family welcomes Rakshith with aarti, a silk panche and shawl; then the reception, nadaswaram and dinner."}, {"id": "kashi-yatre", "title": "Kashi Yatre", "date": "2027-02-18", "time": "06:30", "endTime": "07:30", "venue": "Sri Lakshmi Venkateshwara Kalyana Mantapa", "address": "Saraswathipuram, Mysuru", "mapUrl": "", "dressCode": "Traditional", "dressColor": "#E7C873", "note": "Rakshith sets off for Kashi with his umbrella and stick; Sinchana's father has promised to talk him out of it."}, {"id": "dhare-muhurtha", "title": "Dhare Muhurtha", "date": "2027-02-18", "time": "08:00", "endTime": "11:30", "venue": "Sri Lakshmi Venkateshwara Kalyana Mantapa", "address": "Saraswathipuram, Mysuru, Karnataka", "mapUrl": "", "dressCode": "Mysore silk, Kanjeevaram, panche", "dressColor": "#B0215E", "note": "Gowri pooje, the antarpata, Dhare Herdu and Mangalya Dharane at 9:12 am, then Saptapadi and Arundhati darshana. Maduve oota on banana leaves follows."}, {"id": "griha-pravesha", "title": "Griha Pravesha", "date": "2027-02-19", "time": "10:30", "endTime": "13:00", "venue": "The Gowda residence", "address": "Basavanagudi, Bengaluru", "mapUrl": "", "dressCode": "Festive traditional", "dressColor": "#C9A04A", "note": "Sinchana tips the measure of rice at the door and steps into her new home. Lunch with the family follows."}];

export const kannadaWeddingDay = makeFaithDay({
  slug: "kannada-wedding-invitation",
  title: "Kannada Maduve Wedding Invitation",
  local: { code: "kn", label: "ಕನ್ನಡ" },
  theme: THEME,
  songs: KANNADA_SONGS,
  songsNote: "Kannada wedding classics and nadaswaram · or paste any YouTube link",
  defaultSong: "ckQv4fBzoQ0",
  emojiNav: { names: "🌸", details: "🪔" },
  demo: {
    gallery: [["rw-03", "The bride", "wide"], ["rw-11", "Mehendi"], ["rw-01"], ["rw-14"], ["rw-04"], ["rw-13", "Haldi"], ["rw-15"], ["rw-07", "Reception"], ["rw-12"], ["rw-08"], ["rw-02"], ["rw-10-sangeet", "Sangeet night"]],
    bride: "Sinchana",
    groom: "Rakshith",
    letter: "With the grace of Sri Chamundeshwari and the blessings of our elders, Sinchana and Rakshith joyfully invite you to their Shubha Vivaha in Mysuru.\n\nA week of turmeric afternoons, the chappara going up over the gate, a Varapooje under jasmine and lamplight, and the Dhare muhurtha at the kalyana mantapa. Your presence and your akshate would make it complete.",
    localMessage: "ಕುಲದೇವರ ಕೃಪೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ, ಚಿ॥ ಸೌ॥ ಸಿಂಚನಾ ಮತ್ತು ಚಿ॥ ರಕ್ಷಿತ್ ಇವರ ವಿವಾಹ ಮಹೋತ್ಸವವು 2027ರ ಫೆಬ್ರವರಿ 18, ಗುರುವಾರ ಬೆಳಿಗ್ಗೆ 9:12ರ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಮೈಸೂರಿನಲ್ಲಿ ನೆರವೇರಲಿದೆ. ತಾವು ಸಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ ವಧೂವರರನ್ನು ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ವಿನಂತಿ.",
    endLine: "With love, the Prakash & Gowda families",
    events: KANNADA_DEMO_EVENTS,
    extras: {"brideFamily": "Sri M. N. Prakash & Smt. Lalitha Prakash", "groomFamily": "Sri K. R. Suresh Gowda & Smt. Shobha Suresh", "brideNote": "Mysuru", "groomNote": "Bengaluru", "blessingsOf": "Sri M. Narasimhaiah & Smt. Kamalamma", "muhurat": "Dhare muhurtha at 9:12 am", "hashtag": "#SinchanaWedsRakshith", "story": [{"when": "2018", "title": "A Dasara evening", "line": "The palace lit with a hundred thousand bulbs. Two college groups, one crowded Sayyaji Rao Road, and a borrowed umbrella he never got back.", "photo": 0}, {"when": "2021", "title": "Filter coffee at Mylari", "line": "Every Sunday for a year, the same corner table, the same two dosas. Our mothers worked it out before we did.", "photo": 0}, {"when": "2025", "title": "The question at Chamundi Betta", "line": "One thousand steps at sunrise. He asked her parents first, then her, at the top. She said yes before he finished.", "photo": 17}, {"when": "2027", "title": "Dhare and the mangalya", "line": "Now our hands meet under the dhare. Come, bless us with your akshate.", "photo": 18}], "things": ["At the mantapa: Footwear stays at the entrance of the mantapa stage; akshate (blessed rice) is handed out before the muhurtha, so please stay seated until the thaali is tied.", "Food: The wedding lunch (maduve oota) is served on banana leaves right after the muhurtha: holige, payasa and bisi bele bath.", "Stay: Rooms are held at a hotel near the mantapa from 16 to 19 Feb. Just tell us your dates.", "Weather: Mysuru in February is pleasant by day and cool at dawn; bring a light shawl for the Kashi Yatre at 6:30 am."], "gettingThere": "Mysuru is about 3 hours from Bengaluru by the expressway or the Shatabdi / Vande Bharat; Mysore Airport (Mandakalli) has a few flights, and Bengaluru airport is 4 hours away. The mantapa is 10 minutes from Mysuru Junction; family cars will meet you at the station on the 17th and 18th.", "rsvpBy": "2027-01-25", "contacts": [{"name": "Vinay Prakash", "relation": "Sinchana's brother", "phone": "+91 90000 00001"}, {"name": "Ramya Suresh", "relation": "Rakshith's sister", "phone": "+91 90000 00002"}]},
  },
  copy: {
    letterPlaceholder: "With the grace of Sri Chamundeshwari and the blessings of our elders, Sinchana and Rakshith joyfully invite yo…",
    endLinePlaceholder: "With love, the Prakash & Gowda families",
    sheetTitle: "Your Kannada Maduve invitation",
    storyTitle: "Describe your wedding 🌸",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Kannada Maduve 🌸 You're invited", accent: "#9C1C5C" },
});
