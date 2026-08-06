"use client";

// ─── Us — the bottom navigation ──────────────────────────────────────────────
//
// 49px, fixed, a hairline above it, five evenly-spaced targets. Only the avatar
// is active — this account has one screen and everything else in the app is a
// lie, which is what `COPY.nothingElse` says when you tap the other four.
//
// The active avatar gets a 1px ring. That ring is the only state in the row.

import Photo from "./Photo";
import { HeartIcon, HomeIcon, PlusSquareIcon, SearchIcon } from "./icons";
import { METRICS, PALETTE } from "./types";

export interface BottomNavProps {
  avatarUrl: string;
  onNothing: () => void;
}

export default function BottomNav({ avatarUrl, onNothing }: BottomNavProps) {
  const item = {
    flex: 1,
    alignSelf: "stretch" as const,
    display: "grid" as const,
    placeItems: "center" as const,
  };

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        margin: "0 auto",
        maxWidth: METRICS.desktopColumn,
        // 49 INCLUDING the hairline, which is how the row measures in the thing
        // it is imitating. border-box, or the border makes it 50.
        boxSizing: "border-box",
        // Grows by exactly the home-indicator inset and not a pixel more.
        height: `calc(${METRICS.bottomNavH}px + env(safe-area-inset-bottom, 0px))`,
        display: "flex",
        alignItems: "center",
        background: PALETTE.bg,
        borderTop: `1px solid ${PALETTE.border}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <button type="button" className="us-tap" aria-label="Home" onClick={onNothing} style={item}>
        <HomeIcon size={24} color={PALETTE.ink} />
      </button>
      <button type="button" className="us-tap" aria-label="Search" onClick={onNothing} style={item}>
        <SearchIcon size={24} color={PALETTE.ink} />
      </button>
      <button type="button" className="us-tap" aria-label="Create" onClick={onNothing} style={item}>
        <PlusSquareIcon size={24} color={PALETTE.ink} />
      </button>
      <button type="button" className="us-tap" aria-label="Activity" onClick={onNothing} style={item}>
        <HeartIcon size={24} color={PALETTE.ink} />
      </button>
      <button
        type="button"
        className="us-tap"
        aria-label="Profile"
        aria-current="page"
        onClick={onNothing}
        style={item}
      >
        <div
          style={{
            boxSizing: "border-box",
            position: "relative",
            width: 26,
            height: 26,
            borderRadius: "50%",
            overflow: "hidden",
            // The one piece of state in the row.
            border: `1px solid ${PALETTE.ink}`,
            background: PALETTE.button,
          }}
        >
          <Photo src={avatarUrl} alt="" sizes="26px" glyphSize={12} />
        </div>
      </button>
    </nav>
  );
}
