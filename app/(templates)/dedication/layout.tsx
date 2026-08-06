import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "dedication";
// The song plays through the official embedded player, which stays visible on
// screen throughout. No audio is extracted, proxied, or played separately.
const TITLE = "Dedication — A Radio Show For One Person (Free)";
const DESCRIPTION =
  "Drag the needle through generated static, land on your own station, and hear a recorded voice introduce the song before it plays. Record the intros yourself in the booth. Free and mobile-first.";
const SOCIAL_TITLE = "98.3 — this one goes out to you.";
const SOCIAL_DESCRIPTION = "Find the station in the static. The voice between the songs is the real gift.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
