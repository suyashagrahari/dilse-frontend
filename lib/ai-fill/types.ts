// ─── AI form-fill — client-side wire types ───────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// Mirrors the wire half of `server/src/config/aiFill/types.ts`. Only the wire
// half: the field *declarations* live on the server and are fetched at runtime,
// so there is no list of templates or list of fields anywhere in this repo to
// fall out of step with the one on the other side. What is duplicated here is
// the shape of the envelope, which changes roughly never.

export type FieldKind = "text" | "longtext" | "list" | "date" | "number" | "enum";

export interface WireField {
  path: string;
  label: string;
  kind: FieldKind;
  max?: number;
  itemMax?: number;
  options?: readonly string[];
  guide: string;
  example?: string;
  required?: boolean;
}

export interface WireSchema {
  slug: string;
  audience: "partner" | "bestfriend" | "friend";
  fields: readonly WireField[];
}

/**
 * What `POST /api/story/fill` returns.
 *
 * `modelFilled` / `modelMissing` are DIAGNOSTICS — they describe what the model
 * wrote, not what the form shows. The lists the UI renders come from
 * `applyPatch`, which drops the model's value for any slot the sender already
 * typed into. Rendering these would credit the AI with the sender's own lines.
 *
 * The two pairs were originally both called `filled`/`missing`, one on each
 * side of the wire, meaning different things.
 */
export interface FillResponse {
  patch: Record<string, unknown>;
  modelFilled: string[];
  modelMissing: string[];
  language: string;
  languageName: string;
}

export interface StoryPeople {
  userName: string;
  partnerName: string;
  bestFriendName: string;
  partnerPronouns: string;
}

export interface StoryEntry {
  storyId: string;
  title: string;
  /** Absent in the list view — bodies are `select: false` and fetched by id. */
  text?: string;
  sourceSlug: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryContext {
  summary: string;
  language: string;
  languageName: string;
  tone: string;
  facts: string[];
  milestones: { label: string; when: string }[];
  insideJokes: string[];
  petNames: string[];
  avoid: string[];
  version: number;
  generatedAt: string;
  sourceStoryIds: string[];
}

export interface StoryProfile {
  people: StoryPeople;
  stories: StoryEntry[];
  context?: StoryContext;
  autoFillEnabled: boolean;
}

/** Kept in step with FILL_LIMITS on the server, so the UI can say "n left" honestly. */
export const STORY_LIMITS = {
  story: 4000,
  minStory: 20,
  name: 40,
  title: 120,
} as const;

/**
 * The placeholders the sample paragraph is written with.
 *
 * The composer renders these as clickable chips rather than as literal text,
 * so a sender who does not know what to write can tap through the sample and
 * end up with something true. They are substituted before the story is sent —
 * a story still containing `{{her}}` would have the model writing about a
 * person called "her".
 */
export const STORY_SLOTS = {
  you: "{{you}}",
  partner: "{{her}}",
  bestFriend: "{{bestfriend}}",
} as const;

export type StorySlotKey = keyof typeof STORY_SLOTS;
