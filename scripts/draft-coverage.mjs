#!/usr/bin/env node
/**
 * Every template that can publish must also keep a draft.
 *
 * ── WHY THIS SCRIPT EXISTS ──────────────────────────────────────────────────
 *
 * This repo has now been bitten three times by the same shape of bug: a
 * per-template obligation, implemented one editor at a time, with a silent
 * failure mode.
 *
 *   • The post-publish feedback ask reached 33 of 43 editors and looked
 *     finished. See `feedback-coverage.mjs`.
 *   • `openShareSheet` misses 10 of 43, so a publish-success panel that assumed
 *     it was universal was half-deployed.
 *   • `?edit=<id>` was read by 45 of 51 editors, so the profile's Edit button
 *     opened a blank editor for six templates. Nothing logged; the page simply
 *     was not there.
 *
 * Auto-draft is the same shape and would fail the same way: a user builds a
 * page in an unwired editor, signs in, and their work is silently not there.
 * From their side that is indistinguishable from us losing it — because we did.
 *
 * So it gets an assertion rather than a convention.
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 *
 * A directory under app/(templates) that fires `EVENTS.PUBLISH_SUCCESS` is a
 * template that publishes. Every one of those must ALSO:
 *
 *   1. call `useDraft`  — so work survives a signed-out visitor signing in
 *   2. read `edit=`     — so the profile's Edit button reopens it
 *
 * Directories that never publish (aliases and variants reusing another editor's
 * hook) are exempt from both.
 *
 * Run: npm run draft:check
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app", "(templates)");

/**
 * Comments removed, so the check reads code and not prose.
 *
 * Not fussiness — this file itself, and every wired editor, carries an
 * explanatory comment naming `useDraft`. A bare substring match would count
 * the comment as the wiring and report a template as done when it is not.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
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
 * Reading the resume id — either way an editor is allowed to do it.
 *
 * Two corrections are baked into this regex, and both were caught by the number
 * it reported rather than by reading the code:
 *
 *   1. NOT the substring "edit=". Almost every editor carries the comment
 *      "navigated from profile with ?edit=<id>", so the first version counted
 *      the comment as the wiring.
 *
 *   2. `useResumeDraft` counts on its own. It reads the id from
 *      window.location.search itself — it has to, because useSearchParams opts
 *      a page out of static prerendering unless it sits under Suspense, and
 *      that broke `next build` on the two retrofitted editors that did not
 *      already call it. So a retrofitted editor legitimately contains no
 *      `.get("edit")` at all.
 */
const READS_EDIT_PARAM = /\.get\(\s*["'`]edit["'`]\s*\)|useResumeDraft/;

const templates = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory());

const publishes = [];
const missingDraft = [];
const missingResume = [];
const exempt = [];

for (const name of templates) {
  const files = walk(join(ROOT, name));
  let code = "";
  for (const f of files) code += stripComments(readFileSync(f, "utf8")) + "\n";

  if (!code.includes("PUBLISH_SUCCESS")) {
    exempt.push(name);
    continue;
  }
  publishes.push(name);
  if (!code.includes("useDraft")) missingDraft.push(name);
  if (!READS_EDIT_PARAM.test(code)) missingResume.push(name);
}

const pad = (n) => String(n).padStart(3, " ");
console.log("");
console.log("  Draft coverage");
console.log("  ──────────────");
console.log(`  ${pad(templates.length)} template directories`);
console.log(`  ${pad(exempt.length)} never publish (exempt: aliases and variants)`);
console.log(`  ${pad(publishes.length)} publish, and so must keep a draft`);
console.log("");
console.log(`  ${pad(publishes.length - missingDraft.length)}/${publishes.length} call useDraft`);
console.log(`  ${pad(publishes.length - missingResume.length)}/${publishes.length} read ?edit=`);
console.log("");

let failed = false;

if (missingDraft.length) {
  failed = true;
  console.log(`  ✗ ${missingDraft.length} publish but never keep a draft:`);
  for (const n of missingDraft) console.log(`      ${n}`);
  console.log("");
}

if (missingResume.length) {
  failed = true;
  console.log(`  ✗ ${missingResume.length} publish but ignore ?edit= — the profile's Edit button`);
  console.log(`    opens a blank editor for these:`);
  for (const n of missingResume) console.log(`      ${n}`);
  console.log("");
}

if (failed) {
  console.log("  A template that publishes must keep a draft and must reopen it.");
  console.log("");
  process.exit(1);
}

console.log("  ✓ every publishing template keeps a draft and can reopen it");
console.log("");
