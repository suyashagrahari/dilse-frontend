import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-valentines-day";
const TITLE = "Valentine's Day Website — Admit Two, Seven Lanterns and the Forever Question";
const DESCRIPTION =
  "The Valentine's Day finale: tear an ADMIT TWO ticket, light a lantern for every day of the week, flip your Love Wrapped stats, open the gift box letter and ask “Be my Valentine forever?” — you get an email when they say yes.";
const SOCIAL_TITLE = '💘 Admit two. Tonight.';
const SOCIAL_DESCRIPTION = 'Admit two. One night. Forever 💘';

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
