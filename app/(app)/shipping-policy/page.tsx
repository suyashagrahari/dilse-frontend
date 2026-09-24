import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta, SITE_URL } from "@/lib/seo";
import LegalPage, { LegalList, LegalP, LegalStrong, type LegalSection } from "@/components/legal/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = buildMeta({
  title: "Shipping & Delivery Policy | SubhSandesh",
  description:
    "SubhSandesh sells digital celebration pages only. Nothing is shipped: your page is delivered online, instantly, anywhere in the world.",
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
});

const EFFECTIVE_DATE = "September 24, 2026";

const mail = (
  <a href={`mailto:${BUSINESS.email}`} style={{ color: "#2a0a0e", fontWeight: 700 }}>
    {BUSINESS.email}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    title: "1. Digital Products Only",
    body: (
      <LegalP>
        Everything {BUSINESS.name} sells is a <LegalStrong>digital service delivered online</LegalStrong>: a
        personalised celebration page hosted on our website, with a link you can share. We do not sell, ship or
        courier any physical goods, so there are <LegalStrong>no shipping charges</LegalStrong>, no courier partners
        and no delivery address is needed.
      </LegalP>
    ),
  },
  {
    title: "2. How Your Page Is Delivered",
    body: (
      <>
        <LegalP>Delivery happens on screen, the moment your page is published:</LegalP>
        <LegalList
          items={[
            "Free templates are delivered as soon as you press Publish.",
            "Paid templates are delivered as soon as your payment is confirmed — usually within seconds.",
            "Your shareable link appears immediately, with options to copy it, share it on WhatsApp and other apps, or download a QR code.",
            "Every page you publish is also saved in your profile, where you can open, edit and share it again at any time.",
          ]}
        />
      </>
    ),
  },
  {
    title: "3. Delivery Timeline",
    body: (
      <LegalP>
        Delivery is <LegalStrong>instant</LegalStrong>. In the rare case of a delay caused by a payment confirmation
        or a technical issue, your page will be delivered within <LegalStrong>24 hours</LegalStrong> of successful
        payment. If it is not, you are entitled to a full refund under our{" "}
        <Link href="/refund-policy" style={{ color: "#2a0a0e", fontWeight: 700 }}>
          Refund &amp; Cancellation Policy
        </Link>
        .
      </LegalP>
    ),
  },
  {
    title: "4. Where We Deliver",
    body:
      "Pages are delivered over the internet and can be created, opened and shared from anywhere in the world. Recipients only need the link — they do not need an account, an app or a payment to view a page.",
  },
  {
    title: "5. If You Have Not Received Your Page",
    body: (
      <>
        <LegalP>If your payment went through but you cannot see your page or its link:</LegalP>
        <LegalList
          items={[
            "Check your profile — published pages are listed there even if the share window was closed.",
            "Make sure you are signed in with the same account you used to pay.",
            <>
              Still missing? Email {mail} or call{" "}
              <a href={`tel:${BUSINESS.phone.tel}`} style={{ color: "#2a0a0e", fontWeight: 700 }}>
                {BUSINESS.phone.display}
              </a>{" "}
              with your account email and payment date. Support is available {BUSINESS.hoursShort}.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    title: "6. Availability of Delivered Pages",
    body:
      "Published pages stay online and reachable by their link unless you ask us to remove them, or they are removed for breaking our Terms of Service. Occasional maintenance or outages may make a page briefly unavailable; this does not affect your right to it.",
  },
  {
    title: "7. Changes to This Policy",
    body:
      "We may update this policy as the service changes. Updates are published on this page with a new effective date.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      path="/shipping-policy"
      titleLead="Shipping &"
      titleAccent="Delivery."
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          {BUSINESS.name} is a fully digital service. Nothing is shipped — your celebration page is delivered online,
          instantly, the moment it is published.
        </p>
      }
      sections={SECTIONS}
      cta={{
        title: "Questions About Delivery?",
        text: <p>Reach us any time at {mail} — support is available {BUSINESS.hoursShort}.</p>,
      }}
    />
  );
}
