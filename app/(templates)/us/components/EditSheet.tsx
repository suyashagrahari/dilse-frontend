"use client";

// ─── Us — the form ───────────────────────────────────────────────────────────
//
// The sender is filling in a social profile, so the form is arranged as one:
// the account, the bio, the numbers, the posts, the highlights. Nothing here is
// clever — it is a long form, and the only real decisions are about which
// fields deserve their own row and which are better as one-per-line text.
//
// Comments and highlight slides are line-based ("handle: text", "url | caption")
// rather than nested repeaters. Nested repeaters inside a repeater inside a
// bottom sheet on a 380px screen is where forms go to die, and the parsers here
// are tolerant: a missing colon puts the whole line in the text, a missing pipe
// makes the whole line the URL.

import { memo, useCallback, useState } from "react";
import { SYSTEM_FONT, type Comment, type Highlight, type Post, type ProfileData } from "./types";
import { MAX_HIGHLIGHTS, MAX_HIGHLIGHT_SLIDES, MAX_POSTS, MAX_BIO_LINES, MAX_PINNED } from "./data";
import { PenIcon, TrashIcon } from "./icons";
import type { EditMode } from "../hooks/useUsEditor";

const INK = "#111111";
const MUTED = "#737373";
const RULE = "#E5E5E5";
const SURFACE = "#FAFAFA";

/* ── Parsers ─────────────────────────────────────────────────────────────── */

/** "mom: beta eat something" → { handle, text }. No colon → all text. */
export function parseComments(raw: string): Comment[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(":");
      if (at <= 0) return { handle: "friend", text: line };
      return { handle: line.slice(0, at).trim().replace(/^@+/, ""), text: line.slice(at + 1).trim() };
    })
    .filter((c) => c.text.length > 0);
}

export const formatComments = (comments: Comment[]): string =>
  comments.map((c) => `${c.handle}: ${c.text}`).join("\n");

/** "https://… | caption" → a slide. No pipe → the whole line is the URL. */
export function parseSlides(raw: string): Highlight["slides"] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf("|");
      if (at < 0) return { imageUrl: line };
      const caption = line.slice(at + 1).trim();
      return caption ? { imageUrl: line.slice(0, at).trim(), caption } : { imageUrl: line.slice(0, at).trim() };
    })
    .filter((s) => s.imageUrl.length > 0);
}

export const formatSlides = (slides: Highlight["slides"]): string =>
  slides.map((s) => (s.caption ? `${s.imageUrl} | ${s.caption}` : s.imageUrl)).join("\n");

/* ── Atoms ───────────────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 11px",
  borderRadius: 8,
  border: `1px solid ${RULE}`,
  background: "#FFFFFF",
  fontSize: 14,
  lineHeight: "19px",
  color: INK,
  fontFamily: SYSTEM_FONT,
  outline: "none",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: MUTED,
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      {children}
      {hint ? (
        <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 4 }}>{hint}</span>
      ) : null}
    </label>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        borderRadius: 12,
        border: `1px solid ${RULE}`,
        background: SURFACE,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>{title}</h4>
          {subtitle ? (
            <p style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 0", lineHeight: "16px" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 11px",
        borderRadius: 999,
        border: `1px solid ${RULE}`,
        background: disabled ? SURFACE : "#FFFFFF",
        color: disabled ? MUTED : INK,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function RowShell({
  index,
  onRemove,
  children,
}: {
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${RULE}`,
        background: "#FFFFFF",
        padding: 11,
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.06em" }}>
          #{index + 1}
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          style={{ padding: 4, background: "none", border: 0, color: MUTED, cursor: "pointer" }}
        >
          <TrashIcon size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

const Toggle = ({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!on)}
    aria-pressed={on}
    style={{
      padding: "5px 10px",
      borderRadius: 999,
      border: `1px solid ${on ? INK : RULE}`,
      background: on ? INK : "#FFFFFF",
      color: on ? "#FFFFFF" : MUTED,
      fontSize: 11.5,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    {label}
  </button>
);

/* ── The sheet ───────────────────────────────────────────────────────────── */

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: ProfileData;
  updateMf: <K extends keyof ProfileData>(key: K, val: ProfileData[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
}

function EditSheetInner({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
}: EditSheetProps) {
  const [openPost, setOpenPost] = useState<number | null>(0);

  const patchPost = useCallback(
    (index: number, patch: Partial<Post>) => {
      updateMf(
        "posts",
        mf.posts.map((p, i) => (i === index ? { ...p, ...patch } : p)),
      );
    },
    [mf.posts, updateMf],
  );

  const patchHighlight = useCallback(
    (index: number, patch: Partial<Highlight>) => {
      updateMf(
        "highlights",
        mf.highlights.map((h, i) => (i === index ? { ...h, ...patch } : h)),
      );
    },
    [mf.highlights, updateMf],
  );

  const togglePin = useCallback(
    (id: string) => {
      const on = mf.pinnedPostIds.includes(id);
      if (on) {
        updateMf("pinnedPostIds", mf.pinnedPostIds.filter((x) => x !== id));
      } else if (mf.pinnedPostIds.length < MAX_PINNED) {
        updateMf("pinnedPostIds", [...mf.pinnedPostIds, id]);
      }
    },
    [mf.pinnedPostIds, updateMf],
  );

  if (editMode !== "manual") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: SYSTEM_FONT,
      }}
      onClick={() => setEditMode(null)}
    >
      <div
        role="dialog"
        aria-label="Edit the profile"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          height: "92dvh",
          background: "#FFFFFF",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px",
            borderBottom: `1px solid ${RULE}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <PenIcon size={16} color={INK} />
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: INK }}>Write the profile</div>
          <button
            type="button"
            onClick={() => setEditMode(null)}
            style={{ fontSize: 13, fontWeight: 600, color: MUTED, background: "none", border: 0, cursor: "pointer" }}
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, background: "#FFFFFF" }}>
          <Section title="The account" subtitle="Who this profile belongs to.">
            <Field label="Handle" hint="No @ — it is added for you.">
              <input
                style={inputStyle}
                value={mf.handle}
                maxLength={40}
                onChange={(e) => updateMf("handle", e.target.value)}
                placeholder="us_since_2023"
              />
            </Field>
            <Field label="Display name">
              <input
                style={inputStyle}
                value={mf.displayName}
                maxLength={60}
                onChange={(e) => updateMf("displayName", e.target.value)}
                placeholder="Ananya & Rohan"
              />
            </Field>
            <Field label="Category" hint="The grey line under the name.">
              <input
                style={inputStyle}
                value={mf.category}
                maxLength={60}
                onChange={(e) => updateMf("category", e.target.value)}
                placeholder="Domestic partnership"
              />
            </Field>
            <Field label="Profile photo URL">
              <input
                style={inputStyle}
                value={mf.avatarUrl}
                onChange={(e) => updateMf("avatarUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </Section>

          <Section title="The bio" subtitle={`One line per line. ${MAX_BIO_LINES} maximum.`}>
            <Field label="Bio">
              <textarea
                style={{ ...inputStyle, minHeight: 92, resize: "vertical" }}
                value={mf.bio.join("\n")}
                onChange={(e) =>
                  updateMf("bio", e.target.value.split("\n").slice(0, MAX_BIO_LINES))
                }
                placeholder={"two idiots, one shared calendar\nest. 12.03.2023"}
              />
            </Field>
            <Field label="Link text">
              <input
                style={inputStyle}
                value={mf.link?.label ?? ""}
                maxLength={80}
                onChange={(e) =>
                  updateMf("link", { label: e.target.value, url: mf.link?.url ?? "" })
                }
                placeholder="the-shared-album"
              />
            </Field>
            <Field label="Link address" hint="Leave blank to hide the blue line.">
              <input
                style={inputStyle}
                value={mf.link?.url ?? ""}
                onChange={(e) => updateMf("link", { label: mf.link?.label ?? "", url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          </Section>

          <Section title="The numbers" subtitle="Indian grouping below 10,000; K and M above.">
            <div style={{ display: "flex", gap: 8 }}>
              {(["posts", "followers", "following"] as const).map((k) => (
                <div key={k} style={{ flex: 1, minWidth: 0 }}>
                  <Field label={k}>
                    <input
                      style={inputStyle}
                      inputMode="numeric"
                      value={String(mf.stats[k])}
                      onChange={(e) =>
                        updateMf("stats", {
                          ...mf.stats,
                          [k]: Math.max(0, Math.trunc(Number(e.target.value.replace(/\D/g, "")) || 0)),
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
            </div>
            <Field label="Followed by" hint="Comma separated. The first two are named.">
              <input
                style={inputStyle}
                value={mf.followedBy.join(", ")}
                onChange={(e) =>
                  updateMf(
                    "followedBy",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  )
                }
                placeholder="mom, her_mom, the_group_chat"
              />
            </Field>
          </Section>

          <Section
            title="The posts"
            subtitle={`${mf.posts.length} of ${MAX_POSTS}. Pinned posts sit first in the grid.`}
            action={
              <AddButton
                label="Add post"
                disabled={mf.posts.length >= MAX_POSTS}
                onClick={() => {
                  const id = `p${Date.now().toString(36)}`;
                  updateMf("posts", [
                    ...mf.posts,
                    {
                      id,
                      imageUrl: "",
                      caption: "",
                      likes: 0,
                      likedByName: "",
                      postedAgo: "just now",
                      comments: [],
                    },
                  ]);
                  setOpenPost(mf.posts.length);
                }}
              />
            }
          >
            {mf.posts.map((post, i) => {
              const open = openPost === i;
              return (
                <RowShell
                  key={post.id}
                  index={i}
                  onRemove={() => {
                    updateMf("posts", mf.posts.filter((_, x) => x !== i));
                    updateMf("pinnedPostIds", mf.pinnedPostIds.filter((x) => x !== post.id));
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenPost(open ? null : i)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: 0,
                      padding: 0,
                      marginBottom: open ? 8 : 0,
                      fontSize: 13,
                      color: post.caption ? INK : MUTED,
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.caption || "No caption yet"}
                  </button>

                  {open ? (
                    <>
                      <Field label="Photo URL">
                        <input
                          style={inputStyle}
                          value={post.imageUrl}
                          onChange={(e) => patchPost(i, { imageUrl: e.target.value })}
                          placeholder="https://…"
                        />
                      </Field>
                      <Field label="Caption">
                        <textarea
                          style={{ ...inputStyle, minHeight: 62, resize: "vertical" }}
                          value={post.caption}
                          maxLength={600}
                          onChange={(e) => patchPost(i, { caption: e.target.value })}
                        />
                      </Field>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Field label="Likes">
                            <input
                              style={inputStyle}
                              inputMode="numeric"
                              value={String(post.likes)}
                              onChange={(e) =>
                                patchPost(i, {
                                  likes: Math.max(0, Math.trunc(Number(e.target.value.replace(/\D/g, "")) || 0)),
                                })
                              }
                            />
                          </Field>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Field label="Liked by">
                            <input
                              style={inputStyle}
                              value={post.likedByName}
                              onChange={(e) => patchPost(i, { likedByName: e.target.value })}
                              placeholder="her_mom"
                            />
                          </Field>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Field label="Posted">
                            <input
                              style={inputStyle}
                              value={post.postedAgo}
                              onChange={(e) => patchPost(i, { postedAgo: e.target.value })}
                              placeholder="2 years ago"
                            />
                          </Field>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Field label="Location">
                            <input
                              style={inputStyle}
                              value={post.location ?? ""}
                              onChange={(e) => patchPost(i, { location: e.target.value })}
                              placeholder="Bandra, Mumbai"
                            />
                          </Field>
                        </div>
                      </div>
                      <Field label="Comments" hint="One per line, as “handle: what they said”.">
                        <textarea
                          style={{ ...inputStyle, minHeight: 62, resize: "vertical" }}
                          value={formatComments(post.comments)}
                          onChange={(e) => patchPost(i, { comments: parseComments(e.target.value) })}
                          placeholder={"mom: beta eat something\narjun: unfollowing, too much"}
                        />
                      </Field>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Toggle
                          label="Multiple photos"
                          on={Boolean(post.isMultiple)}
                          onChange={(v) => patchPost(i, { isMultiple: v })}
                        />
                        <Toggle
                          label="Video"
                          on={Boolean(post.isVideo)}
                          onChange={(v) => patchPost(i, { isVideo: v })}
                        />
                        <Toggle
                          label="Pinned"
                          on={mf.pinnedPostIds.includes(post.id)}
                          onChange={() => togglePin(post.id)}
                        />
                      </div>
                    </>
                  ) : null}
                </RowShell>
              );
            })}
          </Section>

          <Section
            title="The highlights"
            subtitle={`${mf.highlights.length} of ${MAX_HIGHLIGHTS}. Titles show 10 characters.`}
            action={
              <AddButton
                label="Add highlight"
                disabled={mf.highlights.length >= MAX_HIGHLIGHTS}
                onClick={() =>
                  updateMf("highlights", [
                    ...mf.highlights,
                    { title: "", coverUrl: "", slides: [] },
                  ])
                }
              />
            }
          >
            {mf.highlights.map((h, i) => (
              <RowShell
                key={i}
                index={i}
                onRemove={() => updateMf("highlights", mf.highlights.filter((_, x) => x !== i))}
              >
                <Field label="Title">
                  <input
                    style={inputStyle}
                    value={h.title}
                    maxLength={60}
                    onChange={(e) => patchHighlight(i, { title: e.target.value })}
                    placeholder="first date"
                  />
                </Field>
                <Field label="Cover URL" hint="Blank uses the first slide.">
                  <input
                    style={inputStyle}
                    value={h.coverUrl}
                    onChange={(e) => patchHighlight(i, { coverUrl: e.target.value })}
                    placeholder="https://…"
                  />
                </Field>
                <Field
                  label="Slides"
                  hint={`One per line, as “url | caption”. ${MAX_HIGHLIGHT_SLIDES} maximum.`}
                >
                  <textarea
                    style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                    value={formatSlides(h.slides)}
                    onChange={(e) =>
                      patchHighlight(i, { slides: parseSlides(e.target.value).slice(0, MAX_HIGHLIGHT_SLIDES) })
                    }
                    placeholder={"https://… | i was 20 minutes early"}
                  />
                </Field>
              </RowShell>
            ))}
          </Section>

          <Section title="Password" subtitle="Optional. Only they get in.">
            <Field label="Password">
              <input
                style={inputStyle}
                value={pagePassword}
                onChange={(e) => setPagePassword(e.target.value)}
                placeholder="Leave blank for no lock"
              />
            </Field>
          </Section>
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: 14,
            paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))",
            borderTop: `1px solid ${RULE}`,
            background: "#FFFFFF",
          }}
        >
          <button
            type="button"
            onClick={onSave}
            style={{
              width: "100%",
              height: 46,
              borderRadius: 10,
              border: 0,
              background: INK,
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save &amp; preview
          </button>
          <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: "8px 0 0" }}>
            Nothing is stored on this device — publish to keep it.
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(EditSheetInner);
