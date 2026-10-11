"use client";

// The club rules: "Terms & Cuddle-tions", a cute membership form with his three rules. She signs with her finger on
// the dotted line (or "sign with my name"); a big APPROVED 💗 stamp thunks down and the penguin swears along
// (slot pk-stamp). Her drawn signature is kept for the membership card at the end.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, Head, LinkBtn, SlotGif } from "./parts";
import { PAD_ASPECT, drawInk, inkLength, inkToDataUrl, type Stroke } from "./ink";
import { originOf, type Club } from "./util";

const INK = "#5B36C4";

export function Contract({ club, day, data, onSigned, onNext }: { club: Club; day: DayConfig; data: ValentineDayData; onSigned: (ink: string | null) => void; onNext: () => void }) {
  const { sfx } = usePremium();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [signed, setSigned] = useState<"no" | "ink" | "name">("no");
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const card = useRef<HTMLDivElement | null>(null);
  const cur = useRef<Stroke | null>(null);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);
  const scratchAt = useRef(0);

  // keep the canvas crisp and redraw when it resizes
  const redraw = (list: Stroke[]) => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    drawInk(ctx, list, 0, 0, c.width, c.height, INK, c.width * 0.016);
  };
  const strokesRef = useRef(strokes);
  useEffect(() => {
    strokesRef.current = strokes;
  });
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      redraw(strokesRef.current);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const pt = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    const now = performance.now();
    let w = 1;
    if (last.current) {
      const dt = Math.max(1, now - last.current.t);
      const v = Math.hypot((x - last.current.x) * r.width, (y - last.current.y) * r.height) / dt;
      w = Math.max(0, Math.min(1, 1.15 - v / 1.6));
    }
    last.current = { x, y, t: now };
    return { x, y, w };
  };
  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (signed !== "no") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    last.current = null;
    cur.current = [pt(e)];
    setStrokes((s) => [...s, cur.current as Stroke]);
  };
  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (!cur.current) return;
    cur.current.push(pt(e));
    const now = performance.now();
    if (now - scratchAt.current > 140) {
      scratchAt.current = now;
      sfx("nib-scratch", { gain: 0.25 });
    }
    redraw(strokesRef.current);
  };
  const up = () => {
    cur.current = null;
    setStrokes((s) => [...s]);
  };

  const enough = inkLength(strokes) > 0.35;

  const stamp = (how: "ink" | "name") => {
    if (signed !== "no") return;
    setSigned(how);
    onSigned(how === "ink" ? inkToDataUrl(strokes, INK) || null : null);
    window.setTimeout(() => {
      sfx("pk-stamp");
      sfx("chime", { at: 0.2 });
      haptic([15, 40, 25]);
      burst({ kind: "hearts", origin: originOf(card.current, 0.7), count: 18 });
    }, 260);
  };

  return (
    <div className="pk-scene pk-contract">
      <Head kicker="The club rules" title={
          <>
            Terms &amp; <span className="pk-nw">Cuddle-tions</span>
          </>
        } sub={signed === "no" ? "Read the fine print. Then sign it, member." : undefined} />
      <motion.div ref={card} className="pk-form" initial={{ y: 40, rotate: -3, opacity: 0 }} animate={{ y: 0, rotate: -1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <SlotGif day={day} data={data} id="pk-stamp" size={92} className="pk-formGif" eager />
        <p className="pk-formKick">Pinky Promise Club · membership form</p>
        <p className="pk-formFor">
          New member: <b>{club.pet || club.to}</b>
        </p>
        <ol className="pk-rules">
          {club.rules.map((r, k) => (
            <li key={k}>
              <span className="pk-ruleNo">{k + 1}</span>
              {r}
            </li>
          ))}
        </ol>
        <div className={`pk-padWrap${signed !== "no" ? " is-signed" : ""}`}>
          <canvas
            ref={canvas}
            className="pk-sigPad"
            style={{ aspectRatio: String(PAD_ASPECT), display: signed === "name" ? "none" : "block" }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label="Sign here with your finger"
          />
          {signed === "name" && <p className="pk-sigName">{club.to}</p>}
          {!strokes.length && signed === "no" && <span className="pk-padHint">sign here with your finger ✍️</span>}
          <span className="pk-padLine" aria-hidden />
          <small className="pk-padWho">{club.to}, member no. 2</small>
        </div>
        {signed !== "no" && (
          <motion.span className="pk-approved" initial={{ scale: 2.6, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -12, opacity: 1 }} transition={{ type: "spring", stiffness: 520, damping: 14, delay: 0.25 }} aria-label="Approved">
            APPROVED 💗
          </motion.span>
        )}
      </motion.div>

      <div className="pk-actions">
        {signed === "no" ? (
          <>
            <Btn onClick={() => stamp("ink")} disabled={!enough}>
              {enough ? "Done, stamp it! 💗" : "Sign first ✍️"}
            </Btn>
            <div className="pk-linkRow">
              {strokes.length > 0 && (
                <LinkBtn
                  onClick={() => {
                    setStrokes([]);
                    window.requestAnimationFrame(() => redraw([]));
                  }}
                >
                  clear
                </LinkBtn>
              )}
              <LinkBtn onClick={() => stamp("name")}>sign with my name</LinkBtn>
            </div>
          </>
        ) : (
          <motion.div className="pk-afterStamp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <Gif src={DECOR.approved} size={56} />
            <Btn onClick={onNext}>Now, our bracelet 📿</Btn>
          </motion.div>
        )}
      </div>
    </div>
  );
}
