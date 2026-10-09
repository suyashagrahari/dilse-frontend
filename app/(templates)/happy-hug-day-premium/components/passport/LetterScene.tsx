"use client";

// The letter · Hug mail. An airmail envelope (red-and-blue striped edge, "BY HUG MAIL", her name, a little postage
// stamp of the two huggers) lands with a wobble. She taps it: the flap folds open, the letter slides up and types
// itself in his handwriting (Patrick Hand), one of her photos taped to the corner, his name at the bottom. The song
// sits a little lower meanwhile (the parent fades it). A bear holding an "I love you" heart peeks from the corner.

import { useRef, useState } from "react";
import { CroppedPhoto, Typewriter, haptic } from "../../../_valentine/kit";
import { Gif, Washi } from "./art";
import { Puffy, Scene, originOf, useAww, usePassport, useSfx } from "./ui";
import { FIXED_GIF, photoAt } from "./util";

export function LetterScene({ letter, hasMore, onDone }: { letter: string; hasMore: boolean; onDone: () => void }) {
  const { g } = usePassport();
  const sfx = useSfx();
  const aww = useAww();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const envRef = useRef<HTMLButtonElement>(null);
  const photo = photoAt(g, 5);
  const body = letter.trim();

  const openIt = () => {
    if (open) return;
    setOpen(true);
    sfx("wax-crack", { gain: 0.5 });
    haptic([12, 30, 12]);
    window.setTimeout(() => {
      sfx("paper-rustle", { gain: 0.6 });
      aww(originOf(envRef.current, 0.3));
    }, 380);
  };

  return (
    <Scene id="letter" label={`A letter from ${g.from}`} kicker="Hug mail · a postcard for you" title={open ? "Read it slowly 💌" : "Something came for you 💌"} sub={open ? undefined : "By hug mail, all the way to you"}>
      {!open ? (
        <div className="hp-envWrap">
          <button ref={envRef} type="button" className="hp-env" onClick={openIt} aria-label={`Open the letter from ${g.from}`}>
            <span className="hp-envFlap" aria-hidden />
            <span className="hp-envPost" aria-hidden>
              <span className="hp-envPostArt">🤗</span>
              <small>1 HUG</small>
            </span>
            <span className="hp-envMark" aria-hidden>
              BY HUG MAIL
            </span>
            <span className="hp-envTo">
              <small>To</small> {g.to}
              {g.pet && <em>({g.pet})</em>}
            </span>
            <span className="hp-envFrom">from {g.from}, with a hug</span>
          </button>
          <Gif src={FIXED_GIF.loveYou} size={92} className="hp-envPeek hp-float" tilt={-8} eager />
        </div>
      ) : (
        <article className="hp-letter">
          <Washi className="hp-letterTape" color="rgba(255,138,107,.55)" />
          {photo && (
            <span className="hp-letterPhoto">
              <CroppedPhoto photo={photo} alt={photo.caption ?? ""} />
            </span>
          )}
          <Typewriter text={body} speed={20} className="hp-letterText" caretColor="#E0603F" onDone={() => setTyped(true)} />
          <p className={`hp-letterSign${typed ? " is-on" : ""}`}>
            <span>With the biggest hug,</span> {g.from}
          </p>
          <Gif src={FIXED_GIF.loveYou} size={78} className="hp-letterPeek" tilt={8} />
        </article>
      )}
      <div className="hp-foot is-on">
        {!open ? (
          <Puffy variant="ghost" onClick={openIt} cue={null}>
            Open it for me ✉️
          </Puffy>
        ) : (
          <Puffy onClick={onDone} className={typed ? "hp-heartbeat" : undefined}>
            {hasMore ? "There's a hug you can hear 🎧" : "Next 🎟️"}
          </Puffy>
        )}
      </div>
    </Scene>
  );
}
