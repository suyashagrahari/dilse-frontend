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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { useHiddenTemplates } from "@/hooks/useHiddenTemplates";
import {
  ArrowLeft, Search, Loader2, Check, Globe, AlertTriangle, UserPlus, X,
  EyeOff, Eye, Users, Trash2,
} from "lucide-react";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";
const OK = "#1f7a4d";
const OFF = "#b3261e";

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

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  const openTemplateMeta = CATALOGUE.find((t) => t.slug === openSlug);

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5ede6", display: "grid", placeItems: "center" }}>
        <Loader2 size={26} className="animate-spin" style={{ color: g }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5ede6", paddingBottom: 60 }}>
      {/* Inline styles cannot hold a media query and this screen is used from a
          phone as often as from a desk. Scoped to `ea-` so nothing leaks. */}
      <style>{`
        .ea-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .ea-row { display: flex; align-items: center; gap: 12px; }
        .ea-found { display: flex; align-items: center; gap: 10px; }
        @media (max-width: 560px) {
          .ea-filters { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
          .ea-filters::-webkit-scrollbar { display: none; }
          .ea-filters > button { flex: none; }
          /* Name and action stack rather than squeezing an email to three
             characters and an ellipsis. */
          .ea-found { flex-wrap: wrap; }
          .ea-found > button { width: 100%; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 14px 0" }}>
        <Link
          href="/admin/analytics"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t2, textDecoration: "none", marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Admin
        </Link>

        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: t1, letterSpacing: "-0.01em" }}>
          Early access
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: "19px", color: t2 }}>
          Give one person a template the public cannot see yet. They get it in
          their gallery, their builder opens, and if the template is paid they
          publish without being charged. Everyone else still sees
          &ldquo;Not available yet&rdquo;.
        </p>

        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 12,
            padding: "9px 12px", borderRadius: 12,
            background: "rgba(201,168,76,0.12)", border: `1px solid ${g}55`,
          }}
        >
          <Globe size={15} style={{ color: "#8b5a2b", flex: "none" }} />
          <span style={{ fontSize: 12.5, color: t1 }}>
            Editing <strong>{apiHost}</strong> — grants apply to this deployment only.
          </span>
        </div>

        {/* Hiding is a separate switch and lives elsewhere. Saying so here saves
            the "I granted access and everyone can see it" support round-trip. */}
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: 8, marginTop: 10,
            padding: "9px 12px", borderRadius: 12,
            background: "#fffdfb", border: `1px solid ${cB}`,
          }}
        >
          <EyeOff size={15} style={{ color: tM, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, lineHeight: "18px", color: t2 }}>
            A grant only matters while the template is hidden. Hide it first on{" "}
            <Link href="/admin/templates" style={{ color: "#8b5a2b", fontWeight: 600 }}>
              Template visibility
            </Link>
            . Granting a live template is harmless but does nothing.
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: 15, color: tM }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or slug"
              style={{
                width: "100%", height: 44, paddingLeft: 34, paddingRight: 12,
                borderRadius: 12, border: `1px solid ${cB}`, background: "#fff",
                fontSize: 16, color: t1, outline: "none",
              }}
            />
          </div>

          <div className="ea-filters">
            {([
              ["hidden", `Hidden ${hiddenCount}`],
              ["granted", `Has grants ${grantedCount}`],
              ["all", `All ${CATALOGUE.length}`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOnly(key)}
                style={{
                  minHeight: 44, padding: "0 15px", borderRadius: 12, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                  background: only === key ? bg : "#fff",
                  color: only === key ? "#fdf8ee" : t2,
                  border: `1px solid ${only === key ? bg : cB}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div
            style={{
              display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14,
              padding: "10px 12px", borderRadius: 12,
              background: "rgba(179,38,30,0.08)", border: "1px solid rgba(179,38,30,0.3)",
            }}
          >
            <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: t1 }}>{error}</span>
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div style={{ display: "grid", placeItems: "center", padding: 50 }}>
              <Loader2 size={26} className="animate-spin" style={{ color: g }} />
            </div>
          ) : shown.length === 0 ? (
            <p style={{ padding: "30px 0", textAlign: "center", fontSize: 13.5, color: tM }}>
              {only === "hidden"
                ? "No templates are hidden right now — hide one on Template visibility first."
                : "Nothing matches."}
            </p>
          ) : (
            shown.map((t) => {
              const n = counts[t.slug] || 0;
              const isHidden = publiclyHidden.has(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => void openTemplate(t.slug)}
                  className="ea-row"
                  style={{
                    width: "100%", textAlign: "left", cursor: "pointer",
                    background: "#fffdfb", border: `1px solid ${cB}`,
                    borderRadius: 14, padding: "12px 14px",
                  }}
                >
                  <span style={{ fontSize: 20, flex: "none" }}>{t.emoji}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: t1, lineHeight: "18px" }}>
                      {t.title}
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: tM, fontFamily: "ui-monospace, monospace" }}>
                      {t.slug}
                    </span>
                  </span>

                  <span
                    title={isHidden ? "Hidden from the public" : "Live for everyone"}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, flex: "none",
                      fontSize: 11.5, fontWeight: 600,
                      color: isHidden ? "#8b5a2b" : OK,
                    }}
                  >
                    {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                    {isHidden ? "Hidden" : "Live"}
                  </span>

                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, flex: "none",
                      padding: "5px 10px", borderRadius: 999,
                      background: n > 0 ? "rgba(31,122,77,0.10)" : "#f7eee5",
                      color: n > 0 ? OK : tM,
                      fontSize: 11.5, fontWeight: 700,
                    }}
                  >
                    <Users size={12} />
                    {n}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── The access list for one template ──────────────────────────────── */}
      {openSlug && (
        <>
          <div
            onClick={() => setOpenSlug(null)}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(26,5,7,0.5)", backdropFilter: "blur(4px)" }}
          />
          <div style={{ position: "fixed", inset: 0, zIndex: 61, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0, pointerEvents: "none" }}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Early access for ${openTemplateMeta?.title || openSlug}`}
              style={{
                pointerEvents: "auto",
                width: "100%", maxWidth: 520,
                maxHeight: "min(90dvh, 720px)",
                display: "flex", flexDirection: "column",
                background: "#fffdfb",
                borderTopLeftRadius: 22, borderTopRightRadius: 22,
                border: `1px solid ${cB}`,
                boxShadow: "0 -20px 60px -20px rgba(26,5,7,0.45)",
              }}
            >
              <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${cB}`, flex: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{openTemplateMeta?.emoji}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t1 }}>
                      {openTemplateMeta?.title || openSlug}
                    </div>
                    <div style={{ fontSize: 11.5, color: tM, fontFamily: "ui-monospace, monospace" }}>
                      {openSlug}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenSlug(null)}
                    aria-label="Close"
                    style={{
                      width: 44, height: 44, borderRadius: 999, border: "none",
                      background: "transparent", color: tM, cursor: "pointer",
                      display: "grid", placeItems: "center", flex: "none",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={{ overflowY: "auto", padding: "14px 18px", flex: 1 }}>
                {/* Add somebody */}
                <div style={{ position: "relative" }}>
                  <UserPlus size={15} style={{ position: "absolute", left: 11, top: 15, color: tM }} />
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Find a registered user by name or email"
                    style={{
                      width: "100%", height: 44, paddingLeft: 34, paddingRight: 34,
                      borderRadius: 12, border: `1px solid ${cB}`, background: "#fff",
                      fontSize: 16, color: t1, outline: "none",
                    }}
                  />
                  {searching && (
                    <Loader2 size={15} className="animate-spin" style={{ position: "absolute", right: 12, top: 15, color: tM }} />
                  )}
                </div>

                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 200))}
                  placeholder="Why, optionally — e.g. Sharma wedding demo, 3 Sep"
                  style={{
                    width: "100%", height: 40, marginTop: 8, padding: "0 12px",
                    borderRadius: 11, border: `1px solid ${cB}`, background: "#fff",
                    fontSize: 16, color: t1, outline: "none",
                  }}
                />

                {userQuery.trim().length >= 2 && !searching && found.length === 0 && (
                  <p style={{ margin: "12px 0 0", fontSize: 12.5, color: tM }}>
                    No account matches that. Early access can only be given to someone
                    who has already signed up.
                  </p>
                )}

                {found.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {found.map((u) => {
                      const already = grants.some((x) => x.userId === u._id);
                      return (
                        <div
                          key={u._id}
                          className="ea-found"
                          style={{ padding: "9px 11px", borderRadius: 12, background: "#f7eee5", border: `1px solid ${cB}` }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: t1, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {u.name || "(no name)"}
                            </div>
                            <div style={{ fontSize: 11.5, color: t2, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {u.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={already || busy === u._id}
                            onClick={() => void grant(u)}
                            style={{
                              minHeight: 40, padding: "0 14px", borderRadius: 11, border: "none",
                              background: already ? "#e6dbd0" : bg,
                              color: already ? tM : "#fdf8ee",
                              fontSize: 12.5, fontWeight: 700,
                              cursor: already || busy === u._id ? "default" : "pointer",
                              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                              flex: "none",
                            }}
                          >
                            {busy === u._id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            {already ? "Has access" : "Give access"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Who has it */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tM, marginBottom: 8 }}>
                    Has early access ({grants.length})
                  </div>

                  {grantsLoading ? (
                    <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: g }} />
                    </div>
                  ) : grants.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12.5, color: tM }}>
                      Nobody yet. Find someone above to give them access.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {grants.map((gr) => (
                        <div
                          key={gr.userId || gr.email}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 11px", borderRadius: 12,
                            background: "#fff", border: `1px solid ${cB}`,
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: t1 }}>
                              {gr.name || gr.email}
                            </div>
                            <div style={{ fontSize: 11.5, color: t2, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {gr.email}
                            </div>
                            <div style={{ fontSize: 11, color: tM, marginTop: 2 }}>
                              {gr.grantedByEmail ? `by ${gr.grantedByEmail}` : ""}
                              {gr.createdAt ? ` · ${new Date(gr.createdAt).toLocaleDateString("en-IN")}` : ""}
                              {gr.note ? ` · ${gr.note}` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={busy === gr.userId || !gr.userId}
                            onClick={() => void revoke(gr.userId, gr.email)}
                            title="Revoke"
                            aria-label={`Revoke access for ${gr.email}`}
                            style={{
                              width: 40, height: 40, borderRadius: 11, flex: "none",
                              background: "#fff", border: `1px solid ${cB}`, color: OFF,
                              cursor: busy === gr.userId ? "default" : "pointer",
                              display: "grid", placeItems: "center",
                            }}
                          >
                            {busy === gr.userId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div
          style={{
            position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)",
            background: bg, color: "#fdf8ee", padding: "10px 16px", borderRadius: 999,
            fontSize: 13, fontWeight: 600, zIndex: 80, maxWidth: "90vw", textAlign: "center",
            boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
