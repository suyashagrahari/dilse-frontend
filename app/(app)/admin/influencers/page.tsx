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
import { Crown, Percent, Save, Loader2, Check, ChevronRight, Clock } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { rupees, fmtDate } from "@/lib/influencer";
import { A, AdminPage, Hero, HeroStat, Panel, ChipGroup, SearchBox, Loading, EmptyState, Tag, rise } from "../adminKit";

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
  const [filter, setFilter] = useState<"all" | "owed" | "active" | "suspended">("all");

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
      if (filter === "active") return r.status === "active";
      if (filter === "suspended") return r.status === "suspended";
      return true;
    });
  }, [rows, q, filter]);

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
          <HeroStat big label="OWED TO INFLUENCERS" value={rupees(totals.pending)} sub={`${rupees(totals.earned)} earned in total`} tone="#ffe3a3" />
          <HeroStat label="REVENUE THEY BROUGHT" value={rupees(totals.revenue)} />
          <HeroStat label="SIGNUPS VIA LINKS" value={totals.signups} />
          <HeroStat label="INFLUENCERS" value={totals.count} sub={`${totals.active} active`} />
        </div>
      </Hero>

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button" className="infa-save" disabled={!dirty || saving === "saving"} onClick={saveSettings}>
              {saving === "saving" ? <Loader2 size={14} className="infa-spin" /> : saving === "saved" ? <Check size={14} /> : <Save size={14} />}
              {saving === "saved" ? "Saved" : "Save"}
            </button>
            {settings?.updatedByEmail && <span style={{ fontSize: 11.5, color: A.muted }}>Last changed by {settings.updatedByEmail}{settings.updatedAt ? ` · ${fmtDate(settings.updatedAt)}` : ""}</span>}
          </div>
          {err && <p style={{ margin: 0, color: A.danger, fontSize: 12.5, fontWeight: 700 }}>{err}</p>}
        </div>
      </Panel>

      <Panel title="All influencers" delay={0.1} style={{ marginTop: 14 }} right={<SearchBox value={q} onChange={setQ} placeholder="Name, email, link, @handle" />}>
        <ChipGroup
          id="infa-filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: rows?.length ?? 0 },
            { value: "owed", label: "Payout due", count: (rows || []).filter((r) => r.pendingPaise > 0).length },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Paused" },
          ]}
          style={{ marginBottom: 12 }}
        />
        {!rows ? (
          <Loading />
        ) : shown.length === 0 ? (
          <EmptyState icon={<Crown size={22} />} title={rows.length ? "No one matches" : "No influencers yet"} note={rows.length ? undefined : "Share /influencer with creators you want to work with."} />
        ) : (
          <div className="infa-list">
            {shown.map((r, i) => (
              <motion.div key={r.id} {...rise(i)}>
                <Link href={`/admin/influencers/${r.id}`} className="infa-row">
                  <span className="infa-ava">{r.name.charAt(0).toUpperCase()}</span>
                  <span className="infa-main">
                    <b>{r.name} {r.status === "suspended" && <Tag tone={A.danger}>Paused</Tag>}</b>
                    <span>{r.subdomain ? `${r.subdomain} · ` : ""}{r.instagram ? `@${r.instagram} · ` : ""}{r.email}</span>
                  </span>
                  <span className="infa-cells">
                    <span><small>Rate</small><b>{r.commissionPercent}%{r.commissionOverride !== null && <i title="Custom rate">★</i>}</b></span>
                    <span><small>Opens</small><b>{r.clicks}</b></span>
                    <span><small>Signups</small><b>{r.signups}</b></span>
                    <span><small>Paid</small><b>{r.paidPages}</b></span>
                    <span><small>Earned</small><b>{rupees(r.earnedPaise)}</b></span>
                    <span className={r.pendingPaise > 0 ? "due" : ""}><small>Owed</small><b>{rupees(r.pendingPaise)}</b></span>
                  </span>
                  <ChevronRight size={16} color={A.muted} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Panel>

      <style>{CSS}</style>
    </AdminPage>
  );
}

const CSS = `
  .infa-settings { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .infa-settings label { display: flex; flex-direction: column; gap: 6px; }
  .infa-settings label > span { font-size: 12px; font-weight: 800; color: ${A.ink}; }
  .infa-settings small { font-size: 11.5px; color: ${A.muted}; line-height: 1.4; }
  .infa-input { display: flex; align-items: center; gap: 6px; height: 44px; padding: 0 12px; border-radius: 12px; border: 1.5px solid ${A.edge}; background: ${A.paper}; max-width: 200px; }
  .infa-input input { flex: 1; min-width: 0; border: none; outline: none; background: none; font-size: 18px; font-weight: 800; color: ${A.ink}; }
  .infa-input b { color: ${A.muted}; font-size: 13px; }
  .infa-example { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; background: rgba(201,168,76,.1); font-size: 12.5px; color: ${A.soft}; }
  .infa-example b { color: ${A.ok}; }
  .infa-save { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 18px; border-radius: 99px; border: none; background: ${A.maroon}; color: #f5ede6; font-weight: 800; font-size: 13px; cursor: pointer; }
  .infa-save:disabled { opacity: .4; cursor: not-allowed; }
  .infa-spin { animation: spin 1s linear infinite; }
  .infa-list { display: grid; gap: 8px; }
  .infa-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; background: ${A.paper}; border: 1px solid ${A.edge}; text-decoration: none; color: inherit; transition: border-color .2s, transform .2s; }
  .infa-row:hover { border-color: rgba(201,168,76,.5); transform: translateY(-1px); }
  .infa-ava { width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${A.maroon}, ${A.maroon2}); color: #f2cf74; font-weight: 800; }
  .infa-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .infa-main b { display: flex; align-items: center; gap: 6px; font-size: 14px; color: ${A.ink}; }
  .infa-main > span { font-size: 11.5px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .infa-cells { display: grid; grid-template-columns: repeat(6, minmax(56px, auto)); gap: 12px; }
  .infa-cells > span { display: flex; flex-direction: column; align-items: flex-end; }
  .infa-cells small { font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${A.muted}; }
  .infa-cells b { font-size: 13.5px; color: ${A.ink}; white-space: nowrap; }
  .infa-cells i { font-style: normal; color: ${A.gold}; margin-left: 2px; }
  .infa-cells .due b { color: ${A.ok}; }
  @media (max-width: 900px) {
    .infa-settings { grid-template-columns: 1fr; }
    .infa-row { flex-wrap: wrap; }
    .infa-cells { order: 3; width: 100%; grid-template-columns: repeat(3, 1fr); }
    .infa-cells > span { align-items: flex-start; }
  }
`;
