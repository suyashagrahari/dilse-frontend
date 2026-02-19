"use client";

import { motion } from "framer-motion";

interface FavoriteButtonProps {
  isFavorited: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

export default function FavoriteButton({
  isFavorited,
  onClick,
  size = 18,
  className = "",
}: FavoriteButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-90 border border-white/30 dark:border-white/10 shadow-sm ${className}`}
    >
      {isFavorited && (
        <motion.span
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-rose-400/30"
        />
      )}

      <motion.svg
        key={isFavorited ? "filled" : "outline"}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        fill={isFavorited ? "#f43f5e" : "none"}
        stroke={isFavorited ? "#f43f5e" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isFavorited ? "drop-shadow-sm" : "text-gray-500 dark:text-gray-400"}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </motion.svg>
    </button>
  );
}
