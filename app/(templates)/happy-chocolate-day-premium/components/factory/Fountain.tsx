"use client";

// Station 8 · The grand finale (the money moment). The three-tier chocolate fountain waits with a big candy lever.
// She pulls it: drop() — the machine rumbles and glows through the riser, and on the song's chorus a chocolate river
// floods across the screen carrying her photos as chocolate-dipped polaroids, sprinkles rain, and the photos land one
// by one in the box she filled at the start: a box of us.

import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { useSongDrop } from "../../../_valentine/kit/premium";
import { CONFETTI, C, GIF, boxPhotos } from "./model";
import { Cup, Drips, Gif, SlotGif, Sprinkles, StationHead, reward, useStation } from "./ui";

const PULL = 70;

export default function Fountain() {
  const { f, sfx, done } = useStation();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const photos = useMemo(() => boxPhotos(f.photos), [f.photos]);
  const [phase, setPhase] = useState<"wait" | "riser" | "flow" | "box">("wait");
  const [landed, setLanded] = useState(0);
  const [dy, setDy] = useState(0);
  const start = useRef<{ y: number; id: number } | null>(null);

  const pull = () => {
    if (phase !== "wait") return;
    setPhase("riser");
    setDy(PULL);
    haptic([20, 30, 20, 30, 60]);
    sfx("creak", { gain: 0.5 });
    sfx("bubble", { gain: 0.5, count: 6 });
    drop(() => {
      if (reduce) {
        setPhase("box");
        setLanded(6);
        reward(sfx, null, { big: true, cue: "chime-cascade" });
        window.setTimeout(done, 800);
        return;
      }
      setPhase("flow");
      reward(sfx, { x: 0.5, y: 0.5 }, { big: true, cue: "chime-cascade" });
      burst({ kind: "confetti", count: 120, colors: [...CONFETTI, "#8B5A3C", "#5A3221"] });
      sfx("firework", { gain: 0.5 });
      window.setTimeout(() => burst({ kind: "hearts", count: 24, origin: { x: 0.2, y: 0.35 }, colors: [C.pink, C.pop] }), 1100);
      window.setTimeout(() => burst({ kind: "hearts", count: 24, origin: { x: 0.8, y: 0.3 }, colors: [C.pink, C.butter] }), 2000);
      window.setTimeout(() => {
        setPhase("box");
        for (let i = 0; i < 6; i++) {
          window.setTimeout(() => {
            setLanded(i + 1);
            sfx("sf-boing", { gain: 0.45, detune: i * 110 });
          }, 350 + i * 260);
        }
        window.setTimeout(() => {
          reward(sfx, document.querySelector(".sf-finalBox"), { big: true, cue: "sf-ding" });
          burst({ kind: "confetti", count: 60, colors: [...CONFETTI] });
          done();
        }, 350 + 6 * 260 + 200);
      }, 4600);
    });
  };

  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (phase !== "wait") return;
    start.current = { y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    setDy(Math.max(0, Math.min(PULL, e.clientY - s.y)));
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    // Pulled far enough, or a plain tap: both pull it.
    if (dy > PULL * 0.6 || dy < 6) pull();
    else setDy(0);
  };

  return (
    <section className={`sf-scene sf-finale is-${phase}`} aria-label="The grand finale">
      {phase !== "box" ? (
        <>
          <StationHead kicker="Station 8 · The grand finale" title="The chocolate fountain" hint={phase === "wait" ? "Pull the lever. Sound up!" : "Here it comes…"} />
          <div className="sf-fountainStage">
            <Gif src={GIF.catMold} size={76} tilt={-8} float className="sf-fountainCat" />
            <svg className="sf-fountain" viewBox="0 0 220 260" width="230" height="272" aria-hidden>
              <defs>
                <linearGradient id="sf-fc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8B5A3C" />
                  <stop offset="1" stopColor="#5A3221" />
                </linearGradient>
              </defs>
              <ellipse cx="110" cy="256" rx="60" ry="6" fill="#D63F72" opacity=".25" />
              <path d="M84 256 L92 226 H128 L136 256 Z" fill="#FF8FAB" />
              <rect x="104" y="44" width="12" height="190" rx="6" fill="#FFD1DF" />
              {/* bottom basin + pool */}
              <path d="M22 198 Q110 258 198 198 Z" fill="#FF8FAB" />
              <path d="M22 198 Q110 248 198 198" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="4" />
              <ellipse cx="110" cy="198" rx="88" ry="18" fill="#5A3221" />
              <ellipse cx="110" cy="196" rx="70" ry="11" fill="none" stroke="#8B5A3C" strokeWidth="3" />
              {/* curtain: middle → bottom */}
              <path d="M54 134 C 52 160, 42 182, 36 198 L184 198 C 178 182, 168 160, 166 134 Z" fill="url(#sf-fc)" />
              {[62, 84, 110, 136, 158].map((x, i) => <path key={i} className="sf-fFlow" style={{ animationDelay: `${i * -0.13}s` }} d={`M${x} 140 C ${x - 3} 160, ${x - 6 - (x - 110) * 0.12} 180, ${x - 8 - (x - 110) * 0.2} 196`} stroke="#A0673F" strokeWidth="3" fill="none" strokeLinecap="round" />)}
              {/* middle plate */}
              <path d="M50 132 Q110 162 170 132 L166 140 Q110 170 54 140 Z" fill="#FF8FAB" />
              <ellipse cx="110" cy="132" rx="60" ry="13" fill="#6B3B26" />
              {/* curtain: top → middle */}
              <path d="M78 76 C 76 98, 68 114, 62 132 L158 132 C 152 114, 144 98, 142 76 Z" fill="url(#sf-fc)" />
              {[84, 110, 136].map((x, i) => <path key={i} className="sf-fFlow" style={{ animationDelay: `${i * -0.2}s` }} d={`M${x} 82 C ${x - 2} 100, ${x - 4 - (x - 110) * 0.1} 116, ${x - 6 - (x - 110) * 0.2} 130`} stroke="#A0673F" strokeWidth="3" fill="none" strokeLinecap="round" />)}
              {/* top plate */}
              <path d="M74 74 Q110 94 146 74 L142 81 Q110 101 78 81 Z" fill="#FF8FAB" />
              <ellipse cx="110" cy="74" rx="36" ry="9" fill="#6B3B26" />
              {/* the crown spout */}
              <path d="M100 74 Q104 40 110 34 Q116 40 120 74 Z" fill="url(#sf-fc)" />
              <circle cx="110" cy="30" r="7" fill="#8B5A3C" />
              <path className="sf-fFlow" d="M110 26 C 96 22, 84 40, 80 72 M110 26 C 124 22, 136 40, 140 72" stroke="#8B5A3C" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* strawberries on the basin rim */}
              {[[34, 206, -20], [186, 206, 20]].map(([x, y, r], i) => (
                <g key={i} transform={`rotate(${r} ${x} ${y})`}>
                  <path d={`M${x} ${y + 16} C ${x - 12} ${y + 6}, ${x - 11} ${y - 8}, ${x} ${y - 6} C ${x + 11} ${y - 8}, ${x + 12} ${y + 6}, ${x} ${y + 16} Z`} fill="#FF4D6D" />
                  <path d={`M${x - 7} ${y - 6} L${x} ${y - 2} L${x + 7} ${y - 6} L${x + 3} ${y - 9} L${x} ${y - 6} L${x - 3} ${y - 9} Z`} fill="#5FB14E" />
                  <circle cx={x - 3} cy={y + 2} r="1.2" fill="#FFE27A" />
                  <circle cx={x + 3} cy={y + 6} r="1.2" fill="#FFE27A" />
                </g>
              ))}
              {[60, 92, 126, 158].map((x, i) => <circle key={i} className="sf-fBub" style={{ ["--i" as string]: i }} cx={x} cy="200" r="5" fill="#8B5A3C" />)}
            </svg>
            <button
              type="button"
              className="sf-lever"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pull())}
              disabled={phase !== "wait"}
              aria-label="Pull the lever to start the chocolate fountain"
            >
              <span className="sf-leverSlot" aria-hidden />
              <span className="sf-leverArm" style={{ transform: `translateY(${dy}px)` }} aria-hidden>
                <i />
              </span>
              <b>PULL</b>
            </button>
          </div>
        </>
      ) : (
        <div className="sf-finalCard">
          <p className="sf-yay">Sweetest batch ever!</p>
          <p className="sf-yayLine">
            {f.to}, you&apos;re the sweetest thing <b>{f.house}</b> ever made.
          </p>
          <div className="sf-finalBox">
            <span className="sf-finalLid">{f.boxLine}</span>
            <div className="sf-boxGrid">
              {photos.map((ph, i) => (
                <div key={i} className="sf-slot">
                  <Cup size={78} />
                  {i < landed && <span className="sf-photoTruffle">{ph ? <CroppedPhoto photo={ph} alt="" /> : <b>💗</b>}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="sf-gifWall" aria-hidden>
            <SlotGif id="sf6-yay" size={110} tilt={-5} className="sf-wallItem" eager />
            <Gif src={GIF.bearsCheek} size={86} tilt={6} className="sf-wallItem" eager />
            <Gif src={GIF.catsJump} size={86} tilt={-7} className="sf-wallItem" eager />
            <Gif src={GIF.penguinsSway} size={86} tilt={4} className="sf-wallItem" eager />
            <Gif src={GIF.catsBoop} size={80} tilt={-3} className="sf-wallItem" eager />
          </div>
        </div>
      )}

      {phase === "flow" && (
        <div className="sf-river" aria-hidden>
          <svg className="sf-riverWave" viewBox="0 0 800 200" preserveAspectRatio="none">
            <path d="M0 40 Q50 10 100 40 T200 40 T300 40 T400 40 T500 40 T600 40 T700 40 T800 40 V170 Q750 196 700 170 T600 170 T500 170 T400 170 T300 170 T200 170 T100 170 T0 170 Z" fill="#8B5A3C" />
            <path d="M0 64 Q50 40 100 64 T200 64 T300 64 T400 64 T500 64 T600 64 T700 64 T800 64 V160 Q750 186 700 160 T600 160 T500 160 T400 160 T300 160 T200 160 T100 160 T0 160 Z" fill="#5A3221" />
            <path d="M0 52 Q50 28 100 52 T200 52 T300 52 T400 52 T500 52 T600 52 T700 52 T800 52" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="4" />
          </svg>
          {photos.map((ph, i) => (
            <span key={i} className="sf-rider" style={{ ["--i" as string]: i }}>
              <span className="sf-riderPic">
                {ph ? <CroppedPhoto photo={ph} alt="" eager /> : <b>💗</b>}
                <Drips className="sf-riderCoat" seed={i + 3} band={30} />
                <Sprinkles n={6} seed={i + 5} />
              </span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
