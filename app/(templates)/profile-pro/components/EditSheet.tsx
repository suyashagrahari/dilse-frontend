"use client";

// ─── Endorsements — the form ─────────────────────────────────────────────────
//
// Four short steps and a folded "fine-tune". The guided AI questions have
// already written every word by the time this opens; what's left for a human is
// the photos (upload → crop/zoom → caption + note), a read of the headline and
// the letter. Everything else is one tap away in the folds.

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { clampCrop, type Crop } from "../../dedication/components/types";
import { MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN, type LovePhoto } from "../../_love/types";
import { LIMITS, missingForSave } from "./data";
import { LI, PP } from "./theme";
import { Pic } from "./ui";
import type { EditMode, ProfileExperience, ProfilePerson, ProfileProData, ProfileSkill } from "./types";

type Update = (key: keyof ProfileProData, val: unknown) => void;

function Field({ label, hint, count, required, children }: { label: string; hint?: string; count?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="ps-field">
      <span className="ps-label">
        {label}
        {required && <i className="ps-req">*</i>}
        {count && <span className="ps-count">{count}</span>}
      </span>
      {children}
      {hint && <span className="ps-hint">{hint}</span>}
    </label>
  );
}

function Fold({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ps-fold${open ? " open" : ""}`}>
      <button type="button" className="ps-foldH" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        <span className="ps-chev" aria-hidden>⌄</span>
      </button>
      {open && <div className="ps-foldB">{children}</div>}
    </div>
  );
}

/** One photo slot (profile photo or cover) with upload → crop/zoom → replace → remove. */
function PhotoSlot({
  label,
  hint,
  url,
  crop,
  round,
  onUrl,
  onCrop,
}: {
  label: string;
  hint: string;
  url: string;
  crop: Crop;
  round?: boolean;
  onUrl: (u: string) => void;
  onCrop: (c: Crop) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [adjust, setAdjust] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      onUrl(await compressImage(f, round ? 900 : 1600));
      onCrop({ x: 50, y: 50, scale: 100 });
      setAdjust(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo couldn't be read");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="ps-slot">
      <button
        type="button"
        className={`ps-slotPic${round ? " is-round" : ""}`}
        onClick={() => (url ? setAdjust(true) : ref.current?.click())}
        aria-label={url ? `Crop and zoom ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      >
        {url ? <Pic url={url} x={crop.x} y={crop.y} scale={crop.scale} className="ps-slotImg" /> : <span className="ps-slotPlus">+</span>}
        <span className="ps-slotTag">{url ? "crop" : "add"}</span>
      </button>
      <div className="ps-slotTx">
        <b>{label}</b>
        <p>{hint}</p>
        <div className="ps-slotActs">
          <button type="button" className="ps-mini" onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? "adding…" : url ? "replace" : "upload"}
          </button>
          {url && (
            <>
              <button type="button" className="ps-mini" onClick={() => setAdjust(true)}>crop / zoom</button>
              <button type="button" className="ps-mini ps-mini--quiet" onClick={() => onUrl("")}>remove</button>
            </>
          )}
        </div>
        {err && <p className="ps-err">{err}</p>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
      <PhotoAdjuster open={adjust && !!url} src={url} crop={crop} title={`Frame ${label.toLowerCase()}`} onChange={onCrop} onClose={() => setAdjust(false)} onReplace={() => ref.current?.click()} />
    </div>
  );
}

function ExperienceEditor({ items, onChange }: { items: ProfileExperience[]; onChange: (v: ProfileExperience[]) => void }) {
  const patch = (i: number, p: Partial<ProfileExperience>) => onChange(items.map((e, j) => (j === i ? { ...e, ...p } : e)));
  return (
    <div className="ps-rows">
      {items.map((e, i) => (
        <div key={i} className="ps-rowCard">
          <div className="ps-rowTop">
            <span className="ps-rowN">Chapter {i + 1}</span>
            <button type="button" className="ps-x2" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove chapter ${i + 1}`}>✕</button>
          </div>
          <div className="ps-row2">
            <input className="ps-input" value={e.role} maxLength={LIMITS.role} placeholder="Role — e.g. Girlfriend" aria-label="Role" onChange={(ev) => patch(i, { role: ev.target.value })} />
            <input className="ps-input" value={e.company} maxLength={LIMITS.company} placeholder="Company — e.g. Sharma & Sons" aria-label="Company" onChange={(ev) => patch(i, { company: ev.target.value })} />
            <input className="ps-input" value={e.duration} maxLength={LIMITS.duration} placeholder="Mar 2023 – Present" aria-label="Dates" onChange={(ev) => patch(i, { duration: ev.target.value })} />
            <input className="ps-input" value={e.type} maxLength={40} placeholder="Full-time" aria-label="Type" onChange={(ev) => patch(i, { type: ev.target.value })} />
          </div>
          <textarea
            className="ps-input ps-area"
            rows={3}
            value={e.bullets.join("\n")}
            placeholder={"One achievement per line\nReduced his overthinking by 12% QoQ"}
            aria-label="Achievements, one per line"
            onChange={(ev) => patch(i, { bullets: ev.target.value.split("\n").slice(0, 6) })}
          />
        </div>
      ))}
      {items.length < 6 && (
        <button type="button" className="ps-add" onClick={() => onChange([...items, { role: "", company: "", type: "Full-time", duration: "", location: "", bullets: [] }])}>
          + add a chapter
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
  mf: ProfileProData;
  updateMf: Update;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = editMode === "manual";
  const [lockOn, setLockOn] = useState(() => !!mf.lockQuestion.trim());
  const missing = missingForSave(mf);
  const p = mf.person;
  const setP = (patch: Partial<ProfilePerson>) => updateMf("person", { ...mf.person, ...patch });
  const edu = mf.education[0] ?? { school: "", degree: "", years: "", note: "" };
  const setEdu = (patch: Partial<typeof edu>) => updateMf("education", [{ ...edu, ...patch }, ...mf.education.slice(1)]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="ps-scrim" className="ps-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} />
          <motion.div
            key="ps-sheet"
            className="ps-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Build their profile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="ps-head">
              <span className="ps-grab" aria-hidden />
              <div style={{ minWidth: 0 }}>
                <p className="ps-title">Build their profile 💼</p>
                <p className="ps-sub">Names, photos, the recommendation. Everything else is already written — tweak anything.</p>
              </div>
              <button type="button" className="ps-x" onClick={() => setEditMode("preview")} aria-label="Close">✕</button>
            </div>

            <div className="ps-body">
              <section className="ps-step">
                <p className="ps-stepN"><span>1</span> who&apos;s this for</p>
                <div className="ps-row2">
                  <Field label="Their name" required>
                    <input className="ps-input ps-big" value={p.name} maxLength={LIMITS.name} placeholder="Meera Sharma" onChange={(e) => setP({ name: e.target.value })} />
                  </Field>
                  <Field label="Your name" required hint="Signs the recommendation">
                    <input className="ps-input ps-big" value={mf.senderName} maxLength={LIMITS.name} placeholder="Kabir" onChange={(e) => updateMf("senderName", e.target.value)} />
                  </Field>
                </div>
                <PhotoSlot
                  label="Profile photo"
                  hint="Their face, in the round frame with the #OPENTOFOREVER ring."
                  round
                  url={p.photoUrl}
                  crop={clampCrop({ x: p.photoCropX ?? 50, y: p.photoCropY ?? 50, scale: p.photoScale ?? 100 })}
                  onUrl={(u) => setP({ photoUrl: u })}
                  onCrop={(c) => setP({ photoCropX: c.x, photoCropY: c.y, photoScale: c.scale })}
                />
                <PhotoSlot
                  label="Cover photo"
                  hint="The wide banner behind it — a place, a sunset, the two of you."
                  url={p.bannerUrl ?? ""}
                  crop={clampCrop({ x: p.bannerCropX ?? 50, y: p.bannerCropY ?? 50, scale: p.bannerScale ?? 100 })}
                  onUrl={(u) => setP({ bannerUrl: u })}
                  onCrop={(c) => setP({ bannerCropX: c.x, bannerCropY: c.y, bannerScale: c.scale })}
                />
              </section>

              <section className="ps-step">
                <p className="ps-stepN"><span>2</span> the headline</p>
                <Field label="Headline" required count={`${p.headline.length}/${LIMITS.headline}`} hint="The line under their name. Job titles, straight face.">
                  <input className="ps-input ps-big" value={p.headline} maxLength={LIMITS.headline} placeholder="Professional Girlfriend | Serial Overthinker" onChange={(e) => setP({ headline: e.target.value })} />
                </Field>
                <div className="ps-row2">
                  <Field label="Open to…" hint='Shows as "Open to being right"'>
                    <input className="ps-input" value={p.openTo ?? ""} maxLength={LIMITS.openTo} placeholder="being right" onChange={(e) => setP({ openTo: e.target.value })} />
                  </Field>
                  <Field label="Location">
                    <input className="ps-input" value={p.location} maxLength={LIMITS.location} placeholder="Bengaluru, Karnataka, India" onChange={(e) => setP({ location: e.target.value })} />
                  </Field>
                </div>
              </section>

              <section className="ps-step">
                <p className="ps-stepN"><span>3</span> memories 📸</p>
                <p className="ps-hint ps-lead">5–10 photos works best. They become the <b>Featured</b> carousel and the pictures on their posts. Tap a photo to crop &amp; zoom; write a caption and a little note on each.</p>
                <PhotosEditor photos={mf.photos} onChange={(v: LovePhoto[]) => updateMf("photos", v)} captionHint="caption — e.g. the first sunset" noteHint="the little note that opens with it…" />
              </section>

              <section className="ps-step">
                <p className="ps-stepN"><span>4</span> your recommendation ✍️</p>
                <Field label="The main letter" hint="Arrives as a message in the corner, and opens as a formal recommendation letter signed by you." count={`${mf.letter.length}/${MAX_LETTER_LEN}`}>
                  <textarea className="ps-input ps-area" rows={8} value={mf.letter} maxLength={MAX_LETTER_LEN} placeholder="I've been asked to write a recommendation, so here it is, on the record…" onChange={(e) => updateMf("letter", e.target.value.slice(0, MAX_LETTER_LEN))} />
                </Field>
                <label className="ps-check">
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
                  <span>Make it a message request they have to accept (the “Ignore” button runs away 😈)</span>
                </label>
                {lockOn && (
                  <div className="ps-row2">
                    <Field label="The question">
                      <input className="ps-input" value={mf.lockQuestion} maxLength={MAX_LOCK_QUESTION_LEN} placeholder="Kabir wants to send you a recommendation. Accept?" onChange={(e) => updateMf("lockQuestion", e.target.value)} />
                    </Field>
                    <Field label="The accept button says">
                      <input className="ps-input" value={mf.lockAnswer} maxLength={MAX_LOCK_ANSWER_LEN} placeholder="Accept 💙" onChange={(e) => updateMf("lockAnswer", e.target.value)} />
                    </Field>
                  </div>
                )}
              </section>

              <section className="ps-step">
                <p className="ps-stepN"><span>5</span> fine-tune <em>(optional)</em></p>
                <div className="ps-folds">
                  <Fold title="About" sub="Two or three paragraphs, first person">
                    <textarea className="ps-input ps-area" rows={7} value={mf.about.join("\n\n")} placeholder="Results-driven partner with 3+ years of experience…" onChange={(e) => updateMf("about", e.target.value.split(/\n{2,}/).slice(0, 8))} />
                  </Fold>
                  <Fold title="Experience" sub={`${mf.experience.length} chapters of your story`}>
                    <ExperienceEditor items={mf.experience} onChange={(v) => updateMf("experience", v)} />
                  </Fold>
                  <Fold title="Skills" sub="One per line — friends endorse these">
                    <textarea
                      className="ps-input ps-area"
                      rows={6}
                      value={mf.skills.map((s) => s.label).join("\n")}
                      onChange={(e) => {
                        const labels = e.target.value.split("\n").slice(0, LIMITS.maxSkills);
                        const prev = mf.skills;
                        updateMf(
                          "skills",
                          labels.map((label, i) => (prev[i] ? { ...prev[i], label } : ({ id: `skill-${Date.now() % 100000}-${i}`, label, endorsements: mf.senderName ? 1 : 0, topEndorsers: mf.senderName ? [mf.senderName] : [], isTop3: i < 3 } as ProfileSkill))),
                        );
                      }}
                    />
                  </Fold>
                  <Fold title="Posts" sub="Their Activity — the humble-brag posts">
                    {[0, 1].map((i) => (
                      <Field key={i} label={`Post ${i + 1}`} count={`${(mf.posts[i]?.text ?? "").length}/${LIMITS.post}`}>
                        <textarea
                          className="ps-input ps-area"
                          rows={4}
                          value={mf.posts[i]?.text ?? ""}
                          maxLength={LIMITS.post}
                          placeholder={i === 0 ? "I'm happy to share that I've been promoted to…" : "What 4 years of arguing about the fan taught me about leadership 👇"}
                          onChange={(e) => {
                            const next = [...mf.posts];
                            next[i] = { id: next[i]?.id || `post-${i}`, ago: next[i]?.ago || (i === 0 ? "2w" : "1mo"), text: e.target.value };
                            updateMf("posts", next);
                          }}
                        />
                      </Field>
                    ))}
                  </Fold>
                  <Fold title="Education" sub="Where they learned it all">
                    <div className="ps-row2">
                      <input className="ps-input" value={edu.school} maxLength={LIMITS.school} placeholder="School" aria-label="School" onChange={(e) => setEdu({ school: e.target.value })} />
                      <input className="ps-input" value={edu.years} maxLength={LIMITS.years} placeholder="2019 – 2022" aria-label="Years" onChange={(e) => setEdu({ years: e.target.value })} />
                    </div>
                    <input className="ps-input" value={edu.degree} maxLength={LIMITS.degree} placeholder="Degree" aria-label="Degree" onChange={(e) => setEdu({ degree: e.target.value })} />
                    <input className="ps-input" value={edu.note} maxLength={LIMITS.note} placeholder="Thesis / note" aria-label="Note" onChange={(e) => setEdu({ note: e.target.value })} />
                  </Fold>
                  <Fold title="Certifications & languages" sub='One per line, "Name: issued by"'>
                    <Field label="Certifications">
                      <textarea
                        className="ps-input ps-area"
                        rows={3}
                        value={(mf.certifications ?? []).map((c) => (c.issuer ? `${c.name}: ${c.issuer}` : c.name)).join("\n")}
                        onChange={(e) =>
                          updateMf(
                            "certifications",
                            e.target.value.split("\n").slice(0, 8).map((line, i) => {
                              const k = line.indexOf(":");
                              return { name: k < 0 ? line : line.slice(0, k).trim(), issuer: k < 0 ? "" : line.slice(k + 1).trim(), date: mf.certifications?.[i]?.date || "No expiry" };
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Languages">
                      <textarea
                        className="ps-input ps-area"
                        rows={3}
                        value={mf.languages.map((l) => (l.level ? `${l.name}: ${l.level}` : l.name)).join("\n")}
                        onChange={(e) =>
                          updateMf(
                            "languages",
                            e.target.value.split("\n").slice(0, LIMITS.maxLanguages).map((line) => {
                              const k = line.indexOf(":");
                              return { name: k < 0 ? line : line.slice(0, k).trim(), level: k < 0 ? "" : line.slice(k + 1).trim() };
                            }),
                          )
                        }
                      />
                    </Field>
                  </Fold>
                  <Fold title="The little details" sub="Connections line, the note for their friends">
                    <Field label="Connections line">
                      <input className="ps-input" value={p.connections} maxLength={LIMITS.connections} placeholder="1 connection (the important one)" onChange={(e) => setP({ connections: e.target.value })} />
                    </Field>
                    <Field label="What their friends see when you ask them to endorse" count={`${mf.contributorPrompt.length}/${LIMITS.prompt}`}>
                      <textarea className="ps-input ps-area" rows={2} value={mf.contributorPrompt} maxLength={LIMITS.prompt} onChange={(e) => updateMf("contributorPrompt", e.target.value)} />
                    </Field>
                  </Fold>
                  <Fold title="Password" sub="Optional — they type it to open the profile">
                    <input className="ps-input" value={pagePassword} maxLength={128} placeholder="e.g. your first date spot" onChange={(e) => setPagePassword(e.target.value)} />
                  </Fold>
                </div>
              </section>
            </div>

            <div className="ps-foot">
              {missing.length > 0 ? <p className="ps-missing">Still needed: {missing.join(", ")}</p> : <p className="ps-ready">✓ Ready — save and read it back once.</p>}
              <button type="button" className="ps-save" onClick={onSave} disabled={saving || missing.length > 0}>
                {saving ? "Saving…" : "Save & preview"}
              </button>
            </div>
          </motion.div>

          <style>{`
            .ps-scrim { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); }
            .ps-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; height: 92dvh; display: flex; flex-direction: column; background: #fff;
              border-radius: 16px 16px 0 0; font-family: ${PP.font}; color: ${PP.ink}; box-shadow: 0 -16px 50px rgba(0,0,0,.25); }
            @media (min-width: 900px) { .ps-scrim { background: rgba(0,0,0,.2); } .ps-sheet { left: auto; top: 0; height: 100dvh; width: 540px; border-radius: 12px 0 0 12px; } }
            .ps-head { position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 20px 18px 12px; border-bottom: 1px solid ${LI.line}; }
            .ps-grab { position: absolute; top: 7px; left: 50%; width: 40px; height: 4px; margin-left: -20px; border-radius: 4px; background: #D9D9D9; }
            @media (min-width: 900px) { .ps-grab { display: none; } }
            .ps-title { margin: 0; font-size: 20px; font-weight: 600; }
            .ps-sub { margin: 3px 0 0; font-size: 13px; color: ${LI.mute}; line-height: 1.4; }
            .ps-x { margin-left: auto; flex: none; width: 36px; height: 36px; border-radius: 50%; border: 0; background: ${LI.hover}; cursor: pointer; font-size: 14px; color: ${PP.ink}; }
            .ps-body { flex: 1; overflow-y: auto; padding: 4px 18px 28px; overscroll-behavior: contain; }
            .ps-step { padding: 18px 0 8px; border-bottom: 1px solid ${LI.line}; }
            .ps-step:last-child { border-bottom: 0; }
            .ps-stepN { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 16px; font-weight: 600; }
            .ps-stepN span { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: ${LI.blue}; color: #fff; font-size: 13px; }
            .ps-stepN em { font-style: normal; font-weight: 400; font-size: 14px; color: ${LI.mute}; }
            .ps-row2 { display: grid; gap: 8px 12px; }
            @media (min-width: 480px) { .ps-row2 { grid-template-columns: 1fr 1fr; } }
            .ps-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; min-width: 0; }
            .ps-label { display: flex; align-items: baseline; gap: 4px; font-size: 13px; font-weight: 600; color: ${LI.mute}; }
            .ps-req { color: #CB112D; font-style: normal; }
            .ps-count { margin-left: auto; font-weight: 400; font-size: 11.5px; font-variant-numeric: tabular-nums; }
            .ps-hint { font-size: 12.5px; color: ${LI.mute}; line-height: 1.45; display: block; }
            .ps-lead { margin: -4px 0 12px; }
            .ps-input { width: 100%; min-width: 0; padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(0,0,0,.6); background: #fff; font: 400 16px ${PP.font}; color: ${PP.ink}; outline: none; transition: box-shadow .15s; }
            .ps-input:focus { box-shadow: inset 0 0 0 1px ${PP.ink}; border-color: ${PP.ink}; }
            .ps-big { padding: 12px; font-size: 17px; }
            .ps-area { resize: vertical; line-height: 1.5; }
            .ps-foldB > .ps-input + .ps-input, .ps-foldB > .ps-row2 + .ps-input { margin-top: 8px; }
            .ps-slot { display: flex; gap: 14px; align-items: center; padding: 12px; margin-top: 8px; border-radius: 10px; background: #F3F6F8; }
            .ps-slotPic { position: relative; flex: none; width: 128px; height: 44px; padding: 0; border: 0; border-radius: 6px; overflow: hidden; background: #DCE6F1; cursor: pointer; }
            .ps-slotPic.is-round { width: 76px; height: 76px; border-radius: 50%; box-shadow: 0 0 0 3px #fff, 0 0 0 5px ${LI.greenFrame}; }
            .ps-slotImg { position: absolute !important; inset: 0; }
            .ps-slotPlus { font-size: 26px; color: ${LI.blue}; }
            .ps-slotTag { position: absolute; left: 50%; bottom: 3px; transform: translateX(-50%); padding: 1px 7px; border-radius: 99px; background: rgba(0,0,0,.65); color: #fff; font-size: 10px; font-weight: 700; }
            .ps-slotTx { min-width: 0; }
            .ps-slotTx b { font-size: 14px; }
            .ps-slotTx p { margin: 2px 0 0; font-size: 12.5px; line-height: 1.4; color: ${LI.mute}; }
            .ps-slotActs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
            .ps-mini { padding: 5px 12px; border-radius: 99px; border: 0; box-shadow: inset 0 0 0 1px ${LI.blue}; background: #fff; font: 600 13px ${PP.font}; color: ${LI.blue}; cursor: pointer; }
            .ps-mini--quiet { box-shadow: none; background: transparent; color: ${LI.mute}; text-decoration: underline; }
            .ps-err { color: #CB112D !important; font-weight: 600; }
            .ps-rows { display: grid; gap: 10px; }
            .ps-rowCard { display: grid; gap: 8px; padding: 10px; border-radius: 10px; border: 1px solid ${LI.line2}; }
            .ps-rowTop { display: flex; align-items: center; justify-content: space-between; }
            .ps-rowN { font-size: 12px; font-weight: 700; color: ${LI.blue}; text-transform: uppercase; letter-spacing: .06em; }
            .ps-x2 { width: 28px; height: 28px; border-radius: 50%; border: 0; background: ${LI.hover}; cursor: pointer; }
            .ps-add { padding: 11px; border-radius: 99px; border: 0; box-shadow: inset 0 0 0 1px ${LI.blue}; background: #fff; color: ${LI.blue}; font: 600 14px ${PP.font}; cursor: pointer; }
            .ps-check { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; margin: 2px 0 12px; cursor: pointer; line-height: 1.4; }
            .ps-check input { accent-color: ${LI.blue}; width: 18px; height: 18px; margin: 1px 0 0; flex: none; }
            .ps-folds { display: grid; gap: 8px; }
            .ps-fold { border: 1px solid ${LI.line2}; border-radius: 10px; }
            .ps-foldH { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 0; background: none; cursor: pointer; text-align: left; font-family: ${PP.font}; color: ${PP.ink}; border-radius: 10px; }
            .ps-foldH span:first-child { display: grid; gap: 1px; min-width: 0; }
            .ps-foldH b { font-size: 14.5px; font-weight: 600; }
            .ps-foldH small { font-size: 12px; color: ${LI.mute}; }
            .ps-chev { margin-left: auto; font-size: 18px; color: ${LI.mute}; transition: transform .2s; }
            .ps-fold.open .ps-chev { transform: rotate(180deg); }
            .ps-foldB { padding: 4px 14px 14px; display: grid; gap: 4px; }
            .ps-foot { padding: 12px 18px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid ${LI.line}; background: #fff; display: grid; gap: 8px; }
            .ps-missing { margin: 0; font-size: 13px; color: #CB112D; font-weight: 600; }
            .ps-ready { margin: 0; font-size: 13px; color: ${LI.green}; font-weight: 600; }
            .ps-save { min-height: 50px; border-radius: 99px; border: 0; background: ${LI.blue}; color: #fff; font: 600 17px ${PP.font}; cursor: pointer; transition: background .15s, transform .12s; }
            .ps-save:hover:not(:disabled) { background: ${LI.blueDeep}; }
            .ps-save:active:not(:disabled) { transform: scale(.98); }
            .ps-save:disabled { opacity: .5; cursor: not-allowed; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
