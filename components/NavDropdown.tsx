"use client";

// A desktop navbar dropdown: opens on hover (with a short close delay so the
// pointer can travel from trigger to panel) and on click/Enter for touch and
// keyboard. Escape and outside clicks close it; choosing an item closes it.

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface NavDropdownItem {
  href: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
}

export default function NavDropdown({
  label,
  trigger,
  items,
  active,
  align = "center",
  triggerStyle,
  header,
  ariaLabel,
}: {
  label?: string;
  /** Custom trigger content (e.g. an avatar). Replaces label + chevron. */
  trigger?: ReactNode;
  items: NavDropdownItem[];
  active?: boolean;
  align?: "center" | "right";
  triggerStyle?: CSSProperties;
  header?: ReactNode;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          ...triggerStyle,
        }}
      >
        {trigger ?? (
          <>
            {label}
            <ChevronDown
              size={12}
              style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none", opacity: active ? 1 : 0.7 }}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 14px)",
              ...(align === "right" ? { right: 0 } : { left: "50%", x: "-50%" }),
              minWidth: 250,
              padding: 6,
              borderRadius: 18,
              background: "rgba(255,253,251,0.98)",
              border: "1px solid rgba(61,12,17,0.12)",
              boxShadow: "0 18px 44px -14px rgba(42,10,14,0.35)",
              backdropFilter: "blur(16px)",
              zIndex: 60,
            }}
          >
            {/* Hover bridge across the gap between trigger and panel. */}
            <span aria-hidden style={{ position: "absolute", top: -16, left: 0, right: 0, height: 16 }} />
            {header}
            {items.map((it) => (
              <Link
                key={it.href + it.label}
                href={it.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="navdd-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "#2a0a0e",
                }}
              >
                {it.icon && (
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(201,168,76,0.14)",
                      color: "#8b5a2b",
                    }}
                  >
                    {it.icon}
                  </span>
                )}
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700 }}>
                    {it.label}
                    {it.badge && (
                      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".08em", padding: "2px 6px", borderRadius: 99, background: "#3d0c11", color: "#f2cf74" }}>
                        {it.badge}
                      </span>
                    )}
                  </span>
                  {it.description && <span style={{ fontSize: 11.5, color: "#9a7070", marginTop: 1 }}>{it.description}</span>}
                </span>
              </Link>
            ))}
            <style>{`.navdd-item:hover, .navdd-item:focus-visible { background: rgba(201,168,76,0.12); outline: none; }`}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
