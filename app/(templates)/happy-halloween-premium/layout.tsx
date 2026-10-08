import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-halloween-premium";
const TITLE = `Happy Halloween Premium — The Midnight Manor, a Haunted-Manor Surprise With Your Song`;
const DESCRIPTION =
  `A sealed invitation to a moonlit haunted manor: light memory candles, wake portraits of you two, let the spirit board spell their name, hear your voice on the spirit radio, and ask your question as the clock strikes twelve on your song.`;
const SOCIAL_TITLE = `🕯️ A sealed invitation to the Midnight Manor`;
const SOCIAL_DESCRIPTION = `Someone is waiting for you at midnight. Open it in the dark, sound on 🎧`;

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
