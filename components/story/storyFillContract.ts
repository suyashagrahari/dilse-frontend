// ─── What these components need from `useStoryFill` ──────────────────────────
//
// A STRUCTURAL MIRROR OF THE HOOK'S RESULT, NOT A SECOND SOURCE OF TRUTH.
//
// `hooks/useStoryFill.ts` owns the flow and exports `UseStoryFillResult`. This
// file declares only the slice of it that `components/story/` actually reads,
// and it exists for one reason: the hook and this directory are edited
// independently, and a shared component that imports the hook's own result type
// stops compiling every time someone is mid-way through adding a field to it.
//
// Because the declaration is structural, `UseStoryFillResult` satisfies it
// automatically — every editor keeps passing the hook result straight through
// and nothing needs to know this type exists. Arrays are `readonly` so a hook
// returning either mutable or frozen lists fits.
//
// If you are adding to the hook: nothing here needs touching unless the new
// thing is meant to be RENDERED by the starter, the review screen or the
// composer. If you are removing from the hook: the compile error will surface
// at the thirty call sites, which is where it should surface.

import type { StoryPeople, WireField, WireSchema } from "@/lib/ai-fill/types";

/** Mirrors `StoryFillMode`. `"manual"` is terminal: the panel renders nothing. */
export type StoryMode = "idle" | "composer" | "done" | "manual";

export interface StoryFill {
  /** Null while loading, and null forever for a template with no schema. */
  schema: WireSchema | null;
  schemaLoading: boolean;

  mode: StoryMode;
  setMode: (m: StoryMode) => void;

  story: string;
  setStory: (v: string) => void;
  people: StoryPeople;
  setPeople: (v: StoryPeople | ((prev: StoryPeople) => StoryPeople)) => void;

  generating: boolean;
  error: string | null;

  /** Fields that actually landed, with their labels. Drives the review list. */
  filledFields: readonly WireField[];
  /** Declared but still empty. Drives "these still need you". */
  missingFields: readonly WireField[];
  lastLanguage: string | null;

  generate: () => void;

  /** True only when signed in AND there is a built context worth reusing. */
  canUseMyStory: boolean;
  /** One tap: fill the whole form from what they already wrote. */
  useMyStory: () => void;
  /** In flight, specifically for `useMyStory` — shown on that button alone. */
  usingStory: boolean;
  /** e.g. `from “How we met”` — what the saved context was built out of. */
  contextLabel: string | null;

  /** Write one field from the review screen. The sender owns every word. */
  setFieldValue: (path: string, value: unknown) => void;
  /** Read whatever is at a path right now, for the review rows. */
  valueAt: (path: string) => unknown;

  /** A fill from the saved story landed without anyone pressing anything. */
  autoApplied: boolean;
  undoAutoApply: () => void;
  dismissAutoApplied: () => void;

  /** Step out without losing a keystroke. */
  dismiss: () => void;
}
