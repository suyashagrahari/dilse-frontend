"use client";
// ─── <RSVPBlock> — one-tap RSVP for every guest (no login) ───────────────────
//
//   <RSVPBlock mode={mode} events={extras.events} perEvent meal deadline="2026-11-30" couple="Ananya & Rohan" />
//
// Live page: POST /<slug>-pages/share/:shareId/rsvp (the page's slug/shareId
// come from DayShareContext). Each guest's answer is stored separately and the
// owner is emailed (digest during bursts). This device keeps an edit token, so
// "Change my response" updates the same RSVP. A password-protected page sends
// the password the guest typed at the gate, or asks for it inline.
// Preview (editor): everything works except the network call.

import { useId, useState, type FormEvent } from "react";
import { useDayShare } from "../../_valentine/kit/shareInfo";
import { loadMyRsvp, submitRsvp } from "../api";
import { formatEventDate } from "../ics";
import { RSVP_LIMITS, type Attending, type Meal, type RsvpDraft, type WeddingEvent } from "../types";
import PetalBurst from "./PetalBurst";
import { Reveal } from "../WeddingRoot";

export interface RSVPBlockProps {
  mode: "preview" | "live";
  /** "Ananya & Rohan" — used in the thank-you line. */
  couple?: string;
  /** The page's events; with `perEvent` the guest ticks which they'll attend. */
  events?: readonly WeddingEvent[];
  perEvent?: boolean;
  /** Ask veg / non-veg / Jain. */
  meal?: boolean;
  /** Ask for a phone number (optional field for the guest). */
  askPhone?: boolean;
  /** Offer "Not sure yet". Default true. */
  allowMaybe?: boolean;
  /** Party size ceiling (≤ 10). Default 6. */
  maxGuests?: number;
  /** "2026-11-30" — shown as "Kindly reply by …". */
  deadline?: string;
  title?: string;
  intro?: string;
  /** Override the page identity (defaults to DayShareContext). */
  share?: { slug: string; shareId: string } | null;
  onSubmitted?: (r: RsvpDraft) => void;
  locale?: string;
}

const ATTEND: { v: Attending; label: string; sub: string }[] = [
  { v: "yes", label: "Joyfully accepts", sub: "We'll be there" },
  { v: "maybe", label: "Not sure yet", sub: "We'll try our best" },
  { v: "no", label: "Regretfully declines", sub: "Sending blessings" },
];
const MEAL: { v: Meal; label: string }[] = [
  { v: "veg", label: "Vegetarian" },
  { v: "nonveg", label: "Non-veg" },
  { v: "jain", label: "Jain" },
];

export default function RSVPBlock({
  mode,
  couple,
  events = [],
  perEvent = false,
  meal = false,
  askPhone = false,
  allowMaybe = true,
  maxGuests = 6,
  deadline,
  title = "Will you join us?",
  intro,
  share,
  onSubmitted,
  locale = "en-IN",
}: RSVPBlockProps) {
  const ctx = useDayShare();
  const target = share === undefined ? ctx : share;
  const uid = useId();
  const evs = perEvent ? events.filter((e) => e.id && e.title) : [];
  const stored = typeof window !== "undefined" && mode === "live" && target ? loadMyRsvp(target.shareId) : null;

  const [draft, setDraft] = useState<RsvpDraft>(
    () =>
      stored?.rsvp ?? {
        guestName: "",
        phone: "",
        attending: "yes",
        guests: 1,
        events: evs.map((e) => e.id),
        meal: null,
        message: "",
      },
  );
  const [phase, setPhase] = useState<"form" | "sending" | "done">(stored ? "done" : "form");
  const [burst, setBurst] = useState(0);
  const [error, setError] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [pw, setPw] = useState("");
  const [honey, setHoney] = useState("");
  const cap = Math.max(1, Math.min(RSVP_LIMITS.maxGuests, maxGuests));
  const set = <K extends keyof RsvpDraft>(k: K, v: RsvpDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const options = allowMaybe ? ATTEND : ATTEND.filter((a) => a.v !== "maybe");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const clean: RsvpDraft = {
      ...draft,
      guestName: draft.guestName.trim(),
      guests: draft.attending === "no" ? 0 : Math.max(1, Math.min(cap, draft.guests)),
      events: draft.attending === "no" ? [] : draft.events,
      meal: meal && draft.attending !== "no" ? draft.meal ?? null : null,
    };
    if (!clean.guestName) {
      setError("Please add your name so the family knows who's coming.");
      return;
    }
    if (perEvent && evs.length && clean.attending !== "no" && !clean.events.length) {
      setError("Tick at least one function you'll attend.");
      return;
    }
    setPhase("sending");
    if (mode === "preview" || !target) {
      await new Promise((r) => setTimeout(r, 450));
    } else {
      const r = await submitRsvp(target.slug, target.shareId, clean, { password: needPw ? pw : undefined, honeypot: honey });
      if (!r.ok) {
        setPhase("form");
        if (r.needsPassword) setNeedPw(true);
        setError(r.error);
        return;
      }
    }
    setDraft(clean);
    setPhase("done");
    if (clean.attending !== "no") setBurst((b) => b + 1);
    onSubmitted?.(clean);
  };

  const first = draft.guestName.trim().split(/\s+/)[0] || "";
  if (phase === "done") {
    const yes = draft.attending === "yes";
    const maybe = draft.attending === "maybe";
    return (
      <div className="wk-rsvp wk-card wk-foil-border is-done" aria-live="polite">
        {burst > 0 && <PetalBurst key={burst} seed={burst * 13} />}
        <p className="wk-eyebrow">{yes ? "See you there" : maybe ? "Noted with love" : "Thank you"}</p>
        <h3 className="wk-rsvp-thanks wk-foil-text wk-shimmer">{first ? `Thank you, ${first}` : "Thank you"}</h3>
        <p className="wk-rsvp-summary">
          {yes
            ? `${draft.guests > 1 ? `All ${draft.guests} of you are` : "You're"} on the list${couple ? ` — ${couple} can't wait to celebrate with you` : ""}.`
            : maybe
              ? "We've noted you as a maybe — come back and confirm any time."
              : "You'll be missed. Your blessings mean the world to the families."}
        </p>
        {yes && evs.length > 0 && draft.events.length > 0 && (
          <p className="wk-rsvp-events">{evs.filter((e) => draft.events.includes(e.id)).map((e) => e.title).join(" · ")}</p>
        )}
        <button type="button" className="wk-btn wk-btn-ghost" onClick={() => setPhase("form")}>
          Change my response
        </button>
      </div>
    );
  }

  return (
    <Reveal className="wk-rsvp wk-card wk-foil-border">
      <form onSubmit={submit} noValidate>
        <h3 className="wk-rsvp-title">{title}</h3>
        {(intro || deadline) && (
          <p className="wk-rsvp-intro">
            {intro}
            {intro && deadline ? " " : ""}
            {deadline && <span className="wk-rsvp-by">Kindly reply by {formatEventDate(deadline, locale)}</span>}
          </p>
        )}

        <label className="wk-field">
          <span className="wk-field-l">Your name</span>
          <input
            className="wk-input"
            value={draft.guestName}
            maxLength={RSVP_LIMITS.name}
            autoComplete="name"
            placeholder="e.g. Sharma family"
            onChange={(e) => set("guestName", e.target.value)}
          />
        </label>

        <fieldset className="wk-field">
          <legend className="wk-field-l">Will you attend?</legend>
          <div className={`wk-seg wk-seg-${options.length}`} role="radiogroup">
            {options.map((a) => (
              <label key={a.v} className={`wk-seg-o${draft.attending === a.v ? " is-on" : ""}`}>
                <input type="radio" name={`${uid}-att`} value={a.v} checked={draft.attending === a.v} onChange={() => set("attending", a.v)} />
                <b>{a.label}</b>
                <small>{a.sub}</small>
              </label>
            ))}
          </div>
        </fieldset>

        {draft.attending !== "no" && (
          <>
            <div className="wk-field">
              <span className="wk-field-l" id={`${uid}-g`}>
                Guests in your party
              </span>
              <div className="wk-stepper" role="group" aria-labelledby={`${uid}-g`}>
                <button type="button" onClick={() => set("guests", Math.max(1, draft.guests - 1))} disabled={draft.guests <= 1} aria-label="One fewer guest">
                  −
                </button>
                <output aria-live="polite">{Math.max(1, draft.guests)}</output>
                <button type="button" onClick={() => set("guests", Math.min(cap, Math.max(1, draft.guests) + 1))} disabled={draft.guests >= cap} aria-label="One more guest">
                  +
                </button>
              </div>
            </div>

            {evs.length > 0 && (
              <fieldset className="wk-field">
                <legend className="wk-field-l">Which functions?</legend>
                <div className="wk-chips">
                  {evs.map((ev) => {
                    const on = draft.events.includes(ev.id);
                    return (
                      <label key={ev.id} className={`wk-chip${on ? " is-on" : ""}`}>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => set("events", on ? draft.events.filter((x) => x !== ev.id) : [...draft.events, ev.id])}
                        />
                        <span>{ev.title}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {meal && (
              <fieldset className="wk-field">
                <legend className="wk-field-l">Meal preference</legend>
                <div className="wk-chips">
                  {MEAL.map((m) => (
                    <label key={m.v} className={`wk-chip${draft.meal === m.v ? " is-on" : ""}`}>
                      <input type="radio" name={`${uid}-meal`} checked={draft.meal === m.v} onChange={() => set("meal", m.v)} />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}

        {askPhone && (
          <label className="wk-field">
            <span className="wk-field-l">
              Phone <small>(optional)</small>
            </span>
            <input className="wk-input" type="tel" inputMode="tel" autoComplete="tel" maxLength={RSVP_LIMITS.phone} value={draft.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </label>
        )}

        <label className="wk-field">
          <span className="wk-field-l">
            A note for the couple <small>(optional)</small>
          </span>
          <textarea
            className="wk-input wk-area"
            rows={3}
            maxLength={RSVP_LIMITS.message}
            value={draft.message ?? ""}
            placeholder="Congratulations! Can't wait to dance at the sangeet…"
            onChange={(e) => set("message", e.target.value)}
          />
        </label>

        {/* Honeypot: invisible to people, irresistible to bots. */}
        <input className="wk-hp" tabIndex={-1} autoComplete="off" aria-hidden name="website" value={honey} onChange={(e) => setHoney(e.target.value)} />

        {needPw && (
          <label className="wk-field">
            <span className="wk-field-l">Invitation password</span>
            <input className="wk-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" />
          </label>
        )}

        {error && (
          <p className="wk-err" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="wk-btn wk-btn-lg" disabled={phase === "sending"}>
          {phase === "sending" ? "Sending…" : stored ? "Update my RSVP" : "Send RSVP"}
        </button>
        {mode === "preview" && <p className="wk-rsvp-preview">Preview — guests&apos; answers reach you by email.</p>}
      </form>
    </Reveal>
  );
}
