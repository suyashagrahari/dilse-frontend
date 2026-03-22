import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta } from "@/lib/seo";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export const metadata: Metadata = buildMeta({
  title: "Terms of Service | SubhSandesh",
  description:
    "Read the SubhSandesh Terms of Service for platform usage rules, user responsibilities, and legal conditions.",
});

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

const effectiveDate = "March 12, 2026";

export default function TermsOfServicePage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#f5ede6", color: "#2a0a0e", fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>

      <LuxuryMobileTopBrand />

      <section className="relative z-[1] max-w-5xl mx-auto px-4 md:px-6 pt-10 pb-24 md:pt-32">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3 text-center" style={{ color: "#c9a84c" }}>
          Legal
        </p>
        <h1 className="text-[40px] md:text-[70px] leading-[0.94] tracking-[-0.03em] text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Terms of
          <em style={{ color: "#c9a84c", fontStyle: "italic" }}> Service.</em>
        </h1>
        <p className="mt-4 text-center text-sm md:text-base" style={{ color: "#7a5555" }}>
          Effective Date: {effectiveDate}
        </p>
        <p className="mt-5 text-center text-base md:text-lg max-w-3xl mx-auto" style={{ color: "#7a5555" }}>
          These Terms govern your use of SubhSandesh. By accessing or using our services, you agree to these conditions and commit to using the platform responsibly.
        </p>

        <div className="mt-9 space-y-4">
          {[
            {
              title: "1. Acceptance of Terms",
              body:
                "By creating an account, accessing pages, or using any SubhSandesh feature, you agree to be bound by these Terms of Service and related policies. If you do not agree, you should not access or continue using the service.",
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
              title: "6. Paid or Premium Features",
              body:
                "If premium features are offered, pricing, billing terms, and refund eligibility will be clearly communicated at purchase time. Non-payment, abuse, chargeback fraud, or policy violations may result in limitation or suspension of premium access.",
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
                "To the maximum extent permitted by law, SubhSandesh is provided on an 'as-is' and 'as-available' basis. We are not liable for indirect, incidental, special, or consequential damages resulting from use, interruption, or inability to use the service.",
            },
            {
              title: "11. Indemnification",
              body:
                "You agree to indemnify and hold SubhSandesh harmless from claims, losses, liabilities, and expenses arising from your misuse of the platform, policy violations, infringement claims, or unlawful content uploaded through your account.",
            },
            {
              title: "12. Governing Law and Dispute Resolution",
              body:
                "These Terms are governed by applicable laws of India unless otherwise specified by mandatory legal requirements. Any disputes shall be addressed through good-faith resolution first, followed by lawful jurisdiction mechanisms where needed.",
            },
            {
              title: "13. Policy Updates",
              body:
                "We may modify these Terms as our services, laws, and product experience evolve. Updated versions become effective when published. Continued use after publication means you accept the revised Terms.",
            },
          ].map((section) => (
            <article key={section.title} className="rounded-3xl border p-5 md:p-7" style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.82)" }}>
              <h2 className="text-[28px] md:text-[36px] leading-[1.04] tracking-[-0.02em] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                {section.title}
              </h2>
              <p className="text-[15px] md:text-[17px] leading-[1.8]" style={{ color: "#7a5555" }}>
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border p-5 md:p-7 text-center" style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.82)" }}>
          <h3 className="text-[30px] md:text-[42px] leading-[1.04] tracking-[-0.02em] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Need Clarification?
          </h3>
          <p className="text-base md:text-lg" style={{ color: "#7a5555" }}>
            For legal, policy, or usage questions, contact our team and we will assist you.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact-us" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold" style={{ background: "#3d0c11", color: "#f5ede6", textDecoration: "none" }}>
              Contact Us
            </Link>
            <Link href="/privacy-policy" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold" style={{ background: "rgba(61,12,17,0.06)", border: "1px solid rgba(61,12,17,0.14)", color: "#2a0a0e", textDecoration: "none" }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
