"use client";

// The form. One scroll, five short sections in the order the recipient meets
// them (profile → billboard → episodes → Top 10 → letter), extras folded away.
// Only three things are required — their name, a show title, one episode — and
// the footer says exactly which of those is still missing.

import { memo, useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { Wordmark } from "./Brand";
import PhotoField from "./PhotoField";
import { CROP_CENTER, LIMITS, type EditMode, type Episode, type LoveflixData } from "./types";
import { missingFields } from "../hooks/useLoveflixEditor";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  isPersonalized: boolean;
  mf: LoveflixData;
  updateMf: (key: keyof LoveflixData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
}

const blankEpisode = (): Episode => ({ title: "", synopsis: "", subtitle: "", imageUrl: "", crop: CROP_CENTER });

function Section({
  n,
  title,
  hint,
  done,
  children,
  defaultOpen = true,
}: {
  n: number | string;
  title: string;
  hint?: string;
  done?: boolean;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`es-sec${open ? " is-open" : ""}`}>
      <button type="button" className="es-sec-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={`es-sec-n${done ? " is-done" : ""}`}>{done ? <Check size={14} strokeWidth={3} /> : n}</span>
        <span className="es-sec-t">
          <b>{title}</b>
          {hint && <span>{hint}</span>}
        </span>
        <ChevronDown size={18} className="es-sec-chev" />
      </button>
      {open && <div className="es-sec-body">{children}</div>}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  placeholder,
  required,
  multiline,
  rows = 3,
  help,
  big,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  help?: string;
  big?: boolean;
}) {
  const near = value.length > max * 0.8;
  return (
    <label className="es-field">
      <span className="es-label">
        {label}
        {required && <i className="es-req">required</i>}
        {near && <em className="es-count">{value.length}/{max}</em>}
      </span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, max))} placeholder={placeholder} rows={rows} />
      ) : (
        <input
          className={big ? "is-big" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          placeholder={placeholder}
          aria-required={required}
        />
      )}
      {help && <span className="es-help">{help}</span>}
    </label>
  );
}

function More({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`es-more${open ? " is-open" : ""}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ChevronDown size={15} /> {label}
      </button>
      {open && <div className="es-more-body">{children}</div>}
    </div>
  );
}

function ListInputs({
  items,
  onChange,
  max,
  each,
  placeholder,
  numbered,
  fixed,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  max: number;
  each: number;
  placeholder: (i: number) => string;
  numbered?: boolean;
  fixed?: boolean;
}) {
  const slots = fixed ? Array.from({ length: max }, (_, i) => items[i] ?? "") : items;
  const set = (i: number, v: string) => {
    const next = [...slots];
    next[i] = v.slice(0, each);
    onChange(next);
  };
  return (
    <div className="es-list">
      {slots.map((v, i) => (
        <div key={i} className="es-list-row">
          {numbered && <span className={`es-list-num${i === 9 ? " is-10" : ""}`}>{i + 1}</span>}
          <input value={v} onChange={(e) => set(i, e.target.value)} placeholder={placeholder(i)} aria-label={`${numbered ? `#${i + 1}` : `Item ${i + 1}`}`} />
          {!fixed && (
            <button type="button" className="es-icon" onClick={() => onChange(slots.filter((_, j) => j !== i))} aria-label="Remove">
              <X size={15} />
            </button>
          )}
        </div>
      ))}
      {!fixed && slots.length < max && (
        <button type="button" className="es-add" onClick={() => onChange([...slots, ""])}>
          <Plus size={15} /> Add one ({slots.length}/{max})
        </button>
      )}
    </div>
  );
}

export default memo(function EditSheet({ editMode, setEditMode, isPersonalized, mf, updateMf, pagePassword, setPagePassword, onSave }: EditSheetProps) {
  const open = editMode === "manual";
  const missing = missingFields(mf);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const close = () => setEditMode(isPersonalized ? "preview" : null);
  const eps = mf.episodes ?? [];
  const setEp = (i: number, patch: Partial<Episode>) => updateMf("episodes", eps.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const moveEp = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= eps.length) return;
    const next = [...eps];
    [next[i], next[j]] = [next[j], next[i]];
    updateMf("episodes", next);
  };
  const filledReasons = (mf.reasons ?? []).filter((r) => r.trim()).length;
  const epDone = eps.some((e) => e.title.trim());

  return (
    <div className="es-overlay" role="presentation" onClick={close}>
      <style>{ES_CSS}</style>
      <aside className="es" role="dialog" aria-modal="true" aria-label="Edit your show" onClick={(e) => e.stopPropagation()}>
        <header className="es-head">
          <div>
            <Wordmark size={20} />
            <h2>Make your show</h2>
          </div>
          <button type="button" className="es-x" onClick={close} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="es-body">
          <p className="es-intro">Three things are required. Everything else already has something lovely in it — change what you like.</p>

          <Section n={1} title="Who's watching?" hint="Their profile tile — and yours, locked" done={!!mf.recipientName.trim()}>
            <div className="es-row2">
              <Field label="Their name" required value={mf.recipientName} onChange={(v) => updateMf("recipientName", v)} max={LIMITS.name} placeholder="Aditi" />
              <Field label="Your name" value={mf.senderName} onChange={(v) => updateMf("senderName", v)} max={LIMITS.name} placeholder="Rohan" />
            </div>
            <div className="es-row2">
              <PhotoField label="Their profile photo" url={mf.recipientPhotoUrl} crop={mf.recipientCrop} round onChange={(u, c) => { updateMf("recipientPhotoUrl", u); updateMf("recipientCrop", c); }} compact />
              <PhotoField label="Your profile photo" url={mf.senderPhotoUrl} crop={mf.senderCrop} round onChange={(u, c) => { updateMf("senderPhotoUrl", u); updateMf("senderCrop", c); }} compact />
            </div>
            <Field label="A third, joke profile (optional)" value={mf.thirdProfile} onChange={(v) => updateMf("thirdProfile", v)} max={LIMITS.name} placeholder="Our future cat" help="Shows up locked on the profile screen." />
          </Section>

          <Section n={2} title="Your show" hint="The big billboard they land on" done={!!mf.showTitle.trim()}>
            <Field label="Show title" required big value={mf.showTitle} onChange={(v) => updateMf("showTitle", v)} max={LIMITS.showTitle} placeholder="Us" />
            <Field label="The synopsis" multiline rows={3} value={mf.tagline} onChange={(v) => updateMf("tagline", v)} max={LIMITS.tagline} placeholder="Two people who are extremely bad at admitting things…" />
            <PhotoField label="Billboard photo" url={mf.heroImageUrl} crop={mf.heroCrop} aspect="16 / 9" onChange={(u, c) => { updateMf("heroImageUrl", u); updateMf("heroCrop", c); }} />
            <More label="Rating, genres, year & match">
              <div className="es-row2">
                <Field label="Maturity rating" value={mf.rating} onChange={(v) => updateMf("rating", v)} max={LIMITS.rating} placeholder="18+" />
                <Field label="Seasons" value={mf.seasons} onChange={(v) => updateMf("seasons", v)} max={LIMITS.seasons} placeholder="3 Seasons" />
              </div>
              <Field label="Content warnings" value={mf.ratingReason} onChange={(v) => updateMf("ratingReason", v)} max={LIMITS.ratingReason} placeholder="forehead kisses, 2 AM calls" />
              <div className="es-row2">
                <Field label="Year you met" value={mf.metYear} onChange={(v) => updateMf("metYear", v.replace(/\D/g, ""))} max={LIMITS.metYear} placeholder="2023" />
                <label className="es-field">
                  <span className="es-label">Match — {mf.matchPercent}%</span>
                  <input type="range" min={90} max={100} value={mf.matchPercent} onChange={(e) => updateMf("matchPercent", Number(e.target.value))} className="es-range" />
                </label>
              </div>
              <Field
                label="Genres (comma separated)"
                value={(mf.genres ?? []).join(", ")}
                onChange={(v) => updateMf("genres", v.split(",").map((s) => s.trimStart()).slice(0, LIMITS.genres))}
                max={100}
                placeholder="Romantic, Slow-burn, Chaotic"
              />
            </More>
          </Section>

          <Section n={3} title="Episodes" hint="Your moments — photo, title, what it says" done={epDone}>
            {eps.map((e, i) => (
              <div key={i} className="es-ep">
                <div className="es-ep-head">
                  <b>Episode {i + 1}</b>
                  <div>
                    <button type="button" className="es-icon" onClick={() => moveEp(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></button>
                    <button type="button" className="es-icon" onClick={() => moveEp(i, 1)} disabled={i === eps.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
                    <button type="button" className="es-icon" onClick={() => updateMf("episodes", eps.filter((_, j) => j !== i))} aria-label={`Remove episode ${i + 1}`}><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="es-ep-grid">
                  <PhotoField label="Photo" url={e.imageUrl} crop={e.crop} aspect="16 / 9" onChange={(u, c) => setEp(i, { imageUrl: u, crop: c })} compact />
                  <div className="es-ep-fields">
                    <Field label="Title" required={i === 0} value={e.title} onChange={(v) => setEp(i, { title: v })} max={LIMITS.epTitle} placeholder={i === 0 ? "The Airport" : "The Power Cut"} />
                    <Field label="Synopsis" multiline rows={2} value={e.synopsis} onChange={(v) => setEp(i, { synopsis: v })} max={LIMITS.synopsis} placeholder="She's late, he's early, and…" />
                  </div>
                </div>
                <Field
                  label="Subtitles — what plays over it"
                  multiline
                  rows={3}
                  value={e.subtitle}
                  onChange={(v) => setEp(i, { subtitle: v })}
                  max={LIMITS.subtitle}
                  placeholder={"You ran the last fifty metres.\nI pretended I hadn't been waiting."}
                  help="One line per caption."
                />
              </div>
            ))}
            {eps.length < LIMITS.episodes && (
              <button type="button" className="es-add is-big" onClick={() => updateMf("episodes", [...eps, blankEpisode()])}>
                <Plus size={16} /> Add episode ({eps.length}/{LIMITS.episodes})
              </button>
            )}
          </Section>

          <Section n={4} title="Top 10 reasons" hint="The rail with the giant numbers" done={filledReasons >= 3}>
            <ListInputs
              items={mf.reasons ?? []}
              onChange={(v) => updateMf("reasons", v)}
              max={LIMITS.reasons}
              each={LIMITS.reason}
              numbered
              fixed
              placeholder={(i) => (i === 0 ? "You always hand me the left earbud" : i === 1 ? "Your laugh arrives before the punchline" : "another reason…")}
            />
          </Section>

          <Section n={5} title="Your letter 💌" hint="Pops up in the corner, sealed" done={!!mf.letter.trim()}>
            <Field
              label="The letter"
              multiline
              rows={7}
              value={mf.letter}
              onChange={(v) => updateMf("letter", v)}
              max={LIMITS.letter}
              placeholder="I made you a whole streaming service because a card felt too small…"
              help={`${mf.letter.length}/${LIMITS.letter} · leave empty for no letter`}
            />
            <More label="Lock it with a question">
              <Field label="Question" value={mf.lockQuestion} onChange={(v) => updateMf("lockQuestion", v)} max={LIMITS.lockQuestion} placeholder="Are you still watching… us?" />
              <Field label="The yes button" value={mf.lockAnswer} onChange={(v) => updateMf("lockAnswer", v)} max={LIMITS.lockAnswer} placeholder="always 💗" help="The “no” button runs away. Obviously." />
            </More>
          </Section>

          <Section n="+" title="Extras" hint="Inside jokes, plans, the finale, a password" defaultOpen={false}>
            <span className="es-label">Critically Acclaimed Inside Jokes</span>
            <ListInputs items={mf.insideJokes ?? []} onChange={(v) => updateMf("insideJokes", v)} max={LIMITS.jokes} each={LIMITS.joke} placeholder={() => "The Grey Hoodie: A Custody Battle"} />
            <span className="es-label" style={{ marginTop: 14 }}>Coming Soon (your plans)</span>
            <ListInputs items={mf.plans ?? []} onChange={(v) => updateMf("plans", v)} max={LIMITS.plans} each={LIMITS.plan} placeholder={() => "Goa, finally, no phones"} />
            <Field label="The finale (after the last episode)" multiline rows={4} value={mf.finaleText} onChange={(v) => updateMf("finaleText", v)} max={LIMITS.finaleText} help="Blank line between paragraphs — each one fades in." />
            <Field label="The button after the finale" value={mf.finaleQuestion} onChange={(v) => updateMf("finaleQuestion", v)} max={LIMITS.finaleQuestion} placeholder="renew for another season?" />
            <Field label="Password (optional)" value={pagePassword} onChange={setPagePassword} max={64} placeholder="only if you want one" help="They'll need it to open the link." />
          </Section>
        </div>

        <footer className="es-foot">
          {missing.length > 0 ? (
            <p className="es-missing">Still needs: <b>{missing.join(", ")}</b></p>
          ) : (
            <p className="es-ready">✓ Ready to preview</p>
          )}
          <button type="button" className="es-save" onClick={onSave}>
            Save &amp; preview
          </button>
        </footer>
      </aside>
    </div>
  );
});

const R = "#E10A17";

const ES_CSS = `
.es-overlay{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.6);display:flex;justify-content:flex-end;animation:esFade .2s}
.es{position:relative;width:min(520px,100%);height:100%;display:flex;flex-direction:column;background:#181818;color:#f2f2f2;font-family:var(--font-inter),'Helvetica Neue',Arial,sans-serif;box-shadow:-20px 0 60px rgba(0,0,0,.5);animation:esIn .32s cubic-bezier(.2,.8,.2,1)}
.es *{box-sizing:border-box}
.es-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 14px;padding-top:calc(16px + env(safe-area-inset-top,0px));border-bottom:1px solid rgba(255,255,255,.08)}
.es-head h2{margin:4px 0 0;font-size:20px;font-weight:700}
.es-x{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.08);color:#fff;border:0;cursor:pointer}
.es-body{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:14px 16px 24px}
.es-intro{margin:0 2px 14px;font-size:13.5px;line-height:1.45;color:#a8a8a8}
.es-sec{border:1px solid rgba(255,255,255,.08);background:#1f1f1f;border-radius:12px;margin-bottom:12px;overflow:hidden}
.es-sec-head{display:flex;align-items:center;gap:12px;width:100%;padding:14px;background:none;border:0;color:inherit;cursor:pointer;text-align:left}
.es-sec-n{width:28px;height:28px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;background:#333;font-size:13px;font-weight:700;transition:background .2s}
.es-sec-n.is-done{background:#46d369;color:#0b2912}
.es-sec-t{flex:1;min-width:0}
.es-sec-t b{display:block;font-size:16px}
.es-sec-t span{display:block;font-size:12.5px;color:#9a9a9a;margin-top:2px}
.es-sec-chev{transition:transform .2s;color:#9a9a9a}
.es-sec.is-open .es-sec-chev{transform:rotate(180deg)}
.es-sec-body{padding:2px 14px 16px;animation:esFade .2s}
.es-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.es-field{display:block;margin-bottom:12px;min-width:0}
.es-label{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:#cfcfcf;margin-bottom:6px}
.es-req{font-style:normal;font-size:10px;font-weight:700;color:${R};background:rgba(225,10,23,.14);padding:1px 6px;border-radius:99px;text-transform:uppercase;letter-spacing:.04em}
.es-count{margin-left:auto;font-style:normal;font-weight:500;color:#888;font-size:11px}
.es-field input,.es-field textarea,.es-list input{width:100%;background:#121212;border:1px solid #3a3a3a;border-radius:8px;color:#fff;font:inherit;font-size:16px;padding:12px 13px;outline:none;transition:border-color .15s,box-shadow .15s}
.es-field textarea{resize:vertical;line-height:1.45;min-height:72px}
.es-field input.is-big{font-family:var(--font-oswald),'Arial Narrow',sans-serif;font-size:24px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;padding:10px 13px}
.es-field input:focus,.es-field textarea:focus,.es-list input:focus{border-color:${R};box-shadow:0 0 0 3px rgba(225,10,23,.2)}
.es-field input::placeholder,.es-field textarea::placeholder,.es-list input::placeholder{color:#5f5f5f}
.es-help{display:block;font-size:11.5px;color:#8a8a8a;margin-top:5px}
.es-range{padding:0!important;height:40px;accent-color:${R};background:transparent!important;border:0!important}
.es-more{margin:4px 0 6px}
.es-more>button{display:inline-flex;align-items:center;gap:6px;background:none;border:0;color:#bdbdbd;font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 0}
.es-more>button svg{transition:transform .2s}
.es-more.is-open>button svg{transform:rotate(180deg)}
.es-more-body{padding:8px 0 0}
.es-photo{margin-bottom:12px;min-width:0}
.es-photo-empty{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1.5px dashed #555;background:#141414;color:#bbb;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:border-color .15s,color .15s}
.es-photo-empty:hover{border-color:${R};color:#fff}
.es-photo.is-compact .es-photo-empty,.es-photo.is-compact .es-photo-frame{max-width:160px}
.es-photo-frame{position:relative;display:block;width:100%;overflow:hidden;background:#000;border:0;padding:0;cursor:pointer}
.es-photo-frame img{position:absolute;inset:0}
.es-photo-adjust{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:99px;background:rgba(0,0,0,.65);color:#fff;font-size:11px;font-weight:700}
.es-photo-acts{display:flex;gap:6px;margin-top:6px}
.es-photo-acts button{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;border-radius:7px;border:1px solid #3a3a3a;background:#222;color:#ddd;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.es-photo-acts button:hover{border-color:#666}
.es-err{display:block;color:#ff8aa6;font-size:12px;margin-top:4px}
.es-ep{border:1px solid #333;border-radius:10px;padding:12px;margin-bottom:12px;background:#1a1a1a}
.es-ep-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.es-ep-head b{font-size:14px}
.es-ep-head>div{display:flex;gap:4px}
.es-ep-grid{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px}
.es-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;border:1px solid #3a3a3a;background:#222;color:#ccc;cursor:pointer}
.es-icon:disabled{opacity:.35;cursor:default}
.es-add{display:inline-flex;align-items:center;gap:6px;border:1px dashed #555;background:transparent;color:#ddd;border-radius:8px;padding:10px 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.es-add.is-big{width:100%;justify-content:center;min-height:50px;border-color:${R};color:#ff9ab5}
.es-list{display:flex;flex-direction:column;gap:8px;margin-bottom:6px}
.es-list-row{display:flex;align-items:center;gap:8px}
.es-list-num{flex:0 0 34px;font-family:'Arial Black',Arial,sans-serif;font-weight:900;font-size:26px;line-height:1;text-align:center;color:#181818;-webkit-text-stroke:1.5px #777;letter-spacing:-.08em}
.es-list-num.is-10{font-size:21px}
.es-foot{display:flex;align-items:center;gap:12px;padding:12px 16px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid rgba(255,255,255,.08);background:#141414}
.es-missing,.es-ready{flex:1;margin:0;font-size:12.5px;line-height:1.35;color:#bbb}
.es-missing b{color:#ff9ab5}
.es-ready{color:#46d369;font-weight:600}
.es-save{flex-shrink:0;height:50px;padding:0 24px;border-radius:8px;border:0;background:${R};color:#fff;font:inherit;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 10px 24px -10px rgba(225,10,23,.8);transition:transform .12s,filter .15s}
.es-save:hover{filter:brightness(1.08)}.es-save:active{transform:scale(.97)}
@media (max-width:560px){
  .es{width:100%}
  .es-ep-grid{grid-template-columns:1fr}
  .es-ep-grid .es-photo.is-compact .es-photo-empty,.es-ep-grid .es-photo.is-compact .es-photo-frame{max-width:none}
}
@keyframes esFade{from{opacity:0}}
@keyframes esIn{from{transform:translateX(40px);opacity:0}}
@media (prefers-reduced-motion:reduce){.es-overlay,.es,.es-sec-body{animation:none}}
`;
