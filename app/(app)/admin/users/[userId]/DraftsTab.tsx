"use client";

// ─── What this person started and never finished ─────────────────────────────
//
// The Pages tab already lists every page they made and marks the unpublished
// ones "Draft". That answers "does a draft exist"; it does not answer the
// question somebody actually opens a profile with — WHY did this person stop?
//
// So this tab shows the same drafts the /admin/drafts screen does, with the
// same reason chip, the same progress bar and the same missing-field names,
// rendered by the very same components. One vocabulary, whichever screen you
// came in through: "Left at checkout" here has to mean what it means there, and
// sharing the module is the only way that keeps being true.
//
// ── WHY IT REUSES THE DRAFTS ENDPOINT ───────────────────────────────────────
//
// `GET /admin/drafts?userId=…`. The reason, the completeness and the empty-field
// names are all computed there from the pricing, the payment orders and the
// template's own schema. A second endpoint would be a second copy of that
// arithmetic, and the first time the two disagreed the panel would be lying on
// one of the two screens. The `userId` filter narrows the Mongo query itself,
// so this costs 43 tiny indexed lookups rather than the full sweep.
//
// Nothing of the draft's CONTENT is shown, here or there — see the note in
// `admin/drafts/DraftDetail.tsx`.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import { ExternalLink, FileText, Loader2, Mail, Clock, IndianRupee, Check } from "lucide-react";
import { Card, Empty } from "./ui";
import { MissingFields, Progress, ReasonChip, when } from "../../drafts/parts";
import type { Row as DraftRow } from "../../drafts/types";

export default function DraftsTab({
  userId,
  userEmail,
  hdr,
}: {
  userId: string;
  userEmail: string;
  hdr: () => Record<string, string>;
}) {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const q = new URLSearchParams({ userId, limit: "50", filter: "all" });
      const r = await fetch(`${API_URL}/admin/drafts?${q}`, { headers: hdr() });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || "Could not load their drafts");
      setRows(j.data.items || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load their drafts");
    } finally {
      setLoading(false);
    }
  }, [userId, hdr]);

  useEffect(() => { void load(); }, [load]);

  const blocked = rows.filter((r) => r.blockedByPrice).length;
  const contacted = rows.filter((r) => r.nudgedAt).length;

  return (
    <Card
      title="Unfinished drafts"
      note={
        loading
          ? undefined
          : `${rows.length} total${blocked ? ` · ${blocked} stopped by price` : ""}${contacted ? ` · ${contacted} contacted` : ""}`
      }
      action={
        rows.length > 0 ? (
          // Lands on the drafts screen already filtered to this person, so the
          // composer is one click away rather than a search away.
          <Link
            href={`/admin/drafts?search=${encodeURIComponent(userEmail)}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
              fontWeight: 700, color: BRAND.accent, textDecoration: "none",
            }}
          >
            <Mail size={13} /> Write to them
          </Link>
        ) : undefined
      }
    >
      {loading ? (
        <div style={{ padding: 28, display: "grid", placeItems: "center" }}>
          <Loader2 size={18} className="animate-spin" style={{ color: BRAND.gold }} />
        </div>
      ) : err ? (
        <Empty>{err}</Empty>
      ) : rows.length === 0 ? (
        <Empty>
          <FileText size={22} style={{ opacity: 0.4, display: "block", margin: "0 auto 8px" }} />
          Nothing unfinished — everything this person started is published.
        </Empty>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((row, i) => (
            <div
              key={`${row.templateType}:${row.pageId}`}
              className="sa-mini"
              style={{ padding: "10px 11px", animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: BRAND.text, overflowWrap: "anywhere" }}>
                  {row.templateLabel}
                </span>
                <ReasonChip reason={row.reason} />
                {row.isPaid && (
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", fontSize: 10.5,
                      fontWeight: 700, color: BRAND.accent,
                    }}
                  >
                    <IndianRupee size={10} />
                    {Math.round(row.finalPricePaise / 100)}
                  </span>
                )}
                {row.nudgedAt && (
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5,
                      color: BRAND.ok, fontWeight: 700,
                    }}
                  >
                    <Check size={11} /> contacted {when(row.nudgedAt)}
                  </span>
                )}
                {row.templateSlug && (
                  <a
                    href={`/${row.templateSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Opens the template itself, not their draft"
                    style={{
                      marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700, color: BRAND.accent, textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={11} /> template
                  </a>
                )}
              </div>

              <p style={{ margin: "5px 0 0", fontSize: 12.5, lineHeight: "18px", color: BRAND.muted, overflowWrap: "anywhere" }}>
                {row.reasonDetail}
              </p>

              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 7,
                }}
              >
                <Progress value={row.completeness} />
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5,
                    color: BRAND.faint,
                  }}
                >
                  <Clock size={10} /> started {when(row.createdAt)} · idle {row.daysIdle}d ·{" "}
                  {row.wordCount}w · {row.photoCount} photo{row.photoCount === 1 ? "" : "s"}
                </span>
              </div>

              <div style={{ marginTop: 7 }}>
                <MissingFields fields={row.missingFields} total={row.missingCount} max={6} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
