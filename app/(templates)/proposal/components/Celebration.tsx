"use client";

// ─── Act 4 — the celebration ─────────────────────────────────────────────────
// Confetti, the payoff animation, the letter, the day counter, a callback to
// however many times they tried to escape, and a share button.

import { useCallback, useEffect, useRef, useState } from "react";
import { ASSETS } from "./assets";
import { daysSince, type ProposalData } from "./types";
import { celebrationBurst, heartPuff } from "./burst";
import { chip, DISPLAY, GLASS, INK, INK_SOFT, PINK_DEEP, PINK_GLOW, PINK_GRADIENT, SCRIPT } from "./theme";
import { copyFor } from "./copy";
import { useStoryCard } from "./StoryCard";

/** A different tease depending on how hard they fought it. */
function dodgeCallback(dodges: number, name: string): string | null {
  if (dodges <= 0) return null;
  if (dodges === 1) return `You reached for "No" exactly once, ${name}. I saw that.`;
  if (dodges < 5) return `You tried to escape ${dodges} times. Adorable.`;
  if (dodges < 10) return `${dodges} escape attempts. That button never stood a chance, and neither did you.`;
  return `${dodges} attempts. You broke the No button. It has filed a complaint.`;
}

export default function Celebration({
  data,
  dodges,
  shareId,
  reduced,
}: {
  data: ProposalData;
  dodges: number;
  shareId?: string;
  reduced: boolean;
}) {
  const voice = copyFor(data.perspective);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const reducedRef = useRef(reduced);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire once on mount — reading the flag from a ref so a mid-celebration
  // preference change can't re-trigger the whole volley sequence.
  useEffect(() => {
    const cancel = celebrationBurst(reducedRef.current);
    return cancel;
  }, []);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
      if (noteTimer.current) clearTimeout(noteTimer.current);
    },
    [],
  );

  const flash = useCallback((ok: boolean) => {
    setCopied(ok);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2600);
  }, []);

  const share = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = shareId ? `${window.location.origin}/${shareId}` : window.location.href;
    const text = voice.shareText(data.recipientName);

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: voice.storyHeadline, text, url });
        return;
      } catch (err) {
        // A cancelled share sheet is not a failure — don't silently copy instead.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        flash(true);
        return;
      } catch {
        /* fall through to the execCommand path below */
      }
    }

    // Last resort for non-secure contexts, where navigator.clipboard is absent.
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flash(true);
    } catch {
      flash(false);
    }
  }, [data.recipientName, flash, shareId, voice]);

  // ── The story card ──────────────────────────────────────────────────────
  //
  // `shareId` is absent in preview, and that is on purpose: there is no
  // published page yet, so the card omits the QR and the printed link rather
  // than pointing at one that does not exist.
  const shareUrl =
    shareId && typeof window !== "undefined" ? `${window.location.origin}/${shareId}` : null;
  const {
    element: storyElement,
    share: shareStory,
    ready: storyReady,
    busy,
  } = useStoryCard(data, shareUrl);

  const postStory = useCallback(async () => {
    const res = await shareStory();
    setNote(res.message);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(""), 5200);
  }, [shareStory]);

  const days = daysSince(data.metDate);
  const callback = dodgeCallback(dodges, data.recipientName || "you");
  const paragraphs = data.secretNote.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <section
      style={{
        // Safe centring: `justify-content:center` clips both ends once the
        // content outgrows the box, and the overflow above the start edge
        // cannot be scrolled to. `margin:auto` on the child centres the same
        // way and degrades to flex-start instead of cutting the top off.
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        // The bottom pad clears the fixed music dock.
        padding: "78px 16px 108px",
      }}
    >
      <div
        style={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
      {/*
        A fixed frame, and the penguin holds still.

        It used to bob inside a box sized to itself, which on a short viewport
        drifted it in and out of the clipped region — it read as the art hanging
        off the screen. The frame now reserves its height so nothing below
        shifts when the image loads, and the only motion on this screen is the
        confetti, which is the part that is supposed to move.
      */}
      <div
        style={{
          height: "clamp(128px,30vh,178px)",
          width: "100%",
          maxWidth: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.joyTears}
          alt="A penguin overwhelmed with happy tears"
          onClick={(e) => heartPuff(e.clientX, e.clientY)}
          style={{
            height: "100%",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
            cursor: "pointer",
            filter: "drop-shadow(0 16px 26px rgba(200,110,150,.3))",
          }}
        />
      </div>

      <h2
        className="ps-pop"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: "clamp(26px,7.4vw,42px)",
          lineHeight: 1.14,
          color: INK,
          textAlign: "center",
          margin: "10px 0 12px",
          maxWidth: 600,
          textWrap: "balance",
        }}
      >
        {data.celebrationTitle}
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          marginBottom: 18,
          maxWidth: 460,
        }}
      >
        {days !== null && (
          <span style={chip("rgba(255,255,255,.78)", PINK_DEEP)}>
            {days.toLocaleString()} days and counting <span aria-hidden>💞</span>
          </span>
        )}
        <span style={chip("rgba(255,255,255,.78)", PINK_DEEP)}>
          {data.recipientName || "you"} {voice.saidYesChip}
        </span>
      </div>

      {callback && (
        <p
          className="ps-rise"
          style={{
            animationDelay: "220ms",
            fontFamily: SCRIPT,
            fontSize: "clamp(19px,5.2vw,25px)",
            color: PINK_DEEP,
            textAlign: "center",
            margin: "0 0 20px",
            maxWidth: 420,
            lineHeight: 1.3,
          }}
        >
          {callback}
        </p>
      )}

      {/* the letter */}
      <article
        className="ps-rise"
        style={{
          ...GLASS,
          animationDelay: "320ms",
          width: "100%",
          maxWidth: 470,
          padding: "26px 22px 22px",
          position: "relative",
          background:
            "linear-gradient(170deg, rgba(255,255,255,.82) 0%, rgba(255,246,250,.7) 60%, rgba(248,240,255,.72) 100%)",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -13,
            left: "50%",
            transform: "translateX(-50%)",
            width: 34,
            height: 34,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            background: PINK_GRADIENT,
            boxShadow: "0 8px 18px -8px rgba(239,83,125,.6)",
          }}
        >
          💗
        </span>

        <p
          style={{
            fontFamily: SCRIPT,
            fontSize: "clamp(22px,6vw,29px)",
            color: PINK_DEEP,
            margin: "4px 0 12px",
            lineHeight: 1,
          }}
        >
          {data.recipientName || "My love"},
        </p>

        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: "clamp(14px,3.8vw,15.5px)",
              lineHeight: 1.72,
              color: INK,
              margin: i === paragraphs.length - 1 ? "0 0 6px" : "0 0 12px",
              whiteSpace: "pre-line",
            }}
          >
            {p}
          </p>
        ))}

        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px dashed rgba(255,182,205,.9)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 11.5, color: INK_SOFT, opacity: 0.85 }}>forever yours,</span>
          <span
            style={{
              fontFamily: SCRIPT,
              fontSize: "clamp(24px,6.4vw,32px)",
              color: PINK_DEEP,
              lineHeight: 1,
              transform: "rotate(-3deg)",
            }}
          >
            {data.senderName || "me"}
          </span>
        </div>
      </article>

      {/* ── The two ways out ──────────────────────────────────────────────
          A story card and a link, side by side, because they are different
          acts rather than a primary and a fallback: one posts a picture to
          everyone, the other sends the page to one person. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          marginTop: 22,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={() => void postStory()}
            disabled={!storyReady || busy}
            className="ps-btn"
            style={{
              border: "none",
              cursor: storyReady && !busy ? "pointer" : "wait",
              padding: "14px 24px",
              borderRadius: 999,
              background: PINK_GRADIENT,
              color: "#fff",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(14.5px,4vw,17px)",
              boxShadow: PINK_GLOW,
              opacity: storyReady ? 1 : 0.72,
              maxWidth: "88vw",
            }}
          >
            <span aria-hidden>📸</span> {busy ? "Making it…" : "Share to your story"}
          </button>

          <button
            type="button"
            onClick={() => void share()}
            className="ps-btn"
            style={{
              cursor: "pointer",
              padding: "14px 24px",
              borderRadius: 999,
              background: "rgba(255,255,255,.8)",
              border: "1px solid rgba(255,182,205,.95)",
              color: PINK_DEEP,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(14.5px,4vw,17px)",
              boxShadow: "0 10px 24px -14px rgba(239,83,125,.6)",
              maxWidth: "88vw",
            }}
          >
            <span aria-hidden>💌</span> {voice.shareLabel}
          </button>
        </div>

        <span
          role="status"
          aria-live="polite"
          style={{
            ...chip("rgba(255,255,255,.82)", PINK_DEEP),
            opacity: copied || note ? 1 : 0,
            transform: copied || note ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity .25s ease, transform .25s ease",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {note || (copied ? "Link copied — go on, send it 💞" : " ")}
        </span>

        <p style={{ fontSize: 11.5, color: INK_SOFT, opacity: 0.8, textAlign: "center", maxWidth: 340 }}>
          the story card is 1080&times;1920, sized for Instagram, with a QR back to this page.
        </p>
      </div>

      {/* The off-screen 1080x1920 node the card is captured from. */}
      {storyElement}
      </div>
    </section>
  );
}
