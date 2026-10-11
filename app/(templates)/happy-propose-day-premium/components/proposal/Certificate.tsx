"use client";

// The keepsake: an "Officially Taken 💍" certificate with both names, today's date and the sender's three terms.
// The sender has signed already; she signs with a tap of her ring finger on the dotted pad (a ring stamp thumps
// down with a wobble). Then: save it as a picture, "Say it back 💌" (the reply), the sealed P.S., watch again.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import type { KeepsakeLayout } from "../../../_valentine/kit";
import { ReplyBox, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import { Btn, DECOR, Gif, LinkBtn, RingArt } from "./parts";
import { STONES, dateLine, type Story } from "./util";

export function Certificate({ story, when, onArrive, onReplay }: { story: Story; when: Date; onArrive: () => void; onReplay: () => void }) {
  const { premium, sfx } = usePremium();
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const pad = useRef<HTMLButtonElement | null>(null);
  const arrived = useRef(false);
  const arriveRef = useRef(onArrive);
  useEffect(() => {
    arriveRef.current = onArrive;
  });
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    arriveRef.current();
  }, []);

  const psText = premium.psLetter?.trim() ?? "";
  const [psHead, ...psRest] = psText.split("\n");
  const date = dateLine(when);

  const sign = () => {
    if (signed) return;
    setSigned(true);
    sfx("lp-stamp");
    sfx("chime", { at: 0.2 });
    haptic([15, 40, 25]);
    const r = pad.current?.getBoundingClientRect();
    burst({ kind: "hearts", origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : { x: 0.5, y: 0.7 }, count: 16 });
  };

  const save = async () => {
    setSaving("busy");
    sfx("paper-rustle");
    const r = await saveOrSharePoster(certificateLayout(story, date, signed), `officially-taken-${story.to}`, `Officially taken 💍 ${story.to} & ${story.from}`);
    setSaving(r === "failed" ? "failed" : "done");
  };

  return (
    <div className="lp-scene lp-cert-scene">
      <motion.article className="lp-cert" initial={{ y: 40, scale: 0.85, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <Gif src={DECOR.fingerHeart} size={70} className="lp-cert-gif tr" eager />
        <Gif src={DECOR.backHug} size={84} className="lp-cert-gif bl" />
        <p className="lp-cert-kick">Certificate of</p>
        <h2 className="lp-cert-title">Officially Taken 💍</h2>
        <p className="lp-cert-small">This certifies that</p>
        <p className="lp-cert-names">
          {story.to} <span>&amp;</span> {story.from}
        </p>
        <p className="lp-cert-small">are officially, adorably, completely taken, as of {date}.</p>
        <div className="lp-cert-terms">
          <span>The fine print</span>
          <ul>
            {story.terms.map((t, k) => (
              <li key={k}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="lp-cert-signs">
          <div className="lp-cert-sig">
            <span className="lp-hand">{story.from}</span>
            <small>the one who asked</small>
          </div>
          <div className="lp-cert-sig">
            <button ref={pad} type="button" className={`lp-pad${signed ? " is-signed" : ""}`} onClick={sign} disabled={signed} aria-label={signed ? "Signed with a ring" : "Tap with your ring finger to sign"}>
              {signed ? (
                <motion.span className="lp-stampMark" initial={{ scale: 2.4, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -10, opacity: 1 }} transition={{ type: "spring", stiffness: 520, damping: 14 }}>
                  <RingArt stone={STONES[story.stone]} size={46} />
                  <b>I do</b>
                </motion.span>
              ) : (
                <span className="lp-padHint">tap with your ring finger</span>
              )}
            </button>
            <small>{signed ? `signed, ${story.to}` : "the one who said yes"}</small>
          </div>
        </div>
        {story.endLine && <p className="lp-cert-end">{story.endLine}</p>}
      </motion.article>

      <div className="lp-cert-actions">
        {signed ? (
          <Btn onClick={() => void save()} disabled={saving === "busy"}>
            {saving === "busy" ? "Printing…" : saving === "done" ? "Saved ✓" : "Save the certificate 📜"}
          </Btn>
        ) : (
          <Btn kind="cherry" onClick={sign}>
            Sign it 💍
          </Btn>
        )}
        {saving === "failed" && <span className="lp-sub">Couldn&rsquo;t save. A screenshot works too!</span>}
      </div>

      <div className="lp-reply">
        <ReplyBox title="Say it back 💌" placeholder={`Write ${story.from} a little reply…`} accent="#7A52E0" />
      </div>

      {psText && (
        <div className="lp-ps">
          {ps ? (
            <motion.div className="lp-sticky lp-ps-in" initial={{ scale: 0.6, rotate: 6, opacity: 0 }} animate={{ scale: 1, rotate: 1.5, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 15 }}>
              <b>{psHead}</b>
              {psRest.join("\n").trim() && <span>{psRest.join("\n").trim()}</span>}
            </motion.div>
          ) : (
            <button
              type="button"
              className="lp-psEnv"
              onClick={() => {
                setPs(true);
                sfx("paper-rustle");
                sfx("pop", { at: 0.15, gain: 0.6 });
                haptic(12);
              }}
            >
              <span aria-hidden>💌</span> One more thing… (a sealed P.S.)
            </button>
          )}
        </div>
      )}

      <div className="lp-foot">
        <LinkBtn onClick={onReplay}>↺ Watch it again</LinkBtn>
      </div>
    </div>
  );
}

/** The saved picture: a 1080×1350 portrait certificate. */
function certificateLayout(story: Story, date: string, signed: boolean): KeepsakeLayout {
  const W = 1080;
  const items: KeepsakeLayout["items"] = [
    { type: "rect", x: 60, y: 60, w: W - 120, h: 1230, radius: 56, fill: "#FFFFFF" },
    { type: "rect", x: 88, y: 88, w: W - 176, h: 1174, radius: 40, stroke: "#DCCBFF", lineWidth: 6 },
    { type: "text", text: "CERTIFICATE OF", x: W / 2, y: 190, size: 30, weight: 700, color: "#7A52E0", align: "center" },
    { type: "text", text: "Officially Taken", x: W / 2, y: 290, size: 92, weight: 800, color: "#FF4D6D", align: "center" },
    { type: "emoji", char: "💍", x: W / 2 - 46, y: 330, size: 92 },
  ];
  if (story.hero) items.push({ type: "image", src: story.hero.url, x: W / 2 - 150, y: 450, w: 300, h: 300, radius: 150, cropX: story.hero.cropX, cropY: story.hero.cropY, frame: { pad: 12, bottom: 12, color: "#FFE3EC" } });
  const y0 = story.hero ? 820 : 520;
  items.push(
    { type: "text", text: "This certifies that", x: W / 2, y: y0, size: 32, color: "#6E5C96", align: "center" },
    { type: "text", text: `${story.to} & ${story.from}`, x: W / 2, y: y0 + 96, size: 84, face: "script", weight: 700, color: "#3B2A63", align: "center", maxWidth: 860, maxLines: 1 },
    { type: "text", text: `are officially, adorably, completely taken, as of ${date}.`, x: W / 2, y: y0 + 160, size: 30, color: "#6E5C96", align: "center", maxWidth: 820, maxLines: 2 },
  );
  story.terms.forEach((t, k) => items.push({ type: "text", text: `♥ ${t}`, x: W / 2, y: y0 + 250 + k * 46, size: 30, weight: 600, color: "#5B36C4", align: "center", maxWidth: 860, maxLines: 1 }));
  items.push({ type: "text", text: signed ? `Signed with a ring · ${story.to}` : `Signed · ${story.from}`, x: W / 2, y: 1230, size: 28, weight: 700, color: "#FF4D6D", align: "center" });
  return { width: W, height: 1350, background: { stops: [[0, "#F8F4FF"], [0.55, "#EDE3FF"], [1, "#FFE3EC"]] }, items };
}
