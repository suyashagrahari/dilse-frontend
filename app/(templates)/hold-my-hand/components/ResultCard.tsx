"use client";

/**
 * The 9:16 result card — made to be posted on a story.
 *
 * Their main photo, how long they held on, a playful "grip rating", and the
 * first line of the letter. Rendered at a fixed pixel size and scaled to fit,
 * so the PNG and the phone show the identical composition.
 *
 * Every image inside the captured node must be same-origin or a data URL, or
 * html-to-image taints the canvas and the export throws (the CDN sends no CORS
 * header). Remote photos therefore go through next/image, which re-serves them
 * from /_next/image on our own origin; uploaded-but-unpublished photos are
 * already data URLs.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, Loader2, Share2 } from "lucide-react";
import { HMH, LOVE, cropStyle, type Crop } from "./types";

/** 9:16. Fixed — the card is scaled, never reflowed. */
export const CARD_W = 330;
export const CARD_H = 587;

export interface ResultStats {
  heldMs: number;
  releases: number;
  survivedBetrayal: boolean;
  skipped: boolean;
}

/** A resting heart, roughly. Only used to make the number feel alive. */
const BPM = 72;

/** The title on the card — funny, never mean. */
function gripRating(s: ResultStats): { emoji: string; title: string; sub: string } {
  if (s.skipped) return { emoji: "🫶", title: "took the shortcut", sub: "still counts. it always counts." };
  if (s.survivedBetrayal) return { emoji: "😈", title: "saw through the trick", sub: "didn't fall for 'you can let go'" };
  if (s.releases === 0) return { emoji: "💎", title: "unbreakable grip", sub: "didn't let go. not even once." };
  if (s.releases <= 2) return { emoji: "🔥", title: "steady heart", sub: "wobbled, came right back" };
  if (s.releases <= 5) return { emoji: "🧸", title: "wobbly but worth it", sub: "kept coming back anyway" };
  return { emoji: "🌀", title: "chaotic but devoted", sub: "let go a lot. never gave up." };
}

/** First sentence-ish of the letter, trimmed to fit two lines on the card. */
function excerpt(letter: string): string {
  const first = letter.split("\n").map((l) => l.trim()).find((l) => l.length > 30) ?? letter.trim();
  return first.length > 72 ? `${first.slice(0, 69).trimEnd()}…` : first;
}

export default function ResultCard({
  stats,
  recipientName,
  senderName,
  photoUrl,
  photoCrop,
  letter,
  durationMs,
}: {
  stats: ResultStats;
  recipientName: string;
  senderName: string;
  photoUrl: string;
  photoCrop: Crop;
  letter: string;
  durationMs: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState<"save" | "share" | null>(null);
  const [note, setNote] = useState("");
  const [canShareFiles, setCanShareFiles] = useState(false);

  // Scale, never reflow.
  useEffect(() => {
    const fit = () => setScale(Math.min(1.12, (Math.min(window.innerWidth, 520) - 40) / CARD_W));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    try {
      const probe = new File([""], "probe.png", { type: "image/png" });
      setCanShareFiles(typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }));
    } catch { /* no Web Share — Save only */ }
  }, []);

  // A skip still shows the full goal: they got the letter either way.
  const seconds = Math.round((stats.skipped ? durationMs : stats.heldMs) / 1000);
  const heartbeats = Math.round((seconds * BPM) / 60);
  const rating = gripRating(stats);
  const quote = excerpt(letter);
  const fileName = `held-on-${seconds}s.png`;
  const isData = photoUrl.startsWith("data:");

  const render = useCallback(async (): Promise<string> => {
    const node = cardRef.current;
    if (!node) throw new Error("no card");
    // Without this the webfonts fall back mid-capture and the PNG looks
    // nothing like the screen.
    await document.fonts.ready;
    const { toPng } = await import("html-to-image");
    return toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#22091F",
      width: CARD_W,
      height: CARD_H,
      // The captured node also carries the fit-to-viewport scale(); capture at
      // true layout size instead — the on-screen scale is presentation only.
      style: { transform: "none", transformOrigin: "top left" },
    });
  }, []);

  const flash = (msg: string) => { setNote(msg); setTimeout(() => setNote(""), 4000); };

  const save = useCallback(async () => {
    if (busy) return;
    setBusy("save");
    try {
      const url = await render();
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      flash("Saved — now post it on your story 💌");
    } catch {
      flash("Couldn't save — try a screenshot instead");
    } finally {
      setBusy(null);
    }
  }, [busy, render, fileName]);

  const share = useCallback(async () => {
    if (busy) return;
    setBusy("share");
    try {
      const url = await render();
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      await navigator.share({ files: [file], text: `held on for ${seconds}s 🤍` });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") flash("Couldn't open share — use Save instead");
    } finally {
      setBusy(null);
    }
  }, [busy, render, fileName, seconds]);

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
            background: "radial-gradient(120% 70% at 50% 0%, #8A2F5C 0%, #4A1440 40%, #22091F 78%)",
            fontFamily: HMH.body,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "26px 22px 20px",
            boxShadow: "0 40px 80px -24px rgba(0,0,0,.8)",
          }}
        >
          {/* blooms + tiny hearts */}
          <span aria-hidden style={{ position: "absolute", top: -80, right: -70, width: 230, height: 230, borderRadius: "50%", background: LOVE.rose, opacity: 0.35, filter: "blur(60px)" }} />
          <span aria-hidden style={{ position: "absolute", bottom: -90, left: -70, width: 230, height: 230, borderRadius: "50%", background: LOVE.gold, opacity: 0.18, filter: "blur(60px)" }} />
          {[[26, 70, 12], [288, 110, 16], [40, 250, 10], [292, 300, 11], [18, 420, 14]].map(([x, y, s], i) => (
            <span key={i} aria-hidden style={{ position: "absolute", left: x, top: y, fontSize: s, color: LOVE.blush, opacity: 0.35 }}>♥</span>
          ))}

          <p style={{ position: "relative", fontSize: 9.5, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", margin: 0, fontFamily: HMH.display, fontWeight: 600 }}>
            hold my hand · challenge
          </p>

          {/* Main photo with a full ring — they made it to 100% */}
          <div style={{ position: "relative", marginTop: 16, width: 128, height: 128 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(${LOVE.gold}, ${LOVE.rose}, #FF9EC6, ${LOVE.gold})`, padding: 4 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#3A1030", border: "3px solid #2A0B24" }}>
                {photoUrl ? (
                  isData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="" style={cropStyle(photoCrop)} />
                  ) : (
                    <Image src={photoUrl} alt="" width={480} height={480} style={cropStyle(photoCrop)} />
                  )
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 48 }}>🤍</div>
                )}
              </div>
            </div>
            <span style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: LOVE.paper, color: LOVE.roseDeep, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, fontFamily: HMH.display, whiteSpace: "nowrap", boxShadow: "0 6px 14px -4px rgba(0,0,0,.5)" }}>
              ♥ 100% held
            </span>
          </div>

          <p style={{ position: "relative", marginTop: 16, fontFamily: HMH.script, fontSize: 25, lineHeight: 1.05, color: LOVE.blush, textAlign: "center" }}>
            {recipientName ? `${recipientName} didn't let go` : "i didn't let go"}
          </p>

          <p style={{ position: "relative", marginTop: 8, fontFamily: HMH.display, fontSize: 52, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {seconds}<span style={{ fontSize: 26, fontWeight: 700, marginLeft: 2 }}>s</span>
          </p>
          <p style={{ position: "relative", marginTop: 4, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
            hand in hand
          </p>

          {/* stat tiles */}
          <div style={{ position: "relative", marginTop: 14, width: "100%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Tile value={`${seconds}s`} label="held on" />
            <Tile value={String(stats.releases)} label={stats.releases === 1 ? "wobble" : "wobbles"} />
            <Tile value={`~${heartbeats}`} label="heartbeats" />
          </div>

          {/* grip rating */}
          <div style={{ position: "relative", marginTop: 10, width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 14, background: "linear-gradient(90deg, rgba(242,194,122,.22), rgba(224,69,123,.18))", border: "1px solid rgba(242,194,122,.35)" }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{rating.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: LOVE.gold, fontFamily: HMH.display, textTransform: "capitalize" }}>{rating.title}</p>
              <p style={{ margin: 0, fontSize: 10.5, color: "rgba(255,255,255,.72)" }}>{rating.sub}</p>
            </div>
          </div>

          {/* letter excerpt */}
          {quote && (
            <div style={{ position: "relative", marginTop: 10, width: "100%", padding: "10px 14px", borderRadius: 14, background: LOVE.paper, color: LOVE.ink }}>
              <p style={{ margin: 0, fontFamily: HMH.script, fontSize: 16, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                “{quote}”
              </p>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ position: "relative", textAlign: "center", width: "100%" }}>
            <p style={{ fontFamily: HMH.script, fontSize: 18, color: "rgba(255,255,255,.92)", margin: 0 }}>
              {recipientName ? `for ${recipientName}` : "for you"}
              {senderName ? ` — from ${senderName}` : ""}
            </p>
            <p style={{ marginTop: 6, fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontFamily: HMH.display }}>
              subhsandesh.in · can you hold on?
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {canShareFiles && (
          <button
            onClick={share}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, #F58529, #DD2A7B 50%, #8134AF)`, color: "#fff", fontFamily: HMH.display, boxShadow: "0 12px 28px -10px rgba(221,42,123,.7)" }}
          >
            {busy === "share" ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
            Share to story
          </button>
        )}
        <button
          onClick={save}
          disabled={!!busy}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold disabled:opacity-60"
          style={canShareFiles
            ? { background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.22)", fontFamily: HMH.display }
            : { background: LOVE.paper, color: LOVE.roseDeep, fontFamily: HMH.display }}
        >
          {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {busy === "save" ? "Saving…" : "Save image"}
        </button>
      </div>
      {note && <p className="text-xs" style={{ color: "rgba(255,255,255,.65)" }}>{note}</p>}
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ borderRadius: 12, padding: "8px 4px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", textAlign: "center" }}>
      <p style={{ margin: 0, fontFamily: HMH.display, fontSize: 17, fontWeight: 800, lineHeight: 1.1 }}>{value}</p>
      <p style={{ margin: "2px 0 0", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>{label}</p>
    </div>
  );
}
