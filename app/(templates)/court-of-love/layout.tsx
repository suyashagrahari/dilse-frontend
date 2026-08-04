import type { Metadata } from "next";
import { Space_Grotesk, Caveat, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/seo";

// SubhSandesh theme faces. Inter uses display "optional" (not "swap") to match the
// root layout's Inter — otherwise this duplicate @font-face re-introduces
// font-display:swap for the shared "Inter" family and brings back the landing
// hero's font-swap CLS.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "optional",
});

const SLUG = "court-of-love";
const TITLE = "Court of Love — A Romantic Trivia Quiz for Your Partner";
const DESCRIPTION =
  "Put your partner on trial in the cutest way: 5 funny hearings, a gavel-banging penguin judge, GIF reactions after every answer, a secret letter, and a signed ₹100 stamp paper certifying they won the case. Free, mobile-first, shareable on WhatsApp & Instagram.";
const OG_TITLE = "⚖️ The Court of Love";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "court of love",
    "love quiz for girlfriend",
    "love quiz for boyfriend",
    "romantic trivia quiz",
    "how much do you know me quiz",
    "couple quiz game online",
    "funny love certificate",
    "best partner certificate",
    "valentine quiz for couples",
    "pyar ka quiz",
    "shareable love game India",
  ],
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: OG_TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: OG_TITLE, description: DESCRIPTION },
};

/**
 * JSON-LD. Two graphs on purpose:
 *  - WebApplication describes the tool itself, for rich results.
 *  - FAQPage is the AEO surface: these are the exact questions people ask
 *    assistants and search engines before making a couple's quiz, answered
 *    literally so an answer engine can quote them.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "The Court of Love",
      url: `${SITE_URL}/${SLUG}`,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Any (web browser)",
      description: DESCRIPTION,
      inLanguage: "en-IN",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      publisher: { "@type": "Organization", name: "SubhSandesh", url: SITE_URL },
      featureList: [
        "5 editable multiple-choice hearings",
        "Animated GIF reaction after every answer",
        "Typewriter secret letter on a winning verdict",
        "Signed ₹100 stamp paper certificate",
        "Share as an image, or download as PNG and PDF",
        "Optional password lock on the shared page",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I make a love quiz for my girlfriend or boyfriend?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open the Court of Love page, tap Create, and fill in your name and your partner's name. Five romantic courtroom questions come pre-written — edit any question, its four options, and which one is correct. Save to play through it yourself, then Publish to get a private link you can send on WhatsApp or Instagram.",
          },
        },
        {
          "@type": "Question",
          name: "Is the Court of Love quiz free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Creating, publishing and sharing a Court of Love page is free. Your partner can also download their certificate as a PNG image or a PDF at no cost.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if my partner gets the answers wrong?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nothing harsh. A wrong answer shows a funny, gentle GIF reaction such as 'koi baat nahi'. If they score below 80% the Court grants a retrial and they can appeal the verdict as many times as they like, so they never get locked out of your letter.",
          },
        },
        {
          "@type": "Question",
          name: "Can I password-protect the quiz so only my partner can open it?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Set an optional password while creating the page. Anyone opening the shared link must enter it before the case file unlocks. The password is stored hashed and is never shown on the page.",
          },
        },
        {
          "@type": "Question",
          name: "What does my partner get if they win the case?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Scoring 80% or higher reveals the verdict animation, then your secret letter typed out one character at a time, then a signed ₹100 stamp paper certifying them as your Certified Best Partner. It carries their name, the case number, their score and the date, and they can share it as an image or download it as a PNG or PDF.",
          },
        },
      ],
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.variable} ${caveat.variable} ${inter.variable}`}>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </div>
  );
}
