"use client";

// ─── Act 4 — the celebration ─────────────────────────────────────────────────
// Confetti, the payoff animation, the letter, the day counter, a callback to
// however many times they tried to escape, and a share button.

import { useCallback, useEffect, useRef, useState } from "react";
import { ASSETS } from "./assets";
import { daysSince, type ProposalData } from "./types";
import { celebrationBurst, heartPuff } from "./burst";
import { chip, DISPLAY, GLASS, INK, INK_SOFT, PINK_DEEP, PINK_GLOW, PINK_GRADIENT, SCRIPT } from "./theme";

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
  const [copied, setCopied] = useState(false);
  const reducedRef = useRef(reduced);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire once on mount — reading the flag from a ref so a mid-celebration
  // preference change can't re-trigger the whole volley sequence.
  useEffect(() => {
    const cancel = celebrationBurst(reducedRef.current);
    return cancel;
  }, []);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
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
    const text = `${data.recipientName || "She"} said YES 💍💖`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "We're engaged!", text, url });
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
  }, [data.recipientName, flash, shareId]);

  const days = daysSince(data.metDate);
  const callback = dodgeCallback(dodges, data.recipientName || "you");
  const paragraphs = data.secretNote.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <section
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "78px 16px 46px",
        width: "100%",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={reduced ? undefined : "ps-bob"}
        src={ASSETS.joyTears}
        alt="A penguin overwhelmed with happy tears"
        onClick={(e) => heartPuff(e.clientX, e.clientY)}
        style={{
          width: "clamp(128px,38vw,178px)",
          height: "auto",
          objectFit: "contain",
          cursor: "pointer",
          filter: "drop-shadow(0 16px 26px rgba(200,110,150,.3))",
        }}
      />

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
          <span aria-hidden>💍</span> {data.recipientName || "you"} said yes
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
        <button
          type="button"
          onClick={() => void share()}
          className="ps-btn"
          style={{
            border: "none",
            cursor: "pointer",
            padding: "14px 26px",
            borderRadius: 999,
            background: PINK_GRADIENT,
            color: "#fff",
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: "clamp(15px,4.2vw,18px)",
            boxShadow: PINK_GLOW,
            maxWidth: "88vw",
          }}
        >
          <span aria-hidden>💌</span> Tell the whole world
        </button>

        <span
          role="status"
          aria-live="polite"
          style={{
            ...chip("rgba(255,255,255,.82)", PINK_DEEP),
            opacity: copied ? 1 : 0,
            transform: copied ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity .25s ease, transform .25s ease",
            pointerEvents: "none",
          }}
        >
          {copied ? "Link copied — go on, send it 💞" : " "}
        </span>

        <p style={{ fontSize: 11.5, color: INK_SOFT, opacity: 0.8, textAlign: "center", maxWidth: 320 }}>
          screenshot this. you&rsquo;ll want it later.
        </p>
      </div>
    </section>
  );
}
