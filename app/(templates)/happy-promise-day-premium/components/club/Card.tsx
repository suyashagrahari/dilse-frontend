"use client";

// The keepsake: her Pinky Promise Club membership card on a lanyard. Front: her photo, "member no. 002", since the
// day it started, founded by him (no. 001), the promises she gave back, the bracelet word, her own signature and
// his last line. Tap to flip: the back has the club rules and every promise from the jar. Then: save it as a
// picture, send her promises back to him (prefilled with what she picked, editable), the sealed P.S., watch again.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, type KeepsakeLayout } from "../../../_valentine/kit";
import { saveOrSharePoster, sendPremiumReply, usePremium, usePremiumShare } from "../../../_valentine/kit/premium";
import { PREMIUM_LIMITS } from "../../../_valentine/premiumData";
import { Btn, DECOR, Gif, LinkBtn, PaperStar } from "./parts";
import { dateLine, originOf, type Club } from "./util";

export function Card({ club, picks, ink, onArrive, onReplay }: { club: Club; picks: string[]; ink: string | null; onArrive: () => void; onReplay: () => void }) {
  const { premium, sfx, mode } = usePremium();
  const share = usePremiumShare();
  const [flip, setFlip] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const card = useRef<HTMLButtonElement | null>(null);
  const arrived = useRef(false);
  const arriveRef = useRef(onArrive);
  useEffect(() => {
    arriveRef.current = onArrive;
  });
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    arriveRef.current();
    const t = window.setTimeout(() => {
      sfx("chime-cascade", { gain: 0.6 });
      burst({ kind: "sparkles", origin: originOf(card.current, 0.4), count: 14 });
    }, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const since = club.since ? dateLine(club.since) : dateLine(new Date());
  const mine = picks.length ? picks : [club.askBack[0]];
  const psText = premium.psLetter?.trim() ?? "";
  const [psHead, ...psRest] = psText.split("\n");

  const doFlip = () => {
    setFlip((f) => !f);
    sfx("swoosh-soft", { gain: 0.6 });
    haptic(8);
  };

  const save = async () => {
    setSaving("busy");
    sfx("paper-rustle");
    const r = await saveOrSharePoster(cardLayout(club, mine, ink, since), `pinky-promise-club-${club.to}`, `Pinky Promise Club 🤙 ${club.to} & ${club.from}`);
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") sfx("pk-stamp", { gain: 0.6 });
  };

  return (
    <div className="pk-scene pk-cardScene">
      <header className="pk-head">
        <p className="pk-kicker">Welcome, member no. 2</p>
        <h2 className="pk-title">
          <span>Your membership card</span>
        </h2>
      </header>

      <div className="pk-lanyard" aria-hidden>
        <span className="pk-strapL" />
        <span className="pk-clip" />
      </div>
      <motion.div className="pk-cardWrap" initial={{ y: -80, rotate: -10, opacity: 0 }} animate={{ y: 0, rotate: [-10, 5, -2, 0], opacity: 1 }} transition={{ duration: 1.1, ease: "easeOut" }}>
        <Gif src={DECOR.cardTop} size={76} className="pk-cardGif tr" eager />
        <Gif src={DECOR.cardHug} size={84} className="pk-cardGif bl" />
        <button ref={card} type="button" className={`pk-card${flip ? " is-flipped" : ""}`} onClick={doFlip} aria-label={flip ? "Flip to the front" : "Flip the card"}>
          <span className="pk-cardFace front">
            <span className="pk-cardBand">
              <span className="pk-cardLogo" aria-hidden>
                <PaperStar size={30} color="#FFD27A" deep="#E0A21F" />
              </span>
              <span>
                <b>Pinky Promise Club</b>
                <small>members: 2 · est. {club.since ? club.since.getFullYear() : new Date().getFullYear()}</small>
              </span>
            </span>
            <span className="pk-cardBody">
              <span className="pk-cardPhoto">{club.hero ? <CroppedPhoto photo={club.hero} alt="" eager /> : <span className="pk-cardNoPh">🤙</span>}</span>
              <span className="pk-cardWho">
                <span className="pk-cardName">{club.pet || club.to}</span>
                <span className="pk-cardMeta">member no. 002</span>
                <span className="pk-cardMeta">since {since}</span>
                <span className="pk-cardMeta">founded by {club.from} · no. 001</span>
              </span>
            </span>
            <span className="pk-cardPromised">
              <small>promised back</small>
              {mine.map((m, k) => (
                <span key={k}>🤙 {m}</span>
              ))}
            </span>
            <span className="pk-cardStats">
              <span>⭐ {club.stars.length} promises from {club.from}</span>
              <span>🔐 {club.engraving}</span>
            </span>
            <span className="pk-cardFoot">
              <span className="pk-cardBeads" aria-label={club.word}>
                {[...club.word].map((ch, k) => (
                  <i key={k}>{ch}</i>
                ))}
              </span>
              <span className="pk-cardSig">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {ink ? <img src={ink} alt={`${club.to}'s signature`} /> : <span className="pk-hand">{club.to}</span>}</span>
            </span>
            <span className="pk-flipHint">tap to flip ↻</span>
          </span>
          <span className="pk-cardFace back">
            <b className="pk-backTitle">The club rules</b>
            <span className="pk-backRules">
              {club.rules.map((r, k) => (
                <span key={k}>
                  {k + 1}. {r}
                </span>
              ))}
            </span>
            <b className="pk-backTitle">In the jar</b>
            <span className="pk-backStars">
              {club.stars.map((s, k) => (
                <span key={k}>
                  <PaperStar size={16} color={k === club.bigIndex ? "#FFE27A" : "#FFB59E"} deep={k === club.bigIndex ? "#E0A21F" : "#E0603F"} /> {s}
                </span>
              ))}
            </span>
            <span className="pk-backLock">🔐 {club.engraving}</span>
            {club.endLine && <span className="pk-backEnd">{club.endLine}</span>}
          </span>
        </button>
      </motion.div>

      <div className="pk-cardActions">
        <Btn onClick={() => void save()} disabled={saving === "busy"}>
          {saving === "busy" ? "Printing…" : saving === "done" ? "Saved ✓" : "Save my card 🎀"}
        </Btn>
        {saving === "failed" && <span className="pk-sub">Couldn&rsquo;t save. A screenshot works too!</span>}
      </div>

      {premium.allowReply && <PromiseBack club={club} picks={mine} preview={mode === "preview" || !share} />}

      {psText && (
        <div className="pk-ps">
          {ps ? (
            <motion.div className="pk-sticky pk-psIn" initial={{ scale: 0.6, rotate: 6, opacity: 0 }} animate={{ scale: 1, rotate: 1.5, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 15 }}>
              <b>{psHead}</b>
              {psRest.join("\n").trim() && <span>{psRest.join("\n").trim()}</span>}
            </motion.div>
          ) : (
            <button
              type="button"
              className="pk-psEnv"
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

      <div className="pk-foot">
        <LinkBtn onClick={onReplay}>↺ Watch it again</LinkBtn>
      </div>
    </div>
  );
}

/** Her reply: the promises she picked, prefilled and editable, sent back to him in one tap. */
function PromiseBack({ club, picks, preview }: { club: Club; picks: string[]; preview: boolean }) {
  const { sfx } = usePremium();
  const share = usePremiumShare();
  const key = share ? `premium_reply_${share.shareId}` : "";
  const cap = PREMIUM_LIMITS.reply;
  const [text, setText] = useState(() =>
    Array.from(picks.map((p) => (/[.!?]$/.test(p) ? p : `${p}.`)).join("\n") + "\nPinky promise 🤙")
      .slice(0, cap)
      .join(""),
  );
  const [state, setState] = useState<"idle" | "sending" | "sent" | "already" | "error">(() => {
    if (!share) return "idle";
    if (share.replySent) return "already";
    try {
      return window.localStorage.getItem(key) ? "already" : "idle";
    } catch {
      return "idle";
    }
  });
  const btn = useRef<HTMLButtonElement | null>(null);

  const send = async () => {
    const clean = text.trim();
    if (!clean || preview || !share || state === "sending") return;
    setState("sending");
    const r = await sendPremiumReply(share.slug, share.shareId, clean);
    if (r === "error") {
      setState("error");
      return;
    }
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* fine */
    }
    setState(r === "sent" ? "sent" : "already");
    if (r === "sent") {
      sfx("whoosh", { gain: 0.5 });
      sfx("chime-cascade", { at: 0.3 });
      haptic([15, 40, 25]);
      burst({ kind: "hearts", origin: originOf(btn.current), count: 16 });
    }
  };

  return (
    <section className="pk-back" aria-label={`Send your promises to ${club.from}`}>
      <h3>
        Send your promises to {club.from} <span aria-hidden>🤙</span>
      </h3>
      {state === "sent" || state === "already" ? (
        <p className="pk-backDone" role="status">
          {state === "sent" ? `Sent! ${club.from} will see every word 💌` : "You already sent your promises 🤙"}
        </p>
      ) : (
        <>
          <textarea className="pk-backIn" rows={4} value={text} disabled={preview} onChange={(e) => setText(Array.from(e.target.value).slice(0, cap).join(""))} aria-label="Your promises back" />
          <div className="pk-backRow">
            <small aria-live="polite">{state === "error" ? "Couldn't send. Try again?" : preview ? `In the real link this goes straight to ${club.from}.` : `${cap - Array.from(text).length} left`}</small>
            <button ref={btn} type="button" className="pk-btn pk-btn-lilac pk-backBtn" onClick={() => void send()} disabled={preview || !text.trim() || state === "sending"}>
              {state === "sending" ? "Sending…" : "Send 💌"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/** The saved picture: a 1080×1350 portrait membership card. */
function cardLayout(club: Club, mine: string[], ink: string | null, since: string): KeepsakeLayout {
  const W = 1080;
  const items: KeepsakeLayout["items"] = [
    { type: "rect", x: 70, y: 90, w: W - 140, h: 1180, radius: 60, fill: "#FFFFFF" },
    { type: "rect", x: 70, y: 90, w: W - 140, h: 190, radius: 60, fill: "#FF8A6B" },
    { type: "rect", x: 70, y: 220, w: W - 140, h: 60, fill: "#FF8A6B" },
    { type: "text", text: "PINKY PROMISE CLUB", x: W / 2, y: 175, size: 58, weight: 800, color: "#FFFFFF", align: "center" },
    { type: "text", text: `members: 2 · founded by ${club.from}`, x: W / 2, y: 238, size: 30, weight: 600, color: "#FFE4D2", align: "center", maxWidth: 860, maxLines: 1 },
    { type: "emoji", char: "🤙", x: 160, y: 110, size: 70 },
  ];
  if (club.hero) items.push({ type: "image", src: club.hero.url, x: 130, y: 340, w: 330, h: 410, radius: 30, cropX: club.hero.cropX, cropY: club.hero.cropY, rotate: -3, frame: { pad: 14, bottom: 14, color: "#FFE4D2" } });
  const tx = club.hero ? 520 : W / 2;
  const al: CanvasTextAlign = club.hero ? "left" : "center";
  items.push(
    { type: "text", text: club.pet || club.to, x: tx, y: 430, size: 92, face: "script", weight: 700, color: "#5E3226", align: al, maxWidth: club.hero ? 450 : 860, maxLines: 1 },
    { type: "text", text: "member no. 002", x: tx, y: 520, size: 34, weight: 700, color: "#E0603F", align: al },
    { type: "text", text: `since ${since}`, x: tx, y: 572, size: 32, weight: 600, color: "#8A5A4A", align: al },
    { type: "text", text: `🔐 ${club.engraving}`, x: tx, y: 624, size: 30, weight: 600, color: "#8A5A4A", align: al, maxWidth: 450, maxLines: 1 },
  );
  items.push({ type: "rect", x: 130, y: 800, w: W - 260, h: 70 + mine.length * 52, radius: 28, fill: "#FFF4EC" });
  items.push({ type: "text", text: "PROMISED BACK", x: 170, y: 850, size: 26, weight: 800, color: "#E0603F", align: "left" });
  mine.forEach((m, k) => items.push({ type: "text", text: `🤙 ${m}`, x: 170, y: 905 + k * 52, size: 32, weight: 600, color: "#5E3226", align: "left", maxWidth: 760, maxLines: 1 }));
  const y2 = 900 + mine.length * 52 + 70;
  [...club.word].forEach((ch, k, arr) => {
    const bx = W / 2 - (arr.length * 72) / 2 + k * 72;
    items.push({ type: "rect", x: bx + 4, y: y2, w: 62, h: 62, radius: 31, fill: ["#FFB59E", "#C9B6FF", "#9FE5C8", "#FFB3D6", "#FFD27A", "#A8D8FF"][k % 6] });
    items.push({ type: "text", text: ch, x: bx + 35, y: y2 + 44, size: 34, weight: 800, color: "#5E3226", align: "center" });
  });
  if (ink) items.push({ type: "image", src: ink, x: W / 2 - 200, y: y2 + 80, w: 400, h: 167 });
  else items.push({ type: "text", text: club.to, x: W / 2, y: y2 + 180, size: 64, face: "script", color: "#5B36C4", align: "center" });
  if (club.endLine) items.push({ type: "text", text: club.endLine, x: W / 2, y: 1225, size: 34, face: "script", weight: 700, color: "#E0603F", align: "center", maxWidth: 860, maxLines: 1 });
  return { width: W, height: 1350, background: { stops: [[0, "#FFF8F1"], [0.55, "#FFE4D2"], [1, "#FFE3EC"]] }, items };
}
