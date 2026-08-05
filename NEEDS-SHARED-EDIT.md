# NEEDS-SHARED-EDIT — from the `hold-my-hand` agent

Two shared-file changes I did **not** make (per SHARED-RULES §1). Both have a
working stand-in committed, so nothing is broken without them.

## 1. `client/app/layout.tsx` — the subhsandesh-theme fonts are not loaded

`SPEC-hold-my-hand.md` says to use the **subhsandesh-theme** tokens for this
template's chrome: *Space Grotesk / Inter / Caveat*. Only Inter is loaded in this
snapshot of `layout.tsx`; there is no `--font-space-grotesk` and no
`--font-caveat`.

**Stand-in shipped:** `components/types.ts` exports an `HMH` token object whose
three font entries point at the closest faces that *are* loaded —

```ts
display: "var(--font-outfit),  system-ui, sans-serif"  // ← wants Space Grotesk
body:    "var(--font-inter),   system-ui, sans-serif"  // ← correct already
script:  "var(--font-script),  cursive"                // ← wants Caveat
```

**Change wanted:** add Space Grotesk (500/600/700) as `--font-space-grotesk` and
Caveat (600/700) as `--font-caveat` via `next/font`, then swap the two lines
above. Every surface in this template reads its fonts from `HMH`, so those two
edits are the whole migration.

## 2. `client/app/globals.css` + `tailwind.config.ts` — no `--site-*` tokens

The theme skill documents `--site-bg`, `--site-accent`, `font-site-heading`,
`rounded-site`, etc., under `[data-sitetheme="subhsandesh"]`. Neither the CSS
custom properties nor the `site-*` Tailwind utilities exist in this snapshot.

**Stand-in shipped:** the exact palette hexes are hardcoded once, in the `HMH`
object in `components/types.ts` (indigo `#6C5CE7`, pink `#F72585`, lime
`#C6FF3D`, ink `#0E0E12`, etc.), and nothing in the template hardcodes a colour
anywhere else.

**Change wanted:** once the `--site-*` tokens land, repoint `HMH` at
`var(--site-accent)` and friends. Again a single-file swap.

---

Neither is a blocker. Both are one-file follow-ups against `HMH`.
