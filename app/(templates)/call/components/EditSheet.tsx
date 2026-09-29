// ─── The editor's form ───────────────────────────────────────────────────────
//
// One scrolling sheet (a bottom sheet on phones, a right-hand drawer on wide
// screens so the call stays visible beside it). Four friendly steps up top —
// who is calling, the memories, the voicemail, what the screen says when it
// rings — and everything else folded away under "Fine-tune". Save stays pinned
// at the bottom and says exactly what is still missing.
//
// The call log is edited as STRUCTURED ROWS; the AI's `kind | … | note` strings
// are normalised into rows once, at the AI boundary, in `useCallEditor`.

"use client";

import { useRef, useState, type ReactNode } from "react";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_DEFAULT, cropStyle, photoCrop, type Crop } from "../../dedication/components/types";
import { MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN } from "../../_love/types";
import {
  CALL_KINDS,
  CALL_TEXT_LIMITS as L,
  MAX_LOG_ENTRIES,
  MAX_MESSAGE_LINES,
  MAX_TAGS,
  type CallData,
  type CallKind,
  type CallLogEntry,
  type CallerTag,
} from "./types";
import type { EditMode } from "../hooks/useCallEditor";

/** What Save needs before it will go. Everything else has a sensible default. */
export function missingForSave(d: CallData): string[] {
  const out: string[] = [];
  if (!d.caller.name.trim()) out.push("your name");
  if (!d.recipient.name.trim()) out.push("their name");
  return out;
}

const KIND_LABEL: Record<CallKind, string> = { missed: "📵 Missed", incoming: "↙ Incoming", outgoing: "↗ Outgoing", rejected: "⛔ Declined" };

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: CallData;
  updateMf: (key: keyof CallData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: EditSheetProps) {
  const open = editMode === "manual";
  const [lockPicked, setLockPicked] = useState(false);
  if (!open) return null;
  // On when they ticked it or when a question is already there (the AI writes one).
  const lockOn = lockPicked || !!mf.lockQuestion.trim();

  const missing = missingForSave(mf);
  const setCaller = (p: Partial<CallData["caller"]>) => updateMf("caller", { ...mf.caller, ...p });
  const setTag = (i: number, p: Partial<CallerTag>) => updateMf("tags", mf.tags.map((t, idx) => (idx === i ? { ...t, ...p } : t)));
  const setEntry = (i: number, p: Partial<CallLogEntry>) => updateMf("callLog", mf.callLog.map((e, idx) => (idx === i ? { ...e, ...p } : e)));
  const close = () => setEditMode("preview");
  const first = mf.caller.name.trim().split(/\s+/)[0] || "you";
  const them = mf.recipient.name.trim().split(/\s+/)[0] || "them";

  return (
    <>
      <style>{CSS}</style>
      <div className="ceScrim" onClick={close} />
      <div className="ceSheet" role="dialog" aria-modal="true" aria-label="Make your call">
        <div className="ceHead">
          <span className="ceGrab" aria-hidden />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="ceTitle">Make the call 📞</p>
            <p className="ceSub">Names, photos, a voicemail. Everything else is already written — tweak anything.</p>
          </div>
          <button type="button" className="ceX" onClick={close} aria-label="Close">✕</button>
        </div>

        <div className="ceBody">
          {/* 1 — who */}
          <section className="ceStep">
            <p className="ceStepN"><b>1</b> Who&apos;s calling who</p>
            <div className="ceWho">
              <PortraitSlot caller={mf.caller} onChange={setCaller} />
              <div className="ceWhoFields">
                <Field label="Your name" required hint="It flashes on their screen as the caller.">
                  <Text big value={mf.caller.name} max={L.name} placeholder="Meera" onChange={(v) => setCaller({ name: v })} />
                </Field>
                <Field label="Their name" required hint="Whose phone is ringing.">
                  <Text big value={mf.recipient.name} max={L.name} placeholder="Karan" onChange={(v) => updateMf("recipient", { name: v })} />
                </Field>
              </div>
            </div>
          </section>

          {/* 2 — memories */}
          <section className="ceStep">
            <p className="ceStepN"><b>2</b> Shared media — your memories</p>
            <p className="ceHint">
              Up to 10 photos. They drop into the call as it plays, fill the &ldquo;shared media&rdquo; grid, and each one opens with its little note.
              Tap a photo to move &amp; zoom it. <strong>Sample photos?</strong> Tap &ldquo;change photo&rdquo; to swap in yours — the captions stay.
            </p>
            <PhotosEditor
              photos={mf.photos}
              onChange={(v) => updateMf("photos", v)}
              captionHint="caption — e.g. 4 hrs 12 mins"
              noteHint="The little note that opens with this photo…"
            />
          </section>

          {/* 3 — voicemail */}
          <section className="ceStep">
            <p className="ceStepN"><b>3</b> The voicemail — your main letter 💌</p>
            <p className="ceHint">It waits as a voicemail and plays back word by word, like a live transcript. The call ends on &ldquo;Duration: forever&rdquo;.</p>
            <Field label="Your letter" count={`${mf.letter.length}/${MAX_LETTER_LEN}`}>
              <Area rows={8} value={mf.letter} max={MAX_LETTER_LEN} placeholder={`${them},\n\nI keep calling you for no reason, and the reason is you…`} onChange={(v) => updateMf("letter", v)} />
            </Field>
            <label className="ceCheck">
              <input
                type="checkbox"
                checked={lockOn}
                onChange={(e) => {
                  setLockPicked(e.target.checked);
                  if (!e.target.checked) {
                    updateMf("lockQuestion", "");
                    updateMf("lockAnswer", "");
                  }
                }}
              />
              <span>Make them answer a question first (the red Decline button runs away 😈)</span>
            </label>
            {lockOn && (
              <div className="ceRow2">
                <Field label="The question">
                  <Text value={mf.lockQuestion} max={MAX_LOCK_QUESTION_LEN} placeholder="Are you going to pick up this time?" onChange={(v) => updateMf("lockQuestion", v)} />
                </Field>
                <Field label="The answer button says">
                  <Text value={mf.lockAnswer} max={MAX_LOCK_ANSWER_LEN} placeholder="Answer 📞" onChange={(v) => updateMf("lockAnswer", v)} />
                </Field>
              </div>
            )}
          </section>

          {/* 4 — the ring */}
          <section className="ceStep">
            <p className="ceStepN"><b>4</b> What their screen says when it rings</p>
            <Field label="Call reason" hint="Pinned on the incoming call." count={`${mf.callReason.length}/${L.reason}`}>
              <Text value={mf.callReason} max={L.reason} placeholder="Pick up, I have something to tell you 🥹" onChange={(v) => updateMf("callReason", v)} />
            </Field>
            <div className="ceRow2">
              <Field label="They have you saved as" hint="Emojis encouraged.">
                <Text value={mf.savedAs} max={L.savedAs} placeholder={`${first} 🍓🧿`} onChange={(v) => updateMf("savedAs", v)} />
              </Field>
              <Field label="Your number" hint="Make it a joke — never a real one.">
                <Text value={mf.caller.number} max={L.number} placeholder="+91 90000 14022" onChange={(v) => setCaller({ number: v })} />
              </Field>
            </div>
          </section>

          {/* 5 — fine-tune */}
          <section className="ceStep">
            <p className="ceStepN"><b>5</b> Fine-tune (optional)</p>
            <div className="ceFolds">
              <Fold title="On the call — what you say" sub={`${mf.message.length} lines, shown one at a time as a live transcript`}>
                <Field label="One spoken line per row" count={`${mf.message.length}/${MAX_MESSAGE_LINES} lines`}>
                  <Area
                    rows={6}
                    value={mf.message.join("\n")}
                    max={MAX_MESSAGE_LINES * L.line}
                    placeholder={"Pick up.\nI know you're looking at the screen right now…"}
                    onChange={(v) => updateMf("message", v.split("\n").slice(0, MAX_MESSAGE_LINES).map((l) => l.slice(0, L.line)))}
                  />
                </Field>
              </Fold>

              <Fold title="Caller-ID card" sub="Location, carrier, spam score, verified">
                <div className="ceRow2">
                  <Field label="Location"><Text value={mf.caller.location} max={L.location} placeholder="Lucknow, Uttar Pradesh" onChange={(v) => setCaller({ location: v })} /></Field>
                  <Field label="Carrier"><Text value={mf.caller.carrier} max={L.carrier} placeholder="Dil Prepaid · 5G" onChange={(v) => setCaller({ carrier: v })} /></Field>
                </div>
                <Field label={`Spam score: ${mf.spamRisk}%`} hint={mf.spamRisk === 0 ? "0% reads as a proud “Not spam. Never spam.”" : "Anything above 0 is a bit of a roast."}>
                  <input className="ceRange" type="range" min={0} max={100} value={mf.spamRisk} onChange={(e) => updateMf("spamRisk", Number(e.target.value))} aria-label="Spam score" />
                </Field>
                <label className="ceCheck">
                  <input type="checkbox" checked={mf.verified} onChange={(e) => updateMf("verified", e.target.checked)} />
                  <span>Show the gold verified tick</span>
                </label>
                <Field label="Who viewed your profile" count={`${mf.whoViewed.length}/${L.viewed}`}>
                  <Text value={mf.whoViewed} max={L.viewed} placeholder={`${first} viewed your profile 38 times this week…`} onChange={(v) => updateMf("whoViewed", v)} />
                </Field>
              </Fold>

              <Fold title="Saved-by-others tags" sub={`${mf.tags.length} tags · the top one shows on the ringing screen`}>
                {mf.tags.map((t, i) => (
                  <div key={i} className="ceTagRow">
                    <Text value={t.label} max={L.tag} placeholder="Pick Up. Now." onChange={(v) => setTag(i, { label: v })} />
                    <input className="ceIn ceNum" type="number" min={0} value={t.count} onChange={(e) => setTag(i, { count: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })} aria-label="How many people" />
                    <button type="button" className="ceMini" onClick={() => updateMf("tags", mf.tags.filter((_, idx) => idx !== i))} aria-label="Remove tag">✕</button>
                  </div>
                ))}
                {mf.tags.length < MAX_TAGS && (
                  <button type="button" className="ceAdd" onClick={() => updateMf("tags", [...mf.tags, { label: "", count: Math.max(1, (mf.tags[mf.tags.length - 1]?.count ?? 40) - 7) }])}>+ Add a tag</button>
                )}
              </Fold>

              <Fold title="Call history" sub={`${mf.callLog.length} calls · tap a row on the page to read its note`}>
                {mf.callLog.map((e, i) => (
                  <div key={i} className="ceLogRow">
                    <div className="ceLogTop">
                      <select className="ceIn" value={e.kind} onChange={(ev) => setEntry(i, { kind: ev.target.value as CallKind, ...(ev.target.value === "missed" || ev.target.value === "rejected" ? { duration: undefined } : {}) })} aria-label="Call type">
                        {CALL_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                      </select>
                      <button type="button" className="ceMini" onClick={() => updateMf("callLog", mf.callLog.filter((_, idx) => idx !== i))} aria-label="Remove call">✕</button>
                    </div>
                    <div className="ceRow3">
                      <Text value={e.ago} max={L.ago} placeholder="Yesterday" onChange={(v) => setEntry(i, { ago: v })} label="Day" />
                      <Text value={e.time} max={L.time} placeholder="11:47 PM" onChange={(v) => setEntry(i, { time: v })} label="Time" />
                      <Text value={e.duration ?? ""} max={L.duration} placeholder={e.kind === "missed" || e.kind === "rejected" ? "—" : "38 mins"} onChange={(v) => setEntry(i, { duration: v })} label="Duration" disabled={e.kind === "missed" || e.kind === "rejected"} />
                    </div>
                    <Text value={e.note ?? ""} max={L.note} placeholder="The joke / the memory behind this call" onChange={(v) => setEntry(i, { note: v })} label="Note" />
                  </div>
                ))}
                {mf.callLog.length < MAX_LOG_ENTRIES && (
                  <button type="button" className="ceAdd" onClick={() => updateMf("callLog", [...mf.callLog, { kind: "missed", time: "", ago: "Today", note: "" }])}>+ Add a call</button>
                )}
              </Fold>

              <Fold title="Friends' tag link" sub="What their friends read when you share the tag link">
                <Field label="Prompt" count={`${mf.contributorPrompt.length}/${L.prompt}`}>
                  <Area rows={3} value={mf.contributorPrompt} max={L.prompt} onChange={(v) => updateMf("contributorPrompt", v)} />
                </Field>
              </Fold>

              <Fold title="Password (optional)" sub="Only people with the password can pick up">
                <Field label="Password" hint="Leave empty for no password.">
                  <Text value={pagePassword} max={128} placeholder="e.g. our first date" onChange={setPagePassword} />
                </Field>
              </Fold>
            </div>
          </section>
        </div>

        <div className="ceFoot">
          {missing.length > 0 ? <p className="ceMissing">Still needed: {missing.join(", ")}</p> : <p className="ceReady">Ready to ring ✓</p>}
          <button type="button" className="ceSave" onClick={onSave} disabled={saving || missing.length > 0}>
            {saving ? "Saving…" : "Save & preview the call"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── the caller portrait: upload → frame → replace → remove ───────────────── */

function PortraitSlot({ caller, onChange }: { caller: CallData["caller"]; onChange: (p: Partial<CallData["caller"]>) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [adjust, setAdjust] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const crop = photoCrop({ url: caller.photoUrl, cropX: caller.cropX, cropY: caller.cropY, scale: caller.scale });

  const pick = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      onChange({ photoUrl: await compressImage(f), cropX: CROP_DEFAULT.x, cropY: 35, scale: CROP_DEFAULT.scale });
      setAdjust(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo couldn't be read");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cePortrait">
      <button type="button" className="cePortraitPic" onClick={() => (caller.photoUrl ? setAdjust(true) : input.current?.click())} aria-label={caller.photoUrl ? "Move and zoom your photo" : "Add your photo"}>
        {caller.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={caller.photoUrl} alt="" draggable={false} style={cropStyle(crop)} />
        ) : (
          <span className="cePortraitEmpty">{busy ? "…" : "＋"}<small>your photo</small></span>
        )}
        {caller.photoUrl && <span className="cePortraitTag">adjust</span>}
      </button>
      <div className="cePortraitBtns">
        <button type="button" onClick={() => input.current?.click()}>{caller.photoUrl ? "Change" : "Upload"}</button>
        {caller.photoUrl && <button type="button" onClick={() => onChange({ photoUrl: "" })}>Remove</button>}
      </div>
      {err && <p className="ceErr">{err}</p>}
      <input ref={input} type="file" accept="image/*" className="ceHidden" tabIndex={-1} aria-hidden onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
      <PhotoAdjuster
        open={adjust && !!caller.photoUrl}
        src={caller.photoUrl}
        crop={crop}
        title="Frame your caller photo"
        onChange={(c: Crop) => onChange({ cropX: c.x, cropY: c.y, scale: c.scale })}
        onClose={() => setAdjust(false)}
        onReplace={() => input.current?.click()}
      />
    </div>
  );
}

/* ── small form pieces (module scope, so inputs never remount mid-typing) ─── */

function Field({ label, hint, required, count, children }: { label: string; hint?: string; required?: boolean; count?: string; children: ReactNode }) {
  return (
    <label className="ceField">
      <span className="ceLabel">
        {label}
        {required && <i> *</i>}
        {count && <small>{count}</small>}
      </span>
      {children}
      {hint && <span className="ceFieldHint">{hint}</span>}
    </label>
  );
}

function Text({ value, onChange, max, placeholder, big, label, disabled }: { value: string; onChange: (v: string) => void; max: number; placeholder?: string; big?: boolean; label?: string; disabled?: boolean }) {
  return (
    <input
      className={`ceIn${big ? " is-big" : ""}`}
      value={value}
      maxLength={max}
      placeholder={placeholder}
      aria-label={label}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.slice(0, max))}
    />
  );
}

function Area({ value, onChange, max, rows, placeholder }: { value: string; onChange: (v: string) => void; max: number; rows: number; placeholder?: string }) {
  return <textarea className="ceIn ceArea" value={value} rows={rows} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value.slice(0, max))} />;
}

function Fold({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <details className="ceFold">
      <summary>
        <span><b>{title}</b>{sub && <small>{sub}</small>}</span>
        <i aria-hidden>⌄</i>
      </summary>
      <div className="ceFoldBody">{children}</div>
    </details>
  );
}

const CSS = `
.ceScrim { position: fixed; inset: 0; z-index: 200; background: rgba(7,9,11,.55); animation: ceFade .2s both; }
.ceSheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; margin: 0 auto; width: 100%; max-width: 620px; max-height: 92dvh; display: flex; flex-direction: column;
  border-radius: 24px 24px 0 0; background: #F6F7F5; color: #14181D; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 -24px 60px -20px rgba(0,0,0,.5); animation: ceUp .38s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 900px) {
  .ceSheet { left: auto; right: 0; top: 0; bottom: 0; max-height: none; height: 100dvh; width: 480px; border-radius: 24px 0 0 24px; animation-name: ceIn; }
  .ceGrab { display: none !important; }
}
.ceHead { position: relative; display: flex; align-items: flex-start; gap: 10px; padding: 18px 16px 12px; border-bottom: 1px solid #E4E7E3; }
.ceGrab { position: absolute; top: 7px; left: 50%; transform: translateX(-50%); width: 40px; height: 5px; border-radius: 99px; background: #D5D9D4; }
.ceTitle { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -.01em; }
.ceSub { margin: 3px 0 0; font-size: 13px; color: #5D6670; line-height: 1.4; }
.ceX { flex: none; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #E9ECE8; color: #3A424A; font-size: 15px; cursor: pointer; }
.ceBody { flex: 1; overflow-y: auto; padding: 6px 16px 24px; overscroll-behavior: contain; }
.ceStep { padding: 16px 0 6px; border-bottom: 1px dashed #DDE1DC; display: grid; gap: 12px; }
.ceStep:last-child { border-bottom: 0; }
.ceStepN { margin: 0; display: flex; align-items: center; gap: 9px; font-size: 15.5px; font-weight: 800; }
.ceStepN b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #159A5B; color: #fff; font-size: 13px; flex: none; }
.ceHint { margin: -4px 0 0; font-size: 12.5px; line-height: 1.5; color: #5D6670; }
.ceHint strong { color: #14181D; }
.ceField { display: grid; gap: 6px; min-width: 0; }
.ceLabel { display: flex; align-items: baseline; gap: 4px; font-size: 12.5px; font-weight: 700; color: #3A424A; }
.ceLabel i { color: #D1435B; font-style: normal; }
.ceLabel small { margin-left: auto; font-size: 11px; font-weight: 500; color: #8A939C; font-variant-numeric: tabular-nums; }
.ceFieldHint { font-size: 11.5px; color: #7A838C; line-height: 1.4; }
.ceIn { width: 100%; min-height: 46px; padding: 11px 13px; border-radius: 13px; border: 1.5px solid #DCE0DB; background: #fff; color: #14181D; font: inherit; font-size: 16px; outline: none; transition: border-color .15s, box-shadow .15s; }
.ceIn:focus { border-color: #159A5B; box-shadow: 0 0 0 4px rgba(21,154,91,.14); }
.ceIn:disabled { background: #F0F2EF; color: #9AA3AB; }
.ceIn.is-big { min-height: 52px; font-size: 18px; font-weight: 600; }
.ceArea { resize: vertical; line-height: 1.5; min-height: 90px; }
.ceRow2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ceRow3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
@media (max-width: 400px) { .ceRow2 { grid-template-columns: 1fr; } }
.ceWho { display: flex; gap: 14px; align-items: flex-start; }
.ceWhoFields { flex: 1; min-width: 0; display: grid; gap: 12px; }
.cePortrait { flex: none; display: grid; justify-items: center; gap: 8px; width: 112px; }
.cePortraitPic { position: relative; width: 104px; height: 104px; border-radius: 50%; overflow: hidden; border: 0; padding: 0; cursor: pointer; background: #fff;
  box-shadow: 0 0 0 3px #F6F7F5, 0 0 0 5.5px #E3B64C, 0 10px 24px -10px rgba(0,0,0,.35); }
.cePortraitPic img { display: block; }
.cePortraitEmpty { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; font-size: 30px; color: #159A5B; background: repeating-linear-gradient(45deg, #F2F7F3, #F2F7F3 8px, #E8F2EB 8px, #E8F2EB 16px); }
.cePortraitEmpty small { font-size: 11px; font-weight: 700; color: #3A424A; }
.cePortraitTag { position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 0 6px; font-size: 10.5px; font-weight: 800; color: #fff; background: rgba(0,0,0,.5); text-align: center; }
.cePortraitBtns { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.cePortraitBtns button { border: 1px solid #DCE0DB; background: #fff; border-radius: 99px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; color: #14181D; }
.ceErr { margin: 0; font-size: 11.5px; color: #D1435B; text-align: center; }
.ceHidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.ceCheck { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.4; cursor: pointer; }
.ceCheck input { width: 20px; height: 20px; margin: 1px 0 0; accent-color: #159A5B; flex: none; }
.ceRange { width: 100%; accent-color: #159A5B; }
.ceFolds { display: grid; gap: 8px; }
.ceFold { border: 1.5px solid #E1E4E0; border-radius: 16px; background: #fff; }
.ceFold summary { list-style: none; display: flex; align-items: center; gap: 10px; padding: 13px 14px; cursor: pointer; }
.ceFold summary::-webkit-details-marker { display: none; }
.ceFold summary span { flex: 1; min-width: 0; display: grid; gap: 1px; }
.ceFold summary b { font-size: 14.5px; }
.ceFold summary small { font-size: 12px; color: #7A838C; }
.ceFold summary i { font-style: normal; font-size: 18px; color: #7A838C; transition: transform .2s; }
.ceFold[open] summary i { transform: rotate(180deg); }
.ceFoldBody { display: grid; gap: 12px; padding: 0 14px 14px; }
.ceTagRow { display: grid; grid-template-columns: 1fr 92px 40px; gap: 6px; align-items: center; }
.ceNum { text-align: right; font-variant-numeric: tabular-nums; }
.ceMini { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #E1E4E0; background: #fff; color: #7A838C; cursor: pointer; }
.ceAdd { min-height: 44px; border-radius: 13px; border: 1.5px dashed #159A5B; background: #F1F8F3; color: #0F7A47; font-weight: 800; font-size: 14px; cursor: pointer; }
.ceLogRow { display: grid; gap: 7px; padding: 10px; border-radius: 14px; background: #F6F7F5; }
.ceLogTop { display: grid; grid-template-columns: 1fr 40px; gap: 6px; }
.ceFoot { padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #E4E7E3; background: #fff; display: grid; gap: 8px; }
.ceMissing { margin: 0; font-size: 13px; font-weight: 700; color: #D1435B; }
.ceReady { margin: 0; font-size: 13px; font-weight: 700; color: #159A5B; }
.ceSave { min-height: 52px; border-radius: 16px; border: 0; background: linear-gradient(145deg, #22B56E, #128A4F); color: #fff; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 12px 26px -12px rgba(21,154,91,.9); }
.ceSave:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
@keyframes ceFade { from { opacity: 0; } }
@keyframes ceUp { from { transform: translateY(100%); } }
@keyframes ceIn { from { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .ceScrim, .ceSheet { animation: none; } }
`;
