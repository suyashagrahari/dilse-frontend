"use client";

// ─── Scene: the promise for later — a sealed vial on a moonlit river ────────
// Hold to drip the wax; the vial floats off with "Opens {date}" and a calendar
// reminder (.ics). On or after the date, the vial floats back and opens.

import { useEffect, useState } from "react";
import { useHoldProgress } from "../../../_valentine/kit";
import { downloadIcs } from "../../../_valentine/kit/premium";
import { prettyDate, todayIso, validDate } from "./art";
import type { SceneProps } from "./shared";

export default function Later({ data, x, color, sfx, sticker, next }: SceneProps) {
  const date = validDate(x.futureDate) ? x.futureDate : "";
  const due = !!date && todayIso() >= date;
  const [sealed, setSealed] = useState(false);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const bed = sfx("tp-water", { gain: 0.8 });
    return () => bed.stop(900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wax = useHoldProgress({
    duration: 1500,
    onComplete: () => {
      setSealed(true);
      sfx("tp-wax");
    },
  });
  const text = x.futurePromise || "";
  return (
    <section className="tp-sec">
      <header className="tp-head">
        <p className="tp-kick">A promise for later</p>
        <h2 className="tp-h">{due ? (opened ? "It's today." : "The vial came back") : sealed ? "Sealed. See you then." : "Seal it in wax"}</h2>
        <p className="tp-sub">
          {due ? (opened ? "" : "Tap it open.") : sealed ? (date ? `It opens on ${prettyDate(date)}.` : "") : "Press and hold the cork to drip the wax."}
        </p>
      </header>
      <div className={`tp-riverStage${sealed && !due ? " is-adrift" : ""}${due ? " is-back" : ""}`}>
        <div className="tp-waves" aria-hidden />
        <button
          type="button"
          className={`tp-vial${opened ? " is-open" : ""}`}
          {...(due ? { onClick: () => { setOpened(true); sfx("tp-ribbon"); sfx("chime-cascade", { at: 0.2 }); } } : wax.bind)}
          disabled={!due && sealed}
          aria-label={due ? "Open the vial" : "Press and hold to seal the vial"}
          style={{ ...(due ? {} : wax.bind.style), ["--wax" as string]: String(due ? 1 : sealed ? 1 : wax.progress), ["--tc" as string]: color }}
        >
          <span className="tp-vialGlass">
            <span className="tp-scroll" />
          </span>
          <span className="tp-cork" />
          <span className="tp-waxCap" />
        </button>
        {date && (sealed || due) && <span className="tp-chip">{due ? `Opened ${prettyDate(date)}` : `Opens ${prettyDate(date)}`}</span>}
        <span className="tp-vialStick">{sticker("pp5-vial", 56)}</span>
      </div>
      {(opened || (sealed && !due)) && (
        <div className={`tp-note${opened ? " is-open" : ""}`}>
          {opened ? <p>{text}</p> : <p className="tp-noteSealed">“{text.slice(0, 26)}{text.length > 26 ? "…" : ""}” — sealed</p>}
        </div>
      )}
      <div className="tp-actions">
        {sealed && !due && date && (
          <button
            type="button"
            className="tp-btn is-ghost"
            onClick={() =>
              downloadIcs({
                title: `Open the vial from ${data.senderName || "your red thread"} 🧵`,
                start: `${date}T09:00:00`,
                durationMin: 30,
                location: "The link they sent you",
              })
            }
          >
            Remind us 📅
          </button>
        )}
        {(sealed || opened || (!date && !due)) && (
          <button type="button" className="tp-btn" onClick={next}>
            The whole thread →
          </button>
        )}
        {!sealed && !due && (
          <button type="button" className="tp-link" onClick={() => { setSealed(true); sfx("tp-wax"); }}>
            Seal it for me
          </button>
        )}
      </div>
    </section>
  );
}
