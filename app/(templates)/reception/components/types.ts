export type TabId = "home" | "couple" | "gallery" | "location" | "blessings";
export type EditMode = null | "choose" | "ai-card" | "ai-text" | "ai-edit" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "couple", label: "Us", emoji: "💑" },
  { id: "gallery", label: "Gallery", emoji: "📸" },
  { id: "location", label: "Location", emoji: "📍" },
  { id: "blessings", label: "Blessings", emoji: "🙏" },
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
  sharePhoto?: string;
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
  heroImage: "https://cdn.subhsandesh.in/gifts-media/assets/Reception/reception.webp",
  bride: {
    name: "Priya Sharma",
    role: "The Bride",
    description: "A soul who paints the world with kindness, grace, and an infectious love for life.",
    photo: "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp",
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
    photo: "https://cdn.subhsandesh.in/gifts-media/assets/couple2.webp",
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
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/hero-bg.webp", alt: "Couple", span: "col-span-2 row-span-2", category: "couple" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp", alt: "Bride", span: "", category: "candid" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple2.webp", alt: "Groom", span: "", category: "candid" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple3.webp", alt: "Pre-Wedding", span: "col-span-2", category: "pre-wedding" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple4.webp", alt: "Together", span: "", category: "couple" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp", alt: "Engagement", span: "", category: "engagement" },
  ],
  wishes: [
    { name: "Amit & Neha", message: "Bahut bahut badhai ho! Dono ko bohot saari khushiyan mile. 💕" },
    { name: "Pooja Aunty", message: "God bless this beautiful couple. Sada suhagan raho beta. 🙏" },
    { name: "Vikash Bhai", message: "Arey waah! Bohot khushi ki baat hai. Maza aayega reception mein! 🎉" },
  ],
};
