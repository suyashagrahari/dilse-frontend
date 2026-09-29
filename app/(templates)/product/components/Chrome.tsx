"use client";

// ─── Site chrome — desktop nav, the phone app bar, the phone tab bar ─────────
//
// Two different headers, because the real store ships two: on a desktop it is
// the dark 60px bar (wordmark, deliver-to, category search, account, cart) with
// the 39px department strip under it; on a phone it is the app — a teal
// gradient search pill with a back arrow, the pale "Deliver to" strip, and a
// five-tab bar pinned to the bottom. CSS decides which one is visible, so the
// server render is correct at every width and nothing flashes.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The wordmark is ours — WORDMARK from ./types — drawn in the system stack with
// a heart under it. No retailer is named anywhere in this file.

import { useMemo, useRef, useState } from "react";
import { C, FONT, HeartMark } from "./tokens";
import { WORDMARK } from "./types";
import {
  IconBack,
  IconCamera,
  IconCart,
  IconChevronDown,
  IconHeart,
  IconHome,
  IconMenu,
  IconMic,
  IconPin,
  IconSearch,
  IconUs,
  IconUser,
} from "./icons";

const SUB_NAV = [
  "Today's Deals",
  "Hugs & Kisses",
  "Best Sellers",
  "Date Nights",
  "Chai & Coffee",
  "Gift Ideas",
  "Her Favourites",
  "Customer Service (24×7, for her)",
] as const;

export function Wordmark({ scale = 1, color = "#FFFFFF" }: { scale?: number; color?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        lineHeight: 1,
        padding: "2px 6px 2px 2px",
        flex: "none",
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 22 * scale,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color,
          whiteSpace: "nowrap",
        }}
      >
        {WORDMARK}
        <span style={{ fontSize: 13 * scale, fontWeight: 600, opacity: 0.9 }}>.in</span>
      </span>
      <span style={{ marginTop: 2 * scale, marginLeft: 2 }}>
        <HeartMark width={44 * scale} />
      </span>
    </span>
  );
}

/* ── The search box, and its one joke ──────────────────────────────────────── */

function SearchBox({ herName, variant }: { herName: string; variant: "desk" | "app" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const n = herName.toLowerCase();
    return [n, `${n} smiling`, `${n} but hungry`, `${n} at 2 am`, `someone better than ${n}`];
  }, [herName]);

  const typed = q.trim().toLowerCase();
  const shown = typed ? [...suggestions.filter((s) => s.includes(typed)), ...(suggestions.includes(typed) ? [] : [typed])] : suggestions;

  const submit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setResult(v);
    setOpen(true);
    inputRef.current?.blur();
  };

  const desk = variant === "desk";

  return (
    <div className={desk ? "lk-search-wrap" : "lk-app-search-wrap"}>
      <form
        className={desk ? "lk-search" : "lk-app-search"}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
      >
        {desk ? (
          <span className="lk-search-cat">
            All <IconChevronDown size={9} color={C.secondary} />
          </span>
        ) : (
          <span style={{ paddingLeft: 12, display: "grid", placeItems: "center" }}>
            <IconSearch size={19} color="#333" />
          </span>
        )}
        <input
          ref={inputRef}
          className={desk ? "lk-search-input" : "lk-app-search-input"}
          type="search"
          value={q}
          aria-label="Search the store"
          placeholder={desk ? `Search ${WORDMARK}.in` : `Search ${WORDMARK}.in`}
          onChange={(e) => {
            setQ(e.target.value);
            setResult(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 180)}
        />
        {desk ? (
          <button className="lk-search-btn" type="submit" aria-label="Go">
            <IconSearch size={20} color={C.text} />
          </button>
        ) : (
          <span style={{ display: "flex", gap: 12, padding: "0 12px" }} aria-hidden="true">
            <IconCamera size={20} color="#555" />
            <IconMic size={20} color="#555" />
          </span>
        )}
      </form>

      {open && (
        <div className="lk-suggest" role="listbox">
          {result ? (
            <div style={{ padding: "12px 14px", fontSize: 13.5, lineHeight: 1.5 }}>
              <p style={{ margin: 0, color: C.text }}>
                No results for <strong>“{result.slice(0, 40)}”</strong>.
              </p>
              <p style={{ margin: "4px 0 0", color: C.secondary }}>
                Did you mean{" "}
                <button
                  type="button"
                  className="lk-link"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {herName}
                </button>
                ? She&apos;s the only result we stock. 💛
              </p>
            </div>
          ) : (
            shown.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                className="lk-suggest-row"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQ(s);
                  submit(s);
                }}
              >
                <IconSearch size={14} color={C.secondary} />
                <span>{s}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Desktop + tablet ──────────────────────────────────────────────────────── */

function NavStack({ top, bottom, caret }: { top: string; bottom: string; caret?: boolean }) {
  return (
    <span className="lk-navstack">
      <span style={{ fontSize: 12, color: "#fff", fontWeight: 400 }}>{top}</span>
      <span style={{ fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
        {bottom}
        {caret && <IconChevronDown size={9} color="#aaa" />}
      </span>
    </span>
  );
}

export type AppTab = "home" | "you" | "us" | "cart" | "menu";

export default function Chrome({
  recipientFirstName,
  senderFirstName,
  cartCount,
  cartBumping,
  onBack,
  onTab,
}: {
  recipientFirstName: string;
  senderFirstName: string;
  cartCount: number;
  cartBumping: boolean;
  onBack?: () => void;
  onTab?: (tab: AppTab) => void;
}) {
  const her = recipientFirstName.trim() || "you";
  const him = senderFirstName.trim() || "you";

  const tabs: { id: AppTab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "you", label: "You" },
    { id: "us", label: "Us" },
    { id: "cart", label: "Cart" },
    { id: "menu", label: "Menu" },
  ];

  return (
    <>
      {/* ── Desktop / tablet header ─────────────────────────────────────── */}
      <header className="lk-chrome lk-desk-only">
        <div className="lk-nav">
          <span className="lk-nav-mark lk-hov">
            <Wordmark />
          </span>

          <span className="lk-deliver lk-hov">
            <IconPin size={15} color="#fff" style={{ marginTop: 12 }} />
            <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: 12, color: "#ccc" }}>Deliver to {her}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>My heart 143001</span>
            </span>
          </span>

          <SearchBox herName={her} variant="desk" />

          <span className="lk-lang lk-hov" aria-hidden="true">
            <span style={{ fontSize: 14, fontWeight: 700 }}>EN</span>
            <IconChevronDown size={9} color="#aaa" />
          </span>
          <span className="lk-hov">
            <NavStack top={`Hello, ${him}`} bottom="Account & Lists" caret />
          </span>
          <span className="lk-hov lk-orders">
            <NavStack top="Returns" bottom="& Orders" />
          </span>
          <span
            className={`lk-cart lk-hov${cartBumping ? " lk-cart-bump" : ""}`}
            data-lk-cart=""
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            role="status"
          >
            <span className="lk-cart-count">{cartCount}</span>
            <IconCart size={38} color="#fff" />
            <span className="lk-cart-word">Cart</span>
          </span>
        </div>

        <nav className="lk-subnav" aria-label="Departments">
          <span className="lk-subnav-item lk-subnav-all">
            <IconMenu size={20} color="#fff" /> All
          </span>
          {SUB_NAV.map((item) => (
            <span key={item} className="lk-subnav-item">
              {item}
            </span>
          ))}
          <span className="lk-subnav-promo">
            <IconHeart size={15} color="#FFA41C" fill="#FFA41C" /> Valentine&apos;s store · open all year
          </span>
        </nav>
      </header>

      {/* ── Phone: the app bar ──────────────────────────────────────────── */}
      <header className="lk-chrome lk-app-only">
        <div className="lk-app-bar">
          <button type="button" className="lk-app-back" onClick={onBack} aria-label="Back">
            <IconBack size={22} color="#0F1111" />
          </button>
          <SearchBox herName={her} variant="app" />
        </div>
        <div className="lk-app-deliver">
          <IconPin size={16} color="#0F1111" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Deliver to {her} – My heart 143001
          </span>
          <IconChevronDown size={11} color="#0F1111" />
        </div>
      </header>

      {/* ── Phone: the tab bar ──────────────────────────────────────────── */}
      <nav className="lk-tabbar" aria-label="App tabs">
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" className={`lk-tab${id === "home" ? " lk-tab-on" : ""}`} onClick={() => onTab?.(id)}>
            {id === "cart" ? (
              <span className={`lk-tab-cart${cartBumping ? " lk-cart-bump" : ""}`} data-lk-cart="">
                <IconCart size={28} color="#0F1111" />
                <span className="lk-tab-cart-count">{cartCount}</span>
              </span>
            ) : id === "home" ? (
              <IconHome size={24} color="#007185" />
            ) : id === "you" ? (
              <IconUser size={24} color="#0F1111" />
            ) : id === "us" ? (
              <IconUs size={24} color="#0F1111" />
            ) : (
              <IconMenu size={24} color="#0F1111" />
            )}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

/** The breadcrumb trail. Desktop and tablet only, as on the real site. */
export function Breadcrumb({ subjectName }: { subjectName: string }) {
  const trail = ["People", "Partners", "Soulmates", "One of a Kind"];
  return (
    <nav aria-label="Breadcrumb" className="lk-crumbs lk-desk-only">
      {trail.map((step) => (
        <span key={step}>
          <span className="lk-link">{step}</span>
          <span style={{ margin: "0 7px", color: "#888" }}>›</span>
        </span>
      ))}
      <span style={{ color: C.secondary }}>{subjectName}</span>
    </nav>
  );
}

/**
 * All the chrome's CSS in one place. Class-prefixed `lk-` so nothing here can
 * collide with a sibling template mounted on the same shared page.
 */
export function ChromeStyles() {
  return (
    <style>{`
      .lk-chrome { position: sticky; top: var(--lk-chrome-top, 0px); z-index: 60; }
      .lk-app-only { display: block; }
      .lk-desk-only { display: none; }
      @media (min-width: 768px) {
        .lk-app-only { display: none !important; }
        .lk-desk-only { display: block; }
      }

      /* Desktop nav */
      .lk-nav {
        background: ${C.header}; display: flex; align-items: center; gap: 2px;
        padding: 0 10px; height: 60px; color: #fff; font-family: ${FONT};
      }
      .lk-hov { border: 1px solid transparent; border-radius: 2px; padding: 6px 8px; cursor: pointer; flex: none; display: inline-flex; align-items: center; gap: 4px; }
      .lk-hov:hover { border-color: #fff; }
      .lk-navstack { display: inline-flex; flex-direction: column; line-height: 1.2; white-space: nowrap; }
      .lk-lang, .lk-orders, .lk-deliver { display: none; }
      .lk-deliver { align-items: flex-start; white-space: nowrap; }
      @media (min-width: 1024px) {
        .lk-lang, .lk-orders, .lk-deliver { display: inline-flex; }
      }

      .lk-search-wrap { position: relative; flex: 1 1 auto; min-width: 0; margin: 0 8px; }
      .lk-search { display: flex; align-items: stretch; height: 40px; border-radius: 4px; overflow: hidden; background: #fff; }
      .lk-search:focus-within { box-shadow: 0 0 0 3px ${C.ctaOrange}; }
      .lk-search-cat {
        display: inline-flex; align-items: center; gap: 4px; padding: 0 10px; background: #E6E6E6;
        border-right: 1px solid #CDCDCD; font-family: ${FONT}; font-size: 12px; color: #555; flex: none; cursor: pointer;
      }
      .lk-search-input, .lk-app-search-input {
        flex: 1 1 auto; min-width: 0; border: 0; outline: none; padding: 0 10px; height: 100%;
        font-family: ${FONT}; font-size: 15px; color: ${C.text}; background: #fff;
      }
      .lk-search-input::-webkit-search-cancel-button, .lk-app-search-input::-webkit-search-cancel-button { display: none; }
      .lk-search-btn { flex: none; width: 45px; border: 0; cursor: pointer; background: #FEBD69; display: grid; place-items: center; }
      .lk-search-btn:hover { background: #F3A847; }

      .lk-suggest {
        position: absolute; left: 0; right: 0; top: calc(100% + 2px); z-index: 70; background: #fff;
        border: 1px solid ${C.border}; border-radius: 0 0 6px 6px; box-shadow: 0 6px 16px rgba(0,0,0,.18);
        font-family: ${FONT}; color: ${C.text}; overflow: hidden; animation: lk-drop .16s ease-out;
      }
      .lk-suggest-row { display: flex; width: 100%; align-items: center; gap: 10px; padding: 9px 12px; border: 0; background: #fff; text-align: left; font: 700 14px ${FONT}; color: ${C.text}; cursor: pointer; }
      .lk-suggest-row:hover { background: #F3F3F3; }
      @keyframes lk-drop { from { opacity: 0; transform: translateY(-4px); } }

      .lk-cart { position: relative; align-items: flex-end; padding: 4px 8px; font-weight: 700; font-size: 14px; }
      .lk-cart-count { position: absolute; top: 3px; left: 24px; width: 18px; text-align: center; color: #F08804; font-size: 16px; font-weight: 800; line-height: 1; }
      .lk-cart-word { padding-bottom: 4px; }
      .lk-cart-bump { animation: lk-cart-pop 560ms cubic-bezier(.2,1.6,.4,1); }
      @keyframes lk-cart-pop { 0% { transform: none; } 35% { transform: translateY(-5px) scale(1.18); } 100% { transform: none; } }

      .lk-subnav {
        background: ${C.subHeader}; height: 39px; display: flex; align-items: center; gap: 2px;
        padding: 0 10px; overflow: hidden; font-family: ${FONT};
      }
      .lk-subnav-item {
        font-size: 14px; color: #fff; padding: 7px 8px; border: 1px solid transparent; border-radius: 2px;
        white-space: nowrap; flex: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
      }
      .lk-subnav-item:hover { border-color: #fff; }
      .lk-subnav-all { font-weight: 700; }
      .lk-subnav-promo { margin-left: auto; color: #fff; font-size: 14px; font-weight: 700; white-space: nowrap; display: none; align-items: center; gap: 6px; padding-left: 12px; }
      @media (min-width: 1280px) { .lk-subnav-promo { display: inline-flex; } }

      /* Phone app bar */
      .lk-app-bar {
        display: flex; align-items: center; gap: 4px; padding: 8px 10px 8px 2px;
        background: linear-gradient(90deg, ${C.appA}, ${C.appB});
      }
      .lk-app-back { width: 36px; height: 40px; border: 0; background: transparent; display: grid; place-items: center; cursor: pointer; flex: none; }
      .lk-app-search-wrap { position: relative; flex: 1 1 auto; min-width: 0; }
      .lk-app-search {
        display: flex; align-items: center; height: 44px; border-radius: 9px; background: #fff; overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,.14), inset 0 0 0 1px rgba(0,0,0,.08);
      }
      .lk-app-search:focus-within { box-shadow: 0 0 0 2px #008296; }
      .lk-app-search-input { font-size: 16px; }
      .lk-app-deliver {
        display: flex; align-items: center; gap: 6px; padding: 9px 14px; min-width: 0;
        background: linear-gradient(90deg, ${C.deliverA}, ${C.deliverB});
        font: 400 13.5px ${FONT}; color: ${C.text};
      }

      /* Phone tab bar */
      .lk-tabbar {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 65; background: #fff;
        border-top: 1px solid #D5D9D9; box-shadow: 0 -1px 6px rgba(0,0,0,.06);
        padding-bottom: env(safe-area-inset-bottom, 0px); display: flex;
      }
      @media (min-width: 768px) { .lk-tabbar { display: none; } }
      .lk-tab {
        flex: 1 1 0; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 7px 0 6px;
        border: 0; background: transparent; font: 400 11px ${FONT}; color: ${C.text}; cursor: pointer; position: relative;
        -webkit-tap-highlight-color: transparent; transition: transform .12s ease;
      }
      .lk-tab:active { transform: scale(.92); }
      .lk-tab-on { color: #007185; font-weight: 700; }
      .lk-tab-on::before { content: ""; position: absolute; top: -1px; left: 28%; right: 28%; height: 3px; border-radius: 0 0 3px 3px; background: #007185; }
      .lk-tab-cart { position: relative; display: block; height: 24px; width: 30px; }
      .lk-tab-cart svg { margin-top: -2px; }
      .lk-tab-cart-count { position: absolute; top: -2px; left: 12px; width: 14px; text-align: center; font: 800 12px ${FONT}; color: #0F1111; }

      .lk-crumbs { font-family: ${FONT}; font-size: 12px; color: ${C.secondary}; padding: 12px 0 8px; line-height: 1.5; overflow-wrap: anywhere; }

      .lk-link { color: ${C.link}; background: none; border: 0; padding: 0; font: inherit; cursor: pointer; text-align: left; text-decoration: none; }
      .lk-link:hover { color: ${C.linkHover}; text-decoration: underline; }

      @media (prefers-reduced-motion: reduce) {
        .lk-cart-bump, .lk-suggest { animation: none; }
      }
    `}</style>
  );
}
