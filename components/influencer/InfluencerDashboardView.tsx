"use client";

// ─── The influencer dashboard ────────────────────────────────────────────────
//
// One view, two audiences: the influencer at /influencer (emails masked, can
// edit their UPI/Instagram) and the super admin at /admin/influencers/:id
// (emails shown, plus the `adminSlot` with rate/status/payout controls).
//
// Order is by what an influencer opens it to learn: how much have I made →
// my links → is it working → who exactly came and what did they make.

import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, Wallet, Clock, Copy, Check, Share2, MousePointerClick, UserPlus, Sparkles,
  Crown, Percent, ChevronDown, Search, Link2, Instagram, Youtube, AlertTriangle, Users, Receipt, Settings, Loader2,
} from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BRAND } from "@/lib/brand";
import {
  type InfluencerDashboard,
  type ReferredUser,
  rupees,
  influencerLinks,
  displayLink,
  fmtDate,
} from "@/lib/influencer";

type Tab = "people" | "earnings" | "payouts" | "settings";

export default function InfluencerDashboardView({
  data,
  mode,
  adminSlot,
  onSaveProfile,
}: {
  data: InfluencerDashboard;
  mode: "self" | "admin";
  adminSlot?: ReactNode;
  onSaveProfile?: (p: { instagram: string; upiId: string }) => Promise<string | null>;
}) {
  const [tab, setTab] = useState<Tab>("people");
  const { profile, totals, stats } = data;
  const code = profile.subdomain || profile.referralCode;
  const links = influencerLinks(code);
  const first = profile.name.split(" ")[0];

  const tabs: { id: Tab; label: string; icon: ReactNode; count?: number }[] = [
    { id: "people", label: "People", icon: <Users size={15} />, count: data.referrals.length },
    { id: "earnings", label: "Earnings", icon: <Receipt size={15} />, count: data.earnings.length },
    { id: "payouts", label: "Payouts", icon: <Wallet size={15} />, count: data.payouts.length },
    ...(mode === "self" ? [{ id: "settings" as Tab, label: "UPI", icon: <Settings size={15} /> }] : []),
  ];
  const goal = nextGoal(totals.earnedPaise);

  return (
    <div className="idb">
      <style>{CSS}</style>

      {profile.status === "suspended" && (
        <div className="idb-banner">
          <AlertTriangle size={16} />
          {mode === "self"
            ? "Your influencer account is paused. Your link isn't tracking new signups right now. Contact support if you think this is a mistake."
            : "Paused: this link isn't tracking new signups, and new payments earn nothing."}
        </div>
      )}

      {/* ── Earnings hero ── */}
      <motion.section className="idb-hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <span aria-hidden className="idb-orb" />
        <div className="idb-hero-top">
          <div className="idb-ava">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span>{first.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="idb-kicker"><Crown size={12} /> Influencer Hub</p>
            <h1 className="idb-name">{mode === "self" ? `Hi ${first}, here's how you're doing` : profile.name}</h1>
            {mode === "admin" && <p className="idb-sub">{profile.email}</p>}
          </div>
          <span className="idb-rate"><Percent size={13} /> {profile.commissionPercent}% commission</span>
        </div>

        <div className="idb-money">
          <div className="idb-money-main">
            <span className="idb-money-label"><IndianRupee size={13} /> Total earned</span>
            <span className="idb-money-big">{rupees(totals.earnedPaise)}</span>
            <span className="idb-money-note">from {rupees(totals.revenuePaise)} paid by your referrals</span>
          </div>
          <div className="idb-money-side">
            <div>
              <span className="idb-money-label"><Clock size={13} /> Pending payout</span>
              <span className="idb-money-mid" style={{ color: "#f2cf74" }}>{rupees(totals.pendingPaise)}</span>
            </div>
            <div>
              <span className="idb-money-label"><Wallet size={13} /> Paid to you</span>
              <span className="idb-money-mid">{rupees(totals.paidOutPaise)}</span>
            </div>
          </div>
        </div>

        <div className="idb-goal">
          <div className="idb-goal-top">
            <span>{totals.earnedPaise >= goal.target ? "Every goal smashed 🎉" : <>Next goal: <b>{rupees(goal.target)}</b></>}</span>
            <span>{goal.pct}%</span>
          </div>
          <div className="idb-goal-bar"><motion.span initial={{ width: 0 }} animate={{ width: `${goal.pct}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} /></div>
          {totals.earnedPaise < goal.target && (
            <span className="idb-goal-hint">
              About {Math.max(1, Math.ceil((goal.target - totals.earnedPaise) / Math.max(1, (14900 * profile.commissionPercent) / 100)))} more premium sales to go
            </span>
          )}
        </div>
      </motion.section>

      {adminSlot}

      {/* ── Links ── */}
      <section className="idb-card">
        <div className="idb-card-head">
          <Link2 size={16} />
          <h2>{mode === "self" ? "Your invite links" : "Invite links"}</h2>
        </div>
        <div className="idb-links">
          {links.nameLink && <LinkRow label="Name link" url={links.nameLink} primary />}
          {links.shortLink && <LinkRow label={links.nameLink ? "Short link" : "Your link"} url={links.shortLink} primary={!links.nameLink} />}
        </div>
        {mode === "self" && <ShareKit link={links.nameLink || links.shortLink || ""} />}
        {mode === "self" && (
          <BioIdeas link={displayLink(links.nameLink || links.shortLink || "")} percent={profile.commissionPercent} />
        )}
      </section>

      {/* ── Stats ── */}
      <section className="idb-stats">
        <Stat icon={<MousePointerClick size={15} />} label="Link opens" value={stats.clicks} />
        <Stat icon={<UserPlus size={15} />} label="Signups" value={stats.signups} sub={stats.clicks ? `${stats.conversionPercent}% of opens` : undefined} />
        <Stat icon={<Sparkles size={15} />} label="Templates made" value={stats.pages} sub={`by ${stats.creators} ${stats.creators === 1 ? "person" : "people"}`} />
        <Stat icon={<Crown size={15} />} label="Paid templates" value={stats.paidPages} sub={`${stats.freePages} free`} accent={BRAND.ok} />
      </section>

      {/* ── Activity ── */}
      <section className="idb-card">
        <div className="idb-card-head">
          <Sparkles size={16} />
          <h2>Last 30 days</h2>
          <span className="idb-legend">
            <i style={{ background: "rgba(201,168,76,.55)" }} /> Opens
            <i style={{ background: BRAND.accentStrong }} /> Signups
            <i style={{ background: BRAND.ok, height: 3 }} /> Earned
          </span>
        </div>
        <ActivityChart daily={data.daily} />
      </section>

      {/* ── Tabs ── */}
      <nav className="idb-tabs" role="tablist" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
            {tab === t.id && <motion.span layoutId={`idb-tab-${mode}`} className="idb-tab-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="idb-tab-in">{t.icon}<span className="idb-tab-label">{t.label}</span>{typeof t.count === "number" && t.count > 0 && <b>{t.count}</b>}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          {tab === "people" && <People referrals={data.referrals} mode={mode} />}
          {tab === "earnings" && <Earnings rows={data.earnings} />}
          {tab === "payouts" && <Payouts rows={data.payouts} pending={totals.pendingPaise} upi={profile.upiId} mode={mode} />}
          {tab === "settings" && onSaveProfile && (
            <ProfileSettings instagram={profile.instagram || ""} upiId={profile.upiId || ""} onSave={onSaveProfile} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string = text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };
  return { copied, copy };
}

/** "https://priya.subhsandesh.in" → bold "priya", muted ".subhsandesh.in". */
function LinkText({ url }: { url: string }) {
  const shown = displayLink(url);
  const r = shown.indexOf("/r/");
  if (r >= 0) {
    return (<><span className="idb-url-dim">{shown.slice(0, r + 3)}</span><b>{shown.slice(r + 3)}</b></>);
  }
  const dot = shown.indexOf(".");
  if (dot > 0) return (<><b>{shown.slice(0, dot)}</b><span className="idb-url-dim">{shown.slice(dot)}</span></>);
  return <b>{shown}</b>;
}

function LinkRow({ label, url, primary }: { label: string; url: string; primary?: boolean }) {
  const { copied, copy } = useCopy();
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const done = copied === url;
  return (
    <div className={`idb-link ${primary ? "primary" : ""}`}>
      <div className="idb-link-text">
        <span className="idb-link-label">{label}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="idb-link-url" title={url}>
          <LinkText url={url} />
        </a>
      </div>
      <button type="button" className={`idb-icon-btn ${done ? "done" : ""}`} onClick={() => copy(url)} aria-label={`Copy ${label}`}>
        {done ? <Check size={14} /> : <Copy size={14} />}
        <span className="idb-icon-txt">{done ? "Copied" : "Copy"}</span>
      </button>
      {canShare && (
        <button type="button" className="idb-icon-btn" aria-label={`Share ${label}`} onClick={() => navigator.share({ url, title: "SubhSandesh", text: "Make a heartfelt digital surprise 💌" }).catch(() => {})}>
          <Share2 size={14} />
        </button>
      )}
    </div>
  );
}

const GOALS = [50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000];

/** The first milestone not yet reached, in paise, and progress toward it. */
function nextGoal(earned: number) {
  const target = GOALS.find((g) => g > earned) ?? GOALS[GOALS.length - 1];
  const prev = [...GOALS].reverse().find((g) => g <= earned) ?? 0;
  const pct = earned >= target ? 100 : Math.round(((earned - prev) / (target - prev)) * 100);
  return { target, pct: Math.max(earned > 0 ? 3 : 0, pct) };
}

function ShareKit({ link }: { link: string }) {
  const { copied, copy } = useCopy();
  const text = `Make a surprise they'll never forget 💌 ${link}`;
  const items: { key: string; label: string; icon: ReactNode; bg: string; onClick: () => void }[] = [
    {
      key: "wa",
      label: "WhatsApp",
      icon: <WhatsAppGlyph />,
      bg: "linear-gradient(135deg,#25d366,#128c7e)",
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener"),
    },
    {
      key: "ig",
      label: copied === "ig" ? "Copied!" : "Instagram",
      icon: <Instagram size={18} />,
      bg: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
      // Instagram has no share-with-text URL: copy the link for the bio/sticker, then open the app.
      onClick: () => { void copy(link, "ig"); setTimeout(() => window.open("https://instagram.com/", "_blank", "noopener"), 400); },
    },
    {
      key: "yt",
      label: copied === "yt" ? "Copied!" : "YouTube",
      icon: <Youtube size={18} />,
      bg: "linear-gradient(135deg,#ff0000,#b30000)",
      onClick: () => void copy(`🎁 Make yours here: ${link}`, "yt"),
    },
    {
      key: "x",
      label: "X",
      icon: <span style={{ fontWeight: 900, fontSize: 15 }}>𝕏</span>,
      bg: "linear-gradient(135deg,#111,#333)",
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener"),
    },
  ];
  return (
    <div className="idb-sharekit">
      {items.map((it) => (
        <button key={it.key} type="button" onClick={it.onClick} className="idb-share-btn">
          <span style={{ background: it.bg }}>{it.icon}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2S21.8 6.6 21.8 12 17.4 21.8 12 21.8zm0-21.6C5.5.2.2 5.5.2 12c0 2.1.5 4.1 1.6 5.9L.1 23.9l6.2-1.6c1.7.9 3.7 1.4 5.7 1.4 6.5 0 11.8-5.3 11.8-11.8S18.5.2 12 .2z" />
    </svg>
  );
}

function BioIdeas({ link, percent }: { link: string; percent: number }) {
  const { copied, copy } = useCopy();
  const [open, setOpen] = useState(false);
  const ideas = [
    `💌 Make a surprise they'll never forget 👉 ${link}`,
    `🎁 Birthday, sorry, proposal: make it digital & magical ✨ ${link}`,
    `Made something special for my person 💕 Make yours: ${link}`,
  ];
  return (
    <div className="idb-bio">
      <button type="button" className="idb-bio-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Instagram size={13} /> Caption & bio ideas <span className="idb-bio-count">{ideas.length}</span>
        <ChevronDown size={14} className="idb-bio-chev" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="idb-bio-list">
              {ideas.map((t) => (
                <button key={t} type="button" className="idb-bio-line" onClick={() => copy(t)}>
                  <span>{t}</span>
                  {copied === t ? <Check size={13} color={BRAND.ok} /> : <Copy size={13} />}
                </button>
              ))}
              <p className="idb-bio-note">Tap a line to copy it. Tip: post a reel of a template you made, then pin your link. You earn {percent}% of every paid template.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon, label, value, sub, accent = BRAND.gold }: { icon: ReactNode; label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className="idb-stat" style={{ ["--acc" as string]: accent }}>
      <span className="idb-stat-ic">{icon}</span>
      <span className="idb-stat-label">{label}</span>
      <span className="idb-stat-val">{value.toLocaleString("en-IN")}</span>
      {sub && <span className="idb-stat-sub">{sub}</span>}
    </div>
  );
}

function ActivityChart({ daily }: { daily: InfluencerDashboard["daily"] }) {
  const rows = daily.map((d) => ({ ...d, earned: d.earnedPaise / 100, label: d.day.slice(8) + "/" + d.day.slice(5, 7) }));
  const empty = rows.every((r) => !r.clicks && !r.signups && !r.earned);
  return (
    <div className="idb-chart" style={{ position: "relative" }}>
      {empty && <p className="idb-chart-empty">Share your link: activity shows up here as soon as someone opens it.</p>}
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 170 }}>
        <ComposedChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="rgba(61,12,17,0.06)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: BRAND.faint }} interval={4} tickLine={false} axisLine={false} />
          <YAxis yAxisId="n" allowDecimals={false} tick={{ fontSize: 10, fill: BRAND.faint }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="r" orientation="right" hide />
          <Tooltip
            cursor={{ fill: "rgba(201,168,76,0.08)" }}
            contentStyle={{ borderRadius: 12, border: `1px solid ${BRAND.border}`, fontSize: 12 }}
            formatter={(v, name) => (name === "Earned" ? [`₹${Number(v).toLocaleString("en-IN")}`, name] : [v, name])}
          />
          <Bar yAxisId="n" dataKey="clicks" name="Opens" fill="rgba(201,168,76,0.55)" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="n" dataKey="signups" name="Signups" fill={BRAND.accentStrong} radius={[4, 4, 0, 0]} />
          <Line yAxisId="r" type="monotone" dataKey="earned" name="Earned" stroke={BRAND.ok} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function KindPill({ kind, published }: { kind: "paid" | "points" | "free"; published: boolean }) {
  if (!published) return <span className="idb-pill draft">Draft</span>;
  if (kind === "paid") return <span className="idb-pill paid"><Crown size={10} /> Paid</span>;
  if (kind === "points") return <span className="idb-pill pts">Points</span>;
  return <span className="idb-pill free">Free</span>;
}

function People({ referrals, mode }: { referrals: ReferredUser[]; mode: "self" | "admin" }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "made" | "none">("all");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return referrals.filter((r) => {
      if (s && !r.name.toLowerCase().includes(s) && !r.email.toLowerCase().includes(s)) return false;
      if (filter === "paid") return r.paidPages > 0;
      if (filter === "made") return r.pages.length > 0;
      if (filter === "none") return r.pages.length === 0;
      return true;
    });
  }, [referrals, q, filter]);

  if (!referrals.length) {
    return (
      <div className="idb-empty">
        <UserPlus size={26} />
        <p className="t">No signups yet</p>
        <p>{mode === "self" ? "When someone creates an account through your link, they show up here with every template they make." : "Nobody has signed up through this link yet."}</p>
      </div>
    );
  }

  return (
    <div className="idb-card" style={{ padding: 12 }}>
      <div className="idb-tools">
        <label className="idb-search">
          <Search size={14} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" />
        </label>
        <div className="idb-filters">
          {([
            ["all", "All"],
            ["paid", "Paid"],
            ["made", "Made a template"],
            ["none", "Not yet"],
          ] as const).map(([v, l]) => (
            <button key={v} type="button" className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <ul className="idb-people">
        {list.map((r) => {
          const isOpen = open === r.id;
          return (
            <li key={r.id} className={isOpen ? "open" : ""}>
              <button type="button" className="idb-person" onClick={() => setOpen(isOpen ? null : r.id)} aria-expanded={isOpen}>
                <span className="idb-person-ava">{r.name.charAt(0).toUpperCase()}</span>
                <span className="idb-person-main">
                  <b>{r.name}</b>
                  <span>{r.email} · joined {fmtDate(r.joinedAt)}</span>
                </span>
                <span className="idb-person-meta">
                  <span className="idb-chip">{r.pages.length} made</span>
                  {r.paidPages > 0 && <span className="idb-chip ok">{r.paidPages} paid</span>}
                  {r.earnedPaise > 0 && <span className="idb-earned">+{rupees(r.earnedPaise)}</span>}
                </span>
                <ChevronDown size={16} className="idb-chev" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                    {r.pages.length === 0 ? (
                      <p className="idb-nopages">Signed up but hasn&apos;t made a template yet.</p>
                    ) : (
                      <ul className="idb-pages">
                        {r.pages.map((p) => (
                          <li key={p.id}>
                            <span className="idb-page-name">{p.templateLabel}</span>
                            <span className="idb-page-date">{fmtDate(p.createdAt)}</span>
                            <KindPill kind={p.kind} published={p.isPublished || p.kind === "paid"} />
                            <span className="idb-page-money">
                              {p.kind === "paid" ? (
                                <>
                                  {rupees(p.amountPaise)} <b>+{rupees(p.commissionPaise)}</b>
                                </>
                              ) : (
                                "—"
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
        {!list.length && <li className="idb-nopages">No one matches.</li>}
      </ul>
    </div>
  );
}

function Earnings({ rows }: { rows: InfluencerDashboard["earnings"] }) {
  if (!rows.length) {
    return (
      <div className="idb-empty">
        <IndianRupee size={26} />
        <p className="t">No earnings yet</p>
        <p>Every time someone you referred pays for a template, the commission appears here.</p>
      </div>
    );
  }
  return (
    <div className="idb-card" style={{ padding: 0, overflow: "hidden" }}>
      <ul className="idb-ledger">
        {rows.map((e) => (
          <li key={e.id}>
            <span className="idb-ledger-ic"><IndianRupee size={14} /></span>
            <span className="idb-ledger-main">
              <b>{e.referredUserName}</b>
              <span>{e.templateLabel} · {fmtDate(e.createdAt)}</span>
            </span>
            <span className="idb-ledger-calc">{rupees(e.amountPaise)} × {e.commissionPercent}%</span>
            <span className="idb-ledger-amt">+{rupees(e.commissionPaise)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Payouts({ rows, pending, upi, mode }: { rows: InfluencerDashboard["payouts"]; pending: number; upi?: string; mode: "self" | "admin" }) {
  return (
    <div className="idb-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="idb-payout-head">
        <span><Clock size={14} /> Pending: <b>{rupees(pending)}</b></span>
        <span className="idb-upi">{upi ? <>UPI: <b>{upi}</b></> : mode === "self" ? "Add your UPI ID in Payout details to get paid" : "No UPI ID added yet"}</span>
      </div>
      {rows.length === 0 ? (
        <p className="idb-nopages" style={{ padding: 16 }}>No payouts yet. Earnings are paid out to your UPI by the SubhSandesh team.</p>
      ) : (
        <ul className="idb-ledger">
          {rows.map((p) => (
            <li key={p.id}>
              <span className="idb-ledger-ic" style={{ background: "rgba(58,167,109,.12)", color: BRAND.ok }}><Wallet size={14} /></span>
              <span className="idb-ledger-main">
                <b>Paid to you</b>
                <span>{fmtDate(p.paidAt)}{p.note ? ` · ${p.note}` : ""}</span>
              </span>
              <span className="idb-ledger-amt" style={{ color: BRAND.text }}>{rupees(p.amountPaise)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProfileSettings({ instagram, upiId, onSave }: { instagram: string; upiId: string; onSave: (p: { instagram: string; upiId: string }) => Promise<string | null> }) {
  const [ig, setIg] = useState(instagram);
  const [upi, setUpi] = useState(upiId);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [err, setErr] = useState<string | null>(null);
  const dirty = ig !== instagram || upi !== upiId;
  return (
    <div className="idb-card">
      <label className="idb-label"><Wallet size={14} /> UPI ID</label>
      <input className="idb-input" value={upi} onChange={(e) => { setUpi(e.target.value.trim()); setState("idle"); }} placeholder="name@okaxis" />
      <p className="idb-help">Your earnings are sent here. Only the SubhSandesh team can see it.</p>
      <label className="idb-label"><Instagram size={14} /> Instagram username</label>
      <input className="idb-input" value={ig} onChange={(e) => { setIg(e.target.value.replace(/\s/g, "")); setState("idle"); }} placeholder="yourhandle" />
      <p className="idb-help">Shown on your invite page.</p>
      {err && <p className="idb-err">{err}</p>}
      <button
        type="button"
        className="idb-save"
        disabled={!dirty || state === "saving"}
        onClick={async () => {
          setState("saving");
          setErr(null);
          const e = await onSave({ instagram: ig, upiId: upi });
          if (e) { setErr(e); setState("idle"); } else setState("saved");
        }}
      >
        {state === "saving" ? <Loader2 size={15} className="idb-spin" /> : state === "saved" ? <Check size={15} /> : null}
        {state === "saved" && !dirty ? "Saved" : "Save"}
      </button>
    </div>
  );
}

const CSS = `
  .idb { display: flex; flex-direction: column; gap: 14px; }
  .idb-banner { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: rgba(161,53,64,.08); border: 1px solid rgba(161,53,64,.25); color: ${BRAND.danger}; font-size: 13.5px; font-weight: 600; line-height: 1.5; }
  .idb-hero { position: relative; overflow: hidden; padding: 22px; border-radius: 24px; background: ${BRAND.gradient}; color: #f5ede6; box-shadow: ${BRAND.shadowElevated}; }
  .idb-orb { position: absolute; width: 320px; height: 320px; right: -110px; top: -140px; border-radius: 50%; background: radial-gradient(circle, rgba(242,207,116,.28), transparent 65%); pointer-events: none; }
  .idb-hero-top { position: relative; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .idb-ava { width: 52px; height: 52px; border-radius: 50%; padding: 2px; background: linear-gradient(135deg, #f2cf74, #c9a84c); flex-shrink: 0; }
  .idb-ava img, .idb-ava span { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: flex; align-items: center; justify-content: center; background: #5a1520; font: 700 22px 'Playfair Display', serif; color: #f5ede6; border: 2px solid #3d0c11; box-sizing: border-box; }
  .idb-kicker { display: inline-flex; align-items: center; gap: 5px; margin: 0; font-size: 10.5px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #f2cf74; }
  .idb-name { margin: 3px 0 0; font-family: 'Playfair Display', serif; font-size: clamp(19px, 2.6vw, 25px); line-height: 1.2; overflow-wrap: anywhere; }
  .idb-sub { margin: 2px 0 0; font-size: 12.5px; color: rgba(245,237,230,.7); }
  .idb-rate { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 99px; background: rgba(242,207,116,.14); border: 1px solid rgba(242,207,116,.3); color: #f2cf74; font-size: 12.5px; font-weight: 800; white-space: nowrap; }
  .idb-money { position: relative; display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 12px; margin-top: 18px; }
  .idb-money-main, .idb-money-side > div { display: flex; flex-direction: column; gap: 3px; padding: 14px 16px; border-radius: 18px; background: rgba(255,255,255,.07); border: 1px solid rgba(242,207,116,.16); }
  .idb-money-side { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .idb-money-label { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: rgba(245,237,230,.7); }
  .idb-money-big { font: 700 clamp(34px, 6vw, 48px)/1.05 'Playfair Display', serif; color: #fff; }
  .idb-money-mid { font: 700 24px/1.1 'Playfair Display', serif; color: #fff; }
  .idb-money-note { font-size: 12px; color: rgba(245,237,230,.65); }
  .idb-card { padding: 16px; border-radius: 20px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; }
  .idb-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: ${BRAND.accent}; flex-wrap: wrap; }
  .idb-card-head h2 { margin: 0; font-size: 14px; font-weight: 800; color: ${BRAND.text}; }
  .idb-legend { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: ${BRAND.muted}; font-weight: 700; }
  .idb-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-left: 6px; }
  .idb-links { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .idb-link { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 6px; min-width: 0; padding: 8px 8px 8px 12px; border-radius: 12px; background: ${BRAND.bgAlt}; border: 1px solid ${BRAND.border}; }
  .idb-link.primary { background: linear-gradient(135deg, rgba(201,168,76,.14), rgba(201,168,76,.04)); border-color: rgba(201,168,76,.4); }
  .idb-link-text { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .idb-link-label { font-size: 9.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: ${BRAND.faint}; }
  .idb-link-url { display: block; min-width: 0; font-size: 14px; color: ${BRAND.accentStrong}; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .idb-link-url b { font-weight: 800; }
  .idb-url-dim { font-weight: 600; color: ${BRAND.faint}; }
  .idb-icon-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 32px; min-width: 32px; padding: 0 10px; border-radius: 99px; border: 1px solid ${BRAND.borderStrong}; background: ${BRAND.surface}; color: ${BRAND.accentStrong}; font-weight: 800; font-size: 12px; cursor: pointer; transition: background .15s, color .15s; }
  .idb-icon-btn.done { background: ${BRAND.ok}; border-color: ${BRAND.ok}; color: #fff; }
  .idb-bio { margin-top: 10px; padding-top: 8px; border-top: 1px dashed ${BRAND.borderStrong}; min-width: 0; }
  .idb-bio-toggle { width: 100%; display: flex; align-items: center; gap: 6px; padding: 4px 2px; border: none; background: none; cursor: pointer; font-size: 12.5px; font-weight: 800; color: ${BRAND.muted}; }
  .idb-bio-count { font-size: 10px; padding: 1px 6px; border-radius: 99px; background: rgba(201,168,76,.2); color: ${BRAND.accent}; }
  .idb-bio-chev { margin-left: auto; transition: transform .2s; }
  .idb-bio-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 5px; padding-top: 6px; }
  .idb-bio-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; text-align: left; padding: 8px 10px; border-radius: 10px; border: 1px solid ${BRAND.border}; background: ${BRAND.bgAlt}; color: ${BRAND.text}; font-size: 12.5px; line-height: 1.4; cursor: pointer; }
  .idb-bio-line span { min-width: 0; overflow-wrap: anywhere; }
  .idb-bio-line svg { flex-shrink: 0; color: ${BRAND.faint}; }
  .idb-bio-note { margin: 2px 2px 0; font-size: 11.5px; color: ${BRAND.muted}; line-height: 1.45; }
  .idb-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .idb-chart { height: 210px; }
  @media (min-width: 768px) { .idb-tabs { top: 84px; } }
  .idb-goal { position: relative; margin-top: 14px; padding: 12px 14px; border-radius: 16px; background: rgba(0,0,0,.18); }
  .idb-goal-top { display: flex; justify-content: space-between; gap: 8px; font-size: 12.5px; color: rgba(245,237,230,.8); font-weight: 700; }
  .idb-goal-top b { color: #f2cf74; }
  .idb-goal-bar { margin-top: 8px; height: 8px; border-radius: 99px; background: rgba(255,255,255,.12); overflow: hidden; }
  .idb-goal-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #c9a84c, #f2cf74, #ffe7a8); box-shadow: 0 0 12px rgba(242,207,116,.6); }
  .idb-goal-hint { display: block; margin-top: 6px; font-size: 11.5px; color: rgba(245,237,230,.6); }
  .idb-sharekit { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
  .idb-share-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 2px; border-radius: 12px; border: 1px solid ${BRAND.border}; background: ${BRAND.bgAlt}; color: ${BRAND.text}; font-size: 11px; font-weight: 800; cursor: pointer; transition: transform .15s; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .idb-share-btn:active { transform: scale(.96); }
  .idb-share-btn > span { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; }
  .idb-stat { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 14px; border-radius: 18px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; overflow: hidden; }
  .idb-stat::after { content: ""; position: absolute; right: -24px; top: -24px; width: 70px; height: 70px; border-radius: 50%; background: var(--acc); opacity: .12; }
  .idb-stat-ic { width: 30px; height: 30px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--acc) 16%, transparent); color: ${BRAND.accent}; margin-bottom: 6px; }
  .idb-stat-label { font-size: 11.5px; font-weight: 800; color: ${BRAND.muted}; }
  .idb-stat-val { font: 700 26px/1.1 'Playfair Display', serif; color: ${BRAND.text}; }
  .idb-stat-sub { font-size: 11.5px; color: ${BRAND.faint}; }
  .idb-chart-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0 24px; margin: 0; font-size: 13px; color: ${BRAND.muted}; z-index: 1; pointer-events: none; }
  .idb-tabs { display: grid; gap: 4px; padding: 4px; border-radius: 99px; background: ${BRAND.surfaceAlt}; border: 1px solid ${BRAND.border}; position: sticky; top: 8px; z-index: 5; box-shadow: 0 8px 20px -14px rgba(61,12,17,.35); }
  .idb-tabs button { position: relative; min-width: 0; border: none; background: none; padding: 10px 6px; border-radius: 99px; cursor: pointer; color: ${BRAND.muted}; font-weight: 800; font-size: 13px; }
  .idb-tabs button.on { color: #f5ede6; }
  .idb-tab-pill { position: absolute; inset: 0; border-radius: 99px; background: ${BRAND.accentStrong}; }
  .idb-tab-in { position: relative; display: inline-flex; align-items: center; gap: 6px; }
  .idb-tab-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .idb-tab-in { min-width: 0; max-width: 100%; justify-content: center; width: 100%; }
  .idb-tab-in b { font-size: 10.5px; padding: 1px 6px; border-radius: 99px; background: rgba(201,168,76,.25); }
  .idb-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 36px 20px; border-radius: 20px; background: ${BRAND.surface}; border: 1px dashed ${BRAND.borderStrong}; color: ${BRAND.muted}; }
  .idb-empty svg { color: ${BRAND.gold}; }
  .idb-empty p { margin: 4px 0 0; max-width: 380px; font-size: 13px; line-height: 1.5; }
  .idb-empty p.t { margin-top: 10px; font-size: 15px; font-weight: 800; color: ${BRAND.text}; }
  .idb-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
  .idb-search { flex: 1; min-width: 180px; display: flex; align-items: center; gap: 6px; height: 38px; padding: 0 12px; border-radius: 99px; background: ${BRAND.bgAlt}; border: 1px solid ${BRAND.border}; color: ${BRAND.faint}; }
  .idb-search input { flex: 1; min-width: 0; border: none; outline: none; background: none; font-size: 13.5px; color: ${BRAND.text}; }
  .idb-filters { display: flex; gap: 4px; flex-wrap: wrap; }
  .idb-filters button { border: 1px solid ${BRAND.border}; background: ${BRAND.surface}; color: ${BRAND.muted}; font-weight: 800; font-size: 12px; padding: 7px 11px; border-radius: 99px; cursor: pointer; }
  .idb-filters button.on { background: ${BRAND.accentStrong}; color: #f5ede6; border-color: ${BRAND.accentStrong}; }
  .idb-people { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .idb-people > li { border-radius: 14px; border: 1px solid ${BRAND.border}; background: ${BRAND.surface}; overflow: hidden; }
  .idb-people > li.open { border-color: rgba(201,168,76,.45); }
  .idb-person { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; background: none; cursor: pointer; text-align: left; }
  .idb-person-ava { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(201,168,76,.18); color: ${BRAND.accent}; font-weight: 800; }
  .idb-person-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .idb-person-main b { font-size: 14px; color: ${BRAND.text}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .idb-person-main span { font-size: 11.5px; color: ${BRAND.faint}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .idb-person-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; justify-content: flex-end; }
  .idb-chip { font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 99px; background: ${BRAND.surfaceAlt}; color: ${BRAND.muted}; white-space: nowrap; }
  .idb-chip.ok { background: rgba(58,167,109,.12); color: ${BRAND.ok}; }
  .idb-earned { font-size: 13px; font-weight: 800; color: ${BRAND.ok}; white-space: nowrap; }
  .idb-chev { color: ${BRAND.faint}; transition: transform .2s; flex-shrink: 0; }
  .idb-people > li.open .idb-chev { transform: rotate(180deg); }
  .idb-pages { list-style: none; margin: 0; padding: 0 12px 10px 58px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .idb-pages li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; gap: 10px; align-items: center; padding: 7px 10px; border-radius: 10px; background: ${BRAND.bgAlt}; font-size: 12.5px; }
  .idb-page-name { font-weight: 700; color: ${BRAND.text}; overflow-wrap: anywhere; }
  .idb-page-date { color: ${BRAND.faint}; font-size: 11.5px; white-space: nowrap; }
  .idb-page-money { white-space: nowrap; color: ${BRAND.muted}; font-weight: 700; min-width: 64px; text-align: right; }
  .idb-page-money b { color: ${BRAND.ok}; }
  .idb-pill { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 99px; white-space: nowrap; }
  .idb-pill.paid { background: rgba(58,167,109,.14); color: ${BRAND.ok}; }
  .idb-pill.free { background: rgba(139,90,43,.1); color: ${BRAND.accent}; }
  .idb-pill.pts { background: rgba(109,74,209,.1); color: #6d4ad1; }
  .idb-pill.draft { background: ${BRAND.surfaceAlt}; color: ${BRAND.faint}; }
  .idb-nopages { margin: 0; padding: 4px 12px 12px 58px; font-size: 12.5px; color: ${BRAND.faint}; }
  .idb-ledger { list-style: none; margin: 0; padding: 0; }
  .idb-ledger li { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-top: 1px solid ${BRAND.border}; }
  .idb-ledger li:first-child { border-top: none; }
  .idb-ledger-ic { width: 32px; height: 32px; flex-shrink: 0; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(201,168,76,.16); color: ${BRAND.accent}; }
  .idb-ledger-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .idb-ledger-main b { font-size: 13.5px; color: ${BRAND.text}; }
  .idb-ledger-main span { font-size: 11.5px; color: ${BRAND.faint}; overflow-wrap: anywhere; }
  .idb-ledger-calc { font-size: 11.5px; color: ${BRAND.faint}; white-space: nowrap; }
  .idb-ledger-amt { font-size: 15px; font-weight: 800; color: ${BRAND.ok}; white-space: nowrap; }
  .idb-payout-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; padding: 12px 14px; background: ${BRAND.bgAlt}; border-bottom: 1px solid ${BRAND.border}; font-size: 13px; color: ${BRAND.muted}; }
  .idb-payout-head span { display: inline-flex; align-items: center; gap: 5px; }
  .idb-payout-head b { color: ${BRAND.text}; }
  .idb-upi { overflow-wrap: anywhere; }
  .idb-label { display: flex; align-items: center; gap: 6px; margin: 12px 0 6px; font-size: 12.5px; font-weight: 800; color: ${BRAND.text}; }
  .idb-label:first-child { margin-top: 0; }
  .idb-input { width: 100%; box-sizing: border-box; height: 44px; padding: 0 12px; border-radius: 12px; border: 1.5px solid ${BRAND.border}; background: ${BRAND.bgAlt}; font-size: 15px; color: ${BRAND.text}; outline: none; }
  .idb-input:focus { border-color: ${BRAND.accent}; }
  .idb-help { margin: 5px 2px 0; font-size: 12px; color: ${BRAND.muted}; }
  .idb-err { margin: 10px 0 0; font-size: 12.5px; color: ${BRAND.danger}; font-weight: 700; }
  .idb-save { margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; height: 42px; padding: 0 22px; border-radius: 99px; border: none; background: ${BRAND.gradient}; color: #f5ede6; font-weight: 800; cursor: pointer; }
  .idb-save:disabled { opacity: .45; cursor: not-allowed; }
  .idb-spin { animation: idb-spin 1s linear infinite; }
  @keyframes idb-spin { to { transform: rotate(360deg); } }
  @media (max-width: 1023px) and (min-width: 761px) {
    .idb-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 760px) {
    .idb-hero { padding: 18px 16px; border-radius: 22px; }
    .idb-card { padding: 14px; }
    .idb-chart { height: 170px; }
    .idb-tabs button { padding: 8px 2px; font-size: 11.5px; }
    .idb-tab-in { flex-direction: column; gap: 2px; }
    .idb-tab-in b { position: absolute; top: 2px; right: 6px; font-size: 9px; padding: 0 5px; }
    .idb-tabs { border-radius: 18px; }
    .idb-tab-pill { border-radius: 14px; }
    .idb-person { flex-wrap: wrap; }
    .idb-person-main { flex-basis: calc(100% - 80px); }
    .idb-person-meta { order: 3; flex-basis: 100%; justify-content: flex-start; padding-left: 46px; }
    .idb-person-meta .idb-earned { margin-left: auto; }
    .idb-money { grid-template-columns: minmax(0, 1fr); }
    .idb-money-side { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .idb-stats { grid-template-columns: 1fr 1fr; }
    .idb-rate { margin-left: 0; }
    .idb-pages { padding-left: 12px; }
    .idb-pages li { grid-template-columns: minmax(0, 1fr) auto; }
    .idb-page-date { grid-column: 1; }
    .idb-nopages { padding-left: 12px; }
    .idb-ledger-calc { display: none; }
    .idb-icon-txt { display: none; }
    .idb-icon-btn { padding: 0; width: 32px; }
    .idb-link-url { font-size: 13px; line-height: 1.3; white-space: normal; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .idb-card-head { margin-bottom: 8px; }
    .idb-share-btn { font-size: 10.5px; }
  }
`;
