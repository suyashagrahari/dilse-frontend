"use client";

// App chrome: the phone top bar + bottom tab bar, and the web left rail.

import Pic from "./Pic";
import {
  ChevronDown,
  ClipsIcon,
  CoupleBadge,
  ExploreIcon,
  HeartIcon,
  HomeIcon,
  LockIcon,
  MenuIcon,
  MessagesIcon,
  PlusSquareIcon,
  SearchIcon,
} from "./icons";
import { PALETTE, WORDMARK, type Crop } from "./types";

export type NavKind = "home" | "search" | "explore" | "clips" | "messages" | "notifications" | "create" | "profile" | "more" | "switch";

export function MobileTopBar({ handle, onNav }: { handle: string; onNav: (k: NavKind) => void }) {
  return (
    <header className="us-mtop">
      <button type="button" onClick={() => onNav("switch")} aria-label="Switch accounts" style={{ minWidth: 0 }}>
        <span className="us-mtop-h">
          <LockIcon size={15} />
          <span>{handle}</span>
          <CoupleBadge size={15} />
          <ChevronDown size={13} strokeWidth={2.6} />
          <i className="us-dot" style={{ marginLeft: 2 }} />
        </span>
      </button>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button type="button" className="us-ico" onClick={() => onNav("create")} aria-label="Create">
          <PlusSquareIcon size={25} />
        </button>
        <button type="button" className="us-ico" onClick={() => onNav("more")} aria-label="Menu">
          <MenuIcon size={25} />
        </button>
      </div>
    </header>
  );
}

export function BottomNav({ avatarUrl, avatarCrop, onNav }: { avatarUrl: string; avatarCrop?: Crop; onNav: (k: NavKind) => void }) {
  return (
    <nav className="us-bnav" aria-label="App">
      <button type="button" className="us-ico" onClick={() => onNav("home")} aria-label="Home">
        <HomeIcon size={25} />
      </button>
      <button type="button" className="us-ico" onClick={() => onNav("search")} aria-label="Search">
        <SearchIcon size={25} />
      </button>
      <button type="button" className="us-ico" onClick={() => onNav("create")} aria-label="Create">
        <PlusSquareIcon size={25} />
      </button>
      <button type="button" className="us-ico" onClick={() => onNav("clips")} aria-label="Clips">
        <ClipsIcon size={25} />
      </button>
      <button type="button" className="us-ico" onClick={() => onNav("profile")} aria-label="Profile" aria-current="page">
        <span style={{ width: 28, height: 28, borderRadius: "50%", padding: 1.5, border: `2px solid ${PALETTE.ink}`, display: "block" }}>
          <Pic src={avatarUrl} crop={avatarCrop} style={{ width: "100%", height: "100%", borderRadius: "50%" }} eager />
        </span>
      </button>
    </nav>
  );
}

export function Rail({ avatarUrl, avatarCrop, onNav, unread }: { avatarUrl: string; avatarCrop?: Crop; onNav: (k: NavKind) => void; unread: boolean }) {
  const items: { k: NavKind; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    { k: "home", label: "Home", icon: <HomeIcon size={24} /> },
    { k: "search", label: "Search", icon: <SearchIcon size={24} /> },
    { k: "explore", label: "Explore", icon: <ExploreIcon size={24} /> },
    { k: "clips", label: "Clips", icon: <ClipsIcon size={24} /> },
    { k: "messages", label: "Messages", icon: <MessagesIcon size={24} />, badge: unread ? <span className="us-rail-badge">1</span> : null },
    {
      k: "notifications",
      label: "Notifications",
      icon: <HeartIcon size={24} />,
      badge: <span className="us-dot" style={{ position: "absolute", left: 30, top: 10 }} />,
    },
    { k: "create", label: "Create", icon: <PlusSquareIcon size={24} /> },
  ];
  return (
    <aside className="us-rail" aria-label="Navigation">
      <div className="us-rail-mark">
        <span className="us-rail-word" aria-label="us.">
          {WORDMARK}
        </span>
        <span className="us-rail-glyph" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="2.5" y="2.5" width="19" height="19" rx="6" stroke="#000" strokeWidth="2" />
            <path d="M12 16.5s-4.5-2.7-4.5-5.8a2.5 2.5 0 0 1 4.5-1.5 2.5 2.5 0 0 1 4.5 1.5c0 3.1-4.5 5.8-4.5 5.8z" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <nav className="us-rail-nav">
        {items.map((it) => (
          <button key={it.k} type="button" className="us-rail-item" onClick={() => onNav(it.k)} title={it.label}>
            {it.icon}
            {it.badge}
            <em>{it.label}</em>
          </button>
        ))}
        <button type="button" className="us-rail-item is-on" onClick={() => onNav("profile")} title="Profile" aria-current="page">
          <span className="us-rail-av">
            <Pic src={avatarUrl} crop={avatarCrop} style={{ width: "100%", height: "100%" }} eager />
          </span>
          <em>Profile</em>
        </button>
      </nav>
      <button type="button" className="us-rail-item" onClick={() => onNav("more")} title="More">
        <MenuIcon size={24} />
        <em>More</em>
      </button>
    </aside>
  );
}
