// ─── Nikah Wedding Invitation ☪ (wedding tier, same limits as Royal) ─────────
//
// A Muslim wedding suite under a sage-and-gold Mughal arch: the Bismillah in
// gold, lanterns, blush and ivory florals, the couple seated either side of a
// floral partition. English + Urdu (Nastaliq, right-to-left). Functions from
// the Mangni to the Nikah, the Rukhsati and the Walima. Shared engine:
// app/(templates)/_faith (profile: _faith/faiths/muslim.ts).
//
// Server twin: server/src/config/weddingDays/muslim-wedding-invitation.ts;
// keys and limits must match (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-28). Kun Faya Kun plays by default. */
export const MUSLIM_SONGS: readonly SongSuggestion[] = [
  { id: "T94PHkuydcw", title: "Kun Faya Kun", artist: "A.R. Rahman, Javed Ali, Mohit Chauhan" },
  { id: "a18py61_F_w", title: "Tajdar-e-Haram", artist: "Atif Aslam (Coke Studio)" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome: ivory paper, sage ink, gold. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FBFBF4 0%, #F1F2E6 60%, #E6EAD7 100%)",
  base: "#F5F6EC",
  paper: "#FFFEF8",
  glass: "rgba(255,254,248,.84)",
  ink: "#2C3328",
  inkSoft: "#66705E",
  paperInk: "#2C3328",
  accent: "#4F6B4C",
  accentDeep: "#3A5238",
  accentInk: "#FBFCF4",
  soft: "#EBEEDD",
  edge: "#D6DCC2",
  gold: "#B8924A",
  dark: false,
  particles: ["🌙", "✨", "🤍"],
  confetti: ["#B8924A", "#E9CF9A", "#A9BFA3", "#FFF8EC"],
};

export const MUSLIM_DEMO_EVENTS: WeddingEvent[] = [
  { id: "mangni", title: "Mangni", date: "2027-02-12", time: "19:00", endTime: "22:00", venue: "The Siddiqui residence", address: "Gomti Nagar, Lucknow", mapUrl: "", dressCode: "Pastel sharara and sherwani", dressColor: "#E7B9B5", note: "Rings, a little mithai and the families' first official dinner together." },
  { id: "manjha", title: "Manjha & Ubtan", date: "2027-02-17", time: "16:00", endTime: "19:00", venue: "The Siddiqui residence", address: "Gomti Nagar, Lucknow", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "Ubtan for the bride and the groom, songs from the elders and a lot of laughter." },
  { id: "mehndi", title: "Mehndi", date: "2027-02-18", time: "18:00", endTime: "23:00", venue: "The Nawab Courtyard", address: "Qaiserbagh, Lucknow", mapUrl: "", dressCode: "Greens and pastels", dressColor: "#9DB89A", note: "Henna, the dholak and a qawwali under the lanterns." },
  { id: "nikah", title: "Nikah", date: "2027-02-20", time: "16:30", endTime: "19:30", venue: "The Nawab Courtyard", address: "Qaiserbagh, Lucknow, Uttar Pradesh", mapUrl: "", dressCode: "Ivory, sage and gold", dressColor: "#F1E6D6", note: "The Nikah after Asr: the ijab-o-qubool before the Qazi, then dinner. The Rukhsati follows at 9 pm." },
  { id: "walima", title: "Walima", date: "2027-02-21", time: "20:00", endTime: "23:30", venue: "The Ivory Pavilion", address: "Vibhuti Khand, Lucknow", mapUrl: "", dressCode: "Formal, a touch of gold", dressColor: "#2A2622", note: "Hosted by the Qureshi family to welcome Zoya home. Dinner and duas." },
];

export const muslimWeddingDay = makeFaithDay({
  slug: "muslim-wedding-invitation",
  title: "Nikah Wedding Invitation",
  local: { code: "ur", label: "اردو" },
  theme: THEME,
  songs: MUSLIM_SONGS,
  songsNote: "Sufi, qawwali and soft wedding songs · or paste any YouTube link (or switch the music off for the Nikah)",
  defaultSong: "T94PHkuydcw",
  emojiNav: { names: "🌙", details: "🏮" },
  demo: {
    gallery: [
      ["rw-11", "Mehndi", "wide"], ["rw-14"], ["rw-03", "The bride"], ["rw-04"], ["rw-13", "Manjha"], ["rw-15"],
      ["rw-08"], ["rw-12", "Qubool hai"], ["rw-07"], ["rw-02"], ["rw-10-sangeet", "Walima night"],
    ],
    bride: "Zoya",
    groom: "Ayaan",
    letter:
      "With the blessings of Allah and the duas of our elders, Zoya and Ayaan request the honour of your presence at their Nikah.\n\nA week of ubtan and mehndi, a qawwali under the lanterns, the Nikah after Asr and a Walima to welcome Zoya home. Your presence and your duas will make it complete.",
    localMessage:
      "اللہ تعالیٰ کے فضل و کرم اور بزرگوں کی دعاؤں سے، زویا اور ایان کے نکاح کی مبارک تقریب میں آپ کو اہلِ خانہ سمیت دلی دعوت دی جاتی ہے۔ آپ کی شرکت اور دعائیں ہمارے لیے باعثِ مسرت ہوں گی۔",
    endLine: "With love and duas, the Siddiqui & Qureshi families",
    events: MUSLIM_DEMO_EVENTS,
    extras: {
      brideFamily: "Mrs. Nasreen & Mr. Imran Siddiqui",
      groomFamily: "Mrs. Farah & Mr. Salman Qureshi",
      brideNote: "Lucknow",
      groomNote: "Hyderabad",
      blessingsOf: "Janab Abdul Hameed Siddiqui & Begum Shakira Siddiqui",
      muhurat: "Nikah after Asr",
      hashtag: "#ZoyaKiAyaan",
      story: [
        { when: "2019", title: "Iftar at the library steps", line: "Ramzan in Delhi, two students and one plate of dates. He pretended he hadn't brought his own.", photo: 0 },
        { when: "2022", title: "Letters from Hyderabad", line: "He moved for work; she kept every voice note. Their mothers met over biryani before either of them said a word.", photo: 0 },
        { when: "2025", title: "A rishta, then a yes", line: "His family came with flowers and mithai; she said yes in the courtyard where her grandfather once proposed.", photo: 17 },
        { when: "2027", title: "Qubool hai", line: "Now we begin our life together, InshaAllah. Come and pray for us.", photo: 18 },
      ],
      things: [
        "At the Nikah: Ladies may like to bring a dupatta; seating is arranged for families.",
        "Stay: Rooms are held at The Ivory Pavilion from 17 to 22 Feb. Just tell us your dates.",
        "Weather: Lucknow evenings in February are cool, so bring a shawl.",
        "Getting around: Cars run between the hotel, the Courtyard and the Pavilion every evening.",
      ],
      gettingThere: "Lucknow's Chaudhary Charan Singh airport is 30 minutes from Qaiserbagh. Our family will meet you at arrivals and at Charbagh station, and cars run between the hotel and every function.",
      rsvpBy: "2027-01-25",
      contacts: [
        { name: "Faizan Siddiqui", relation: "Zoya's brother", phone: "+91 90000 00001" },
        { name: "Mehreen Qureshi", relation: "Ayaan's sister", phone: "+91 90000 00002" },
      ],
    },
  },
  copy: {
    letterPlaceholder: "With the blessings of Allah, Zoya and Ayaan request the honour of your presence at their Nikah…",
    endLinePlaceholder: "With love and duas, the Siddiqui & Qureshi families",
    sheetTitle: "Your Nikah invitation",
    storyTitle: "Describe your wedding 🌙",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Nikah 🌙 You're invited", accent: "#4F6B4C" },
});
