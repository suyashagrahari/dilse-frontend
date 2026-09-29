"use client";

// ─── Chrome: nav bar, phone tab bar, tablet pill tabs, desktop sidebar ──────
//
// The store's own navigation, parodied: same shapes, same places, same
// behaviour (the nav bar turns solid and grows a mini icon + GET once the
// header scrolls away), with romantic tab names. Every tab just toasts —
// there is nowhere else to go.

import Link from "next/link";
import type { AppData } from "../types";
import {
  ChevronLeft,
  CompassIcon,
  HeartIcon,
  MusicIcon,
  PencilIcon,
  PeopleIcon,
  SearchIcon,
  SparkIcon,
  TabApps,
  TabDates,
  TabSearch,
  TabToday,
  TabUs,
} from "../icons";
import { AppIcon, GetButton, type GetState } from "./parts";

export function NavBar({
  data,
  solid,
  get,
  onGet,
  onBack,
  onTab,
  brand = false,
}: {
  data: AppData;
  solid: boolean;
  /** The recipient's page: a small brand pill that doubles as "make your own". */
  brand?: boolean;
  get: GetState;
  onGet: () => void;
  onBack: () => void;
  onTab: (label: string) => void;
}) {
  const { app } = data;
  return (
    <div className={`al-nav${solid ? " is-solid" : ""}`}>
      <button type="button" className="al-back al-press" onClick={onBack}>
        <ChevronLeft size={22} /> Today
      </button>
      <div className="al-nav-center">
        <div className="al-nav-mid" aria-hidden={!solid}>
          <AppIcon src={app.iconUrl} name={app.name} cropX={app.iconCropX} cropY={app.iconCropY} scale={app.iconScale} size={30} />
        </div>
        <div className="al-pilltabs" role="tablist" aria-label="Store sections">
          {["Today", "Us", "Apps", "Dates"].map((t) => (
            <button key={t} type="button" role="tab" aria-selected={t === "Apps"} className={t === "Apps" ? "is-on" : ""} onClick={() => onTab(t)}>
              {t}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={false} aria-label="Search" onClick={() => onTab("Search")}>
            <SearchIcon size={16} />
          </button>
        </div>
      </div>
      <div className="al-nav-right">
        {brand ? (
          <Link className="al-brand" href="/app" aria-label="SubhSandesh — make a listing for your person">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={20} height={20} />
            SubhSandesh <small>· make yours</small>
          </Link>
        ) : null}
        <span className="al-nav-get" aria-hidden={!solid}>
          <GetButton state={get} onClick={onGet} small />
        </span>
      </div>
    </div>
  );
}

export function TabBar({ onTab }: { onTab: (label: string) => void }) {
  const tabs = [
    { label: "Today", Icon: TabToday },
    { label: "Us", Icon: TabUs },
    { label: "Apps", Icon: TabApps },
    { label: "Dates", Icon: TabDates },
    { label: "Search", Icon: TabSearch },
  ];
  return (
    <nav className="al-tabbar" aria-label="Store tabs">
      {tabs.map(({ label, Icon }) => {
        const on = label === "Apps";
        return (
          <button key={label} type="button" className={`al-tab${on ? " is-on" : ""}`} aria-current={on ? "page" : undefined} onClick={() => onTab(label)}>
            <Icon size={27} active={on} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function Sidebar({ data, onItem }: { data: AppData; onItem: (label: string) => void }) {
  const seller = data.app.seller.trim();
  const items = [
    { label: "Discover", Icon: CompassIcon, on: true },
    { label: "Us", Icon: PeopleIcon },
    { label: "Dates", Icon: HeartIcon },
    { label: "Create", Icon: PencilIcon },
    { label: "Play", Icon: SparkIcon },
    { label: "Our Songs", Icon: MusicIcon },
  ];
  return (
    <aside className="al-side" aria-label="Store navigation">
      <button type="button" className="al-side-search" onClick={() => onItem("Search")}>
        <SearchIcon size={15} /> Search
      </button>
      <nav>
        {items.map(({ label, Icon, on }) => (
          <button key={label} type="button" className={`al-side-item${on ? " is-on" : ""}`} onClick={() => onItem(label)}>
            <Icon size={19} /> {label}
          </button>
        ))}
      </nav>
      <div className="al-side-cap">Library</div>
      <nav style={{ marginTop: 0 }}>
        <button type="button" className="al-side-item" onClick={() => onItem("Updates")}>
          <SparkIcon size={19} /> Updates <em>1</em>
        </button>
        <button type="button" className="al-side-item" onClick={() => onItem("Purchased")}>
          <HeartIcon size={19} /> Purchased
        </button>
      </nav>
      <div className="al-side-me">
        <i aria-hidden="true">{(seller[0] ?? "♥").toUpperCase()}</i>
        <span>
          <b>{seller || "You"}</b>
          <small>Signed in · 1 heart</small>
        </span>
      </div>
    </aside>
  );
}
