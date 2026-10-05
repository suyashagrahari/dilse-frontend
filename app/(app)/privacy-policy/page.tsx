import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import LegalPage, { LegalP, type LegalSection } from "@/components/legal/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = buildMeta({
  title: "Privacy Policy | SubhSandesh",
  description:
    "Read the SubhSandesh Privacy Policy to understand how we collect, use, protect, and process your data.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
});

const EFFECTIVE_DATE = "September 24, 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "1. Information We Collect",
    body:
      "When you use SubhSandesh, we may collect basic account details such as your name, email address, and technical information like browser type, device details, approximate location by IP, and usage analytics for security and performance. If you upload personal content (photos, messages, videos, music, or media assets), that content is used only to create and deliver your own celebration pages.",
  },
  {
    title: "2. How We Use Your Information",
    body:
      "We use information only for core functionality: account access, page creation, private link sharing, content management, payments, security, abuse prevention, and essential service communication. Your country, worked out from your IP address at the moment you view a price or pay, decides whether you are shown prices in Indian rupees or US dollars; we store only the country (never your city or IP address) on your account. Country lookups use IP geolocation data by DB-IP (db-ip.com), licensed under CC BY 4.0. We do not use your personal photos, private messages, or uploaded media for advertising, external marketing, profiling, or unrelated training purposes.",
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
      "We may use cookies or similar technologies for login persistence, preferences, analytics, and security monitoring. Specifically, we use Google Analytics 4 to understand which features are used and where people encounter difficulty, and Microsoft Clarity to measure interaction patterns such as clicks and scrolling. Clarity may record how a page is used during a visit; text masking is enabled so the contents of your messages and form fields are hidden, and this recording is not active on shared celebration pages that recipients open. We do not use advertising or cross-site tracking cookies. You can manage cookie behavior through your browser settings, though disabling some cookies may affect essential app functionality.",
  },
  {
    title: "6. Third-Party Services and Payments",
    body: (
      <>
        <LegalP>
          SubhSandesh may rely on trusted third-party services for hosting, analytics, authentication, storage,
          payments, and infrastructure support. These currently include Google (analytics and sign-in), Microsoft
          (Clarity product analytics), Amazon Web Services (hosting and media storage), and Razorpay (payments). These
          partners process data only to provide platform operations and are expected to maintain confidentiality and
          security standards consistent with their role.
        </LegalP>
        <LegalP>
          Payments are handled entirely by Razorpay. Card numbers, UPI IDs and bank details are entered on
          Razorpay&rsquo;s secure checkout and are never received or stored by SubhSandesh. We keep only a record of
          each payment — the amount, currency, date, status and Razorpay&rsquo;s reference IDs — to deliver your page,
          answer support questions and meet accounting and legal obligations.
        </LegalP>
      </>
    ),
  },
  {
    title: "7. Data Retention",
    body:
      "We retain your account data and content for as long as necessary to provide services and comply with legal obligations. Payment records are kept for as long as tax and accounting law requires. If you request deletion, we will remove or anonymize eligible information within a reasonable time, except where retention is required for fraud prevention, legal compliance, or legitimate security records.",
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
    body: (
      <LegalP>
        You may request access, correction, or deletion of your account information, subject to legal and
        operational limitations. You may also update most profile details directly from your account. For
        privacy-related requests, email{" "}
        <a href={`mailto:${BUSINESS.email}`} style={{ color: "#2a0a0e", fontWeight: 700 }}>
          {BUSINESS.email}
        </a>{" "}
        or use the Contact Us page, and include sufficient details for verification.
      </LegalP>
    ),
  },
  {
    title: "11. Policy Updates",
    body:
      "We may update this Privacy Policy from time to time to reflect legal, technical, or business changes. Updated versions will be published with a revised effective date. Continued use of SubhSandesh after updates indicates acceptance of the revised policy.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      path="/privacy-policy"
      titleLead="Privacy"
      titleAccent="Policy."
      effectiveDate={EFFECTIVE_DATE}
      intro={
        <p>
          SubhSandesh is built on trust. This Privacy Policy explains how we collect, use, store, and protect your
          information while you create and share meaningful celebration pages.
        </p>
      }
      sections={SECTIONS}
      cta={{
        title: "Contact for Privacy Questions",
        text: <p>If you have privacy concerns or requests, please reach out via our contact channel.</p>,
      }}
    />
  );
}
