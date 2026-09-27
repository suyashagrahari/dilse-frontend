"use client";

// The Create form, in steps: vibe → the parties → the demands → the facts →
// evidence (photos with little letters), GIFs and the off-the-record letter →
// the fine legal details (folded away) → password. The only thing worth reading
// twice is the 60-character cap on a demand: it is a tone guardrail, not a
// layout constraint, and the counter is deliberately loud.

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Plus, Trash2, Lock, Scale, Info } from "lucide-react";
import {
  type NoticeData,
  type EditMode,
  DEMAND_PRESETS,
  DEMAND_TEXT_MAX,
  MAX_DEMANDS,
  MAX_RECITALS,
  addDaysIso,
  newDemandId,
  sanitizeDemandText,
} from "./types";
import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import { LEGAL_THEMES } from "./themes";

const ACCENT = "#d0245f";
// 16px text: anything smaller makes iOS zoom the page on focus.
const INPUT = "w-full px-3.5 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-[16px]";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-[16px]";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: NoticeData;
  updateMf: (key: keyof NoticeData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <span>{label}</span>
        {hint && (
          <span className="inline-flex items-center gap-1 normal-case tracking-normal font-normal text-[11px] text-muted-foreground/80">
            <Info size={11} /> {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function EditSheetInner({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode === "manual";

  const setRecital = (i: number, v: string) =>
    updateMf("recitals", mf.recitals.map((r, idx) => (idx === i ? v : r)));
  const addRecital = () => {
    if (mf.recitals.length >= MAX_RECITALS) return;
    updateMf("recitals", [...mf.recitals, "That "]);
  };
  const removeRecital = (i: number) =>
    updateMf("recitals", mf.recitals.filter((_, idx) => idx !== i));

  const setDemand = (i: number, v: string) =>
    updateMf("demands", mf.demands.map((d, idx) => (idx === i ? { ...d, text: sanitizeDemandText(v) } : d)));
  const addDemand = (text = "") => {
    if (mf.demands.length >= MAX_DEMANDS) return;
    updateMf("demands", [
      ...mf.demands,
      { id: newDemandId(), text: sanitizeDemandText(text), response: "pending" as const, grounds: "", complied: false, compliedOn: "" },
    ]);
  };
  const removeDemand = (i: number) =>
    updateMf("demands", mf.demands.filter((_, idx) => idx !== i));

  /** Changing the date of the notice moves the seven-day period with it. */
  const setDatedOn = (v: string) => {
    updateMf("datedOn", v);
    if (v) updateMf("complianceDeadline", addDaysIso(v, 7));
  };

  const unusedPresets = DEMAND_PRESETS.filter((p) => !mf.demands.some((d) => d.text === p));

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div className="w-full max-w-2xl max-h-[86vh] lg:max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-8 pt-2 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Scale size={17} style={{ color: ACCENT }} /> Draft your love notice
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-1 text-muted-foreground" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                <ThemeSection themes={LEGAL_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />

                <FormSection emoji="👩‍⚖️" title="The parties" note="Who is serving whom. Both names are required.">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Your name *">
                      <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Ananya" className={INPUT} />
                    </Field>
                    <Field label="Your city">
                      <input value={mf.senderCity} onChange={(e) => updateMf("senderCity", e.target.value)} placeholder="Bengaluru" className={INPUT} />
                    </Field>
                    <Field label="Their name *">
                      <input value={mf.addresseeName} onChange={(e) => updateMf("addresseeName", e.target.value)} placeholder="e.g. Rohan" className={INPUT} />
                    </Field>
                    <Field label="Their city">
                      <input value={mf.addresseeCity} onChange={(e) => updateMf("addresseeCity", e.target.value)} placeholder="Bengaluru" className={INPUT} />
                    </Field>
                  </div>


                </FormSection>

                <FormSection emoji="✍️" title="Your demands" note="They'll accept or object to each one — live, on the page.">
                  {/* Demands */}
                  <div>
                    <Field label={`Demands (${mf.demands.length}/${MAX_DEMANDS})`} hint={`${DEMAND_TEXT_MAX} characters each`}>
                      <div className="space-y-2">
                        {mf.demands.map((d, i) => {
                          const left = DEMAND_TEXT_MAX - d.text.length;
                          return (
                            <div key={d.id} className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <input
                                  value={d.text}
                                  maxLength={DEMAND_TEXT_MAX}
                                  onChange={(e) => setDemand(i, e.target.value)}
                                  placeholder="return of hoodie (grey, mine, since March)"
                                  className={INPUT_SM}
                                />
                                <div className={`text-[10px] mt-0.5 text-right ${left <= 8 ? "text-amber-600 font-semibold" : "text-muted-foreground"}`}>
                                  {left} left
                                </div>
                              </div>
                              <button onClick={() => removeDemand(i)} className="text-muted-foreground shrink-0" aria-label={`Remove demand ${i + 1}`}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </Field>

                    {mf.demands.length < MAX_DEMANDS && (
                      <>
                        <button onClick={() => addDemand()} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT }}>
                          <Plus size={13} /> Add demand
                        </button>
                        {unusedPresets.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {unusedPresets.slice(0, 6).map((p) => (
                              <button
                                key={p}
                                onClick={() => addDemand(p)}
                                className="text-[11px] px-2.5 py-1.5 rounded-full border border-border/70 bg-muted/40 text-left"
                              >
                                + {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/*
                      The cap is the point. A complaint format attracts real
                      grievances, and 60 characters is what keeps every demand petty
                      and affectionate instead of a paragraph of pain.
                    */}
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      Keep them petty and keep them fond. This notice has no legal effect and is not a
                      substitute for a conversation — if something real is wrong, say it out loud instead.
                    </p>
                  </div>


                </FormSection>

                <FormSection emoji="📜" title="The facts of the case" note="The petty, undeniable history. Shown in “The facts” tile.">
                  <Field label="Together since">
                    <input type="date" value={mf.relationshipSince} onChange={(e) => updateMf("relationshipSince", e.target.value)} className={INPUT_SM} />
                  </Field>
                  {/* Recitals */}
                  <div>
                    <Field label={`Recitals (${mf.recitals.length}/${MAX_RECITALS})`} hint="every one starts with “That”">
                      <div className="space-y-2">
                        {mf.recitals.map((r, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="pt-2.5 text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                            <textarea
                              value={r}
                              onChange={(e) => setRecital(i, e.target.value)}
                              rows={2}
                              placeholder="That you have, on 27 occasions, said “whatever you want”."
                              className={INPUT_SM + " resize-none"}
                            />
                            <button onClick={() => removeRecital(i)} className="pt-2.5 text-muted-foreground shrink-0" aria-label={`Remove recital ${i + 1}`}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </Field>
                    {mf.recitals.length < MAX_RECITALS && (
                      <button onClick={addRecital} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT }}>
                        <Plus size={13} /> Add recital
                      </button>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Numerals are bracketed automatically — type “27 occasions”, the notice prints
                      “27 (twenty-seven) occasions”.
                    </p>
                  </div>


                </FormSection>

                <MemoriesSections
                  data={mf}
                  update={(k, v) => updateMf(k, v)}
                  gifTags={["legal", "funny", "sorry"]}
                  copy={{
                    photosTitle: "Exhibits (your photos + little letters)",
                    photosNote: "Up to 8 — shown as Exhibit A, B, C… Tap a photo to zoom & reposition, then write the note that opens with it.",
                    captionHint: "Exhibit A: the first sunset",
                    noteHint: "Evidence that you once planned a date. The court remembers.",
                    gifsTitle: "Courtroom GIFs",
                    letterTitle: "Off-the-record letter",
                    letterNote: "The real message under all the legalese. It opens from a sealed envelope.",
                    letterHint: "Off the record — none of these demands are actually why I'm sending this…",
                    lockQuestion: "Rohan, do you accept these terms and conditions? ⚖️",
                    lockAnswer: "I accept, counsel 💖",
                  }}
                />

                <details className="rounded-2xl border border-border/60 p-3.5 bg-muted/20">
                  <summary className="cursor-pointer text-sm font-semibold select-none">⚖️ The fine legal details (advocate, ref no., dates, escalation)</summary>
                  <div className="mt-3 space-y-4">
                    {/* Advocate */}
                    <Field label="Your advocate" hint="Entirely fictional. Have fun.">
                      <input value={mf.advocateName} onChange={(e) => updateMf("advocateName", e.target.value)} placeholder="R. K. Sharma" className={INPUT} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Chamber">
                        <input value={mf.advocateChamber} onChange={(e) => updateMf("advocateChamber", e.target.value)} className={INPUT_SM} />
                      </Field>
                      <Field label="Enrolment no.">
                        <input value={mf.advocateEnrollment} onChange={(e) => updateMf("advocateEnrollment", e.target.value)} className={INPUT_SM} />
                      </Field>
                    </div>


                    {/* Document meta */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Ref. no.">
                        <input value={mf.refNo} onChange={(e) => updateMf("refNo", e.target.value)} className={INPUT_SM} />
                      </Field>
                      <Field label="Dated" hint="sets the 7-day clock">
                        <input type="date" value={mf.datedOn} onChange={(e) => setDatedOn(e.target.value)} className={INPUT_SM} />
                      </Field>
                    </div>


                    <Field label="Escalation clause" hint="what happens if they don’t comply">
                      <textarea
                        value={mf.escalationClause}
                        onChange={(e) => updateMf("escalationClause", e.target.value)}
                        rows={3}
                        className={INPUT + " resize-none"}
                      />
                    </Field>


                  </div>
                </details>

                <Field label="Password (optional)" hint="only they can open it">
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={pagePassword}
                      onChange={(e) => setPagePassword(e.target.value)}
                      placeholder="Leave blank for no password"
                      className={INPUT + " pl-9"}
                    />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(115deg,#ff3b5c 0%,#ff7a5c 50%,#ffb03c 100%)" }}
                >
                  <span className="inline-flex items-center gap-2">
                    <PenLine size={15} /> Save &amp; preview the notice ⚖️
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(EditSheetInner);
