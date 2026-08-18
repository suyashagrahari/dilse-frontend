import type { Metadata } from "next";
import { Dancing_Script, Fredoka, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/seo";

// The `display` value of each family MUST match the root layout's declaration.
// A second @font-face for the same family with a different display value makes
// the browser race two sources for the same text and re-introduces font-swap
// CLS (see the long note in app/layout.tsx).
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "optional",
});
// The handwritten accent on polaroid captions and the letter's signature.
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
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
