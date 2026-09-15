"use client";

// ─── The phone "More" drawer ─────────────────────────────────────────────────
//
// Opened by the ellipsis in the bottom nav. It used to be a 228px popover
// floating above that nav, which had two problems that got worse as the app grew:
// eleven-plus destinations in a flat list where "Analytics" and "About Us" carried
// exactly the same weight, and no room to scroll when an admin signed in and six
// more entries appeared.
//
// A full-height drawer fixes both. The list can breathe, it can scroll, and there
// is space for a header that says who is signed in.
//
// ── WHY THE ORDER IS UNCHANGED ──────────────────────────────────────────────
//
// Everything non-admin stays exactly where it was: Guides, Profile, Blog, Refer,
// then About, Contact, Help. People build muscle memory for a menu they use, and
// reshuffling it to look tidier costs them that for nothing. The one change is
// that the admin entries are collected under a single heading instead of sitting
// inline between "Refer & Earn" and "About Us" — that is what makes the list
// readable, and it is invisible to the people who never see those entries.
//
// ── WHY IT OPENS FROM THE LEFT ──────────────────────────────────────────────
//
// Asked for. Worth noting the trade: the button is bottom-RIGHT, so the thumb
// crosses the screen and the drawer's edge lands away from where the tap
// happened. Swipe-to-close is here to compensate — a left-flick dismisses it, so
// getting out never requires reaching for a specific target.

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X, User, Gift, BookOpen, Info, Mail, HelpCircle, GraduationCap,
  BarChart3, Users, LayoutGrid, IndianRupee, KeyRound, MessageSquare, Star, FileText,
  Coins, LogIn, ChevronRight,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { roleAtLeast } from "@/lib/roles";

/** Nav chrome palette — the same maroon and gold the bottom bar wears. */
const PANEL = "linear-gradient(180deg,#2a070d 0%,#3b0812 58%,#22060b 100%)";
const GOLD = "#f2cf74";
const GOLD_DIM = "#f7dfaa";
const GOLD_LINE = "rgba(212,175,84,0.42)";
const GOLD_FAINT = "rgba(212,175,84,0.20)";
const MUTED = "rgba(245,222,177,0.62)";

interface Item {
  label: string;
  icon: React.ReactNode;
  href: string;
}

/**
 * One destination.
 *
 * Declared at module scope, not inside the drawer. A component created during
 * render is a NEW component type on every pass, so React unmounts and remounts
 * the whole subtree each time — it resets state and defeats reconciliation. It
 * takes `here` and `onClose` as props rather than closing over them, which is
 * what makes hoisting possible.
 */
function Row({
  item,
  here,
  onClose,
}: {
  item: Item;
  here: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      aria-current={here ? "page" : undefined}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 48,
        padding: "0 12px",
        borderRadius: 13,
        textDecoration: "none",
        color: here ? GOLD : GOLD_DIM,
        background: here ? "rgba(214,174,84,0.16)" : "transparent",
        border: `1px solid ${here ? GOLD_LINE : "transparent"}`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* A gold bar on the active row: the tint alone is easy to miss on this
          dark ground, and colour alone is not an accessible signal. */}
      {here && (
        <span
          aria-hidden
          style={{
            position: "absolute", left: -1, top: 12, bottom: 12,
            width: 3, borderRadius: 999, background: GOLD,
          }}
        />
      )}
      <span
        style={{
          width: 32, height: 32, borderRadius: 10, flex: "none",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: here ? "rgba(242,207,116,0.20)" : "rgba(201,168,76,0.14)",
          color: here ? GOLD : GOLD_DIM,
        }}
      >
        {item.icon}
      </span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 650, letterSpacing: "-0.01em" }}>
        {item.label}
      </span>
      <ChevronRight size={15} style={{ color: MUTED, flex: "none" }} />
    </Link>
  );
}

/** Section heading. Module scope for the same reason as `Row`. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "0 12px",
        marginTop: 16,
        marginBottom: 7,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: MUTED,
      }}
    >
      {children}
    </div>
  );
}

export default function MoreDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname() || "/";
  const reduceMotion = useReducedMotion();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  // Rank checks, not equality: `superadmin` outranks `admin` and must still see
  // the admin entries. `=== "admin"` hid them the moment that role existed.
  const isAdmin = roleAtLeast(user?.role, "admin");
  const isSuper = roleAtLeast(user?.role, "superadmin");

  // Lock the page behind the drawer, and let Escape out. A panel that slides
  // over a page which then scrolls under your thumb feels broken.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Order preserved from the popover this replaces — see the note above.
  const main: Item[] = [
    // Guides leads. Everything else here is account admin or company info; this
    // is the only entry that helps someone finish the thing they came to make.
    { label: "Product Guides", icon: <GraduationCap size={17} />, href: "/guides" },
    { label: "Profile", icon: <User size={17} />, href: "/profile" },
    { label: "Blog", icon: <BookOpen size={17} />, href: "/blog" },
    { label: "Feedback", icon: <Star size={17} />, href: "/feedback" },
    { label: "Refer & Earn", icon: <Gift size={17} />, href: "/profile#referral" },
  ];

  const adminItems: Item[] = isAdmin
    ? [
        { label: "Analytics", icon: <BarChart3 size={17} />, href: "/admin/analytics" },
        { label: "User Dashboard", icon: <Users size={17} />, href: "/admin/users" },
        { label: "Template Visibility", icon: <LayoutGrid size={17} />, href: "/admin/templates" },
        ...(isSuper
          ? [
              { label: "Template Pricing", icon: <IndianRupee size={17} />, href: "/admin/pricing" },
              { label: "Early Access", icon: <KeyRound size={17} />, href: "/admin/early-access" },
              // Super admin only, like the two above: replying from here sends
              // mail as SubhSandesh to a named customer.
              { label: "Feedback", icon: <Star size={17} />, href: "/admin/feedback" },
              { label: "Unfinished Drafts", icon: <FileText size={17} />, href: "/admin/drafts" },
              { label: "Conversations", icon: <MessageSquare size={17} />, href: "/admin/threads" },
            ]
          : []),
        { label: "Contacts", icon: <MessageSquare size={17} />, href: "/admin/contacts" },
      ]
    : [];

  const support: Item[] = [
    { label: "About Us", icon: <Info size={17} />, href: "/about-us" },
    { label: "Contact Us", icon: <Mail size={17} />, href: "/contact-us" },
    { label: "Help", icon: <HelpCircle size={17} />, href: "/help" },
  ];

  /**
   * Marks where you are. Compared on the path only — `/profile#referral` and
   * `/profile` are the same page, so both would otherwise light up and the
   * highlight would stop meaning anything.
   */
  const isHere = (href: string) => {
    const path = href.split("#")[0];
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.button
            className="md:hidden fixed inset-0 z-[84]"
            onClick={onClose}
            aria-label="Close menu"
            style={{ background: "rgba(23,6,9,0.55)", backdropFilter: "blur(3px)", border: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />

          {/* Panel */}
          <motion.aside
            className="md:hidden fixed top-0 bottom-0 left-0 z-[85] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="More"
            style={{
              width: "min(86vw, 340px)",
              background: PANEL,
              borderRight: `1px solid ${GOLD_LINE}`,
              boxShadow: "12px 0 40px rgba(0,0,0,0.5)",
            }}
            initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
            transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 340, damping: 34 }}
            // Flick left to dismiss. The trigger is bottom-right, so without this
            // the only way out is a reach across the screen — see the note above.
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.35, right: 0 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -420) onClose();
            }}
          >
            {/* ── Header: who is signed in ─────────────────────────────────
                The popover had no room for this, so the menu never told you
                which account you were about to act as — which matters most for
                the very people who see the Admin group below. */}
            <div
              style={{
                flex: "none",
                padding: "calc(16px + env(safe-area-inset-top, 0px)) 14px 14px",
                borderBottom: `1px solid ${GOLD_FAINT}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                {isAuthenticated && user ? (
                  <>
                    <span
                      style={{
                        width: 42, height: 42, borderRadius: 999, flex: "none",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: "linear-gradient(140deg,rgba(242,207,116,0.30),rgba(201,168,76,0.14))",
                        border: `1px solid ${GOLD_LINE}`,
                        color: GOLD, fontSize: 17, fontWeight: 800,
                        overflow: "hidden",
                      }}
                    >
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt="" width={42} height={42} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        (user.name || user.email || "?").trim().charAt(0).toUpperCase()
                      )}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14.5, fontWeight: 750, color: GOLD_DIM,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {user.name || "Your account"}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5, color: MUTED, marginTop: 1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {user.email}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    onClick={onClose}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, flex: 1,
                      minHeight: 44, padding: "0 12px", borderRadius: 13,
                      textDecoration: "none",
                      background: "rgba(214,174,84,0.16)",
                      border: `1px solid ${GOLD_LINE}`,
                      color: GOLD, fontSize: 14, fontWeight: 750,
                    }}
                  >
                    <LogIn size={17} />
                    Sign in
                  </Link>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  style={{
                    width: 44, height: 44, borderRadius: 999, flex: "none",
                    display: "grid", placeItems: "center",
                    background: "transparent", border: "none",
                    color: MUTED, cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <X size={19} />
                </button>
              </div>

              {isAuthenticated && typeof user?.points === "number" && (
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                    padding: "5px 11px", borderRadius: 999,
                    background: "rgba(201,168,76,0.14)", border: `1px solid ${GOLD_FAINT}`,
                    color: GOLD, fontSize: 12, fontWeight: 750,
                  }}
                >
                  <Coins size={13} />
                  {user.points.toLocaleString("en-IN")} points
                </div>
              )}
            </div>

            {/* ── The list ─────────────────────────────────────────────────
                Scrolls on its own, so the header stays put and an admin's
                longer list has somewhere to go. */}
            <nav
              className="overflow-y-auto overscroll-contain"
              style={{
                flex: 1,
                padding: "6px 10px",
                paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {main.map((item) => (
                  <Row key={item.label} item={item} here={isHere(item.href)} onClose={onClose} />
                ))}
              </div>

              {/* The one structural change: admin entries under a single heading
                  rather than inline among everything else. */}
              {adminItems.length > 0 && (
                <>
                  <GroupLabel>Admin</GroupLabel>
                  <div
                    style={{
                      display: "flex", flexDirection: "column", gap: 4,
                      padding: 6,
                      borderRadius: 15,
                      background: "rgba(0,0,0,0.20)",
                      border: `1px solid ${GOLD_FAINT}`,
                    }}
                  >
                    {adminItems.map((item) => (
                      <Row key={item.label} item={item} here={isHere(item.href)} onClose={onClose} />
                    ))}
                  </div>
                </>
              )}

              <GroupLabel>Support</GroupLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {support.map((item) => (
                  <Row key={item.label} item={item} here={isHere(item.href)} onClose={onClose} />
                ))}
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
