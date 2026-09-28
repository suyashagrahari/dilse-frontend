"use client";

// ─── Super admin: who gets a template before everybody else ──────────────────
//
// The catalogue on the left is CODE — every entry comes from
// `data/template-registry.ts`, the same list the gallery renders from. So a new
// template is grantable the moment it exists, with no row in any table required.
//
// ── WHAT THIS SCREEN IS FOR ─────────────────────────────────────────────────
//
// You finish a template, hold it back from the public on `/admin/templates`, and
// hand it to one client or tester first. This is where you hand it over.
//
// A grant does three things at once, and the copy says so, because a super admin
// choosing to click it should know all three: the person sees the template in
// their gallery, their builder opens, and — if the template is paid — they
// publish without being charged.
//
// ── SUPER ADMIN, NOT ADMIN ──────────────────────────────────────────────────
//
// `admin/layout.tsx` gates on `isAdmin`, which admits staff who moderate contacts
// and flip visibility. Deciding that one named person may use something the
// public cannot, for free, is a different kind of power, so this page checks
// `isSuperAdmin` itself and sends anybody else back. The server refuses them too
// — `requireSuperAdmin` on every grant route — because a hidden button is not an
// access control.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { useHiddenTemplates } from "@/hooks/useHiddenTemplates";
import {
  Search, Loader2, Check, Globe, AlertTriangle, UserPlus, X,
  EyeOff, Eye, Users, Trash2, KeyRound,
} from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, EmptyState, Tag, rise } from "../adminKit";

const t1 = A.ink;
const t2 = A.soft;
const tM = A.muted;
const bg = A.maroon;
const cB = A.edge;
const OK = A.ok;
const OFF = A.danger;

interface Grant {
  userId: string;
  email: string;
  name: string;
  status: string;
  grantedByEmail: string;
  note: string;
  createdAt: string | null;
}

interface FoundUser {
  _id: string;
  email: string;
  name: string;
  status?: string;
}

const CATALOGUE = [
  ...templateList.map((t) => ({ ...t, group: "Template" as const })),
  ...webpageTemplateList.map((t) => ({ ...t, group: "Webpage" as const })),
];

export default function AdminEarlyAccessPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const publiclyHidden = useHiddenTemplates();

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [only, setOnly] = useState<"all" | "hidden" | "granted">("hidden");
  const [toast, setToast] = useState<string | null>(null);

  /** The template whose access list is open, and its grants. */
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Add-a-person search
  const [userQuery, setUserQuery] = useState("");
  const [found, setFound] = useState<FoundUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [note, setNote] = useState("");
  const userSearchRef = useRef<HTMLInputElement>(null);

  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) {
      router.replace("/admin/analytics");
      return;
    }
    setAllowed(true);
  }, [user, isLoading, router]);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  const say = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const loadCounts = useCallback(async () => {
    if (!accessToken || !allowed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/template-grants`, { headers: hdr() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      setCounts(json.data.counts || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load early access");
    } finally {
      setLoading(false);
    }
  }, [accessToken, allowed, hdr]);

  useEffect(() => { void loadCounts(); }, [loadCounts]);

  const openTemplate = useCallback(
    async (slug: string) => {
      setOpenSlug(slug);
      setGrants([]);
      setUserQuery("");
      setFound([]);
      setNote("");
      setGrantsLoading(true);
      try {
        const res = await fetch(`${API_URL}/admin/template-grants/${slug}`, { headers: hdr() });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load");
        setGrants(json.data.grants || []);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not load the access list");
      } finally {
        setGrantsLoading(false);
      }
    },
    [hdr, say]
  );

  // ── Debounced user search ────────────────────────────────────────────────
  //
  // Reuses `GET /admin/users?search=`, which already matches name or email. A
  // keystroke-per-request would be one query per letter against the users
  // collection; 300ms is short enough to feel live and long enough to collapse a
  // typed word into one request.
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = userQuery.trim();
    if (q.length < 2) { setFound([]); setSearching(false); return; }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/users?search=${encodeURIComponent(q)}&limit=8`,
          { headers: hdr() }
        );
        const json = await res.json();
        setFound(json.success ? (json.data?.users || []) : []);
      } catch {
        setFound([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [userQuery, hdr]);

  // ── Sheet behaviours ──────────────────────────────────────────────────────
  //
  // Three things a dialog owes the person using it, none of which this one had:
  // the cursor starts where the work is, Escape gets out, and the page behind
  // stops moving. The last one matters most on a phone — this list of templates
  // is long, and a scroll gesture aimed at the sheet used to scroll the page
  // underneath it, which reads as the sheet drifting.
  useEffect(() => {
    if (!openSlug) return;

    const t = setTimeout(() => userSearchRef.current?.focus(), 80);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpenSlug(null);
      }
    };
    document.addEventListener("keydown", onKey, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [openSlug]);

  // A fresh sheet starts with an empty search rather than the last one's
  // results, which otherwise appear to belong to the template just opened.
  useEffect(() => {
    if (!openSlug) return;
    setUserQuery("");
    setFound([]);
    setNote("");
  }, [openSlug]);

  const grant = useCallback(
    async (u: FoundUser) => {
      if (!openSlug || busy) return;
      setBusy(u._id);
      try {
        const res = await fetch(`${API_URL}/admin/template-grants`, {
          method: "POST",
          headers: hdr(),
          body: JSON.stringify({ userId: u._id, slug: openSlug, note: note.trim() || undefined }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to grant");

        // Reflect it without a refetch, then correct the count.
        setGrants((p) => [
          {
            userId: u._id, email: u.email, name: u.name, status: u.status || "",
            grantedByEmail: user?.email || "", note: note.trim(),
            createdAt: new Date().toISOString(),
          },
          ...p.filter((x) => x.userId !== u._id),
        ]);
        setCounts((p) => ({ ...p, [openSlug]: (p[openSlug] || 0) + (grants.some((x) => x.userId === u._id) ? 0 : 1) }));
        setUserQuery("");
        setFound([]);
        setNote("");
        say(`${u.email} can now use ${openSlug}`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not grant access");
      } finally {
        setBusy(null);
      }
    },
    [openSlug, busy, hdr, note, user?.email, grants, say]
  );

  const revoke = useCallback(
    async (userId: string, email: string) => {
      if (!openSlug || busy) return;
      setBusy(userId);
      try {
        const res = await fetch(`${API_URL}/admin/template-grants/${openSlug}/${userId}`, {
          method: "DELETE",
          headers: hdr(),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to revoke");
        setGrants((p) => p.filter((x) => x.userId !== userId));
        setCounts((p) => ({ ...p, [openSlug]: Math.max(0, (p[openSlug] || 1) - 1) }));
        say(`${email} can no longer use ${openSlug}`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not revoke access");
      } finally {
        setBusy(null);
      }
    },
    [openSlug, busy, hdr, say]
  );

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOGUE.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.slug.includes(q)) return false;
      if (only === "hidden") return publiclyHidden.has(t.slug);
      if (only === "granted") return (counts[t.slug] || 0) > 0;
      return true;
    });
  }, [search, only, publiclyHidden, counts]);

  const hiddenCount = CATALOGUE.filter((t) => publiclyHidden.has(t.slug)).length;
  const grantedCount = CATALOGUE.filter((t) => (counts[t.slug] || 0) > 0).length;
  const totalGrants = CATALOGUE.reduce((sum, t) => sum + (counts[t.slug] || 0), 0);
  const hiddenUngranted = CATALOGUE.filter((t) => publiclyHidden.has(t.slug) && !(counts[t.slug] || 0)).length;
  const liveGranted = CATALOGUE.filter((t) => !publiclyHidden.has(t.slug) && (counts[t.slug] || 0) > 0).length;

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  const openTemplateMeta = CATALOGUE.find((t) => t.slug === openSlug);

  if (!allowed) {
    return <Loading label="Checking access…" h={320} />;
  }

  return (
    <AdminPage
      title="Early access"
      subtitle={<>Give one person a template the public cannot see yet. They get it in their gallery, their builder opens, and if the template is paid they publish without being charged. Everyone else still sees &ldquo;Not available yet&rdquo;.</>}
      icon={<KeyRound size={18} />}
      width={1180}
    >
      {/* Inline styles cannot hold a media query and this screen is used from a
          phone as often as from a desk. Scoped to `ea-` so nothing leaks. */}
      <style>{`
        .animate-spin { animation: spin 0.9s linear infinite; }
        .ea-host { display: flex; align-items: flex-start; gap: 7px; margin-top: 11px; font-size: 11.5px; line-height: 1.45; opacity: .9; }
        .ea-note { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; padding: 9px 12px; border-radius: 12px;
          background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.35); font-size: 12px; line-height: 17px; color: ${t2}; }
        .ea-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
        .ea-controls > .adk-chips { max-width: 100%; }
        .ea-controls .adk-search input { font-size: 16px; } /* no iOS zoom on focus */
        .ea-error { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; padding: 10px 12px; border-radius: 12px;
          background: rgba(179,38,30,0.08); border: 1px solid rgba(179,38,30,0.3); }
        .ea-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 7px; }
        @media (min-width: 700px) { .ea-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; } }
        @media (min-width: 1100px) { .ea-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
        .ea-row { display: flex; align-items: center; gap: 10px; padding: 10px 11px; }
        .ea-emoji { width: 36px; height: 36px; flex: none; border-radius: 11px; display: grid; place-items: center; font-size: 19px; background: rgba(201,168,76,.13); }
        .ea-name { display: block; font-size: 13.5px; font-weight: 800; color: ${t1}; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ea-slug { display: block; font-size: 11px; color: ${tM}; font-family: ui-monospace, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ea-count { display: inline-flex; align-items: center; gap: 4px; flex: none; min-width: 42px; justify-content: center; padding: 5px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 800; }
        .ea-found { display: flex; align-items: center; gap: 10px; }
        .ea-input { width: 100%; border-radius: 12px; border: 1px solid ${cB}; background: #fff; font-size: 16px; color: ${t1}; outline: none; transition: border-color .2s, box-shadow .2s; }
        .ea-input:focus { border-color: ${A.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
        @media (max-width: 560px) {
          /* Name and action stack rather than squeezing an email to three
             characters and an ellipsis. */
          .ea-found { flex-wrap: wrap; }
          .ea-found > button { width: 100%; }
        }

        /* ── The sheet, and why it is lifted ─────────────────────────────────
           components/BottomNav.tsx is "fixed bottom-0 ... z-[79]" and 68px tall
           on phones (md:hidden). This sheet used to sit at z-index 61 and flush
           to the bottom of the viewport, so the nav painted straight over its
           lower third — which is exactly where the search results and the
           "Give access" buttons are. The fix is both halves: get above 79, and
           stop before the nav starts.

           --ea-nav-h is the nav ELEMENT's rendered height, not the 68px pill
           inside it — the <nav> measures 82px once its padding is counted, and
           using 68 left a 4px overlap. Measured in a browser at 390x844 rather
           than read off the source. If the nav changes, this is the other place
           to edit.

           (No back-ticks anywhere in this block: it lives inside a template
           literal, and one unescaped back-tick closes the whole stylesheet.) */
        .ea-sheet-wrap {
          --ea-nav-h: 82px;
          position: fixed;
          inset: 0;
          z-index: 189;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
        }
        .ea-sheet {
          pointer-events: auto;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          background: #fffdfb;
          border: 1px solid rgba(61,12,17,0.08);
          overflow: hidden;
          /* All four corners: no longer flush to the screen edge, so a sheet
             with two square corners would look broken rather than anchored. */
          border-radius: 22px;
          margin: 0 10px calc(var(--ea-nav-h) + env(safe-area-inset-bottom, 0px) + 10px);
          max-height: calc(100dvh - var(--ea-nav-h) - env(safe-area-inset-bottom, 0px) - 34px);
          box-shadow: 0 24px 60px -18px rgba(26,5,7,0.5);
        }
        @media (min-width: 768px) {
          /* The nav is md:hidden, so above this breakpoint there is nothing to
             clear and the sheet is better as a centred dialog. */
          .ea-sheet-wrap { align-items: center; }
          .ea-sheet { margin: 0; max-height: min(86dvh, 760px); }
        }
        .ea-sheet-head { padding: 14px 16px 12px; flex: none; color: #f5ede6;
          background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 60%, #240609 100%); }

        /* The search stays put while results grow beneath it. Without this,
           typing pushes the field up and out of view on a short screen. */
        .ea-add {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #fffdfb;
          padding-bottom: 10px;
          margin-bottom: 2px;
        }
      `}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="PEOPLE WITH EARLY ACCESS" value={totalGrants} sub={`across ${grantedCount} template${grantedCount === 1 ? "" : "s"}`} />
          <HeroStat label="HIDDEN TEMPLATES" value={hiddenCount} tone="#ffe3a3" />
          <HeroStat label="HIDDEN, NO GRANTS" value={hiddenUngranted} />
          <HeroStat label="GRANTS ON LIVE" value={liveGranted} sub={liveGranted ? "no effect" : undefined} tone="#ffb4a8" />
        </div>
        <div className="ea-host">
          <Globe size={13} style={{ flex: "none", color: "#ffe3a3" }} />
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            Editing <strong style={{ color: "#ffe3a3" }}>{apiHost}</strong> — grants apply to this deployment only.
          </span>
        </div>
      </Hero>

      {/* Hiding is a separate switch and lives elsewhere. Saying so here saves
          the "I granted access and everyone can see it" support round-trip. */}
      <motion.div className="ea-note" {...rise(2)}>
        <EyeOff size={14} style={{ color: A.goldDeep, flex: "none", marginTop: 1 }} />
        <span style={{ minWidth: 0 }}>
          A grant only matters while the template is hidden. Hide it first on{" "}
          <Link href="/admin/templates" style={{ color: A.goldDeep, fontWeight: 800 }}>Template visibility</Link>. Granting a live
          template is harmless but does nothing.
        </span>
      </motion.div>

      <div className="ea-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or slug" style={{ flex: "1 1 240px" }} />
        <ChipGroup
          id="ea-only"
          value={only}
          onChange={setOnly}
          options={[
            { value: "hidden", label: <><EyeOff size={12} /> Hidden</>, count: hiddenCount },
            { value: "granted", label: <><Users size={12} /> Has grants</>, count: grantedCount, tone: OK },
            { value: "all", label: "All", count: CATALOGUE.length },
          ]}
        />
      </div>

      {error ? (
        <div className="ea-error">
          <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: t1, overflowWrap: "anywhere" }}>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <Loading label="Loading grants…" />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={only === "hidden" ? <EyeOff size={20} /> : <Search size={20} />}
          title={only === "hidden" ? "No templates are hidden right now" : "Nothing matches."}
          note={only === "hidden" ? "Hide one on Template visibility first." : "Try another name, slug or filter."}
        />
      ) : (
        <div className="ea-grid">
          {shown.map((t, i) => {
            const n = counts[t.slug] || 0;
            const isHidden = publiclyHidden.has(t.slug);
            return (
              <motion.button
                key={t.slug}
                type="button"
                onClick={() => void openTemplate(t.slug)}
                className="adk-card ea-row"
                {...rise(i)}
              >
                <span className="ea-emoji" aria-hidden>{t.emoji}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="ea-name">{t.title}</span>
                  <span className="ea-slug">{t.slug}</span>
                </span>

                <span title={isHidden ? "Hidden from the public" : "Live for everyone"} style={{ flex: "none" }}>
                  <Tag tone={isHidden ? A.goldDeep : OK}>
                    {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                    {isHidden ? "Hidden" : "Live"}
                  </Tag>
                </span>

                <span
                  className="ea-count"
                  style={{
                    background: n > 0 ? "rgba(30,122,75,0.12)" : "#f7eee5",
                    color: n > 0 ? OK : tM,
                  }}
                >
                  <Users size={12} />
                  {n}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── The access list for one template ──────────────────────────────── */}
      <AnimatePresence>
        {openSlug && (
          <motion.div key="ea-sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <div
              onClick={() => setOpenSlug(null)}
              style={{ position: "fixed", inset: 0, zIndex: 188, background: "rgba(26,5,7,0.5)", backdropFilter: "blur(4px)" }}
            />
            <div className="ea-sheet-wrap">
              <motion.div
                className="ea-sheet"
                role="dialog"
                aria-modal="true"
                aria-label={`Early access for ${openTemplateMeta?.title || openSlug}`}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <div className="ea-sheet-head">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20, width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(255,227,163,.14)", flex: "none" }}>
                      {openTemplateMeta?.emoji}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {openTemplateMeta?.title || openSlug}
                      </div>
                      <div style={{ fontSize: 11, color: "#ffe3a3", opacity: 0.8, fontFamily: "ui-monospace, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {openSlug} · {grants.length} with access
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenSlug(null)}
                      aria-label="Close"
                      style={{
                        width: 40, height: 40, borderRadius: 999, border: "none",
                        background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer",
                        display: "grid", placeItems: "center", flex: "none",
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div style={{ overflowY: "auto", padding: "14px 16px", flex: 1 }}>
                  {/* Add somebody. Sticky, so results grow beneath the field
                      instead of pushing it off a short screen. */}
                  <div className="ea-add">
                    <div style={{ position: "relative" }}>
                      <UserPlus size={15} style={{ position: "absolute", left: 11, top: 15, color: tM }} />
                      <input
                        ref={userSearchRef}
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Find a registered user by name or email"
                        className="ea-input"
                        style={{ height: 44, paddingLeft: 34, paddingRight: 60 }}
                      />
                      {searching && (
                        <Loader2 size={15} className="animate-spin" style={{ position: "absolute", right: 36, top: 15, color: tM }} />
                      )}
                      {userQuery.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setUserQuery(""); setFound([]); userSearchRef.current?.focus(); }}
                          aria-label="Clear search"
                          style={{
                            position: "absolute", right: 6, top: 6, width: 32, height: 32,
                            borderRadius: 9, border: "none", background: "transparent",
                            color: tM, cursor: "pointer", display: "grid", placeItems: "center",
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 200))}
                      placeholder="Why, optionally — e.g. Sharma wedding demo, 3 Sep"
                      className="ea-input"
                      style={{ height: 40, marginTop: 8, padding: "0 12px", borderRadius: 11 }}
                    />
                  </div>

                  {/* Say what the field wants before it is used, rather than
                      leaving an empty pane that looks broken. */}
                  {userQuery.trim().length === 0 && (
                    <p style={{ margin: "10px 0 0", fontSize: 12.5, color: tM, lineHeight: 1.55 }}>
                      Type at least two characters. Only people who already have an
                      account can be given early access.
                    </p>
                  )}

                  {userQuery.trim().length === 1 && (
                    <p style={{ margin: "10px 0 0", fontSize: 12.5, color: tM }}>
                      One more character…
                    </p>
                  )}

                  {userQuery.trim().length >= 2 && !searching && found.length === 0 && (
                    <p style={{ margin: "12px 0 0", fontSize: 12.5, color: tM, lineHeight: 1.55, overflowWrap: "anywhere" }}>
                      No account matches <strong style={{ color: t1 }}>{userQuery.trim()}</strong>.
                      Early access can only be given to someone who has already signed up.
                    </p>
                  )}

                  {found.length > 0 && (
                    <div style={{ margin: "12px 0 0", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tM }}>
                      {found.length} {found.length === 1 ? "match" : "matches"}
                    </div>
                  )}

                  {found.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                      {found.map((u, i) => {
                        const already = grants.some((x) => x.userId === u._id);
                        return (
                          <motion.div
                            key={u._id}
                            className="ea-found"
                            {...rise(i)}
                            style={{
                              padding: "9px 11px", borderRadius: 12,
                              background: already ? "#f3ece4" : "#f7eee5",
                              border: `1px solid ${already ? "rgba(61,12,17,0.06)" : cB}`,
                              opacity: already ? 0.75 : 1,
                            }}
                          >
                            {/* An initial rather than a generic icon: with three
                                Priyas in the list, the letter is the only part
                                that is not identical. */}
                            <div
                              aria-hidden
                              style={{
                                width: 34, height: 34, borderRadius: 999, flex: "none",
                                background: "rgba(201,168,76,0.22)", color: A.goldDeep,
                                display: "grid", placeItems: "center",
                                fontSize: 14, fontWeight: 800,
                              }}
                            >
                              {(u.name || u.email || "?").trim().charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {u.name || "(no name)"}
                              </div>
                              <div style={{ fontSize: 11.5, color: t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {u.email}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="adk-btn"
                              data-v={already ? undefined : "primary"}
                              disabled={already || busy === u._id}
                              onClick={() => void grant(u)}
                              style={{ height: 38, padding: "0 13px", flex: "none" }}
                            >
                              {busy === u._id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              {already ? "Has access" : "Give access"}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Who has it */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tM, marginBottom: 8 }}>
                      <Users size={12} /> Has early access ({grants.length})
                    </div>

                    {grantsLoading ? (
                      <Loading label="Loading access list…" h={80} />
                    ) : grants.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12.5, color: tM }}>
                        Nobody yet. Find someone above to give them access.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <AnimatePresence initial={false}>
                          {grants.map((gr) => (
                            <motion.div
                              key={gr.userId || gr.email}
                              layout
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 30 }}
                              transition={{ duration: 0.22 }}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "9px 11px", borderRadius: 12,
                                background: "#fff", border: `1px solid ${cB}`,
                              }}
                            >
                              <div
                                aria-hidden
                                style={{
                                  width: 32, height: 32, borderRadius: 999, flex: "none",
                                  background: "rgba(30,122,75,0.12)", color: OK,
                                  display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800,
                                }}
                              >
                                {(gr.name || gr.email || "?").trim().charAt(0).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {gr.name || gr.email}
                                </div>
                                <div style={{ fontSize: 11.5, color: t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {gr.email}
                                </div>
                                <div style={{ fontSize: 11, color: tM, marginTop: 2, overflowWrap: "anywhere" }}>
                                  {gr.grantedByEmail ? `by ${gr.grantedByEmail}` : ""}
                                  {gr.createdAt ? ` · ${new Date(gr.createdAt).toLocaleDateString("en-IN")}` : ""}
                                  {gr.note ? ` · ${gr.note}` : ""}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="adk-btn"
                                data-v="danger"
                                disabled={busy === gr.userId || !gr.userId}
                                onClick={() => void revoke(gr.userId, gr.email)}
                                title="Revoke"
                                aria-label={`Revoke access for ${gr.email}`}
                                style={{ width: 38, height: 38, padding: 0, flex: "none" }}
                              >
                                {busy === gr.userId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 14, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 14, x: "-50%" }}
            style={{
              // Above the sheet (189) and clear of the 68px nav, so "Access
              // given" is not delivered underneath the thing it is about.
              position: "fixed", left: "50%",
              bottom: "calc(82px + env(safe-area-inset-bottom, 0px) + 14px)",
              background: bg, color: "#fdf8ee", padding: "10px 16px", borderRadius: 999,
              fontSize: 13, fontWeight: 600, zIndex: 200, maxWidth: "90vw", textAlign: "center",
              boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
