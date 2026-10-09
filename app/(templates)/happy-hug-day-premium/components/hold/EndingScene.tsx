"use client";

// The ending: "Hug owed: 1. Redeem in person." A coupon on soft card stock (tilt it: foil edge), their photo on top in
// full colour. Pull the stub off along the perforation (or tap it): it rips away and the coupon becomes a WhatsApp
// message to redeem it. Then the last line, the keepsake image (the photo half black-and-white, half bloomed into
// colour), the sealed P.S., the reply box, replay, and (for the recipient) "make one".

import Link from "next/link";
import { useRef, useState, type PointerEvent as RPE, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, ReplyBox, TiltCard, sfx, usePremium } from "../../../_valentine/kit/premium";
import { saveHugCard } from "./keepsake";
import { initialOf, type Hug } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

let fallN = 0;
const e0 = () => ++fallN;

export default function EndingScene({
  h,
  endLine,
  dateLine,
  deliveredAt,
  mode,
  replyText,
  sticker,
  onReplay,
}: {
  h: Hug;
  endLine: string;
  dateLine: string;
  deliveredAt: string;
  mode: "preview" | "live";
  replyText: string;
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const reduce = useReducedMotion();
  const { premium } = usePremium();
  const [ci, setCi] = useState(0);
  const [torn, setTorn] = useState<boolean[]>(() => h.coupons.map(() => false));
  const [pull, setPull] = useState(0);
  const [fall, setFall] = useState<{ k: number; top: number; left: number; w: number } | null>(null);
  const stubRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const start = useRef<{ y: number; x: number; t: number } | null>(null);
  const coupon = h.coupons[ci];
  const isTorn = torn[ci];
  const end = endLine.trim() || "Twenty seconds was never going to be enough.";

  const tear = () => {
    if (isTorn) return;
    setTorn((t) => t.map((v, i) => (i === ci ? true : v)));
    setPull(0);
    const r = stubRef.current?.getBoundingClientRect();
    const pr = cardRef.current?.getBoundingClientRect();
    if (!reduce && r && pr) setFall({ k: e0(), top: r.top - pr.top, left: r.left - pr.left, w: r.width });
    sfx("hh-tear", { gain: 0.9 });
    haptic([10, 30, 14]);
  };
  const down = (e: RPE<HTMLElement>) => {
    if (isTorn) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { y: e.clientY, x: e.clientX, t: performance.now() };
  };
  const move = (e: RPE<HTMLElement>) => {
    const s = start.current;
    if (!s) return;
    const d = Math.max(0, e.clientY - s.y) + Math.abs(e.clientX - s.x) * 0.5;
    setPull(Math.min(1, d / 70));
    if (d > 70) {
      start.current = null;
      tear();
    }
  };
  const up = () => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (performance.now() - s.t < 260 && pull < 0.15) tear();
    else setPull(0);
  };

  const save = async () => {
    setSaving("busy");
    const r = await saveHugCard(h, coupon, end);
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };

  const msg = `${h.replyLine || replyText}\n🎟 ${coupon.title}${coupon.detail ? ` (${coupon.detail})` : ""}\n— to ${h.from}`;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  const psFirst = premium.psLetter.split("\n")[0].trim();
  const psRest = premium.psLetter.includes("\n") ? premium.psLetter.slice(premium.psLetter.indexOf("\n")).trim() : "";

  return (
    <Scene label="The hug you're owed" className="hh-light hh-end">
      <div className="hh-endGrid">
        <div className="hh-endCard" ref={cardRef}>
          <TiltCard radius={14} foil glare={0.28} max={9} shadow={false} style={{ width: "clamp(250px, 80vw, 380px)" }}>
            <div className={`hh-coupon${isTorn ? " is-torn" : ""}`}>
              <div className="hh-couponPic">
                {h.hero ? (
                  <CinematicPhoto photo={h.hero} frame="full" grade="warm" focusPull={false} drift={26} caption="" />
                ) : (
                  <span className="hh-couponBlank">
                    {initialOf(h.to)} <i>&amp;</i> {initialOf(h.from)}
                  </span>
                )}
              </div>
              <div className="hh-couponBody">
                <p className="hh-couponNo">Hug coupon · No. {String(ci + 1).padStart(3, "0")}</p>
                <p className="hh-couponTitle">{coupon.title || "Hug owed: 1"}</p>
                {coupon.detail && <p className="hh-couponDetail">{coupon.detail}</p>}
                <p className="hh-couponWho">
                  from {h.from}, for {h.to}
                </p>
              </div>
              {!isTorn && <div className="hh-perf" aria-hidden />}
              {!isTorn && (
              <button
                ref={stubRef}
                type="button"
                className="hh-stub"
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={() => {
                  start.current = null;
                  setPull(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    tear();
                  }
                }}
                aria-label="Tear off the stub to redeem it"
                style={pull > 0 ? { transform: `translateY(${pull * 10}px) rotate(${pull * 4}deg)`, transition: "none" } : undefined}
              >
                <span>Redeem in person</span>
                <span className="hh-stubCut" aria-hidden>
                  Pull to tear
                </span>
              </button>
              )}
            </div>
          </TiltCard>
          {fall != null && (
            <span key={fall.k} className="hh-stubFall" aria-hidden onAnimationEnd={() => setFall(null)} style={{ top: fall.top, left: fall.left, width: fall.w }}>
              <span>Redeem in person</span>
            </span>
          )}
          {sticker && <span className="hh-endSticker">{sticker}</span>}
          {h.coupons.length > 1 && (
            <div className="hh-couponNav" role="group" aria-label="Coupons">
              {h.coupons.map((c, i) => (
                <button key={i} type="button" className={`hh-dot${i === ci ? " is-on" : ""}`} aria-label={`Coupon ${i + 1}: ${c.title}`} aria-pressed={i === ci} onClick={() => { setCi(i); setPull(0); sfx("swoosh-soft", { gain: 0.3 }); }} />
              ))}
            </div>
          )}
        </div>

        <div className="hh-endText">
          <Eyebrow>{deliveredAt ? `${dateLine} · hug delivered at ${deliveredAt}` : dateLine}</Eyebrow>
          <h2 className="hh-h hh-endH">{end}</h2>
          <div className="hh-endCta">
            {isTorn ? (
              <a className="hh-wa hh-rise" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>
                Send it to {h.from} to redeem
              </a>
            ) : (
              <p className="hh-tearHint">Tear off the stub when you want it</p>
            )}
            <PremiumCTA style={CTA_STYLE} tone="ember" cue="tick" onClick={() => void save()} disabled={saving === "busy"}>
              {saving === "busy" ? "Printing…" : saving === "done" ? "Kept ✦" : saving === "failed" ? "Try again" : "Keep this hug"}
            </PremiumCTA>
            {saving === "failed" && <p className="hh-saved" role="status">Couldn&apos;t save here. A screenshot works too.</p>}
          </div>
        </div>
      </div>

      <div className="hh-endMore">
        {premium.psLetter && (
          <div className={`hh-ps${ps ? " is-open" : ""}`}>
            <button
              type="button"
              className="hh-psBtn"
              aria-expanded={ps}
              onClick={() => {
                if (ps) return;
                setPs(true);
                sfx("page-turn", { gain: 0.7 });
                haptic(10);
              }}
            >
              <span className="hh-psTag">P.S.</span>
              <span className="hh-psFirst">{psFirst}</span>
              {!ps && <span className="hh-psOpen">Open</span>}
            </button>
            {ps && psRest && <p className={`hh-psRest${reduce ? "" : " hh-rise"}`}>{psRest}</p>}
          </div>
        )}
        <ReplyBox title={`Write back to ${h.from}`} placeholder="Twenty seconds back, in words…" accent="#C9774A" className="hh-reply" />
        <div className="hh-endRow">
          <button type="button" className="hh-quiet" onClick={onReplay}>
            ↺ Hold it again
          </button>
          {mode === "live" && (
            <Link href="/templates" className="hh-quiet">
              Send a hug to someone ✦
            </Link>
          )}
        </div>
        <p className="hh-credit">made with SubhSandesh ✦</p>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.hh-endGrid { width: 100%; display: grid; justify-items: center; gap: 30px; }
.hh-endCard { position: relative; display: grid; justify-items: center; gap: 16px; padding-top: 6px; }
.hh-coupon { position: relative; display: grid; border-radius: 14px; overflow: hidden; background: #FFFCF7; color: var(--hh-cocoa); text-align: left;
  box-shadow: 0 44px 80px -36px rgba(75,52,38,.75), 0 2px 8px rgba(75,52,38,.15), inset 0 0 0 1px rgba(201,119,74,.25); }
.hh-coupon::after { content: ""; position: absolute; inset: 6px; border-radius: 10px; border: 1px solid rgba(201,119,74,.35); pointer-events: none; }
.hh-couponPic { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
.hh-couponBlank { display: grid; place-items: center; width: 100%; height: 100%; font: 400 92px/1 var(--hh-display); font-style: italic; color: var(--hh-cloud); background: radial-gradient(circle at 50% 45%, #F7C3A0, #C9774A 60%, #4B3426); }
.hh-couponBlank i { font-size: .5em; opacity: .7; }
.hh-couponBody { padding: 18px 22px 16px; display: grid; gap: 6px; }
.hh-couponNo { margin: 0; font: 700 10px/1 var(--hh-ui); letter-spacing: .28em; text-transform: uppercase; color: var(--hh-apricot-deep); }
.hh-couponTitle { margin: 2px 0 0; font: 400 clamp(38px, 11vw, 48px)/.98 var(--hh-display); letter-spacing: -.02em; color: var(--hh-cocoa); }
.hh-couponDetail { margin: 0; font: 400 14px/1.45 var(--hh-ui); color: rgba(75,52,38,.78); }
.hh-couponWho { margin: 4px 0 0; font: 400 18px/1.2 var(--hh-display); font-style: italic; color: rgba(75,52,38,.7); }
.hh-perf { height: 0; margin: 0 14px; border-top: 2px dashed rgba(75,52,38,.22); position: relative; }
.hh-perf::before, .hh-perf::after { content: ""; position: absolute; top: -11px; width: 20px; height: 20px; border-radius: 50%; background: var(--hh-sand); box-shadow: inset 0 0 0 1px rgba(201,119,74,.25); }
.hh-perf::before { left: -25px; } .hh-perf::after { right: -25px; }
.hh-stub { all: unset; box-sizing: border-box; cursor: grab; display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 58px; padding: 0 22px;
  background: linear-gradient(180deg, #FBE7D6, #F6D5BB); touch-action: none; -webkit-tap-highlight-color: transparent; transform-origin: 0 0;
  transition: transform .5s var(--hh-ease); }
.hh-stub > span:first-child { font: 700 11px/1 var(--hh-ui); letter-spacing: .26em; text-transform: uppercase; color: var(--hh-cocoa); }
.hh-stubCut { font: 400 16px/1 var(--hh-display); font-style: italic; color: var(--hh-apricot-deep); }
.hh-stub:focus-visible { outline: 3px solid var(--hh-apricot-deep); outline-offset: -3px; }
/* Torn: the coupon keeps a ragged bottom edge; a copy of the stub falls away below it. */
.hh-coupon.is-torn { border-radius: 14px 14px 0 0; padding-bottom: 8px;
  -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%; mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%; }
.hh-coupon.is-torn::after { bottom: 12px; }
.hh-stubFall { position: absolute; z-index: 3; min-height: 58px; box-sizing: border-box;
  display: flex; align-items: center; padding: 0 22px; border-radius: 0 0 14px 14px; background: linear-gradient(180deg, #FBE7D6, #F6D5BB); box-shadow: 0 20px 40px -20px rgba(75,52,38,.7);
  font: 700 11px/1 var(--hh-ui); letter-spacing: .26em; text-transform: uppercase; color: var(--hh-cocoa); pointer-events: none; transform-origin: 10% 0;
  animation: hh-tear 1.2s cubic-bezier(.5,0,.75,0) forwards; }
@keyframes hh-tear { 0% { transform: none; } 18% { transform: translateY(6px) rotate(4deg); } 100% { transform: translate(50px, 300px) rotate(24deg); opacity: 0; } }
.hh-endSticker { position: absolute; right: -14px; top: -10px; transform: rotate(8deg); }
.hh-couponNav { display: flex; gap: 6px; }
.hh-dot { all: unset; cursor: pointer; width: 44px; height: 32px; display: grid; place-items: center; }
.hh-dot::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: rgba(75,52,38,.25); transition: transform .3s, background .3s; }
.hh-dot.is-on::before { background: var(--hh-apricot-deep); transform: scale(1.3); }
.hh-dot:focus-visible { outline: 2px solid var(--hh-apricot-deep); border-radius: 8px; }
.hh-endText { display: grid; justify-items: center; gap: 16px; }
.hh-endH { font-style: italic; font-size: clamp(34px, 9.4vw, 64px); max-width: 14ch; line-height: 1.02; }
.hh-endCta { display: grid; justify-items: center; gap: 12px; margin-top: 6px; }
.hh-tearHint { margin: 0; font: 400 14px/1.4 var(--hh-ui); color: rgba(75,52,38,.65); }
.hh-wa { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 26px; border-radius: 99px; text-decoration: none; box-sizing: border-box;
  font: 700 12px/1 var(--hh-ui); letter-spacing: .16em; text-transform: uppercase; color: var(--hh-cloud); background: var(--hh-cocoa); box-shadow: 0 16px 30px -16px rgba(75,52,38,.9); }
.hh-wa:focus-visible { outline: 3px solid var(--hh-apricot-deep); outline-offset: 3px; }
.hh-saved { margin: 0; font: 400 13px/1.4 var(--hh-ui); color: rgba(75,52,38,.8); }
.hh-endMore { width: 100%; max-width: 460px; display: grid; justify-items: center; gap: 16px; margin-top: 60px; padding-top: 36px; border-top: 1px solid rgba(75,52,38,.14); }
.hh-ps { width: 100%; display: grid; gap: 10px; }
.hh-psBtn { all: unset; cursor: pointer; box-sizing: border-box; width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 16px;
  background: rgba(255,252,247,.7); box-shadow: inset 0 0 0 1px rgba(75,52,38,.1); text-align: left; }
.hh-psBtn:focus-visible { outline: 3px solid var(--hh-apricot-deep); outline-offset: 2px; }
.hh-psTag { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; font: 400 18px/1 var(--hh-display); font-style: italic; color: var(--hh-cloud);
  background: radial-gradient(circle at 35% 30%, #F7C3A0, #C9774A 55%, #7A4126); box-shadow: inset 0 -3px 0 rgba(0,0,0,.18); }
.hh-psFirst { font: 400 19px/1.25 var(--hh-display); font-style: italic; color: var(--hh-cocoa); }
.hh-psOpen { font: 700 10px/1 var(--hh-ui); letter-spacing: .24em; text-transform: uppercase; color: var(--hh-apricot-deep); }
.hh-psRest { margin: 0; padding: 4px 6px 0; font: 400 19px/1.5 var(--hh-display); color: var(--hh-cocoa); text-align: left; white-space: pre-line; }
.hh-end .pm-reply { width: 100%; background: rgba(255,252,247,.7) !important; border-color: rgba(75,52,38,.12) !important; color: var(--hh-cocoa) !important; font-family: var(--hh-ui) !important; }
.hh-end .pm-reply * { font-family: var(--hh-ui); }
.hh-endRow { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.hh-endRow a.hh-quiet { text-decoration: none; }
.hh-credit { margin: 6px 0 0; font: 500 11px/1 var(--hh-ui); letter-spacing: .14em; color: rgba(75,52,38,.45); }
@media (min-width: 1024px) {
  .hh-endGrid { grid-template-columns: 1fr 1fr; align-items: center; column-gap: 80px; min-height: calc(100svh - 170px); }
  .hh-endCard { justify-self: end; }
  .hh-endText { justify-items: start; text-align: left; }
  .hh-endCta { justify-items: start; }
  .hh-endH { max-width: 12ch; }
}
`;
