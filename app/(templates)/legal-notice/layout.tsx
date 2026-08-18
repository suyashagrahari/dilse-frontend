import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "legal-notice";
const TITLE = "Legal Notice — Serve Them a Formal (Fake) Notice";
const DESCRIPTION =
  "A parody advocate's legal notice on non-judicial stamp paper. Numbered recitals, up to eight demands, and a seven-day clock — they must accept or contest every one, or it escalates to their mother.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: "⚖️ Legal Notice", description: DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: "⚖️ Legal Notice", description: DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
