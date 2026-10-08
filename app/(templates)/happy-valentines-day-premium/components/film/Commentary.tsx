"use client";

// Scene 5 — The director's commentary (the voice note). A page of screenplay sets the scene; the sender's voice
// plays on the kit's VoiceNotePlayer (song ducked) while two reels turn. With no recording, the caption becomes
// the screenplay's own dialogue: "{SENDER} (V.O.)" over the typed line — the scene always works.

import { useEffect, useState } from "react";
import { usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import type { Film } from "./util";

export default function Commentary({ film, onDone }: { film: Film; onDone: () => void }) {
  const { premium, sfx, voice } = usePremium();
  const [spin, setSpin] = useState(false);
  // The reels turn while the voice actually plays (play, pause, end — from any control).
  useEffect(() => {
    if (!voice) return;
    const on = () => setSpin(true);
    const off = () => setSpin(false);
    voice.addEventListener("play", on);
    voice.addEventListener("pause", off);
    voice.addEventListener("ended", off);
    return () => {
      voice.removeEventListener("play", on);
      voice.removeEventListener("pause", off);
      voice.removeEventListener("ended", off);
    };
  }, [voice]);
  const place = (film.metPlace || "somewhere only we know").toUpperCase();
  const hasVoice = !!premium.voiceNote;

  return (
    <section className="fm-scene" aria-label="The director's commentary">
      <div className="fm-col">
        <p className="fm-kick">Bonus feature</p>
        <h2 className="fm-h">Director&apos;s <em>Commentary</em></h2>
        <div className="fm-reels" aria-hidden>
          <span className={`fm-reel${spin ? " is-spin" : ""}`} />
          <span className="fm-hint">{hasVoice ? (spin ? "now playing" : "press play") : "transcript"}</span>
          <span className={`fm-reel${spin ? " is-spin" : ""}`} style={{ animationDuration: "1.7s" }} />
        </div>
        <div className="fm-script fm-rise">
          <span className="fm-slug">INT. {place} — NIGHT</span>
          <span className="fm-who">{film.from} (V.O.)</span>
          <span className="fm-par">(to {film.to}, softly)</span>
          {hasVoice ? (
            <span className="fm-line">Press play. This part isn&apos;t written down.</span>
          ) : (
            <span className="fm-line">{premium.voiceCaption || "I've watched this film a hundred times. You're still my favourite part."}</span>
          )}
        </div>
        {hasVoice && (
          <div className="fm-vnWrap" style={{ width: "100%", display: "grid", justifyItems: "center" }}>
            <VoiceNotePlayer
              label={`Track 2 · ${film.from}'s commentary`}
              accent="#D4AF37"
              track="#FFE7B3"
            />
          </div>
        )}
        <button type="button" className="fm-btn" onClick={() => { sfx("paper-rustle"); onDone(); }}>Read the letter ▸</button>
      </div>
    </section>
  );
}
