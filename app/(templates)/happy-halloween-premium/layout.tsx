import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-halloween-premium";
const TITLE = `Halloween Premium Website — The Midnight Manor, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A haunted manor at midnight: light candles of memories, ask the spirit board, brew a spell, hear the spirit radio and answer the midnight question.`;
const SOCIAL_TITLE = `🎃 The Midnight Manor ✦ made for you`;
const SOCIAL_DESCRIPTION = `Someone made you something cinematic. Open it with the sound on ✦`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
