// ─── Header controls shared by the home page and the results page ──────────────
//
// The apps grid, the account avatar with its multicolour ring, and the two
// popovers they open. The apps are the page's own sections in disguise.

import { useEffect, useRef, type ReactNode } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { AppsIcon } from "./icons";
import { firstNameOf, initialCircle, type LovePhoto, type Tab } from "./types";

export function Avatar({ name, photo, size = 32 }: { name: string; photo?: LovePhoto; size?: number }) {
  const ic = initialCircle(name || "?");
  return (
    <span className="srAvatar" style={{ width: size, height: size }}>
      <span className="srAvatarIn" style={{ background: ic.bg }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="" draggable={false} style={cropStyle(photoCrop(photo))} />
        ) : (
          ic.initial
        )}
      </span>
    </span>
  );
}

/** Closes on outside click and Escape. */
function Pop({ onClose, className, children, label }: { onClose: () => void; className: string; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const id = window.setTimeout(() => document.addEventListener("pointerdown", down), 0);
    document.addEventListener("keydown", key);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);
  return (
    <div ref={ref} className={`srPop ${className}`} role="dialog" aria-label={label}>
      {children}
    </div>
  );
}

const APPS: { label: string; emoji: string; bg: string; tab?: Tab; action?: "letter" | "dark" }[] = [
  { label: "Search", emoji: "🔍", bg: "#E8F0FE", tab: "all" },
  { label: "Memories", emoji: "📸", bg: "#FDE7EC", tab: "images" },
  { label: "Places", emoji: "📍", bg: "#E6F4EA", tab: "maps" },
  { label: "News", emoji: "📰", bg: "#FEF7E0", tab: "news" },
  { label: "Videos", emoji: "🎬", bg: "#FCE8E6", tab: "videos" },
  { label: "AI Mode", emoji: "✨", bg: "#F3E8FD", tab: "ai" },
  { label: "Letter", emoji: "💌", bg: "#FDE7EC", action: "letter" },
  { label: "Shopping", emoji: "🛍️", bg: "#E8F0FE", tab: "shopping" },
  { label: "Dark mode", emoji: "🌙", bg: "#E8EAED", action: "dark" },
];

export function AppsButton({
  open,
  setOpen,
  onTab,
  onLetter,
  onDark,
  hasLetter,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onTab: (t: Tab) => void;
  onLetter: () => void;
  onDark: () => void;
  hasLetter: boolean;
}) {
  return (
    <span className="srPopWrap">
      <button type="button" className="srIconBtn" aria-label="Apps" aria-expanded={open} onClick={() => setOpen(!open)}>
        <AppsIcon size={24} />
      </button>
      {open && (
        <Pop onClose={() => setOpen(false)} className="srApps" label="Apps">
          <div className="srAppsGrid">
            {APPS.filter((a) => a.action !== "letter" || hasLetter).map((a) => (
              <button
                key={a.label}
                type="button"
                className="srApp"
                onClick={() => {
                  setOpen(false);
                  if (a.tab) onTab(a.tab);
                  else if (a.action === "letter") onLetter();
                  else onDark();
                }}
              >
                <span className="srAppIc" style={{ background: a.bg }}>{a.emoji}</span>
                <span className="srAppTx">{a.label}</span>
              </button>
            ))}
          </div>
          <p className="srAppsFoot">more apps coming when we get a dog</p>
        </Pop>
      )}
    </span>
  );
}

export function AccountButton({
  open,
  setOpen,
  name,
  sender,
  photo,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  name: string;
  sender: string;
  photo?: LovePhoto;
}) {
  const first = firstNameOf(name) || "you";
  const handle = first.toLowerCase().replace(/[^a-z0-9]/g, "") || "you";
  return (
    <span className="srPopWrap">
      <button type="button" className="srAvatarBtn" aria-label={`Heart Account: ${first}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Avatar name={name} photo={photo} />
      </button>
      {open && (
        <Pop onClose={() => setOpen(false)} className="srAcct" label="Account">
          <p className="srAcctMail">{handle}@forever.love</p>
          <Avatar name={name} photo={photo} size={76} />
          <p className="srAcctHi">Hi, {first}! 💗</p>
          <button type="button" className="srAcctBtn" onClick={() => setOpen(false)}>
            Manage your Heart Account
          </button>
          <p className="srAcctNote">
            Storage: <b>100% full</b> of you{sender ? ` · managed by ${firstNameOf(sender)}` : ""}
          </p>
          <div className="srAcctBar" aria-hidden>
            <i />
          </div>
        </Pop>
      )}
    </span>
  );
}
