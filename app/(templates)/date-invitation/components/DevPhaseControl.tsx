"use client";

// LEAD-OWNED. Do not edit; ask the lead.
//
// The lifecycle of this template spans three weeks. Without a way to jump
// between phases nobody — us, or the user evaluating it — can see six of the
// seven screens.
//
// It renders ONLY when `mode === "demo"`, and it is deliberately styled as a
// dev tool rather than as part of the invitation, so it can never be mistaken
// for product. The published recipient page never mounts it.

import type { Phase } from "./types";
import { UI } from "./dateTheme";

const PHASES: { id: Phase; label: string }[] = [
  { id: "invitation", label: "invite" },
  { id: "countdown", label: "countdown" },
  { id: "live", label: "live" },
  { id: "after", label: "after" },
  { id: "reschedule", label: "reschedule" },
  { id: "declined", label: "declined" },
  { id: "expired", label: "expired" },
];

export default function DevPhaseControl({
  phase,
  onJump,
}: {
  phase: Phase;
  onJump: (p: Phase) => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[130]"
      style={{
        background: "rgba(24,22,20,0.92)",
        backdropFilter: "blur(8px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        fontFamily: UI,
      }}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto px-2.5 py-2" style={{ scrollbarWidth: "none" }}>
        <span
          className="shrink-0 pr-1 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          demo
        </span>
        {PHASES.map((p) => {
          const on = p.id === phase;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onJump(p.id)}
              aria-pressed={on}
              className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
              style={{
                background: on ? "#fdfaf3" : "rgba(255,255,255,0.09)",
                color: on ? "#241f1b" : "rgba(255,255,255,0.66)",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
