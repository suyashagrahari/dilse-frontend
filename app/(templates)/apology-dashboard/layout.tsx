import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/seo";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });

const SLUG = "apology-dashboard";
const TITLE = "Apology Dashboard — A Cute Interactive Sorry";
const DESCRIPTION =
  "Say sorry the memorable way: an anger-o-meter that melts as they forgive you, a whack game, a scratch-card secret, sweet bribery promises and a will-you-forgive-me finale they can sign.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: "🥺 Apology Dashboard", description: DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: "🥺 Apology Dashboard", description: DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${fredoka.variable} ${inter.variable}`}>{children}</div>;
}
