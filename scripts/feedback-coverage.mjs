#!/usr/bin/env node
/**
 * Every template that can publish must ask how it went.
 *
 * ── WHY THIS SCRIPT EXISTS ──────────────────────────────────────────────────
 *
 * The post-publish feedback ask is raised from two places: an interception
 * inside `openShareSheet` (which most editors call on publish) and a direct
 * `requestFeedback` call in the ten editors that show their own inline
 * "Published!" panel instead.
 *
 * The first version had only the interception, on the assumption that every
 * editor raises the house share sheet. Ten do not. Nothing failed, nothing
 * logged, and those ten simply never asked — the feature was ~77% deployed and
 * looked 100% deployed. It surfaced only because holi happened to be the
 * template used to test it by hand.
 *
 * That is the failure this repo keeps meeting: a per-template obligation with a
 * silent failure mode. So it gets an assertion rather than a convention.
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 *
 * A directory under app/(templates) that fires `EVENTS.PUBLISH_SUCCESS` is a
 * template that publishes. Every one of those must ALSO contain either
 * `openShareSheet` or `requestFeedback`. Directories that never publish
 * (aliases and variants that reuse another editor) are not required to.
 *
 * Run: npm run feedback:check
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app", "(templates)");

/**
 * Comments removed, so the check reads code and not prose.
 *
 * This is not fussiness. The first version matched the bare substring
 * "openShareSheet", and the explanatory comment added above each direct
 * `requestFeedback` call happens to mention `openShareSheet` by name — so every
 * one of the ten templates that does NOT use the share sheet was counted as
 * using it, and the script reported 43/43 through a path none of them take. A
 * coverage check that a comment can satisfy is worse than no check, because it
 * reports success.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .replace(/([^:])\/\/.*$/gm, "$1");
}

/** Every file under a directory, recursively, that could hold editor code. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

let publishes = 0;
const missing = [];
const viaSheet = [];
const viaDirect = [];

for (const name of readdirSync(ROOT).sort()) {
  const dir = join(ROOT, name);
  if (!statSync(dir).isDirectory()) continue;

  const source = stripComments(
    walk(dir).map((f) => readFileSync(f, "utf8")).join("\n")
  );

  // Not a publishing template — an alias or a variant that reuses an editor.
  if (!source.includes("EVENTS.PUBLISH_SUCCESS")) continue;
  publishes++;

  // A CALL, with its open paren — an import alone does not ask anybody anything.
  const sheet = /\bopenShareSheet\s*\(/.test(source);
  const direct = /\brequestFeedback\s*\(/.test(source);

  if (sheet) viaSheet.push(name);
  else if (direct) viaDirect.push(name);
  else missing.push(name);
}

console.log(`templates that publish : ${publishes}`);
console.log(`  ask via the share sheet interception : ${viaSheet.length}`);
console.log(`  ask directly from their own handler  : ${viaDirect.length}`);

if (missing.length > 0) {
  console.error(`\n✗ ${missing.length} template(s) publish but never ask for feedback:`);
  for (const name of missing) console.error(`    ${name}`);
  console.error(
    "\nAdd one line at the publish-success point:\n" +
      "    requestFeedback({ templateSlug: TEMPLATE, pageUrl: url }, () => {});\n" +
      "  imported from @/lib/feedback/feedbackBus — or raise the house share\n" +
      "  sheet with openShareSheet, which asks on its own."
  );
  process.exit(1);
}

console.log("\n✓ every publishing template asks for feedback");
