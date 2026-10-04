"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HeartCrack, Home, Sparkles } from "lucide-react";
import { BRAND as C } from "@/lib/brand";
import { ROOT_DOMAIN } from "@/lib/config";

/**
 * A subdomain share link that does not resolve: the name before the domain is
 * misspelt, belongs to nobody, or belongs to someone other than the page's
 * creator. The page id alone would find the page, but opening it under the
 * wrong name would make a typo look like a working link, so we say what is
 * wrong instead — and show the name we were given so the mistake is visible.
 */

const noop = () => () => {};
const readHost = () => window.location.hostname.toLowerCase();

export default function WrongShareLink() {
  const host = useSyncExternalStore(noop, readHost, () => "");
  const suffix = ROOT_DOMAIN ? `.${ROOT_DOMAIN}` : "";
  const name = suffix && host.endsWith(suffix) ? host.slice(0, -suffix.length) : "";

  return (
    <main className="wsl">
      <div className="wsl-card">
        <div className="wsl-ico" aria-hidden><HeartCrack size={30} /></div>
        <h1 className="wsl-t">This link doesn&apos;t look right</h1>
        {name ? (
          <p className="wsl-host" aria-label={`${name}${suffix}`}>
            <span className="wsl-name">{name}</span>{suffix}
          </p>
        ) : null}
        <p className="wsl-p">
          We couldn&apos;t find this page under {name ? "this name" : "this link"}. The part before
          <strong> {suffix || ".subhsandesh.in"}</strong> has to match the link exactly as it was sent —
          check it for a spelling mistake, or ask the sender to share it again.
        </p>
        <div className="wsl-actions">
          <Link href="/" className="wsl-btn" data-v="ghost"><Home size={15} /> Home</Link>
          <Link href="/templates" className="wsl-btn"><Sparkles size={15} /> Make your own</Link>
        </div>
      </div>

      <style>{`
        .wsl{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:24px 16px;
          background:radial-gradient(120% 80% at 50% 0%,${C.bgAlt},${C.bg});color:${C.text}}
        .wsl-card{width:100%;max-width:400px;text-align:center;background:${C.surface};border:1px solid ${C.border};
          border-radius:22px;padding:30px 22px 22px;box-shadow:${C.shadowElevated};animation:wsl-in .45s cubic-bezier(.2,.9,.3,1.2) both}
        .wsl-ico{width:64px;height:64px;margin:0 auto 14px;border-radius:20px;display:grid;place-items:center;color:#fff;
          background:${C.gradient};box-shadow:0 10px 24px -8px rgba(61,12,17,.55);animation:wsl-sway 3s ease-in-out infinite}
        .wsl-t{font-family:var(--font-playfair,Georgia),serif;font-size:22px;font-weight:700;margin:0 0 10px}
        .wsl-host{display:inline-block;max-width:100%;overflow-wrap:anywhere;margin:0 0 12px;padding:6px 12px;border-radius:999px;
          font:600 13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:${C.muted};background:${C.surfaceAlt};border:1px dashed ${C.borderStrong}}
        .wsl-name{color:${C.danger};text-decoration:underline wavy rgba(161,53,64,.55);text-underline-offset:4px}
        .wsl-p{font-size:14px;line-height:1.6;color:${C.muted};margin:0 0 20px}
        .wsl-p strong{color:${C.text};font-weight:600}
        .wsl-actions{display:flex;gap:10px}
        .wsl-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:44px;border-radius:12px;
          font-size:14px;font-weight:600;text-decoration:none;color:#fff;background:${C.gradient};transition:transform .15s}
        .wsl-btn[data-v=ghost]{color:${C.accentStrong};background:${C.surfaceAlt};border:1px solid ${C.border}}
        .wsl-btn:active{transform:scale(.97)}
        @keyframes wsl-in{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes wsl-sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @media (prefers-reduced-motion:reduce){.wsl-card,.wsl-ico{animation:none}}
      `}</style>
    </main>
  );
}
