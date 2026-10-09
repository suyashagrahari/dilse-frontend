"use client";

// Hug coupons. A little ring-bound booklet of up to six coupons, swiped sideways (scroll-snap). Each one has a
// perforated stub with REDEEM: tapping it thunks a "REDEEMED" stamp across the coupon (thunk + hearts + haptic) and
// offers to tell him on WhatsApp (her message + the coupon). A panda with an "I love U" sign peeks over the top.

import { useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { Slot } from "./art";
import { Puffy, Scene, originOf, useAww, usePassport, useSfx } from "./ui";

const TINTS = [
  ["#FFE4D2", "#E0603F"],
  ["#DDF6EC", "#1F9A73"],
  ["#EDE3FF", "#7A52E0"],
  ["#FFE3EC", "#D63F72"],
  ["#E0EEFF", "#3577C4"],
  ["#FFF3C4", "#B07A12"],
] as const;

export function redeemLink(title: string, detail: string, reply: string, from: string) {
  const text = `${reply || "Redeeming this one. Report for hugging duty 🤗"}\n\n🎟️ *${title}*${detail ? `\n“${detail}”` : ""}${from ? `\n— to ${from}` : ""}`;
  // api.whatsapp.com directly: the wa.me redirect mangles some emoji
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function CouponScene({ onDone }: { onDone: () => void }) {
  const { g, day, gifs } = usePassport();
  const sfx = useSfx();
  const aww = useAww();
  const [used, setUsed] = useState<number[]>([]);
  const [at, setAt] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);

  const redeem = (i: number) => {
    if (used.includes(i)) return;
    setUsed((u) => [...u, i]);
    window.setTimeout(() => {
      sfx("hp-thunk", { gain: 0.85 });
      haptic([30, 40, 20]);
      aww(originOf(cards.current[i], 0.45));
    }, 260);
  };
  const go = (i: number) => {
    const el = cards.current[i];
    if (el && rowRef.current) rowRef.current.scrollTo({ left: el.offsetLeft - (rowRef.current.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
  };

  return (
    <Scene id="coupons" label="Hug coupons" kicker={`Hug coupons · ${g.coupons.length} inside`} title="Hugs I owe you 🎟️" sub="Tap REDEEM. I'll pay up in person.">
      <div className="hp-book">
        <Slot day={day} gifs={gifs} id="hp5-coupon" size={92} className="hp-bookPeek hp-float" tilt={-6} eager />
        <span className="hp-bookRings" aria-hidden>
          {Array.from({ length: 7 }, (_, k) => (
            <i key={k} />
          ))}
        </span>
        <div
          ref={rowRef}
          className="hp-coupons"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / Math.max(1, (cards.current[1]?.offsetLeft ?? el.clientWidth) - (cards.current[0]?.offsetLeft ?? 0)));
            if (i !== at) {
              setAt(i);
              sfx("page-turn", { gain: 0.25 });
            }
          }}
        >
          {g.coupons.map((c, i) => {
            const [bg, ink] = TINTS[i % TINTS.length];
            const done = used.includes(i);
            return (
              <article key={i} ref={(el) => void (cards.current[i] = el)} className={`hp-coupon${done ? " is-used" : ""}`} style={{ ["--cb" as string]: bg, ["--ci" as string]: ink }}>
                <div className="hp-couponMain">
                  <small>HUG COUPON Nº {i + 1}</small>
                  <h3>{c.title}</h3>
                  {c.detail && <p>{c.detail}</p>}
                  <span className="hp-couponFine">valid forever · issued by {g.from}</span>
                </div>
                <div className="hp-couponStub">
                  {done ? (
                    <a className="hp-couponTell" href={redeemLink(c.title, c.detail, g.replyLine, g.from)} target="_blank" rel="noopener noreferrer" onClick={() => sfx("pop", { gain: 0.4 })}>
                      Tell {g.from} 💬
                    </a>
                  ) : (
                    <button type="button" className="hp-couponBtn" onClick={() => redeem(i)} aria-label={`Redeem: ${c.title}`}>
                      REDEEM
                    </button>
                  )}
                </div>
                {done && (
                  <span className="hp-couponStamp" aria-label="Redeemed">
                    REDEEMED ✓
                  </span>
                )}
              </article>
            );
          })}
        </div>
        {g.coupons.length > 1 && (
          <div className="hp-couponDots" role="tablist" aria-label="Coupons">
            {g.coupons.map((c, i) => (
              <button key={i} type="button" role="tab" aria-selected={i === at} aria-label={`Coupon ${i + 1}: ${c.title}`} className={i === at ? "is-on" : ""} onClick={() => go(i)} />
            ))}
          </div>
        )}
      </div>
      <div className="hp-foot is-on">
        <Puffy onClick={onDone} className={used.length ? "hp-heartbeat" : undefined}>
          One last stamp 💗
        </Puffy>
      </div>
    </Scene>
  );
}
