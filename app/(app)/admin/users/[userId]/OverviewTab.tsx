"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { useToast } from "@/lib/toast/useToast";
import { C, type ProfileData } from "./types";
import { Card, Stat, Row, Empty, CopyBtn, fmt, fmtAgo } from "./ui";
import { Num } from "../../adminKit";
import { ROLE_META, RoleIcon, ProviderIcon } from "../../adminIcons";

export default function OverviewTab({ data, hdr, reload }: { data: ProfileData; hdr: () => Record<string, string>; reload: () => void }) {
  const { user, stats, referrals } = data;
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Role is changed here rather than on the user cards: one deliberate place,
  // next to everything else about the account.
  const changeRole = async (role: string) => {
    if (role === user.role) return;
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/admin/users/${user._id}/role`, { method: "PATCH", headers: hdr(), body: JSON.stringify({ role }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success) { pushToast({ title: `Role changed to ${ROLE_META[role]?.label || role}`, type: "success" }); reload(); }
      else pushToast({ title: j.error || "Could not change the role", type: "error" });
    } catch {
      pushToast({ title: "Could not reach the server", type: "error" });
    } finally {
      setSaving(false);
    }
  };
  const spent = Number(stats.totalSpent || 0);
  return (
    <>
      {/* Pages, published, views and points headline the hero; these are the rest. */}
      <div className="sa-stats">
        <Stat i={0} label="Locked" value={stats.passwordProtectedPages} tone={C.warn} />
        <Stat i={1} label="Contributions" value={stats.totalContributions} tone={C.danger} />
        <Stat i={2} label="Lifetime pts" value={user.totalPointsEarned} tone={C.goldDeep} />
        <Stat i={3} label="Referred" value={referrals.made?.length || 0} tone="#6d4ad1" />
        <Stat i={4} label="Favourites" value={data.favorites.length} tone={C.ok} />
        <Stat i={5} label="Spent" value={<>₹<Num value={spent} /></>} />
      </div>

      <div className="sa-grid2">
        <Card title="Account">
          <Row label="User ID" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0 }}><code className="sa-mono" style={{ overflowWrap: "anywhere" }}>{user._id}</code><CopyBtn value={user._id} label="Copy id" /></span>} />
          <Row label="Email" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0 }}><span style={{ overflowWrap: "anywhere" }}>{user.email}</span><CopyBtn value={user.email} label="Copy email" /></span>} />
          <Row label="Sign-in method" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ProviderIcon provider={user.provider} size={13} />{user.provider === "google" ? "Google" : "Email & password"}</span>} />
          <Row label="Email verified" value={<span style={{ color: user.isVerified ? C.ok : C.warn }}>{user.isVerified ? "Yes" : "No"}</span>} />
          <Row
            label="Role"
            value={
              user.role === "superadmin" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><RoleIcon role="superadmin" size={13} /> Super admin</span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <RoleIcon role={user.role} size={13} />
                  <select
                    className="sa-input"
                    value={user.role}
                    disabled={saving}
                    onChange={(e) => void changeRole(e.target.value)}
                    aria-label="Change role"
                    style={{ width: "auto", padding: "5px 8px", fontSize: 12.5, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}
                  >
                    <option value="normal">Normal</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </span>
              )
            }
          />
          {user.suspendedUntil && <Row label="Suspended until" value={fmt(user.suspendedUntil)} />}
          <Row label="Subdomain" value={user.subdomain || "—"} />
          <Row label="Referral code" value={<code className="sa-mono">{user.referralCode}</code>} />
          <Row label="Lifetime points earned" value={user.totalPointsEarned} />
          <Row label="Joined" value={fmtAgo(user.createdAt)} />
          <Row label="Last updated" value={fmtAgo(user.updatedAt)} />
        </Card>

        <div style={{ minWidth: 0 }}>
          <Card title="Referrals" note={`${referrals.made?.length || 0} made`} delay={0.05}>
            <Row label="Referred by" value={referrals.referredBy?.referrer?.email || "—"} />
            <Row label="People they referred" value={referrals.made?.length || 0} />
            {referrals.made?.length > 0 && (
              <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                {referrals.made.map((r, i) => (
                  <div key={i} className="sa-mini" style={{ fontSize: 12.5, animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                    <div style={{ fontWeight: 700, overflowWrap: "anywhere" }}>{r.referee?.email || "—"}</div>
                    <div style={{ color: C.muted, marginTop: 2, fontSize: 11.5 }}>{fmtAgo(r.referee?.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Payments" note={data.payments.length ? `${data.payments.length}` : undefined} delay={0.1}>
            {data.payments.length === 0 ? (
              <Empty>No payments.</Empty>
            ) : (
              data.payments.map((p, i) => (
                <Row
                  key={i}
                  label={`${String(p.templateType || "—")} · ${String(p.status || "")}`}
                  value={<strong style={{ color: String(p.status) === "paid" ? C.ok : C.muted }}>₹{Number(p.amount || 0)}</strong>}
                />
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
