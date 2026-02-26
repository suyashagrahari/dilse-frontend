import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Remove X-Powered-By header ─────────────────────────────────────────
  poweredByHeader: false,

  // ── Enable gzip compression for self-hosted Next.js ────────────────────
  // (Vercel handles this automatically; this applies when self-hosting)
  compress: true,

  // ── Image optimisation ─────────────────────────────────────────────────
  images: {
    // Serve modern formats: AVIF is ~50% smaller than WebP, WebP ~30% smaller than JPEG
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 60 seconds minimum before recheck
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ── Webpack bundle optimisation ─────────────────────────────────────────
  webpack(config, { isServer }) {
    if (!isServer) {
      // Split vendor chunks so users don't re-download unchanged libs
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20_000,
        cacheGroups: {
          // Separate heavyweight animation lib into its own chunk
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: "framer-motion",
            chunks: "all",
            priority: 30,
          },
          // Separate Redux into its own chunk
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
            name: "redux",
            chunks: "all",
            priority: 25,
          },
          // All other node_modules together
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
        },
      };
    }
    return config;
  },

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

      // ── Favicon / PWA icons ────────────────────────────────────────────────
      {
        source: "/(favicon.ico|icons/(.*))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
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
};

export default nextConfig;
