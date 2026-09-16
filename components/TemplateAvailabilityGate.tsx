"use client";

// ─── The builder gate ────────────────────────────────────────────────────────
//
// Taking a template out of the gallery removes the only way to FIND it. It does
// not remove the way to reach it: a link somebody kept, a bookmarked builder, a
// search result that has not been recrawled yet. This closes that door.
//
// ── WHY IN THE LAYOUT AND NOT IN EACH page.tsx ──────────────────────────────
//
// There are fifty-odd template routes. A guard added per page is a guard that
// gets forgotten on the fifty-first, and the forgetting is silent — the template
// just quietly stays reachable after being switched off. The slug is already in
// the URL, so one component mounted in `app/(templates)/layout.tsx` covers every
// route in the group, including ones nobody has written yet.
//
// ── IT NEVER REFUSES ON THE PAGE'S OWN WORD ─────────────────────────────────
//
// The hidden list arrives inside the HTML, and template routes are statically
// prerendered: Next serves the cached copy and regenerates behind it, so the
// first visitor after the window lapses reads a list that was true when the page
// was BUILT. A template released since then greeted its first visitor with "Not
// available yet", and looked fine on the second visit — the regeneration having
// landed in between.
//
// So a refusal is now checked against the server before it is shown. The two
// directions are not symmetric: rendering the builder for a template that turns
// out to be hidden costs a beat and corrects itself, while refusing a live one
// sends somebody to the gallery to look for a template that is right there.
// Only the expensive direction waits.
//
// ── WHAT THIS DOES NOT TOUCH ────────────────────────────────────────────────
//
// Published pages. They live at `/[id]`, outside the `(templates)` group, so a
// rakhi page somebody has already sent keeps opening for its recipient after the
// template is switched off. That is deliberate and it is the more important half
// of the behaviour: a release control that breaks gifts people have already given
// is not a release control, it is an outage. The server agrees — see the note on
// `middleware/templateGate.ts` about guarding writes only.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { verifyTemplateVisibility } from "@/lib/templateVisibility";

/**
 * Routes inside `(templates)` that are NOT a template builder.
 *
 * The group's first path segment is normally the template slug, but a couple of
 * templates own sub-routes that a recipient (not the sender) opens, and those
 * must survive their template being switched off for the same reason a published
 * page does. Matched on the FULL path so a slug can never accidentally land here.
 */
const NEVER_GATED = (path: string): boolean =>
  // e.g. /profile-pro/recommend/<token>, /profile-pro/endorse/<token>
  /^\/profile-pro\/(recommend|endorse)\//.test(path);

export function TemplateAvailabilityGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const { hidden, resolved, confirmed } = useTemplateAccess();

  const slug = pathname.split("/").filter(Boolean)[0] || "";
  const blocked = !!slug && hidden.has(slug) && !NEVER_GATED(pathname);

  // Ask the server directly, once, and only when we are otherwise about to
  // refuse. Every other visitor to every other template pays nothing: the
  // condition is false for them and this never fires. `verifyTemplateVisibility`
  // is idempotent, so a re-render cannot turn it into a second request, and the
  // result reaches this component through the store rather than through state
  // set from inside an effect.
  useEffect(() => {
    if (blocked && !confirmed) void verifyTemplateVisibility();
  }, [blocked, confirmed]);

  if (!blocked) return <>{children}</>;

  // ── Hold rather than refuse while access is still unknown ─────────────────
  //
  // A super admin can grant one person early access to a hidden template, and
  // that grant arrives with `/auth/me` — after the first paint. Refusing on the
  // first render would show "Not available yet" to the exact client the grant was
  // made for, and then replace it with their template a moment later. That reads
  // as the grant being broken.
  //
  // The same beat is held for the check above: until this page load has asked
  // the server itself, the only evidence against this template is a list that
  // may have been baked into the HTML days ago.
  //
  // Only reached when the slug IS hidden, so a visitor with no token and nobody
  // on a public template never sees this: `resolved` is true for them
  // immediately. See `useTemplateAccess`.
  if (!resolved || !confirmed) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(170deg, #fbf6f1 0%, #f5ede6 100%)",
        }}
        aria-busy="true"
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            border: "2.5px solid rgba(61,12,17,0.14)",
            borderTopColor: "#c9a84c",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "linear-gradient(170deg, #fbf6f1 0%, #f5ede6 100%)",
      }}
    >
      <div style={{ maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 14 }} aria-hidden="true">
          ✨
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: "28px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#2a0a0e",
          }}
        >
          Not available yet
        </h1>
        {/* No mention of an admin, a flag or an environment. To the person who
            landed here this is simply a page that is not open yet, and the rest
            is our business. */}
        <p
          style={{
            margin: "8px 0 22px",
            fontSize: 14,
            lineHeight: "21px",
            color: "#7a5555",
          }}
        >
          This one is still being finished. Everything else is ready to go — have a
          look at what else you can make.
        </p>
        <Link
          href="/templates"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            borderRadius: 999,
            background: "#3d0c11",
            color: "#fdf8ee",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Browse templates
        </Link>
      </div>
    </main>
  );
}

export default TemplateAvailabilityGate;
