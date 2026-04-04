import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { Cinzel, Great_Vibes, DM_Sans, Lora, Playfair_Display } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cinzel" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: ["400"], variable: "--font-great-vibes" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lora" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Christian Wedding Invitation | Elegant digital invite",
  description:
    "Create a refined Christian wedding invitation with sage & watercolor styling, events, gallery, and blessings wall. Share a single beautiful link.",
  alternates: { canonical: `${SITE_URL}/christian-wedding` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${cinzel.variable} ${greatVibes.variable} ${dmSans.variable} ${lora.variable} ${playfair.variable}`}
    >
      {children}
    </div>
  );
}
