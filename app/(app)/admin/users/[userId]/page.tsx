"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShieldAlert, UserCog, UserRound, LayoutDashboard, LayoutGrid, FileText,
  Coins, KeyRound, History, TriangleAlert, CalendarDays, Receipt,
} from "lucide-react";
import { C, STATUS_COLOR, type ProfileData } from "./types";
import { ProfileStyles, Skeleton, Empty, Pill, Btn, Dialog, fmtAgo } from "./ui";
import { AdminPage, Num, HeroHead } from "../../adminKit";
import { ROLE_META, RoleIcon, ProviderIcon } from "../../adminIcons";
import OverviewTab from "./OverviewTab";
import PagesTab from "./PagesTab";
import DraftsTab from "./DraftsTab";
import PointsTab from "./PointsTab";
import ActivityTab from "./ActivityTab";
import DangerTab from "./DangerTab";
import AccessTab from "./AccessTab";
import BillingTab from "./BillingTab";
import { useToast } from "@/lib/toast/useToast";

const TABS = ["Overview", "Billing", "Pages", "Drafts", "Points", "Access", "Activity", "Danger Zone"] as const;
type Tab = (typeof TABS)[number];
const TAB_ICON: Record<Tab, typeof UserCog> = {
  Overview: LayoutDashboard, Billing: Receipt, Pages: LayoutGrid, Drafts: FileText, Points: Coins,
  Access: KeyRound, Activity: History, "Danger Zone": TriangleAlert,
};

/** "Danger Zone" ⇄ "danger-zone" — the tab's name in `?tab=`. */
const tabSlug = (t: Tab) => t.toLowerCase().replace(/\s+/g, "-");

const ABOUT = "Everything about one account — billing, pages, points, access and the audit trail. Role changes live on the Overview tab; payments and billing statements on Billing; suspensions and account closure behind Danger Zone.";

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

  // `?tab=billing` (the Revenue page links here that way) opens that tab, and
  // switching tabs keeps the URL in step so a refresh or a pasted link lands on
  // the same one. Read in an effect, not `useSearchParams`, for the reason
  // given in admin/drafts/page.tsx.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("tab");
    const hit = TABS.find((t) => tabSlug(t) === want);
    if (hit) setTab(hit);
  }, []);

  const pickTab = (t: Tab) => {
    setTab(t);
    const p = new URLSearchParams(window.location.search);
    if (t === "Overview") p.delete("tab"); else p.set("tab", tabSlug(t));
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

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

  // Back to the list only; switching admin sections is the navbar's job.
  const backBtn = (
    <button onClick={() => router.push("/admin/users")} className="adk-btn">
      <ArrowLeft size={13} /> All users
    </button>
  );

  const body = () => {
    if (!superAdmin) {
      return (
        <div className="sa-card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <ShieldAlert size={34} style={{ color: C.danger, marginBottom: 12 }} />
          <h2 className="sa-h" style={{ margin: "0 0 6px", fontSize: 18 }}>Super admin only</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: C.muted }}>
            This page shows personal data and is limited to the super admin account.
          </p>
        </div>
      );
    }
    if (loading) return <><Skeleton h={168} /><Skeleton h={42} /><Skeleton h={80} /><Skeleton h={220} /></>;
    if (err || !data) return <div className="sa-card"><Empty>{err || "Not found"}</Empty></div>;

    const { user, stats } = data;
    const status = user.status || "active";
    const role = ROLE_META[user.role] || ROLE_META.normal;

    return (
      <>
        <motion.div
          className="sa-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span aria-hidden className="adk-hero-shine" />
          <span aria-hidden className="sa-hero-glow" />

          <div style={{ position: "relative" }}>
            <HeroHead title="User profile" subtitle={ABOUT} icon={<UserRound size={16} />} actions={backBtn} />
          </div>
          <div className="sa-hero-top">
            <motion.div
              className="sa-avatar-w"
              initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.08 }}
            >
              <div className="sa-avatar">
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (user.name || "?").slice(0, 1).toUpperCase()
                )}
              </div>
              <span
                className="sa-avatar-badge"
                title={user.provider === "google" ? "Signed in with Google" : "Email & password"}
              >
                <ProviderIcon provider={user.provider} size={12} />
              </span>
            </motion.div>

            <div className="sa-id">
              <h1 className="sa-name" title={user.name}>{user.name}</h1>
              <div className="sa-email" title={user.email}>{user.email}</div>
              <div className="sa-hero-pills">
                <Pill text={status} color={STATUS_COLOR[status] || C.muted} solid />
                <span
                  className="sa-pill"
                  style={{ background: "rgba(255,246,230,.95)", color: role.color, border: "1px solid rgba(255,246,230,.95)" }}
                >
                  <RoleIcon role={user.role} size={11} /> {role.label}
                </span>
                <span className="sa-hero-meta">
                  <CalendarDays size={11} /> Joined {fmtAgo(user.createdAt)}
                </span>
              </div>
              {status === "closed" && (
                <div style={{ color: "#e4d6dc", fontSize: 12, marginTop: 4, overflowWrap: "anywhere" }}>
                  Closed{user.closedAt ? ` ${fmtAgo(user.closedAt)}` : ""}
                  {user.closureMode === "delete" ? " · pages permanently deleted" : user.closureMode === "hide" ? " · everything hidden (reversible)" : ""}
                  {user.closureReason ? ` · “${user.closureReason}”` : ""}
                </div>
              )}
              {user.statusReason && (
                <div style={{ color: "#f0b7bd", fontSize: 12, marginTop: 4, overflowWrap: "anywhere" }}>Reason: {user.statusReason}</div>
              )}
            </div>

            <div className="sa-hero-btn">
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

          <div className="sa-hero-stats">
            {[
              { l: "Pages", v: stats.totalPages },
              { l: "Published", v: stats.publishedPages },
              { l: "Views", v: stats.totalViews, big: true },
              { l: "Points", v: user.points, big: true },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                className="sa-hs"
                data-big={s.big ? "1" : "0"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
              >
                <div className="sa-hs-v"><Num value={s.v} /></div>
                <div className="sa-hs-l">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="sa-tabs" role="tablist">
          {TABS.map((t) => {
            const on = tab === t;
            const Icon = TAB_ICON[t];
            return (
              <button
                key={t}
                role="tab"
                aria-selected={on}
                className="sa-tab"
                data-on={on ? "1" : "0"}
                data-danger={t === "Danger Zone" ? "1" : "0"}
                onClick={(e) => {
                  pickTab(t);
                  // Keep the chosen tab in view when the bar scrolls sideways on a phone.
                  e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                }}
              >
                {on && (
                  <motion.span
                    layoutId="sa-tab-pill"
                    className="sa-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="sa-tab-in"><Icon size={13} /> {t}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ minWidth: 0 }}
          >
            {tab === "Overview" && <OverviewTab data={data} hdr={hdr} reload={load} />}
            {tab === "Billing" && <BillingTab userId={String(userId)} hdr={hdr} />}
            {tab === "Pages" && <PagesTab data={data} hdr={hdr} reload={load} />}
            {tab === "Drafts" && (
              <DraftsTab userId={String(userId)} userEmail={user.email} hdr={hdr} />
            )}
            {tab === "Points" && <PointsTab data={data} hdr={hdr} reload={load} />}
            {tab === "Access" && (
              <AccessTab userId={String(userId)} hdr={hdr} user={data.user} accessToken={accessToken} onFreeAccess={load} />
            )}
            {tab === "Activity" && <ActivityTab userId={String(userId)} hdr={hdr} />}
            {tab === "Danger Zone" && <DangerTab data={data} hdr={hdr} reload={load} />}
          </motion.div>
        </AnimatePresence>

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
    // Until the profile loads there is no maroon card to carry the header, so
    // the frame draws a slim one.
    <AdminPage title="User profile" subtitle={ABOUT} icon={<UserRound size={16} />} width={1180} actions={backBtn} head={!data}>
      <ProfileStyles />
      <div className="sa-root">{body()}</div>
    </AdminPage>
  );
}
