import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/seo";

// The `display` value of each family MUST match the root layout's declaration.
// A second @font-face for the same family with a different display value makes
// the browser race two sources for the same text and re-introduces font-swap
// CLS (see the long note in app/layout.tsx).
const fredoka = localFont({
  src: [
    { path: "../../../assets/fonts/fredoka-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/fredoka-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/fredoka-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../../assets/fonts/fredoka-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fredoka",
  display: "swap",
});
const inter = localFont({
  src: [
    { path: "../../../assets/fonts/inter-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/inter-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../assets/fonts/inter-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "optional",
});
// The handwritten accent on polaroid captions and the letter's signature.
const dancingScript = localFont({
  src: [
    { path: "../../../assets/fonts/dancing-script-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../assets/fonts/dancing-script-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dancing",
  display: "optional",
});

const SLUG = "proposal";
const TITLE = "Proposal — An Interactive Marriage Proposal Page";
const DESCRIPTION =
  "Pop the question on a page they'll never delete: a scrapbook of your memories, a giant YES button that grows every time they hesitate, a 'No' button that refuses to be caught, and a confetti-soaked secret letter at the end.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: "💍 Will you marry me?",
    description: DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: { card: "summary_large_image", title: "💍 Will you marry me?", description: DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fredoka.variable} ${inter.variable} ${dancingScript.variable}`}>{children}</div>
  );
}
