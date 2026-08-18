"use client";

// ─── Us — the profile header ─────────────────────────────────────────────────
//
// The 86px avatar with the three stats spread across the rest of the row is the
// most recognisable single arrangement in the genre, and it is entirely a
// matter of measurement: 86, 18/13, 16px of side padding, a 32px button row
// with 8px gaps. Get those and it reads instantly; miss them by two pixels each
// and it reads as a knock-off without anyone being able to say why.
//
// The joke lives in the button row. "Following" is pre-pressed — you already
// follow this relationship, you have no choice about it — and the unfollow
// sheet exists purely to refuse you.

import { useState } from "react";
import Photo from "./Photo";
import { PersonPlusIcon, SmallChevronDown } from "./icons";
import { useTransient } from "./hooks";
import { anim } from "./styles";
import {
  COPY,
  METRICS,
  PALETTE,
  formatStat,
  followedByLine,
  type ProfileData,
} from "./types";

/** How long "no." stays up before the sheet dismisses itself. */
const REFUSAL_MS = 1200;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 18, fontWeight: 600, lineHeight: "22px", color: PALETTE.ink }}>
        {formatStat(value)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 400, lineHeight: "17px", color: PALETTE.ink }}>
        {label}
      </div>
    </div>
  );
}

function RowButton({
  children,
  onClick,
  flex,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  flex?: number;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="us-tap"
      aria-label={label}
      onClick={onClick}
      style={{
        flex: flex ?? undefined,
        width: flex ? undefined : METRICS.buttonRowH,
        height: METRICS.buttonRowH,
        borderRadius: METRICS.buttonRadius,
        background: PALETTE.button,
        color: PALETTE.ink,
        fontSize: 14,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        minWidth: 0,
      }}
    >
      {children}
    </button>
  );
}

export interface ProfileHeaderProps {
  data: ProfileData;
  reduced: boolean;
  /** Suppresses the interactive sheet inside the exported card. */
  still?: boolean;
}

export default function ProfileHeader({ data, reduced, still = false }: ProfileHeaderProps) {
  const [sheet, setSheet] = useState<"closed" | "open" | "refusing">("closed");
  const [refusing, fireRefusal] = useTransient(REFUSAL_MS);

  // Derived, not stored: when the refusal times out the sheet disappears with
  // it. No effect, no second timer, nothing to get out of sync.
  const sheetUp = !still && (sheet === "open" || (sheet === "refusing" && refusing));

  const followed = followedByLine(data.followedBy);

  return (
    <section style={{ padding: `12px ${METRICS.pagePad}px 0` }}>
      {/* ── Avatar + the three numbers ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: METRICS.avatar,
            height: METRICS.avatar,
            borderRadius: "50%",
            overflow: "hidden",
            border: `1px solid ${PALETTE.border}`,
            flexShrink: 0,
            background: PALETTE.button,
          }}
        >
          <Photo src={data.avatarUrl} alt="" sizes="86px" glyphSize={28} priority />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            paddingLeft: 8,
          }}
        >
          <Stat value={data.stats.posts} label="posts" />
          <Stat value={data.stats.followers} label="followers" />
          <Stat value={data.stats.following} label="following" />
        </div>
      </div>

      {/*
        ── Name, category, bio, link, social proof ──────────────────────────
        ONE TIGHT TEXT BLOCK. No gap between the lines — they stack on
        consecutive 18px baselines, which is what the thing being imitated
        actually does. An 8px gap between each is roughly 30px of extra height
        across the block and it reads visibly airier; the 8px belongs only
        around the outside, against the avatar row above and the buttons below.
      */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: "18px", color: PALETTE.ink, overflowWrap: "anywhere" }}>
          {data.displayName}
        </div>

        {data.category ? (
          <div style={{ fontSize: 14, lineHeight: "18px", color: PALETTE.grey, overflowWrap: "anywhere" }}>
            {data.category}
          </div>
        ) : null}

        {data.bio.map((line, i) => (
          <div
            key={`${i}-${line}`}
            style={{ fontSize: 14, fontWeight: 400, lineHeight: "18px", color: PALETTE.ink, overflowWrap: "anywhere" }}
          >
            {line}
          </div>
        ))}

        {data.link ? (
          <a
            href={data.link.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "18px",
              color: PALETTE.linkBlue,
              textDecoration: "none",
              overflowWrap: "anywhere",
            }}
          >
            {data.link.label}
          </a>
        ) : null}

        {/*
          `joiner` is interleaved BETWEEN the named handles, never appended:
          two handles join with " and ", three or more with ", " and the
          count arrives in `suffix`. One handle has an empty joiner, so the
          same loop covers every case without a special path.
        */}
        {followed.named.length > 0 ? (
          <div style={{ fontSize: 12, lineHeight: "16px", color: PALETTE.grey, overflowWrap: "anywhere" }}>
            Followed by{" "}
            {followed.named.map((h, i) => (
              <span key={h}>
                {i > 0 ? followed.joiner : ""}
                <span style={{ fontWeight: 600, color: PALETTE.grey }}>{h}</span>
              </span>
            ))}
            {followed.suffix}
          </div>
        ) : null}
      </div>

      {/* ── The button row. "Following" is already pressed. ────────────── */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <RowButton flex={1} onClick={() => setSheet("open")}>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {COPY.following}
          </span>
          <SmallChevronDown size={11} color={PALETTE.ink} />
        </RowButton>
        <RowButton flex={1} onClick={() => setSheet("open")}>
          {COPY.message}
        </RowButton>
        <RowButton onClick={() => setSheet("open")} label="Suggest people to follow">
          <PersonPlusIcon size={19} color={PALETTE.ink} />
        </RowButton>
      </div>

      {/* ── The refusal ─────────────────────────────────────────────────── */}
      {sheetUp ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            animation: anim(reduced, "us-fade-in", 160),
          }}
          onClick={() => setSheet("closed")}
        >
          <div
            role="dialog"
            aria-label={COPY.following}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: METRICS.desktopColumn,
              background: PALETTE.bg,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
              animation: anim(reduced, "us-sheet-up", 220, "cubic-bezier(0.16,1,0.3,1)"),
            }}
          >
            <div style={{ display: "grid", placeItems: "center", padding: "10px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: PALETTE.border }} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px 6px",
                borderBottom: `1px solid ${PALETTE.border}`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `1px solid ${PALETTE.border}`,
                  flexShrink: 0,
                }}
              >
                <Photo src={data.avatarUrl} alt="" sizes="44px" glyphSize={18} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, minWidth: 0, overflowWrap: "anywhere" }}>
                {data.handle}
              </div>
            </div>

            {sheet === "refusing" ? (
              <div
                style={{
                  padding: "26px 16px 30px",
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 600,
                  color: PALETTE.ink,
                  animation: anim(reduced, "us-fade-in", 140),
                }}
              >
                {COPY.refuseUnfollow}
              </div>
            ) : (
              <button
                type="button"
                className="us-tap"
                onClick={() => {
                  setSheet("refusing");
                  fireRefusal();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "18px 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: PALETTE.likeRed,
                }}
              >
                {COPY.unfollow}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
