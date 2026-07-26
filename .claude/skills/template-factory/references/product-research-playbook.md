# Product Research Playbook (Stage 1)

Goal: define a template that people actually *share*, not a generic page. Output
`00-brief.md`.

## Research (use WebSearch)
- Find 3–6 real examples for this occasion: greeting/celebration pages, viral
  micro-sites, social posts. Note what makes each shareable.
- Check current trends/aesthetics for the occasion (colors, phrases, memes, rituals),
  and any cultural/religious specifics that must be right (dates, greetings, symbols,
  language/script — the app already supports Devanagari, Urdu, Arabic faces).
- Look at the closest existing SubhSandesh template; state explicitly how this one is
  different and better.

## The virality checklist (name each explicitly in the brief)
- **Emotional hook:** the one feeling it must trigger in 3 seconds.
- **"Wow" moment:** an interaction people screenshot/record (a reveal, animation,
  mini-game, countdown, scratch card, anger-o-meter, etc. — see apology-dashboard).
- **Personalization:** what the sender customizes (names, photo, message, date, music).
- **Share mechanic:** how it spreads (unique link, "made for you", WhatsApp-first
  preview/OG image, "create your own" CTA at the end).
- **Time-to-value:** sender creates it in < 2 minutes; recipient gets it in 1 tap.

## Master research prompt — romantic / relationship themes

Most SubhSandesh templates are **emotional gifts for a partner** ("I'm Sorry",
"Miss You", "Happy Birthday", "Virtual Hug", "Long-Distance Anniversary", "Why I
Love You", "Just Because"). For any such theme, run the research through this lens.
**You are researching, not building** — go visit real sites, extract the creative
ideas, and distill them into the brief so the frontend team can build something that
makes the recipient feel *loved, emotional, surprised, playful, and connected*.

> **Act as a Senior Creative Technologist + Emotional-Interaction Specialist.**
> The theme is: **[INSERT THEME]**. The goal: make the recipient feel deeply touched,
> loved, and connected through cute micro-interactions, interactive digital rituals,
> creative mini-games, and thoughtful surprises. Research deeply (visit real romantic
> sites, gift micro-experiences, interactive love letters, Awwwards/CodePen/itch.io
> examples) and extract concrete, buildable ideas across these seven dimensions:

1. **Emotional & psychological core.** Name the one feeling this theme must deliver,
   and the *emotional journey* from the second the link opens to the final screen
   (curiosity → warmth → surprise → being deeply moved → wanting to reply).
2. **Atmosphere & sensory design.** Palette + mood (e.g. cozy Ghibli, lofi scrapbook,
   warm sepia, starry night, modern-minimal); typography feel; **ambient particle /
   weather system** fitting the theme (falling petals, floating hearts, drifting
   stars, gentle rain); and an **audio/ambient** idea (soft background loop, a voice-
   note moment) — always muted-by-default with a clear unmute control.
3. **Tactile micro-interactions & surprises (list 3–4).** e.g. an envelope that opens,
   a wax seal to break, a scratch-off reveal, a secret tap-counter, a photo that
   develops, a "pull the string" reveal. For each: how it works + why it lands
   emotionally. These are the screenshot/record-worthy "wow" moments.
4. **Theme mini-games & playful mechanics (list 2–3).** e.g. a runaway "No" button, an
   asynchronous card-flip memory game, a collaborative doodle canvas, dual-reveal
   trivia ("how well do you know us"), a tiny arcade. How each sparks laughter,
   vulnerability, or connection.
5. **Memory / letter / intimacy modules.** Creative ways to present written messages,
   voice notes, time-locked letters, an annotated playlist, a relationship timeline,
   or a memory map. What the sender fills in.
6. **Delivery & surprise plan.** 3 ways to hand the link over for maximum anticipation
   (QR card, a timed/"open-at-midnight" link, a suspenseful teaser message).
7. **What to steal (with sources).** For every idea above, cite the real page you saw
   it on so the designer/frontend can reference the exact feel.

Distill the strongest of these into the standard brief below — pick the **2–3 best**
tactile interactions and **1–2 best** mini-games (don't overload; time-to-value still
< 2 min). Everything must be mobile-first and respect `prefers-reduced-motion`.

## Deliverable: `00-brief.md`
Must contain:
1. **Slug + title + one-line pitch.**
2. **Audience & tone.**
3. **Emotional hook + wow moment + share mechanic** (explicit).
4. **Emotional journey** — the open→finish arc (for romantic themes).
5. **Atmosphere** — mood, palette direction, particle/weather system, audio idea.
6. **Chosen tactile interactions** (2–3) and **mini-games** (1–2), each with how it
   works, why it's emotional, and the reference site it's drawn from.
7. **Memory/letter/intimacy modules** + **Sections list** — 5–8 concrete, purposeful
   sections (not "hero/about"): each with name, purpose, key content, and interaction.
8. **Personalization fields** (names, photos, message, date, voice note, playlist…).
9. **Delivery/surprise plan** (3 ways).
10. **Cultural/factual requirements.**
11. **References** (≥3 links, with what to steal from each) + **differentiation** vs
    the nearest existing template.
12. **Success metric** (what "viral"/"made them cry-happy" means here).
