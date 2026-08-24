#!/usr/bin/env node
/**
 * Bulk-submit every sitemap URL to IndexNow.
 *
 * lib/indexnow.ts already pings IndexNow when a blog post is published, but
 * only for that post — nothing ever pushed the existing corpus, and nothing
 * pushes template pages at all. IndexNow accepts up to 10,000 URLs per request
 * and fans out to Bing, Yandex, Seznam, Naver and Yep, so one run primes every
 * participating engine with the whole site instead of waiting on crawl
 * discovery. (Google does not participate — it uses the sitemap + Search
 * Console.)
 *
 *   INDEXNOW_KEY=<key> npm run indexnow:submit
 *   INDEXNOW_KEY=<key> npm run indexnow:submit -- --dry-run
 *
 * The key must match the file served at https://<host>/<key>.txt — that file is
 * how IndexNow verifies you control the host. This script checks that before
 * submitting anything, because a mismatch is accepted with a 200 and then
 * silently discarded.
 */
const BASE = (process.env.SITE_URL || "https://subhsandesh.in").replace(/\/$/, "");
const KEY = process.env.INDEXNOW_KEY || "";
const DRY = process.argv.includes("--dry-run");
const BATCH = 10000;

if (!KEY) {
  console.error("INDEXNOW_KEY is not set. It is in client/.env.local.");
  process.exit(1);
}

const host = new URL(BASE).host;
const keyLocation = `${BASE}/${KEY}.txt`;

// A wrong or unserved key file means every submission is quietly dropped.
const keyRes = await fetch(keyLocation);
if (!keyRes.ok) {
  console.error(`✗ key file ${keyLocation} returned ${keyRes.status} — IndexNow cannot verify the host.`);
  process.exit(1);
}
if ((await keyRes.text()).trim() !== KEY) {
  console.error(`✗ key file ${keyLocation} does not contain the key in INDEXNOW_KEY.`);
  process.exit(1);
}
console.log(`✓ key file verified at ${keyLocation}`);

const smRes = await fetch(`${BASE}/sitemap.xml`);
if (!smRes.ok) {
  console.error(`✗ sitemap.xml returned ${smRes.status}`);
  process.exit(1);
}
const urlList = [...(await smRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`✓ ${urlList.length} URLs in sitemap.xml`);

if (DRY) {
  console.log("\n--dry-run: nothing submitted. First 10 URLs:");
  for (const u of urlList.slice(0, 10)) console.log(`    ${u}`);
  process.exit(0);
}

let failed = false;
for (let i = 0; i < urlList.length; i += BATCH) {
  const chunk = urlList.slice(i, i + BATCH);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation, urlList: chunk }),
  });
  // 200 = accepted, 202 = accepted, key validation pending. Both are success.
  const ok = res.status === 200 || res.status === 202;
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} batch ${i / BATCH + 1}: ${chunk.length} URLs → HTTP ${res.status}`);
  if (!ok) console.log(`    ${(await res.text()).slice(0, 300)}`);
}

console.log(
  failed
    ? "\nSome batches were rejected — see the status codes above."
    : "\nSubmitted. Results appear under IndexNow in Bing Webmaster Tools within a few hours."
);
process.exit(failed ? 1 : 0);
