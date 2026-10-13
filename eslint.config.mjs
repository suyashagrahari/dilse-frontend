import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Fonts are self-hosted (assets/fonts, via next/font/local). next/font/google downloads from
  // Google on every build, and an occasional malformed answer from Google failed whole deploys
  // ("next/font/google queries have exactly one entry"). To add a font, see scripts/self-host-fonts.py.
  {
    rules: {
      "no-restricted-imports": ["error", { paths: [{ name: "next/font/google", message: "Self-host the font instead: add it with scripts/self-host-fonts.py and use next/font/local (see assets/fonts)." }] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
