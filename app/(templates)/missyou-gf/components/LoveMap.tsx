"use client";

import { useEffect, useRef, useState } from "react";
import { LOVEMAP_FIELDS, EMPTY_LOVEMAP, type LoveMapData } from "./types";
import { putLoveMap } from "./engagement";

// The recipient tells the sender their world. On the LIVE page each answer is saved
// to the DB (debounced) so it appears in the sender's History. On preview it's kept
// locally. It's a keepsake, not a form submission — nothing is ever lost on refresh.
export default function LoveMap({
  mode,
  shareId,
  initial,
}: {
  mode: "preview" | "live";
  shareId?: string;
  initial?: LoveMapData;
}) {
  const live = mode === "live" && !!shareId;
  const [values, setValues] = useState<LoveMapData>(initial ?? EMPTY_LOVEMAP);
  const [savedTick, setSavedTick] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (live) return;
    try {
      const raw = localStorage.getItem("missyou_loveMap");
      if (raw) setValues({ ...EMPTY_LOVEMAP, ...JSON.parse(raw) });
    } catch {}
  }, [live]);

  const update = (k: keyof LoveMapData, v: string) => {
    const next = { ...values, [k]: v };
    setValues(next);
    if (live && shareId) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        putLoveMap(shareId, { [k]: v }).then((ok) => {
          if (ok) { setSavedTick(true); setTimeout(() => setSavedTick(false), 1600); }
        });
      }, 800);
    } else {
      try { localStorage.setItem("missyou_loveMap", JSON.stringify(next)); } catch {}
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LOVEMAP_FIELDS.map((s) => (
          <div key={s.key} className="mu-paper p-5">
            <label className="mu-script text-2xl mu-rose-deep" htmlFor={`lovemap-${s.key}`}>{s.label}</label>
            <textarea
              id={`lovemap-${s.key}`}
              value={values[s.key] ?? ""}
              onChange={(e) => update(s.key, e.target.value)}
              placeholder={s.placeholder}
              rows={3}
              maxLength={600}
              className="mu-serif mt-2 w-full resize-none rounded-xl p-3 italic outline-none"
              style={{ background: "var(--mu-bg)", border: "1px solid var(--mu-paper-edge)", color: "var(--mu-ink)" }}
            />
          </div>
        ))}
      </div>
      {live && (
        <p className="mu-serif mt-4 text-center text-sm mu-muted" aria-live="polite">
          {savedTick ? "saved to their keepsake 🤍" : "your answers are saved for them automatically"}
        </p>
      )}
    </div>
  );
}
