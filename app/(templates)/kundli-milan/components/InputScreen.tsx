"use client";

// ─── Screen 1 — birth particulars ────────────────────────────────────────────
//
// Deliberately plain. Two bordered column blocks, hard rules, no styled CTA —
// the ugliness of a 1990s astrology portal is the point. Nothing here computes
// anything; it only collects the four fields the engine seeds from.

import { useState } from "react";
import { isPastDate } from "@/lib/wire";
import { templateMediaBase } from "@/lib/templateMedia";
import type { Person } from "./types";
import { INK, MONO, PAPER, plainButton, SAFFRON, SERIF, SOFT_INK, DEVA } from "./ui";

const ASSET = templateMediaBase("kundli-milan");

/* ── date/time helpers ────────────────────────────────────────────────────── */

/** `1998-03-14` → `14/03/1998`. Empty in, empty out. */
export const isoToTyped = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

/** `14/03/1998` → `1998-03-14`, or null if it is not a real past-or-today date. */
export const typedToIso = (typed: string): string | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(typed.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  // isPastDate rejects 31/02 and anything in the future in one go.
  return isPastDate(iso) ? iso : null;
};

const maskDate = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

const maskTime = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
};

const validTime = (t: string): boolean => {
  if (!t) return true; // optional — the engine defaults it to noon
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
};

export interface PersonForm {
  name: string;
  dob: string; // DD/MM/YYYY as typed
  tob: string; // HH:MM as typed
  pob: string;
}

export const personToForm = (p: Person): PersonForm => ({
  name: p.name,
  dob: isoToTyped(p.dob),
  tob: p.tob,
  pob: p.pob,
});

export interface FieldErrors {
  name?: string;
  dob?: string;
  tob?: string;
}

/* ── field ────────────────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  value,
  onChange,
  error,
  inputMode,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  inputMode?: "text" | "numeric";
}) {
  return (
    <label style={{ display: "block", marginTop: 10 }}>
      <span style={{ fontFamily: SERIF, fontSize: 11, letterSpacing: 0.6, display: "block" }}>
        {label}
        {hint && <span style={{ color: SOFT_INK, opacity: 0.75 }}> {hint}</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        style={{
          width: "100%",
          marginTop: 3,
          minHeight: 44,
          padding: "8px 8px",
          boxSizing: "border-box",
          fontFamily: MONO,
          fontSize: 14,
          color: INK,
          background: "#fff",
          border: `1px solid ${error ? "#7a2020" : INK}`,
          borderRadius: 0,
          outline: "none",
        }}
      />
      {error && (
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 10.5, color: "#7a2020", marginTop: 2 }}>
          {error}
        </span>
      )}
    </label>
  );
}

/* ── screen ───────────────────────────────────────────────────────────────── */

export default function InputScreen({
  initialGroom,
  initialBride,
  reduced,
  onSubmit,
}: {
  initialGroom: Person;
  initialBride: Person;
  reduced: boolean;
  onSubmit: (groom: Person, bride: Person) => void;
}) {
  const [groom, setGroom] = useState<PersonForm>(() => personToForm(initialGroom));
  const [bride, setBride] = useState<PersonForm>(() => personToForm(initialBride));
  const [gErr, setGErr] = useState<FieldErrors>({});
  const [bErr, setBErr] = useState<FieldErrors>({});

  const check = (f: PersonForm): FieldErrors => {
    const e: FieldErrors = {};
    if (!f.name.trim()) e.name = "Name is required.";
    if (!f.dob.trim()) e.dob = "Date of birth is required.";
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(f.dob.trim())) e.dob = "Enter the date as DD/MM/YYYY.";
    else if (!typedToIso(f.dob)) e.dob = "Must be a real date, and in the past.";
    if (!validTime(f.tob.trim())) e.tob = "Enter the time as HH:MM (24-hour), or leave it blank.";
    return e;
  };

  const submit = () => {
    const ge = check(groom);
    const be = check(bride);
    setGErr(ge);
    setBErr(be);
    if (Object.keys(ge).length || Object.keys(be).length) return;
    const toPerson = (f: PersonForm): Person => ({
      name: f.name.trim(),
      dob: typedToIso(f.dob) ?? "",
      tob: validTime(f.tob.trim()) && f.tob.trim().length === 5 ? f.tob.trim() : "",
      pob: f.pob.trim(),
    });
    onSubmit(toPerson(groom), toPerson(bride));
  };

  const block = (
    title: string,
    hindi: string,
    f: PersonForm,
    set: (v: PersonForm) => void,
    err: FieldErrors,
  ) => (
    <div style={{ flex: "1 1 260px", minWidth: 250, border: `1px solid ${INK}`, background: PAPER }}>
      <div
        style={{
          borderBottom: `1px solid ${INK}`,
          background: "rgba(20,17,13,.05)",
          padding: "6px 10px",
          display: "flex",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700, letterSpacing: 1.8 }}>{title}</span>
        <span style={{ fontFamily: DEVA, fontSize: 11, opacity: 0.75 }}>{hindi}</span>
      </div>
      <div style={{ padding: "4px 10px 14px" }}>
        <Field label="Name" value={f.name} onChange={(v) => set({ ...f, name: v })} error={err.name} />
        <Field
          label="Date of Birth"
          hint="(DD/MM/YYYY)"
          value={f.dob}
          inputMode="numeric"
          onChange={(v) => set({ ...f, dob: maskDate(v) })}
          error={err.dob}
        />
        <Field
          label="Time of Birth"
          hint="(HH:MM, optional)"
          value={f.tob}
          inputMode="numeric"
          onChange={(v) => set({ ...f, tob: maskTime(v) })}
          error={err.tob}
        />
        <Field label="Place of Birth" value={f.pob} onChange={(v) => set({ ...f, pob: v })} />
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 620, margin: "0 auto", padding: "0 4px" }}>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, letterSpacing: 2.6 }}>
          KUNDLI MILAN
        </div>
        <div style={{ fontFamily: DEVA, fontSize: 14, marginTop: 2 }}>कुण्डली मिलान</div>
        <div style={{ fontFamily: SERIF, fontSize: 11, color: SOFT_INK, marginTop: 4 }}>
          Office of the Registrar of Hearts · enter the birth particulars of both parties
        </div>
        <div style={{ marginTop: 8, borderTop: `2px solid ${INK}` }} />
        <div style={{ marginTop: 2, borderTop: `1px solid rgba(200,137,46,.5)` }} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {block("VARA (Groom)", "वर", groom, setGroom, gErr)}
        {block("VADHU (Bride)", "वधू", bride, setBride, bErr)}
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <button type="button" onClick={submit} style={plainButton}>
          Milan Karein / Match
        </button>

        {/* Surrounding UI only — this never touches the report or the export. */}
        {reduced ? (
          <span aria-hidden style={{ fontSize: 26, lineHeight: 1 }}>
            🔮
          </span>
        ) : (
          <video
            src={`${ASSET}/thinking.webm`}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            style={{ width: 64, height: 64, objectFit: "contain", pointerEvents: "none" }}
          />
        )}
      </div>

      <div
        style={{
          marginTop: 8,
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 10.5,
          color: SOFT_INK,
        }}
      >
        Ayanamsa: Lahiri · Chart style: North Indian
      </div>
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 9.5,
          color: SAFFRON,
          opacity: 0.9,
        }}
      >
        For entertainment. No astrological validity.
      </div>
    </div>
  );
}
