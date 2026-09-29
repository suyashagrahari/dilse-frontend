// ─── Endorsements — the demo profile ─────────────────────────────────────────
//
// This is the copy the gallery preview shows before anybody has typed a word, so
// it is doing two jobs at once: it has to be funny enough that a visitor wants
// one of their own, and it has to exercise every branch the components can take.
//
// ── THE NUMBERS ARE THE JOKE ─────────────────────────────────────────────────
//
// "Being Right (47)" sits four rows above "Punctuality (2)" and both are drawn
// identically. Nothing in this file should ever be reordered to put them side by
// side — the reader finding the gap themselves is the whole gag, and a setup
// placed next to its punchline is a caption.
//
// "Directions" carries `endorsements: 0`, which renders as a bare label and a
// button. That row is not filler: it is the branch where a first contributor
// sees an empty space with their name-shaped hole in it.
//
// Nine skills, so the "Show all 9 skills" fold is on by default (the collapse
// triggers past five). One pending recommendation, so the sender's queue has
// something in it. One recommendation long enough to hit the four-line "…see
// more". Every one of those is a rendering path somebody has to be able to see
// without filling in a form first.

import { DEMO_PHOTO_CDN } from "../../_love/types";
import type { ProfileProData } from "./types";

const P = DEMO_PHOTO_CDN;

export const DEMO_PROFILE: ProfileProData = {
  person: {
    name: "Meera Sharma",
    headline: "Professional Girlfriend | Serial Overthinker",
    location: "Bengaluru, Karnataka, India",
    photoUrl: `${P}/couple2.webp`,
    photoCropX: 63,
    photoCropY: 40,
    photoScale: 260,
    bannerUrl: `${P}/couple1.webp`,
    bannerCropX: 50,
    bannerCropY: 55,
    bannerScale: 100,
    connections: "1 connection (the important one)",
    degreeNote: "· 1st",
    // Just the value. `ProfileCard` already prints the "Open to" label above it,
    // so a value that repeats the prefix renders as "Open to / Open to: …".
    openTo: "being right",
  },

  about: [
    "Four years in and I have still not lost an argument about whether the fan speed should be 3 or 4. It should be 3. I have the data.",
    "I specialise in remembering things he said in 2022 and bringing them up at optimal moments. Secondary specialisation: knowing exactly which restaurant he wants before he does, and then ordering something better.",
    "Outside of work I am the same person, which he says is the problem and I say is the point. Currently accepting compliments, unsolicited advice about my sleep schedule, and one (1) more dog.",
  ],

  experience: [
    {
      role: "Girlfriend",
      company: "Sharma & Sons",
      type: "Full-time",
      duration: "Mar 2023 – Present",
      location: "Bengaluru",
      bullets: [
        "Led cross-functional alignment on where to eat",
        "Reduced his overthinking by 12% QoQ",
        "Owns the roadmap for both our lives",
        "Consolidated four separate to-do lists into one he still does not read",
      ],
    },
    {
      role: "Best Friend",
      company: "Sharma & Sons",
      type: "Part-time",
      duration: "Nov 2021 – Mar 2023",
      location: "Bengaluru · Hybrid",
      bullets: [
        "Maintained plausible deniability for 16 months",
        "Delivered emotional support with a 4-minute average response time",
        "Promoted internally after a strong performance review conducted at 2am",
      ],
    },
    {
      role: "Girl Who Sat Two Rows Ahead",
      company: "Christ University",
      type: "Contract",
      duration: "Aug 2019 – Nov 2021",
      location: "Bengaluru · On-site",
      bullets: [
        "Managed a stakeholder who took two years to open a conversation",
        "Zero direct communication; 100% brand awareness",
      ],
    },
  ],

  education: [
    {
      school: "Christ University",
      degree: "B.A. Psychology · Applied to one person only",
      years: "2019 – 2022",
      note: "Thesis: 'He Is Fine, He Is Just Like That' — a longitudinal study, sample size 1.",
    },
    {
      school: "The School of Knowing Before He Says It",
      degree: "Self-taught, ongoing",
      years: "2021 – Present",
    },
  ],

  skills: [
    {
      id: "being-right",
      label: "Being Right",
      endorsements: 47,
      topEndorsers: ["Sneha", "Karan", "Rhea", "Ishaan"],
      isTop3: true,
    },
    {
      id: "remembering-everything",
      label: "Remembering Everything He Said",
      endorsements: 38,
      topEndorsers: ["Karan", "Aarav", "Priya"],
      isTop3: true,
    },
    {
      id: "conflict-resolution",
      label: "Conflict Resolution (Self-Initiated)",
      endorsements: 24,
      topEndorsers: ["Rhea", "Sneha"],
      isTop3: true,
    },
    {
      id: "restaurant-selection",
      label: "Restaurant Selection Under Pressure",
      endorsements: 19,
      topEndorsers: ["Ishaan", "Priya", "Ananya"],
    },
    {
      id: "reading-the-room",
      label: "Reading The Room He Is Also In",
      endorsements: 15,
      topEndorsers: ["Ananya", "Karan"],
    },
    {
      id: "gift-forecasting",
      label: "Gift Forecasting",
      endorsements: 9,
      topEndorsers: ["Sneha"],
    },
    {
      id: "sharing-food",
      label: "Sharing Food (Receiving Only)",
      endorsements: 6,
      topEndorsers: ["Aarav", "Rhea"],
    },
    {
      id: "punctuality",
      label: "Punctuality",
      endorsements: 2,
      topEndorsers: ["Her Mother", "Karan"],
    },
    {
      id: "directions",
      label: "Directions",
      endorsements: 0,
      topEndorsers: [],
    },
  ],

  certifications: [
    {
      name: "Certified in Reading My Mind",
      issuer: "Issued by Herself",
      date: "Mar 2023 · No Expiry",
    },
    {
      name: "Advanced Sighing (Level 3)",
      issuer: "Issued by Her Mother",
      date: "Jan 2018 · Renews Annually",
    },
    {
      name: "Recognising 'I'm Fine' As A Lie",
      issuer: "Issued by Four Years of Fieldwork",
      date: "Sep 2024 · No Expiry",
    },
  ],

  recommendations: [
    {
      id: "rec-sneha",
      author: "Sneha Iyer",
      authorHeadline: "Product Manager | Professional Third Wheel",
      relationship: "Sneha worked with Meera on the same team",
      text:
        "I have watched this partnership from a folding chair for four years and I want to go on record. Meera does the thing where she says 'do whatever you want' and she genuinely means it, which is the rarest skill in the market and nobody puts it on a profile. She has also, to my knowledge, been correct in every disagreement I have been forced to arbitrate — including the one about the fan speed, where I initially sided against her and was wrong. She remembers that I was wrong. She brings it up. I would still recommend her without reservation, and I would do it again in a slightly smaller folding chair.",
      ago: "2 months ago",
      status: "published",
    },
    {
      id: "rec-karan",
      author: "Karan Mehta",
      authorHeadline: "Backend Engineer | Was There When It Started",
      relationship: "Karan studied with Meera",
      text:
        "Met her in the second row of a lecture neither of us was following. She has not changed. Highly recommend, extremely low maintenance, do not let her drive.",
      ago: "5 months ago",
      status: "published",
    },
    {
      id: "rec-rhea",
      author: "Rhea Nair",
      authorHeadline: "Designer | Reluctant Group Chat Admin",
      relationship: "Rhea is related to Meera, unfortunately",
      text:
        "As her cousin I am contractually required to say something nice, so: she has never once forgotten a birthday, and she notices when you go quiet. That is the whole recommendation. The rest of it is not for the internet.",
      ago: "3 weeks ago",
      status: "pending",
    },
  ],

  contributorPrompt:
    "You know her. Tap the skills you would actually put your name behind — it takes two taps and she sees every one of them before anybody else does.",

  senderName: "Kabir",

  photos: [
    { url: `${P}/couple1.webp`, caption: "the first sunset", note: "You said the sky looked like mango lassi. I have not stopped thinking about it.", cropX: 50, cropY: 45, scale: 100 },
    { url: `${P}/couple2.webp`, caption: "date night, round 1", note: "You stole my fries and then my heart. In that order. Both were non-refundable.", cropX: 50, cropY: 40, scale: 100 },
    { url: `${P}/couple3.webp`, caption: "cherry blossom era", note: "Even the trees were showing off for you that day. They lost.", cropX: 55, cropY: 50, scale: 100 },
    { url: `${P}/couple4.webp`, caption: "stargazing, sort of", note: "You named every star wrong and I let you. I will let you forever.", cropX: 50, cropY: 50, scale: 100 },
    { url: `${P}/Aniversary/aniversary.webp`, caption: "rooftop, 1 AM", note: "The city was loud and you were louder. My favourite noise.", cropX: 50, cropY: 60, scale: 100 },
  ],

  posts: [
    {
      id: "post-promo",
      text: "I'm happy to share that I've been promoted to Girlfriend (Full-time, Permanent) at Sharma & Sons! 🎉\n\nHuge thanks to my manager, who took two years to open a conversation and has been catching up ever since. Grateful for the 2am performance reviews, the unlimited chai benefit and a team of exactly one.\n\nOnwards. #newrole #grateful #hesstilllearning",
      ago: "2w",
    },
    {
      id: "post-fan",
      text: "After 4 years of rigorous A/B testing I can finally confirm it: fan speed 3 is objectively correct.\n\nWhat this taught me about leadership:\n1. Be right.\n2. Be patient while they realise you were right.\n3. Never say \"I told you so\" out loud. Say it with your eyes.\n\nAgree? 👇 #leadership #growthmindset",
      ago: "1mo",
    },
  ],

  languages: [
    { name: "Hindi", level: "Native or bilingual proficiency" },
    { name: "English", level: "Full professional proficiency" },
    { name: "Sarcasm", level: "Native, with regional variations" },
    { name: "His Silences", level: "Professional working proficiency" },
  ],

  letter:
    "Meera,\n\nI was asked to write you a recommendation, so here it is — on the record, where you can screenshot it.\n\nI have worked alongside you for four years across several roles: best friend, reluctant navigator, official taster of everything you cook at 1 AM. In that time you have consistently exceeded expectations, including the ones I didn't know I had.\n\nYou remember the name of my school bus driver. You fight for the window seat and then give it to me anyway. You made a rainy Tuesday in a bus shelter feel like the best day of my life, and you've been quietly doing some version of that ever since.\n\nStrengths: being right (annoyingly often), kindness when nobody's watching, the laugh that makes strangers turn around. Areas for improvement: none I would ever want you to fix.\n\nI recommend you without reservation, for every role, in every timeline. Position filled. Permanently.",
  lockQuestion: "Kabir wants to send you a recommendation. Accept?",
  lockAnswer: "Accept 💙",
};

export default DEMO_PROFILE;
