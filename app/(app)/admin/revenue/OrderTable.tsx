"use client";

// The order ledger, as a table on a laptop and a card per order on a phone.
// Used by /admin/revenue (Transactions) and the profile's Billing tab, so it
// carries its own styles rather than borrowing either page's.

import { ExternalLink } from "lucide-react";
import { A, Tag } from "../adminKit";
import { type Order, inr, money, discountLabel, istTime } from "./types";

export const STATUS_TONE: Record<string, string> = {
  paid: A.ok, points_used: A.info, failed: A.danger, created: A.muted,
};
export const STATUS_LABEL: Record<string, string> = {
  paid: "Paid", points_used: "Points", failed: "Failed", created: "Abandoned",
};

/**
 * The ledger, shared with the profile's Billing tab: a table on a laptop, a
 * card per order on a phone. Failed and abandoned orders are greyed — they are
 * part of the story but not money.
 */
export default function OrderTable({ orders, onUser, showUser }: { orders: Order[]; onUser?: (id: string) => void; showUser?: boolean }) {
  return (
    <>
      <style>{RV_TABLE_CSS}</style>
      <div className="rv-tw rv-lg">
        <table className="rv-table">
          <thead>
            <tr>
              <th>Time (IST)</th>
              {showUser && <th>User</th>}
              <th>Template</th>
              <th>Status</th>
              <th className="r">List → paid</th>
              <th>Offer</th>
              <th className="r">Points</th>
              <th>Razorpay / invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const dim = o.status === "failed" || o.status === "created";
              return (
                <tr key={o._id} data-dim={dim ? "1" : "0"}>
                  <td className="nw">{istTime(o.paidAt || o.createdAt)}</td>
                  {showUser && (
                    <td style={{ maxWidth: 220 }}>
                      <button type="button" className="rv-link" onClick={() => onUser?.(o.userId)} title="Open billing">
                        <span className="rv-who-n">{o.userName || "—"}</span>
                        <span className="rv-who-e">{o.userEmail}</span>
                      </button>
                    </td>
                  )}
                  <td>
                    <span style={{ fontWeight: 700 }}>{o.templateLabel || o.templateType}</span>
                    {o.pageShareId && o.pageExists ? (
                      <a href={`/${o.pageShareId}`} target="_blank" rel="noreferrer" className="rv-ext" aria-label="Open the page"><ExternalLink size={11} /></a>
                    ) : o.pageId && !o.pageExists ? <span className="rv-of"> · page deleted</span> : null}
                  </td>
                  <td><Tag tone={STATUS_TONE[o.status] || A.muted}>{STATUS_LABEL[o.status] || o.status}</Tag></td>
                  <td className="r nw">
                    {o.status === "points_used" ? "—" : (
                      <>
                        {o.listAmount > o.amount && <s className="rv-of">{money(o.listAmount, o.currency)}</s>}{" "}
                        <b>{money(o.amount, o.currency)}</b>
                        {o.currency !== "INR" && <span className="rv-of"> ≈ {inr(o.amountInrPaise)}</span>}
                      </>
                    )}
                  </td>
                  <td className="nw">{discountLabel(o)}</td>
                  <td className="r">{o.pointsUsed ? o.pointsUsed.toLocaleString("en-IN") : "—"}</td>
                  <td className="rv-mono">
                    {o.razorpayPaymentId || <span className="rv-of">—</span>}
                    {o.invoiceNumber && <div className="rv-of">{o.invoiceNumber}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="rv-sm rv-cards">
        {orders.map((o) => {
          const dim = o.status === "failed" || o.status === "created";
          return (
            <div key={o._id} className="adk-card" style={{ opacity: dim ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="rv-who-n">{o.templateLabel || o.templateType}</div>
                  <div className="rv-who-e">{istTime(o.paidAt || o.createdAt)}</div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="rv-card-amt">{o.status === "points_used" ? `${(o.pointsUsed || 0).toLocaleString("en-IN")} pts` : money(o.amount, o.currency)}</div>
                  <Tag tone={STATUS_TONE[o.status] || A.muted}>{STATUS_LABEL[o.status] || o.status}</Tag>
                </div>
              </div>
              {showUser && (
                <button type="button" className="rv-link" onClick={() => onUser?.(o.userId)} style={{ marginTop: 6 }}>
                  <span className="rv-who-n" style={{ fontSize: 12 }}>{o.userName || "—"}</span>
                  <span className="rv-who-e">{o.userEmail}</span>
                </button>
              )}
              <div className="rv-card-meta">
                {o.listAmount > o.amount && o.status !== "points_used" && <span>List <s>{money(o.listAmount, o.currency)}</s></span>}
                {discountLabel(o) !== "—" && <span>{discountLabel(o)}</span>}
                {o.currency !== "INR" && <span>≈ {inr(o.amountInrPaise)}</span>}
                {o.razorpayPaymentId && <span className="rv-mono">{o.razorpayPaymentId}</span>}
                {o.invoiceNumber && <span className="rv-mono">{o.invoiceNumber}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Shared with the Billing tab via <OrderTable>, so it carries its own styles.
export const RV_TABLE_CSS = `
  .rv-tw { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; border-radius: 12px; }
  .rv-table { width: 100%; border-collapse: collapse; font-size: 12.5px; color: ${A.ink}; }
  .rv-table th { text-align: left; padding: 7px 9px; font-size: 9.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
    color: ${A.muted}; border-bottom: 1px solid rgba(61,12,17,.16); white-space: nowrap; background: rgba(255,253,251,.96); position: sticky; top: 0; z-index: 1; }
  .rv-table td { padding: 8px 9px; border-bottom: 1px solid ${A.edge}; vertical-align: middle; }
  .rv-table tbody tr { transition: background .12s; }
  .rv-table tbody tr:hover { background: rgba(201,168,76,0.08); }
  .rv-table tr[data-dim="1"] td { color: ${A.muted}; }
  .rv-table tr[data-dim="1"] b { color: ${A.muted}; font-weight: 600; }
  .rv-table .r { text-align: right; font-variant-numeric: tabular-nums; }
  .rv-table .b { font-weight: 800; }
  .rv-table .nw { white-space: nowrap; }
  .rv-click tbody tr { cursor: pointer; }
  .rv-click tbody tr:focus-visible { outline: 2px solid ${A.gold}; outline-offset: -2px; }
  .rv-of { color: ${A.muted}; font-weight: 600; font-size: 11px; }
  .rv-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; overflow-wrap: anywhere; }
  .rv-ext { color: ${A.goldDeep}; margin-left: 5px; display: inline-grid; vertical-align: middle; }
  .rv-link { all: unset; cursor: pointer; display: flex; flex-direction: column; min-width: 0; max-width: 100%; }
  .rv-link:hover .rv-who-n { color: ${A.goldDeep}; text-decoration: underline; }
  .rv-link:focus-visible { outline: 2px solid ${A.gold}; border-radius: 4px; }
  .rv-who { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .rv-who-n { font-weight: 800; font-size: 12.5px; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rv-who-e { font-size: 11px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rv-cards { display: grid; gap: 8px; }
  .rv-cards > .adk-card { padding: 10px 11px; }
  .rv-card-amt { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 16px; color: ${A.ink}; white-space: nowrap; }
  .rv-card-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 8px; padding-top: 7px; border-top: 1px dashed ${A.edge};
    font-size: 11px; color: ${A.soft}; font-weight: 600; min-width: 0; }
  .rv-card-meta > * { min-width: 0; overflow-wrap: anywhere; }
  .rv-lg { display: none; }
  @media (min-width: 760px) { .rv-lg { display: block; } .rv-sm { display: none; } }
`;

