import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// The fonts this template needs (Tinos, Courier Prime, Tiro Devanagari) are
// already loaded globally in app/layout.tsx as CSS variables, so this layout
// only carries route metadata.

const SLUG = "kundli-milan";
const TITLE = "Kundli Milan Report — Match Your 36 Gunas";
const DESCRIPTION =
  "A full Ashtakoota Milan report for the two of you: eight kootas, real nakshatras, actual yoni animals, and a computation sequence that takes itself completely seriously. Issued by the Office of the Registrar of Hearts. Astrologically meaningless.";

// Deliberately never states the score. The reveal belongs to whoever opens the
// link — a share preview that leaks "32/36" has already told the whole joke.
const OG_TITLE = "🔮 36 gunas matched";
const OG_DESCRIPTION =
  "Two kundlis have been submitted for matching. The eight kootas have been computed, the Mangal Dosha settled, and the remedies prescribed. Open the report to see how it landed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: OG_TITLE, description: OG_DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: OG_TITLE, description: OG_DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
