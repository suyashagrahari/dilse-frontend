"use client";

// Scene 6 — SAID YES. The drones regroup into "{NAME} SAID YES" over a beating heart (the drone heartbeat drives
// the "heartbeat" cue), every window in the city switches on in a wave ("sky-cheer"), and the chat comes back:
// the sender's afterYes text ("delivered ✓✓"), their voice message (or the caption as a text), a typing bubble
// that never resolves, a ♥ reaction you can send up the sky, and the reply box ("Reply to {sender}").
// Mini-game 2 (easter egg): one drone in the formation blinks pink — tap it for "Still true: {first reason}".

import { useEffect, useState, type ReactNode } from "react";
import { ReplyBox, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import { Phone } from "./world";
import type { Sky } from "./util";

export function Yes({ sky, sticker, pinkPos, dodges, onDone }: { sky: Sky; sticker: ReactNode; pinkPos: { x: number; y: number } | null; dodges: number; onDone: () => void }) {
  const { sfx, premium } = usePremium();
  const [step, setStep] = useState(0);
  const [found, setFound] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);

  useEffect(() => {
    sfx("sky-cheer", { at: 0.4 });
    const a = window.setTimeout(() => { setStep(1); sfx("sky-typing"); }, 2600);
    const b = window.setTimeout(() => { setStep(2); sfx("sky-pop"); }, 4200);
    const c = window.setTimeout(() => { setStep(3); sfx("sky-pop", { detune: 200 }); }, 5600);
    return () => [a, b, c].forEach(clearTimeout);
  }, [sfx]);

  const heart = () => {
    sfx("pop", { gain: 0.6 });
    haptic(8);
    setHearts((h) => [...h.slice(-5), Date.now()]);
  };

  return (
    <section className="sk-scene" aria-label="They said yes" style={{ paddingTop: "46vh" }}>
      <p className="sk-sr" aria-live="polite">The sky now reads: {sky.to} said yes.</p>
      <div className="sk-yesChat">
        {sticker}
        <Phone from={sky.from} className="sk-in">
          {step === 1 && <span className="sk-typing is-live" aria-label="typing"><i /><i /><i /></span>}
          {step >= 2 && (
            <>
              <div className="sk-slot"><span className="sk-bub">{sky.afterYes || "You said yes. I'm not okay. In the best way 😭💍"}</span></div>
              <span className="sk-meta">delivered ✓✓</span>
            </>
          )}
          {step >= 3 && (
            <>
              {premium.voiceNote ? (
                <div className="sk-slot sk-vn" style={{ maxWidth: "100%", width: "100%" }}>
                  <VoiceNotePlayer label={`🎤 Voice message · ${sky.from}`} accent="#FFB45C" track="#ffffff" />
                </div>
              ) : premium.voiceCaption ? (
                <div className="sk-slot"><span className="sk-bub">{premium.voiceCaption}</span></div>
              ) : null}
              <span className="sk-typing is-live" aria-hidden style={{ alignSelf: "flex-start" }}><i /><i /><i /></span>
              <span className="sk-meta">{sky.from} is typing… (crying, probably 😭)</span>
              {dodges > 0 && <span className="sk-out">Took me {dodges} {dodges === 1 ? "think" : "thinks"} 🙈 but YES</span>}
            </>
          )}
        </Phone>
        {step >= 3 && (
          <div className="sk-in" style={{ display: "grid", gap: 12, justifyItems: "center", width: "100%" }}>
            <button type="button" className="sk-ghost" onClick={heart}>Send a ♥ to the sky</button>
            <div className="sk-reply" style={{ width: "min(100%, 340px)" }}>
              <ReplyBox title={`Reply to ${sky.from}`} placeholder="Say it back. They're waiting by the phone…" accent="#C9963A" />
            </div>
            <button type="button" className="sk-btn" onClick={onDone}>Before you go… ▸</button>
          </div>
        )}
      </div>
      {hearts.map((h, i) => <span key={h} className="sk-heartFly" style={{ left: "50%", bottom: "38%", ["--fx" as string]: `${(i % 2 ? 1 : -1) * (20 + (h % 40))}px` }} aria-hidden>💗</span>)}
      {pinkPos && (
        <button type="button" className="sk-heartBtn" style={{ left: pinkPos.x, top: pinkPos.y }} aria-label="One drone is blinking pink"
          onClick={() => { setFound(true); sfx("sparkle"); haptic(10); }} />
      )}
      {pinkPos && found && <span className="sk-bubbleTip" style={{ left: Math.min(Math.max(pinkPos.x, 120), (typeof window !== "undefined" ? window.innerWidth : 400) - 120), top: pinkPos.y }}>Still true: {sky.reasons[0]}</span>}
    </section>
  );
}
