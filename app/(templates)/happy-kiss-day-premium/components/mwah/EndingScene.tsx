"use client";

// Scene 8 · Keepsake. Her decorated strip, taped up, with a couple sticker
// peeking over it: save it as a 9:16 story card. Then "Send a kiss back":
// she presses his photo and her own lip print stamps on it; write back
// (ReplyBox), send it on WhatsApp, replay, or make one of her own.

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { CroppedPhoto, burst, haptic } from "../../../_valentine/kit";
import { ReplyBox, sfx } from "../../../_valentine/kit/premium";
import { saveStrip } from "./keepsake";
import { LipPrint } from "./LipPrint";
import { GIF, fmt, initialOf, type Deco, type Mwah } from "./model";
import Strip from "./Strip";
import { Gif, Kicker, Puffy, Quiet, Scene, Title, Washi, popIn, rise } from "./ui";

export default function EndingScene({ m, decos, endLine, mode, replyText, onReplay }: { m: Mwah; decos: Deco[]; endLine: string; mode: "preview" | "live"; replyText: string; onReplay: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [back, setBack] = useState<{ x: number; y: number } | null>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const save = async () => {
    setSaving(true);
    sfx("kmw-shutter", { gain: 0.6 });
    const r = await saveStrip(m, decos, endLine).catch(() => "failed" as const);
    setSaving(false);
    setSaved(r === "failed" ? "Couldn't save here. A screenshot works too 📸" : r === "shared" ? "Shared 💋" : "Saved to your downloads 💋");
  };
  const kissBack = (e?: React.PointerEvent) => {
    if (back) return;
    const r = photoRef.current?.getBoundingClientRect();
    const x = e && r ? ((e.clientX - r.left) / r.width) * 100 : 50;
    const y = e && r ? ((e.clientY - r.top) / r.height) * 100 : 50;
    setBack({ x, y });
    sfx("kmw-stamp", { gain: 0.9 });
    haptic([15, 40, 25]);
    if (r) burst({ kind: "hearts", origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }, count: 20, spread: 0.25 });
  };
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${m.backText || replyText}\n— to ${m.sender}`)}`;

  return (
    <Scene label="Yours to keep" className="km-end">
      <motion.div {...rise(0)}>
        <Kicker>Yours to keep</Kicker>
      </motion.div>
      <motion.div {...rise(1)}>
        <Title size="clamp(32px, 9vw, 50px)">
          Your <em>Mwah Booth</em> strip
        </Title>
      </motion.div>
      <div className="km-endGrid">
        <motion.div className="km-endStrip" {...popIn(1)}>
          <Washi tone="mint" style={{ left: "50%", top: -11, transform: "translateX(-50%) rotate(3deg)" }} />
          <Strip m={m} decos={decos} width="clamp(160px, 44vw, 210px)" decoPx={Math.round(Math.min(210, Math.max(160, 0.44 * (typeof window === "undefined" ? 390 : window.innerWidth))) * 0.427)} />
          <span className="km-endGif">
            <Gif src={GIF.penguinsKiss} size={96} tilt={10} />
          </span>
        </motion.div>
        <div className="km-endText">
          {endLine && (
            <motion.p className="km-endLine km-hand" {...rise(3)}>
              {endLine}
            </motion.p>
          )}
          {m.sinceDays ? (
            <motion.p className="km-endDays" {...rise(4)}>
              {fmt(m.sinceDays)} days of {initialOf(m.recipient)} ♥ {initialOf(m.sender)}
            </motion.p>
          ) : null}
          <motion.div className="km-endCta" {...rise(5)}>
            <Puffy onClick={() => void save()} disabled={saving}>
              {saving ? "Printing…" : "Save it for your story 📲"}
            </Puffy>
            {saved && (
              <p className="km-saved" role="status">
                {saved}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="km-back">
        <h3 className="km-backH">Send a kiss back 💋</h3>
        <p className="km-backSub">{back ? `Delivered to ${m.sender}'s photo. Now tell ${m.sender}:` : `Press ${m.sender}'s photo to leave your kiss on it.`}</p>
        <div className="km-polaroid km-backPol">
          <div ref={photoRef} className="km-backPhoto" onPointerDown={kissBack} role="button" tabIndex={0} aria-label={`Kiss ${m.sender}'s photo back`} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), kissBack())}>
            {m.kissPhoto ? <CroppedPhoto photo={m.kissPhoto} /> : <span className="km-kpEmpty">{initialOf(m.sender)}</span>}
            {back && (
              <span className="km-kpPrint" style={{ left: `${back.x}%`, top: `${back.y}%`, ["--r" as string]: "-12deg" }} aria-hidden>
                <LipPrint color={m.S.c} lipstick={m.lipstick} size={84} seed={31} />
              </span>
            )}
          </div>
          <p className="km-polCap">{back ? "from me, with love" : `for ${m.sender}`}</p>
        </div>
        {back && (
          <motion.div className="km-backMore" {...popIn(0)}>
            <ReplyBox title={`Write back to ${m.sender}`} placeholder="A kiss back, in words…" accent="#FF4F86" className="km-reply" />
            <a className="km-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>
              Send a kiss back on WhatsApp 💬
            </a>
          </motion.div>
        )}
        <div className="km-endRow">
          <Quiet onClick={onReplay}>↺ Replay</Quiet>
          {mode === "live" && (
            <Link href="/templates" className="km-quiet">
              Make one for someone 💌
            </Link>
          )}
        </div>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-endGrid { display: grid; justify-items: center; gap: 18px; width: 100%; margin-top: 14px; }
.km-endStrip { position: relative; transform: rotate(-3deg); }
.km-endStrip .km-strip { transform: none; }
.km-endGif { position: absolute; right: -92px; top: 40%; }
@media (max-width: 380px) { .km-endGif { right: -70px; } }
.km-endText { display: grid; justify-items: center; gap: 10px; }
.km-endLine { margin: 0; font-size: 21px; font-weight: 600; color: var(--km-deep); max-width: 24ch; }
.km-endDays { margin: 0; font: 600 14px/1 var(--km-ui); letter-spacing: .06em; color: var(--km-ink2); background: #fff; padding: 8px 14px; border-radius: 99px; }
.km-endCta { display: grid; justify-items: center; gap: 8px; margin-top: 6px; }
.km-saved { margin: 0; font: 500 14px/1.3 var(--km-ui); color: var(--km-deep); }
.km-back { width: min(440px, 100%); display: grid; justify-items: center; gap: 10px; margin-top: 46px; padding: 26px 18px 18px; border-radius: 32px; background: rgba(255,255,255,.7);
  box-shadow: 0 0 0 3px #fff, 0 20px 40px -24px rgba(214,63,114,.6); box-sizing: border-box; }
.km-backH { margin: 0; font: 400 30px/1.05 var(--km-display); color: var(--km-deep); }
.km-backSub { margin: 0; font: 500 15px/1.4 var(--km-ui); color: var(--km-ink2); max-width: 30ch; }
.km-backPol { width: min(200px, 56vw); transform: rotate(2deg); margin-top: 6px; }
.km-backPhoto { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 3px; cursor: pointer; background: #FFE3EC; touch-action: manipulation; }
.km-backPhoto:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 3px; }
.km-backMore { width: 100%; display: grid; gap: 12px; justify-items: center; }
.km-reply { width: 100%; }
.km-end .pm-reply { background: #fff !important; border: 0 !important; border-radius: 22px !important; box-shadow: 0 0 0 2px #FFE3EC; color: var(--km-ink) !important; }
.km-end .pm-replyH { font: 600 21px/1.2 var(--km-hand); color: var(--km-deep); }
.km-end .pm-replyIn { border: 2px solid #FFD1DF; border-radius: 16px; font-family: var(--km-ui); }
.km-end .pm-replyBtn { box-shadow: 0 4px 0 #D63F72; font-family: var(--km-ui); font-weight: 600; }
.km-wa { display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: 52px; border-radius: 99px; text-decoration: none; box-sizing: border-box;
  font: 600 16px/1 var(--km-ui); color: #1f7a4d; background: #E3F8EC; box-shadow: 0 4px 0 #BDEBD0; }
.km-wa:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 3px; }
.km-endRow { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 6px; }
.km-endRow a.km-quiet { text-decoration: underline; }
`;
