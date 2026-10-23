"use client";

// ─── The blessings wall (this template's own server wall, kept as it was) ────
// POST /reception-pages/share/:shareId/blessings { name, message } answers the
// whole list. In the editor's preview it works locally. Older pages keep every
// blessing they already collected.

import { useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { Reveal } from "../../_wedding";
import { HEART, Icon } from "./Actions";
import type { Strings } from "./strings";
import type { Lang, Wish } from "./types";

const MAX_NAME = 60;
const MAX_MSG = 280;

export default function Blessings({ wishes, mode, shareId, s, lang }: { wishes: Wish[]; mode: "preview" | "live"; shareId?: string; s: Strings; lang: Lang }) {
  const [list, setList] = useState<Wish[]>(wishes);
  const [from, setFrom] = useState(wishes);
  if (from !== wishes) {
    // The editor changed the sample wishes: follow them.
    setFrom(wishes);
    setList(wishes);
  }
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    const n = name.trim();
    const m = msg.trim();
    if (!n || !m || busy) return;
    setBusy(true);
    setErr("");
    try {
      if (mode === "live" && shareId) {
        const res = await fetch(`${API_URL}/reception-pages/share/${encodeURIComponent(shareId)}/blessings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
          body: JSON.stringify({ name: n, message: m }),
        });
        const j = (await res.json().catch(() => ({}))) as { success?: boolean; data?: Wish[]; error?: string };
        if (!res.ok || !j.success) throw new Error(j.error || "Could not send — please try again");
        setList((j.data ?? []).map((b) => ({ name: b.name, message: b.message })));
      } else {
        setList((l) => [...l, { name: n, message: m }]);
      }
      setName("");
      setMsg("");
      setDone(true);
      window.setTimeout(() => setDone(false), 3500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send — please try again");
    } finally {
      setBusy(false);
    }
  };

  const shown = [...list].reverse().slice(0, 60);

  return (
    <div className="rc-bless">
      <form
        className="rc-bless-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <p className="rc-bless-intro" lang={lang}>
          {s.blessingsIntro}
        </p>
        <label className="rc-field">
          <span lang={lang}>{s.yourName}</span>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))} autoComplete="name" required maxLength={MAX_NAME} />
        </label>
        <label className="rc-field">
          <span lang={lang}>{s.yourBlessing}</span>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value.slice(0, MAX_MSG))} rows={3} required maxLength={MAX_MSG} />
          <small className="rc-count-chars">
            {msg.length}/{MAX_MSG}
          </small>
        </label>
        <button type="submit" className="rc-btn rc-btn-gold" disabled={busy || !name.trim() || !msg.trim()}>
          <Icon d={HEART} /> <span lang={lang}>{busy ? s.sending : s.sendBlessing}</span>
        </button>
        <p className="rc-bless-status" aria-live="polite">
          {done ? s.blessingThanks : err}
        </p>
      </form>
      {shown.length > 0 && (
        <ul className="rc-bless-wall">
          {shown.map((w, i) => (
            <Reveal as="li" key={`${w.name}-${i}-${w.message.length}`} className="rc-bless-card" delay={(i % 4) * 60}>
              <p className="rc-bless-msg">{w.message}</p>
              <p className="rc-bless-from">— {w.name}</p>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
