"use client";

// Placeholder full-screen reveal for the Searched template — its owner replaces
// this with the template's own themed letter. See LetterReveal.tsx for helpers.

import { Gate, Shell, Sign, usePhases, type VProps } from "../LetterReveal";

export default function SearchedReveal(P: VProps) {
  const ph = usePhases(!!P.question, [500], P.reduce, P.onRead);
  return (
    <Shell P={P} label={`A letter${P.from ? ` from ${P.from}` : ""}`}>
      {ph.p === -1 && <Gate cls="lrRcGate" question={P.question} yes={P.answer} onYes={ph.pass} />}
      {ph.p >= 0 && (
        <article style={{ padding: "72px 22px 40px", maxWidth: 620, margin: "0 auto", color: P.ink, background: P.paper, minHeight: "100%" }}>
          {P.greeting && <p>{P.greeting}</p>}
          {P.paras.map((t, i) => <p key={i}>{t}</p>)}
          <Sign sign={P.sign} from={P.from} />
        </article>
      )}
    </Shell>
  );
}
