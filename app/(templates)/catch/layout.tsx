import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "catch";
const TITLE = "Catch — Someone Wrote You Something. It's In Pieces.";
// Intriguing, never spoiling: the copy must never quote a line of the letter.
const DESCRIPTION =
  "A letter that falls out of the sky one piece at a time. Catch the things that belong to the two of you and each one hands you another line. Nothing is ever locked — a miss just means it hasn't arrived yet.";
const SOCIAL_TITLE = "💛 Someone wrote you something. It's in pieces.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: "Catch it and it puts itself back together.",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: "Catch it and it puts itself back together.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
