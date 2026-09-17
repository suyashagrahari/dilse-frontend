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
import {
  Search, Repeat, Users, CalendarClock, ChevronLeft, ChevronRight,
  ArrowUpRight, Loader2, Percent,
} from "lucide-react";

const cB = "rgba(61,12,17,0.08)";
const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
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

  const Stat = ({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) => (
    <div style={{ background: "#fff", border: `1px solid ${cB}`, borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: tM, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: t1, marginTop: 5, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: tM, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const selBase: React.CSSProperties = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${cB}`,
    background: "#fff", color: t1, fontSize: 13, fontWeight: 600,
  };

  return (
    <div style={{ padding: "22px 18px 70px", maxWidth: 1180, margin: "0 auto" }}>
      <style>{`
        .rc-card:hover { box-shadow: 0 10px 26px -14px rgba(61,12,17,.35); transform: translateY(-1px); }
      `}</style>
      <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 9 }}>
        <Repeat size={20} style={{ color: g }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t1, margin: 0 }}>Returning creators</h1>
      </div>
      <p style={{ color: t2, fontSize: 13, margin: "0 0 18px" }}>
        People who made something, went away, and came back on a different day to make something else.
        Several pages in one sitting count as one visit.
      </p>

      {summary && (
        /*
          A grid, not a wrapping flex row.

          With `flex: 1 1 170px` each of these grew to full width as soon as
          four could not fit, so a phone got four stacked banners of mostly
          whitespace and the list itself started below the fold. Two columns on
          a phone, four on a laptop, and the numbers stay the first thing you
          see either way.
        */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))",
          gap: 9, marginBottom: 16,
        }}>
          <Stat icon={<Users size={12} />} label="Creators" value={String(summary.creators)} hint="have made at least one page" />
          <Stat icon={<Repeat size={12} />} label="Came back" value={String(summary.recurring)} hint={`${summary.oneTime} made one and stopped`} />
          <Stat icon={<Percent size={12} />} label="Return rate" value={`${summary.recurringRate}%`} hint="of everyone who ever created" />
          <Stat icon={<CalendarClock size={12} />} label="Median gap" value={`${summary.medianGapDays}d`} hint="first page → latest page" />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 14, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: tM }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            style={{ ...selBase, width: "100%", paddingLeft: 34, fontWeight: 500 }}
          />
        </div>

        <select value={segment} onChange={(e) => setSegment(e.target.value as typeof segment)} style={selBase}>
          <option value="recurring">Came back</option>
          <option value="once">One-time only</option>
          <option value="all">Everyone who created</option>
        </select>

        <select
          value={minDays}
          onChange={(e) => setMinDays(Number(e.target.value))}
          disabled={segment !== "recurring"}
          style={{ ...selBase, opacity: segment === "recurring" ? 1 : 0.45 }}
        >
          <option value={2}>2+ separate days</option>
          <option value={3}>3+ separate days</option>
          <option value={5}>5+ separate days</option>
          <option value={10}>10+ separate days</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={selBase}>
          <option value="lastAt">Most recent first</option>
          <option value="days">Most days active</option>
          <option value="pages">Most pages</option>
          <option value="gap">Longest span</option>
        </select>
      </div>

      {err && (
        <div style={{ background: "#fff4f4", border: "1px solid #f0c9c9", color: "#b3261e", padding: "11px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
          {err}
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${cB}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${cB}`, fontSize: 12, color: tM, fontWeight: 700 }}>
          {loading ? "Loading…" : `${total} ${total === 1 ? "person" : "people"}`}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: tM }}>
            <Loader2 size={22} className="animate-spin" style={{ margin: "0 auto" }} />
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: tM, fontSize: 13 }}>
            {segment === "recurring"
              ? "Nobody has come back on a second day yet."
              : "No one here."}
          </div>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))",
              gap: 10,
              padding: 12,
            }}
          >
            {rows.map((r) => {
              const initial = (r.name || r.email || "?").trim().charAt(0).toUpperCase();
              // Cold after a month without creating anything — the one number on
              // the card that is a prompt to do something.
              const cold = r.daysSinceLast > 30;
              return (
                <Link
                  key={r.userId}
                  href={`/admin/users/${r.userId}`}
                  style={{
                    display: "block", textDecoration: "none",
                    border: `1px solid ${cB}`, borderRadius: 14,
                    background: "#fffdfb", padding: 13,
                    transition: "box-shadow .15s, transform .15s",
                  }}
                  className="rc-card"
                >
                  {/* Identity + the headline number */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {r.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar} alt="" style={{ width: 38, height: 38, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: `${g}1f`, color: "#8b5a2b",
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
                        minWidth: 40, padding: "3px 9px", borderRadius: 9,
                        background: `${g}22`, color: "#8b5a2b",
                        fontWeight: 800, fontSize: 16, lineHeight: 1.25,
                      }}>{r.activeDays}</div>
                      <div style={{ fontSize: 9, color: tM, fontWeight: 700, letterSpacing: ".04em", marginTop: 2 }}>DAYS</div>
                    </div>
                  </div>

                  {/* The dates, as a row of small facts */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6,
                    marginTop: 11, paddingTop: 10, borderTop: `1px solid ${cB}`,
                  }}>
                    {[
                      { k: "Pages", v: String(r.pages) },
                      { k: "Span", v: `${r.spanDays}d` },
                      { k: "Last seen", v: `${r.daysSinceLast}d ago` },
                    ].map((c) => (
                      <div key={c.k}>
                        <div style={{ fontSize: 9, color: tM, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>{c.k}</div>
                        <div style={{
                          fontSize: 12.5, fontWeight: 700, marginTop: 1,
                          color: c.k === "Last seen" && cold ? "#b3261e" : t1,
                        }}>{c.v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 8, fontSize: 11, color: t2 }}>
                    {fmt(r.firstPageAt)} <span style={{ color: tM }}>→</span> {fmt(r.lastPageAt)}
                  </div>

                  {/* What they came back FOR */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 9 }}>
                    {r.templates.slice(0, 4).map((t) => (
                      <span key={t.slug} style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 7,
                        background: "#f6f1ea", color: t2, whiteSpace: "nowrap",
                      }}>
                        {t.slug}{t.count > 1 ? ` ×${t.count}` : ""}
                      </span>
                    ))}
                    {r.templates.length > 4 && (
                      <span style={{ fontSize: 10, color: tM, alignSelf: "center" }}>+{r.templates.length - 4} more</span>
                    )}
                  </div>

                  <div style={{
                    marginTop: 10, paddingTop: 9, borderTop: `1px solid ${cB}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 10.5, color: tM }}>joined {fmt(r.joinedAt)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: bg, fontWeight: 700, fontSize: 11.5 }}>
                      Open profile <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderTop: `1px solid ${cB}` }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ ...selBase, opacity: page <= 1 ? 0.4 : 1, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 12, color: tM }}>Page {page} of {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}
              style={{ ...selBase, opacity: page >= pages ? 0.4 : 1, display: "inline-flex", alignItems: "center", gap: 4 }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
