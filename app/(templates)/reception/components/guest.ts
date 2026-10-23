"use client";

// ─── The personal greeting: ?to=Sharma%20family ─────────────────────────────
// Read on the client after mount (no SSR mismatch), trimmed to 40 characters,
// rendered as plain text only. The editor's "Personal link" box writes it.

import { useEffect, useState } from "react";

export const GUEST_PARAM = "to";
const MAX = 40;

export function cleanGuestName(raw: string | null | undefined): string {
  return (raw ?? "")
    // Control characters and anything that reads like markup are dropped.
    .replace(/[\u0000-\u001f\u007f<>{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX);
}

export function useGuestName(): string {
  const [name, setName] = useState("");
  useEffect(() => {
    try {
      const v = cleanGuestName(new URLSearchParams(window.location.search).get(GUEST_PARAM));
      // A one-time read of the URL after mount; the page never changes it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v) setName(v);
    } catch {
      /* no URL, no greeting */
    }
  }, []);
  return name;
}

/** The page URL with ?to=<name> (any old ?to= replaced), or without it for "". */
export function personalLink(base: string, name: string): string {
  try {
    const u = new URL(base);
    u.hash = "";
    const n = cleanGuestName(name);
    if (n) u.searchParams.set(GUEST_PARAM, n);
    else u.searchParams.delete(GUEST_PARAM);
    return u.toString();
  } catch {
    return base;
  }
}

/**
 * Put the guest's name into the kit RSVP's empty name field. RSVPBlock has no
 * default-name prop yet, so set the controlled input the way a user would
 * (native setter + an input event), only while it is still empty.
 */
export function prefillRsvpName(root: HTMLElement | null, name: string) {
  if (!root || !name) return;
  const input = root.querySelector<HTMLInputElement>('input[autocomplete="name"]');
  if (!input || input.value) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, name);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
