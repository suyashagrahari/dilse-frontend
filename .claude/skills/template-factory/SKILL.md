---
name: template-factory
description: >
  Build a new SubhSandesh celebration/greeting template end-to-end by running a
  fixed series of seven domain-expert agents — Product Researcher → UI/UX Designer
  → Frontend Engineer → Backend Engineer → Performance Optimizer → Security
  Reviewer → SEO/AEO/GEO Optimizer. Use whenever the user asks to create, design,
  or ship a new template (e.g. "make a Diwali template", "build a graduation
  wishes page", "new anniversary template"). Each stage is a separate subagent
  that consumes the previous stage's written artifact, so the work runs in series
  and every domain is handled by a specialist.
---

# Template Factory — 7 experts, in series

This skill turns a one-line template idea into a shipped, fast, secure, discoverable
SubhSandesh template. It runs **seven specialist agents strictly in order**. Each
one writes a durable artifact to the run folder; the next one reads it. You (the
orchestrator) never do a stage's work yourself — you **spawn the stage as a subagent**,
wait for it, verify its quality gate, then start the next stage.

## Golden rules

1. **Strict series.** Stage N may not start until Stage N-1's artifact exists AND
   passes its quality gate. Never parallelize the seven stages.
2. **Artifacts, not memory.** Every stage writes files to the run folder
   `.template-factory/<slug>/` (create it in the repo, git-ignored). State lives on
   disk so the pipeline survives compaction and you can resume mid-run.
3. **Spawn specialists.** Use the Agent tool with the stage's prompt. Give each
   subagent ONLY what it needs: the original idea + the prior artifacts + its
   playbook. Relay the finished artifact path, not the whole content.
4. **Quality gate before advancing.** After each stage, read its artifact and check
   the stage's Definition of Done. If it fails, send the same subagent back with
   specific fixes (SendMessage) before moving on.
5. **Match the codebase.** New templates live in `app/(templates)/<slug>/` and must
   mirror the anatomy of existing ones (see `references/project-conventions.md`).
6. **Verify, don't claim.** The Optimizer and Security stages must produce measured
   evidence (Lighthouse numbers, a checklist with pass/fail), never assertions.

## Companion skills — load these, don't reinvent

This skill is the **orchestrator**. The deep, codebase-exact knowledge lives in two
sibling skills; load them with the Skill tool at the stages noted:

- **`subhsandesh-template`** — the canonical end-to-end template ARCHITECTURE:
  editor state machine, sessionStorage draft, **auth-deferred publish**, the server
  model/controller/routes, the shared `/[id]` recipient viewer + password gate, and
  the **exact 9-file checklist**. Stages 3 & 4 (Frontend/Backend) MUST follow it —
  copy the `apology-dashboard` flow, don't invent a new one.
- **`subhsandesh-theme`** — the NEW SubhSandesh design system: fonts
  (Space Grotesk / Inter / Caveat), colors (indigo `#6C5CE7` / pink `#F72585` /
  lime `#C6FF3D` on `#FAFAF7`), radii, shadows, `--site-*` tokens. Stage 2 (UI/UX)
  MUST use it for any new-theme work.

**Two themes exist — pick one up front and tell the designer:**
- **New SubhSandesh theme** (default for new work): load `subhsandesh-theme`
  (Space Grotesk/Inter/Caveat, indigo/pink/lime). Never use Playfair/cream here.
- **Classic luxury theme** (older templates): Playfair Display + cream `#f5ede6` +
  gold. Only if the user explicitly asks for the classic look.

## Run folder layout

```
.template-factory/<slug>/
  00-brief.md            # Stage 1 — Product Researcher
  01-design.md           # Stage 2 — UI/UX Designer
  02-frontend.md         # Stage 3 — Frontend Engineer (notes; code goes in app/)
  03-backend.md          # Stage 4 — Backend Engineer (notes; code goes in app/api etc.)
  04-optimize.md         # Stage 5 — Performance Optimizer (before/after metrics)
  05-security.md         # Stage 6 — Security Reviewer (findings + fixes)
  06-seo.md              # Stage 7 — SEO/AEO/GEO Optimizer
  STATUS.md              # running checklist: which stages passed
```

Pick a **slug** (kebab-case, matches the route, e.g. `diwali`, `graduation-wishes`)
and a human **title** up front, write them to `STATUS.md`, then begin Stage 1.

---

## The pipeline

Each stage below gives the subagent's **role**, **inputs**, **deliverable**, and
**Definition of Done (DoD)**. Full domain checklists are in `references/`. When you
spawn a stage, paste its role + DoD + the relevant reference file path into the
subagent prompt, along with the idea and prior artifacts.

### Stage 1 — Product Researcher  → `00-brief.md`
- **Role:** Senior product researcher. Figure out what makes this specific
  celebration template *viral, shareable, and genuinely useful* — not generic.
- **Inputs:** the user's idea; the list of existing templates.
- **Do:** WebSearch + actually visit real examples (competitor greeting/celebration
  pages, interactive love letters, gift micro-experiences, Awwwards/CodePen/itch.io);
  identify the emotional hook, the "wow" moment, the share mechanic, and the must-have
  sections; define target audience, tone, cultural specifics, and 5–8 concrete
  sections with their purpose. **For romantic/relationship themes** (I'm Sorry, Miss
  You, Virtual Hug, anniversary, birthday, "why I love you", etc.) run the **Master
  research prompt** in the playbook — extract atmosphere, tactile micro-interactions,
  mini-games, and memory/letter modules from real sites so the recipient feels loved,
  surprised, and connected. You research and *extract ideas*, you do not build.
- **DoD:** brief names the viral hook + share mechanic explicitly, lists concrete
  sections (not "hero/about"), cites ≥3 real references (with what to steal from each),
  and states what makes it different from the closest existing SubhSandesh template.
  For romantic themes it also specifies the emotional journey, atmosphere/particles,
  2–3 tactile interactions, and 1–2 mini-games — each tied to a source.
- Playbook: `references/product-research-playbook.md`

### Stage 2 — UI/UX Designer  → `01-design.md`
- **Role:** Principal product designer. Turn the brief into a precise, buildable
  design system + section-by-section layout.
- **Inputs:** `00-brief.md`.
- **Do:** define palette, typography (map to the app's fonts — see perf note), spacing,
  motion language, and a mobile-first layout for each section; specify components,
  states, empty/edit states, and the share/edit UX; call out accessibility (contrast
  ≥ WCAG AA, touch targets ≥24px, heading order, reduced-motion).
- **DoD:** every section from the brief has a concrete layout + component list;
  colors have verified contrast; fonts chosen from the approved self-hosted set;
  motion respects `prefers-reduced-motion`.
- **Load the `subhsandesh-theme` skill first** and design with its exact tokens
  (fonts, colors, radii, `--site-*`). Then `references/uiux-playbook.md`.

### Stage 3 — Frontend Engineer  → code in `app/(templates)/<slug>/` + notes in `02-frontend.md`
- **Role:** Senior Next.js/React engineer. Implement the design as a real template
  matching existing anatomy (layout.tsx, config.ts, page.tsx, components/…).
- **Inputs:** `00-brief.md`, `01-design.md`.
- **Do:** build the route, sections, edit/share flows, animations (framer-motion),
  responsive CSS; reuse existing patterns (overlays, BottomNav, music, particles);
  keep it typed; wire fonts via the app's next/font variables.
- **DoD:** `npx tsc --noEmit` clean; `npm run build` compiles the new route; renders
  on mobile + desktop; no raw `<img>` for LCP images; follows conventions doc AND the
  `subhsandesh-template` flow (editor → draft → deferred publish → share → viewer).
- **Load the `subhsandesh-template` skill** for the exact editor/publish/viewer
  architecture and the 9-file checklist. Then `references/project-conventions.md`.

### Stage 4 — Backend Engineer  → code + notes in `03-backend.md`
- **Role:** Backend engineer. Add whatever persistence/sharing/API the template needs
  (save a personalized page, generate a share link, store media refs, etc.).
- **Inputs:** brief, design, frontend notes.
- **Do:** implement API routes / data model consistent with existing templates; input
  validation (zod); safe media handling (S3/CDN patterns already in the repo);
  no secrets in client code.
- **DoD:** endpoints typed + validated; errors handled; no secret leakage; builds.
  (If the template is purely static/client-side, record that and skip cleanly.)
- **Follow the `subhsandesh-template` skill's server contract**: `XxxPage` model
  (shareId `randomUUID()`, bcrypt password), 8 controller handlers, public
  `/share/:shareId` routes before `protect`, `TEMPLATE_LOOKUPS` entry, and
  `SharePageClient` registration. Then `references/project-conventions.md`.

### Stage 5 — Performance Optimizer  → `04-optimize.md`
- **Role:** Web-perf engineer. Make the new template score high on Lighthouse mobile
  with **zero CLS** — apply every lesson already learned in this codebase.
- **Inputs:** the built template.
- **Do:** run Lighthouse (see playbook) against the local/preview URL, fix
  render-blocking, oversized images (sharp → webp, correct dimensions), font-swap
  CLS (self-host + `display:"optional"` for above-the-fold fonts, no duplicate
  `@font-face`), reserve image space, lazy-load below-fold, trim unused JS/CSS.
- **DoD:** artifact shows **before/after Lighthouse numbers** (perf, CLS, LCP, a11y);
  CLS ≤ 0.01 across ≥3 runs; no font on the template serves `display:swap` above
  the fold.
- Playbook: `references/performance-playbook.md`  ← contains the exact CLS/font/image
  fixes discovered on the landing page.

### Stage 6 — Security Reviewer  → `05-security.md`
- **Role:** AppSec engineer. Find and fix real vulnerabilities before ship.
- **Inputs:** all frontend + backend code for the template.
- **Do:** review for XSS (esp. `dangerouslySetInnerHTML`, user-supplied text/media),
  injection, auth/authz on new endpoints, SSRF in media fetch, unsafe redirects,
  secret exposure, dependency risk, and CSP/headers; verify user content is escaped
  and share links are unguessable.
- **DoD:** a findings table (severity, file:line, fix) with every High/Critical
  **fixed**, not just noted; confirms no secrets client-side; confirms user text is
  escaped.
- Playbook: `references/security-playbook.md`

### Stage 7 — SEO / AEO / GEO Optimizer  → `06-seo.md`
- **Role:** Technical SEO + answer/generative-engine optimizer.
- **Inputs:** the shipped template + its metadata.
- **Do:** per-route `metadata` (title, description, canonical, OpenGraph, Twitter),
  JSON-LD structured data, semantic HTML/headings, OG image, sitemap entry, and
  AEO/GEO: clear question-style headings, concise answerable copy, and `llms.txt`
  inclusion so AI agents can parse it.
- **DoD:** route has complete metadata + valid JSON-LD; appears in sitemap; headings
  are semantic; Lighthouse SEO = 100 and Agentic Browsing checks pass.
- Playbook: `references/seo-aeo-geo-playbook.md`

---

## Finish

After Stage 7:
1. Update `STATUS.md` — all 7 gates passed, with the key metrics.
2. Give the user a concise summary: what was built, the viral hook, the measured
   Lighthouse numbers, and the route.
3. **Do not deploy automatically.** Ask before pushing. Deploy flow: commit on a
   branch → `main` = production, `dev` = staging (blue-green via GitHub Actions).

## Resuming a run

Read `STATUS.md` in the run folder, find the first unchecked stage, and continue
from there — prior artifacts are already on disk.
