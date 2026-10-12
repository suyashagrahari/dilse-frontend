"use client";

// ─── Super admin: who made what ───────────────────────────────────────────────
//
// Pages created in a range — Today (the default), 7, 30 or 90 days, or any
// custom span — and by whom. Every person is a card with the templates they
// made, pictured; a click opens their profile on the Pages tab, where every
// page they ever made is listed with its cover.
//
// One template can be picked to narrow the whole screen: "who made a Dandiya
// invitation this week, and on which days". Range and template live in the URL
// (`?range=7d&template=dandiya-partner`) so a view survives a refresh and can
// be pasted into a chat.
//
// The server does all the counting (GET /admin/super/creations); this page
// only displays it. Days run midnight to midnight, India time.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  FilePlus2, Users, Sparkles, Globe, CalendarDays, Layers, Loader2, TrendingUp, TrendingDown, Minus,
  RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, Clock3, UserPlus, Activity,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import TemplateSelect from "@/components/admin/TemplateSelect";
import {
  A, AdminPage, Panel, Hero, StatTile, ChipGroup, SearchBox, Loading, EmptyState, Tag, useCountUp,
} from "../adminKit";
import { type RangeKey, type Pagination, pctChange, istDay, prettyDay, istTime, isYmd } from "../revenue/types";
import TemplateThumb from "../TemplateThumb";

// ── The server's words ───────────────────────────────────────────────────────

interface TemplateRef { templateType: string; label: string; slug: string }
interface Creator {
  userId: string; name: string; email: string; avatar: string; joinedAt: string | null; status: string; exists: boolean;
  pages: number; published: number; firstAt: string; lastAt: string; firstTime: boolean; newUser: boolean;
  templates: (TemplateRef & { count: number })[];
}
interface RecentPage extends TemplateRef {
  _id: string; shareId: string | null; isPublished: boolean; createdAt: string;
  user: { userId: string; name: string; avatar: string; exists: boolean };
}
interface Creations {
  range: { from: string; to: string; label: string; days: number; key: RangeKey };
  template: TemplateRef | null;
  totals: { pages: number; creators: number; published: number; firstTimeCreators: number };
  previous: { pages: number; creators: number };
  quick: Record<"today" | "last7" | "last30" | "last90", { pages: number; creators: number }>;
  daily: { date: string; pages: number; creators: number }[];
  byTemplate: (TemplateRef & { pages: number; creators: number; published: number })[];
  creators: { items: Creator[]; pagination: Pagination };
  recent: RecentPage[];
  templates: TemplateRef[];
}

const ABOUT = (
  <>
    Every page people made, and who made it. Pick a day range — <b>Today</b> by default — and, if you like, one
    template. Each person shows the templates they made; click them for their profile with every page they ever
    created. Days run midnight to midnight, India time.
  </>
);

const RANGES: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "custom", label: "Custom" },
];
const PAGE_SIZE = 24;

/** `?range=…&from=…&to=…&template=…` → where to open. Default: today, every template. */
function readUrl(): { range: RangeKey; from: string; to: string; template: string } {
  const none = { range: "today" as RangeKey, from: "", to: "", template: "" };
  if (typeof window === "undefined") return none;
  const p = new URLSearchParams(window.location.search);
  const r = p.get("range"), f = p.get("from"), t = p.get("to");
  const template = (p.get("template") || "").slice(0, 60);
  if (r === "custom" && isYmd(f) && isYmd(t) && f <= t) return { range: "custom", from: f, to: t, template };
  if (r === "today" || r === "7d" || r === "30d" || r === "90d") return { range: r, from: "", to: "", template };
  return { ...none, template };
}

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

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;

export default function AdminCreationsPage() {
  const router = useRouter();
  const { accessToken, user, isLoading } = useAppSelector((s) => s.auth);
  const allowed = !!user && isSuperAdmin(user.role);
  useEffect(() => {
    if (!isLoading && user && !isSuperAdmin(user.role)) router.replace("/admin/analytics");
  }, [user, isLoading, router]);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  // ── Range + template, mirrored into the URL ──────────────────────────────
  const [initial] = useState(readUrl);
  const [range, setRange] = useState<RangeKey>(initial.range);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [draftFrom, setDraftFrom] = useState(initial.from || istDay(-6));
  const [draftTo, setDraftTo] = useState(initial.to || istDay());
  const [template, setTemplate] = useState(initial.template);

  const syncUrl = useCallback((r: RangeKey, f: string, t: string, tpl: string) => {
    const p = new URLSearchParams(window.location.search);
    p.set("range", r);
    if (r === "custom" && f && t) { p.set("from", f); p.set("to", t); } else { p.delete("from"); p.delete("to"); }
    if (tpl) p.set("template", tpl); else p.delete("template");
    window.history.replaceState(null, "", `${window.location.pathname}?${p}`);
  }, []);

  const pickRange = (r: RangeKey) => {
    if (r === "custom") { setRange("custom"); return; } // waits for Apply
    setRange(r); setFrom(""); setTo("");
    syncUrl(r, "", "", template);
  };
  const pickTemplate = (tpl: string) => {
    setTemplate(tpl);
    syncUrl(range, from, to, tpl);
  };

  const customError = useMemo(() => {
    if (!isYmd(draftFrom) || !isYmd(draftTo)) return "Pick both days.";
    if (draftFrom > draftTo) return "The start is after the end.";
    if (draftTo > istDay()) return "The end is in the future.";
    if ((Date.parse(draftTo) - Date.parse(draftFrom)) / 86400000 + 1 > 366) return "At most 366 days at a time.";
    return null;
  }, [draftFrom, draftTo]);
  const applyCustom = () => {
    if (customError) return;
    setFrom(draftFrom); setTo(draftTo);
    syncUrl("custom", draftFrom, draftTo, template);
  };

  // ── People list controls ─────────────────────────────────────────────────
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);
  const [sort, setSort] = useState<"pages" | "recent">("pages");

  const base = range === "custom" ? (from && to ? `range=custom&from=${from}&to=${to}` : "") : `range=${range}`;
  const rq = base ? `${base}${template ? `&template=${encodeURIComponent(template)}` : ""}` : "";
  // The page number belongs to one list: a new range / template / search /
  // sort starts the people list at page 1 again.
  const listKey = `${rq}|${q}|${sort}`;
  const [paged, setPaged] = useState({ k: "", p: 1 });
  const page = paged.k === listKey ? paged.p : 1;
  const setPage = (p: number) => setPaged({ k: listKey, p });
  const fullQ = rq ? `${rq}&sort=${sort}&page=${page}&limit=${PAGE_SIZE}${q ? `&q=${encodeURIComponent(q)}` : ""}` : "";

  // ── Fetch ────────────────────────────────────────────────────────────────
  const [data, setData] = useState<Creations | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!allowed || !accessToken || !fullQ) return;
    let live = true;
    getJson<Creations>(`${API_URL}/admin/super/creations?${fullQ}`, hdr())
      .then((d) => { if (live) { setData(d); setKey(fullQ); setErr(""); } })
      .catch((e: Error) => { if (live) { setErr(e.message); setKey(fullQ); } });
    return () => { live = false; };
  }, [allowed, accessToken, fullQ, hdr, tick]);
  const refreshing = !!data && key !== fullQ && !!fullQ;

  // The picker lists every template, each with how many were made in the range.
  const options = useMemo(() => {
    if (!data) return template ? [{ templateType: template, label: template }] : [];
    const n = new Map(data.byTemplate.map((t) => [t.templateType, t]));
    const all = data.templates.map((t) => {
      const c = n.get(t.templateType);
      return { templateType: t.templateType, label: c ? `${t.label} · ${plural(c.creators, "person", "people")}` : t.label, made: c?.pages || 0 };
    });
    // Templates made in the range first, busiest first; the rest alphabetical.
    return all.sort((a, b) => b.made - a.made || a.label.localeCompare(b.label));
  }, [data, template]);

  if (!allowed) return <AdminPage title="Created" icon={<FilePlus2 size={16} />} head><Loading /></AdminPage>;

  const t = data?.totals;
  const prev = data?.previous;
  const vsLabel = range === "today" ? "vs yesterday" : `vs previous ${data?.range.days ?? 0} days`;
  const rangeLabel = data
    ? data.range.from === data.range.to
      ? range === "today" ? "today" : prettyDay(data.range.from, true)
      : `${prettyDay(data.range.from)} – ${prettyDay(data.range.to, true)}`
    : "";
  const tplName = data?.template?.label || "";
  const openUser = (id: string) => router.push(`/admin/users/${id}?tab=pages`);

  return (
    <AdminPage title="Created" subtitle={ABOUT} icon={<FilePlus2 size={16} />} width={1280}>
      <style>{CR_CSS}</style>

      {/* ── Hero: pages made in the range + the always-on quick strip ────── */}
      <Hero>
        <div className="cr-hero">
          <div style={{ minWidth: 0, display: "flex", gap: 14, alignItems: "flex-end" }}>
            {data?.template && (
              <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} className="cr-hero-thumb">
                <TemplateThumb slug={data.template.slug} templateType={data.template.templateType} label={tplName} size={64} radius={12} />
              </motion.div>
            )}
            <div style={{ minWidth: 0 }}>
              <div className="cr-eyebrow">
                {refreshing && <Loader2 size={11} className="cr-spin" />}
                {data ? <>{tplName ? `${tplName} · ` : "Pages created · "}{rangeLabel}</> : !rq ? "Pick a range" : err ? "Could not load" : "Loading…"}
              </div>
              <div className="cr-big">
                {t ? <CountUp n={t.pages} /> : "—"}
                <span className="cr-big-u">{t ? (t.pages === 1 ? "page" : "pages") : ""}</span>
              </div>
              {t && (
                <div className="cr-line">
                  by <b>{plural(t.creators, "person", "people")}</b>
                  {t.firstTimeCreators > 0 && <> · <b>{t.firstTimeCreators}</b> made their first ever</>}
                  {prev && <> <Delta now={t.pages} prev={prev.pages} label={vsLabel} dark /></>}
                </div>
              )}
            </div>
          </div>
          <div className="cr-quick">
            {data && ([
              { k: "today" as const, l: "Today", c: data.quick.today },
              { k: "7d" as const, l: "7 days", c: data.quick.last7 },
              { k: "30d" as const, l: "30 days", c: data.quick.last30 },
              { k: "90d" as const, l: "90 days", c: data.quick.last90 },
            ]).map((x, i) => (
              <motion.button key={x.k} type="button" className="cr-q" data-on={range === x.k ? "1" : "0"} onClick={() => pickRange(x.k)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.05 }} title={`Show ${x.l.toLowerCase()}`}>
                <span className="cr-q-l">{x.l}</span>
                <span className="cr-q-v">{x.c.pages.toLocaleString("en-IN")} <small>{x.c.pages === 1 ? "page" : "pages"}</small></span>
                <span className="cr-q-s">{plural(x.c.creators, "person", "people")}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </Hero>

      {/* ── Range + template ─────────────────────────────────────────────── */}
      <div className="cr-bar">
        <ChipGroup<RangeKey> id="cr-range" value={range} onChange={pickRange} options={RANGES} />
        <div className="cr-tpl">
          <TemplateSelect value={template} options={options} onChange={pickTemplate} allLabel="Every template" width={250} />
        </div>
        {range === "custom" && (
          <motion.div className="cr-custom" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <CalendarDays size={14} color={A.goldDeep} style={{ flex: "none" }} />
            <input type="date" className="adk-input cr-date" value={draftFrom} max={istDay()} onChange={(e) => setDraftFrom(e.target.value)} aria-label="From" />
            <span style={{ color: A.muted, fontSize: 12 }}>to</span>
            <input type="date" className="adk-input cr-date" value={draftTo} max={istDay()} onChange={(e) => setDraftTo(e.target.value)} aria-label="To" />
            <button type="button" className="adk-btn" data-v="primary" onClick={applyCustom} disabled={!!customError || (draftFrom === from && draftTo === to)} style={{ height: 34 }}>
              Apply
            </button>
            {customError && <span className="cr-err">{customError}</span>}
          </motion.div>
        )}
      </div>

      {!rq ? (
        <EmptyState icon={<CalendarDays size={20} />} title="Choose the days to look at" note="Pick a start and an end, then Apply. Up to 366 days." />
      ) : err && !data ? (
        <ErrorBox msg={err} onRetry={() => setTick((n) => n + 1)} />
      ) : !data || !t || !prev ? (
        <Loading label="Loading pages created…" h={420} />
      ) : (
        <div style={{ opacity: refreshing ? 0.6 : 1, transition: "opacity .2s" }}>
          {err && <ErrorBox msg={err} onRetry={() => setTick((n) => n + 1)} compact />}

          <div className="cr-kpis">
            <StatTile icon={<FilePlus2 size={14} />} label="Pages created" accent={A.gold} delay={0.04} value={t.pages}
              sub={<Delta now={t.pages} prev={prev.pages} label={vsLabel} />} />
            <StatTile icon={<Users size={14} />} label="People who made one" accent={A.maroon} delay={0.07} value={t.creators}
              sub={<Delta now={t.creators} prev={prev.creators} label={vsLabel} />} />
            <StatTile icon={<Sparkles size={14} />} label="First-time creators" accent={A.ok} delay={0.1} value={t.firstTimeCreators}
              sub={<span style={{ color: A.muted, fontWeight: 600 }}>made their very first page</span>} />
            <StatTile icon={<Globe size={14} />} label="Published" accent={A.rust} delay={0.13} value={t.published}
              sub={<span style={{ color: A.muted, fontWeight: 600 }}>{t.pages ? `${Math.round((t.published / t.pages) * 100)}% of pages are live` : "nothing made yet"}</span>} />
          </div>

          <Daily data={data} rangeLabel={rangeLabel} />

          {/* ── The people ─────────────────────────────────────────────── */}
          <Panel title={tplName ? `Who made ${tplName}` : "Who made pages"} icon={<Users size={15} color={A.maroon} />} note={rangeLabel} delay={0.08} pad={12} style={{ marginBottom: 10 }}>
            <div className="cr-tools">
              <SearchBox value={qInput} onChange={setQInput} placeholder="Search name or email…" style={{ flex: "1 1 220px", minWidth: 0 }} />
              <ChipGroup<"pages" | "recent"> id="cr-sort" value={sort} onChange={setSort}
                options={[{ value: "pages", label: "Most pages" }, { value: "recent", label: <><Clock3 size={12} /> Latest</> }]} />
            </div>
            {!data.creators.items.length ? (
              <EmptyState icon={<Users size={20} />} title={q ? "Nobody matches that search" : `Nobody made ${tplName || "a page"} ${range === "today" ? "today" : "in this range"}`}
                note={q ? "Search looks at name and email." : "Try a longer range."} />
            ) : (
              <>
                <div className="cr-people">
                  {data.creators.items.map((c, i) => <PersonCard key={c.userId} c={c} i={i} onOpen={openUser} />)}
                </div>
                <Pager pg={data.creators.pagination} onPage={setPage} busy={refreshing} />
              </>
            )}
          </Panel>

          <div className="adk-grid2">
            <Panel title="By template" icon={<Layers size={15} color={A.goldDeep} />} note={rangeLabel} delay={0.1}>
              <ByTemplate rows={data.byTemplate} active={template} onPick={pickTemplate} />
            </Panel>
            <Panel title="Latest pages" icon={<Activity size={15} color={A.rust} />} note={data.recent.length ? `newest ${data.recent.length}` : undefined} delay={0.12}>
              <Recent rows={data.recent} onOpen={openUser} />
            </Panel>
          </div>
          <p className="cr-foot"><CalendarDays size={11} /> Days run midnight to midnight, India time (IST). A page deleted since it was made is not counted.</p>
        </div>
      )}
    </AdminPage>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function CountUp({ n }: { n: number }) {
  return <>{useCountUp(n).toLocaleString("en-IN")}</>;
}

function Delta({ now, prev, label, dark }: { now: number; prev: number; label: string; dark?: boolean }) {
  const d = pctChange(now, prev);
  const up = d === null ? now > 0 : d > 0, down = d !== null && d < 0;
  const color = dark ? (up ? "#9ff0b4" : down ? "#ffb3b3" : "rgba(255,236,210,.8)") : up ? A.ok : down ? A.danger : A.muted;
  const bgc = dark ? (up ? "rgba(125,220,150,.16)" : down ? "rgba(255,140,140,.16)" : "rgba(255,255,255,.08)") : "transparent";
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  return (
    <span className="cr-delta" data-dark={dark ? "1" : "0"} style={{ color, background: bgc }} title={`Previous period: ${prev.toLocaleString("en-IN")}`}>
      <Icon size={11} />
      {d === null ? (now ? "new" : "—") : `${d > 0 ? "+" : ""}${d}%`}
      <span style={{ opacity: 0.75, fontWeight: 600 }}>{label}</span>
    </span>
  );
}

function ErrorBox({ msg, onRetry, compact }: { msg: string; onRetry: () => void; compact?: boolean }) {
  return (
    <div className="cr-errbox" data-compact={compact ? "1" : "0"} role="alert">
      <AlertTriangle size={compact ? 14 : 18} color={A.danger} style={{ flex: "none" }} />
      <span style={{ flex: 1, minWidth: 0 }}>{compact ? `Could not refresh: ${msg}` : msg}</span>
      <button type="button" className="adk-btn" onClick={onRetry} style={{ height: 30 }}><RefreshCw size={12} /> Retry</button>
    </div>
  );
}

function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  return src ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt="" className="cr-av" style={{ width: size, height: size }} />
  ) : (
    <span className="cr-av cr-av-i" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(name || "?").slice(0, 1).toUpperCase()}</span>
  );
}

function Pager({ pg, onPage, busy }: { pg: Pagination; onPage: (p: number) => void; busy?: boolean }) {
  if (pg.totalPages <= 1) return null;
  return (
    <div className="cr-pager">
      <button className="adk-btn" onClick={() => onPage(pg.page - 1)} disabled={busy || pg.page <= 1} aria-label="Previous page" style={{ width: 36, padding: 0 }}><ChevronLeft size={15} /></button>
      <span>{pg.page} / {pg.totalPages} <span style={{ color: A.muted, fontWeight: 600 }}>· {plural(pg.total, "person", "people")}</span></span>
      <button className="adk-btn" onClick={() => onPage(pg.page + 1)} disabled={busy || pg.page >= pg.totalPages} aria-label="Next page" style={{ width: 36, padding: 0 }}><ChevronRight size={15} /></button>
    </div>
  );
}

/** Bars = pages, line = people, per IST day — or a single-day summary for Today. */
function Daily({ data, rangeLabel }: { data: Creations; rangeLabel: string }) {
  const best = data.daily.reduce((m, d) => Math.max(m, d.pages), 0);
  const rows = [...data.daily].reverse();
  const tip = { background: "#fff", border: `1px solid ${A.edge}`, borderRadius: 10, color: A.ink, fontSize: 11, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };
  if (data.daily.length === 1) return null; // Today: the hero and the people already say it
  return (
    <div className="cr-daily">
      <Panel title="Pages per day" icon={<TrendingUp size={15} color={A.gold} />} note={rangeLabel} delay={0.05}
        right={<span className="cr-legend"><i style={{ background: A.gold }} /> Pages <i style={{ background: A.maroon, borderRadius: 99, height: 3 }} /> People</span>}>
        {best === 0 ? (
          <EmptyState icon={<FilePlus2 size={20} />} title="No pages made in this range" />
        ) : (
          <div style={{ width: "100%", height: "clamp(190px, 28vw, 260px)" }}>
            <ResponsiveContainer>
              <ComposedChart data={data.daily} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="crBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2c574" />
                    <stop offset="100%" stopColor={A.gold} stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: A.muted, fontSize: 9 }} tickFormatter={(v) => prettyDay(String(v))} minTickGap={14} />
                <YAxis tick={{ fill: A.muted, fontSize: 9 }} width={34} allowDecimals={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: "rgba(201,168,76,.1)" }} labelFormatter={(l) => prettyDay(String(l), true)} />
                <Bar dataKey="pages" name="Pages" fill="url(#crBar)" radius={[5, 5, 0, 0]} maxBarSize={34} animationDuration={600} />
                <Line dataKey="creators" name="People" type="monotone" stroke={A.maroon} strokeWidth={2} dot={{ r: data.daily.length > 40 ? 0 : 2.5, fill: A.maroon }} animationDuration={700} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
      <Panel title="By day" icon={<CalendarDays size={15} color={A.goldDeep} />} note={plural(data.daily.length, "day")} delay={0.07} pad={12}>
        <div className="cr-tw">
          <table className="cr-table">
            <thead><tr><th>Day</th><th className="r">Pages</th><th className="r">People</th></tr></thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.date} data-zero={d.pages === 0 ? "1" : "0"}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {prettyDay(d.date)}
                    {d.pages > 0 && d.pages === best && <span className="cr-best" title="Busiest day in range">best</span>}
                  </td>
                  <td className="r b">{d.pages}</td>
                  <td className="r">{d.creators}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td>Total</td><td className="r">{data.totals.pages}</td><td className="r" title="Distinct people across the range">{data.totals.creators}</td></tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function PersonCard({ c, i, onOpen }: { c: Creator; i: number; onOpen: (id: string) => void }) {
  const shown = c.templates.slice(0, 4);
  const more = c.templates.length - shown.length;
  const body: ReactNode = (
    <>
      <div className="cr-p-h">
        <Avatar name={c.name} src={c.avatar} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="cr-p-name">
            <span>{c.name}</span>
            {c.newUser && <Tag tone={A.ok} style={{ flex: "none" }}><UserPlus size={10} /> new</Tag>}
            {!c.newUser && c.firstTime && <Tag tone={A.info} style={{ flex: "none" }}><Sparkles size={10} /> first page</Tag>}
          </div>
          <div className="cr-p-mail">{c.email || (c.exists ? "" : "account deleted")}</div>
        </div>
        <div className="cr-p-n" title={`${c.published} of ${c.pages} live`}>
          <b>{c.pages}</b><span>{c.pages === 1 ? "page" : "pages"}</span>
        </div>
      </div>
      <div className="cr-p-tpls">
        {shown.map((t) => (
          <span key={t.templateType} className="cr-p-tpl" title={`${t.label} × ${t.count}`}>
            <TemplateThumb slug={t.slug} templateType={t.templateType} label={t.label} size={46} radius={8} />
            {t.count > 1 && <span className="cr-p-x">×{t.count}</span>}
            <span className="cr-p-tl">{t.label}</span>
          </span>
        ))}
        {more > 0 && <span className="cr-p-more">+{more}</span>}
      </div>
      <div className="cr-p-f">
        <span><Clock3 size={11} /> {istTime(c.lastAt)}</span>
        <span>{c.published}/{c.pages} live</span>
        {c.exists && <span className="cr-p-go">Profile <ChevronRight size={12} /></span>}
      </div>
    </>
  );
  const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: Math.min(i, 12) * 0.03, duration: 0.3 } };
  return c.exists ? (
    <motion.button type="button" className="adk-card cr-p" onClick={() => onOpen(c.userId)} aria-label={`Open ${c.name}'s profile`} {...anim}>{body}</motion.button>
  ) : (
    <motion.div className="adk-card cr-p" data-gone="1" {...anim}>{body}</motion.div>
  );
}

function ByTemplate({ rows, active, onPick }: { rows: Creations["byTemplate"]; active: string; onPick: (t: string) => void }) {
  if (!rows.length) return <p className="cr-none">Nothing made in this range.</p>;
  const max = Math.max(1, ...rows.map((r) => r.pages));
  return (
    <div className="cr-scroll">
      {rows.map((r, i) => (
        <button key={r.templateType} type="button" className="cr-brow" data-on={active === r.templateType ? "1" : "0"}
          onClick={() => onPick(active === r.templateType ? "" : r.templateType)} title={active === r.templateType ? "Show every template" : `Only ${r.label}`}>
          <TemplateThumb slug={r.slug} templateType={r.templateType} label={r.label} size={34} radius={7} />
          <span className="cr-brow-m">
            <span className="cr-brow-t">
              <span className="cr-brow-l">{r.label}</span>
              <span className="cr-brow-v"><b>{r.pages}</b> · {plural(r.creators, "person", "people")}</span>
            </span>
            <span className="cr-brow-bar">
              <motion.span initial={{ width: 0 }} animate={{ width: `${(r.pages / max) * 100}%` }} transition={{ delay: 0.05 + Math.min(i, 12) * 0.03, duration: 0.6 }} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function Recent({ rows, onOpen }: { rows: RecentPage[]; onOpen: (id: string) => void }) {
  if (!rows.length) return <p className="cr-none">No pages yet.</p>;
  return (
    <div className="cr-scroll">
      {rows.map((p) => (
        <div key={p._id} className="cr-r">
          <TemplateThumb slug={p.slug} templateType={p.templateType} label={p.label} size={34} radius={7} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="cr-r-t">{p.label}</div>
            <div className="cr-r-s">
              by{" "}
              {p.user.exists
                ? <button type="button" className="cr-link" onClick={() => onOpen(p.user.userId)}>{p.user.name}</button>
                : <span>{p.user.name}</span>}
              {" · "}{istTime(p.createdAt)}
            </div>
          </div>
          <Tag tone={p.isPublished ? A.ok : A.muted}>{p.isPublished ? "Live" : "Draft"}</Tag>
        </div>
      ))}
    </div>
  );
}

const CR_CSS = `
  @keyframes crspin { to { transform: rotate(360deg); } }
  .cr-spin { animation: crspin .8s linear infinite; }
  .cr-hero { display: grid; grid-template-columns: minmax(0,1fr); gap: 14px; align-items: end; }
  @media (min-width: 900px) { .cr-hero { grid-template-columns: minmax(0,1fr) minmax(0,1.3fr); } }
  .cr-hero-thumb { flex: none; filter: drop-shadow(0 8px 16px rgba(0,0,0,.35)); }
  .cr-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #e9c98a;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-big { margin: 6px 0 6px; font-family: 'Playfair Display', serif; font-weight: 800; line-height: 1; color: #ffe3a3; font-size: clamp(36px, 9vw, 50px);
    font-variant-numeric: tabular-nums; display: flex; align-items: baseline; gap: 8px; }
  .cr-big-u { font-size: 15px; font-family: inherit; color: rgba(255,236,210,.75); font-weight: 700; }
  .cr-line { font-size: 12.5px; color: rgba(255,236,210,.88); line-height: 1.6; }
  .cr-line b { color: #fff; }
  .cr-quick { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 7px; }
  @media (min-width: 560px) { .cr-quick { grid-template-columns: repeat(4, minmax(0,1fr)); } }
  .cr-q { all: unset; box-sizing: border-box; cursor: pointer; min-width: 0; padding: 9px 11px; border-radius: 13px; display: flex; flex-direction: column; gap: 3px;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,236,190,.12); transition: background .2s, transform .2s, border-color .2s; }
  .cr-q:hover { background: rgba(255,255,255,.11); transform: translateY(-1px); }
  .cr-q:focus-visible { outline: 2px solid #ffe3a3; outline-offset: 1px; }
  .cr-q[data-on="1"] { background: linear-gradient(135deg, rgba(255,227,163,.2), rgba(201,168,76,.08)); border-color: rgba(255,227,163,.45); }
  .cr-q-l { font-size: 9.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,236,210,.7); }
  .cr-q-v { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: #fff; line-height: 1.1; white-space: nowrap; }
  .cr-q-v small { font-family: inherit; font-size: 11px; font-weight: 700; color: rgba(255,236,210,.7); }
  .cr-q[data-on="1"] .cr-q-v { color: #ffe3a3; }
  .cr-q-s { font-size: 10.5px; color: rgba(255,236,210,.75); }
  .cr-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 800; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; }
  .cr-delta[data-dark="1"] { padding: 2px 8px; border-radius: 99px; font-size: 10.5px; }
  .cr-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; min-width: 0; }
  .cr-bar > .adk-chips { max-width: 100%; }
  .cr-tpl { display: flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; }
  .cr-custom { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0; flex-basis: 100%; }
  .cr-date { width: auto; height: 34px; padding: 0 8px; font-size: 12.5px; flex: 1 1 130px; min-width: 0; max-width: 160px; }
  .cr-err { font-size: 11.5px; color: ${A.danger}; font-weight: 700; flex-basis: 100%; }
  .cr-kpis { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; margin-bottom: 10px; }
  @media (min-width: 900px) { .cr-kpis { grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; } }
  .cr-kpis .adk-stat-sub { white-space: normal; }
  .cr-daily { display: grid; grid-template-columns: minmax(0,1fr); gap: 10px; margin-bottom: 10px; }
  @media (min-width: 1000px) { .cr-daily { grid-template-columns: minmax(0,1.7fr) minmax(0,1fr); } }
  .cr-legend { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: ${A.muted}; font-weight: 700; }
  .cr-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; }
  .cr-tw { max-height: 280px; overflow: auto; }
  .cr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .cr-table th { text-align: left; font-size: 9.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${A.muted}; padding: 6px 8px;
    border-bottom: 1px solid ${A.edge}; position: sticky; top: 0; background: #fbf6ef; }
  .cr-table td { padding: 7px 8px; border-bottom: 1px solid rgba(61,12,17,.05); color: ${A.ink}; }
  .cr-table .r { text-align: right; font-variant-numeric: tabular-nums; }
  .cr-table .b { font-weight: 800; }
  .cr-table tr[data-zero="1"] td { color: ${A.muted}; }
  .cr-table tfoot td { font-weight: 800; border-top: 1px solid rgba(61,12,17,.16); border-bottom: none; position: sticky; bottom: 0; background: #fbf4ea; }
  .cr-best { margin-left: 6px; padding: 1px 6px; border-radius: 99px; font-size: 9px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
    color: ${A.goldDeep}; background: rgba(201,168,76,.18); }
  .cr-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; min-width: 0; }
  .cr-tools > .adk-chips { max-width: 100%; }
  .cr-people { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 8px; }
  .cr-p { display: flex; flex-direction: column; gap: 9px; padding: 11px 12px; text-align: left; min-width: 0; }
  .cr-p[data-gone="1"] { opacity: .65; }
  .cr-p-h { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .cr-p-name { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 13.5px; font-weight: 800; color: ${A.ink}; }
  .cr-p-name > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .cr-p-mail { font-size: 11px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-p-n { flex: none; display: flex; flex-direction: column; align-items: center; padding: 4px 10px; border-radius: 11px;
    background: linear-gradient(135deg, rgba(201,168,76,.18), rgba(201,168,76,.06)); border: 1px solid rgba(201,168,76,.3); }
  .cr-p-n b { font-family: 'Playfair Display', serif; font-size: 19px; line-height: 1; color: ${A.maroon}; }
  .cr-p-n span { font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: ${A.goldDeep}; }
  .cr-p-tpls { display: flex; gap: 8px; align-items: flex-start; min-width: 0; overflow: hidden; }
  .cr-p-tpl { position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px; width: 58px; flex: none; }
  .cr-p-tl { font-size: 9.5px; font-weight: 700; color: ${A.soft}; text-align: center; line-height: 1.15; width: 100%;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .cr-p-x { position: absolute; top: -5px; right: 2px; padding: 0 5px; border-radius: 99px; font-size: 9.5px; font-weight: 800; color: #fff; background: ${A.maroon};
    box-shadow: 0 1px 4px rgba(61,12,17,.35); }
  .cr-p-more { align-self: center; flex: none; padding: 4px 8px; border-radius: 99px; font-size: 11px; font-weight: 800; color: ${A.goldDeep}; background: rgba(201,168,76,.14); }
  .cr-p-f { display: flex; align-items: center; gap: 10px; font-size: 10.5px; color: ${A.muted}; font-weight: 700; border-top: 1px dashed rgba(61,12,17,.1); padding-top: 7px; }
  .cr-p-f > span { display: inline-flex; align-items: center; gap: 4px; }
  .cr-p-go { margin-left: auto; color: ${A.goldDeep}; }
  .cr-av { border-radius: 12px; object-fit: cover; flex: none; display: block; }
  .cr-av-i { display: grid; place-items: center; color: #fff; font-weight: 800; background: linear-gradient(135deg, ${A.gold}, ${A.goldDeep}); }
  .cr-pager { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 0 2px; font-size: 12px; font-weight: 800; color: ${A.ink}; }
  .cr-scroll { max-height: 380px; overflow-y: auto; margin: 0 -6px; padding: 0 6px; display: flex; flex-direction: column; gap: 2px; }
  .cr-brow { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 10px; min-width: 0; }
  .cr-brow:hover { background: rgba(201,168,76,.08); }
  .cr-brow:focus-visible { outline: 2px solid ${A.gold}; }
  .cr-brow[data-on="1"] { background: rgba(201,168,76,.16); box-shadow: inset 0 0 0 1px rgba(201,168,76,.45); }
  .cr-brow-m { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .cr-brow-t { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .cr-brow-l { flex: 1; min-width: 0; font-size: 12px; font-weight: 700; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-brow-v { font-size: 11px; color: ${A.soft}; font-weight: 700; white-space: nowrap; }
  .cr-brow-v b { color: ${A.ink}; }
  .cr-brow-bar { display: block; height: 5px; border-radius: 99px; background: rgba(61,12,17,.05); overflow: hidden; }
  .cr-brow-bar > span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, ${A.goldDeep}, ${A.gold}); }
  .cr-r { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 10px; min-width: 0; }
  .cr-r:hover { background: rgba(201,168,76,.06); }
  .cr-r-t { font-size: 12px; font-weight: 800; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-r-s { font-size: 11px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-link { all: unset; cursor: pointer; color: ${A.goldDeep}; font-weight: 800; }
  .cr-link:hover { text-decoration: underline; }
  .cr-link:focus-visible { outline: 2px solid ${A.gold}; }
  .cr-none { font-size: 12px; color: ${A.muted}; text-align: center; padding: 24px 0; margin: 0; }
  .cr-errbox { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 14px; font-size: 12.5px; font-weight: 600; color: ${A.ink};
    background: rgba(179,38,30,.06); border: 1px solid rgba(179,38,30,.2); margin-bottom: 10px; }
  .cr-errbox[data-compact="1"] { padding: 8px 10px; font-size: 12px; }
  .cr-foot { margin: 12px 2px 0; font-size: 10.5px; color: ${A.muted}; display: flex; align-items: center; gap: 5px; }
`;
