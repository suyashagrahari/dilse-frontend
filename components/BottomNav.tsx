"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Home, LayoutGrid, Heart, User, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/templates", icon: LayoutGrid, label: "Templates" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const activeItem = navItems.find(({ href }) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)
  );
  const ActiveIcon = activeItem?.icon || Home;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] safe-bottom pointer-events-none">
      <div className="relative mx-3 mb-3 md:mx-auto md:max-w-md pointer-events-auto">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="nav-open"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, x: -200, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <LayoutGroup id="bottom-nav">
                <div className="glass-strong rounded-2xl shadow-elevated px-2 py-1.5 relative">
                  {/* Close button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted/90 dark:bg-muted border border-border/50 dark:border-white/10 flex items-center justify-center shadow-sm z-20 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-muted-foreground">
                      <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <div className="flex items-center justify-around relative">
                    {navItems.map(({ href, icon: Icon, label }) => {
                      const isActive =
                        href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(href);

                      return (
                        <Link
                          key={href}
                          href={href}
                          className="relative flex-1"
                        >
                          <motion.div
                            className={`flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl relative transition-colors duration-300 ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="bottom-nav-pill"
                                className="absolute inset-0 bg-primary/10 dark:bg-primary/15 rounded-xl"
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                }}
                              />
                            )}
                            <motion.div
                              animate={
                                isActive
                                  ? { y: -2, scale: 1.1 }
                                  : { y: 0, scale: 1 }
                              }
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                              }}
                              className="relative z-10"
                            >
                              <Icon
                                size={21}
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                            </motion.div>
                            <motion.span
                              className="text-[10px] font-semibold relative z-10"
                              animate={
                                isActive
                                  ? { opacity: 1 }
                                  : { opacity: 0.7 }
                              }
                            >
                              {label}
                            </motion.span>
                            {isActive && (
                              <motion.div
                                layoutId="bottom-nav-dot"
                                className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary"
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                }}
                              />
                            )}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </LayoutGroup>
            </motion.div>
          ) : (
            <motion.button
              key="nav-closed"
              initial={{ scale: 0, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              onClick={() => setOpen(true)}
              className="absolute bottom-0 left-0 glass-strong rounded-2xl shadow-elevated px-3 py-3 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform border border-border/30 dark:border-white/[0.08]"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                <ActiveIcon size={18} className="text-primary" />
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
