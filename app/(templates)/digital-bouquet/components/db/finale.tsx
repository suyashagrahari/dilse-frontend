"use client";

// The last act:
//   7 · The question — a soft question answered with a reaction (every one is
//       happy; which one goes to the sender's email as reactions.count).
//   8 · The keepsake — the bouquet on a florist's card, then a story-sized
//       keepsake to download, a reply on WhatsApp, replay, "make one".

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { downloadKeepsake, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DbPaletteDef } from "../../../_valentine/days/digital-bouquet";
import type { ValentineDayData } from "../../../_valentine/types";
import { Bouquet, type BouquetLook } from "./Bouquet";
import { DB_SANS, DB_SCRIPT, DB_SERIF } from "./fonts";
import { flowerNames, renderBouquetPng } from "./keepsake";
import { useDb, useNext } from "./stage";
import { Head } from "./ui";

const REACTION_EMOJI = ["💗", "🥹", "😘", "🤗"] as const;

export function Question({ question, reactions, look, palette, onAnswer }: { question: string; reactions: readonly string[]; look: BouquetLook; palette: DbPaletteDef; onAnswer: (k: number) => void }) {
  const { cue } = useDb();
  return (
    <>
      <Head kicker="One small question" title={question} sub="Pick how it made you feel." />
      <div className="db-fill">
        <div className="db-q">
          <div className="db-q-bq" aria-hidden>
            <Bouquet look={look} palette={palette} sway />
          </div>
          <div className="db-q-grid" role="group" aria-label={question}>
            {reactions.map((r, k) => (
              <button
                key={k}
                type="button"
                className="db-react"
                onClick={() => {
                  cue("kiss", { gain: 0.4 });
                  haptic([12, 30, 18]);
                  onAnswer(k);
                }}
                data-db-react={k + 1}
              >
                <span className="db-react-e" aria-hidden>
                  {REACTION_EMOJI[k]}
                </span>
                <span className="db-react-l">{r.replace(/\s*\p{Extended_Pictographic}+\s*$/u, "").trim() || r}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="db-foot" />
    </>
  );
}

export function YesRoom({ line, recipient, sticker, onNext }: { line: string; recipient: string; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  useNext("Keep your bouquet", onNext, "gift");
  return (
    <>
      <Head kicker={`Yay, ${recipient}`} title={line} />
      <div className="db-fill">
        <motion.div initial={reduced ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} className="db-yes-stk">
          {sticker}
        </motion.div>
      </div>
      <div className="db-foot" />
    </>
  );
}

export function Ending({
  data,
  look,
  palette,
  recipient,
  sender,
  replyText,
  onReplay,
}: {
  data: ValentineDayData;
  look: BouquetLook;
  palette: DbPaletteDef;
  recipient: string;
  sender: string;
  replyText: string;
  onReplay: () => void;
}) {
  const { go } = useDb();
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"card" | "keep">("card");
  const pngRef = useRef<Promise<string | null> | null>(null);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const names = useMemo(() => flowerNames(look), [look]);
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), []);

  // Start painting the keepsake's bouquet in the background, while she reads the card.
  useEffect(() => {
    pngRef.current = renderBouquetPng(look);
  }, [look]);

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/digital-bouquet` : "https://subhsandesh.in/digital-bouquet";
    const text = `Someone sent me the most beautiful digital bouquet 🥹💐\nMake one for your person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const W = 1080;
  const keepsake = (png: string | null): KeepsakeLayout => {
    const items: KeepsakeItem[] = [
      { type: "rect", x: 60, y: 60, w: 960, h: 1800, radius: 36, fill: "rgba(255,255,255,0.55)" },
      { type: "text", text: "A BOUQUET FOR", x: W / 2, y: 190, size: 38, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "text", text: recipient, x: W / 2, y: 320, size: 130, color: t.ink, face: "script", maxWidth: 900, maxLines: 1 },
    ];
    if (png) items.push({ type: "image", src: png, x: 132, y: 430, w: 816, h: 1034 });
    items.push({ type: "text", text: names.slice(0, 5).join(" · "), x: W / 2, y: 1540, size: 34, italic: true, color: t.inkSoft, face: "serif", maxWidth: 900, maxLines: 2 });
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1640, size: 46, italic: true, color: t.ink, face: "serif", maxWidth: 900, maxLines: 2 });
    items.push(
      { type: "text", text: `— ${sender}`, x: W / 2, y: 1750, size: 72, color: t.accentDeep, face: "script", maxWidth: 800, maxLines: 1 },
      { type: "text", text: `${today}  ·  made on subhsandesh.in`, x: W / 2, y: 1830, size: 26, color: t.inkSoft, face: "ui" },
    );
    return { background: { stops: [[0, palette.sky[0]], [0.5, palette.sky[1]], [1, palette.sky[2]]] }, items };
  };

  const save = async () => {
    setSaving("busy");
    haptic(10);
    const png = await (pngRef.current ?? renderBouquetPng(look));
    const ok = await downloadKeepsake(keepsake(png), `digital-bouquet-${recipient}`);
    setSaving(ok ? "done" : "failed");
  };
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${replyText}\n— to ${sender}`)}`;

  useNext(sheet === "card" ? "Keep it forever" : "Make one for someone", sheet === "card" ? () => setSheet("keep") : makeOwn, sheet === "card" ? "heart" : "bouquet", sheet === "card");

  if (sheet === "keep")
    return (
      <>
        <Head kicker="Yours to keep" title={<>Save your <em>bouquet</em></>} sub={`Download it as a card, then tell ${sender}.`} />
        <div className="db-fill">
          <div className="db-bq is-keep">
            <Bouquet look={look} palette={palette} sway />
          </div>
        </div>
        <div className="db-foot" style={{ width: "100%", maxWidth: 400, flexDirection: "column" }}>
          <div className="db-acts">
            <a className="db-act is-main" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>
              💬 Tell {sender}
            </a>
            <div className="db-acts-row">
              <button type="button" className="db-act" onClick={save} disabled={saving === "busy"} aria-live="polite" data-db-keepsake>
                {saving === "busy" ? "Making it…" : saving === "done" ? "Saved ✓" : saving === "failed" ? "Try again" : "⬇ Keepsake card"}
              </button>
              <button type="button" className="db-act" onClick={() => go(onReplay)}>
                ↺ Replay
              </button>
            </div>
            {saving === "failed" && <p className="db-acts-note">Couldn&apos;t save here — take a screenshot instead 📸</p>}
          </div>
        </div>
      </>
    );

  return (
    <>
      <div className="db-fill">
        <motion.div className="db-post" initial={reduced ? false : { opacity: 0, y: 40, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -1 }} transition={{ type: "spring", stiffness: 120, damping: 16 }} data-db-postcard>
          <p className="db-post-k">A bouquet for</p>
          <p className="db-post-n">{recipient}</p>
          <div className="db-post-bq">
            <Bouquet look={look} palette={palette} sway />
          </div>
          {data.endLine && <p className="db-post-e">{data.endLine}</p>}
          <p className="db-post-f">— {sender}</p>
        </motion.div>
      </div>
      <div className="db-foot" />
    </>
  );
}

export const DB_FINALE_CSS = `
.db-q { width: 100%; height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 10px; justify-items: center; align-items: center; container-type: size; }
.db-q-bq { height: 100%; aspect-ratio: 1000 / 1400; max-width: 60cqw; min-height: 0; }
.db-q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: min(100%, 440px); }
.db-react { min-height: 64px; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 0; border-radius: 20px; cursor: pointer; text-align: left; color: var(--vw-ink);
  background: linear-gradient(180deg, #FFFFFF, var(--vw-soft)); box-shadow: inset 0 0 0 1.5px var(--vw-edge), 0 6px 0 color-mix(in srgb, var(--vw-edge) 80%, var(--db-deep)), 0 16px 26px -18px var(--db-deep); touch-action: manipulation; transition: transform .12s ease; }
.db-react:hover { transform: translateY(-2px); }
.db-react:active { transform: translateY(4px); box-shadow: inset 0 0 0 1.5px var(--vw-edge), 0 2px 0 var(--vw-edge); }
.db-react:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.db-react-e { font-size: 30px; line-height: 1; flex: none; }
.db-react-l { font: 700 clamp(14px, 3.8vw, 16px)/1.2 ${DB_SANS}; overflow-wrap: anywhere; min-width: 0; }
.db-yes-stk img { width: min(54cqw, 46cqh, 240px) !important; height: auto !important; border-radius: 22px; }
.db-yes-stk { padding: 8px; border-radius: 28px; background: #FFFFFF; box-shadow: 0 0 0 1.5px var(--vw-edge), 0 24px 40px -22px var(--db-deep); transform: rotate(-3deg); }
.db-post { position: relative; height: min(100%, 720px); max-width: 100%; aspect-ratio: 5 / 7.4; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; padding: 4.5cqh 5cqh 3.4cqh; border-radius: 10px;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 8px #FFFFFF, inset 0 0 0 9px var(--vw-edge), 0 34px 60px -30px var(--db-deep); }
.db-post-k { margin: 0; font: 700 clamp(10px, 1.8cqh, 13px) ${DB_SANS}; letter-spacing: .26em; text-transform: uppercase; color: var(--vw-accent-deep); }
.db-post-n { margin: .4cqh 0 0; font: 400 clamp(30px, 7.2cqh, 60px)/1.05 ${DB_SCRIPT}; color: var(--vw-ink); max-width: 100%; overflow-wrap: anywhere; text-align: center; }
.db-post-bq { flex: 1; min-height: 0; aspect-ratio: 1000 / 1400; max-width: 100%; }
.db-post-e { margin: .6cqh 0 0; font: italic 600 clamp(15px, 2.7cqh, 21px)/1.25 ${DB_SERIF}; color: var(--vw-ink); text-align: center; overflow-wrap: anywhere; }
.db-post-f { margin: .4cqh 0 0; font: 400 clamp(22px, 4.2cqh, 34px)/1 ${DB_SCRIPT}; color: var(--vw-accent-deep); }
.db-acts { display: grid; gap: 10px; width: 100%; max-width: 380px; }
.db-acts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.db-act { min-height: 50px; padding: 10px 16px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; cursor: pointer; touch-action: manipulation;
  font: 700 15px ${DB_SANS}; color: var(--vw-ink); background: color-mix(in srgb, var(--vw-paper) 82%, transparent); border: 1.5px solid var(--vw-edge); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.db-act.is-main { border: 0; color: #FFFFFF; font-size: 16px; background: linear-gradient(180deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: 0 5px 0 var(--db-deep); }
.db-act:disabled { opacity: .6; }
.db-act:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.db-acts-note { margin: 0; font: 500 13px ${DB_SANS}; color: var(--vw-ink-soft); text-align: center; }
.db-bq.is-keep { width: min(100cqw, 71cqh, 380px); }
`;
