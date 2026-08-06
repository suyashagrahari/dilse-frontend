"use client";

/**
 * The 9:16 result card — the screenshot. Rendered at a fixed pixel size and
 * scaled to fit, so the PNG and the phone show the identical composition.
 *
 * The node handed to `html-to-image` contains no <video>: the animated hug lives
 * OUTSIDE it (see HoldMyHand.tsx) and only the static sticker is inside, which
 * is same-origin and therefore survives the export.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { HMH } from "./types";

/** 9:16. Fixed — the card is scaled, never reflowed. */
export const CARD_W = 330;
export const CARD_H = 587;

export interface ResultStats {
  heldMs: number;
  releases: number;
  survivedBetrayal: boolean;
  skipped: boolean;
}

/**
 * TODO(percentile): hardcoded stub. Needs a real percentile from the API —
 * something like `GET /hold-my-hand-pages/share/:shareId/percentile` returning
 * the rank of `heldMs`/`releases` against all completed attempts on this page.
 * Percentile framing (not a raw score) is deliberate: it is the most-shared
 * output format there is, and it must not be invented per-render.
 */
const STUB_PERCENTILE = 12;

export default function ResultCard({
  stats,
  recipientName,
  senderName,
  reduced,
}: {
  stats: ResultStats;
  recipientName: string;
  senderName: string;
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState("");

  // Scale, never reflow.
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (Math.min(window.innerWidth, 520) - 40) / CARD_W));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const seconds = Math.round(stats.heldMs / 1000);
  const releaseWord = stats.releases === 1 ? "time" : "times";

  const save = useCallback(async () => {
    const node = cardRef.current;
    if (!node || saving) return;
    setSaving(true);
    setSavedNote("");
    try {
      // Without this the webfonts fall back mid-capture and the PNG looks
      // nothing like the screen.
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const url = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: HMH.void,
        width: CARD_W,
        height: CARD_H,
        style: {
          // The captured node is ALSO the node carrying the fit-to-viewport
          // `scale()`. html-to-image clones computed style, so without this the
          // clone stays scaled and the card renders shrunk into the top-left of
          // a CARD_W x CARD_H canvas with dead space around it. Capture at true
          // layout size instead — the on-screen scale is presentation only.
          transform: "none",
          transformOrigin: "top left",
        },
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `held-for-${seconds}s.png`;
      a.click();
      setSavedNote("Saved to your downloads");
    } catch {
      setSavedNote("Couldn't save — try a screenshot instead");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedNote(""), 4000);
    }
  }, [saving, seconds]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: CARD_W * scale, height: CARD_H * scale }}>
        <div
          ref={cardRef}
          style={{
            width: CARD_W,
            height: CARD_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            background:
              "radial-gradient(120% 80% at 50% 8%, #2A1450 0%, #150B2C 46%, #07050D 100%)",
            fontFamily: HMH.body,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "34px 26px 26px",
            boxShadow: "0 40px 80px -20px rgba(14,14,18,.6)",
          }}
        >
          {/* soft brand blooms */}
          <span aria-hidden style={{ position: "absolute", top: -70, left: -60, width: 220, height: 220, borderRadius: "50%", background: HMH.indigo, opacity: 0.3, filter: "blur(52px)" }} />
          <span aria-hidden style={{ position: "absolute", bottom: -60, right: -50, width: 210, height: 210, borderRadius: "50%", background: HMH.pink, opacity: 0.24, filter: "blur(52px)" }} />

          {/* static sticker — animated .webm stays outside this node */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/hold-my-hand/virtual-hug-3.webp"
            alt=""
            width={104}
            height={93}
            style={{ position: "relative", zIndex: 1, marginBottom: 10 }}
          />

          <p style={{ position: "relative", zIndex: 1, fontFamily: HMH.script, fontSize: 26, lineHeight: 1, color: HMH.lime, margin: 0 }}>
            you didn&apos;t let go
          </p>

          <div style={{ position: "relative", zIndex: 1, marginTop: 26, textAlign: "center" }}>
            <p style={{ fontFamily: HMH.display, fontSize: 46, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
              {seconds}s
            </p>
            <p style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginTop: 8 }}>
              held for {seconds} seconds
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 1, width: "100%", marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <Row label={`you let go ${stats.releases} ${releaseWord}`} tone="dim" />
            <Row label={`top ${STUB_PERCENTILE}% of everyone who tried`} tone="hero" />
            {stats.survivedBetrayal && <Row label="you didn't believe me. good." tone="pink" />}
            {stats.skipped && <Row label="you took the shortcut. still counts." tone="dim" />}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
            <p style={{ fontFamily: HMH.script, fontSize: 20, color: "rgba(255,255,255,.9)", margin: 0 }}>
              {recipientName ? `for ${recipientName}` : "for you"}
              {senderName ? ` — from ${senderName}` : ""}
            </p>
            <p style={{ marginTop: 14, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.35)" }}>
              SubhSandesh · Hold My Hand
            </p>
          </div>
        </div>
      </div>

      {/* Animated payoff lives OUTSIDE the captured node. */}
      {!reduced && (
        <video
          src="/templates/hold-my-hand/virtual-hug.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-24 h-auto opacity-90"
          aria-hidden
        />
      )}

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold disabled:opacity-60"
        style={{ background: HMH.lime, color: HMH.ink, fontFamily: HMH.display }}
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        {saving ? "Saving…" : "Save this"}
      </button>
      {savedNote && <p className="text-xs" style={{ color: "rgba(255,255,255,.55)" }}>{savedNote}</p>}
    </div>
  );
}

function Row({ label, tone }: { label: string; tone: "dim" | "hero" | "pink" }) {
  const color = tone === "hero" ? HMH.lime : tone === "pink" ? HMH.pink : "rgba(255,255,255,.72)";
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 14,
        padding: "11px 14px",
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.10)",
        fontSize: tone === "hero" ? 14 : 13,
        fontWeight: tone === "hero" ? 700 : 500,
        color,
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
}
