"use client";

// Stall 7 · The carnival radio. His voice note plays on a pastel radio ("{him} FM"); without one, she taps the dial
// to tune in and his note types onto the radio's screen. Their song and his line about it sit on the dial.

import { useState } from "react";
import { Typewriter } from "../../../_valentine/kit";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { C, GIF } from "./model";
import { Gif, StallHead, reward, useStall } from "./ui";

export default function Radio() {
  const { c, done, sfx } = useStall();
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  const [tuned, setTuned] = useState(false);

  const tune = () => {
    if (tuned) return;
    setTuned(true);
    sfx("static", { dur: 0.5, gain: 0.5 });
    window.setTimeout(() => reward(sfx, document.querySelector(".vc-radio"), { cue: "chime" }), 500);
  };

  return (
    <section className="vc-scene vc-radioScene" aria-label="The carnival radio">
      <StallHead kicker="Stall 7 · Carnival radio" title={`Now playing: ${c.from} FM`} hint={hasVoice ? "Press play. Volume up." : tuned ? undefined : "Turn the dial to tune in"} />
      <div className={`vc-radio${tuned || hasVoice ? " is-on" : ""}`}>
        <i className="vc-antenna" aria-hidden>
          <b>♥</b>
        </i>
        <div className="vc-radioTop">
          <span className="vc-radioBrand">LOVE · 14.02 FM</span>
          {c.song && (
            <span className="vc-radioSong">
              ♪ {c.song.title}
              {c.song.artist ? ` · ${c.song.artist}` : ""}
            </span>
          )}
        </div>
        <div className="vc-radioBody">
          <div className="vc-grille" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => <i key={i} />)}
          </div>
          <div className="vc-radioScreen">
            {hasVoice ? (
              <VoiceNotePlayer label={`${c.from}'s voice, just for you`} accent={C.primary} track={C.soft} onPlay={done} onEnded={done} className="vc-voice" />
            ) : tuned ? (
              <div className="vc-radioMsg">
                <Typewriter text={`“${premium.voiceCaption || "I made you a whole fair. I'd make you a hundred more."}”`} speed={30} onDone={done} />
              </div>
            ) : (
              <p className="vc-radioMsg is-static">~ ~ static ~ ~</p>
            )}
          </div>
          <button type="button" className={`vc-dial${tuned ? " is-tuned" : ""}`} onClick={tune} aria-label="Turn the dial to tune in" disabled={hasVoice || tuned}>
            <i />
          </button>
        </div>
        {c.songNote && <p className="vc-songNote">{c.songNote}</p>}
      </div>
      <Gif src={GIF.penguinPhone} size={104} tilt={-5} float className="vc-radioGif" />
    </section>
  );
}
