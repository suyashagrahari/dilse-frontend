"use client";

// The form. One scroll, five short sections, only the two names required.
// Everything else starts filled with something good (the AI fills the rest),
// and the long tail — usernames, zodiacs, milestone letters, weekly notes,
// password — waits behind "More".

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import { MAX_PHOTOS } from "../../_love/types";
import { AVATARS, SKIN_LIMITS, ZODIAC } from "./skin";
import { LIMITS, MAX_STREAK_SEED, MILESTONE_LABELS, validateForm, type EditMode, type StreakForm } from "./editorTypes";
import Bitmoji from "./snap/Bitmoji";
import { FONT } from "./snap/tokens";

const INK = "#16191C";
const MUTE = "#6B6E73";
const LINE = "#E6E7E9";
const BLUE = "#0EADFF";
const YELLOW = "#FFFC00";

const input: CSSProperties = {
  width: "100%",
  border: `1.5px solid ${LINE}`,
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 16,
  fontFamily: FONT,
  color: INK,
  background: "#fff",
  outline: "none",
};

function Section({ emoji, title, note, children }: { emoji: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section style={{ padding: "18px 18px 6px" }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: INK, display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden style={{ fontSize: 20 }}>{emoji}</span>
        {title}
      </h3>
      {note && <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTE, lineHeight: 1.45 }}>{note}</p>}
      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>{children}</div>
    </section>
  );
}

function Field({ label, hint, children, error }: { label: string; hint?: string; children: ReactNode; error?: boolean }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, fontWeight: 800, color: error ? "#E0245E" : INK, marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontWeight: 600, color: MUTE }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function AvatarPick({ value, onChange, label }: { value: string; onChange: (id: string) => void; label: string }) {
  return (
    <div>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: MUTE, marginBottom: 6 }}>{label}</span>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }} role="radiogroup" aria-label={label}>
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={value === a.id}
            onClick={() => onChange(a.id)}
            style={{
              flex: "none",
              padding: 2,
              borderRadius: "50%",
              border: `2.5px solid ${value === a.id ? BLUE : "transparent"}`,
              background: "none",
              cursor: "pointer",
              transform: value === a.id ? "scale(1.06)" : undefined,
              transition: "transform .15s",
            }}
            aria-label={`Avatar ${a.id.slice(1)}`}
          >
            <Bitmoji preset={a.id} size={42} />
          </button>
        ))}
      </div>
    </div>
  );
}

const TZ = ["Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Europe/London", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Toronto", "Australia/Sydney", "UTC"];

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
  restoredDraft,
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: StreakForm;
  updateMf: <K extends keyof StreakForm>(key: K, val: StreakForm[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  restoredDraft?: boolean;
}) {
  const [more, setMore] = useState(false);
  const [lockOpen, setLock] = useState(false);
  const lock = lockOpen || Boolean(mf.lockQuestion);
  const [tried, setTried] = useState(false);
  const problem = validateForm(mf);
  const missing = useMemo(() => {
    const m: string[] = [];
    if (!mf.nameA.trim()) m.push("your name");
    if (!mf.nameB.trim()) m.push("their name");
    return m;
  }, [mf.nameA, mf.nameB]);
  const tzList = TZ.includes(mf.timezone) ? TZ : [mf.timezone, ...TZ];
  const open = editMode === "manual";

  const save = () => {
    setTried(true);
    onSave();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
            style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(0,0,0,.45)" }}
          />
          <motion.aside
            key="sheet"
            className="stkSheet"
            role="dialog"
            aria-modal="true"
            aria-label="Make your streak"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            style={{ fontFamily: FONT, color: INK }}
          >
            <style>{`
              .stkSheet { position: fixed; z-index: 141; left: 0; right: 0; bottom: 0; height: 94dvh; background: #fff; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; box-shadow: 0 -20px 60px -20px rgba(0,0,0,.4); }
              @media (min-width: 900px) { .stkSheet { left: auto; top: 0; height: 100dvh; width: 480px; border-radius: 24px 0 0 24px; } }
              .stkSheet input:focus, .stkSheet textarea:focus, .stkSheet select:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(14,173,255,.15); }
              .stkChip { border: 1.5px solid ${LINE}; background: #fff; border-radius: 99px; padding: 7px 12px; font: 700 13px ${FONT}; color: ${INK}; cursor: pointer; }
              .stkChip.is-on { background: ${INK}; color: #fff; border-color: ${INK}; }
              .stkTwo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              @media (max-width: 380px) { .stkTwo { grid-template-columns: 1fr; } }
            `}</style>

            <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 10px", borderBottom: `1px solid ${LINE}` }}>
              <span aria-hidden style={{ width: 34, height: 34, borderRadius: 10, background: YELLOW, display: "grid", placeItems: "center", fontSize: 18 }}>🔥</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: "block", fontSize: 17 }}>Make your streak</b>
                <span style={{ fontSize: 12.5, color: MUTE }}>{restoredDraft ? "we saved where you left off 💛" : "two names and you're basically done"}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{ width: 38, height: 38, borderRadius: "50%", border: 0, background: "#F0F0F2", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </header>

            <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", paddingBottom: 12 }}>
              <Section emoji="👯" title="The two of you" note="Your name goes on the snaps. Theirs goes on the chat, the streak and the letter.">
                <div className="stkTwo">
                  <Field label="Your name" error={tried && !mf.nameA.trim()}>
                    <input
                      style={{ ...input, borderColor: tried && !mf.nameA.trim() ? "#F4A3BC" : LINE }}
                      value={mf.nameA}
                      maxLength={LIMITS.name}
                      onChange={(e) => updateMf("nameA", e.target.value)}
                      placeholder="Ananya"
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="Their name" error={tried && !mf.nameB.trim()}>
                    <input
                      style={{ ...input, borderColor: tried && !mf.nameB.trim() ? "#F4A3BC" : LINE }}
                      value={mf.nameB}
                      maxLength={LIMITS.name}
                      onChange={(e) => updateMf("nameB", e.target.value)}
                      placeholder="Rohan"
                    />
                  </Field>
                </div>
                <AvatarPick label="Your avatar" value={mf.avatarA} onChange={(v) => updateMf("avatarA", v)} />
                <AvatarPick label="Their avatar" value={mf.avatarB} onChange={(v) => updateMf("avatarB", v)} />
              </Section>

              <Section emoji="🔥" title="Your streak" note="How many days have you two already been going? It never resets — miss a day and it pauses.">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button type="button" className="stkChip" onClick={() => updateMf("streakDays", Math.max(0, (Number(mf.streakDays) || 0) - 1))} aria-label="One day less">−</button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX_STREAK_SEED}
                    value={mf.streakDays}
                    onChange={(e) => updateMf("streakDays", Math.max(0, Math.min(MAX_STREAK_SEED, Math.round(Number(e.target.value) || 0))))}
                    aria-label="Streak days"
                    style={{ ...input, width: 110, textAlign: "center", fontSize: 22, fontWeight: 800, padding: "8px 10px" }}
                  />
                  <button type="button" className="stkChip" onClick={() => updateMf("streakDays", Math.min(MAX_STREAK_SEED, (Number(mf.streakDays) || 0) + 1))} aria-label="One day more">+</button>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>days 🔥</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[0, 7, 30, 84, 100, 365].map((n) => (
                    <button key={n} type="button" className={`stkChip${Number(mf.streakDays) === n ? " is-on" : ""}`} onClick={() => updateMf("streakDays", n)}>
                      {n === 0 ? "start today" : `${n}`}
                    </button>
                  ))}
                </div>
                <Field label="Friends since" hint="shows on your friendship profile">
                  <input type="date" style={input} value={mf.startedOn} onChange={(e) => updateMf("startedOn", e.target.value)} />
                </Field>
              </Section>

              <Section emoji="📸" title="Memories" note={`Add up to ${MAX_PHOTOS} photos. Crop them, give each a caption and a little note — they become your stories, snaps and memories.`}>
                <PhotosEditor
                  photos={mf.photos}
                  onChange={(next) => updateMf("photos", next)}
                  captionHint="caption — e.g. first date 🍝"
                  noteHint="the thing you'd whisper about this photo…"
                />
              </Section>

              <Section emoji="💌" title="Your letter" note="It hides in their chat as a snap — they tap it and it plays full-screen. Leave it empty if you don't want one.">
                <Field label="The letter" hint={`${mf.letter.length}/${SKIN_LIMITS.letter}`}>
                  <textarea
                    value={mf.letter}
                    maxLength={SKIN_LIMITS.letter}
                    onChange={(e) => updateMf("letter", e.target.value)}
                    placeholder={"Rohan,\n\nI know, I know. I'm the one who laughed at streaks…"}
                    rows={7}
                    style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
                  />
                </Field>
                {!lock ? (
                  <button type="button" className="stkChip" style={{ justifySelf: "start" }} onClick={() => setLock(true)}>
                    ＋ ask a question before it opens
                  </button>
                ) : (
                  <div className="stkTwo">
                    <Field label="Question" hint="optional">
                      <input
                        style={input}
                        value={mf.lockQuestion}
                        maxLength={SKIN_LIMITS.lockQuestion}
                        onChange={(e) => updateMf("lockQuestion", e.target.value)}
                        placeholder="are you snapping me back today?"
                      />
                    </Field>
                    <Field label="Yes button">
                      <input
                        style={input}
                        value={mf.lockAnswer}
                        maxLength={SKIN_LIMITS.lockAnswer}
                        onChange={(e) => updateMf("lockAnswer", e.target.value)}
                        placeholder="obviously 🔥"
                      />
                    </Field>
                  </div>
                )}
              </Section>

              <div style={{ padding: "16px 18px 0" }}>
                <button
                  type="button"
                  onClick={() => setMore((m) => !m)}
                  aria-expanded={more}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1.5px solid ${LINE}`, borderRadius: 16, padding: "14px 16px", background: "#FAFAFB", font: `800 15px ${FONT}`, color: INK, cursor: "pointer" }}
                >
                  ✨ More — usernames, zodiac, sealed letters, password
                  <span aria-hidden style={{ transform: more ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>⌄</span>
                </button>
              </div>

              {more && (
                <>
                  <Section emoji="🪪" title="Profile bits">
                    <div className="stkTwo">
                      <Field label="Your username">
                        <input style={input} value={mf.handleA} maxLength={SKIN_LIMITS.handle} onChange={(e) => updateMf("handleA", e.target.value)} placeholder="ananya.bby" />
                      </Field>
                      <Field label="Their username">
                        <input style={input} value={mf.handleB} maxLength={SKIN_LIMITS.handle} onChange={(e) => updateMf("handleB", e.target.value)} placeholder="rohan_irl" />
                      </Field>
                      <Field label="Your sign">
                        <select style={input} value={mf.zodiacA} onChange={(e) => updateMf("zodiacA", e.target.value)}>
                          <option value="">—</option>
                          {ZODIAC.map((z) => <option key={z.id} value={z.id}>{z.glyph} {z.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Their sign">
                        <select style={input} value={mf.zodiacB} onChange={(e) => updateMf("zodiacB", e.target.value)}>
                          <option value="">—</option>
                          {ZODIAC.map((z) => <option key={z.id} value={z.id}>{z.glyph} {z.name}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Your spot on the map" hint="where both avatars stand">
                      <input style={input} value={mf.mapPlace} maxLength={SKIN_LIMITS.place} onChange={(e) => updateMf("mapPlace", e.target.value)} placeholder="our chai tapri" />
                    </Field>
                  </Section>

                  <Section emoji="💬" title="Saved in chat" note="Little lines from you that type themselves into their chat, one per line.">
                    <textarea
                      value={mf.chats.join("\n")}
                      onChange={(e) => updateMf("chats", e.target.value.split("\n").slice(0, SKIN_LIMITS.maxChats))}
                      rows={4}
                      style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
                      placeholder={"3 am thought: i'd pick you in every timeline 💛"}
                    />
                  </Section>

                  <Section emoji="🔒" title="Sealed streak letters" note="They unlock when your streak hits the number — a reason to keep snapping.">
                    {mf.letters.map((l, i) => (
                      <Field key={l.atDay} label={`Letter · ${MILESTONE_LABELS[l.atDay] ?? l.atDay}`}>
                        <textarea
                          value={l.letter}
                          maxLength={LIMITS.letter}
                          rows={3}
                          onChange={(e) => updateMf("letters", mf.letters.map((x, j) => (j === i ? { ...x, letter: e.target.value } : x)))}
                          style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
                        />
                      </Field>
                    ))}
                  </Section>

                  <Section emoji="🗓️" title="Weekly notes" note="One line unlocks every 7 days of streak.">
                    {mf.microLines.map((line, i) => (
                      <Field key={i} label={`Week ${i + 1}`}>
                        <input
                          style={input}
                          value={line}
                          maxLength={LIMITS.microLine}
                          onChange={(e) => updateMf("microLines", mf.microLines.map((x, j) => (j === i ? e.target.value : x)))}
                        />
                      </Field>
                    ))}
                    {mf.microLines.length < 12 && (
                      <button type="button" className="stkChip" style={{ justifySelf: "start" }} onClick={() => updateMf("microLines", [...mf.microLines, ""])}>
                        ＋ add week {mf.microLines.length + 1}
                      </button>
                    )}
                  </Section>

                  <Section emoji="⚙️" title="Settings">
                    <Field label="Time zone" hint="one 'today' for both of you">
                      <select style={input} value={mf.timezone} onChange={(e) => updateMf("timezone", e.target.value)}>
                        {tzList.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
                      </select>
                    </Field>
                    <Field label="Password" hint="optional">
                      <input style={input} value={pagePassword} maxLength={128} onChange={(e) => setPagePassword(e.target.value)} placeholder="only they know it" />
                    </Field>
                  </Section>
                </>
              )}
            </div>

            <footer style={{ padding: "10px 16px calc(12px + env(safe-area-inset-bottom, 0px))", borderTop: `1px solid ${LINE}`, background: "#fff" }}>
              {missing.length > 0 && (
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: tried ? "#E0245E" : MUTE, textAlign: "center" }}>
                  still needed: {missing.join(" + ")}
                </p>
              )}
              <button
                type="button"
                onClick={save}
                disabled={saving}
                style={{
                  width: "100%",
                  height: 54,
                  border: 0,
                  borderRadius: 99,
                  background: problem ? "#F2F2F3" : YELLOW,
                  color: INK,
                  font: `800 17px ${FONT}`,
                  cursor: "pointer",
                  boxShadow: problem ? "none" : "0 10px 26px -12px rgba(230,200,0,.9)",
                }}
              >
                {saving ? "Saving…" : "Save & preview 🔥"}
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
