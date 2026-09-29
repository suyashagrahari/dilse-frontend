"use client";

// ─── Catch — the form ────────────────────────────────────────────────────────
//
// Four short steps and a folded "fine-tune": who's playing (names + their face),
// the memories that fall as polaroids (crop / zoom / caption / note each), the
// letter pieces, and the main letter. The AI's guided questions fill every word
// before this opens; this is where the sender adds photos and tweaks.

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { clampCrop, type Crop } from "../../dedication/components/types";
import { MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN, type LovePhoto } from "../../_love/types";
import { missingForSave } from "../hooks/useCatchEditor";
import Face from "./Face";
import { BAD_EMOJIS, BODY, C, DISPLAY, PIECE_EMOJIS } from "./theme";
import { DURATIONS, LIMITS, type BadItem, type CatchData, type EditMode, type GoodItem } from "./types";

type Update = (key: keyof CatchData, val: unknown) => void;

function Field({ label, hint, count, required, children }: { label: string; hint?: string; count?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="cs-field">
      <span className="cs-label">
        {label}
        {required && <i className="cs-req">*</i>}
        {count && <span className="cs-count">{count}</span>}
      </span>
      {children}
      {hint && <span className="cs-hint">{hint}</span>}
    </label>
  );
}

function Fold({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`cs-fold${open ? " open" : ""}`}>
      <button type="button" className="cs-foldH" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        <span className="cs-chev" aria-hidden>⌄</span>
      </button>
      {open && <div className="cs-foldB">{children}</div>}
    </div>
  );
}

function EmojiPick({ value, options, onPick, label }: { value: string; options: readonly string[]; onPick: (e: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cs-emojiWrap">
      <button type="button" className="cs-emojiBtn" onClick={() => setOpen((o) => !o)} aria-label={`${label}: ${value}. Change`} aria-expanded={open}>
        {value || "💌"}
      </button>
      {open && (
        <div className="cs-emojiPop" role="listbox" aria-label={label}>
          {options.map((e) => (
            <button
              key={e}
              type="button"
              role="option"
              aria-selected={e === value}
              className={e === value ? "is-on" : ""}
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FacePicker({ data, update }: { data: CatchData; update: Update }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [adjust, setAdjust] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const crop = clampCrop({ x: data.faceCropX, y: data.faceCropY, scale: data.faceScale });

  const pick = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      const url = await compressImage(f, 900);
      update("faceUrl", url);
      update("faceCropX", 50);
      update("faceCropY", 40);
      update("faceScale", 100);
      setAdjust(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo couldn't be read");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cs-faceRow">
      <button type="button" className="cs-faceBtn" onClick={() => (data.faceUrl ? setAdjust(true) : fileRef.current?.click())} aria-label={data.faceUrl ? "Move and zoom their face" : "Add their face photo"}>
        <Face data={data} size={84} />
        <span className="cs-faceTag">{data.faceUrl ? "adjust" : "+ add"}</span>
      </button>
      <div className="cs-faceTx">
        <p>
          <b>Their face is the player.</b> Pick a photo where it&apos;s clear, then drag &amp; zoom it into the circle — that&apos;s exactly how it catches things.
        </p>
        <div className="cs-faceActs">
          <button type="button" className="cs-mini" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "adding…" : data.faceUrl ? "change photo" : "upload photo"}
          </button>
          {data.faceUrl && (
            <>
              <button type="button" className="cs-mini" onClick={() => setAdjust(true)}>crop / zoom</button>
              <button type="button" className="cs-mini cs-mini--quiet" onClick={() => update("faceUrl", "")}>use a cute drawn face</button>
            </>
          )}
        </div>
        {err && <p className="cs-err">{err}</p>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
      <PhotoAdjuster
        open={adjust && !!data.faceUrl}
        src={data.faceUrl}
        crop={crop}
        title="Frame their face — keep it centred"
        onChange={(c: Crop) => {
          update("faceCropX", c.x);
          update("faceCropY", c.y);
          update("faceScale", c.scale);
        }}
        onClose={() => setAdjust(false)}
        onReplace={() => fileRef.current?.click()}
      />
    </div>
  );
}

function PiecesEditor({ items, onChange }: { items: GoodItem[]; onChange: (v: GoodItem[]) => void }) {
  const patch = (i: number, p: Partial<GoodItem>) => onChange(items.map((g, j) => (j === i ? { ...g, ...p } : g)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const add = () => {
    const used = new Set(items.map((g) => g.id));
    let k = items.length + 1;
    while (used.has(`g${k}`)) k++;
    onChange([...items, { id: `g${k}`, emoji: PIECE_EMOJIS[items.length % PIECE_EMOJIS.length], label: "", line: "" }]);
  };
  return (
    <div className="cs-pieces">
      {items.map((g, i) => (
        <div key={g.id || i} className="cs-piece">
          <div className="cs-pieceTop">
            <span className="cs-pieceN">#{i + 1}</span>
            <EmojiPick value={g.emoji} options={PIECE_EMOJIS} onPick={(e) => patch(i, { emoji: e })} label={`Emoji for piece ${i + 1}`} />
            <input
              className="cs-input cs-input--sm"
              value={g.label}
              maxLength={LIMITS.label}
              placeholder="what it is — e.g. the grey hoodie"
              aria-label={`What piece ${i + 1} is`}
              onChange={(e) => patch(i, { label: e.target.value.slice(0, LIMITS.label) })}
            />
            <div className="cs-pieceActs">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove piece ${i + 1}`}>✕</button>
            </div>
          </div>
          <textarea
            className="cs-input cs-area"
            rows={2}
            value={g.line}
            maxLength={LIMITS.line}
            placeholder="the line it carries — one or two sentences, just for them"
            aria-label={`Line ${i + 1}`}
            onChange={(e) => patch(i, { line: e.target.value.slice(0, LIMITS.line) })}
          />
        </div>
      ))}
      {items.length < LIMITS.maxGood && (
        <button type="button" className="cs-add" onClick={add}>
          + add a letter piece ({items.length}/{LIMITS.maxGood})
        </button>
      )}
    </div>
  );
}

function BadEditor({ items, onChange }: { items: BadItem[]; onChange: (v: BadItem[]) => void }) {
  const patch = (i: number, p: Partial<BadItem>) => onChange(items.map((g, j) => (j === i ? { ...g, ...p } : g)));
  return (
    <div className="cs-pieces">
      {items.map((b, i) => (
        <div key={b.id || i} className="cs-pieceTop cs-bad">
          <EmojiPick value={b.emoji} options={BAD_EMOJIS} onPick={(e) => patch(i, { emoji: e })} label={`Emoji for dodge ${i + 1}`} />
          <input
            className="cs-input cs-input--sm"
            value={b.label}
            maxLength={24}
            placeholder='e.g. "k"'
            aria-label={`Thing to dodge ${i + 1}`}
            onChange={(e) => patch(i, { label: e.target.value.slice(0, 24) })}
          />
          <div className="cs-pieceActs">
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove dodge ${i + 1}`}>✕</button>
          </div>
        </div>
      ))}
      {items.length < LIMITS.maxBad && (
        <button type="button" className="cs-add" onClick={() => onChange([...items, { id: `b${Date.now() % 100000}`, emoji: BAD_EMOJIS[items.length % BAD_EMOJIS.length], label: "" }])}>
          + add something to dodge
        </button>
      )}
    </div>
  );
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
  mf: CatchData;
  updateMf: Update;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = editMode === "manual";
  const [lockOn, setLockOn] = useState(() => !!mf.lockQuestion.trim());
  const missing = missingForSave(mf);
  const written = mf.goodItems.filter((g) => g.line.trim()).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="cs-scrim" className="cs-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} />
          <motion.div
            key="cs-sheet"
            className="cs-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Make your game"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="cs-head">
              <span className="cs-grab" aria-hidden />
              <div style={{ minWidth: 0 }}>
                <p className="cs-title">Make their game 🎮</p>
                <p className="cs-sub">Names, photos, the letter. Everything else is already written — tweak anything.</p>
              </div>
              <button type="button" className="cs-x" onClick={() => setEditMode("preview")} aria-label="Close">✕</button>
            </div>

            <div className="cs-body">
              <section className="cs-step">
                <p className="cs-stepN"><span>1</span> who&apos;s playing</p>
                <div className="cs-row2">
                  <Field label="Their name" required>
                    <input className="cs-input cs-big" value={mf.recipientName} maxLength={LIMITS.name} placeholder="Ananya" onChange={(e) => updateMf("recipientName", e.target.value.slice(0, LIMITS.name))} />
                  </Field>
                  <Field label="Your name" required>
                    <input className="cs-input cs-big" value={mf.senderName} maxLength={LIMITS.name} placeholder="Rohan" onChange={(e) => updateMf("senderName", e.target.value.slice(0, LIMITS.name))} />
                  </Field>
                </div>
                <FacePicker data={mf} update={updateMf} />
              </section>

              <section className="cs-step">
                <p className="cs-stepN"><span>2</span> memories to catch 📸</p>
                <p className="cs-hint cs-lead">
                  5–10 photos works best. Each one falls as a polaroid — catch it and it pops open with your caption and little note. Tap a photo to crop &amp; zoom it.
                </p>
                <PhotosEditor
                  photos={mf.photos}
                  onChange={(v: LovePhoto[]) => updateMf("photos", v)}
                  captionHint="caption — e.g. our first sunset"
                  noteHint="the little note that pops open with it…"
                />
              </section>

              <section className="cs-step">
                <p className="cs-stepN"><span>3</span> the letter pieces 💌</p>
                <p className="cs-hint cs-lead">
                  Your letter, one line per falling object. They arrive in this order and stack up into the letter at the end. <b>{written}</b> written · at least {LIMITS.minGood}.
                </p>
                <PiecesEditor items={mf.goodItems} onChange={(v) => updateMf("goodItems", v)} />
              </section>

              <section className="cs-step">
                <p className="cs-stepN"><span>4</span> your main letter ✉️</p>
                <Field label="The big one" hint="Waits in the corner as an envelope, and gets its own LEVEL COMPLETE reveal." count={`${mf.letter.length}/${MAX_LETTER_LEN}`}>
                  <textarea className="cs-input cs-area" rows={7} value={mf.letter} maxLength={MAX_LETTER_LEN} placeholder="Write it like they're reading it at 2am…" onChange={(e) => updateMf("letter", e.target.value.slice(0, MAX_LETTER_LEN))} />
                </Field>
                <label className="cs-check">
                  <input
                    type="checkbox"
                    checked={lockOn}
                    onChange={(e) => {
                      setLockOn(e.target.checked);
                      if (!e.target.checked) {
                        updateMf("lockQuestion", "");
                        updateMf("lockAnswer", "");
                      }
                    }}
                  />
                  <span>Ask a question before it opens (the “no” button runs away 😈)</span>
                </label>
                {lockOn && (
                  <div className="cs-row2">
                    <Field label="The question">
                      <input className="cs-input" value={mf.lockQuestion} maxLength={MAX_LOCK_QUESTION_LEN} placeholder="Ready for the final level?" onChange={(e) => updateMf("lockQuestion", e.target.value.slice(0, MAX_LOCK_QUESTION_LEN))} />
                    </Field>
                    <Field label="The yes button says">
                      <input className="cs-input" value={mf.lockAnswer} maxLength={MAX_LOCK_ANSWER_LEN} placeholder="press start 💖" onChange={(e) => updateMf("lockAnswer", e.target.value.slice(0, MAX_LOCK_ANSWER_LEN))} />
                    </Field>
                  </div>
                )}
              </section>

              <section className="cs-step">
                <p className="cs-stepN"><span>5</span> fine-tune <em>(optional)</em></p>
                <div className="cs-folds">
                  <Fold title="Title screen & ending" sub="The ribbon under the logo, the last line">
                    <Field label="Ribbon under CATCH!" count={`${mf.tagline.length}/${LIMITS.tagline}`}>
                      <input className="cs-input" value={mf.tagline} maxLength={LIMITS.tagline} placeholder={`the ${mf.recipientName.toLowerCase() || "her"} edition 💘`} onChange={(e) => updateMf("tagline", e.target.value.slice(0, LIMITS.tagline))} />
                    </Field>
                    <Field label="The last line of the assembled letter" count={`${mf.closingLine.length}/${LIMITS.closing}`}>
                      <textarea className="cs-input cs-area" rows={2} value={mf.closingLine} maxLength={LIMITS.closing} onChange={(e) => updateMf("closingLine", e.target.value.slice(0, LIMITS.closing))} />
                    </Field>
                  </Fold>
                  <Fold title="Things to dodge" sub="Petty chat bubbles that cost a heart">
                    <BadEditor items={mf.badItems} onChange={(v) => updateMf("badItems", v)} />
                  </Fold>
                  <Fold title="Game length" sub={`${Math.round(mf.durationMs / 1000)} seconds`}>
                    <div className="cs-chips">
                      {DURATIONS.map((d) => (
                        <button key={d} type="button" className={mf.durationMs === d ? "is-on" : ""} onClick={() => updateMf("durationMs", d)}>
                          {d / 1000}s{d === 30000 ? " · quick" : d === 60000 ? " · chill" : ""}
                        </button>
                      ))}
                    </div>
                  </Fold>
                  <Fold title="Password" sub="Optional — they type it to open the game">
                    <input className="cs-input" value={pagePassword} maxLength={128} placeholder="e.g. your first date spot" onChange={(e) => setPagePassword(e.target.value)} />
                  </Fold>
                </div>
              </section>
            </div>

            <div className="cs-foot">
              {missing.length > 0 ? <p className="cs-missing">Still needed: {missing.join(", ")}</p> : <p className="cs-ready">✓ Ready — save and play it once yourself.</p>}
              <button type="button" className="cs-save" onClick={onSave} disabled={saving || missing.length > 0}>
                {saving ? "Saving…" : "Save & play preview ▶"}
              </button>
            </div>
          </motion.div>

          <style>{`
            .cs-scrim { position: fixed; inset: 0; z-index: 200; background: rgba(42,22,64,.45); }
            .cs-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; height: 92dvh; display: flex; flex-direction: column; background: #fff;
              border-radius: 26px 26px 0 0; font-family: ${BODY}; color: ${C.ink}; box-shadow: 0 -16px 50px rgba(42,22,64,.3); }
            @media (min-width: 900px) { .cs-scrim { background: rgba(42,22,64,.18); } .cs-sheet { left: auto; top: 0; height: 100dvh; width: 540px; border-radius: 28px 0 0 28px; } }
            .cs-head { position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 20px 18px 12px; border-bottom: 1px solid #F1EAF8; }
            .cs-grab { position: absolute; top: 7px; left: 50%; width: 42px; height: 5px; margin-left: -21px; border-radius: 5px; background: #E5DCF0; }
            @media (min-width: 900px) { .cs-grab { display: none; } }
            .cs-title { margin: 0; font: 700 23px ${DISPLAY}; }
            .cs-sub { margin: 3px 0 0; font-size: 13px; color: ${C.inkSoft}; line-height: 1.4; }
            .cs-x { margin-left: auto; flex: none; width: 38px; height: 38px; border-radius: 50%; border: 0; background: #F4EFFA; cursor: pointer; font-size: 14px; color: ${C.ink}; }
            .cs-body { flex: 1; overflow-y: auto; padding: 4px 18px 28px; overscroll-behavior: contain; }
            .cs-step { padding: 18px 0 8px; border-bottom: 2px dashed #F1EAF8; }
            .cs-step:last-child { border-bottom: 0; }
            .cs-stepN { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font: 700 17px ${DISPLAY}; color: ${C.ink}; }
            .cs-stepN span { width: 28px; height: 28px; border-radius: 10px; display: grid; place-items: center; background: ${C.pink}; color: #fff; font-size: 15px; box-shadow: 0 3px 0 ${C.pinkDeep}; }
            .cs-stepN em { font-style: normal; font-weight: 500; font-size: 14px; color: ${C.inkSoft}; }
            .cs-row2 { display: grid; gap: 0 12px; }
            @media (min-width: 480px) { .cs-row2 { grid-template-columns: 1fr 1fr; } }
            .cs-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; min-width: 0; }
            .cs-label { display: flex; align-items: baseline; gap: 4px; font-size: 13px; font-weight: 700; }
            .cs-req { color: ${C.pink}; font-style: normal; }
            .cs-count { margin-left: auto; font-weight: 400; font-size: 11.5px; color: ${C.inkSoft}; font-variant-numeric: tabular-nums; }
            .cs-hint { font-size: 12.5px; color: ${C.inkSoft}; line-height: 1.45; display: block; }
            .cs-lead { margin: -4px 0 12px; }
            .cs-input { width: 100%; min-width: 0; padding: 11px 13px; border-radius: 14px; border: 2px solid #EDE5F6; background: #FCFAFE; font: 400 16px ${BODY}; color: ${C.ink}; outline: none; transition: border-color .15s, box-shadow .15s; }
            .cs-input:focus { border-color: ${C.pink}; box-shadow: 0 0 0 4px #FFE0EE; background: #fff; }
            .cs-big { padding: 13px 14px; font-size: 17px; font-weight: 600; }
            .cs-area { resize: vertical; line-height: 1.5; }
            .cs-input--sm { padding: 9px 11px; font-size: 15px; }
            .cs-faceRow { display: flex; gap: 14px; align-items: center; padding: 12px; border-radius: 20px; background: linear-gradient(135deg, #FFF1F8, #F3EEFF); }
            .cs-faceBtn { position: relative; flex: none; border: 0; background: none; padding: 0; cursor: pointer; border-radius: 50%; box-shadow: 0 0 0 4px #fff, 0 0 0 7px ${C.pink}; }
            .cs-faceTag { position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%); padding: 2px 9px; border-radius: 99px; background: ${C.ink}; color: #fff; font: 700 11px ${DISPLAY}; white-space: nowrap; }
            .cs-faceTx { min-width: 0; }
            .cs-faceTx p { margin: 0; font-size: 13px; line-height: 1.45; color: ${C.inkSoft}; }
            .cs-faceTx b { color: ${C.ink}; }
            .cs-faceActs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
            .cs-mini { padding: 7px 12px; border-radius: 99px; border: 2px solid #E5DCF0; background: #fff; font: 600 12.5px ${BODY}; color: ${C.ink}; cursor: pointer; }
            .cs-mini--quiet { border-color: transparent; background: transparent; text-decoration: underline; color: ${C.inkSoft}; }
            .cs-err { color: ${C.pinkDeep} !important; font-weight: 600; margin-top: 6px !important; }
            .cs-pieces { display: grid; gap: 10px; }
            .cs-piece { display: grid; gap: 8px; padding: 10px; border-radius: 18px; border: 2px solid #F1EAF8; background: #FFFBFD; }
            .cs-pieceTop { display: flex; align-items: center; gap: 8px; }
            .cs-pieceN { flex: none; font: 700 13px ${DISPLAY}; color: ${C.pink}; width: 26px; }
            .cs-pieceActs { display: flex; gap: 4px; flex: none; }
            .cs-pieceActs button { width: 30px; height: 30px; border-radius: 10px; border: 2px solid #EDE5F6; background: #fff; cursor: pointer; font-size: 13px; color: ${C.ink}; }
            .cs-pieceActs button:disabled { opacity: .35; cursor: default; }
            .cs-emojiWrap { position: relative; flex: none; }
            .cs-emojiBtn { width: 42px; height: 42px; border-radius: 14px; border: 2px solid #FFD1E6; background: #FFF1F7; font-size: 22px; cursor: pointer; }
            .cs-emojiPop { position: absolute; z-index: 5; top: 48px; left: 0; width: 244px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; padding: 8px; border-radius: 16px; background: #fff; box-shadow: 0 18px 40px -12px rgba(42,22,64,.4); border: 1px solid #F1EAF8; }
            .cs-emojiPop button { height: 34px; border: 0; border-radius: 10px; background: #F9F5FD; font-size: 19px; cursor: pointer; }
            .cs-emojiPop button.is-on { background: #FFE0EE; outline: 2px solid ${C.pink}; }
            .cs-add { padding: 12px; border-radius: 16px; border: 2px dashed ${C.pink}; background: #FFF5FA; color: ${C.pinkDeep}; font: 700 14px ${DISPLAY}; cursor: pointer; }
            .cs-bad { padding: 8px; border-radius: 16px; background: #FAF7FD; }
            .cs-check { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; margin: 2px 0 12px; cursor: pointer; line-height: 1.4; }
            .cs-check input { accent-color: ${C.pink}; width: 18px; height: 18px; margin: 1px 0 0; flex: none; }
            .cs-folds { display: grid; gap: 8px; }
            .cs-fold { border: 2px solid #F1EAF8; border-radius: 16px; overflow: visible; }
            .cs-foldH { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 0; background: none; cursor: pointer; text-align: left; font-family: ${BODY}; color: ${C.ink}; border-radius: 14px; }
            .cs-foldH span:first-child { display: grid; gap: 1px; min-width: 0; }
            .cs-foldH b { font-size: 14.5px; }
            .cs-foldH small { font-size: 12px; color: ${C.inkSoft}; }
            .cs-chev { margin-left: auto; font-size: 18px; color: ${C.inkSoft}; transition: transform .2s; }
            .cs-fold.open .cs-chev { transform: rotate(180deg); }
            .cs-foldB { padding: 4px 14px 14px; display: grid; gap: 4px; }
            .cs-chips { display: flex; gap: 8px; flex-wrap: wrap; }
            .cs-chips button { padding: 9px 14px; border-radius: 99px; border: 2px solid #EDE5F6; background: #fff; font: 600 14px ${BODY}; cursor: pointer; color: ${C.ink}; }
            .cs-chips button.is-on { border-color: ${C.pink}; background: #FFE9F3; color: ${C.pinkDeep}; }
            .cs-foot { padding: 12px 18px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #F1EAF8; background: #fff; display: grid; gap: 8px; }
            .cs-missing { margin: 0; font-size: 13px; color: ${C.pinkDeep}; font-weight: 700; }
            .cs-ready { margin: 0; font-size: 13px; color: ${C.mintDeep}; font-weight: 700; }
            .cs-save { min-height: 54px; border-radius: 18px; border: 0; background: ${C.pink}; color: #fff; font: 700 17px ${DISPLAY}; cursor: pointer; box-shadow: 0 5px 0 ${C.pinkDeep}; transition: transform .12s, box-shadow .12s; }
            .cs-save:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 ${C.pinkDeep}; }
            .cs-save:disabled { opacity: .5; cursor: not-allowed; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
