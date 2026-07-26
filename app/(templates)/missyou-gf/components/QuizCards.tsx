"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { MissYouData } from "./types";
import { NIGHT, FONT_HEADING, FONT_BODY, FONT_SCRIPT } from "./theme";

function FlipCard({ q, a, memory }: { q: string; a: string; memory: string }) {
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const flip = () => setFlipped((f) => !f);
  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={flipped}
      aria-label={flipped ? `Answer: ${a}. ${memory}` : `Quiz: ${q}. Tap to reveal the answer.`}
      style={{ perspective: 1000, background: "transparent", border: "none", padding: 0, cursor: "pointer", width: "100%", minHeight: 150 }}
    >
      <div
        style={{
          position: "relative", width: "100%", height: 150,
          transition: reduce ? "opacity .2s" : "transform .5s cubic-bezier(.22,1,.36,1)",
          transformStyle: reduce ? undefined : "preserve-3d",
          transform: reduce ? undefined : `rotateY(${flipped ? 180 : 0}deg)`,
        }}
      >
        {/* front */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", opacity: reduce && flipped ? 0 : 1, background: NIGHT.base2, border: `1px solid ${NIGHT.hairline}`, borderRadius: 18, display: "grid", placeItems: "center", padding: 18 }}>
          <p style={{ fontFamily: FONT_SCRIPT, fontSize: 24, color: NIGHT.pinkLt, textAlign: "center", margin: 0 }}>{q}</p>
        </div>
        {/* back */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: reduce ? undefined : "rotateY(180deg)", opacity: reduce ? (flipped ? 1 : 0) : 1, background: NIGHT.raised, border: `1px solid ${NIGHT.hairline}`, borderRadius: 18, display: "grid", placeItems: "center", padding: 18, gap: 6 }}>
          <p style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 18, color: NIGHT.lime, textAlign: "center", margin: 0 }}>{a}</p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: NIGHT.mutedNight, textAlign: "center", margin: 0 }}>{memory}</p>
        </div>
      </div>
    </button>
  );
}

/** "Do you still remember us?" flip-quiz mini-game (part of the Memories section). */
export default function QuizCards({ data }: { data: MissYouData }) {
  if (!data.quiz.length) return null;
  return (
    <div style={{ maxWidth: 600, margin: "36px auto 0", width: "100%" }}>
      <h3 style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: NIGHT.onNight, textAlign: "center", margin: "0 0 16px" }}>Do you still remember us?</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
        {data.quiz.map((c, i) => (
          <FlipCard key={i} q={c.question} a={c.answer} memory={c.memory} />
        ))}
      </div>
    </div>
  );
}
