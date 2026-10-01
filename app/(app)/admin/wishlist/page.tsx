"use client";

// ─── Super admin: who joined a wishlist ──────────────────────────────────────
//
// Everyone who asked to hear about a coming collection (Valentine's week
// first): when they joined, where they tapped from, how they sign in, whether
// they already make pages or pay — and a click through to their full profile.
// "Email them" opens Outreach with the same people already selected, so the
// launch mail goes to exactly this list.
//
// Super admin only, like Outreach: the page checks the role and the server
// refuses everyone else (`requireSuperAdmin`).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Heart, Mail, Sparkles, UserPlus, Users } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { COUNTRIES, flagOf } from "@/lib/wishlist/countries";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, Panel, SearchBox, Tag, fmtNum, rise } from "../adminKit";

interface Row {
  userId: string;
  position: number;
  joinedAt: string;
  source: string | null;
  phone: string | null;
  phoneCountry: string | null;
  discountPercent: number;
  name: string;
  email: string;
  avatar: string | null;
  provider: string;
  verified: boolean;
  role: string;
  status: string;
  accountCreatedAt: string | null;
  deleted: boolean;
  pages: number;
  published: number;
  paidOrders: number;
  feedbackCount: number;
}

interface Resp {
  campaign: string;
  campaigns: { key: string; label: string; discountPercent: number }[];
  stats: {
    total: number; today: number; last7: number; google: number; verified: number; withPhone: number;
    creators: number; paid: number; newSignups: number; sources: { source: string; n: number }[];
  };
  rows: Row[];
  total: number;
  page: number;
  pages: number;
}

const SOURCE_LABEL: Record<string, string> = {
  "wishlist-page": "Wishlist page",
  unknown: "Unknown",
};

const DAY = 86_400_000;

function when(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < DAY) return `${Math.floor(d / 3_600_000)}h ago`;
  if (d < 7 * DAY) return `${Math.floor(d / DAY)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** "+919876543210" → "+91 98765 43210" (longest matching dial code wins). */
function prettyPhone(e164: string) {
  const dial = COUNTRIES.map((c) => c.dial).filter((d) => e164.startsWith(d)).sort((a, b) => b.length - a.length)[0];
  if (!dial) return e164;
  const n = e164.slice(dial.length);
  return `${dial} ${n.length === 10 ? `${n.slice(0, 5)} ${n.slice(5)}` : n}`;
}

function initials(name: string, email: string) {
  const src = name.trim() || email;
  return src.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

export default function AdminWishlistPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const [allowed, setAllowed] = useState(false);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState<"any" | "google" | "local">("any");
  const [kind, setKind] = useState<"any" | "creators" | "new" | "paid">("any");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) { router.replace("/admin/analytics"); return; }
    setAllowed(true);
  }, [user, isLoading, router]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  const load = useCallback(async () => {
    if (!allowed || !accessToken) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "25" });
      if (q) p.set("q", q);
      if (provider !== "any") p.set("provider", provider);
      if (kind !== "any") p.set("kind", kind);
      const res = await fetch(`${API_URL}/admin/wishlist?${p}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load");
      setData(json.data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [allowed, accessToken, page, q, provider, kind]);
  useEffect(() => { void load(); }, [load]);

  if (!allowed) return <Loading label="Checking access…" h={320} />;

  const st = data?.stats;
  const camp = data?.campaigns.find((c) => c.key === data.campaign);

  return (
    <AdminPage
      title="Wishlist"
      subtitle={<>Everyone who joined the <b>{camp?.label ?? "Valentine's week"}</b> wishlist and was promised <b>{camp?.discountPercent ?? 30}% off</b>. Open anyone&apos;s profile, or email the whole list from Outreach — the same people, already selected.</>}
      icon={<Heart size={18} />}
      actions={
        <Link href="/admin/outreach?segment=valentine" className="wl-mail">
          <Mail size={14} /> Email them
        </Link>
      }
      width={1180}
    >
      <style>{WL_CSS}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="Joined" value={st?.total ?? 0} sub={st ? <>{fmtNum(st.today)} today · {fmtNum(st.last7)} this week</> : "—"} />
          <HeroStat label="New sign-ups" value={st?.newSignups ?? 0} sub="joined within a day of signing up" />
          <HeroStat label="Already creators" value={st?.creators ?? 0} sub="have made a page" />
          <HeroStat label="Paid before" value={st?.paid ?? 0} sub="at least one order" />
        </div>
      </Hero>

      {st && st.total > 0 && (
        <div className="wl-sources" aria-label="Who joined and where from">
          <span className="wl-src">Google sign-in <b>{fmtNum(st.google)}</b></span>
          <span className="wl-src">Email sign-in <b>{fmtNum(st.total - st.google)}</b></span>
          <span className="wl-src">Verified <b>{fmtNum(st.verified)}</b></span>
          <span className="wl-src">📱 Phone given <b>{fmtNum(st.withPhone)}</b></span>
          {st.sources.map((s) => (
            <span key={s.source} className="wl-src">
              <Sparkles size={11} /> {SOURCE_LABEL[s.source] ?? s.source} <b>{fmtNum(s.n)}</b>
            </span>
          ))}
        </div>
      )}

      <Panel title="People" icon={<Users size={15} color={A.goldDeep} />} note={data ? `${fmtNum(data.total)} shown` : undefined}>
        <div className="wl-controls">
          <SearchBox value={qInput} onChange={setQInput} placeholder="Search name, email or phone…" />
          <ChipGroup id="wl-kind" value={kind} onChange={(v) => { setKind(v); setPage(1); }} options={[
            { value: "any", label: "Everyone" },
            { value: "new", label: <><UserPlus size={12} /> New sign-ups</> },
            { value: "creators", label: "Creators" },
            { value: "paid", label: "💎 Paid" },
          ]} />
          <ChipGroup id="wl-prov" value={provider} onChange={(v) => { setProvider(v); setPage(1); }} options={[
            { value: "any", label: "Any sign-in" },
            { value: "google", label: "Google" },
            { value: "local", label: "Email" },
          ]} />
        </div>

        {error && <div className="wl-err">{error}</div>}

        {loading && !data ? (
          <Loading label="Loading the wishlist…" />
        ) : !data || data.rows.length === 0 ? (
          <EmptyState icon={<Heart size={22} />} title={q || kind !== "any" || provider !== "any" ? "Nobody matches" : "No one has joined yet"}
            note={q || kind !== "any" || provider !== "any" ? "Try clearing a filter." : "Joins appear here the moment they happen."} />
        ) : (
          <div className="wl-list" style={{ opacity: loading ? 0.6 : 1 }}>
            {data.rows.map((r, i) => (
              <motion.div key={r.userId} className="wl-row" {...rise(i)}>
                <span className="wl-pos">#{r.position}</span>
                <span className="wl-av">
                  {r.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar} alt="" referrerPolicy="no-referrer" />
                  ) : initials(r.name, r.email)}
                </span>
                <div className="wl-who">
                  <div className="wl-name">
                    {r.name || "—"}
                    {r.role !== "normal" && <Tag tone={A.info}>{r.role === "superadmin" ? "Super admin" : r.role === "admin" ? "Admin" : r.role === "member" ? "Member" : r.role}</Tag>}
                    {r.status !== "active" && <Tag tone={A.danger}>{r.status}</Tag>}
                    {r.deleted && <Tag tone={A.danger}>deleted</Tag>}
                  </div>
                  <div className="wl-mailtxt">{r.email}</div>
                  {r.phone ? (
                    <a className="wl-phone" href={`tel:${r.phone}`}>
                      {r.phoneCountry ? flagOf(r.phoneCountry) : "📱"} {prettyPhone(r.phone)}
                    </a>
                  ) : <span className="wl-nophone">No phone</span>}
                  <div className="wl-tags">
                    <Tag tone={r.provider === "google" ? "#1a73e8" : A.goldDeep}>{r.provider === "google" ? "Google" : "Email"}</Tag>
                    {r.verified ? <Tag tone={A.ok}>Verified</Tag> : <Tag tone={A.warn}>Unverified</Tag>}
                    {r.accountCreatedAt && new Date(r.joinedAt).getTime() - new Date(r.accountCreatedAt).getTime() < DAY && <Tag tone="#b3243f">New sign-up</Tag>}
                    {r.pages > 0 ? <Tag>{r.pages} page{r.pages === 1 ? "" : "s"} · {r.published} live</Tag> : <Tag tone={A.muted}>No pages yet</Tag>}
                    {r.paidOrders > 0 && <Tag tone={A.info}>💎 {r.paidOrders} paid</Tag>}
                    {r.feedbackCount > 0 && <Tag tone={A.warn}>★ {r.feedbackCount} rating{r.feedbackCount === 1 ? "" : "s"}</Tag>}
                  </div>
                </div>
                <div className="wl-when">
                  <b>{when(r.joinedAt)}</b>
                  <span>{SOURCE_LABEL[r.source ?? "unknown"] ?? r.source}</span>
                </div>
                {!r.deleted && (
                  <Link href={`/admin/users/${r.userId}`} className="wl-open" aria-label={`Open ${r.name || r.email}'s profile`}>
                    Profile <ExternalLink size={12} />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="wl-pager">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button>
            <span>Page {data.page} of {data.pages}</span>
            <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight size={15} /></button>
          </div>
        )}
      </Panel>
    </AdminPage>
  );
}

const WL_CSS = `
.wl-mail { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 99px; text-decoration: none; white-space: nowrap;
  color: #3d0c11; background: linear-gradient(135deg, #fff1c9, #f0cd7c 50%, #c99a45); font: 800 12.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 8px 18px -10px rgba(246,213,138,.9); }
.wl-sources { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
.wl-src { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 99px; background: rgba(179,36,63,.07);
  border: 1px solid rgba(179,36,63,.18); color: #7a1028; font: 600 11.5px/1 'Inter', system-ui, sans-serif; }
.wl-src b { color: #2a0a0e; }
.wl-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
.wl-controls > .adk-chips { max-width: 100%; }
.wl-controls .adk-search input { font-size: 16px; }
.wl-err { margin-bottom: 10px; padding: 10px 12px; border-radius: 12px; background: rgba(179,38,30,.08); color: ${A.danger}; font-size: 12.5px; }
.wl-list { display: flex; flex-direction: column; gap: 8px; transition: opacity .2s ease; }
.wl-row { display: grid; grid-template-columns: auto auto minmax(0,1fr) auto auto; align-items: center; gap: 12px; padding: 12px 14px;
  border-radius: 16px; background: ${A.paper}; border: 1px solid ${A.edge}; }
.wl-pos { font: 700 13px/1 'Playfair Display', serif; color: #b3243f; min-width: 34px; }
.wl-av { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; flex-shrink: 0;
  background: linear-gradient(140deg, #d13a59, #7a1028); color: #fff4f1; font: 700 13px/1 'Inter', system-ui, sans-serif; }
.wl-av img { width: 100%; height: 100%; object-fit: cover; }
.wl-who { min-width: 0; }
.wl-name { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; color: ${A.ink}; font: 700 14px/1.2 'Inter', system-ui, sans-serif; }
.wl-mailtxt { margin-top: 2px; color: ${A.soft}; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wl-phone { display: inline-flex; align-items: center; gap: 5px; margin-top: 3px; color: #7a1028; font: 700 12.5px/1.2 'Inter', system-ui, sans-serif; text-decoration: none; }
.wl-phone:hover { text-decoration: underline; }
.wl-nophone { display: inline-block; margin-top: 3px; color: ${A.muted}; font-size: 11.5px; }
.wl-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
.wl-when { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; text-align: right; }
.wl-when b { color: ${A.ink}; font-size: 12.5px; }
.wl-when span { color: ${A.muted}; font-size: 11px; }
.wl-open { display: inline-flex; align-items: center; gap: 5px; padding: 7px 11px; border-radius: 99px; text-decoration: none;
  border: 1px solid rgba(61,12,17,.16); color: ${A.maroon}; font: 700 12px/1 'Inter', system-ui, sans-serif; }
.wl-open:hover { background: rgba(61,12,17,.05); }
.wl-pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 14px; color: ${A.soft}; font-size: 12.5px; }
.wl-pager button { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; border: 1px solid ${A.edge}; background: ${A.paper}; cursor: pointer; }
.wl-pager button:disabled { opacity: .4; cursor: default; }
@media (max-width: 720px) {
  .wl-row { grid-template-columns: auto minmax(0,1fr) auto; grid-template-areas: "av who open" "av when when"; row-gap: 6px; }
  .wl-pos { display: none; }
  .wl-av { grid-area: av; align-self: start; }
  .wl-who { grid-area: who; }
  .wl-open { grid-area: open; align-self: start; }
  .wl-when { grid-area: when; flex-direction: row; justify-content: flex-start; gap: 8px; align-items: center; }
}
`;
