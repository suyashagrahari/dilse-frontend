"use client";

// ─── Super admin: what SubhSandesh earned ─────────────────────────────────────
//
// One range drives the whole screen — Today, 7, 30 or 90 days, or any custom
// span — and lives in the URL (`?range=30d`, `?range=custom&from=…&to=…`) so a
// view can be bookmarked or pasted into a chat and survives a refresh.
//
// ── WHAT COUNTS AS MONEY ────────────────────────────────────────────────────
//
// Revenue is paid orders only, valued at the INR the order was frozen at
// (`amountInrPaise`) and dated by when the payment landed, in India time. A
// template unlocked with points is a real unlock but not money, so it is
// counted beside revenue and never inside it. The server does that maths; this
// page only displays it — see revenue.service.ts.
//
// ── SUPER ADMIN, NOT ADMIN ──────────────────────────────────────────────────
//
// The layout admits any admin. Who paid how much is personal and commercial
// data, so this page checks `isSuperAdmin` itself and sends anyone else back,
// exactly like /admin/pricing. The server refuses them as well.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  IndianRupee, ShoppingBag, Users, UserPlus, Receipt, BadgePercent, Coins, UserRoundPlus, FileText,
  TrendingUp, TrendingDown, Minus, Download, Loader2, ChevronLeft, ChevronRight,
  CalendarDays, Layers, Globe2, RefreshCw, AlertTriangle,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { useToast } from "@/lib/toast/useToast";
import {
  A, AdminPage, Hero, Panel, ChipGroup, SearchBox, Loading, EmptyState, Tag, StatTile, useCountUp,
} from "../adminKit";
import {
  type RangeKey, type RevenueSummary, type Customer, type Order, type Pagination, type OrderStatus,
  inr, inrShort, money, discountLabel, pctChange, istDay, istDayOf, prettyDay, istTime, isYmd, downloadCsv, rupeesPlain,
} from "./types";
import OrderTable, { RV_TABLE_CSS, STATUS_LABEL } from "./OrderTable";

const ABOUT = (
  <>
    What SubhSandesh earned and from whom. <b>Revenue</b> is paid orders only, in rupees at the rate frozen on each
    order, dated by when the payment landed. Template unlocks bought with <b>points</b> are counted beside it, never
    inside it. Every number compares against the previous period of the same length. Days run midnight to midnight,
    India time. Click a paying user for their full billing and to send them a statement.
  </>
);

const RANGES: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "custom", label: "Custom" },
];

const PAGE_SIZE = 20;

/** `?range=30d` / `?range=custom&from=…&to=…` → the range to open on. Default 7 days. */
function readRangeFromUrl(): { range: RangeKey; from: string; to: string } {
  if (typeof window === "undefined") return { range: "7d", from: "", to: "" };
  const p = new URLSearchParams(window.location.search);
  const r = p.get("range"), f = p.get("from"), t = p.get("to");
  if (r === "custom" && isYmd(f) && isYmd(t) && f <= t) return { range: "custom", from: f, to: t };
  if (r === "today" || r === "7d" || r === "30d" || r === "90d") return { range: r, from: "", to: "" };
  return { range: "7d", from: "", to: "" };
}
const EXPORT_CAP = 5000;

/** `{success,data}` → data, or throw the server's own words. */
async function getJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, { headers });
  } catch {
    throw new Error("Could not reach the server.");
  }
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.success) throw new Error(j?.error || `Request failed (${r.status})`);
  return j.data as T;
}

export default function AdminRevenuePage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { accessToken, user, isLoading } = useAppSelector((s) => s.auth);

  // ── Access ────────────────────────────────────────────────────────────────
  // The layout has already held the render until `checkAuth` settled, so
  // `user` is populated by the time this mounts; only the tier is left to check.
  const allowed = !!user && isSuperAdmin(user.role);
  useEffect(() => {
    if (!isLoading && user && !isSuperAdmin(user.role)) router.replace("/admin/analytics");
  }, [user, isLoading, router]);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  // ── The range, mirrored into the URL ─────────────────────────────────────
  //
  // Read straight from `window.location` in the initial state rather than with
  // `useSearchParams` (which needs a Suspense boundary to prerender). Safe from
  // hydration mismatches: the admin layout renders only its skeleton until the
  // session is confirmed in the browser, so this page never renders on the server.
  const [initial] = useState(readRangeFromUrl);
  const [range, setRange] = useState<RangeKey>(initial.range);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [draftFrom, setDraftFrom] = useState(initial.from || istDay(-29));
  const [draftTo, setDraftTo] = useState(initial.to || istDay());

  const pushUrl = (r: RangeKey, f = "", t = "") => {
    const p = new URLSearchParams(window.location.search);
    p.set("range", r);
    if (r === "custom") { p.set("from", f); p.set("to", t); } else { p.delete("from"); p.delete("to"); }
    window.history.replaceState(null, "", `${window.location.pathname}?${p}`);
  };

  const pickRange = (r: RangeKey) => {
    if (r === "custom") { setRange("custom"); return; } // waits for Apply
    setRange(r); setFrom(""); setTo("");
    pushUrl(r);
  };

  const customError = useMemo(() => {
    if (!isYmd(draftFrom) || !isYmd(draftTo)) return "Pick both days.";
    if (draftFrom > draftTo) return "The start is after the end.";
    if (draftTo > istDay()) return "The end is in the future.";
    const days = (Date.parse(draftTo) - Date.parse(draftFrom)) / 86400000 + 1;
    if (days > 366) return "At most 366 days at a time.";
    return null;
  }, [draftFrom, draftTo]);

  const applyCustom = () => {
    if (customError) return;
    setFrom(draftFrom); setTo(draftTo);
    pushUrl("custom", draftFrom, draftTo);
  };

  // A custom chip with nothing applied yet has no query; nothing is fetched.
  const rq = range === "custom" ? (from && to ? `range=custom&from=${from}&to=${to}` : "") : `range=${range}`;

  // ── Summary ──────────────────────────────────────────────────────────────
  const [sum, setSum] = useState<RevenueSummary | null>(null);
  const [sumKey, setSumKey] = useState<string | null>(null);
  const [sumErr, setSumErr] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!allowed || !accessToken || !rq) return;
    let live = true;
    getJson<RevenueSummary>(`${API_URL}/admin/super/revenue/summary?${rq}`, hdr())
      .then((d) => { if (live) { setSum(d); setSumKey(rq); setSumErr(""); } })
      .catch((e: Error) => { if (live) { setSumErr(e.message); setSumKey(rq); } });
    return () => { live = false; };
  }, [allowed, accessToken, rq, hdr, reloadTick]);

  const refreshing = !!sum && sumKey !== rq && !!rq;

  // ── Tabs: paying users / transactions ────────────────────────────────────
  const [tab, setTab] = useState<"customers" | "orders">("customers");

  if (!allowed) return <AdminPage title="Revenue" icon={<IndianRupee size={16} />} head><Loading /></AdminPage>;

  const t = sum?.totals;
  const prev = sum?.previous;
  const days = sum?.range.days ?? 0;
  const vsLabel = range === "today" ? "vs yesterday" : `vs previous ${days} days`;
  const rangeLabel = sum
    ? sum.range.from === sum.range.to
      ? range === "today" ? "today" : prettyDay(sum.range.from, true)
      : `${prettyDay(sum.range.from)} – ${prettyDay(sum.range.to, true)}`
    : "";

  return (
    <AdminPage title="Revenue" subtitle={ABOUT} icon={<IndianRupee size={16} />} width={1280}>
      <style>{RV_CSS}</style>

      {/* ── Hero: the range's takings + the always-on quick strip ────────── */}
      <Hero>
        <div className="rv-hero">
          <div style={{ minWidth: 0 }}>
            <div className="rv-eyebrow">
              {refreshing && <Loader2 size={11} className="rv-spin" />}
              {sum ? <>Earned · {rangeLabel}</> : !rq ? "Pick a range" : sumErr ? "Could not load" : "Loading…"}
            </div>
            <div className="rv-big">{t ? <MoneyUp paise={t.revenueInrPaise} /> : "—"}</div>
            {t && prev && <Delta now={t.revenueInrPaise} prev={prev.revenueInrPaise} label={vsLabel} dark />}
          </div>
          <div className="rv-quick">
            {sum && ([
              { k: "today" as const, l: "Today", c: sum.quick.today },
              { k: "7d" as const, l: "7 days", c: sum.quick.last7 },
              { k: "30d" as const, l: "30 days", c: sum.quick.last30 },
              { k: "90d" as const, l: "90 days", c: sum.quick.last90 },
            ]).map((q, i) => (
              <motion.button
                key={q.k}
                type="button"
                className="rv-q"
                data-on={range === q.k ? "1" : "0"}
                onClick={() => pickRange(q.k)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.05 }}
                title={`Show ${q.l.toLowerCase()}`}
              >
                <span className="rv-q-l">{q.l}</span>
                <span className="rv-q-v">{inr(q.c.revenueInrPaise)}</span>
                <span className="rv-q-s">{q.c.orders} {q.c.orders === 1 ? "order" : "orders"}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </Hero>

      {/* ── Range picker ─────────────────────────────────────────────────── */}
      <div className="rv-bar">
        <ChipGroup<RangeKey> id="rv-range" value={range} onChange={pickRange} options={RANGES} />
        {range === "custom" && (
          <motion.div className="rv-custom" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <CalendarDays size={14} color={A.goldDeep} style={{ flex: "none" }} />
            <input type="date" className="adk-input rv-date" value={draftFrom} max={istDay()} onChange={(e) => setDraftFrom(e.target.value)} aria-label="From" />
            <span style={{ color: A.muted, fontSize: 12 }}>to</span>
            <input type="date" className="adk-input rv-date" value={draftTo} max={istDay()} onChange={(e) => setDraftTo(e.target.value)} aria-label="To" />
            <button type="button" className="adk-btn" data-v="primary" onClick={applyCustom} disabled={!!customError || (draftFrom === from && draftTo === to)} style={{ height: 34 }}>
              Apply
            </button>
            {customError && <span className="rv-err">{customError}</span>}
          </motion.div>
        )}
      </div>

      {!rq ? (
        <EmptyState icon={<CalendarDays size={20} />} title="Choose the days to report on" note="Pick a start and an end, then Apply. Up to 366 days." />
      ) : sumErr && !sum ? (
        <ErrorBox msg={sumErr} onRetry={() => setReloadTick((n) => n + 1)} />
      ) : !sum || !t || !prev ? (
        <Loading label="Loading revenue…" h={420} />
      ) : (
        <div style={{ opacity: refreshing ? 0.6 : 1, transition: "opacity .2s" }}>
          {sumErr && <ErrorBox msg={sumErr} onRetry={() => setReloadTick((n) => n + 1)} compact />}

          {/* ── KPIs ──────────────────────────────────────────────────── */}
          <div className="rv-kpis">
            <Kpi i={0} icon={<IndianRupee size={14} />} label="Revenue" accent={A.gold} money now={t.revenueInrPaise} prev={prev.revenueInrPaise} vs={vsLabel} />
            <Kpi i={1} icon={<ShoppingBag size={14} />} label="Paid orders" accent={A.goldDeep} now={t.orders} prev={prev.orders} vs={vsLabel} />
            <Kpi i={2} icon={<Users size={14} />} label="Paying users" accent={A.maroon} now={t.payingUsers} prev={prev.payingUsers} vs={vsLabel} />
            <Kpi i={3} icon={<UserPlus size={14} />} label="New paying users" accent={A.ok} now={t.newPayingUsers} prev={prev.newPayingUsers} vs={vsLabel} />
            <Kpi i={4} icon={<Receipt size={14} />} label="Avg order" accent={A.rust} money now={t.avgOrderInrPaise} prev={prev.avgOrderInrPaise} vs={vsLabel} />
            <Kpi i={5} icon={<BadgePercent size={14} />} label="Discounts given" accent={A.warn} money now={t.discountGivenInrPaise} prev={prev.discountGivenInrPaise} vs={vsLabel} neutral />
            <Kpi i={6} icon={<Coins size={14} />} label="Points unlocks" accent={A.info} now={t.pointsUnlocks} prev={prev.pointsUnlocks} vs={vsLabel}
              extra={t.pointsSpent ? `${t.pointsSpent.toLocaleString("en-IN")} pts spent` : undefined} />
            <Kpi i={7} icon={<UserRoundPlus size={14} />} label="Sign-ups" accent="#4a6fa5" now={t.signups} prev={prev.signups} vs={vsLabel} />
            <Kpi i={8} icon={<FileText size={14} />} label="Pages created" accent="#7c3a2e" now={t.pagesCreated} prev={prev.pagesCreated} vs={vsLabel} />
          </div>

          {/* ── Daily ─────────────────────────────────────────────────── */}
          <Daily sum={sum} rangeLabel={rangeLabel} />

          {/* ── Who paid / every transaction ──────────────────────────── */}
          <Panel pad={12} delay={0.08} style={{ marginBottom: 10 }}>
            <div className="rv-tabs-h">
              <ChipGroup
                id="rv-tab"
                value={tab}
                onChange={setTab}
                options={[
                  { value: "customers", label: <><Users size={13} /> Paying users</>, count: t.payingUsers },
                  { value: "orders", label: <><Receipt size={13} /> Transactions</> },
                ]}
              />
            </div>
            {tab === "customers"
              ? <Customers rq={rq} hdr={hdr} rangeLabel={rangeLabel} onOpen={(id) => router.push(`/admin/users/${id}?tab=billing`)} pushToast={pushToast} />
              : <Orders rq={rq} hdr={hdr} rangeLabel={rangeLabel} onOpen={(id) => router.push(`/admin/users/${id}?tab=billing`)} pushToast={pushToast} />}
          </Panel>

          {/* ── Where it came from ────────────────────────────────────── */}
          <div className="adk-grid2">
            <Panel title="By template" icon={<Layers size={15} color={A.goldDeep} />} note={rangeLabel} delay={0.1}>
              <Breakdown
                rows={sum.byTemplate.map((r) => ({ key: r.templateType, label: r.label || r.templateType, paise: r.revenueInrPaise, orders: r.orders }))}
                empty="No paid templates in this range."
              />
            </Panel>
            <Panel
              title="By country"
              icon={<Globe2 size={15} color={A.rust} />}
              note={rangeLabel}
              delay={0.12}
              right={sum.byCurrency.length > 1 ? (
                <span style={{ display: "flex", gap: 4 }}>
                  {sum.byCurrency.map((c) => <Tag key={c.currency}>{money(c.amount, c.currency)} · {c.orders}</Tag>)}
                </span>
              ) : undefined}
            >
              <Breakdown
                rows={sum.byCountry.map((r) => ({ key: r.country || "?", label: r.country ? countryName(r.country) : "Unknown", paise: r.revenueInrPaise, orders: r.orders }))}
                empty="No paid orders in this range."
              />
            </Panel>
          </div>
          <p className="rv-foot"><Globe2 size={11} /> Days run midnight to midnight, India time (IST). USD orders are shown in rupees at the rate frozen on each order.</p>
        </div>
      )}
    </AdminPage>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function MoneyUp({ paise }: { paise: number }) {
  return <>{inr(useCountUp(Math.round(paise || 0)))}</>;
}

/** ▲ 12% / ▼ 8% against the previous period. `neutral` = up is not "good" (discounts). */
function Delta({ now, prev, label, dark, neutral }: { now: number; prev: number; label: string; dark?: boolean; neutral?: boolean }) {
  const d = pctChange(now, prev);
  const up = d !== null && d > 0, down = d !== null && d < 0;
  const good = neutral ? null : up ? true : down ? false : null;
  const color = dark
    ? good === true ? "#9ff0b4" : good === false ? "#ffb3b3" : "rgba(255,236,210,.8)"
    : good === true ? A.ok : good === false ? A.danger : A.muted;
  const bgc = dark
    ? good === true ? "rgba(125,220,150,.16)" : good === false ? "rgba(255,140,140,.16)" : "rgba(255,255,255,.08)"
    : "transparent";
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  return (
    <span className="rv-delta" data-dark={dark ? "1" : "0"} style={{ color, background: bgc }} title={`Previous period: ${prev.toLocaleString("en-IN")}`}>
      <Icon size={dark ? 12 : 11} />
      {d === null ? "new" : `${d > 0 ? "+" : ""}${d}%`}
      <span style={{ opacity: 0.75, fontWeight: 600 }}>{label}</span>
    </span>
  );
}

function Kpi({
  i, icon, label, accent, now, prev, vs, money: isMoney, neutral, extra,
}: {
  i: number; icon: ReactNode; label: string; accent: string; now: number; prev: number; vs: string;
  money?: boolean; neutral?: boolean; extra?: string;
}) {
  return (
    <StatTile
      icon={icon}
      label={label}
      accent={accent}
      delay={0.04 + i * 0.03}
      value={isMoney ? <MoneyUp paise={now} /> : now}
      sub={
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Delta now={now} prev={prev} label={vs} neutral={neutral} />
          {extra && <span style={{ color: A.muted, fontWeight: 600 }}>{extra}</span>}
        </span>
      }
    />
  );
}

function ErrorBox({ msg, onRetry, compact }: { msg: string; onRetry: () => void; compact?: boolean }) {
  return (
    <div className="rv-errbox" data-compact={compact ? "1" : "0"} role="alert">
      <AlertTriangle size={compact ? 14 : 18} color={A.danger} style={{ flex: "none" }} />
      <span style={{ flex: 1, minWidth: 0 }}>{compact ? `Could not refresh: ${msg}` : msg}</span>
      <button type="button" className="adk-btn" onClick={onRetry} style={{ height: 30 }}><RefreshCw size={12} /> Retry</button>
    </div>
  );
}

/** Revenue bars + orders line per IST day, and the same numbers as a table. */
function Daily({ sum, rangeLabel }: { sum: RevenueSummary; rangeLabel: string }) {
  const data = sum.daily.map((d) => ({ ...d, rupees: d.revenueInrPaise / 100 }));
  const tot = sum.daily.reduce(
    (a, d) => ({ r: a.r + d.revenueInrPaise, o: a.o + d.orders, p: a.p + d.payingUsers, s: a.s + d.signups }),
    { r: 0, o: 0, p: 0, s: 0 }
  );
  const best = sum.daily.reduce((m, d) => (d.revenueInrPaise > m ? d.revenueInrPaise : m), 0);
  const rows = [...sum.daily].reverse();
  const tip = { background: "#fff", border: `1px solid ${A.edge}`, borderRadius: 10, color: A.ink, fontSize: 11, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };

  return (
    <div className="rv-daily">
      <Panel title="Daily earnings" icon={<TrendingUp size={15} color={A.gold} />} note={rangeLabel} delay={0.05}
        right={<span className="rv-legend"><i style={{ background: A.gold }} /> Revenue <i style={{ background: A.maroon, borderRadius: 99, height: 3 }} /> Orders</span>}>
        {tot.r === 0 && tot.o === 0 ? (
          <EmptyState icon={<IndianRupee size={20} />} title="No paid orders in this range" note="Sign-ups and pages still count above." />
        ) : (
          <div style={{ width: "100%", height: "clamp(190px, 28vw, 260px)" }}>
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 8, right: 4, left: -4, bottom: 0 }}>
                <defs>
                  <linearGradient id="rvBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2c574" />
                    <stop offset="100%" stopColor={A.gold} stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: A.muted, fontSize: 9 }} tickFormatter={(v) => prettyDay(String(v))} minTickGap={14} />
                <YAxis yAxisId="r" tick={{ fill: A.muted, fontSize: 9 }} width={44} tickFormatter={(v) => inrShort(Number(v) * 100)} />
                <YAxis yAxisId="o" orientation="right" tick={{ fill: A.muted, fontSize: 9 }} width={24} allowDecimals={false} />
                <Tooltip
                  contentStyle={tip}
                  cursor={{ fill: "rgba(201,168,76,.1)" }}
                  labelFormatter={(l) => prettyDay(String(l), true)}
                  formatter={(v, n) => (n === "Revenue" ? [inr(Number(v) * 100), n] : [v, n])}
                />
                <Bar yAxisId="r" dataKey="rupees" name="Revenue" fill="url(#rvBar)" radius={[5, 5, 0, 0]} maxBarSize={34} animationDuration={600} />
                <Line yAxisId="o" dataKey="orders" name="Orders" type="monotone" stroke={A.maroon} strokeWidth={2} dot={{ r: data.length > 40 ? 0 : 2.5, fill: A.maroon }} animationDuration={700} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="By day" icon={<CalendarDays size={15} color={A.goldDeep} />} note={`${sum.daily.length} ${sum.daily.length === 1 ? "day" : "days"}`} delay={0.07} pad={12}>
        <div className="rv-tw rv-daytable">
          <table className="rv-table">
            <thead>
              <tr><th>Day</th><th className="r">Revenue</th><th className="r">Orders</th><th className="r">Payers</th><th className="r">Sign-ups</th></tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.date} data-zero={d.revenueInrPaise === 0 ? "1" : "0"}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {prettyDay(d.date)}
                    {d.revenueInrPaise > 0 && d.revenueInrPaise === best && sum.daily.length > 1 && <span className="rv-best" title="Best day in range">best</span>}
                  </td>
                  <td className="r b">{inr(d.revenueInrPaise)}</td>
                  <td className="r">{d.orders}</td>
                  <td className="r">{d.payingUsers}</td>
                  <td className="r">{d.signups}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td>Total</td><td className="r">{inr(tot.r)}</td><td className="r">{tot.o}</td><td className="r" title="Sum of daily payers; a person paying on two days counts twice">{tot.p}</td><td className="r">{tot.s}</td></tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Breakdown({ rows, empty }: { rows: { key: string; label: string; paise: number; orders: number }[]; empty: string }) {
  if (!rows.length) return <p className="rv-none">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.paise));
  const total = rows.reduce((a, r) => a + r.paise, 0) || 1;
  return (
    <div style={{ maxHeight: 320, overflowY: "auto", margin: "0 -6px", padding: "0 6px" }}>
      {rows.map((r, i) => (
        <div key={r.key} className="rv-brow">
          <span className="rv-brow-l" title={r.label}>{r.label}</span>
          <span className="rv-brow-v">
            <b>{inr(r.paise)}</b> · {r.orders} · <span style={{ color: A.muted }}>{Math.round((r.paise / total) * 100)}%</span>
          </span>
          <div className="rv-brow-bar">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(r.paise / max) * 100}%` }} transition={{ delay: 0.05 + Math.min(i, 12) * 0.03, duration: 0.6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const REGION = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
function countryName(code: string) {
  try { return `${REGION?.of(code.toUpperCase()) || code} (${code.toUpperCase()})`; } catch { return code; }
}

function Avatar({ name, src, size = 32 }: { name: string; src?: string; size?: number }) {
  return src ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt="" className="rv-av" style={{ width: size, height: size }} />
  ) : (
    <span className="rv-av rv-av-i" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(name || "?").slice(0, 1).toUpperCase()}</span>
  );
}

function Pager({ pg, onPage, busy }: { pg: Pagination; onPage: (p: number) => void; busy?: boolean }) {
  if (pg.totalPages <= 1) return null;
  return (
    <div className="rv-pager">
      <button className="adk-btn" onClick={() => onPage(pg.page - 1)} disabled={busy || pg.page <= 1} aria-label="Previous page" style={{ width: 36, padding: 0 }}><ChevronLeft size={15} /></button>
      <span>{pg.page} / {pg.totalPages} <span style={{ color: A.muted, fontWeight: 600 }}>· {pg.total.toLocaleString("en-IN")}</span></span>
      <button className="adk-btn" onClick={() => onPage(pg.page + 1)} disabled={busy || pg.page >= pg.totalPages} aria-label="Next page" style={{ width: 36, padding: 0 }}><ChevronRight size={15} /></button>
    </div>
  );
}

type Toaster = ReturnType<typeof useToast>["pushToast"];

/** Every page of a list endpoint, up to EXPORT_CAP rows, for the CSV. */
async function fetchAll<T>(base: string, hdr: Record<string, string>): Promise<{ items: T[]; capped: boolean }> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const d = await getJson<{ items: T[]; pagination: Pagination }>(`${base}&page=${page}&limit=100`, hdr);
    items.push(...d.items);
    if (items.length >= EXPORT_CAP) return { items: items.slice(0, EXPORT_CAP), capped: true };
    if (page >= (d.pagination?.totalPages || 1) || !d.items.length) return { items, capped: false };
  }
}

/** A list tab's fetch/paging state, keyed by its query so a stale answer never lands. */
function useList<T>(url: string | null, hdr: () => Record<string, string>) {
  const [data, setData] = useState<{ items: T[]; pagination: Pagination } | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!url) return;
    let live = true;
    getJson<{ items: T[]; pagination: Pagination }>(url, hdr())
      .then((d) => { if (live) { setData(d); setKey(url); setErr(""); } })
      .catch((e: Error) => { if (live) { setErr(e.message); setKey(url); } });
    return () => { live = false; };
  }, [url, hdr, tick]);
  return { data, err, loading: key !== url, retry: () => setTick((n) => n + 1) };
}

function ExportBtn({ busy, onClick, disabled }: { busy: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="adk-btn" data-v="gold" onClick={onClick} disabled={busy || disabled} title={`Download as CSV (up to ${EXPORT_CAP.toLocaleString("en-IN")} rows)`} style={{ height: 34 }}>
      {busy ? <Loader2 size={13} className="rv-spin" /> : <Download size={13} />} CSV
    </button>
  );
}

// ── Paying users ─────────────────────────────────────────────────────────────

function Customers({
  rq, hdr, rangeLabel, onOpen, pushToast,
}: {
  rq: string; hdr: () => Record<string, string>; rangeLabel: string; onOpen: (id: string) => void; pushToast: Toaster;
}) {
  const [q, setQ] = useState("");
  const [qApplied, setQApplied] = useState("");
  const [sort, setSort] = useState<"revenue" | "recent" | "orders">("revenue");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Debounced: a search per keystroke would hammer an aggregation.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onQ = (v: string) => {
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setQApplied(v.trim()); setPage(1); }, 350);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { setPage(1); }, [rq]);

  const base = `${API_URL}/admin/super/revenue/customers?${rq}&sort=${sort}${qApplied ? `&q=${encodeURIComponent(qApplied)}` : ""}`;
  const { data, err, loading, retry } = useList<Customer>(`${base}&page=${page}&limit=${PAGE_SIZE}`, hdr);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { items, capped } = await fetchAll<Customer>(base, hdr());
      downloadCsv(
        `paying-users-${rq.replace(/[^a-z0-9]+/gi, "-")}.csv`,
        ["User ID", "Name", "Email", "Country", "Status", "Joined", "Pages created", "Orders in range", "Paid in range (INR)", "Lifetime orders", "Lifetime paid (INR)", "First paid", "Last paid"],
        items.map((c) => [c.userId, c.name, c.email, c.country || "", c.status || "active", istTime(c.joinedAt), c.pagesCreated, c.orders, rupeesPlain(c.revenueInrPaise), c.lifetimeOrders, rupeesPlain(c.lifetimeRevenueInrPaise), istTime(c.firstPaidAt), istTime(c.lastPaidAt)])
      );
      pushToast({ title: capped ? `Exported the first ${EXPORT_CAP} paying users` : `Exported ${items.length} paying users`, type: "success" });
    } catch (e) {
      pushToast({ title: (e as Error).message || "Export failed", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const items = data?.items ?? [];
  return (
    <>
      <div className="rv-tools">
        <SearchBox value={q} onChange={onQ} onEnter={() => { setQApplied(q.trim()); setPage(1); }} placeholder="Search name or email…" style={{ flex: "1 1 220px" }} />
        <ChipGroup
          id="rv-sort"
          value={sort}
          onChange={(v) => { setSort(v); setPage(1); }}
          options={[{ value: "revenue", label: "Top paid" }, { value: "recent", label: "Recent" }, { value: "orders", label: "Most orders" }]}
        />
        <ExportBtn busy={exporting} onClick={exportCsv} disabled={!items.length} />
      </div>

      {err && !data ? (
        <ErrorBox msg={err} onRetry={retry} />
      ) : !data ? (
        <Loading label="Loading paying users…" />
      ) : !items.length ? (
        <EmptyState icon={<Users size={20} />} title={qApplied ? "Nobody matches that search" : "Nobody paid in this range"} note={qApplied ? "Search looks at name and email." : `No paid orders ${rangeLabel ? `for ${rangeLabel}` : ""}.`} />
      ) : (
        <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity .2s" }}>
          {err && <ErrorBox msg={err} onRetry={retry} compact />}
          <div className="rv-tw rv-lg">
            <table className="rv-table rv-click">
              <thead>
                <tr><th>User</th><th>Joined</th><th className="r">Pages</th><th className="r">Orders</th><th className="r">Paid in range</th><th className="r">Lifetime</th><th>Last paid</th><th /></tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.userId} onClick={() => onOpen(c.userId)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(c.userId)}>
                    <td>
                      <div className="rv-who">
                        <Avatar name={c.name} src={c.avatar} />
                        <div style={{ minWidth: 0 }}>
                          <div className="rv-who-n">{c.name || "—"} <StatusTag status={c.status} /></div>
                          <div className="rv-who-e">{c.email}{c.country ? ` · ${c.country}` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="nw">{prettyDay(istDayOf(c.joinedAt), true)}</td>
                    <td className="r">{c.pagesCreated}</td>
                    <td className="r">{c.orders}<span className="rv-of"> / {c.lifetimeOrders}</span></td>
                    <td className="r b">{inr(c.revenueInrPaise)}</td>
                    <td className="r">{inr(c.lifetimeRevenueInrPaise)}</td>
                    <td className="nw">{istTime(c.lastPaidAt)}</td>
                    <td><ChevronRight size={14} color={A.muted} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rv-sm rv-cards">
            {items.map((c) => (
              <button key={c.userId} type="button" className="adk-card" onClick={() => onOpen(c.userId)}>
                <div className="rv-who">
                  <Avatar name={c.name} src={c.avatar} size={36} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="rv-who-n">{c.name || "—"} <StatusTag status={c.status} /></div>
                    <div className="rv-who-e">{c.email}</div>
                  </div>
                  <div style={{ textAlign: "right", flex: "none" }}>
                    <div className="rv-card-amt">{inr(c.revenueInrPaise)}</div>
                    <div className="rv-who-e">{c.orders} {c.orders === 1 ? "order" : "orders"}</div>
                  </div>
                </div>
                <div className="rv-card-meta">
                  <span>Lifetime <b>{inr(c.lifetimeRevenueInrPaise)}</b></span>
                  <span>{c.pagesCreated} pages</span>
                  <span>Last paid {c.lastPaidAt ? prettyDay(istDayOf(c.lastPaidAt)) : "—"}</span>
                </div>
              </button>
            ))}
          </div>
          {data && <Pager pg={data.pagination} onPage={setPage} busy={loading} />}
        </div>
      )}
    </>
  );
}

// ── Transactions ─────────────────────────────────────────────────────────────

function Orders({
  rq, hdr, rangeLabel, onOpen, pushToast,
}: {
  rq: string; hdr: () => Record<string, string>; rangeLabel: string; onOpen: (id: string) => void; pushToast: Toaster;
}) {
  const [status, setStatus] = useState<OrderStatus | "all">("paid");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  useEffect(() => { setPage(1); }, [rq]);

  const base = `${API_URL}/admin/super/revenue/orders?${rq}&status=${status}`;
  const { data, err, loading, retry } = useList<Order>(`${base}&page=${page}&limit=${PAGE_SIZE}`, hdr);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { items, capped } = await fetchAll<Order>(base, hdr());
      downloadCsv(
        `transactions-${status}-${rq.replace(/[^a-z0-9]+/gi, "-")}.csv`,
        ["Order ID", "Invoice", "Status", "Created (IST)", "Paid (IST)", "User ID", "Name", "Email", "Country", "Template", "Page ID", "Share ID", "Currency", "List price", "Discount", "Offer", "Amount paid", "INR value", "Points used", "Razorpay order", "Razorpay payment"],
        items.map((o) => [
          o._id, o.invoiceNumber || "", o.status, istTime(o.createdAt), istTime(o.paidAt), o.userId, o.userName, o.userEmail, o.country || "",
          o.templateLabel || o.templateType, o.pageId || "", o.pageShareId || "", o.currency,
          (o.listAmount / 100).toFixed(2), (o.discountAmount / 100).toFixed(2), discountLabel(o), (o.amount / 100).toFixed(2),
          rupeesPlain(o.amountInrPaise), o.pointsUsed || 0, o.razorpayOrderId || "", o.razorpayPaymentId || "",
        ])
      );
      pushToast({ title: capped ? `Exported the first ${EXPORT_CAP} transactions` : `Exported ${items.length} transactions`, type: "success" });
    } catch (e) {
      pushToast({ title: (e as Error).message || "Export failed", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const items = data?.items ?? [];
  return (
    <>
      <div className="rv-tools">
        <ChipGroup<OrderStatus | "all">
          id="rv-status"
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          style={{ flex: "1 1 auto" }}
          options={[
            { value: "paid", label: "Paid", tone: A.ok },
            { value: "points_used", label: "Points", tone: A.info },
            { value: "failed", label: "Failed", tone: A.danger },
            { value: "created", label: "Abandoned" },
            { value: "all", label: "All" },
          ]}
        />
        <ExportBtn busy={exporting} onClick={exportCsv} disabled={!items.length} />
      </div>

      {err && !data ? (
        <ErrorBox msg={err} onRetry={retry} />
      ) : !data ? (
        <Loading label="Loading transactions…" />
      ) : !items.length ? (
        <EmptyState icon={<Receipt size={20} />} title="No transactions" note={`Nothing ${status === "all" ? "" : `${STATUS_LABEL[status]?.toLowerCase()} `}${rangeLabel ? `for ${rangeLabel}` : ""}.`} />
      ) : (
        <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity .2s" }}>
          {err && <ErrorBox msg={err} onRetry={retry} compact />}
          <OrderTable orders={items} onUser={onOpen} showUser />
          {data && <Pager pg={data.pagination} onPage={setPage} busy={loading} />}
        </div>
      )}
    </>
  );
}

function StatusTag({ status }: { status?: string }) {
  if (!status || status === "active") return null;
  const tone = status === "closed" ? "#5b5560" : status === "banned" ? A.danger : A.warn;
  return <Tag tone={tone} style={{ textTransform: "capitalize", marginLeft: 4, verticalAlign: "middle" }}>{status}</Tag>;
}

const RV_CSS = `
  ${RV_TABLE_CSS}
  @keyframes rvspin { to { transform: rotate(360deg); } }
  .rv-spin { animation: rvspin .8s linear infinite; }
  .rv-hero { display: grid; grid-template-columns: minmax(0,1fr); gap: 14px; align-items: end; }
  @media (min-width: 900px) { .rv-hero { grid-template-columns: minmax(0,.9fr) minmax(0,1.4fr); } }
  .rv-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #e9c98a; }
  .rv-big { margin: 6px 0 8px; font-family: 'Playfair Display', serif; font-weight: 800; line-height: 1; color: #ffe3a3;
    font-size: clamp(34px, 9vw, 48px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .rv-quick { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 7px; }
  @media (min-width: 560px) { .rv-quick { grid-template-columns: repeat(4, minmax(0,1fr)); } }
  .rv-q { all: unset; box-sizing: border-box; cursor: pointer; min-width: 0; padding: 9px 11px; border-radius: 13px; display: flex; flex-direction: column; gap: 3px;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,236,190,.12); transition: background .2s, transform .2s, border-color .2s; }
  .rv-q:hover { background: rgba(255,255,255,.11); transform: translateY(-1px); }
  .rv-q:focus-visible { outline: 2px solid #ffe3a3; outline-offset: 1px; }
  .rv-q[data-on="1"] { background: linear-gradient(135deg, rgba(255,227,163,.2), rgba(201,168,76,.08)); border-color: rgba(255,227,163,.45); }
  .rv-q-l { font-size: 9.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,236,210,.7); }
  .rv-q-v { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 800; color: #fff; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rv-q[data-on="1"] .rv-q-v { color: #ffe3a3; }
  .rv-q-s { font-size: 10.5px; color: rgba(255,236,210,.75); }
  .rv-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 800; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  .rv-delta[data-dark="1"] { padding: 3px 9px; border-radius: 99px; font-size: 11px; }
  .rv-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; min-width: 0; }
  .rv-bar > .adk-chips { max-width: 100%; }
  .rv-custom { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0; }
  .rv-date { width: auto; height: 34px; padding: 0 8px; font-size: 12.5px; flex: 1 1 130px; min-width: 0; max-width: 160px; }
  .rv-err { font-size: 11.5px; color: ${A.danger}; font-weight: 700; flex-basis: 100%; }
  .rv-kpis { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; margin-bottom: 10px; }
  @media (min-width: 900px) { .rv-kpis { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; } }
  /* Nine tiles: Revenue takes two cells so the grid closes evenly (2 or 5 across). */
  .rv-kpis > :first-child { grid-column: span 2; }
  @media (min-width: 900px) and (max-width: 1179px) { .rv-kpis > :first-child { grid-column: auto; } }
  @media (min-width: 1180px) { .rv-kpis { grid-template-columns: repeat(5, minmax(0,1fr)); } }
  .rv-kpis .adk-stat-val { font-size: clamp(19px, 4.6vw, 25px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rv-kpis .adk-stat-sub { white-space: normal; }
  .rv-daily { display: grid; grid-template-columns: minmax(0,1fr); gap: 10px; margin-bottom: 10px; }
  @media (min-width: 1000px) { .rv-daily { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr); } }
  .rv-daytable { max-height: 300px; overflow-y: auto; }
  .rv-daytable tr[data-zero="1"] td { color: ${A.muted}; }
  .rv-daytable tfoot td { font-weight: 800; border-top: 1px solid rgba(61,12,17,.16); border-bottom: none; position: sticky; bottom: 0; background: #fbf4ea; }
  .rv-best { margin-left: 6px; padding: 1px 6px; border-radius: 99px; font-size: 9px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
    color: ${A.goldDeep}; background: rgba(201,168,76,.18); }
  .rv-legend { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: ${A.muted}; font-weight: 700; }
  .rv-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; }
  .rv-tabs-h { margin-bottom: 10px; }
  .rv-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; min-width: 0; }
  .rv-tools > .adk-chips { max-width: 100%; }
  .rv-av { border-radius: 10px; object-fit: cover; flex: none; display: block; }
  .rv-av-i { display: grid; place-items: center; color: #fff; font-weight: 800; background: linear-gradient(135deg, ${A.gold}, ${A.goldDeep}); }
  .rv-pager { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 0 2px; font-size: 12px; font-weight: 800; color: ${A.ink}; }
  .rv-brow { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 3px 10px; align-items: center; padding: 6px; border-radius: 9px; }
  .rv-brow:hover { background: rgba(201,168,76,.08); }
  .rv-brow-l { font-size: 12px; font-weight: 700; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rv-brow-v { font-size: 11px; color: ${A.soft}; font-weight: 700; white-space: nowrap; }
  .rv-brow-v b { color: ${A.ink}; }
  .rv-brow-bar { grid-column: 1 / -1; height: 5px; border-radius: 99px; background: rgba(61,12,17,.05); overflow: hidden; }
  .rv-brow-bar > div { height: 100%; border-radius: 99px; background: linear-gradient(90deg, ${A.goldDeep}, ${A.gold}); }
  .rv-none { font-size: 12px; color: ${A.muted}; text-align: center; padding: 24px 0; margin: 0; }
  .rv-errbox { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 14px; font-size: 12.5px; font-weight: 600; color: ${A.ink};
    background: rgba(179,38,30,.06); border: 1px solid rgba(179,38,30,.2); margin-bottom: 10px; }
  .rv-errbox[data-compact="1"] { padding: 8px 10px; font-size: 12px; }
  .rv-foot { margin: 12px 2px 0; font-size: 10.5px; color: ${A.muted}; display: flex; align-items: center; gap: 5px; }
`;
