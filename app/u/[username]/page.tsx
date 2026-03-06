"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles, Eye, Globe } from "lucide-react";
import { API_URL, ROOT_DOMAIN, IS_NGROK } from "@/lib/config";

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  return h;
}

interface PublicPage {
  shareId: string;
  templateType: string;
  recipientName: string;
  viewCount: number;
  createdAt: string;
}

interface ProfileData {
  owner: { name: string; avatar: string; subdomain: string };
  pages: PublicPage[];
}

const TEMPLATE_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  birthday: { emoji: "🎂", label: "Birthday",   color: "#f43f5e", bg: "rgba(244,63,94,0.08)" },
  valentine: { emoji: "💝", label: "Valentine",  color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  holi:      { emoji: "🎨", label: "Holi",       color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  eid:       { emoji: "🌙", label: "Eid",        color: "#34d399", bg: "rgba(52,211,153,0.08)" },
  wedding:   { emoji: "💍", label: "Wedding",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
  reception: { emoji: "✨", label: "Reception",  color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    fetch(`${API_URL}/share/u/${username}`, { headers: apiHeaders() })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const getPageUrl = (shareId: string) => {
    if (ROOT_DOMAIN) return `https://${username}.${ROOT_DOMAIN}/${shareId}`;
    return `/${username}/${shareId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: "var(--app-accent-a08)" }}>
            <Sparkles size={28} style={{ color: "var(--app-accent)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--app-bg)" }}>
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--app-text)" }}>
            @{username} not found
          </h1>
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            This page doesn&apos;t exist or the user hasn&apos;t set up their profile yet.
          </p>
        </div>
      </div>
    );
  }

  const { owner, pages } = data;

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--app-bg)", fontFamily: "'Inter', sans-serif" }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, var(--app-accent-a12) 0%, transparent 70%)",
        }} />

        <div className="relative max-w-2xl mx-auto px-5 pt-16 pb-10 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="mb-5">
            {owner.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={owner.avatar} alt={owner.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{ boxShadow: "0 0 0 3px var(--app-bg), 0 0 0 5px var(--app-accent-a30), 0 0 40px var(--app-accent-a15)" }} />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black"
                style={{
                  background: "linear-gradient(135deg, var(--app-accent), #00ff88)",
                  boxShadow: "0 0 0 3px var(--app-bg), 0 0 0 5px var(--app-accent-a30), 0 0 40px var(--app-accent-a15)",
                  color: "#000",
                }}>
                {getInitials(owner.name)}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--app-text)" }}>
              {owner.name}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
              style={{ background: "var(--app-accent-a08)", border: "1px solid var(--app-accent-a20)" }}>
              <Globe size={11} style={{ color: "var(--app-accent)" }} />
              <span className="text-xs font-bold" style={{ color: "var(--app-accent)" }}>
                {owner.subdomain}.{ROOT_DOMAIN || "subhsandesh.in"}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
              {pages.length === 0 ? "No shared pages yet" : `${pages.length} personalized gift page${pages.length !== 1 ? "s" : ""}`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5">
        {pages.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-3xl p-10 text-center"
            style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
            <div className="text-5xl mb-4">🎁</div>
            <p className="font-bold" style={{ color: "var(--app-text)" }}>No pages shared yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
              {owner.name} hasn&apos;t published any gift pages yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, i) => {
              const meta = TEMPLATE_META[page.templateType] || { emoji: "🎁", label: "Gift", color: "var(--app-accent)", bg: "var(--app-accent-a08)" };
              const url = getPageUrl(page.shareId);
              return (
                <motion.a
                  key={page.shareId}
                  href={url}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", textDecoration: "none" }}>

                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: meta.bg, border: `1px solid ${meta.color}22` }}>
                    {meta.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--app-text)" }}>
                      {meta.label} for {page.recipientName}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px]" style={{ color: "var(--app-text-faint)" }}>
                        {formatDate(page.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--app-text-faint)" }}>
                        <Eye size={10} /> {page.viewCount}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1 font-mono truncate" style={{ color: "var(--app-accent)" }}>
                      {owner.subdomain}.{ROOT_DOMAIN || "subhsandesh.in"}/{page.shareId}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: meta.bg, color: meta.color }}>
                    <ExternalLink size={15} />
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center mt-10">
          <p className="text-[11px]" style={{ color: "var(--app-text-ultra-faint)" }}>
            Powered by{" "}
            <a href={`https://${ROOT_DOMAIN || "subhsandesh.in"}`}
              style={{ color: "var(--app-accent)", textDecoration: "none", fontWeight: 600 }}>
              {ROOT_DOMAIN || "subhsandesh.in"}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
