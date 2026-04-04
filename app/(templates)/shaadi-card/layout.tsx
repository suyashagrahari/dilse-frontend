import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { Cinzel, Dancing_Script, Lora } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cinzel" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["700"], variable: "--font-dancing" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "Shaadi Card | Animated Indian Wedding Invitation",
  description:
    "Create a beautiful animated digital wedding invitation card with couple illustration, falling petals, and more. Share your shaadi card instantly with family and friends.",
  alternates: { canonical: `${SITE_URL}/shaadi-card` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cinzel.variable} ${dancing.variable} ${lora.variable}`}>
      {children}
    </div>
  );
}
