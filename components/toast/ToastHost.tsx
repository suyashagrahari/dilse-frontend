"use client";

// ─── ToastHost — the one toast on screen, for every template ─────────────────
//
// Mounted once per route group beside `ShareSheetHost`, `FeedbackHost` and
// `PaywallHost`. Renders nothing until something calls `pushToast`.
//
// See `lib/toast/toastBus.ts` for why this replaced forty hand-rolled stacks.
//
// ── THE CHOICES THAT WERE PREVIOUSLY MADE FORTY TIMES ───────────────────────
//
// POSITION — top centre. Seventeen templates already used exactly
// `top-16 left-1/2 -translate-x-1/2` and nine more used a variant of the same
// idea, so top-centre was the house standard in everything but name; the
// stragglers (two at top-right, six full-width) were the outliers. Centre also
// keeps clear of the bottom navigation every template puts a thumb on, and
// `top: 4.5rem` clears the sticky editor bars.
//
// WIDTH — capped, not full-bleed. A toast that spans a desktop viewport reads as
// a page banner and gets ignored; one that hugs its text reads as a reply to
// what you just did.
//
// COLOUR — the template's `accent` drives the icon chip and the timer bar, and
// nothing else. The surface stays a near-white card in every template because a
// toast tinted end-to-end in a template's colour was the main reason forty of
// these looked like forty different products. Type-coloured fallbacks apply when
// a caller passes no accent, so a bare `pushToast({ title })` still looks right.
//
// MOTION — one spring in, a fade-and-lift out, and none of it under
// `prefers-reduced-motion`, where the toast simply appears. The timer bar is the
// only continuous animation and it is the first thing that setting removes.
//
// ANNOUNCEMENT — the stack is a `role="status"` / `aria-live="polite"` region so
// a screen reader hears "Published! Tap Share to send it" without the focus
// moving. Errors are `assertive`, because a failure that waits politely for a
// pause in speech may never be heard at all.
//
// POINTER — hovering pauses dismissal, which is what makes a six-second toast
// safe for a slow reader without making it a modal for everyone else. The stack
// is `pointer-events: none` and each card re-enables them, so the region never
// swallows a tap meant for the page underneath.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { BRAND } from "@/lib/brand";
import {
  clearToasts,
  dismissToast,
  holdToast,
  releaseToast,
  TOAST_DURATION,
  useToasts,
  type Toast,
  type ToastType,
} from "@/lib/toast/toastBus";

/** Fallback accent per type, for callers that pass none. */
const TYPE_ACCENT: Record<ToastType, string> = {
  publish: BRAND.gold,
  success: BRAND.ok,
  error: BRAND.danger,
  info: BRAND.accent,
};

/**
 * Inline SVG rather than an icon package: this component is mounted on every
 * template route, and four glyphs are not worth the import.
 */
function Glyph({ type }: { type: ToastType }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
  };
  if (type === "publish") {
    // A paper plane — the page has gone out into the world.
    return (
      <svg {...common}>
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4Z" />
      </svg>
    );
  }
  if (type === "success") {
    return (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg {...common}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const accent = toast.accent || TYPE_ACCENT[toast.type];
  const duration = toast.duration ?? TOAST_DURATION[toast.type];

  return (
    <div
      className="ss-toast"
      // A hover that pauses the timer is only useful if leaving restarts it.
      onMouseEnter={() => holdToast(toast.id)}
      onMouseLeave={() => releaseToast(toast.id)}
      // Focus does the same, so a keyboard user reading it does not lose it.
      onFocus={() => holdToast(toast.id)}
      onBlur={() => releaseToast(toast.id)}
    >
      <span className="ss-toast-chip" style={{ color: accent, background: `${accent}1a` }}>
        <Glyph type={toast.type} />
      </span>

      <div className="ss-toast-body">
        <p className="ss-toast-title">{toast.title}</p>
        {toast.message ? <p className="ss-toast-msg">{toast.message}</p> : null}
      </div>

      <button
        type="button"
        className="ss-toast-x"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss"
      >
        <svg
          width={13}
          height={13}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 6 12 12" />
          <path d="M18 6 6 18" />
        </svg>
      </button>

      {/* The timer, made visible. A toast that vanishes with no warning reads as
          a glitch; a bar draining tells the reader they have a moment and that
          the disappearance was intended. Hidden when dismissal is manual. */}
      {duration > 0 ? (
        <i
          className="ss-toast-bar"
          style={{ background: accent, animationDuration: `${duration}ms` }}
        />
      ) : null}
    </div>
  );
}

export function ToastHost() {
  const toasts = useToasts();
  const pathname = usePathname();

  // A toast about the page you just left is noise at best, and at worst a lie —
  // "Published!" sitting over a different template. Cleared on navigation.
  useEffect(() => {
    clearToasts();
  }, [pathname]);

  if (toasts.length === 0) return null;

  const hasError = toasts.some((t) => t.type === "error");

  return (
    <>
      <style>{`
        .ss-toast-region {
          position: fixed;
          top: 4.5rem;
          left: 50%;
          transform: translateX(-50%);
          /* ── ABOVE EVERY SURFACE THAT CAN BE OPEN WHEN A TOAST FIRES ──────
             Measured rather than guessed. In an editor the competing layers are
             the paywall modal (201), a template's edit sheet (300), the share
             sheet (400), the auth modal (510), the feedback modal (1200) and
             photo-puzzle's piece tray (9999). At the old value of 200 every one
             of those covered the toast, so "Saved!" while an edit sheet was
             open was invisible — which is exactly when somebody most needs to
             see it.

             10000 clears all of them and deliberately stays under the two
             things that SHOULD outrank a toast: the impersonation banner
             (99999), because an admin must always see whose account they are
             in, and the app splash (max), which owns the screen before the app
             has rendered. */
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: calc(100vw - 32px);
          max-width: 380px;
          pointer-events: none;
        }
        .ss-toast {
          pointer-events: auto;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 14px;
          background: ${BRAND.surface};
          border: 1px solid ${BRAND.border};
          box-shadow: 0 10px 30px -8px rgba(61,12,17,0.28), 0 2px 8px rgba(61,12,17,0.06);
          animation: ssToastIn 320ms cubic-bezier(0.16,1,0.3,1);
        }
        .ss-toast-chip {
          flex: none;
          width: 26px;
          height: 26px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ss-toast-body { flex: 1; min-width: 0 }
        .ss-toast-title {
          margin: 0;
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.35;
          color: ${BRAND.text};
        }
        .ss-toast-msg {
          margin: 2px 0 0;
          font-size: 12px;
          line-height: 1.4;
          color: ${BRAND.muted};
        }
        .ss-toast-x {
          /* ── A THUMB-SIZED TARGET, NOT AN ICON-SIZED ONE ──────────────────
             The glyph is 13px, which measured 22x22 with the padding it had —
             half the size a finger needs, on the one control that exists to
             get rid of something in a hurry. The button is now 36px square
             while the glyph stays 13px, and the negative margin keeps the
             extra bulk from pushing the text or growing the card. */
          flex: none;
          margin: -6px -6px 0 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          background: none;
          border-radius: 10px;
          color: ${BRAND.faint};
          cursor: pointer;
          line-height: 0;
        }
        .ss-toast-x:hover { background: rgba(61,12,17,0.05); color: ${BRAND.text} }
        .ss-toast-bar {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          transform-origin: left;
          opacity: 0.55;
          animation-name: ssToastDrain;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        /* Pausing the dismissal without pausing its own countdown would leave the
           bar lying about how long is left. */
        .ss-toast:hover .ss-toast-bar,
        .ss-toast:focus-within .ss-toast-bar { animation-play-state: paused }

        @keyframes ssToastIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97) }
          to   { opacity: 1; transform: none }
        }
        @keyframes ssToastDrain {
          from { transform: scaleX(1) }
          to   { transform: scaleX(0) }
        }

        /* Dark templates: keep the card readable without inverting the accent,
           which is the template's own brand colour and should not shift. */
        @media (prefers-color-scheme: dark) {
          .ss-toast {
            background: #241014;
            border-color: rgba(255,255,255,0.10);
            box-shadow: 0 10px 30px -8px rgba(0,0,0,0.55);
          }
          .ss-toast-title { color: #f7ece2 }
          .ss-toast-msg { color: rgba(247,236,226,0.68) }
          .ss-toast-x { color: rgba(247,236,226,0.55) }
          .ss-toast-x:hover { background: rgba(255,255,255,0.08); color: #f7ece2 }
        }

        /* The bar is a continuous animation on a timer — exactly what this asks
           us not to run. The toast still dismisses itself; it just does it
           without a moving part. */
        @media (prefers-reduced-motion: reduce) {
          .ss-toast { animation: none }
          .ss-toast-bar { display: none }
        }

        @media (max-width: 420px) {
          .ss-toast-region { top: 3.75rem }
        }
      `}</style>

      <div
        className="ss-toast-region"
        role="status"
        aria-live={hasError ? "assertive" : "polite"}
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </div>
    </>
  );
}

export default ToastHost;
