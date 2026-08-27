"use client";

import { C, type ProfileData } from "./types";
import { Card, Stat, Row, Empty, fmt } from "./ui";

export default function OverviewTab({ data }: { data: ProfileData }) {
  const { user, stats, referrals } = data;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Stat label="Pages" value={stats.totalPages} />
        <Stat label="Published" value={stats.publishedPages} />
        <Stat label="Total views" value={stats.totalViews.toLocaleString()} />
        <Stat label="Points" value={user.points} />
        <Stat label="Password-locked" value={stats.passwordProtectedPages} />
        <Stat label="Contributions" value={stats.totalContributions} />
      </div>

      <Card title="Account">
        <Row label="User ID" value={<code style={{ fontSize: 11 }}>{user._id}</code>} />
        <Row label="Email" value={user.email} />
        <Row label="Sign-in method" value={user.provider} />
        <Row label="Email verified" value={user.isVerified ? "Yes" : "No"} />
        <Row label="Role" value={user.role} />
        <Row label="Status" value={user.status || "active"} />
        {user.suspendedUntil && <Row label="Suspended until" value={fmt(user.suspendedUntil)} />}
        <Row label="Subdomain" value={user.subdomain || "—"} />
        <Row label="Referral code" value={user.referralCode} />
        <Row label="Lifetime points earned" value={user.totalPointsEarned} />
        <Row label="Joined" value={fmt(user.createdAt)} />
        <Row label="Last updated" value={fmt(user.updatedAt)} />
      </Card>

      <Card title="Referrals">
        <Row
          label="Referred by"
          value={referrals.referredBy?.referrer?.email || "—"}
        />
        <Row label="People they referred" value={referrals.made?.length || 0} />
        {referrals.made?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {referrals.made.map((r, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.t2, padding: "4px 0" }}>
                {r.referee?.email || "—"} · {fmt(r.referee?.createdAt)}
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
              value={`₹${Number(p.amount || 0)}`}
            />
          ))
        )}
      </Card>
    </>
  );
}
