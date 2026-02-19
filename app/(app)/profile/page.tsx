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
  Share2,
  Cake,
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

  const [myPages, setMyPages] = useState<{ _id: string; recipientName: string; shareId: string; isPublished: boolean; updatedAt: string; type: "birthday" | "valentine" }[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!accessToken) return;
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
  }, [accessToken]);

  const fetchMyPages = useCallback(async () => {
    if (!accessToken) return;
    try {
      const authHeaders = { Authorization: `Bearer ${accessToken}` };
      const [bdayRes, valRes] = await Promise.all([
        fetch(`${API_URL}/birthday-pages/my`, { headers: authHeaders }),
        fetch(`${API_URL}/valentine-pages/my`, { headers: authHeaders }),
      ]);
      const [bdayData, valData] = await Promise.all([bdayRes.json(), valRes.json()]);
      const all = [
        ...((bdayData.success ? bdayData.data : []) as Array<Record<string, unknown>>).map((p) => ({ ...p, type: "birthday" as const })),
        ...((valData.success ? valData.data : []) as Array<Record<string, unknown>>).map((p) => ({ ...p, type: "valentine" as const })),
      ].sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime()) as typeof myPages;
      setMyPages(all);
    } catch {
      // silent
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      fetchMyPages();
    }
  }, [isAuthenticated, fetchDashboard, fetchMyPages]);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            {/* Avatar */}
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

            {/* Name (editable) */}
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
              {/* Email */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Sign-in method</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.provider}</p>
                </div>
              </div>

              {/* Change Password (only for local auth) */}
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
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
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
                      desc: "Bright",
                    },
                    {
                      value: "dark" as const,
                      label: "Dark",
                      icon: Moon,
                      gradient: "from-violet-500 to-indigo-500",
                      iconBg: "bg-violet-500/10",
                      iconColor: "text-violet-500",
                      desc: "Night",
                    },
                    {
                      value: "system" as const,
                      label: "Auto",
                      icon: Monitor,
                      gradient: "from-sky-400 to-blue-500",
                      iconBg: "bg-sky-500/10",
                      iconColor: "text-sky-500",
                      desc: "Device",
                    },
                  ]).map(({ value, label, icon: Icon, gradient, iconBg, iconColor, desc }) => {
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

                        {/* Check badge */}
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

                {/* Saving indicator */}
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

          {/* My Creations */}
          {myPages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                My Creations
              </h3>
              <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden divide-y divide-border/50">
                {myPages.map((page) => {
                  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${page.shareId}`;
                  const isVal = page.type === "valentine";
                  return (
                    <div key={page._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isVal ? "bg-red-500/10" : "bg-rose-500/10"}`}>
                        {isVal ? <Heart size={16} className="text-red-500" /> : <Cake size={16} className="text-rose-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isVal ? "💝" : "🎂"} For {page.recipientName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isVal ? "Valentine" : "Birthday"} · {page.isPublished ? "Published" : "Draft"} · {new Date(page.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {page.isPublished && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shareLink);
                              setCopiedLink(page._id);
                              setTimeout(() => setCopiedLink(null), 2000);
                            }}
                            className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors"
                          >
                            {copiedLink === page._id ? <Check size={13} /> : <Share2 size={13} />}
                          </button>
                          <button
                            onClick={() => window.open(`/${page.shareId}`, "_blank")}
                            className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      )}
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
              className="w-full bg-card rounded-2xl shadow-card border border-border/50 flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors group"
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
