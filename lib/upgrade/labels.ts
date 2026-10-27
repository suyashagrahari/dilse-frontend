// ─── Upgrade offer words for the admin screens ───────────────────────────────
//
// One place for how a funnel step and a person's outcome read, so super admin
// → Upgrades and a user's Upgrades tab say the same thing.

export type UpgradeStepName =
  | "shown" | "try_clicked" | "preview_ready" | "preview_failed" | "edit_opened" | "back_to_free"
  | "free_chosen" | "dismissed" | "free_published" | "premium_published";

export type UpgradeOutcome = "premium" | "free" | "tried" | "previewed_left" | "chose_free" | "dismissed" | "saw";

/** The free templates that carry an offer. */
export const FREE_NAME: Record<string, string> = {
  "bouquet-gf": "Build a Bouquet",
  "birthday-gf": "Birthday GF",
  "happy-birthday": "Happy Birthday",
  "apology-dashboard": "Apology Dashboard",
  "missyou-gf": "Miss You GF",
  "miss-you": "Miss You",
  proposal: "Will You Marry Me?",
  "will-you-be-mine": "Will You Be Mine?",
  "happy-anniversary": "Happy Anniversary",
  "happy-halloween": "Happy Halloween",
};
export const freeName = (slug: string) => FREE_NAME[slug] ?? slug;

export const STEP_LABEL: Record<UpgradeStepName, { text: string; emoji: string }> = {
  shown: { text: "Saw the offer", emoji: "👀" },
  try_clicked: { text: "Pressed Preview Premium", emoji: "✨" },
  preview_ready: { text: "Premium preview opened", emoji: "🪄" },
  preview_failed: { text: "Preview failed", emoji: "⚠️" },
  edit_opened: { text: "Edited the premium one", emoji: "✏️" },
  back_to_free: { text: "Went back to free from the preview", emoji: "↩️" },
  free_chosen: { text: "Chose free at the offer", emoji: "🆓" },
  dismissed: { text: "Closed the offer", emoji: "✖️" },
  free_published: { text: "Published the free one", emoji: "📨" },
  premium_published: { text: "Published PREMIUM", emoji: "👑" },
};

/** The journey a step belongs to, in the order it happens. */
export const STEP_ORDER: UpgradeStepName[] = [
  "shown", "try_clicked", "preview_ready", "edit_opened", "premium_published",
  "free_chosen", "back_to_free", "dismissed", "free_published", "preview_failed",
];

export const OUTCOME: Record<UpgradeOutcome, { text: string; tone: string }> = {
  premium: { text: "Bought Premium", tone: "#1e7a4b" },
  free: { text: "Published free", tone: "#7f5f5f" },
  chose_free: { text: "Chose free", tone: "#b7791f" },
  previewed_left: { text: "Previewed, left", tone: "#6d4ad1" },
  tried: { text: "Tried Premium", tone: "#6d4ad1" },
  dismissed: { text: "Closed the offer", tone: "#9a7070" },
  saw: { text: "Only saw it", tone: "#9a7070" },
};
