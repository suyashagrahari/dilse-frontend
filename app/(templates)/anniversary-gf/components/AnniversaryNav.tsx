"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Gamepad2,
  Images,
  Music,
  Sparkles,
  Pencil,
  Send,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { TABS, type TabId } from "./types";

const TAB_ICONS = {
  cover: Heart,
  games: Gamepad2,
  gallery: Images,
  music: Music,
} as const;

interface EditorNavProps {
  mode: "editor";
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  editActive?: boolean;
  onEdit: () => void;
  onPublish?: () => void;
  onShare?: () => void;
  onBack: () => void;
  shareLabel?: string;
  showPublish?: boolean;
  showShare?: boolean;
}

interface ViewerNavProps {
  mode: "viewer";
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  onEdit: () => void;
}

type NavProps = EditorNavProps | ViewerNavProps;

export default function AnniversaryNav(props: NavProps) {
  const { mode, tab, onTabChange, onEdit } = props;
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom pointer-events-none">
      <div className="mx-4 mb-4 md:mx-auto md:max-w-sm pointer-events-auto">
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[-1] bg-black/20 dark:bg-black/40 backdrop-blur-[2px]"
                onClick={() => setMoreOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-full right-4 mb-3 flex flex-col items-center gap-3 pb-1"
              >
                {(mode === "editor"
                  ? [
                      {
                        label: "Edit",
                        icon: Pencil,
                        gradient: "from-amber-400 to-orange-500",
                        action: () => {
                          setMoreOpen(false);
                          onEdit();
                        },
                      },
                      ...((props as EditorNavProps).showPublish
                        ? [
                            {
                              label: "Publish",
                              icon: Send,
                              gradient: "from-violet-500 to-purple-500",
                              action: () => {
                                setMoreOpen(false);
                                (props as EditorNavProps).onPublish?.();
                              },
                            },
                          ]
                        : (props as EditorNavProps).showShare
                        ? [
                            {
                              label: (props as EditorNavProps).shareLabel || "Share",
                              icon: Share2,
                              gradient: "from-violet-500 to-purple-500",
                              action: () => {
                                (props as EditorNavProps).onShare?.();
                              },
                            },
                          ]
                        : []),
                      {
                        label: "Back",
                        icon: ArrowLeft,
                        gradient: "from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-400",
                        action: () => (props as EditorNavProps).onBack(),
                      },
                    ]
                  : [
                      {
                        label: "Edit",
                        icon: Pencil,
                        gradient: "from-amber-400 to-orange-500",
                        action: () => {
                          setMoreOpen(false);
                          onEdit();
                        },
                      },
                    ]
                ).map((item, i, arr) => (
                  <motion.button
                    key={item.label}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 10 }}
                    transition={{
                      delay: (arr.length - 1 - i) * 0.06,
                      type: "spring",
                      stiffness: 380,
                      damping: 20,
                    }}
                    onClick={item.action}
                    className="flex flex-col items-center gap-1"
                    whileTap={{ scale: 0.85 }}
                  >
                    <div
                      className={`w-[52px] h-[52px] rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl shadow-black/20`}
                    >
                      <item.icon size={21} className="text-white" strokeWidth={2.2} />
                    </div>
                    <span className="text-[9px] font-bold text-foreground/60">{item.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="absolute -inset-1.5 bg-rose-500/[0.06] dark:bg-rose-500/[0.04] rounded-3xl blur-xl pointer-events-none" />

          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-rose-200/30 dark:border-rose-900/25 overflow-hidden">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-rose-400/25 dark:via-rose-400/15 to-transparent" />

            <div className="flex items-stretch px-1 py-1.5">
              {TABS.map(({ id, label }) => {
                const Icon = TAB_ICONS[id];
                const active = tab === id && !moreOpen;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onTabChange(id);
                      setMoreOpen(false);
                    }}
                    className="flex-1 relative"
                  >
                    <div
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-300 ${
                        active
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-muted-foreground/50 hover:text-muted-foreground/80"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="anni-nav-pill"
                          className="absolute inset-0.5 bg-rose-500/10 dark:bg-rose-500/[0.12] rounded-xl"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon size={19} strokeWidth={active ? 2.5 : 1.5} className="relative z-10" />
                      <span
                        className={`text-[9px] font-bold relative z-10 leading-none ${
                          active ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </button>
                );
              })}

              <button onClick={() => setMoreOpen((o) => !o)} className="flex-1 relative">
                <div
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-300 ${
                    moreOpen
                      ? "text-rose-500 dark:text-rose-400"
                      : "text-muted-foreground/50 hover:text-muted-foreground/80"
                  }`}
                >
                  {moreOpen && (
                    <motion.div
                      layoutId="anni-nav-pill"
                      className="absolute inset-0.5 bg-rose-500/10 dark:bg-rose-500/[0.12] rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={moreOpen ? { rotate: 45 } : { rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10"
                  >
                    <Sparkles size={19} strokeWidth={moreOpen ? 2.5 : 1.5} />
                  </motion.div>
                  <span
                    className={`text-[9px] font-bold relative z-10 leading-none ${
                      moreOpen ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    More
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
