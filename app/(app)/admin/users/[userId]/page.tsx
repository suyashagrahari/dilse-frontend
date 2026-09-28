"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { ArrowLeft, ShieldAlert, UserCog } from "lucide-react";
import { C, STATUS_COLOR, type ProfileData } from "./types";
import { ProfileStyles, Skeleton, Empty, Pill, Btn, Dialog } from "./ui";
import OverviewTab from "./OverviewTab";
import PagesTab from "./PagesTab";
import DraftsTab from "./DraftsTab";
import PointsTab from "./PointsTab";
import ActivityTab from "./ActivityTab";
import DangerTab from "./DangerTab";
import AccessTab from "./AccessTab";
import { useToast } from "@/lib/toast/useToast";

const TABS = ["Overview", "Pages", "Drafts", "Points", "Access", "Activity", "Danger Zone"] as const;
type Tab = (typeof TABS)[number];

export default function AdminUserProfilePage() {
  return (
    <ProfileInner />
  );
}

/**
 * The complete view of one user.
 *
 * A route rather than the modal this replaces: the content is far too tall for
 * a dialog, and a URL can be linked in a support thread and survives a refresh.
 *
 * Every destructive control lives behind the Danger Zone tab and its own
 * confirmation, so nothing irreversible is one stray tap away from the
 * read-only browsing that is the common case.
 */
function ProfileInner() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { pushToast } = useToast();
  const { accessToken, user: me } = useAppSelector((s) => s.auth);

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [impOpen, setImpOpen] = useState(false);
  const [impReason, setImpReason] = useState("");
  const [impBusy, setImpBusy] = useState(false);

  const superAdmin = isSuperAdmin(me?.role);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  const load = useCallback(async () => {
    if (!accessToken || !userId) return;
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${userId}/profile`, { headers: hdr() });
      const j = await r.json();
      if (j.success) setData(j.data);
      else setErr(j.error || "Failed to load profile");
    } catch {
      setErr("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, userId, hdr]);

  useEffect(() => {
    if (superAdmin) load();
    else setLoading(false);
  }, [load, superAdmin]);

  const startImpersonation = async () => {
    setImpBusy(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${userId}/impersonate`, {
        method: "POST", headers: hdr(), body: JSON.stringify({ reason: impReason }),
      });
      const j = await r.json();
      if (!j.success) { pushToast({ title: j.error || "Could not start the session", type: "error" }); return; }

      // Opened FIRST so the token lands in the NEW tab's sessionStorage.
      // Writing it here would put it in this tab and shadow the admin's own
      // session instead.
      const w = window.open("/", "_blank");
      if (!w) { pushToast({ title: "Allow pop-ups to open the impersonation tab", type: "error" }); return; }
      const payload = {
        token: j.data.token,
        userName: j.data.user.name,
        userEmail: j.data.user.email,
        expiresAt: Date.now() + j.data.expiresInSeconds * 1000,
      };
      setTimeout(() => {
        try {
          w.sessionStorage.setItem("gifts_impersonation", JSON.stringify(payload));
          w.location.reload();
          pushToast({ title: "Impersonation started in a new tab", type: "success" });
        } catch {
          pushToast({ title: "Could not start the session in the new tab", type: "error" });
        }
      }, 300);
      setImpOpen(false);
      setImpReason("");
    } finally {
      setImpBusy(false);
    }
  };

  const body = () => {
    if (!superAdmin) {
      return (
        <div className="sa-card" style={{ textAlign: "center", padding: "56px 20px" }}>
          <ShieldAlert size={34} style={{ color: C.danger, marginBottom: 12 }} />
          <h2 className="sa-h" style={{ margin: "0 0 6px", fontSize: 18 }}>Super admin only</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: C.muted }}>
            This page shows personal data and is limited to the super admin account.
          </p>
        </div>
      );
    }
    if (loading) return <><Skeleton h={110} /><Skeleton h={44} /><Skeleton h={200} /><Skeleton h={160} /></>;
    if (err || !data) return <div className="sa-card"><Empty>{err || "Not found"}</Empty></div>;

    const { user } = data;
    const status = user.status || "active";

    return (
      <>
        <div className="sa-head">
          <div className="sa-avatar">
            {user.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (user.name || "?").slice(0, 1).toUpperCase()
            )}
          </div>

          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <h1 className="sa-name sa-h">{user.name}</h1>
              <Pill text={status} color={STATUS_COLOR[status] || C.muted} solid />
              <Pill text={user.role} color={C.gold} solid />
            </div>
            <div className="sa-email">{user.email}</div>
            {user.statusReason && (
              <div style={{ color: "#f0b7bd", fontSize: 12, marginTop: 3 }}>Reason: {user.statusReason}</div>
            )}
          </div>

          <div style={{ flex: "0 0 auto" }}>
            <Btn
              variant="primary"
              onClick={() => setImpOpen(true)}
              disabled={status !== "active"}
              title={status !== "active" ? "Reinstate the account first" : "Opens a 15-minute session in a new tab"}
            >
              <UserCog size={14} /> View as user
            </Btn>
          </div>
        </div>

        <div className="sa-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className="sa-tab"
              data-on={tab === t ? "1" : "0"}
              data-danger={t === "Danger Zone" ? "1" : "0"}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && <OverviewTab data={data} hdr={hdr} reload={load} />}
        {tab === "Pages" && <PagesTab data={data} hdr={hdr} reload={load} />}
        {tab === "Drafts" && (
          <DraftsTab userId={String(userId)} userEmail={user.email} hdr={hdr} />
        )}
        {tab === "Points" && <PointsTab data={data} hdr={hdr} reload={load} />}
        {tab === "Access" && <AccessTab userId={String(userId)} hdr={hdr} />}
        {tab === "Activity" && <ActivityTab userId={String(userId)} hdr={hdr} />}
        {tab === "Danger Zone" && <DangerTab data={data} hdr={hdr} reload={load} />}

        <Dialog open={impOpen} onClose={() => setImpOpen(false)} title="View as this user?">
          <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 12px" }}>
            Opens a <strong>15-minute</strong> session as {user.name} in a new tab. It cannot be
            extended, and changing their password, profile or subdomain stays blocked.
          </p>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "0 0 14px" }}>
            The start and end of the session are both recorded in the audit log.
          </p>
          <input
            className="sa-input"
            value={impReason}
            onChange={(e) => setImpReason(e.target.value)}
            placeholder="Reason (recorded in the audit log)"
            autoFocus
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setImpOpen(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={startImpersonation} disabled={impBusy}>
              {impBusy ? "Starting…" : "Start session"}
            </Btn>
          </div>
        </Dialog>
      </>
    );
  };

  return (
    <div className="sa-root">
      <ProfileStyles />
      <div className="sa-wrap">
        <button
          onClick={() => router.push("/admin/users")}
          className="sa-btn"
          data-v="ghost"
          style={{ marginBottom: 10 }}
        >
          <ArrowLeft size={14} /> All users
        </button>
        {body()}
      </div>
    </div>
  );
}
