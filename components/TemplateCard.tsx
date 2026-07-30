"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { TemplateListItem } from "@/types/template-config";

interface TemplateCardProps {
  template: TemplateListItem;
  isFav: boolean;
  index: number;
  onFavorite: (e: React.MouseEvent, slug: string) => void;
}

/** Memoized — only re-renders when isFav, index, or template identity changes */
const TemplateCard = memo(function TemplateCard({
  template,
  isFav,
  index,
  onFavorite,
}: TemplateCardProps) {
  return (
    <motion.div
      layout
      key={template.slug}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* onClick only records the click; navigation is still handled entirely by
          Link. The favourite button's handler calls stopPropagation (see
          handleFavorite in app/(app)/templates/page.tsx), so favouriting a card
          does not reach this and is not miscounted as an open. */}
      <Link
        href={`/${template.slug}`}
        className="block group"
        onClick={() =>
          track(EVENTS.TEMPLATE_CARD_CLICKED, {
            template: template.slug,
            position: index,
            is_premium: Boolean(template.isPremium),
          })
        }
      >
        <motion.div
          className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300"
          style={{ border: "1px solid rgba(61,12,17,0.15)" }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 60px rgba(61,12,17,0.2), 0 0 0 1.5px rgba(201,168,76,0.5)" }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background */}
          <div className="absolute inset-0" style={{ background: "var(--app-card-img-bg)" }} />

          {/* Cover image */}
          {template.coverImage && (
            <>
              <div className="absolute inset-0">
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
                  loading={index < 4 ? "eager" : "lazy"}
                />
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.82))",
                }}
              />
            </>
          )}

          {/* Accent bottom bar on hover */}
          <div
            className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to right, var(--app-accent), transparent)" }}
          />

          {/* Premium crown badge — top-left ribbon */}
          {template.isPremium && (
            <div className="absolute top-0 left-0 z-20">
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-br-xl rounded-tl-2xl text-[9px] font-black uppercase tracking-widest"
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  color: "#000",
                  boxShadow: "0 2px 10px rgba(255,165,0,0.45)",
                }}
              >
                <Crown size={8} fill="currentColor" />
                Premium
              </div>
            </div>
          )}

          {/* Card content */}
          <div className="relative h-full p-3 md:p-4 flex flex-col justify-between z-10">
            {/* Top row: emoji icon + favorite button */}
            <div className="flex items-start justify-between">
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xl md:text-2xl">{template.emoji}</span>
              </motion.div>
              <FavoriteButton
                isFavorited={isFav}
                onClick={(e) => onFavorite(e, template.slug)}
              />
            </div>

            {/* Bottom row: type + title + description + open arrow */}
            <div>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2"
                style={{
                  background: "rgba(201,168,76,0.18)",
                  color: "#c9a84c",
                  backdropFilter: "blur(4px)",
                }}
              >
                {template.type}
              </span>
              <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {template.title}
              </h3>
              <p
                className="text-[11px] md:text-xs leading-relaxed line-clamp-2"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {template.description}
              </p>
              <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#c9a84c" }}
                >
                  Open
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{ color: "#c9a84c" }}
                >
                  <path
                    d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
});

export default TemplateCard;
