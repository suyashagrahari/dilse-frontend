export type {
  TabId,
  EditMode,
  Toast,
  WeddingEvent,
  Wish,
  CoupleInfo,
  FamilyInfo,
  ShaadiData,
  WeddingData,
} from "@/app/(templates)/shaadi-card/components/types";

export {
  TABS,
  DEMO_DATA,
} from "@/app/(templates)/shaadi-card/components/types";

import type { ShaadiData } from "@/app/(templates)/shaadi-card/components/types";

/** Default copy & events tuned for a Christian / Western wedding (same schema as Shaadi card). */
export const CHRISTIAN_DEMO_DATA: ShaadiData = {
  brideName: "Jane",
  groomName: "Andrew",
  weddingDate: "2026-07-22T19:00:00+00:00",
  venue: "123 Anywhere St, Any City, ST 12345",
  blessing: "God bless this union",
  bride: {
    name: "Jane",
    role: "The Bride",
    roleHindi: "Bride",
    description: "A heart full of grace and joy.",
    photo: "",
    tags: [
      { emoji: "✝️", label: "Faith" },
      { emoji: "📖", label: "Teacher" },
    ],
  },
  groom: {
    name: "Andrew",
    role: "The Groom",
    roleHindi: "Groom",
    description: "A gentleman of kindness and faith.",
    photo: "",
    tags: [
      { emoji: "🎓", label: "Graduate" },
      { emoji: "💼", label: "Engineer" },
    ],
  },
  brideFamily: {
    title: "Bride's Family",
    parents: "Mr. & Mrs. Smith",
    grandparents: "",
  },
  groomFamily: {
    title: "Groom's Family",
    parents: "Mr. & Mrs. Johnson",
    grandparents: "",
  },
  events: [
    { name: "Rehearsal Dinner", hindi: "", icon: "🍽️", date: "21 Jul", time: "6 PM", venue: "Garden Bistro", details: "Casual attire. RSVP appreciated.", accent: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30", disabled: false },
    { name: "Ceremony", hindi: "", icon: "⛪", date: "22 Jul", time: "4 PM", venue: "St. Mary’s Church", details: "Please arrive 20 minutes early. Traditional ceremony followed by photos on the lawn.", accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30", disabled: false },
    { name: "Reception", hindi: "", icon: "🥂", date: "22 Jul", time: "7 PM", venue: "Grand Ballroom", details: "Dinner, dancing, and cake. Black tie optional.", accent: "from-blue-500/20 to-blue-500/5 border-blue-500/30", disabled: false },
    { name: "Brunch", hindi: "", icon: "☕", date: "23 Jul", time: "10 AM", venue: "The Oak House", details: "Farewell brunch for out-of-town guests.", accent: "from-violet-500/20 to-violet-600/5 border-violet-500/30", disabled: true },
    { name: "Placeholder", hindi: "", icon: "📌", date: "", time: "", venue: "", details: "", accent: "from-slate-500/15 to-slate-600/5 border-slate-500/20", disabled: true },
    { name: "Placeholder", hindi: "", icon: "📌", date: "", time: "", venue: "", details: "", accent: "from-slate-500/15 to-slate-600/5 border-slate-500/20", disabled: true },
  ],
  galleryImages: [
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/marriage/weeding.webp", alt: "Wedding Celebration", span: "col-span-2 row-span-2" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp", alt: "The Bride", span: "" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple2.webp", alt: "The Groom", span: "" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple3.webp", alt: "Ceremony Decor", span: "col-span-2" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple4.webp", alt: "Pre-Wedding Shoot", span: "" },
    { src: "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp", alt: "Engagement Day", span: "" },
  ],
  wishes: [
    { name: "Sarah Mitchell", message: "May God bless your union with endless love, patience, and joy. You two are truly made for each other!" },
    { name: "Pastor David", message: "What God has joined together, let no one separate. Wishing you a marriage built on faith, love, and grace." },
    { name: "Emily & James", message: "So happy for you both! May your journey together be filled with beautiful moments and unwavering love." },
    { name: "Grandmother Rose", message: "My dearest Jane and Andrew, watching you two together fills my heart with joy. God bless you always." },
    { name: "Michael Thompson", message: "Congrats to the most beautiful couple! May your home be filled with laughter and your hearts with peace." },
    { name: "Rachel & Tom", message: "Love is patient, love is kind — and yours is truly inspiring. Cheers to a lifetime of happiness together!" },
  ],
};
