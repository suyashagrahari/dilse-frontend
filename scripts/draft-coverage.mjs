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

// ── A RESTORED DRAFT MUST RE-SEAT THE PREVIEW ───────────────────────────────
//
// Thirty-one editors key their preview component on `previewVersion` so it
// re-seeds its own state when the key moves. For those, restoring a draft by
// setting state alone is INVISIBLE: the key does not change, the component does
// not remount, and it goes on rendering the demo it seeded with at mount.
//
// That shipped in 30 of the 31. A signed-out visitor who built a page, closed
// the tab and came back got their work back in the edit sheet — which reads the
// form directly and is not keyed — while the page behind it still showed the
// demo names. The data was intact and would have published correctly; it only
// looked lost, which is the same thing to the person looking at it.
//
// It was found by walking the flow in a browser, not by review, and it is
// exactly the kind of thing review does not catch: every `onAdopted` looked
// complete on its own, and the missing line lives in a different file.
const keyedOnPreview = [];
const notReseating = [];

for (const name of readdirSync(ROOT)) {
  const dir = join(ROOT, name);
  if (!statSync(dir).isDirectory()) continue;
  const pagePath = join(dir, "page.tsx");
  let page;
  try {
    page = readFileSync(pagePath, "utf8");
  } catch {
    continue;
  }
  if (!/key=\{[^}]*previewVersion/.test(page)) continue;
  keyedOnPreview.push(name);

  // The editor hook, including one borrowed from another template.
  const hooks = [];
  const hooksDir = join(dir, "hooks");
  try {
    for (const f of readdirSync(hooksDir)) if (f.endsWith(".ts")) hooks.push(join(hooksDir, f));
  } catch {
    /* no hooks dir */
  }
  for (const m of page.matchAll(/@\/app\/\(templates\)\/([\w-]+)\/hooks\/(\w+)/g)) {
    const candidate = join(ROOT, m[1], "hooks", `${m[2]}.ts`);
    if (!hooks.includes(candidate)) hooks.push(candidate);
  }

  let reseats = false;
  let sawAdopt = false;
  for (const hookPath of hooks) {
    let hook;
    try {
      hook = readFileSync(hookPath, "utf8");
    } catch {
      continue;
    }
    // Both shapes: `onAdopted: (d) => { … }` and a single-expression arrow.
    const block = /onAdopted:\s*(?:\([^)]*\)|\w+)\s*=>\s*\{([\s\S]*?)\n    \},/.exec(hook);
    if (!block) continue;
    sawAdopt = true;
    if (/bumpPreview\(\)|setPreviewVersion/.test(block[1])) reseats = true;
    break;
  }
  if (sawAdopt && !reseats) notReseating.push(name);
}

console.log(`  preview keyed on previewVersion : ${keyedOnPreview.length}`);
console.log(`  re-seated when a draft restores : ${keyedOnPreview.length - notReseating.length}`);

if (notReseating.length > 0) {
  failed = true;
  console.log("");
  console.log(`  ✗ ${notReseating.length} template(s) restore a draft without re-seating the preview:`);
  for (const n of notReseating) console.log(`      ${n}`);
  console.log("");
  console.log("    Their preview is keyed on `previewVersion`, so setting content in");
  console.log("    `onAdopted` changes nothing on screen. Add the bump the rest use:");
  console.log("        bumpPreview();            // or setPreviewVersion((v) => v + 1)");
}

if (failed) {
  console.log("  A template that publishes must keep a draft and must reopen it.");
  console.log("");
  process.exit(1);
}

console.log("  ✓ every publishing template keeps a draft and can reopen it");
console.log("");
