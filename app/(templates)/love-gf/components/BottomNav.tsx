"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Image, Music, Gamepad2, Heart, MoreHorizontal, Pencil, Send, Share2, ArrowLeft } from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home,
  gallery: Image,
  music: Music,
  games: Gamepad2,
  notes: Heart,
};

interface Props {
  mode: "editor" | "viewer";
  tab: TabId;
  onTabChange: (id: TabId) => void;
  onEdit: () => void;
  showPublish: boolean;
  showShare: boolean;
  shareLabel: string;
  onPublish: () => void;
  onShare: () => void;
  onBack: () => void;
}

export default function BottomNav({
  mode, tab, onTabChange, onEdit,
  showPublish, showShare, shareLabel, onPublish, onShare, onBack,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  const editorItems = [
    { icon: Pencil, label: "Edit", gradient: "from-violet-500 to-purple-600", action: () => { setMoreOpen(false); onEdit(); } },
    ...(showPublish ? [{ icon: Send, label: "Publish", gradient: "from-pink-500 to-rose-500", action: () => { setMoreOpen(false); onPublish(); } }] : []),
    ...(showShare ? [{ icon: Share2, label: shareLabel, gradient: "from-blue-500 to-cyan-500", action: () => { setMoreOpen(false); onShare(); } }] : []),
    { icon: ArrowLeft, label: "Back", gradient: "from-gray-500 to-gray-600", action: () => { setMoreOpen(false); onBack(); } },
  ];

  const viewerItems = [
    { icon: Pencil, label: "Edit", gradient: "from-violet-500 to-purple-600", action: () => { setMoreOpen(false); onEdit(); } },
  ];

  const moreItems = mode === "editor" ? editorItems : viewerItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="mx-3 mb-3 md:mx-auto md:max-w-md pointer-events-auto">
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10"
              />
              <div className="flex justify-center gap-4 mb-3">
                {moreItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={item.action}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl`}>
                      <item.icon size={19} className="text-white" strokeWidth={2} />
                    </div>
                    <span className="text-[9px] font-semibold text-foreground/50">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-border/40 overflow-hidden">
            <div className="flex items-stretch px-1.5 py-1">
              {TABS.map(({ id, label }) => {
                const Icon = TAB_ICONS[id];
                const active = tab === id && !moreOpen;
                return (
                  <button key={id} onClick={() => { onTabChange(id); setMoreOpen(false); }} className="flex-1 relative">
                    <div className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${
                      active ? "text-pink-500 dark:text-pink-400" : "text-muted-foreground/40"
                    }`}>
                      {active && (
                        <motion.div
                          layoutId="love-nav-bg"
                          className="absolute inset-1 bg-pink-50 dark:bg-pink-500/10 rounded-lg"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.5} className="relative z-10" />
                      <span className={`text-[9px] font-semibold relative z-10 ${active ? "" : "opacity-60"}`}>{label}</span>
                    </div>
                  </button>
                );
              })}
              <button onClick={() => setMoreOpen((o) => !o)} className="flex-1 relative">
                <div className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${
                  moreOpen ? "text-pink-500 dark:text-pink-400" : "text-muted-foreground/40"
                }`}>
                  {moreOpen && (
                    <motion.div layoutId="love-nav-bg" className="absolute inset-1 bg-pink-50 dark:bg-pink-500/10 rounded-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <MoreHorizontal size={18} strokeWidth={moreOpen ? 2.2 : 1.5} className="relative z-10" />
                  <span className={`text-[9px] font-semibold relative z-10 ${moreOpen ? "" : "opacity-60"}`}>More</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
