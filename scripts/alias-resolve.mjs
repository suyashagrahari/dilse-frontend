// ─── The resolver hook itself ────────────────────────────────────────────────
//
// Registered by scripts/alias-loader.mjs. Kept as a real file rather than an
// inline data: URL because the hook contains regexes and path logic, and
// escaping those through a string that is then URI-encoded and evaluated is a
// way to spend an afternoon on a SyntaxError with no line number.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = pathToFileURL(`${process.cwd()}/`).href;

/**
 * Extensions to try, in the order the TypeScript resolver would.
 *
 * Node's ESM resolver does not guess extensions, and every internal import in
 * this app is written without one.
 */
const CANDIDATES = [".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

function withExtension(base) {
  for (const ext of CANDIDATES) {
    const candidate = new URL(base.href + ext);
    if (existsSync(fileURLToPath(candidate))) return candidate.href;
  }
  return base.href;
}

const RELATIVE = /^\.{1,2}\//;
const HAS_EXTENSION = /\.[a-z0-9]+$/i;

export async function resolve(specifier, context, nextResolve) {
  // Aliased: "@/lib/config" → <root>/lib/config.ts, mirroring tsconfig's
  // "@/*": ["./*"].
  if (specifier.startsWith("@/")) {
    return nextResolve(withExtension(new URL(specifier.slice(2), ROOT)), context);
  }

  // Relative and extensionless: "./paywallBus" → ./paywallBus.ts.
  //
  // Needed for the same reason as the alias: an aliased module is only loadable
  // if ITS imports resolve too, and those are relative. Handling only the alias
  // dies exactly one import deeper.
  if (RELATIVE.test(specifier) && !HAS_EXTENSION.test(specifier)) {
    return nextResolve(withExtension(new URL(specifier, context.parentURL ?? ROOT)), context);
  }

  return nextResolve(specifier, context);
}
