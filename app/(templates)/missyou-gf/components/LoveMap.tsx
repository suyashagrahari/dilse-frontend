"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LOVEMAP_FIELDS, EMPTY_LOVEMAP, type LoveMapData } from "./types";
import { putLoveMap } from "./engagement";

const hasAny = (v: LoveMapData) => Object.values(v).some((x) => (x || "").trim());

// The recipient tells the sender their world, then taps Save. On the LIVE page the
// answers persist to the DB (→ the sender's History); on preview they're kept
// locally. After saving, the answers are shown back below as a little keepsake.
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
  const [saved, setSaved] = useState<LoveMapData>(initial ?? EMPTY_LOVEMAP);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (live) return;
    try {
      const raw = localStorage.getItem("missyou_loveMap");
      if (raw) { const v = { ...EMPTY_LOVEMAP, ...JSON.parse(raw) }; setValues(v); setSaved(v); }
    } catch {}
  }, [live]);

  const update = (k: keyof LoveMapData, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (saving || !hasAny(values)) return;
    setSaving(true);
    try {
      if (live && shareId) await putLoveMap(shareId, { ...values });
      else { try { localStorage.setItem("missyou_loveMap", JSON.stringify(values)); } catch {} }
      setSaved(values);
    } finally {
      setSaving(false);
    }
  };

  const dirty = useMemo(
    () => LOVEMAP_FIELDS.some((f) => (values[f.key] || "") !== (saved[f.key] || "")),
    [values, saved],
  );
  const showSaved = hasAny(saved);
  const savedFields = LOVEMAP_FIELDS.filter((f) => (saved[f.key] || "").trim());

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

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={save}
          disabled={saving || !hasAny(values) || (!dirty && showSaved)}
          className="mu-btn mu-serif px-9 py-3.5 text-lg disabled:opacity-60"
          style={{ fontStyle: "italic" }}
        >
          {saving ? "saving…" : !dirty && showSaved ? "saved 🤍" : "save my answers ♥"}
        </button>
        <p className="mu-serif text-sm" style={{ color: "#8a7568" }}>
          {live ? "i'll keep every word — promise." : "preview mode · it saves for real once you share it"}
        </p>
      </div>

      {/* saved keepsake — shown back to the recipient */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            className="mu-paper mt-8 p-6 sm:p-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="mu-eyebrow mb-4"><span className="mu-rose-deep">♥</span> what you told me</span>
            <div className="mt-4 space-y-4">
              {savedFields.map((f) => (
                <div key={f.key}>
                  <p className="mu-script text-xl mu-rose-deep">{f.label}</p>
                  <p className="mu-serif mt-1 text-lg leading-relaxed" style={{ color: "var(--mu-ink)" }}>{saved[f.key]}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
