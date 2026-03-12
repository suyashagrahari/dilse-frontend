import type { Metadata } from "next";
import { buildMeta } from "@/lib/seo";
import ContactUsClient from "./ContactUsClient";

export const metadata: Metadata = buildMeta({
  title: "Contact Us | SubhSandesh",
  description:
    "Get in touch with SubhSandesh for support, partnerships, and product feedback.",
});

export default function ContactUsPage() {
  return <ContactUsClient />;
}
