"use client";

// ─── Super admin: the influencer programme ───────────────────────────────────
//
// The default commission (and how long a click is remembered) at the top,
// every influencer below with what they have brought in and what is owed.
// Rates are locked onto each earning when it happens, so changing the default
// here only affects payments from now on. The copy says so, because a
// super admin dropping 30% → 20% should know nobody's past earnings move.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Percent, Save, Loader2, Check, ChevronRight, Clock, Star, MousePointerClick, UserPlus, Sparkles, IndianRupee, Wallet, AlertCircle, ArrowDownWideNarrow, Mail } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { rupees, fmtDate } from "@/lib/influencer";
import FreeAccessToggle from "../FreeAccessToggle";
import InfluencerTabs from "./InfluencerTabs";
import { A, AdminPage, Hero, HeroStat, Panel, ChipGroup, SearchBox, Loading, EmptyState, rise } from "../adminKit";

interface Row {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subdomain?: string;
  status: "active" | "suspended";
  instagram?: string;
  upiId?: string;
  commissionOverride: number | null;
  commissionPercent: number;
  joinedAt: string;
  clicks: number;
  signups: number;
  paidPages: number;
  revenuePaise: number;
  earnedPaise: number;
  paidOutPaise: number;
  pendingPaise: number;
  /** "All templates free" is on for this account. */
  freeAccess?: boolean;
  /** A super admin publishes free already; the toggle does not apply. */
  isSuperAdmin?: boolean;
  /** The email chat on their page: an unread reply, and how much has been said. */
  mail?: { unread: boolean; messages: number; lastMessageAt: string | null; lastDirection: string };
}

interface Settings { defaultCommissionPercent: number; attributionDays: number; updatedByEmail?: string; updatedAt?: string }

export default function AdminInfluencersPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pct, setPct] = useState("");
  const [days, setDays] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "owed" | "replies" | "active" | "suspended">("all");
  const [sort, setSort] = useState<"owed" | "earned" | "signups" | "newest">("owed");

  useEffect(() => {
    if (user && !isSuperAdmin(user.role)) router.replace("/admin/analytics");
  }, [user, router]);

  const apply = useCallback((d: { success: boolean; data: { influencers: Row[]; settings: Settings } }) => {
    if (!d.success) return;
    setRows(d.data.influencers);
    setSettings(d.data.settings);
    setPct(String(d.data.settings.defaultCommissionPercent));
    setDays(String(d.data.settings.attributionDays));
  }, []);

  const load = useCallback(
    () => fetch(`${API_URL}/admin/super/influencers`, { headers: { Authorization: `Bearer ${accessToken}` } }).then((r) => r.json()).then(apply),
    [accessToken, apply]
  );

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/admin/super/influencers`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then(apply)
      .catch(() => {});
  }, [accessToken, apply]);

  const saveSettings = async () => {
    setSaving("saving");
    setErr(null);
    const r = await fetch(`${API_URL}/admin/super/influencers/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ defaultCommissionPercent: Number(pct), attributionDays: Number(days) }),
    });
    const d = await r.json();
    if (!d.success) {
      setErr(d.error || "Could not save");
      setSaving("idle");
      return;
    }
    setSaving("saved");
    await load();
    setTimeout(() => setSaving("idle"), 1500);
  };

  const totals = useMemo(() => {
    const list = rows || [];
    return {
      count: list.length,
      active: list.filter((r) => r.status === "active").length,
      signups: list.reduce((s, r) => s + r.signups, 0),
      revenue: list.reduce((s, r) => s + r.revenuePaise, 0),
      earned: list.reduce((s, r) => s + r.earnedPaise, 0),
      pending: list.reduce((s, r) => s + r.pendingPaise, 0),
    };
  }, [rows]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (rows || []).filter((r) => {
      if (s && ![r.name, r.email, r.subdomain || "", r.instagram || ""].some((v) => v.toLowerCase().includes(s))) return false;
      if (filter === "owed") return r.pendingPaise > 0;
      if (filter === "replies") return !!r.mail?.unread;
      if (filter === "active") return r.status === "active";
      if (filter === "suspended") return r.status === "suspended";
      return true;
    }).sort((a, b) =>
      sort === "owed" ? b.pendingPaise - a.pendingPaise :
      sort === "earned" ? b.earnedPaise - a.earnedPaise :
      sort === "signups" ? b.signups - a.signups :
      new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );
  }, [rows, q, filter, sort]);

  const dirty = settings && (Number(pct) !== settings.defaultCommissionPercent || Number(days) !== settings.attributionDays);
  const examplePct = Number(pct) || 0;

  return (
    <AdminPage
      title="Influencers"
      icon={<Crown size={18} />}
      subtitle="People who share SubhSandesh for a commission. Anyone can join from /influencer. Everyone who signs up through their link is theirs for good, and they earn the commission % of every real payment those people make. Rates are locked onto each earning when it happens, so changes here only apply to future payments."
    >
      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="OWED" value={rupees(totals.pending)} sub={`${rupees(totals.earned)} earned`} tone="#ffe3a3" />
          <HeroStat label="REVENUE" value={rupees(totals.revenue)} />
          <HeroStat label="SIGNUPS" value={totals.signups} />
          <HeroStat label="INFLUENCERS" value={totals.count} sub={`${totals.active} active`} />
        </div>
      </Hero>

      <InfluencerTabs />

      <Panel title="Commission settings" icon={<Percent size={15} color={A.goldDeep} />} delay={0.05} style={{ marginTop: 14 }}>
        <div className="infa-settings">
          <label>
            <span>Default commission</span>
            <div className="infa-input"><input type="number" min={0} max={100} step={0.5} value={pct} onChange={(e) => setPct(e.target.value)} /><b>%</b></div>
            <small>of what a referred user actually pays. Override it per influencer on their page.</small>
          </label>
          <label>
            <span>Remember a click for</span>
            <div className="infa-input"><input type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} /><b>days</b></div>
            <small>A visitor who opens a link and signs up within this window counts.</small>
          </label>
          <div className="infa-example">
            <Clock size={14} />
            <span>Two referred users each pay ₹100 → SubhSandesh gets ₹200 → influencer earns <b>₹{((200 * examplePct) / 100).toLocaleString("en-IN")}</b></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
            <button type="button" className="infa-save" disabled={!dirty || saving === "saving"} onClick={saveSettings}>
              {saving === "saving" ? <Loader2 size={14} className="infa-spin" /> : saving === "saved" ? <Check size={14} /> : <Save size={14} />}
              {saving === "saved" ? "Saved" : "Save"}
            </button>
            {settings?.updatedByEmail && <span style={{ fontSize: 11.5, color: A.muted, overflowWrap: "anywhere", minWidth: 0 }}>Last changed by {settings.updatedByEmail}{settings.updatedAt ? ` · ${fmtDate(settings.updatedAt)}` : ""}</span>}
          </div>
          {err && <p style={{ margin: 0, color: A.danger, fontSize: 12.5, fontWeight: 700 }}>{err}</p>}
        </div>
      </Panel>

      <Panel title="All influencers" note={rows ? `${shown.length} shown` : undefined} delay={0.1} style={{ marginTop: 14 }}>
        <div className="infa-tools">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, email, link or @handle" style={{ flex: "1 1 220px", minWidth: 0 }} />
          <label className="infa-sort">
            <ArrowDownWideNarrow size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort influencers">
              <option value="owed">Most owed</option>
              <option value="earned">Top earners</option>
              <option value="signups">Most signups</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
        <div className="infa-chips">
          <ChipGroup
            id="infa-filter"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: rows?.length ?? 0 },
              { value: "owed", label: "Payout due", count: (rows || []).filter((r) => r.pendingPaise > 0).length },
              { value: "replies", label: "New replies", count: (rows || []).filter((r) => r.mail?.unread).length },
              { value: "active", label: "Active", count: (rows || []).filter((r) => r.status === "active").length },
              { value: "suspended", label: "Paused", count: (rows || []).filter((r) => r.status === "suspended").length },
            ]}
          />
        </div>
        {!rows ? (
          <Loading />
        ) : shown.length === 0 ? (
          <EmptyState icon={<Crown size={22} />} title={rows.length ? "No one matches" : "No influencers yet"} note={rows.length ? undefined : "Share /influencer with creators you want to work with."} />
        ) : (
          <div className="infa-grid">
            {shown.map((r, i) => (
              <motion.div key={r.id} {...rise(i)} style={{ minWidth: 0 }}>
                <InfluencerCard
                  r={r}
                  accessToken={accessToken}
                  onFreeAccess={(on) => setRows((prev) => (prev || []).map((x) => (x.id === r.id ? { ...x, freeAccess: on } : x)))}
                />
              </motion.div>
            ))}
          </div>
        )}
      </Panel>

      <style>{CSS}</style>
    </AdminPage>
  );
}

function InfluencerCard({ r, accessToken, onFreeAccess }: { r: Row; accessToken: string | null; onFreeAccess: (on: boolean) => void }) {
  const paused = r.status === "suspended";
  const paidShare = r.earnedPaise > 0 ? Math.min(100, Math.round((r.paidOutPaise / r.earnedPaise) * 100)) : 0;
  const handle = [r.instagram ? `@${r.instagram}` : null, r.subdomain].filter(Boolean).join(" · ");
  return (
    <div className={`infa-card ${paused ? "paused" : ""} ${r.pendingPaise > 0 ? "owed" : ""}`}>
    {/* The switch sits outside the link: a control nested in an <a> is invalid
        and a tap on it would also navigate. */}
    <Link href={`/admin/influencers/${r.id}`} className="infa-card-link">
      <div className="infa-card-top">
        <span className="infa-ava">
          {r.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            r.name.charAt(0).toUpperCase()
          )}
          <i className={`infa-dot ${paused ? "off" : "on"}`} title={paused ? "Paused" : "Active"} />
        </span>
        <span className="infa-id">
          <b>{r.name}</b>
          <span>{handle || r.email}</span>
        </span>
        {paused && <span className="infa-paused">Paused</span>}
        {r.mail?.unread ? (
          <span className="infa-mail new" title="They replied — open to read and answer">
            <Mail size={11} /> New reply
          </span>
        ) : r.mail && r.mail.messages > 0 ? (
          <span className="infa-mail" title={`${r.mail.messages} email${r.mail.messages === 1 ? "" : "s"} in the conversation`}>
            <Mail size={11} /> {r.mail.messages}
          </span>
        ) : null}
        <span className={`infa-rate ${r.commissionOverride !== null ? "custom" : ""}`} title={r.commissionOverride !== null ? "Custom rate" : "Default rate"}>
          {r.commissionOverride !== null && <Star size={10} fill="currentColor" />}
          {r.commissionPercent}%
        </span>
      </div>

      <div className="infa-money">
        <div className="infa-owed">
          <span>Owed</span>
          <b>{rupees(r.pendingPaise)}</b>
        </div>
        <div className="infa-earned">
          <span>Earned <b>{rupees(r.earnedPaise)}</b></span>
          <span>Paid <b>{rupees(r.paidOutPaise)}</b></span>
        </div>
        <div className="infa-bar" aria-label={`${paidShare}% paid out`}><span style={{ width: `${paidShare}%` }} /></div>
      </div>

      <div className="infa-stats">
        <span><MousePointerClick size={12} /><b>{r.clicks.toLocaleString("en-IN")}</b><small>Opens</small></span>
        <span><UserPlus size={12} /><b>{r.signups.toLocaleString("en-IN")}</b><small>Signups</small></span>
        <span><Sparkles size={12} /><b>{r.paidPages.toLocaleString("en-IN")}</b><small>Paid</small></span>
        <span><IndianRupee size={12} /><b>{rupees(r.revenuePaise)}</b><small>Revenue</small></span>
      </div>

      <div className="infa-foot">
        <span className={r.upiId ? "ok" : "warn"}>
          {r.upiId ? <><Wallet size={12} /> UPI added</> : <><AlertCircle size={12} /> No UPI yet</>}
        </span>
        <span className="infa-joined">Joined {fmtDate(r.joinedAt)}</span>
        <span className="infa-open">Open <ChevronRight size={14} /></span>
      </div>
    </Link>
      <FreeAccessToggle
        compact
        userId={r.id}
        enabled={!!r.freeAccess}
        accessToken={accessToken}
        onChange={onFreeAccess}
        disabledReason={r.isSuperAdmin ? "Super admins already publish free." : null}
      />
    </div>
  );
}

const CSS = `
  .infa-settings { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
  .infa-settings label { display: flex; flex-direction: column; gap: 6px; }
  .infa-settings label > span { font-size: 12px; font-weight: 800; color: ${A.ink}; }
  .infa-settings small { font-size: 11.5px; color: ${A.muted}; line-height: 1.4; }
  .infa-input { display: flex; align-items: center; gap: 6px; height: 44px; padding: 0 12px; border-radius: 12px; border: 1.5px solid ${A.edge}; background: ${A.paper}; max-width: 200px; }
  .infa-input input { flex: 1; min-width: 0; border: none; outline: none; background: none; font-size: 18px; font-weight: 800; color: ${A.ink}; }
  .infa-input b { color: ${A.muted}; font-size: 13px; }
  .infa-example { grid-column: 1 / -1; display: flex; align-items: flex-start; line-height: 1.45; gap: 8px; padding: 10px 12px; border-radius: 12px; background: rgba(201,168,76,.1); font-size: 12.5px; color: ${A.soft}; }
  .infa-example b { color: ${A.ok}; }
  .infa-save { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 18px; border-radius: 99px; border: none; background: ${A.maroon}; color: #f5ede6; font-weight: 800; font-size: 13px; cursor: pointer; }
  .infa-save:disabled { opacity: .4; cursor: not-allowed; }
  .infa-spin { animation: spin 1s linear infinite; }
  .infa-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
  .infa-sort { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 10px 0 12px; border-radius: 99px; border: 1px solid ${A.edge}; background: ${A.paper}; color: ${A.soft}; }
  .infa-sort select { border: none; outline: none; background: none; font-size: 12.5px; font-weight: 800; color: ${A.ink}; cursor: pointer; }
  .infa-chips { overflow-x: auto; scrollbar-width: none; margin: 0 -2px 12px; padding: 0 2px; }
  .infa-chips::-webkit-scrollbar { display: none; }
  .infa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; }
  .infa-card { position: relative; display: flex; flex-direction: column; gap: 12px; height: 100%; min-width: 0; padding: 14px; border-radius: 18px; background: ${A.paper}; border: 1px solid ${A.edge}; text-decoration: none; color: inherit; overflow: hidden; box-shadow: 0 2px 10px rgba(61,12,17,.04); transition: transform .2s, box-shadow .2s, border-color .2s; }
  .infa-card-link { display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 0; text-decoration: none; color: inherit; }
  .infa-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 3px; background: linear-gradient(90deg, ${A.gold}, #f2cf74); opacity: .0; transition: opacity .2s; }
  .infa-card.owed::before { opacity: 1; }
  .infa-card.paused { background: #fbf7f4; }
  .infa-card.paused::before { opacity: 1; background: ${A.danger}; }
  .infa-card:hover { transform: translateY(-2px); border-color: rgba(201,168,76,.5); box-shadow: 0 14px 30px -18px rgba(61,12,17,.35); }
  .infa-card-top { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .infa-ava { position: relative; width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${A.maroon}, ${A.maroon2}); color: #f2cf74; font-weight: 800; font-size: 16px; box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px rgba(201,168,76,.45); }
  .infa-ava img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  .infa-dot { position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; }
  .infa-dot.on { background: ${A.ok}; }
  .infa-dot.off { background: ${A.danger}; }
  .infa-id { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .infa-id b { font-size: 14.5px; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .infa-id span { font-size: 11.5px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .infa-mail { flex-shrink: 0; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 99px; background: rgba(61,12,17,.05); color: ${A.soft}; font-size: 10.5px; font-weight: 800; }
  .infa-mail.new { background: ${A.danger}; color: #fff; box-shadow: 0 0 0 3px rgba(179,38,30,.15); }
  .infa-paused { flex-shrink: 0; padding: 3px 8px; border-radius: 99px; background: rgba(179,38,30,.1); color: ${A.danger}; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
  .infa-rate { flex-shrink: 0; display: inline-flex; align-items: center; gap: 3px; padding: 4px 9px; border-radius: 99px; background: rgba(61,12,17,.06); color: ${A.maroon}; font-size: 12px; font-weight: 800; }
  .infa-rate.custom { background: rgba(201,168,76,.18); color: ${A.goldDeep}; }
  .infa-money { display: grid; grid-template-columns: minmax(0, auto) minmax(0, 1fr); align-items: end; gap: 4px 12px; padding: 12px; border-radius: 14px; background: linear-gradient(135deg, ${A.maroon}, ${A.maroon2}); color: #f5ede6; }
  .infa-owed { display: flex; flex-direction: column; min-width: 0; }
  .infa-owed span { font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: rgba(245,237,230,.65); }
  .infa-owed b { font: 700 24px/1.1 'Playfair Display', serif; color: #f2cf74; white-space: nowrap; }
  .infa-earned { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; min-width: 0; font-size: 11.5px; color: rgba(245,237,230,.7); }
  .infa-earned span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .infa-earned b { color: #fff; }
  .infa-bar { grid-column: 1 / -1; height: 5px; margin-top: 6px; border-radius: 99px; background: rgba(255,255,255,.14); overflow: hidden; }
  .infa-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #7ee2a8, #3aa76d); }
  .infa-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
  .infa-stats > span { display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 0; padding: 8px 2px; border-radius: 12px; background: rgba(61,12,17,.035); color: ${A.goldDeep}; }
  .infa-stats b { font-size: 13.5px; color: ${A.ink}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .infa-stats small { font-size: 9.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; }
  .infa-foot { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px dashed ${A.edge}; font-size: 11.5px; font-weight: 700; min-width: 0; }
  .infa-foot > span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
  .infa-foot .ok { color: ${A.ok}; }
  .infa-foot .warn { color: ${A.warn}; }
  .infa-joined { color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .infa-open { margin-left: auto; color: ${A.goldDeep}; font-weight: 800; }
  @media (max-width: 900px) {
    .infa-settings { grid-template-columns: minmax(0, 1fr); }
    .infa-input { max-width: none; }
  }
  @media (max-width: 420px) {
    .infa-card { padding: 12px; gap: 10px; }
    .infa-owed b { font-size: 21px; }
    .infa-joined { display: none; }
  }
`;
