// ─── /call/tag/[token] — where her friends tag the number ────────────────────
//
// Somebody got a link in a group chat. They have no account, they are not going
// to make one, and they are giving this ninety seconds because they like the
// person it is about. So there are EXACTLY TWO FIELDS — the tag and their name
// — and above them a row of chips carrying the tags that already exist, because
// most people will tap rather than type and a tap is a vote.
//
// ── WHAT THIS PAGE CAN AND CANNOT SEE ────────────────────────────────────────
//
// It is addressed by `contribToken`, which is a WRITE capability and nothing
// else: it does not let the holder read the gift. There is no endpoint that
// turns a token into a page, by design — conflating the two secrets would mean
// anyone who can write can also read.
//
// So the sender's link CARRIES what this page renders — her name, her photo,
// the prompt and the existing tags — as ordinary query parameters
// (`buildTagLink` writes them, `readTagInvite` reads them). They are the things
// the sender chose to put in an invitation; nothing private travels with them,
// and every one of them is optional. With none of them the page still works: a
// generic ask, an initials circle, and the same two fields.
//
// The same boundary is why there is no live poll HERE. The five-second poll
// lives on the published page, which holds the `shareId` and is allowed to read
// — see `useLiveTags`. On this side the count moves once, on submit, which is
// the only moment this visitor has anything new to be told.
//
// ── WHAT HAPPENS TO WHAT THEY WRITE ──────────────────────────────────────────
//
// It lands PENDING. The sender approves each one before it reaches the card,
// and the success copy says so plainly rather than implying the tag is already
// up.

"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ContributorShell from "@/components/contrib/ContributorShell";
import { CheckGlyph, TagGlyph } from "../../components/icons";
import { Avatar, DARK, FONT, LIGHT, TAP, useCountUp, useReducedMotion } from "../../components/theme";
import {
  TAGGER_NAME_MAX,
  TAG_LABEL_MAX,
  newSubmissionKey,
  readTagInvite,
  submitTag,
  whatsappUrl,
} from "../../components/tagApi";
import { WORDMARK } from "../../components/types";

const SHELL_THEME = {
  paper: "#FFFFFF",
  paperDeep: "#F4F6F8",
  edge: "#E4E8EB",
  ink: "#101418",
  inkSoft: "#4C555E",
  inkFaint: "#8B939B",
  accent: "#1DA362",
  accentInk: "#FFFFFF",
  ok: "#1DA362",
  danger: "#E5484D",
  font: FONT,
  serif: FONT,
};

function TagPageInner() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const reduced = useReducedMotion();

  const token = typeof params?.token === "string" ? params.token : "";
  const invite = useMemo(() => readTagInvite(new URLSearchParams(search?.toString() ?? "")), [search]);

  const name = invite.name || "this number";
  const prompt =
    invite.prompt ||
    `Know ${invite.name || "this number"}? Add one word for what they should be saved as. It takes ten seconds.`;

  const [label, setLabel] = useState("");
  const [author, setAuthor] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [landedLabel, setLandedLabel] = useState("");

  /**
   * Kept across a NETWORK failure so pressing send again re-sends the same key
   * — the first attempt may well have been written before the connection
   * dropped, and the server collapses the retry onto it. Cleared on success and
   * on anything the server actually judged.
   */
  const retryKey = useRef<string | null>(null);
  const inFlight = useRef(false);

  const shownCount = useCountUp(invite.topCount + (submitted ? 1 : 0), !reduced);

  const send = useCallback(async () => {
    if (inFlight.current) return;
    if (!token) {
      setError("This link is missing its code — ask for it again.");
      return;
    }
    if (!label.trim() || !author.trim()) {
      setError("A tag and your name, and you're done.");
      return;
    }

    inFlight.current = true;
    setSending(true);
    setError("");

    const key = retryKey.current ?? newSubmissionKey();
    retryKey.current = key;

    const res = await submitTag(token, { label, submitterName: author }, key);

    inFlight.current = false;
    setSending(false);

    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) retryKey.current = null;
      setError(
        res.status === 404
          ? "This page has gone — the link may have expired."
          : res.status === 429
            ? "That's a lot at once. Give it a minute and try again."
            : res.error
      );
      return;
    }

    retryKey.current = null;
    setLandedLabel(label.trim());
    setSubmitted(true);
  }, [token, label, author]);

  const addAnother = useCallback(() => {
    setSubmitted(false);
    setLabel("");
    setError("");
  }, []);

  const shareLink = typeof window === "undefined" ? "" : window.location.href;
  const nudge = whatsappUrl(`Tag this number for ${invite.name || "someone"} — takes ten seconds:`, shareLink);

  const input: React.CSSProperties = {
    width: "100%",
    minHeight: TAP + 4,
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: 16,
    fontFamily: FONT,
    color: LIGHT.ink,
    background: "#FFFFFF",
    border: "1px solid #DDE1E5",
    outline: "none",
  };

  const label12: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: LIGHT.sub,
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main style={{ minHeight: "100dvh", background: LIGHT.surround, fontFamily: FONT }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "26px 18px 44px" }}>
          {/* The card they just changed. */}
          <section
            style={{
              padding: 20,
              borderRadius: 18,
              background: DARK.bg,
              border: `1px solid ${DARK.edge}`,
              color: DARK.text,
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: DARK.dim,
              }}
            >
              Incoming call
            </p>

            <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 12px" }}>
              <Avatar name={name} src={invite.photoUrl} size={88} ring={2} ringColor={DARK.accentWarm} />
            </div>

            <p style={{ margin: 0, fontSize: 22, fontWeight: 600, overflowWrap: "anywhere" }}>{name}</p>

            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 12,
                background: DARK.card,
                border: `1px solid ${DARK.edge}`,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px 3px 7px",
                  borderRadius: 999,
                  background: "rgba(29,163,98,0.14)",
                  border: "1px solid rgba(29,163,98,0.34)",
                  color: DARK.accentWarm,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  marginBottom: 10,
                }}
              >
                <CheckGlyph size={11} color={DARK.accentWarm} />
                {WORDMARK}
              </span>

              <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ flex: "none", marginTop: 1 }}>
                  <TagGlyph size={18} color={DARK.dim} />
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.45, color: DARK.dim, overflowWrap: "anywhere" }}>
                  Tagged by {shownCount.toLocaleString("en-IN")} {shownCount === 1 ? "person" : "people"} as{" "}
                  <span style={{ color: DARK.accentWarm, fontWeight: 600 }}>
                    &ldquo;{invite.chips[0] || landedLabel}&rdquo;
                  </span>
                </span>
              </div>
            </div>
          </section>

          <h1 style={{ margin: "22px 0 0", fontSize: 21, fontWeight: 700, color: LIGHT.ink }}>
            That&rsquo;s in. Thank you.
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.55, color: LIGHT.sub }}>
            &ldquo;{landedLabel}&rdquo; is with them now — they approve each tag before it reaches the card, so it will
            show up once they have seen it.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <Link
              href="/templates"
              style={{
                minHeight: TAP + 4,
                borderRadius: 12,
                background: LIGHT.accent,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Make one for someone
            </Link>
            <a
              href={nudge}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minHeight: TAP + 4,
                borderRadius: 12,
                border: `1px solid ${LIGHT.rule}`,
                background: "#fff",
                color: LIGHT.ink,
                fontSize: 15,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Send this to someone else
            </a>
            <button
              type="button"
              onClick={addAnother}
              style={{
                minHeight: TAP + 4,
                borderRadius: 12,
                border: `1px solid ${LIGHT.rule}`,
                background: "#fff",
                color: LIGHT.ink,
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              Add another tag
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100dvh", background: "#FFFFFF" }}>
      <ContributorShell
        subjectName={name}
        subjectPhotoUrl={invite.photoUrl || undefined}
        eyebrow={`${WORDMARK} · caller tags`}
        prompt={prompt}
        theme={SHELL_THEME}
        footer="No account, no email. Whatever you write goes to them first — they approve every tag before it appears."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {invite.chips.length > 0 && (
            <div>
              <span style={label12}>Tap one to add your vote</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {invite.chips.map((chip) => {
                  const active = label.trim().toLowerCase() === chip.toLowerCase();
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setLabel(chip);
                        setError("");
                      }}
                      style={{
                        minHeight: TAP,
                        padding: "0 14px",
                        borderRadius: 999,
                        border: `1px solid ${active ? LIGHT.accent : "#DDE1E5"}`,
                        background: active ? "rgba(29,163,98,0.1)" : "#FFFFFF",
                        color: active ? LIGHT.accent : LIGHT.ink,
                        fontFamily: FONT,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        touchAction: "manipulation",
                        maxWidth: "100%",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label>
            <span style={label12}>The tag</span>
            <input
              value={label}
              maxLength={TAG_LABEL_MAX}
              onChange={(event) => {
                setLabel(event.target.value);
                setError("");
              }}
              placeholder="Pick Up. Now."
              style={input}
            />
            <span style={{ display: "block", marginTop: 5, fontSize: 12, color: LIGHT.sub }}>
              {label.length}/{TAG_LABEL_MAX}
            </span>
          </label>

          <label>
            <span style={label12}>Your name</span>
            <input
              value={author}
              maxLength={TAGGER_NAME_MAX}
              onChange={(event) => {
                setAuthor(event.target.value);
                setError("");
              }}
              placeholder="So they know who tagged it"
              style={input}
            />
          </label>

          {error ? (
            <p aria-live="polite" style={{ margin: 0, fontSize: 13.5, color: LIGHT.danger, lineHeight: 1.5 }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void send()}
            disabled={sending}
            style={{
              minHeight: TAP + 4,
              borderRadius: 12,
              border: "none",
              background: LIGHT.accent,
              color: "#fff",
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 600,
              cursor: sending ? "default" : "pointer",
              opacity: sending ? 0.6 : 1,
              touchAction: "manipulation",
            }}
          >
            {sending ? "Sending…" : "Add this tag"}
          </button>
        </div>
      </ContributorShell>
    </main>
  );
}

/**
 * `useSearchParams` has to sit under a Suspense boundary or the prerender of
 * this route fails at build time — and the invite parameters this page reads
 * are exactly what makes it worth rendering, so the boundary is the page.
 */
export default function TagPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100dvh", background: "#FFFFFF" }} />}>
      <TagPageInner />
    </Suspense>
  );
}
