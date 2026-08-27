"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { ExternalLink } from "lucide-react";
import { C, type ProfilePage } from "./types";
import { Dialog, Skeleton, Empty, CopyBtn, Btn, fmt } from "./ui";

/**
 * Shows exactly what the user built on one page.
 *
 * ── WHY IT RENDERS RATHER THAN DUMPS ────────────────────────────────────────
 *
 * The endpoint returns the whole document, and templates differ wildly — there
 * is no shared content shape to build a fixed layout against. Rather than a
 * bare JSON blob, values are grouped by what they ARE: media renders as
 * thumbnails, long prose gets room to breathe, lists collapse to counts you can
 * expand, and the housekeeping fields sort to the bottom. That works for all 43
 * templates and for templates that do not exist yet.
 *
 * Raw JSON is still one click away, because for a support question the exact
 * stored value is sometimes the only thing that answers it.
 */

const HIDE = new Set(["_id", "__v", "userId", "password", "passwordRaw", "contribToken"]);
const META = new Set([
  "shareId", "isPublished", "viewCount", "installCount", "createdAt", "updatedAt",
  "quizAttempts", "quizAnswers", "gameResponses",
]);

const isUrl = (v: unknown) => typeof v === "string" && /^https?:\/\//.test(v);
const isImg = (v: unknown) => isUrl(v) && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(String(v));
const isAudio = (v: unknown) => isUrl(v) && /\.(mp3|wav|m4a|ogg)(\?|$)/i.test(String(v));

const label = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/\s+/g, " ").trim();

function Value({ v }: { v: unknown }) {
  if (v === null || v === undefined || v === "") return <span style={{ color: C.muted }}>—</span>;
  if (typeof v === "boolean") return <span style={{ color: v ? C.green : C.muted }}>{v ? "Yes" : "No"}</span>;

  if (isImg(v)) {
    return (
      <a href={String(v)} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={String(v)}
          alt=""
          loading="lazy"
          style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 12, border: `1px solid ${C.border}` }}
        />
      </a>
    );
  }
  if (isAudio(v)) return <audio controls src={String(v)} style={{ maxWidth: "100%", height: 34 }} />;
  if (isUrl(v)) {
    return (
      <a href={String(v)} target="_blank" rel="noreferrer" style={{ color: C.accent, wordBreak: "break-all", fontSize: 12.5 }}>
        {String(v).slice(0, 70)}{String(v).length > 70 ? "…" : ""}
      </a>
    );
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return <span style={{ color: C.muted }}>empty</span>;
    return (
      <details>
        <summary style={{ cursor: "pointer", color: C.accent, fontSize: 12.5 }}>{v.length} item{v.length > 1 ? "s" : ""}</summary>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {v.slice(0, 40).map((item, i) => (
            <div key={i} style={{ background: C.bgAlt, borderRadius: 10, padding: 9, fontSize: 12.5 }}>
              {typeof item === "object" && item !== null ? (
                Object.entries(item as Record<string, unknown>)
                  .filter(([k]) => !HIDE.has(k))
                  .map(([k, val]) => (
                    <div key={k} style={{ display: "flex", gap: 8, padding: "2px 0" }}>
                      <span style={{ color: C.muted, minWidth: 90 }}>{label(k)}</span>
                      <span style={{ minWidth: 0, wordBreak: "break-word" }}><Value v={val} /></span>
                    </div>
                  ))
              ) : (
                <Value v={item} />
              )}
            </div>
          ))}
        </div>
      </details>
    );
  }
  if (typeof v === "object") {
    return (
      <details>
        <summary style={{ cursor: "pointer", color: C.accent, fontSize: 12.5 }}>view</summary>
        <pre className="sa-mono" style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word", background: C.bgAlt, padding: 9, borderRadius: 10 }}>
          {JSON.stringify(v, null, 2)}
        </pre>
      </details>
    );
  }
  const s = String(v);
  if (s.length > 180) {
    return (
      <details>
        <summary style={{ cursor: "pointer", color: C.accent, fontSize: 12.5 }}>{s.slice(0, 110)}…</summary>
        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s}</p>
      </details>
    );
  }
  return <span style={{ whiteSpace: "pre-wrap" }}>{s}</span>;
}

export default function PageContentModal({
  page, hdr, onClose,
}: {
  page: ProfilePage | null;
  hdr: () => Record<string, string>;
  onClose: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!page) return;
    setLoading(true); setErr(""); setData(null); setRaw(false);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${page.templateType}/${page._id}/content`, { headers: hdr() });
      const j = await r.json();
      if (j.success) setData(j.data.page);
      else setErr(j.error || "Could not load this page.");
    } catch {
      setErr("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [page, hdr]);

  useEffect(() => { if (page) load(); }, [page, load]);

  const entries = Object.entries(data || {}).filter(([k]) => !HIDE.has(k));
  const content = entries.filter(([k]) => !META.has(k));
  const meta = entries.filter(([k]) => META.has(k));

  return (
    <Dialog open={!!page} onClose={onClose} title={page ? `${page.templateLabel} — what they created` : ""} wide>
      {loading && <><Skeleton h={80} /><Skeleton h={80} /><Skeleton h={80} /></>}
      {err && <Empty>{err}</Empty>}

      {data && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <Btn variant="ghost" onClick={() => setRaw((r) => !r)}>{raw ? "Readable view" : "Raw JSON"}</Btn>
            {page?.shareId && (
              <>
                <a href={`/${page.shareId}`} target="_blank" rel="noreferrer" className="sa-btn" data-v="accent" style={{ textDecoration: "none" }}>
                  <ExternalLink size={13} /> Open live page
                </a>
                <CopyBtn value={page.shareId} label="Copy share id" />
              </>
            )}
          </div>

          {raw ? (
            <pre className="sa-mono" style={{ background: C.bgAlt, padding: 13, borderRadius: 14, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <>
              {content.length === 0 ? (
                <Empty>This page has no content yet.</Empty>
              ) : (
                content.map(([k, v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 4, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: C.muted }}>
                      {label(k)}
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, minWidth: 0 }}><Value v={v} /></div>
                  </div>
                ))
              )}

              {meta.length > 0 && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: "pointer", color: C.muted, fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                    Page metadata
                  </summary>
                  <div style={{ marginTop: 8 }}>
                    {meta.map(([k, v]) => (
                      <div key={k} className="sa-row">
                        <span className="sa-row-l">{label(k)}</span>
                        <span className="sa-row-v">
                          {k === "createdAt" || k === "updatedAt" ? fmt(v as string) : <Value v={v} />}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </>
      )}
    </Dialog>
  );
}
