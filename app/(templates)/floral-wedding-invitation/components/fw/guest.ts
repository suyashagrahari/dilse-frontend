"use client";

// ─── The personal greeting (?to=Name) and the share helpers ─────────────────
// `useGuestName` reads ?to= on the client after mount (no SSR mismatch), trims
// it to 40 characters and strips anything that is not a letter, a mark, a
// digit, a space or simple punctuation. It is only ever rendered as text.
// Shared links drop ?to=, so a guest who forwards the invitation does not
// greet the next person as "Dear Sharma family".

import { useSyncExternalStore } from "react";

const noop = () => () => {};

export function cleanGuestName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[^\p{L}\p{M}\p{N} .,'&()-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)
    .trim();
}

/** The guest's name from ?to= ("" when absent). Client-only; "" during SSR. */
export function useGuestName(): string {
  return useSyncExternalStore(
    noop,
    () => {
      try {
        return cleanGuestName(new URLSearchParams(window.location.search).get("to"));
      } catch {
        return "";
      }
    },
    () => "",
  );
}

/** This page's URL without the hash and without ?to= (for sharing onwards). */
export function shareableUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const u = new URL(window.location.href);
    u.hash = "";
    u.searchParams.delete("to");
    return u.toString();
  } catch {
    return window.location.href.split("#")[0];
  }
}

/** A personal link for one guest: the page URL + ?to=<name>. */
export function personalLink(base: string, name: string): string {
  const n = cleanGuestName(name);
  try {
    const u = new URL(base);
    u.hash = "";
    if (n) u.searchParams.set("to", n);
    else u.searchParams.delete("to");
    return u.toString();
  } catch {
    return base;
  }
}

export const waLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** Native share sheet where there is one (phones), WhatsApp otherwise. */
export async function shareInvite(text: string, url: string): Promise<"shared" | "whatsapp" | "cancelled"> {
  const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }) : null;
  if (nav?.share && window.matchMedia?.("(pointer: coarse)").matches) {
    try {
      await nav.share({ text, url });
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "cancelled";
    }
  }
  window.open(waLink(`${text}\n${url}`), "_blank", "noopener,noreferrer");
  return "whatsapp";
}

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
