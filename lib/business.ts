// ── The registered business, in one place ────────────────────────────────────
//
// Razorpay (and its banking partner) verifies these against the merchant's KYC
// when reviewing an international-payments request, and rejects an application
// whose website shows a different name, address or phone than the one on file.
// Every surface that prints them — Contact Us, About Us, the footer and each
// legal policy — reads from here, so they cannot drift apart. Change a value
// here only if it has changed on the Razorpay account too.

export const BUSINESS = {
  /** Trade name, exactly as registered. */
  name: "SubhSandesh",
  proprietor: "Suyash Agrahari",
  type: "Sole Proprietorship",
  /** Business commencement date. */
  established: "4 March 2026",
  address: {
    line1: "Parangi Palaya, Sector 2, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560102",
    country: "India",
  },
  phone: { display: "+91 80904 23107", tel: "+918090423107" },
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
