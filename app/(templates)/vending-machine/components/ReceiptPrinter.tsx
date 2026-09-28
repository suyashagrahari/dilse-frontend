"use client";

// ─── The receipt — the secret prize ──────────────────────────────────────────
//
// The last thing the machine does is print. The printer stays locked (with a
// polite way round it — never a dead end) until the full set of memory cards
// is collected; then the receipt feeds out of the slot line by line: every
// card itemised at ₹∞, the eighteen slots, a PRICELESS subtotal, and at the
// foot, under SECRET PRIZE UNLOCKED, the sender's letter. A GIF is taped on,
// a heart burst goes off, and it can be saved as a PNG.
//
// The feed is a single transform on one node (stepped, like a thermal head),
// sized to the receipt's measured height. Reduced motion shows it at once.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { V } from "../../_love/theme";
import { CandyButton, GhostButton, GROTESK, GradText, HeartBurst, ITALIC, SectionHead } from "../../_love/LoveKit";
import type { LovePhoto } from "../../_love/types";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { seededUnit } from "@/lib/seededRandom";
import { motor, sfxCoin, sfxPaperSlide } from "@/lib/webAudio";
import DotMatrixDisplay from "./DotMatrixDisplay";
import GifSticker from "./GifSticker";
import { C, MONO, PIXEL } from "./machine";
import { MACHINE_MODEL, MACHINE_SERIAL, RESERVED_SLOT, cardCode, type Slot } from "./types";

const RECEIPT_W = 320;
const PAPER = "#fffdf6";
const INK = "#23201a";

interface Props {
  machineName: string;
  senderName: string;
  recipientName: string;
  letter: string;
  photos: LovePhoto[];
  slots: Slot[];
  gifs: string[];
  collectedCount: number;
  issued: string;
  ledColor: string;
  ledDim: string;
  reducedMotion: boolean;
}

type Stage = "locked" | "ready" | "printing" | "done";

function Row({ left, right, bold }: { left: string; right: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", fontWeight: bold ? 700 : 400 }}>
      <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{left}</span>
      <span style={{ flex: "0 0 auto" }}>{right}</span>
    </div>
  );
}

const Rule = () => <div aria-hidden style={{ borderTop: `1.5px dashed ${INK}`, opacity: 0.55, margin: "10px 0" }} />;

export default function ReceiptPrinter({
  machineName,
  senderName,
  recipientName,
  letter,
  photos,
  slots,
  gifs,
  collectedCount,
  issued,
  ledColor,
  ledDim,
  reducedMotion,
}: Props) {
  const total = photos.length;
  const allCollected = collectedCount >= total;
  const [forced, setForced] = useState(false);
  const [printStage, setPrintStage] = useState<"idle" | "printing" | "done">("idle");
  // Unlocked as soon as the set is complete (or they chose not to wait).
  const stage: Stage = printStage !== "idle" ? printStage : allCollected || forced ? "ready" : "locked";
  const [paperH, setPaperH] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [ledW, setLedW] = useState(300);
  const [clock, setClock] = useState("");
  const paperRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const ledBox = useRef<HTMLDivElement>(null);
  const stopMotor = useRef<(() => void) | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopMotor.current?.();
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const el = ledBox.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLedW(Math.max(120, Math.floor(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stocked = useMemo(() => slots.filter((s) => s.code !== RESERVED_SLOT && s.label.trim()).length, [slots]);
  const bars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        w: 1 + Math.round(seededUnit(`${senderName}${recipientName}`, `bar${i}`) * 3),
        gap: 1 + Math.round(seededUnit(`${recipientName}`, `gap${i}`) * 2),
      })),
    [senderName, recipientName],
  );

  const print = useCallback(() => {
    if (stage !== "ready") return;
    const d = new Date();
    setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    const node = paperRef.current;
    const h = node ? node.scrollHeight : 900;
    setPaperH(h);
    setPrintStage("printing");
    sfxPaperSlide();
    if (reducedMotion) {
      setPrintStage("done");
      sfxCoin();
      return;
    }
    const dur = Math.min(5200, Math.max(2400, h * 3.2));
    stopMotor.current?.();
    stopMotor.current = motor({ freq: 140, gain: 0.05 });
    requestAnimationFrame(() => {
      feedRef.current?.animate([{ transform: `translateY(-${h}px)` }, { transform: "translateY(0)" }], {
        duration: dur,
        easing: `steps(${Math.round(h / 9)}, end)`,
        fill: "forwards",
      });
    });
    timer.current = window.setTimeout(() => {
      stopMotor.current?.();
      stopMotor.current = null;
      setPrintStage("done");
      sfxCoin();
    }, dur + 60);
  }, [stage, reducedMotion]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveMsg("");
    const node = paperRef.current;
    const res = await exportNodeToPng(node, {
      width: RECEIPT_W,
      height: node ? Math.ceil(node.scrollHeight) : 900,
      filename: `${fileSlug(machineName, "receipt")}-receipt`,
      backgroundColor: PAPER,
    });
    setSaving(false);
    setSaveMsg(res.ok ? "Saved to your photos/downloads ✓" : res.message);
  }, [machineName]);

  const ledText =
    stage === "locked"
      ? `COLLECT ALL CARDS TO PRINT  ${collectedCount}/${total}`
      : stage === "ready"
        ? "READY TO PRINT"
        : stage === "printing"
          ? "PRINTING"
          : "PLEASE TAKE YOUR RECEIPT";
  const gif = gifs.length ? gifs[gifs.length - 1] : undefined;
  const letterText = letter.trim();

  return (
    <section aria-label="The receipt" style={{ position: "relative" }}>
      <SectionHead
        eyebrow="the secret prize"
        title={
          <>
            One last thing is <GradText style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em" }}>printing</GradText>
          </>
        }
        note={total > 0 ? "Collect every card and the machine prints your receipt." : "Every machine gives a receipt. This one has a prize at the bottom."}
      />

      {/* printer */}
      <div
        style={{
          position: "relative",
          borderRadius: 24,
          padding: 12,
          background: `linear-gradient(90deg, ${C.bodyDark} 0%, ${C.body} 16%, ${C.bodyLight} 44%, ${C.body} 70%, ${C.bodyDark} 100%)`,
          border: `1px solid ${C.edge}`,
          boxShadow: `0 26px 50px -24px ${V.shadow}, inset 0 1px 0 rgba(255,255,255,.25)`,
        }}
      >
        <div style={{ borderRadius: 14, padding: "8px 10px", background: `linear-gradient(180deg, ${C.plateHi}, ${C.plateLo})`, border: `1px solid ${C.edge}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: PIXEL, fontSize: 13, color: C.sign, textShadow: `0 0 10px ${C.signGlow}`, letterSpacing: ".06em" }}>PRIZE PRINTER</span>
            <span
              aria-hidden
              className={stage === "printing" ? "vm-blink" : undefined}
              style={{ width: 9, height: 9, borderRadius: "50%", background: stage === "locked" ? C.red : C.green, boxShadow: `0 0 8px ${stage === "locked" ? C.red : C.green}` }}
            />
          </div>
          <div ref={ledBox}>
            <DotMatrixDisplay idleText={ledText} text={stage === "locked" ? null : ledText} width={ledW} height={20} color={ledColor} dimColor={ledDim} />
          </div>
        </div>

        {/* the slot */}
        <div
          aria-hidden
          style={{
            margin: "12px 18px 0",
            height: 12,
            borderRadius: 999,
            background: "linear-gradient(180deg,#000 0%,#15191a 100%)",
            boxShadow: `inset 0 3px 5px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.25)${stage === "printing" ? `, 0 0 16px ${C.green}` : ""}`,
          }}
        />

        {(stage === "locked" || stage === "ready") && (
          <div style={{ padding: "16px 4px 6px", display: "grid", gap: 10 }}>
            {stage === "locked" ? (
              <>
                <CandyButton disabled ariaLabel={`Locked: collect ${total - collectedCount} more cards`}>
                  🔒 Collect {total - collectedCount} more card{total - collectedCount === 1 ? "" : "s"}
                </CandyButton>
                <button
                  type="button"
                  onClick={() => setForced(true)}
                  className="lv-focus"
                  style={{ fontFamily: GROTESK, fontSize: 13, fontWeight: 600, color: C.ink, opacity: 0.8, textDecoration: "underline", textUnderlineOffset: 3, background: "none", border: 0, padding: 8, cursor: "pointer" }}
                >
                  I can&apos;t wait — print it now
                </button>
              </>
            ) : (
              <CandyButton onClick={print} style={{ fontSize: 17 }} ariaLabel="Print my receipt">
                <span className="lv-wiggle" style={{ display: "inline-block" }}>🧾</span> Print my receipt
              </CandyButton>
            )}
          </div>
        )}
      </div>

      {/* the paper — always in the DOM so it can be measured before printing */}
      <div
        style={{
          position: "relative",
          margin: "-6px auto 0",
          width: "min(100%, 340px)",
          overflow: "hidden",
          height: stage === "printing" || stage === "done" ? paperH || "auto" : 0,
          transition: stage === "printing" && !reducedMotion ? "none" : undefined,
        }}
      >
        <div ref={feedRef} style={{ willChange: stage === "printing" ? "transform" : undefined, transform: stage === "printing" && !reducedMotion ? `translateY(-${paperH}px)` : undefined }}>
          <div
            ref={paperRef}
            className="vm-receipt"
            style={{
              position: "relative",
              width: RECEIPT_W,
              maxWidth: "100%",
              margin: "0 auto",
              padding: "26px 18px 30px",
              background: PAPER,
              color: INK,
              fontFamily: MONO,
              fontSize: 12.5,
              lineHeight: 1.55,
              boxShadow: "0 18px 30px -18px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: PIXEL, fontSize: 13, letterSpacing: ".02em", overflowWrap: "anywhere" }}>♥ {machineName || "AFFECTION DISPENSER"} ♥</p>
              <p style={{ margin: "2px 0 0", fontSize: 10.5, letterSpacing: ".12em" }}>
                {MACHINE_MODEL} · SERIAL {MACHINE_SERIAL}
              </p>
            </div>
            <Rule />
            <Row left={`DATE ${issued}`} right={clock} />
            <Row left="CUSTOMER" right={(recipientName || "YOU").toUpperCase()} />
            <Row left="STOCKED BY" right={(senderName || "ME").toUpperCase()} />
            <Rule />
            <Row left="QTY ITEM" right="PRICE" bold />
            {photos.map((p, i) => (
              <Row key={i} left={`1   ${cardCode(i)} ${p.caption || "a memory"}`} right="₹∞" />
            ))}
            <Row left={`${stocked}  things behind glass`} right="₹∞" />
            <Row left="1   the slot that jammed" right="₹∞" />
            <Row left="1   A1 (not for sale)" right="—" />
            <Rule />
            <Row left="SUBTOTAL" right="PRICELESS" />
            <Row left="HUG TAX (∞%)" right="∞" />
            <Row left="PAID WITH" right="YOUR ANSWERS" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: PIXEL, fontSize: 15 }}>
              <span>TOTAL</span>
              <span>EVERYTHING</span>
            </div>
            <Rule />
            {gif && !saving && (
              <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 6px" }}>
                <span style={{ position: "relative" }}>
                  <span aria-hidden style={{ position: "absolute", top: -6, left: 22, width: 44, height: 14, transform: "rotate(8deg)", background: "rgba(255,210,120,.75)", zIndex: 2 }} />
                  <GifSticker url={gif} size={88} tilt={-4} reducedMotion={reducedMotion} style={{ border: "3px solid #fff", boxShadow: "0 6px 14px -6px rgba(0,0,0,.4)" }} />
                </span>
              </div>
            )}
            <p style={{ margin: "4px 0 10px", textAlign: "center", fontFamily: PIXEL, fontSize: 12.5, letterSpacing: ".06em" }}>★ SECRET PRIZE UNLOCKED ★</p>
            {letterText ? (
              <div style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.38, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{letterText}</div>
            ) : (
              <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.38, textAlign: "center" }}>
                One (1) hug, redeemable in person, immediately, from {senderName || "me"}.
              </p>
            )}
            <Rule />
            <div aria-hidden style={{ display: "flex", justifyContent: "center", alignItems: "stretch", height: 46, gap: 0, margin: "6px 0 4px" }}>
              {bars.map((b, i) => (
                <span key={i} style={{ width: b.w, marginRight: b.gap, background: INK }} />
              ))}
            </div>
            <p style={{ margin: 0, textAlign: "center", fontSize: 10, letterSpacing: ".2em" }}>
              RH-{MACHINE_SERIAL}-{(recipientName || "YOU").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-∞
            </p>
            <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 10.5, letterSpacing: ".08em" }}>NO REFUNDS · NO RETURNS · NO EXPIRY</p>
            <p style={{ margin: "2px 0 0", textAlign: "center", fontFamily: PIXEL, fontSize: 12 }}>THANK YOU · I MEAN IT</p>
          </div>
        </div>
      </div>

      {stage === "done" && (
        <div style={{ position: "relative", marginTop: 18, display: "grid", gap: 10, justifyItems: "center" }}>
          {!reducedMotion && <HeartBurst glyphs={["🧾", "💖", "✨", "🩷", "🪙"]} />}
          <p className="lv-pop" style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: 18, color: V.ink, textAlign: "center" }}>
            Receipt printed. Keep it forever, {recipientName || "you"}.
          </p>
          <div style={{ display: "flex", gap: 10, width: "min(100%, 360px)" }}>
            <GhostButton onClick={save} disabled={saving} style={{ flex: 1, minHeight: 50 }}>
              {saving ? "Saving…" : "Save receipt ⤓"}
            </GhostButton>
          </div>
          {saveMsg && <p style={{ margin: 0, fontSize: 12, color: V.soft, fontFamily: GROTESK }}>{saveMsg}</p>}
        </div>
      )}
    </section>
  );
}
