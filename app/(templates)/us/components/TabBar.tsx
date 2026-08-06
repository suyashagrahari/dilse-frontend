"use client";

// ─── Us — the tab bar ────────────────────────────────────────────────────────
//
// Three icons in equal thirds, a hairline above the row, and — the detail that
// matters — the active tab's 1px black underline sits FLUSH with the bottom
// edge of the row, not floating above it and not doubled up with a border. It
// is one pixel of black at `bottom: 0`, and it is the only thing telling you
// which tab you are on.

import { ClipsTabIcon, GridTabIcon, TaggedTabIcon } from "./icons";
import { PALETTE, TAP_TARGET_PX, type ProfileTab } from "./types";

const TABS: { id: ProfileTab; label: string; Icon: typeof GridTabIcon }[] = [
  { id: "grid", label: "Posts", Icon: GridTabIcon },
  { id: "clips", label: "Videos", Icon: ClipsTabIcon },
  { id: "tagged", label: "Tagged", Icon: TaggedTabIcon },
];

export interface TabBarProps {
  active: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}

export default function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      style={{
        display: "flex",
        borderTop: `1px solid ${PALETTE.border}`,
        marginTop: 4,
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={label}
            className="us-tap"
            onClick={() => onSelect(id)}
            style={{
              position: "relative",
              flex: 1,
              height: TAP_TARGET_PX,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon size={24} color={on ? PALETTE.ink : PALETTE.greyIcon} />
            {on ? (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 1,
                  background: PALETTE.ink,
                }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
