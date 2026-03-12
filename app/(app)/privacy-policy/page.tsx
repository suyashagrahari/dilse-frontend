import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta } from "@/lib/seo";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export const metadata: Metadata = buildMeta({
  title: "Privacy Policy | SubhSandesh",
  description:
    "Read the SubhSandesh Privacy Policy to understand how we collect, use, protect, and process your data.",
});

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

const effectiveDate = "March 12, 2026";

export default function PrivacyPolicyPage() {
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
          Privacy
          <em style={{ color: "#c9a84c", fontStyle: "italic" }}> Policy.</em>
        </h1>
        <p className="mt-4 text-center text-sm md:text-base" style={{ color: "#7a5555" }}>
          Effective Date: {effectiveDate}
        </p>
        <p className="mt-5 text-center text-base md:text-lg max-w-3xl mx-auto" style={{ color: "#7a5555" }}>
          SubhSandesh is built on trust. This Privacy Policy explains how we collect, use, store, and protect your information while you create and share meaningful celebration pages.
        </p>

        <div className="mt-9 space-y-4">
          {[
            {
              title: "1. Information We Collect",
              body:
                "When you use SubhSandesh, we may collect basic account details such as your name, email address, and technical information like browser type, device details, approximate location by IP, and usage analytics for security and performance. If you upload personal content (photos, messages, videos, music, or media assets), that content is used only to create and deliver your own celebration pages.",
            },
            {
              title: "2. How We Use Your Information",
              body:
                "We use information only for core functionality: account access, page creation, private link sharing, content management, security, abuse prevention, and essential service communication. We do not use your personal photos, private messages, or uploaded media for advertising, external marketing, profiling, or unrelated training purposes.",
            },
            {
              title: "3. Content Ownership and Responsibility",
              body:
                "You retain ownership of the original content you upload to SubhSandesh. By using the service, you grant us limited permission to host, process, and display your content only for delivering platform features requested by you. We do not claim ownership of your photos or messages, and we do not sell or commercially exploit your private content.",
            },
            {
              title: "4. Sharing and Visibility",
              body:
                "SubhSandesh pages are shareable by link. If you set a page as private or password-protected, we apply controls based on your selected settings. However, users who receive access may still copy or forward shared links. Please use privacy settings thoughtfully, especially for sensitive family, personal, or event-related information.",
            },
            {
              title: "5. Cookies and Similar Technologies",
              body:
                "We may use cookies or similar technologies for login persistence, preferences, analytics, and security monitoring. These tools help us understand platform performance and improve user experience. You can manage cookie behavior through your browser settings, though disabling some cookies may affect essential app functionality.",
            },
            {
              title: "6. Third-Party Services",
              body:
                "SubhSandesh may rely on trusted third-party services for hosting, analytics, authentication, storage, and infrastructure support. These partners process data only to provide platform operations and are expected to maintain confidentiality and security standards consistent with their role.",
            },
            {
              title: "7. Data Retention",
              body:
                "We retain your account data and content for as long as necessary to provide services and comply with legal obligations. If you request deletion, we will remove or anonymize eligible information within a reasonable time, except where retention is required for fraud prevention, legal compliance, or legitimate security records.",
            },
            {
              title: "8. Security Practices",
              body:
                "We implement technical and organizational safeguards designed to protect your information against unauthorized access, misuse, loss, or disclosure. While we continuously improve our security controls, no system can guarantee absolute protection. We encourage users to use strong passwords and responsible sharing practices.",
            },
            {
              title: "9. Children’s Privacy",
              body:
                "SubhSandesh is not intended for unsupervised use by children below the legally applicable age in your region. If we become aware that personal data was submitted by a minor without lawful consent where required, we will take reasonable steps to remove such data from our active systems.",
            },
            {
              title: "10. Your Rights and Choices",
              body:
                "You may request access, correction, or deletion of your account information, subject to legal and operational limitations. You may also update most profile details directly from your account. For privacy-related requests, please contact us through the Contact Us page and include sufficient details for verification.",
            },
            {
              title: "11. Policy Updates",
              body:
                "We may update this Privacy Policy from time to time to reflect legal, technical, or business changes. Updated versions will be published with a revised effective date. Continued use of SubhSandesh after updates indicates acceptance of the revised policy.",
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
            Contact for Privacy Questions
          </h3>
          <p className="text-base md:text-lg" style={{ color: "#7a5555" }}>
            If you have privacy concerns or requests, please reach out via our contact channel.
          </p>
          <div className="mt-5">
            <Link href="/contact-us" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold" style={{ background: "#3d0c11", color: "#f5ede6", textDecoration: "none" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
