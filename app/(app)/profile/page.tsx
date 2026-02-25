"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Heart, Sparkles, Edit3, Check, X, Lock, LogOut,
  Eye, EyeOff, Loader2, ChevronRight, Shield, Sun, Moon,
  ExternalLink, Cake, Gift, Users, BarChart3, Copy, KeyRound, Inbox, Globe,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateProfile, changePassword, logoutUser, updateTheme } from "@/store/authSlice";
import { clearFavorites } from "@/store/favoritesSlice";
import AuthModal from "@/components/AuthModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (API_URL.includes("ngrok")) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

interface DashboardStats { favoritesCount: number; generatedCount: number; memberSince: string; }
interface MyCreation {
  _id: string; shareId: string; templateType: string; recipientName: string;
  senderName: string; isPublished: boolean; hasPassword: boolean; passwordRaw: string;
  viewCount: number; installCount: number; updatedAt: string; createdAt: string;
}
interface ReceivedPage {
  shareId: string; templateType: string; recipientName: string; senderName: string;
  senderAvatar: string | null; hasPassword: boolean; passwordVerified: boolean;
  passwordRaw?: string; viewCount: number; createdAt: string;
}

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
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [myCreations, setMyCreations] = useState<MyCreation[]>([]);
  const [receivedPages, setReceivedPages] = useState<ReceivedPage[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPw, setCopiedPw] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedReceived, setExpandedReceived] = useState<string | null>(null);
  const [visiblePw, setVisiblePw] = useState<Set<string>>(new Set());

  useEffect(() => setMounted(true), []);

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (isAuthenticated) {
      setThemeSaving(true);
      try { await dispatch(updateTheme(newTheme)).unwrap(); } catch { /* silent */ } finally { setThemeSaving(false); }
    }
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

  useEffect(() => {
    if (isAuthenticated) { fetchDashboard(); fetchMyCreations(); fetchReceivedPages(); }
  }, [isAuthenticated, fetchDashboard, fetchMyCreations, fetchReceivedPages]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user?.name) { setEditingName(false); return; }
    setNameLoading(true);
    try { await dispatch(updateProfile({ name: nameInput.trim() })).unwrap(); setEditingName(false); }
    catch { /* handled by Redux */ } finally { setNameLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return;
    setPwLoading(true); setPwMessage(null);
    try {
      await dispatch(changePassword({ currentPassword: currentPw, newPassword: newPw })).unwrap();
      setPwMessage({ type: "success", text: "Password updated successfully!" });
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
  const getShareLink = (shareId: string) => typeof window !== "undefined" ? `${window.location.origin}/${shareId}` : `/${shareId}`;

  const copyToClipboard = (text: string, id: string, type: "link" | "pw") => {
    navigator.clipboard.writeText(text);
    if (type === "link") { setCopiedLink(id); setTimeout(() => setCopiedLink(null), 2000); }
    else { setCopiedPw(id); setTimeout(() => setCopiedPw(null), 2000); }
  };

  const templateEmoji = (type: string) => type === "birthday" ? "🎂" : type === "valentine" ? "💝" : type === "holi" ? "🎨" : type === "eid" ? "🌙" : "🎁";
  const templateLabel = (type: string) => type === "birthday" ? "Birthday" : type === "valentine" ? "Valentine" : type === "holi" ? "Holi" : type === "eid" ? "Eid" : "Gift";
  const editorRoute = (type: string) => type === "birthday" ? "/birthday-gf" : type === "valentine" ? "/valentine-gf" : type === "holi" ? "/holi" : type === "eid" ? "/eid-mubarak" : "/templates";

  const cardStyle = { background: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: "1rem" };
  const sectionLabel = (text: string) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2 px-1 flex items-center gap-1.5" style={{ color: "var(--app-accent)" }}>{text}</p>
  );

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen md:pt-20" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-center px-4 mt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a20)" }}>
              <User size={32} style={{ color: "var(--app-accent)" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sign in to continue</h2>
            <p className="text-sm mb-8" style={{ color: "var(--app-text-muted)" }}>Log in to manage your profile, view your dashboard, and personalize templates.</p>
            <button onClick={() => setShowAuth(true)} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
              Sign In
            </button>
          </motion.div>
        </div>
        <AnimatePresence>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        </AnimatePresence>
      </div>
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
          <h1 className="text-xl md:text-2xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--app-text)" }}>{user?.name}</h1>
          <button onClick={() => { setNameInput(user?.name || ""); setEditingName(true); }}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "var(--app-surface)", color: "var(--app-text-faint)" }}>
            <Edit3 size={12} />
          </button>
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
        { icon: <Heart size={18} style={{ color: "#f43f5e" }} />, value: statsLoading ? "…" : stats?.favoritesCount ?? 0, label: "Favorites" },
        { icon: <Sparkles size={18} style={{ color: "var(--app-accent)" }} />, value: statsLoading ? "…" : stats?.generatedCount ?? 0, label: "Generated" },
        { icon: <Calendar size={18} style={{ color: "#60a5fa" }} />, value: statsLoading ? "…" : stats?.memberSince ? formatDate(stats.memberSince) : "Today", label: "Member", small: true },
      ].map(({ icon, value, label, small }) => (
        <div key={label} className="rounded-2xl p-4 text-center" style={cardStyle}>
          <div className="flex justify-center mb-2">{icon}</div>
          <p className={`font-black ${small ? "text-sm leading-tight" : "text-xl"}`} style={{ color: "var(--app-text)" }}>{value}</p>
          <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--app-text-faint)" }}>{label}</p>
        </div>
      ))}
    </motion.div>
  );

  const AppearanceBlock = mounted ? (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      {sectionLabel("Appearance")}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "light" as const, label: "Light", icon: Sun, color: "#fbbf24" },
            { value: "dark" as const, label: "Dark", icon: Moon, color: "#a78bfa" },
          ]).map(({ value, label, icon: Icon, color }) => {
            const isSelected = currentTheme === value;
            return (
              <motion.button key={value} onClick={() => handleThemeChange(value)} whileTap={{ scale: 0.95 }}
                className="relative rounded-2xl p-[1.5px] transition-all duration-300"
                style={{ background: isSelected ? color : "var(--app-border)" }}>
                <div className="rounded-[14px] py-3 px-2 flex flex-col items-center gap-1.5" style={{ background: "var(--app-bg)" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: isSelected ? `${color}20` : "var(--app-surface)" }}>
                    <Icon size={17} style={{ color: isSelected ? color : "var(--app-text-faint)" }} />
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: isSelected ? "var(--app-text)" : "var(--app-text-muted)" }}>{label}</p>
                </div>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: color }}>
                    <Check size={10} color="#000" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        {themeSaving && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--app-border-faint)" }}>
            <Loader2 size={12} className="animate-spin" style={{ color: "var(--app-accent)" }} />
            <span className="text-xs" style={{ color: "var(--app-text-faint)" }}>Saving preference…</span>
          </div>
        )}
        <p className="text-[11px] text-center mt-3" style={{ color: "var(--app-text-ultra-faint)" }}>
          Preference saved to your account
        </p>
      </div>
    </motion.div>
  ) : null;

  const AccountBlock = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      {sectionLabel("Account")}
      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        <Row icon={<Mail size={16} style={{ color: "#60a5fa" }} />} label="Email" value={user?.email} accent="blue" />
        <Row icon={<Shield size={16} style={{ color: "#a78bfa" }} />} label="Sign-in method" value={user?.provider} accent="violet" />
        {user?.provider === "local" && (
          <div>
            <button onClick={() => { setShowPasswordSection(!showPasswordSection); setPwMessage(null); setCurrentPw(""); setNewPw(""); }}
              className="app-row-hover w-full flex items-center gap-3 px-4 py-3.5 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
                <Lock size={16} style={{ color: "#f59e0b" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>Change Password</p>
                <p className="text-xs" style={{ color: "var(--app-text-faint)" }}>Update your account password</p>
              </div>
              <ChevronRight size={15} className={`transition-transform ${showPasswordSection ? "rotate-90" : ""}`} style={{ color: "var(--app-text-faint)" }} />
            </button>
            <AnimatePresence>
              {showPasswordSection && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3">
                    {[{ val: currentPw, set: setCurrentPw, show: showCurrentPw, toggle: setShowCurrentPw, placeholder: "Current password" },
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

  const CreationsBlock = myCreations.length > 0 ? (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
      {sectionLabel("My Creations")}
      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        {myCreations.map((page) => {
          const shareLink = getShareLink(page.shareId);
          const isExpanded = expandedCard === page._id;
          return (
            <div key={page._id} style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
              <button onClick={() => setExpandedCard(isExpanded ? null : page._id)}
                className="app-row-hover w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a08)" }}>
                  {page.templateType === "valentine" ? <Gift size={16} style={{ color: "#f43f5e" }} /> :
                   page.templateType === "holi" ? <Sparkles size={16} style={{ color: "#a78bfa" }} /> :
                   page.templateType === "eid" ? <span className="text-base">🌙</span> :
                   <Cake size={16} style={{ color: "var(--app-accent)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--app-text)" }}>{templateEmoji(page.templateType)} For {page.recipientName}</p>
                  <p className="text-[11px]" style={{ color: "var(--app-text-faint)" }}>
                    {templateLabel(page.templateType)} · {page.isPublished ? "Published" : "Draft"} · {formatShortDate(page.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {page.isPublished && (
                    <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg" style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                      <Eye size={10} /> {page.viewCount}
                    </div>
                  )}
                  <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} style={{ color: "var(--app-text-faint)" }} />
                </div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`${editorRoute(page.templateType)}?edit=${page._id}`); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                        <Edit3 size={14} /> Edit This Card
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        {[{ icon: <Eye size={12} style={{ color: "#60a5fa" }} />, val: page.viewCount, label: "Views" },
                          { icon: <Users size={12} style={{ color: "var(--app-accent)" }} />, val: page.installCount, label: "Installs" },
                          { icon: <BarChart3 size={12} style={{ color: "#a78bfa" }} />, val: page.isPublished ? "Live" : "Draft", label: "Status" }
                        ].map(({ icon, val, label }) => (
                          <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "var(--app-surface)" }}>
                            <div className="flex justify-center mb-1">{icon}</div>
                            <p className="text-sm font-black" style={{ color: "var(--app-text)" }}>{val}</p>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--app-text-faint)" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                      {page.isPublished && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--app-surface)" }}>
                            <Globe size={12} style={{ color: "var(--app-text-faint)" }} className="shrink-0" />
                            <p className="text-[11px] truncate flex-1 font-mono" style={{ color: "var(--app-text-muted)" }}>{shareLink}</p>
                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(shareLink, page._id, "link"); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "var(--app-accent-a08)", color: "var(--app-accent)" }}>
                              {copiedLink === page._id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); window.open(`/${page.shareId}`, "_blank"); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                              <ExternalLink size={12} />
                            </button>
                          </div>
                          {page.hasPassword && (
                            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}>
                              <KeyRound size={12} style={{ color: "#f59e0b" }} className="shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium mb-0.5" style={{ color: "#f59e0b" }}>Secret Password</p>
                                {page.passwordRaw ? (
                                  <p className="text-xs font-mono font-semibold truncate" style={{ color: "var(--app-text)" }}>{visiblePw.has(page._id) ? page.passwordRaw : "••••••••"}</p>
                                ) : (
                                  <p className="text-[10px] italic" style={{ color: "var(--app-text-faint)" }}>Protected (re-publish to track)</p>
                                )}
                              </div>
                              {page.passwordRaw && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={(e) => { e.stopPropagation(); setVisiblePw((p) => { const n = new Set(p); n.has(page._id) ? n.delete(page._id) : n.add(page._id); return n; }); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                    {visiblePw.has(page._id) ? <EyeOff size={12} /> : <Eye size={12} />}
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); copyToClipboard(page.passwordRaw, page._id + "-pw", "pw"); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                    {copiedPw === page._id + "-pw" ? <Check size={12} /> : <Copy size={12} />}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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
                            <button onClick={(e) => { e.stopPropagation(); setVisiblePw((p) => { const n = new Set(p); n.has(pwKey) ? n.delete(pwKey) : n.add(pwKey); return n; }); }}
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

  return (
    <div className="min-h-screen pb-8 md:pt-20" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Two-column on desktop, single column on mobile ── */}
      <div className="md:max-w-6xl md:mx-auto md:px-8 md:py-8 md:flex md:gap-8 md:items-start">

        {/* ── LEFT: Profile sidebar ── */}
        <div className="md:w-[360px] md:shrink-0 md:sticky md:top-24">

          {/* Avatar card */}
          <div className="px-5 pt-10 pb-5 md:p-0">
            <div className="rounded-3xl p-6" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
              {AvatarBlock}
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 pb-5 md:px-0 md:pb-0">
            {StatsBlock}
          </div>

          {/* Appearance */}
          <div className="px-5 pb-5 md:px-0 md:pb-0 md:mt-4">
            {AppearanceBlock}
          </div>

          {/* Account */}
          <div className="px-5 pb-5 md:px-0 md:pb-0 md:mt-4">
            {AccountBlock}
          </div>

          {/* Logout */}
          <div className="px-5 pb-5 md:px-0 md:pb-0 md:mt-4">
            {LogoutBlock}
          </div>
        </div>

        {/* ── RIGHT: Creations panel ── */}
        <div className="flex-1 min-w-0">

          {/* Desktop header for the right panel */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--app-text)" }}>
                My Dashboard
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
                {myCreations.length} creation{myCreations.length !== 1 ? "s" : ""}
                {receivedPages.length > 0 ? ` · ${receivedPages.length} received` : ""}
              </p>
            </div>
            <button onClick={() => router.push("/templates")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
              <Sparkles size={14} /> New Creation
            </button>
          </div>

          {/* Creations */}
          <div className="px-5 pb-5 md:px-0 md:pb-0">
            {CreationsBlock ?? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-8 text-center hidden md:flex flex-col items-center gap-3"
                style={cardStyle}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--app-accent-a08)" }}>
                  <Sparkles size={24} style={{ color: "var(--app-accent)" }} />
                </div>
                <p className="font-bold text-base" style={{ color: "var(--app-text)" }}>No creations yet</p>
                <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>Start building your first personalized gift page</p>
                <button onClick={() => router.push("/templates")}
                  className="mt-1 px-6 py-2.5 rounded-full text-sm font-bold"
                  style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                  Browse Templates
                </button>
              </motion.div>
            )}
          </div>

          {/* Received */}
          <div className="px-5 pb-5 md:px-0 md:pb-0 md:mt-4">
            {ReceivedBlock}
          </div>
        </div>

      </div>
    </div>
  );
}
