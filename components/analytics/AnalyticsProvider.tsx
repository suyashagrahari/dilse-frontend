"use client";

/**
 * Mounts GA4 and Microsoft Clarity, and reports page views + Core Web Vitals.
 *
 * Renders `null`. It adds no DOM, no wrapper elements and no layout shift, so it
 * cannot affect anything the user sees.
 *
 * ── Why no `useSearchParams()` ───────────────────────────────────────────────
 * The obvious way to build `page_location` is `usePathname()` + `useSearchParams()`.
 * But in the App Router, `useSearchParams()` in a component that is not wrapped in
 * a <Suspense> boundary forces the whole route to client-side render at build
 * time. This provider mounts inside Providers.tsx, which wraps *every* route via
 * app/layout.tsx — so that one hook would deopt the entire app out of static
 * rendering, undoing the LCP/CLS work documented at the top of app/layout.tsx.
 * Reading `window.location` inside an effect gives the same information, is the
 * browser's actual truth (correct even when middleware.ts has rewritten the
 * internal route), and cannot affect prerendering because effects never run
 * during a build.
 */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useRef, useState } from "react";
import { CLARITY_ID, GA_ID, ROOT_DOMAIN } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { isSharePath } from "@/lib/analytics/path";
import { flushAnalyticsQueue, setVisitorType, track, trackPageView } from "@/lib/analytics/track";

/**
 * Cookie scope for cross-subdomain continuity.
 *
 * Share links live on `{username}.subhsandesh.in`. The growth loop crosses a
 * subdomain boundary: recipient opens `alice.subhsandesh.in/{shareId}`, clicks
 * Create, lands on `subhsandesh.in/templates`. With a per-host cookie that hop
 * starts a brand-new session and attributes it to a self-referral, so the two
 * halves of the loop can never be joined — the viral coefficient becomes
 * unmeasurable. Pinning the cookie to the registrable domain fixes the session.
 *
 * IMPORTANT: this is only half the fix. `subhsandesh.in` must ALSO be added to
 * GA4 → Admin → Data Streams → Configure tag settings → List unwanted referrals,
 * which cannot be done from code. See docs/analytics/SOLUTIONS.md N1.
 */
const COOKIE_DOMAIN = ROOT_DOMAIN ? `.${ROOT_DOMAIN}` : "auto";

/** EEA + UK + Switzerland — consent defaults to denied here, granted elsewhere. */
const CONSENT_RESTRICTED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

function gaBootstrap(): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());

// Consent Mode v2. Advertising signals are denied everywhere — this property is
// for product analytics, not ads. Analytics storage is granted by default and
// denied in the EEA/UK/CH until consent is collected. Denying analytics_storage
// everywhere without a consent banner would yield cookieless pings: events would
// arrive but user and session counts would stay near zero, making funnels useless.
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted'
});
gtag('consent', 'default', {
  region: ${JSON.stringify(CONSENT_RESTRICTED_REGIONS)},
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});

gtag('config', ${JSON.stringify(GA_ID)}, {
  // App Router client navigations do not reload the document, so gtag's
  // automatic page view would only ever fire for the landing screen. Every view
  // is sent manually from RouteTracker instead — including the first, which is
  // why this must be false rather than merely deduplicated.
  send_page_view: false,
  cookie_domain: ${JSON.stringify(COOKIE_DOMAIN)},
  cookie_flags: 'SameSite=None;Secure'
});`.trim();
}

function clarityBootstrap(id: string): string {
  return `
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", ${JSON.stringify(id)});`.trim();
}

/**
 * Fires a page view on every route change, including the first.
 * Also keeps the creator/recipient segmentation up to date.
 */
function RouteTracker() {
  const pathname = usePathname();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    // React 19 StrictMode double-invokes effects in development. Without this
    // guard every page view would be counted twice locally, which looks
    // identical to a real double-fire bug. Production fires once either way.
    const url = window.location.href;
    if (lastUrl.current === url) return;
    lastUrl.current = url;

    // Recipients arrive on share links and are not customers. Tagging them
    // separately is what keeps conversion rates meaningful — a single share link
    // opened 50 times would otherwise read as 50 users who never converted.
    setVisitorType(isSharePath(window.location.pathname) ? "recipient" : "creator");

    trackPageView();
  }, [pathname]);

  return null;
}

/** Reports real-device Core Web Vitals. CWV is a ranking factor, and field data beats lab data. */
function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    track(EVENTS.WEB_VITALS, {
      metric_name: metric.name,
      // CLS is a small decimal; GA4 metrics are integers. Scaling by 1000
      // preserves precision. Everything else is already in milliseconds.
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_rating: (metric as { rating?: string }).rating,
      metric_id: metric.id,
    });
  });

  return null;
}

export default function AnalyticsProvider() {
  const pathname = usePathname();

  /**
   * Whether Clarity may record this document.
   *
   * Session replay captures rendered DOM, and on a share page that DOM is
   * somebody's apology letter or love note, viewed by a recipient who arrived
   * from a WhatsApp link and never agreed to be recorded. So Clarity is not
   * loaded at all when the document *starts* on a share page — which is how
   * every recipient arrives.
   *
   * Decided once at mount rather than per navigation: a third-party script
   * cannot be unloaded after the fact, so re-evaluating on each route change
   * would give a false sense of control. A creator who later navigates to their
   * own published page is still recorded, which is acceptable — it is their own
   * content and they are a signed-in user. Text masking (Clarity project setting
   * → Masking → Strict) is the backstop for both cases.
   *
   * useState with a lazy initialiser rather than useRef: the value is read during
   * render to decide whether to emit the <Script>, and reading a ref during render
   * is incorrect (React cannot know to re-render when it changes). useState's
   * initialiser runs exactly once per mount, which is precisely the semantics
   * wanted here.
   */
  const [clarityAllowed] = useState(() => !isSharePath(pathname));

  const gaEnabled = GA_ID.length > 0;
  const clarityEnabled = CLARITY_ID.length > 0 && clarityAllowed;

  return (
    <>
      {gaEnabled && (
        <>
          {/* afterInteractive: loads after the app is interactive, so a slow or
              unreachable Google cannot delay first paint or block hydration. */}
          <Script
            id="ga4-lib"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          {/* onReady (not onLoad) fires for inline scripts, and fires after the
              snippet has executed — so `gtag` and the `config` command both exist.
              Flushing here is what rescues the events recorded during mount
              effects, which run before afterInteractive scripts execute: the first
              page_view of every visit, the visitor_type user property, and the
              google_bridge login. Without it those were silently dropped. */}
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            onReady={flushAnalyticsQueue}
            dangerouslySetInnerHTML={{ __html: gaBootstrap() }}
          />
        </>
      )}

      {clarityEnabled && (
        /* lazyOnload: Clarity is the heavier of the two and nothing depends on
           it being early. This app animates constantly (framer-motion,
           canvas-confetti) and Clarity records DOM mutations, so deferring it
           keeps that cost away from the interaction window on low-end devices. */
        <Script
          id="clarity-init"
          strategy="lazyOnload"
          onReady={flushAnalyticsQueue}
          dangerouslySetInnerHTML={{ __html: clarityBootstrap(CLARITY_ID) }}
        />
      )}

      {/* Mounted unconditionally: both are no-ops when analytics is unconfigured,
          and keeping them mounted means the hook order never changes. */}
      <RouteTracker />
      <WebVitalsReporter />
    </>
  );
}
