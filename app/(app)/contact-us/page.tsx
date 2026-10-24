import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import ContactUsClient from "./ContactUsClient";

export const metadata: Metadata = buildMeta({
  title: "Contact Us | SubhSandesh",
  description:
    "Contact SubhSandesh from anywhere in the world: email support@subhsandesh.in or send a message for help with pages, payments, refunds, partnerships or feedback. We reply within 24 hours, 24×7.",
  alternates: { canonical: `${SITE_URL}/contact-us` },
});

export default function ContactUsPage() {
  return <ContactUsClient />;
}
