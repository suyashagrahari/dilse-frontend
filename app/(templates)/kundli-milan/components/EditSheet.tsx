"use client";

// The Create form. Ordinary app chrome — SubhSandesh theme, not dot-matrix
// paper. The report is the artefact; this is the machine that prints it, and
// dressing the form up as a 1990s astrology portal too would make the joke
// arrive before the payoff.
//
// Every keystroke autosaves via the controller hook's effect on `mf` — there is
// no explicit save-draft call here, and there must not be one.

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Plus, Trash2, Lock, Sparkles, Info, Stars } from "lucide-react";
import {
  type KootaName,
  type KundliData,
  type EditMode,
  type Person,
  KOOTA_LABELS,
  KOOTA_MAX,
  KOOTA_ORDER,
} from "./types";
import { MAX_REMEDIES, MIN_REMEDIES, dobError, tobError } from "../hooks/useKundliMilanEditor";
import { FUN_KOOTA } from "./GunaCards";
import { MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import { KUNDLI_THEMES } from "./themes";

/** A section header with a little emoji badge — the form reads as steps. */
function Section({ emoji, title, note }: { emoji: string; title: string; note?: string }) {
  return (
    <div className="flex items-center gap-2.5 pt-2">
      <span className="w-9 h-9 rounded-xl grid place-items-center text-lg shrink-0" style={{ background: "linear-gradient(135deg,#ffe3ec,#efe6ff)" }} aria-hidden>
        {emoji}
      </span>
      <div className="min-w-0">
        <h4 className="text-[15px] font-bold leading-tight">{title}</h4>
        {note && <p className="text-[11.5px] text-muted-foreground leading-snug">{note}</p>}
      </div>
    </div>
  );
}

const ACCENT = "#d0245f";
const INPUT = "w-full px-3.5 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm";
const ERR_CLS = "text-[11px] mt-1 text-red-500";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: KundliData;
  updateMf: (key: keyof KundliData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5 flex-wrap">
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

/**
 * One person's block. Deliberately identical for both sides — the template is
 * usable by any pairing, and "Vara"/"Vadhu" are the only role words on screen.
 */
function PersonBlock({
  title,
  sub,
  person,
  onChange,
}: {
  title: string;
  sub: string;
  person: Person;
  onChange: (patch: Partial<Person>) => void;
}) {
  const dErr = dobError(person);
  const tErr = tobError(person);
  const showDobErr = person.dob.trim().length > 0 && Boolean(dErr);

  return (
    <div className="rounded-2xl border border-border/60 p-3.5 space-y-3 bg-muted/20">
      <div>
        <div className="text-sm font-bold" style={{ color: ACCENT }}>{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>

      <Field label="Name *">
        <input
          value={person.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Ananya"
          className={INPUT_SM}
        />
      </Field>

      <Field label="Date of birth *">
        <input
          type="date"
          value={person.dob}
          onChange={(e) => onChange({ dob: e.target.value })}
          aria-invalid={showDobErr}
          className={INPUT_SM}
        />
        {showDobErr && <p className={ERR_CLS}>{dErr}</p>}
      </Field>

      <Field label="Time of birth" hint="optional">
        <input
          type="time"
          value={person.tob}
          onChange={(e) => onChange({ tob: e.target.value })}
          aria-invalid={Boolean(tErr)}
          className={INPUT_SM}
        />
        {tErr
          ? <p className={ERR_CLS}>{tErr}</p>
          : <p className="text-[10px] text-muted-foreground mt-1">Don’t know it? Leave it blank.</p>}
      </Field>

      <Field label="Place of birth">
        <input
          value={person.pob}
          onChange={(e) => onChange({ pob: e.target.value })}
          placeholder="Chennai, Tamil Nadu"
          className={INPUT_SM}
        />
      </Field>
    </div>
  );
}

function EditSheetInner({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: Props) {
  const visible = editMode === "manual";

  const setPerson = (which: "groom" | "bride", patch: Partial<Person>) =>
    updateMf(which, { ...mf[which], ...patch });

  const setReading = (k: KootaName, v: string) =>
    updateMf("customReadings", { ...mf.customReadings, [k]: v });

  const setRemedy = (i: number, v: string) =>
    updateMf("remedies", mf.remedies.map((r, idx) => (idx === i ? v : r)));
  const addRemedy = () => {
    if (mf.remedies.length >= MAX_REMEDIES) return;
    updateMf("remedies", [...mf.remedies, ""]);
  };
  const removeRemedy = (i: number) =>
    updateMf("remedies", mf.remedies.filter((_, idx) => idx !== i));

  const filledReadings = KOOTA_ORDER.filter((k) => (mf.customReadings[k] ?? "").trim()).length;

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
                    <Stars size={17} style={{ color: ACCENT }} /> Make your cosmic match
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-1 text-muted-foreground" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                <ThemeSection themes={KUNDLI_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />

                {/* Two people. Birth data is the only input the engine reads —
                    names and places are printed but never scored, so a nickname
                    can never change the result. */}
                <Section emoji="🔮" title="The two of you" note="Birthdays power the (totally fake) match score" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PersonBlock
                    title="YOU"
                    sub="Person one"
                    person={mf.groom}
                    onChange={(patch) => setPerson("groom", patch)}
                  />
                  <PersonBlock
                    title="YOUR PERSON"
                    sub="Person two"
                    person={mf.bride}
                    onChange={(patch) => setPerson("bride", patch)}
                  />
                </div>

                <MemoriesSections
                  data={mf}
                  update={(k, v) => updateMf(k, v)}
                  gifTags={["love", "yes", "funny"]}
                  copy={{ letterTitle: "Your love letter", letterNote: "Opens from a sealed envelope on the report", lockQuestion: "Ananya, do you accept the stars' decision? 🔮", lockAnswer: "I accept 💖", letterHint: "Ananya,\n\nThe stars gave us 34 out of 36. I would have argued for 36…\n\n— Rohan" }}
                />

                <Section emoji="🙏" title="Pandit ji's funny bits" note="All optional — blanks use our lines" />
                <Field label="Certificate date" hint="printed on the certificate">
                  <input
                    type="date"
                    value={mf.issuedOn}
                    onChange={(e) => updateMf("issuedOn", e.target.value)}
                    className={INPUT_SM}
                  />
                </Field>

                {/* Custom readings — the personality slots. All eight optional;
                    a blank one falls back to the engine's own line. */}
                <details className="rounded-2xl border border-border/60 p-3.5 bg-muted/20">
                  <summary className="cursor-pointer text-sm font-semibold select-none">
                    ✍️ Write your own guna lines ({filledReadings}/8)
                  </summary>
                  <div className="mt-3">
                  <Field
                    label={`Your own readings (${filledReadings}/8)`}
                    hint="all optional — blank uses ours"
                  >
                    <div className="space-y-2.5">
                      {KOOTA_ORDER.map((k) => (
                        <div key={k}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold">{FUN_KOOTA[k].emoji} {FUN_KOOTA[k].title}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {KOOTA_LABELS[k].en} · {KOOTA_MAX[k]} guna{KOOTA_MAX[k] > 1 ? "s" : ""}
                            </span>
                          </div>
                          <input
                            value={mf.customReadings[k] ?? ""}
                            onChange={(e) => setReading(k, e.target.value)}
                            placeholder={k === "yoni" ? "You are not the same species. It shows." : "Leave blank for ours"}
                            className={INPUT_SM}
                          />
                        </div>
                      ))}
                    </div>
                  </Field>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    One line each, shown on its guna card. Keep them fond —
                    this is a joke about the two of you, not a verdict on either of you.
                  </p>
                  </div>
                </details>

                {/* Remedies */}
                <div>
                  <Field label={`Remedies / upaya (${mf.remedies.length}/${MAX_REMEDIES})`} hint={`at least ${MIN_REMEDIES}`}>
                    <div className="space-y-2">
                      {mf.remedies.map((r, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                          <input
                            value={r}
                            onChange={(e) => setRemedy(i, e.target.value)}
                            placeholder="He shall bring chai without being asked. Sundays."
                            className={INPUT_SM}
                          />
                          <button
                            onClick={() => removeRemedy(i)}
                            className="w-9 h-9 rounded-lg grid place-items-center text-muted-foreground shrink-0"
                            aria-label={`Remove remedy ${i + 1}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Field>
                  {mf.remedies.length < MAX_REMEDIES && (
                    <button onClick={addRemedy} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT }}>
                      <Plus size={13} /> Add remedy
                    </button>
                  )}
                </div>

                <Field label="Astrologer" hint="invent one — the sillier the better">
                  <div className="relative">
                    <Sparkles size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={mf.astrologerName}
                      onChange={(e) => updateMf("astrologerName", e.target.value)}
                      placeholder="Pt. Chandrakant Vyas-Sharma"
                      className={INPUT + " pl-9"}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Signs off as Jyotish Acharya, Office of the Registrar of Hearts.
                  </p>
                </Field>

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
                  style={{ background: ACCENT }}
                >
                  <span className="inline-flex items-center gap-2">
                    <PenLine size={15} /> Save & see the match 🔮
                  </span>
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Publish from the preview to get your shareable link.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(EditSheetInner);
