// ─── Holy Matrimony Wedding Invitation ✝ (wedding tier, same limits as Royal) ─
//
// A Christian church-wedding suite in ivory, sage and gold: a carved chapel
// arch crowned with white lilies, the cross in gold, white roses, doves and a
// Bible verse. English only. The engagement, the bridal shower, the rehearsal
// dinner, the Holy Matrimony and the reception. Shared engine:
// app/(templates)/_faith (profile: _faith/faiths/christian.ts).
//
// Server twin: server/src/config/weddingDays/christian-wedding-invitation.ts;
// keys and limits must match (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-28). Canon in D — the classic walk down the aisle — plays by default. */
export const CHRISTIAN_SONGS: readonly SongSuggestion[] = [
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
];

/** The editor chrome: ivory paper, sage ink, gold. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FCFCF8 0%, #F3F4EE 60%, #E9ECE3 100%)",
  base: "#F6F7F2",
  paper: "#FFFFFC",
  glass: "rgba(255,255,252,.86)",
  ink: "#2F322C",
  inkSoft: "#6B7064",
  paperInk: "#2F322C",
  accent: "#6F7F69",
  accentDeep: "#4E5D49",
  accentInk: "#FCFDF8",
  soft: "#EDEFE6",
  edge: "#D9DDCF",
  gold: "#B8924A",
  dark: false,
  particles: ["🕊️", "🤍", "✨"],
  confetti: ["#B8924A", "#E9CF9A", "#C9D3C2", "#FFFFFF"],
};

export const CHRISTIAN_DEMO_EVENTS: WeddingEvent[] = [
  { id: "engagement", title: "Engagement", date: "2027-01-24", time: "17:00", endTime: "20:00", venue: "Church of Our Lady of Hope", address: "Princess Street, Fort Kochi", mapUrl: "", dressCode: "Soft pastels", dressColor: "#E7B9B5", note: "The betrothal blessing after the evening Mass, then dinner with both families." },
  { id: "shower", title: "Bridal Shower", date: "2027-02-13", time: "15:00", endTime: "18:00", venue: "The Garden Café", address: "Panampilly Nagar, Kochi", mapUrl: "", dressCode: "Florals and whites", dressColor: "#F1E6D6", note: "Tea, cake and a great deal of advice for the bride." },
  { id: "rehearsal", title: "Rehearsal Dinner", date: "2027-02-19", time: "19:00", endTime: "22:00", venue: "The Harbour House", address: "Calvetty Road, Fort Kochi", mapUrl: "", dressCode: "Smart casual", dressColor: "#6F8FC2", note: "For the wedding party and both families: one last practice, then dinner by the water." },
  { id: "holy-matrimony", title: "Holy Matrimony", date: "2027-02-20", time: "15:30", endTime: "17:00", venue: "Church of Our Lady of Hope", address: "Princess Street, Fort Kochi, Kerala", mapUrl: "", dressCode: "Ivory, sage and soft pastels", dressColor: "#E4EADF", note: "The Nuptial Mass begins at 3:30 pm. Kindly be seated by 3:15 pm." },
  { id: "reception", title: "Reception", date: "2027-02-20", time: "19:00", endTime: "23:30", venue: "The Lily Ballroom", address: "Marine Drive, Kochi", mapUrl: "", dressCode: "Black tie", dressColor: "#2A2622", note: "Dinner, toasts, the cake and the first dance." },
];

export const christianWeddingDay = makeFaithDay({
  slug: "christian-wedding-invitation",
  title: "Holy Matrimony Wedding Invitation",
  local: null,
  theme: THEME,
  songs: CHRISTIAN_SONGS,
  songsNote: "Classic walk-down-the-aisle pieces and love songs · or paste any YouTube link (your church choir, a hymn)",
  defaultSong: "Ptk_1Dc2iPY",
  emojiNav: { names: "🕊️", details: "⛪" },
  demo: {
    gallery: [
      ["rw-02", "Down the aisle", "wide"], ["rw-12", "The rings"], ["rw-08"], ["rw-07", "First dance"], ["rw-10-sangeet", "The reception"],
    ],
    bride: "Anna",
    groom: "Daniel",
    letter:
      "By the grace of God and with joy in our hearts, Anna and Daniel request the honour of your presence as they are united in Holy Matrimony.\n\nThe Nuptial Mass will be followed by a reception by the sea. We would love to celebrate this blessing with you.",
    endLine: "With love, the Mathew & Fernandes families",
    events: CHRISTIAN_DEMO_EVENTS,
    extras: {
      brideFamily: "Mrs. Susan & Mr. Thomas Mathew",
      groomFamily: "Mrs. Lydia & Mr. Peter Fernandes",
      brideNote: "Kochi",
      groomNote: "Goa",
      blessingsOf: "Mrs. Mary & Late Mr. Joseph Mathew",
      muhurat: "Kindly be seated by 3:15 pm",
      hashtag: "#AnnaAndDaniel",
      story: [
        { when: "2018", title: "The choir loft", line: "Christmas carols at St. Francis. She sang alto; he sang everything slightly too loud.", photo: 0 },
        { when: "2021", title: "Sunday lunches", line: "Appam and stew at her grandmother's table became a standing invitation, then a tradition.", photo: 0 },
        { when: "2025", title: "A ring at the lighthouse", line: "At sunset on the Fort Kochi beach, he asked; she said yes before he found the ring.", photo: 17 },
        { when: "2027", title: "Two become one", line: "Now we make our vows before God and all of you. Come and celebrate with us.", photo: 18 },
      ],
      things: [
        "At the church: The Mass lasts about an hour; please silence your phones and keep photos to the reception.",
        "Stay: Rooms are held at The Harbour House from 18 to 21 Feb. Just tell us your dates.",
        "Weather: Kochi is warm in February; light fabrics are best.",
        "Getting around: A shuttle runs from the church to the reception at 6:30 pm.",
      ],
      gettingThere: "Cochin International Airport is an hour from Fort Kochi; Ernakulam Junction is 30 minutes away. Our family will meet you at arrivals, and a shuttle runs between the hotel, the church and the reception.",
      rsvpBy: "2027-01-20",
      contacts: [
        { name: "Rachel Mathew", relation: "Anna's sister", phone: "+91 90000 00001" },
        { name: "Joel Fernandes", relation: "Daniel's brother", phone: "+91 90000 00002" },
      ],
    },
  },
  copy: {
    letterPlaceholder: "By the grace of God, Anna and Daniel request the honour of your presence at their Holy Matrimony…",
    endLinePlaceholder: "With love, the Mathew & Fernandes families",
    sheetTitle: "Your Holy Matrimony invitation",
    storyTitle: "Describe your wedding 🕊️",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Holy Matrimony 🕊️ You're invited", accent: "#6F7F69" },
});
