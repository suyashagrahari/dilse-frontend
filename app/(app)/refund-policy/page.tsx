import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta, SITE_URL } from "@/lib/seo";
import LegalPage, { LegalList, LegalP, LegalStrong, type LegalSection } from "@/components/legal/LegalPage";
import { BUSINESS, REFUND } from "@/lib/business";

export const metadata: Metadata = buildMeta({
  title: "Refund & Cancellation Policy | SubhSandesh",
  description:
    "When SubhSandesh refunds a payment, how to request one, and how long it takes. One-time payments per page, no subscriptions.",
  alternates: { canonical: `${SITE_URL}/refund-policy` },
});

const EFFECTIVE_DATE = "September 24, 2026";

const mail = (
  <a href={`mailto:${BUSINESS.email}`} style={{ color: "#2a0a0e", fontWeight: 700 }}>
    {BUSINESS.email}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    title: "1. What You Pay For",
    body: (
      <>
        <LegalP>
          {BUSINESS.name} sells a digital service: publishing a personalised celebration page and giving you a link to
          share it. Many templates are free. For a paid template, you pay a <LegalStrong>one-time price for that
          page</LegalStrong>, shown on the payment screen before you pay. There are no subscriptions, renewals or
          recurring charges.
        </LegalP>
        <LegalP>
          Once a page is paid for, editing it and publishing it again is free. The page is delivered the moment
          payment succeeds — see our{" "}
          <Link href="/shipping-policy" style={{ color: "#2a0a0e", fontWeight: 700 }}>
            Shipping &amp; Delivery Policy
          </Link>
          .
        </LegalP>
      </>
    ),
  },
  {
    title: "2. When You Are Entitled to a Refund",
    body: (
      <>
        <LegalP>
          You will receive a full refund if you request it within {REFUND.requestWindowDays} days of payment and any
          of the following is true:
        </LegalP>
        <LegalList
          items={[
            "You were charged, but your page was not published or you never received its link.",
            "You were charged more than once for the same page.",
            "The amount charged is different from the price shown to you before payment.",
            "A technical fault on our side stops your published page from working, and we are unable to fix it within 3 days of your report.",
          ]}
        />
      </>
    ),
  },
  {
    title: "3. When a Refund Does Not Apply",
    body: (
      <>
        <LegalP>
          Because the service is digital and delivered instantly, a payment is not refundable once the page has been
          published and works as described, including when:
        </LegalP>
        <LegalList
          items={[
            "You have changed your mind after the page was published.",
            "The page contains a mistake in text, photos or dates that you entered — you can correct it and publish again at no extra cost.",
            "The recipient did not open, like or use the page.",
            "The page was removed because it broke our Terms of Service.",
            "The request is made more than " + REFUND.requestWindowDays + " days after payment.",
          ]}
        />
      </>
    ),
  },
  {
    title: "4. Cancellation",
    body: (
      <>
        <LegalP>
          You can cancel at any point before you complete payment by closing the payment window — nothing is
          charged. Because a page is delivered as soon as payment succeeds, a completed payment cannot be cancelled
          separately; if something went wrong, it is covered by the refund rules above.
        </LegalP>
        <LegalP>
          As nothing is billed on a recurring basis, there is no subscription to cancel. You can ask us to take down
          a published page at any time by writing to {mail}.
        </LegalP>
      </>
    ),
  },
  {
    title: "5. How to Request a Refund",
    body: (
      <>
        <LegalP>Email {mail} (or use our Contact Us page) with:</LegalP>
        <LegalList
          items={[
            "The email address of your SubhSandesh account.",
            "The link to the page, or the template name.",
            "The date of payment and, if you have it, the Razorpay payment ID from your receipt.",
            "What went wrong.",
          ]}
        />
        <LegalP>
          We reply to every request within {REFUND.responseWorkingDays} working days. Support is available{" "}
          {BUSINESS.hoursShort}.
        </LegalP>
      </>
    ),
  },
  {
    title: "6. How Refunds Are Paid",
    body: (
      <>
        <LegalList
          items={[
            <>
              Approved refunds are returned to the <LegalStrong>original payment method</LegalStrong> — the same
              card, UPI account, bank account or wallet — through Razorpay. We cannot refund to a different account.
            </>,
            <>
              Refunds are initiated within {REFUND.responseWorkingDays} working days of approval and usually reach
              you within <LegalStrong>{REFUND.processingWorkingDays} working days</LegalStrong>, depending on your
              bank or card issuer.
            </>,
            "Payments on international cards are refunded in the currency they were charged in. Your bank may convert the amount at a different exchange rate than the one used at purchase, so the amount credited can differ slightly; we have no control over this.",
            "If a page was unlocked with SubhSandesh points instead of money, an approved refund returns those points to your account.",
            "If your bank debited you but the payment failed, the amount is reversed automatically by Razorpay or your bank, usually within 5–7 working days. Contact us if it is not.",
          ]}
        />
      </>
    ),
  },
  {
    title: "7. Chargebacks",
    body:
      "If you believe a charge is wrong, please contact us first — we can usually resolve it faster than a bank dispute. Raising a chargeback for a page that was delivered and working may lead to the page and account being suspended while the dispute is reviewed.",
  },
  {
    title: "8. Changes to This Policy",
    body:
      "We may update this policy as the service changes. The version in force when you made a payment applies to that payment. Updates are published on this page with a new effective date.",
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      path="/refund-policy"
      titleLead="Refund &"
      titleAccent="Cancellation."
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          Clear, fair rules for every payment made on {BUSINESS.name}. If something goes wrong on our side, you get
          your money back.
        </p>
      }
      sections={SECTIONS}
      cta={{
        title: "Need a Refund?",
        text: <p>Write to {mail} or use the contact form — we reply within {REFUND.responseWorkingDays} working days.</p>,
      }}
    />
  );
}
