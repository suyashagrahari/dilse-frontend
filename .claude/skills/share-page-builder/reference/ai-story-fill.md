# AI Story Fill — every template gets it

**This is not optional and it is not a later phase.** Every new template ships with
AI fill in the same commit as the template itself. A template without a schema
still *builds*, still *publishes*, and still *shares* — the hook goes inert and
StoryStarter renders nothing — which is exactly why it is easy to forget and
exactly why it must be on the checklist. A silently missing schema is invisible
in code review and obvious to the sender, who taps **Create** on your template
and gets a blank form when every other template offered to write it for them.

## What the sender experiences

1. Tap **Create** → instead of the blank form, **StoryStarter** opens.
2. If they are signed in and have a saved story, the hero button reads
   **"Use my story — from *How we met*"**. One tap fills the whole form.
3. Otherwise they get the composer: their name, their partner's / best friend's
   name, and a sample paragraph with the fill-in bits highlighted. They can type
   their own story or tap **"Use this as a starting point"**.
4. **Generate** → the model fills every declared field → the **review screen**
   lists what landed (each row editable) and what still needs them.
5. Anything the AI could not fill is a normal form field. **They never lose a
   keystroke** and they can bail to the plain form at any point via `onManual`.
6. On publish, `persistStory()` saves the story to their profile, so the *next*
   template they make is pre-filled before they type anything.

## The two files that make it work

### 1. Server — `server/src/config/aiFill/<slug>.ts`

One file per template. Paths resolve against the editor's form state object
(`mf`), i.e. the template's `XxxData` type in `components/types.ts`.

```ts
import type { AiFillTemplateSchema } from "./types";

/**
 * <slug> — "<Human title>".
 *
 * Paths resolve against `XxxData` in
 * client/app/(templates)/<slug>/components/types.ts, held as `mf` in
 * useXxxEditor.ts.
 *
 * <Say which fields are deliberately NOT declared and why.>
 */
export const xxxSlug: AiFillTemplateSchema = {
  slug: "<slug>",                       // MUST equal the route segment
  audience: "partner" | "bestfriend" | "friend",
  premise: "<2–4 sentences: what the page IS, what the recipient sees, and what makes the joke/tone land. The model reads this before anything else.>",
  fields: [
    {
      path: "recipientName",            // `a.b[0].c` grammar; index cap 50
      label: "Who it's for",            // shown on the review row
      kind: "text",                     // text | longtext | list | date | number | enum
      max: 40,                          // ≤ FILL_LIMITS.text (240)
      required: true,
      guide: "<Where it appears on the page, what register fits, hard length hint, and what NEVER to write here.>",
      example: "<optional one-liner>",
    },
  ],
};
```

**Field-kind rules**

| kind | caps | notes |
|---|---|---|
| `text` | `max` ≤ 240 | single line |
| `longtext` | `max` ≤ 1200 | paragraphs; say in the guide how line breaks render |
| `list` | `max` = item count ≤ 12, `itemMax` ≤ 240 | `max` is **how many items**, not characters |
| `enum` | `options: readonly string[]` required | model must pick one of these exactly |
| `date` / `number` | — | say the expected format in the guide |

**There is no media kind, on purpose.** `FieldKind` has no member for photos,
audio or video, and `assertNoMediaPaths` rejects any path whose leaf looks like
one (`photoUrl`, `images`, `coverSrc`, …). The model must never invent a URL.
Photos stay a manual upload.

**Never declare:**
- media paths (see above),
- pure visual choices the sender makes by tapping (colours, seeds, layout mode,
  toggles) — nothing a story can be read into,
- a first path segment in `RESERVED_ENVELOPE_KEYS`
  (`language`, `languageName`, `excludedKeywords`, `filled_values`) — boot
  validation rejects it,
- more than `FILL_LIMITS.maxFields` (40) fields.

Add `forbiddenOutput: ["..."]` when the template parodies a real product and
certain words must never appear in generated copy (see `searched`, `us`,
`loveflix`). A deterministic post-generation sweep enforces it — the prompt
alone is not trusted.

### 2. Server — `server/src/config/aiFill/registry.generated.ts`

Two lines, alphabetical: the `import`, and the entry in `SCHEMAS`. That is the
whole registration. Nothing else on the server changes — no route, no
controller, no model.

**Verify it registered.** Boot the server and read the log: a bad path, a media
leaf, a missing guide or a reserved key prints
`[aiFill] schema "<slug>" has N problem(s)` with each one named. Validation is
deliberately non-fatal — one broken schema kills its own fill button, not the
API — so *nobody will tell you*. Read the log.

### 3. Client — `app/(templates)/<slug>/hooks/useXxxEditor.ts`

```ts
import { useStoryFill } from "@/hooks/useStoryFill";

// ── AI story fill ──────────────────────────────────────────────────────────
// Completely inert when the server has no schema for this slug: `schema` stays
// null, StoryStarter renders nothing, and the entry point below falls straight
// back to the form this editor has always opened.
const storyFill = useStoryFill<XxxData>({
  slug: "<slug>",          // MUST match the schema's slug exactly
  demo: DEMO_DATA,         // the template's DEMO_* constant
  current: mf,             // live form state
  onFilled: setMf,         // merged result goes straight back to the form
});
const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
const [storyStarted, setStoryStarted] = useState(false);

/** Seeds the form exactly as opening it does, without opening it. */
const seedManualForm = useCallback(() => {
  setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
}, [isPersonalized, content]);

const handleEditClick = useCallback(() => {
  seedManualForm();
  setEditMode("manual");
}, [seedManualForm]);

// ── StoryStarter entry point ───────────────────────────────────────────────
// `mf` is seeded up front — from the loaded page or the demo, whichever the
// form would have used — so a generated draft lands on the right base and
// `onManual` can open the untouched form without re-seeding over the AI's work.
/** Create. Falls back to today's form when there is no schema. */
const handleStartCreate = useCallback(() => {
  if (!storySchema) { handleEditClick(); return; }
  seedManualForm();
  setStoryMode("idle");
  setStoryStarted(true);
}, [storySchema, handleEditClick, seedManualForm, setStoryMode]);

/** StoryStarter's way out — the normal form, every field still hand-editable. */
const handleStoryManual = useCallback(() => {
  setEditMode("manual");
}, []);
```

Return `storyFill, storyStarted, handleStartCreate, handleStoryManual` from the
hook alongside everything else.

Then, in **both** publish paths — the direct publish and the auto-resume-after-
login effect — call `await persistStory();` immediately after the publish
succeeds and **before** `clearDraft()`:

```ts
if (pubResult.success) {
  setShareUrl(String(pubResult.data.shareUrl));
  await persistStory();          // ← the story goes into their profile here
  clearDraft();
  pushToast({ type: "publish", title: "Sent!", message: "Your page is live" });
}
```

Miss it in the auto-resume path and the feature silently degrades for exactly
the users who were logged out when they clicked Publish — i.e. most first-time
senders, i.e. the ones whose story you most wanted.

### 4. Client — `app/(templates)/<slug>/page.tsx`

```tsx
import StoryStarter from "@/components/story/StoryStarter";

// Create goes to handleStartCreate, NOT handleEditClick:
const topAction = e.showShare
  ? { label: "Share", onClick: e.handleShare }
  : e.showPublish
    ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
    : { label: "Create", onClick: e.handleStartCreate };

// …

<EditSheet … />

{/* Mounted after EditSheet so the sheet sits over the form it seeds. */}
{e.storyStarted && (
  <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />
)}
```

Mount order matters: `StoryStarter` after `EditSheet`.

## Gotchas that have already cost a day each

- **Editors seed `mf` from a populated `DEMO_*` object**, so "the field is empty"
  is never the test for whether the AI may write there. `applyPatch` uses the
  `touched` set as the authority — demo placeholder text IS overwritable, and a
  field the sender actually typed into is not. If you invent your own merge you
  will reproduce the bug where 0 of 20 fields landed and nothing errored.
- **`slug` must match in three places**: the route segment, the schema's `slug`,
  and the `useStoryFill({ slug })` argument. A mismatch is a silent no-op — the
  schema fetch 404s and the hook goes inert, exactly as if you had never written
  the schema.
- **Test with a real story, not an empty one.** The failure mode is "the panel
  opens and the form stays blank", which only reproduces end-to-end.
- **`autoApply` defaults to `false` and should stay false.** It used to default
  true, which spent a model call and silently rewrote the form on every editor
  open. `canUseMyStory` / `useMyStory` are the replacement: same fill, but the
  sender presses the button and can see that it happened.
- **The feature fails soft.** No `OPENAI_API_KEY`, rate limit hit, model down →
  503 and the plain form. Never let a fill failure block Create, Save or Publish.
- **Anonymous senders can use it too** (20 fills/hr by IP; 60/hr by user id when
  signed in). Do not gate the panel behind auth.

## Definition of done

- [ ] `server/src/config/aiFill/<slug>.ts` exists, every path resolves against
      the real `XxxData`, no media leaves, no reserved envelope keys.
- [ ] Two lines added to `registry.generated.ts`, alphabetically.
- [ ] Server boots with **no** `[aiFill] schema "<slug>" has N problem(s)` line.
- [ ] `useStoryFill` wired in the editor hook with the matching slug.
- [ ] `handleStartCreate` is what the **Create** button calls.
- [ ] `StoryStarter` mounted in `page.tsx` after `EditSheet`.
- [ ] `await persistStory()` in **both** publish paths, before `clearDraft()`.
- [ ] Manually: open the editor → Create → write a two-line story → Generate →
      confirm the fields fill, the review rows are editable, and the plain form
      still opens with the AI's work intact via **onManual**.
