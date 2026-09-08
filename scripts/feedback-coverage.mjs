#!/usr/bin/env node
/**
 * ─── Feedback coverage ──────────────────────────────────────────────────────
 *
 * Asserts the invariant the feedback system actually depends on:
 *
 *   The link is reachable ONLY through a share action, and every share action
 *   asks how it went first.
 *
 * ── WHY THIS CHECKS THREE THINGS AND NOT ONE ────────────────────────────────
 *
 * The first version of this script asked one question — "does the string
 * `openShareSheet(` appear anywhere under this template's folder?" — and
 * answered "✓ all 43 covered" while 31 templates never raised the ask on
 * publish and two could not be reached at all. Presence of a symbol somewhere
 * in a directory is not reachability, and a green check that means nothing is
 * worse than no check, because it stops anybody looking.
 *
 * So the three real failure modes each get their own assertion:
 *
 *   1. NO SHARE PATH — a template that publishes but never calls
 *      `openShareSheet` has no door the ask can stand in.
 *   2. ITS OWN SHARE LOGIC — a template that calls `requestFeedback` or
 *      `askThenRun` itself, renders `<ShareSheet>` directly, or keeps its own
 *      `showShareSheet` state, has forked the flow. Nine templates and one
 *      variant used to do exactly this: same house `ShareSheet` component,
 *      driven by local state instead of the bus, which is how they ended up
 *      needing their own feedback trigger and how ten of them got missed.
 *      There is ONE way to share — `openShareSheet` — and the bus does the
 *      asking, the holding and the rendering.
 *   3. A LINK IN THE TOAST — a publish toast carrying `shareUrl` hands over the
 *      link without passing the door, so the ask can be walked around. This is
 *      the leak that made the old numbers meaningless.
 *   4. A LINK PRINTED OR COPYABLE ELSEWHERE — the same leak wearing different
 *      clothes. `app` and `product` each had a "Her link" panel printing the
 *      URL with a Copy beside it, `reception` a "Published Link" box in its
 *      sidebar, and `watch` a Copy button on its toast in bespoke markup that
 *      the toast rule above does not see. All four had a working Share button
 *      already, so the panels were second doors and nothing else.
 *
 * ── WHY IT FOLLOWS IMPORTS ──────────────────────────────────────────────────
 *
 * `christian-wedding-2` is a live template whose editor hook lives in
 * `christian-wedding/`. A per-folder scan sees an empty directory, skips it
 * silently, and reports 43 instead of 44. Cross-template hook imports are
 * resolved so a variant cannot hide.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app", "(templates)");

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
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * A template's own files PLUS any editor hook it imports from a sibling
 * template — see the note above on christian-wedding-2.
 */
function sourceFor(name) {
  const dir = join(ROOT, name);
  const own = walk(dir);
  const text = own.map((f) => readFileSync(f, "utf8")).join("\n");
  const borrowed = new Set();
  for (const m of text.matchAll(/@\/app\/\(templates\)\/([\w-]+)\/hooks\/([\w]+)/g)) {
    if (m[1] === name) continue;
    const p = join(ROOT, m[1], "hooks", `${m[2]}.ts`);
    if (existsSync(p)) borrowed.add(p);
  }
  return {
    source: stripComments(text + "\n" + [...borrowed].map((f) => readFileSync(f, "utf8")).join("\n")),
    borrowedFrom: [...borrowed].map((f) => f.replace(ROOT + "/", "")),
  };
}

const noGate = [];
const asksAtPublish = [];
const linkInToast = [];
const covered = [];
let variants = 0;

for (const name of readdirSync(ROOT).sort()) {
  const dir = join(ROOT, name);
  if (!statSync(dir).isDirectory()) continue;

  const { source, borrowedFrom } = sourceFor(name);
  if (!source.includes("EVENTS.PUBLISH_SUCCESS")) continue;
  if (borrowedFrom.length > 0) variants++;

  const gated = /\bopenShareSheet\s*\(/.test(source);
  // Anything below is this template doing the bus's job for itself.
  const forked = [];
  if (/\brequestFeedback\s*\(/.test(source)) forked.push("calls requestFeedback");
  if (/\baskThenRun\s*\(/.test(source)) forked.push("calls askThenRun");
  if (/<ShareSheet\b/.test(source)) forked.push("renders <ShareSheet> itself");
  if (/showShareSheet/.test(source)) forked.push("keeps its own showShareSheet state");
  const leaks = /pushToast\(\{[^}]*shareUrl\s*:/.test(source);

  if (!gated) noGate.push(name);
  if (forked.length > 0) asksAtPublish.push(`${name} — ${forked.join(", ")}`);
  if (leaks) linkInToast.push(name);
  if (gated && forked.length === 0 && !leaks) covered.push(name);
}

const total = covered.length + new Set([...noGate, ...asksAtPublish, ...linkInToast]).size;
console.log(`templates that publish : ${total}   (${variants} of them a variant borrowing another's hook)`);
console.log(`  sharing through openShareSheet, nothing bespoke : ${covered.length}`);

let failed = false;

if (noGate.length > 0) {
  failed = true;
  console.error(`\n✗ ${noGate.length} template(s) publish but never call openShareSheet:`);
  for (const n of noGate) console.error(`    ${n}`);
  console.error(
    "\n  Every editor shares the same way — one call from handleShare:\n" +
      "      openShareSheet({ url: shareUrl, password: pagePassword, title, accent, slug });\n" +
      "  The bus asks for feedback, holds the sheet back, and renders it through\n" +
      "  ShareSheetHost in the templates layout. Nothing else to wire."
  );
}

if (asksAtPublish.length > 0) {
  failed = true;
  console.error(`\n✗ ${asksAtPublish.length} template(s) run their own share/feedback logic:`);
  for (const n of asksAtPublish) console.error(`    ${n}`);
  console.error(
    "\n  Hand the whole job to the bus. `openShareSheet` already asks on the Share\n" +
      "  click, holds the sheet until the modal closes, and mounts the sheet once\n" +
      "  for every template — so local state, a local <ShareSheet>, and a local\n" +
      "  feedback call are three ways to drift from the other forty-three."
  );
}

if (linkInToast.length > 0) {
  failed = true;
  console.error(`\n✗ ${linkInToast.length} template(s) put the link in the publish toast:`);
  for (const n of linkInToast) console.error(`    ${n}`);
  console.error(
    "\n  A link in the toast is a second door: the creator copies it, never taps\n" +
      "  Share, and is never asked. Drop `shareUrl` from the pushToast call — the\n" +
      "  toast confirms the publish, the Share button hands over the link."
  );
}

// ── 4. the link printed or copyable outside the share sheet ────────────────
//
// Scanned across every template file EXCEPT the share sheets themselves, which
// are the sanctioned place for a link. `{shareUrl}` as JSX text is a print;
// `foo={shareUrl}` is a prop pass and is fine, which is why the pattern refuses
// a preceding `=`. A `handleCopy()` with no argument copies the share URL.
const revealsOutsideSheet = [];
for (const name of readdirSync(ROOT).sort()) {
  const dir = join(ROOT, name);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of walk(dir)) {
    const rel = file.replace(ROOT + "/", "");
    if (/ShareSheet|ShareScreen/i.test(rel)) continue;
    const src = readFileSync(file, "utf8");
    src.split("\n").forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      const printed = /(?<![=\w])\{\s*(?:e|editor)?\.?shareUrl\s*\}/.test(line);
      const copies = /onClick=\{[^}]*handleCopy\s*\(\s*\)/.test(line);
      if (printed || copies) revealsOutsideSheet.push(`${rel}:${i + 1}`);
    });
  }
}

if (revealsOutsideSheet.length > 0) {
  failed = true;
  console.error(`\n✗ ${revealsOutsideSheet.length} place(s) reveal the link outside a share sheet:`);
  for (const n of revealsOutsideSheet) console.error(`    ${n}`);
  console.error(
    "\n  Printing the URL, or a Copy button beside it, is the same second door as\n" +
      "  a link in the toast — the creator takes the link and is never asked. The\n" +
      "  Share button already exists in every one of these editors; let it be the\n" +
      "  only way to the link."
  );
}

if (failed) process.exit(1);

console.log("\n✓ every publishing template hands over the link only through a gated share action");
