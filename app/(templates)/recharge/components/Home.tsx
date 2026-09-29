"use client";

// ─── The recharge screen ─────────────────────────────────────────────────────
//
// Phone (<768): the app — berry header with the app bar, the white
// "recharging for" card overlapping it, search, offer banners, sticky tabs,
// plan cards and a sticky "Proceed to pay" bar.
//
// Tablet/desktop: the web version — top nav, a services strip, then a
// two-column page from 1024px: the recharge form card on the left (sticky) and
// the plan browser on the right. Tablet stacks the two.

import { useEffect, useMemo, useRef, useState } from "react";
import { OPERATOR_NAME, parseRow, plansInCategory, type Plan, type RechargeData } from "./types";
import { PlanCard, PlanSkeleton } from "./Plans";
import { Avatar, Photo, Price, priceLabel, useAfter, useReducedMotion, INK, MUTED, FAINT, PINK, BERRY_2, GREEN_DEEP } from "./ui";
import {
  IconBack,
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconCup,
  IconDots,
  IconHeartFill,
  IconHelp,
  IconHug,
  IconMoon,
  IconPhone,
  IconSearch,
  IconShield,
  IconSignal,
  IconTicket,
  IconBell,
  LogoMark,
  IconTag,
} from "./icons";

/* ── Operator detected card ───────────────────────────────────────────────── */

function OperatorBlock({ data, detected, onChange }: { data: RechargeData; detected: boolean; onChange: () => void }) {
  const s = data.subscriber;
  return (
    <div className="rc-op">
      <div className="rc-op-row">
        <Avatar photo={data.photos[0]} name={s.name} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rc-op-name">
            <span>{s.name || "Your favourite person"}</span>
            <IconHeartFill size={14} className="rc-heart" />
          </div>
          <div className="rc-op-num">{s.number || "+91 ••••• •••••"}</div>
          <div className="rc-op-meta">
            {detected ? (
              <>
                <IconSignal size={13} stroke={2.2} />
                <span>
                  Prepaid · {OPERATOR_NAME}
                  {s.circle ? ` · ${s.circle}` : ""}
                </span>
              </>
            ) : (
              <>
                <span className="rc-shimmer" style={{ width: 110 }} />
                <span style={{ fontSize: 11 }}>Detecting operator…</span>
              </>
            )}
          </div>
        </div>
        <button type="button" className="rc-link" onClick={onChange} style={{ alignSelf: "flex-start", marginTop: 2 }}>
          Change
        </button>
      </div>
      {detected ? (
        <div style={{ marginTop: 10, fontSize: 11.5 }}>
          <span className="rc-detect">
            <IconCheck size={13} stroke={3} /> Operator detected · lifetime compatible
          </span>
        </div>
      ) : null}
      {data.currentPlan.expiresIn || data.currentPlan.note ? (
        <div className="rc-expiry">
          {data.currentPlan.expiresIn ? (
            <span className="rc-expiry-pill">
              <span className="rc-dot" />
              {data.currentPlan.expiresIn}
            </span>
          ) : null}
          {data.currentPlan.note ? <p>{data.currentPlan.note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ── Offer banners ────────────────────────────────────────────────────────── */

const BANNER_TINTS = [
  "linear-gradient(120deg,#6E1250,#F0287A)",
  "linear-gradient(120deg,#3A0C33,#8D3BD1)",
  "linear-gradient(120deg,#C2185B,#FF8A5B)",
  "linear-gradient(120deg,#0F8646,#2BC271)",
];
const BANNER_STICKERS = ["🫂", "📞", "🍛", "💋", "💌", "🧸"];

function Banners({ data }: { data: RechargeData }) {
  const count = Math.max(data.promos.length, Math.min(data.photos.length, 4));
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const reduced = useReducedMotion();
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      setAt(Math.round(el.scrollLeft / (first.offsetWidth + 12)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduced || count < 2) return;
    const t = window.setInterval(() => {
      const el = ref.current;
      if (!el || paused.current) return;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + 12;
      const max = el.scrollWidth - el.clientWidth - 4;
      el.scrollTo({ left: el.scrollLeft >= max ? 0 : el.scrollLeft + step, behavior: "smooth" });
    }, 3800);
    return () => window.clearInterval(t);
  }, [reduced, count]);

  if (count === 0) return null;
  const who = data.subscriber.name || "you";

  return (
    <div
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
    >
      <div ref={ref} className="rc-banners rc-noscroll" aria-label="Offers" role="region">
        {Array.from({ length: count }).map((_, i) => {
          const photo = data.photos.length ? data.photos[i % data.photos.length] : null;
          const text = data.promos[i] || `Special offer, only for ${who} 💗`;
          return (
            <div key={i} className="rc-banner" style={{ background: BANNER_TINTS[i % BANNER_TINTS.length] }}>
              {photo ? (
                <>
                  <Photo photo={photo} />
                  <div className="rc-banner-shade" />
                </>
              ) : (
                <span
                  aria-hidden="true"
                  style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%) rotate(8deg)", fontSize: 58 }}
                >
                  {BANNER_STICKERS[i % BANNER_STICKERS.length]}
                </span>
              )}
              <div className="rc-banner-txt">
                <span className="rc-offer">OFFER</span>
                <b>{text}</b>
                <span className="rc-tnc">*T&amp;C: valid only with you</span>
              </div>
            </div>
          );
        })}
      </div>
      {count > 1 ? (
        <div className="rc-dots" aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className={i === Math.min(at, count - 1) ? "on" : ""} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ── Web chrome ───────────────────────────────────────────────────────────── */

export function WebNav({ data }: { data: RechargeData }) {
  const me = data.sender.name || "you";
  return (
    <header className="rc-nav rc-web">
      <div className="rc-nav-in">
        <span className="rc-wordmark">
          <LogoMark size={30} />
          <span>
            dil<b>pay</b>
          </span>
        </span>
        <nav className="rc-navlinks" aria-label="Sections">
          <span className="on">Recharge &amp; Bills</span>
          <span>Hugs on UPI</span>
          <span>Date Tickets</span>
          <span>Love Offers</span>
          <span>Pay Later (in person)</span>
        </nav>
        <div className="rc-me">
          <span className="rc-icon-btn" aria-hidden="true" style={{ color: MUTED }}>
            <IconBell size={20} />
          </span>
          <span className="rc-me-chip">
            <Avatar photo={null} name={me} size={28} ring={false} />
            Hi, {me} 👋
          </span>
        </div>
      </div>
    </header>
  );
}

const SERVICES = [
  { icon: <IconPhone size={21} />, label: "Mobile Recharge", on: true },
  { icon: <IconHug size={21} />, label: "Hug Top-up", tag: "NEW" },
  { icon: <IconTicket size={21} />, label: "Movie Dates" },
  { icon: <IconCup size={21} />, label: "Chai Bill" },
  { icon: <IconMoon size={21} />, label: "2 AM Calls" },
  { icon: <IconBolt size={21} />, label: "Butterflies Bill" },
  { icon: <IconTag size={21} />, label: "Love Offers" },
];

function Services() {
  return (
    <div className="rc-services rc-web">
      <div className="rc-services-card rc-noscroll">
        {SERVICES.map((s) => (
          <div key={s.label} className={`rc-svc${s.on ? " on" : ""}`}>
            <i>
              {s.icon}
              {s.tag ? <em>{s.tag}</em> : null}
            </i>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── The screen ───────────────────────────────────────────────────────────── */

export default function Home({
  data,
  selected,
  onSelect,
  onDetails,
  onProceed,
  onChangeNumber,
}: {
  data: RechargeData;
  selected: Plan | null;
  onSelect: (p: Plan) => void;
  onDetails: (p: Plan) => void;
  onProceed: () => void;
  onChangeNumber: () => void;
}) {
  const detected = useAfter(900);
  const loaded = useAfter(750);
  const [cat, setCat] = useState<string>(data.categories[0]?.id ?? "");
  const [q, setQ] = useState("");

  const activeCat = data.categories.some((c) => c.id === cat) ? cat : (data.categories[0]?.id ?? "");
  const query = q.trim().toLowerCase();

  const visible = useMemo(() => {
    if (query) {
      return data.plans.filter((p) =>
        [p.price, p.validity, p.badge ?? "", ...p.rows, ...p.benefits].join(" ").toLowerCase().includes(query),
      );
    }
    return plansInCategory(data, activeCat);
  }, [data, activeCat, query]);

  const listRef = useRef<HTMLDivElement>(null);

  const pickTab = (id: string) => {
    setCat(id);
    setQ("");
  };

  const selRow = selected ? parseRow(selected.rows[0] ?? "") : null;

  const planBrowser = (
    <section aria-label="Plans" style={{ minWidth: 0 }}>
      <div className="rc-web" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Browse plans for {data.subscriber.name || "them"}
            </h2>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
              {OPERATOR_NAME}
              {data.subscriber.circle ? ` · ${data.subscriber.circle}` : ""} · {data.plans.length} plans
            </div>
          </div>
          <label className="rc-search" style={{ width: 300, flex: "none" }}>
            <IconSearch size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. ₹∞ or hugs" aria-label="Search plans" />
          </label>
        </div>
        <Banners data={data} />
      </div>

      <div className="rc-tabs-wrap">
        <div className="rc-tabs rc-noscroll" role="tablist" aria-label="Plan categories">
          {data.categories.map((c) => {
            const n = plansInCategory(data, c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={!query && c.id === activeCat}
                className={`rc-tab${!query && c.id === activeCat ? " on" : ""}`}
                onClick={() => pickTab(c.id)}
              >
                {c.label}
                <sup>{n}</sup>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={listRef} className="rc-plans" role="tabpanel">
        {!loaded ? (
          <>
            <PlanSkeleton />
            <PlanSkeleton />
          </>
        ) : visible.length ? (
          visible.map((p, i) => (
            <PlanCard key={`${activeCat}-${query}-${p.id}`} plan={p} index={i} selected={selected?.id === p.id} onSelect={onSelect} onDetails={onDetails} />
          ))
        ) : (
          <div className="rc-empty">
            <div style={{ fontSize: 34 }}>🥲</div>
            {query ? `No plans match "${q}". Try "hugs" or "∞".` : "No plans in this tab yet."}
          </div>
        )}
      </div>

      <div className="rc-foot">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: GREEN_DEEP, fontWeight: 700 }}>
          <IconShield size={14} /> 100% secure · instant recharge
        </span>
        <br />
        Prices incl. all taxes and zero drama. Plans are subject to feelings. Tariff valid only for {data.subscriber.name || "you"}.
      </div>
    </section>
  );

  return (
    <div>
      {/* ── Phone app header ─────────────────────────────────────────── */}
      <div className="rc-app">
        <div className="rc-hero">
          <div className="rc-appbar">
            <span className="rc-icon-btn" aria-hidden="true">
              <IconBack size={22} />
            </span>
            <h1>Mobile Recharge</h1>
            <span className="rc-icon-btn rc-hide-live" aria-hidden="true">
              <IconHelp size={21} />
            </span>
            <span className="rc-icon-btn rc-hide-live" aria-hidden="true">
              <IconDots size={21} stroke={2.6} />
            </span>
          </div>
          <div className="rc-hero-sub">
            <LogoMark size={18} />
            <span>
              Recharging for your favourite human · by <b>dilpay</b>
            </span>
          </div>
        </div>
        <div className="rc-float-card rc-card">
          <OperatorBlock data={data} detected={detected} onChange={onChangeNumber} />
        </div>
        <div style={{ padding: "14px 12px 4px" }}>
          <label className="rc-search">
            <IconSearch size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a plan, e.g. ₹∞ or hugs" aria-label="Search plans" />
          </label>
        </div>
        <div style={{ padding: "10px 0 6px" }}>
          <Banners data={data} />
        </div>
      </div>

      {/* ── Web chrome ───────────────────────────────────────────────── */}
      <WebNav data={data} />
      <Services />

      <div className="rc-page">
        <div className="rc-grid">
          <aside className="rc-left rc-web">
            <div className="rc-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Recharge or Pay Mobile Bill</div>
              <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>Instant. Secure. Emotionally binding.</div>

              <div style={{ marginTop: 16, border: "1.5px solid #F1ECF6", borderRadius: 16, background: "#FAF8FC", overflow: "hidden" }}>
                <OperatorBlock data={data} detected={detected} onChange={onChangeNumber} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="rc-field">
                  <label>Operator</label>
                  <div style={{ fontSize: 14 }}>
                    {detected ? OPERATOR_NAME : <span className="rc-shimmer" style={{ width: 80 }} />}
                    <IconChevronDown size={15} className="rc-ml" />
                  </div>
                </div>
                <div className="rc-field">
                  <label>Circle</label>
                  <div style={{ fontSize: 14, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {data.subscriber.circle || "Your heart"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, border: "1.5px solid #ECE8F1" }}>
                {selected ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: FAINT, fontWeight: 600 }}>SELECTED PLAN</div>
                      <div style={{ fontSize: 13, color: MUTED, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {selected.validity}
                        {selRow?.value ? ` · ${selRow.label ? `${selRow.label} ` : ""}${selRow.value}` : ""}
                      </div>
                    </div>
                    <Price price={selected.price} size={26} />
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: MUTED }}>Pick a plan from the list →</div>
                )}
              </div>
              <button type="button" className="rc-btn rc-btn-pink" style={{ width: "100%", marginTop: 12, minHeight: 52 }} disabled={!selected} onClick={onProceed}>
                {selected ? `Proceed to Pay ${priceLabel(selected.price)}` : "Select a plan"}
              </button>
              <div className="rc-secure">
                <IconShield size={13} /> Secured by UPI · 24×7 support (it&apos;s me, I&apos;m the support)
              </div>
            </div>
          </aside>

          {planBrowser}
        </div>
      </div>

      {/* ── Sticky pay bar (phone + tablet) ──────────────────────────── */}
      {selected ? (
        <div className="rc-bar" key={selected.id}>
          <div className="rc-bar-in">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Price price={selected.price} size={24} />
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selected.validity}
                {" · "}
                <button type="button" className="rc-link" style={{ fontSize: 12 }} onClick={() => onDetails(selected)}>
                  View details
                </button>
              </div>
            </div>
            <button type="button" className="rc-btn rc-btn-pink" style={{ minWidth: 168 }} onClick={onProceed}>
              Proceed to Pay
            </button>
          </div>
        </div>
      ) : null}

      <style>{`
        .rc-heart { color: ${PINK}; flex: none; }
        .rc-ml { margin-left: auto; color: ${FAINT}; }
        @media (min-width: 768px) and (max-width: 1023px) {
          .rc-left.rc-web { display: block; margin-bottom: 18px; }
        }
        .rc-hero-sub b { color: #fff; }
        .rc-op-name { color: ${INK}; }
        .rc-chip svg { color: ${BERRY_2}; flex: none; }
      `}</style>
    </div>
  );
}
