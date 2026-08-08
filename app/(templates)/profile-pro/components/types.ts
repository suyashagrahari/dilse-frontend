// ─── Endorsements — frozen data contract ─────────────────────────────────────
//
// A relationship rendered as a career profile: headline, experience, skills with
// endorsement counts, and recommendations.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
//
// Nothing here imitates the dominant professional-network product. No two-letter
// square mark, no wordmark, no corporate blue, and none of that company's or its
// parent's names anywhere — not in copy, file names, class names, alt text, or
// these comments. The chrome is the sender's own name with a plain line-art mark
// and a deep teal accent (#0E6B6B).
//
// ── THE ONE RULE THAT MATTERS MORE THAN THE UI ───────────────────────────────
//
// ENDORSING IS ONE TAP AND ONE NAME FIELD. Nothing else. Ever.
//
// This is the lowest-friction contribution loop in the product, and that is not
// a nice property, it IS the template: the certificate needs a drawn signature,
// the product needs four fields, a review needs a paragraph — this needs a
// thumb. Completion runs near 90% instead of 40%, which is the difference
// between four friends contributing and fifteen.
//
// A comment box on the endorse flow looks harmless and would halve that. The
// recommendation flow below already exists for people who want to write; that is
// the second lane, and it is deliberately heavier. Anything that adds a step to
// lane one is a regression even when it ships bug-free.

export interface ProfilePerson {
  name: string;
  /** "Professional Girlfriend | Serial Overthinker" — 2 lines max. */
  headline: string;
  location: string;
  photoUrl: string;
  bannerUrl?: string;
  /** "1 connection" — free text, never a count to compute with. */
  connections: string;
  /** "· 1st" degree badge beside the name. */
  degreeNote?: string;
  /** "Open to: being right" — renders in an accent-tinted box when present. */
  openTo?: string;
}

export interface ProfileExperience {
  role: string;
  company: string;
  /** "Full-time" */
  type: string;
  /** "Mar 2023 – Present" */
  duration: string;
  location: string;
  logoUrl?: string;
  /** Jokes with straight faces: "Reduced his overthinking by 12% QoQ". */
  bullets: string[];
}

export interface ProfileEducation {
  school: string;
  degree: string;
  years: string;
  note?: string;
}

export interface ProfileCertification {
  name: string;
  /** "Issued by Herself" */
  issuer: string;
  date: string;
}

/**
 * A skill and its endorsement count.
 *
 * ── THE JOKE IS IN THE NUMBERS, SO THE STYLING MUST BE FLAT ──
 *
 * "Punctuality (2)" gets the IDENTICAL visual treatment as "Being Right (47)".
 * No colour ramp, no bar, no de-emphasis on the low one, no "top endorsed"
 * flourish beyond the `isTop3` pill. The contrast between the two numbers in the
 * same deadpan row IS the comedy; any styling that editorialises it explains the
 * joke and kills it.
 *
 * `endorsements: 0` renders the row with NO count and NO endorser line — just
 * the label and the Endorse button. Never the string "0 endorsements", which
 * reads as a failure rather than an opening.
 */
export interface ProfileSkill {
  id: string;
  label: string;
  endorsements: number;
  /** Names behind the overlapping avatars: "Sneha, Karan and 45 others". */
  topEndorsers: string[];
  /** Shows a small accent-tinted "Top skill" pill. First three only. */
  isTop3?: boolean;
}

export interface Recommendation {
  id: string;
  author: string;
  /** "Product Manager | Professional Third Wheel" */
  authorHeadline: string;
  /** "Sneha worked with Meera on the same team" — 12px italic. */
  relationship: string;
  text: string;
  ago: string;
  status: "pending" | "published";
}

export interface ProfileProData {
  person: ProfilePerson;
  about: string[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  skills: ProfileSkill[];
  recommendations: Recommendation[];
  certifications?: ProfileCertification[];
  /** Shown to friends on both contributor landings. */
  contributorPrompt: string;
}

/** Lane one. ONE field. If this object ever grows, something has gone wrong. */
export const ENDORSE_LIMITS = {
  author: 30,
  /** The optional, COLLAPSED-BY-DEFAULT suggest-a-skill field. Not on first paint. */
  suggestion: 40,
} as const;

/** Lane two — deliberately heavier, for people willing to write. */
export const RECOMMEND_LIMITS = {
  author: 30,
  headline: 60,
  text: 600,
} as const;

/** The canned relationship options on the recommendation form. */
export const RELATIONSHIP_OPTIONS = [
  "We worked together on the same team",
  "We studied together",
  "I managed them directly",
  "They managed me directly",
  "We are related, unfortunately",
] as const;

/** Which recommendations tab is showing. "Given" is a joke empty state. */
export type RecommendationTab = "received" | "given";
