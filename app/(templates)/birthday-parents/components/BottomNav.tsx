"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Edit3, Heart, Share2, Check, Wand2 } from "lucide-react";
import { config } from "../config";

const ACTION_ITEMS = [
  { id: "home", icon: Home, bg: "bg-gradient-to-br from-blue-500 to-cyan-400" },
  { id: "favorite", icon: Heart, bg: "bg-gradient-to-br from-pink-500 to-rose-400", activeBg: "bg-gradient-to-br from-red-500 to-pink-500" },
  { id: "share", icon: Share2, bg: "bg-gradient-to-br from-violet-500 to-purple-400" },
  { id: "edit", icon: Edit3, bg: "bg-gradient-to-br from-amber-500 to-orange-400" },
];
const ITEM_GAP = 60;

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onAction: (actionId: string) => void;
  isFavorited: boolean;
  copied: boolean;
}

export default function BottomNav({ activeTab, onTabChange, menuOpen, onMenuToggle, onAction, isFavorited, copied }: Props) {
  return (
    <nav className="bg-card/95 backdrop-blur-xl border-t border-border safe-bottom z-50 relative">
      <div className="flex items-center justify-around max-w-md mx-auto py-2 px-4">
        {config.tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${isActive ? `${config.navActiveColor} ${config.navActiveBg}` : "text-muted-foreground"}`}>
              <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
            </button>
          );
        })}
        <button onClick={onMenuToggle} className={`relative z-10 flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${menuOpen ? `${config.navActiveColor} ${config.navActiveBg}` : "text-muted-foreground"}`}>
          <AnimatePresence>
            {menuOpen && ACTION_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isShareCopied = item.id === "share" && copied;
              const isActive = item.id === "favorite" && isFavorited;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ type: "spring", stiffness: 420, damping: 22, delay: i * 0.05 }} className="absolute left-1/2" style={{ bottom: ITEM_GAP * (i + 1) + 8, transform: "translateX(-50%)" }}>
                  <div role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); onAction(item.id); }} onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onAction(item.id); } }} className={`w-11 h-11 rounded-full shadow-elevated flex items-center justify-center text-white cursor-pointer ${isShareCopied ? "bg-gradient-to-br from-green-500 to-emerald-400" : isActive ? item.activeBg || item.bg : item.bg}`}>
                    {isShareCopied ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>{menuOpen ? <X size={21} /> : <Wand2 size={21} />}</motion.div>
          <span className={`text-[10px] ${menuOpen ? "font-semibold" : "font-medium"}`}>More</span>
        </button>
      </div>
    </nav>
  );
}
