"use client";

// The ending: the strip, now with BOTH kisses on the footer, theirs stamping
// in as the scene opens. Save it (a 1080×1920 story image), write back, send
// a kiss back on WhatsApp, replay, or (recipient) make one of their own.

import Link from "next/link";
import { useEffect, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { PremiumCTA, ReplyBox, TiltCard, sfx } from "../../../_valentine/kit/premium";
import { saveStrip } from "./keepsake";
import type { Booth } from "./model";
import Strip from "./Strip";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

const STRIP_W = "clamp(170px, calc((100svh - 330px) / 3.2), 290px)";

export default function EndingScene({ b, endLine, kissed, mode, replyText, onReplay }: { b: Booth; endLine: string; kissed: boolean; mode: "preview" | "live"; replyText: string; onReplay: () => void }) {
  const [stamped, setStamped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (!kissed) return;
    const t = window.setTimeout(() => {
      setStamped(true);
      sfx("kpb-stamp", { gain: 0.85 });
      haptic([16, 40, 16]);
    }, 900);
    return () => window.clearTimeout(t);
  }, [kissed]);

  const save = async () => {
    setSaving(true);
    const r = await saveStrip(b, endLine, kissed);
    setSaving(false);
    setSaved(r === "failed" ? "Couldn't save here. A screenshot works too." : r === "shared" ? "Shared ✦" : "Saved to your downloads ✦");
  };
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${b.backText || replyText}\n— to ${b.sender}`)}`;

  return (
    <Scene label="Yours to keep" className="pb-end">
      <div className="pb-endGrid">
        <div className="pb-endStrip">
          <TiltCard radius={4} max={10} glare={0.34} shadow={false} style={{ width: STRIP_W }}>
            <Strip b={b} kissed={stamped} width={STRIP_W} />
          </TiltCard>
        </div>
        <div className="pb-endText">
          <Eyebrow>{kissed ? "Two kisses · one strip" : "Yours to keep"}</Eyebrow>
          <h2 className="pb-h pb-endH">{endLine || "Four frames. One kiss. No retakes."}</h2>
          <div className="pb-endCta">
            <PremiumCTA style={CTA_STYLE} tone="pearl" cue={null} onClick={() => { sfx("kpb-press", { gain: 0.7 }); void save(); }} disabled={saving}>
              {saving ? "Printing…" : "Save the strip"}
            </PremiumCTA>
            {saved && <p className="pb-saved" role="status">{saved}</p>}
          </div>
        </div>
      </div>
      <div className="pb-endMore">
        <ReplyBox title={`Write back to ${b.sender}`} placeholder="A kiss back, in words…" accent={b.S.hi} className="pb-reply" />
        <a className="pb-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>
          Send a kiss back on WhatsApp
        </a>
        <div className="pb-endRow">
          <button type="button" className="pb-quiet" onClick={onReplay}>↺ Replay</button>
          {mode === "live" && (
            <Link href="/templates" className="pb-quiet">
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
.pb-endGrid { width: 100%; display: grid; justify-items: center; gap: 22px; }
.pb-endStrip { padding: 8px 0 0; }
.pb-endText { display: grid; justify-items: center; gap: 14px; }
.pb-endH { font-size: clamp(26px, 7vw, 60px); max-width: 17ch; }
@media (min-width: 1024px) { .pb-endH { max-width: 12ch; } }
.pb-endCta { display: grid; justify-items: center; gap: 8px; margin-top: 6px; }
.pb-saved { margin: 0; font: 400 12px/1.4 var(--pb-mono); letter-spacing: .06em; color: rgba(244,237,225,.8); }
.pb-endMore { width: 100%; max-width: 440px; display: grid; justify-items: center; gap: 14px; margin-top: 56px; padding-top: 34px; border-top: 1px solid rgba(244,237,225,.12); }
.pb-reply.pm-reply, .pb-reply { width: 100%; }
.pb-end .pm-reply { background: rgba(14,9,10,.55) !important; border-color: rgba(201,206,214,.2) !important; color: var(--pb-cream) !important; }
.pb-wa { display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: 52px; border-radius: 99px; text-decoration: none; box-sizing: border-box;
  font: 700 12px/1 var(--pb-mono); letter-spacing: .16em; text-transform: uppercase; color: var(--pb-cream); border: 1px solid rgba(201,206,214,.35); background: rgba(255,255,255,.04); }
.pb-wa:focus-visible { outline: 3px solid var(--pb-shade-hi); outline-offset: 3px; }
.pb-endRow { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.pb-endRow a.pb-quiet { text-decoration: none; }
@media (min-width: 1024px) {
  .pb-endGrid { grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; min-height: calc(100svh - 160px); }
  .pb-endStrip { justify-self: end; }
  .pb-endText { justify-items: start; text-align: left; }
  .pb-endCta { justify-items: start; }
}
`;
