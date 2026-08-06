// ─── Searched — demo content, wire mapping and small pure helpers ────────────
//
// The frozen contract (./types) owns the shape, the palette, the timings and
// every string of interface copy. This file owns the *content* that fills it, the
// coercion to and from the API, and the handful of pure functions the UI needs
// that are not interface copy (snippet parsing, name retargeting).
//
// Nothing here decorates. If a value here makes the page prettier rather than
// funnier, it is in the wrong file.

import { bodyFromKeys } from "@/lib/wire";
import {
  groupIndian,
  type FakePage,
  type KnowledgeFact,
  type KnowledgePanel,
  type PaaItem,
  type SearchData,
  type SearchResult,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Pure helpers
// ═══════════════════════════════════════════════════════════════════════════

/** "Meera Verma" → "Meera". Used for the loose autocomplete match. */
export const firstNameOf = (full: string): string => (full || "").trim().split(/\s+/)[0] ?? "";

export interface SnippetToken {
  text: string;
  bold: boolean;
}

/**
 * Snippets are authored with `<b>` on the matched terms, which is the real
 * convention. We never hand that to `dangerouslySetInnerHTML` — we parse the
 * `<b>` spans ourselves and strip every other tag to plain text, so a snippet
 * pasted in by a sender can carry emphasis and nothing else.
 */
export function parseSnippet(raw: string): SnippetToken[] {
  const src = raw ?? "";
  const out: SnippetToken[] = [];
  const re = /<b>([\s\S]*?)<\/b>/gi;
  const clean = (s: string) => s.replace(/<[^>]*>/g, "");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ text: clean(src.slice(last, m.index)), bold: false });
    out.push({ text: clean(m[1]), bold: true });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ text: clean(src.slice(last)), bold: false });
  return out.filter((t) => t.text.length > 0);
}

/** True when the typed query is not, in any reading, the recipient's name. */
export function isWrongName(query: string, recipientName: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const full = recipientName.trim().toLowerCase();
  if (!full) return false;
  if (full.includes(q) || q.includes(full)) return false;
  // Any single name-part matching is close enough to count as "they typed it".
  return !full.split(/\s+/).some((part) => part.length > 1 && (q.includes(part) || part.includes(q)));
}

/**
 * Rewrite every piece of copy from one recipient name to another, so changing
 * the name in the editor does not leave the demo's jokes addressed to someone
 * else. Whole-word, full name first, then the first name.
 */
export function retargetToRecipient(data: SearchData, oldName: string, newName: string): SearchData {
  const from = (oldName || "").trim();
  const to = (newName || "").trim();
  if (!from || !to || from === to) return data;

  const oldFirst = firstNameOf(from);
  const newFirst = firstNameOf(to) || to;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fullRe = new RegExp(`\\b${esc(from)}\\b`, "gi");
  const firstRe = oldFirst ? new RegExp(`\\b${esc(oldFirst)}\\b`, "gi") : null;
  const slugRe = new RegExp(esc(from.toLowerCase().replace(/\s+/g, "-")), "gi");
  const underRe = new RegExp(esc(from.replace(/\s+/g, "_")), "gi");

  const t = (s: string): string => {
    if (!s) return s;
    let out = s.replace(fullRe, to);
    out = out.replace(slugRe, to.toLowerCase().replace(/\s+/g, "-"));
    out = out.replace(underRe, to.replace(/\s+/g, "_"));
    if (firstRe) out = out.replace(firstRe, newFirst);
    return out;
  };
  const ts = (a: string[]) => a.map(t);

  return {
    ...data,
    recipient: { ...data.recipient, name: to },
    autocomplete: ts(data.autocomplete),
    didYouMean: data.didYouMean ? t(data.didYouMean) : data.didYouMean,
    results: data.results.map((r) => ({
      ...r,
      title: t(r.title),
      url: t(r.url),
      snippet: t(r.snippet),
      badge: r.badge ? t(r.badge) : r.badge,
      page: r.page
        ? { ...r.page, title: t(r.page.title), url: t(r.page.url), body: ts(r.page.body) }
        : undefined,
    })),
    paa: data.paa.map((p) => ({ ...p, question: t(p.question), answer: t(p.answer), source: p.source ? t(p.source) : p.source })),
    paaReserve: data.paaReserve.map((p) => ({ ...p, question: t(p.question), answer: t(p.answer), source: p.source ? t(p.source) : p.source })),
    knowledgePanel: {
      ...data.knowledgePanel,
      subtitle: t(data.knowledgePanel.subtitle),
      description: t(data.knowledgePanel.description),
      facts: data.knowledgePanel.facts.map((f) => ({ label: t(f.label), value: t(f.value) })),
      quote: data.knowledgePanel.quote ? t(data.knowledgePanel.quote) : data.knowledgePanel.quote,
    },
    relatedSearches: ts(data.relatedSearches),
    images: data.images.map((i) => ({ ...i, caption: i.caption ? t(i.caption) : i.caption })),
    alternateResults: Object.fromEntries(
      Object.entries(data.alternateResults).map(([k, v]) => [
        t(k),
        v.map((r) => ({ ...r, title: t(r.title), url: t(r.url), snippet: t(r.snippet) })),
      ]),
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

const UNSPLASH = (id: string, w = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

/** The emotional payload. Deliberately the least interesting title on the page. */
const THE_LETTER: FakePage = {
  title: "untitled document",
  url: "arjun.exe › notes › untitled",
  body: [
    "This has been open in a tab since March. I keep meaning to say it out loud and then you walk into the room and I say something about the electricity bill instead.",
    "So: you took the last samosa off my plate the evening we met and did not apologise, and I have thought about that roughly once a week for four years. Not the samosa. The not apologising. You have never once pretended to be smaller than you are, and I did not know until you that this was something a person could just decide to do.",
    "You fall asleep at 9:40 with the lights on and the book on your face. You reorganise cupboards that belong to other people. You send me photographs of dogs you have met, with names you have invented for them. You argue with the news. You cry at adverts and not at funerals. You have made me laugh in a hospital corridor.",
    "I do not have a large point. I only wanted it written down somewhere that if a search engine ever did index a person — every fact, every habit, every small unremarkable Tuesday — the whole first page would still miss it. The whole first page would still just be a list of things you did.",
    "The thing itself is here at the bottom, in a file nobody clicks.",
    "I love you. Come to bed.",
  ],
};

const DEMO_RESULTS: SearchResult[] = [
  {
    id: "r-ad",
    badge: "Ad",
    url: "arjun.exe › entirely-unbiased",
    title: "Meera Verma — Best Person Available (Sponsored)",
    snippet:
      "Paid placement. <b>Meera Verma</b> retains the top spot for a fourth consecutive year. No other candidates were shortlisted, interviewed, or considered.",
    page: {
      title: "Entirely Unbiased Rankings, 2026 Edition",
      url: "arjun.exe › entirely-unbiased",
      body: [
        "This ranking is sponsored. It has always been sponsored. The sponsor is me and the currency is that I get to keep her.",
        "Methodology: I thought about it. Sample size: one. Margin of error: none, obviously.",
        "1. Meera Verma. 2. There is no two.",
        "Complaints about the methodology may be directed to the complaints department, which is also me, and which has closed every ticket ever filed.",
      ],
    },
  },
  {
    id: "r-about",
    url: "meera-verma.in › about",
    title: "About — Meera Verma",
    snippet:
      "<b>Meera</b> is a person who says she is not hungry and then eats half of yours. Known for excellent playlists, catastrophic parking, and being unreasonably kind to waiters.",
    page: {
      title: "About",
      url: "meera-verma.in › about",
      imageUrl: UNSPLASH("photo-1517841905240-472988babdf9"),
      body: [
        "Hello. This page has not been updated since 2011 and I am not going to update it now.",
        "I am Meera. I work in a building with bad coffee. I am from a town you have not heard of and I will describe it to you at length if you let me.",
        "Things I am good at: remembering birthdays, finding the one shop still open, arguing. Things I am bad at: parking, being told to relax, leaving a cupboard the way I found it.",
        "If you are here because someone sent you a link, they are probably being sentimental. Let them.",
      ],
    },
  },
  {
    id: "r-wiki",
    url: "unencyclopedia.in › wiki › Meera_Verma",
    title: "Meera Verma - The Free Encyclopedia (Unverified)",
    snippet:
      "<b>Meera Verma</b> (b. 14 March) is an Indian human best known for winning arguments she started. Citation needed. Citation refused. This article may not be neutral.",
    page: {
      title: "Meera Verma",
      url: "unencyclopedia.in › wiki › Meera_Verma",
      body: [
        "This article has multiple issues. Please help improve it, or do not, she is fine.",
        "Meera Verma is an Indian human. She is known primarily for her work in the field of starting arguments and subsequently winning them, and for a laugh that has been described by at least one source as 'audible from the next flat'.",
        "Early life: born on a Wednesday, according to her mother, who has told this story at every family gathering since.",
        "Personal life: lives with a man who keeps a document about her open in a browser tab. He believes this is a secret.",
        "Controversies: the hoodie. Nobody will say more.",
      ],
    },
  },
  {
    id: "r-archive",
    url: "themonsoonproject.in › archive › the-evening",
    title: "The evening she took the last samosa — an archive entry",
    snippet:
      "...it was raining hard enough that nobody could leave, and she took the last <b>samosa</b> off my plate without asking, and I remember thinking: oh no.",
    page: {
      title: "Archive entry #0041 — the evening it rained",
      url: "themonsoonproject.in › archive › the-evening",
      imageUrl: UNSPLASH("photo-1502823403499-6ccfcf4fb453"),
      body: [
        "Filed under: weather, food, mistakes that were not mistakes.",
        "The power had gone. Somebody's cousin had brought a guitar, which was the worst news of the evening until it wasn't. There were nine of us and eight samosas and I had done the arithmetic and quietly decided who was going to lose.",
        "She reached across, took mine, said 'you weren't going to eat that', and was correct, which was the part that undid me.",
        "I walked her to the gate. It took forty minutes to walk two hundred metres. I have never told her that I counted.",
      ],
    },
  },
  {
    id: "r-thread",
    url: "group-chat.local › threads › 4417",
    title: "[Thread] What is Meera doing right now — 47 replies",
    snippet:
      "Consensus: she is either reorganising a cupboard nobody asked her to reorganise, or asleep at 9:40pm with the lights on and a book on her face.",
  },
  {
    id: "r-complaints",
    url: "complaints.dept › open-tickets",
    title: "Open complaints against Meera Verma (0 resolved)",
    snippet:
      "Ticket #1: steals hoodies. Ticket #2: says 'five more minutes' at 6am. Ticket #3: narrates films. Status for all tickets: <b>closed, complainant withdrew</b>.",
    page: {
      title: "Complaints Department — Ticket Log",
      url: "complaints.dept › open-tickets",
      body: [
        "Ticket #1 — Subject: hoodies. Complainant reports that the hoodie was his. Resolution: it looks better on her. Closed.",
        "Ticket #2 — Subject: 'five more minutes' at 6am, repeated up to four times. Resolution: complainant admitted he also went back to sleep. Closed.",
        "Ticket #3 — Subject: narrating films that the complainant is watching. Resolution: complainant now cannot watch a film without her and considers this a fault of his own. Closed.",
        "Ticket #4 — Subject: none given. Complainant withdrew before filing. Closed.",
        "The department has processed four tickets in four years and upheld none of them. An internal review has found the department to be compromised.",
      ],
    },
  },
  {
    id: "r-letter",
    url: "arjun.exe › notes › untitled",
    title: "untitled document (last edited today)",
    snippet:
      "A file that has been open in a browser tab for eleven months. No formatting, no headings. Just the thing I keep meaning to say out loud and then don't.",
    page: THE_LETTER,
  },
];

const DEMO_PAA: PaaItem[] = [
  {
    question: "Is Meera Verma actually that funny or do people just like her?",
    // Deliberately over 300 characters: the accordion measures scrollHeight for
    // exactly this case, and a fixed max-height would clip it.
    answer:
      "Both, and they are not separable. She is funny in the specific way where the joke is never at anyone's expense except her own, which means people relax around her, which means they laugh more easily, which means she is funnier. It compounds. Independent testing has confirmed that she is the only person who can make the queue at the passport office enjoyable, and that she once got a traffic constable to laugh so hard he forgot to write the ticket.",
    source: "arjun.exe › feelings › longform",
  },
  {
    question: "Why does Meera Verma fall asleep during every film?",
    answer:
      "Approximately thirty-five minutes in, without exception, regardless of genre, volume, or how strongly she insisted she was fine. She then wakes for the last four minutes and asks a question that reveals she has understood the entire plot.",
    source: "group-chat.local › threads › 4417",
  },
  {
    question: "How do I get Meera Verma to reply faster?",
    answer:
      "You do not. She reads the message, composes a reply in her head, considers it delivered, and moves on with her day. The reply arrives on Thursday. It is always worth it.",
    source: "meera-verma.in › faq",
  },
];

const DEMO_PAA_RESERVE: PaaItem[] = [
  {
    question: "Does Meera Verma know she does the thing with her nose?",
    answer:
      "She does not. It happens when she is concentrating, or lying, and the two are visually identical, which has been useful exactly once and inconvenient many times.",
    source: "unencyclopedia.in › wiki › Meera_Verma",
  },
  {
    question: "What is Meera Verma's actual coffee order?",
    answer:
      "She orders a filter coffee and then drinks half of somebody else's. Establishments are advised to simply bring two and bill for one and a half.",
    source: "complaints.dept › closed-tickets",
  },
  {
    question: "Is it normal to think about Meera Verma this much?",
    answer:
      "No. Sources indicate the healthy figure is considerably lower. No corrective action is planned.",
    source: "arjun.exe › feelings",
  },
  {
    question: "Will Meera Verma read all the way to the last result?",
    answer:
      "Statistically, nobody clicks the last result. This one is counting on her being unusual, which is the entire thesis of the page.",
    source: "arjun.exe › notes › untitled",
  },
];

const DEMO_FACTS: KnowledgeFact[] = [
  { label: "Born", value: "14 March · a Wednesday, apparently" },
  { label: "Height", value: "Exactly tall enough to steal a hoodie" },
  { label: "Occupation", value: "Works in a building with bad coffee" },
  { label: "Known for", value: "Winning arguments she started" },
  { label: "Weakness", value: "Anything with a dog in it" },
  { label: "Status", value: "Taken. Aggressively. By me." },
];

const DEMO_PANEL: KnowledgePanel = {
  subtitle: "Person · The Love of My Life",
  description:
    "Meera Verma is an Indian human, best known for taking the last samosa off a stranger's plate in 2021 and never once apologising for it. She is currently reorganising a cupboard that does not belong to her.",
  facts: DEMO_FACTS,
  quote: "you weren't going to eat that",
  alsoSearchFor: ["Priya", "Nikhil", "Aunty Sushma", "Rohan", "Kabir"],
};

const DEMO_ALTERNATES: Record<string, SearchResult[]> = {
  "meera verma height": [
    {
      id: "a-h1",
      url: "unencyclopedia.in › wiki › Meera_Verma",
      title: "Meera Verma height — disputed",
      snippet: "Sources disagree. She claims 5'6\". The doorframe pencil marks in her mother's house claim otherwise and have been sealed as evidence.",
    },
    {
      id: "a-h2",
      url: "complaints.dept › measurements",
      title: "Request for official measurement denied",
      snippet: "Subject declined to stand against the wall, described the exercise as 'a trap', and left the room.",
    },
  ],
  "meera verma net worth": [
    {
      id: "a-n1",
      url: "arjun.exe › accounts",
      title: "Meera Verma net worth 2026",
      snippet: "Incalculable. Assets include four hoodies that were not hers, a playlist nobody can improve on, and the entire emotional solvency of one household.",
    },
    {
      id: "a-n2",
      url: "group-chat.local › threads › 0912",
      title: "she still owes me for the auto in 2022",
      snippet: "Thread archived. Debt outstanding. Nobody is going to bring it up.",
    },
  ],
  "is meera verma single": [
    {
      id: "a-s1",
      url: "arjun.exe › no",
      title: "No.",
      snippet: "This page has one word on it and the word is no. It has been visited four hundred times, all by the same person, for reassurance.",
    },
  ],
  "meera verma before she met me": [
    {
      id: "a-b1",
      url: "themonsoonproject.in › archive › before",
      title: "Archive: the years before",
      snippet: "Records are thin. She was, by all accounts, doing perfectly well, which is the humbling part.",
    },
    {
      id: "a-b2",
      url: "unencyclopedia.in › wiki › Meera_Verma",
      title: "Early life — Meera Verma",
      snippet: "A town you have not heard of, a bicycle with no brakes, and an unbroken record of being the loudest person in every photograph.",
    },
  ],
};

export const DEMO_DATA: SearchData = {
  sender: { name: "Arjun" },
  recipient: {
    name: "Meera Verma",
    photoUrl: UNSPLASH("photo-1494790108377-be9c29b29330", 500),
  },
  autocomplete: [
    "Meera Verma is always right",
    "Meera Verma laugh sound download",
    "Meera Verma why is she like this",
    "Meera Verma how to keep her forever",
    "Meera Verma reviews 5 stars",
    "Meera Verma near me",
  ],
  didYouMean: "Meera Varma",
  resultCount: groupIndian(847000),
  searchSeconds: "0.42",
  results: DEMO_RESULTS,
  paa: DEMO_PAA,
  paaReserve: DEMO_PAA_RESERVE,
  knowledgePanel: DEMO_PANEL,
  relatedSearches: [
    "meera verma height",
    "meera verma net worth",
    "is meera verma single",
    "meera verma phone number",
    "meera verma before she met me",
    "meera verma 2011",
  ],
  images: [
    { url: UNSPLASH("photo-1517841905240-472988babdf9", 500), caption: "the one where she is laughing at her own joke" },
    { url: UNSPLASH("photo-1524504388940-b1c1722653e1", 500), caption: "asleep. 9:41pm. book on face." },
    { url: UNSPLASH("photo-1502823403499-6ccfcf4fb453", 500), caption: "the evening it rained" },
    { url: UNSPLASH("photo-1531123897727-8f129e1688ce", 500), caption: "arguing with a menu" },
    { url: UNSPLASH("photo-1488426862026-3ee34a7d66df", 500), caption: "hoodie: mine. allegedly." },
    { url: UNSPLASH("photo-1529626455594-4ff0802cfb7e", 500), caption: "a dog she met and renamed" },
    { url: UNSPLASH("photo-1544005313-94ddf0286df2", 500), caption: "the passport office queue" },
    { url: UNSPLASH("photo-1508214751196-bcfd4ca60f91", 500), caption: "no idea. she sent it at 2am." },
  ],
  alternateResults: DEMO_ALTERNATES,
};

// ═══════════════════════════════════════════════════════════════════════════
// Wire format
// ═══════════════════════════════════════════════════════════════════════════

export const SEARCHED_BODY_KEYS = [
  "senderName",
  "recipientName",
  "recipientPhoto",
  "autocomplete",
  "didYouMean",
  "resultCount",
  "searchSeconds",
  "results",
  "paa",
  "paaReserve",
  "knowledgePanel",
  "relatedSearches",
  "images",
  "alternateResults",
] as const;

/** UI state → the flat body the API stores. Explicit allow-list, per `wire`. */
export function searchedDataToBody(data: SearchData, password?: string): Record<string, unknown> {
  const flat = {
    senderName: data.sender.name,
    recipientName: data.recipient.name,
    recipientPhoto: data.recipient.photoUrl,
    autocomplete: data.autocomplete,
    didYouMean: data.didYouMean ?? "",
    resultCount: data.resultCount,
    searchSeconds: data.searchSeconds,
    results: data.results,
    paa: data.paa,
    paaReserve: data.paaReserve,
    knowledgePanel: data.knowledgePanel,
    relatedSearches: data.relatedSearches,
    images: data.images,
    alternateResults: data.alternateResults,
  };
  return bodyFromKeys(flat, SEARCHED_BODY_KEYS, password);
}

// DB → UI lives in ./coerce (`dbToSearchData`). It is the single place that
// decides what a stored page may contain, and it is what the published-page
// viewer imports. Keeping it out of here also keeps the import one-way:
// coerce → demoData, never back.
