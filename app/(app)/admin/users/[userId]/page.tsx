"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { setImpersonation } from "@/lib/impersonation";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { C, type ProfileData } from "./types";
import OverviewTab from "./OverviewTab";
import PagesTab from "./PagesTab";
import PointsTab from "./PointsTab";
import ActivityTab from "./ActivityTab";
import DangerTab from "./DangerTab";

const TABS = ["Overview", "Pages", "Points", "Activity", "Danger Zone"] as const;
type Tab = (typeof TABS)[number];

/**
 * The complete view of one user.
 *
 * A route rather than the modal this replaces: the content is far too tall for
 * a dialog, and a URL can be linked in a support thread and survives a refresh.
 *
 * Every destructive control lives behind the Danger Zone tab and its own typed
 * confirmation, so nothing irreversible is one stray click away from the
 * read-only browsing that is the common case.
 */
export default function AdminUserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { accessToken, user: me } = useAppSelector((s) => s.auth);

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");

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

  const impersonate = async () => {
    const reason = window.prompt("Reason for viewing as this user? (recorded in the audit log)");
    if (reason === null) return;
    const r = await fetch(`${API_URL}/admin/super/users/${userId}/impersonate`, {
      method: "POST",
      headers: hdr(),
      body: JSON.stringify({ reason }),
    });
    const j = await r.json();
    if (!j.success) {
      window.alert(j.error || "Could not start the session.");
      return;
    }
    // Opened FIRST so the token is written into the new tab's own
    // sessionStorage — writing it here would put it in this tab instead and
    // leave the admin's own session shadowed.
    const w = window.open("/", "_blank");
    if (!w) {
      window.alert("Allow pop-ups for this site to open the impersonation tab.");
      return;
    }
    const payload = {
      token: j.data.token,
      userName: j.data.user.name,
      userEmail: j.data.user.email,
      expiresAt: Date.now() + j.data.expiresInSeconds * 1000,
    };
    const write = () => {
      try {
        w.sessionStorage.setItem("gifts_impersonation", JSON.stringify(payload));
        w.location.reload();
      } catch {
        window.alert("Could not start the session in the new tab.");
      }
    };
    // The blank tab needs a moment before its storage is reachable.
    setTimeout(write, 300);
  };

  if (!superAdmin) {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: 64, color: C.t2 }}>
          <ShieldAlert size={36} style={{ color: C.danger, marginBottom: 12 }} />
          <h2 style={{ color: C.t1, margin: "0 0 6px", fontSize: 18 }}>Super admin only</h2>
          <p style={{ margin: 0, fontSize: 14 }}>
            This page shows personal data and is limited to the super admin account.
          </p>
        </div>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2 size={28} className="animate-spin" style={{ color: C.gold }} />
        </div>
      </Shell>
    );
  }

  if (err || !data) {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: 64, color: C.danger }}>{err || "Not found"}</div>
      </Shell>
    );
  }

  const { user } = data;
  const statusColor =
    user.status === "banned" ? C.danger : user.status === "suspended" ? C.goldD : C.ok;

  return (
    <Shell>
      <button
        onClick={() => router.push("/admin/users")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, background: "none",
          border: "none", color: C.t2, cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 16,
        }}
      >
        <ArrowLeft size={15} /> All users
      </button>

      <div
        style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: "50%", background: C.bg,
            display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700,
            color: C.goldD, overflow: "hidden", flexShrink: 0,
          }}
        >
          {user.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            (user.name || "?").slice(0, 1).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 20, color: C.t1 }}>{user.name}</h1>
            <span
              style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
                color: statusColor, border: `1px solid ${statusColor}`, borderRadius: 999, padding: "2px 8px",
              }}
            >
              {user.status || "active"}
            </span>
            <span style={{ fontSize: 11, color: C.tM, border: `1px solid ${C.border}`, borderRadius: 999, padding: "2px 8px" }}>
              {user.role}
            </span>
          </div>
          <div style={{ color: C.t2, fontSize: 13, marginTop: 3 }}>{user.email}</div>
          {user.statusReason && (
            <div style={{ color: C.danger, fontSize: 12, marginTop: 4 }}>Reason: {user.statusReason}</div>
          )}
        </div>
        <button
          onClick={impersonate}
          disabled={user.status !== "active"}
          title={user.status !== "active" ? "Reinstate the account first" : "Opens a 15-minute session in a new tab"}
          style={{
            background: user.status === "active" ? C.t1 : "rgba(61,12,17,0.25)",
            color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px",
            fontSize: 13, fontWeight: 600, cursor: user.status === "active" ? "pointer" : "not-allowed",
          }}
        >
          View as user
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, margin: "18px 0", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? C.t1 : "transparent",
              color: tab === t ? "#fff" : t === "Danger Zone" ? C.danger : C.t2,
              border: `1px solid ${tab === t ? C.t1 : C.border}`,
              borderRadius: 8, padding: "7px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab data={data} />}
      {tab === "Pages" && <PagesTab data={data} hdr={hdr} reload={load} />}
      {tab === "Points" && <PointsTab data={data} hdr={hdr} reload={load} />}
      {tab === "Activity" && <ActivityTab userId={String(userId)} hdr={hdr} />}
      {tab === "Danger Zone" && <DangerTab data={data} hdr={hdr} reload={load} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 20px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
