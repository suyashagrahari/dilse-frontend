"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Heart, Sparkles, Edit3, Check, X, Lock, LogOut,
  Eye, EyeOff, Loader2, ChevronRight, ChevronDown, Shield,
  ExternalLink, Cake, Gift, Users, BarChart3, Copy, KeyRound, Globe,
  AtSign, Link2, Share2, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  Trash2, AlertTriangle, BookHeart,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateProfile, changePassword, logoutUser, checkAuth, setSubdomain as setSubdomainAction } from "@/store/authSlice";
import PagePasswordControl from "@/components/profile/PagePasswordControl";
import { API_URL, IS_NGROK, SITE_URL, ROOT_DOMAIN } from "@/lib/config";
import { clearFavorites } from "@/store/favoritesSlice";
import AuthModal from "@/components/AuthModal";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { openShareSheet } from "@/lib/share/shareBus";
import MyStorySection from "@/components/profile/MyStorySection";
import { templateList, webpageTemplateList } from "@/data/template-registry";

function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

const SUBDOMAIN_RESERVED = new Set(["www","admin","api","mail","support","help","docs","blog","app","auth","login","signup","register","dashboard","static","assets","cdn","dev","test","staging","prod","u","user","users","share","gift","gifts","dilse"]);

// ─── What a template is called, where its builder lives, how it is deleted ──
//
// None of that is hardcoded here any more. Every row from /share/me/creations
// and /share/me/received now carries its own `templateLabel`, `editorRoute` and
// (for pages you own) `apiBase`, resolved on the server from the one list that
// says which templates exist.
//
// This used to be a map of sixteen templateTypes, and forty-three exist. The
// twenty-seven missing ones rendered as "🎁 Gift", their Edit button went to
// /templates instead of the builder, and Delete did nothing because there was
// no REST base to send it to — silently, for any template added after the map
// was last touched. Server-side, that class of bug cannot come back.
//
// The emoji is the one part still resolved locally, from the template's own
// config, because the client already has all forty-three and the server has
// none of them.
interface TemplateMeta { label: string; emoji: string; editor: string; endpoint: string }

const EMOJI_BY_SLUG: Record<string, string> = Object.fromEntries(
  [...templateList, ...webpageTemplateList].map((t) => [t.slug, t.emoji])
);

// Reached only when a row arrives without server meta — an old cached response,
// or a templateType whose lookup entry has gone. "/templates" has no accent
// registered, so the share sheet falls back to house pink, and an empty
// endpoint leaves Delete disabled rather than firing at a guessed URL.
const FALLBACK_TEMPLATE: TemplateMeta = { label: "Gift", emoji: "🎁", editor: "/templates", endpoint: "" };

interface TemplateMetaRow {
  templateType: string;
  templateLabel?: string;
  editorRoute?: string;
  apiBase?: string;
}

function metaFromRow(row: TemplateMetaRow): TemplateMeta {
  const editor = row.editorRoute || FALLBACK_TEMPLATE.editor;
  return {
    label: row.templateLabel || FALLBACK_TEMPLATE.label,
    emoji: EMOJI_BY_SLUG[editor.replace(/^\//, "")] || FALLBACK_TEMPLATE.emoji,
    editor,
    endpoint: row.apiBase || "",
  };
}

const UI = {
  bg: "#f5ede6",
  bgSoft: "#fbf6f1",
  text: "#2a0a0e",
  textMuted: "#7a5555",
  accent: "#c9a84c",
  border: "rgba(61,12,17,0.16)",
};
const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";
const LIGHT_VARS: Record<string, string> = {
  "--app-bg": "#f5ede6",
  "--app-bg-dark": "#f0e6dc",
  "--app-surface": "rgba(255,255,255,0.78)",
  "--app-border": "rgba(61,12,17,0.16)",
  "--app-border-faint": "rgba(61,12,17,0.10)",
  "--app-text": "#2a0a0e",
  "--app-text-muted": "#7a5555",
  "--app-text-faint": "#9a7070",
  "--app-text-ultra-faint": "rgba(122,85,85,0.72)",
  "--app-accent": "#c9a84c",
  "--app-accent-fg": "#1a0507",
  "--app-accent-a06": "rgba(201,168,76,0.06)",
  "--app-accent-a08": "rgba(201,168,76,0.08)",
  "--app-accent-a10": "rgba(201,168,76,0.10)",
  "--app-accent-a12": "rgba(201,168,76,0.12)",
  "--app-accent-a15": "rgba(201,168,76,0.15)",
  "--app-accent-a20": "rgba(201,168,76,0.20)",
  "--app-accent-a25": "rgba(201,168,76,0.25)",
  "--app-accent-a35": "rgba(201,168,76,0.35)",
  "--app-input-bg": "rgba(255,255,255,0.82)",
  "--app-input-border": "rgba(61,12,17,0.16)",
};

function ProfileShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prevBodyBg = document.body.style.background;
    const prevHtmlBg = document.documentElement.style.background;
    document.body.style.background = UI.bg;
    document.documentElement.style.background = UI.bg;
    return () => {
      document.body.style.background = prevBodyBg;
      document.documentElement.style.background = prevHtmlBg;
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, ${UI.bgSoft} 0%, ${UI.bg} 52%, ${UI.bgSoft} 100%)`,
        backgroundColor: UI.bg,
        color: UI.text,
        fontFamily: "'Inter', sans-serif",
        minHeight: "100dvh",
        overflowX: "hidden",
        ...LIGHT_VARS,
      } as React.CSSProperties}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>
      <LuxuryMobileTopBrand />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function validateSubdomainLocal(val: string): string | null {
  if (!val) return null;
  if (val.length < 3) return "At least 3 characters required";
  if (val.length > 30) return "Max 30 characters";
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(val) && !/^[a-z0-9]{3}$/.test(val)) return "Only lowercase letters, numbers, hyphens (no leading/trailing hyphens)";
  if (val.includes("--")) return "No consecutive hyphens";
  if (SUBDOMAIN_RESERVED.has(val)) return "This name is reserved";
  return null;
}

interface DashboardStats { favoritesCount: number; generatedCount: number; memberSince: string; }
interface MyCreation extends TemplateMetaRow {
  _id: string; shareId: string; templateType: string; recipientName: string;
  senderName: string; isPublished: boolean; hasPassword: boolean; passwordRaw: string;
  viewCount: number; installCount: number; updatedAt: string; createdAt: string;
}
interface ReceivedPage extends TemplateMetaRow {
  shareId: string; templateType: string; recipientName: string; senderName: string;
  senderAvatar: string | null; hasPassword: boolean; passwordVerified: boolean;
  passwordRaw?: string; viewCount: number; createdAt: string;
}
type ProfilePanel = "personal-link" | "account" | "my-story" | "creations" | "received" | "referral";
interface ReferralInfo { points: number; totalPointsEarned: number; referralCode: string; referralCount: number; }
interface PointTx { _id: string; type: string; delta: number; balance: number; meta: Record<string, string>; createdAt: string; }

/* ── Reusable row component ── */
function Row({ icon, label, value, accent = "green" }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: "green" | "blue" | "violet" | "amber" }) {
  const colors: Record<string, string> = { green: "var(--app-accent-a08)", blue: "rgba(59,130,246,0.1)", violet: "rgba(139,92,246,0.1)", amber: "rgba(245,158,11,0.1)" };
  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: colors[accent] }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{label}</p>
        <p className="text-xs truncate" style={{ color: "var(--app-text-muted)" }}>{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [showAuth, setShowAuth] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [myCreations, setMyCreations] = useState<MyCreation[]>([]);
  const [receivedPages, setReceivedPages] = useState<ReceivedPage[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPw, setCopiedPw] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // ── Drafts and live pages in ONE list ───────────────────────────────────────
  //
  // Every abandoned build is now a draft, so this list is no longer "the pages I
  // sent people" — it is that plus everything half-finished, and for most users
  // the unfinished ones will outnumber the rest.
  //
  // Filtering rather than splitting into two sections, because a page moves
  // between the two states by being published and the row is otherwise
  // identical. Two sections would mean two copies of this card and a row that
  // silently teleports.
  //
  // The server already sorts by updatedAt descending, so the most recently
  // touched draft is the first thing anyone sees — which is the whole point of
  // "carry on where I left off".
  const [creationFilter, setCreationFilter] = useState<"all" | "draft" | "live">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedReceived, setExpandedReceived] = useState<string | null>(null);
  const [visiblePw, setVisiblePw] = useState<Set<string>>(new Set());
  const [activePanel, setActivePanel] = useState<ProfilePanel>("personal-link");
  // No share state here: the sheet is raised through the bus and mounted once
  // by the app layout. See `lib/share/shareBus`.

  // Referral state
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [pointsTxs, setPointsTxs] = useState<PointTx[]>([]);
  const [referralCopied, setReferralCopied] = useState(false);

  // Subdomain state
  const [editingSubdomain, setEditingSubdomain] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [subdomainStatusMsg, setSubdomainStatusMsg] = useState("");
  const [subdomainCopied, setSubdomainCopied] = useState(false);


  // Debounced availability check
  useEffect(() => {
    if (!editingSubdomain || !subdomainInput) { setSubdomainStatus("idle"); return; }
    const lower = subdomainInput.toLowerCase();
    const localErr = validateSubdomainLocal(lower);
    if (localErr) { setSubdomainStatus("invalid"); setSubdomainStatusMsg(localErr); return; }
    if (lower === user?.subdomain) { setSubdomainStatus("available"); setSubdomainStatusMsg("This is your current subdomain"); return; }
    setSubdomainStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/subdomain/check?name=${encodeURIComponent(lower)}`, { headers: authHeaders() });
        const data = await res.json();
        if (data.available) { setSubdomainStatus("available"); setSubdomainStatusMsg("Available!"); }
        else { setSubdomainStatus("taken"); setSubdomainStatusMsg(data.reason || "Not available"); }
      } catch { setSubdomainStatus("idle"); }
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomainInput, editingSubdomain]);

  const handleSaveSubdomain = async () => {
    if (!subdomainInput.trim() || subdomainStatus !== "available") return;
    setSubdomainLoading(true);
    try {
      await dispatch(setSubdomainAction(subdomainInput.toLowerCase().trim())).unwrap();
      setEditingSubdomain(false);
      setSubdomainInput("");
      setSubdomainStatus("idle");
    } catch { /* error shown in UI */ } finally { setSubdomainLoading(false); }
  };

  const authHeaders = useCallback(() => apiHeaders({ Authorization: `Bearer ${accessToken}` }), [accessToken]);

  const fetchDashboard = useCallback(async () => {
    if (!accessToken) return;
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/dashboard`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.data?.stats) setStats(data.data.stats);
    } catch { /* silent */ } finally { setStatsLoading(false); }
  }, [accessToken, authHeaders]);

  const fetchMyCreations = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/share/me/creations`, { headers: authHeaders() });
      const result = await res.json();
      if (result.success) setMyCreations(result.data);
    } catch { /* silent */ }
  }, [accessToken, authHeaders]);

  const fetchReceivedPages = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/share/me/received`, { headers: authHeaders() });
      const result = await res.json();
      if (result.success) setReceivedPages(result.data);
    } catch { /* silent */ }
  }, [accessToken, authHeaders]);

  const fetchReferralInfo = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [infoRes, txRes] = await Promise.all([
        fetch(`${API_URL}/referral/info`, { headers: authHeaders() }),
        fetch(`${API_URL}/referral/transactions`, { headers: authHeaders() }),
      ]);
      const [infoData, txData] = await Promise.all([infoRes.json(), txRes.json()]);
      if (infoData.success) setReferralInfo(infoData.data);
      if (txData.success) setPointsTxs(txData.data);
    } catch { /* silent */ }
  }, [accessToken, authHeaders]);

  useEffect(() => {
    if (isAuthenticated) { fetchDashboard(); fetchMyCreations(); fetchReceivedPages(); fetchReferralInfo(); }
  }, [isAuthenticated, fetchDashboard, fetchMyCreations, fetchReceivedPages, fetchReferralInfo]);

  // Handle #referral hash to auto-navigate to referral tab
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#referral") {
      setActivePanel("referral");
    }
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user?.name) { setEditingName(false); return; }
    setNameLoading(true);
    try { await dispatch(updateProfile({ name: nameInput.trim() })).unwrap(); setEditingName(false); }
    catch { /* handled by Redux */ } finally { setNameLoading(false); }
  };

  /**
   * A Google account has no password, so there is nothing to prove and no
   * "current password" to ask for. The server accepts the omission for exactly
   * that case and requires it otherwise.
   */
  const hasNoPassword = user?.provider === "google";

  const handleChangePassword = async () => {
    if (!newPw) return;
    if (!hasNoPassword && !currentPw) return;
    setPwLoading(true); setPwMessage(null);
    try {
      await dispatch(changePassword({
        currentPassword: hasNoPassword ? undefined : currentPw,
        newPassword: newPw,
      })).unwrap();
      setPwMessage({
        type: "success",
        text: hasNoPassword
          ? "Password set. You can now sign in with your email too."
          : "Password updated successfully!",
      });
      // Setting a FIRST password flips `provider` to "local" on the server.
      // Without re-reading the user, Redux still says "google", so reopening
      // this form would omit `currentPassword` again — and the server, which
      // now sees a password on the account, would refuse it. Refresh so the
      // form matches reality.
      if (hasNoPassword) {
        await dispatch(checkAuth()).unwrap().catch(() => {});
      }
      setCurrentPw(""); setNewPw("");
      setTimeout(() => setShowPasswordSection(false), 1500);
    } catch (err) {
      setPwMessage({ type: "error", text: (err as string) || "Failed to update password" });
    } finally { setPwLoading(false); }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await dispatch(logoutUser()); dispatch(clearFavorites());
    setLogoutLoading(false); router.push("/");
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const formatShortDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const getShareLink = (shareId: string) => {
    if (user?.subdomain) {
      // True subdomain URL: abc.subhsandesh.in/shareId
      if (ROOT_DOMAIN) return `https://${user.subdomain}.${ROOT_DOMAIN}/${shareId}`;
      // Local dev fallback: localhost:3000/abc/shareId
      return `${SITE_URL}/${user.subdomain}/${shareId}`;
    }
    return typeof window !== "undefined" ? `${window.location.origin}/${shareId}` : `/${shareId}`;
  };

  const copyToClipboard = (text: string, id: string, type: "link" | "pw") => {
    navigator.clipboard.writeText(text);
    if (type === "link") { setCopiedLink(id); setTimeout(() => setCopiedLink(null), 2000); }
    else { setCopiedPw(id); setTimeout(() => setCopiedPw(null), 2000); }
  };
  // Raises the same sheet the template editors raise, so a page can be sent as
  // a link, a QR, a photo QR or a printable card from here too — the profile is
  // where people come back to a creation days after they made it, and it would
  // be strange for it to offer less than the editor did.
  const openSocialShare = (payload: {
    url: string;
    message?: string;
    title?: string;
    /** Template slug, which picks the sheet's colour. */
    slug?: string;
    recipientName?: string;
    senderName?: string;
    /** The unlock word, so the sheet can offer to print it on the card. */
    password?: string;
  }) => {
    if (!payload.url) return;
    openShareSheet({
      url: payload.url,
      title: payload.title,
      text: payload.message?.trim() || "Celebrate with me on SubhSandesh! ✨",
      slug: payload.slug,
      recipientName: payload.recipientName,
      senderName: payload.senderName,
      password: payload.password,
      // Re-sharing something already published, not finishing it. "How was
      // making this?" about a page from last month has no useful answer, and the
      // ask belongs to the publish moment. See lib/feedback/feedbackBus.
      askFeedback: false,
    });
  };

  const handleDeleteCreation = async (page: MyCreation) => {
    const base = templateMeta(page.templateType).endpoint;
    if (!accessToken) return;

    // ── WHY A DRAFT GOES THROUGH A DIFFERENT ROUTE ──────────────────────────
    //
    // Not because the template's own DELETE would fail — it would work fine.
    // Because `/share/me/drafts/...` carries `isPublished: { $ne: true }` inside
    // the delete filter, so it CANNOT remove a published page.
    //
    // The race that matters: the confirm banner is open on a draft, the user
    // publishes the same page in another tab, then presses Discard here. The
    // per-template route would delete a live card the recipient may already
    // have the link to, on the strength of a banner that promised "nobody has a
    // link to it". The draft route refuses and the row simply stays.
    const url = page.isPublished
      ? base && `${API_URL}/${base}/${page._id}`
      : `${API_URL}/share/me/drafts/${page.templateType}/${page._id}`;
    if (!url) return;

    setDeletingId(page._id);
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        // Remove locally so the card + its share link vanish immediately.
        // On the server the page is gone, so the shared URL now 404s for everyone.
        setMyCreations((prev) => prev.filter((p) => p._id !== page._id));
        setDeleteConfirmId(null);
        if (expandedCard === page._id) setExpandedCard(null);
      } else if (!page.isPublished && res.status === 404) {
        // The draft route's refusal. Almost always the race above: it is a live
        // page now, so say that rather than "failed", and refresh so the row
        // shows Live and offers the deliberate delete instead.
        alert("This page has been published, so it can't be discarded as a draft. Reloading your pages.");
        setDeleteConfirmId(null);
        void fetchMyCreations();
      } else {
        alert(data.error || "Failed to delete. Please try again.");
      }
    } catch {
      alert("Failed to delete. Please check your connection and try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Own pages first: they are the only rows that carry `apiBase`, so a type
  // that appears in both lists must resolve to the deletable one.
  const metaByType = useMemo(() => {
    const map = new Map<string, TemplateMeta>();
    for (const row of [...myCreations, ...receivedPages]) {
      if (!map.has(row.templateType)) map.set(row.templateType, metaFromRow(row));
    }
    return map;
  }, [myCreations, receivedPages]);
  const templateMeta = (type: string): TemplateMeta => metaByType.get(type) || FALLBACK_TEMPLATE;

  const templateEmoji = (type: string) => templateMeta(type).emoji;
  const templateLabel = (type: string) => templateMeta(type).label;
  // The editor route IS the template's slug, so there is no second table to
  // keep in step. An unmapped type resolves to the fallback's "/templates",
  // which no accent is registered under — the sheet falls back to house pink.
  const templateSlug = (type: string) => templateMeta(type).editor.replace(/^\//, "");
  const editorRoute = (type: string) => templateMeta(type).editor;

  const cardStyle = { background: "rgba(255,255,255,0.8)", border: "1px solid rgba(61,12,17,0.1)", borderRadius: "1rem" };
  const sectionLabel = (text: string) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2 px-1 flex items-center gap-1.5" style={{ color: "var(--app-accent)" }}>{text}</p>
  );

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <ProfileShell>
        <div className="flex items-center justify-center px-4 mt-24 md:mt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <User size={32} style={{ color: "#c9a84c" }} />
            </div>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: "var(--app-accent)" }}>
              Profile Access
            </p>
            <h2
              className="leading-[0.95] tracking-[-0.03em] text-[38px] md:text-[64px] mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#2a0a0e" }}
            >
              Sign In <em style={{ color: "#c9a84c", fontStyle: "italic" }}>to Continue.</em>
            </h2>
            <p className="text-sm md:text-base mb-8 max-w-xl mx-auto" style={{ color: "#7a5555" }}>
              Log in to manage your profile, view your dashboard, and personalize templates.
            </p>
            <button onClick={() => setShowAuth(true)} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "#3d0c11", color: "#f5ede6" }}>
              Sign In
            </button>
          </motion.div>
        </div>
        <AnimatePresence>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        </AnimatePresence>
      </ProfileShell>
    );
  }

  /* ── Authenticated ── */

  /* shared sub-components (inline, no duplication) */
  const AvatarBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
      <div className="relative mb-5">
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
            style={{ boxShadow: "0 0 0 3px var(--app-bg), 0 0 0 5px var(--app-accent-a25), 0 0 30px var(--app-accent-a12)" }} />
        ) : (
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--app-accent), #00ff88)", boxShadow: "0 0 0 3px var(--app-bg), 0 0 0 5px var(--app-accent-a25), 0 0 30px var(--app-accent-a12)" }}>
            <span className="text-2xl md:text-3xl font-black" style={{ color: "var(--app-accent-fg)" }}>{getInitials(user?.name || "U")}</span>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-[3px] flex items-center justify-center" style={{ background: "var(--app-accent)", borderColor: "var(--app-bg)" }}>
          <Check size={11} color="#000" strokeWidth={3} />
        </div>
      </div>

      {editingName ? (
        <div className="flex items-center gap-2 mb-1">
          <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="text-xl font-bold text-center rounded-xl px-3 py-1.5 focus:outline-none w-48"
            style={{ background: "var(--app-input-bg)", border: "1px solid var(--app-accent-a35)", color: "var(--app-text)" }}
            autoFocus />
          <button onClick={handleSaveName} disabled={nameLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
            {nameLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button onClick={() => setEditingName(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif", color: "#2a0a0e" }}>{user?.name}</h1>
          <button onClick={() => { setNameInput(user?.name || ""); setEditingName(true); }}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "var(--app-surface)", color: "var(--app-text-faint)" }}>
            <Edit3 size={12} />
          </button>
        </div>
      )}

      {user?.subdomain && (
        <div className="flex items-center gap-1.5 mb-1.5 px-3 py-1 rounded-full" style={{ background: "var(--app-accent-a08)", border: "1px solid var(--app-accent-a20)" }}>
          <AtSign size={11} style={{ color: "var(--app-accent)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--app-accent)" }}>{user.subdomain}</span>
        </div>
      )}
      <p className="text-sm flex items-center gap-1.5 mb-2" style={{ color: "var(--app-text-muted)" }}>
        <Mail size={12} /> {user?.email}
      </p>
      {user?.provider === "google" && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ background: "var(--app-surface)", color: "var(--app-text-muted)", border: "1px solid var(--app-border)" }}>
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Connected with Google
        </span>
      )}
    </motion.div>
  );

  const StatsBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="grid grid-cols-3 gap-3">
      {[
        { icon: <Heart size={20} style={{ color: "#f43f5e" }} />, value: statsLoading ? "…" : stats?.favoritesCount ?? 0, label: "Favorites" },
        { icon: <Sparkles size={20} style={{ color: "var(--app-accent)" }} />, value: statsLoading ? "…" : stats?.generatedCount ?? 0, label: "Generated" },
        { icon: <Calendar size={20} style={{ color: "#60a5fa" }} />, value: statsLoading ? "…" : stats?.memberSince ? formatDate(stats.memberSince) : "Today", label: "Member", small: true },
      ].map(({ icon, value, label, small }) => (
        <div key={label} className="rounded-2xl p-4 pt-5 pb-4 text-center flex flex-col items-center" style={cardStyle}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--app-surface)" }}>
            {icon}
          </div>
          <p className={`font-black leading-tight ${small ? "text-sm" : "text-2xl"}`} style={{ color: "var(--app-text)" }}>{value}</p>
          <p className="text-[9px] uppercase tracking-widest mt-1.5 font-semibold" style={{ color: "var(--app-text-faint)" }}>{label}</p>
        </div>
      ))}
    </motion.div>
  );

  const subdomainStatusColor = subdomainStatus === "available" ? "#22c55e" : subdomainStatus === "taken" || subdomainStatus === "invalid" ? "#f87171" : "var(--app-text-faint)";

  const SubdomainBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
      {sectionLabel("My Personal Link")}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {!editingSubdomain ? (
          <div>
            {user?.subdomain ? (
              <div className="p-4 space-y-3">
                {/* Current subdomain display */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a08)" }}>
                    <AtSign size={15} style={{ color: "var(--app-accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--app-text-faint)" }}>Your Handle</p>
                    <p className="text-base font-black" style={{ color: "#c9a84c", fontFamily: "'Playfair Display', serif" }}>@{user.subdomain}</p>
                  </div>
                  <button onClick={() => { setSubdomainInput(user.subdomain || ""); setEditingSubdomain(true); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-110"
                    style={{ background: "var(--app-surface)", color: "var(--app-text-faint)" }}>
                    <Edit3 size={13} />
                  </button>
                </div>

                {/* URL preview */}
                <div className="rounded-xl p-3" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a15)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-accent)" }}>Your Share Links</p>
                  <div className="flex items-center gap-2">
                    <Link2 size={11} style={{ color: "var(--app-accent)" }} className="shrink-0" />
                    <p className="text-[11px] font-mono truncate flex-1" style={{ color: "var(--app-text-muted)" }}>
                      {ROOT_DOMAIN
                        ? <><span style={{ color: "var(--app-accent)", fontWeight: 700 }}>{user.subdomain}</span>.{ROOT_DOMAIN}/<span style={{ color: "var(--app-text-faint)" }}>page-id</span></>
                        : <>{SITE_URL}/{user.subdomain}/<span style={{ color: "var(--app-text-faint)" }}>page-id</span></>
                      }
                    </p>
                    <button
                      onClick={() => {
                        const base = ROOT_DOMAIN ? `https://${user.subdomain}.${ROOT_DOMAIN}/` : `${SITE_URL}/u/${user.subdomain}/`;
                        navigator.clipboard.writeText(base);
                        setSubdomainCopied(true);
                        setTimeout(() => setSubdomainCopied(false), 2000);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all hover:scale-110"
                      style={{ background: "var(--app-accent-a10)", color: "var(--app-accent)" }}>
                      {subdomainCopied ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-center" style={{ color: "var(--app-text-ultra-faint)" }}>
                  All your shared pages use this personalized link
                </p>
              </div>
            ) : (
              <button onClick={() => { setSubdomainInput(""); setEditingSubdomain(true); }}
                className="app-row-hover w-full flex items-center gap-3 px-4 py-4 text-left transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a08)" }}>
                  <AtSign size={16} style={{ color: "var(--app-accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>Claim Your Personal Link</p>
                  <p className="text-[11px]" style={{ color: "var(--app-text-faint)" }}>e.g. dilse.app/<span style={{ color: "var(--app-accent)" }}>yourname</span>/page</p>
                </div>
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                  Claim
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <AtSign size={14} style={{ color: "var(--app-accent)" }} />
              <p className="text-sm font-bold" style={{ color: "var(--app-text)" }}>
                {user?.subdomain ? "Change Your Handle" : "Choose Your Handle"}
              </p>
            </div>

            {/* Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="text-sm font-bold" style={{ color: "var(--app-text-faint)" }}>@</span>
              </div>
              <input
                type="text"
                value={subdomainInput}
                onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="yourname"
                maxLength={30}
                autoFocus
                className="app-input w-full pl-8 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all font-mono"
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--app-accent-a35)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--app-input-border)"; }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveSubdomain()}
              />
            </div>

            {/* URL preview while typing */}
            {subdomainInput && (
              <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-faint)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--app-text-faint)" }}>Preview</p>
                <p className="text-[11px] font-mono truncate" style={{ color: "var(--app-text-muted)" }}>
                  {ROOT_DOMAIN
                    ? <><span style={{ color: "var(--app-accent)", fontWeight: 700 }}>{subdomainInput}</span>.{ROOT_DOMAIN}/page-id</>
                    : <>{SITE_URL}/<span style={{ color: "var(--app-accent)", fontWeight: 700 }}>{subdomainInput}</span>/page-id</>
                  }
                </p>
              </div>
            )}

            {/* Status message */}
            <AnimatePresence mode="wait">
              {subdomainInput && subdomainStatus !== "idle" && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg"
                  style={{ background: subdomainStatus === "available" ? "rgba(34,197,94,0.08)" : subdomainStatus === "checking" ? "var(--app-surface)" : "rgba(248,113,113,0.08)", color: subdomainStatusColor }}>
                  {subdomainStatus === "checking" ? <Loader2 size={11} className="animate-spin shrink-0" /> :
                   subdomainStatus === "available" ? <Check size={11} className="shrink-0" /> :
                   <X size={11} className="shrink-0" />}
                  {subdomainStatus === "checking" ? "Checking availability…" : subdomainStatusMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rules */}
            <p className="text-[10px]" style={{ color: "var(--app-text-ultra-faint)" }}>
              3–30 chars · lowercase letters, numbers, hyphens · no leading/trailing hyphens
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={handleSaveSubdomain}
                disabled={subdomainLoading || subdomainStatus !== "available" || !subdomainInput}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                {subdomainLoading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save Handle</>}
              </button>
              <button onClick={() => { setEditingSubdomain(false); setSubdomainInput(""); setSubdomainStatus("idle"); }}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const AccountBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      {sectionLabel("Account")}
      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        <Row icon={<Mail size={16} style={{ color: "#60a5fa" }} />} label="Email" value={user?.email} accent="blue" />
        <Row icon={<Shield size={16} style={{ color: "#a78bfa" }} />} label="Sign-in method" value={user?.provider} accent="violet" />
        {/* Shown for Google accounts too, as "Set Password". There is no
            /forgot-password route in this app, so this is the ONLY way a
            Google-only account can ever gain a password — and the only way
            back for an account whose unverified-era password was cleared when
            Google sign-in verified it. */}
        {(user?.provider === "local" || user?.provider === "google") && (
          <div>
            <button onClick={() => { setShowPasswordSection(!showPasswordSection); setPwMessage(null); setCurrentPw(""); setNewPw(""); }}
              className="app-row-hover w-full flex items-center gap-3 px-4 py-3.5 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
                <Lock size={16} style={{ color: "#f59e0b" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
                  {hasNoPassword ? "Set Password" : "Change Password"}
                </p>
                <p className="text-xs" style={{ color: "var(--app-text-faint)" }}>
                  {hasNoPassword
                    ? "Add a password so you can sign in without Google"
                    : "Update your account password"}
                </p>
              </div>
              <ChevronRight size={15} className={`transition-transform ${showPasswordSection ? "rotate-90" : ""}`} style={{ color: "var(--app-text-faint)" }} />
            </button>
            <AnimatePresence>
              {showPasswordSection && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3">
                    {[...(hasNoPassword
                        ? []
                        : [{ val: currentPw, set: setCurrentPw, show: showCurrentPw, toggle: setShowCurrentPw, placeholder: "Current password", onEnter: undefined }]),
                      { val: newPw, set: setNewPw, show: showNewPw, toggle: setShowNewPw, placeholder: "New password (min 6 chars)", onEnter: handleChangePassword }
                    ].map(({ val, set, show, toggle, placeholder, onEnter }) => (
                      <div key={placeholder} className="relative">
                        <input type={show ? "text" : "password"} value={val} onChange={(e) => set(e.target.value)}
                          placeholder={placeholder} onKeyDown={onEnter ? (e) => e.key === "Enter" && onEnter() : undefined}
                          className="app-input w-full px-4 pr-10 py-3 rounded-xl text-sm focus:outline-none transition-all"
                          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--app-accent-a35)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--app-input-border)"; }} />
                        <button type="button" onClick={() => toggle(!show)}
                          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--app-text-faint)" }}>
                          {show ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    ))}
                    {pwMessage && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs px-3 py-2 rounded-lg"
                        style={{ background: pwMessage.type === "success" ? "var(--app-accent-a08)" : "rgba(239,68,68,0.08)", color: pwMessage.type === "success" ? "var(--app-accent)" : "#f87171" }}>
                        {pwMessage.text}
                      </motion.p>
                    )}
                    <button onClick={handleChangePassword} disabled={pwLoading || !currentPw || !newPw || newPw.length < 6}
                      className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                      {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : "Update Password"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );

  const LogoutBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <button onClick={handleLogout} disabled={logoutLoading}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-red-500/5"
        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
          {logoutLoading ? <Loader2 size={16} className="text-red-400 animate-spin" /> : <LogOut size={16} className="text-red-400" />}
        </div>
        <p className="text-sm font-bold text-red-400">{logoutLoading ? "Logging out…" : "Log Out"}</p>
      </button>
    </motion.div>
  );

  const draftCount = myCreations.filter((p) => !p.isPublished).length;
  const liveCount = myCreations.length - draftCount;
  const visibleCreations = myCreations.filter((p) =>
    creationFilter === "all" ? true : creationFilter === "live" ? p.isPublished : !p.isPublished
  );

  /**
   * One chip.
   *
   * Chips for empty buckets are hidden rather than disabled: a "Drafts 0" chip
   * that cannot be pressed is a dead control, and offering the filter at all
   * only makes sense once there is something to filter.
   */
  const filterChip = (id: "all" | "draft" | "live", label: string, count: number) =>
    count === 0 && id !== "all" ? null : (
      <button
        key={id}
        onClick={() => { setCreationFilter(id); setExpandedCard(null); setDeleteConfirmId(null); }}
        className="text-[12px] font-bold rounded-full px-3 py-1.5 transition-colors"
        style={{
          background: creationFilter === id ? "var(--app-accent)" : "var(--app-accent-a08)",
          color: creationFilter === id ? "#fff" : "var(--app-text-faint)",
          border: "1px solid var(--app-border-faint)",
        }}
        aria-pressed={creationFilter === id}
      >
        {label} {count}
      </button>
    );

  const CreationsBlock = myCreations.length > 0 ? (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
      {sectionLabel("My Creations")}
      {/* Only worth showing once there are both kinds to choose between. */}
      {draftCount > 0 && liveCount > 0 && (
        <div className="flex items-center gap-2 mb-2.5 px-0.5">
          {filterChip("all", "All", myCreations.length)}
          {filterChip("draft", "Drafts", draftCount)}
          {filterChip("live", "Live", liveCount)}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        <div className="max-h-[72vh] overflow-y-auto">
        {visibleCreations.map((page) => {
          const shareLink = getShareLink(page.shareId);
          const isExpanded = expandedCard === page._id;
          return (
            <div key={page._id} style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
              {/* ── Header row (click to expand) ── */}
              <div onClick={() => { setExpandedCard(isExpanded ? null : page._id); setDeleteConfirmId(null); }}
                className="app-row-hover cursor-pointer flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 sm:py-4 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a08)", border: "1px solid var(--app-border-faint)" }}>
                    {page.templateType === "valentine" ? <Gift size={18} style={{ color: "#f43f5e" }} /> :
                     page.templateType === "holi" ? <Sparkles size={18} style={{ color: "#a78bfa" }} /> :
                     page.templateType === "birthday" || page.templateType === "birthday-gf" ? <Cake size={18} style={{ color: "var(--app-accent)" }} /> :
                     <span className="text-lg">{templateEmoji(page.templateType)}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] sm:text-[16px] font-bold truncate tracking-tight" style={{ color: "var(--app-text)" }}>{templateEmoji(page.templateType)} For {page.recipientName}</h3>
                    <p className="text-[11px] sm:text-[12.5px] font-medium truncate mt-0.5" style={{ color: "var(--app-text-faint)" }}>
                      {templateLabel(page.templateType)} · {page.isPublished ? "Published" : "Draft"} · {formatShortDate(page.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Always-visible Edit | Delete pill + chevron */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center rounded-full" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--app-border-faint)", boxShadow: "0 1px 4px -1px rgba(0,0,0,0.06)" }}>
                    <button title="Edit" onClick={(e) => { e.stopPropagation(); router.push(`${editorRoute(page.templateType)}?edit=${page._id}`); }}
                      className="pl-3 pr-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[13px] sm:text-sm font-semibold rounded-l-full flex items-center gap-1.5 transition-colors hover:bg-[var(--app-accent-a08)]"
                      style={{ color: "var(--app-text)" }}>
                      <Edit3 size={14} style={{ color: "var(--app-text-muted)" }} /> <span className="hidden sm:inline">Edit</span>
                    </button>
                    <div className="w-px h-4 sm:h-5" style={{ background: "var(--app-border-faint)" }} />
                    <button title={page.isPublished ? "Delete" : "Discard"} onClick={(e) => { e.stopPropagation(); setExpandedCard(page._id); setDeleteConfirmId(page._id); }}
                      className="pl-2.5 pr-3 sm:px-3.5 py-1.5 sm:py-2 text-[13px] sm:text-sm font-semibold rounded-r-full flex items-center gap-1.5 transition-colors hover:bg-[rgba(220,38,38,0.07)]"
                      style={{ color: "#dc2626" }}>
                      {/* "Discard" for a draft: it names an action with no audience,
                          which is what discarding an unpublished page is. */}
                      <Trash2 size={14} /> <span className="hidden sm:inline">{page.isPublished ? "Delete" : "Discard"}</span>
                    </button>
                  </div>
                  <ChevronDown size={18} className={`transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--app-text-faint)" }} />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-3.5 pb-4 sm:px-6 sm:pb-6 pt-1 space-y-3 sm:space-y-4" style={{ borderTop: "1px solid var(--app-border-faint)" }}>
                      {/* Delete confirmation banner (triggered from header Delete) */}
                      {deleteConfirmId === page._id && (
                        <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2.5 sm:space-y-3" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
                          <div className="flex items-start gap-2 sm:gap-2.5">
                            <AlertTriangle size={15} style={{ color: "#dc2626" }} className="shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              {/* ── The warning has to match what is actually at stake ──────
                                  Every abandoned build is now a draft, so most rows in this
                                  list were never sent to anyone. Telling someone that
                                  discarding one will "stop the link working for everyone you
                                  sent it to" is not true of a draft, and a warning that
                                  overstates its case is one people learn to click through —
                                  including on the published card where every word of it IS
                                  true. */}
                              <p className="text-[12px] sm:text-sm font-bold" style={{ color: "#dc2626" }}>
                                {page.isPublished ? "Permanently delete this card?" : "Discard this draft?"}
                              </p>
                              <p className="text-[10.5px] sm:text-xs mt-0.5 leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                                {page.isPublished ? (
                                  <>This is <span style={{ color: "#dc2626", fontWeight: 700 }}>permanent and cannot be undone</span>. The card and all its content, photos and settings will be erased. The shared link will stop working for you and everyone you sent it to, and <span style={{ color: "#dc2626", fontWeight: 700 }}>it can never be recovered or published again</span> — you would have to build a brand-new card from scratch.</>
                                ) : (
                                  <>This draft was never published, so nobody has a link to it. Its content and photos will be erased and <span style={{ color: "#dc2626", fontWeight: 700 }}>cannot be recovered</span> — you would have to start this one again.</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} disabled={deletingId === page._id}
                              className="flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                              style={{ background: "var(--app-surface)", color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)" }}>
                              Cancel
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCreation(page); }} disabled={deletingId === page._id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                              style={{ background: "#dc2626" }}>
                              {deletingId === page._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              {deletingId === page._id ? "Deleting…" : "Delete forever"}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 pt-3 sm:pt-4">
                        {/* Installs */}
                        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 md:p-5 flex items-center gap-2.5 md:gap-4 transition-colors" style={{ background: "linear-gradient(135deg, var(--app-surface) 0%, var(--app-bg) 100%)", border: "1px solid var(--app-border-faint)" }}>
                          <div className="w-9 h-9 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 relative z-10" style={{ background: "var(--app-accent-a10)", border: "1px solid var(--app-border-faint)" }}>
                            <Users size={16} className="md:hidden" style={{ color: "var(--app-accent)" }} /><Users size={22} className="hidden md:block" style={{ color: "var(--app-accent)" }} />
                          </div>
                          <div className="relative z-10 min-w-0">
                            <p className="text-[8.5px] md:text-[11px] font-extrabold uppercase tracking-[0.14em] md:tracking-[0.18em] mb-0.5 md:mb-1" style={{ color: "var(--app-text-faint)" }}>Installs</p>
                            <p className="text-xl md:text-[32px] font-black leading-none" style={{ color: "var(--app-text)" }}>{page.installCount}</p>
                          </div>
                          <TrendingUp className="absolute right-2 bottom-1.5 md:right-3 md:bottom-2 z-0 pointer-events-none w-9 h-9 md:w-[54px] md:h-[54px]" style={{ color: "var(--app-accent)", opacity: 0.09 }} />
                        </div>
                        {/* Status */}
                        <div className="rounded-xl sm:rounded-2xl p-3 md:p-5 flex items-center gap-2.5 md:gap-4 transition-colors" style={{ background: "linear-gradient(135deg, var(--app-surface) 0%, var(--app-bg) 100%)", border: "1px solid var(--app-border-faint)" }}>
                          <div className="w-9 h-9 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0" style={{ background: page.isPublished ? "rgba(34,197,94,0.1)" : "var(--app-accent-a08)", border: `1px solid ${page.isPublished ? "rgba(34,197,94,0.18)" : "var(--app-border-faint)"}` }}>
                            {page.isPublished ? (
                              <span className="relative flex items-center justify-center">
                                <span className="absolute w-5 h-5 md:w-6 md:h-6 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.25)" }} />
                                <span className="relative w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ background: "#22c55e" }} />
                              </span>
                            ) : (<><BarChart3 size={16} className="md:hidden" style={{ color: "var(--app-text-faint)" }} /><BarChart3 size={22} className="hidden md:block" style={{ color: "var(--app-text-faint)" }} /></>)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8.5px] md:text-[11px] font-extrabold uppercase tracking-[0.14em] md:tracking-[0.18em] mb-0.5 md:mb-1" style={{ color: "var(--app-text-faint)" }}>Status</p>
                            <p className="text-lg md:text-[32px] font-black leading-none" style={{ color: page.isPublished ? "#16a34a" : "var(--app-text)" }}>{page.isPublished ? "Live" : "Draft"}</p>
                          </div>
                        </div>
                      </div>
                      {page.isPublished && (
                        <div className="space-y-2">
                          <div className="rounded-xl sm:rounded-2xl p-3 md:p-4 flex items-center justify-between gap-2.5" style={{ background: "linear-gradient(135deg, var(--app-surface) 0%, var(--app-bg) 100%)", border: "1px solid var(--app-border-faint)" }}>
                            <div className="flex items-center gap-2 md:gap-3.5 min-w-0 flex-1">
                              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--app-border-faint)", boxShadow: "0 1px 4px -1px rgba(0,0,0,0.06)" }}>
                                <Link2 size={15} className="md:hidden" style={{ color: "var(--app-accent)" }} /><Link2 size={19} className="hidden md:block" style={{ color: "var(--app-accent)" }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[8.5px] md:text-[10px] uppercase tracking-[0.12em] md:tracking-[0.2em] font-extrabold mb-0.5 md:mb-1 whitespace-nowrap" style={{ color: "var(--app-text-faint)" }}>Shareable Link</p>
                                <p className="text-[12px] md:text-sm font-semibold flex items-center gap-1.5 md:gap-2 whitespace-nowrap" style={{ color: "var(--app-text-muted)" }}>
                                  Ready to share <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: "#22c55e" }} />
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                              <button title="Copy link" onClick={(e) => { e.stopPropagation(); copyToClipboard(shareLink, page._id, "link"); }}
                                className="w-8 h-8 md:w-[46px] md:h-[46px] rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:-translate-y-0.5"
                                style={{ background: "rgba(255,255,255,0.9)", color: copiedLink === page._id ? "#16a34a" : "var(--app-accent)", border: "1px solid var(--app-border-faint)", boxShadow: "0 1px 4px -1px rgba(0,0,0,0.06)" }}>
                                {copiedLink === page._id ? <Check size={15} /> : <Copy size={15} />}
                              </button>
                              <button title="Share" onClick={(e) => {
                                e.stopPropagation();
                                openSocialShare({
                                  url: shareLink,
                                  title: `${templateLabel(page.templateType)} page`,
                                  message: `${page.senderName || "Someone"} shared a ${templateLabel(page.templateType)} page${page.recipientName ? ` for ${page.recipientName}` : ""} on SubhSandesh!`,
                                  slug: templateSlug(page.templateType),
                                  recipientName: page.recipientName,
                                  senderName: page.senderName,
                                  password: page.passwordRaw,
                                });
                              }}
                                className="w-8 h-8 md:w-[46px] md:h-[46px] rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:-translate-y-0.5"
                                style={{ background: "rgba(255,255,255,0.9)", color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)", boxShadow: "0 1px 4px -1px rgba(0,0,0,0.06)" }}>
                                <Share2 size={15} />
                              </button>
                              <button title="Open in new tab" onClick={(e) => { e.stopPropagation(); window.open(getShareLink(page.shareId), "_blank"); }}
                                className="w-8 h-8 md:w-[46px] md:h-[46px] rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 transition-all hover:scale-105 hover:-translate-y-0.5"
                                style={{ background: "rgba(255,255,255,0.9)", color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)", boxShadow: "0 1px 4px -1px rgba(0,0,0,0.06)" }}>
                                <ExternalLink size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                        )}
                      {/* Outside the isPublished block on purpose: the password is set
                          in the builder at create time, so a DRAFT can already carry one —
                          and a draft is exactly when you would want to fix it before
                          sending the link. Nothing about being unpublished makes a
                          page's password unmanageable. */}
                      <div className="mt-2">
                        <PagePasswordControl
                          templateType={page.templateType}
                          pageId={page._id}
                          hasPassword={page.hasPassword}
                          passwordRaw={page.passwordRaw}
                          onChanged={(next) =>
                            setMyCreations((prev) =>
                              prev.map((p) => (p._id === page._id ? { ...p, ...next } : p))
                            )
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        </div>
      </div>
    </motion.div>
  ) : null;

  const ReceivedBlock = receivedPages.length > 0 ? (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      {sectionLabel("Shared With You")}
      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        {receivedPages.map((page) => {
          const link = getShareLink(page.shareId);
          const isOpen = expandedReceived === page.shareId;
          const pwKey = `recv-${page.shareId}`;
          return (
            <div key={page.shareId} style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
              <button onClick={() => setExpandedReceived(isOpen ? null : page.shareId)}
                className="app-row-hover w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors">
                {page.senderAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={page.senderAvatar} alt={page.senderName} className="w-9 h-9 rounded-full object-cover shrink-0" style={{ border: "1px solid var(--app-border)" }} />
                ) : (
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black" style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                    {getInitials(page.senderName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{templateEmoji(page.templateType)} From {page.senderName}</p>
                  <p className="text-[11px]" style={{ color: "var(--app-text-faint)" }}>
                    {templateLabel(page.templateType)} for {page.recipientName} · {formatShortDate(page.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {page.hasPassword && (
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: page.passwordVerified ? "var(--app-accent-a10)" : "rgba(245,158,11,0.1)" }}>
                      {page.passwordVerified ? <Check size={11} style={{ color: "var(--app-accent)" }} /> : <Lock size={11} style={{ color: "#f59e0b" }} />}
                    </div>
                  )}
                  <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: "var(--app-text-faint)" }} />
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-2.5">
                      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--app-surface)" }}>
                        <Globe size={12} style={{ color: "var(--app-text-faint)" }} className="shrink-0" />
                        <p className="text-[11px] truncate flex-1 font-mono" style={{ color: "var(--app-text-muted)" }}>{link}</p>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(link, page.shareId + "-recv", "link"); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                          {copiedLink === page.shareId + "-recv" ? <Check size={12} style={{ color: "var(--app-accent)" }} /> : <Copy size={12} />}
                        </button>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                openSocialShare({
                                  url: link,
                                  title: `${templateLabel(page.templateType)} greeting`,
                                  message: `${page.senderName || "Someone"} sent a ${templateLabel(page.templateType)} greeting${page.recipientName ? ` for ${page.recipientName}` : ""} on SubhSandesh!`,
                                  slug: templateSlug(page.templateType),
                                  recipientName: page.recipientName,
                                  senderName: page.senderName,
                                  // Only ever populated once this reader has
                                  // unlocked the page themselves, so forwarding
                                  // it passes on nothing they were not given.
                                  password: page.passwordRaw,
                                });
                              }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "var(--app-accent-a08)", color: "var(--app-accent)" }}>
                                <Share2 size={12} />
                              </button>
                        <button onClick={(e) => { e.stopPropagation(); window.open(`/${page.shareId}`, "_blank"); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--app-accent-a08)", color: "var(--app-accent)" }}>
                          <ExternalLink size={12} />
                        </button>

                      </div>
                      {page.hasPassword && page.passwordVerified && page.passwordRaw && (
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a15)" }}>
                          <KeyRound size={12} style={{ color: "var(--app-accent)" }} className="shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium mb-0.5" style={{ color: "var(--app-accent)" }}>Password</p>
                            <p className="text-xs font-mono font-semibold truncate" style={{ color: "var(--app-text)" }}>{visiblePw.has(pwKey) ? page.passwordRaw : "••••••••"}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setVisiblePw((p) => {
                                const n = new Set(p);
                                if (n.has(pwKey)) n.delete(pwKey);
                                else n.add(pwKey);
                                return n;
                              });
                            }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--app-accent-a08)", color: "var(--app-accent)" }}>
                              {visiblePw.has(pwKey) ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(page.passwordRaw!, page.shareId + "-rpw", "pw"); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--app-accent-a08)", color: "var(--app-accent)" }}>
                              {copiedPw === page.shareId + "-rpw" ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      )}
                      {page.hasPassword && !page.passwordVerified && (
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
                          <Lock size={12} style={{ color: "#f59e0b" }} className="shrink-0" />
                          <p className="text-[11px]" style={{ color: "rgba(245,158,11,0.8)" }}>Enter the correct password on the page to unlock</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  ) : null;

  const EmptyReceivedBlock = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      {sectionLabel("Shared With You")}
      <div
        className="rounded-2xl p-6 text-center flex flex-col items-center gap-2.5"
        style={cardStyle}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--app-accent-a08)" }}
        >
          <Users size={20} style={{ color: "var(--app-accent)" }} />
        </div>
        <p className="font-bold text-sm md:text-base" style={{ color: "var(--app-text)" }}>
          No shared pages yet
        </p>
        <p className="text-xs md:text-sm" style={{ color: "var(--app-text-muted)" }}>
          Pages shared with you will appear here.
        </p>
      </div>
    </motion.div>
  );

  const EmptyCreationsBlock = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      className="rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 min-h-[240px]"
      style={cardStyle}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--app-accent-a08)" }}>
        <Sparkles size={24} style={{ color: "var(--app-accent)" }} />
      </div>
      <p className="font-bold text-base" style={{ color: "var(--app-text)" }}>No creations yet</p>
      <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>Start building your first personalized gift page</p>
      <button onClick={() => router.push("/templates")}
        className="mt-1 px-6 py-2.5 rounded-full text-sm font-bold"
        style={{ background: "#3d0c11", color: "#f5ede6" }}>
        Browse Templates
      </button>
    </motion.div>
  );

  const refCode = referralInfo?.referralCode ?? user?.referralCode ?? "";
  const myReferralLink = (() => {
    if (user?.subdomain && ROOT_DOMAIN) {
      // e.g. https://suyash.subhsandesh.in/?ref=CODE
      return `https://${user.subdomain}.${ROOT_DOMAIN}/?ref=${refCode}`;
    }
    if (user?.subdomain && SITE_URL) {
      // local dev fallback: http://localhost:3000/suyash/?ref=CODE
      return `${SITE_URL}/${user.subdomain}/?ref=${refCode}`;
    }
    // No subdomain — always use the main domain, never the current window origin
    // (user may be visiting via someone else's subdomain)
    return `${SITE_URL}/?ref=${refCode}`;
  })();

  const txLabel = (type: string) => {
    if (type === "referral_signup") return "Joined via your referral";
    if (type === "referral_reward") return "Friend joined using your link";
    if (type === "template_spend") return "Created a template";
    if (type === "purchase") return "Purchased points";
    if (type === "admin_grant") return "Bonus points granted";
    return type;
  };

  const ReferralBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      {sectionLabel("Points & Referrals")}

      {/* Points balance card */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "linear-gradient(135deg, #3d0c11 0%, #5a1520 60%, #3d0c11 100%)", border: "1px solid rgba(242,207,116,0.3)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: "rgba(242,207,116,0.7)" }}>Your Points</p>
            <div className="flex items-end gap-2">
              <p className="text-5xl font-black" style={{ color: "#f2cf74", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                {referralInfo?.points ?? user?.points ?? 0}
              </p>
              <p className="text-sm font-bold pb-1" style={{ color: "rgba(242,207,116,0.6)" }}>pts</p>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(242,207,116,0.15)", border: "1px solid rgba(242,207,116,0.25)" }}>
            <Star size={26} style={{ color: "#f2cf74" }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 pt-3" style={{ borderTop: "1px solid rgba(242,207,116,0.15)" }}>
          <TrendingUp size={12} style={{ color: "rgba(242,207,116,0.6)" }} />
          <p className="text-[11px]" style={{ color: "rgba(242,207,116,0.6)" }}>
            Total earned: <span style={{ color: "#f2cf74", fontWeight: 700 }}>{referralInfo?.totalPointsEarned ?? 0} pts</span>
          </p>
        </div>
      </div>

      {/* Referral link card */}
      <div className="rounded-2xl overflow-hidden mb-4" style={cardStyle}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a10)" }}>
              <Gift size={16} style={{ color: "var(--app-accent)" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--app-text)" }}>Refer a Friend</p>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>Both of you get <span style={{ color: "var(--app-accent)", fontWeight: 700 }}>100 points</span> when they sign up</p>
            </div>
          </div>

          {/* Referral code badge */}
          <div className="flex items-center gap-2 rounded-xl p-3 mb-3" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a20)" }}>
            <p className="text-xs font-bold uppercase tracking-widest flex-1" style={{ color: "var(--app-accent)" }}>
              Your Code: <span style={{ fontSize: 14, letterSpacing: "0.3em" }}>{referralInfo?.referralCode ?? user?.referralCode ?? "..."}</span>
            </p>
          </div>

          {/* Referral link with copy */}
          <div className="flex items-center gap-2 rounded-xl p-3 mb-3" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--app-border)" }}>
            <Link2 size={11} style={{ color: "var(--app-text-faint)" }} className="shrink-0" />
            <p className="text-[11px] font-mono truncate flex-1" style={{ color: "var(--app-text-muted)" }}>
              {myReferralLink}
            </p>
            <button
              onClick={() => { navigator.clipboard.writeText(myReferralLink); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all hover:scale-110"
              style={{ background: referralCopied ? "var(--app-accent)" : "var(--app-surface)", color: referralCopied ? "#1a0507" : "var(--app-text-faint)" }}
            >
              {referralCopied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>

          {/* Share button */}
          <button
            onClick={() =>
              openSocialShare({
                url: myReferralLink,
                title: "Join me on SubhSandesh",
                message: `🎁 Join SubhSandesh and get 100 bonus points! Use my referral link to sign up and create beautiful celebration pages.`,
              })
            }
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ background: "#3d0c11", color: "#f5ede6", boxShadow: "0 6px 18px rgba(61,12,17,0.25)" }}
          >
            <Share2 size={15} />
            Share Referral Link
          </button>
        </div>

        {/* Stats row */}
        <div className="flex divide-x" style={{ borderTop: "1px solid var(--app-border-faint)", divideColor: "var(--app-border-faint)" } as React.CSSProperties}>
          <div className="flex-1 py-3 text-center">
            <p className="text-xl font-black" style={{ color: "var(--app-text)" }}>{referralInfo?.referralCount ?? 0}</p>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--app-text-faint)" }}>Friends Referred</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <p className="text-xl font-black" style={{ color: "var(--app-accent)" }}>{(referralInfo?.referralCount ?? 0) * 100}</p>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--app-text-faint)" }}>Points Earned</p>
          </div>
        </div>
      </div>

      {/* Points history */}
      {pointsTxs.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--app-accent)" }}>Points History</p>
          </div>
          {pointsTxs.slice(0, 10).map((tx) => (
            <div key={tx._id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: tx.delta > 0 ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)" }}>
                {tx.delta > 0
                  ? <ArrowUpRight size={14} style={{ color: "#22c55e" }} />
                  : <ArrowDownRight size={14} style={{ color: "#f87171" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--app-text)" }}>{txLabel(tx.type)}</p>
                {tx.meta?.referrerName && <p className="text-[10px] truncate" style={{ color: "var(--app-text-faint)" }}>via {tx.meta.referrerName}</p>}
                {tx.meta?.refereeName && <p className="text-[10px] truncate" style={{ color: "var(--app-text-faint)" }}>{tx.meta.refereeName}</p>}
                <p className="text-[10px]" style={{ color: "var(--app-text-faint)" }}>{formatShortDate(tx.createdAt)}</p>
              </div>
              <p className="text-sm font-black shrink-0" style={{ color: tx.delta > 0 ? "#22c55e" : "#f87171" }}>
                {tx.delta > 0 ? "+" : ""}{tx.delta}
              </p>
            </div>
          ))}
        </div>
      )}

      {pointsTxs.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={cardStyle}>
          <Star size={28} className="mx-auto mb-3" style={{ color: "var(--app-accent)", opacity: 0.5 }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--app-text)" }}>No points yet</p>
          <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>Share your referral link to start earning 100 points per friend.</p>
        </div>
      )}
    </motion.div>
  );

  const activePanelContent =
    activePanel === "personal-link" ? SubdomainBlock :
    activePanel === "account" ? AccountBlock :
    activePanel === "my-story" ? <MyStorySection /> :
    activePanel === "creations" ? (CreationsBlock ?? EmptyCreationsBlock) :
    activePanel === "referral" ? ReferralBlock :
    (ReceivedBlock ?? EmptyReceivedBlock);

  return (
    <ProfileShell>
      <div className="md:max-w-7xl md:mx-auto md:px-6 lg:px-8 md:pt-24 md:pb-10">
        {/* Desktop: Sidebar navigation + active panel */}
        <div className="hidden md:flex md:gap-12 md:items-start">
          <div className="w-[340px] shrink-0 sticky top-28 space-y-5">
            <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(61,12,17,0.1)" }}>
              {AvatarBlock}
            </div>

            {StatsBlock}

            <div className="rounded-2xl p-2" style={cardStyle}>
              {([
                { id: "personal-link" as ProfilePanel, icon: <AtSign size={15} />, label: "Personal Link", hint: "Handle and share URL" },
                { id: "account" as ProfilePanel, icon: <Shield size={15} />, label: "Account Settings", hint: "Email and password" },
                { id: "my-story" as ProfilePanel, icon: <BookHeart size={15} />, label: "My Story", hint: "Private notes we fill your forms from" },
                { id: "creations" as ProfilePanel, icon: <Sparkles size={15} />, label: "My Creations", hint: `${myCreations.length} item${myCreations.length === 1 ? "" : "s"}` },
                { id: "received" as ProfilePanel, icon: <Users size={15} />, label: "Shared With You", hint: `${receivedPages.length} item${receivedPages.length === 1 ? "" : "s"}` },
                { id: "referral" as ProfilePanel, icon: <Gift size={15} />, label: "Refer & Earn", hint: `${referralInfo?.points ?? user?.points ?? 0} pts · ${referralInfo?.referralCount ?? 0} friends` },
              ]).map((item) => {
                const active = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className="w-full text-left rounded-xl px-3.5 py-3 mb-1 last:mb-0 transition-all"
                    style={{
                      background: active ? "var(--app-accent-a08)" : "transparent",
                      border: `1px solid ${active ? "var(--app-accent-a20)" : "transparent"}`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: active ? "var(--app-accent-a15)" : "var(--app-surface)",
                          color: active ? "var(--app-accent)" : "var(--app-text-faint)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: active ? "var(--app-text)" : "var(--app-text-muted)" }}>
                          {item.label}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: "var(--app-text-faint)" }}>
                          {item.hint}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {LogoutBlock}
          </div>

          <div className="flex-1 min-w-0 space-y-5">
            {activePanelContent}
            {activePanel === "creations" && (
              <div className="hidden md:flex justify-end pt-1">
                <button
                  onClick={() => router.push("/templates")}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: "#3d0c11", color: "#f5ede6", boxShadow: "0 10px 24px rgba(61,12,17,0.2)" }}
                >
                  <Sparkles size={15} /> New Creation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: stacked layout */}
        <div className="md:hidden">
          <div className="px-5 pt-4 pb-5">
            <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(61,12,17,0.1)" }}>
              {AvatarBlock}
            </div>
          </div>

          <div className="px-5 pt-4 pb-5">{StatsBlock}</div>
          <div className="px-5 pb-5">{SubdomainBlock}</div>
          <div id="referral" className="px-5 pb-5">{ReferralBlock}</div>
          <div className="px-5 pb-5">{AccountBlock}</div>
          <div className="px-5 pb-5"><MyStorySection /></div>
          <div className="px-5 pb-5">{CreationsBlock ?? EmptyCreationsBlock}</div>
          <div className="px-5 pb-5">{ReceivedBlock ?? EmptyReceivedBlock}</div>
          <div className="px-5 pb-5">{LogoutBlock}</div>
        </div>
      </div>
    </ProfileShell>
  );
}
