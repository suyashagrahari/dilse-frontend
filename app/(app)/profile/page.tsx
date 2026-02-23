"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Heart,
  Sparkles,
  Edit3,
  Check,
  X,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  Shield,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  Cake,
  Gift,
  Users,
  BarChart3,
  Copy,
  KeyRound,
  Inbox,
  Globe,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  updateProfile,
  changePassword,
  logoutUser,
  updateTheme,
} from "@/store/authSlice";
import { clearFavorites } from "@/store/favoritesSlice";
import AuthModal from "@/components/AuthModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DashboardStats {
  favoritesCount: number;
  generatedCount: number;
  memberSince: string;
}

interface MyCreation {
  _id: string;
  shareId: string;
  templateType: string;
  recipientName: string;
  senderName: string;
  isPublished: boolean;
  hasPassword: boolean;
  passwordRaw: string;
  viewCount: number;
  installCount: number;
  updatedAt: string;
  createdAt: string;
}

interface ReceivedPage {
  shareId: string;
  templateType: string;
  recipientName: string;
  senderName: string;
  senderAvatar: string | null;
  hasPassword: boolean;
  passwordVerified: boolean;
  passwordRaw?: string;
  viewCount: number;
  createdAt: string;
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
      try {
        await dispatch(updateTheme(newTheme)).unwrap();
      } catch {
        // silent
      } finally {
        setThemeSaving(false);
      }
    }
  };

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken]
  );

  const fetchDashboard = useCallback(async () => {
    if (!accessToken) return;
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/dashboard`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.data?.stats) {
        setStats(data.data.stats);
      }
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, [accessToken, authHeaders]);

  const fetchMyCreations = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/share/me/creations`, {
        headers: authHeaders(),
      });
      const result = await res.json();
      if (result.success) {
        setMyCreations(result.data);
      }
    } catch {
      // silent
    }
  }, [accessToken, authHeaders]);

  const fetchReceivedPages = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/share/me/received`, {
        headers: authHeaders(),
      });
      const result = await res.json();
      if (result.success) {
        setReceivedPages(result.data);
      }
    } catch {
      // silent
    }
  }, [accessToken, authHeaders]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      fetchMyCreations();
      fetchReceivedPages();
    }
  }, [isAuthenticated, fetchDashboard, fetchMyCreations, fetchReceivedPages]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setNameLoading(true);
    try {
      await dispatch(updateProfile({ name: nameInput.trim() })).unwrap();
      setEditingName(false);
    } catch {
      // handled by Redux
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return;
    setPwLoading(true);
    setPwMessage(null);
    try {
      await dispatch(changePassword({ currentPassword: currentPw, newPassword: newPw })).unwrap();
      setPwMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => setShowPasswordSection(false), 1500);
    } catch (err) {
      setPwMessage({ type: "error", text: (err as string) || "Failed to update password" });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await dispatch(logoutUser());
    dispatch(clearFavorites());
    setLogoutLoading(false);
    router.push("/");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getShareLink = (shareId: string) => {
    return typeof window !== "undefined" ? `${window.location.origin}/${shareId}` : `/${shareId}`;
  };

  const copyToClipboard = (text: string, id: string, type: "link" | "pw") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2000);
    } else {
      setCopiedPw(id);
      setTimeout(() => setCopiedPw(null), 2000);
    }
  };

  const templateEmoji = (type: string) => type === "birthday" ? "🎂" : type === "valentine" ? "💝" : type === "holi" ? "🎨" : "🎁";
  const templateLabel = (type: string) => type === "birthday" ? "Birthday" : type === "valentine" ? "Valentine" : type === "holi" ? "Holi" : "Gift";
  const templateColor = (type: string) => type === "birthday" ? "rose" : type === "valentine" ? "red" : "violet";
  const editorRoute = (type: string) => type === "birthday" ? "/birthday-gf" : type === "valentine" ? "/valentine-gf" : type === "holi" ? "/holi" : "/templates";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="px-4 pt-6 pb-4 md:pt-8">
          <div className="container">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-bold mb-2"
            >
              Your <span className="text-gradient">Profile</span>
            </motion.h1>
          </div>
        </div>
        <div className="flex items-center justify-center px-4 mt-16 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <User size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Log in to manage your profile, view your dashboard, and personalize templates.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex gradient-hero text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-soft"
            >
              Sign In
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showAuth && (
            <AuthModal
              onClose={() => setShowAuth(false)}
              onSuccess={() => {
                setShowAuth(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      {/* Header with avatar */}
      <div className="px-4 pt-6 pb-6 md:pt-8">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center ring-4 ring-primary/20">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(user?.name || "U")}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-card flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            </div>

            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="text-xl font-bold text-center bg-muted/60 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={nameLoading}
                  className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  {nameLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{user?.name}</h1>
                <button
                  onClick={() => {
                    setNameInput(user?.name || "");
                    setEditingName(true);
                  }}
                  className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}

            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Mail size={13} />
              {user?.email}
            </p>
            {user?.provider === "google" && (
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pb-5">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-card rounded-2xl p-4 text-center shadow-card border border-border/50">
              <Heart size={20} className="mx-auto mb-2 text-rose-500" />
              <p className="text-xl font-bold">
                {statsLoading ? "..." : stats?.favoritesCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Favorites</p>
            </div>
            <div className="bg-card rounded-2xl p-4 text-center shadow-card border border-border/50">
              <Sparkles size={20} className="mx-auto mb-2 text-violet-500" />
              <p className="text-xl font-bold">
                {statsLoading ? "..." : stats?.generatedCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Generated</p>
            </div>
            <div className="bg-card rounded-2xl p-4 text-center shadow-card border border-border/50">
              <Calendar size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-bold leading-tight">
                {statsLoading
                  ? "..."
                  : stats?.memberSince
                  ? formatDate(stats.memberSince)
                  : "Today"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Member</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 pb-6">
        <div className="container max-w-lg space-y-3">
          {/* ─── SHARED WITH YOU ─── */}
          {receivedPages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
                <Inbox size={12} />
                Shared With You
              </h3>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden divide-y divide-border/50">
                {receivedPages.map((page) => {
                  const link = getShareLink(page.shareId);
                  const color = templateColor(page.templateType);
                  const isOpen = expandedReceived === page.shareId;
                  const pwKey = `recv-${page.shareId}`;

                  return (
                    <div key={page.shareId}>
                      <button
                        onClick={() => setExpandedReceived(isOpen ? null : page.shareId)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors text-left"
                      >
                        {page.senderAvatar ? (
                          <img src={page.senderAvatar} alt={page.senderName} className="w-9 h-9 rounded-full object-cover ring-2 ring-border/50 shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br shrink-0 ${color === "rose" ? "from-rose-400 to-pink-500" : color === "red" ? "from-red-400 to-rose-500" : "from-violet-400 to-purple-500"} flex items-center justify-center`}>
                            <span className="text-[10px] font-bold text-white">{getInitials(page.senderName)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {templateEmoji(page.templateType)} From {page.senderName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {templateLabel(page.templateType)} for {page.recipientName} · {formatShortDate(page.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {page.hasPassword && (
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${page.passwordVerified ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                              {page.passwordVerified ? <Check size={11} className="text-green-500" /> : <Lock size={11} className="text-amber-500" />}
                            </div>
                          )}
                          <ChevronRight
                            size={14}
                            className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-2.5">
                              <div className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2.5">
                                <Globe size={13} className="text-muted-foreground shrink-0" />
                                <p className="text-[11px] text-muted-foreground truncate flex-1 font-mono">{link}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(link, page.shareId + "-recv", "link");
                                  }}
                                  className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                >
                                  {copiedLink === page.shareId + "-recv" ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/${page.shareId}`, "_blank");
                                  }}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color === "rose" ? "bg-rose-500/10 text-rose-500" : color === "red" ? "bg-red-500/10 text-red-500" : "bg-violet-500/10 text-violet-500"}`}
                                >
                                  <ExternalLink size={12} />
                                </button>
                              </div>

                              {page.hasPassword && page.passwordVerified && page.passwordRaw && (
                                <div className="flex items-center gap-2 bg-green-500/5 dark:bg-green-500/10 border border-green-200/50 dark:border-green-800/30 rounded-xl px-3 py-2.5">
                                  <KeyRound size={13} className="text-green-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-0.5">Password</p>
                                    <p className="text-xs font-mono font-semibold truncate">
                                      {visiblePw.has(pwKey) ? page.passwordRaw : "••••••••"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVisiblePw((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(pwKey)) next.delete(pwKey);
                                          else next.add(pwKey);
                                          return next;
                                        });
                                      }}
                                      className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors"
                                    >
                                      {visiblePw.has(pwKey) ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(page.passwordRaw!, page.shareId + "-rpw", "pw");
                                      }}
                                      className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors"
                                    >
                                      {copiedPw === page.shareId + "-rpw" ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {page.hasPassword && !page.passwordVerified && (
                                <div className="flex items-center gap-2 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl px-3 py-2.5">
                                  <Lock size={13} className="text-amber-500 shrink-0" />
                                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                    Enter the correct password on the page to unlock
                                  </p>
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
          )}

          {/* Account section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Account
            </h3>
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden divide-y divide-border/50">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Sign-in method</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.provider}</p>
                </div>
              </div>

              {user?.provider === "local" && (
                <div>
                  <button
                    onClick={() => {
                      setShowPasswordSection(!showPasswordSection);
                      setPwMessage(null);
                      setCurrentPw("");
                      setNewPw("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Lock size={16} className="text-amber-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-muted-foreground">Update your password</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-muted-foreground transition-transform ${showPasswordSection ? "rotate-90" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showPasswordSection && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          <div className="relative">
                            <input
                              type={showCurrentPw ? "text" : "password"}
                              value={currentPw}
                              onChange={(e) => setCurrentPw(e.target.value)}
                              placeholder="Current password"
                              className="w-full px-4 pr-10 py-3 rounded-xl bg-muted/60 border-2 border-transparent focus:border-violet-300 text-sm focus:outline-none transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                            >
                              {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showNewPw ? "text" : "password"}
                              value={newPw}
                              onChange={(e) => setNewPw(e.target.value)}
                              placeholder="New password (min 6 chars)"
                              className="w-full px-4 pr-10 py-3 rounded-xl bg-muted/60 border-2 border-transparent focus:border-violet-300 text-sm focus:outline-none transition-all"
                              onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                            >
                              {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>

                          {pwMessage && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`text-xs px-3 py-2 rounded-lg ${
                                pwMessage.type === "success"
                                  ? "bg-green-50 text-green-600 dark:bg-green-500/10"
                                  : "bg-red-50 text-red-600 dark:bg-red-500/10"
                              }`}
                            >
                              {pwMessage.text}
                            </motion.p>
                          )}

                          <button
                            onClick={handleChangePassword}
                            disabled={pwLoading || !currentPw || !newPw || newPw.length < 6}
                            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                          >
                            {pwLoading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Appearance */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                Appearance
              </h3>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
                <div className="grid grid-cols-3 gap-3">
                  {([
                    {
                      value: "light" as const,
                      label: "Light",
                      icon: Sun,
                      gradient: "from-amber-400 to-orange-400",
                      iconBg: "bg-amber-500/10",
                      iconColor: "text-amber-500",
                    },
                    {
                      value: "dark" as const,
                      label: "Dark",
                      icon: Moon,
                      gradient: "from-violet-500 to-indigo-500",
                      iconBg: "bg-violet-500/10",
                      iconColor: "text-violet-500",
                    },
                    {
                      value: "system" as const,
                      label: "Auto",
                      icon: Monitor,
                      gradient: "from-sky-400 to-blue-500",
                      iconBg: "bg-sky-500/10",
                      iconColor: "text-sky-500",
                    },
                  ]).map(({ value, label, icon: Icon, gradient, iconBg, iconColor }) => {
                    const isSelected = currentTheme === value;
                    return (
                      <motion.button
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        className="relative group"
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className={`relative rounded-2xl p-[2px] transition-all duration-300 ${
                            isSelected
                              ? `bg-gradient-to-br ${gradient} shadow-lg`
                              : "bg-border/40 group-hover:bg-border"
                          }`}
                        >
                          <div className="bg-card rounded-[14px] py-3 px-2 flex flex-col items-center gap-1.5">
                            <motion.div
                              className={`w-9 h-9 rounded-lg ${
                                isSelected
                                  ? `bg-gradient-to-br ${gradient}`
                                  : iconBg
                              } flex items-center justify-center`}
                              animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <Icon
                                size={17}
                                strokeWidth={2}
                                className={isSelected ? "text-white" : iconColor}
                              />
                            </motion.div>
                            <p
                              className={`text-[11px] font-semibold leading-tight ${
                                isSelected ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {label}
                            </p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md z-10`}
                            >
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {themeSaving && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-border/50"
                    >
                      <Loader2 size={12} className="animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Saving preference...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
                  {isAuthenticated
                    ? "Your theme preference is saved to your account"
                    : "Sign in to save your theme preference"}
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── MY CREATIONS ─── */}
          {myCreations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
                <Gift size={12} />
                My Creations
              </h3>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden divide-y divide-border/50">
                {myCreations.map((page) => {
                  const shareLink = getShareLink(page.shareId);
                  const isExpanded = expandedCard === page._id;
                  const color = templateColor(page.templateType);

                  return (
                    <div key={page._id}>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : page._id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors text-left"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          color === "rose" ? "bg-rose-500/10" : color === "red" ? "bg-red-500/10" : "bg-violet-500/10"
                        }`}>
                          {page.templateType === "valentine" ? (
                            <Heart size={16} className="text-red-500" />
                          ) : page.templateType === "holi" ? (
                            <Sparkles size={16} className="text-violet-500" />
                          ) : (
                            <Cake size={16} className="text-rose-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {templateEmoji(page.templateType)} For {page.recipientName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {templateLabel(page.templateType)} · {page.isPublished ? "Published" : "Draft"} · {formatShortDate(page.updatedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {page.isPublished && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-lg">
                              <Eye size={10} />
                              {page.viewCount}
                            </div>
                          )}
                          <ChevronRight
                            size={14}
                            className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3">
                              {/* Edit button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`${editorRoute(page.templateType)}?edit=${page._id}`);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90"
                                style={{
                                  background: "linear-gradient(135deg, #E91E63, #FF5722)",
                                  color: "#fff",
                                  boxShadow: "0 4px 14px rgba(233,30,99,0.25)",
                                }}
                              >
                                <Edit3 size={14} />
                                Edit This Card
                              </button>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-muted/30 rounded-xl p-2.5 text-center">
                                  <Eye size={13} className="mx-auto mb-1 text-blue-500" />
                                  <p className="text-sm font-bold">{page.viewCount}</p>
                                  <p className="text-[9px] text-muted-foreground">Views</p>
                                </div>
                                <div className="bg-muted/30 rounded-xl p-2.5 text-center">
                                  <Users size={13} className="mx-auto mb-1 text-green-500" />
                                  <p className="text-sm font-bold">{page.installCount}</p>
                                  <p className="text-[9px] text-muted-foreground">Installs</p>
                                </div>
                                <div className="bg-muted/30 rounded-xl p-2.5 text-center">
                                  <BarChart3 size={13} className="mx-auto mb-1 text-violet-500" />
                                  <p className="text-sm font-bold">{page.isPublished ? "Live" : "Draft"}</p>
                                  <p className="text-[9px] text-muted-foreground">Status</p>
                                </div>
                              </div>

                              {page.isPublished && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2.5">
                                    <Globe size={13} className="text-muted-foreground shrink-0" />
                                    <p className="text-[11px] text-muted-foreground truncate flex-1 font-mono">{shareLink}</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(shareLink, page._id, "link");
                                      }}
                                      className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors shrink-0"
                                    >
                                      {copiedLink === page._id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/${page.shareId}`, "_blank");
                                      }}
                                      className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                    >
                                      <ExternalLink size={12} />
                                    </button>
                                  </div>

                                  {page.hasPassword && (
                                    <div className="flex items-center gap-2 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl px-3 py-2.5">
                                      <KeyRound size={13} className="text-amber-500 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mb-0.5">Secret Password</p>
                                        {page.passwordRaw ? (
                                          <p className="text-xs font-mono font-semibold truncate">
                                            {visiblePw.has(page._id) ? page.passwordRaw : "••••••••"}
                                          </p>
                                        ) : (
                                          <p className="text-[10px] text-muted-foreground italic">Password protected (re-publish to track)</p>
                                        )}
                                      </div>
                                      {page.passwordRaw && (
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setVisiblePw((prev) => {
                                                const next = new Set(prev);
                                                if (next.has(page._id)) next.delete(page._id);
                                                else next.add(page._id);
                                                return next;
                                              });
                                            }}
                                            className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors"
                                          >
                                            {visiblePw.has(page._id) ? <EyeOff size={12} /> : <Eye size={12} />}
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              copyToClipboard(page.passwordRaw, page._id + "-pw", "pw");
                                            }}
                                            className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors"
                                          >
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
          )}

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full bg-card rounded-2xl shadow-card border border-border/50 flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                {logoutLoading ? (
                  <Loader2 size={16} className="text-red-500 animate-spin" />
                ) : (
                  <LogOut size={16} className="text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium text-red-500">
                {logoutLoading ? "Logging out..." : "Log Out"}
              </p>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
