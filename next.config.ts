import type { NextConfig } from "next";

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

  // ── Coming-soon templates → their live counterpart ─────────────────────
  // These template routes exist on disk (a direct URL would open the editor)
  // but are still shown as "Coming Soon" in the gallery. Until each one ships,
  // send any direct visit to the closest LIVE template of the same theme.
  // Temporary (307) on purpose: when a template goes live we just delete its
  // entry here, and no permanent-redirect cache lingers in browsers/CDNs.
  async redirects() {
    const comingSoonToLive: Record<string, string> = {
      // sorry → apology-dashboard
      "sorry-gf": "apology-dashboard",
      "sorry-friend": "apology-dashboard",
      // birthday → birthday-gf
      "birthday-bestfriend": "birthday-gf",
      "birthday-friend": "birthday-gf",
      "birthday-parents": "birthday-gf",
      // miss you → missyou-gf
      "missyou-bestfriend": "missyou-gf",
      // valentine (no live valentine yet) → love-gf
      "valentine-gf": "love-gf",
      "valentine-bestfriend": "love-gf",
      // anniversary (no live anniversary yet) → love-gf
      "anniversary-parents": "love-gf",
      "anniversary-gf": "love-gf",
    };
    return Object.entries(comingSoonToLive).map(([from, to]) => ({
      source: `/${from}`,
      destination: `/${to}`,
      permanent: false,
    }));
  },
};

export default nextConfig;
