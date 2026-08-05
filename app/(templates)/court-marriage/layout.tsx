import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// Tinos / Courier Prime / Tiro Devanagari are loaded once in the root layout as
// CSS variables — nothing to load here.

const SLUG = "court-marriage";
const TITLE = "Court Marriage Certificate — A Keepsake Registration";
const DESCRIPTION =
  "Register your person at the Office of the Registrar of Hearts: a stamped, sealed, witness-signed marriage certificate you can download and share. Not valid for legal, tax, or visa purposes. Valid for everything that matters.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: "📜 Court Marriage Certificate", description: DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: "📜 Court Marriage Certificate", description: DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
