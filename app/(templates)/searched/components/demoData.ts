// ─── Searched — demo content and the wire body ───────────────────────────────

import { DEMO_PHOTO_CDN } from "../../_love/types";
import { groupIndian, type SearchData } from "./types";

const P = DEMO_PHOTO_CDN;

export const DEMO_LETTER = `Meera,

I searched for you once, before I even knew your last name. "Girl, yellow scarf, momo stall, Hazratganj, laughs like a pressure cooker." Zero results. Turns out some things you only find by showing up.

So I've been collecting the results myself. The way you say "suno" before every terrible idea. The 2 AM voice notes that start with "okay don't laugh". The eleven momos. Your mom pretending she doesn't like me, and then asking if I've eaten.

If anyone ever indexed you properly — every Tuesday, every hoodie you've stolen, every time you fell asleep 35 minutes into a movie — the whole first page would still miss the point. The point is that I'm lucky. Every search, every single day.

So here's the only result that matters: I love you. Not in a 0.42 seconds way. In an about-forever-results way.

Come here. And yes, you were right. I wasn't going to eat that.`;

export const DEMO_DATA: SearchData = {
  sender: { name: "Arjun" },
  recipient: { name: "Meera Verma" },
  doodleTitle: "Celebrating 3 years of Meera & Arjun",
  autocomplete: [
    "Meera Verma why is she this cute",
    "Meera Verma laugh ringtone download",
    "Meera Verma stole my hoodie again",
    "Meera Verma how to keep her forever",
    "Meera Verma reviews 5 stars",
    "Meera Verma near me (please)",
  ],
  didYouMean: "Arjun's favourite person",
  resultCount: groupIndian(847000),
  searchSeconds: "0.42",
  aiOverview:
    "Meera Verma is a 5'3\" certified menace from Lucknow, best known for stealing hoodies, finishing Arjun's fries and laughing at her own jokes before the punchline. Sources widely agree she is the best thing to happen to Arjun since 2022 — a claim he has never once disputed.\n\nShe is currently in a relationship with Arjun, who has searched her name 4,012 times and still gets butterflies every single time.",
  aiPoints: [
    "Known for: a laugh you can hear from the next flat",
    "Love language: sending reels at 2 AM with zero context",
    "Weakness: golden retrievers, momos, being called cute",
    "Status: taken — aggressively, by Arjun",
  ],
  knowledgePanel: {
    subtitle: "Arjun's favourite human",
    description:
      "Meera Verma is a Lucknow-born menace, part-time philosopher and full-time hoodie thief. She is widely considered the reason Arjun smiles at his phone in public, and the only person alive who can win an argument she started by accident.",
    facts: [
      { label: "Born", value: "14 March, a Wednesday (allegedly)" },
      { label: "Height", value: "5′3″ (5′5″ in her head)" },
      { label: "Hometown", value: "Lucknow, Uttar Pradesh" },
      { label: "Partner", value: "Arjun (since 2022, locked in)" },
      { label: "Known for", value: "Winning arguments she started" },
      { label: "Screen time", value: "9 hrs a day, mostly sending Arjun reels" },
    ],
    alsoSearchFor: [
      "Arjun — the boyfriend",
      "Momos — her first love",
      "Bruno — a dog she met once",
      "Her mom — the real boss",
      "Chai — non-negotiable",
    ],
  },
  reviews: [
    { author: "Arjun", stars: 5, text: "10/10 would fall for her again. Steals fries, returns love with interest.", when: "a week ago" },
    { author: "Her mom", stars: 5, text: "Calls me every day. Tells Arjun I said hi. I did not say hi.", when: "2 months ago" },
    { author: "Bruno (a dog)", stars: 5, text: "She stopped the scooter to pet me. We are in a situationship now.", when: "3 weeks ago" },
    { author: "Sharma Ji Momos", stars: 4, text: "Loyal customer. Minus one star for saying 'just one more' nine times.", when: "a year ago" },
  ],
  results: [
    {
      id: "r1",
      site: "Unencyclopedia",
      url: "unencyclopedia.in › wiki › Meera_Verma",
      title: "Meera Verma — The Free Encyclopedia (unverified)",
      snippet:
        "Meera Verma (born 14 March) is an Indian menace best known for winning arguments she started, stealing hoodies, and making Arjun forget what he was saying mid-sentence.",
    },
    {
      id: "r2",
      site: "Arjun's Notes",
      url: "notes.arjun › drafts › about-her",
      title: "Things I love about Meera (draft #47, never finished)",
      date: "2 days ago",
      snippet:
        "1. the way she says 'suno' before every bad idea. 2. her 2 AM voice notes. 3. she remembers my chai order better than I do. 4. the list keeps getting longer…",
    },
    {
      id: "r3",
      site: "Ask the Aunties",
      url: "asktheaunties.in › threads › 4417",
      title: "Is Meera the reason Arjun keeps smiling at his phone? — 212 replies",
      snippet: "Top answer: “Yes beta, we have all seen the wallpaper.” Second answer: “Wedding kab hai?” Thread locked by moderator (Meera's mom).",
    },
    {
      id: "r4",
      site: "The Daily Blush",
      url: "dailyblush.in › local › momo-incident",
      title: "Local woman finishes boyfriend's momos, says “he wasn't going to eat them”",
      date: "Mar 14, 2026",
      snippet: "Witnesses confirm he was, in fact, going to eat them. He has since forgiven her, as he does every single time.",
    },
    {
      id: "r5",
      site: "Complaints Dept.",
      url: "complaints.arjun › open-tickets",
      title: "Open complaints against Meera Verma (0 resolved, 0 regretted)",
      snippet:
        "Ticket #1: steals the blanket. Ticket #2: “five more minutes” at 6 AM. Ticket #3: too cute to stay mad at. Status: closed — complainant fell in love again.",
    },
    {
      id: "r6",
      site: "Our Playlist",
      url: "playlist.us › for-meera",
      title: "songs that sound like you — 47 songs, 3 hr 12 min",
      snippet: "Curated by Arjun. Every song made him think of Meera. Yes, even the sad ones. Especially the sad ones.",
    },
  ],
  paa: [
    {
      question: "Is Meera Verma actually that funny or does Arjun just like her?",
      answer:
        "Both, and they are not separable. She laughs at her own jokes before the punchline, which makes everyone else laugh, which makes her funnier. It compounds. Independent testing (Arjun) confirms it.",
      source: "arjun.exe › feelings",
    },
    {
      question: "Why does Meera Verma fall asleep during every movie?",
      answer:
        "Approximately 35 minutes in, regardless of genre. She wakes up for the last four minutes and asks one question that proves she somehow understood the entire plot.",
      source: "movie-nights.log › 2026",
    },
    {
      question: "How do I make Meera Verma reply faster?",
      answer:
        "You don't. She reads it, writes the reply in her head, considers it sent, and moves on with her day. The reply arrives on Thursday. It is always worth it.",
      source: "asktheaunties.in › threads",
    },
    {
      question: "Does Meera Verma know how pretty she is?",
      answer: "No. Every attempt to inform her ends with “shut up” followed by a smile she thinks nobody saw. Arjun saw.",
      source: "notes.arjun › drafts",
    },
    {
      question: "Is it normal to think about Meera Verma this much?",
      answer: "No. Sources indicate the healthy figure is considerably lower. No corrective action is planned.",
      source: "arjun.exe › feelings",
    },
    {
      question: "Should Meera click “I'm Feeling Lucky”?",
      answer: "Yes. There's a letter waiting at the very top of the results, and it has been waiting a while.",
      source: "arjun.exe › letters",
    },
  ],
  topStories: [
    { source: "The Daily Blush", time: "2 hours ago", title: "Woman steals boyfriend's hoodie for 47th time; boyfriend “honestly flattered”" },
    { source: "Lucknow Live", time: "5 hours ago", title: "Couple spends 40 minutes deciding where to eat, orders momos again" },
    { source: "Heartbeat News", time: "1 day ago", title: "Scientists confirm Meera's laugh can be heard from the next flat" },
    { source: "The Weekly Crush", time: "3 days ago", title: "“She's the one,” man tells group chat for the 900th time" },
  ],
  videos: [
    { channel: "Arjun's Camera Roll", duration: "0:47", title: "Meera trying to parallel park (47 attempts, 1 success)" },
    { channel: "Us, Unfiltered", duration: "2:13", title: "Meera laughing at her own joke for 2 minutes straight" },
    { channel: "Us, Unfiltered", duration: "3:08", title: "Our first trip — the shaky, beautiful director's cut" },
  ],
  places: [
    { name: "Sharma Ji Momos", kind: "Momo stall · Hazratganj", rating: "4.9", note: "First date. She ate 11. I paid for 12." },
    { name: "Marine Drive", kind: "Promenade · Mumbai", rating: "5.0", note: "Where she said “okay fine, I like you too”." },
    { name: "Café Ek Aur Chai", kind: "Café · Gomti Nagar", rating: "4.8", note: "Our table by the window. We still sit there." },
    { name: "Her doorstep", kind: "Home · 11:58 PM", rating: "5.0", note: "Forty minutes of “okay bye” every single night." },
  ],
  relatedSearches: [
    "meera verma height",
    "meera verma net worth (priceless)",
    "is meera verma single (no)",
    "meera verma and arjun",
    "meera verma laugh",
    "meera verma birthday",
    "meera verma favourite food",
    "how to deserve meera verma",
  ],
  photos: [
    { url: `${P}/couple1.webp`, caption: "the first sunset", note: "You said the sky looked like mango lassi. I have not stopped thinking about it.", cropX: 50, cropY: 45, scale: 100 },
    { url: `${P}/couple2.webp`, caption: "date night, round 1", note: "You stole my fries and then my heart. In that order.", cropX: 50, cropY: 40, scale: 100 },
    { url: `${P}/couple3.webp`, caption: "cherry blossom era", note: "Even the trees were jealous of your smile that day.", cropX: 50, cropY: 50, scale: 100 },
    { url: `${P}/couple4.webp`, caption: "us, forever", note: "Out of every timeline, I'd pick this one. Every time.", cropX: 50, cropY: 50, scale: 100 },
    { url: `${P}/couple1.webp`, caption: "golden hour, again", note: "I wasn't looking at the sunset. Obviously.", cropX: 30, cropY: 55, scale: 150 },
    { url: `${P}/couple3.webp`, caption: "wallpaper since day 3", note: "This has been my lock screen for 700 days. My mom knows. My boss knows. Now you know.", cropX: 60, cropY: 40, scale: 140 },
  ],
  letter: DEMO_LETTER,
  lockQuestion: "Do you accept all of Arjun's love (and cookies)?",
  lockAnswer: "Accept all 💗",
};

/** UI state → the body the API stores. */
export function searchedDataToBody(d: SearchData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {
    sender: { name: d.sender.name },
    recipient: { name: d.recipient.name },
    doodleTitle: d.doodleTitle,
    autocomplete: d.autocomplete,
    didYouMean: d.didYouMean,
    resultCount: d.resultCount,
    searchSeconds: d.searchSeconds,
    aiOverview: d.aiOverview,
    aiPoints: d.aiPoints,
    knowledgePanel: d.knowledgePanel,
    reviews: d.reviews,
    results: d.results,
    paa: d.paa,
    topStories: d.topStories,
    videos: d.videos,
    places: d.places,
    relatedSearches: d.relatedSearches,
    photos: d.photos,
    letter: d.letter,
    lockQuestion: d.lockQuestion,
    lockAnswer: d.lockAnswer,
  };
  if (password !== undefined) body.password = password;
  return body;
}
