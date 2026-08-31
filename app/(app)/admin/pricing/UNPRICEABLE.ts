/**
 * Templates in the gallery with no publish path, so a price on one would never
 * be charged.
 *
 * The panel lists every template in the registry, because the registry is what
 * "exists". These ten cannot be sold, and a super admin typing a price into one
 * and seeing it saved — with nobody ever charged — is the failure this list
 * exists to prevent. Their controls are disabled and the reason is shown.
 *
 * Nine are static pages: an empty `hooks/` directory, no Publish button, no API
 * calls at all. `anniversary-gf` is different and worth its own note: its editor
 * POSTs to `/anniversary-pages/:id/publish`, but the server has no anniversary
 * controller, model or route, so that publish already 404s. A pre-existing
 * break, not something pricing caused.
 *
 * ── KEEPING THIS HONEST ─────────────────────────────────────────────────────
 *
 * A template that gains a publish flow should be removed from here. To re-derive
 * the list, from `client/`:
 *
 *   for d in app/\(templates\)/*\/; do
 *     grep -rq '/publish' "$d" || echo "${d}"
 *   done
 *
 * Being stale in the safe direction only costs a super admin the ability to
 * price something new until someone notices; being stale the other way shows a
 * price nobody is charged, which is why the list names reasons rather than just
 * slugs.
 */
export const UNPRICEABLE: Readonly<Record<string, string>> = {
  "anniversary-gf":       "Its publish endpoint does not exist on the server (pre-existing break).",
  "anniversary-parents":  "Static page — no publish flow.",
  "birthday-bestfriend":  "Static page — no publish flow.",
  "birthday-friend":      "Static page — no publish flow.",
  "birthday-parents":     "Static page — no publish flow.",
  "christian-wedding-2":  "Reuses the Christian Wedding editor — price that one instead.",
  "missyou-bestfriend":   "Static page — no publish flow.",
  "sorry-friend":         "Static page — no publish flow.",
  "sorry-gf":             "Static page — no publish flow.",
  "valentine-bestfriend": "Static page — no publish flow.",
};
