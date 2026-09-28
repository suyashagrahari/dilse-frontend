"use client";

// ─── The court order — the main letter ───────────────────────────────────────
//
// The last act. The case has been settled and the footage reviewed; what is
// left is the order itself. It opens sealed behind one question ("do you accept
// the verdict?" — the no button runs away), then the order is read out: the
// court's header, and under it the sender's main letter as the OFFICER'S
// PERSONAL REMARKS, one paragraph at a time. When the last line lands, the
// rubber stamp slams down on the page — LOVE WINS — the page jolts, hearts go
// everywhere, and the court adjourns.

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { CandyButton, Eyebrow, GROTESK, HeartBurst, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { NextStep, PaperCard, type NextAction } from "./flowKit";
import { Stamp } from "./Stamp";
import { CH, chDate } from "./theme";
import type { ChallanData } from "./types";

type Stage = "sealed" | "reading" | "stamped";

const LINE_MS = 650;

/** Where the "no" button runs to, in order. Small hops: it must never leave the screen. */
const DODGE = [
  [0, 0],
  [70, -46],
  [-80, -18],
  [60, 34],
  [-56, 40],
  [18, -58],
] as const;
const NO_LABELS = ["no 🙅", "are you sure?", "the court disagrees", "objection overruled", "nice try 😌", "still no?"];

const firstName = (n: string): string => {
  const w = n.trim().split(/\s+/)[0] ?? "";
  return w ? w[0].toUpperCase() + w.slice(1) : "";
};

export default function CourtOrder({
  data,
  gif,
  next,
  reduceMotion,
}: {
  data: ChallanData;
  gif?: string;
  next: NextAction | null;
  reduceMotion: boolean;
}) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [dodges, setDodges] = useState(0);
  const paperRef = useRef<HTMLDivElement | null>(null);

  const paras = data.letter
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const first = firstName(data.accused.name);
  const question = data.lockQuestion.trim() || `${first || "Accused"}, do you accept the verdict of the Heart Traffic Court?`;
  const answer = data.lockAnswer.trim() || "I accept, your honour 💘";

  // The order reads itself out, then the stamp comes down.
  useEffect(() => {
    if (stage !== "reading") return;
    const t = window.setTimeout(() => setStage("stamped"), reduceMotion ? 0 : paras.length * LINE_MS + 700);
    return () => window.clearTimeout(t);
  }, [stage, paras.length, reduceMotion]);

  useEffect(() => {
    if (stage === "reading") paperRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [stage, reduceMotion]);

  const accept = () => {
    setStage("reading");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  if (stage === "sealed") {
    const [dx, dy] = DODGE[dodges % DODGE.length];
    const dodge = () => setDodges((d) => d + 1);
    return (
      <div className="ch-wrap" style={{ maxWidth: 520 }}>
        <div className="lv-pop" style={{ textAlign: "center", paddingTop: 20 }}>
          <div className={reduceMotion ? "" : "lv-wiggle"} style={{ fontSize: 64, lineHeight: 1 }} aria-hidden>
            ⚖️
          </div>
          <Eyebrow color={V.a1} style={{ marginTop: 16 }}>
            the final order · sealed
          </Eyebrow>
          <h2 style={{ margin: "10px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(28px, 7.4vw, 44px)", lineHeight: 1.02, letterSpacing: "-0.04em", color: V.ink, overflowWrap: "anywhere" }}>
            {question}
          </h2>
          <p style={{ margin: "12px auto 0", maxWidth: 360, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: V.soft }}>
            the order will only be read once you answer.
          </p>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minHeight: 170 }}>
            <div style={{ width: "100%", maxWidth: 360 }}>
              <CandyButton onClick={accept} ariaLabel={answer}>
                {answer}
              </CandyButton>
            </div>
            <button
              type="button"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") dodge();
              }}
              onClick={dodge}
              className="lv-focus"
              style={{
                minHeight: 46,
                padding: "0 20px",
                borderRadius: 999,
                border: `1.5px solid ${V.edge}`,
                background: V.glass,
                color: V.soft,
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                transform: `translate(${dx}px, ${dy}px)`,
                transition: "transform .28s cubic-bezier(.2,.9,.3,1.3)",
              }}
            >
              {NO_LABELS[dodges % NO_LABELS.length]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stamped = stage === "stamped";

  return (
    <div className="ch-wrap" style={{ maxWidth: 620 }}>
      <div ref={paperRef} style={{ position: "relative", scrollMarginTop: 80 }}>
        <PaperCard style={{ position: "relative", overflow: "hidden", padding: "30px 20px 26px", borderRadius: 18 }}>
          <span aria-hidden className="ch-stripe" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 7 }} />

          <header style={{ textAlign: "center" }}>
            <div style={{ fontFamily: CH.serif, fontSize: 11.5, fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: CH.faint }}>In the court of</div>
            <div style={{ marginTop: 4, fontFamily: CH.serif, fontSize: 17, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: CH.ink }}>{data.authority.name}</div>
            <div style={{ marginTop: 14, fontFamily: CH.serif, fontSize: "clamp(30px, 8vw, 40px)", fontWeight: 700, letterSpacing: ".32em", textIndent: ".32em", color: CH.ink }}>ORDER</div>
            <div style={{ marginTop: 6, fontFamily: CH.mono, fontSize: 11.5, lineHeight: 1.5, color: CH.faint, overflowWrap: "anywhere" }}>
              Case No. {data.challanNo} · {data.accused.name || "the accused"} v. {data.authority.state}
            </div>
          </header>

          <div style={{ margin: "16px 0 18px", borderTop: `2px solid ${CH.ink}`, borderBottom: `1px solid ${CH.ink}`, height: 4, opacity: 0.8 }} />

          <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: CH.red }}>Officer&apos;s personal remarks</p>

          <div style={{ marginTop: 10 }}>
            {paras.map((p, i) => (
              <p
                key={`${i}-${p.slice(0, 12)}`}
                className={reduceMotion ? "" : "ch-line"}
                style={
                  {
                    margin: i === 0 ? 0 : "16px 0 0",
                    fontFamily: ITALIC,
                    fontSize: i === 0 && p.length < 40 ? 28 : 21,
                    lineHeight: 1.42,
                    color: CH.ink,
                    whiteSpace: "pre-line",
                    overflowWrap: "anywhere",
                    animationDelay: `${i * LINE_MS}ms`,
                  } as CSSProperties
                }
              >
                {p}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 26, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, minHeight: 90 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: ITALIC, fontSize: 26, lineHeight: 1, color: CH.ink }}>{data.officer.name}</div>
              <div style={{ marginTop: 6, width: 170, maxWidth: "100%", borderTop: `1px solid ${CH.ink}`, paddingTop: 5, fontFamily: CH.mono, fontSize: 10.5, color: CH.faint, overflowWrap: "anywhere" }}>
                {data.officer.post || "Presiding officer"}
              </div>
            </div>
          </div>

          <p style={{ margin: "18px 0 0", fontFamily: CH.mono, fontSize: 10, lineHeight: 1.6, color: CH.faint }}>
            Dated {chDate(data.issuedAt)}. This order is final and binding on hearts only. It has no legal effect anywhere else.
          </p>

          {stamped ? (
            <div style={{ position: "absolute", right: 14, bottom: 58, pointerEvents: "none" }}>
              <Stamp text="LOVE WINS" tone="red" animate={!reduceMotion} rotate={-12} />
            </div>
          ) : null}
        </PaperCard>
        {stamped && !reduceMotion ? <HeartBurst glyphs={["💘", "🚨", "💖", "⭐", "🩷"]} /> : null}
      </div>

      {stamped ? (
        <>
          <p className="lv-pop" style={{ margin: "26px 0 0", textAlign: "center", fontFamily: ITALIC, fontSize: 26, lineHeight: 1.2, color: V.ink }}>
            case closed. <span style={{ color: V.a1 }}>forever pending.</span>
          </p>
          <NextStep gif={gif} gifCaption="court adjourned. hugs mandatory 🫂" next={next} delay={reduceMotion ? 0 : 700} />
        </>
      ) : null}
    </div>
  );
}
