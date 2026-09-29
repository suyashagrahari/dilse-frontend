import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "catch";
const TITLE = "Catch — A Cute Love-Letter Arcade Game Starring Their Face";
// Intriguing, never spoiling: the copy must never quote a line of the letter.
const DESCRIPTION =
  "Turn your love letter into a cute mobile arcade game. Their face is the player — catch falling letter pieces, memory photos and hearts, dodge the ick, chase combos and a high score, then watch the letter stack itself together.";
const SOCIAL_TITLE = "🎮 I made you a game. Catch it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: "Catch the pieces and the letter puts itself back together 💘",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: "Catch the pieces and the letter puts itself back together 💘",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
