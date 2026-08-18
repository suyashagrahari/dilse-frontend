"use client";

// ─── Us — the top bar ────────────────────────────────────────────────────────
//
// 44px, sticky, one hairline underneath it. The measurements are the whole job:
// the handle sits hard left next to the back chevron rather than centred, which
// is the single detail that separates a profile screen from every other screen
// in this genre, and it is what the eye reads first.

import { BackChevron, BellIcon, MenuIcon, SmallChevronDown } from "./icons";
import { HANDLE_TRUNCATE, METRICS, PALETTE, WORDMARK, DISPLAY } from "./types";

/** Long handles lose their tail here, and here only — elsewhere they render whole. */
export function truncateHandle(handle: string): string {
  return handle.length > HANDLE_TRUNCATE ? `${handle.slice(0, HANDLE_TRUNCATE)}…` : handle;
}

export interface TopBarProps {
  handle: string;
  onBack?: () => void;
  /** The hamburger is the one control here that does something: it opens the
   *  save-card sheet. Putting the export behind it keeps it inside the fiction
   *  instead of bolting a download button onto the layout. */
  onMenu: () => void;
  onNothing: () => void;
}

export default function TopBar({ handle, onBack, onMenu, onNothing }: TopBarProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: METRICS.topBarH,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        background: PALETTE.bg,
        borderBottom: `1px solid ${PALETTE.border}`,
      }}
    >
      {/* Our own mark, top-left. Deliberately the first thing in the bar and
          deliberately the only serif on the screen: it is what tells you, in
          the half second before you read anything else, whose app this is. */}
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: 17,
          fontWeight: 700,
          lineHeight: 1,
          color: PALETTE.ink,
          letterSpacing: "-0.03em",
          flexShrink: 0,
        }}
      >
        {WORDMARK}
      </span>

      <button
        type="button"
        className="us-tap"
        aria-label="Back"
        onClick={onBack ?? onNothing}
        style={{ width: 24, height: 24, display: "grid", placeItems: "center", flexShrink: 0 }}
      >
        <BackChevron size={24} color={PALETTE.ink} />
      </button>

      <button
        type="button"
        className="us-tap"
        onClick={onNothing}
        style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: PALETTE.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {truncateHandle(handle)}
        </span>
        <SmallChevronDown size={11} color={PALETTE.ink} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <button
          type="button"
          className="us-tap"
          aria-label="Notifications"
          onClick={onNothing}
          style={{ width: 24, height: 24, display: "grid", placeItems: "center" }}
        >
          <BellIcon size={24} color={PALETTE.ink} />
        </button>
        <button
          type="button"
          className="us-tap"
          aria-label="Menu"
          onClick={onMenu}
          style={{ width: 24, height: 24, display: "grid", placeItems: "center" }}
        >
          <MenuIcon size={24} color={PALETTE.ink} />
        </button>
      </div>
    </header>
  );
}
