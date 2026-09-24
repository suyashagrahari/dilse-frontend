"use client";

import { useState, type ReactNode } from "react";
import { Link2, Check } from "lucide-react";
import { SOCIAL, SOCIAL_LINK_ATTRS } from "@/lib/social";

// Share THIS article. Not the brand's own profiles — those are FollowUs /
// components/SocialIcons. Every link opens the network's share composer in a
// new tab with the article's title and URL filled in.

/** The X handle, read off the profile URL so it can never disagree with lib/social.ts. */
const X_HANDLE = SOCIAL.twitter.split("/").pop() ?? "";

const GLYPH: Record<string, ReactNode> = {
  WhatsApp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.17-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.07.9.9-3-.2-.31a8.2 8.2 0 1 1 6.85 3.73Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22a7.4 7.4 0 0 1-1.37-1.7c-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04c0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7.58.25 1.04.4 1.4.52.59.18 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.18.21-.57.21-1.07.15-1.17-.06-.1-.23-.17-.47-.29Z" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 4H21l-6.9 7.9L21.6 20h-4.5l-4.5-5.9L7 20H4.9l7.2-8.2L4 4h4.6l4.2 5.5L18.9 4Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.93h-4v-5.26c0-1.25-.02-2.87-1.75-2.87-1.75 0-2.02 1.37-2.02 2.78v5.35h-4v-11Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.52l.38-2.93H13.5V8.7c0-.85.24-1.43 1.45-1.43h1.55V4.65a20.6 20.6 0 0 0-2.26-.12c-2.24 0-3.77 1.37-3.77 3.88v2.16H7.94v2.93h2.53V21h3.03Z" />
    </svg>
  ),
};

const PILL = { background: "rgba(61,12,17,0.06)", color: "#3d0c11", border: "1px solid rgba(61,12,17,0.12)" } as const;

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}${X_HANDLE ? `&via=${enc(X_HANDLE)}` : ""}`,
    },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(42,10,14,0.7)" }}>
        Share
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          {...SOCIAL_LINK_ATTRS}
          aria-label={`Share on ${l.label === "X" ? "X (Twitter)" : l.label} (opens in a new tab)`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:!bg-[#3d0c11] hover:!text-[#f5ede6] [&>svg]:h-[14px] [&>svg]:w-[14px]"
          style={PILL}
        >
          {GLYPH[l.label]}
          {/* "X" beside the X logo read as "X X". */}
          {l.label === "X" ? "X (Twitter)" : l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:!bg-[#3d0c11] hover:!text-[#f5ede6]"
        style={PILL}
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
