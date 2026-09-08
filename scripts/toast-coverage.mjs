#!/usr/bin/env node
/**
 * ─── Toast coverage ─────────────────────────────────────────────────────────
 *
 * Asserts that there is ONE toast in this app.
 *
 * ── WHY THIS CHECK EXISTS ───────────────────────────────────────────────────
 *
 * There used to be forty. Ten as a `ToastStack.tsx`, thirty defined inline in a
 * `page.tsx`, plus forty-three copies of the state and forty-three page
 * wirings. Nobody decided that; it accumulated one template at a time, and each
 * new template copied its neighbour because copying was the cheapest thing to
 * do in the moment.
 *
 * The bill arrived when the publish toast had to stop carrying the share link:
 * 97 of the 116 files in that change existed only because of the duplication,
 * and two toasts — `watch` and `call` — were written in bespoke markup that two
 * separate sweeps missed. They were caught by a leak scan, not by review.
 *
 * A shared component alone would not have prevented that. The drift lived in
 * the copies of the state and the per-page wiring as much as in the markup, so
 * this checks for all three.
 *
 * ── WHY IT SCANS THE WHOLE APP AND NOT JUST THE TEMPLATES ───────────────────
 *
 * The first version of this check looked only under app/(templates), reported
 * "one toast component, shared by every editor", and was true and useless: at
 * that moment FOUR toast systems were live in one bundle. shadcn's
 * `components/ui/toaster.tsx` was mounted app-wide in Providers with no caller
 * left anywhere. `sonner` was mounted app-wide for two components in one
 * template. And app/(app)/admin/users/[userId]/ui.tsx had its own React context
 * toast, used by eight admin files, exporting a `useToast` and a `ToastHost`
 * with the same names as the shared ones and different behaviour.
 *
 * A checker scoped narrower than the problem gives cover rather than coverage.
 * This one now walks app/, components/ and lib/.
 *
 * ── THE ALLOWLIST IS NOT A LOOPHOLE ─────────────────────────────────────────
 *
 * Four toasts are deliberately NOT on the bus, and they have one thing in
 * common: they are part of a template's artwork, rendered inside the design and
 * shown to the RECIPIENT, not to the creator. `call` renders its toast inside a
 * phone mockup; `watch` inside the watch face. Putting those on the app-level
 * host would move them outside the frame they belong to, which is a visual bug,
 * not a consolidation.
 *
 * The distinction that matters: editor chrome is shared, template artwork is
 * the template's own. Anything new must justify itself against that line, which
 * is why each entry carries a reason rather than just a path.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app", "(templates)");
/** Everywhere a second toast could hide. */
const SCAN_ROOTS = ["app", "components", "lib"].map((d) => join(process.cwd(), d));
const SHARED_HOST = join(process.cwd(), "components", "toast", "ToastHost.tsx");
const SHARED_BUS = join(process.cwd(), "lib", "toast", "toastBus.ts");

/**
 * In-canvas toasts: part of the template shown to the recipient, not editor
 * chrome. Each needs a reason, so the next addition is an argument rather than
 * a line in a list.
 */
const IN_CANVAS = {
  "call/components/CallTemplate.tsx":
    "renders inside the PortraitFrame phone mockup — app-level chrome would sit outside the frame",
  "watch/components/WatchTemplate.tsx":
    "renders inside the watch face design, styled as part of the artwork",
  "apology-dashboard/components/ApologyDashboard.tsx":
    "the dashboard's own in-page notifications, seen by the recipient",
  "product/components/ProductTemplate.tsx":
    "the fake storefront's 'added to cart' toast — part of the joke, not the editor",
};

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

const ownState = [];
const ownRenderer = [];
let editorsOnBus = 0;
let inCanvasSeen = 0;

for (const file of walk(ROOT)) {
  const rel = file.replace(ROOT + "/", "");
  const src = stripComments(readFileSync(file, "utf8"));

  if (Object.hasOwn(IN_CANVAS, rel)) {
    inCanvasSeen++;
    continue;
  }

  // Its own store: state, an id counter, or its own push/dismiss.
  const state =
    /const \[toasts, setToasts\]/.test(src) ||
    /const toastIdRef/.test(src) ||
    /const pushToast\s*=/.test(src) ||
    /const dismissToast\s*=/.test(src);
  if (state) ownState.push(rel);

  // Its own renderer.
  const renderer =
    /function ToastStack\s*\(/.test(src) ||
    /<ToastStack\b/.test(src) ||
    /toasts\.map\s*\(/.test(src);
  if (renderer) ownRenderer.push(rel);

  if (/@\/lib\/toast\/useToast/.test(src)) editorsOnBus++;
}

console.log(`template files on the shared toast : ${editorsOnBus}`);
console.log(`in-canvas toasts allowed    : ${inCanvasSeen} of ${Object.keys(IN_CANVAS).length}`);

let failed = false;

if (ownState.length > 0) {
  failed = true;
  console.error(`\n✗ ${ownState.length} file(s) keep their own toast state:`);
  for (const f of ownState) console.error(`    ${f}`);
  console.error(
    "\n  Use the shared one instead — there is no state to keep:\n" +
      "      const { pushToast } = useToast();   // @/lib/toast/useToast\n" +
      "      pushToast({ type: \"publish\", title: \"Published!\", message: \"Tap Share to send it\" });"
  );
}

if (ownRenderer.length > 0) {
  failed = true;
  console.error(`\n✗ ${ownRenderer.length} file(s) render their own toast stack:`);
  for (const f of ownRenderer) console.error(`    ${f}`);
  console.error(
    "\n  `ToastHost` is mounted once per route group, so there is nothing to render\n" +
      "  and nothing to wire into a page. If this really is template artwork shown\n" +
      "  to the recipient rather than editor chrome, add it to IN_CANVAS in this\n" +
      "  script WITH a reason."
  );
}

// A stale allowlist is its own kind of rot.
if (inCanvasSeen !== Object.keys(IN_CANVAS).length) {
  failed = true;
  console.error(
    `\n✗ IN_CANVAS lists ${Object.keys(IN_CANVAS).length} file(s) but ${inCanvasSeen} were found — ` +
      "remove the entries that no longer exist."
  );
}

for (const [path, required] of [
  [SHARED_HOST, "components/toast/ToastHost.tsx"],
  [SHARED_BUS, "lib/toast/toastBus.ts"],
]) {
  try {
    statSync(path);
  } catch {
    failed = true;
    console.error(`\n✗ the shared toast is missing: ${required}`);
  }
}

// ── 4. no OTHER toast system anywhere in the app ───────────────────────────
//
// A rival is anything that renders its own stack or keeps its own store outside
// lib/toast. Matching is on the give-aways the four real ones had: a mounted
// host component, a context provider, or a store of toast items.
const RIVALS = [
  [/from ["']sonner["']/, "imports the sonner package"],
  [/@\/components\/ui\/toaster/, "imports shadcn's Toaster"],
  [/@\/hooks\/use-toast/, "imports shadcn's use-toast"],
  [/createContext<[^>]*\btone\b/, "declares its own toast context"],
  [/const \[toasts, setToasts\]/, "keeps its own toast store"],
  [/export function ToastHost/, "exports a second ToastHost"],
  [/export const useToast|export function useToast/, "exports a second useToast"],
];
const OURS = new Set([
  "lib/toast/toastBus.ts",
  "lib/toast/useToast.ts",
  "components/toast/ToastHost.tsx",
]);

const rivals = [];
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const rel = file.replace(process.cwd() + "/", "");
    if (OURS.has(rel)) continue;
    if (rel.includes("/.next/") || rel.endsWith(".test.mjs")) continue;
    const inCanvasKey = rel.replace("app/(templates)/", "");
    if (Object.hasOwn(IN_CANVAS, inCanvasKey)) continue;
    const src = stripComments(readFileSync(file, "utf8"));
    for (const [re, why] of RIVALS) {
      if (re.test(src)) rivals.push(`${rel} — ${why}`);
    }
  }
}

if (rivals.length > 0) {
  failed = true;
  console.error(`\n✗ ${rivals.length} rival toast system(s) outside lib/toast:`);
  for (const r of rivals) console.error(`    ${r}`);
  console.error(
    "\n  One toast means one store and one renderer for the whole app, admin\n" +
      "  included. Use `useToast()` from @/lib/toast/useToast. If this really is\n" +
      "  template artwork shown to the recipient, add it to IN_CANVAS with a reason."
  );
}

if (failed) process.exit(1);

console.log("\n✓ one toast component, shared by every editor");
