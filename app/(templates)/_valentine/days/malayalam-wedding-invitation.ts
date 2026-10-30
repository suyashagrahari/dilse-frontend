// ─── Kerala Kalyanam Wedding Invitation 🪷 (wedding tier, same limits as Royal) ─
//
// A Malayalam wedding suite: Marianne North's Beypore estuary, Malabar (c. 1878, public domain) behind an ivory card with a Malayalam
// textile border, the invocation in gold, jasmine, banana plants and a marigold toran.
// English + Malayalam (മലയാളം). Shared engine: app/(templates)/_faith (profile: _faith/faiths/malayalam.ts).
//
// Server twin: server/src/config/weddingDays/malayalam-wedding-invitation.ts; keys and limits must match
// (valentineDays.test.ts pins them). Light themes only.

import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { WeddingEvent } from "../../_wedding/types";
import { makeFaithDay } from "../../_faith/day";

/** Verified YouTube uploads (oEmbed 200, 2026-10-30). */
export const MALAYALAM_SONGS: readonly SongSuggestion[] = [{"id": "WS4Mev_vRAc", "title": "Maangalyam", "artist": "Gopi Sundar · Bangalore Days"}, {"id": "509NqwF7I30", "title": "Mangala Vadyam (Nadaswaram & Thavil)", "artist": "Carnatic instrumental"}, {"id": "ftIPUowtX2Q", "title": "Pottu Thotta Pournami", "artist": "Hesham Abdul Wahab · Hridayam"}, {"id": "peDoCbZDaJw", "title": "Kalyaanakacheri", "artist": "M. Jayachandran · Madambi"}, {"id": "1sinydrAhVA", "title": "Melle Melle Mukhapadam", "artist": "K. J. Yesudas · Johnson"}, {"id": "epAFDEJImrU", "title": "Darshana", "artist": "Hesham Abdul Wahab · Hridayam"}, {"id": "VrrnflVEiMg", "title": "Thiruvaavaniraavu", "artist": "Shaan Rahman · Jacobinte Swargarajyam"}, {"id": "cZbSt1CGyEo", "title": "Panchavadyam", "artist": "Kerala temple ensemble"}];

/** The editor chrome. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFCF4 0%, #F7F1E2 60%, #EFE6CC 100%)",
  base: "#FBF7EC",
  paper: "#FFFDF8",
  glass: "rgba(255,252,246,.84)",
  ink: "#2E2614",
  inkSoft: "#6E6448",
  paperInk: "#2E2614",
  accent: "#2F6B3A",
  accentDeep: "#245430",
  accentInk: "#FBFBF2",
  soft: "#EEF0DF",
  edge: "#DCD9BC",
  gold: "#B8924A",
  dark: false,
  particles: ["🪷", "✨", "🤍"],
  confetti: ["#B8862F", "#E9CF9A", "#2F6B3A", "#FFFFFF"],
};

export const MALAYALAM_DEMO_EVENTS: WeddingEvent[] = [{"id": "nischayam", "title": "Vivaha Nischayam", "date": "2027-02-07", "time": "11:00", "endTime": "13:30", "venue": "Lakshmi Nivas", "address": "Poonkunnam, Thrissur, Kerala", "mapUrl": "", "dressCode": "Kerala silk and kasavu, soft pastels", "dressColor": "#E9C9A0", "note": "An intimate morning at the bride's home: the jathakam is read, the muhurtham is announced before the elders, and rings are exchanged. Lunch follows."}, {"id": "mylanchi", "title": "Mehendi (Mylanchi)", "date": "2027-02-19", "time": "17:00", "endTime": "21:30", "venue": "Lakshmi Nivas", "address": "Poonkunnam, Thrissur, Kerala", "mapUrl": "", "dressCode": "Greens and kasavu with colour", "dressColor": "#7FA36B", "note": "Henna for the bride and anyone who asks, thiruvathira songs in the courtyard and kappa with fish curry for supper."}, {"id": "ayaniyoonu", "title": "Ayaniyoonu", "date": "2027-02-20", "time": "19:00", "endTime": "22:30", "venue": "Sreevalsam Auditorium", "address": "East Nada, Guruvayur, Thrissur, Kerala", "mapUrl": "", "dressCode": "Kerala festive: set-mundu, mundu and shirt", "dressColor": "#D8B26A", "note": "The eve-of-wedding feast for the whole family, with a chenda melam to welcome the groom's party to Guruvayur."}, {"id": "thalikettu", "title": "Thalikettu", "date": "2027-02-21", "time": "10:30", "endTime": "11:15", "venue": "Sree Krishna Temple, Guruvayur", "address": "Kalyana Mandapam, East Nada, Guruvayur, Thrissur, Kerala", "mapUrl": "", "dressCode": "Traditional: kasavu saree / set-mundu, kasavu mundu & melmun", "dressColor": "#F3E7C9", "note": "Dakshina at home at 7:30 am. At the muhurtham, garlands, the thali, the pudava and the kanyadanam on the mandapam before the east nada, then the couple walk around the nilavilakku. Please be seated by"}, {"id": "sadya", "title": "Kalyana Sadya", "date": "2027-02-21", "time": "11:45", "endTime": "14:30", "venue": "Sreevalsam Auditorium", "address": "East Nada, Guruvayur, Thrissur, Kerala", "mapUrl": "", "dressCode": "As for the Thalikettu", "dressColor": "#6E9A3C", "note": "Twenty-six dishes on the banana leaf, from inji curry to ada pradhaman and palada. Meet the couple on the stage before you sit down."}, {"id": "grihapravesham", "title": "Grihapravesham", "date": "2027-02-21", "time": "17:30", "endTime": "18:30", "venue": "Panchami", "address": "Panampilly Nagar, Kochi, Kerala", "mapUrl": "", "dressCode": "Kerala silk", "dressColor": "#C98B3A", "note": "Meera enters her new home with the nilavilakku, right foot first. Close family only, with tea after."}, {"id": "reception", "title": "Reception", "date": "2027-02-22", "time": "19:00", "endTime": "22:30", "venue": "Bolgatty Palace Lawns", "address": "Mulavukad, Kochi, Kerala", "mapUrl": "", "dressCode": "Evening formal: silk sarees, bandhgala or suits", "dressColor": "#1F4A44", "note": "Dinner by the backwaters, a live band and the newlyweds' first dance under the palms."}];

export const malayalamWeddingDay = makeFaithDay({
  slug: "malayalam-wedding-invitation",
  title: "Kerala Kalyanam Wedding Invitation",
  local: { code: "ml", label: "മലയാളം" },
  theme: THEME,
  songs: MALAYALAM_SONGS,
  songsNote: "Malayalam wedding songs and mangala vadyam · or paste any YouTube link",
  defaultSong: "WS4Mev_vRAc",
  emojiNav: { names: "🪷", details: "🪔" },
  demo: {
    gallery: [["rw-03", "The bride", "wide"], ["rw-11", "Mehendi"], ["rw-01"], ["rw-14"], ["rw-04"], ["rw-13", "Haldi"], ["rw-15"], ["rw-07", "Reception"], ["rw-12"], ["rw-08"], ["rw-02"], ["rw-10-sangeet", "Sangeet night"]],
    bride: "Meera",
    groom: "Arjun",
    letter: "With the blessings of Sree Guruvayurappan and our elders, Meera and Arjun joyfully invite you to their Thalikettu at Guruvayur.\n\nA week of jasmine and kasavu: a Mylanchi evening, an Ayaniyoonu under the coconut palms, the thali tied at the muhurtham to the sound of the nadaswaram, and a sadya on banana leaves. It would not be complete without you.",
    localMessage: "ശ്രീ ഗുരുവായൂരപ്പന്റെ അനുഗ്രഹത്താൽ, തൃശ്ശൂർ പൂങ്കുന്നം ലക്ഷ്മീനിവാസിൽ ശ്രീ രാമചന്ദ്രൻ നായരുടെയും ശ്രീമതി ലക്ഷ്മി രാമചന്ദ്രന്റെയും മകൾ മീരയും, എറണാകുളം പനമ്പിള്ളി നഗർ പഞ്ചമിയിൽ ശ്രീ ഗോപകുമാർ മേനോന്റെയും ശ്രീമതി ശ്രീദേവി ഗോപകുമാറിന്റെയും മകൻ അർജുനും തമ്മിലുള്ള വിവാഹം 2027 ഫെബ്രുവരി 21 ഞായറാഴ്ച രാവിലെ 10.30-നും 11.15-നും മദ്ധ്യേയുള്ള ശുഭമുഹൂർത്തത്തിൽ ഗുരുവായൂർ ശ്രീകൃഷ്ണക്ഷേത്രസന്നിധിയിൽ വെച്ച് നടത്തുവാൻ നിശ്ചയിച്ചിരിക്കുന്നു. താങ്കളുടെ മഹനീയ സാന്നിദ്ധ്യം കുടുംബസമേതം ഉണ്ടാകണമെന്ന് സവിനയം അഭ്യർത്ഥിക്കുന്നു.",
    endLine: "With love, the Nair & Menon families",
    events: MALAYALAM_DEMO_EVENTS,
    extras: {"brideFamily": "Sri K. Ramachandran Nair & Smt. Lakshmi Ramachandran", "groomFamily": "Sri P. Gopakumar Menon & Smt. Sreedevi Gopakumar", "brideNote": "Thrissur", "groomNote": "Kochi", "blessingsOf": "Sri K. Madhavan Nair & Smt. Kalyanikutty Amma", "muhurat": "Muhurtham 10:30–11:15 am", "hashtag": "#MeeraArjunKalyanam", "story": [{"when": "2018", "title": "Pooram, in the crowd", "line": "Thrissur Pooram, the Kudamattam at its height. He was meant to be watching the umbrellas, and found himself watching her instead.", "photo": 0}, {"when": "2021", "title": "An Onam sadya", "line": "Two families, one long banana leaf, and an argument over which payasam was best. Our mothers agreed before we admitted anything.", "photo": 0}, {"when": "2025", "title": "The question on the backwaters", "line": "On a kettuvallam at dusk near Kumarakom, he asked her parents first, then her. She said yes before the lamps were lit.", "photo": 17}, {"when": "2027", "title": "The thali at Guruvayur", "line": "Now the thali and the pudava, before Guruvayurappan. Come and bless us.", "photo": 18}], "things": ["At the temple: Only Hindus may enter the Guruvayur nalambalam. Men wear a mundu (no shirt inside), women a saree or set-mundu. The Thalikettu is on the mandapam outside the east na", "Muhurtham: Weddings at Guruvayur run to a strict slot of a few minutes. Please be at the east nada by 10:00 am.", "Stay: Rooms are held at Hotel Sreevalsam, Guruvayur, from 20 to 22 Feb. Just tell us your dates.", "Sadya: Served on banana leaves and eaten by hand. Tell us in your RSVP if you'd prefer cutlery or have allergies."], "gettingThere": "Guruvayur is 30 km from Thrissur railway station and about 80 km (2 hours) from Cochin International Airport; Guruvayur station has direct trains from Ernakulam. Our family will meet you at the airport and station, and cars run between the hotel, the temple and the auditorium on the 21st. For the reception, Bolgatty Palace is 20 minutes from Ernakulam Junction.", "rsvpBy": "2027-01-24", "contacts": [{"name": "Vishnu Ramachandran", "relation": "Meera's brother", "phone": "+91 90000 00001"}, {"name": "Anjali Menon", "relation": "Arjun's sister", "phone": "+91 90000 00002"}]},
  },
  copy: {
    letterPlaceholder: "With the blessings of Sree Guruvayurappan, Meera and Arjun joyfully invite you to their Thalikettu…",
    endLinePlaceholder: "With love, the Nair & Menon families",
    sheetTitle: "Your Kerala wedding invitation",
    storyTitle: "Describe your wedding 🪔",
    publishing: "Getting your invitation ready…",
  },
  share: { title: "Our Kerala Kalyanam 🪷 You're invited", accent: "#2F6B3A" },
});
