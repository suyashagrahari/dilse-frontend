export type TabId = "home" | "couple" | "gallery" | "location" | "blessings";
export type EditMode = null | "choose" | "ai" | "manual" | "preview" | "password";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "couple", label: "Us" },
  { id: "gallery", label: "Gallery" },
  { id: "location", label: "Location" },
  { id: "blessings", label: "Blessings" },
];

export interface PersonInfo {
  name: string;
  role: string;
  description: string;
  photo: string;
  tags: { emoji: string; label: string }[];
}

export interface Wish {
  name: string;
  message: string;
}

export interface ReceptionData {
  brideName: string;
  groomName: string;
  receptionDate: string;
  venue: string;
  venueAddress: string;
  venueMapQuery: string;
  venueTimings: string;
  tagline: string;
  heroImage: string;
  bride: PersonInfo;
  groom: PersonInfo;
  families: { bride: string; groom: string };
  galleryImages: { src: string; alt: string; span: string; category: string }[];
  wishes: Wish[];
}

export const DEMO_DATA: ReceptionData = {
  brideName: "Priya",
  groomName: "Arjun",
  receptionDate: "2026-03-15T19:00:00+05:30",
  venue: "The Grand Ballroom",
  venueAddress: "Royal Palace Hotel, Jaipur, Rajasthan",
  venueMapQuery: "Royal+Palace+Hotel+Jaipur+Rajasthan",
  venueTimings: "7:00 PM — 11:30 PM",
  tagline: "Request the pleasure of your company",
  heroImage: "/assets/marriage/couple-hero.jpg",
  bride: {
    name: "Priya Sharma",
    role: "The Bride",
    description: "A soul who paints the world with kindness, grace, and an infectious love for life.",
    photo: "/assets/couple1.jpeg",
    tags: [
      { emoji: "🎓", label: "MBA" },
      { emoji: "💼", label: "Designer" },
      { emoji: "🏙️", label: "Jaipur" },
    ],
  },
  groom: {
    name: "Arjun Verma",
    role: "The Groom",
    description: "A gentleman with a golden heart, endless ambition, and a love for creating memories.",
    photo: "/assets/couple2.jpeg",
    tags: [
      { emoji: "🎓", label: "B.Tech" },
      { emoji: "💼", label: "Engineer" },
      { emoji: "🏙️", label: "Delhi" },
    ],
  },
  families: {
    bride: "Shri Rajesh Sharma & Smt. Sunita Sharma",
    groom: "Shri Vikram Verma & Smt. Meena Verma",
  },
  galleryImages: [
    { src: "/assets/marriage/couple-hero.jpg", alt: "Couple", span: "col-span-2 row-span-2", category: "couple" },
    { src: "/assets/couple1.jpeg", alt: "Bride", span: "", category: "candid" },
    { src: "/assets/couple2.jpeg", alt: "Groom", span: "", category: "candid" },
    { src: "/assets/couple3.jpeg", alt: "Pre-Wedding", span: "col-span-2", category: "pre-wedding" },
    { src: "/assets/couple4.jpeg", alt: "Together", span: "", category: "couple" },
    { src: "/assets/couple1.jpeg", alt: "Engagement", span: "", category: "engagement" },
  ],
  wishes: [
    { name: "Amit & Neha", message: "Bahut bahut badhai ho! Dono ko bohot saari khushiyan mile. 💕" },
    { name: "Pooja Aunty", message: "God bless this beautiful couple. Sada suhagan raho beta. 🙏" },
    { name: "Vikash Bhai", message: "Arey waah! Bohot khushi ki baat hai. Maza aayega reception mein! 🎉" },
  ],
};
