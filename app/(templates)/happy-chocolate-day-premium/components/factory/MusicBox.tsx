"use client";

// Station 6 · The music box. A heart-shaped chocolate box with a little truffle dancer on top. She opens the lid:
// it plays a tiny music-box tune, the truffle twirls, and his voice note is inside (or, with no recording, his line
// types itself onto the lid card).

import { useState } from "react";
import { Typewriter } from "../../../_valentine/kit";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { C, GIF, LOOKS } from "./model";
import { Gif, StationHead, Truffle, reward, useStation } from "./ui";

export default function MusicBox() {
  const { f, done, sfx } = useStation();
  const { premium } = usePremium();
  const hasVoice = !!premium.voiceNote;
  const [open, setOpen] = useState(false);

  const lift = () => {
    if (open) return;
    setOpen(true);
    sfx("creak", { gain: 0.35 });
    window.setTimeout(() => sfx("sf-musicbox", { gain: hasVoice ? 0.5 : 0.8 }), 200);
    window.setTimeout(() => reward(sfx, document.querySelector(".sf-mbox"), { cue: "sparkle" }), 500);
  };

  return (
    <section className="sf-scene sf-musicScene" aria-label="The music box">
      <StationHead
        kicker="Station 6 · The music box"
        title={open ? (hasVoice ? `${f.from} has something to say` : `A note from ${f.from}`) : "Something's humming…"}
        hint={open ? (hasVoice ? "Press play. Volume up." : undefined) : "Open the lid"}
      />
      <div className={`sf-mbox${open ? " is-open" : ""}`}>
        <button type="button" className="sf-mboxLid" onClick={lift} disabled={open} aria-label="Open the music box">
          <svg viewBox="0 0 220 90" width="260" height="106" aria-hidden>
            <path d="M110 86 C 40 70, 6 54, 6 34 A 26 26 0 0 1 58 22 Q 84 10 110 30 Q 136 10 162 22 A 26 26 0 0 1 214 34 C 214 54, 180 70, 110 86 Z" fill={C.pink} />
            <path d="M110 30 V86" stroke="#fff" strokeOpacity=".7" strokeWidth="8" />
            <path d="M8 40 H212" stroke="#fff" strokeOpacity=".7" strokeWidth="8" />
            <circle cx="110" cy="38" r="11" fill={C.butter} />
          </svg>
        </button>
        <div className="sf-mboxBody">
          <span className="sf-mboxDancer" aria-hidden>
            <Truffle look={LOOKS[1]} size={64} happy={open} />
          </span>
          <div className="sf-mboxInside">
            {open ? (
              hasVoice ? (
                <VoiceNotePlayer label={`${f.from}'s voice, just for you`} accent={C.pinkDeep} track={C.pinkSoft} onPlay={done} onEnded={done} className="sf-voice" />
              ) : (
                <div className="sf-mboxMsg">
                  <Typewriter text={`“${premium.voiceCaption || "I made you a whole factory. I'd make you a hundred more."}”`} speed={30} onDone={done} skippable={false} />
                </div>
              )
            ) : (
              <p className="sf-mboxMsg is-closed">♪ ♫ ♪</p>
            )}
          </div>
          {hasVoice && open && premium.voiceCaption.trim() && <p className="sf-mboxCaption">{premium.voiceCaption}</p>}
        </div>
      </div>
      {f.song && (
        <p className="sf-nowPlaying">
          ♪ now playing: {f.song.title}
          {f.song.artist ? ` · ${f.song.artist}` : ""}
        </p>
      )}
      <Gif src={GIF.mwahBear} size={96} tilt={-5} float className="sf-mboxGif" />
    </section>
  );
}
