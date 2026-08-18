"use client";

import { memo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Eye, Camera, Trash2, Plus, Lock, Loader2, Info, ScrollText } from "lucide-react";
import type { CertificateData, CertField, EditMode, Party, Witness } from "./types";
import { padWitnesses, witnessHand } from "./types";
import { usePrefersReducedMotion } from "./CourtMarriageTemplate";
import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("court-marriage");

const INK = "#4a4436";
const SEAL = "#3f4c8f";
const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm transition-all";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: CertificateData;
  updateMf: <K extends keyof CertificateData>(key: K, val: CertificateData[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        {hint && (
          <span className="relative inline-flex items-center">
            <button
              type="button"
              aria-label={hint}
              aria-expanded={open}
              onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full transition-transform active:scale-90"
              style={{ background: open ? SEAL : "rgba(63,76,143,.12)", color: open ? "#fff" : SEAL }}
            >
              <Info size={12} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-[60] font-medium normal-case tracking-normal"
                  style={{
                    top: "calc(100% + 8px)", left: 0, width: "min(240px, 72vw)",
                    background: "#2b2f45", color: "#fff", fontSize: 11, lineHeight: 1.5,
                    padding: "8px 11px", borderRadius: 10, boxShadow: "0 12px 30px -8px rgba(20,22,40,.5)",
                  }}
                >
                  {hint}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function fileToDataUrl(file: File, cb: (src: string) => void, maxMb = 6) {
  if (file.size > maxMb * 1024 * 1024) {
    alert(`Image too large. Please use one under ${maxMb}MB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => cb(e.target?.result as string);
  reader.readAsDataURL(file);
}

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode === "manual";
  const photoRef = useRef<HTMLInputElement>(null);
  const reduced = usePrefersReducedMotion();

  const setParty = (which: "partyA" | "partyB", patch: Partial<Party>) =>
    updateMf(which, { ...mf[which], ...patch });

  const witnesses = padWitnesses(mf.witnesses);
  const setWitness = (i: number, patch: Partial<Witness>) =>
    updateMf(
      "witnesses",
      witnesses.map((w, idx) => (idx === i ? { ...w, ...patch } : w)),
    );

  const setField = (i: number, patch: Partial<CertField>) =>
    updateMf("fields", mf.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addField = () => updateMf("fields", [...mf.fields, { label: "", value: "" }]);
  const removeField = (i: number) => updateMf("fields", mf.fields.filter((_, idx) => idx !== i));

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
            className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[60] lg:inset-0 lg:flex lg:items-center lg:justify-center lg:bg-transparent"
          >
            <div className="mx-auto max-h-[84vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-background shadow-2xl lg:max-h-[90vh] lg:rounded-3xl">
              <div className="sticky top-0 z-10 flex justify-center bg-background pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              <div className="space-y-5 px-5 pb-8 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <ScrollText size={16} style={{ color: SEAL }} /> Register your marriage
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-1 text-muted-foreground" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                {/* Parties */}
                {(["partyA", "partyB"] as const).map((which, i) => (
                  <div key={which} className="space-y-3 rounded-2xl border border-border/50 p-3.5">
                    <div className="text-sm font-bold" style={{ color: SEAL }}>
                      Party {i === 0 ? "A" : "B"}
                    </div>
                    <Field label={`Full name *`} hint="Printed in capitals inside the certifying paragraph.">
                      <input
                        value={mf[which].name}
                        onChange={(e) => setParty(which, { name: e.target.value })}
                        placeholder={i === 0 ? "e.g. Ananya Iyer" : "e.g. Rohan Mehta"}
                        maxLength={40}
                        className={INPUT_CLS}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Age">
                        <input
                          type="number" inputMode="numeric" min={1} max={120}
                          value={mf[which].age || ""}
                          onChange={(e) => setParty(which, { age: Number(e.target.value) || 0 })}
                          className={INPUT_SM}
                        />
                      </Field>
                      <Field label="City">
                        <input
                          value={mf[which].city}
                          onChange={(e) => setParty(which, { city: e.target.value })}
                          placeholder="e.g. Bengaluru"
                          maxLength={40}
                          className={INPUT_SM}
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                {/* Photo — the photographer keeps the ask light */}
                <Field label="Joint photograph" hint="One photo of the two of you. Sits top-right with the seal stamped across its corner. Leave it empty and the frame prints as 'affix joint photograph'.">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => photoRef.current?.click()}
                      className="grid h-[70px] w-[58px] shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed border-border/60"
                    >
                      {mf.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mf.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Camera size={18} className="text-muted-foreground" />
                      )}
                      <input
                        ref={photoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) fileToDataUrl(e.target.files[0], (src) => updateMf("photoUrl", src)); e.target.value = ""; }}
                      />
                    </div>
                    {!reduced && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${ASSET}/photographer.webp`} alt="" width={54} height={54} className="shrink-0 rounded-xl" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Any selfie works. It gets a light sepia so it matches the paper.
                      </p>
                      {mf.photoUrl && (
                        <button onClick={() => updateMf("photoUrl", null)} className="mt-1.5 rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </Field>

                {/* Registry meta */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Certificate no." hint="Also the seed for every ink wobble on the page — change it and the typing shifts.">
                    <input value={mf.certificateNo} onChange={(e) => updateMf("certificateNo", e.target.value)} maxLength={24} className={INPUT_SM} />
                  </Field>
                  <Field label="Registered on">
                    <input type="date" value={mf.registeredOn} onChange={(e) => updateMf("registeredOn", e.target.value)} className={INPUT_SM} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Known since (days)">
                    <input
                      type="number" inputMode="numeric" min={0}
                      value={mf.knownSinceDays || ""}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 0;
                        updateMf("knownSinceDays", days);
                        // keep the matching printed row honest
                        updateMf(
                          "fields",
                          mf.fields.map((f) => (/known/i.test(f.label) ? { ...f, value: `${days} days` } : f)),
                        );
                      }}
                      className={INPUT_SM}
                    />
                  </Field>
                  <Field label="Objections received" hint="Printed as the clerk's margin note under the entries.">
                    <input
                      type="number" inputMode="numeric" min={0}
                      value={mf.objectionCount || 0}
                      onChange={(e) => {
                        const n = Number(e.target.value) || 0;
                        updateMf("objectionCount", n);
                        updateMf(
                          "fields",
                          mf.fields.map((f) => (/objections received/i.test(f.label) ? { ...f, value: String(n) } : f)),
                        );
                      }}
                      className={INPUT_SM}
                    />
                  </Field>
                </div>

                {/* Dot-leader entries */}
                <Field label="Entries" hint="The dotted rows in the middle. 4–6 read best; the value column is fixed so the dots always line up.">
                  <div className="space-y-2">
                    {mf.fields.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={f.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="Label" maxLength={40} className={INPUT_SM + " flex-1"} />
                        <input value={f.value} onChange={(e) => setField(i, { value: e.target.value })} placeholder="Value" maxLength={24} className={INPUT_SM + " w-24"} />
                        <button onClick={() => removeField(i)} aria-label="Remove entry" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/50 text-muted-foreground hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {mf.fields.length < 6 && (
                      <button onClick={addField} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: SEAL }}>
                        <Plus size={14} /> Add entry
                      </button>
                    )}
                  </div>
                </Field>

                {/* Witnesses */}
                <Field label="Witnesses" hint="Three slots. Name a witness and their signature is drawn in; leave one empty and it prints as a blank ruled line, waiting to be signed.">
                  <div className="space-y-2">
                    {witnesses.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
                        <input
                          value={w.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setWitness(i, { name, signaturePath: name.trim() ? witnessHand(i) : "" });
                          }}
                          placeholder={`Witness ${i + 1} (optional)`}
                          maxLength={30}
                          className={INPUT_SM + " flex-1"}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">Empty slots stay blank on the certificate — witnesses can sign later.</p>
                </Field>

                {/* Password */}
                <Field label="Password (optional)" hint="If set, the shared link asks for this before the certificate opens.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !mf.partyA.name.trim() || !mf.partyB.name.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${SEAL}, #2b3466)`, minHeight: 48 }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; preview</>}
                </button>
                <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
                  <PenLine size={10} style={{ color: INK }} /> Publish from the preview to get your shareable link
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
