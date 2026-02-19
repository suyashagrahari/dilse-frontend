import { NextResponse } from "next/server";

const stats = [
  { label: "Wishes Sent", value: "10K+", icon: "send" },
  { label: "Templates", value: "50+", icon: "palette" },
  { label: "Happy Users", value: "5K+", icon: "users" },
  { label: "Rating", value: "4.9★", icon: "star" },
];

const testimonials = [
  {
    id: 1,
    name: "Priya S.",
    text: "Made the most beautiful birthday page for my boyfriend. He literally cried happy tears!",
    avatar: "PS",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul M.",
    text: "The valentine template was absolutely stunning. My girlfriend loved the personal touch.",
    avatar: "RM",
    rating: 5,
  },
  {
    id: 3,
    name: "Ananya K.",
    text: "Used it for my parents' anniversary. The whole family was so emotional. Best gift ever!",
    avatar: "AK",
    rating: 5,
  },
  {
    id: 4,
    name: "Vikram D.",
    text: "The miss you template helped me reconnect with my best friend. So heartfelt and easy to use.",
    avatar: "VD",
    rating: 5,
  },
  {
    id: 5,
    name: "Sneha R.",
    text: "I've sent 5 wishes so far. Each one feels unique and personal. Absolutely addicted!",
    avatar: "SR",
    rating: 5,
  },
  {
    id: 6,
    name: "Arjun P.",
    text: "The sorry template saved my relationship. The animations and music made it so touching.",
    avatar: "AP",
    rating: 5,
  },
];

const featured = [
  {
    slug: "birthday-gf",
    title: "Birthday Love",
    emoji: "🎂",
    gradient: "from-pink-500 to-rose-500",
    description: "Make their birthday unforgettable",
  },
  {
    slug: "valentine-gf",
    title: "Valentine Special",
    emoji: "💝",
    gradient: "from-red-500 to-pink-500",
    description: "Express your deepest love",
  },
  {
    slug: "anniversary-gf",
    title: "Anniversary",
    emoji: "💍",
    gradient: "from-amber-500 to-orange-500",
    description: "Celebrate your journey together",
  },
  {
    slug: "missyou-gf",
    title: "Miss You",
    emoji: "💫",
    gradient: "from-violet-500 to-purple-500",
    description: "Bridge the distance with love",
  },
  {
    slug: "sorry-gf",
    title: "Apology",
    emoji: "🥺",
    gradient: "from-blue-500 to-cyan-500",
    description: "Say sorry from the heart",
  },
];

export async function GET() {
  return NextResponse.json({
    stats,
    testimonials,
    featured,
  });
}
