"use client";

// The ending: the sealed envelope theirs to keep (tilt it), witnessed by a
// line only the two of them understand. Save the deed (a 1080×1920 image
// with every clause and both signatures), open the codicil (the sealed
// P.S.), write back, reply on WhatsApp, replay, or make one of their own.

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { haptic } from "../../../_valentine/kit";
import { NotaryStamp } from "./art";
import { PremiumCTA, ReplyBox, TiltCard, sfx, usePremium } from "../../../_valentine/kit/premium";
import { Envelope } from "./Gate";
import { saveDeed } from "./keepsake";
import { stampDate, type Deed } from "./model";
import type { SignResult } from "./SignScene";
import { CTA_STYLE, Scene } from "./ui";

export default function EndingScene({
  d,
  sig,
  endLine,
  mode,
  replyText,
  sticker,
  onReplay,
}: {
  d: Deed;
  sig: SignResult | null;
  endLine: string;
  mode: "preview" | "live";
  replyText: string;
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const { premium } = usePremium();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [ps, setPs] = useState(false);
  const save = async () => {
    setSaving(true);
    const r = await saveDeed(d, sig, endLine);
    setSaving(false);
    setSaved(r === "failed" ? "Couldn't save here. A screenshot works too." : r === "shared" ? "Shared ✦" : "Saved to your downloads ✦");
  };
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${d.reply || replyText}\n— to ${d.sender}`)}`;
  const psText = (premium.psLetter || "").trim();

  return (
    <Scene label="Yours to keep" className="sp-end">
      <div className="sp-endGrid">
        <div className="sp-endEnv">
          <TiltCard radius={3} max={12} glare={0.3} shadow={false}>
            <div className="sp-endEnvIn">
              <Envelope d={d} />
              <NotaryStamp date={stampDate()} size="36%" className="sp-endNotary" />
            </div>
          </TiltCard>
          {sticker && <div className="sp-endSticker">{sticker}</div>}
        </div>
        <div className="sp-endText">
          {d.witness && (
            <p className="sp-endWit">
              <span>Witnessed by</span>
              {d.witness}
            </p>
          )}
          <h2 className="sp-h sp-endH">{endLine || "Signed, sealed, and promised."}</h2>
          <div className="sp-endCta">
            <PremiumCTA
              style={CTA_STYLE}
              tone="gold"
              cue={null}
              disabled={saving}
              onClick={() => {
                sfx("sp-stamp", { gain: 0.6 });
                void save();
              }}
            >
              {saving ? "Typing it up…" : "Save the deed"}
            </PremiumCTA>
            {saved && (
              <p className="sp-saved" role="status">
                {saved}
              </p>
            )}
          </div>
        </div>
      </div>

      {psText && (
        <div className="sp-ps">
          {!ps ? (
            <button
              type="button"
              className="sp-psBtn"
              onClick={() => {
                setPs(true);
                sfx("wax-crack", { gain: 0.7 });
                haptic(12);
              }}
            >
              <span className="sp-psDot" aria-hidden style={{ background: `radial-gradient(circle at 36% 30%, ${d.W.hi}, ${d.W.c} 50%, ${d.W.lo})` }} />
              Open the codicil (P.S.)
            </button>
          ) : (
            <div className="sp-psPaper sp-paper sp-rise">
              <p className="sp-psHead">Codicil</p>
              {psText.split(/\n\s*\n|\n/).map((l, k) => (
                <p key={k} className="sp-psP sp-typed">
                  {l}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sp-endMore">
        <ReplyBox title={`Write back to ${d.sender}`} placeholder="Your promise back, in words…" accent="#E9C77A" className="sp-reply" />
        <a className="sp-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>
          Promise back on WhatsApp
        </a>
        <div className="sp-endRow">
          <button type="button" className="sp-quiet" onClick={onReplay}>
            ↺ Read it again
          </button>
          {mode === "live" && (
            <Link href="/templates" className="sp-quiet">
              Make one for someone ✦
            </Link>
          )}
        </div>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-endGrid { width: 100%; display: grid; justify-items: center; gap: 30px; }
.sp-endEnv { position: relative; width: min(330px, calc(100vw - 56px)); padding-top: 12px; }
.sp-endEnvIn { position: relative; }
.sp-endNotary { position: absolute; right: 3%; top: 3%; transform: rotate(-14deg); mix-blend-mode: multiply; opacity: .92; }
.sp-endSticker { position: absolute; left: -18px; bottom: -26px; }
.sp-endText { display: grid; justify-items: center; gap: 16px; }
.sp-endWit { margin: 0; max-width: 28ch; font: italic 400 clamp(18px, 4.8vw, 22px)/1.35 var(--sp-serif); color: rgba(245,239,226,.85); text-wrap: balance; }
.sp-endWit span { display: block; margin-bottom: 8px; font: 700 10.5px/1 var(--sp-type); font-style: normal; letter-spacing: .3em; text-transform: uppercase; color: rgba(233,199,122,.85); }
.sp-endH { font-size: clamp(30px, 8.4vw, 60px); max-width: 15ch; }
.sp-endCta { display: grid; justify-items: center; gap: 8px; margin-top: 4px; }
.sp-saved { margin: 0; font: 400 12px/1.4 var(--sp-type); letter-spacing: .06em; color: rgba(245,239,226,.8); }
.sp-ps { width: 100%; max-width: 480px; display: grid; justify-items: center; margin-top: 40px; }
.sp-psBtn { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 18px 0 8px; border-radius: 99px;
  font: 700 11px/1 var(--sp-type); letter-spacing: .2em; text-transform: uppercase; color: var(--sp-ivory); background: rgba(245,239,226,.06); border: 1px solid rgba(233,199,122,.28); }
.sp-psBtn:focus-visible { outline: 2px solid var(--sp-gold); outline-offset: 3px; }
.sp-psDot { width: 30px; height: 30px; border-radius: 50%; background: radial-gradient(circle at 36% 30%, #B23A4E, #6E1423 50%, #3A0710); box-shadow: inset 0 -2px 3px rgba(0,0,0,.4); }
.sp-psPaper { width: 100%; box-sizing: border-box; padding: 24px 24px 18px; text-align: left; transform: rotate(.6deg); }
.sp-psHead { margin: 0 0 12px; font: 600 13px/1 var(--sp-serif); font-variant: small-caps; letter-spacing: .2em; color: var(--sp-ox); }
.sp-psP { margin: 0 0 .8em; font-size: 15px; line-height: 1.55; }
.sp-endMore { width: 100%; max-width: 440px; display: grid; justify-items: center; gap: 14px; margin-top: 52px; padding-top: 32px; border-top: 1px solid rgba(245,239,226,.12); }
.sp-reply.pm-reply, .sp-reply { width: 100%; }
.sp-end .pm-reply { background: rgba(20,12,8,.6) !important; border-color: rgba(233,199,122,.2) !important; color: var(--sp-ivory) !important; }
.sp-wa { display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: 52px; border-radius: 99px; text-decoration: none; box-sizing: border-box;
  font: 700 12px/1 var(--sp-type); letter-spacing: .16em; text-transform: uppercase; color: var(--sp-ivory); border: 1px solid rgba(233,199,122,.35); background: rgba(255,255,255,.04); }
.sp-wa:focus-visible { outline: 3px solid var(--sp-gold); outline-offset: 3px; }
.sp-endRow { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.sp-endRow a.sp-quiet { text-decoration: none; }
@media (min-width: 1024px) {
  .sp-endGrid { grid-template-columns: 1fr 1fr; align-items: center; column-gap: 80px; min-height: calc(100svh - 170px); }
  .sp-endEnv { justify-self: end; width: 420px; }
  .sp-endText { justify-items: start; text-align: left; }
  .sp-endCta { justify-items: start; }
}
`;
