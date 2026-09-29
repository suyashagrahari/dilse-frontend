"use client";

// ─── Endorsements — app chrome ───────────────────────────────────────────────
//
// Phone: the app's own top bar (your photo · search pill · messages) and the
// five-tab bar pinned to the bottom. Tablet and desktop: the web's global nav —
// mark, search, five labelled icons, "Me", a divider, the business grid and the
// gold premium link. Everything is clickable and answers in character.

import { useEffect, useState, type ReactNode } from "react";
import { Face } from "./ui";
import { IBell, IChat, IChevDown, IGrid, IHome, IJobs, INetwork, IPlusBox, ISearchLg, Mark } from "./Icons";

export interface Notif {
  id: string;
  who: string;
  text: ReactNode;
  ago: string;
  kind: "endorse" | "view" | "search" | "react" | "anniv";
}

export interface ChromeProps {
  name: string;
  photo?: { url?: string; x?: number; y?: number; scale?: number };
  notifCount: number;
  msgCount: number;
  searches: string[];
  onNotifs: () => void;
  onMessages: () => void;
  onToast: (t: string) => void;
}

function NavItem({ icon, label, badge, active, onClick }: { icon: ReactNode; label: ReactNode; badge?: number; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`pf-navI${active ? " is-on" : ""}`} onClick={onClick}>
      <span className="pf-navIc">
        {icon}
        {badge ? <b className="pf-badge">{badge}</b> : null}
      </span>
      <span className="pf-navL">{label}</span>
    </button>
  );
}

function Search({ searches, onToast, compact }: { searches: string[]; onToast: (t: string) => void; compact?: boolean }) {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  return (
    <div className={`pf-search${compact ? " pf-search--m" : ""}${focus ? " is-focus" : ""}`}>
      <ISearchLg size={16} className="pf-searchIc" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => window.setTimeout(() => setFocus(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onToast(q.trim() ? `0 results for "${q.trim()}". There's only one person worth finding 💙` : "Already found them 💙");
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="Search"
        aria-label="Search"
        enterKeyHint="search"
      />
      {focus && (
        <div className="pf-searchDrop" role="listbox" aria-label="Recent searches">
          <p className="pf-searchH">Recent</p>
          {searches.map((s) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ(s);
                setFocus(false);
                onToast(`Top result: you 💙`);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm3 10.3L7.2 8.6V3.5h1.6v4.2l3.1 2.2z" /></svg>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WebNav(p: ChromeProps) {
  return (
    <header className="pf-nav" role="banner">
      <div className="pf-navIn">
        <div className="pf-navLeft">
          <button type="button" className="pf-mark" aria-label="Home" onClick={() => p.onToast("Your feed: 100% them. As it should be.")}>
            <Mark size={34} />
          </button>
          <Search searches={p.searches} onToast={p.onToast} />
        </div>
        <nav className="pf-navRight" aria-label="Primary">
          <NavItem icon={<IHome />} label="Home" onClick={() => p.onToast("Feed's quiet. Everyone's busy endorsing you.")} />
          <NavItem icon={<INetwork />} label="My Network" onClick={() => p.onToast("1 connection. The only one that counts.")} />
          <NavItem icon={<IJobs />} label="Jobs" onClick={() => p.onToast("No openings. Position filled, permanently 💍")} />
          <NavItem icon={<IChat />} label="Messaging" badge={p.msgCount} onClick={p.onMessages} />
          <NavItem icon={<IBell />} label="Notifications" badge={p.notifCount} onClick={p.onNotifs} />
          <NavItem
            icon={<Face name={p.name} src={p.photo?.url} x={p.photo?.x} y={p.photo?.y} scale={p.photo?.scale} size={24} />}
            label={<>Me <IChevDown size={16} /></>}
            active
            onClick={() => p.onToast("That's you. Looking great, obviously.")}
          />
          <span className="pf-navDiv" aria-hidden />
          <NavItem icon={<IGrid />} label={<>For Business <IChevDown size={16} /></>} onClick={() => p.onToast("Business is booming. Business = love.")} />
          <button type="button" className="pf-navPrem" onClick={() => p.onToast("Premium unlocked: unlimited hugs, forever.")}>
            Try Premium for ₹0
          </button>
        </nav>
      </div>
    </header>
  );
}

export function MobileTop(p: ChromeProps) {
  return (
    <header className="pf-mtop" role="banner">
      <button type="button" className="pf-mtopMe" aria-label="Your profile" onClick={() => p.onToast("That's you. Looking great, obviously.")}>
        <Face name={p.name} src={p.photo?.url} x={p.photo?.x} y={p.photo?.y} scale={p.photo?.scale} size={32} />
      </button>
      <Search searches={p.searches} onToast={p.onToast} compact />
      <button type="button" className="pf-mtopIc" aria-label={`Messaging, ${p.msgCount} new`} onClick={p.onMessages}>
        <IChat />
        {p.msgCount ? <b className="pf-badge">{p.msgCount}</b> : null}
      </button>
    </header>
  );
}

export function TabBar(p: ChromeProps) {
  const items: { l: string; ic: ReactNode; on: () => void; badge?: number }[] = [
    { l: "Home", ic: <IHome />, on: () => p.onToast("Feed's quiet. Everyone's busy endorsing you.") },
    { l: "My Network", ic: <INetwork />, on: () => p.onToast("1 connection. The only one that counts.") },
    { l: "Post", ic: <IPlusBox />, on: () => p.onToast("Drafting: 'Grateful to announce…' 🎉") },
    { l: "Notifications", ic: <IBell />, on: p.onNotifs, badge: p.notifCount },
    { l: "Jobs", ic: <IJobs />, on: () => p.onToast("No openings. Position filled, permanently 💍") },
  ];
  return (
    <nav className="pf-tabbar" aria-label="Primary">
      {items.map((it) => (
        <button key={it.l} type="button" className="pf-tab" onClick={it.on}>
          <span className="pf-navIc">
            {it.ic}
            {it.badge ? <b className="pf-badge">{it.badge}</b> : null}
          </span>
          <span>{it.l}</span>
        </button>
      ))}
    </nav>
  );
}

export function NotifPanel({ items, onClose, desktop }: { items: Notif[]; onClose: () => void; desktop: boolean }) {
  const [tab, setTab] = useState<"all" | "mine">("all");
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <>
      <div className="pf-scrim" onClick={onClose} aria-hidden />
      <div className={`pf-notifs${desktop ? " is-desk" : ""}`} role="dialog" aria-modal="true" aria-label="Notifications">
        <div className="pf-notifsH">
          <h2>Notifications</h2>
          <button type="button" className="pf-iconBtn" onClick={onClose} aria-label="Close notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.42 12L20 18.58 18.58 20 12 13.42 5.42 20 4 18.58 10.58 12 4 5.42 5.42 4 12 10.58 18.58 4 20 5.42z" /></svg>
          </button>
        </div>
        <div className="pf-pills" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "all"} className={tab === "all" ? "is-on" : ""} onClick={() => setTab("all")}>All</button>
          <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "is-on" : ""} onClick={() => setTab("mine")}>My posts</button>
          <button type="button" role="tab" aria-selected={false} onClick={() => setTab("all")}>Mentions</button>
        </div>
        <ul className="pf-notifList">
          {items
            .filter((n) => tab === "all" || n.kind === "react")
            .map((n, i) => (
              <li key={n.id} className="pf-notif is-new" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="pf-notifDot" aria-hidden />
                <span className={`pf-notifIc pf-notifIc--${n.kind}`} aria-hidden>
                  {n.kind === "search" ? "🔍" : n.kind === "view" ? "👀" : n.kind === "anniv" ? "🎉" : n.kind === "react" ? "❤️" : "👍"}
                </span>
                <p>{n.text}</p>
                <span className="pf-notifAgo">{n.ago}</span>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}
