// ─── useStoryFill — the one hook every template editor calls ─────────────────
//
// Thirty editors, one AI flow. Everything template-specific arrives as
// arguments: the slug (which the server turns into a field list), the demo
// object (which is how "the sender typed here" is established) and the current
// form state. Nothing in this file knows what a love-gf page looks like.
//
// ── THE THREE RULES ──────────────────────────────────────────────────────────
//
// 1. A TEMPLATE WITHOUT A SCHEMA MUST BEHAVE EXACTLY AS IT DOES TODAY. The
//    schema fetch 404s for those, `schema` stays null, and every consumer
//    renders nothing. Adding this hook to an editor is therefore safe before
//    the server has a config for it.
//
// 2. NOTHING HERE EVER THROWS. Every failure becomes a sentence a person can
//    read, and the manual path stays open behind it. The AI is an accelerator
//    for a form that already works; it is never the only way through.
//
// 3. AI NEVER OVERWRITES WHAT THE SENDER TYPED. Enforced by `applyPatch` via
//    the `touched` set that `diffTouched` derives from the demo defaults.

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { applyPatch, diffTouched } from "@/lib/ai-fill/applyPatch";
import {
  fetchStoryProfile,
  fetchStorySchema,
  postStoryFill,
  saveStoryToProfile,
} from "@/lib/ai-fill/api";
import {
  STORY_LIMITS,
  STORY_SLOTS,
  type StoryPeople,
  type StoryProfile,
  type WireSchema,
} from "@/lib/ai-fill/types";

/**
 * Where the sender is in the flow.
 *
 * `"manual"` is terminal and deliberate: it means they said no, and the UI
 * must render nothing at all from that point on. It is not an error state and
 * it does not clear anything they typed, so re-opening the panel is lossless.
 */
export type StoryFillMode = "idle" | "composer" | "done" | "manual";

const EMPTY_PEOPLE: StoryPeople = {
  userName: "",
  partnerName: "",
  bestFriendName: "",
  partnerPronouns: "",
};

/**
 * What each placeholder becomes when the sender left that name blank.
 *
 * A story that still contains `{{her}}` when it reaches the model produces a
 * page about a person called "her", so substitution is not optional and there
 * has to be an answer for the empty case. These are the answers.
 */
const NEUTRAL: Record<keyof typeof STORY_SLOTS, string> = {
  you: "me",
  partner: "my partner",
  bestFriend: "my best friend",
};

/**
 * Replace `{{you}}` / `{{her}}` / `{{bestfriend}}` with the real names.
 *
 * Exported because the composer needs the same substitution to show the sender
 * a preview of what they are about to send — two implementations of this would
 * drift and the sender would be shown something other than what was sent.
 */
export function resolveStorySlots(text: string, people: StoryPeople): string {
  const map: Record<string, string> = {
    [STORY_SLOTS.you]: people.userName.trim() || NEUTRAL.you,
    [STORY_SLOTS.partner]: people.partnerName.trim() || NEUTRAL.partner,
    [STORY_SLOTS.bestFriend]: people.bestFriendName.trim() || NEUTRAL.bestFriend,
  };
  return text.replace(/\{\{(?:you|her|bestfriend)\}\}/g, (token) => map[token] ?? token);
}

/**
 * Turn a failed call into something a person can act on.
 *
 * The two exact strings for 429 and 503 are product copy, not paraphrase: they
 * both have to end by pointing at the way forward, because a dead end here is
 * a sender who closes the tab on a page they were about to publish.
 */
function messageFor(status: number, serverError: string): string {
  switch (status) {
    case 0:
      return "Couldn't reach the server — check your connection and try again.";
    case 400:
      return "There wasn't enough to go on — a couple of sentences about the two of you is plenty.";
    case 401:
    case 403:
      return "You'll need to sign in again for that — or just fill this in yourself.";
    case 422:
      return "That didn't give the writer enough to work with — try describing one thing that actually happened.";
    case 429:
      return "You've generated a lot just now — try again in a few minutes.";
    case 503:
      return "AI isn't available right now — you can still fill this in yourself.";
    default:
      return serverError || "Something went wrong — you can still fill this in yourself.";
  }
}

/** How much of the first line a derived story title is allowed to keep. */
const TITLE_TARGET = 60;

/**
 * A title for a story the sender never titled.
 *
 * The saved story is shown back to them later ("from 'The night we…'"), so the
 * label has to read like something a person wrote. First line, cut at a word
 * boundary — cutting mid-word produces "The night we we" and reads like a bug.
 */
function deriveStoryTitle(text: string): string {
  const firstLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) return "My story";
  if (firstLine.length <= TITLE_TARGET) return firstLine.slice(0, STORY_LIMITS.title);

  const cut = firstLine.slice(0, TITLE_TARGET);
  const boundary = cut.lastIndexOf(" ");
  // Only honour the boundary if it leaves a usable title; a single 60-character
  // "word" (a URL, a language without spaces) has no boundary worth finding.
  const head = (boundary > 24 ? cut.slice(0, boundary) : cut).replace(/[\s,;:.!?-]+$/, "");
  return `${head}…`.slice(0, STORY_LIMITS.title);
}

/**
 * A detached copy of the form state, for the undo snapshot.
 *
 * `applyPatch` is pure and the editors replace their state object rather than
 * mutating it, so holding the reference would very probably be enough. "Very
 * probably" is not the standard for the button whose entire job is giving the
 * sender their page back, hence the copy. Falls back to the reference if the
 * value is somehow not cloneable — a slightly weaker undo beats a throw.
 */
function snapshotOf<T>(value: T): T {
  try {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : (JSON.parse(JSON.stringify(value)) as T);
  } catch {
    return value;
  }
}

/**
 * The render-fresh values the auto-fill effect and `persistStory` need.
 *
 * Both of them read state at a moment that has nothing to do with the render
 * that created them: the effect resolves a network call some seconds later, and
 * `persistStory` is called from a publish handler that may have been captured
 * long before the sender signed in. Depending on these values directly would
 * mean either a stale closure or an effect that re-runs (and so aborts itself)
 * on every keystroke, so they are mirrored into a ref that is refreshed after
 * every commit.
 */
interface LiveValues<T extends object> {
  form: T;
  demo: T;
  people: StoryPeople;
  story: string;
  onFilled: (next: T) => void;
}

export interface UseStoryFillOptions<T extends object> {
  /** Template slug. The server turns this into the field list. */
  slug: string;
  /** The template's `DEMO_*` constant. Anything differing from it counts as the sender's own. */
  demo: T;
  /** The editor's live form state (`mf`). */
  current: T;
  /** Called with the merged result. The editor passes this straight to `setMf`. */
  onFilled: (next: T) => void;
  /** Set false to keep the hook completely inert — no fetches, no UI. */
  enabled?: boolean;
  /**
   * Fill the form from the sender's saved story on mount, without being asked.
   * Defaults to TRUE — see the effect below for the five preconditions and for
   * why silence is the only acceptable failure mode. Set false for an editor
   * where landing on pre-written content would be wrong.
   */
  autoApply?: boolean;
}

export interface UseStoryFillResult {
  /** Null until loaded, and null forever if this template has no schema. */
  schema: WireSchema | null;
  schemaLoading: boolean;

  mode: StoryFillMode;
  setMode: (m: StoryFillMode) => void;

  story: string;
  setStory: (v: string) => void;
  people: StoryPeople;
  setPeople: (v: StoryPeople | ((prev: StoryPeople) => StoryPeople)) => void;

  generating: boolean;
  error: string | null;

  /** Paths actually written, as reported by `applyPatch` — not by the server. */
  filled: string[];
  /** Declared paths still empty after the merge. Drives the "still needs you" list. */
  missing: string[];
  lastLanguage: string | null;

  generate: () => void;
  applyFromContext: () => void;

  /** True only when signed in AND the profile has a built context to reuse. */
  hasProfileContext: boolean;
  /** e.g. "from 'How we met'" — what the saved context was built out of. */
  contextLabel: string | null;

  /**
   * True when a fill from the saved story landed on its own, without the
   * sender pressing anything. The one thing a UI must do with this is TELL
   * THEM — a form that quietly rewrote itself is indistinguishable from a bug,
   * and the banner is what turns it into "we remembered".
   */
  autoApplied: boolean;
  /**
   * Put the form back exactly as it was before the auto-fill.
   *
   * Restores a snapshot taken immediately before the merge, so it is exact —
   * it does not try to work out which fields the AI wrote and blank them, which
   * would be a second guess layered on the first one.
   */
  undoAutoApply: () => void;
  /** Accept the auto-fill: the banner goes, every word of it stays. */
  dismissAutoApplied: () => void;

  /**
   * Save the story the sender wrote into their profile, so the next template
   * they open already knows them. Called on publish.
   *
   * Never throws and never rejects: awaiting it cannot break a publish.
   */
  persistStory: (opts?: { title?: string }) => Promise<void>;

  /** Step out of the flow without losing a word of what was typed. */
  dismiss: () => void;
  /** Back to the beginning, everything cleared. */
  reset: () => void;
}

export function useStoryFill<T extends object>(
  opts: UseStoryFillOptions<T>
): UseStoryFillResult {
  const { slug, demo, current, onFilled, enabled = true, autoApply = true } = opts;

  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [schema, setSchema] = useState<WireSchema | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);

  const [profile, setProfile] = useState<StoryProfile | null>(null);

  const [mode, setMode] = useState<StoryFillMode>("idle");
  const [story, setStory] = useState("");
  const [people, setPeople] = useState<StoryPeople>(EMPTY_PEOPLE);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filled, setFilled] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [lastLanguage, setLastLanguage] = useState<string | null>(null);
  const [autoApplied, setAutoApplied] = useState(false);

  // ── Render-fresh mirrors ───────────────────────────────────────────────────
  //
  // Written after every commit and never read during render, which is what
  // `react-hooks/refs` requires. See `LiveValues` for why they exist at all.
  const live = useRef<LiveValues<T>>({ form: current, demo, people, story, onFilled });
  useEffect(() => {
    live.current = { form: current, demo, people, story, onFilled };
  });

  /** One auto-fill attempt per mount, StrictMode's second pass included. */
  const autoRan = useRef(false);
  /** Survives StrictMode's fake unmount, unlike a per-effect-run flag. */
  const autoAlive = useRef(true);
  /** The form exactly as it was the instant before the auto-fill landed. */
  const preAutoFill = useRef<T | null>(null);
  /** The story text last written to the profile, so a double publish saves once. */
  const persistedStory = useRef<string | null>(null);

  useEffect(() => {
    autoAlive.current = true;
    return () => {
      autoAlive.current = false;
    };
  }, []);

  // ── The schema, once ───────────────────────────────────────────────────────
  //
  // No state is set synchronously in this effect body: `react-hooks/
  // set-state-in-effect` forbids it, and every write below sits behind an
  // await. `loadingSchema` starts true and is only ever turned off from inside
  // the async continuation, so there is no render where it lies.
  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    const controller = new AbortController();

    const run = async () => {
      const res = await fetchStorySchema(slug, controller.signal);
      if (!alive) return;
      // A miss of any kind is treated identically: no schema, no UI, editor
      // unchanged. There is nothing useful to say to a sender about it.
      setSchema(res.ok ? res.data : null);
      setLoadingSchema(false);
    };

    void run();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [slug, enabled]);

  // ── The profile, once, only when signed in ─────────────────────────────────
  //
  // Names already known are merged into the empty slots only, so a sender who
  // started typing before this landed keeps what they typed.
  useEffect(() => {
    if (!enabled || !isAuthenticated || !accessToken) return;

    let alive = true;
    const controller = new AbortController();

    const run = async () => {
      const res = await fetchStoryProfile(accessToken, controller.signal);
      if (!alive || !res.ok) return;

      setProfile(res.data);

      const p = res.data.people;
      if (!p) return;
      setPeople((prev) => ({
        userName: prev.userName || p.userName || "",
        partnerName: prev.partnerName || p.partnerName || "",
        bestFriendName: prev.bestFriendName || p.bestFriendName || "",
        partnerPronouns: prev.partnerPronouns || p.partnerPronouns || "",
      }));
    };

    void run();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [enabled, isAuthenticated, accessToken]);

  const hasProfileContext = Boolean(
    enabled && isAuthenticated && profile?.context && profile.context.summary
  );

  const contextLabel = useMemo(() => {
    const ctx = profile?.context;
    if (!ctx) return null;
    const ids = new Set(ctx.sourceStoryIds ?? []);
    const titles = (profile?.stories ?? [])
      .filter((s) => ids.has(s.storyId))
      .map((s) => s.title)
      .filter(Boolean);
    if (titles.length === 0) return "from your saved story";
    if (titles.length === 1) return `from “${titles[0]}”`;
    return `from “${titles[0]}” and ${titles.length - 1} more`;
  }, [profile]);

  // ── Auto-fill from the saved story ─────────────────────────────────────────
  //
  // "Whenever the user uses any template it fills the form automatically using
  // that context." Nobody presses anything: the sender who told us their story
  // once opens their fourth template and it is already written.
  //
  // ── THE FIVE PRECONDITIONS, AND WHY EACH ONE IS LOAD-BEARING ───────────────
  //
  //   1. `enabled` and `autoApply`, and a schema actually loaded. Without a
  //      schema there is nothing to write into and no `touched` set to protect.
  //   2. Signed in with a token. The context lives on their profile.
  //   3. The profile has a built context AND `autoFillEnabled !== false` —
  //      the second is the sender's own switch and it outranks this feature.
  //   4. THE FORM IS PRISTINE: `diffTouched(...).size === 0`. This is the one
  //      that decides whether the feature is a delight or a disaster. Nobody
  //      asked for this fill. Landing it on top of a form somebody is mid-way
  //      through typing means their sentence is gone — and `applyPatch`'s
  //      `touched` guard would spare the fields they finished, but the message
  //      it sends is "this page rewrites itself while you work", which is the
  //      one thing you cannot walk back. Unprompted writing is only ever
  //      allowed onto a blank page. If they have typed a single word, we do
  //      nothing and the ordinary StoryStarter offers it to them instead.
  //   5. Once per mount, ref-guarded, so StrictMode's second pass is a no-op.
  //
  // The pristine check runs TWICE — once before the request and once on the
  // response — because the sender is free to start typing during the second or
  // two the model takes, and an answer computed against a blank form must not
  // land on a form that is no longer blank.
  //
  // ── FAILURE IS A NON-EVENT ─────────────────────────────────────────────────
  //
  // Any failure — offline, 500, rate limit, expired token, a patch that merges
  // to nothing — returns in silence. No error, no toast, no banner. They did
  // not ask for this, so there is nothing to apologise for, and interrupting
  // someone who has just opened an editor to tell them something they never
  // requested did not happen is pure noise.
  //
  // Deliberately no AbortController: the ref guard means an aborted attempt is
  // never retried, so cancelling on StrictMode's fake unmount would cancel the
  // only attempt there is. `autoAlive` (which survives that fake unmount)
  // gates every write instead, and a POST outliving a real unmount touches
  // nothing.
  useEffect(() => {
    if (!enabled || !autoApply) return;
    if (autoRan.current) return;
    if (!schema) return;
    if (!isAuthenticated || !accessToken) return;
    if (!profile?.context?.summary) return;
    if (profile.autoFillEnabled === false) return;
    if (diffTouched(live.current.form, live.current.demo, schema).size !== 0) return;

    autoRan.current = true;

    const run = async () => {
      const res = await postStoryFill(
        { slug, useContext: true, people: live.current.people },
        accessToken
      );
      if (!autoAlive.current || !res.ok) return;

      const { form, demo: defaults, onFilled: apply } = live.current;
      const touched = diffTouched(form, defaults, schema);
      if (touched.size !== 0) return;

      const result = applyPatch(form, schema, res.data.patch, { touched });
      if (result.noop) return;

      // Snapshot first. Undo has to hand back the exact page they had, and the
      // only moment that page exists is right now.
      preAutoFill.current = snapshotOf(form);

      apply(result.next);
      setFilled(result.filled);
      setMissing(result.missing);
      setLastLanguage(res.data.languageName || res.data.language || null);
      setAutoApplied(true);
      // The starter would otherwise open over a form that is already written
      // and ask whether they would like it filled in. `"manual"` is what keeps
      // this silent; the banner is now the only thing that speaks.
      setMode("manual");
    };

    void run();
  }, [enabled, autoApply, schema, isAuthenticated, accessToken, profile, slug]);

  /**
   * The shared tail of both generate paths.
   *
   * `filled` and `missing` come from `applyPatch`, NOT from the server's
   * `FillResponse`. The server reports what the model wrote; `applyPatch`
   * reports what actually landed after the sender's own typing was protected.
   * Showing the server's list would credit the AI with lines the sender wrote.
   */
  const run = useCallback(
    async (body: { story?: string; useContext?: boolean }) => {
      if (!schema || generating) return;

      setGenerating(true);
      setError(null);
      // An explicit generate supersedes whatever the auto-fill did; leaving its
      // banner up would attribute this fill to something the sender didn't do.
      setAutoApplied(false);

      const res = await postStoryFill({ slug, ...body, people }, accessToken);

      if (!res.ok) {
        setGenerating(false);
        setError(messageFor(res.status, res.error));
        return;
      }

      const result = applyPatch(current, schema, res.data.patch, {
        touched: diffTouched(current, demo, schema),
      });

      setGenerating(false);
      setFilled(result.filled);
      setMissing(result.missing);
      setLastLanguage(res.data.languageName || res.data.language || null);

      if (result.noop) {
        // Not an error, and saying "done!" over an unchanged form would be a
        // lie the sender can see. Point them at the form instead.
        setError("Nothing new to add — everything it could write, you'd already written.");
        setMode("done");
        return;
      }

      onFilled(result.next);
      setMode("done");
    },
    [schema, generating, slug, people, accessToken, current, demo, onFilled]
  );

  const generate = useCallback(() => {
    const resolved = resolveStorySlots(story, people).trim();
    if (resolved.length < STORY_LIMITS.minStory) {
      setError(
        `A little more, please — about ${STORY_LIMITS.minStory} characters is enough to start from.`
      );
      return;
    }
    void run({ story: resolved.slice(0, STORY_LIMITS.story) });
  }, [story, people, run]);

  const applyFromContext = useCallback(() => {
    if (!hasProfileContext) return;
    void run({ useContext: true });
  }, [hasProfileContext, run]);

  /**
   * Undo an auto-fill. Exact restore from the snapshot, then back to `"idle"`
   * so the ordinary starter is there to offer them the choice properly.
   */
  const undoAutoApply = useCallback(() => {
    const before = preAutoFill.current;
    preAutoFill.current = null;
    setAutoApplied(false);
    setFilled([]);
    setMissing([]);
    setLastLanguage(null);
    if (before) live.current.onFilled(before);
    setMode("idle");
  }, []);

  /** Keeps the content and the snapshot; only the banner goes away. */
  const dismissAutoApplied = useCallback(() => {
    setAutoApplied(false);
  }, []);

  /**
   * Save the story into the sender's profile. Called from publish.
   *
   * ── WHY THE TOKEN IS READ FROM THE STORE AND NOT FROM A DEPENDENCY ─────────
   *
   * Publishing is auth-deferred: a logged-out sender presses Publish, signs in,
   * and the publish continues. The handler that calls this was very likely
   * created before any of that, so a token closed over at render time is the
   * `null` from before they signed in — which is exactly the case this feature
   * exists to serve. `store.getState()` is the only reading that is true at the
   * moment of the call.
   *
   * ── WHY IT CANNOT FAIL LOUDLY ──────────────────────────────────────────────
   *
   * This runs during the single most important thing the sender does all
   * session. Their page publishing is the event; whether we managed to file
   * their paragraph away for next time is our problem, not theirs. Every
   * failure is a console line and a return.
   */
  const persistStory = useCallback(
    async (o?: { title?: string }) => {
      try {
        const { story: liveStory, people: livePeople } = live.current;
        const text = resolveStorySlots(liveStory, livePeople).trim();
        if (!text) return;

        const auth = store.getState().auth;
        if (!auth.isAuthenticated || !auth.accessToken) return;

        // Publish can fire twice (retry, double tap, a second effect pass).
        // Claimed before the await so the second caller finds it taken.
        if (persistedStory.current === text) return;
        persistedStory.current = text;

        const title = (o?.title?.trim() || deriveStoryTitle(text)).slice(0, STORY_LIMITS.title);

        const res = await saveStoryToProfile(
          { title, text: text.slice(0, STORY_LIMITS.story), sourceSlug: slug },
          auth.accessToken
        );

        if (!res.ok) {
          // Release the claim: it was never saved, so a later publish should
          // still be allowed to try.
          persistedStory.current = null;
          console.warn("[useStoryFill] couldn't save story to profile:", res.status, res.error);
        }
      } catch (err) {
        persistedStory.current = null;
        console.warn("[useStoryFill] couldn't save story to profile:", err);
      }
    },
    [slug]
  );

  /** Leaves `story` and `people` exactly as they are — reopening is lossless. */
  const dismiss = useCallback(() => {
    setError(null);
    setMode("manual");
  }, []);

  const reset = useCallback(() => {
    setStory("");
    setError(null);
    setFilled([]);
    setMissing([]);
    setLastLanguage(null);
    setAutoApplied(false);
    setMode("idle");
  }, []);

  return {
    schema: enabled ? schema : null,
    schemaLoading: enabled ? loadingSchema : false,
    mode,
    setMode,
    story,
    setStory,
    people,
    setPeople,
    generating,
    error,
    filled,
    missing,
    lastLanguage,
    generate,
    applyFromContext,
    hasProfileContext,
    contextLabel,
    autoApplied,
    undoAutoApply,
    dismissAutoApplied,
    persistStory,
    dismiss,
    reset,
  };
}
