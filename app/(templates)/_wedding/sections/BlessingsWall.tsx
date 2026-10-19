"use client";
// ─── <BlessingsWall> — guests leave a line; the wall fills like a scrapbook ──
//
//   <BlessingsWall mode={mode} />                       (Royal tier)
//
// Live: GET …/share/:shareId/blessings (approved only), refreshed every
// `refreshMs` while the tab is visible; POST …/blessing. A new blessing shows
// immediately at the top. Preview: `sample` blessings, posting is local.
// Notes flow in balanced CSS columns (newest first), each with a slight tilt.

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useDayShare } from "../../_valentine/kit/shareInfo";
import { fetchBlessings, postBlessing } from "../api";
import { BLESSING_LIMITS, type Blessing } from "../types";
import { Reveal } from "../WeddingRoot";

export interface BlessingsWallProps {
  mode: "preview" | "live";
  title?: string;
  intro?: string;
  /** Preview / empty-state notes. */
  sample?: Blessing[];
  /** Poll interval while visible, ms. Default 20000; 0 = no polling. */
  refreshMs?: number;
  share?: { slug: string; shareId: string } | null;
}

const SAMPLE: Blessing[] = [
  { id: "s1", name: "Nani", message: "सदा सुखी रहो, मेरे बच्चों। ❤️", createdAt: "" },
  { id: "s2", name: "Kabir & Ira", message: "To a lifetime of dancing badly together at every sangeet. Love you both!", createdAt: "" },
  { id: "s3", name: "Meera Aunty", message: "May your home always be full of laughter, chai and good food.", createdAt: "" },
];

function NoteCard({ b, i, fresh }: { b: Blessing; i: number; fresh?: boolean }) {
  return (
    <li className={`wk-note${fresh ? " is-fresh" : ""}`} style={{ ["--wk-tilt" as string]: `${((i * 37) % 5) - 2}deg` }}>
      <span className="wk-note-q wk-foil-text" aria-hidden>
        “
      </span>
      <p className="wk-note-msg" lang={/[ऀ-ॿ]/.test(b.message) ? "hi" : undefined}>
        {b.message}
      </p>
      <p className="wk-note-by">— {b.name}</p>
    </li>
  );
}

export default function BlessingsWall({ mode, title = "Blessings for the couple", intro = "Leave a line of love — it appears here for everyone.", sample = SAMPLE, refreshMs = 20000, share }: BlessingsWallProps) {
  const ctx = useDayShare();
  const target = share === undefined ? ctx : share;
  const live = mode === "live" && !!target;
  const [list, setList] = useState<Blessing[]>(live ? [] : sample);
  const [fresh, setFresh] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [honey, setHoney] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const mounted = useRef(true);

  const load = useCallback(() => {
    if (!live || !target) return;
    fetchBlessings(target.slug, target.shareId).then((r) => {
      if (r.ok && mounted.current) setList(r.data);
    });
  }, [live, target]);

  useEffect(() => {
    mounted.current = true;
    if (!live) return;
    load();
    if (!refreshMs) return () => void (mounted.current = false);
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, refreshMs);
    return () => {
      mounted.current = false;
      window.clearInterval(t);
    };
  }, [live, load, refreshMs]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !msg.trim()) {
      setError("Add your name and a line for the couple.");
      return;
    }
    setState("sending");
    let b: Blessing = { id: `local-${list.length}`, name: name.trim(), message: msg.trim(), createdAt: new Date().toISOString() };
    if (live && target) {
      const r = await postBlessing(target.slug, target.shareId, { name: b.name, message: b.message }, { honeypot: honey });
      if (!r.ok) {
        setState("idle");
        setError(r.error);
        return;
      }
      b = r.data;
    }
    setList((l) => [b, ...l.filter((x) => x.id !== b.id)]);
    setFresh(b.id);
    setMsg("");
    setState("sent");
  };

  const shown = list.length ? list : live ? [] : sample;
  return (
    <div className="wk-bless">
      <Reveal className="wk-card wk-foil-border wk-bless-form">
        <form onSubmit={submit} noValidate>
          <h3 className="wk-rsvp-title">{title}</h3>
          {intro && <p className="wk-rsvp-intro">{intro}</p>}
          <label className="wk-field">
            <span className="wk-field-l">Your name</span>
            <input className="wk-input" value={name} maxLength={BLESSING_LIMITS.name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="wk-field">
            <span className="wk-field-l">
              Your blessing <small>{Array.from(msg).length}/{BLESSING_LIMITS.message}</small>
            </span>
            <textarea className="wk-input wk-area" rows={3} maxLength={BLESSING_LIMITS.message} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="May your love grow brighter every year…" />
          </label>
          <input className="wk-hp" tabIndex={-1} autoComplete="off" aria-hidden name="website" value={honey} onChange={(e) => setHoney(e.target.value)} />
          {error && (
            <p className="wk-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="wk-btn" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : state === "sent" ? "Add another blessing" : "Send blessing"}
          </button>
          {state === "sent" && (
            <p className="wk-ok" role="status">
              Thank you — your blessing is on the wall.
            </p>
          )}
        </form>
      </Reveal>
      {shown.length > 0 && (
        <ul className="wk-notes" aria-label="Blessings">
          {shown.map((b, i) => (
            <NoteCard key={b.id} b={b} i={i} fresh={b.id === fresh} />
          ))}
        </ul>
      )}
    </div>
  );
}
