"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Heart, Sparkles, Edit3, Check, X, Lock, LogOut,
  Eye, EyeOff, Loader2, ChevronDown, Shield,
  ExternalLink, Cake, Gift, Users, Copy, KeyRound, Globe,
  AtSign, Link2, Share2, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  Trash2, AlertTriangle, BookHeart,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { GoogleG } from "@/app/(app)/admin/adminIcons";
import { PROFILE_CSS } from "./profileStyles";
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
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.34, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.34, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.3, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.3, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>
      <LuxuryMobileTopBrand />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <style>{PROFILE_CSS}</style>
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

/* ── Count-up number for the hero stats ──
   Eases from the last value to the new one, so a stat that arrives after the
   fetch rolls up instead of snapping. Reduced motion jumps straight there. */
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 0 : 900;
    const a = from.current;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = ms ? Math.min(1, (t - start) / ms) : 1;
      setN(Math.round(a + (value - a) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString("en-IN")}</>;
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
  const [activePanel, setActivePanel] = useState<ProfilePanel>("creations"); // pages first: it is what people come back for
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

  const sectionHead = (icon: React.ReactNode, title: string, sub?: React.ReactNode, right?: React.ReactNode) => (
    <div className="pfHead">
      <span className="pfHeadIc">{icon}</span>
      <div className="pfHeadTx">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {right}
    </div>
  );

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <ProfileShell>
        <div className="pfWrap pfWrapGate">
          <section className="pfHero pfGate">
            <span className="pfShine" aria-hidden="true" />
            <span className="pfOrb" aria-hidden="true" />
            <span className="pfSpark s1" aria-hidden="true">✦</span>
            <span className="pfSpark s2" aria-hidden="true">♥</span>
            <span className="pfSpark s3" aria-hidden="true">✦</span>
            <div className="pfGateIc"><User size={28} /></div>
            <p className="pfKicker">Profile Access</p>
            <h1 className="pfGateTitle">Sign In <em>to Continue.</em></h1>
            <p className="pfLead">
              Log in to manage your profile, view your dashboard, and personalize templates.
            </p>
            <ul className="pfGateList">
              <li><Sparkles size={13} /> Your pages &amp; drafts</li>
              <li><Star size={13} /> Points &amp; referrals</li>
              <li><AtSign size={13} /> Your personal link</li>
            </ul>
            <button onClick={() => setShowAuth(true)} className="pfBtnGold">
              <Lock size={15} /> Sign In
            </button>
          </section>
        </div>
        <AnimatePresence>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        </AnimatePresence>
      </ProfileShell>
    );
  }

  /* ── Authenticated ── */

  const draftCount = myCreations.filter((p) => !p.isPublished).length;
  const liveCount = myCreations.length - draftCount;
  const visibleCreations = myCreations.filter((p) =>
    creationFilter === "all" ? true : creationFilter === "live" ? p.isPublished : !p.isPublished
  );
  const totalViews = myCreations.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const points = referralInfo?.points ?? user?.points ?? 0;

  const HeroBlock = (
    <section className="pfHero">
      <span className="pfShine" aria-hidden="true" />
      <span className="pfOrb" aria-hidden="true" />
      <span className="pfSpark s1" aria-hidden="true">✦</span>
      <span className="pfSpark s2" aria-hidden="true">♥</span>
      <span className="pfSpark s3" aria-hidden="true">✦</span>

      <div className="pfHeroMain">
        <div className="pfAvatarWrap">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="pfAvatar" />
          ) : (
            <div className="pfAvatar pfAvatarInit">{getInitials(user?.name || "U")}</div>
          )}
          <span className="pfAvatarBadge" title={user?.provider === "google" ? "Signed in with Google" : "Verified account"}>
            {user?.provider === "google" ? <GoogleG size={13} /> : <Check size={11} strokeWidth={3} />}
          </span>
        </div>

        <div className="pfWho">
          <p className="pfKicker">Your profile</p>
          {editingName ? (
            <div className="pfNameEdit">
              <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="pfNameInput" aria-label="Your name" autoFocus />
              <button onClick={handleSaveName} disabled={nameLoading} className="pfRound gold" aria-label="Save name">
                {nameLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
              <button onClick={() => setEditingName(false)} className="pfRound glass" aria-label="Cancel">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="pfNameRow">
              <h1 className="pfName">{user?.name}</h1>
              <button onClick={() => { setNameInput(user?.name || ""); setEditingName(true); }}
                className="pfRound glass sm" aria-label="Edit name" title="Edit name">
                <Edit3 size={12} />
              </button>
            </div>
          )}
          <div className="pfMeta">
            <span className="pfMetaItem"><Mail size={12} /> <span className="pfMetaTx">{user?.email}</span></span>
            {user?.subdomain && (
              <span className="pfMetaItem gold"><AtSign size={12} /> <span className="pfMetaTx">{user.subdomain}</span></span>
            )}
            <span className="pfMetaItem">
              <Calendar size={12} /> Member since {statsLoading ? "…" : stats?.memberSince ? formatDate(stats.memberSince) : "Today"}
            </span>
            {user?.provider === "google" && (
              <span className="pfMetaItem"><GoogleG size={11} /> Connected with Google</span>
            )}
          </div>
        </div>

        <button onClick={handleLogout} disabled={logoutLoading} className="pfLogout" aria-label="Log out" title="Log out">
          {logoutLoading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          <span>{logoutLoading ? "Logging out…" : "Log Out"}</span>
        </button>
      </div>

      <div className="pfStats">
        {[
          { icon: <Sparkles size={14} />, label: "Pages", value: myCreations.length, sub: `${liveCount} live · ${draftCount} draft${draftCount === 1 ? "" : "s"}`, loading: false },
          { icon: <Eye size={14} />, label: "Views", value: totalViews, sub: "on your pages", loading: false },
          { icon: <Star size={14} />, label: "Points", value: points, sub: `${referralInfo?.referralCount ?? 0} friends referred`, loading: false },
          { icon: <Heart size={14} />, label: "Favorites", value: stats?.favoritesCount ?? 0, sub: `${stats?.generatedCount ?? 0} generated`, loading: statsLoading },
        ].map((s, i) => (
          <div key={s.label} className="pfStat" style={{ animationDelay: `${120 + i * 70}ms` }}>
            <span className="pfStatIc">{s.icon}</span>
            <p className="pfStatNum">{s.loading ? "…" : <CountUp value={s.value} />}</p>
            <p className="pfStatLabel">{s.label}</p>
            <p className="pfStatSub">{s.loading ? " " : s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const subdomainStatusClass = subdomainStatus === "available" ? "ok" : subdomainStatus === "taken" || subdomainStatus === "invalid" ? "bad" : "wait";

  const SubdomainBlock = (
    <div className="pfCard pfNarrow">
      {sectionHead(<AtSign size={16} />, "My Personal Link", "Every page you share uses this handle")}
      {!editingSubdomain ? (
        user?.subdomain ? (
          <div className="pfBody">
            <div className="pfHandleRow">
              <div className="pfHandle">
                <span className="pfTinyLabel">Your Handle</span>
                <span className="pfHandleName">@{user.subdomain}</span>
              </div>
              <button onClick={() => { setSubdomainInput(user.subdomain || ""); setEditingSubdomain(true); }}
                className="pfBtnGhost sm"><Edit3 size={13} /> Change</button>
            </div>

            {/* URL preview */}
            <div className="pfUrlBox">
              <span className="pfTinyLabel gold">Your Share Links</span>
              <div className="pfUrlRow">
                <Link2 size={12} className="shrink-0" />
                <p className="pfMono">
                  {ROOT_DOMAIN
                    ? <><b>{user.subdomain}</b>.{ROOT_DOMAIN}/<i>page-id</i></>
                    : <>{SITE_URL}/{user.subdomain}/<i>page-id</i></>
                  }
                </p>
                <button
                  onClick={() => {
                    const base = ROOT_DOMAIN ? `https://${user.subdomain}.${ROOT_DOMAIN}/` : `${SITE_URL}/u/${user.subdomain}/`;
                    navigator.clipboard.writeText(base);
                    setSubdomainCopied(true);
                    setTimeout(() => setSubdomainCopied(false), 2000);
                  }}
                  className={`pfIconBtn${subdomainCopied ? " is-done" : ""}`} aria-label="Copy link" title="Copy link">
                  {subdomainCopied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <p className="pfNote">All your shared pages use this personalized link</p>
          </div>
        ) : (
          <button onClick={() => { setSubdomainInput(""); setEditingSubdomain(true); }} className="pfClaim">
            <span className="pfClaimIc"><AtSign size={18} /></span>
            <span className="pfClaimTx">
              <b>Claim Your Personal Link</b>
              <span>e.g. dilse.app/<em>yourname</em>/page</span>
            </span>
            <span className="pfClaimPill">Claim</span>
          </button>
        )
      ) : (
        <div className="pfBody">
          <p className="pfFormTitle">{user?.subdomain ? "Change Your Handle" : "Choose Your Handle"}</p>

          {/* Input */}
          <div className="pfField">
            <span className="pfFieldPre">@</span>
            <input
              type="text"
              value={subdomainInput}
              onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="yourname"
              maxLength={30}
              autoFocus
              aria-label="Handle"
              className="pfInput pfInputPre pfMonoInput"
              onKeyDown={(e) => e.key === "Enter" && handleSaveSubdomain()}
            />
          </div>

          {/* URL preview while typing */}
          {subdomainInput && (
            <div className="pfUrlBox soft">
              <span className="pfTinyLabel">Preview</span>
              <p className="pfMono">
                {ROOT_DOMAIN
                  ? <><b>{subdomainInput}</b>.{ROOT_DOMAIN}/page-id</>
                  : <>{SITE_URL}/<b>{subdomainInput}</b>/page-id</>
                }
              </p>
            </div>
          )}

          {/* Status message */}
          <AnimatePresence mode="wait">
            {subdomainInput && subdomainStatus !== "idle" && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`pfStatusMsg ${subdomainStatusClass}`}>
                {subdomainStatus === "checking" ? <Loader2 size={12} className="animate-spin shrink-0" /> :
                 subdomainStatus === "available" ? <Check size={12} className="shrink-0" /> :
                 <X size={12} className="shrink-0" />}
                {subdomainStatus === "checking" ? "Checking availability…" : subdomainStatusMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rules */}
          <p className="pfNote left">3–30 chars · lowercase letters, numbers, hyphens · no leading/trailing hyphens</p>

          {/* Actions */}
          <div className="pfBtnRow">
            <button onClick={handleSaveSubdomain}
              disabled={subdomainLoading || subdomainStatus !== "available" || !subdomainInput}
              className="pfBtn grow">
              {subdomainLoading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save Handle</>}
            </button>
            <button onClick={() => { setEditingSubdomain(false); setSubdomainInput(""); setSubdomainStatus("idle"); }}
              className="pfBtnGhost">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const AccountBlock = (
    <div className="pfAccountGrid">
      <div className="pfCard">
        {sectionHead(<Shield size={16} />, "Account", "How you sign in")}
        <div className="pfRows">
          <div className="pfRow">
            <span className="pfRowIc"><Mail size={15} /></span>
            <div className="pfRowTx"><b>Email</b><span>{user?.email}</span></div>
          </div>
          <div className="pfRow">
            <span className="pfRowIc">{user?.provider === "google" ? <GoogleG size={15} /> : <Shield size={15} />}</span>
            <div className="pfRowTx"><b>Sign-in method</b><span className="cap">{user?.provider}</span></div>
          </div>
          <div className="pfRow">
            <span className="pfRowIc"><Calendar size={15} /></span>
            <div className="pfRowTx"><b>Member since</b><span>{statsLoading ? "…" : stats?.memberSince ? formatDate(stats.memberSince) : "Today"}</span></div>
          </div>
        </div>
      </div>

      {/* Shown for Google accounts too, as "Set Password". There is no
          /forgot-password route in this app, so this is the ONLY way a
          Google-only account can ever gain a password — and the only way
          back for an account whose unverified-era password was cleared when
          Google sign-in verified it. */}
      {(user?.provider === "local" || user?.provider === "google") && (
        <div className="pfCard">
          <button onClick={() => { setShowPasswordSection(!showPasswordSection); setPwMessage(null); setCurrentPw(""); setNewPw(""); }}
            className="pfHead pfHeadBtn" aria-expanded={showPasswordSection}>
            <span className="pfHeadIc"><Lock size={16} /></span>
            <span className="pfHeadTx">
              <span className="h">{hasNoPassword ? "Set Password" : "Change Password"}</span>
              <span className="s">
                {hasNoPassword
                  ? "Add a password so you can sign in without Google"
                  : "Update your account password"}
              </span>
            </span>
            <ChevronDown size={17} className={`pfChev${showPasswordSection ? " is-open" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {showPasswordSection && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pfBody">
                  {[...(hasNoPassword
                      ? []
                      : [{ val: currentPw, set: setCurrentPw, show: showCurrentPw, toggle: setShowCurrentPw, placeholder: "Current password", onEnter: undefined }]),
                    { val: newPw, set: setNewPw, show: showNewPw, toggle: setShowNewPw, placeholder: "New password (min 6 chars)", onEnter: handleChangePassword }
                  ].map(({ val, set, show, toggle, placeholder, onEnter }) => (
                    <div key={placeholder} className="pfField">
                      <input type={show ? "text" : "password"} value={val} onChange={(e) => set(e.target.value)}
                        placeholder={placeholder} aria-label={placeholder}
                        onKeyDown={onEnter ? (e) => e.key === "Enter" && onEnter() : undefined}
                        className="pfInput pfInputPost" />
                      <button type="button" onClick={() => toggle(!show)} className="pfFieldPost"
                        aria-label={show ? "Hide password" : "Show password"}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  ))}
                  {pwMessage && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className={`pfStatusMsg ${pwMessage.type === "success" ? "ok" : "bad"}`}>
                      {pwMessage.text}
                    </motion.p>
                  )}
                  {/* A Google account has no current password to type, so the
                      button must not wait for one (handleChangePassword already
                      skips that requirement for exactly this case). */}
                  <button onClick={handleChangePassword} disabled={pwLoading || (!hasNoPassword && !currentPw) || !newPw || newPw.length < 6}
                    className="pfBtn full">
                    {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : <><KeyRound size={14} /> {hasNoPassword ? "Set Password" : "Update Password"}</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  /**
   * One segment.
   *
   * Segments for empty buckets are hidden rather than disabled: a "Drafts 0"
   * chip that cannot be pressed is a dead control, and offering the filter at
   * all only makes sense once there is something to filter.
   */
  const filterChip = (id: "all" | "draft" | "live", label: string, count: number) =>
    count === 0 && id !== "all" ? null : (
      <button
        key={id}
        type="button"
        onClick={() => { setCreationFilter(id); setExpandedCard(null); setDeleteConfirmId(null); }}
        className={creationFilter === id ? "is-on" : ""}
        aria-pressed={creationFilter === id}
      >
        {creationFilter === id && (
          <motion.span layoutId="pf-filter-pill" className="pfSegPill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
        )}
        <span className="pfSegLabel">{label} <b>{count}</b></span>
      </button>
    );

  const newCreationBtn = (
    <button onClick={() => router.push("/templates")} className="pfBtn sm">
      <Sparkles size={14} /> <span>New Creation</span>
    </button>
  );

  const CreationsBlock = myCreations.length > 0 ? (
    <div>
      <div className="pfPanelBar">
        {sectionHead(<Sparkles size={16} />, "My Creations", `${myCreations.length} page${myCreations.length === 1 ? "" : "s"} · most recent first`, newCreationBtn)}
        {/* Only worth showing once there are both kinds to choose between. */}
        {draftCount > 0 && liveCount > 0 && (
          <div className="pfSeg" role="group" aria-label="Filter pages">
            {filterChip("all", "All", myCreations.length)}
            {filterChip("draft", "Drafts", draftCount)}
            {filterChip("live", "Live", liveCount)}
          </div>
        )}
      </div>
      <div className="pfGrid">
        {visibleCreations.map((page, i) => {
          const shareLink = getShareLink(page.shareId);
          const isExpanded = expandedCard === page._id;
          const toggle = () => { setExpandedCard(isExpanded ? null : page._id); setDeleteConfirmId(null); };
          return (
            <article key={page._id} className={`pfPage${isExpanded ? " is-open" : ""}${page.isPublished ? " is-live" : ""}`}
              style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}>
              {/* ── Header (click to expand) ── */}
              <div className="pfPageTop" role="button" tabIndex={0} aria-expanded={isExpanded} onClick={toggle}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}>
                <span className="pfEmoji">
                  {page.templateType === "valentine" ? <Gift size={19} style={{ color: "#e11d48" }} /> :
                   page.templateType === "holi" ? <Sparkles size={19} style={{ color: "#8b5cf6" }} /> :
                   page.templateType === "birthday" || page.templateType === "birthday-gf" ? <Cake size={19} style={{ color: BRAND.accent }} /> :
                   <span>{templateEmoji(page.templateType)}</span>}
                </span>
                <div className="pfPageTx">
                  <h3>For {page.recipientName}</h3>
                  <p>{templateLabel(page.templateType)} · {formatShortDate(page.updatedAt)}</p>
                </div>
                <span className={`pfStatus ${page.isPublished ? "is-live" : "is-draft"}`}>
                  {page.isPublished ? <><i aria-hidden="true" /> Live</> : "Draft"}
                </span>
              </div>

              <div className="pfPageStats">
                <span><Eye size={12} /> {page.viewCount ?? 0} views</span>
                <span><Users size={12} /> {page.installCount} installs</span>
                {page.hasPassword && <span><Lock size={12} /> Locked</span>}
              </div>

              <div className="pfActions">
                <button title="Edit" onClick={() => router.push(`${editorRoute(page.templateType)}?edit=${page._id}`)} className="pfAct main">
                  <Edit3 size={13} /> Edit
                </button>
                {page.isPublished && (
                  <>
                    <button title="Copy link" aria-label="Copy link" onClick={() => copyToClipboard(shareLink, page._id, "link")}
                      className={`pfAct ic${copiedLink === page._id ? " is-done" : ""}`}>
                      {copiedLink === page._id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button title="Share" aria-label="Share" onClick={() => {
                      openSocialShare({
                        url: shareLink,
                        title: `${templateLabel(page.templateType)} page`,
                        message: `${page.senderName || "Someone"} shared a ${templateLabel(page.templateType)} page${page.recipientName ? ` for ${page.recipientName}` : ""} on SubhSandesh!`,
                        slug: templateSlug(page.templateType),
                        recipientName: page.recipientName,
                        senderName: page.senderName,
                        password: page.passwordRaw,
                      });
                    }} className="pfAct ic">
                      <Share2 size={14} />
                    </button>
                    <button title="Open in new tab" aria-label="Open in new tab" onClick={() => window.open(getShareLink(page.shareId), "_blank")} className="pfAct ic">
                      <ExternalLink size={14} />
                    </button>
                  </>
                )}
                <span className="pfActGap" />
                <button title="Password & details" aria-label="Password & details" aria-expanded={isExpanded} onClick={toggle} className={`pfAct ic${isExpanded ? " is-on" : ""}`}>
                  <KeyRound size={14} />
                </button>
                <button title={page.isPublished ? "Delete" : "Discard"} aria-label={page.isPublished ? "Delete" : "Discard"}
                  onClick={() => { setExpandedCard(page._id); setDeleteConfirmId(page._id); }} className="pfAct ic danger">
                  {/* "Discard" for a draft: it names an action with no audience,
                      which is what discarding an unpublished page is. */}
                  <Trash2 size={14} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="pfPageMore">
                      {/* Delete confirmation banner (triggered from the Delete action) */}
                      {deleteConfirmId === page._id && (
                        <div className="pfDanger">
                          <div className="pfDangerHead">
                            <AlertTriangle size={15} className="shrink-0" />
                            <div className="min-w-0">
                              {/* ── The warning has to match what is actually at stake ──────
                                  Every abandoned build is now a draft, so most rows in this
                                  list were never sent to anyone. Telling someone that
                                  discarding one will "stop the link working for everyone you
                                  sent it to" is not true of a draft, and a warning that
                                  overstates its case is one people learn to click through —
                                  including on the published card where every word of it IS
                                  true. */}
                              <p className="pfDangerTitle">
                                {page.isPublished ? "Permanently delete this card?" : "Discard this draft?"}
                              </p>
                              <p className="pfDangerTx">
                                {page.isPublished ? (
                                  <>This is <b>permanent and cannot be undone</b>. The card and all its content, photos and settings will be erased. The shared link will stop working for you and everyone you sent it to, and <b>it can never be recovered or published again</b> — you would have to build a brand-new card from scratch.</>
                                ) : (
                                  <>This draft was never published, so nobody has a link to it. Its content and photos will be erased and <b>cannot be recovered</b> — you would have to start this one again.</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="pfBtnRow">
                            <button onClick={() => setDeleteConfirmId(null)} disabled={deletingId === page._id} className="pfBtnGhost grow">
                              Cancel
                            </button>
                            <button onClick={() => handleDeleteCreation(page)} disabled={deletingId === page._id} className="pfBtnDanger grow">
                              {deletingId === page._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              {deletingId === page._id ? "Deleting…" : "Delete forever"}
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Outside any isPublished check on purpose: the password is set
                          in the builder at create time, so a DRAFT can already carry one —
                          and a draft is exactly when you would want to fix it before
                          sending the link. Nothing about being unpublished makes a
                          page's password unmanageable. */}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </div>
  ) : null;

  const ReceivedBlock = receivedPages.length > 0 ? (
    <div>
      {sectionHead(<Users size={16} />, "Shared With You", `${receivedPages.length} page${receivedPages.length === 1 ? "" : "s"} people made for you`)}
      <div className="pfGrid">
        {receivedPages.map((page, i) => {
          const link = getShareLink(page.shareId);
          const isOpen = expandedReceived === page.shareId;
          const pwKey = `recv-${page.shareId}`;
          return (
            <article key={page.shareId} className={`pfPage${isOpen ? " is-open" : ""}`} style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}>
              <button onClick={() => setExpandedReceived(isOpen ? null : page.shareId)} className="pfPageTop pfPageTopBtn" aria-expanded={isOpen}>
                {page.senderAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={page.senderAvatar} alt={page.senderName} className="pfSender" />
                ) : (
                  <span className="pfSender pfSenderInit">{getInitials(page.senderName)}</span>
                )}
                <span className="pfPageTx">
                  <span className="h">{templateEmoji(page.templateType)} From {page.senderName}</span>
                  <span className="s">{templateLabel(page.templateType)} for {page.recipientName} · {formatShortDate(page.createdAt)}</span>
                </span>
                {page.hasPassword && (
                  <span className={`pfLockBadge${page.passwordVerified ? " is-ok" : ""}`} title={page.passwordVerified ? "Unlocked" : "Locked"}>
                    {page.passwordVerified ? <Check size={11} /> : <Lock size={11} />}
                  </span>
                )}
                <ChevronDown size={16} className={`pfChev${isOpen ? " is-open" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="pfPageMore">
                      <div className="pfUrlRow boxed">
                        <Globe size={12} className="shrink-0" />
                        <p className="pfMono">{link}</p>
                        <button onClick={() => copyToClipboard(link, page.shareId + "-recv", "link")}
                          className={`pfIconBtn${copiedLink === page.shareId + "-recv" ? " is-done" : ""}`} aria-label="Copy link" title="Copy link">
                          {copiedLink === page.shareId + "-recv" ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                        <button onClick={() => {
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
                        }} className="pfIconBtn" aria-label="Share" title="Share">
                          <Share2 size={12} />
                        </button>
                        <button onClick={() => window.open(`/${page.shareId}`, "_blank")} className="pfIconBtn" aria-label="Open in new tab" title="Open in new tab">
                          <ExternalLink size={12} />
                        </button>
                      </div>
                      {page.hasPassword && page.passwordVerified && page.passwordRaw && (
                        <div className="pfUrlRow boxed gold">
                          <KeyRound size={12} className="shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="pfTinyLabel gold">Password</span>
                            <p className="pfMono strong">{visiblePw.has(pwKey) ? page.passwordRaw : "••••••••"}</p>
                          </div>
                          <button onClick={() => {
                            setVisiblePw((p) => {
                              const n = new Set(p);
                              if (n.has(pwKey)) n.delete(pwKey);
                              else n.add(pwKey);
                              return n;
                            });
                          }} className="pfIconBtn" aria-label={visiblePw.has(pwKey) ? "Hide password" : "Show password"}>
                            {visiblePw.has(pwKey) ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button onClick={() => copyToClipboard(page.passwordRaw!, page.shareId + "-rpw", "pw")}
                            className={`pfIconBtn${copiedPw === page.shareId + "-rpw" ? " is-done" : ""}`} aria-label="Copy password">
                            {copiedPw === page.shareId + "-rpw" ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                      {page.hasPassword && !page.passwordVerified && (
                        <div className="pfStatusMsg warn">
                          <Lock size={12} className="shrink-0" />
                          Enter the correct password on the page to unlock
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </div>
  ) : null;

  const EmptyReceivedBlock = (
    <div className="pfEmpty">
      <span className="pfEmptyIc"><Users size={22} /></span>
      <p className="pfEmptyTitle">No shared pages yet</p>
      <p className="pfEmptySub">Pages shared with you will appear here.</p>
    </div>
  );

  const EmptyCreationsBlock = (
    <div className="pfEmpty">
      <span className="pfEmptyIc"><Sparkles size={22} /></span>
      <p className="pfEmptyTitle">No creations yet</p>
      <p className="pfEmptySub">Start building your first personalized gift page</p>
      <button onClick={() => router.push("/templates")} className="pfBtn" style={{ marginTop: 14 }}>
        <Sparkles size={14} /> Browse Templates
      </button>
    </div>
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
    <div className="pfReferGrid">
      <div className="pfReferMain">
        {/* Points balance card */}
        <div className="pfPoints">
          <span className="pfShine" aria-hidden="true" />
          <div className="pfPointsTop">
            <div>
              <span className="pfTinyLabel onDark">Your Points</span>
              <p className="pfPointsNum"><CountUp value={points} /><small>pts</small></p>
            </div>
            <span className="pfPointsIc"><Star size={24} /></span>
          </div>
          <p className="pfPointsFoot">
            <TrendingUp size={12} /> Total earned: <b>{referralInfo?.totalPointsEarned ?? 0} pts</b>
          </p>
        </div>

        {/* Referral link card */}
        <div className="pfCard">
          {sectionHead(<Gift size={16} />, "Refer a Friend", <>Both of you get <b className="pfGoldTx">100 points</b> when they sign up</>)}
          <div className="pfBody">
            {/* Referral code badge */}
            <div className="pfCode">
              <span className="pfTinyLabel gold">Your Code</span>
              <span className="pfCodeVal">{referralInfo?.referralCode ?? user?.referralCode ?? "..."}</span>
            </div>

            {/* Referral link with copy */}
            <div className="pfUrlRow boxed">
              <Link2 size={12} className="shrink-0" />
              <p className="pfMono">{myReferralLink}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(myReferralLink); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                className={`pfIconBtn${referralCopied ? " is-done" : ""}`} aria-label="Copy referral link" title="Copy referral link"
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
              className="pfBtn full"
            >
              <Share2 size={15} />
              Share Referral Link
            </button>
          </div>

          {/* Stats row */}
          <div className="pfMiniStats">
            <div>
              <p className="pfMiniNum">{referralInfo?.referralCount ?? 0}</p>
              <p className="pfMiniLabel">Friends Referred</p>
            </div>
            <div>
              <p className="pfMiniNum gold">{(referralInfo?.referralCount ?? 0) * 100}</p>
              <p className="pfMiniLabel">Points Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Points history */}
      {pointsTxs.length > 0 ? (
        <div className="pfCard pfHistory">
          {sectionHead(<TrendingUp size={16} />, "Points History", "Your last 10 movements")}
          <div className="pfRows">
            {pointsTxs.slice(0, 10).map((tx) => (
              <div key={tx._id} className="pfRow">
                <span className={`pfRowIc ${tx.delta > 0 ? "up" : "down"}`}>
                  {tx.delta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
                <div className="pfRowTx">
                  <b>{txLabel(tx.type)}</b>
                  {tx.meta?.referrerName && <span>via {tx.meta.referrerName}</span>}
                  {tx.meta?.refereeName && <span>{tx.meta.refereeName}</span>}
                  <span>{formatShortDate(tx.createdAt)}</span>
                </div>
                <p className={`pfDelta ${tx.delta > 0 ? "up" : "down"}`}>
                  {tx.delta > 0 ? "+" : ""}{tx.delta}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pfEmpty">
          <span className="pfEmptyIc"><Star size={22} /></span>
          <p className="pfEmptyTitle">No points yet</p>
          <p className="pfEmptySub">Share your referral link to start earning 100 points per friend.</p>
        </div>
      )}
    </div>
  );

  const tabs: { id: ProfilePanel; icon: React.ReactNode; label: string; count?: number }[] = [
    { id: "creations", icon: <Sparkles size={15} />, label: "My Pages", count: myCreations.length },
    { id: "received", icon: <Users size={15} />, label: "Shared", count: receivedPages.length },
    { id: "referral", icon: <Gift size={15} />, label: "Refer & Earn" },
    { id: "personal-link", icon: <AtSign size={15} />, label: "My Link" },
    { id: "account", icon: <Shield size={15} />, label: "Account" },
    { id: "my-story", icon: <BookHeart size={15} />, label: "My Story" },
  ];

  const activePanelContent =
    activePanel === "personal-link" ? SubdomainBlock :
    activePanel === "account" ? AccountBlock :
    activePanel === "my-story" ? <div className="pfNarrow wide"><MyStorySection /></div> :
    activePanel === "creations" ? (CreationsBlock ?? EmptyCreationsBlock) :
    activePanel === "referral" ? ReferralBlock :
    (ReceivedBlock ?? EmptyReceivedBlock);

  return (
    <ProfileShell>
      <div className="pfWrap">
        {HeroBlock}

        <nav id="referral" className="pfTabs" role="tablist" aria-label="Profile sections">
          {tabs.map((t) => {
            const active = activePanel === t.id;
            return (
              <button key={t.id} type="button" role="tab" aria-selected={active}
                className={active ? "is-on" : ""} onClick={() => setActivePanel(t.id)}>
                {active && (
                  <motion.span layoutId="pf-tab-pill" className="pfTabPill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="pfTabIn">
                  {t.icon}
                  <span className="pfTabLabel">{t.label}</span>
                  {t.count ? <b>{t.count}</b> : null}
                </span>
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activePanel}
            role="tabpanel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pfPanel"
          >
            {activePanelContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </ProfileShell>
  );
}
