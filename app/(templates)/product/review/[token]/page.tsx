"use client";

// ─── /product/review/[token] — the friends' door ─────────────────────────────
//
// Somebody got this out of a group chat. They have no account, they are not
// going to make one, and they are giving this ninety seconds because they like
// the person it is about. So: four fields, no signup, no email.
//
//   1. stars      — five 44px targets with hover and press preview
//   2. headline   — 60
//   3. review     — 200
//   4. their name — 30
//
// A FIFTH FIELD HALVES COMPLETION. Do not add one. Every cap above is the
// server's own limit, mirrored here so the limit is visible while typing
// instead of arriving as a 400 after a paragraph.
//
// ── THE TOKEN IS A WRITE CAPABILITY AND NOTHING ELSE ─────────────────────────
//
// `contribToken` lets the holder post a review. It does not open the gift, and
// it is a different secret from the recipient's `shareId` — which is why this
// page cannot and does not fetch the listing. Who the review is about arrives
// in the query string, as decoration the server never sees: `n` her name, `s`
// the sender, `p` the prompt, `ph` a photo. Strip all of it and the page still
// works, with neutral copy.
//
// ── DOUBLE SUBMIT ────────────────────────────────────────────────────────────
//
// One idempotency key per submission, generated once and REUSED across retries
// of that same submission, so a phone on a train that loses the response and
// presses again gets the original row back rather than writing a second one.
// A ref gate stops the second tap before the network is even involved, and the
// success state is not a navigation, so browser-back cannot resubmit anything.

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import StarRating from "@/components/contrib/StarRating";
import ContributorShell, { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";
import { initialsOf, type StarValue } from "@/lib/contrib/types";
import { Wordmark } from "../../components/Chrome";
import { C, FONT, SERIF, WRAP, avatarColour } from "../../components/tokens";
import {
  REVIEW_LIMITS,
  newIdempotencyKey,
  submitMessageFor,
  submitReview,
} from "../../components/contribApi";
import type { StarRating as Stars } from "../../components/types";

/** The line under the star row. The wording is the reason anyone picks 5. */
const STAR_LABELS: Record<number, string> = {
  1: "one star, and you meant it",
  2: "room for improvement",
  3: "perfectly fine, apparently",
  4: "very good, minor notes",
  5: "flawless",
};

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
}) {
  const style: React.CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    fontSize: 15,
    fontFamily: FONT,
    color: C.text,
    outline: "none",
    background: "#fff",
    border: `1px solid ${C.border}`,
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
          fontWeight: 700,
          color: C.secondary,
        }}
      >
        {label}
        <span style={{ marginLeft: "auto", fontWeight: 400, fontSize: 11.5 }}>
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
          style={{ ...style, resize: "vertical", lineHeight: 1.6 }}
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

/** Their review, drawn exactly as it will appear on her listing. */
function ReviewPreview({
  author,
  stars,
  title,
  body,
}: {
  author: string;
  stars: number;
  title: string;
  body: string;
}) {
  const name = author.trim() || "You";
  return (
    <div
      style={{
        border: `1px solid ${C.activeEdge}`,
        background: C.activeTint,
        borderRadius: 8,
        padding: 14,
        fontFamily: FONT,
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: C.activeEdge }}>
        Yours — waiting to be approved
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            flex: "none",
            borderRadius: "50%",
            background: avatarColour(name),
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {initialsOf(name)}
        </span>
        <span style={{ fontSize: 13, color: C.text, minWidth: 0, ...WRAP }}>{name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
        <StarRating rating={stars} size={15} label={`${stars} out of 5 stars`} />
        {title ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 0, ...WRAP }}>{title}</span>
        ) : null}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px", color: C.text, ...WRAP }}>{body}</p>
    </div>
  );
}

/* ── The page ──────────────────────────────────────────────────────────────── */

function ReviewFormPage() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();

  const token = typeof params?.token === "string" ? params.token : "";
  const subjectName = (search.get("n") ?? "").trim() || "her";
  const senderName = (search.get("s") ?? "").trim();
  const photo = search.get("ph") ?? "";
  const prompt =
    (search.get("p") ?? "").trim() ||
    `${senderName || "Someone"} is collecting reviews of ${subjectName}. One line is plenty.`;

  const [stars, setStars] = useState<Stars | 0>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** Claimed synchronously — a second tap must not reach the network at all. */
  const inFlight = useRef(false);
  /** Reused across retries of the SAME submission. See the note at the top. */
  const keyRef = useRef<string | null>(null);

  const shareHref = useMemo(() => {
    if (typeof window === "undefined" || !token) return "";
    return whatsappNudgeUrl(
      `I just left a review for ${subjectName}. Leave one too — it takes a minute:`,
      window.location.href
    );
  }, [token, subjectName]);

  const canSend = stars > 0 && body.trim().length > 0 && name.trim().length > 0 && !sending;

  const send = useCallback(async () => {
    if (inFlight.current || submitted) return;
    if (!token) {
      setError("This link is missing its token — ask whoever sent it for a new one.");
      return;
    }
    if (stars < 1) {
      setError("Pick a number of stars first.");
      return;
    }
    if (!body.trim() || !name.trim()) {
      setError("A line or two and your name, and you are done.");
      return;
    }

    inFlight.current = true;
    setSending(true);
    setError("");

    const key = keyRef.current ?? newIdempotencyKey();
    keyRef.current = key;

    const res = await submitReview(
      token,
      { stars: stars as Stars, title, body, name },
      key
    );

    inFlight.current = false;
    setSending(false);

    if (!res.ok) {
      // Anything the server actually judged is a new submission next time. A
      // dropped connection is not — that one gets the same key again.
      if (res.status >= 400 && res.status < 500) keyRef.current = null;
      setError(submitMessageFor(res.status, res.error));
      return;
    }

    keyRef.current = null;
    setSubmitted(true);
  }, [token, stars, title, body, name, submitted]);

  const shown = stars > 0 ? stars : 0;

  return (
    <div style={{ minHeight: "100dvh", background: C.page, fontFamily: FONT, color: C.text }}>
      {/* The same store, so the friend knows where they are. */}
      <div style={{ background: C.header, padding: "8px 14px" }}>
        <Wordmark />
      </div>
      <div style={{ background: C.subHeader, minHeight: 39, display: "flex", alignItems: "center", padding: "0 14px" }}>
        <span style={{ fontSize: 13, color: "#fff" }}>Customer reviews</span>
      </div>

      <ContributorShell
        subjectName={subjectName}
        subjectPhotoUrl={photo || undefined}
        eyebrow={senderName ? `${senderName} asked` : "Someone asked"}
        prompt={prompt}
        submitted={submitted}
        successTitle="That's in. Thank you."
        successBody={`${senderName || "They"} sees it before anyone else, and it goes on ${subjectName}'s listing the moment it is approved.`}
        shareLink={shareHref}
        shareMessage={`I just left a review for ${subjectName}. Leave one too:`}
        shareLabel="Share the review link"
        ctaHref="/templates"
        ctaLabel="Make one for someone"
        theme={{
          paper: "#ffffff",
          paperDeep: C.section,
          edge: C.border,
          ink: C.text,
          inkSoft: C.secondary,
          inkFaint: "#8b9090",
          accent: C.subHeader,
          accentInk: "#ffffff",
          danger: C.priceRed,
          ok: C.green,
          font: FONT,
          serif: SERIF,
        }}
        footer={
          submitted ? (
            <>
              No account, no email, nothing kept. <Link href="/templates" style={{ color: C.link }}>Make one of these</Link> for
              somebody you like.
            </>
          ) : (
            "No account, no email. Four fields and you are done."
          )
        }
      >
        <div style={{ display: "grid", gap: 18 }}>
          {/* 1 · Stars */}
          <div>
            <span style={{ display: "block", marginBottom: 4, fontSize: 12.5, fontWeight: 700, color: C.secondary }}>
              How many stars?
            </span>
            <StarRating
              rating={shown}
              size={32}
              interactive
              onRate={(n: StarValue) => setStars(n as Stars)}
              fillColor={C.star}
              emptyColor={C.border}
              label={`Rate ${subjectName} out of 5`}
            />
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: shown > 0 ? C.text : C.secondary }} aria-live="polite">
              {shown > 0 ? `${shown}.0 — ${STAR_LABELS[shown]}` : "Tap a star"}
            </p>
          </div>

          {/* 2 · Headline */}
          <Field
            label="Add a headline"
            value={title}
            onChange={setTitle}
            max={REVIEW_LIMITS.title}
            placeholder="What's the one line?"
          />

          {/* 3 · The review */}
          <Field
            label="Write your review"
            value={body}
            onChange={setBody}
            max={REVIEW_LIMITS.body}
            rows={4}
            placeholder={`Something only somebody who knows ${subjectName} would say.`}
          />

          {/* 4 · Their name */}
          <Field
            label="Your name"
            value={name}
            onChange={setName}
            max={REVIEW_LIMITS.name}
            placeholder="So they know who it's from"
          />

          {body.trim() || title.trim() ? (
            <ReviewPreview author={name} stars={shown} title={title} body={body} />
          ) : null}

          {error ? (
            <p style={{ margin: 0, fontSize: 13, color: C.priceRed, ...WRAP }} aria-live="polite">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            style={{
              width: "100%",
              minHeight: 46,
              padding: "10px 18px",
              borderRadius: 100,
              border: "1px solid #E08A2B",
              background: C.ctaOrange,
              color: C.text,
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              cursor: canSend ? "pointer" : "default",
              opacity: canSend ? 1 : 0.55,
              touchAction: "manipulation",
            }}
          >
            {sending ? "Sending…" : "Submit your review"}
          </button>
        </div>
      </ContributorShell>
    </div>
  );
}

export default function ProductReviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#fff" }} />}>
      <ReviewFormPage />
    </Suspense>
  );
}
