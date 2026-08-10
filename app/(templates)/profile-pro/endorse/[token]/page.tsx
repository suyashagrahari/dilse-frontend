"use client";

// ─── /profile-pro/endorse/[token] — one tap, one name field ──────────────────
//
// THE FIELD COUNT ON THIS PAGE IS ONE. "Your name". That is the whole form.
//
// Everything else is a tap: a list of skills, each row its own target, tap to
// pick, tap again to unpick, as many as you like. Then one button.
//
// This is the lowest-friction contribution loop in the product and that is not a
// nice property, it IS the template. The certificate needs a drawn signature.
// The product listing needs four fields. A written reference needs a paragraph
// and lives at its own, deliberately heavier route. This one needs a thumb, and
// completion runs near ninety percent instead of forty — the difference between
// four friends contributing and fifteen.
//
// So: NO signup. NO email. NO relationship dropdown. NO comment box. A comment
// box here looks free and would halve the number above. If a future change adds
// a field to this page, it is a regression on the day it ships, bug-free.
//
// The one exception is the suggest-a-skill input, which is optional, collapsed,
// and NOT on first paint — a disclosure the curious open and everyone else never
// sees. It is not a step, because nothing waits for it.
//
// ── THE LINK IS REUSABLE, SO THERE IS NO TOKEN TO BURN ───────────────────────
//
// One link goes into one group chat and twenty people open it. Burning the token
// on first use would mean nineteen of them hit a dead page. So the token is a
// long-lived write capability, dedupe is per-SUBMISSION, and the server holds a
// unique index on `{ shareId, idempotencyKey }`.
//
// The key is minted ONCE per form session and kept in a ref — not in state where
// a render would churn it, and not in storage, because this page writes nothing
// to localStorage or sessionStorage at all. A second tap is stopped by a ref
// claimed synchronously, before the network is involved; a retry that does get
// out carries the same key and collapses onto the original row. A 409 means the
// server already has it, which is a success with extra steps, so it is shown as
// one.
//
// Success is a state change, not a navigation, so browser-back from the
// thank-you cannot resubmit anything.
//
// ── WHO THIS IS ABOUT ────────────────────────────────────────────────────────
//
// The token is a write capability and nothing else — it does not open her page,
// so this route cannot and does not fetch it. Everything on screen arrives in
// the query string as decoration the server never sees: `n` her name, `h` her
// headline, `s` the sender, `p` the prompt, `ph` a photo, `sk` the skills.
// Strip every one of them and the page still works.

import {
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { newIdempotencyKey, postContribution } from "@/lib/contrib/api";
import { Avatar } from "../../components/Avatar";
import { ACCENT_EDGE, ACCENT_TINT, PP } from "../../components/theme";
import { ENDORSE_LIMITS, type ProfileSkill } from "../../components/types";

/* ── Local tokens ──────────────────────────────────────────────────────────── */

const INK = "#191919";
const MUTED = "#666666";
const FONT = "var(--font-outfit), system-ui, -apple-system, sans-serif";

/** The endorse rows are 56; everything else still clears 44. */
const ROW_MIN = 56;
const TAP = 44;

const WRAP: CSSProperties = { overflowWrap: "anywhere", minWidth: 0 };

/* ── The skills, out of the query string ───────────────────────────────────── */

/**
 * `sk=Being Right~47|Punctuality~2|Choosing Restaurants`
 *
 * Label, optional `~count`, pipe-separated. The count is only ever used to draw
 * the "and N others" line back at them on the thank-you; nothing is computed
 * from it and the server never sees it.
 */
function parseSkills(raw: string): ProfileSkill[] {
  const out: ProfileSkill[] = [];
  for (const part of raw.split("|")) {
    const [labelRaw, countRaw] = part.split("~");
    const label = (labelRaw ?? "").trim().slice(0, 60);
    if (!label) continue;
    const n = Number.parseInt((countRaw ?? "").trim(), 10);
    const id =
      label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
      `skill-${out.length}`;
    if (out.some((s) => s.id === id)) continue;
    out.push({
      id,
      label,
      endorsements: Number.isFinite(n) && n > 0 ? n : 0,
      topEndorsers: [],
      isTop3: out.length < 3,
    });
    if (out.length >= 24) break;
  }
  return out;
}

/** With the query stripped, the page still has something to tap. */
const FALLBACK_SKILLS: ProfileSkill[] = [
  { id: "being-right", label: "Being Right", endorsements: 0, topEndorsers: [], isTop3: true },
  { id: "punctuality", label: "Punctuality", endorsements: 0, topEndorsers: [], isTop3: true },
  {
    id: "remembering-things",
    label: "Remembering Things",
    endorsements: 0,
    topEndorsers: [],
    isTop3: true,
  },
  { id: "patience", label: "Patience", endorsements: 0, topEndorsers: [] },
  { id: "choosing-restaurants", label: "Choosing Restaurants", endorsements: 0, topEndorsers: [] },
];

/**
 * Every failure ends warm and ends with a way forward.
 *
 * A stranger is doing somebody a favour on a phone. Nothing here gets an error
 * page, a red banner, or a status code — including a token the server has
 * stopped accepting, which is the sender's link expiring and not this person's
 * fault in any way they could act on.
 */
function warmNotice(status: number): string {
  switch (status) {
    case 0:
      return "That didn't quite get out — your connection dipped. Tap Endorse again.";
    case 403:
    case 410:
      return "This one has stopped taking endorsements. Nothing lost — thank you for turning up.";
    case 404:
      return "This link has moved on. Whoever sent it can send a fresh one.";
    case 429:
      return "That's a lot at once. Give it a minute, then tap Endorse again.";
    default:
      return "That didn't go through just now. Tap Endorse again in a moment.";
  }
}

/* ── Pieces ────────────────────────────────────────────────────────────────── */

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path
        d="M2.5 7.4l3 3 6-6.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** One skill, one target. 56px minimum, and the whole row is the button. */
function SkillTap({
  skill,
  selected,
  onToggle,
}: {
  skill: ProfileSkill;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={() => onToggle(skill.id)}
      style={{
        width: "100%",
        minHeight: ROW_MIN,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 12,
        textAlign: "left",
        fontFamily: FONT,
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        border: `1px solid ${selected ? PP.accent : PP.edge}`,
        background: selected ? PP.accent : PP.card,
        color: selected ? "#FFFFFF" : INK,
        transition: "background 120ms ease, border-color 120ms ease",
      }}
    >
      <span style={{ flex: 1, ...WRAP }}>{skill.label}</span>
      <span
        aria-hidden="true"
        style={{
          flex: "none",
          width: 22,
          height: 22,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: `1px solid ${selected ? "#FFFFFF" : PP.edge}`,
          background: selected ? "#FFFFFF" : "transparent",
          color: selected ? PP.accent : "transparent",
        }}
      >
        <CheckGlyph />
      </span>
    </button>
  );
}

/**
 * The thank-you: the same skills, counts moved, their name at the front of the
 * endorser line. They should see the thing they just changed.
 */
function EndorsedBack({
  skills,
  who,
  subject,
}: {
  skills: ProfileSkill[];
  who: string;
  subject: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${PP.edge}`,
        borderRadius: 14,
        background: PP.card,
        padding: "6px 16px",
      }}
    >
      {skills.map((skill, i) => {
        const total = skill.endorsements + 1;
        const others = total - 1;
        const line =
          others > 0
            ? `${who} and ${others} ${others === 1 ? "other has" : "others have"} endorsed this`
            : `${who} has endorsed this`;
        return (
          <div
            key={skill.id}
            style={{
              padding: "12px 0",
              borderBottom: i === skills.length - 1 ? "none" : `1px solid ${PP.edge}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: INK, ...WRAP }}>
                {skill.label}
              </span>
              <span style={{ fontSize: 14, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
                ({total})
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span
                style={{
                  display: "inline-flex",
                  flex: "none",
                  borderRadius: "50%",
                  border: "2px solid #FFFFFF",
                }}
                aria-hidden="true"
              >
                <Avatar name={who} size={24} />
              </span>
              <span style={{ fontSize: 14, lineHeight: "19px", color: MUTED, ...WRAP }}>{line}</span>
            </div>
          </div>
        );
      })}
      <p style={{ margin: "4px 0 14px", fontSize: 13, color: MUTED, ...WRAP }}>
        {subject} sees these on her profile.
      </p>
    </div>
  );
}

/* ── The page ──────────────────────────────────────────────────────────────── */

function EndorseFlow() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();

  const token = typeof params?.token === "string" ? params.token : "";

  const subject = (search.get("n") ?? "").trim() || "Meera Sharma";
  const first = subject.split(" ")[0] || subject;
  const headline = (search.get("h") ?? "").trim();
  const sender = (search.get("s") ?? "").trim();
  const photo = (search.get("ph") ?? "").trim();
  const prompt =
    (search.get("p") ?? "").trim() ||
    `${sender || "Someone"} is collecting endorsements for ${first}. Tap the ones that apply.`;

  const skills = useMemo(() => {
    const parsed = parseSkills(search.get("sk") ?? "");
    return parsed.length > 0 ? parsed : FALLBACK_SKILLS;
  }, [search]);

  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  /** Claimed synchronously. A rapid second tap never reaches the network. */
  const inFlight = useRef(false);
  /**
   * Minted ONCE per form session, on the first submit, and held here for every
   * retry of it. Not state (a render must not churn it) and not storage (this
   * page writes to neither).
   */
  const keyRef = useRef<string | null>(null);

  const toggle = useCallback((id: string) => {
    setNotice("");
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const chosen = useMemo(() => skills.filter((s) => selected.includes(s.id)), [skills, selected]);

  // The ONLY gate on the button. Endorsing zero skills leaves it disabled and
  // says nothing — an error message for "you haven't picked yet" is a telling-off
  // for not having done the thing yet.
  const canSend = chosen.length > 0 && !sending && !submitted;

  const send = useCallback(async () => {
    if (inFlight.current || submitted) return;
    if (chosen.length === 0) return;

    if (!token) {
      setNotice("This link is missing its token — whoever sent it can send a fresh one.");
      return;
    }

    inFlight.current = true;
    setSending(true);
    setNotice("");

    if (keyRef.current === null) keyRef.current = newIdempotencyKey();

    const author = name.trim().slice(0, ENDORSE_LIMITS.author);
    const suggested = suggestion.trim().slice(0, ENDORSE_LIMITS.suggestion);

    const res = await postContribution(
      token,
      "endorsement",
      {
        // A blank name is never a blocker — one tap is the promise. It arrives
        // as "Someone", which is a real thing to render, unlike "".
        author: author || "Someone",
        body: chosen.map((s) => s.label).join(", "),
        ...(suggested ? { title: suggested } : {}),
      },
      keyRef.current
    );

    inFlight.current = false;
    setSending(false);

    // 409 is the unique index on `{ shareId, idempotencyKey }` doing its job:
    // this submission is already saved. That is a success, so it is shown as one.
    if (res.ok || res.status === 409) {
      setSubmitted(true);
      return;
    }

    setNotice(warmNotice(res.status));
  }, [token, chosen, name, suggestion, submitted]);

  const who = name.trim() || "You";

  const shell = (children: JSX.Element) => (
    <div
      style={{
        minHeight: "100dvh",
        background: PP.page,
        fontFamily: FONT,
        color: INK,
        WebkitTextSizeAdjust: "100%",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "22px 16px 32px" }}>{children}</div>
    </div>
  );

  /* ── Thank-you ───────────────────────────────────────────────────────────── */

  if (submitted) {
    return shell(
      <div style={{ display: "grid", gap: 18 }} aria-live="polite">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: INK, ...WRAP }}>
            {"That's in. Thank you."}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.55, color: MUTED, ...WRAP }}>
            {chosen.length === 1
              ? `One endorsement for ${first}, from you.`
              : `${chosen.length} endorsements for ${first}, from you.`}
          </p>
        </div>

        <EndorsedBack skills={chosen} who={who} subject={first} />

        <Link
          href="/templates"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 50,
            borderRadius: 100,
            background: PP.accent,
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
            touchAction: "manipulation",
          }}
        >
          Make one for someone
        </Link>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: MUTED, textAlign: "center" }}>
          No account, no email, nothing kept. It took one tap.
        </p>
      </div>
    );
  }

  /* ── The form ────────────────────────────────────────────────────────────── */

  return shell(
    <div style={{ display: "grid", gap: 18 }}>
      {/* Who this is about */}
      <header style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar name={subject} src={photo || undefined} size={64} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: INK, ...WRAP }}>
            {subject}
          </h1>
          {headline ? (
            <p style={{ margin: "3px 0 0", fontSize: 14.5, lineHeight: 1.4, color: MUTED, ...WRAP }}>
              {headline}
            </p>
          ) : null}
        </div>
      </header>

      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: INK, ...WRAP }}>{prompt}</p>

      {/* The list. Tapping is the whole interaction. */}
      <div style={{ display: "grid", gap: 8 }} role="group" aria-label={`Skills to endorse for ${subject}`}>
        {skills.map((skill) => (
          <SkillTap
            key={skill.id}
            skill={skill}
            selected={selected.includes(skill.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      {/* Optional, and closed on first paint. Not a step — nothing waits on it. */}
      {suggestOpen ? (
        <label style={{ display: "block" }}>
          <span
            style={{
              display: "flex",
              gap: 8,
              alignItems: "baseline",
              marginBottom: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: MUTED,
            }}
          >
            Suggest a skill (optional)
            <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: 11.5 }}>
              {suggestion.length}/{ENDORSE_LIMITS.suggestion}
            </span>
          </span>
          <input
            value={suggestion}
            maxLength={ENDORSE_LIMITS.suggestion}
            placeholder="Something they left off"
            onChange={(e) => setSuggestion(e.target.value)}
            style={{
              width: "100%",
              minHeight: TAP,
              padding: "11px 12px",
              borderRadius: 10,
              fontSize: 16,
              fontFamily: FONT,
              color: INK,
              background: PP.card,
              border: `1px solid ${PP.edge}`,
              outline: "none",
            }}
          />
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setSuggestOpen(true)}
          style={{
            justifySelf: "start",
            minHeight: TAP,
            padding: "0 4px",
            border: "none",
            background: "transparent",
            color: PP.accent,
            fontFamily: FONT,
            fontSize: 14.5,
            fontWeight: 600,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          + Suggest a skill
        </button>
      )}

      {/* THE ONE FIELD. */}
      <label style={{ display: "block" }}>
        <span
          style={{
            display: "flex",
            gap: 8,
            alignItems: "baseline",
            marginBottom: 6,
            fontSize: 12.5,
            fontWeight: 700,
            color: MUTED,
          }}
        >
          Your name
          <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: 11.5 }}>
            {name.length}/{ENDORSE_LIMITS.author}
          </span>
        </span>
        <input
          value={name}
          maxLength={ENDORSE_LIMITS.author}
          autoComplete="name"
          enterKeyHint="done"
          placeholder={`So ${first} knows who it's from`}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSend) {
              e.preventDefault();
              void send();
            }
          }}
          style={{
            width: "100%",
            minHeight: TAP,
            padding: "11px 12px",
            borderRadius: 10,
            // 16px so mobile Safari does not zoom the viewport on focus, which on a
            // one-field form is most of the friction there is left to remove.
            fontSize: 16,
            fontFamily: FONT,
            color: INK,
            background: PP.card,
            border: `1px solid ${PP.edge}`,
            outline: "none",
          }}
        />
      </label>

      {/* Warm, never red. Nothing on this page is the contributor's mistake. */}
      {notice ? (
        <p
          aria-live="polite"
          style={{
            margin: 0,
            padding: "11px 13px",
            borderRadius: 10,
            border: `1px solid ${ACCENT_EDGE}`,
            background: ACCENT_TINT,
            fontSize: 14,
            lineHeight: 1.5,
            color: INK,
            ...WRAP,
          }}
        >
          {notice}
        </p>
      ) : null}

      {/* Sticky, so a list of twenty skills never puts the button off-screen. */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 2,
          marginTop: -4,
          paddingTop: 10,
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          background: PP.page,
        }}
      >
        <button
          type="button"
          onClick={() => void send()}
          disabled={!canSend}
          style={{
            width: "100%",
            minHeight: 50,
            borderRadius: 100,
            border: `1px solid ${PP.accent}`,
            background: PP.accent,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 600,
            cursor: canSend ? "pointer" : "default",
            opacity: canSend ? 1 : 0.45,
            touchAction: "manipulation",
          }}
        >
          {sending ? "Sending…" : chosen.length > 1 ? `Endorse ${chosen.length} skills` : "Endorse"}
        </button>
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, textAlign: "center" }}>
          No account, no email. One tap and your name.
        </p>
      </div>
    </div>
  );
}

export default function ProfileProEndorsePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PP.page }} />}>
      <EndorseFlow />
    </Suspense>
  );
}
