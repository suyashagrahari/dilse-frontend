/**
 * Global type declarations for the third-party analytics globals.
 *
 * Without these, any reference to `window.gtag` / `window.clarity` /
 * `window.dataLayer` fails `tsc --noEmit`. They are all optional because the
 * scripts load asynchronously (and may be blocked entirely by an ad blocker),
 * so every call site must use optional chaining — `window.gtag?.(...)`.
 */

declare global {
  interface Window {
    /** GA4 event queue. Created by the gtag bootstrap snippet. */
    dataLayer?: unknown[];

    /** GA4 command function. Absent until gtag.js loads (or forever, if blocked). */
    gtag?: (...args: unknown[]) => void;

    /** Microsoft Clarity command function. Absent until clarity.js loads. */
    clarity?: (...args: unknown[]) => void;

    /**
     * Set to `true` in the browser console to console.table every tracked event
     * without sending anything anywhere. Used to diagnose double-fires and to
     * confirm parameter shapes. See docs/analytics/SOLUTIONS.md.
     */
    __ANALYTICS_DEBUG__?: boolean;
  }
}

export {};
