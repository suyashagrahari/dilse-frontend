// ─── ContributorShell — the frame every contributor page wears ───────────────
//
// Someone got a link. They do not know what this site is, they have no account,
// and they are giving us ninety seconds because they like the person the page
// is about. This component is everything around the form in those ninety
// seconds: whose page it is, what they are being asked for, the form itself
// (passed in as children), and what happens the moment they press send.
//
// ── IT KNOWS NOTHING ABOUT ANY TEMPLATE ──────────────────────────────────────
//
// Not one word of copy in this file names a template, a brand or a surface. The
// subject's name, the prompt, the button labels and the palette all arrive as
// props, because the same frame carries a review form, a comment box and a note
// left on a call log, and the day it starts saying "review" is the day the
// other two need a fork of it.
//
// ── THE SUCCESS STATE IS THE PRODUCT'S ONLY GROWTH LOOP ──────────────────────
//
// The contributor has just been kind to somebody, and they are the single most
// likely person in the world to want to do the same thing for someone else in
// the next thirty seconds. So the post-submit state is not a toast — it is a
// screen, and the second thing on it is "make one for someone". The first thing
// is still the thank-you, because leading with the pitch turns a favour into an
// ad.
//
// ── MOTION ───────────────────────────────────────────────────────────────────
//
// One fade-and-rise on the success state, expressed in CSS so that
// `prefers-reduced-motion: reduce` can switch it off in the media query at the
// bottom of the style block. Under reduce, the success state simply IS there —
// same content, same buttons, no movement. Nothing is gated on the animation
// finishing, so nothing can be lost with it turned off.

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  CONTRIB_TAP,
  initialsOf,
  resolveTheme,
  type ContribTheme,
} from "@/lib/contrib/types";

/**
 * A WhatsApp share link for the nudge a sender passes around.
 *
 * Exported from here because this is the file that already owns "what the
 * contributor is handed at the end", and both the success state below and the
 * sender's own share sheet build the same URL — two implementations would drift
 * and one of them would end up double-encoding the link.
 *
 * `wa.me` with no phone number opens WhatsApp's own contact picker, which is
 * what we want: the sender chooses who, we only supply the words.
 */
export function whatsappNudgeUrl(message: string, link: string): string {
  const text = [message.trim(), link.trim()].filter(Boolean).join(" ");
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface ContributorShellProps {
  /** Whose page this is. Rendered large — it is the reason they clicked. */
  subjectName: string;
  subjectPhotoUrl?: string;
  /** Small line above the name, e.g. who asked. Optional. */
  eyebrow?: string;
  /** The ask, in the sender's voice. One or two sentences. */
  prompt: string;
  /** The form. Rendered as-is; this component never wraps it in a <form>. */
  children: ReactNode;

  /** Flips the whole frame to the thank-you screen. Owned by the caller. */
  submitted?: boolean;
  successTitle?: string;
  successBody?: string;
  /** Lets them add a second one. Omit and the option is not offered. */
  onAddAnother?: () => void;
  addAnotherLabel?: string;

  /** The nudge in the success state. Both required for it to render. */
  shareLink?: string;
  shareMessage?: string;
  shareLabel?: string;

  ctaHref?: string;
  ctaLabel?: string;
  /** Anything the caller wants under the CTA — a policy line, a credit. */
  footer?: ReactNode;

  theme?: Partial<ContribTheme>;
  className?: string;
}

/** The subject's photo, or their initials. Never an empty ring. */
function SubjectAvatar({
  name,
  photoUrl,
  t,
}: {
  name: string;
  photoUrl?: string;
  t: ContribTheme;
}) {
  const size = 76;
  const shared: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flex: "none",
    border: `1px solid ${t.edge}`,
    background: t.paperDeep,
  };

  if (photoUrl) {
    return (
      // An arbitrary remote URL off a published page; `next/image` would need
      // every host it could ever point at allow-listed in advance.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={name} style={{ ...shared, objectFit: "cover" }} />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        ...shared,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: t.font,
        fontSize: 26,
        letterSpacing: "0.02em",
        color: t.inkSoft,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

/** The one button style this file uses, filled or outlined. */
function ShellButton({
  children,
  onClick,
  href,
  external,
  variant = "primary",
  t,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  variant?: "primary" | "quiet";
  t: ContribTheme;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    minHeight: CONTRIB_TAP + 4,
    padding: "0 18px",
    borderRadius: 14,
    fontFamily: t.font,
    fontSize: 15,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    touchAction: "manipulation",
    border: `1px solid ${variant === "primary" ? t.accent : t.edge}`,
    background: variant === "primary" ? t.accent : "transparent",
    color: variant === "primary" ? t.accentInk : t.ink,
  };

  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    ) : (
      <Link href={href} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export default function ContributorShell({
  subjectName,
  subjectPhotoUrl,
  eyebrow,
  prompt,
  children,
  submitted = false,
  successTitle,
  successBody,
  onAddAnother,
  addAnotherLabel = "Add another",
  shareLink,
  shareMessage,
  shareLabel = "Send this to someone else",
  ctaHref = "/templates",
  ctaLabel = "Make one for someone",
  footer,
  theme,
  className,
}: ContributorShellProps) {
  const t = resolveTheme(theme);
  const nudgeHref = shareLink && shareMessage ? whatsappNudgeUrl(shareMessage, shareLink) : null;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "24px 18px 40px",
        fontFamily: t.font,
        color: t.ink,
        background: t.paper,
        minHeight: "100%",
      }}
    >
      {/* ── Who this is about ────────────────────────────────────────────── */}
      <header style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <SubjectAvatar name={subjectName} photoUrl={subjectPhotoUrl} t={t} />
        <div style={{ minWidth: 0 }}>
          {eyebrow ? (
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: t.inkSoft,
              }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            style={{
              margin: eyebrow ? "4px 0 0" : 0,
              fontFamily: t.serif,
              fontSize: 26,
              lineHeight: 1.2,
              fontWeight: 500,
              color: t.ink,
              overflowWrap: "anywhere",
            }}
          >
            {subjectName}
          </h1>
        </div>
      </header>

      {submitted ? (
        <section
          className="contrib-shell-done"
          // Announced without stealing focus: the contributor may still be
          // scrolling, and a focus jump on submit loses their place.
          aria-live="polite"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "22px 18px",
            borderRadius: 18,
            border: `1px solid ${t.edge}`,
            background: t.paperDeep,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: t.serif,
              fontSize: 21,
              fontWeight: 500,
              color: t.ink,
            }}
          >
            {successTitle ?? "That's in. Thank you."}
          </h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: t.inkSoft }}>
            {successBody ??
              `${subjectName.split(" ")[0] || subjectName} will see it before anyone else does.`}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <ShellButton href={ctaHref} t={t}>
              {ctaLabel}
            </ShellButton>
            {nudgeHref ? (
              <ShellButton href={nudgeHref} external variant="quiet" t={t}>
                {shareLabel}
              </ShellButton>
            ) : null}
            {onAddAnother ? (
              <ShellButton onClick={onAddAnother} variant="quiet" t={t}>
                {addAnotherLabel}
              </ShellButton>
            ) : null}
          </div>
        </section>
      ) : (
        <>
          <p
            style={{
              margin: 0,
              fontFamily: t.serif,
              fontSize: 17,
              lineHeight: 1.6,
              color: t.inkSoft,
            }}
          >
            {prompt}
          </p>
          <div>{children}</div>
        </>
      )}

      {footer ? (
        <footer style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.5, color: t.inkFaint }}>
          {footer}
        </footer>
      ) : null}

      <style>{`
        .contrib-shell-done { animation: contrib-shell-rise 220ms ease-out both; }
        @keyframes contrib-shell-rise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .contrib-shell-done { animation: none; }
        }
      `}</style>
    </div>
  );
}
