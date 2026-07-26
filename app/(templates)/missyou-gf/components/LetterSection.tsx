"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import type { MissYouData } from "./types";
import { MUSIC_PAUSE_EVENT, MUSIC_RESUME_EVENT, safeMediaUrl } from "./types";
import { LIGHT, FONT_HEADING, FONT_BODY, FONT_SCRIPT, NIGHT } from "./theme";

/** Word-by-word typed reveal. Full text is always in the DOM (screen readers read
 *  it immediately); only visual opacity is staggered. Skip button jumps to full. */
function TypedReveal({ text, play }: { text: string; play: boolean }) {
  const reduce = useReducedMotion();
  const words = text.split(/(\s+)/);
  const [shown, setShown] = useState(reduce ? words.length : 0);
  const [skipped, setSkipped] = useState(reduce);

  useEffect(() => {
    if (reduce || skipped || !play) { setShown(words.length); return; }
    setShown(0);
    let i = 0;
    const total = words.length;
    const perWord = Math.max(14, Math.min(40, 3500 / total));
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= total) window.clearInterval(id);
    }, perWord);
    return () => window.clearInterval(id);
  }, [text, play, reduce, skipped]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = shown >= words.length;

  return (
    <>
      <p
        style={{ fontFamily: FONT_BODY, fontSize: "clamp(17px,4.5vw,19px)", lineHeight: 1.7, color: LIGHT.text, whiteSpace: "pre-wrap", margin: 0 }}
      >
        {/* accessible full copy */}
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.map((w, i) => (
            <span key={i} style={{ opacity: i < shown ? 1 : 0, transition: "opacity .18s ease" }}>{w}</span>
          ))}
          {!done && <span style={{ borderRight: `2px solid ${LIGHT.indigo}`, marginLeft: 1, animation: "myBlink 1s step-end infinite" }} aria-hidden />}
        </span>
      </p>
      {!done && !reduce && (
        <button
          type="button"
          onClick={() => { setSkipped(true); setShown(words.length); }}
          style={{ marginTop: 12, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: LIGHT.indigoStrong, background: "transparent", border: "none", cursor: "pointer", padding: "6px 8px", minHeight: 24 }}
        >
          Skip ↦
        </button>
      )}
      <style>{`@keyframes myBlink{50%{opacity:0}}`}</style>
    </>
  );
}

function VoiceNotePlayer({ url: rawUrl }: { url: string }) {
  const url = safeMediaUrl(rawUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  if (!url) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else { try { window.dispatchEvent(new Event(MUSIC_PAUSE_EVENT)); } catch {} a.play().catch(() => {}); }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 8px", borderRadius: 999, background: LIGHT.surfaceAlt, border: `1px solid ${LIGHT.border}` }}>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        style={{ width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#6C5CE7,#F72585)", color: "#fff", border: "none", cursor: "pointer" }}
      >
        {playing ? <Pause size={16} /> : <Play size={16} fill="#fff" />}
      </button>
      <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 3, height: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ width: 3, borderRadius: 2, background: LIGHT.indigo, height: playing && !reduce ? 6 + ((i % 3) * 6) : 8, animation: playing && !reduce ? `myWave 0.6s ${i * 0.08}s ease-in-out infinite alternate` : "none" }} />
        ))}
      </span>
      <span style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: LIGHT.indigoStrong }}>press play</span>
      <audio ref={audioRef} src={url} onPlay={() => setPlaying(true)} onPause={() => { setPlaying(false); try { window.dispatchEvent(new Event(MUSIC_RESUME_EVENT)); } catch {} }} onEnded={() => setPlaying(false)} className="hidden" />
      <style>{`@keyframes myWave{from{transform:scaleY(.5)}to{transform:scaleY(1.6)}}`}</style>
    </div>
  );
}

/** §2 I Miss You — the letter on a warm paper mat inset over the night. */
export default function LetterSection({ data, active }: { data: MissYouData; active: boolean }) {
  const body = data.letterBody?.trim() || "I miss you more than I know how to say. Every quiet moment, I'm thinking of you.";
  const signature = data.signature?.trim() || "Always yours,";
  return (
    <div style={{ background: LIGHT.bg, borderRadius: 28, padding: "clamp(24px,6vw,40px)", boxShadow: "0 8px 24px rgba(14,14,18,.35)", border: `1px solid ${LIGHT.border}`, maxWidth: 560, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: LIGHT.muted, margin: 0 }}>💌 A letter</p>
          <h2 style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: "clamp(22px,6vw,30px)", color: LIGHT.text, margin: "4px 0 0" }}>I Miss You</h2>
        </div>
        {data.voiceUrl && <VoiceNotePlayer url={data.voiceUrl} />}
      </div>

      <TypedReveal text={body} play={active} />

      <p style={{ fontFamily: FONT_SCRIPT, fontSize: "clamp(24px,7vw,28px)", color: LIGHT.pinkDark, marginTop: 22, marginBottom: 0 }}>
        {signature}
        <br />
        <span style={{ color: NIGHT.base }}>{data.senderName?.trim() || "me"}</span>
      </p>
    </div>
  );
}
