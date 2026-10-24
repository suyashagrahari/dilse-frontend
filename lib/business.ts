// ── The registered business, in one place ────────────────────────────────────
//
// Razorpay (and its banking partner) verifies these against the merchant's KYC
// when reviewing an international-payments request. Every surface that prints
// them — Contact Us, About Us, the footer and each legal policy — reads from
// here, so they cannot drift apart. The address is the Bengaluru one on the
// Udyam certificate (UDYAM-KR-03-0764364). No phone number is published:
// support runs on email.

export const BUSINESS = {
  /** Trade name, exactly as registered. */
  name: "SubhSandesh",
  proprietor: "Suyash Agrahari",
  type: "Sole Proprietorship",
  /** Business commencement date. */
  established: "4 March 2026",
  address: {
    /** As on the Udyam certificate. */
    line1: "Parangi Palaya, Sector 2, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560102",
    country: "India",
  },
  email: "support@subhsandesh.in",
  hours: "24×7 — all days, including holidays",
  hoursShort: "24×7",
  website: "https://subhsandesh.in",
} as const;

export const BUSINESS_ADDRESS_LINES = [
  BUSINESS.address.line1,
  `${BUSINESS.address.city}, ${BUSINESS.address.state} ${BUSINESS.address.postalCode}`,
  BUSINESS.address.country,
] as const;

/** The policy pages, in the order every legal page and the footer list them. */
export const LEGAL_LINKS = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund & Cancellation Policy" },
  { href: "/shipping-policy", label: "Shipping & Delivery Policy" },
] as const;

/** Refund terms, quoted by the refund policy AND the Terms of Service. */
export const REFUND = {
  /** Days after payment within which a refund can be requested. */
  requestWindowDays: 7,
  /** Working days for an approved refund to reach the original payment method. */
  processingWorkingDays: "5–7",
  /** Working days within which a refund request gets a decision. */
  responseWorkingDays: 2,
} as const;
