"use client";

// ─── Challan — the edit sheet ────────────────────────────────────────────────
//
// The document is a joke about bureaucracy. THE FORM MUST NOT BE. It reads as
// six friendly steps with a chip rail on top (tap to jump, a tick when a step
// is done), every field has a working default or a one-tap suggestion, and
// Save tells you exactly what is still missing and takes you there.
//
// ── THE ONE FIELD THAT NEEDS CARE ────────────────────────────────────────────
// `totalFine` is a TEXT input and its placeholder is "one date". It must never
// become a number input, and it must never be auto-summed from the offence
// rows: the whole payoff of the notice is a TOTAL line that reads "one date".

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronDown, Lock, Plus, Siren, Trash2, X } from "lucide-react";

import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import { challanMissing, type EditMode, type MissingField } from "./demo";
import { CHALLAN_THEMES } from "./themes";
import type { ChallanData, ChallanOffence, ChallanSettlementMethod } from "./types";

const ACCENT = "#e11d48";
const INPUT = "w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border/60 focus:outline-none focus:ring-2 focus:ring-rose-400/50";
const INPUT_ERR = "w-full px-3.5 py-2.5 rounded-xl bg-rose-50 border-2 border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50";
const TXT: React.CSSProperties = { fontSize: 16 };

const MAX_OFFENCES = 6;
const MAX_METHODS = 5;
const MAX_LINES = 4;

const OFFENCE_IDEAS = ["Overspeeding into my life", "Stealing my hoodie (and my heart)", "Illegal parking in my head", "Driving me crazy", "Being too cute in a no-cute zone"];
const FINE_IDEAS = ["one date", "a tight hug", "chai, twice", "lifetime of cuddles", "one forehead kiss"];

type SectionId = "vibe" | "accused" | "offences" | "fine" | "messages" | "evidence";

function Field({ label, hint, count, children, error }: { label: string; hint?: string; count?: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
        {count && <span className="text-[10.5px] text-muted-foreground tabular-nums">{count}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-[12px] font-semibold mt-1.5 flex items-center gap-1" style={{ color: ACCENT }}>
          <AlertCircle size={12} /> {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

function Chips({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <button key={it} type="button" onClick={() => onPick(it)} className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold border border-border/70 bg-background hover:bg-muted/60 transition-colors">
          + {it}
        </button>
      ))}
    </div>
  );
}

function LineEditor({ items, onChange, placeholder, label }: { items: string[]; onChange: (next: string[]) => void; placeholder: string; label: string }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea
            value={it}
            maxLength={600}
            rows={2}
            placeholder={placeholder}
            aria-label={`${label}, line ${i + 1}`}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className={INPUT + " resize-y leading-relaxed"}
            style={{ ...TXT, minHeight: 64 }}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove line ${i + 1}`} className="w-10 h-10 shrink-0 rounded-xl border border-border/60 grid place-items-center text-muted-foreground">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {items.length < MAX_LINES && (
        <button type="button" onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
          <Plus size={14} /> Add a line
        </button>
      )}
    </div>
  );
}

// ISO ⇄ <input type="datetime-local"> in the sender's own timezone.
function isoToLocal(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function localToIso(v: string): string {
  const t = Date.parse(v);
  return Number.isNaN(t) ? "" : new Date(t).toISOString();
}

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
  mf: ChallanData;
  /** The house signature: one key, one value. Not a patch object. */
  updateMf: (key: keyof ChallanData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = editMode === "manual";
  const scroller = useRef<HTMLDivElement | null>(null);
  const [tried, setTried] = useState(false);

  const missing = challanMissing(mf);
  const miss = (s: MissingField["section"]) => (tried ? missing.find((m) => m.section === s) : undefined);

  const steps: { id: SectionId; emoji: string; label: string; done: boolean }[] = [
    { id: "vibe", emoji: "🎨", label: "Vibe", done: true },
    { id: "accused", emoji: "🚨", label: "Accused", done: !!mf.accused.name.trim() },
    { id: "offences", emoji: "📋", label: "Offences", done: mf.offences.some((o) => o.description.trim()) },
    { id: "fine", emoji: "💸", label: "Fine", done: !!mf.totalFine.trim() },
    { id: "messages", emoji: "💬", label: "After", done: mf.paidMessage.some((l) => l.trim()) || mf.contestMessage.some((l) => l.trim()) },
    { id: "evidence", emoji: "📹", label: "Evidence + letter", done: mf.photos.length > 0 && !!mf.letter.trim() },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  const jump = (id: SectionId) => {
    const el = scroller.current?.querySelector<HTMLElement>(`[data-sec="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const patchOffence = (i: number, patch: Partial<ChallanOffence>) => updateMf("offences", mf.offences.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const addOffence = (description = "") =>
    updateMf("offences", [...mf.offences, { section: `Sec ${mf.offences.length + 7}(${"abcdef"[mf.offences.length % 6]}), Heart Traffic Act`, description, fine: 500, note: "" }]);
  const patchMethod = (i: number, patch: Partial<ChallanSettlementMethod>) =>
    updateMf("settlement", { methods: mf.settlement.methods.map((m, j) => (j === i ? { ...m, ...patch } : m)) });

  const save = () => {
    if (missing.length) {
      setTried(true);
      jump(missing[0].section);
      return;
    }
    onSave();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode(null)} className="fixed inset-0 z-[260] bg-black/55" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[261] lg:inset-0 lg:flex lg:items-center lg:justify-center lg:pointer-events-none"
          >
            <div
              ref={scroller}
              className="w-full max-w-2xl max-h-[88dvh] lg:max-h-[92dvh] overflow-y-auto overflow-x-hidden bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto lg:pointer-events-auto"
            >
              {/* ── Sticky head: title, progress, step rail ─────────────────── */}
              <div className="sticky top-0 z-20 bg-background/95 border-b border-border/50" style={{ backdropFilter: "blur(8px)" }}>
                <div className="flex justify-center pt-2.5">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>
                <div className="px-5 pt-2 flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-extrabold flex items-center gap-2 tracking-tight">
                    <Siren size={18} style={{ color: ACCENT }} /> Write the challan
                  </h3>
                  <button type="button" onClick={() => setEditMode(null)} className="w-9 h-9 grid place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Close">
                    <X size={19} />
                  </button>
                </div>
                <div className="px-5 pt-2 flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(doneCount / steps.length) * 100}%`, background: "linear-gradient(90deg,#e11d48,#8b5cf6,#2563eb)" }} />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                    {doneCount}/{steps.length} done
                  </span>
                </div>
                <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {steps.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => jump(s.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors"
                      style={s.done ? { borderColor: "#fecdd3", background: "#fff1f2", color: "#9f1239" } : { borderColor: "var(--border)" }}
                    >
                      <span aria-hidden>{s.emoji}</span> {s.label}
                      {s.done && <Check size={12} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 pb-4 pt-3 space-y-7">
                <p className="text-[13px] text-muted-foreground leading-relaxed -mb-2">
                  Everything already has a cute default — change what you like. Only the <b>name</b>, <b>one offence</b> and <b>the fine</b> are required.
                </p>

                {/* 1 ── vibe */}
                <div data-sec="vibe" className="scroll-mt-40">
                  <ThemeSection themes={CHALLAN_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />
                </div>

                {/* 2 ── the accused */}
                <div data-sec="accused" className="scroll-mt-40 space-y-3.5">
                  <FormSection emoji="🚨" title="The accused" note="Who's getting the challan? Their name goes on the notice and the court order." />
                  <Field label="Their name *" count={`${mf.accused.name.length}/60`} error={miss("accused") ? "Who's it for? Add their name." : undefined}>
                    <input
                      value={mf.accused.name}
                      maxLength={60}
                      onChange={(e) => updateMf("accused", { ...mf.accused, name: e.target.value })}
                      placeholder="e.g. Meera Sharma"
                      className={miss("accused") ? INPUT_ERR : INPUT}
                      style={TXT}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Their number plate" hint="A joke plate, never a real one.">
                      <input
                        value={mf.accused.vehicleNo}
                        maxLength={20}
                        onChange={(e) => updateMf("accused", { ...mf.accused, vehicleNo: e.target.value.toUpperCase() })}
                        placeholder="KA 01 LUV 2023"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-900 bg-yellow-200 font-mono font-bold tracking-widest text-neutral-900 focus:outline-none"
                        style={TXT}
                      />
                    </Field>
                    <Field label="Scene of the crime">
                      <input value={mf.location} maxLength={120} onChange={(e) => updateMf("location", e.target.value)} placeholder="Near her house, 11:40 PM" className={INPUT} style={TXT} />
                    </Field>
                  </div>
                  <Field label="Their address (optional)" hint="Printed small under the name. Keep it a joke: 'The One With The Balcony'.">
                    <input value={mf.accused.address} maxLength={200} onChange={(e) => updateMf("accused", { ...mf.accused, address: e.target.value })} placeholder="3rd Floor, The One With The Balcony" className={INPUT} style={TXT} />
                  </Field>
                </div>

                {/* 3 ── offences */}
                <div data-sec="offences" className="scroll-mt-40 space-y-3">
                  <FormSection emoji="📋" title="The offences" note="What did they actually do? The funnier and more specific, the better." />
                  {miss("offences") && (
                    <p className="text-[12px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                      <AlertCircle size={12} /> Add at least one offence.
                    </p>
                  )}
                  {mf.offences.map((o, i) => (
                    <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: ACCENT }}>
                          offence {i + 1}
                        </span>
                        <button type="button" onClick={() => updateMf("offences", mf.offences.filter((_, j) => j !== i))} className="text-[12px] font-semibold text-muted-foreground inline-flex items-center gap-1" aria-label={`Remove offence ${i + 1}`}>
                          <Trash2 size={12} /> remove
                        </button>
                      </div>
                      <input value={o.description} maxLength={120} onChange={(e) => patchOffence(i, { description: e.target.value })} placeholder="Overspeeding" aria-label={`Offence ${i + 1}`} className={INPUT + " font-semibold"} style={TXT} />
                      <input value={o.note ?? ""} maxLength={160} onChange={(e) => patchOffence(i, { note: e.target.value })} placeholder="the aside — e.g. into my life, without warning" aria-label={`Aside for offence ${i + 1}`} className={INPUT + " italic"} style={TXT} />
                      <div className="grid grid-cols-[110px_1fr] gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={Number.isFinite(o.fine) ? o.fine : 0}
                            onChange={(e) => patchOffence(i, { fine: Math.max(0, Number(e.target.value) || 0) })}
                            aria-label={`Fine for offence ${i + 1}`}
                            className={INPUT + " pl-7 tabular-nums"}
                            style={TXT}
                          />
                        </div>
                        <input value={o.section} maxLength={60} onChange={(e) => patchOffence(i, { section: e.target.value })} placeholder="Sec 12(b), Heart Traffic Act" aria-label={`Section for offence ${i + 1}`} className={INPUT + " font-mono text-[13px]"} style={TXT} />
                      </div>
                    </div>
                  ))}
                  {mf.offences.length < MAX_OFFENCES && (
                    <div className="space-y-2">
                      <Chips items={OFFENCE_IDEAS.filter((x) => !mf.offences.some((o) => o.description === x))} onPick={(v) => addOffence(v)} />
                      <button type="button" onClick={() => addOffence()} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                        <Plus size={14} /> Add a blank offence
                      </button>
                    </div>
                  )}
                </div>

                {/* 4 ── fine */}
                <div data-sec="fine" className="scroll-mt-40 space-y-3">
                  <FormSection emoji="💸" title="The fine & how to pay it" note="Not money. This is the punchline of the whole notice." />
                  {/* TEXT. Never a number input, never summed. See the header. */}
                  <Field label="Total fine *" count={`${mf.totalFine.length}/60`} error={miss("fine") ? "What's the total? e.g. one date" : undefined}>
                    <input value={mf.totalFine} maxLength={60} onChange={(e) => updateMf("totalFine", e.target.value)} placeholder="one date" className={(miss("fine") ? INPUT_ERR : INPUT) + " font-bold"} style={TXT} />
                  </Field>
                  <Chips items={FINE_IDEAS.filter((x) => x !== mf.totalFine)} onPick={(v) => updateMf("totalFine", v)} />
                  <Field label="Ways to pay" hint="The options on the payment screen. The small print is the joke.">
                    <div className="space-y-2">
                      {mf.settlement.methods.map((m, i) => (
                        <div key={m.id || i} className="flex gap-2 items-start">
                          <div className="flex-1 min-w-0 grid gap-1.5">
                            <input value={m.label} maxLength={60} onChange={(e) => patchMethod(i, { label: e.target.value })} placeholder="chai, twice" aria-label={`Payment option ${i + 1}`} className={INPUT + " font-semibold"} style={TXT} />
                            <input value={m.sub ?? ""} maxLength={80} onChange={(e) => patchMethod(i, { sub: e.target.value })} placeholder="the good one near your office" aria-label={`Small print for option ${i + 1}`} className={INPUT + " text-[13px]"} style={TXT} />
                          </div>
                          <button type="button" onClick={() => updateMf("settlement", { methods: mf.settlement.methods.filter((_, j) => j !== i) })} aria-label={`Remove option ${i + 1}`} className="w-10 h-10 shrink-0 rounded-xl border border-border/60 grid place-items-center text-muted-foreground">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {mf.settlement.methods.length < MAX_METHODS && (
                        <button
                          type="button"
                          onClick={() => updateMf("settlement", { methods: [...mf.settlement.methods, { id: `m${Date.now().toString(36)}`, label: "", sub: "" }] })}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: ACCENT }}
                        >
                          <Plus size={14} /> Add a way to pay
                        </button>
                      )}
                    </div>
                  </Field>
                </div>

                {/* 5 ── the two endings */}
                <div data-sec="messages" className="scroll-mt-40 space-y-3.5">
                  <FormSection emoji="💬" title="What they read after settling" note="Drop the police voice here. One ending if they pay, one if they fight it (they always win)." />
                  <Field label="If they pay 💸">
                    <LineEditor label="If they pay" items={mf.paidMessage} onChange={(v) => updateMf("paidMessage", v)} placeholder="There is no fine, obviously." />
                  </Field>
                  <Field label="If they contest ⚖️">
                    <LineEditor label="If they contest" items={mf.contestMessage} onChange={(v) => updateMf("contestMessage", v)} placeholder="Objection upheld, obviously." />
                  </Field>
                </div>

                {/* 6 ── CCTV evidence, GIFs, the court order */}
                <div data-sec="evidence" className="scroll-mt-40 space-y-7">
                  <MemoriesSections
                    data={mf}
                    update={(k, v) => updateMf(k, v)}
                    gifTags={["legal", "funny", "love"]}
                    copy={{
                      photosTitle: "CCTV evidence 📹",
                      photosNote: "Up to 10 photos — they become camera footage from 'the scene'. Tap one to crop & zoom, give it a location tag, and write the officer's observation.",
                      captionHint: "location tag — e.g. Her balcony, 11:40 PM",
                      noteHint: "Officer's observation: suspect stole my fries, then my heart…",
                      gifsTitle: "Reaction GIFs (up to 3 — one per big moment)",
                      letterTitle: "The court order — your main letter",
                      letterNote: "Read out at the very end as the officer's personal remarks, then the LOVE WINS stamp slams down.",
                      letterHint: "Having reviewed all the footage, this officer has one remark for the record…",
                      lockQuestion: "Do you accept the verdict of the Heart Traffic Court?",
                      lockAnswer: "I accept, your honour 💘",
                    }}
                  />
                </div>

                {/* 7 ── paperwork */}
                <details className="group rounded-2xl border border-border/60 bg-muted/20">
                  <summary className="cursor-pointer select-none list-none px-4 py-3.5 flex items-center justify-between text-sm font-bold">
                    <span>🗂️ The paperwork (optional)</span>
                    <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Challan number">
                        <input value={mf.challanNo} maxLength={32} onChange={(e) => updateMf("challanNo", e.target.value)} className={INPUT + " font-mono"} style={TXT} />
                      </Field>
                      <Field label="Pay-by date" hint="Drives the live countdown. In the past = OVERDUE (also funny).">
                        <input type="datetime-local" value={isoToLocal(mf.dueAt)} onChange={(e) => updateMf("dueAt", localToIso(e.target.value) || mf.dueAt)} className={INPUT} style={TXT} />
                      </Field>
                      <Field label="Officer (that's you)">
                        <input value={mf.officer.name} maxLength={60} onChange={(e) => updateMf("officer", { ...mf.officer, name: e.target.value })} placeholder="K. Sharma" className={INPUT} style={TXT} />
                      </Field>
                      <Field label="Badge no.">
                        <input value={mf.officer.id} maxLength={8} onChange={(e) => updateMf("officer", { ...mf.officer, id: e.target.value })} placeholder="4402" className={INPUT + " font-mono"} style={TXT} />
                      </Field>
                      <Field label="Plate in the camera photo">
                        <input value={mf.evidence.plateText} maxLength={20} onChange={(e) => updateMf("evidence", { ...mf.evidence, plateText: e.target.value.toUpperCase() })} className={INPUT + " font-mono"} style={TXT} />
                      </Field>
                      <Field label="Camera timestamp">
                        <input value={mf.evidence.timestamp} maxLength={24} onChange={(e) => updateMf("evidence", { ...mf.evidence, timestamp: e.target.value })} className={INPUT + " font-mono"} style={TXT} />
                      </Field>
                    </div>
                  </div>
                </details>

                <Field label="Password (optional)" hint="If set, the shared link asks for this before the portal opens.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT + " pl-9"} style={TXT} />
                  </div>
                </Field>
              </div>

              {/* ── Sticky footer: what's missing + Save ─────────────────────── */}
              <div className="sticky bottom-0 z-20 bg-background/95 border-t border-border/50 px-5 pt-3" style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))", backdropFilter: "blur(8px)" }}>
                {tried && missing.length > 0 && (
                  <p className="text-[12.5px] font-semibold mb-2 flex items-start gap-1.5" style={{ color: ACCENT }}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" /> Still missing: {missing.map((m) => m.label).join(", ")}
                  </p>
                )}
                {!missing.length && (mf.photos.length === 0 || !mf.letter.trim()) && (
                  <p className="text-[12px] text-muted-foreground mb-2">
                    💡 {mf.photos.length === 0 ? "Add a few photos — they become the CCTV footage." : "Write the court order — it's the big reveal at the end."}
                  </p>
                )}
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="w-full min-h-[52px] rounded-2xl text-white font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[.99] transition-transform"
                  style={{ background: "linear-gradient(115deg,#e11d48 0%,#8b5cf6 55%,#2563eb 100%)", boxShadow: "0 14px 30px -14px rgba(225,29,72,.8)" }}
                >
                  {saving ? "Saving…" : "Save & serve the challan 🚨"}
                </button>
                <p className="text-center text-[11px] text-muted-foreground mt-2">You&apos;ll see exactly what they see, then publish to get the link.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
