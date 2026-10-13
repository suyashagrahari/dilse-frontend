import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/seo";

const fredoka = localFont({
  src: [
    { path: "../../../assets/fonts/fredoka-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/fredoka-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/fredoka-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/fredoka-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fredoka", display: "swap" });
// display "optional" (not "swap") to match the root layout's Inter — otherwise
// this duplicate Inter @font-face re-introduces font-display:swap for the shared
// "Inter" family and reintroduces the landing hero's font-swap CLS. Inter is a
// plain UI sans-serif so there is no visual cost to optional.
const inter = localFont({
  src: [
    { path: "../../../assets/fonts/inter-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/inter-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/inter-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter", display: "optional" });

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
