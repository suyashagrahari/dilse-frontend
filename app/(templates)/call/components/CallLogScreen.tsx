// ─── Screen 3 — the recents list ─────────────────────────────────────────────
//
// The theme flips to white. That flip is the whole point: nothing says "the
// call is over" faster than the screen going from a dark full-bleed photo to a
// plain list, and it lets the log land as documentation rather than as drama.
//
// ── WHY MISSED CALLS ARE RED ─────────────────────────────────────────────────
//
// Because that is what a phone does, and because it is where the joke is. A log
// of forty-seven calls is funny; a log of forty-seven calls where the missed
// ones are red and the answered ones are not is an accusation. The colour is
// doing the writing.
//
// ── ROW HEIGHT ───────────────────────────────────────────────────────────────
//
// 64px is the FLOOR, not the ceiling. Name and kind·time fit in 64; the `note`
// — which the frozen contract calls "the line under the entry, where the joke
// lives" — is a third line and is allowed to push the row taller. Clipping it
// to hit an exact height would delete the only writing on this screen.

"use client";

import Link from "next/link";
import { CallDirectionGlyph, DownloadGlyph, InfoGlyph, SearchGlyph, TagGlyph } from "./icons";
import { Avatar, FONT, LIGHT, TAP } from "./theme";
import { heroTag } from "./IncomingScreen";
import type { CallData, CallKind, CallLogEntry, CallerTag } from "./types";

export interface CallLogScreenProps {
  data: CallData;
  tags: readonly CallerTag[];
  /** The friends' write link, when the viewer is the one who owns it. */
  contribLink?: string | null;
  onTagHer?: () => void;
  onSaveCard: () => void;
}

const KIND_LABEL: Record<CallKind, string> = {
  missed: "Missed",
  incoming: "Incoming",
  outgoing: "Outgoing",
  rejected: "Declined",
};

/** Missed and declined are red; the two that went through are not. */
const isRed = (kind: CallKind): boolean => kind === "missed" || kind === "rejected";

export interface LogGroup {
  entry: CallLogEntry;
  /** How many consecutive calls of this kind collapsed into this row. */
  count: number;
}

/**
 * Collapse runs of the same kind, the way a recents list does.
 *
 * Only CONSECUTIVE entries collapse — a missed call from Tuesday does not join
 * a missed call from Sunday, because the badge is claiming "she did this over
 * and over just now" and that has to stay true.
 */
export function groupLog(entries: readonly CallLogEntry[]): LogGroup[] {
  const out: LogGroup[] = [];
  for (const entry of entries) {
    const last = out[out.length - 1];
    if (last && last.entry.kind === entry.kind) {
      last.count += 1;
      continue;
    }
    out.push({ entry, count: 1 });
  }
  return out;
}

/** "7 calls today. 4 answered." Counted off the real log, never hard-coded. */
export function logSummary(entries: readonly CallLogEntry[]): string {
  const total = entries.length;
  const answered = entries.filter((e) => Boolean(e.duration)).length;
  return `${total} ${total === 1 ? "call" : "calls"} today. ${answered} answered.`;
}

function Row({ group, name }: { group: LogGroup; name: string }) {
  const { entry, count } = group;
  const red = isRed(entry.kind);
  const right = entry.duration || entry.time;

  return (
    <li
      style={{
        listStyle: "none",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        minHeight: 64,
        padding: "12px 0",
        borderBottom: `1px solid ${LIGHT.rule}`,
        minWidth: 0,
      }}
    >
      <span style={{ flex: "none", marginTop: 2 }}>
        <CallDirectionGlyph kind={entry.kind} size={20} color={red ? LIGHT.danger : LIGHT.sub} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.3,
            color: red ? LIGHT.danger : LIGHT.ink,
            overflowWrap: "anywhere",
          }}
        >
          {name}
          {count > 1 ? (
            <span style={{ fontWeight: 500, color: red ? LIGHT.danger : LIGHT.sub }}> ({count})</span>
          ) : null}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: LIGHT.sub, lineHeight: 1.4 }}>
          {KIND_LABEL[entry.kind]}
          {entry.ago ? ` · ${entry.ago}` : entry.time ? ` · ${entry.time}` : ""}
        </p>
        {entry.note ? (
          <p style={{ margin: "5px 0 0", fontSize: 12.5, lineHeight: 1.5, color: LIGHT.sub, opacity: 0.86 }}>
            {entry.note}
          </p>
        ) : null}
      </div>

      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
        <span style={{ fontSize: 12.5, color: LIGHT.sub, whiteSpace: "nowrap" }}>{right}</span>
        <InfoGlyph size={18} color="#B6BDC4" />
      </div>
    </li>
  );
}

export default function CallLogScreen({ data, tags, contribLink, onTagHer, onSaveCard }: CallLogScreenProps) {
  const groups = groupLog(data.callLog);
  const top = heroTag(tags);

  const quietButton: React.CSSProperties = {
    minHeight: TAP,
    padding: "0 16px",
    borderRadius: 12,
    border: `1px solid ${LIGHT.rule}`,
    background: LIGHT.paper,
    color: LIGHT.ink,
    fontFamily: FONT,
    fontSize: 14.5,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    textDecoration: "none",
    touchAction: "manipulation",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: LIGHT.paper,
        color: LIGHT.ink,
        fontFamily: FONT,
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>Recents</h2>

      {/* Decorative. Not a control — there is nothing here to search. */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          height: 40,
          padding: "0 12px",
          borderRadius: 12,
          background: LIGHT.chip,
          color: "#98A0A8",
          fontSize: 14.5,
        }}
      >
        <SearchGlyph size={17} color="#98A0A8" />
        Search
      </div>

      {/* ── Her contact card ─────────────────────────────────────────────── */}
      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 18,
          padding: 14,
          borderRadius: 16,
          background: LIGHT.chip,
          minWidth: 0,
        }}
      >
        <Avatar name={data.caller.name} src={data.caller.photoUrl} size={56} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.25, overflowWrap: "anywhere" }}>
            {data.caller.name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: LIGHT.sub }}>{data.caller.number}</p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              lineHeight: 1.45,
              color: LIGHT.sub,
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              overflowWrap: "anywhere",
            }}
          >
            <span style={{ flex: "none", marginTop: 1 }}>
              <TagGlyph size={15} color={LIGHT.accent} />
            </span>
            {top ? (
              <span>
                <span style={{ color: LIGHT.accent, fontWeight: 600 }}>&ldquo;{top.label}&rdquo;</span>
                {" · "}
                {top.count.toLocaleString("en-IN")} {top.count === 1 ? "person" : "people"}
              </span>
            ) : (
              <span>Not yet tagged. Be the first.</span>
            )}
          </p>
        </div>
      </section>

      {/* ── The log ──────────────────────────────────────────────────────── */}
      {groups.length > 0 ? (
        <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
          {groups.map((group, i) => (
            <Row key={`${group.entry.kind}-${group.entry.time}-${i}`} group={group} name={data.caller.name} />
          ))}
        </ul>
      ) : null}

      <p
        style={{
          margin: "16px 0 0",
          padding: "12px 14px",
          borderRadius: 12,
          background: LIGHT.chip,
          fontSize: 13.5,
          fontWeight: 600,
          color: LIGHT.sub,
          textAlign: "center",
        }}
      >
        {logSummary(data.callLog)}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {contribLink && onTagHer ? (
          <button type="button" onClick={onTagHer} style={{ ...quietButton, borderColor: LIGHT.accent, color: LIGHT.accent }}>
            <TagGlyph size={17} color={LIGHT.accent} />
            Tag her
          </button>
        ) : (
          // Without the write token there is no tag link to hand out — that
          // token is deliberately absent from the recipient's read. The slot
          // becomes the growth loop's other door instead of a dead button.
          <Link href="/templates" style={{ ...quietButton, borderColor: LIGHT.accent, color: LIGHT.accent }}>
            <TagGlyph size={17} color={LIGHT.accent} />
            Make one for someone
          </Link>
        )}

        <button type="button" onClick={onSaveCard} style={quietButton}>
          <DownloadGlyph size={17} color={LIGHT.ink} />
          Save the call screen
        </button>
      </div>
    </div>
  );
}
