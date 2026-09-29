// ─── The editor's form ───────────────────────────────────────────────────────
//
// A bottom sheet on phones, a right-hand drawer on wide screens (the page stays
// visible beside it). Three friendly steps — who, the memories, the letter —
// and everything the AI writes folded under "Fine-tune". Save stays pinned and
// says exactly what is missing.

"use client";

import { useState, type ReactNode } from "react";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import { MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN } from "../../_love/types";
import { L, type SearchData } from "./types";
import { missingForSave, type EditMode } from "../hooks/useSearchedEditor";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: SearchData;
  updateMf: <K extends keyof SearchData>(key: K, val: SearchData[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
}

type FieldDef<T> = { k: keyof T & string; label: string; max: number; area?: boolean; stars?: boolean; placeholder?: string };

export default function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave }: EditSheetProps) {
  const [lockPicked, setLockPicked] = useState(false);
  if (editMode !== "manual") return null;
  const lockOn = lockPicked || !!mf.lockQuestion.trim();
  const missing = missingForSave(mf);
  const close = () => setEditMode("preview");
  const them = mf.recipient.name.trim().split(/\s+/)[0] || "them";
  const kp = mf.knowledgePanel;
  const setKp = (p: Partial<SearchData["knowledgePanel"]>) => updateMf("knowledgePanel", { ...kp, ...p });

  return (
    <>
      <style>{CSS}</style>
      <div className="seScrim" onClick={close} />
      <div className="seSheet" role="dialog" aria-modal="true" aria-label="Edit your search page">
        <div className="seHead">
          <span className="seGrab" aria-hidden />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="seTitle">Make them searchable 🔍</p>
            <p className="seSub">Names, photos, a letter. Every result, fact and joke is already written — tweak anything below.</p>
          </div>
          <button type="button" className="seX" onClick={close} aria-label="Close">✕</button>
        </div>

        <div className="seBody">
          <section className="seStep">
            <p className="seStepN"><b>1</b> Who&apos;s being searched</p>
            <div className="seRow2">
              <Field label="Their name" required hint="It becomes the doodle, the search box and the panel. Full name reads most real.">
                <Text big value={mf.recipient.name} max={L.name} placeholder="Meera Verma" onChange={(v) => updateMf("recipient", { name: v })} />
              </Field>
              <Field label="Your name" required hint="You're the source behind half the results.">
                <Text big value={mf.sender.name} max={L.name} placeholder="Arjun" onChange={(v) => updateMf("sender", { name: v })} />
              </Field>
            </div>
          </section>

          <section className="seStep">
            <p className="seStepN"><b>2</b> Your memories (5–10 photos)</p>
            <p className="seHint">
              They fill the doodle balloon, the knowledge-panel collage, the Images pack, the AI Overview sources, videos and places. Tap a photo to move &amp; zoom it;
              the caption is its image title, the note opens when they tap it. <strong>Sample photos?</strong> Tap &ldquo;change photo&rdquo; to swap in yours.
            </p>
            <PhotosEditor photos={mf.photos} onChange={(v) => updateMf("photos", v)} captionHint="image title — e.g. date night, round 1" noteHint="The note that opens with this photo…" />
          </section>

          <section className="seStep">
            <p className="seStepN"><b>3</b> The #1 result — your letter 💌</p>
            <p className="seHint">&ldquo;I&apos;m Feeling Lucky&rdquo; opens it, and it pops in the corner as the top result. An AI Overview writes it out live, word by word.</p>
            <Field label="Your letter" count={`${mf.letter.length}/${MAX_LETTER_LEN}`}>
              <Area rows={8} value={mf.letter} max={MAX_LETTER_LEN} placeholder={`${them},\n\nI searched for you once, before I even knew your last name…`} onChange={(v) => updateMf("letter", v)} />
            </Field>
            <label className="seCheck">
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
              <span>Ask a question first — shown as a &ldquo;Before you continue&rdquo; cookie banner, and &ldquo;Reject all&rdquo; runs away 😈</span>
            </label>
            {lockOn && (
              <div className="seRow2">
                <Field label="The question">
                  <Text value={mf.lockQuestion} max={MAX_LOCK_QUESTION_LEN} placeholder="Do you accept all of my love (and cookies)?" onChange={(v) => updateMf("lockQuestion", v)} />
                </Field>
                <Field label="The yes button says">
                  <Text value={mf.lockAnswer} max={MAX_LOCK_ANSWER_LEN} placeholder="Accept all 💗" onChange={(v) => updateMf("lockAnswer", v)} />
                </Field>
              </div>
            )}
          </section>

          <section className="seStep">
            <p className="seStepN"><b>4</b> Fine-tune (optional)</p>
            <div className="seFolds">
              <Fold title="Autocomplete" sub="The first joke — each line starts with their name">
                <StrList items={mf.autocomplete} max={L.maxSuggestions} itemMax={L.suggestion} placeholder={`${mf.recipient.name || "Meera"} near me (please)`} onChange={(v) => updateMf("autocomplete", v)} />
              </Fold>

              <Fold title="Home page & top of results" sub="Doodle title, “Did you mean”, result count">
                <Field label="Doodle title (shows on hover)">
                  <Text value={mf.doodleTitle} max={L.doodleTitle} placeholder="Celebrating 3 years of us" onChange={(v) => updateMf("doodleTitle", v)} />
                </Field>
                <Field label="Did you mean:">
                  <Text value={mf.didYouMean} max={L.didYouMean} placeholder="Arjun's favourite person" onChange={(v) => updateMf("didYouMean", v)} />
                </Field>
                <div className="seRow2">
                  <Field label="About ___ results">
                    <Text value={mf.resultCount} max={L.resultCount} placeholder="8,47,000" onChange={(v) => updateMf("resultCount", v)} />
                  </Field>
                  <Field label="(___ seconds)">
                    <Text value={mf.searchSeconds} max={L.seconds} placeholder="0.42" onChange={(v) => updateMf("searchSeconds", v)} />
                  </Field>
                </div>
              </Fold>

              <Fold title="AI Overview" sub="Streams in at the top of the results">
                <Field label="Overview" count={`${mf.aiOverview.length}/${L.overview}`}>
                  <Area rows={5} value={mf.aiOverview} max={L.overview} onChange={(v) => updateMf("aiOverview", v)} />
                </Field>
                <Field label="Key points (Label: text)">
                  <StrList items={mf.aiPoints} max={L.maxPoints} itemMax={L.point} placeholder="Love language: 2 AM reels" onChange={(v) => updateMf("aiPoints", v)} />
                </Field>
              </Fold>

              <Fold title="Knowledge panel" sub="Title card, description, facts, people also search for">
                <Field label="Subtitle">
                  <Text value={kp.subtitle} max={L.subtitle} placeholder="Arjun's favourite human" onChange={(v) => setKp({ subtitle: v })} />
                </Field>
                <Field label="Description" count={`${kp.description.length}/${L.description}`}>
                  <Area rows={4} value={kp.description} max={L.description} onChange={(v) => setKp({ description: v })} />
                </Field>
                <Field label="Facts">
                  <Rows
                    items={kp.facts}
                    max={L.maxFacts}
                    blank={{ label: "", value: "" }}
                    fields={[
                      { k: "label", label: "Label", max: L.factLabel, placeholder: "Born" },
                      { k: "value", label: "Value", max: L.factValue, placeholder: "14 March, a Wednesday" },
                    ]}
                    onChange={(v) => setKp({ facts: v })}
                    inline
                  />
                </Field>
                <Field label="People also search for (Name — caption)">
                  <StrList items={kp.alsoSearchFor} max={L.maxAlso} itemMax={L.alsoSearch} placeholder="Momos — her first love" onChange={(v) => setKp({ alsoSearchFor: v })} />
                </Field>
              </Fold>

              <Fold title="Reviews" sub={`${mf.reviews.length} reviews in the panel`}>
                <Rows
                  items={mf.reviews}
                  max={L.maxReviews}
                  blank={{ author: "", stars: 5, text: "" }}
                  fields={[
                    { k: "author", label: "Who", max: L.reviewAuthor, placeholder: "Her mom" },
                    { k: "stars", label: "Stars", max: 1, stars: true },
                    { k: "text", label: "Review", max: L.reviewText, area: true },
                  ]}
                  onChange={(v) => updateMf("reviews", v)}
                />
              </Fold>

              <Fold title="Results" sub={`${mf.results.length} blue links`}>
                <Rows
                  items={mf.results}
                  max={L.maxResults}
                  blank={{ id: "", site: "", url: "", title: "", snippet: "" }}
                  fields={[
                    { k: "site", label: "Site name", max: L.site, placeholder: "The Daily Blush" },
                    { k: "url", label: "Breadcrumb", max: L.url, placeholder: "dailyblush.in › local" },
                    { k: "title", label: "Blue title", max: L.title },
                    { k: "snippet", label: "Snippet", max: L.snippet, area: true },
                  ]}
                  onChange={(v) => updateMf("results", v.map((r, i) => ({ ...r, id: r.id || `r${i + 1}` })))}
                />
              </Fold>

              <Fold title="People also ask" sub={`${mf.paa.length} questions — opening one reveals more`}>
                <Rows
                  items={mf.paa}
                  max={L.maxPaa}
                  blank={{ question: "", answer: "" }}
                  fields={[
                    { k: "question", label: "Question", max: L.question },
                    { k: "answer", label: "Answer", max: L.answer, area: true },
                  ]}
                  onChange={(v) => updateMf("paa", v)}
                />
              </Fold>

              <Fold title="Top stories" sub="Headlines about them">
                <Rows
                  items={mf.topStories}
                  max={L.maxStories}
                  blank={{ source: "", time: "1 hour ago", title: "" }}
                  fields={[
                    { k: "source", label: "Paper", max: L.storySource, placeholder: "Heartbeat News" },
                    { k: "time", label: "When", max: L.storyTime, placeholder: "2 hours ago" },
                    { k: "title", label: "Headline", max: L.storyTitle, area: true },
                  ]}
                  onChange={(v) => updateMf("topStories", v)}
                />
              </Fold>

              <Fold title="Videos" sub="Thumbnails come from your photos">
                <Rows
                  items={mf.videos}
                  max={L.maxVideos}
                  blank={{ channel: "", duration: "0:47", title: "" }}
                  fields={[
                    { k: "title", label: "Title", max: L.videoTitle },
                    { k: "channel", label: "Channel", max: L.videoChannel, placeholder: "Us, Unfiltered" },
                    { k: "duration", label: "Length", max: L.videoDuration, placeholder: "2:13" },
                  ]}
                  onChange={(v) => updateMf("videos", v)}
                />
              </Fold>

              <Fold title="Places we've been" sub="Pins on the map, with a little memory each">
                <Rows
                  items={mf.places}
                  max={L.maxPlaces}
                  blank={{ name: "", kind: "", rating: "5.0", note: "" }}
                  fields={[
                    { k: "name", label: "Place", max: L.placeName, placeholder: "Sharma Ji Momos" },
                    { k: "kind", label: "Type · area", max: L.placeKind, placeholder: "Momo stall · Hazratganj" },
                    { k: "rating", label: "Rating", max: L.placeRating, placeholder: "4.9" },
                    { k: "note", label: "The memory", max: L.placeNote, area: true },
                  ]}
                  onChange={(v) => updateMf("places", v)}
                />
              </Fold>

              <Fold title="Related searches" sub="The grey chips at the bottom">
                <StrList items={mf.relatedSearches} max={L.maxRelated} itemMax={L.related} placeholder="is she single (no)" onChange={(v) => updateMf("relatedSearches", v)} />
              </Fold>

              <Fold title="Password (optional)" sub="Only people with the password can search">
                <Field label="Password" hint="Leave empty for no password.">
                  <Text value={pagePassword} max={128} placeholder="e.g. our first date" onChange={setPagePassword} />
                </Field>
              </Fold>
            </div>
          </section>
        </div>

        <div className="seFoot">
          {missing.length > 0 ? <p className="seMissing">Still needed: {missing.join(", ")}</p> : <p className="seReady">Ready to be searched ✓</p>}
          <button type="button" className="seSave" onClick={onSave} disabled={missing.length > 0}>
            Save &amp; preview
          </button>
        </div>
      </div>
    </>
  );
}

/* ── small form pieces (module scope, so inputs never remount mid-typing) ─── */

function Field({ label, hint, required, count, children }: { label: string; hint?: string; required?: boolean; count?: string; children: ReactNode }) {
  return (
    <label className="seField">
      <span className="seLabel">
        {label}
        {required && <i> *</i>}
        {count && <small>{count}</small>}
      </span>
      {children}
      {hint && <span className="seFieldHint">{hint}</span>}
    </label>
  );
}

function Text({ value, onChange, max, placeholder, big, label }: { value: string; onChange: (v: string) => void; max: number; placeholder?: string; big?: boolean; label?: string }) {
  return <input className={`seIn${big ? " is-big" : ""}`} value={value} maxLength={max} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value.slice(0, max))} />;
}

function Area({ value, onChange, max, rows, placeholder, label }: { value: string; onChange: (v: string) => void; max: number; rows: number; placeholder?: string; label?: string }) {
  return <textarea className="seIn seArea" value={value} rows={rows} maxLength={max} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value.slice(0, max))} />;
}

function Fold({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <details className="seFold">
      <summary>
        <span><b>{title}</b>{sub && <small>{sub}</small>}</span>
        <i aria-hidden>⌄</i>
      </summary>
      <div className="seFoldBody">{children}</div>
    </details>
  );
}

function StrList({ items, onChange, max, itemMax, placeholder }: { items: string[]; onChange: (v: string[]) => void; max: number; itemMax: number; placeholder?: string }) {
  return (
    <div className="seList">
      {items.map((s, i) => (
        <div key={i} className="seListRow">
          <Text value={s} max={itemMax} placeholder={placeholder} label={`Line ${i + 1}`} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
          <button type="button" className="seMini" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      {items.length < max && (
        <button type="button" className="seAdd" onClick={() => onChange([...items, ""])}>+ Add a line</button>
      )}
    </div>
  );
}

function Rows<T extends object>({ items, onChange, fields, blank, max, inline }: { items: T[]; onChange: (v: T[]) => void; fields: FieldDef<T>[]; blank: T; max: number; inline?: boolean }) {
  const set = (i: number, k: keyof T, v: unknown) => onChange(items.map((it, j) => (j === i ? ({ ...it, [k]: v } as T) : it)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="seList">
      {items.map((it, i) => (
        <div key={i} className={`seCard${inline ? " is-inline" : ""}`}>
          <div className="seCardFields">
            {fields.map((f) => {
              const val = (it as Record<string, unknown>)[f.k];
              if (f.stars) {
                return (
                  <label key={f.k} className="seMiniField">
                    <span>{f.label}</span>
                    <select className="seIn" value={Number(val) || 5} onChange={(e) => set(i, f.k, Number(e.target.value))}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
                    </select>
                  </label>
                );
              }
              return (
                <label key={f.k} className={`seMiniField${f.area ? " is-wide" : ""}`}>
                  {!inline && <span>{f.label}</span>}
                  {f.area ? (
                    <Area rows={2} value={String(val ?? "")} max={f.max} label={f.label} placeholder={f.placeholder} onChange={(v) => set(i, f.k, v)} />
                  ) : (
                    <Text value={String(val ?? "")} max={f.max} label={f.label} placeholder={f.placeholder ?? f.label} onChange={(v) => set(i, f.k, v)} />
                  )}
                </label>
              );
            })}
          </div>
          <div className="seCardActs">
            {!inline && <button type="button" className="seMini" aria-label="Move up" onClick={() => move(i, -1)}>↑</button>}
            {!inline && <button type="button" className="seMini" aria-label="Move down" onClick={() => move(i, 1)}>↓</button>}
            <button type="button" className="seMini" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" className="seAdd" onClick={() => onChange([...items, { ...blank }])}>+ Add</button>
      )}
    </div>
  );
}

const CSS = `
.seScrim { position: fixed; inset: 0; z-index: 200; background: rgba(32,33,36,.5); animation: seFade .2s both; }
.seSheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; margin: 0 auto; width: 100%; max-width: 640px; max-height: 92dvh; display: flex; flex-direction: column;
  border-radius: 24px 24px 0 0; background: #f8f9fb; color: #1f1f1f; font-family: Arial, "Helvetica Neue", sans-serif;
  box-shadow: 0 -24px 60px -20px rgba(0,0,0,.4); animation: seUp .38s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 900px) {
  .seSheet { left: auto; right: 0; top: 0; bottom: 0; max-height: none; height: 100dvh; width: 500px; border-radius: 24px 0 0 24px; animation-name: seIn; }
  .seGrab { display: none !important; }
}
.seHead { position: relative; display: flex; align-items: flex-start; gap: 10px; padding: 18px 16px 12px; border-bottom: 1px solid #e3e5e8; }
.seGrab { position: absolute; top: 7px; left: 50%; transform: translateX(-50%); width: 40px; height: 5px; border-radius: 99px; background: #d4d7db; }
.seTitle { margin: 0; font: 600 21px/1.25 var(--font-outfit), "Outfit", Arial, sans-serif; }
.seSub { margin: 3px 0 0; font-size: 13px; color: #5f6368; line-height: 1.4; }
.seX { flex: none; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #eceef1; color: #3c4043; font-size: 15px; cursor: pointer; }
.seBody { flex: 1; overflow-y: auto; padding: 6px 16px 24px; overscroll-behavior: contain; }
.seStep { padding: 16px 0 8px; border-bottom: 1px dashed #dde0e4; display: grid; gap: 12px; }
.seStep:last-child { border-bottom: 0; }
.seStepN { margin: 0; display: flex; align-items: center; gap: 9px; font: 600 16px/1.3 var(--font-outfit), "Outfit", Arial, sans-serif; }
.seStepN b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, #3F76EE, #E8445E); color: #fff; font-size: 13px; flex: none; }
.seHint { margin: -4px 0 0; font-size: 12.5px; line-height: 1.5; color: #5f6368; }
.seHint strong { color: #1f1f1f; }
.seField { display: grid; gap: 6px; min-width: 0; }
.seLabel { display: flex; align-items: baseline; gap: 4px; font-size: 12.5px; font-weight: 700; color: #3c4043; }
.seLabel i { color: #E8445E; font-style: normal; }
.seLabel small { margin-left: auto; font-size: 11px; font-weight: 500; color: #80868b; font-variant-numeric: tabular-nums; }
.seFieldHint { font-size: 11.5px; color: #70757a; line-height: 1.4; }
.seIn { width: 100%; min-height: 46px; padding: 11px 13px; border-radius: 12px; border: 1.5px solid #dadce0; background: #fff; color: #1f1f1f; font: inherit; font-size: 16px; outline: none; transition: border-color .15s, box-shadow .15s; }
.seIn:focus { border-color: #0b57d0; box-shadow: 0 0 0 4px rgba(11,87,208,.12); }
.seIn.is-big { min-height: 52px; font-size: 18px; }
.seArea { resize: vertical; line-height: 1.5; min-height: 70px; }
.seRow2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 460px) { .seRow2 { grid-template-columns: 1fr; } }
.seCheck { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.4; cursor: pointer; }
.seCheck input { width: 20px; height: 20px; margin: 1px 0 0; accent-color: #0b57d0; flex: none; }
.seFolds { display: grid; gap: 8px; }
.seFold { border: 1.5px solid #e1e3e6; border-radius: 16px; background: #fff; }
.seFold summary { list-style: none; display: flex; align-items: center; gap: 10px; padding: 13px 14px; cursor: pointer; }
.seFold summary::-webkit-details-marker { display: none; }
.seFold summary span { flex: 1; min-width: 0; display: grid; gap: 1px; }
.seFold summary b { font-size: 14.5px; }
.seFold summary small { font-size: 12px; color: #70757a; }
.seFold summary i { font-style: normal; font-size: 18px; color: #70757a; transition: transform .2s; }
.seFold[open] summary i { transform: rotate(180deg); }
.seFoldBody { display: grid; gap: 12px; padding: 0 14px 14px; }
.seList { display: grid; gap: 8px; }
.seListRow { display: grid; grid-template-columns: 1fr 40px; gap: 6px; align-items: center; }
.seCard { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 10px; border-radius: 14px; background: #f3f4f6; }
.seCard.is-inline { padding: 6px; }
.seCardFields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; min-width: 0; }
.seMiniField { display: grid; gap: 4px; min-width: 0; }
.seMiniField.is-wide { grid-column: 1 / -1; }
.seMiniField > span { font-size: 11.5px; font-weight: 700; color: #5f6368; }
.seCardActs { display: grid; gap: 4px; align-content: start; }
.seMini { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e1e3e6; background: #fff; color: #70757a; cursor: pointer; }
.seAdd { min-height: 44px; border-radius: 12px; border: 1.5px dashed #0b57d0; background: #eef3fd; color: #0b57d0; font-weight: 700; font-size: 14px; cursor: pointer; }
.seFoot { padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #e3e5e8; background: #fff; display: grid; gap: 8px; }
.seMissing { margin: 0; font-size: 13px; font-weight: 700; color: #d93025; }
.seReady { margin: 0; font-size: 13px; font-weight: 700; color: #188038; }
.seSave { min-height: 52px; border-radius: 26px; border: 0; background: #0b57d0; color: #fff; font: 600 16px/1 var(--font-outfit), "Outfit", Arial, sans-serif; cursor: pointer; box-shadow: 0 10px 24px -12px rgba(11,87,208,.9); }
.seSave:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
@keyframes seFade { from { opacity: 0; } }
@keyframes seUp { from { transform: translateY(100%); } }
@keyframes seIn { from { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .seScrim, .seSheet { animation: none; } }
`;
