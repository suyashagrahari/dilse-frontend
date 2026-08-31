"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Ellipsis, Heart, Home, LayoutTemplate, ScrollText } from "lucide-react";
import MoreDrawer from "@/components/MoreDrawer";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  // Who may see which destinations is `MoreDrawer`'s business now — it owns the
  // list, so it owns the role checks that shape it.

  const activeColor = "#f2cf74";
  const mutedColor = "rgba(245,222,177,0.80)";

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const tabBg = (active: boolean) =>
    active
      ? "linear-gradient(180deg,rgba(214,174,84,0.24),rgba(214,174,84,0.08))"
      : "transparent";
  const tabBorder = (active: boolean) =>
    active ? "1px solid rgba(229,191,101,0.42)" : "1px solid transparent";

  const activeSlot = (() => {
    if (moreOpen) return 4;
    if (pathname.startsWith("/templates")) return 0;
    if (pathname.startsWith("/favorites") || pathname.startsWith("/saves")) return 1;
    if (pathname === "/") return 2;
    if (pathname.startsWith("/manifesto")) return 3;
    if (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/guides") ||
      pathname.startsWith("/blog") ||
      pathname.startsWith("/about-us") ||
      pathname.startsWith("/contact-us") ||
      pathname.startsWith("/help") ||
      pathname.startsWith("/admin")
    ) {
      return 4;
    }
    return 2;
  })();

  // Slight inward offsets on edge tabs keep the circle visually centered with labels.
  const bubbleLeft = ["13%", "31%", "50%", "69%", "87%"][activeSlot];

  const bubbleIcon = [
    <LayoutTemplate key="b-template" size={23} strokeWidth={2.1} />,
    <Heart key="b-favorite" size={23} strokeWidth={2.1} />,
    <Home key="b-home" size={23} strokeWidth={2.1} />,
    <ScrollText key="b-manifesto" size={23} strokeWidth={2.1} />,
    <Ellipsis key="b-more" size={23} strokeWidth={2.1}  />,
  ][activeSlot];

  const TabItem = ({
    href,
    label,
    icon,
    slot,
  }: {
    href: string;
    label: string;
    icon: React.ReactNode;
    slot: number;
  }) => {
    const active = activeSlot === slot;
    return (
      <Link
        href={href}
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: tabBg(active && slot !== 2),
            border: tabBorder(active && slot !== 2),
            transition: "all 0.2s",
            opacity: active ? 0 : 1,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            marginTop: 2,
            fontSize: 7.8,
            fontWeight: 700,
            letterSpacing: "0.9px",
            color: active ? activeColor : mutedColor,
            fontFamily: "'Inter',sans-serif",
            lineHeight: 1.05,
            textAlign: "center",
            whiteSpace: "nowrap",
            opacity: active && slot === 2 ? 0.82 : 1,
          }}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* The destinations list lives in `MoreDrawer` — a full-height panel
          rather than the 228px popover this replaces. See the note at the top of
          that file for why, and for why the item order did not change. */}
      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[79] pointer-events-none"
        style={{ padding: "0 22px 14px" }}
      >
        <div
          className="pointer-events-auto"
          style={{
            height: 68,
            borderRadius: 26,
            background:
              "linear-gradient(180deg,#2b070d 0%,#3a0812 56%,#22060b 100%)",
            border: "1px solid rgba(212,175,84,0.52)",
            boxShadow:
              "0 12px 24px rgba(0,0,0,0.42),inset 0 1px 0 rgba(255,228,160,0.28),inset 0 -1px 0 rgba(155,88,18,0.32)",
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            alignItems: "center",
            justifyItems: "center",
            padding: "0 10px",
            overflow: "visible",
            position: "relative",
          }}
        >
          <TabItem
            href="/templates"
            label="TEMPLATE"
            slot={0}
            icon={<LayoutTemplate size={20} color={activeSlot === 0 ? activeColor : mutedColor} strokeWidth={1.9} />}
          />
          <TabItem
            href="/favorites"
            label="FAVORITE"
            slot={1}
            icon={<Heart size={20} color={activeSlot === 1 ? activeColor : mutedColor} strokeWidth={1.9} />}
          />

          <TabItem
            href="/"
            label="HOME"
            slot={2}
            icon={<Home size={20} color={activeSlot === 2 ? activeColor : mutedColor} strokeWidth={2} />}
          />

          <TabItem
            href="/manifesto"
            label="MANIFESTO"
            slot={3}
            icon={<ScrollText size={20} color={activeSlot === 3 ? activeColor : mutedColor} strokeWidth={1.9} />}
          />

          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="Open more menu"
            style={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: activeSlot === 4 ? "linear-gradient(180deg,rgba(214,174,84,0.24),rgba(214,174,84,0.08))" : "transparent",
                border: activeSlot === 4 ? "1px solid rgba(229,191,101,0.42)" : "1px solid transparent",
                transition: "all 0.2s",
                opacity: activeSlot === 4 ? 0 : 1,
              }}
            >
              <Ellipsis size={20} color={activeSlot === 4 ? activeColor : mutedColor} strokeWidth={2} />
            </div>
            <span
              style={{
                marginTop: 2,
                fontSize: 7.8,
                fontWeight: 700,
                letterSpacing: "0.9px",
                color: activeSlot === 4 ? activeColor : mutedColor,
                fontFamily: "'Inter',sans-serif",
                lineHeight: 1.05,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              MORE
            </span>
          </button>

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: bubbleLeft,
              transform: "translateX(-50%)",
              top: -22,
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid rgba(242,207,116,0.72)",
              background: "linear-gradient(145deg,#5a0f17 0%,#3d0c11 100%)",
              color: "#f7dfaa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(61,12,17,0.35)",
              zIndex: 9,
              transition: "left 260ms cubic-bezier(0.22,1,0.36,1), top 260ms cubic-bezier(0.22,1,0.36,1)",
              pointerEvents: "none",
            }}
          >
            {bubbleIcon}
          </div>
        </div>
      </nav>
    </>
  );
}
