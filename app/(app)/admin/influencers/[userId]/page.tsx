"use client";

// One influencer, as they see it (emails unmasked), plus the three things only
// a super admin does: set their rate, pause them, and record money sent.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Percent, Pause, Play, Wallet, Loader2, Trash2, Copy, Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { rupees, fmtDate, type InfluencerDashboard } from "@/lib/influencer";
import InfluencerDashboardView from "@/components/influencer/InfluencerDashboardView";
import { A, Loading } from "../../adminKit";
import InfluencerMailPanel from "./InfluencerMailPanel";

export default function AdminInfluencerDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const [data, setData] = useState<InfluencerDashboard | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (user && !isSuperAdmin(user.role)) router.replace("/admin/analytics");
  }, [user, router]);

  const apply = useCallback((d: { success: boolean; data: InfluencerDashboard }) => {
    if (d.success) setData(d.data);
    else setNotFound(true);
  }, []);

  const load = useCallback(
    () => fetch(`${API_URL}/admin/super/influencers/${userId}`, { headers: { Authorization: `Bearer ${accessToken}` } }).then((r) => r.json()).then(apply),
    [accessToken, userId, apply]
  );

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/admin/super/influencers/${userId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then(apply)
      .catch(() => {});
  }, [accessToken, userId, apply]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 16px 40px" }}>
      <Link href="/admin/influencers" style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: "6px 0 12px", fontSize: 13, fontWeight: 800, color: A.goldDeep, textDecoration: "none" }}>
        <ArrowLeft size={15} /> All influencers
      </Link>
      {notFound ? (
        <p style={{ color: A.muted }}>This user isn&apos;t an influencer.</p>
      ) : !data ? (
        <Loading h={400} />
      ) : (
        <InfluencerDashboardView data={data} mode="admin" adminSlot={
            <>
              <Controls data={data} token={accessToken!} onChange={load} />
              <InfluencerMailPanel userId={data.profile.id} token={accessToken!} name={data.profile.name} />
            </>
          }
        />
      )}
    </div>
  );
}

function Controls({ data, token, onChange }: { data: InfluencerDashboard; token: string; onChange: () => Promise<void> }) {
  const { profile, totals } = data;
  const [rate, setRate] = useState(profile.commissionOverride === null ? "" : String(profile.commissionOverride));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const call = async (key: string, url: string, method: string, body?: unknown) => {
    setBusy(key);
    setMsg(null);
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Failed");
      await onChange();
      return true;
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const base = `${API_URL}/admin/super/influencers/${profile.id}`;

  return (
    <section className="infc">
      <style>{CSS}</style>

      <div className="infc-box">
        <h3><Percent size={14} /> Commission rate</h3>
        <p>Blank = the default. Applies to payments from now on.</p>
        <div className="infc-row">
          <div className="infc-input"><input type="number" min={0} max={100} step={0.5} value={rate} placeholder="default" onChange={(e) => setRate(e.target.value)} /><b>%</b></div>
          <button type="button" className="infc-btn" disabled={busy === "rate"} onClick={async () => {
            if (await call("rate", base, "PATCH", { commissionPercent: rate === "" ? null : Number(rate) })) setMsg({ ok: true, text: "Rate saved" });
          }}>{busy === "rate" ? <Loader2 size={14} className="infc-spin" /> : "Save rate"}</button>
        </div>
        <p className="infc-now">Now earning <b>{profile.commissionPercent}%</b>{profile.commissionOverride === null ? " (default)" : " (custom)"}</p>
      </div>

      <div className="infc-box">
        <h3><Wallet size={14} /> Record a payout</h3>
        <p>
          Owed <b>{rupees(totals.pendingPaise)}</b>
          {profile.upiId ? (
            <>
              {" · UPI "}
              <button type="button" className="infc-upi" onClick={() => { navigator.clipboard?.writeText(profile.upiId!); setCopied(true); setTimeout(() => setCopied(false), 1400); }}>
                {profile.upiId} {copied ? <Check size={11} /> : <Copy size={11} />}
              </button>
            </>
          ) : " · no UPI ID yet"}
        </p>
        <div className="infc-row">
          <div className="infc-input"><b>₹</b><input type="number" min={1} step={1} value={amount} placeholder={String(Math.floor(totals.pendingPaise / 100))} onChange={(e) => setAmount(e.target.value)} /></div>
          {totals.pendingPaise >= 100 && String(Math.floor(totals.pendingPaise / 100)) !== amount && (
            <button type="button" className="infc-fill" onClick={() => setAmount(String(Math.floor(totals.pendingPaise / 100)))}>Fill owed</button>
          )}
          <input className="infc-note" value={note} maxLength={200} placeholder="UPI ref / note" onChange={(e) => setNote(e.target.value)} />
          <button type="button" className="infc-btn" disabled={!amount || busy === "pay"} onClick={async () => {
            if (await call("pay", `${base}/payouts`, "POST", { amountRupees: Number(amount), note })) {
              setAmount("");
              setNote("");
              setMsg({ ok: true, text: "Payout recorded" });
            }
          }}>{busy === "pay" ? <Loader2 size={14} className="infc-spin" /> : "Record"}</button>
        </div>
        {data.payouts.length > 0 && (
          <ul className="infc-payouts">
            {data.payouts.slice(0, 5).map((p) => (
              <li key={p.id}>
                <span>{rupees(p.amountPaise)} · {fmtDate(p.paidAt)}{p.note ? ` · ${p.note}` : ""}</span>
                <button type="button" aria-label="Delete payout" disabled={busy === p.id} onClick={() => {
                  if (window.confirm(`Delete the ${rupees(p.amountPaise)} payout record? Use this only for a mistaken entry.`)) void call(p.id, `${base}/payouts/${p.id}`, "DELETE");
                }}><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="infc-box">
        <h3>{profile.status === "active" ? <Pause size={14} /> : <Play size={14} />} Status: {profile.status === "active" ? "Active" : "Paused"}</h3>
        <p>{profile.status === "active" ? "Pausing stops new signups being tracked and new payments earning. Past earnings stay." : "Resume to start tracking signups and earnings again."}</p>
        <button type="button" className={`infc-btn ${profile.status === "active" ? "danger" : ""}`} disabled={busy === "status"} onClick={() => {
          void call("status", base, "PATCH", { status: profile.status === "active" ? "suspended" : "active" });
        }}>{busy === "status" ? <Loader2 size={14} className="infc-spin" /> : profile.status === "active" ? "Pause influencer" : "Resume influencer"}</button>
      </div>

      {msg && <p className={`infc-msg ${msg.ok ? "ok" : ""}`}>{msg.text}</p>}
    </section>
  );
}

const CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .infc { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 10px; min-width: 0; }
  .infc-box { min-width: 0; padding: 14px; border-radius: 18px; background: ${A.paper}; border: 1px solid rgba(201,168,76,.35); }
  .infc-box h3 { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 13.5px; color: ${A.ink}; }
  .infc-box p { margin: 4px 0 10px; font-size: 12px; color: ${A.muted}; line-height: 1.45; overflow-wrap: anywhere; }
  .infc-box p b { color: ${A.ink}; }
  .infc-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .infc-input { display: flex; align-items: center; gap: 4px; height: 38px; padding: 0 10px; border-radius: 10px; border: 1.5px solid ${A.edge}; background: #fff; width: 110px; }
  .infc-input input { width: 100%; border: none; outline: none; font-size: 15px; font-weight: 800; color: ${A.ink}; background: none; }
  .infc-input b { color: ${A.muted}; font-size: 12px; }
  .infc-note { flex: 1 1 120px; min-width: 0; height: 38px; padding: 0 10px; border-radius: 10px; border: 1.5px solid ${A.edge}; font-size: 13px; outline: none; }
  .infc-fill { height: 38px; padding: 0 12px; border-radius: 99px; border: 1px dashed rgba(201,168,76,.7); background: rgba(201,168,76,.1); color: ${A.goldDeep}; font-weight: 800; font-size: 12px; cursor: pointer; }
  .infc-btn { height: 38px; padding: 0 14px; border-radius: 99px; border: none; background: ${A.maroon}; color: #f5ede6; font-weight: 800; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .infc-btn.danger { background: ${A.danger}; }
  .infc-btn:disabled { opacity: .45; cursor: not-allowed; }
  .infc-now { margin: 8px 0 0 !important; }
  .infc-upi { display: inline-flex; align-items: center; gap: 4px; border: none; background: rgba(201,168,76,.15); color: ${A.goldDeep}; font-weight: 800; font-size: 11.5px; padding: 2px 8px; border-radius: 99px; cursor: pointer; }
  .infc-payouts { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 4px; }
  .infc-payouts li { min-width: 0; overflow-wrap: anywhere; display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 11.5px; color: ${A.soft}; padding: 5px 8px; border-radius: 8px; background: rgba(61,12,17,.03); }
  .infc-payouts button { border: none; background: none; color: ${A.danger}; cursor: pointer; display: flex; }
  .infc-msg { grid-column: 1 / -1; margin: 0; font-size: 12.5px; font-weight: 700; color: ${A.danger}; }
  .infc-msg.ok { color: ${A.ok}; }
  .infc-spin { animation: spin 1s linear infinite; }
`;
