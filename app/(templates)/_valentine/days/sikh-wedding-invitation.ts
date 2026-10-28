// ─── Anand Karaj Wedding Invitation ☬ (wedding tier, same limits as Royal) ───
//
// A Sikh wedding suite in ivory and gold: the arch over Sri Guru Granth Sahib
// Ji with the Khanda, Ik Onkar in gold foil, the Golden Temple, peach peonies.
// English + Punjabi (Gurmukhi). Functions from the Roka to the Laavan and the
// Doli. Shared engine: app/(templates)/_faith (profile: _faith/faiths/sikh.ts).
//
// Server twin: server/src/config/weddingDays/sikh-wedding-invitation.ts; keys
// and limits must match (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-28). Din Shagna Da — a Punjabi bride's entry — plays by default. */
export const SIKH_SONGS: readonly SongSuggestion[] = [
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome: ivory paper, saffron-gold ink. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFBF2 0%, #F8F0DF 60%, #F1E5CC 100%)",
  base: "#FAF4E6",
  paper: "#FFFDF7",
  glass: "rgba(255,253,247,.84)",
  ink: "#3A2A16",
  inkSoft: "#7A6648",
  paperInk: "#3A2A16",
  accent: "#B07A1F",
  accentDeep: "#8A5A12",
  accentInk: "#FFF9EE",
  soft: "#F6EBD3",
  edge: "#E8D6B0",
  gold: "#B8924A",
  dark: false,
  particles: ["🌼", "✨", "🤍"],
  confetti: ["#B8924A", "#E9CF9A", "#F1B89E", "#FFF3E0"],
};

export const SIKH_DEMO_EVENTS: WeddingEvent[] = [
  { id: "roka", title: "Roka & Kurmai", date: "2027-02-14", time: "11:00", endTime: "14:00", venue: "The Kaur residence", address: "Model Town, Ludhiana", mapUrl: "", dressCode: "Soft pastels", dressColor: "#F1B89E", note: "An intimate morning: ardas, a red chunni for Simran, shagun from the elders and a family lunch." },
  { id: "path", title: "Sri Akhand Path Sahib", date: "2027-02-17", time: "10:00", endTime: "13:00", venue: "Gurdwara Singh Sabha", address: "Model Town Extension, Ludhiana", mapUrl: "", dressCode: "Modest, heads covered", dressColor: "#F1E6D6", note: "The bhog of the Akhand Path, kirtan and ardas for the couple, followed by langar." },
  { id: "maiyan", title: "Maiyan & Mehndi", date: "2027-02-18", time: "16:00", endTime: "21:00", venue: "The Orchard Lawns", address: "Ferozepur Road, Ludhiana", mapUrl: "", dressCode: "Yellows and greens", dressColor: "#F2C94C", note: "Vatna for the bride and the groom in the afternoon, then henna, boliyan and a dholki under the fairy lights." },
  { id: "jaggo", title: "Jaggo", date: "2027-02-18", time: "21:30", endTime: "23:59", venue: "The Kaur residence", address: "Model Town, Ludhiana", mapUrl: "", dressCode: "Phulkari and bright suits", dressColor: "#EE9A5E", note: "The gaggar of lamps, gidha and boliyan down the lane. Wake the neighbourhood with us!" },
  { id: "anand-karaj", title: "Anand Karaj", date: "2027-02-20", time: "09:30", endTime: "13:30", venue: "Gurdwara Singh Sabha", address: "Model Town Extension, Ludhiana, Punjab", mapUrl: "", dressCode: "Traditional; heads covered", dressColor: "#F3D9A4", note: "Milni at 9:30 am, Asa di Vaar, then the four Laavan around Sri Guru Granth Sahib Ji. Langar follows; the Doli leaves at 3 pm. Rumals at the door; shoes off inside." },
  { id: "reception", title: "Reception", date: "2027-02-20", time: "19:30", endTime: "23:30", venue: "The Grand Orchard", address: "Ferozepur Road, Ludhiana", mapUrl: "", dressCode: "Black tie, a touch of gold", dressColor: "#2A2622", note: "Dinner, bhangra and the newlyweds' first dance." },
];

export const sikhWeddingDay = makeFaithDay({
  slug: "sikh-wedding-invitation",
  title: "Anand Karaj Wedding Invitation",
  local: { code: "pa", label: "ਪੰਜਾਬੀ" },
  theme: THEME,
  songs: SIKH_SONGS,
  songsNote: "Punjabi wedding favourites and a few English ones · or paste any YouTube link (a Laavan kirtan, your own song)",
  defaultSong: "1LVpuWpRs3I",
  emojiNav: { names: "🌼", details: "🪔" },
  demo: {
    gallery: [
      ["rw-03", "Chooda", "wide"], ["rw-11", "Mehndi"], ["rw-01", "The bride"], ["rw-14"], ["rw-04"], ["rw-13", "Maiyan"],
      ["rw-15"], ["rw-07", "First dance"], ["rw-12"], ["rw-08"], ["rw-02"], ["rw-10-sangeet", "Jaggo night"],
    ],
    bride: "Simran",
    groom: "Harjot",
    letter:
      "With the blessings of Waheguru and our elders, Simran and Harjot joyfully invite you to their Anand Karaj.\n\nA week of ardas and kirtan, haldi-yellow afternoons, a Jaggo that will keep the lane awake, and the four Laavan around Sri Guru Granth Sahib Ji. It would not be complete without you.",
    localMessage:
      "ਵਾਹਿਗੁਰੂ ਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਅਤੇ ਵੱਡਿਆਂ ਦੇ ਅਸ਼ੀਰਵਾਦ ਨਾਲ, ਸਿਮਰਨ ਅਤੇ ਹਰਜੋਤ ਦੇ ਅਨੰਦ ਕਾਰਜ ਦੇ ਸ਼ੁਭ ਮੌਕੇ 'ਤੇ ਆਪ ਜੀ ਨੂੰ ਪਰਿਵਾਰ ਸਮੇਤ ਸਾਦਰ ਸੱਦਾ ਹੈ। ਆਪ ਜੀ ਦੀ ਹਾਜ਼ਰੀ ਸਾਡੇ ਲਈ ਅਸੀਸ ਹੋਵੇਗੀ।",
    endLine: "With love, the Sandhu & Gill families",
    events: SIKH_DEMO_EVENTS,
    extras: {
      brideFamily: "S. Kulwant Singh & Sardarni Harpreet Kaur Sandhu",
      groomFamily: "S. Manjit Singh & Sardarni Rajinder Kaur Gill",
      brideNote: "Ludhiana",
      groomNote: "Amritsar",
      blessingsOf: "S. Gurdial Singh Sandhu & Sardarni Amarjit Kaur",
      muhurat: "Laavan at 11:00 am",
      hashtag: "#SimranHarjotDiShaadi",
      story: [
        { when: "2019", title: "A langar line in Amritsar", line: "Gurpurab at Sri Harmandir Sahib. He passed her a pinni in the langar line and spent the rest of the evening looking for her.", photo: 0 },
        { when: "2022", title: "Lohri at the farm", line: "Two families, one bonfire and a dhol player who would not stop. Our parents met before we admitted anything.", photo: 0 },
        { when: "2025", title: "The question by the sarovar", line: "At sunrise by the water, he asked her family first, then her. She said yes before he finished.", photo: 17 },
        { when: "2027", title: "Four Laavan", line: "Now we walk the four Laavan together. Come and bless us.", photo: 18 },
      ],
      things: [
        "At the Gurdwara: Please cover your head (rumals are provided), remove your shoes and avoid alcohol and tobacco on the premises.",
        "Stay: Rooms are held at The Grand Orchard from 17 to 21 Feb. Just tell us your dates.",
        "Weather: Ludhiana is cold in February; bring a shawl for the Jaggo night.",
        "Getting around: Shuttles run between the hotel, the Gurdwara and the Orchard all day on the 20th.",
      ],
      gettingThere: "Ludhiana is 3 hours from Delhi on the Shatabdi; Sahnewal airport and Chandigarh airport are close. Our family will meet you at the station, and shuttles run between the hotel, the Gurdwara and The Grand Orchard.",
      rsvpBy: "2027-01-20",
      contacts: [
        { name: "Jaspreet Sandhu", relation: "Simran's brother", phone: "+91 90000 00001" },
        { name: "Navneet Gill", relation: "Harjot's sister", phone: "+91 90000 00002" },
      ],
    },
  },
  copy: {
    letterPlaceholder: "With the blessings of Waheguru, Simran and Harjot joyfully invite you to their Anand Karaj…",
    endLinePlaceholder: "With love, the Sandhu & Gill families",
    sheetTitle: "Your Anand Karaj invitation",
    storyTitle: "Describe your wedding 🌼",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Anand Karaj 🌼 You're invited", accent: "#B07A1F" },
});
