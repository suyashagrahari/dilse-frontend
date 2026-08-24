#!/usr/bin/env node
/**
 * Fails when a page exists on disk but is in neither the sitemap nor the
 * documented exclusion list in lib/site-routes.ts.
 *
 * This check exists because the sitemap silently drifted: ~20 shipped template
 * pages (apology-dashboard, court-marriage, kundli-milan, …) were live, 200,
 * and fully absent from sitemap.xml, so neither Google nor Bing had any way to
 * discover them. Nothing failed — the sitemap was simply built from a
 * hand-maintained map that nobody updated when a template shipped.
 *
 *   npm run seo:check                      # against production
 *   npm run seo:check -- http://localhost:3000
 *
 * A new route is now a loud failure with an instruction, not silence.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || "https://subhsandesh.in").replace(/\/$/, "");

/** Top-level public routes that have a page.tsx on disk. */
function discoverRoutes() {
  const found = new Set();
  const walk = (dir, segments) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (!statSync(full).isDirectory()) continue;
      // Dynamic segments can't be enumerated; private folders aren't routes.
      if (entry.startsWith("[") || entry.startsWith("_") || entry === "api") continue;
      // (group) folders don't appear in the URL.
      const next = /^\(.*\)$/.test(entry) ? segments : [...segments, entry];
      if (readdirSync(full).some((f) => /^page\.(tsx|ts|jsx|js)$/.test(f))) {
        found.add("/" + next.join("/"));
      }
      if (next.length < 2) walk(full, next);
    }
  };
  walk(join(ROOT, "app"), []);
  found.delete("/");
  return [...found].sort();
}

/** Object keys out of lib/site-routes.ts, without pulling in a TS runtime. */
function documentedExclusions() {
  const src = readFileSync(join(ROOT, "lib", "site-routes.ts"), "utf8");
  const block = (name) => {
    const m = src.match(new RegExp(`${name}[^=]*=\\s*{([\\s\\S]*?)\\n};`));
    return m ? [...m[1].matchAll(/"([^"]+)"\s*:/g)].map((x) => x[1]) : [];
  };
  return new Set([
    ...block("COMING_SOON_REDIRECTS").map((s) => `/${s}`),
    ...block("NON_INDEXABLE_ROUTES"),
  ]);
}

async function sitemapPaths() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/")
  );
}

const routes = discoverRoutes();
const excluded = documentedExclusions();
const inSitemap = await sitemapPaths();

// A documented exclusion covers its children: "/admin" also excuses
// "/admin/users". Otherwise every new admin screen trips the check.
const isExcluded = (route) =>
  [...excluded].some((e) => route === e || route.startsWith(`${e}/`));

const missing = routes.filter((r) => !inSitemap.has(r) && !isExcluded(r));
const redirecting = [...excluded].filter((r) => inSitemap.has(r));

console.log(`checked ${BASE}`);
console.log(`  routes on disk : ${routes.length}`);
console.log(`  in sitemap     : ${inSitemap.size}`);
console.log(`  excluded       : ${excluded.size}`);

if (redirecting.length) {
  console.error(`\n✗ ${redirecting.length} excluded route(s) are still advertised in the sitemap:`);
  for (const r of redirecting) console.error(`    ${r}`);
}
if (missing.length) {
  console.error(`\n✗ ${missing.length} route(s) are neither indexed nor documented:`);
  for (const r of missing) console.error(`    ${r}`);
  console.error(
    `\n  Add each to STANDALONE_INDEXABLE_PAGES (to index it) or to\n` +
      `  NON_INDEXABLE_ROUTES with a reason (to keep it out) in lib/site-routes.ts.`
  );
}
if (missing.length || redirecting.length) process.exit(1);
console.log("\n✓ every route on disk is either indexed or deliberately excluded");
