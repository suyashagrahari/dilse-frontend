"use client";

// ─── Catch — the title screen ────────────────────────────────────────────────
//
// App Store casual-game grammar: a bouncing logo, the player character (their
// face) idling on a cloud, one huge pulsing TAP TO PLAY, best score + daily
// streak underneath, and the falling things drifting behind it all.

import type { CSSProperties } from "react";
import Face from "./Face";
import type { CatchData } from "./types";

const DRIFT = ["💌", "💗", "📸", "✨", "💗", "🎀", "💌", "⭐", "💗", "🧸"];

export default function Splash({
  data,
  best,
  streak,
  sound,
  onSound,
  onPlay,
  onRead,
}: {
  data: CatchData;
  best: number;
  streak: number;
  sound: boolean;
  onSound: () => void;
  onPlay: () => void;
  onRead: () => void;
}) {
  const ribbon = data.tagline.trim() || `made for ${data.recipientName || "you"} 💘`;
  return (
    <div className="ct-splash">
      <div className="ct-drift" aria-hidden>
        {DRIFT.map((e, i) => (
          <span key={i} style={{ "--i": i, left: `${(i * 37 + 7) % 92}%` } as CSSProperties}>
            {e}
          </span>
        ))}
      </div>

      <div className="ct-splashTop">
        <span className="ct-fromPill">🎮 a game from {data.senderName || "someone"}</span>
        <button type="button" className="ct-soundBtn" onClick={onSound} aria-pressed={sound} aria-label={sound ? "Sound on" : "Sound off"}>
          {sound ? "🔊" : "🔇"}
        </button>
      </div>

      <div className="ct-logoWrap">
        <h1 className="ct-logo" aria-label="Catch!">
          {"CATCH".split("").map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>
              {ch}
            </span>
          ))}
          <span className="ct-logoBang" style={{ "--i": 5 } as CSSProperties}>
            !
          </span>
        </h1>
        <p className="ct-ribbon">
          <span>{ribbon}</span>
        </p>
      </div>

      <div className="ct-hero">
        <span className="ct-heroSpark ct-heroSpark--a" aria-hidden>✦</span>
        <span className="ct-heroSpark ct-heroSpark--b" aria-hidden>♥</span>
        <span className="ct-heroSpark ct-heroSpark--c" aria-hidden>✦</span>
        <div className="ct-heroBob">
          <Face data={data} size={124} className="ct-heroFace" />
        </div>
        <span className="ct-heroName">{data.recipientName || "you"}</span>
        <span className="ct-heroCloud" aria-hidden />
      </div>

      <div className="ct-splashCta">
        <button type="button" className="ct-btn ct-btn--pink ct-play" onClick={onPlay}>
          TAP TO PLAY
        </button>
        <div className="ct-stats">
          <span>🏆 best <b>{best.toLocaleString("en-IN")}</b></span>
          <span>🔥 <b>{Math.max(1, streak)}</b>-day streak</span>
        </div>
        <p className="ct-splashHint">
          {data.goodItems.length} letter pieces{data.photos.length ? ` · ${data.photos.length} memories` : ""} are about to fall
        </p>
        <button type="button" className="ct-linkBtn" onClick={onRead}>
          not a gamer? just read it →
        </button>
      </div>
    </div>
  );
}
