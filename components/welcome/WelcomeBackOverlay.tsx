"use client";

// ─── The welcome-back beat ───────────────────────────────────────────────────
//
// Two and a half seconds between "I tapped Publish" and "It's live": a mascot
// that greets a creator who has been here before, by name, and then gets out of
// the way. Raised from `lib/welcome/welcomeBus`, which owns every question about
// WHETHER to greet; this file owns only what it looks like.
//
// ── WHY THERE IS NO CARD ────────────────────────────────────────────────────
//
// The feedback sheet is a card because it is a form — it asks a question and
// waits for an answer, and a question needs somewhere to live. This asks
// nothing. It is a moment, and a moment on a panel is a notification.
//
// So the art floats directly on the blurred scrim with the greeting under it.
// That also settles the problem the feedback stage had to be rewritten to
// solve: with no plate, no panel and no mask anywhere in the subtree, there is
// nothing that could crop the artwork, and both of these files set their
// caption hard against the top edge. `MascotStage` is reused rather than
// reimplemented for exactly that reason — read the crop note at the top of it
// before changing how the art is sized.
//
// ── WHY IT DISMISSES ITSELF, AND SHOWS A LINE WHILE IT DOES ─────────────────
//
// A greeting with an OK button is a dialog, and a dialog in front of "It's
// live" is a toll on the confirmation somebody is actually waiting for. This
// leaves on its own after exactly one loop of its own animation.
//
// But a modal that vanishes by itself is unsettling unless you can see it
// coming, so the hairline under the greeting runs the length of the hold. It is
// the same device as the toast's own timer bar, for the same reason: it turns
// "that disappeared" into "that finished". Tapping anywhere, or Escape, skips
// straight to the end — nobody is ever held here.
//
// ── THE ONE PROMISE ─────────────────────────────────────────────────────────
//
// `closeWelcome` releases the publish toast. Every exit below routes through
// it, and the bus makes it idempotent, because a tap and the timer landing in
// the same frame must not push the toast twice — and no exit at all would mean
// a creator who published successfully and was told nothing.

import { useEffect } from "react";

import MascotStage from "@/components/feedback/MascotStage";
import { BRAND } from "@/lib/brand";
import { WELCOME_MASCOTS } from "@/lib/welcome/welcomeArt";
import { closeWelcome, type WelcomeGreeting } from "@/lib/welcome/welcomeBus";

export interface WelcomeBackOverlayProps {
  greeting: WelcomeGreeting;
}

export default function WelcomeBackOverlay({ greeting }: WelcomeBackOverlayProps) {
  const mascot = WELCOME_MASCOTS[greeting.mascot];
  const { tone } = mascot;

  // ── The hold ──────────────────────────────────────────────────────────────
  //
  // `holdMs` comes from the bus, which computes it from this file's own
  // measured loop length, so the penguin's confetti finishes falling and the
  // shiba is still holding its sign when it leaves. A single hard-coded number
  // would cut one of the two short.
  //
  // Escape is handled here beside it because both are the same intent — end
  // this now — and both must land on the one release.
  useEffect(() => {
    const timer = setTimeout(closeWelcome, greeting.holdMs);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWelcome();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [greeting.holdMs]);

  const line = greeting.name ? `${mascot.greeting}, ${greeting.name}` : `${mascot.greeting}!`;

  return (
    <div
      // A greeting is not a dialog: it takes no input, traps no focus and holds
      // nobody. `status` announces it politely and leaves the focus where the
      // creator left it — on the Publish button they just used.
      role="status"
      aria-live="polite"
      onClick={closeWelcome}
      className="ssWelcomeHost"
      style={{
        position: "fixed",
        inset: 0,
        // Above the toast stack at 10000. They never appear together — this
        // releases the toast as it goes — but a stray toast already on screen
        // when somebody publishes must not sit on top of the greeting.
        zIndex: 10050,
        background: "rgba(26,5,7,0.62)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        cursor: "pointer",
        // Layout that a media query needs to change lives in the stylesheet
        // below, never here: an inline style outranks every rule in a <style>
        // tag, which is the trap that once made the feedback card fill a
        // desktop viewport.
        animation: "ssWelcomeFade 200ms ease-out both",
      }}
    >
      <div className="ssWelcomeCol">
        <MascotStage tone={tone} beat={greeting.mascot}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mascot.src}
            alt={mascot.alt}
            width={mascot.width}
            height={mascot.height}
            decoding="async"
          />
        </MascotStage>

        <p className="ssWelcomeLine">{line}</p>
        <p className="ssWelcomeSub">Good to have you making again.</p>

        <div className="ssWelcomeTrack" aria-hidden="true">
          <i style={{ animationDuration: `${greeting.holdMs}ms` }} />
        </div>
      </div>

      <style>{`
        .ssWelcomeCol {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          /* The art is the message; the words are the caption. This gap is
             what keeps them reading as one object rather than two. */
          gap: 4px;
        }

        /* ── BIGGER THAN IT IS IN THE FEEDBACK SHEET, FROM 640px UP ────────
           "MascotStage" drops to 188px above 640px because there it lives in a
           420px card with a form under it and would crowd the copy. Here there
           is no card and no form — the art is alone in the middle of a desktop
           window, and 188px in 1440x900 reads as an icon rather than a moment.
           Phones keep the stage's own clamp, which is already near its cap.

           Two classes, so this outranks the single-class rule inside
           "MascotStage" no matter which <style> tag the browser sees first —
           relying on source order between two components is a coin toss that
           only starts failing once one of them is code-split differently. */
        @media (min-width: 640px) {
          .ssWelcomeCol .ssfbStage { width: min(272px, 40vh, 34vw) }
        }

        /* ── The greeting ──────────────────────────────────────────────────
           Sized against the viewport rather than at a fixed px, because this
           is the only text on screen and the screen is anything from a 320px
           phone to a desktop. The clamp tops out early: past about 30px it
           stops reading as a friendly hello and starts reading as a banner. */
        .ssWelcomeLine {
          margin: 10px 0 0;
          font-size: clamp(21px, 5.6vw, 28px);
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.15;
          color: ${BRAND.surface};
          /* The scrim is translucent, so whatever was published shows through
             it. This keeps the line legible over a bright template. */
          text-shadow: 0 2px 14px rgba(26, 5, 7, 0.55);
        }

        .ssWelcomeSub {
          margin: 6px 0 0;
          font-size: 14px;
          line-height: 1.4;
          color: rgba(255, 253, 251, 0.74);
          text-shadow: 0 1px 10px rgba(26, 5, 7, 0.45);
        }

        /* ── The hold, made visible ────────────────────────────────────────
           Same idea as the toast's timer bar. It is deliberately a hairline
           and deliberately short: it should be findable if you look for it and
           invisible if you do not. */
        .ssWelcomeTrack {
          margin-top: 18px;
          width: 132px;
          height: 2px;
          border-radius: 2px;
          background: rgba(255, 253, 251, 0.18);
          overflow: hidden;
        }
        .ssWelcomeTrack > i {
          display: block;
          height: 100%;
          width: 100%;
          border-radius: inherit;
          background: ${tone};
          transform-origin: left center;
          animation: ssWelcomeRun linear both;
        }

        @keyframes ssWelcomeFade {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes ssWelcomeRun {
          from { transform: scaleX(0) }
          to   { transform: scaleX(1) }
        }

        /* Under reduced motion the greeting is simply there, and the line is
           simply full. The hold is unchanged — the timer is not decoration,
           it is the only way out that does not need a tap. */
        @media (prefers-reduced-motion: reduce) {
          .ssWelcomeHost { animation: none }
          .ssWelcomeTrack > i { animation: none }
        }
      `}</style>
    </div>
  );
}
