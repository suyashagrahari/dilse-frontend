"use client";

// ─── /profile-pro/recommend/[token] — lane two, the writing door ─────────────
//
// This is the heavy lane, and it is heavy on purpose. Endorsing is one tap and
// one name and it is where most people will stop; this page exists so that the
// two or three friends who actually want to write something have somewhere to
// do it, and so that the tap flow never needs a comment box bolted onto it.
//
// Four fields:
//   1. their name          — 30
//   2. their headline      — 60
//   3. how they know her   — one of five canned lines, a dropdown, not free text
//   4. the recommendation  — 600
//
// The relationship is canned because "how do you know her" typed freely comes
// back as "friend" nine times out of ten, and the joke in this template lives
// in the register: a dropdown that offers "We are related, unfortunately" tells
// the writer what kind of thing they are writing before they start.
//
// ── THE PLACEHOLDER IS THE BRIEF ─────────────────────────────────────────────
//
// Nobody arrives knowing the tone. The placeholder sets it in one sentence —
// corporate cadence, absurd content, straight face — and the recommendations
// that come back match it. An empty box with "Write something" above it comes
// back as "she's great!!".
//
// ── THE LINK IS REUSABLE, SO THERE IS NO TOKEN TO BURN ───────────────────────
//
// One link goes into a group chat and fifteen people open it. That means the
// token is not a one-shot capability and this page must never consume it: a
// second visitor opening the same URL is the normal case, not an attack.
//
// Dedupe therefore lives at the SUBMISSION, not the link. One idempotency key
// is minted per form session and held in a REF — not localStorage, not
// sessionStorage, because those are per-BROWSER and this link is opened by many
// people, several of whom will be on the same shared phone. The server has a
// unique index on `{ shareId, idempotencyKey }`, so a retry after a dropped
// response collapses onto the original row. "Write another" starts a new form
// session and mints a new key, which is what makes two friends on one phone two
// recommendations instead of one.
//
// ── BACK MUST NOT RESUBMIT ───────────────────────────────────────────────────
//
// The thank-you is a state flip, never a navigation. There is no history entry
// to come back to and therefore nothing to re-post; the in-flight ref and the
// `submitted` guard stop a second tap before the network is involved.

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import ContributorShell from "@/components/contrib/ContributorShell";
import { newIdempotencyKey, postContribution } from "@/lib/contrib/api";
import { CONTRIB_LIMITS } from "@/lib/contrib/types";

import { Avatar } from "../../components/Avatar";
import { ACCENT_TINT, PP } from "../../components/theme";
import { RECOMMEND_LIMITS, RELATIONSHIP_OPTIONS } from "../../components/types";

const MUTED = "#666";
const TAP = 44;
const WRAP = { overflowWrap: "anywhere" as const, wordBreak: "break-word" as const };

/**
 * Warm, always. Somebody is doing a stranger a favour on a phone; an error page
 * here is a recommendation that never gets written and a sender who never finds
 * out anyone tried.
 */
function warmMessage(status: number, serverError: string): string {
  switch (status) {
    case 0:
      return "That didn't reach us — check your connection and press it again. Nothing was lost.";
    case 400:
    case 422:
      return "Something in there didn't agree with us. Have a quick look and try again.";
    case 403:
      return "This one isn't taking recommendations at the moment. Not your doing.";
    case 404:
    case 410:
      return "This link has gone quiet — whoever sent it can send a fresh one. Your words are still in the box.";
    case 429:
      return "That's a lot at once. Give it a minute and press it again.";
    default:
      return serverError || "That didn't go through. Try once more in a moment.";
  }
}

function firstNameOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Meera";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

/* ── Fields ────────────────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  max,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  rows?: number;
  placeholder?: string;
}): React.JSX.Element {
  const style: React.CSSProperties = {
    width: "100%",
    minHeight: TAP,
    padding: "11px 12px",
    borderRadius: 6,
    border: `1px solid ${PP.edge}`,
    background: PP.card,
    color: PP.ink,
    fontFamily: PP.font,
    fontSize: 15,
    outline: "none",
  };

  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          marginBottom: 6,
          fontSize: 12.5,
          fontWeight: 600,
          color: MUTED,
        }}
      >
        {label}
        {/* Live, and always visible: a cap discovered at 601 characters is a
            paragraph somebody has to rewrite. */}
        <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: 11.5 }} aria-live="polite">
          {value.length}/{max}
        </span>
      </span>
      {rows ? (
        <textarea
          value={value}
          rows={rows}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...style, resize: "vertical", lineHeight: "22px" }}
        />
      ) : (
        <input
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      )}
    </label>
  );
}

function RelationshipField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 12.5,
          fontWeight: 600,
          color: MUTED,
        }}
      >
        How do you know them?
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          minHeight: TAP,
          padding: "0 12px",
          borderRadius: 6,
          border: `1px solid ${PP.edge}`,
          background: PP.card,
          color: PP.ink,
          fontFamily: PP.font,
          fontSize: 15,
          outline: "none",
          touchAction: "manipulation",
        }}
      >
        {RELATIONSHIP_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ── Preview ───────────────────────────────────────────────────────────────── */

/** Drawn exactly as it will sit on the profile, so nobody is surprised by it. */
function Preview({
  name,
  headline,
  relationship,
  text,
}: {
  name: string;
  headline: string;
  relationship: string;
  text: string;
}): React.JSX.Element {
  const shown = name.trim() || "You";
  return (
    <div
      style={{
        border: `1px solid ${PP.edge}`,
        borderRadius: 8,
        background: PP.card,
        padding: 14,
        fontFamily: PP.font,
      }}
    >
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: PP.accent }}>
        Yours — waiting to be approved
      </p>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar name={shown} size={48} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: PP.ink, ...WRAP }}>{shown}</p>
          {headline.trim() ? (
            <p style={{ margin: "2px 0 0", fontSize: 14, color: MUTED, ...WRAP }}>{headline}</p>
          ) : null}
          <p style={{ margin: "4px 0 0", fontSize: 12, fontStyle: "italic", color: MUTED, ...WRAP }}>
            {relationship}
          </p>
        </div>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: "20px", color: PP.ink, ...WRAP }}>
        {text}
      </p>
    </div>
  );
}

/* ── The page ──────────────────────────────────────────────────────────────── */

function RecommendForm(): React.JSX.Element {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();

  const token = typeof params?.token === "string" ? params.token : "";
  const subjectName = (search.get("n") ?? "").trim() || "Meera Sharma";
  const senderName = (search.get("s") ?? "").trim();
  const photo = search.get("ph") ?? "";
  const first = firstNameOf(subjectName);
  const prompt =
    (search.get("p") ?? "").trim() ||
    `${senderName || "Someone"} is collecting recommendations for ${first}. Keep a straight face and lay it on thick.`;

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [relationship, setRelationship] = useState<string>(RELATIONSHIP_OPTIONS[0]);
  const [text, setText] = useState("");

  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** Claimed synchronously — a second tap must not reach the network at all. */
  const inFlight = useRef(false);
  /** One key for this form session. Minted lazily, held here, never persisted. */
  const keyRef = useRef<string | null>(null);

  /** The register. This one sentence is why the answers come back funny. */
  const placeholder = `I've had the pleasure of knowing ${first} for 3 years. Her ability to be right about everything is second to none…`;

  const shareHref = useMemo(() => {
    if (typeof window === "undefined" || !token) return "";
    return window.location.href;
  }, [token]);

  const canSend =
    name.trim().length > 0 && text.trim().length > 0 && !sending && !submitted;

  const send = useCallback(async () => {
    if (inFlight.current || submitted) return;

    if (!token) {
      setError("This link is missing its last piece — ask whoever sent it for a fresh one.");
      return;
    }
    if (!name.trim() || !text.trim()) {
      setError("Your name and a few lines, and you're done.");
      return;
    }

    inFlight.current = true;
    setSending(true);
    setError("");

    // Once per form session. A retry after a dropped response sends the same
    // key and the server hands back the original row instead of writing a
    // second one.
    if (keyRef.current === null) keyRef.current = newIdempotencyKey();

    // The wire carries author / title / body. The relationship rides in front
    // of the recommendation, and ONLY when it fits inside the body cap — the
    // writer's own 600 characters are never the thing that gets trimmed.
    const words = text.trim();
    const prefix = `${relationship}.`;
    const body =
      prefix.length + 2 + words.length <= CONTRIB_LIMITS.body ? `${prefix}\n\n${words}` : words;

    const res = await postContribution(
      token,
      "recommendation",
      { author: name.trim(), title: headline.trim() || undefined, body },
      keyRef.current
    );

    inFlight.current = false;
    setSending(false);

    if (!res.ok) {
      // 409 means this exact submission is already saved. That is a success
      // wearing an error's clothes, and telling somebody it failed is how you
      // get the same recommendation twice.
      if (res.status === 409) {
        setSubmitted(true);
        return;
      }
      setError(warmMessage(res.status, res.error));
      return;
    }

    setSubmitted(true);
  }, [token, name, headline, relationship, text, submitted]);

  /** A new writer on the same phone. New form, new key. */
  const addAnother = useCallback(() => {
    keyRef.current = null;
    setName("");
    setHeadline("");
    setRelationship(RELATIONSHIP_OPTIONS[0]);
    setText("");
    setError("");
    setSubmitted(false);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: PP.page,
        fontFamily: PP.font,
        color: PP.ink,
      }}
    >
      {/* Plain line-art mark and a plain word. Nothing here is anybody's brand. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 52,
          padding: "0 16px",
          background: PP.card,
          borderBottom: `1px solid ${PP.edge}`,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            fill="none"
            stroke={PP.accent}
            strokeWidth="1.7"
          />
          <path
            d="M8 16.5v-6M8 8.2v.1M12 16.5v-3.6c0-1.3.9-2.3 2.2-2.3s2.3 1 2.3 2.3v3.6"
            fill="none"
            stroke={PP.accent}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: PP.ink }}>Recommendations</span>
      </div>

      <ContributorShell
        subjectName={subjectName}
        subjectPhotoUrl={photo || undefined}
        eyebrow={senderName ? `${senderName} asked` : "Someone asked"}
        prompt={prompt}
        submitted={submitted}
        successTitle="Written and sent. Thank you."
        successBody={`${senderName || "They"} reads it before anyone else does, and it goes on ${first}'s profile the moment it is approved.`}
        onAddAnother={addAnother}
        addAnotherLabel="Write another one"
        shareLink={shareHref}
        shareMessage={`I just wrote ${first} a recommendation. Write her one too — it takes a minute:`}
        shareLabel="Send this to someone else"
        ctaHref="/templates"
        ctaLabel="Make one for someone"
        theme={{
          paper: PP.card,
          paperDeep: PP.page,
          edge: PP.edge,
          ink: PP.ink,
          inkSoft: MUTED,
          inkFaint: "#8A8A8A",
          accent: PP.accent,
          accentInk: PP.accentInk,
          ok: PP.accent,
          danger: "#B3261E",
          font: PP.font,
          serif: PP.font,
        }}
        footer={
          submitted ? (
            <>
              No account, no email, nothing kept.{" "}
              <Link href="/templates" style={{ color: PP.accent }}>
                Make one of these
              </Link>{" "}
              for somebody you like.
            </>
          ) : (
            "No account, no email. Four fields, and one of them is a dropdown."
          )
        }
      >
        <div style={{ display: "grid", gap: 18 }}>
          <Field
            label="Your name"
            value={name}
            onChange={setName}
            max={RECOMMEND_LIMITS.author}
            placeholder="So they know who wrote it"
          />

          <Field
            label="Your headline"
            value={headline}
            onChange={setHeadline}
            max={RECOMMEND_LIMITS.headline}
            placeholder="Product Manager | Professional Third Wheel"
          />

          <RelationshipField value={relationship} onChange={setRelationship} />

          <Field
            label="The recommendation"
            value={text}
            onChange={setText}
            max={RECOMMEND_LIMITS.text}
            rows={7}
            placeholder={placeholder}
          />

          <p
            style={{
              margin: 0,
              padding: "10px 12px",
              borderRadius: 6,
              background: ACCENT_TINT,
              fontSize: 13,
              lineHeight: "19px",
              color: PP.ink,
              ...WRAP,
            }}
          >
            Straight face, absurd content. The funniest ones read exactly like the real thing.
          </p>

          {text.trim() || headline.trim() ? (
            <Preview
              name={name}
              headline={headline}
              relationship={relationship}
              text={text.trim() || placeholder}
            />
          ) : null}

          {error ? (
            <p style={{ margin: 0, fontSize: 13.5, color: "#B3261E", ...WRAP }} aria-live="polite">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            style={{
              width: "100%",
              minHeight: TAP + 4,
              padding: "0 18px",
              borderRadius: 8,
              border: `1px solid ${PP.accent}`,
              background: PP.accent,
              color: PP.accentInk,
              fontFamily: PP.font,
              fontSize: 15,
              fontWeight: 600,
              cursor: canSend ? "pointer" : "default",
              opacity: canSend ? 1 : 0.55,
              touchAction: "manipulation",
            }}
          >
            {sending ? "Sending…" : "Send it"}
          </button>

          <p style={{ margin: 0, fontSize: 12.5, lineHeight: "18px", color: MUTED, ...WRAP }}>
            It waits for {senderName || "them"} to read it. Nothing appears on the profile until
            they approve it.
          </p>
        </div>
      </ContributorShell>
    </div>
  );
}

export default function ProfileProRecommendPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PP.page }} />}>
      <RecommendForm />
    </Suspense>
  );
}
