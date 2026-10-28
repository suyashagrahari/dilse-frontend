import type { NextConfig } from "next";
import { COMING_SOON_REDIRECTS, RETIRED_BLOG_REDIRECTS } from "./lib/site-routes";

const nextConfig: NextConfig = {
  // ── Standalone output for Docker deployment ─────────────────────────────
  // Produces a self-contained .next/standalone directory with a minimal
  // Node.js server — required for the production Docker image.
  output: "standalone",

  // ── Remove X-Powered-By header ─────────────────────────────────────────
  poweredByHeader: false,

  // ── Enable gzip compression for self-hosted Next.js ────────────────────
  // (Vercel handles this automatically; this applies when self-hosting)
  compress: true,

  // ── Turbopack (default in Next.js 16) ──────────────────────────────────
  // root silences the "multiple lockfiles" workspace warning.
  // Turbopack handles code splitting automatically; no extra config needed.
  turbopack: {
    root: __dirname,
  },

  // ── Tree-shake heavy barrel-import libraries ───────────────────────────
  // Rewrites `import { X } from "lib"` to deep imports so only the used
  // symbols land in the bundle. Works under Turbopack (unlike the webpack
  // splitChunks block below, which only applies to webpack builds). Trims
  // the client JS that blocks FCP/TBT on every route.
  experimental: {
    // ── Inline the route's CSS into the HTML ──────────────────────────────
    //
    // The landing page shipped two render-blocking stylesheets — 4.9 KiB and
    // 23.9 KiB — and on an emulated Moto G over slow 4G they cost 410ms and
    // 1,620ms. Nothing can paint until both arrive, which is why the LCP
    // element (the hero paragraph) showed 3,060ms of "element render delay"
    // against only 60ms of time-to-first-byte: the text was in the first HTML
    // packet and sat there waiting for CSS.
    //
    // Inlined, they arrive in the same response as the markup and the critical
    // path loses two round trips. The trade is that the bytes are no longer
    // cached separately across navigations; at ~29 KiB before compression that
    // is the better side of the deal on a phone, where the round trips cost
    // far more than the bytes.
    inlineCss: true,

    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "react-markdown",
      "@reduxjs/toolkit",
      "react-redux",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "date-fns",
    ],
  },

  // ── Image optimisation ─────────────────────────────────────────────────
  images: {
    // Serve modern formats: AVIF is ~50% smaller than WebP, WebP ~30% smaller than JPEG
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 1 year. Filenames are content-addressed by
    // the optimizer, so a long TTL is safe and avoids re-optimising on every
    // request (huge win for repeat visits + CDN offload).
    minimumCacheTTL: 31536000,

    // ── NAT64 networks break the optimizer's SSRF guard ────────────────────
    //
    // Next refuses to fetch an upstream image whose hostname resolves to a
    // non-unicast address. On an IPv6-only network with DNS64, S3's public
    // IPv4s come back synthesised into the NAT64 prefix — 3.5.213.81 arrives
    // as 64:ff9b::305:d551 — and `ipaddr.js` classifies 64:ff9b::/96 as
    // `rfc6052` rather than `unicast`. Every cover image then fails with
    // "resolved to private ip", even though the real destination is public
    // S3. It is a false positive, and it takes out the whole gallery.
    //
    // Relaxed in development ONLY. In production the guard stays on, because
    // there it is doing real work: `remotePatterns` below allows
    // http://localhost:1337 for the dev Strapi, and with the guard off that
    // entry would let anyone use /_next/image as a proxy into the production
    // box's own localhost.
    //
    // Evaluated at build time, so the production image is built with it off.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Current media bucket (new AWS account) — user-uploaded template images
      {
        protocol: "https",
        hostname: "subhsandesh-prod.s3.ap-south-1.amazonaws.com",
      },
      // Media CDN (CloudFront) — used once static/media is fronted by cdn.subhsandesh.in
      {
        protocol: "https",
        hostname: "cdn.subhsandesh.in",
      },
      // Legacy bucket (old AWS account) — kept so already-published pages that
      // still reference old URLs keep rendering until fully migrated/retired.
      {
        protocol: "https",
        hostname: "gifts-media-prod-123.s3.ap-south-1.amazonaws.com",
      },
      // Strapi blog CMS media — local dev
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      // Strapi blog CMS media — production
      {
        protocol: "https",
        hostname: "strapi.subhsandesh.in",
      },
    ],
  },

  // ── Bundle chunking: use Next.js defaults (deliberately NO custom splitChunks) ──
  // The previous custom override forced EVERY node_module into one shared
  // `vendors.js` chunk loaded on every route — so the landing page downloaded
  // heavy route-only libraries it never uses (@react-pdf/renderer ~400KB used
  // only in apology-dashboard, recharts only in admin analytics, canvas-confetti,
  // html-to-image, etc.). That single monolith was the main cause of high TBT /
  // slow LCP. Next.js's built-in chunking already splits each large library into
  // its OWN chunk that loads only where imported, keeps a stable `framework`
  // chunk (react/react-dom) for long-term caching, and shares a `commons` chunk —
  // which is strictly better here. Combined with `optimizePackageImports` above,
  // route-specific weight now stays off the landing's first load.

  // ── HTTP caching headers ────────────────────────────────────────────────
  async headers() {
    return [
      // ── Immutable static assets (JS/CSS bundles with content hashes) ──────
      // These filenames change when content changes, so 1-year cache is safe.
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ── Local image/font assets ────────────────────────────────────────────
      {
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
            // 7 days + 1 day grace period (stale-while-revalidate serves stale
            // while fetching fresh in the background — no loading spinner)
          },
        ],
      },

      // ── Brand/logo assets (public/indianFestival) ─────────────────────────
      // Rarely change; long cache so the header logo isn't refetched every visit.
      {
        source: "/indianFestival/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },

      // ── Favicon ────────────────────────────────────────────────────────────
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      // ── PWA icons ──────────────────────────────────────────────────────────
      {
        source: "/icons/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },

      // ── Security headers on every route ───────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },

  // ── Redirects: canonical host, then coming-soon templates ──────────────
  async redirects() {
    return [
      // ── www → apex ──────────────────────────────────────────────────────
      // www.subhsandesh.in answered 200 for every path, so the whole site
      // existed at two hostnames. The canonical tag already pointed at the
      // apex, but a canonical is a hint: Bing in particular will still crawl
      // and hold both copies. A 308 makes the apex the only address, and the
      // `has` host match keeps user subdomains ({username}.subhsandesh.in),
      // dev and stag untouched.
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.subhsandesh.in" }],
        destination: "https://subhsandesh.in/:path*",
        permanent: true,
      },
      // ── Retired blog URLs → the live post that replaced them ───────────
      // Google still crawls these. A missing post renders inside the blog's
      // streamed loading boundary, so it answers 200 instead of 404 and Search
      // Console filed each as Soft 404. See RETIRED_BLOG_REDIRECTS.
      ...Object.entries(RETIRED_BLOG_REDIRECTS).map(([from, to]) => ({
        source: `/blog/${from}`,
        destination: `/blog/${to}`,
        permanent: true,
      })),
      // ── Malformed backlinks ────────────────────────────────────────────
      // Some external posts link as markdown with a single slash,
      // `[https:/subhsandesh.in/blog/x](https:/subhsandesh.in/blog/x)`, which a
      // browser resolves to a path on our host. Google logged 11 of these as
      // 404s; with so few backlinks, each one is worth landing on its post.
      {
        source: "/\\[https\\:/subhsandesh.in/blog/:slug([a-z0-9-]+)\\]:rest(.*)",
        destination: "/blog/:slug",
        permanent: true,
      },
      // The same link with its brackets percent-encoded, as crawlers send it.
      {
        source: "/%5Bhttps\\:/subhsandesh.in/blog/:slug([a-z0-9-]+)%5D:rest(.*)",
        destination: "/blog/:slug",
        permanent: true,
      },
      // ── Coming-soon templates → their live counterpart ─────────────────
      // These template routes exist on disk (a direct URL would open the
      // editor) but are still shown as "Coming Soon" in the gallery. Until
      // each one ships, send any direct visit to the closest LIVE template of
      // the same theme. Temporary (307) on purpose: when a template goes live we just delete
      // its entry from COMING_SOON_REDIRECTS, and no permanent-redirect cache
      // lingers in browsers/CDNs. app/sitemap.ts reads the same map so these
      // sources are never advertised to crawlers.
      ...Object.entries(COMING_SOON_REDIRECTS).map(([from, to]) => ({
        source: `/${from}`,
        destination: `/${to}`,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
