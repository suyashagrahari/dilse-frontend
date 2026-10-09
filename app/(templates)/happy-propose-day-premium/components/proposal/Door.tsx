"use client";

// The little door. On the gate it is the tap target ("Knock knock": that knock starts the song). In the first
// scene she knocks once more, the door swings open on its hinge and the shy panda (slot pp-door) is standing in
// a warm doorway with a rose, saying his nervous hello.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, Gif, Head, LinkBtn, SlotGif } from "./parts";
import type { Story } from "./util";

export function DoorArt({ open = false, knock = 0, children, sticker }: { open?: boolean; knock?: number; children?: ReactNode; sticker?: string }) {
  return (
    <div className={`lp-door${open ? " is-open" : ""}`} data-knock={knock % 2}>
      {sticker && <Gif src={sticker} size={86} className="lp-door-sticker" eager />}
      <span className="lp-door-plant l" aria-hidden>
        <i />
        <b />
      </span>
      <span className="lp-door-plant r" aria-hidden>
        <i />
        <b />
      </span>
      <div className="lp-door-frame">
        <div className="lp-door-inside">{children}</div>
        <div className="lp-door-leaf" key={knock}>
          <svg viewBox="0 0 160 230" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="lpLeaf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFC4DD" />
                <stop offset="1" stopColor="#FF9EC4" />
              </linearGradient>
            </defs>
            <path d="M0 80 C0 30 35 0 80 0 C125 0 160 30 160 80 V230 H0 Z" fill="url(#lpLeaf)" />
            <rect x="20" y="138" width="52" height="70" rx="10" fill="none" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="4" />
            <rect x="88" y="138" width="52" height="70" rx="10" fill="none" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="4" />
            <path d="M80 112 C56 94 42 80 42 64 C42 52 51 44 62 44 C70 44 76 49 80 55 C84 49 90 44 98 44 C109 44 118 52 118 64 C118 80 104 94 80 112 Z" fill="#FFF3B8" stroke="#FFFFFF" strokeWidth="5" />
            <path d="M58 60 C60 54 66 52 70 54" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9" />
            <circle cx="132" cy="128" r="7" fill="#F4C35A" stroke="#C98A1F" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <span className="lp-door-mat" aria-hidden>
        hi, you
      </span>
    </div>
  );
}

export function Hello({ story, day, data, onNext, onSkipToQuestion }: { story: Story; day: DayConfig; data: ValentineDayData; onNext: () => void; onSkipToQuestion?: () => void }) {
  const { sfx } = usePremium();
  const [knocks, setKnocks] = useState(0);
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState(false);
  const ref = useRef<HTMLButtonElement | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const knock = () => {
    if (open) return;
    const k = knocks + 1;
    setKnocks(k);
    sfx("knock", { count: 2 });
    haptic(10);
    if (k >= 1) {
      timers.current.push(
        window.setTimeout(() => {
          setOpen(true);
          sfx("creak", { gain: 0.5 });
          sfx("lp-boing", { at: 0.35 });
        }, 520),
        window.setTimeout(() => {
          setSaid(true);
          sfx("lp-tada");
          haptic([15, 40, 25]);
          const r = ref.current?.getBoundingClientRect();
          burst({ kind: "hearts", origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.45) / window.innerHeight } : { x: 0.5, y: 0.45 }, count: 18 });
        }, 1500),
      );
    }
  };

  return (
    <div className="lp-scene lp-hello">
      <Head kicker={open ? `for ${story.to}` : "Knock knock…"} title={open ? "Oh! Hi 🙈" : "Someone's home"} sub={open ? undefined : "Knock once more. Someone in there is very nervous."} />
      <button ref={ref} type="button" className="lp-doorBtn" onClick={knock} aria-label={open ? "The door is open" : "Knock on the door"} disabled={open}>
        <DoorArt open={open} knock={knocks}>
          {open && <SlotGif day={day} data={data} id="pp-door" size={132} className="lp-peek-in" eager />}
        </DoorArt>
        {!open && <span className="lp-tapHint">tap to knock</span>}
      </button>
      <div className="lp-hello-say" aria-live="polite">
        {said && (
          <>
            <p className="lp-bubble lp-pop">{story.teaser}</p>
            <div className="lp-pop" style={{ animationDelay: ".35s" }}>
              <Btn onClick={onNext}>Come in 💜</Btn>
            </div>
          </>
        )}
        {!open && (
          <Btn kind="soft" onClick={knock}>
            Knock knock ✊
          </Btn>
        )}
        {onSkipToQuestion && (
          <LinkBtn onClick={onSkipToQuestion} className="lp-pop">
            Seen it before? Skip to the question 💍
          </LinkBtn>
        )}
      </div>
    </div>
  );
}
