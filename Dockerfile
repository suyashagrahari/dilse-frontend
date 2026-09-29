# syntax=docker/dockerfile:1
# ↑ Enables BuildKit `--mount=type=cache` below (persistent npm + Next.js caches).

# ── Stage 1: deps — Install all dependencies ─────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# Cache the npm download store so a lockfile change re-fetches only what changed.
RUN --mount=type=cache,target=/root/.npm npm ci --frozen-lockfile

# ── Stage 2: builder — Build Next.js ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env vars (baked in at image build time)
ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_PROD_API_URL
ARG NEXT_PUBLIC_PROD_SITE_URL
ARG NEXT_PUBLIC_PROD_ROOT_DOMAIN
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_PROD_STRAPI_URL
# Analytics. Both are optional: an empty value disables that tool entirely, which
# is also the production kill switch — blank the secret and redeploy to turn
# analytics off with no code change.
ARG NEXT_PUBLIC_PROD_GA_ID
ARG NEXT_PUBLIC_PROD_CLARITY_ID
# Scheme+host for every remote media asset. Unset = serve straight from the
# bucket, which is the current, working default. See lib/templateMedia.ts.
ARG NEXT_PUBLIC_MEDIA_ORIGIN

ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_PROD_API_URL=$NEXT_PUBLIC_PROD_API_URL
ENV NEXT_PUBLIC_PROD_SITE_URL=$NEXT_PUBLIC_PROD_SITE_URL
ENV NEXT_PUBLIC_PROD_ROOT_DOMAIN=$NEXT_PUBLIC_PROD_ROOT_DOMAIN
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_PROD_STRAPI_URL=$NEXT_PUBLIC_PROD_STRAPI_URL
# The matching ENV lines are mandatory, not decorative: an ARG alone is not
# visible to `npm run build` below, so NEXT_PUBLIC_* would never be inlined into
# the client bundle and analytics would silently never load in production.
ENV NEXT_PUBLIC_PROD_GA_ID=$NEXT_PUBLIC_PROD_GA_ID
ENV NEXT_PUBLIC_PROD_CLARITY_ID=$NEXT_PUBLIC_PROD_CLARITY_ID
ENV NEXT_PUBLIC_MEDIA_ORIGIN=$NEXT_PUBLIC_MEDIA_ORIGIN
ENV NEXT_TELEMETRY_DISABLED=1

# Cold build every time. The .next/cache mount used to persist across builds, and
# a stale Turbopack next/font entry in it failed production builds repeatedly
# ("next/font/google queries have exactly one entry"). Reliability over speed.
RUN npm run build

# ── Stage 3: runner — Minimal production image ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone build (requires output: 'standalone' in next.config.ts)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
