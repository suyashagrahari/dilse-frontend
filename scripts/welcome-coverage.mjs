#!/usr/bin/env node
/**
 * ─── Welcome coverage ───────────────────────────────────────────────────────
 *
 * Asserts the invariant the welcome-back greeting depends on:
 *
 *   EVERY template that can publish reaches the greeting, and it reaches it the
 *   same way — by pushing the shared publish toast.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * The greeting was reported as "it only comes in one template". It turned out
 * to be a rate limit rather than missing coverage, but the report was the right
 * question to ask and there was no way to answer it without reading fifty-three
 * directories by hand. A feature that is supposed to be everywhere needs a
 * check that says so, or "is it everywhere?" is re-litigated every time it
 * looks quiet on some page.
 *
 * `feedback-coverage.mjs` learned this the expensive way: its first version
 * asked "does this symbol appear anywhere under this folder?", answered
 * "✓ all 43 covered", and was wrong about 31 of them. So this checks reachable
 * facts, not the presence of a string:
 *
 *   1. PUBLISHES BUT NEVER SAYS SO — a template that POSTs to `/publish` and
 *      pushes no `type: "publish"` toast has no moment for the greeting to
 *      stand in. It would also mean somebody publishes and is told nothing,
 *      which is a worse bug than the missing greeting.
 *   2. ITS OWN GREETING — a template that imports `welcomeBus` or renders
 *      `WelcomeBackOverlay` itself has forked the flow. Nine templates and one
 *      variant did exactly that to the share sheet once — same component,
 *      private wiring — and that is how the feedback ask went missing from ten
 *      editors for a month. There is ONE way in, and it is the publish toast.
 *
 *      What this deliberately does NOT check is whether a template has a toast
 *      of its own. Four do, and they are right to: `call` renders one inside a
 *      phone mockup, `watch` inside the watch face. Those are artwork shown to
 *      the RECIPIENT, not editor chrome, and `toast-coverage.mjs` already
 *      polices that line with a reason recorded per entry. Two scripts
 *      disagreeing about the same rule is worse than one enforcing it.
 *   3. NO HOST — a route group containing a publishing template but no
 *      `WelcomeHost` mounted above it has a bus nobody is listening to. Nested
 *      template layouts are fine: they render inside `(templates)/layout.tsx`.
 *
 * ── WHY IT FOLLOWS IMPORTS ──────────────────────────────────────────────────
 *
 * `christian-wedding-2` is a live template whose editor hook lives in
 * `christian-wedding/`. A per-folder scan sees an empty directory and skips it
 * silently. Cross-template hook imports are resolved so a variant cannot hide.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app");
const TEMPLATES = join(ROOT, "(templates)");

/** Comments describe the old behaviour as often as the current one. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .replace(/([^:])\/\/.*$/gm, "$1");
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Files under `dir`, plus any template hook it imports from a sibling. */
function filesFor(dir) {
  const own = walk(dir);
  const seen = new Set(own);
  for (const file of own) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/from\s+["']@\/app\/\(templates\)\/([^"']+)["']/g)) {
      for (const ext of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const target = join(TEMPLATES, m[1] + ext);
        if (existsSync(target) && !seen.has(target)) {
          seen.add(target);
          own.push(target);
        }
      }
    }
  }
  return [...seen];
}

const dirs = readdirSync(TEMPLATES)
  .filter((d) => statSync(join(TEMPLATES, d)).isDirectory())
  .sort();

const publishing = [];
const noToast = [];
const bespoke = [];

for (const name of dirs) {
  const sources = filesFor(join(TEMPLATES, name)).map((f) => stripComments(readFileSync(f, "utf8")));
  const joined = sources.join("\n");

  // Does it publish at all? Aliases and static pages do not.
  if (!/\/publish["'`]/.test(joined)) continue;
  publishing.push(name);

  if (!/type:\s*["']publish["']/.test(joined)) noToast.push(name);

  // Reaching around the one door. The publish toast is the only way in.
  if (/welcome\/welcomeBus|WelcomeBackOverlay|greetThenRun\s*\(/.test(joined)) bespoke.push(name);
}

// ── 3. a host above every publishing template ──────────────────────────────
const groupLayout = join(TEMPLATES, "layout.tsx");
const hostMounted = existsSync(groupLayout) && /<WelcomeHost\b/.test(readFileSync(groupLayout, "utf8"));

const problems = [];
if (noToast.length) problems.push([`publish but push no publish toast`, noToast]);
if (bespoke.length) problems.push([`raise the greeting themselves instead of through the publish toast`, bespoke]);
if (!hostMounted) problems.push([`app/(templates)/layout.tsx does not mount <WelcomeHost>`, []]);

console.log("");
console.log(`templates that publish              : ${publishing.length}`);
console.log(`  announcing it on the shared toast : ${publishing.length - noToast.length}`);
console.log(`  <WelcomeHost> mounted above them  : ${hostMounted ? "yes" : "NO"}`);
console.log("");

if (problems.length === 0) {
  console.log("✓ every publishing template reaches the welcome-back greeting");
  process.exit(0);
}

for (const [what, names] of problems) {
  console.error(`✗ ${names.length ? names.length + " " : ""}${what}`);
  for (const n of names) console.error(`    ${n}`);
}
console.error("");
console.error("The greeting hangs off pushToast({ type: \"publish\" }) — see");
console.error("lib/welcome/welcomeBus.ts for why that is the only universal seam.");
process.exit(1);
