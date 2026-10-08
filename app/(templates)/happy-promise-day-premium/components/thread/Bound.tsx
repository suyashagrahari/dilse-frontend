"use client";

// ─── Finale: the whole thread across the night (distance), "Do you promise
// too?" — mini-game 2, the pinky pendulum — then the keepsake + write back.

import { useEffect, useRef, useState } from "react";
import type { DayConfig } from "../../../_valentine/types";
import { burst, EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { KineticName, ReplyBox, SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { Hand } from "./art";
import type { SceneProps } from "./shared";

/** Pinky pendulum: two pinkies swing in opposite phase; tap when they line up. */
function Pendulum({ color, sfx, onHook }: { color: string; sfx: SceneProps["sfx"]; onHook: () => void }) {
  const [ang, setAng] = useState(0);
  const [misses, setMisses] = useState(0);
  const [msg, setMsg] = useState("");
  const [hooked, setHooked] = useState(false);
  const a = useRef(0);
  const lastSign = useRef(1);
  useEffect(() => {
    if (hooked) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const v = Math.sin((now - t0) / 520) * 34;
      a.current = v;
      setAng(v);
      const sgn = Math.sign(Math.cos((now - t0) / 520));
      if (sgn !== lastSign.current) {
        lastSign.current = sgn;
        sfx("tp-tick", { gain: 0.5 });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hooked, sfx]);
  const tap = () => {
    if (hooked) return;
    const win = 12 + misses * 7;
    if (Math.abs(a.current) <= win || misses >= 3) {
      setHooked(true);
      setMsg(misses >= 3 ? "Fate doesn't need good timing." : "Hooked.");
      sfx("tp-cinch");
      haptic([20, 30, 60]);
      onHook();
    } else {
      setMisses((m) => m + 1);
      setMsg("Almost… again");
      sfx("swoosh-soft", { gain: 0.5 });
    }
  };
  const shown = hooked ? 0 : ang;
  return (
    <div className="tp-pend">
      <button type="button" className="tp-pendStage" onClick={tap} aria-label="Tap when the two little fingers line up">
        <span className="tp-pendArm is-l" style={{ transform: `rotate(${shown}deg)` }}>
          <Hand color={color} className="tp-pendHand" loop={false} />
        </span>
        <span className="tp-pendArm is-r" style={{ transform: `rotate(${-shown}deg)` }}>
          <Hand color={color} flip className="tp-pendHand" loop={false} />
        </span>
        <span className={`tp-pendGuide${Math.abs(ang) < 12 + misses * 7 && !hooked ? " is-hot" : ""}`} aria-hidden />
      </button>
      <p className="tp-pendMsg" aria-live="polite">{msg || "Tap when they line up"}</p>
    </div>
  );
}

export function boundPoster(day: DayConfig, p: SceneProps): KeepsakeLayout {
  const { data, x } = p;
  const W = 1080, H = 1920;
  const gold = "#F2C14E", cream = "#F7F1E8";
  const items: KeepsakeItem[] = [];
  const photo = data.photos[0];
  if (photo?.url) items.push({ type: "image", src: photo.url, x: 140, y: 220, w: 800, h: 1000, radius: 30, cropX: photo.cropX, cropY: photo.cropY });
  items.push({ type: "rect", x: 140, y: 220, w: 800, h: 1000, radius: 30, stroke: gold, lineWidth: 4 });
  items.push({ type: "text", text: "BOUND BY A RED THREAD", x: W / 2, y: 120, size: 34, weight: 700, color: gold, face: "ui" });
  // the thread: a stepped line of small rects from corner to corner (layouts have no paths)
  for (let i = 0; i < 40; i++) {
    const t = i / 39;
    const xx = 120 + t * 840, yy = 1300 + Math.sin(t * Math.PI * 2) * 40;
    items.push({ type: "rect", x: xx, y: yy, w: 24, h: 6, radius: 3, fill: i % 2 ? "#D7263D" : "#E84A5F" });
  }
  items.push({ type: "text", text: "✦", x: W / 2, y: 1270, size: 70, color: gold, face: "ui" });
  items.push({ type: "text", text: `${data.recipientName || "You"}  &  ${data.senderName || "Me"}`, x: W / 2, y: 1380, size: 96, weight: 700, color: cream, face: "script", maxWidth: 960, maxLines: 1 });
  items.push({ type: "text", text: x.bigPromise || "Wherever life pulls us, I'll be on the other end of this thread.", x: W / 2, y: 1520, size: 40, italic: true, color: cream, face: "serif", maxWidth: 860, maxLines: 3, lineHeight: 1.3 });
  const dist = Number(x.distanceKm) || 0;
  const line = `${dist > 0 ? `${dist.toLocaleString("en-IN")} KM OF THREAD · 0 KM APART · ` : ""}${day.date} ${day.month}`.toUpperCase();
  items.push({ type: "text", text: line, x: W / 2, y: 1720, size: 26, weight: 700, color: gold, face: "ui", maxWidth: 960, maxLines: 1 });
  items.push({ type: "text", text: "It may stretch or tangle, but it never breaks · subhsandesh.in ✦", x: W / 2, y: 1790, size: 22, color: "rgba(247,241,232,.6)", face: "ui" });
  return { width: W, height: H, background: { stops: [[0, "#22265A"], [0.6, "#0E1030"], [1, "#070818"]] }, items };
}

export default function Bound({ day, mode, onReplay, ...p }: SceneProps & { day: DayConfig; mode: "preview" | "live"; onReplay: () => void }) {
  const { data, x, color, react, sfx, sticker, reduced } = p;
  const prem = usePremium();
  const [stage, setStage] = useState<"map" | "ask" | "promised">("map");
  const [ps, setPs] = useState(false);
  const fired = useRef(false);
  const dist = Number(x.distanceKm) || 0;
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    react("completed");
  }, [react]);
  useEffect(() => {
    if (stage === "promised") prem.music?.fadeTo(0.7, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  return (
    <section className="tp-sec tp-boundSec">
      <div className="tp-map" aria-hidden>
        <svg viewBox="0 0 320 140" className="tp-mapSvg">
          <path d="M30 100 C 90 20, 230 20, 290 70" stroke="#F2C14E" strokeWidth="2.6" fill="none" strokeLinecap="round" pathLength={1} className="tp-goldRun" />
          <circle cx="30" cy="100" r="6" fill={color} />
          <circle cx="290" cy="70" r="6" fill={color} />
          <text x="30" y="124" textAnchor="middle" className="tp-mapLbl">{data.recipientName || "you"}</text>
          <text x="290" y="94" textAnchor="middle" className="tp-mapLbl">{data.senderName || "me"}</text>
        </svg>
        {dist > 0 && <p className="tp-dist">{dist.toLocaleString("en-IN")} km of thread · 0 km apart</p>}
      </div>
      <KineticName text={data.recipientName || "you"} size="clamp(40px, 12vw, 78px)" gilt as="h2" />
      <p className="tp-endLine">{data.endLine || "Bound by a red thread. Both ends tied."}</p>

      {stage === "map" && (
        <button type="button" className="tp-btn tp-askBtn" onClick={() => { setStage("ask"); sfx("tp-glint"); }}>
          Do you promise too? 🤞
        </button>
      )}
      {stage === "ask" && (
        <>
          <Pendulum
            color={color}
            sfx={sfx}
            onHook={() => {
              react("answered");
              sfx("tp-chord", { at: 0.3 });
              if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.55 } });
              window.setTimeout(() => setStage("promised"), 900);
            }}
          />
          <SkipChip
            onSkip={() => {
              react("answered");
              sfx("tp-chord");
              setStage("promised");
            }}
            label="Just promise ▸"
          />
        </>
      )}
      {stage === "promised" && (
        <div className="tp-promised">
          <span className="tp-stick">{sticker("pp6-promised", 72)}</span>
          <b>Promised. Both ends tied.</b>
        </div>
      )}

      {prem.premium.psLetter && (
        <button
          type="button"
          className={`tp-ps${ps ? " is-open" : ""}`}
          onClick={() => {
            if (!ps) sfx("wax-crack");
            setPs(true);
          }}
          aria-expanded={ps}
        >
          {ps ? (
            <span className="tp-psTx">{prem.premium.psLetter}</span>
          ) : (
            <>
              <span className="tp-psSeal" aria-hidden>✦</span>
              <span>A sealed P.S. tied to the thread — tap to open</span>
            </>
          )}
        </button>
      )}
      <ReplyBox title={`Write back to ${data.senderName || "them"}`} placeholder="I promise too…" accent="#D7263D" />
      <EndingActions
        day={day}
        data={data}
        mode={mode}
        onReplay={onReplay}
        replyLabel="🤞 Promise back"
        replyText={x.replyLine || "I promise too. Both ends tied 🤞❤️"}
        keepsake={() => boundPoster(day, p)}
      />
      <p className="tp-credit">Tied with SubhSandesh ✦ Premium</p>
    </section>
  );
}
