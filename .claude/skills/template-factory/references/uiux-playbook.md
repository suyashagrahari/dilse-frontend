# UI/UX Playbook (Stage 2)

Turn `00-brief.md` into a buildable design. Output `01-design.md`. Mobile-first.

## Design system to specify
- **Palette:** background, surface, primary, accent, text, muted — with hex values.
  Every text/background pair must pass **WCAG AA** (≥4.5:1 body, ≥3:1 large text).
  Verify each pair (compute the ratio); the landing shipped a broken gold `#c9a84c`
  at 1.97:1 — don't repeat it. Darken accents until they pass.
- **Typography:** use the fonts from the chosen theme (load the `subhsandesh-theme`
  skill). **New SubhSandesh theme:** Space Grotesk (headings), Inter (body), Caveat
  (handwritten accent) — via `--font-space-grotesk` / `--font-inter` / `--font-caveat`.
  **Classic theme only if requested:** Playfair Display + Outfit + Lora + Dancing
  Script + Inter; plus Cinzel/Fredoka and Devanagari/Urdu/Arabic faces for regional
  templates. Give a type scale (sizes/weights/line-heights) per breakpoint. Above-the-
  fold faces are `display:"optional"` — design so the metric-matched fallback looks
  fine too.
- **Spacing & radius:** an 4/8px scale; consistent section rhythm.
- **Motion language:** entrance, the "wow" interaction, micro-interactions. Specify
  which properties animate (prefer transform/opacity — composited) and durations.
  Provide a **`prefers-reduced-motion` fallback** for every animation.

## Layout — per section
For each section from the brief: mobile layout, desktop layout, component list,
states (default / edit / empty / loading / success), and the exact interaction. Show
the section order and the nav (BottomNav on mobile).

## UX flows
- **Personalize/edit** flow (EditSheet pattern), **publish** flow (PublishingOverlay),
  optional **password** protection (PasswordSheet), and the **share** flow + the OG
  preview a recipient sees in WhatsApp.
- First-run: a welcome overlay that sets the mood, then reveals content.

## Accessibility (non-negotiable, will be audited in Stage 5/7)
- Contrast AA on every pair (state the computed ratios).
- Touch targets ≥ 24×24px; visible focus states.
- Sequential headings (single h1, then h2→h3, no skips).
- `aria-hidden` on decorative visuals; labels on icon-only buttons.
- Full experience works with reduced motion and keyboard.

## Deliverable: `01-design.md`
Design tokens (with hex + verified contrast), type scale, motion spec, and a
section-by-section layout + component + states table.
