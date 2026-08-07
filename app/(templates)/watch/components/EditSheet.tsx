"use client";

// ─── The form ────────────────────────────────────────────────────────────────
//
// A bottom sheet with six tabs, because this template has more fields than any
// single scroll can hold honestly. Everything here writes straight into `mf`,
// which the editor autosaves on every keystroke.
//
// ── THE LINK IS VALIDATED AT INPUT TIME ──────────────────────────────────────
//
// The one field that can break the whole page is the video link, so it is
// checked as it is typed and the resolved id is shown back. Every link form
// resolves the same way — the `v` parameter, or the last path segment — so the
// short host, the long link, the embed link and the single-segment link all
// work without this file naming any of them.
//
// ── TIMESTAMPS ARE NUMBERS ───────────────────────────────────────────────────
//
// Chapters are typed as "3:12" because that is how people think, and stored as
// `seconds` because that is what a seek takes. The parse happens here, once, on
// the way in — never at seek time, where being a parse away from wrong is the
// difference between a chapter and a bug.

import { useCallback, useMemo, useState } from "react";
import type { EditMode } from "../hooks/useWatchEditor";
import {
  MAX_CHAPTERS,
  MAX_COMMENTS,
  MAX_PARAGRAPHS,
  MAX_RELATED,
  MAX_SECONDS,
  embedId,
  formatTimestamp,
  type Chapter,
  type Comment,
  type RelatedVideo,
  type WatchData,
} from "./types";
import { CloseGlyph, FONT, T, parseVideoLink } from "./theme";

type Tab = "video" | "channel" | "story" | "chapters" | "comments" | "more";

const TABS: readonly { id: Tab; label: string }[] = [
  { id: "video", label: "Video" },
  { id: "channel", label: "Channel" },
  { id: "story", label: "Description" },
  { id: "chapters", label: "Chapters" },
  { id: "comments", label: "Comments" },
  { id: "more", label: "More" },
];

/** "3:12" / "1:04:07" / "192" → seconds. Null when it is not a time at all. */
export function parseTimestamp(input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return n <= MAX_SECONDS ? n : null;
  }
  const parts = raw.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((p) => /^\d{1,2}$/.test(p.trim()))) return null;
  const nums = parts.map((p) => Number(p.trim()));
  const seconds =
    nums.length === 3 ? nums[0] * 3600 + nums[1] * 60 + nums[2] : nums[0] * 60 + nums[1];
  return seconds >= 0 && seconds <= MAX_SECONDS ? seconds : null;
}

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: WatchData;
  setMf: React.Dispatch<React.SetStateAction<WatchData>>;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  setMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
}: EditSheetProps) {
  const [tab, setTab] = useState<Tab>("video");
  const [link, setLink] = useState("");

  const open = editMode === "manual";

  const patchVideo = useCallback(
    (patch: Partial<WatchData["video"]>) => setMf((p) => ({ ...p, video: { ...p.video, ...patch } })),
    [setMf],
  );
  const patchChannel = useCallback(
    (patch: Partial<WatchData["channel"]>) =>
      setMf((p) => ({ ...p, channel: { ...p.channel, ...patch } })),
    [setMf],
  );
  const patchDescription = useCallback(
    (patch: Partial<WatchData["description"]>) =>
      setMf((p) => ({ ...p, description: { ...p.description, ...patch } })),
    [setMf],
  );

  const linkStatus = useMemo(() => {
    if (!link.trim()) return null;
    const id = parseVideoLink(link);
    return id ? { ok: true as const, id } : { ok: false as const, id: "" };
  }, [link]);

  const applyLink = useCallback(() => {
    if (!linkStatus?.ok) return;
    patchVideo({ youtubeId: embedId(linkStatus.id, mf.video.youtubeId) });
    setLink("");
  }, [linkStatus, patchVideo, mf.video.youtubeId]);

  if (!open) return null;

  return (
    <div className="wt-edit-root" role="presentation">
      <button type="button" className="wt-edit-scrim" aria-label="Close" onClick={() => setEditMode(null)} />
      <div className="wt-edit" role="dialog" aria-modal="true" aria-label="Edit this page">
        <header className="wt-edit-head">
          <h2 className="wt-edit-title">Make it yours</h2>
          <button type="button" className="wt-sheet-x" onClick={() => setEditMode(null)} aria-label="Close">
            <CloseGlyph size={18} color={T.ink} />
          </button>
        </header>

        <nav className="wt-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`wt-tab${tab === t.id ? " is-on" : ""}`}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="wt-edit-body">
          {tab === "video" ? (
            <>
              <Field label="Paste the video link">
                <input
                  className="wt-input"
                  value={link}
                  placeholder="Paste any link to the video"
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyLink();
                    }
                  }}
                />
                {linkStatus ? (
                  <p className={`wt-hint${linkStatus.ok ? " is-ok" : " is-bad"}`}>
                    {linkStatus.ok
                      ? `Looks right — id ${linkStatus.id}. Press Use it.`
                      : "That doesn't look like a video link yet."}
                  </p>
                ) : (
                  <p className="wt-hint">Currently playing: {mf.video.youtubeId}</p>
                )}
                <button
                  type="button"
                  className="wt-primary"
                  onClick={applyLink}
                  disabled={!linkStatus?.ok}
                  style={{ marginTop: 8 }}
                >
                  Use it
                </button>
              </Field>

              <Field label="Title">
                <textarea
                  className="wt-input wt-textarea"
                  rows={2}
                  maxLength={200}
                  value={mf.video.title}
                  onChange={(e) => patchVideo({ title: e.target.value })}
                />
              </Field>

              <Row>
                <Field label="Views">
                  <input
                    className="wt-input"
                    maxLength={32}
                    value={mf.video.views}
                    onChange={(e) => patchVideo({ views: e.target.value })}
                  />
                </Field>
                <Field label="Likes">
                  <input
                    className="wt-input"
                    maxLength={32}
                    value={mf.video.likes}
                    onChange={(e) => patchVideo({ likes: e.target.value })}
                  />
                </Field>
              </Row>

              <Field label="Posted">
                <input
                  className="wt-input"
                  maxLength={48}
                  value={mf.video.postedAgo}
                  onChange={(e) => patchVideo({ postedAgo: e.target.value })}
                />
              </Field>
            </>
          ) : null}

          {tab === "channel" ? (
            <>
              <Field label="Channel name">
                <input
                  className="wt-input"
                  maxLength={60}
                  value={mf.channel.name}
                  onChange={(e) => patchChannel({ name: e.target.value })}
                />
              </Field>
              <Row>
                <Field label="Handle">
                  <input
                    className="wt-input"
                    maxLength={40}
                    value={mf.channel.handle}
                    onChange={(e) => patchChannel({ handle: e.target.value })}
                  />
                </Field>
                <Field label="Subscribers">
                  <input
                    className="wt-input"
                    maxLength={32}
                    value={mf.channel.subscribers}
                    onChange={(e) => patchChannel({ subscribers: e.target.value })}
                  />
                </Field>
              </Row>
              <Field label="Channel picture (link)">
                <input
                  className="wt-input"
                  value={mf.channel.avatarUrl}
                  placeholder="https://…"
                  onChange={(e) => patchChannel({ avatarUrl: e.target.value })}
                />
              </Field>
            </>
          ) : null}

          {tab === "story" ? (
            <>
              <Field label="Above the chapters — one paragraph per line">
                <textarea
                  className="wt-input wt-textarea"
                  rows={5}
                  value={mf.description.intro.join("\n")}
                  onChange={(e) =>
                    patchDescription({
                      intro: e.target.value.split("\n").slice(0, MAX_PARAGRAPHS),
                    })
                  }
                />
              </Field>
              <Field label="Below the chapters — this is the part she reads twice">
                <textarea
                  className="wt-input wt-textarea"
                  rows={5}
                  value={mf.description.outro.join("\n")}
                  onChange={(e) =>
                    patchDescription({
                      outro: e.target.value.split("\n").slice(0, MAX_PARAGRAPHS),
                    })
                  }
                />
              </Field>
            </>
          ) : null}

          {tab === "chapters" ? (
            <ChapterEditor
              chapters={mf.description.chapters}
              onChange={(chapters) => patchDescription({ chapters })}
            />
          ) : null}

          {tab === "comments" ? (
            <>
              <Field label="Pinned comment — from you">
                <input
                  className="wt-input"
                  maxLength={60}
                  placeholder="Name"
                  value={mf.pinnedComment?.author ?? ""}
                  onChange={(e) =>
                    setMf((p) => ({
                      ...p,
                      pinnedComment: {
                        id: p.pinnedComment?.id ?? "c0",
                        likes: p.pinnedComment?.likes ?? 0,
                        ago: p.pinnedComment?.ago ?? "just now",
                        text: p.pinnedComment?.text ?? "",
                        isCreator: true,
                        status: "published",
                        ...p.pinnedComment,
                        author: e.target.value,
                      },
                    }))
                  }
                />
                <textarea
                  className="wt-input wt-textarea"
                  rows={4}
                  maxLength={1200}
                  placeholder="The thing you actually want to say"
                  value={mf.pinnedComment?.text ?? ""}
                  onChange={(e) =>
                    setMf((p) => ({
                      ...p,
                      pinnedComment: {
                        id: p.pinnedComment?.id ?? "c0",
                        author: p.pinnedComment?.author ?? p.channel.name,
                        likes: p.pinnedComment?.likes ?? 0,
                        ago: p.pinnedComment?.ago ?? "just now",
                        isCreator: true,
                        status: "published",
                        ...p.pinnedComment,
                        text: e.target.value,
                      },
                    }))
                  }
                  style={{ marginTop: 8 }}
                />
              </Field>

              <CommentEditor
                comments={mf.comments}
                onChange={(comments) => setMf((p) => ({ ...p, comments }))}
              />
            </>
          ) : null}

          {tab === "more" ? (
            <>
              <RelatedEditor
                related={mf.related}
                onChange={(related) => setMf((p) => ({ ...p, related }))}
              />
              <Field label="What you're asking her friends for">
                <textarea
                  className="wt-input wt-textarea"
                  rows={3}
                  maxLength={240}
                  value={mf.contributorPrompt}
                  onChange={(e) => setMf((p) => ({ ...p, contributorPrompt: e.target.value }))}
                />
              </Field>
              <Field label="Password (optional)">
                <input
                  className="wt-input"
                  value={pagePassword}
                  placeholder="Leave empty for no password"
                  onChange={(e) => setPagePassword(e.target.value)}
                />
                <p className="wt-hint">She will need this to open the page.</p>
              </Field>
            </>
          ) : null}
        </div>

        <footer className="wt-edit-foot">
          <button type="button" className="wt-ghost" onClick={() => setEditMode(null)}>
            Cancel
          </button>
          <button type="button" className="wt-primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </footer>
      </div>
      <style>{EDIT_CSS}</style>
    </div>
  );
}

/* ── Sub-editors ───────────────────────────────────────────────────────────── */

function ChapterEditor({
  chapters,
  onChange,
}: {
  chapters: readonly Chapter[];
  onChange: (next: Chapter[]) => void;
}) {
  const [draftTime, setDraftTime] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const parsed = parseTimestamp(draftTime);

  const add = () => {
    if (parsed === null || !draftLabel.trim()) return;
    onChange(
      [...chapters, { seconds: parsed, label: draftLabel.trim() }]
        .slice(0, MAX_CHAPTERS)
        .sort((a, b) => a.seconds - b.seconds),
    );
    setDraftTime("");
    setDraftLabel("");
  };

  return (
    <>
      <p className="wt-hint">
        Timestamps are the part everybody taps. {chapters.length}/{MAX_CHAPTERS} used.
      </p>
      <ul className="wt-list">
        {chapters.map((c, i) => (
          <li key={`${c.seconds}-${i}`} className="wt-list-row">
            <span className="wt-list-time">{formatTimestamp(c.seconds)}</span>
            <input
              className="wt-input wt-input--flat"
              maxLength={160}
              value={c.label}
              onChange={(e) => {
                const next = chapters.map((x, j) => (j === i ? { ...x, label: e.target.value } : x));
                onChange(next);
              }}
            />
            <button
              type="button"
              className="wt-x"
              aria-label={`Remove chapter ${formatTimestamp(c.seconds)}`}
              onClick={() => onChange(chapters.filter((_, j) => j !== i))}
            >
              <CloseGlyph size={15} color={T.inkSoft} />
            </button>
          </li>
        ))}
      </ul>

      <Row>
        <Field label="Time">
          <input
            className="wt-input"
            placeholder="3:12"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            inputMode="numeric"
          />
        </Field>
        <Field label="What happens there">
          <input
            className="wt-input"
            placeholder="the bit where you laugh"
            value={draftLabel}
            maxLength={160}
            onChange={(e) => setDraftLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </Field>
      </Row>
      {draftTime && parsed === null ? <p className="wt-hint is-bad">Try 3:12, or 1:04:07.</p> : null}
      <button
        type="button"
        className="wt-primary"
        onClick={add}
        disabled={parsed === null || !draftLabel.trim() || chapters.length >= MAX_CHAPTERS}
      >
        Add chapter
      </button>
    </>
  );
}

function CommentEditor({
  comments,
  onChange,
}: {
  comments: readonly Comment[];
  onChange: (next: Comment[]) => void;
}) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  const add = () => {
    if (!author.trim() || !text.trim()) return;
    onChange(
      [
        ...comments,
        {
          id: `c${Date.now()}`,
          author: author.trim(),
          text: text.trim(),
          ago: "just now",
          likes: 0,
          status: "published" as const,
        },
      ].slice(0, MAX_COMMENTS),
    );
    setAuthor("");
    setText("");
  };

  return (
    <>
      <p className="wt-hint">
        Comments you write yourself. Her friends add theirs from the link you share.
      </p>
      <ul className="wt-list">
        {comments.map((c, i) => (
          <li key={c.id} className="wt-list-row">
            <span className="wt-list-time wt-list-time--wide">{c.author}</span>
            <input
              className="wt-input wt-input--flat"
              maxLength={1200}
              value={c.text}
              onChange={(e) =>
                onChange(comments.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))
              }
            />
            <button
              type="button"
              className="wt-x"
              aria-label={`Remove ${c.author}'s comment`}
              onClick={() => onChange(comments.filter((_, j) => j !== i))}
            >
              <CloseGlyph size={15} color={T.inkSoft} />
            </button>
          </li>
        ))}
      </ul>
      <Row>
        <Field label="Who">
          <input className="wt-input" maxLength={60} value={author} onChange={(e) => setAuthor(e.target.value)} />
        </Field>
        <Field label="What they said">
          <input
            className="wt-input"
            value={text}
            maxLength={1200}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </Field>
      </Row>
      <button type="button" className="wt-primary" onClick={add} disabled={!author.trim() || !text.trim()}>
        Add comment
      </button>
    </>
  );
}

function RelatedEditor({
  related,
  onChange,
}: {
  related: readonly RelatedVideo[];
  onChange: (next: RelatedVideo[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [linkValue, setLinkValue] = useState("");

  const add = () => {
    if (!title.trim()) return;
    const id = parseVideoLink(linkValue);
    onChange(
      [
        ...related,
        {
          id: `r${Date.now()}`,
          ...(id ? { youtubeId: embedId(id, "") } : {}),
          title: title.trim(),
          channel: related[0]?.channel ?? "us.",
          views: "",
          ago: "",
          duration: duration.trim(),
          thumbnailUrl: "",
        },
      ].slice(0, MAX_RELATED),
    );
    setTitle("");
    setDuration("");
    setLinkValue("");
  };

  return (
    <>
      <p className="wt-hint">
        The rail down the side. A card with a link plays; one without is a joke that says so.
      </p>
      <ul className="wt-list">
        {related.map((r, i) => (
          <li key={r.id} className="wt-list-row">
            <span className="wt-list-time">{r.duration || "—"}</span>
            <input
              className="wt-input wt-input--flat"
              maxLength={200}
              value={r.title}
              onChange={(e) =>
                onChange(related.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
              }
            />
            <button
              type="button"
              className="wt-x"
              aria-label={`Remove ${r.title}`}
              onClick={() => onChange(related.filter((_, j) => j !== i))}
            >
              <CloseGlyph size={15} color={T.inkSoft} />
            </button>
          </li>
        ))}
      </ul>
      <Field label="Title">
        <input className="wt-input" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Row>
        <Field label="Duration">
          <input className="wt-input" maxLength={12} placeholder="4:12" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Field>
        <Field label="Link (optional)">
          <input className="wt-input" value={linkValue} onChange={(e) => setLinkValue(e.target.value)} />
        </Field>
      </Row>
      <button type="button" className="wt-primary" onClick={add} disabled={!title.trim() || related.length >= MAX_RELATED}>
        Add to the rail
      </button>
    </>
  );
}

/* ── Layout atoms ──────────────────────────────────────────────────────────── */

/**
 * A labelled group. A `<div>` rather than a `<label>` on purpose: several of
 * these hold two controls, and a label bound to two inputs is worse for a
 * screen reader than a heading is.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="wt-field" role="group" aria-label={label}>
      <span className="wt-field-label">{label}</span>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="wt-row">{children}</div>;
}

const EDIT_CSS = `
.wt-edit-root { position: fixed; inset: 0; z-index: 240; font-family: ${FONT}; }
.wt-edit-scrim {
  position: absolute; inset: 0; border: 0; padding: 0; cursor: default;
  background: rgba(0,0,0,0.7);
}
.wt-edit {
  position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
  width: min(680px, 100%); max-height: 92dvh; display: flex; flex-direction: column;
  background: ${T.raised}; border-top: 1px solid ${T.line};
  border-top-left-radius: 18px; border-top-right-radius: 18px;
  animation: wt-edit-up 220ms cubic-bezier(0.2,0.8,0.2,1) both;
}
.wt-edit-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px 8px; }
.wt-edit-title { margin: 0; flex: 1; font-size: 17px; font-weight: 700; color: ${T.ink}; }
.wt-tabs {
  display: flex; gap: 6px; padding: 0 12px 10px; overflow-x: auto; scrollbar-width: none;
  border-bottom: 1px solid ${T.line};
}
.wt-tabs::-webkit-scrollbar { display: none; }
.wt-tab {
  flex: none; height: 32px; padding: 0 12px; border: 0; border-radius: 8px;
  background: ${T.chip}; color: ${T.inkSoft};
  font-family: ${FONT}; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap;
}
.wt-tab.is-on { background: ${T.ink}; color: ${T.page}; }
.wt-edit-body {
  padding: 14px 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
  -webkit-overflow-scrolling: touch;
}
.wt-edit-foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 16px max(14px, env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ${T.line};
}
.wt-field { display: block; }
.wt-field-label {
  display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600;
  letter-spacing: 0.02em; color: ${T.inkSoft};
}
.wt-row { display: flex; gap: 10px; flex-wrap: wrap; }
.wt-row > .wt-field { flex: 1 1 160px; min-width: 0; }
.wt-input {
  width: 100%; min-height: 40px; padding: 9px 12px; border-radius: 10px;
  border: 1px solid ${T.line}; background: ${T.page}; color: ${T.ink};
  font-family: ${FONT}; font-size: 14px; outline: none;
}
.wt-input:focus { border-color: ${T.accent}; }
.wt-input::placeholder { color: #6E6E6E; }
.wt-input--flat { flex: 1; min-width: 0; border-radius: 8px; }
.wt-textarea { resize: vertical; line-height: 20px; }
.wt-hint { margin: 6px 0 0; font-size: 12px; line-height: 16px; color: ${T.inkSoft}; }
.wt-hint.is-ok { color: #7FBF95; }
.wt-hint.is-bad { color: ${T.accent}; }
.wt-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.wt-list-row { display: flex; align-items: center; gap: 8px; }
.wt-list-time {
  flex: none; width: 56px; font-size: 12.5px; color: ${T.accent};
  font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.wt-list-time--wide { width: 84px; color: ${T.inkSoft}; }
.wt-x {
  width: 32px; height: 32px; flex: none; border: 0; border-radius: 50%;
  background: transparent; display: grid; place-items: center; cursor: pointer;
}
.wt-x:hover { background: ${T.chip}; }
/* Repeated from the page stylesheet so the sheet is not styled by a sibling. */
.wt-edit-root .wt-primary {
  height: 40px; padding: 0 18px; border-radius: 20px; border: 0;
  background: ${T.accent}; color: #FFFFFF;
  font-family: ${FONT}; font-size: 14px; font-weight: 600; cursor: pointer; align-self: flex-start;
}
.wt-edit-root .wt-primary:disabled { background: ${T.chip}; color: ${T.inkSoft}; cursor: default; }
.wt-edit-root .wt-ghost {
  height: 40px; padding: 0 18px; border-radius: 20px; border: 0; background: transparent;
  color: ${T.ink}; font-family: ${FONT}; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-edit-root .wt-ghost:hover { background: ${T.chip}; }
.wt-edit-root .wt-sheet-x {
  width: 32px; height: 32px; flex: none; border: 0; border-radius: 50%;
  background: transparent; display: grid; place-items: center; cursor: pointer;
}
@keyframes wt-edit-up { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
@media (prefers-reduced-motion: reduce) { .wt-edit { animation: none; } }
`;
