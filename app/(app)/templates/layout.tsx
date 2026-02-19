import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMeta({
  title: "Browse Gift Templates | Birthday, Valentine, Anniversary & More",
  description:
    "Explore 50+ beautifully designed gift templates for every occasion — birthdays, Valentine's Day, anniversaries, apologies, and more. Free to use.",
  keywords: [
    "gift templates",
    "birthday templates",
    "valentine templates",
    "anniversary templates",
    "free gift page maker",
  ],
  alternates: { canonical: `${SITE_URL}/templates` },
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Templates", url: `${SITE_URL}/templates` },
        ]}
      />
      <FAQJsonLd
        faqs={[
          {
            question: "How do I create a personalized gift page?",
            answer:
              "Choose a template, customize it with your message, photos, and music, then publish to get a shareable link.",
          },
          {
            question: "Is it free to create gift pages?",
            answer: "Yes! Creating and sharing personalized gift pages is completely free.",
          },
          {
            question: "Can I password-protect my gift page?",
            answer:
              "Yes, you can set a secret password on your gift page so only the recipient with the password can view the surprise tab.",
          },
        ]}
      />
      {children}
    </>
  );
}
