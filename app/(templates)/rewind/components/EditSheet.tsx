"use client";

// ─── Rewind — the form ───────────────────────────────────────────────────────
//
// One scrolling sheet (bottom sheet on phones, right-hand drawer on wide
// screens so the app stays visible beside it). Four friendly steps — who and
// since when, the memories, your songs, the bonus-track letter — and the rest
// folded under "Fine-tune". Every number in the story is worked out from the
// date, so there is nothing to count. Save says exactly what is missing.

import { useState, type ReactNode } from "react";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import { validateStartDate } from "../hooks/useRewindEditor";
import { QUESTIONS, REWIND_LIMITS as L, computeArchetype, deriveStats, parseSong, type EditMode, type RewindData, type Stat } from "./types";

export function missingForSave(d: RewindData): string[] {
  const out: string[] = [];
  if (!d.recipientName.trim()) out.push("their name");
  const dp = validateStartDate(d.startDate);
  if (dp) out.push(dp.kind === "future" ? "a date that isn't in the future" : "the date it started");
  return out;
}

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: RewindData;
  updateMf: (key: keyof RewindData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

const pad = (a: string[], n: number) => [...a, ...Array(Math.max(0, n - a.length)).fill("")].slice(0, n);

export default function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: Props) {
  const [lockPicked, setLockPicked] = useState(false);
  if (editMode !== "manual") return null;
  const lockOn = lockPicked || !!mf.lockQuestion.trim();
  const missing = missingForSave(mf);
  const close = () => setEditMode("preview");
  const them = mf.recipientName.trim().split(/\s+/)[0] || "them";

  const stats = deriveStats(mf.startDate);
  const dateProblem = validateStartDate(mf.startDate);
  const aura = computeArchetype(mf.answers, mf.startDate);

  const songs = pad(mf.songs, L.songs).map(splitRaw);
  const setSong = (i: number, p: Partial<{ title: string; artist: string }>) => {
    const next = songs.map((s, idx) => (idx === i ? { ...s, ...p } : s)).map((s) => (s.title.trim() || s.artist.trim() ? joinSongRaw(s) : ""));
    updateMf("songs", trimTail(next));
  };
  const setLine = (key: "places" | "genres" | "topReasons", n: number, i: number, v: string) => {
    const next = pad(mf[key], n).map((x, idx) => (idx === i ? v : x));
    updateMf(key, trimTail(next));
  };
  const jokes: Stat[] = [0, 1, 2].map((i) => mf.stats[i] ?? { key: `s${i + 1}`, label: "", value: "", sub: "" });
  const setJoke = (i: number, p: Partial<Stat>) => updateMf("stats", jokes.map((j, idx) => (idx === i ? { ...j, ...p } : j)));

  return (
    <>
      <style>{CSS}</style>
      <div className="reScrim" onClick={close} />
      <div className="reSheet" role="dialog" aria-modal="true" aria-label="Make your Rewind">
        <div className="reHead">
          <span className="reGrab" aria-hidden />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="reTitle">Make their Rewind ⏮️</p>
            <p className="reSub">A name, a date and a few photos. We work out every number — you just pick the songs.</p>
          </div>
          <button type="button" className="reX" onClick={close} aria-label="Close">✕</button>
        </div>

        <div className="reBody">
          {/* 1 — who + when */}
          <section className="reStep">
            <p className="reStepN"><b>1</b> Who&apos;s it for, and since when</p>
            <div className="reRow2">
              <Field label="Their name" required hint="Opens the story in huge type.">
                <Text big value={mf.recipientName} max={40} placeholder="Aditi" onChange={(v) => updateMf("recipientName", v)} />
              </Field>
              <Field label="Your name" hint="The artist. Signs the letter.">
                <Text big value={mf.senderName} max={40} placeholder="Rohan" onChange={(v) => updateMf("senderName", v)} />
              </Field>
            </div>
            <Field label="The day it started" required hint="Every number in the story is worked out from this one date.">
              <input className="reIn is-big" type="date" value={mf.startDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => updateMf("startDate", e.target.value)} />
            </Field>
            {!dateProblem ? (
              <p className="reDerived">
                ✨ A <b>{stats.startWeekday}</b>. That&apos;s <b>{(stats.hours * 60).toLocaleString("en-IN")}</b> minutes together
                {stats.winters > 0 && <> · {stats.winters} winter{stats.winters > 1 ? "s" : ""}</>}
                {stats.diwalis > 0 && <> · {stats.diwalis} Diwali{stats.diwalis > 1 ? "s" : ""}</>}.
              </p>
            ) : (
              mf.startDate && <p className="reWarn">{dateProblem.message}</p>
            )}
          </section>

          {/* 2 — memories */}
          <section className="reStep">
            <p className="reStepN"><b>2</b> Your memories — Liked Songs 💚</p>
            <p className="reHint">
              5–10 photos. They become the album covers, the &ldquo;top moments&rdquo; card and the Liked Songs list — the caption is the song title,
              the note is the lyrics. Tap a photo to move &amp; zoom it. <strong>Sample photos?</strong> Tap &ldquo;change photo&rdquo; to swap in yours.
            </p>
            <PhotosEditor
              photos={mf.photos}
              onChange={(v) => updateMf("photos", v)}
              captionHint="song title — e.g. the first sunset"
              noteHint="The lyrics: what you remember about this one…"
            />
          </section>

          {/* 3 — songs */}
          <section className="reStep">
            <p className="reStepN"><b>3</b> Your songs 🎧</p>
            <p className="reHint">Your top 5 — the playlist, the &ldquo;top songs&rdquo; card and the player. #1 gets its own spinning-vinyl moment.</p>
            <div className="reSongs">
              {songs.map((s, i) => (
                <div key={i} className="reSong">
                  <span className="reSongN">{i + 1}</span>
                  <Text value={s.title} max={60} placeholder={["Kesariya", "Tum Se Hi", "Iktara", "Pehla Nasha", "Raabta"][i]} onChange={(v) => setSong(i, { title: v })} label={`Song ${i + 1} title`} />
                  <Text value={s.artist} max={50} placeholder="artist" onChange={(v) => setSong(i, { artist: v })} label={`Song ${i + 1} artist`} />
                </div>
              ))}
            </div>
            <Field label="Playlist name" count={`${mf.playlistName.length}/${L.playlistName}`}>
              <Text value={mf.playlistName} max={L.playlistName} placeholder="songs that are basically you" onChange={(v) => updateMf("playlistName", v)} />
            </Field>
          </section>

          {/* 4 — letter */}
          <section className="reStep">
            <p className="reStepN"><b>4</b> The bonus track — your letter 💌</p>
            <p className="reHint">A hidden track after the summary card. It plays full-screen like synced lyrics, one line lighting up at a time. It also waits as a little icon in the corner.</p>
            <Field label="Your letter" count={`${mf.letter.length}/${L.letter}`}>
              <Area rows={8} value={mf.letter} max={L.letter} placeholder={`${them},\n\nThey counted everything this year except the part that matters…`} onChange={(v) => updateMf("letter", v)} />
            </Field>
            <label className="reCheck">
              <input
                type="checkbox"
                checked={lockOn}
                onChange={(e) => {
                  setLockPicked(e.target.checked);
                  if (!e.target.checked) { updateMf("lockQuestion", ""); updateMf("lockAnswer", ""); }
                }}
              />
              <span>Lock it behind a question (the &ldquo;Skip&rdquo; button runs away 😈)</span>
            </label>
            {lockOn && (
              <div className="reRow2">
                <Field label="The question"><Text value={mf.lockQuestion} max={L.lockQuestion} placeholder="Will you rewind this year with me again?" onChange={(v) => updateMf("lockQuestion", v)} /></Field>
                <Field label="The yes button"><Text value={mf.lockAnswer} max={L.lockAnswer} placeholder="Play it ▶" onChange={(v) => updateMf("lockAnswer", v)} /></Field>
              </div>
            )}
          </section>

          {/* 5 — fine-tune */}
          <section className="reStep">
            <p className="reStepN"><b>5</b> Fine-tune (optional)</p>
            <div className="reFolds">
              <Fold title="Your couple aura — the verdict" sub={`Currently: ${aura.name}`}>
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="reQ">
                    <p>{q.prompt}</p>
                    <div className="reOpts">
                      {q.options.map((o) => (
                        <button key={o.value} type="button" className={`reOpt ${mf.answers[q.id] === o.value ? "is-on" : ""}`} onClick={() => updateMf("answers", { ...mf.answers, [q.id]: o.value })}>{o.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </Fold>
              <Fold title="Top genres" sub="#1 gets the whole card. Make them up — that's the fun.">
                {pad(mf.genres, L.genres).map((g, i) => (
                  <Text key={i} value={g} max={L.genre} placeholder={["Slow-burn Bollywood", "3 AM Voice Notes", "Chai-core", "Soft Launch Pop"][i]} onChange={(v) => setLine("genres", L.genres, i, v)} label={`Genre ${i + 1}`} />
                ))}
              </Fold>
              <Fold title="Top places" sub="Where you two happened">
                {pad(mf.places, L.places).map((g, i) => (
                  <Text key={i} value={g} max={L.place} placeholder={["Your terrace, 1 AM", "The Maggi point", "That café", "Marine Drive", "The auto home"][i]} onChange={(v) => setLine("places", L.places, i, v)} label={`Place ${i + 1}`} />
                ))}
              </Fold>
              <Fold title="On repeat — 5 things about them" sub="A countdown. Save the best one for last.">
                {pad(mf.topReasons, 5).map((g, i) => (
                  <Text key={i} value={g} max={120} placeholder="You hand me the left earbud without looking" onChange={(v) => setLine("topReasons", 5, i, v)} label={`Reason ${i + 1}`} />
                ))}
              </Fold>
              <Fold title="The numbers nobody asked for" sub="Three running jokes: a label, a number, a punchline">
                {jokes.map((j, i) => (
                  <div key={i} className="reJoke">
                    <div className="reRow2">
                      <Text value={j.label} max={40} placeholder="times you said" onChange={(v) => setJoke(i, { label: v })} label="Label" />
                      <Text value={j.value} max={12} placeholder="47" onChange={(v) => setJoke(i, { value: v })} label="Number" />
                    </div>
                    <Text value={j.sub} max={90} placeholder={'"I\'m fine." You were fine twice.'} onChange={(v) => setJoke(i, { sub: v })} label="Punchline" />
                  </div>
                ))}
              </Fold>
              <Fold title="The fan card & the last line" sub="“Top 0.01% of your fans” and the closing card">
                <Field label="Under “top 0.01% of fans”"><Text value={mf.fanLine} max={L.fanLine} placeholder="Nobody has replayed Rohan more." onChange={(v) => updateMf("fanLine", v)} /></Field>
                <Field label="The last line"><Text value={mf.closingLine} max={80} placeholder="Same time next year." onChange={(v) => updateMf("closingLine", v)} /></Field>
              </Fold>
              <Fold title="A real song clip" sub="Optional — plays under the story">
                <Field label="Audio link (https, .mp3)" hint="Leave empty for silence — the story still has its own little sounds.">
                  <Text value={mf.audioUrl} max={2000} placeholder="https://…/song.mp3" onChange={(v) => updateMf("audioUrl", v.trim())} />
                </Field>
              </Fold>
              <Fold title="Password (optional)" sub="Only people with the password can open it">
                <Field label="Password" hint="Leave empty for no password."><Text value={pagePassword} max={128} placeholder="e.g. our first song" onChange={setPagePassword} /></Field>
              </Fold>
            </div>
          </section>
        </div>

        <div className="reFoot">
          {missing.length > 0 ? <p className="reMissing">Still needed: {missing.join(", ")}</p> : <p className="reReady">Ready to press play ✓</p>}
          <button type="button" className="reSave" onClick={onSave} disabled={saving || missing.length > 0}>{saving ? "Saving…" : "Save & play it"}</button>
        </div>
      </div>
    </>
  );
}

// While typing, a song row is stored verbatim as "title — artist" — no
// trimming, or the space you just typed would vanish mid-word. Save cleans it.
const SEP = " — ";
const splitRaw = (line: string) => {
  const i = line.indexOf(SEP);
  return i >= 0 ? { title: line.slice(0, i), artist: line.slice(i + SEP.length) } : parseSong(line);
};
const joinSongRaw = (s: { title: string; artist: string }) => (s.artist ? `${s.title}${SEP}${s.artist}` : s.title);
const trimTail = (a: string[]) => {
  const out = [...a];
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out;
};

function Field({ label, hint, required, count, children }: { label: string; hint?: string; required?: boolean; count?: string; children: ReactNode }) {
  return (
    <label className="reField">
      <span className="reLabel">{label}{required && <i> *</i>}{count && <small>{count}</small>}</span>
      {children}
      {hint && <span className="reFieldHint">{hint}</span>}
    </label>
  );
}
function Text({ value, onChange, max, placeholder, big, label }: { value: string; onChange: (v: string) => void; max: number; placeholder?: string; big?: boolean; label?: string }) {
  return <input className={`reIn${big ? " is-big" : ""}`} value={value} maxLength={max} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value.slice(0, max))} />;
}
function Area({ value, onChange, max, rows, placeholder }: { value: string; onChange: (v: string) => void; max: number; rows: number; placeholder?: string }) {
  return <textarea className="reIn reArea" value={value} rows={rows} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value.slice(0, max))} />;
}
function Fold({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <details className="reFold">
      <summary><span><b>{title}</b>{sub && <small>{sub}</small>}</span><i aria-hidden>⌄</i></summary>
      <div className="reFoldBody">{children}</div>
    </details>
  );
}

const G = "#1DB954";
const CSS = `
.reScrim { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.6); animation: reFade .2s both; }
.reSheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; margin: 0 auto; width: 100%; max-width: 620px; max-height: 92dvh; display: flex; flex-direction: column;
  border-radius: 24px 24px 0 0; background: #F7F7F5; color: #121212; font-family: var(--font-rw), "Figtree", -apple-system, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 -24px 60px -20px rgba(0,0,0,.6); animation: reUp .38s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 900px) {
  .reSheet { left: auto; right: 0; top: 0; bottom: 0; max-height: none; height: 100dvh; width: 480px; border-radius: 24px 0 0 24px; animation-name: reIn; }
  .reGrab { display: none !important; }
}
.reHead { position: relative; display: flex; align-items: flex-start; gap: 10px; padding: 18px 16px 12px; border-bottom: 1px solid #E6E6E3; }
.reGrab { position: absolute; top: 7px; left: 50%; transform: translateX(-50%); width: 40px; height: 5px; border-radius: 99px; background: #D5D5D1; }
.reTitle { margin: 0; font-size: 21px; font-weight: 900; letter-spacing: -.03em; }
.reSub { margin: 3px 0 0; font-size: 13px; color: #5E5E5A; line-height: 1.4; }
.reX { flex: none; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #EAEAE7; color: #333; font-size: 15px; cursor: pointer; }
.reBody { flex: 1; overflow-y: auto; padding: 6px 16px 24px; overscroll-behavior: contain; }
.reStep { padding: 16px 0 8px; border-bottom: 1px dashed #DDDDD8; display: grid; gap: 12px; }
.reStep:last-child { border-bottom: 0; }
.reStepN { margin: 0; display: flex; align-items: center; gap: 9px; font-size: 16px; font-weight: 800; letter-spacing: -.01em; }
.reStepN b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #121212; color: ${G}; font-size: 13px; flex: none; }
.reHint { margin: -4px 0 0; font-size: 12.5px; line-height: 1.5; color: #5E5E5A; }
.reHint strong { color: #121212; }
.reField { display: grid; gap: 6px; min-width: 0; }
.reLabel { display: flex; align-items: baseline; gap: 4px; font-size: 12.5px; font-weight: 700; color: #3A3A37; }
.reLabel i { color: #E0245E; font-style: normal; }
.reLabel small { margin-left: auto; font-size: 11px; font-weight: 500; color: #8C8C87; font-variant-numeric: tabular-nums; }
.reFieldHint { font-size: 11.5px; color: #7C7C77; line-height: 1.4; }
.reIn { width: 100%; min-height: 46px; padding: 11px 13px; border-radius: 12px; border: 1.5px solid #DCDCD7; background: #fff; color: #121212; font: inherit; font-size: 16px; outline: none; transition: border-color .15s, box-shadow .15s; box-sizing: border-box; min-width: 0; }
.reIn:focus { border-color: ${G}; box-shadow: 0 0 0 4px rgba(29,185,84,.16); }
.reIn.is-big { min-height: 52px; font-size: 18px; font-weight: 700; }
.reArea { resize: vertical; line-height: 1.5; min-height: 90px; }
.reRow2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 400px) { .reRow2 { grid-template-columns: 1fr; } }
.reDerived { margin: 0; padding: 10px 12px; border-radius: 12px; background: #121212; color: #fff; font-size: 13px; line-height: 1.45; }
.reDerived b { color: ${G}; }
.reWarn { margin: 0; font-size: 12.5px; color: #E0245E; font-weight: 700; }
.reSongs { display: grid; gap: 8px; }
.reSong { display: grid; grid-template-columns: 22px minmax(0,1.3fr) minmax(0,1fr); gap: 6px; align-items: center; }
.reSongN { font-weight: 900; font-size: 15px; color: #8C8C87; text-align: center; }
.reCheck { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.4; cursor: pointer; }
.reCheck input { width: 20px; height: 20px; margin: 1px 0 0; accent-color: ${G}; flex: none; }
.reFolds { display: grid; gap: 8px; }
.reFold { border: 1.5px solid #E2E2DE; border-radius: 16px; background: #fff; }
.reFold summary { list-style: none; display: flex; align-items: center; gap: 10px; padding: 13px 14px; cursor: pointer; }
.reFold summary::-webkit-details-marker { display: none; }
.reFold summary span { flex: 1; min-width: 0; display: grid; gap: 1px; }
.reFold summary b { font-size: 14.5px; }
.reFold summary small { font-size: 12px; color: #7C7C77; }
.reFold summary i { font-style: normal; font-size: 18px; color: #7C7C77; transition: transform .2s; }
.reFold[open] summary i { transform: rotate(180deg); }
.reFoldBody { display: grid; gap: 10px; padding: 0 14px 14px; }
.reQ p { margin: 4px 0 6px; font-size: 13.5px; font-weight: 700; }
.reOpts { display: flex; flex-wrap: wrap; gap: 6px; }
.reOpt { padding: 8px 12px; border-radius: 99px; border: 1.5px solid #DCDCD7; background: #fff; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; color: #121212; }
.reOpt.is-on { background: #121212; border-color: #121212; color: #fff; }
.reJoke { display: grid; gap: 6px; padding: 10px; border-radius: 12px; background: #F4F4F1; }
.reFoot { padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #E6E6E3; background: #fff; display: grid; gap: 8px; }
.reMissing { margin: 0; font-size: 13px; font-weight: 700; color: #E0245E; }
.reReady { margin: 0; font-size: 13px; font-weight: 700; color: ${G}; }
.reSave { min-height: 52px; border-radius: 99px; border: 0; background: ${G}; color: #000; font: inherit; font-weight: 900; font-size: 16px; cursor: pointer; box-shadow: 0 12px 26px -12px rgba(29,185,84,.9); }
.reSave:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
@keyframes reFade { from { opacity: 0; } }
@keyframes reUp { from { transform: translateY(100%); } }
@keyframes reIn { from { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .reScrim, .reSheet { animation: none; } }
`;
