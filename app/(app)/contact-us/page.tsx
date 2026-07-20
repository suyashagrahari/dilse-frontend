import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import ContactUsClient from "./ContactUsClient";

export const metadata: Metadata = buildMeta({
  title: "Contact Us | SubhSandesh",
  description:
    "Get in touch with SubhSandesh for support, partnerships, and product feedback.",
  alternates: { canonical: `${SITE_URL}/contact-us` },
});

export default function ContactUsPage() {
  return <ContactUsClient />;
}
