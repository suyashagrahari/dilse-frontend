"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";

import { isMuted, setMuted } from "@/lib/webAudio";
import { ACCENT, TAP, TEXT_DIM, Z } from "./theme";

export interface MuteToggleProps {
  /** Pixels from the right edge, so it clears the brand badge in live mode. */
  offsetRight: number;
  onFirstGesture: () => void;
}

/** #RRGGBB → rgba(), so the accent is never hardcoded as a literal anywhere. */
const rgba = (hex: string, a: number): string => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// ─── A React mirror of the audio bus's mute flag ─────────────────────────────
//
// `isMuted()` is module state inside `@/lib/webAudio` — it is an external
// store, so it is read through `useSyncExternalStore` rather than copied into
// `useState` inside an effect. That gets hydration right for free: the server
// snapshot is always `true` (muted is how the bus ships, and a fresh import
// per request could not be anything else), React hydrates against that, then
// re-checks the live value once it is on the client.
//
// `@/lib/webAudio` publishes no change notifications, so this file owns the
// subscription and the toggle below is the only thing that ever fires it.
const listeners = new Set<() => void>();
const subscribeToMute = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const emitMuteChanged = (): void => {
  for (const cb of listeners) cb();
};
/** Muted is the shipped default, on the server and in the module alike. */
const mutedOnServer = (): boolean => true;

/**
 * The unmute control.
 *
 * Audio ships MUTED and that is deliberate — nothing makes a sound until
 * somebody asks for one. So this control's job is almost always to turn sound
 * ON, and it is the only thing in the template that advertises there is any.
 *
 * Two details that matter:
 *
 *   1. `isMuted()` is module state, not React state — see the store above. It
 *      is mirrored, never read raw during render, so the server and the first
 *      client paint always agree.
 *
 *   2. Unmuting is itself a valid first gesture, so it must unlock the
 *      AudioContext. `onFirstGesture()` runs before `setMuted(false)`; a
 *      context that is never created inside a real gesture handler stays
 *      suspended forever and every voice silently no-ops.
 */
export default function MuteToggle({ offsetRight, onFirstGesture }: MuteToggleProps) {
  const muted = useSyncExternalStore(subscribeToMute, isMuted, mutedOnServer);

  const toggle = useCallback(() => {
    // onFirstGesture FIRST: unmuting is a real gesture and must be the thing
    // that unlocks the context, or every voice stays a silent no-op.
    onFirstGesture();
    setMuted(!isMuted());
    emitMuteChanged();
  }, [onFirstGesture]);

  const on = !muted;
  const Icon = on ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      aria-pressed={on}
      style={{
        position: "fixed",
        top: "calc(10px + env(safe-area-inset-top, 0px))",
        right: offsetRight,
        zIndex: Z.chrome,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: TAP,
        height: TAP,
        minWidth: TAP,
        minHeight: TAP,
        padding: 0,
        borderRadius: 999,
        background: on ? rgba(ACCENT, 0.14) : "rgba(22,22,22,0.72)",
        border: `1px solid ${on ? rgba(ACCENT, 0.42) : "rgba(255,255,255,0.1)"}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: on ? ACCENT : TEXT_DIM,
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        transition: "color 180ms ease, background 180ms ease, border-color 180ms ease",
      }}
    >
      <Icon size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
