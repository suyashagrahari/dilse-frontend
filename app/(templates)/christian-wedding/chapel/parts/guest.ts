"use client";

// ─── The personal greeting (?to=Name) and the page's own links ──────────────
//
// A family sends each guest their own link: …/abc123?to=Sharma%20family. The
// gate then reads "Dear Sharma family," and the RSVP starts with that name.
// The name is read on the client only (the experience is ssr:false, so the
// first render already knows it), trimmed to 40 characters, stripped of
// control characters and angle brackets, and only ever rendered as text.
//
// Copied from garden-wedding-invitation/components/gw/guest.ts (the spec lifts
// these into _wedding/ once; until then each design keeps its own copy).

import { useState } from "react";

export const GUEST_PARAM = "to";

export function cleanGuestName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f<>{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

export function readGuestName(): string {
  if (typeof window === "undefined") return "";
  try {
    return cleanGuestName(new URLSearchParams(window.location.search).get(GUEST_PARAM) ?? "");
  } catch {
    return "";
  }
}

/** The guest's name from ?to=, "" when there is none. */
export function useGuestName(): string {
  const [name] = useState(readGuestName);
  return name;
}

/**
 * This page's URL to pass on: no #hash, and no ?to= (a guest forwarding the
 * invitation must not forward their own greeting).
 */
export function shareableUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const u = new URL(window.location.href);
    u.hash = "";
    u.searchParams.delete(GUEST_PARAM);
    return u.toString();
  } catch {
    return window.location.href.split("#")[0];
  }
}

/** base + ?to=<name> (the studio's "personal link" maker). */
export function personalUrl(base: string, name: string): string {
  const n = cleanGuestName(name);
  try {
    const u = new URL(base);
    if (n) u.searchParams.set(GUEST_PARAM, n);
    else u.searchParams.delete(GUEST_PARAM);
    return u.toString();
  } catch {
    return base;
  }
}

export const whatsappUrl = (text: string, phone = "") => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Fill a React-controlled input that we do not own (the kit's RSVP name) the
 * way a user would: the native value setter + an `input` event, so React's
 * onChange runs and its state stays the source of truth. Only when empty.
 */
export function prefillInput(input: HTMLInputElement | null, value: string): boolean {
  if (!input || !value || input.value) return false;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (!setter) return false;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}
