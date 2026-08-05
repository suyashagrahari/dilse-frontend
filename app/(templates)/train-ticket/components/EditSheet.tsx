"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Eye, Trash2, Plus, Lock, Loader2, TrainFront } from "lucide-react";
import type { EditMode, FareLine, Gender, Passenger, Station, TicketData } from "./types";

const INK = "#2b2b2b";
const INPUT = "w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm";
const INPUT_SM = "w-full px-2.5 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm";

const MAX_PASSENGERS = 4;

// ─── IST ⇄ <input type="datetime-local"> ─────────────────────────────────────
// The slip prints every time in Asia/Kolkata, so the editor has to collect them
// in Asia/Kolkata too — otherwise a sender in another timezone types 23:11 and
// the ticket prints something else. IST has no DST, so a fixed +05:30 is exact.

function isoToLocalInput(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(t));
  const g = (k: string) => parts.find((p) => p.type === k)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

function localInputToIso(v: string): string {
  if (!v) return "";
  const t = Date.parse(`${v}:00+05:30`);
  return Number.isNaN(t) ? "" : new Date(t).toISOString();
}

const GENDERS: Gender[] = ["M", "F", "X"];
const STATUSES: Station["status"][] = ["passed", "current", "upcoming"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: TicketData;
  updateMf: (key: keyof TicketData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode !== null && editMode !== "preview";

  const patchPassenger = (i: number, patch: Partial<Passenger>) =>
    updateMf("passengers", mf.passengers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addPassenger = () =>
    updateMf("passengers", [
      ...mf.passengers,
      { name: "", age: 25, gender: "X" as Gender, bookingStatus: "WL 12", currentStatus: "CNF", coach: "S4", seat: "", berth: "SIDE LOWER" },
    ]);
  const removePassenger = (i: number) => updateMf("passengers", mf.passengers.filter((_, idx) => idx !== i));

  const patchFare = (i: number, patch: Partial<FareLine>) =>
    updateMf("fare", mf.fare.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addFare = () => updateMf("fare", [...mf.fare, { label: "", value: "" }]);
  const removeFare = (i: number) => updateMf("fare", mf.fare.filter((_, idx) => idx !== i));

  const patchStation = (i: number, patch: Partial<Station>) =>
    updateMf("stations", mf.stations.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addStation = () =>
    updateMf("stations", [...mf.stations, { name: "", label: "", at: "", detail: "", status: "upcoming" as Station["status"] }]);
  const removeStation = (i: number) => updateMf("stations", mf.stations.filter((_, idx) => idx !== i));

  const patchFine = (i: number, v: string) => updateMf("finePrint", mf.finePrint.map((l, idx) => (idx === i ? v : l)));
  const addFine = () => updateMf("finePrint", [...mf.finePrint, ""]);
  const removeFine = (i: number) => updateMf("finePrint", mf.finePrint.filter((_, idx) => idx !== i));

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
            <div className="w-full max-w-2xl max-h-[82vh] lg:max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-8 pt-2 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <PenLine size={16} style={{ color: INK }} /> Book your ticket
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-1 text-muted-foreground"><X size={20} /></button>
                </div>

                {/* ── reservation ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="PNR *" hint="Make it mean something — an anniversary reads as a real 10-digit PNR.">
                    <input value={mf.pnr} onChange={(e) => updateMf("pnr", e.target.value)} placeholder="4402 8891" className={INPUT} />
                  </Field>
                  <Field label="Train no.">
                    <input value={mf.trainNo} onChange={(e) => updateMf("trainNo", e.target.value)} placeholder="20232" className={INPUT} />
                  </Field>
                </div>

                <Field label="Train name">
                  <input value={mf.trainName} onChange={(e) => updateMf("trainName", e.target.value)} placeholder="US EXPRESS" className={INPUT} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="From (code)">
                    <input value={mf.from.code} onChange={(e) => updateMf("from", { ...mf.from, code: e.target.value.toUpperCase() })} placeholder="BLR" className={INPUT} maxLength={6} />
                  </Field>
                  <Field label="From (station)">
                    <input value={mf.from.name} onChange={(e) => updateMf("from", { ...mf.from, name: e.target.value })} placeholder="Bengaluru" className={INPUT} />
                  </Field>
                  <Field label="To (code)">
                    <input value={mf.to.code} onChange={(e) => updateMf("to", { ...mf.to, code: e.target.value.toUpperCase() })} placeholder="TRC" className={INPUT} maxLength={6} />
                  </Field>
                  <Field label="To (station)">
                    <input value={mf.to.name} onChange={(e) => updateMf("to", { ...mf.to, name: e.target.value })} placeholder="Your Terrace" className={INPUT} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Departure (IST)" hint="The day you actually next meet. This drives the countdown.">
                    <input type="datetime-local" value={isoToLocalInput(mf.departureAt)} onChange={(e) => updateMf("departureAt", localInputToIso(e.target.value))} className={INPUT} />
                  </Field>
                  <Field label="Arrival (IST)">
                    <input type="datetime-local" value={isoToLocalInput(mf.arrivalAt)} onChange={(e) => updateMf("arrivalAt", localInputToIso(e.target.value))} className={INPUT} />
                  </Field>
                </div>

                <Field
                  label="Chart prepared at (IST)"
                  hint="THE GATE. Until this moment the status page says CHART NOT PREPARED and the server refuses to send the names or seats at all. Leave it blank and the reveal is available immediately."
                >
                  <input type="datetime-local" value={isoToLocalInput(mf.chartPreparedAt)} onChange={(e) => updateMf("chartPreparedAt", localInputToIso(e.target.value))} className={INPUT} />
                  <button type="button" onClick={() => updateMf("chartPreparedAt", "")} className="text-xs font-semibold mt-2" style={{ color: INK }}>
                    Clear — reveal immediately
                  </button>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Class"><input value={mf.classCode} onChange={(e) => updateMf("classCode", e.target.value)} placeholder="3A" className={INPUT} /></Field>
                  <Field label="Quota"><input value={mf.quota} onChange={(e) => updateMf("quota", e.target.value)} placeholder="TATKAL" className={INPUT} /></Field>
                </div>

                {/* ── passengers ──────────────────────────────────────────── */}
                <Field label="Passengers (1–4)" hint='Seats in the same coach print "ADJACENT" under the CNF — that line is the whole payoff, so give them consecutive seat numbers.'>
                  <div className="space-y-3">
                    {mf.passengers.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={p.name} onChange={(e) => patchPassenger(i, { name: e.target.value })} placeholder="Name on the ticket" className={INPUT_SM + " flex-1"} />
                          {mf.passengers.length > 1 && (
                            <button onClick={() => removePassenger(i)} className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground shrink-0"><Trash2 size={14} /></button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" value={p.age || ""} onChange={(e) => patchPassenger(i, { age: Number(e.target.value) || 0 })} placeholder="Age" className={INPUT_SM} />
                          <select value={p.gender} onChange={(e) => patchPassenger(i, { gender: e.target.value as Gender })} className={INPUT_SM}>
                            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <input value={p.coach} onChange={(e) => patchPassenger(i, { coach: e.target.value.toUpperCase() })} placeholder="Coach" className={INPUT_SM} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input value={p.seat} onChange={(e) => patchPassenger(i, { seat: e.target.value })} placeholder="Seat" className={INPUT_SM} />
                          <input value={p.bookingStatus} onChange={(e) => patchPassenger(i, { bookingStatus: e.target.value.toUpperCase() })} placeholder="WL 47" className={INPUT_SM} />
                          <input value={p.currentStatus} onChange={(e) => patchPassenger(i, { currentStatus: e.target.value.toUpperCase() })} placeholder="CNF" className={INPUT_SM} />
                        </div>
                        <input value={p.berth} onChange={(e) => patchPassenger(i, { berth: e.target.value.toUpperCase() })} placeholder="SIDE LOWER" className={INPUT_SM} />
                      </div>
                    ))}
                    {mf.passengers.length < MAX_PASSENGERS && (
                      <button onClick={addPassenger} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INK }}><Plus size={14} /> Add passenger</button>
                    )}
                  </div>
                </Field>

                {/* ── fare ────────────────────────────────────────────────── */}
                <Field label="Fare lines" hint='Values are prose, not money — "2 years of waiting", "worth it", "PRICELESS". One straight-faced ₹0.00 line sells the rest.'>
                  <div className="space-y-2">
                    {mf.fare.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={f.label} onChange={(e) => patchFare(i, { label: e.target.value })} placeholder="Label" className={INPUT_SM + " flex-1"} />
                        <input value={f.value} onChange={(e) => patchFare(i, { value: e.target.value })} placeholder="Value" className={INPUT_SM + " flex-1"} />
                        <button onClick={() => removeFare(i)} className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground shrink-0"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={addFare} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INK }}><Plus size={14} /> Add fare line</button>
                  </div>
                </Field>

                {/* ── route ───────────────────────────────────────────────── */}
                <Field label="Running status — your route" hint="Your relationship as a list of stops. Passed / current / upcoming controls the node and the line below it.">
                  <div className="space-y-3">
                    {mf.stations.map((s, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={s.name} onChange={(e) => patchStation(i, { name: e.target.value })} placeholder="Station name" className={INPUT_SM + " flex-1"} />
                          <button onClick={() => removeStation(i)} className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground shrink-0"><Trash2 size={14} /></button>
                        </div>
                        <input value={s.detail} onChange={(e) => patchStation(i, { detail: e.target.value })} placeholder="dep 14 Mar 2023, 02:11" className={INPUT_SM} />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={s.label} onChange={(e) => patchStation(i, { label: e.target.value })} placeholder="(unscheduled stop)" className={INPUT_SM} />
                          <select value={s.status} onChange={(e) => patchStation(i, { status: e.target.value as Station["status"] })} className={INPUT_SM}>
                            {STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    <button onClick={addStation} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INK }}><Plus size={14} /> Add stop</button>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Running late by"><input value={mf.delay.amount} onChange={(e) => updateMf("delay", { ...mf.delay, amount: e.target.value })} placeholder="4 months" className={INPUT} /></Field>
                  <Field label="Reason"><input value={mf.delay.reason} onChange={(e) => updateMf("delay", { ...mf.delay, reason: e.target.value })} placeholder="circumstances beyond our control" className={INPUT} /></Field>
                </div>

                {/* ── fine print ──────────────────────────────────────────── */}
                <Field label="Fine print" hint="Maximum bureaucratic register, complete sincerity. It prints at 6.5px and is deliberately hard to read — that contrast is the joke and the payload.">
                  <div className="space-y-2">
                    {mf.finePrint.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <textarea value={l} onChange={(e) => patchFine(i, e.target.value)} rows={2} placeholder="Passengers are advised to…" className={INPUT_SM + " flex-1 resize-none"} />
                        <button onClick={() => removeFine(i)} className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground shrink-0"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={addFine} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INK }}><Plus size={14} /> Add clause</button>
                  </div>
                </Field>

                {/* ── letter ──────────────────────────────────────────────── */}
                <Field label="The letter" hint="Shown under the slip in plain, readable serif. Drop the bureaucratic voice entirely here — the tonal shift is the whole point.">
                  <textarea value={mf.letter} onChange={(e) => updateMf("letter", e.target.value)} rows={6} placeholder="Say it straight…" className={INPUT + " resize-none"} />
                </Field>

                <Field label="Password (optional)" hint="If set, the shared link asks for this before the PNR page opens.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT + " pl-9"} />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !mf.pnr.trim()}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: INK }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save & Preview</>}
                </button>
                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <TrainFront size={11} /> Publish from the preview to get your shareable link
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
