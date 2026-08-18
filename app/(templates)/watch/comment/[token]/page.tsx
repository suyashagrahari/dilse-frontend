"use client";

// ─── /watch/comment/[token] — the friends' door ──────────────────────────────
//
// Somebody got a link in a group chat. They do not know what this site is, they
// have no account, and they are giving us ninety seconds because they like the
// two people this page is about. So: two fields, no signup, no email, and a
// send button that works the first time.
//
// ── THE TOKEN IN THE URL IS A WRITE CAPABILITY AND NOTHING ELSE ──────────────
//
// It is `contribToken`, which is a DIFFERENT secret from the recipient's
// `shareId`. It lets the holder add a comment; it does not let them read the
// gift. That is why this page renders its heading from display copy carried in
// the query string rather than by fetching the page — fetching would need the
// read secret, and handing twenty friends the read secret to collect twenty
// comments is exactly the trade the two-token design exists to refuse.
//
// Nothing written here is public. Every submission lands as "pending" and the
// person who made the page decides.

import Link from "next/link";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ContributorShell, { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";
import {
  COMMENT_MAX,
  NAME_MAX,
  idempotencyKey,
  submitComment,
} from "../../components/contrib";
import { DEMO_DATA } from "../../components/types";
import {
  FONT,
  InitialsAvatar,
  SERIF,
  SafeImage,
  T,
  ThumbFallback,
  posterUrls,
} from "../../components/theme";

interface Landed {
  id: number;
  name: string;
  text: string;
}

function CommentDoorInner() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const token = typeof params?.token === "string" ? params.token : "";

  // Display copy only — never a capability. Absent params fall back to the demo
  // wording, so a link that lost its query string still reads as a real ask.
  const title = (search.get("t") || DEMO_DATA.video.title).slice(0, 200);
  const embed = (search.get("i") || DEMO_DATA.video.youtubeId).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
  const channel = (search.get("c") || DEMO_DATA.channel.name).slice(0, 60);
  const prompt = (search.get("p") || DEMO_DATA.contributorPrompt).slice(0, 240);

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [landed, setLanded] = useState<Landed[]>([]);
  const keyRef = useRef<string | null>(null);
  const nextId = useRef(0);

  const [poster, posterAlt] = useMemo(() => posterUrls(embed), [embed]);
  const submitted = landed.length > 0;

  const send = useCallback(async () => {
    if (sending) return;
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText) {
      setError("A name and a line or two, and you're done.");
      return;
    }
    if (!token) {
      setError("This link is missing something. Ask them to send it again.");
      return;
    }

    setSending(true);
    setError("");
    // Reused across a RETRY of the same submission, so a dropped connection
    // cannot turn one kind sentence into two.
    const key = keyRef.current ?? idempotencyKey();
    keyRef.current = key;

    const res = await submitComment(token, trimmedName, trimmedText, key);
    setSending(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    keyRef.current = null;
    nextId.current += 1;
    setLanded((prev) => [{ id: nextId.current, name: trimmedName, text: trimmedText }, ...prev]);
    setText("");
  }, [sending, name, text, token]);

  const addAnother = useCallback(() => {
    setLanded([]);
    setText("");
    setError("");
  }, []);

  const shareLink = typeof window !== "undefined" ? window.location.href : "";
  const nudge = "Leave a comment on this — it's for her, and he reads every one:";

  return (
    <div className="wc-page">
      <style>{CSS}</style>

      <header className="wc-head">
        <div className="wc-thumb">
          <SafeImage
            src={poster}
            altSrc={posterAlt}
            alt=""
            fallback={<ThumbFallback radius={10} />}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <h1 className="wc-title">{title}</h1>
        <p className="wc-channel">{channel}</p>
      </header>

      <ContributorShell
        subjectName={channel}
        eyebrow="You've been asked to say something"
        prompt={prompt}
        submitted={submitted}
        successTitle="That's in. Thank you."
        successBody="It's waiting for them. Nothing goes on the page until they say so — which is the point."
        onAddAnother={addAnother}
        addAnotherLabel="Say something else"
        shareLink={shareLink}
        shareMessage={nudge}
        shareLabel="Send this to someone else"
        ctaHref="/templates"
        ctaLabel="Make one for someone"
        footer="No account, no email, nothing kept. Just your name and your words."
        theme={{
          paper: T.page,
          paperDeep: T.raised,
          edge: T.line,
          ink: T.ink,
          inkSoft: T.inkSoft,
          inkFaint: "#7A7A7A",
          accent: T.accent,
          accentInk: "#FFFFFF",
          danger: "#C9584B",
          ok: "#4E9C6B",
          warn: "#C99A3C",
          font: FONT,
          serif: SERIF,
        }}
      >
        <div className="wc-form">
          <label className="wc-field">
            <span className="wc-label">Your comment</span>
            <textarea
              className="wc-input wc-textarea"
              rows={4}
              maxLength={COMMENT_MAX}
              value={text}
              placeholder="Say the thing only you know."
              onChange={(e) => {
                setText(e.target.value);
                setError("");
              }}
            />
            <span className="wc-count">
              {text.length}/{COMMENT_MAX}
            </span>
          </label>

          <label className="wc-field">
            <span className="wc-label">Your name</span>
            <input
              className="wc-input"
              maxLength={NAME_MAX}
              value={name}
              placeholder="What they call you"
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />
          </label>

          {error ? (
            <p className="wc-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="wc-send"
            onClick={send}
            disabled={sending || !name.trim() || !text.trim()}
          >
            {sending ? "Sending…" : "Send it"}
          </button>
        </div>
      </ContributorShell>

      {submitted ? (
        <section className="wc-after">
          <h2 className="wc-after-count">
            {landed.length} {landed.length === 1 ? "Comment" : "Comments"}
          </h2>
          <ul className="wc-list">
            {landed.map((c) => (
              <li key={c.id} className="wc-comment">
                <InitialsAvatar name={c.name} size={36} />
                <div style={{ minWidth: 0 }}>
                  <p className="wc-comment-meta">
                    <span className="wc-handle">{c.name}</span>
                    <span className="wc-ago">· just now</span>
                    <span className="wc-pending">waiting for them</span>
                  </p>
                  <p className="wc-comment-text">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="wc-after-actions">
            <a
              className="wc-wa"
              href={whatsappNudgeUrl(nudge, shareLink)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Nudge someone else
            </a>
            <Link href="/templates" className="wc-make">
              Make one
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function CommentDoor() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: T.page }} />}>
      <CommentDoorInner />
    </Suspense>
  );
}

const CSS = `
.wc-page {
  min-height: 100dvh; background: ${T.page}; color: ${T.ink}; font-family: ${FONT};
  padding-bottom: 48px;
}
.wc-page *, .wc-page *::before, .wc-page *::after { box-sizing: border-box; }
.wc-head { width: 100%; max-width: 520px; margin: 0 auto; padding: 20px 18px 0; }
.wc-thumb {
  position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 10px;
  overflow: hidden; background: ${T.chip};
}
.wc-title {
  margin: 12px 0 0; font-size: 18px; line-height: 25px; font-weight: 700;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  overflow-wrap: anywhere;
}
.wc-channel { margin: 4px 0 0; font-size: 13px; color: ${T.inkSoft}; }

.wc-form { display: flex; flex-direction: column; gap: 14px; }
.wc-field { display: block; position: relative; }
.wc-label {
  display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: ${T.inkSoft};
}
.wc-input {
  width: 100%; min-height: 48px; padding: 12px 14px; border-radius: 12px;
  border: 1px solid ${T.line}; background: ${T.raised}; color: ${T.ink};
  font-family: ${FONT}; font-size: 15px; outline: none;
}
.wc-input:focus { border-color: ${T.accent}; }
.wc-input::placeholder { color: #6E6E6E; }
.wc-textarea { resize: vertical; line-height: 21px; }
.wc-count {
  position: absolute; right: 10px; bottom: -16px; font-size: 11px; color: ${T.inkSoft};
  font-variant-numeric: tabular-nums;
}
.wc-error { margin: 0; font-size: 13px; color: ${T.accent}; }
.wc-send {
  height: 50px; border: 0; border-radius: 14px; background: ${T.accent}; color: #FFFFFF;
  font-family: ${FONT}; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 6px;
}
.wc-send:disabled { background: ${T.chip}; color: ${T.inkSoft}; cursor: default; }

.wc-after { width: 100%; max-width: 520px; margin: 0 auto; padding: 4px 18px 0; }
.wc-after-count { margin: 0 0 14px; font-size: 18px; font-weight: 700; }
.wc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.wc-comment {
  display: flex; gap: 12px; align-items: flex-start;
  animation: wc-in 240ms ease-out both;
}
.wc-comment-meta { margin: 0 0 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.wc-handle { font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
.wc-ago { font-size: 12px; color: ${T.inkSoft}; }
.wc-pending {
  font-size: 11px; font-weight: 600; color: ${T.accent};
  background: ${T.accentSoft}; padding: 2px 8px; border-radius: 999px;
}
.wc-comment-text {
  margin: 0; font-size: 14px; line-height: 20px; color: ${T.ink};
  overflow-wrap: anywhere; white-space: pre-wrap;
}
.wc-after-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
.wc-wa, .wc-make {
  flex: 1 1 160px; display: inline-flex; align-items: center; justify-content: center;
  height: 48px; border-radius: 14px; text-decoration: none;
  font-family: ${FONT}; font-size: 14px; font-weight: 600;
}
.wc-wa { border: 1px solid ${T.line}; color: ${T.ink}; }
.wc-make { background: ${T.accent}; color: #FFFFFF; }

@keyframes wc-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wc-comment { animation: none; } }
`;
