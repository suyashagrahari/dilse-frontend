import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "train-ticket";
const TITLE = "Train Ticket — Check Their PNR Status";
const DESCRIPTION =
  "Send someone a PNR number and a link that says check your status. The waitlist ticks down — WL 47, WL 23, WL 8, RAC 4 — and then it confirms, with your seats together. A parody reservation slip and a running status of the whole relationship.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: "🎫 Check your PNR status", description: DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: "🎫 Check your PNR status", description: DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
