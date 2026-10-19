"use client";

// ─── Traction: real numbers for outreach emails ─────────────────────────────
//
// Upload an analytics screenshot (Google Search Console, Google Analytics).
// The server strips and resizes it, stores it on the CDN, and the AI reads the
// headline numbers off it to pre-fill the form below. Nothing is used in an
// email until you confirm the numbers here — the AI's reading is a draft.
// Confirmed numbers are the only ones the spam check lets into a first email.

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, ImagePlus, Loader2, Plus, RefreshCw, Star, Trash2, X } from "lucide-react";
import { A, Panel } from "../../adminKit";
import { SOURCE_LABEL, api, uploadForm, type Proof, type ProofSource } from "./shared";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

interface Extracted {
  source: ProofSource;
  periodLabel: string;
  stats: { label: string; value: string }[];
  caption: string;
  notes: string;
}

interface FormState {
  id: string;
  imageUrl: string;
  isNew: boolean;
  source: ProofSource;
  periodLabel: string;
  stats: { label: string; value: string }[];
  caption: string;
  isDefault: boolean;
  notes: string;
}

/** What the email may quote: counts only. Mirrors the server's quotableStats. */
const quotable = (s: { label: string; value: string }) => /^[\d.,]+\s?[KMB]?$/i.test(s.value.trim()) && !/ctr|click[- ]?through|position|rank|rate|bounce|duration|time|revenue/i.test(s.label);

export default function TractionPanel({ token, onChanged }: { token: string; onChanged?: (proofs: Proof[]) => void }) {
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [busy, setBusy] = useState<"upload" | "save" | string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceFor = useRef<string | null>(null);

  const load = useCallback(async () => {
    const r = await api<{ data: { proofs: Proof[] } }>(token, "/prospects/proofs");
    if (r.ok) {
      setProofs(r.data.data.proofs);
      onChanged?.(r.data.data.proofs);
    } else setErr(r.data.error || "Could not load the screenshots");
  }, [token, onChanged]);

  useEffect(() => {
    if (!token) return;
    let live = true;
    api<{ data: { proofs: Proof[] } }>(token, "/prospects/proofs").then((r) => {
      if (!live) return;
      if (r.ok) {
        setProofs(r.data.data.proofs);
        onChanged?.(r.data.data.proofs);
      } else setErr(r.data.error || "Could not load the screenshots");
    });
    return () => { live = false; };
  }, [token, onChanged]);

  function pick(replaceId: string | null) {
    replaceFor.current = replaceId;
    fileRef.current?.click();
  }

  async function onFile(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setErr(null);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { setErr("Upload a PNG, JPG or WebP screenshot."); return; }
    if (file.size > MAX_BYTES) { setErr("That image is over 5 MB — crop it or save it smaller."); return; }
    const fd = new FormData();
    fd.append("file", file);
    if (replaceFor.current) fd.append("replaceId", replaceFor.current);
    setBusy("upload");
    const r = await uploadForm<{ data: { proof: Proof; extracted: Extracted } }>(token, "/prospects/proofs/upload", fd);
    setBusy(null);
    if (!r.ok) { setErr(r.data.error || "Upload failed"); return; }
    const { proof, extracted } = r.data.data;
    const replacing = !!replaceFor.current;
    setForm({
      id: proof.id,
      imageUrl: proof.imageUrl,
      isNew: !replacing,
      // The AI's reading pre-fills the form; for a replacement, keep what was confirmed unless the AI read something.
      source: extracted.stats.length ? extracted.source : proof.source,
      periodLabel: extracted.periodLabel || proof.periodLabel,
      stats: extracted.stats.length ? extracted.stats : proof.stats.length ? proof.stats : [{ label: "", value: "" }],
      caption: extracted.caption || proof.caption,
      isDefault: proof.isDefault || !(proofs || []).some((p) => p.active && p.isDefault),
      notes: extracted.notes,
    });
    void load();
  }

  function edit(p: Proof) {
    setErr(null);
    setForm({ id: p.id, imageUrl: p.imageUrl, isNew: false, source: p.source, periodLabel: p.periodLabel, stats: p.stats.length ? p.stats : [{ label: "", value: "" }], caption: p.caption, isDefault: p.isDefault, notes: "" });
  }

  async function confirm() {
    if (!form) return;
    setBusy("save");
    setErr(null);
    const r = await api(token, `/prospects/proofs/${form.id}`, {
      method: "PATCH",
      body: { source: form.source, periodLabel: form.periodLabel, stats: form.stats.filter((s) => s.label.trim() || s.value.trim()), caption: form.caption, isDefault: form.isDefault },
    });
    setBusy(null);
    if (!r.ok) { setErr(r.data.error || "Could not save"); return; }
    setForm(null);
    void load();
  }

  async function remove(id: string, ask = true) {
    if (ask && !window.confirm("Delete this screenshot? It is removed from the CDN; emails already queued with it will fail rather than go without it.")) return;
    setBusy(id);
    const r = await api(token, `/prospects/proofs/${id}`, { method: "DELETE" });
    setBusy(null);
    if (!r.ok) { setErr(r.data.error || "Could not delete"); return; }
    if (form?.id === id) setForm(null);
    void load();
  }

  async function cancelForm() {
    // A new upload nobody confirmed is not kept (row + CDN object).
    if (form?.isNew) await remove(form.id, false);
    setForm(null);
  }

  const setStat = (i: number, k: "label" | "value", v: string) => setForm((f) => (f ? { ...f, stats: f.stats.map((s, n) => (n === i ? { ...s, [k]: v } : s)) } : f));
  const list = (proofs || []).filter((p) => p.id !== form?.id);

  return (
    <Panel
      title="Traction"
      icon={<BarChart3 size={15} />}
      note="Real numbers for your emails"
      delay={0.03}
      style={{ marginTop: 12 }}
      right={
        <button type="button" className="psp-btn" disabled={busy !== null} onClick={() => pick(null)}>
          {busy === "upload" ? <Loader2 size={15} className="psp-spin" /> : <ImagePlus size={15} />} {busy === "upload" ? "Reading…" : "Upload screenshot"}
        </button>
      }
    >
      <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={(e) => void onFile(e.target.files?.[0])} />
      <p className="trc-intro">
        Upload a Google Search Console or Google Analytics screenshot. The AI reads the numbers; you check them. Confirmed counts (like clicks or users) can go into an email as one honest line — and the screenshot itself, if you choose.
      </p>
      {err && <p className="psp-err" role="alert"><AlertTriangle size={12} /> {err}</p>}

      {form && (
        <div className="trc-form">
          <a className="trc-shot" href={form.imageUrl} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt="Uploaded analytics screenshot" />
          </a>
          <div className="trc-fields">
            <p className="trc-check"><CheckCircle2 size={13} /> Check every number against the screenshot — the AI&apos;s reading is only a draft.</p>
            {form.notes && <p className="trc-notes"><AlertTriangle size={12} /> {form.notes}</p>}
            <div className="trc-row2">
              <label className="psp-field">
                <span>Source</span>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as ProofSource })}>
                  {(Object.keys(SOURCE_LABEL) as ProofSource[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
                </select>
              </label>
              <label className="psp-field">
                <span>Period</span>
                <input value={form.periodLabel} maxLength={80} placeholder="last 3 months" onChange={(e) => setForm({ ...form, periodLabel: e.target.value })} />
              </label>
            </div>
            <div className="trc-stats">
              <span className="trc-h">Numbers <em>— exactly as on the screenshot</em></span>
              {form.stats.map((s, i) => (
                <div key={i} className="trc-stat">
                  <input aria-label="Label" value={s.label} maxLength={60} placeholder="Total clicks" onChange={(e) => setStat(i, "label", e.target.value)} />
                  <input aria-label="Value" className="trc-val" value={s.value} maxLength={24} placeholder="52.2K" onChange={(e) => setStat(i, "value", e.target.value)} />
                  <span className={`trc-tag ${quotable(s) ? "ok" : ""}`}>{quotable(s) ? "can quote" : "not quoted"}</span>
                  <button type="button" className="trc-x" aria-label="Remove this number" onClick={() => setForm({ ...form, stats: form.stats.filter((_, n) => n !== i) })}><X size={13} /></button>
                </div>
              ))}
              {form.stats.length < 6 && (
                <button type="button" className="trc-add" onClick={() => setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] })}><Plus size={12} /> Add a number</button>
              )}
              <small>Percentages and positions are never quoted in an email — only counts.</small>
            </div>
            <label className="psp-field">
              <span>Caption <em>— for you, not sent</em></span>
              <input value={form.caption} maxLength={280} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            </label>
            <label className="trc-def">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              <span>Default for emails (preselected in Generate)</span>
            </label>
            <div className="trc-actions">
              <button type="button" className="psp-btn" disabled={busy !== null} onClick={() => void cancelForm()}>{form.isNew ? "Discard" : "Cancel"}</button>
              <button type="button" className="psp-btn primary" disabled={busy !== null} onClick={() => void confirm()}>
                {busy === "save" ? <Loader2 size={15} className="psp-spin" /> : <CheckCircle2 size={15} />} Confirm numbers
              </button>
            </div>
          </div>
        </div>
      )}

      {!proofs ? (
        <p className="trc-empty"><Loader2 size={13} className="psp-spin" /> Loading…</p>
      ) : list.length === 0 && !form ? (
        <p className="trc-empty">No screenshots yet.</p>
      ) : (
        <ul className="trc-list">
          {list.map((p) => (
            <li key={p.id} className={p.active ? "" : "pending"}>
              <a className="trc-thumb" href={p.imageUrl} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={`${SOURCE_LABEL[p.source]} screenshot`} loading="lazy" />
              </a>
              <div className="trc-meta">
                <b>{SOURCE_LABEL[p.source]}</b>
                <span>{p.periodLabel || "—"}</span>
                <span className="trc-nums">{p.stats.map((s) => <i key={s.label} className={p.quotable.includes(s.value) ? "q" : ""}>{s.label} <b>{s.value}</b></i>)}</span>
                <span className="trc-badges">
                  {p.isDefault && p.active && <em className="def"><Star size={10} /> Default</em>}
                  {!p.active && <em className="pend"><AlertTriangle size={10} /> Not confirmed — can&apos;t be used yet</em>}
                </span>
              </div>
              <div className="trc-btns">
                <button type="button" className="psp-btn" disabled={busy !== null} onClick={() => edit(p)}>{p.active ? "Edit" : "Confirm"}</button>
                <button type="button" className="psp-btn" disabled={busy !== null} onClick={() => pick(p.id)} title="Replace the screenshot"><RefreshCw size={13} /></button>
                <button type="button" className="psp-btn danger" disabled={busy !== null} onClick={() => void remove(p.id)} aria-label="Delete"><Trash2 size={13} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .trc-intro { margin: 0 0 10px; font-size: 12.5px; line-height: 1.5; color: ${A.soft}; }
        .trc-empty { margin: 0; font-size: 12.5px; color: ${A.muted}; display: flex; gap: 6px; align-items: center; }
        .trc-form { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 14px; padding: 12px; border-radius: 14px; border: 1.5px solid rgba(201,168,76,.5); background: rgba(201,168,76,.06); margin-bottom: 12px; }
        .trc-shot { display: block; border-radius: 10px; overflow: hidden; border: 1px solid ${A.edge}; background: #fff; align-self: start; }
        .trc-shot img { display: block; width: 100%; height: auto; }
        .trc-fields { display: grid; gap: 10px; align-content: start; min-width: 0; }
        .trc-check { margin: 0; display: flex; gap: 6px; font-size: 12.5px; font-weight: 700; color: ${A.goldDeep}; line-height: 1.45; }
        .trc-check svg, .trc-notes svg { flex: none; margin-top: 2px; }
        .trc-notes { margin: 0; display: flex; gap: 6px; font-size: 12px; color: #7a4f12; background: rgba(183,121,31,.1); padding: 7px 9px; border-radius: 10px; }
        .trc-row2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 8px; }
        .trc-stats { display: grid; gap: 6px; }
        .trc-h { font-size: 11px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: ${A.muted}; }
        .trc-h em { font-style: normal; text-transform: none; letter-spacing: 0; font-weight: 600; }
        .trc-stat { display: grid; grid-template-columns: minmax(0, 1fr) 92px auto 30px; gap: 6px; align-items: center; }
        .trc-stat input { min-width: 0; height: 38px; padding: 0 10px; border-radius: 10px; border: 1.5px solid ${A.edge}; background: #fff; color: ${A.ink}; font-size: 16px; font-family: inherit; outline: none; }
        .trc-stat input:focus { border-color: ${A.gold}; }
        .trc-val { font-weight: 800; }
        .trc-tag { font-size: 10.5px; font-weight: 800; color: ${A.muted}; white-space: nowrap; }
        .trc-tag.ok { color: ${A.ok}; }
        .trc-x { width: 30px; height: 30px; border-radius: 99px; border: 1px solid ${A.edge}; background: #fff; color: ${A.soft}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .trc-add { justify-self: start; height: 30px; padding: 0 10px; border-radius: 99px; border: 1px dashed rgba(201,168,76,.7); background: #fff; color: ${A.goldDeep}; font: inherit; font-size: 12px; font-weight: 800; display: inline-flex; gap: 4px; align-items: center; cursor: pointer; }
        .trc-stats small { font-size: 11.5px; color: ${A.muted}; }
        .trc-def { display: flex; gap: 8px; align-items: center; font-size: 13px; font-weight: 700; color: ${A.ink}; cursor: pointer; }
        .trc-def input { width: 17px; height: 17px; accent-color: ${A.maroon}; }
        .trc-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
        .trc-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .trc-list li { display: grid; grid-template-columns: 120px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 8px; border-radius: 12px; border: 1px solid ${A.edge}; background: #fff; }
        .trc-list li.pending { border-color: rgba(183,121,31,.4); background: rgba(183,121,31,.05); }
        .trc-thumb { display: block; border-radius: 8px; overflow: hidden; border: 1px solid ${A.edge}; }
        .trc-thumb img { display: block; width: 100%; height: 68px; object-fit: cover; object-position: top left; }
        .trc-meta { display: grid; gap: 3px; min-width: 0; font-size: 12.5px; color: ${A.soft}; }
        .trc-meta > b { color: ${A.ink}; font-size: 13px; }
        .trc-nums { display: flex; flex-wrap: wrap; gap: 4px 10px; }
        .trc-nums i { font-style: normal; color: ${A.muted}; }
        .trc-nums i.q b { color: ${A.ok}; }
        .trc-nums b { color: ${A.ink}; }
        .trc-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .trc-badges em { font-style: normal; font-size: 11px; font-weight: 800; display: inline-flex; gap: 4px; align-items: center; padding: 2px 8px; border-radius: 99px; }
        .trc-badges .def { color: ${A.goldDeep}; background: rgba(201,168,76,.16); }
        .trc-badges .pend { color: #7a4f12; background: rgba(183,121,31,.12); }
        .trc-btns { display: flex; gap: 6px; }
        .trc-btns .psp-btn { min-height: 34px; padding: 0 12px; }
        @media (max-width: 760px) {
          .trc-form { grid-template-columns: minmax(0, 1fr); }
          .trc-list li { grid-template-columns: 84px minmax(0, 1fr); }
          .trc-btns { grid-column: 1 / -1; justify-content: flex-end; }
          .trc-row2 { grid-template-columns: minmax(0, 1fr); }
          .trc-stat { grid-template-columns: minmax(0, 1fr) 84px 30px; }
          .trc-tag { display: none; }
        }
      `}</style>
    </Panel>
  );
}
