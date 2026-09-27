"use client";

// The Create form. Ordinary app chrome, in steps: pick the vibe, the two
// parties, the registry details, the register entries and witnesses, then the
// love-kit memories (photos with little letters, GIFs, the sealed letter).
//
// Every keystroke autosaves via the controller hook's effect on `mf` — there is
// no explicit save-draft call here, and there must not be one.

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Trash2, Plus, Lock, Loader2, ScrollText, PenLine } from "lucide-react";

import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import type { CertificateData, CertField, EditMode, Party, Witness } from "./types";
import { padWitnesses, witnessHand } from "./types";
import { COURT_THEMES } from "./themes";

const ACCENT = "#d0245f";
const INPUT = "w-full px-3.5 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none";
const INPUT_SM = "w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50 focus:outline-none";
/** 16px so iOS never zooms into a field. */
const FS = { fontSize: 16 } as const;

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

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 flex flex-wrap items-baseline gap-x-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <span>{children}</span>
      {hint && <span className="text-[11px] font-normal normal-case tracking-normal text-muted-foreground/80">· {hint}</span>}
    </label>
  );
}

export default memo(function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: Props) {
  const visible = editMode === "manual";

  const setParty = (which: "partyA" | "partyB", patch: Partial<Party>) => updateMf(which, { ...mf[which], ...patch });

  const witnesses = padWitnesses(mf.witnesses);
  const setWitness = (i: number, patch: Partial<Witness>) => updateMf("witnesses", witnesses.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));

  const setField = (i: number, patch: Partial<CertField>) => updateMf("fields", mf.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addField = () => updateMf("fields", [...mf.fields, { label: "", value: "" }]);
  const removeField = (i: number) => updateMf("fields", mf.fields.filter((_, idx) => idx !== i));

  const namesOk = Boolean(mf.partyA.name.trim() && mf.partyB.name.trim());

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} className="fixed inset-0 z-[60] bg-black/50" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] lg:inset-0 lg:flex lg:items-center lg:justify-center"
          >
            <div className="pointer-events-auto mx-auto max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-background shadow-2xl lg:max-h-[90vh] lg:rounded-3xl">
              <div className="sticky top-0 z-10 flex justify-center bg-background pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              <div className="space-y-6 px-5 pb-8 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <ScrollText size={17} style={{ color: ACCENT }} /> Register your marriage 💍
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                <ThemeSection themes={COURT_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />

                <FormSection emoji="💑" title="The two of you" note="Names are required — everything else is optional">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(["partyA", "partyB"] as const).map((which, i) => (
                      <div key={which} className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5">
                        <div className="text-sm font-bold" style={{ color: ACCENT }}>
                          {i === 0 ? "YOU · party A" : "YOUR PERSON · party B"}
                        </div>
                        <div>
                          <Label>Full name *</Label>
                          <input
                            value={mf[which].name}
                            onChange={(e) => setParty(which, { name: e.target.value })}
                            placeholder={i === 0 ? "e.g. Rohan Mehta" : "e.g. Ananya Iyer"}
                            maxLength={40}
                            aria-invalid={!mf[which].name.trim()}
                            className={INPUT_SM}
                            style={FS}
                          />
                        </div>
                        <div className="grid grid-cols-[88px_1fr] gap-2">
                          <div>
                            <Label>Age</Label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={120}
                              value={mf[which].age || ""}
                              onChange={(e) => setParty(which, { age: Math.max(0, Math.min(120, Number(e.target.value) || 0)) })}
                              className={INPUT_SM}
                              style={FS}
                            />
                          </div>
                          <div>
                            <Label>City</Label>
                            <input value={mf[which].city} onChange={(e) => setParty(which, { city: e.target.value })} placeholder="e.g. Bengaluru" maxLength={40} className={INPUT_SM} style={FS} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormSection>

                <FormSection emoji="🏛️" title="Registry details" note="Printed on the certificate and read out in the ceremony">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Certificate no.</Label>
                      <input value={mf.certificateNo} onChange={(e) => updateMf("certificateNo", e.target.value)} maxLength={24} className={INPUT_SM} style={FS} />
                    </div>
                    <div>
                      <Label>Registered on</Label>
                      <input type="date" value={mf.registeredOn} onChange={(e) => updateMf("registeredOn", e.target.value)} className={INPUT_SM} style={FS} />
                    </div>
                    <div>
                      <Label>Known for (days)</Label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={mf.knownSinceDays || ""}
                        onChange={(e) => {
                          const days = Math.max(0, Number(e.target.value) || 0);
                          updateMf("knownSinceDays", days);
                          // keep the matching printed row honest
                          updateMf("fields", mf.fields.map((f) => (/known/i.test(f.label) ? { ...f, value: `${days} days` } : f)));
                        }}
                        className={INPUT_SM}
                        style={FS}
                      />
                    </div>
                    <div>
                      <Label hint="all overruled">Objections</Label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={99}
                        value={mf.objectionCount || 0}
                        onChange={(e) => {
                          const n = Math.max(0, Math.min(99, Number(e.target.value) || 0));
                          updateMf("objectionCount", n);
                          updateMf("fields", mf.fields.map((f) => (/objections received/i.test(f.label) ? { ...f, value: String(n) } : f)));
                        }}
                        className={INPUT_SM}
                        style={FS}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["registered", "awaiting_witnesses"] as const).map((st) => {
                      const on = mf.certificateState === st || (st === "registered" && mf.certificateState === "draft");
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateMf("certificateState", st)}
                          aria-pressed={on}
                          className="flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold"
                          style={{ borderColor: on ? ACCENT : "#eadfe4", color: on ? ACCENT : undefined, background: on ? "#fff5f8" : undefined }}
                        >
                          {st === "registered" ? "✓ Registered" : "⏳ Awaiting witnesses"}
                        </button>
                      );
                    })}
                  </div>
                </FormSection>

                <FormSection emoji="📋" title="The register entries" note="The funny dotted rows — 4 to 6 read best">
                  <div className="space-y-2">
                    {mf.fields.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={f.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="e.g. Fights survived" aria-label={`Entry ${i + 1} label`} maxLength={40} className={INPUT_SM + " min-w-0 flex-1"} style={FS} />
                        <input value={f.value} onChange={(e) => setField(i, { value: e.target.value })} placeholder="27" aria-label={`Entry ${i + 1} value`} maxLength={24} className={INPUT_SM + " w-24 shrink-0"} style={FS} />
                        <button onClick={() => removeField(i)} aria-label={`Remove entry ${i + 1}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border/50 text-muted-foreground">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {mf.fields.length < 6 && (
                      <button onClick={addField} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                        <Plus size={14} /> Add entry
                      </button>
                    )}
                  </div>
                </FormSection>

                <FormSection emoji="✍️" title="Witnesses" note="Name one and their signature draws itself in. Leave one blank — it waits to be signed.">
                  <div className="space-y-2">
                    {witnesses.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                        <input
                          value={w.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setWitness(i, { name, signaturePath: name.trim() ? witnessHand(i) : "" });
                          }}
                          placeholder={i === 0 ? "e.g. the friend who set you up" : `Witness ${i + 1} (optional)`}
                          aria-label={`Witness ${i + 1}`}
                          maxLength={30}
                          className={INPUT_SM + " flex-1"}
                          style={FS}
                        />
                      </div>
                    ))}
                  </div>
                </FormSection>

                <MemoriesSections
                  data={mf}
                  update={(k, v) => updateMf(k, v as CertificateData[typeof k])}
                  gifTags={["yes", "legal", "love"]}
                  copy={{
                    photosTitle: "Evidence: photos + little letters",
                    photosNote: "Up to 8. The first one is the portrait on your certificate. Tap a photo to zoom & reposition it.",
                    captionHint: "caption — e.g. the day we signed",
                    noteHint: "Your honour, I was done for the moment she laughed…",
                    gifsTitle: "Court footage (GIFs)",
                    letterTitle: "Your sealed letter",
                    letterNote: "The big one. It opens from a sealed envelope after the stamp.",
                    letterHint: "Ananya,\n\nThe registrar stamped it today. I stamped it the night you…\n\n— Rohan",
                  }}
                />

                <FormSection emoji="🔒" title="Password (optional)" note="If set, the link asks for it before the certificate opens">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT + " pl-10"} style={FS} />
                  </div>
                </FormSection>

                <button
                  onClick={onSave}
                  disabled={saving || !namesOk}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(115deg,#ff4f8b 0%,#ff7a5c 48%,#ffb03c 100%)", minHeight: 52 }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Eye size={16} /> Save &amp; see the ceremony 💍
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
                  <PenLine size={10} /> {namesOk ? "Publish from the preview to get your shareable link" : "Add both names to continue"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
