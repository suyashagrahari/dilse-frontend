"use client";

// ─── + Add: one prospect, or a pasted list ───────────────────────────────────
//
// Validation mirrors the server (parseProspectInput) so mistakes show before
// pressing Add; the server is still the authority. Duplicates are checked as
// the email / Instagram field is left — "already a prospect" and "already an
// influencer" both name the person and link to them, so nobody is invited
// twice or pitched a programme they are already in.

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2, UserPlus } from "lucide-react";
import { parseInstagramHandle } from "@/lib/instagramHandle";
import { A } from "../../adminKit";
import { Sheet, api, type Prospect } from "./shared";

interface Dup {
  prospect?: { id: string; name: string; email: string; status: string; deleted: boolean };
  influencer?: { id: string; name: string; email: string; instagram: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RANGES = ["", "<10k", "10k-50k", "50k-200k", "200k-1M", "1M+"];

export default function AddProspectModal({
  open,
  onClose,
  token,
  onAdded,
  onOpenProspect,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  onAdded: (p?: Prospect) => void;
  onOpenProspect: (id: string) => void;
}) {
  const [tab, setTab] = useState<"one" | "list">("one");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ig, setIg] = useState("");
  const [note, setNote] = useState("");
  const [niche, setNiche] = useState("");
  const [range, setRange] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [dup, setDup] = useState<Dup>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [list, setList] = useState("");
  const [result, setResult] = useState<{ added: number; skipped: { line?: number; email?: string; error: string }[] } | null>(null);

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Add their name.";
    if (!EMAIL_RE.test(email.trim())) e.email = "That doesn't look like a valid email address.";
    if (ig.trim()) {
      const r = parseInstagramHandle(ig);
      if (!r.ok) e.instagram = r.message.replace(/your username/i, "their username");
    }
    return e;
  }

  async function check() {
    const e = email.trim().toLowerCase();
    const h = ig.trim() ? parseInstagramHandle(ig) : null;
    if (!EMAIL_RE.test(e) && !(h && h.ok)) return;
    const r = await api<{ data: Dup }>(token, "/prospects/check", { body: { email: EMAIL_RE.test(e) ? e : "", instagram: h && h.ok ? h.handle : "" } });
    if (r.ok) setDup(r.data.data || {});
  }

  async function submit() {
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setMsg(null);
    const r = await api<{ data: Prospect; field?: string; duplicate?: Dup }>(token, "/prospects", {
      body: { name, email, instagram: ig, note, niche, followerRange: range },
    });
    setBusy(false);
    if (!r.ok) {
      if (r.data.duplicate) setDup(r.data.duplicate);
      if (r.data.field) setErrs({ [r.data.field]: r.data.error || "Check this field" });
      else setMsg(r.data.error || "Could not add");
      return;
    }
    onAdded(r.data.data);
    onClose();
  }

  async function importList() {
    setBusy(true);
    setResult(null);
    const r = await api<{ data: { added: number; skipped: { line?: number; email?: string; error: string }[] } }>(token, "/prospects/import", { body: { text: list } });
    setBusy(false);
    if (!r.ok) {
      setMsg(r.data.error || "Import failed");
      return;
    }
    setResult(r.data.data);
    if (r.data.data.added) onAdded();
  }

  const blocking = !!dup.influencer || (!!dup.prospect && !dup.prospect.deleted);
  const lines = list.split("\n").filter((l) => l.trim()).length;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={<><UserPlus size={16} color={A.goldDeep} /> Add a prospect</>}
      footer={
        tab === "one" ? (
          <>
            <button type="button" className="psp-btn" onClick={onClose}>Cancel</button>
            <button type="button" className="psp-btn primary" disabled={busy || blocking} onClick={() => void submit()}>
              {busy ? <Loader2 size={15} className="psp-spin" /> : <UserPlus size={15} />} Add
            </button>
          </>
        ) : (
          <>
            <button type="button" className="psp-btn" onClick={onClose}>{result ? "Done" : "Cancel"}</button>
            <button type="button" className="psp-btn primary" disabled={busy || !lines} onClick={() => void importList()}>
              {busy ? <Loader2 size={15} className="psp-spin" /> : <ClipboardList size={15} />} Add {lines || ""} {lines === 1 ? "person" : "people"}
            </button>
          </>
        )
      }
    >
      <div className="apm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "one"} data-on={tab === "one" ? "1" : "0"} onClick={() => setTab("one")}>One person</button>
        <button type="button" role="tab" aria-selected={tab === "list"} data-on={tab === "list" ? "1" : "0"} onClick={() => setTab("list")}>Paste a list</button>
      </div>

      {tab === "one" ? (
        <form className="apm" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <label className="psp-field" data-err={errs.name ? "1" : "0"}>
            <span>Name</span>
            <input value={name} autoFocus maxLength={80} placeholder="Priya Sharma" onChange={(e) => setName(e.target.value)} />
            {errs.name && <p className="psp-err">{errs.name}</p>}
          </label>
          <label className="psp-field" data-err={errs.email ? "1" : "0"}>
            <span>Email</span>
            <input type="email" inputMode="email" autoComplete="off" value={email} maxLength={180} placeholder="priya@gmail.com" onChange={(e) => { setEmail(e.target.value); setDup({}); }} onBlur={() => void check()} />
            {errs.email && <p className="psp-err">{errs.email}</p>}
          </label>
          <label className="psp-field" data-err={errs.instagram ? "1" : "0"}>
            <span>Instagram <em>— @handle or profile link</em></span>
            <input value={ig} autoCapitalize="none" autoCorrect="off" maxLength={120} placeholder="@priya.reels" onChange={(e) => { setIg(e.target.value); setDup({}); }} onBlur={() => void check()} />
            {errs.instagram && <p className="psp-err">{errs.instagram}</p>}
          </label>

          {dup.influencer && (
            <div className="apm-dup bad">
              <AlertTriangle size={14} />
              <span><b>{dup.influencer.name}</b> is already an influencer{dup.influencer.instagram ? ` (@${dup.influencer.instagram})` : ""}. <Link href={`/admin/influencers/${dup.influencer.id}`}>Open their page →</Link></span>
            </div>
          )}
          {dup.prospect && !dup.prospect.deleted && (
            <div className="apm-dup bad">
              <AlertTriangle size={14} />
              <span><b>{dup.prospect.name}</b> is already a prospect ({dup.prospect.status.replace("_", " ")}). <button type="button" onClick={() => { onClose(); onOpenProspect(dup.prospect!.id); }}>Open →</button></span>
            </div>
          )}
          {dup.prospect?.deleted && !dup.influencer && (
            <div className="apm-dup">
              <AlertTriangle size={14} />
              <span>This person was added before and deleted. Adding restores them{dup.prospect.status === "unsubscribed" || dup.prospect.status === "bounced" ? " — except they unsubscribed or bounced, so the server will refuse." : "."}</span>
            </div>
          )}

          <label className="psp-field">
            <span>Note <em>— optional; the AI may mention only what you write here</em></span>
            <textarea rows={3} maxLength={400} value={note} placeholder="e.g. Her Karwa Chauth reel with her husband was lovely" onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="apm-row">
            <label className="psp-field">
              <span>Niche <em>— optional</em></span>
              <input value={niche} maxLength={60} placeholder="couple comedy, festive DIY…" onChange={(e) => setNiche(e.target.value)} />
            </label>
            <label className="psp-field">
              <span>Followers <em>— for you only</em></span>
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                {RANGES.map((r) => <option key={r} value={r}>{r || "Not sure"}</option>)}
              </select>
            </label>
          </div>
          {msg && <p className="psp-err">{msg}</p>}
          <button type="submit" hidden />
        </form>
      ) : (
        <div className="apm">
          <p className="apm-help">One person per line: <code>name, email, instagram, note</code>. A paste from a spreadsheet (tabs) works too. Instagram and note are optional. Up to 200 at a time.</p>
          <label className="psp-field">
            <span>List</span>
            <textarea rows={9} value={list} placeholder={"Priya Sharma, priya@gmail.com, @priya.reels, couple comedy\nRavi Kumar, ravi@outlook.com, ravi.cooks"} onChange={(e) => { setList(e.target.value); setResult(null); }} />
          </label>
          {result && (
            <div className={`apm-dup ${result.skipped.length ? "" : "ok"}`}>
              <CheckCircle2 size={14} />
              <span>
                <b>{result.added} added.</b>
                {result.skipped.length > 0 && (
                  <> {result.skipped.length} skipped:
                    <ul>{result.skipped.slice(0, 12).map((s, i) => <li key={i}>{s.line ? `Line ${s.line}` : s.email}: {s.error}</li>)}</ul>
                  </>
                )}
              </span>
            </div>
          )}
          {msg && <p className="psp-err">{msg}</p>}
        </div>
      )}
      <style>{`
        .apm { display: grid; gap: 12px; }
        .apm-tabs { display: inline-flex; gap: 2px; padding: 3px; margin-bottom: 14px; border-radius: 12px; background: rgba(61,12,17,.05); }
        .apm-tabs button { height: 34px; padding: 0 14px; border: none; border-radius: 10px; background: none; font: inherit; font-size: 12.5px; font-weight: 800; color: ${A.soft}; cursor: pointer; }
        .apm-tabs button[data-on="1"] { background: #fff; color: ${A.ink}; box-shadow: 0 1px 4px rgba(61,12,17,.12); }
        .apm-row { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 10px; }
        .apm-dup { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; border-radius: 12px; background: rgba(183,121,31,.1); color: #7a4f12; font-size: 12.5px; line-height: 1.5; }
        .apm-dup.bad { background: rgba(179,38,30,.08); color: ${A.danger}; }
        .apm-dup.ok { background: rgba(30,122,75,.08); color: ${A.ok}; }
        .apm-dup svg { flex: none; margin-top: 3px; }
        .apm-dup a, .apm-dup button { color: inherit; font-weight: 800; background: none; border: none; padding: 0; font: inherit; font-weight: 800; cursor: pointer; text-decoration: underline; }
        .apm-dup ul { margin: 6px 0 0; padding-left: 18px; }
        .apm-help { margin: 0; font-size: 12.5px; line-height: 1.55; color: ${A.soft}; }
        .apm-help code { font-size: 12px; background: rgba(61,12,17,.06); padding: 1px 5px; border-radius: 5px; }
        @media (max-width: 420px) { .apm-row { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </Sheet>
  );
}
