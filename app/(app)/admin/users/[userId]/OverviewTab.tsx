"use client";

import { C, type ProfileData } from "./types";
import { Card, Stat, Row, Empty, CopyBtn, fmt } from "./ui";

export default function OverviewTab({ data }: { data: ProfileData }) {
  const { user, stats, referrals } = data;
  return (
    <>
      <div className="sa-stats">
        <Stat label="Pages" value={stats.totalPages} />
        <Stat label="Published" value={stats.publishedPages} tone={C.ok} />
        <Stat label="Total views" value={stats.totalViews.toLocaleString()} tone={C.accent} />
        <Stat label="Points" value={user.points} />
        <Stat label="Locked" value={stats.passwordProtectedPages} tone={C.warn} />
        <Stat label="Contributions" value={stats.totalContributions} tone={C.danger} />
      </div>

      <Card title="Account">
        <Row label="User ID" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><code className="sa-mono">{user._id}</code><CopyBtn value={user._id} label="Copy id" /></span>} />
        <Row label="Email" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{user.email}<CopyBtn value={user.email} label="Copy email" /></span>} />
        <Row label="Sign-in method" value={user.provider} />
        <Row label="Email verified" value={<span style={{ color: user.isVerified ? C.ok : C.warn }}>{user.isVerified ? "Yes" : "No"}</span>} />
        <Row label="Role" value={user.role} />
        {user.suspendedUntil && <Row label="Suspended until" value={fmt(user.suspendedUntil)} />}
        <Row label="Subdomain" value={user.subdomain || "—"} />
        <Row label="Referral code" value={<code className="sa-mono">{user.referralCode}</code>} />
        <Row label="Lifetime points earned" value={user.totalPointsEarned} />
        <Row label="Joined" value={fmt(user.createdAt)} />
        <Row label="Last updated" value={fmt(user.updatedAt)} />
      </Card>

      <Card title="Referrals">
        <Row label="Referred by" value={referrals.referredBy?.referrer?.email || "—"} />
        <Row label="People they referred" value={referrals.made?.length || 0} />
        {referrals.made?.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            {referrals.made.map((r, i) => (
              <div key={i} className="sa-mini" style={{ padding: 10, fontSize: 12.5 }}>
                <div style={{ fontWeight: 600 }}>{r.referee?.email || "—"}</div>
                <div style={{ color: C.muted, marginTop: 2 }}>{fmt(r.referee?.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Payments">
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
    </>
  );
}
