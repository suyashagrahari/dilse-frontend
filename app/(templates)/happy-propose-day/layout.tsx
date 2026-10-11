import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-propose-day";
const TITLE = 'Propose Day Website — A Ring Box, a Scratch-Card Question and a Runaway No';
const DESCRIPTION =
  'Propose online, beautifully: they open a velvet ring box, read your speech, scratch gold foil to reveal your question, and the “No” button runs away. You get an email the moment they say YES.';
const SOCIAL_TITLE = '💍 I have something to ask you';
const SOCIAL_DESCRIPTION = 'Open the box. Scratch. Say yes 💍';

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
