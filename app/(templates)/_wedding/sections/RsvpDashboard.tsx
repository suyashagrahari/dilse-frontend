"use client";
// ─── <RsvpDashboard> — the owner's guest list (editor / "My pages") ──────────
//
//   <RsvpDashboard slug="wedding-invitation-premium" pageId={pageId} token={accessToken} />
//
// GET /<slug>-pages/:id/guests (owner auth): totals tiles, per-function heads,
// a searchable / filterable list, blessings moderation (hide / show), CSV
// export, and a refresh. Renders inside any container; wrap it in a
// <WeddingRoot background={false}> to theme it (it falls back to neutral).

import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadGuestsCsv, fetchGuests, moderateBlessing, type GuestsData } from "../api";
import type { Attending } from "../types";
import { WeddingKitStyles } from "../WeddingRoot";

export interface RsvpDashboardProps {
  slug: string;
  pageId: string;
  /** The owner's access token. */
  token: string | null | undefined;
  /** File name stem for the CSV ("Ananya-Rohan"). */
  csvName?: string;
  className?: string;
}

const FILTERS: { v: "all" | Attending; label: string }[] = [
  { v: "all", label: "All" },
  { v: "yes", label: "Coming" },
  { v: "maybe", label: "Maybe" },
  { v: "no", label: "Can't come" },
];

const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
};

export default function RsvpDashboard({ slug, pageId, token, csvName = "rsvps", className }: RsvpDashboardProps) {
  const [data, setData] = useState<GuestsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | Attending>("all");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"rsvps" | "blessings">("rsvps");

  const fetchNow = useCallback(() => {
    if (!token || !pageId) return Promise.resolve();
    return fetchGuests(slug, pageId, token).then((r) => {
      setLoading(false);
      if (r.ok) {
        setData(r.data);
        setError("");
      } else setError(r.error);
    });
  }, [slug, pageId, token]);

  const load = () => {
    setLoading(true);
    void fetchNow();
  };

  useEffect(() => {
    void fetchNow();
  }, [fetchNow]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.rsvps ?? []).filter((r) => (filter === "all" || r.attending === filter) && (!s || r.guestName.toLowerCase().includes(s) || (r.phone ?? "").includes(s)));
  }, [data, filter, q]);

  const toggle = async (id: string, approved: boolean) => {
    if (!token || !data) return;
    setData({ ...data, blessings: data.blessings.map((b) => (b.id === id ? { ...b, approved } : b)) });
    const r = await moderateBlessing(slug, pageId, token, id, approved);
    if (!r.ok) {
      setError(r.error);
      void load();
    }
  };

  if (!token) return <p className={`wk-dash-empty ${className ?? ""}`}>Sign in to see your RSVPs.</p>;
  const t = data?.totals;
  const labels = data?.eventLabels ?? {};
  const eventIds = Object.keys(labels);

  return (
    <div className={`wk-dash ${className ?? ""}`}>
      <WeddingKitStyles />
      <div className="wk-dash-head">
        <h3>Guests</h3>
        <div className="wk-dash-acts">
          <button type="button" className="wk-dash-btn" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" className="wk-dash-btn is-primary" disabled={!data?.rsvps.length} onClick={() => void downloadGuestsCsv(slug, pageId, token, csvName)}>
            Export CSV
          </button>
        </div>
      </div>
      {error && <p className="wk-err">{error}</p>}
      {!data && !error && <div className="wk-dash-skel" aria-busy="true" />}
      {t && (
        <>
          <div className="wk-dash-tiles">
            <div className="wk-dash-tile is-hero">
              <b>{t.heads}</b>
              <span>guests coming</span>
            </div>
            <div className="wk-dash-tile">
              <b>{t.attending}</b>
              <span>yes</span>
            </div>
            <div className="wk-dash-tile">
              <b>{t.maybe}</b>
              <span>maybe</span>
            </div>
            <div className="wk-dash-tile">
              <b>{t.declined}</b>
              <span>can&apos;t come</span>
            </div>
          </div>
          {eventIds.length > 0 && data?.features.rsvpPerEvent && (
            <div className="wk-dash-events">
              {eventIds.map((id) => {
                const n = t.perEvent[id] ?? 0;
                const pct = t.heads ? Math.round((n / t.heads) * 100) : 0;
                return (
                  <div key={id} className="wk-dash-ev">
                    <span className="wk-dash-evName">{labels[id]}</span>
                    <span className="wk-dash-bar">
                      <i style={{ width: `${pct}%` }} />
                    </span>
                    <b>{n}</b>
                  </div>
                );
              })}
            </div>
          )}
          {(t.meals.veg || t.meals.nonveg || t.meals.jain) > 0 && (
            <p className="wk-dash-meals">
              Meals — veg {t.meals.veg} · non-veg {t.meals.nonveg} · Jain {t.meals.jain}
            </p>
          )}

          {data?.features.blessings && (
            <div className="wk-dash-tabs" role="tablist">
              <button role="tab" aria-selected={tab === "rsvps"} className={tab === "rsvps" ? "is-on" : ""} onClick={() => setTab("rsvps")}>
                RSVPs ({data.rsvps.length})
              </button>
              <button role="tab" aria-selected={tab === "blessings"} className={tab === "blessings" ? "is-on" : ""} onClick={() => setTab("blessings")}>
                Blessings ({data.blessings.length})
              </button>
            </div>
          )}

          {tab === "rsvps" ? (
            <>
              <div className="wk-dash-filters">
                <input className="wk-dash-search" placeholder="Search a name or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search guests" />
                <div className="wk-dash-chips">
                  {FILTERS.map((f) => (
                    <button key={f.v} type="button" className={filter === f.v ? "is-on" : ""} onClick={() => setFilter(f.v)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {rows.length === 0 ? (
                <p className="wk-dash-empty">{data?.rsvps.length ? "No guests match." : "No RSVPs yet — share your invitation and they'll appear here."}</p>
              ) : (
                <ul className="wk-dash-list">
                  {rows.map((r) => (
                    <li key={r.id} className={`wk-dash-row is-${r.attending}`}>
                      <div className="wk-dash-who">
                        <b>{r.guestName}</b>
                        <span className={`wk-dash-pill is-${r.attending}`}>{r.attending === "yes" ? `Coming · ${r.guests}` : r.attending === "maybe" ? `Maybe · ${r.guests}` : "Can't come"}</span>
                      </div>
                      {(r.events.length > 0 || r.meal || r.phone) && (
                        <p className="wk-dash-meta">
                          {[r.events.map((e) => labels[e] || e).join(", "), r.meal, r.phone].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {r.message && <p className="wk-dash-msg">“{r.message}”</p>}
                      <time className="wk-dash-when">{when(r.updatedAt || r.createdAt)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <ul className="wk-dash-list">
              {(data?.blessings ?? []).map((b) => (
                <li key={b.id} className={`wk-dash-row${b.approved === false ? " is-hidden" : ""}`}>
                  <div className="wk-dash-who">
                    <b>{b.name}</b>
                    <button type="button" className="wk-dash-btn" onClick={() => void toggle(b.id, b.approved === false)}>
                      {b.approved === false ? "Show on page" : "Hide"}
                    </button>
                  </div>
                  <p className="wk-dash-msg">{b.message}</p>
                  <time className="wk-dash-when">{when(b.createdAt)}</time>
                </li>
              ))}
              {!data?.blessings.length && <p className="wk-dash-empty">No blessings yet.</p>}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
