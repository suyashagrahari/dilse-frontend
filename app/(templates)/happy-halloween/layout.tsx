import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-halloween";
const TITLE = "Interactive Happy Halloween Card with Photos & Music";
const DESCRIPTION =
  "Send a spooky-cute Halloween card they can play: carve a pumpkin, read your letter by flashlight, brew a love potion and answer 'Will you be my boo?'";
const SOCIAL_TITLE = "🎃 A little haunted house was built for you";
const SOCIAL_DESCRIPTION = "Someone left something on your doorstep… open it with the lights off 👻";

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
