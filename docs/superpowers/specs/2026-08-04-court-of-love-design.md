# The Court of Love — Design Spec

**Date:** 2026-08-04
**Slug:** `court-of-love`
**Template type:** `court-of-love`
**API namespace:** `/court-of-love-pages`
**Branch:** `feat/court-of-love` (both `client/` and `server/`)
**Reference of record:** `apology-dashboard`

---

## 1. Concept

A romantic courtroom trivia gift. The **sender** files a case as the *Plaintiff*;
the **recipient** is *the Accused*, summoned to prove their love across **5
Hearings**. A cartoon penguin presides as Judge. Scoring 80%+ (4 of 5) earns the
verdict *"I love you more"* and a signed **₹100 stamp paper** certifying they won
the case.

Tone: cute, funny, a little formal-legal, Hinglish-flavoured. Never harsh.

---

## 2. Recipient journey

| Step | Screen | Content | Asset |
|---|---|---|---|
| 1 | **Summons** | Case file slides in, wax seal cracks. "Before this Court, all lovers are equal." Oath question with **Yes, I swear** / **No** buttons. | `scales-equal.gif` |
| 2 | **Session opens** | Gavel bang + screen shake, "Court is now in session". | `judge-gavel.gif` |
| 3 | **Hearing 1–5** | Tilted sticker card, question, 4 thumb-height option pills, 5 gavel pips as progress. | `clerk-pengu.gif` |
| 4 | **Reaction** | Framed GIF + one-line Caveat verdict. Holds 10 s with a countdown ring; **× close** top-right of the art, or tap anywhere. | correct: `love-heart` / `you-are-amazing` / `hearts` (rotating)<br>wrong: `koi-baat-nahi` / `wipe-tears` / `dont-be-sad` (rotating) |
| 4b | **Recess** (before the final hearing) | "Brief recess — one hearing left. The Court believes in you." | `you-can-do-it` (struggling) / `keep-going` (perfect) / `you-can` |
| 5a | **Verdict — pass (≥4/5)** | `verdict-love-more.mp4` plays, CTA held back 6 s behind "the Court is still speaking…" → confetti + `win-medal.gif` → typewriter letter → `love-this-much.gif`. | 3 assets, staged |
| 5b | **Verdict — fail (≤3/5)** | "RETRIAL GRANTED", consolation GIF, **Appeal the Verdict** button → unlimited retry (answers reshuffled). | `koi-baat-nahi.gif` |
| 6 | **Certificate** | ₹100 stamp paper: parchment, `CERTIFIED BEST PARTNER`, case number, accused name, score, date, Caveat signature, red wax seal, gold rings. | — |
| 7 | **Actions** | **Share** (PNG → `navigator.share`) · **Download PNG** · **Download PDF** | — |

### The evasive "No" button
Dodges (teleports + shrinks) on hover/touch for **3 attempts**, then becomes
tappable and answers with a joke ("Objection overruled 😏") before continuing to
the quiz. Deliberately *not* permanently un-tappable — that is hostile on touch
devices and traps users with no escape.

### Reading time is a first-class constraint

Most of this art has **words drawn into it** — "you can do it", "you are amazing",
"koi baat nahi", "don't be sad", "I love you this much", and the verdict clip's
"THE COURT HAS DECIDED I LOVE YOU MORE / THERE WILL BE NO APPEALS". Their loops
are short (0.3–3.2 s), so a flat dwell cut the text off mid-sentence.

Three rules follow:

1. **Reactions hold for 10 s** (`REACTION_DWELL`) — long enough for a short GIF to
   cycle several times or a long one to finish, with room to read the line
   underneath rather than racing it. Three things keep that from feeling like a
   wait: a **× close button on the art itself** (top-right), tap-anywhere to
   advance, and a `DwellCountdown` ring showing the seconds remaining, so the
   hold always looks finite and intentional. Reduced-motion users get the same
   10 s — reduced motion means less animation, not less reading time — just
   without the ring's sweep.
2. **The verdict CTA is held back the same 10 s** behind a "the Court is still
   speaking…" line, so nobody taps past the line the whole trial was building to.
   This clip's message is the longest of the lot. It keeps looping, so this delays
   a button — it never traps anyone.
3. **The letter's closing GIF and CTA appear only when the typewriter finishes**,
   so "I LOVE YOU THIS MUCH" lands as punctuation instead of competing with text
   still appearing above it. Tapping the letter completes it instantly.

### GIFs play three distinct roles

The words on each GIF decide where it belongs — an encouragement GIF used as a
correct-answer reaction would read as a non-sequitur:

| Role | When | Art |
|---|---|---|
| **Celebrate** | correct answer | `love-heart`, `you-are-amazing`, `hearts` |
| **Comfort** | wrong answer | `koi-baat-nahi`, `wipe-tears`, `dont-be-sad` |
| **Encourage** | the recess, one hearing left | `you-can-do-it`, `keep-going`, `you-can` |

The recess cheer adapts to the score: below 50% gets the emphatic "you can do
it!!", a clean sheet gets "keep going".

### Case number
Deterministic from `shareId` so it is stable across reloads and matches the
certificate: `CoL/2026/` + 4 digits derived from a hash of the shareId.

---

## 3. Visual system

Follows the **SubhSandesh new theme** (`subhsandesh-theme` skill) exactly:

- Canvas `#FAFAF7`, alt `#F3F1EA`, surface `#FFFFFF`
- Indigo `#6C5CE7` (primary accent), pink `#F72585` (highlight), lime `#C6FF3D` (CTA, dark text)
- Text `#0E0E12`, muted `#5B5B66`, border `#ECEAE3`
- Space Grotesk (headings), Inter (body), Caveat (handwritten verdict lines)
- Radii 20px / 28px / pill; card shadow `0 8px 24px rgba(14,14,18,.06)`
- Tilted sticker cards (−1.5°…1.1°), soft corner radial blobs

**One deliberate exception:** the certificate uses parchment (`#F6EFDF`), deep ink
(`#2A2118`), a serif face, red wax (`#B3261E`) and gold foil (`#C9A84C`) — it is a
document artifact, not a UI surface, and must read as a real stamp paper.

---

## 3b. AI: the sender's story → a case file, in their own language

The sender can write their story into a box at the top of the form, in **any
language**, and the server writes the whole case file from it. This is additive:
the hand-written defaults and full manual editing remain, and everything the AI
produces lands in the ordinary form fields as editable text.

### Language fidelity is the point
The system prompt's primary rule is to detect the language **and the script** of
the story and write every string in that same language and script. Two nuances
that matter for Indian users specifically:

- **Hinglish stays Hinglish.** A story written as "hum pehli baar mile the" comes
  back in Latin-script Hinglish, *not* converted to Devanagari — transliterating it
  would feel foreign to the person who wrote it.
- **The whole card matches, not just the questions.** The hearings, the reaction
  lines, the oath, the summons headline and the sealed letter are all generated in
  one call. A Hindi story that produced Hindi questions but an English letter
  would read as broken.

The model reports the language it used as a BCP-47 tag (`hi`, `hi-Latn`, `ur`, …),
which is persisted on the page and drives `lang` and `dir` on the viewer and the
certificate. `isRtl()` keys off the primary subtag so `ur` and `ur-PK` flip to RTL
while `ur-Latn` correctly stays LTR. Form inputs use `dir="auto"` so they follow
whatever is typed without threading language through the component tree.

### Reliability
Uses OpenAI **Structured Outputs** (`json_schema`, `strict: true`) rather than the
looser JSON mode the older `/api/generate` endpoint uses, because the client
renders exactly five hearings with four options each. Strict mode does *not*
support `minItems`/`maxItems`, so counts are requested in the prompt and then
enforced in `normalize()`: options are padded/trimmed to four, `correctIndex` is
clamped to 0–3, and `allCorrect` is forced false on every hearing except the last
(an all-correct factual question mid-trial would look like a bug).

### Cost, auth and safety
- **Login required**, matching the existing `/api/generate` gate — but the editor
  defers the prompt: clicking *Generate* while logged out stashes the intent in
  `pendingGenerateRef`, opens `AuthModal`, and resumes automatically after login,
  the same pattern Publish uses. Cancelling the modal clears *both* pending
  intents, or a cancelled AI prompt would fire on the next login.
- **Rate limited** to the same 10/min `generateLimiter` as `/api/generate`.
- **The story is never persisted.** It is the most personal thing the sender
  types, the recipient has no use for it, and the page doesn't need it once the
  questions exist. It lives only in the local draft so a refresh doesn't lose it.
- **Prompt injection** is treated as a content risk, not a code risk: the story is
  delimited and the prompt states it is data, never instructions. Because the
  output is a strict schema that is re-sanitised server-side, the worst case is
  odd question text — never code execution. Input is length-capped and stripped of
  C0 control characters.
- **Degrades honestly.** A missing/invalid key returns 503 with "you can still
  write the hearings yourself" rather than blaming the user; 429 asks them to wait.

### Model
`gpt-4o-mini` by default, overridable with `OPENAI_MODEL` so the model can change
without a code deploy. Key comes from the existing `OPENAI_API_KEY`.

## 4. The 5 default questions

All five are prefilled and fully editable (text, 4 options, correct index).

1. **Exhibit A** — "Where did the accused first steal the plaintiff's heart?"
2. **Exhibit B** — "The accused's most-used excuse?" → *"5 minute mein aa raha hoon"* / *"Bas nikal gaya"* / *"Phone silent pe tha"* / *"Main busy tha yaar"*
3. **Exhibit C** — "What does the plaintiff order every single time?"
4. **Exhibit D** — "Which habit of the plaintiff does the accused secretly adore?"
5. **Final Cross-Examination** — "How much does the plaintiff love you?" — **all 4 options are correct** and every one reveals ✅. The sweet twist; guarantees at least 1 point.

Scoring: `passed = score / total >= 0.8`. With Q5 always correct, a recipient needs
3 of the other 4.

---

## 5. Architecture

### Server (`server/src/`) — 5 touch points
1. `models/CourtOfLovePage.ts` — Mongoose schema. `userId`, `shareId` (`randomUUID()` in `pre("save")`, unique/sparse/index), content fields, `questions: IQuizQuestion[]`, `password` (bcrypt cost 10 in pre-save) + `passwordRaw` (`select:false`), `isPublished`, `viewCount`, `comparePassword()`.
2. `controllers/courtOfLovePage.controller.ts` — `create`, `getMy`, `getOne`, `update`, `publish`, `getShared`, `verifyPassword`, `delete`. Publish goes through `checkPublishAccess`; share URL from `buildShareUrl`.
3. `routes/courtOfLovePage.routes.ts` — public `GET /share/:shareId` + `POST /share/:shareId/verify` **before** `router.use(protect)`, then owner CRUD.
4. `routes/index.ts` — `router.use("/court-of-love-pages", courtOfLovePageRoutes)`.
5. `controllers/share.controller.ts` — `TEMPLATE_LOOKUPS` entry `{ model: CourtOfLovePage, templateType: "court-of-love", editorRoute: "/court-of-love" }`.

**Validation:** questions array capped at 5 entries × 4 options; every string
length-capped server-side; `correctIndex` clamped to 0–3. Text is rendered as text
(never `dangerouslySetInnerHTML`), so stored content cannot execute.

### Client (`client/`) — 6 touch points
6. `app/(templates)/court-of-love/`
   - `layout.tsx` — metadata, canonical, OG/Twitter, JSON-LD
   - `page.tsx` — thin renderer + polymorphic top bar
   - `config.ts` — `TemplatePageConfig` for the gallery
   - `hooks/useCourtOfLoveEditor.ts` — all editor state
   - `components/types.ts` — `CourtOfLoveData`, `courtOfLoveDataToBody`, `dbToCourtOfLoveData`, `DEMO_DATA`
   - `components/CourtOfLove.tsx` — the experience (all screens)
   - `components/CourtGif.tsx` — GIF/MP4 reaction player with lazy load + preload-next
   - `components/StampPaperCertificate.tsx` — the certificate
   - `components/certificatePdf.tsx` — dynamic-imported PNG→PDF export
   - `components/EditSheet.tsx` — the form
7. `app/[id]/CourtOfLoveViewer.tsx` — password gate + `dbToCourtOfLoveData` → `<CourtOfLove mode="live">`
8. `app/[id]/SharePageClient.tsx` — add `"court-of-love"` to the early-return list **and** a dispatch guard
9. `data/template-registry.ts` — import the config
10. `public/assets/court-of-love/*` — optimised assets
11. `app/sitemap.ts` / `lib/seo-data.ts` — route entry

### Editor flow (canonical, unchanged)
Live demo → **Create** → bottom sheet (draft key `court_of_love_draft`,
localStorage-first with sessionStorage fallback) → **Save** (preview + `completed:true`)
→ **Publish** (auth-deferred via `pendingPublishRef`, auto-resumes after login,
`clearDraft()` only on success) → **Share**.

Password gate unlock key: `court_of_love_unlocked_${shareId}`.

---

## 6. Asset pipeline

Source GIFs totalled **5.4 MB** — unusable on Indian mobile. Optimised with ffmpeg:
width capped at native (never upscaled), frame rate thinned, palette reduced,
`dither=none` (Bayer dithering adds per-pixel noise that destroys GIF's LZW
compression on flat cartoon art).

`court2.gif` (13.5 s of hand-drawn text) resisted GIF compression entirely — it grew
to 1.7 MB. Converted to **H.264 MP4 at 53 KB**, a 31× reduction, played via
`<video autoplay muted loop playsInline>`. Its background is opaque white so
flattening alpha is lossless here.

**Result: 1.6 MB total, every asset ≤ 287 KB.** Loading strategy: `loading="lazy"`,
only the current screen's asset is mounted, and the next screen's asset is
preloaded one step ahead.

| File | Size | Role |
|---|---|---|
`judge-gavel.gif` | 287 KB | session opens |
`love-heart.gif` | 231 KB | correct |
`dont-be-sad.gif` | 165 KB | wrong |
`scales-equal.gif` | 142 KB | summons / equality |
`wipe-tears.gif` | 127 KB | wrong |
`koi-baat-nahi.gif` | 124 KB | wrong / retrial |
`win-medal.gif` | 120 KB | win |
`clerk-pengu.gif` | 108 KB | hearing mascot |
`hearts.gif` | 100 KB | correct |
`you-are-amazing.gif` | 54 KB | correct |
`verdict-love-more.mp4` | 53 KB | verdict reveal |
`love-this-much.gif` | 27 KB | post-win letter |
`keep-going.gif` | 23 KB | mid-quiz encouragement |

---

## 7. SEO / AEO / GEO

- `layout.tsx`: title, description, `alternates.canonical`, OpenGraph, Twitter `summary_large_image`
- **JSON-LD**: `WebApplication` (the tool) + `FAQPage` (AEO — answers "how do I make a love quiz for my girlfriend/boyfriend", "is it free", "can I add a password")
- **GEO**: `en-IN` locale signal, India-oriented copy and currency framing (₹100 stamp paper), Hinglish keywords in the description
- Route added to `app/sitemap.ts`; entry in `lib/seo-data.ts`; line in `app/llms.txt`
- Semantic heading order (single `h1`), descriptive `alt` on every GIF, `<video>` carries `aria-label`
- Certificate is real DOM text (not baked into an image) so it is indexable and screen-reader accessible

## 8. Security

- Password bcrypt-hashed (cost 10) in `pre("save")`; plaintext mirrored only into
  `passwordRaw` with `select:false`; the shared GET strips both and returns only
  `hasPassword`.
- Public routes are exactly two (`GET /share/:shareId`, `POST /share/:shareId/verify`)
  and are mounted before `protect`. Everything else requires a Bearer token and is
  scoped by `userId` in the query, so one user cannot read or mutate another's page.
- All rendered content is text nodes — no `dangerouslySetInnerHTML` anywhere.
- Server-side length caps on every field; `questions` capped at 5×4; `correctIndex` clamped.

### Accepted trade-off
`correctIndex` ships to the recipient in the page payload, so scoring is instant and
offline-capable. A recipient who opens devtools could read the answers. This is
deliberate: it is a romantic gift, not an exam, and the alternative (a verify
round-trip per answer) costs latency and makes the quiz fail on flaky connections.
Revisit only if the template is ever used for something with stakes.

---

## 9. Out of scope

- No background music (the apology template's audio ducking system is not needed here)
- No photo upload — the certificate is typographic, so no S3 media path is required
- No email delivery of the certificate; the recipient downloads/shares it directly,
  so no `deliveryEmail` requirement gates Publish
