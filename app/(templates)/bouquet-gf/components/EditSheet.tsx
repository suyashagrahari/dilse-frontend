"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Check, Shuffle, Leaf, Plus, Minus, Lock } from "lucide-react";

import FlowerTray from "./FlowerTray";
import BouquetArrangement from "./BouquetArrangement";
import { LIGHT, BRAND_GRADIENT } from "./theme";
import { GREENERY_COUNT, MAX_BLOOMS, MIN_BLOOMS, type BouquetMode } from "./assets";
import {
  type BouquetData,
  type EditMode,
  type StemCount,
  totalBlooms,
  isBouquetValid,
} from "./types";

const STEPS = ["Blooms", "Style", "Card", "Deed"];

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: BouquetData;
  updateMf: (key: keyof BouquetData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [step, setStep] = useState(0);
  const open = editMode === "manual" || editMode === "choose";
  const total = totalBlooms(mf.flowers);

  // ── flower handlers ──
  const addFlower = (id: number) => {
    if (total >= MAX_BLOOMS) return;
    const existing = mf.flowers.find((f) => f.id === id);
    const next: StemCount[] = existing
      ? mf.flowers.map((f) => (f.id === id ? { ...f, count: f.count + 1 } : f))
      : [...mf.flowers, { id, count: 1 }];
    updateMf("flowers", next);
  };
  const removeFlower = (id: number) => {
    const next = mf.flowers.map((f) => (f.id === id ? { ...f, count: f.count - 1 } : f)).filter((f) => f.count > 0);
    updateMf("flowers", next);
  };
  const reshuffle = () => updateMf("arrangementSeed", Math.floor(Math.random() * 1_000_000) + 1);
  const cycleGreenery = () => updateMf("greenery", (mf.greenery + 1) % GREENERY_COUNT);

  // ── deed handlers ──
  const setClause = (i: number, v: string) => updateMf("deedClauses", mf.deedClauses.map((c, idx) => (idx === i ? v : c)));
  const addClause = () => { if (mf.deedClauses.length < 6) updateMf("deedClauses", [...mf.deedClauses, ""]); };
  const removeClause = (i: number) => updateMf("deedClauses", mf.deedClauses.filter((_, idx) => idx !== i));

  const step0Valid = isBouquetValid(mf.flowers);
  const canAdvance = step === 0 ? step0Valid : true;
  const isLast = step === STEPS.length - 1;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14, outline: "none",
    background: LIGHT.surface, color: LIGHT.ink, border: `2px solid ${LIGHT.border}`,
  };
  const label = (t: string) => (
    <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: LIGHT.muted, letterSpacing: "0.02em" }}>{t}</label>
  );

  const modeBtn = (m: BouquetMode, txt: string) => (
    <button
      key={m}
      onClick={() => updateMf("mode", m)}
      className="flex-1 py-2.5 rounded-xl text-sm font-bold"
      style={{
        border: `2px solid ${LIGHT.ink}`,
        background: mf.mode === m ? BRAND_GRADIENT : LIGHT.surface,
        color: LIGHT.ink,
        boxShadow: mf.mode === m ? "3px 4px 0 rgba(139,111,212,0.28)" : "2px 3px 0 rgba(43,36,64,0.1)",
      }}
    >
      {txt}
    </button>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[200]" style={{ background: "rgba(43,36,64,0.45)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[201] mx-auto w-full max-w-[560px] rounded-t-[28px] flex flex-col"
            style={{ background: LIGHT.surfaceAlt, border: `2px solid ${LIGHT.ink}`, borderBottom: 0, maxHeight: "92dvh" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <span key={s} title={s} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 999, background: i <= step ? "#ff5f96" : LIGHT.border, transition: "all .2s", display: "inline-block" }} />
                ))}
              </div>
              <button onClick={() => setEditMode("preview")} aria-label="Close" style={{ color: LIGHT.muted }}><X size={20} /></button>
            </div>

            <div className="px-5 pb-3 overflow-y-auto" style={{ flex: 1 }}>
              <h2 className="bq-display" style={{ fontSize: 22, fontWeight: 800, color: LIGHT.ink, fontFamily: "var(--font-bq-display), sans-serif" }}>
                {step === 0 && "Pick your blooms 🌸"}
                {step === 1 && "Style your bouquet 🎀"}
                {step === 2 && "Write the card ✍️"}
                {step === 3 && "The Deed of Devotion 📜"}
              </h2>

              {/* STEP 0 — blooms */}
              {step === 0 && (
                <div className="mt-4">
                  <div className="flex gap-2 mb-3">{modeBtn("color", "🌈 Colour")}{modeBtn("mono", "✍️ Black & White")}</div>
                  <p className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: total > MAX_BLOOMS || total < MIN_BLOOMS ? "#ff5f96" : "#8b6fd4" }}>
                    Pick {MIN_BLOOMS} to {MAX_BLOOMS} blooms · {total}/{MAX_BLOOMS}
                  </p>
                  <FlowerTray mode={mf.mode} flowers={mf.flowers} onAdd={addFlower} onRemove={removeFlower} disableAdd={total >= MAX_BLOOMS} />
                </div>
              )}

              {/* STEP 1 — style */}
              {step === 1 && (
                <div className="mt-4">
                  <div className="rounded-2xl mb-4 overflow-hidden" style={{ background: LIGHT.surface, border: `2px solid ${LIGHT.border}`, padding: 10 }}>
                    <BouquetArrangement mode={mf.mode} flowers={mf.flowers} seed={mf.arrangementSeed} greenery={mf.greenery} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={reshuffle} className="py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2" style={{ border: `2px solid ${LIGHT.ink}`, background: LIGHT.surface, color: LIGHT.ink, boxShadow: "2px 3px 0 rgba(43,36,64,0.1)" }}>
                      <Shuffle size={15} /> New arrangement
                    </button>
                    <button onClick={cycleGreenery} className="py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2" style={{ border: `2px solid ${LIGHT.ink}`, background: LIGHT.surface, color: LIGHT.ink, boxShadow: "2px 3px 0 rgba(43,36,64,0.1)" }}>
                      <Leaf size={15} /> Change greenery
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 — card */}
              {step === 2 && (
                <div className="mt-4 space-y-4">
                  <div>
                    {label("Who's it for?")}
                    <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="Beloved" style={inputStyle} />
                  </div>
                  <div>
                    {label("Your message")}
                    <textarea value={mf.message} onChange={(e) => updateMf("message", e.target.value)} rows={5} placeholder="I saw these and thought of you…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                  <div>
                    {label("From (your name)")}
                    <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="Your name" style={inputStyle} />
                    {!mf.senderName.trim() && <p style={{ fontSize: 11, color: "#ff5f96", marginTop: 4 }}>Add your name so she knows who it&rsquo;s from 💐</p>}
                  </div>
                </div>
              )}

              {/* STEP 3 — deed */}
              {step === 3 && (
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => updateMf("deedEnabled", !mf.deedEnabled)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl"
                    style={{ border: `2px solid ${LIGHT.ink}`, background: LIGHT.surface }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: LIGHT.ink }}>Attach a Deed of Devotion 📜</span>
                    <span style={{ width: 44, height: 26, borderRadius: 999, background: mf.deedEnabled ? "#ff5f96" : LIGHT.border, position: "relative", transition: "background .2s", border: `2px solid ${LIGHT.ink}` }}>
                      <span style={{ position: "absolute", top: 1, left: mf.deedEnabled ? 20 : 1, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left .2s" }} />
                    </span>
                  </button>

                  {mf.deedEnabled && (
                    <div>
                      {label("Your loving clauses")}
                      <div className="space-y-2">
                        {mf.deedClauses.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="bq-display" style={{ flex: "0 0 auto", width: 22, height: 22, borderRadius: 7, display: "grid", placeItems: "center", background: "#ffe08a", border: `2px solid ${LIGHT.ink}`, fontSize: 11, fontWeight: 800 }}>{i + 1}</span>
                            <input value={c} onChange={(e) => setClause(i, e.target.value)} placeholder="a sweet promise…" style={{ ...inputStyle, padding: "9px 12px" }} />
                            <button onClick={() => removeClause(i)} aria-label="Remove clause" style={{ flex: "0 0 auto", color: LIGHT.muted }}><Minus size={16} /></button>
                          </div>
                        ))}
                      </div>
                      {mf.deedClauses.length < 6 && (
                        <button onClick={addClause} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "#8b6fd4" }}>
                          <Plus size={15} /> add a clause
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    {label("Lock with a password (optional)")}
                    <div className="relative">
                      <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="leave empty for no lock" style={{ ...inputStyle, paddingLeft: 38 }} />
                      <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: LIGHT.muted }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* footer nav */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderTop: `2px solid ${LIGHT.border}`, paddingBottom: "calc(16px + env(safe-area-inset-bottom,0px))" }}>
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-sm font-bold" style={{ border: `2px solid ${LIGHT.ink}`, background: LIGHT.surface, color: LIGHT.ink }}>
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <div className="flex-1" />
              {!isLast ? (
                <button
                  onClick={() => canAdvance && setStep((s) => s + 1)}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-bold disabled:opacity-50"
                  style={{ border: `2px solid ${LIGHT.ink}`, background: BRAND_GRADIENT, color: LIGHT.ink, boxShadow: canAdvance ? "3px 4px 0 rgba(43,36,64,0.16)" : "none" }}
                >
                  Next <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-bold disabled:opacity-50"
                  style={{ border: `2px solid ${LIGHT.ink}`, background: BRAND_GRADIENT, color: LIGHT.ink, boxShadow: "3px 4px 0 rgba(43,36,64,0.16)" }}
                >
                  <Check size={15} /> {saving ? "Saving…" : "Save & preview"}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
