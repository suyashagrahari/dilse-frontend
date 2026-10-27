"use client";

// ─── Personal links (?to=Name) ───────────────────────────────────────────────
// useGuestName reads ?to= after mount (no SSR mismatch), trims it to 40
// characters and only ever renders it as text. personalUrl builds those links
// (the studio's "Send personal invites").

import { useEffect, useState } from "react";

const clean = (v: string) =>
  v
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

/** The guest's name from `?to=` (empty when absent). */
export function useGuestName(): string {
  const [name, setName] = useState("");
  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("to") ?? "";
      // A deferred set: the first render matches the server (no ?to= there).
      const t = window.setTimeout(() => setName(clean(v)), 0);
      return () => window.clearTimeout(t);
    } catch {
      return undefined;
    }
  }, []);
  return name;
}

/** The page link addressed to one guest. */
export function personalUrl(base: string, name: string): string {
  try {
    const u = new URL(base);
    const n = clean(name);
    if (n) u.searchParams.set("to", n);
    else u.searchParams.delete("to");
    return u.toString();
  } catch {
    return base;
  }
}

/**
 * Pre-fill the RSVP's name box with the guest's name, once, if it is still
 * empty. The kit's RSVPBlock is a controlled input with no default-name prop,
 * so this goes through the native value setter + an input event (React picks it up).
 */
export function prefillRsvpName(root: HTMLElement | null, name: string) {
  if (!root || !name) return;
  const input = root.querySelector<HTMLInputElement>('input[autocomplete="name"]');
  if (!input || input.value) return;
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  set?.call(input, name);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
