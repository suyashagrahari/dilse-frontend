"use client";

// ─── Super admin: free → premium upgrade offers ──────────────────────────────
//
// When someone publishes a free template that has a premium sibling (Build a
// Bouquet → Digital Bouquet), the publish first offers "Send it in Premium?".
// This screen is that offer's funnel, counted in VISITORS (one browser = one,
// however often they hit a step):
//
//   offer shown → tried Premium → premium preview ready → opened the editor
//               → published PREMIUM            (the conversion)
//   …or chose free / went back to free → published FREE
//
// plus the day-by-day trend, the latest people who tried it, and a switch per
// offer (off = Publish goes straight to the free publish, as before).
//
// Server: GET/PUT /admin/super/upgrades (controllers/upgrade.controller.ts).

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Rocket, Eye, Sparkles, Crown, Send, Loader2, RefreshCw, Power } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { A, AdminPage, Panel, StatTile, ChipGroup, Loading, EmptyState, Tag } from "../adminKit";
import TemplateThumb from "../TemplateThumb";

type Period = "7d" | "30d" | "90d" | "365d";
type Step =
  | "shown" | "try_clicked" | "preview_ready" | "preview_failed" | "edit_opened" | "back_to_free"
  | "free_chosen" | "dismissed" | "free_published" | "premium_published";

interface Offer {
  from: string;
  to: string;
  title: string;
  enabled: boolean;
  steps: Record<Step, { total: number; visitors: number }>;
}
interface Stats {
  period: string;
  offers: Offer[];
  daily: { day: string; shown: number; try_clicked: number; premium_published: number; free_published: number }[];
  recent: { from: string; to: string; event: Step; at: string; user: { name: string; email: string } | null }[];
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "365d", label: "1 year" },
];

const ABOUT =
  "Publishing a free template that has a premium version first offers “Send it in Premium?”. Trying it opens the premium editor with their content already filled in by AI. Counts are visitors.";

const FUNNEL: { step: Step; label: string; tone: string }[] = [
  { step: "shown", label: "Saw the offer", tone: A.gold },
  { step: "try_clicked", label: "Pressed Try Premium", tone: A.info },
  { step: "preview_ready", label: "Premium preview opened", tone: "#8b6fd4" },
  { step: "edit_opened", label: "Edited the premium one", tone: "#c2405c" },
  { step: "premium_published", label: "Published PREMIUM", tone: A.ok },
];
const SIDE: { step: Step; label: string }[] = [
  { step: "free_chosen", label: "Chose free at the offer" },
  { step: "back_to_free", label: "Went back to free from the preview" },
  { step: "dismissed", label: "Closed the offer" },
  { step: "free_published", label: "Published free" },
  { step: "preview_failed", label: "Preview failed" },
];
const EVENT_LABEL: Partial<Record<Step, { text: string; tone: string }>> = {
  try_clicked: { text: "tried Premium", tone: A.info },
  premium_published: { text: "published Premium", tone: A.ok },
  free_chosen: { text: "chose free", tone: A.muted },
  back_to_free: { text: "went back to free", tone: A.warn },
};

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function UpgradesPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const allowed = !!user && isSuperAdmin(user.role);
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLoading && user && !isSuperAdmin(user.role)) router.replace("/admin/analytics");
  }, [isLoading, user, router]);

  const hdr = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }), [accessToken]);

  useEffect(() => {
    if (!allowed || !accessToken) return;
    let live = true;
    setLoading(true);
    fetch(`${API_URL}/admin/super/upgrades?period=${period}`, { headers: hdr() })
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        if (j?.success) { setData(j.data); setErr(""); } else setErr(j?.error || "Could not load.");
      })
      .catch(() => live && setErr("Could not load."))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [allowed, accessToken, period, hdr, tick]);

  const toggle = async (o: Offer) => {
    setSaving(o.from);
    try {
      const r = await fetch(`${API_URL}/admin/super/upgrades/${o.from}`, { method: "PUT", headers: hdr(), body: JSON.stringify({ enabled: !o.enabled }) });
      const j = await r.json();
      if (j?.success) setData((d) => d && { ...d, offers: d.offers.map((x) => (x.from === o.from ? { ...x, enabled: j.data.enabled } : x)) });
    } finally {
      setSaving(null);
    }
  };

  const icon = <Rocket size={16} />;
  if (!allowed) return <AdminPage title="Upgrades" icon={icon} head><Loading /></AdminPage>;

  return (
    <AdminPage
      title="Upgrades"
      subtitle={ABOUT}
      icon={icon}
      head
      width={1180}
      actions={
        <button type="button" className="ug-refresh" onClick={() => setTick((t) => t + 1)} aria-label="Refresh">
          {loading ? <Loader2 size={14} className="ug-spin" /> : <RefreshCw size={14} />}
        </button>
      }
    >
      <style>{CSS}</style>
      <div className="ug-bar">
        <ChipGroup<Period> id="ug-period" value={period} onChange={setPeriod} options={PERIODS} />
      </div>

      {err && !data && <EmptyState title="Could not load the upgrade funnel" note={err} />}
      {!data && !err && <Loading />}

      {data?.offers.map((o, oi) => {
        const s = o.steps;
        const shown = s.shown.visitors;
        const top = Math.max(1, shown);
        return (
          <div key={o.from} className="ug-offer">
            <Panel
              delay={oi * 0.05}
              title={
                <span className="ug-title">
                  <TemplateThumb slug={o.from} templateType={o.from} label={o.from} size={34} radius={9} />
                  <span className="ug-arrow">→</span>
                  <TemplateThumb slug={o.to} templateType={o.to} label={o.to} size={34} radius={9} />
                  <span>{o.title}</span>
                </span>
              }
              right={
                <button type="button" className="ug-switch" data-on={o.enabled ? "1" : "0"} onClick={() => void toggle(o)} disabled={saving === o.from} aria-pressed={o.enabled}>
                  {saving === o.from ? <Loader2 size={13} className="ug-spin" /> : <Power size={13} />}
                  {o.enabled ? "Offer on" : "Offer off"}
                </button>
              }
            >
              <div className="ug-tiles">
                <StatTile icon={<Eye size={15} />} label="Saw the offer" value={shown} sub={`${s.shown.total} times`} accent={A.gold} />
                <StatTile icon={<Sparkles size={15} />} label="Tried Premium" value={s.try_clicked.visitors} sub={`${pct(s.try_clicked.visitors, shown)} of those who saw it`} accent={A.info} delay={0.05} />
                <StatTile icon={<Crown size={15} />} label="Published Premium" value={s.premium_published.visitors} sub={`${pct(s.premium_published.visitors, shown)} conversion · ${pct(s.premium_published.visitors, s.try_clicked.visitors)} of triers`} accent={A.ok} delay={0.1} />
                <StatTile icon={<Send size={15} />} label="Published free" value={s.free_published.visitors} sub={`${pct(s.free_published.visitors, shown)} of those who saw it`} accent={A.muted} delay={0.15} />
              </div>

              <div className="ug-cols">
                <div>
                  <h4 className="ug-h">The funnel</h4>
                  {FUNNEL.map((f, i) => {
                    const v = s[f.step].visitors;
                    return (
                      <div key={f.step} className="ug-row">
                        <div className="ug-row-l"><span>{f.label}</span><b>{v}</b></div>
                        <div className="ug-track">
                          <motion.i initial={{ width: 0 }} animate={{ width: `${Math.max(v ? 3 : 0, (v / top) * 100)}%` }} transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }} style={{ background: f.tone }} />
                        </div>
                        <em>{i === 0 ? "" : pct(v, shown)}</em>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h4 className="ug-h">Everyone else</h4>
                  {SIDE.map((f) => (
                    <div key={f.step} className="ug-side">
                      <span>{f.label}</span>
                      <b>{s[f.step].visitors}</b>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        );
      })}

      {data && (
        <Panel title="Day by day" note="Visitors per day, India time" delay={0.1}>
          {data.daily.some((d) => d.shown || d.try_clicked || d.premium_published || d.free_published) ? (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <ComposedChart data={data.daily.map((d) => ({ ...d, label: d.day.slice(5) }))} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={A.edge} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: A.muted }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: A.muted }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="shown" name="Saw the offer" fill="rgba(201,168,76,.45)" radius={[4, 4, 0, 0]} />
                  <Line dataKey="try_clicked" name="Tried Premium" stroke={A.info} strokeWidth={2} dot={false} />
                  <Line dataKey="premium_published" name="Published Premium" stroke={A.ok} strokeWidth={2.5} dot={false} />
                  <Line dataKey="free_published" name="Published free" stroke={A.muted} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Nobody has seen the offer in this period yet" note="It opens when someone presses Publish on Build a Bouquet." />
          )}
        </Panel>
      )}

      {data && (
        <Panel title="Latest choices" delay={0.15}>
          {data.recent.length ? (
            <ul className="ug-recent">
              {data.recent.map((r, i) => {
                const l = EVENT_LABEL[r.event];
                return (
                  <li key={i}>
                    <span className="ug-who">{r.user ? r.user.name || r.user.email : "Not signed in yet"}{r.user?.email && r.user.name ? <small>{r.user.email}</small> : null}</span>
                    {l && <Tag tone={l.tone}>{l.text}</Tag>}
                    <time>{when(r.at)}</time>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No one yet" />
          )}
        </Panel>
      )}
    </AdminPage>
  );
}

const CSS = `
.ug-bar { display: flex; justify-content: flex-end; margin: 4px 0 12px; }
.ug-offer { margin-bottom: 14px; }
.ug-title { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 700; }
.ug-arrow { color: ${A.muted}; font-weight: 800; }
.ug-switch { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 99px; font-size: 12.5px; font-weight: 800;
  color: ${A.muted}; background: rgba(61,12,17,.05); border: 1px solid ${A.edge}; }
.ug-switch[data-on="1"] { color: #fff; background: ${A.ok}; border-color: ${A.ok}; }
.ug-switch:disabled { opacity: .6; cursor: wait; }
.ug-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.ug-cols { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 18px; margin-top: 16px; }
@media (max-width: 760px) { .ug-cols { grid-template-columns: 1fr; } }
.ug-h { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: ${A.muted}; }
.ug-row { display: grid; grid-template-columns: minmax(150px, 1fr) minmax(0, 1.3fr) 44px; align-items: center; gap: 10px; padding: 6px 0; }
.ug-row-l { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: ${A.ink}; }
.ug-row-l b { font-variant-numeric: tabular-nums; }
.ug-track { height: 12px; border-radius: 99px; background: rgba(61,12,17,.06); overflow: hidden; }
.ug-track i { display: block; height: 100%; border-radius: 99px; }
.ug-row em { font-style: normal; font-size: 12px; font-weight: 700; color: ${A.soft}; text-align: right; }
.ug-side { display: flex; justify-content: space-between; gap: 10px; padding: 8px 10px; border-radius: 10px; font-size: 13px; color: ${A.ink}; }
.ug-side:nth-child(odd) { background: rgba(61,12,17,.035); }
.ug-recent { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.ug-recent li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; font-size: 13px; }
.ug-recent li:nth-child(odd) { background: rgba(61,12,17,.035); }
.ug-who { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${A.ink}; font-weight: 600; }
.ug-who small { margin-left: 6px; font-weight: 400; color: ${A.muted}; }
.ug-recent time { font-size: 12px; color: ${A.muted}; white-space: nowrap; }
.ug-refresh { all: unset; cursor: pointer; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: #fff6e6; background: rgba(255,255,255,.12); }
.ug-spin { animation: ugSpin 1s linear infinite; }
@keyframes ugSpin { to { transform: rotate(360deg); } }
@media (max-width: 520px) { .ug-row { grid-template-columns: 1fr 44px; } .ug-track { grid-column: 1 / -1; grid-row: 2; } }
`;
