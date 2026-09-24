import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta, SITE_URL } from "@/lib/seo";
import LegalPage, { LegalList, LegalP, LegalStrong, type LegalSection } from "@/components/legal/LegalPage";
import { BUSINESS, REFUND } from "@/lib/business";

export const metadata: Metadata = buildMeta({
  title: "Terms of Service | SubhSandesh",
  description:
    "Read the SubhSandesh Terms of Service for platform usage rules, pricing and payments, user responsibilities, and legal conditions.",
  alternates: { canonical: `${SITE_URL}/terms-of-service` },
});

const EFFECTIVE_DATE = "September 24, 2026";

const linkStyle = { color: "#2a0a0e", fontWeight: 700 } as const;

const SECTIONS: LegalSection[] = [
  {
    title: "1. Acceptance of Terms",
    body: (
      <>
        <LegalP>
          SubhSandesh (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a {BUSINESS.type.toLowerCase()} owned by{" "}
          {BUSINESS.proprietor}, operating the website {BUSINESS.website.replace("https://", "")}.
        </LegalP>
        <LegalP>
          By creating an account, accessing pages, or using any SubhSandesh feature, you agree to be bound by these
          Terms of Service and related policies. If you do not agree, you should not access or continue using the
          service.
        </LegalP>
      </>
    ),
  },
  {
    title: "2. Eligibility and Account Responsibility",
    body:
      "You are responsible for maintaining account confidentiality, safeguarding login credentials, and ensuring all activity under your account is authorized. You must provide accurate registration information and keep it updated over time.",
  },
  {
    title: "3. Service Scope",
    body:
      "SubhSandesh provides digital tools for creating, publishing, and sharing celebratory pages. Features may evolve over time, including updates, enhancements, temporary limitations, or replacement of specific modules when needed for performance and reliability.",
  },
  {
    title: "4. User Content and Conduct",
    body:
      "You are solely responsible for your uploaded content and behavior on the platform. You may not upload unlawful, harmful, defamatory, abusive, infringing, or deceptive content. We reserve the right to review, restrict, or remove material that violates these Terms or legal obligations.",
  },
  {
    title: "5. Intellectual Property",
    body:
      "All platform code, designs, trademarks, brand elements, and non-user proprietary assets belong to SubhSandesh or licensed providers. You retain rights to your own uploaded content, but grant us limited license to host and deliver it for service operation.",
  },
  {
    title: "6. Pricing and Payments",
    body: (
      <LegalList
        items={[
          "Many templates are free. For a paid template, the price is a one-time charge for publishing that page, and it is always shown to you before you pay. There are no subscriptions or recurring charges.",
          "Prices are shown in Indian Rupees (INR) unless a different currency is displayed at checkout. The amount on the payment screen is the total you pay.",
          <>
            Payments are processed securely by <LegalStrong>Razorpay</LegalStrong>, using cards, UPI, net banking or
            wallets. Your card, UPI and bank details are entered on Razorpay&rsquo;s checkout and are never received
            or stored by SubhSandesh.
          </>,
          "Once a page is paid for, editing it and publishing it again is free. Some pages can instead be unlocked with SubhSandesh points, where offered.",
          "If a price changes between when you see it and when you pay, you will be shown the new price and asked to confirm it before anything is charged.",
          "Non-payment, abuse, chargeback fraud, or policy violations may result in limitation or suspension of paid access.",
        ]}
      />
    ),
  },
  {
    title: "7. Prohibited Activities",
    body:
      "You agree not to misuse SubhSandesh through hacking attempts, malware injection, unauthorized scraping, reverse engineering, abusive automation, false reporting, or any activity that disrupts platform availability, user safety, or legal compliance.",
  },
  {
    title: "8. Availability and Changes",
    body:
      "We aim for reliable service, but uninterrupted access cannot be guaranteed at all times. Maintenance windows, infrastructure failures, third-party dependency outages, or force majeure events may temporarily impact availability.",
  },
  {
    title: "9. Suspension and Termination",
    body:
      "We may suspend or terminate accounts involved in policy violations, illegal conduct, security abuse, impersonation, or repeated misuse. You may also stop using the service at any time. Certain legal and security obligations may survive termination.",
  },
  {
    title: "10. Limitation of Liability",
    body:
      "To the maximum extent permitted by law, SubhSandesh is provided on an 'as-is' and 'as-available' basis. We are not liable for indirect, incidental, special, or consequential damages resulting from use, interruption, or inability to use the service. Our total liability for any claim relating to a payment is limited to the amount paid for the page concerned.",
  },
  {
    title: "11. Indemnification",
    body:
      "You agree to indemnify and hold SubhSandesh harmless from claims, losses, liabilities, and expenses arising from your misuse of the platform, policy violations, infringement claims, or unlawful content uploaded through your account.",
  },
  {
    title: "12. Governing Law and Dispute Resolution",
    body: `These Terms are governed by the laws of India. Any disputes shall be addressed through good-faith resolution first — please contact us before taking any other step. Disputes that cannot be resolved this way are subject to the exclusive jurisdiction of the courts at ${BUSINESS.address.city}, ${BUSINESS.address.state}.`,
  },
  {
    title: "13. Policy Updates",
    body:
      "We may modify these Terms as our services, laws, and product experience evolve. Updated versions become effective when published. Continued use after publication means you accept the revised Terms.",
  },
  {
    title: "14. Refunds and Delivery",
    body: (
      <LegalP>
        Pages are delivered digitally and instantly, as described in our{" "}
        <Link href="/shipping-policy" style={linkStyle}>
          Shipping &amp; Delivery Policy
        </Link>
        . Refunds — including a full refund if you are charged but your page is not delivered, requested within{" "}
        {REFUND.requestWindowDays} days — are covered by our{" "}
        <Link href="/refund-policy" style={linkStyle}>
          Refund &amp; Cancellation Policy
        </Link>
        , which forms part of these Terms.
      </LegalP>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      path="/terms-of-service"
      titleLead="Terms of"
      titleAccent="Service."
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          These Terms govern your use of SubhSandesh. By accessing or using our services, you agree to these
          conditions and commit to using the platform responsibly.
        </p>
      }
      sections={SECTIONS}
      cta={{
        title: "Need Clarification?",
        text: <p>For legal, policy, or usage questions, contact our team and we will assist you.</p>,
      }}
    />
  );
}
