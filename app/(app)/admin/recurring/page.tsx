"use client";

/**
 * Returning creators.
 *
 * ── WHAT THIS ANSWERS ───────────────────────────────────────────────────────
 *
 * "Did anyone come back?" — the one retention question this product has. A
 * person is counted as returning when they created a page on one calendar day
 * and came back on a DIFFERENT day to create another. Three cards for three
 * cousins in one sitting is one visit, not a return, and the server computes it
 * that way (see controllers/adminRetention.controller.ts).
 *
 * Every row opens that person's full profile, so this screen is a way in rather
 * than a dead-end list.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { motion } from "framer-motion";
import { Repeat, Users, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { A, AdminPage, Panel, Hero, HeroStat, ChipGroup, SearchBox, Loading, EmptyState, Tag, Num, rise } from "../adminKit";

const cB = "rgba(61,12,17,0.08)";
const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const gD = "#8b5a2b";
const bg = "#3d0c11";

interface Row {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status?: string;
  joinedAt: string;
  pages: number;
  activeDays: number;
  firstPageAt: string;
  lastPageAt: string;
  spanDays: number;
  daysSinceLast: number;
  templates: { slug: string; count: number }[];
}
interface Summary {
  creators: number;
  recurring: number;
  oneTime: number;
  recurringRate: number;
  medianGapDays: number;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function AdminRecurringPage() {
  const { accessToken } = useAppSelector((s) => s.auth);

  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const [segment, setSegment] = useState<"recurring" | "once" | "all">("recurring");
  const [minDays, setMinDays] = useState(2);
  const [sort, setSort] = useState<"lastAt" | "days" | "pages" | "gap">("lastAt");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams({
        page: String(page), limit: "25", segment, minDays: String(minDays), sort,
      });
      if (search.trim()) qs.set("search", search.trim());
      const res = await fetch(`${API_URL}/admin/users/recurring?${qs}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const j = await res.json();
      if (!res.ok || !j.success) {
        // The endpoint is super-admin only; say which it is rather than
        // rendering an empty table that looks like "nobody came back".
        setErr(j?.error || `Could not load (${res.status})`);
        setRows([]);
        return;
      }
      setRows(j.data.users);
      setSummary(j.data.summary);
      setTotal(j.data.pagination.total);
      setPages(j.data.pagination.pages);
    } catch {
      setErr("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, segment, minDays, sort, search]);

  useEffect(() => { void load(); }, [load]);
  // Any filter change puts you back on page 1 — page 4 of a different query is
  // almost always empty, and an empty table reads as "no data".
  useEffect(() => { setPage(1); }, [segment, minDays, sort, search]);

  return (
    <AdminPage
      title="Returning creators"
      subtitle="People who made something, went away, and came back on a different day to make something else. Several pages in one sitting count as one visit."
      icon={<Repeat size={18} />}
      width={1180}
    >
      <style>{`
        .rc-hero { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px 12px; align-items: end; }
        @media (min-width: 720px) { .rc-hero { grid-template-columns: 1.3fr repeat(3,minmax(0,1fr)); } }
        .rc-bar { height: 6px; border-radius: 99px; background: rgba(255,255,255,.14); overflow: hidden; margin-top: 12px; }
        .rc-ctrl { display: flex; flex-direction: column; gap: 8px; }
        .rc-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .rc-lbl { flex: none; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${tM}; width: 44px; }
        .rc-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(min(100%,300px),1fr)); gap: 8px; }
        .rc-facts { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; margin-top: 9px; padding-top: 8px; border-top: 1px dashed ${cB}; }
      `}</style>

      {summary && (
        /*
          One hero strip rather than four tiles: the numbers stay the first
          thing you see on a phone and the list starts above the fold.
        */
        <Hero>
          <div className="rc-hero">
            <HeroStat big label="Came back" value={summary.recurring} sub={`${summary.oneTime} made one and stopped`} />
            <HeroStat label="Creators" value={summary.creators} sub="made at least one page" />
            <HeroStat label="Return rate" value={`${summary.recurringRate}%`} sub="of everyone who created" tone="#ffe3a3" />
            <HeroStat label="Median gap" value={`${summary.medianGapDays}d`} sub="first page → latest" />
          </div>
          <div className="rc-bar" aria-hidden>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, summary.recurringRate)}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${g}, #ffe3a3)` }}
            />
          </div>
        </Hero>
      )}

      {/* Controls */}
      <Panel pad={12} delay={0.05} style={{ marginBottom: 12 }}>
        <div className="rc-ctrl">
          <SearchBox value={search} onChange={setSearch} placeholder="Search name or email…" />
          <div className="rc-row">
            <span className="rc-lbl">Who</span>
            <ChipGroup
              id="rc-seg"
              value={segment}
              onChange={setSegment}
              style={{ flex: 1 }}
              options={[
                { value: "recurring", label: "Came back" },
                { value: "once", label: "One-time only" },
                { value: "all", label: "Everyone who created" },
              ]}
            />
          </div>
          {segment === "recurring" && (
            <div className="rc-row">
              <span className="rc-lbl">Days</span>
              <ChipGroup
                id="rc-days"
                value={minDays}
                onChange={setMinDays}
                style={{ flex: 1 }}
                options={[2, 3, 5, 10].map((d) => ({ value: d, label: `${d}+ separate days` }))}
              />
            </div>
          )}
          <div className="rc-row">
            <span className="rc-lbl">Sort</span>
            <ChipGroup
              id="rc-sort"
              value={sort}
              onChange={setSort}
              style={{ flex: 1 }}
              options={[
                { value: "lastAt", label: "Most recent first" },
                { value: "days", label: "Most days active" },
                { value: "pages", label: "Most pages" },
                { value: "gap", label: "Longest span" },
              ]}
            />
          </div>
        </div>
      </Panel>

      {err && (
        <div style={{ background: "#fff4f4", border: "1px solid #f0c9c9", color: "#b3261e", padding: "11px 14px", borderRadius: 12, fontSize: 13, marginBottom: 12, overflowWrap: "anywhere" }}>
          {err}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 2px 8px", fontSize: 12, color: tM, fontWeight: 700 }}>
        <Users size={13} color={g} />
        {loading ? "Loading…" : <><Num value={total} /> {total === 1 ? "person" : "people"}</>}
      </div>

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Repeat size={20} />}
          title={segment === "recurring" ? "Nobody has come back on a second day yet." : "No one here."}
        />
      ) : (
        /*
          Cards, not a table.

          A table forced every person onto one line, which meant the two
          things this screen exists to show — how many separate days they
          came back, and which templates they came back FOR — were squeezed
          into narrow columns and truncated. A card gives each person a block
          with room for all of it, and the grid reflows to one column on a
          phone without a horizontal scrollbar.
        */
        <div className="rc-grid">
          {rows.map((r, i) => {
            const initial = (r.name || r.email || "?").trim().charAt(0).toUpperCase();
            // Cold after a month without creating anything — the one number on
            // the card that is a prompt to do something.
            const cold = r.daysSinceLast > 30;
            return (
              <motion.div key={r.userId} {...rise(i)} style={{ minWidth: 0 }}>
                <Link href={`/admin/users/${r.userId}`} className="adk-card" style={{ textDecoration: "none", height: "100%" }}>
                  <span aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: cold ? "#b3261e" : g, opacity: 0.8 }} />
                  {/* Identity + the headline number */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {r.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar} alt="" style={{ width: 38, height: 38, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: `linear-gradient(135deg,${g},${gD})`, color: "#fff",
                        display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15,
                      }}>{initial}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: t1, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name || "—"}
                      </div>
                      <div style={{ color: tM, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.email}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        minWidth: 40, padding: "3px 9px", borderRadius: 10,
                        background: `linear-gradient(135deg, ${A.maroon2}, ${bg})`, color: "#ffe3a3",
                        fontWeight: 800, fontSize: 16, lineHeight: 1.25, fontFamily: "'Playfair Display',serif",
                      }}>{r.activeDays}</div>
                      <div style={{ fontSize: 9, color: tM, fontWeight: 800, letterSpacing: ".04em", marginTop: 2 }}>DAYS</div>
                    </div>
                  </div>

                  {/* The dates, as a row of small facts */}
                  <div className="rc-facts">
                    {[
                      { k: "Pages", v: String(r.pages) },
                      { k: "Span", v: `${r.spanDays}d` },
                      { k: "Last seen", v: `${r.daysSinceLast}d ago` },
                    ].map((c) => (
                      <div key={c.k} style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9, color: tM, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase" }}>{c.k}</div>
                        <div style={{
                          fontSize: 12.5, fontWeight: 800, marginTop: 1,
                          color: c.k === "Last seen" && cold ? "#b3261e" : t1,
                        }}>{c.v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 7, fontSize: 11, color: t2, fontWeight: 600 }}>
                    {fmt(r.firstPageAt)} <span style={{ color: g }}>→</span> {fmt(r.lastPageAt)}
                  </div>

                  {/* What they came back FOR */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {r.templates.slice(0, 4).map((t) => (
                      <Tag key={t.slug} style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.slug}{t.count > 1 ? ` ×${t.count}` : ""}
                      </Tag>
                    ))}
                    {r.templates.length > 4 && (
                      <span style={{ fontSize: 10, color: tM, alignSelf: "center" }}>+{r.templates.length - 4} more</span>
                    )}
                  </div>

                  <div style={{
                    marginTop: 9, paddingTop: 8, borderTop: `1px dashed ${cB}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}>
                    <span style={{ fontSize: 10.5, color: tM }}>joined {fmt(r.joinedAt)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: bg, fontWeight: 800, fontSize: 11.5, whiteSpace: "nowrap" }}>
                      Open profile <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "14px 0 4px" }}>
          <button className="adk-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: 12, color: tM, fontWeight: 700 }}>Page {page} of {pages}</span>
          <button className="adk-btn" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </AdminPage>
  );
}
