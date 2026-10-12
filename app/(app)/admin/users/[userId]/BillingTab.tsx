"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";
import { useToast } from "@/lib/toast/useToast";
import {
  Receipt, Send, Eye, CalendarDays, CheckCircle2, AlertTriangle, CircleSlash, ExternalLink, Mail, RefreshCw, ListChecks,
} from "lucide-react";
import { C } from "./types";
import { Card, Stat, Row, Empty, Btn, Dialog, Skeleton, Pill, fmtAgo } from "./ui";
import { A, Tag } from "../../adminKit";
import OrderTable, { RV_TABLE_CSS } from "../../revenue/OrderTable";
import {
  type UserBilling, type BillingPage, type Order, type StatementPreview, type StatementResult,
  inr, money, discountLabel, istDay, istDayOf, prettyDay, istTime, isYmd,
} from "../../revenue/types";

/**
 * What this user paid, page by page, and the one place a statement is sent.
 *
 * ── NOTHING IS SENT UNTIL THE CONFIRM CLICK ────────────────────────────────
 *
 * The owner's rule: billing mail goes out only when a super admin decides to,
 * for this user, never on a schedule or a side effect. So the panel is built
 * as preview → confirm → send. Send stays disabled until a preview of exactly
 * the current selection is on screen, and the confirm dialog repeats the
 * address and the total that preview produced — the admin approves the email
 * they just read, not an idea of it. The server sends only to the account's
 * own address and refuses a repeat of the same orders within ten minutes.
 */
export default function BillingTab({ userId, hdr }: { userId: string; hdr: () => Record<string, string> }) {
  const [data, setData] = useState<UserBilling | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API_URL}/admin/super/revenue/users/${userId}/billing`, { headers: hdr() });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.success) setData(j.data);
      else setErr(j?.error || `Could not load billing (${r.status})`);
    } catch {
      setErr("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [userId, hdr]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <><Skeleton h={78} /><Skeleton h={160} /><Skeleton h={220} /></>;
  if (err && !data) {
    return (
      <div className="sa-card">
        <Empty>
          <AlertTriangle size={20} style={{ color: C.danger, display: "block", margin: "0 auto 8px" }} />
          {err}
          <div style={{ marginTop: 10 }}><Btn variant="ghost" onClick={load}><RefreshCw size={12} /> Retry</Btn></div>
        </Empty>
      </div>
    );
  }
  if (!data) return null;

  const { totals, user } = data;
  return (
    <>
      <style>{RV_TABLE_CSS}</style>
      <style>{BT_CSS}</style>

      <div className="sa-stats">
        <Stat i={0} label="Lifetime paid" value={inr(totals.lifetimeRevenueInrPaise)} tone={C.ok} />
        <Stat i={1} label="Paid orders" value={totals.paidOrders} />
        <Stat i={2} label="Paid pages" value={totals.paidPages} tone={C.goldDeep} />
        <Stat i={3} label="Points unlocks" value={totals.pointsUnlocks} tone="#6d4ad1" />
        <Stat i={4} label="Discounts" value={inr(totals.discountGivenInrPaise)} tone={C.warn} />
        <Stat i={5} label="Pages created" value={totals.pagesCreated} tone={C.danger} />
      </div>

      <div className="sa-grid2">
        <Card title="Billing summary">
          <Row label="Member since" value={fmtAgo(user.joinedAt)} />
          <Row label="First paid" value={totals.firstPaidAt ? istTime(totals.firstPaidAt) : "Never"} />
          <Row label="Last paid" value={totals.lastPaidAt ? fmtAgo(totals.lastPaidAt) : "Never"} />
          <Row label="Pages" value={`${totals.pagesCreated} created · ${totals.pagesPublished} published · ${totals.paidPages} paid`} />
          <Row label="Points spent" value={totals.pointsSpent ? totals.pointsSpent.toLocaleString("en-IN") : "—"} />
          {user.country && <Row label="Country" value={user.country} />}
          {user.freeAccess?.enabled && <Row label="Free access" value={<span style={{ color: C.ok }}>All templates free</span>} />}
        </Card>
        <StatementHistory items={data.statementsSent} />
      </div>

      <StatementPanel data={data} hdr={hdr} onSent={load} />

      <PagesWithPayments pages={data.pages} />

      <Card title="Orders" note={`${data.orders.length} · failed and abandoned are greyed`} delay={0.08}>
        {data.orders.length === 0 ? <Empty>No orders yet — every page so far was free.</Empty> : <OrderTable orders={data.orders} />}
      </Card>
    </>
  );
}

// ── Pages, each with how it was paid for ─────────────────────────────────────

function PayBadge({ page }: { page: BillingPage }) {
  const p = page.payment;
  if (p && p.status === "paid") {
    const off = discountLabel(p);
    return (
      <span className="bt-pay">
        <Pill text={`Paid ${money(p.amount, p.currency)}`} color={C.ok} />
        {off !== "—" && <Pill text={off} color={C.goldDeep} />}
        {p.pointsUsed > 0 && <Pill text={`+${p.pointsUsed} pts`} color="#6d4ad1" />}
      </span>
    );
  }
  if (p && p.status === "points_used") return <span className="bt-pay"><Pill text={`Points ${p.pointsUsed.toLocaleString("en-IN")}`} color="#6d4ad1" /></span>;
  if (p && p.status === "failed") return <span className="bt-pay"><Pill text="Payment failed" color={C.danger} /></span>;
  if (p && p.status === "created") return <span className="bt-pay"><Pill text="Checkout abandoned" color={C.muted} /></span>;
  return <span className="bt-pay"><Pill text={page.isPublished ? "Free" : "Unpaid draft"} color={page.isPublished ? C.accent : C.muted} /></span>;
}

function PayIds({ page }: { page: BillingPage }) {
  const p = page.payment;
  if (!p || (!p.razorpayPaymentId && !p.invoiceNumber)) return null;
  return (
    <span className="rv-mono" style={{ color: C.muted }}>
      {p.razorpayPaymentId}{p.razorpayPaymentId && p.invoiceNumber ? " · " : ""}{p.invoiceNumber}
    </span>
  );
}

function PagesWithPayments({ pages }: { pages: BillingPage[] }) {
  return (
    <Card title="Pages & payments" note={`${pages.length} ${pages.length === 1 ? "page" : "pages"}, newest first`} delay={0.06}>
      {pages.length === 0 ? (
        <Empty>This user hasn&apos;t created any pages yet.</Empty>
      ) : (
        <>
          <div className="rv-tw rv-lg">
            <table className="rv-table">
              <thead><tr><th>Template</th><th>Created</th><th>Status</th><th className="r">Views</th><th>Payment</th><th>Transaction</th></tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <b>{p.templateLabel}</b>
                      {p.shareId && p.isPublished && (
                        <a href={`/${p.shareId}`} target="_blank" rel="noreferrer" className="rv-ext" aria-label="Open the page"><ExternalLink size={11} /></a>
                      )}
                    </td>
                    <td className="nw">{istTime(p.createdAt)}</td>
                    <td>{p.isPublished ? <Tag tone={A.ok}>Live</Tag> : <Tag tone={A.muted}>Draft</Tag>}</td>
                    <td className="r">{(p.viewCount || 0).toLocaleString("en-IN")}</td>
                    <td><PayBadge page={p} /></td>
                    <td><PayIds page={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rv-sm rv-cards">
            {pages.map((p, i) => (
              <div key={p._id} className="sa-mini" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <b style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.templateLabel}</b>
                  {p.isPublished ? <Tag tone={A.ok}>Live</Tag> : <Tag tone={A.muted}>Draft</Tag>}
                  {p.shareId && p.isPublished && (
                    <a href={`/${p.shareId}`} target="_blank" rel="noreferrer" className="rv-ext" aria-label="Open the page"><ExternalLink size={12} /></a>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.muted, margin: "3px 0 6px" }}>{istTime(p.createdAt)} · {(p.viewCount || 0).toLocaleString("en-IN")} views</div>
                <PayBadge page={p} />
                <div style={{ marginTop: 4 }}><PayIds page={p} /></div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ── Statements already sent ──────────────────────────────────────────────────

const SENT_TONE = { sent: C.ok, skipped: C.warn, failed: C.danger } as const;

function StatementHistory({ items }: { items: UserBilling["statementsSent"] }) {
  return (
    <Card title="Statements sent" note={items.length ? String(items.length) : undefined} delay={0.04}>
      {items.length === 0 ? (
        <Empty><Mail size={20} style={{ opacity: 0.4, display: "block", margin: "0 auto 8px" }} />No statement has been sent to this user.</Empty>
      ) : (
        <div style={{ display: "grid", gap: 6, maxHeight: 260, overflowY: "auto" }}>
          {items.map((s, i) => (
            <div key={`${s.sentAt}-${i}`} className="sa-mini" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <b style={{ flex: 1, minWidth: 0 }}>{periodLabel(s.period.from, s.period.to)}</b>
                <Pill text={s.status} color={SENT_TONE[s.status] || C.muted} />
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, overflowWrap: "anywhere" }}>
                {s.orderCount} {s.orderCount === 1 ? "order" : "orders"} · <b style={{ color: C.text }}>{inr(s.totalInrPaise)}</b> · to {s.to}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2, overflowWrap: "anywhere" }}>
                {istTime(s.sentAt)} by {s.sentByEmail}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const periodLabel = (from: string, to: string) =>
  from === to ? prettyDay(from, true) : `${prettyDay(from)} – ${prettyDay(to, true)}`;

// ── Send billing statement ───────────────────────────────────────────────────

type Mode = "day" | "range" | "orders";

function StatementPanel({ data, hdr, onSent }: { data: UserBilling; hdr: () => Record<string, string>; onSent: () => void }) {
  const { pushToast } = useToast();
  const { user } = data;
  const closed = user.status === "closed";

  // Only money the user actually spent — paid, or a points unlock — goes on a statement.
  const eligible = useMemo(
    () => data.orders.filter((o) => o.status === "paid" || o.status === "points_used"),
    [data.orders]
  );

  const [mode, setMode] = useState<Mode>("day");
  const [day, setDay] = useState(data.days[0]?.date || "");
  const [from, setFrom] = useState(data.days[data.days.length - 1]?.date || istDay(-29));
  const [to, setTo] = useState(data.days[0]?.date || istDay());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const [preview, setPreview] = useState<(StatementPreview & { key: string }) | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<StatementResult | null>(null);

  // The request body for the current selection. Ticked orders carry their own
  // span so the server's range check agrees with the ids.
  const body = useMemo(() => {
    const n = note.trim() || undefined;
    if (mode === "orders") {
      const sel = eligible.filter((o) => picked.has(o._id));
      if (!sel.length) return null;
      const daysOf = sel.map((o) => istDayOf(o.paidAt || o.createdAt)).sort();
      return { from: daysOf[0], to: daysOf[daysOf.length - 1], orderIds: sel.map((o) => o._id), note: n };
    }
    if (mode === "day") return isYmd(day) ? { from: day, to: day, note: n } : null;
    if (!isYmd(from) || !isYmd(to) || from > to) return null;
    return { from, to, note: n };
  }, [mode, day, from, to, picked, eligible, note]);

  const key = JSON.stringify(body);
  const fresh = !!preview && preview.key === key;

  const rangeErr = mode === "range" && isYmd(from) && isYmd(to) && from > to ? "The start is after the end." : "";

  const doPreview = async () => {
    if (!body) return;
    setPreviewing(true);
    setResult(null);
    try {
      const r = await fetch(`${API_URL}/admin/super/revenue/users/${user._id}/billing/preview`, {
        method: "POST", headers: hdr(), body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.success) setPreview({ ...(j.data as StatementPreview), key });
      else { setPreview(null); pushToast({ title: j?.error || `Preview failed (${r.status})`, type: "error" }); }
    } catch {
      pushToast({ title: "Could not reach the server", type: "error" });
    } finally {
      setPreviewing(false);
    }
  };

  // The one place billing mail leaves the building — the confirm button.
  const doSend = async () => {
    if (!body || !fresh || sending) return;
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/revenue/users/${user._id}/billing/send`, {
        method: "POST", headers: hdr(), body: JSON.stringify({ ...body, confirm: true }),
      });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.success) {
        const res = (j.data || {}) as StatementResult;
        const status = res.status || "sent";
        setResult({ ...res, status });
        pushToast({
          title: status === "sent" ? `Statement sent to ${res.to || preview?.to}` : status === "skipped" ? "Not sent — email isn't configured on this server" : "The statement failed to send",
          type: status === "sent" ? "success" : "error",
        });
        setConfirmOpen(false);
        setPreview(null);
        onSent();
      } else {
        setResult({ status: "failed", error: j?.error || `Send failed (${r.status})` });
        pushToast({ title: j?.error || `Send failed (${r.status})`, type: "error" });
        setConfirmOpen(false);
      }
    } catch {
      setResult({ status: "failed", error: "Could not reach the server." });
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const toggle = (id: string) => setPicked((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  return (
    <Card title="Send billing statement" note={`from billing@subhsandesh.in to ${user.email}`} delay={0.05}>
      {closed ? (
        <Empty><CircleSlash size={20} style={{ opacity: 0.5, display: "block", margin: "0 auto 8px" }} />This account is closed — statements can&apos;t be sent to it.</Empty>
      ) : eligible.length === 0 ? (
        <Empty><Receipt size={20} style={{ opacity: 0.4, display: "block", margin: "0 auto 8px" }} />Nothing to bill — this user has no paid or points orders.</Empty>
      ) : (
        <>
          <p className="bt-lead">
            A professional statement of payments already received: date and time, template, page link, list price,
            offer, amount and Razorpay transaction id. It is sent <b>only</b> when you confirm below.
          </p>

          <div className="bt-modes" role="radiogroup" aria-label="What to include">
            {([
              { v: "day", l: "One day", I: CalendarDays },
              { v: "range", l: "Date range", I: CalendarDays },
              { v: "orders", l: "Pick orders", I: ListChecks },
            ] as const).map(({ v, l, I }) => (
              <button key={v} type="button" role="radio" aria-checked={mode === v} className="bt-mode" data-on={mode === v ? "1" : "0"} onClick={() => setMode(v)}>
                <I size={13} /> {l}
              </button>
            ))}
          </div>

          {mode === "day" && (
            <div className="bt-days">
              {data.days.map((d) => (
                <button key={d.date} type="button" className="bt-day" data-on={day === d.date ? "1" : "0"} onClick={() => setDay(d.date)}>
                  <span className="bt-day-d">{prettyDay(d.date, d.date.slice(0, 4) !== istDay().slice(0, 4))}</span>
                  <span className="bt-day-s">{d.revenueInrPaise ? inr(d.revenueInrPaise) : "points"} · {d.orders}</span>
                </button>
              ))}
            </div>
          )}

          {mode === "range" && (
            <div className="bt-range">
              <label><span className="sa-edit-k">From</span><input type="date" className="sa-input" value={from} max={istDay()} onChange={(e) => setFrom(e.target.value)} /></label>
              <label><span className="sa-edit-k">To</span><input type="date" className="sa-input" value={to} max={istDay()} onChange={(e) => setTo(e.target.value)} /></label>
              {rangeErr && <span style={{ color: C.danger, fontSize: 12, fontWeight: 700, gridColumn: "1 / -1" }}>{rangeErr}</span>}
            </div>
          )}

          {mode === "orders" && (
            <div className="bt-picks">
              {eligible.map((o) => <PickRow key={o._id} o={o} on={picked.has(o._id)} onToggle={() => toggle(o._id)} />)}
            </div>
          )}

          <label style={{ display: "block", marginTop: 10 }}>
            <span className="sa-edit-k">Note to include (optional)</span>
            <textarea className="sa-ta" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. As requested on our call — here is your statement for October." rows={2} />
          </label>

          <div className="bt-actions">
            <Btn variant="ghost" onClick={doPreview} disabled={!body || previewing}>
              <Eye size={13} /> {previewing ? "Building preview…" : fresh ? "Refresh preview" : "Preview"}
            </Btn>
            <Btn variant="accent" onClick={() => setConfirmOpen(true)} disabled={!fresh || sending || !preview?.orderCount} title={!fresh ? "Preview the statement first" : undefined}>
              <Send size={13} /> Send to {user.email}
            </Btn>
            {!fresh && body && <span className="bt-hint">Preview first — you send exactly what you&apos;ve read.</span>}
          </div>

          {result && <ResultBanner r={result} fallbackTo={user.email} />}

          {preview && (
            <div className="bt-preview" data-stale={fresh ? "0" : "1"}>
              <div className="bt-preview-h">
                <div style={{ minWidth: 0 }}>
                  <div className="bt-preview-s" title={preview.subject}>{preview.subject}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, overflowWrap: "anywhere" }}>
                    To {preview.to} · {preview.orderCount} {preview.orderCount === 1 ? "order" : "orders"} · <b style={{ color: C.text }}>{inr(preview.totalInrPaise)}</b>
                  </div>
                </div>
                {!fresh && <Pill text="Out of date" color={C.warn} />}
              </div>
              {/* sandbox="" — no scripts, no forms, no navigation: the email is only looked at. */}
              <iframe title="Statement preview" sandbox="" srcDoc={preview.html} className="bt-frame" />
            </div>
          )}
        </>
      )}

      <Dialog open={confirmOpen} onClose={() => !sending && setConfirmOpen(false)} title="Send this statement?">
        {preview && (
          <>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 10px" }}>
              A billing statement for <b>{preview.orderCount} {preview.orderCount === 1 ? "order" : "orders"}</b> totalling{" "}
              <b>{inr(preview.totalInrPaise)}</b> will be emailed to:
            </p>
            <div className="bt-to"><Mail size={14} /> {preview.to}</div>
            <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "10px 0 16px" }}>
              From billing@subhsandesh.in, replies to support@subhsandesh.in. Invoice numbers are assigned to these
              orders now, and the send is recorded in the audit log. It can&apos;t be unsent.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Btn variant="ghost" onClick={() => setConfirmOpen(false)} disabled={sending}>Cancel</Btn>
              <Btn variant="accent" onClick={doSend} disabled={sending}>
                <Send size={13} /> {sending ? "Sending…" : `Send to ${preview.to}`}
              </Btn>
            </div>
          </>
        )}
      </Dialog>
    </Card>
  );
}

function PickRow({ o, on, onToggle }: { o: Order; on: boolean; onToggle: () => void }) {
  return (
    <label className="bt-pick" data-on={on ? "1" : "0"}>
      <input type="checkbox" checked={on} onChange={onToggle} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.templateLabel || o.templateType}</b>
        <span style={{ fontSize: 11, color: C.muted }}>{istTime(o.paidAt || o.createdAt)}{o.invoiceNumber ? ` · ${o.invoiceNumber}` : ""}</span>
      </span>
      <b style={{ flex: "none", whiteSpace: "nowrap" }}>
        {o.status === "points_used" ? `${(o.pointsUsed || 0).toLocaleString("en-IN")} pts` : money(o.amount, o.currency)}
      </b>
    </label>
  );
}

function ResultBanner({ r, fallbackTo }: { r: StatementResult; fallbackTo: string }) {
  const s = r.status || "failed";
  const tone = s === "sent" ? C.ok : s === "skipped" ? C.warn : C.danger;
  const Icon = s === "sent" ? CheckCircle2 : AlertTriangle;
  const msg =
    s === "sent"
      ? `Sent to ${r.to || fallbackTo}${r.orderCount ? ` — ${r.orderCount} ${r.orderCount === 1 ? "order" : "orders"}, ${inr(r.totalInrPaise || 0)}` : ""}.`
      : s === "skipped"
      ? "Not delivered: email (SES) isn't configured on this server. The attempt is recorded, but nothing reached the user."
      : r.error || r.message || "The statement could not be sent.";
  return (
    <div className="bt-result" style={{ color: tone, background: `${tone}12`, borderColor: `${tone}40` }} role="status">
      <Icon size={15} style={{ flex: "none", marginTop: 1 }} />
      <span style={{ color: C.text }}>{msg}{r.messageId ? <span className="sa-mono" style={{ color: C.muted }}> · {r.messageId}</span> : null}</span>
    </div>
  );
}

const BT_CSS = `
  .bt-lead { font-size: 12.5px; color: ${C.muted}; line-height: 1.6; margin: 0 0 10px; }
  .bt-lead b { color: ${C.text}; }
  .bt-modes { display: inline-flex; gap: 3px; padding: 3px; border-radius: 12px; background: rgba(61,12,17,.05); margin-bottom: 10px; max-width: 100%; overflow-x: auto; scrollbar-width: none; }
  .bt-mode { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 11px; border-radius: 9px;
    font-size: 12px; font-weight: 700; color: ${A.soft}; white-space: nowrap; transition: background .15s, color .15s; }
  .bt-mode[data-on="1"] { background: #fff; color: ${A.maroon}; box-shadow: 0 2px 8px -3px rgba(61,12,17,.3); }
  .bt-mode:focus-visible { outline: 2px solid ${C.gold}; }
  .bt-days { display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 6px; scrollbar-width: thin; }
  .bt-day { all: unset; box-sizing: border-box; cursor: pointer; flex: none; display: flex; flex-direction: column; gap: 1px; padding: 7px 11px; border-radius: 12px;
    border: 1px solid ${A.edge}; background: #fff; transition: border-color .15s, transform .15s; }
  .bt-day:hover { transform: translateY(-1px); border-color: rgba(201,168,76,.6); }
  .bt-day:focus-visible { outline: 2px solid ${C.gold}; }
  .bt-day[data-on="1"] { background: linear-gradient(135deg, #5a1520, #3d0c11); border-color: transparent; }
  .bt-day-d { font-size: 12.5px; font-weight: 800; color: ${A.ink}; white-space: nowrap; }
  .bt-day-s { font-size: 10.5px; font-weight: 700; color: ${A.muted}; white-space: nowrap; }
  .bt-day[data-on="1"] .bt-day-d { color: #fff6e6; }
  .bt-day[data-on="1"] .bt-day-s { color: #e9c98a; }
  .bt-range { display: grid; grid-template-columns: repeat(2, minmax(0, 180px)); gap: 8px; }
  .bt-picks { display: grid; gap: 6px; max-height: 280px; overflow-y: auto; padding-right: 2px; }
  .bt-pick { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 11px; border: 1px solid ${A.edge}; background: #fff; cursor: pointer; font-size: 12.5px; min-width: 0; }
  .bt-pick[data-on="1"] { border-color: ${C.gold}; background: rgba(201,168,76,.08); }
  .bt-pick input { accent-color: ${A.maroon}; width: 16px; height: 16px; flex: none; }
  .bt-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .bt-actions > .sa-btn { min-height: 36px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 519px) { .bt-actions > .sa-btn { flex: 1 1 100%; } }
  .bt-hint { font-size: 11.5px; color: ${C.muted}; }
  .bt-result { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; padding: 9px 11px; border-radius: 11px; border: 1px solid; font-size: 12.5px; line-height: 1.5; overflow-wrap: anywhere; }
  .bt-preview { margin-top: 12px; border: 1px solid ${A.edge}; border-radius: 14px; overflow: hidden; background: #fff; }
  .bt-preview[data-stale="1"] { opacity: .65; }
  .bt-preview-h { display: flex; align-items: center; gap: 8px; padding: 9px 11px; border-bottom: 1px solid ${A.edge}; background: linear-gradient(180deg,#fdf9f4,#f8efe4); }
  .bt-preview-s { font-weight: 800; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bt-frame { display: block; width: 100%; height: min(70vh, 720px); border: 0; background: #fff; }
  .bt-to { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; background: rgba(201,168,76,.12); border: 1px solid rgba(201,168,76,.4);
    font-weight: 800; font-size: 14px; color: ${A.maroon}; overflow-wrap: anywhere; }
  .bt-pay { display: inline-flex; gap: 4px; flex-wrap: wrap; }
`;

