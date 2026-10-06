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
import {
  BadgeCheck, ChevronLeft, ChevronRight, Clock3, Gem, Heart, LayoutTemplate, Mail, Phone, PhoneOff, Sparkles, Star, UserPlus, Users,
} from "lucide-react";
import { ROLE_META, RoleIcon, ProviderIcon } from "../adminIcons";
import { useAppSelector } from "@/store/hooks";
import { COUNTRIES, flagOf } from "@/lib/wishlist/countries";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import SaleCountdownPanel, { PROMO_SOURCE_LABEL } from "./SaleCountdownPanel";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, Panel, SearchBox, fmtNum, rise } from "../adminKit";

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
  ...PROMO_SOURCE_LABEL,
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

      {data && <SaleCountdownPanel campaign={data.campaign} accessToken={accessToken} onChange={load} />}

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
          <div className="wl-grid" style={{ opacity: loading ? 0.6 : 1 }}>
            {data.rows.map((r, i) => {
              const rm = ROLE_META[r.role] || ROLE_META.normal;
              const fresh = !!r.accountCreatedAt && new Date(r.joinedAt).getTime() - new Date(r.accountCreatedAt).getTime() < DAY;
              const open = () => { if (!r.deleted) router.push(`/admin/users/${r.userId}`); };
              return (
                <motion.div key={r.userId} className="wlc" {...rise(i)} role="link" tabIndex={r.deleted ? -1 : 0}
                  aria-label={`Open ${r.name || r.email}'s profile`} onClick={open}
                  onKeyDown={(e) => { if (e.key === "Enter") open(); }} data-off={r.deleted ? "1" : "0"}>
                  <span className="wlc-bar" aria-hidden />
                  <div className="wlc-top">
                    <div className="wlc-av">
                      {r.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.avatar} alt="" referrerPolicy="no-referrer" />
                      ) : <span>{initials(r.name, r.email)}</span>}
                      <span className="wlc-prov" title={r.provider === "google" ? "Signed in with Google" : "Signed in with email"}>
                        <ProviderIcon provider={r.provider} size={10} />
                      </span>
                    </div>
                    <div className="wlc-who">
                      <div className="wlc-name">
                        <span className="wlc-role" title={rm.label} style={{ background: `${rm.color}16` }}><RoleIcon role={r.role} size={11} /></span>
                        <b>{r.name || "—"}</b>
                        {r.verified
                          ? <span className="wlc-ic ok" title="Email verified"><BadgeCheck size={13} /></span>
                          : <span className="wlc-dot" title="Email not verified" />}
                        {r.status !== "active" && <span className="wlc-pill bad" title={`Account ${r.status}`}>{r.status}</span>}
                        {r.deleted && <span className="wlc-pill bad">deleted</span>}
                      </div>
                      <div className="wlc-mail">{r.email}</div>
                    </div>
                    <div className="wlc-pos" title={`#${r.position} in line · ${r.discountPercent}% off reserved`}>
                      <Heart size={10} fill="currentColor" />
                      <b>#{r.position}</b>
                      <span>{r.discountPercent}% off</span>
                    </div>
                  </div>

                  <div className="wlc-phone">
                    {r.phone ? (
                      <a href={`tel:${r.phone}`} onClick={(e) => e.stopPropagation()} title="Call">
                        <span className="wlc-flag">{r.phoneCountry ? flagOf(r.phoneCountry) : "📱"}</span>
                        {prettyPhone(r.phone)}
                        <Phone size={11} />
                      </a>
                    ) : <span className="wlc-nophone"><PhoneOff size={11} /> No phone yet</span>}
                  </div>

                  <div className="wlc-foot">
                    <span title={`Joined the wishlist ${new Date(r.joinedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}>
                      <Clock3 size={11} /> {when(r.joinedAt)}
                    </span>
                    <span title={r.pages ? `${r.pages} page${r.pages === 1 ? "" : "s"}, ${r.published} live` : "No pages yet"} data-dim={r.pages ? "0" : "1"}>
                      <LayoutTemplate size={11} /> {r.pages ? <>{r.pages}<i> · {r.published} live</i></> : "No pages"}
                    </span>
                    {r.paidOrders > 0 && <span className="paid" title={`${r.paidOrders} paid order${r.paidOrders === 1 ? "" : "s"}`}><Gem size={11} /> {r.paidOrders}</span>}
                    {r.feedbackCount > 0 && <span className="star" title={`${r.feedbackCount} rating${r.feedbackCount === 1 ? "" : "s"}`}><Star size={11} fill="#e0a526" color="#e0a526" /> {r.feedbackCount}</span>}
                    {fresh && <span className="new" title="Signed up the day they joined"><UserPlus size={11} /> new</span>}
                    {!r.deleted && <ChevronRight size={14} className="wlc-go" />}
                  </div>
                </motion.div>
              );
            })}
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
.wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr)); gap: 9px; transition: opacity .2s ease; }
.wlc { position: relative; overflow: hidden; padding: 11px 12px 9px 14px; border-radius: 16px; cursor: pointer; text-align: left;
  background: ${A.paper}; border: 1px solid ${A.edge}; box-shadow: 0 6px 18px -14px rgba(61,12,17,.45);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.wlc[data-off="1"] { cursor: default; opacity: .7; }
.wlc:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -18px rgba(122,16,40,.55); border-color: rgba(179,36,63,.22); }
.wlc:active { transform: scale(.99); }
.wlc:focus-visible { outline: 2px solid #b3243f; outline-offset: 2px; }
.wlc-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #e0435f, #8a1430); }
.wlc-top { display: flex; align-items: center; gap: 10px; }
.wlc-av { position: relative; flex: none; width: 40px; height: 40px; }
.wlc-av img, .wlc-av > span:first-child { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; object-fit: cover;
  background: linear-gradient(135deg, #d13a59, #7a1028); color: #fff; font: 800 14px/1 'Inter', system-ui, sans-serif; }
.wlc-prov { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 50%; background: #fff; display: grid; place-items: center;
  box-shadow: 0 1px 4px rgba(61,12,17,.25); }
.wlc-who { flex: 1; min-width: 0; }
.wlc-name { display: flex; align-items: center; gap: 5px; min-width: 0; }
.wlc-name b { font: 800 13.5px/1.2 'Inter', system-ui, sans-serif; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wlc-role { flex: none; width: 18px; height: 18px; border-radius: 6px; display: grid; place-items: center; }
.wlc-ic.ok { flex: none; color: ${A.ok}; display: inline-flex; }
.wlc-dot { flex: none; width: 6px; height: 6px; border-radius: 50%; background: #d97706; }
.wlc-pill { flex: none; padding: 2px 6px; border-radius: 99px; font: 800 9px/1.2 'Inter', system-ui, sans-serif; text-transform: uppercase; letter-spacing: .06em; }
.wlc-pill.bad { color: ${A.danger}; background: rgba(179,38,30,.1); }
.wlc-mail { margin-top: 1px; color: ${A.muted}; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wlc-pos { flex: none; min-width: 48px; padding: 5px 7px 4px; border-radius: 11px; text-align: center; color: #b3243f;
  background: linear-gradient(160deg, #fff1ee, #ffe2dc); border: 1px solid rgba(179,36,63,.2); display: flex; flex-direction: column; align-items: center; gap: 1px; }
.wlc-pos b { font: 700 14px/1 'Playfair Display', serif; color: #7a1028; }
.wlc-pos span { font: 800 8px/1 'Inter', system-ui, sans-serif; letter-spacing: .04em; color: #b3243f; white-space: nowrap; }
.wlc-phone { margin: 8px 0 0 50px; min-height: 18px; }
.wlc-phone a { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px 3px 7px; border-radius: 99px; text-decoration: none;
  color: #7a1028; background: rgba(179,36,63,.06); border: 1px solid rgba(179,36,63,.14); font: 700 12px/1.3 'Inter', system-ui, sans-serif; font-variant-numeric: tabular-nums; }
.wlc-phone a:hover { background: rgba(179,36,63,.12); }
.wlc-phone a svg { opacity: .7; }
.wlc-flag { font-size: 13px; line-height: 1; }
.wlc-nophone { display: inline-flex; align-items: center; gap: 5px; color: ${A.muted}; font: 600 11px/1.3 'Inter', system-ui, sans-serif; }
.wlc-foot { display: flex; align-items: center; gap: 4px 11px; flex-wrap: wrap; margin-top: 8px; padding-top: 7px; border-top: 1px dashed ${A.edge};
  color: ${A.soft}; font: 600 10.5px/1.2 'Inter', system-ui, sans-serif; }
.wlc-foot > span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.wlc-foot > span svg { color: ${A.goldDeep}; }
.wlc-foot > span[data-dim="1"] { color: ${A.muted}; }
.wlc-foot i { font-style: normal; color: ${A.muted}; font-weight: 500; }
.wlc-foot .paid { color: ${A.info}; } .wlc-foot .paid svg { color: ${A.info}; }
.wlc-foot .star { color: #b7791f; }
.wlc-foot .new { color: #b3243f; } .wlc-foot .new svg { color: #b3243f; }
.wlc-go { margin-left: auto; color: ${A.muted}; }
.wl-pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 14px; color: ${A.soft}; font-size: 12.5px; }
.wl-pager button { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; border: 1px solid ${A.edge}; background: ${A.paper}; cursor: pointer; }
.wl-pager button:disabled { opacity: .4; cursor: default; }
`;
