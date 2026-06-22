"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
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
      <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(42,10,14,0.55)" }}>
        Share
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{ background: "rgba(61,12,17,0.06)", color: "#3d0c11", border: "1px solid rgba(61,12,17,0.12)" }}
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
        style={{ background: "rgba(61,12,17,0.06)", color: "#3d0c11", border: "1px solid rgba(61,12,17,0.12)" }}
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
