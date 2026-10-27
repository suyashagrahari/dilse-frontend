"use client";

// ─── Super admin: free → premium upgrade offers ──────────────────────────────
//
// When someone publishes a free template that has a premium sibling (Build a
// Bouquet → Digital Bouquet, Birthday GF / Happy Birthday → Birthday Surprise,
// Apology Dashboard → I'm Sorry), the publish first offers "See it in Premium,
// free". This screen is those offers, counted in VISITORS (one browser = one,
// however often they hit a step):
//
//   · every template at a glance — saw → tried → bought premium / published free
//   · per template: the funnel, the other ways out, and the show/hide switch
//   · the day-by-day trend
//   · PEOPLE: every signed-in person who met an offer, where they ended up;
//     a click opens their profile on its Upgrades tab (every step they took)
//
// A template chip narrows everything to one offer (`?from=` on the server).
// Server: GET/PUT /admin/super/upgrades (controllers/upgrade.controller.ts).

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Rocket, Eye, EyeOff, Sparkles, Crown, Send, Loader2, RefreshCw, ChevronRight, Users } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { OUTCOME, STEP_LABEL, freeName, type UpgradeOutcome, type UpgradeStepName as Step } from "@/lib/upgrade/labels";
import { A, AdminPage, Panel, StatTile, ChipGroup, Loading, EmptyState, Tag } from "../adminKit";
import TemplateThumb from "../TemplateThumb";

type Period = "7d" | "30d" | "90d" | "365d";

interface Offer {
  from: string;
  to: string;
  title: string;
  enabled: boolean;
  steps: Record<Step, { total: number; visitors: number }>;
}
interface Person {
  user: { userId: string; name: string; email: string; avatar: string };
  from: string;
  to: string;
  steps: Step[];
  outcome: UpgradeOutcome;
  firstAt: string;
  lastAt: string;
  total: number;
}
interface Stats {
  period: string;
  offers: Offer[];
  daily: { day: string; shown: number; try_clicked: number; premium_published: number; free_published: number }[];
  people: Person[];
  recent: { from: string; to: string; event: Step; at: string; user: { userId: string; name: string; email: string } | null }[];
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "365d", label: "1 year" },
];

const ABOUT =
  "Publishing a free template that has a premium version first offers “See it in Premium, free”: the premium page opens already filled in by AI. Counts are visitors. Click a person to open their profile and every step they took.";

const FUNNEL: { step: Step; tone: string }[] = [
  { step: "shown", tone: A.gold },
  { step: "try_clicked", tone: A.info },
  { step: "preview_ready", tone: "#8b6fd4" },
  { step: "edit_opened", tone: "#c2405c" },
  { step: "premium_published", tone: A.ok },
];
const SIDE: Step[] = ["free_chosen", "back_to_free", "dismissed", "free_published", "preview_failed"];
const RECENT_TONE: Partial<Record<Step, string>> = { try_clicked: A.info, premium_published: A.ok, free_chosen: A.muted, back_to_free: A.warn };
const OUTCOME_FILTERS: { value: "all" | UpgradeOutcome; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "premium", label: "Bought Premium" },
  { value: "tried", label: "Tried" },
  { value: "free", label: "Published free" },
  { value: "chose_free", label: "Chose free" },
];

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function UpgradesPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const allowed = !!user && isSuperAdmin(user.role);
  const [period, setPeriod] = useState<Period>("30d");
  const [only, setOnly] = useState<string>("all");
  const [outcome, setOutcome] = useState<"all" | UpgradeOutcome>("all");
  const [data, setData] = useState<Stats | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
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
    const q = new URLSearchParams({ period });
    if (only !== "all") q.set("from", only);
    fetch(`${API_URL}/admin/super/upgrades?${q}`, { headers: hdr() })
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        if (j?.success) { setData(j.data); setOffers(j.data.offers); setErr(""); } else setErr(j?.error || "Could not load.");
      })
      .catch(() => live && setErr("Could not load."))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [allowed, accessToken, period, only, hdr, tick]);

  const toggle = async (o: Offer) => {
    setSaving(o.from);
    try {
      const r = await fetch(`${API_URL}/admin/super/upgrades/${o.from}`, { method: "PUT", headers: hdr(), body: JSON.stringify({ enabled: !o.enabled }) });
      const j = await r.json();
      if (j?.success) setOffers((list) => list.map((x) => (x.from === o.from ? { ...x, enabled: j.data.enabled } : x)));
    } finally {
      setSaving(null);
    }
  };

  const templateChips = useMemo(
    () => [{ value: "all", label: "All templates" }, ...offers.map((o) => ({ value: o.from, label: freeName(o.from) }))],
    [offers],
  );
  const shownOffers = only === "all" ? offers : offers.filter((o) => o.from === only);
  const people = (data?.people ?? []).filter((p) => outcome === "all" || p.outcome === outcome || (outcome === "tried" && p.outcome === "previewed_left"));
  const openUser = (id: string) => router.push(`/admin/users/${id}?tab=upgrades`);

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
        <ChipGroup<string> id="ug-from" value={only} onChange={setOnly} options={templateChips} />
        <ChipGroup<Period> id="ug-period" value={period} onChange={setPeriod} options={PERIODS} />
      </div>

      {err && !data && <EmptyState title="Could not load the upgrade funnel" note={err} />}
      {!data && !err && <Loading />}

      {/* ── Every template at a glance ─────────────────────────────────────── */}
      {data && only === "all" && (
        <Panel title="Every template at a glance" note="Click a row to see just that template" delay={0.02}>
          <div className="ug-table" role="table">
            <div className="ug-tr ug-th" role="row">
              <span role="columnheader">Free template → premium</span>
              <span role="columnheader">Saw</span>
              <span role="columnheader">Tried</span>
              <span role="columnheader">Bought premium</span>
              <span role="columnheader">Published free</span>
              <span role="columnheader">Offer</span>
            </div>
            {offers.map((o) => {
              const s = o.steps;
              return (
                <button key={o.from} type="button" className="ug-tr" role="row" onClick={() => setOnly(o.from)}>
                  <span className="ug-tpl">
                    <TemplateThumb slug={o.from} templateType={o.from} label={o.from} size={30} radius={8} />
                    <span>
                      <b>{freeName(o.from)}</b>
                      <small>→ {o.title}</small>
                    </span>
                  </span>
                  <span><b>{s.shown.visitors}</b></span>
                  <span><b>{s.try_clicked.visitors}</b> <small>{pct(s.try_clicked.visitors, s.shown.visitors)}</small></span>
                  <span className="ug-good"><b>{s.premium_published.visitors}</b> <small>{pct(s.premium_published.visitors, s.shown.visitors)}</small></span>
                  <span><b>{s.free_published.visitors}</b> <small>{pct(s.free_published.visitors, s.shown.visitors)}</small></span>
                  <span><Tag tone={o.enabled ? A.ok : A.muted}>{o.enabled ? "On" : "Hidden"}</Tag></span>
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {/* ── Per template: switch + funnel ───────────────────────────────────── */}
      {data &&
        shownOffers.map((o, oi) => {
          const s = o.steps;
          const shown = s.shown.visitors;
          const top = Math.max(1, shown);
          return (
            <div key={o.from} className="ug-offer">
              <Panel
                delay={0.04 + oi * 0.04}
                title={
                  <span className="ug-title">
                    <TemplateThumb slug={o.from} templateType={o.from} label={o.from} size={34} radius={9} />
                    <span className="ug-arrow">→</span>
                    <TemplateThumb slug={o.to} templateType={o.to} label={o.to} size={34} radius={9} />
                    <span>{freeName(o.from)} → {o.title}</span>
                  </span>
                }
              >
                <div className="ug-vis" data-on={o.enabled ? "1" : "0"}>
                  <span className="ug-vis-ic">{o.enabled ? <Eye size={18} /> : <EyeOff size={18} />}</span>
                  <div className="ug-vis-tx">
                    <b>{o.enabled ? "Offer is ON: users see it" : "Offer is HIDDEN"}</b>
                    <p>
                      {o.enabled
                        ? `Publish on ${freeName(o.from)} first opens the Premium preview offer.`
                        : `Publish on ${freeName(o.from)} goes straight to the free publish. Nobody sees the offer.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={o.enabled}
                    aria-label={o.enabled ? "Hide the offer" : "Show the offer"}
                    className="ug-toggle"
                    onClick={() => void toggle(o)}
                    disabled={saving === o.from}
                  >
                    <span className="ug-knob">{saving === o.from && <Loader2 size={12} className="ug-spin" />}</span>
                  </button>
                </div>

                <div className="ug-tiles">
                  <StatTile icon={<Eye size={15} />} label="Saw the offer" value={shown} sub={`${s.shown.total} times`} accent={A.gold} />
                  <StatTile icon={<Sparkles size={15} />} label="Tried Premium" value={s.try_clicked.visitors} sub={`${pct(s.try_clicked.visitors, shown)} of those who saw it`} accent={A.info} delay={0.05} />
                  <StatTile icon={<Crown size={15} />} label="Bought Premium" value={s.premium_published.visitors} sub={`${pct(s.premium_published.visitors, shown)} conversion · ${pct(s.premium_published.visitors, s.try_clicked.visitors)} of triers`} accent={A.ok} delay={0.1} />
                  <StatTile icon={<Send size={15} />} label="Published free" value={s.free_published.visitors} sub={`${pct(s.free_published.visitors, shown)} of those who saw it`} accent={A.muted} delay={0.15} />
                </div>

                <div className="ug-cols">
                  <div>
                    <h4 className="ug-h">The funnel</h4>
                    {FUNNEL.map((f, i) => {
                      const v = s[f.step].visitors;
                      return (
                        <div key={f.step} className="ug-row">
                          <div className="ug-row-l"><span>{STEP_LABEL[f.step].text}</span><b>{v}</b></div>
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
                    {SIDE.map((step) => (
                      <div key={step} className="ug-side">
                        <span>{STEP_LABEL[step].text}</span>
                        <b>{s[step].visitors}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
          );
        })}

      {/* ── People ───────────────────────────────────────────────────────────── */}
      {data && (
        <Panel
          title={<span className="ug-title"><Users size={15} /> People ({people.length})</span>}
          note="Signed-in people who met an offer. Click one to open their profile."
          right={<ChipGroup<"all" | UpgradeOutcome> id="ug-outcome" value={outcome} onChange={setOutcome} options={OUTCOME_FILTERS} />}
          delay={0.08}
        >
          {people.length ? (
            <ul className="ug-people">
              {people.map((p) => {
                const o = OUTCOME[p.outcome];
                const label = p.user.name || p.user.email || "Unknown user";
                return (
                  <li key={`${p.user.userId}-${p.from}`}>
                    <button type="button" className="ug-person" onClick={() => openUser(p.user.userId)}>
                      <span className="ug-ava" aria-hidden>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.user.avatar ? <img src={p.user.avatar} alt="" referrerPolicy="no-referrer" /> : label.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="ug-pmain">
                        <b>{label}</b>
                        <small>{p.user.email && p.user.name ? `${p.user.email} · ` : ""}{freeName(p.from)} → {p.to}</small>
                        <span className="ug-steps">
                          {(["shown", "try_clicked", "preview_ready", "edit_opened", "premium_published", "free_published"] as Step[]).map((st) => (
                            <i key={st} data-on={p.steps.includes(st) ? "1" : "0"} title={STEP_LABEL[st].text}>{STEP_LABEL[st].emoji}</i>
                          ))}
                        </span>
                      </span>
                      <span className="ug-pend">
                        <Tag tone={o.tone} solid={p.outcome === "premium"}>{o.text}</Tag>
                        <time>{when(p.lastAt)}</time>
                      </span>
                      <ChevronRight size={16} className="ug-chev" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="Nobody here yet" note="People appear once they publish a free template that has an offer." />
          )}
        </Panel>
      )}

      {/* ── Trend ────────────────────────────────────────────────────────────── */}
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
                  <Line dataKey="premium_published" name="Bought Premium" stroke={A.ok} strokeWidth={2.5} dot={false} />
                  <Line dataKey="free_published" name="Published free" stroke={A.muted} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Nobody has seen an offer in this period yet" note="It opens when someone presses Publish on a free template that has one." />
          )}
        </Panel>
      )}

      {/* ── Latest choices ───────────────────────────────────────────────────── */}
      {data && (
        <Panel title="Latest choices" delay={0.12}>
          {data.recent.length ? (
            <ul className="ug-recent">
              {data.recent.map((r, i) => (
                <li key={i}>
                  <button type="button" disabled={!r.user} onClick={() => r.user && openUser(r.user.userId)}>
                    <span className="ug-who">{r.user ? r.user.name || r.user.email : "Not signed in yet"}{r.user?.email && r.user.name ? <small>{r.user.email}</small> : null}</span>
                    <span className="ug-from">{freeName(r.from)}</span>
                    <Tag tone={RECENT_TONE[r.event] ?? A.muted}>{STEP_LABEL[r.event]?.text ?? r.event}</Tag>
                    <time>{when(r.at)}</time>
                  </button>
                </li>
              ))}
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
.ug-bar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin: 4px 0 12px; }
.ug-offer { margin-bottom: 14px; }
.ug-title { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 700; }
.ug-arrow { color: ${A.muted}; font-weight: 800; }
.ug-table { display: grid; gap: 4px; overflow-x: auto; }
.ug-tr { all: unset; box-sizing: border-box; display: grid; grid-template-columns: minmax(220px, 2.2fr) repeat(4, minmax(80px, 1fr)) 80px; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 12px; font-size: 13px; color: ${A.ink}; min-width: 680px; }
button.ug-tr { cursor: pointer; background: rgba(61,12,17,.03); transition: background .15s; }
button.ug-tr:hover { background: rgba(201,168,76,.14); }
button.ug-tr:focus-visible { outline: 2px solid ${A.gold}; }
.ug-th { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: ${A.muted}; padding-top: 0; padding-bottom: 2px; }
.ug-tr small { color: ${A.soft}; font-size: 11.5px; margin-left: 2px; }
.ug-tr b { font-variant-numeric: tabular-nums; }
.ug-good b { color: ${A.ok}; }
.ug-tpl { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ug-tpl > span { display: flex; flex-direction: column; min-width: 0; }
.ug-tpl small { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ug-vis { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding: 12px 14px; border-radius: 16px; border: 1.5px solid ${A.edge}; background: rgba(61,12,17,.03); }
.ug-vis[data-on="1"] { border-color: rgba(30,122,75,.35); background: rgba(30,122,75,.07); }
.ug-vis-ic { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; flex: none; color: ${A.muted}; background: #fff; border: 1px solid ${A.edge}; }
.ug-vis[data-on="1"] .ug-vis-ic { color: ${A.ok}; }
.ug-vis-tx { flex: 1; min-width: 0; }
.ug-vis-tx b { font-size: 14px; color: ${A.ink}; }
.ug-vis-tx p { margin: 2px 0 0; font-size: 12.5px; color: ${A.soft}; }
.ug-toggle { all: unset; cursor: pointer; flex: none; position: relative; width: 52px; height: 30px; border-radius: 99px; background: #d9cfcf; transition: background .2s; }
.ug-toggle[aria-checked="true"] { background: ${A.ok}; }
.ug-toggle:disabled { opacity: .6; cursor: wait; }
.ug-toggle:focus-visible { outline: 3px solid ${A.gold}; outline-offset: 2px; }
.ug-knob { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.25); display: grid; place-items: center; color: ${A.muted}; transition: transform .2s; }
.ug-toggle[aria-checked="true"] .ug-knob { transform: translateX(22px); }
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
.ug-people { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.ug-person { all: unset; box-sizing: border-box; cursor: pointer; width: 100%; display: grid; grid-template-columns: 40px minmax(0, 1fr) auto 18px; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; background: rgba(61,12,17,.03); border: 1px solid transparent; transition: background .15s, border-color .15s; }
.ug-person:hover { background: rgba(201,168,76,.12); border-color: rgba(201,168,76,.4); }
.ug-person:focus-visible { outline: 2px solid ${A.gold}; }
.ug-ava { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; overflow: hidden; font-weight: 800; color: #fff6e6; background: linear-gradient(135deg, ${A.maroon2}, ${A.rust}); }
.ug-ava img { width: 100%; height: 100%; object-fit: cover; }
.ug-pmain { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ug-pmain b { font-size: 14px; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ug-pmain small { font-size: 12px; color: ${A.soft}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ug-steps { display: flex; gap: 3px; margin-top: 3px; }
.ug-steps i { font-style: normal; font-size: 13px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 7px; background: #fff; border: 1px solid ${A.edge}; filter: grayscale(1); opacity: .35; }
.ug-steps i[data-on="1"] { filter: none; opacity: 1; border-color: rgba(201,168,76,.6); }
.ug-pend { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.ug-pend time { font-size: 11.5px; color: ${A.muted}; white-space: nowrap; }
.ug-chev { color: ${A.muted}; }
@media (max-width: 560px) { .ug-person { grid-template-columns: 36px minmax(0, 1fr) 16px; } .ug-pend { grid-column: 2; align-items: flex-start; flex-direction: row; } .ug-chev { grid-row: 1; grid-column: 3; } }
.ug-recent { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.ug-recent button { all: unset; box-sizing: border-box; width: 100%; cursor: pointer; display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; font-size: 13px; }
.ug-recent button:disabled { cursor: default; }
.ug-recent li:nth-child(odd) button { background: rgba(61,12,17,.035); }
.ug-recent button:not(:disabled):hover { background: rgba(201,168,76,.12); }
.ug-who { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${A.ink}; font-weight: 600; }
.ug-who small { margin-left: 6px; font-weight: 400; color: ${A.muted}; }
.ug-from { font-size: 12px; color: ${A.soft}; white-space: nowrap; }
.ug-recent time { font-size: 12px; color: ${A.muted}; white-space: nowrap; }
.ug-refresh { all: unset; cursor: pointer; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: #fff6e6; background: rgba(255,255,255,.12); }
.ug-spin { animation: ugSpin 1s linear infinite; }
@keyframes ugSpin { to { transform: rotate(360deg); } }
@media (max-width: 520px) { .ug-row { grid-template-columns: 1fr 44px; } .ug-track { grid-column: 1 / -1; grid-row: 2; } .ug-recent button { grid-template-columns: minmax(0, 1fr) auto; } .ug-from, .ug-recent time { display: none; } }
`;
