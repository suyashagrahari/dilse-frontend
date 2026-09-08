// ─── `@/` for node --test ────────────────────────────────────────────────────
//
// The app imports by alias (`@/lib/config`), which tsconfig maps to the project
// root. Node's type-stripping test runner knows nothing about tsconfig `paths`,
// so any module that imports by alias — directly or transitively — fails with
// ERR_MODULE_NOT_FOUND before a single assertion runs.
//
// That is why every test that existed before this file happened to be on a
// module with no aliased imports. It was a limit on WHAT COULD BE TESTED rather
// than a deliberate boundary: `lib/paywall/publishRequest.ts` is the gate
// between "pressed Publish" and a paid page, and it was untestable for want of
// a resolver hook.
//
// Used as: node --experimental-strip-types --import ./scripts/alias-loader.mjs --test <files>

import { register } from "node:module";

register("./alias-resolve.mjs", import.meta.url);
