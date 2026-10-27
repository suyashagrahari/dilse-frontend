"use client";

// ─── One person's journey through the premium upgrade offers ────────────────
//
// Every time this user published a free template that offers its premium
// version (super admin → Upgrades), each step they took was recorded: saw the
// offer, pressed Preview Premium, the preview opened, edited it, went back to
// free, and which one they finally published. Here that reads as one card per
// template (where they ended up, the steps reached) and the full timeline.
//
// Server: GET /admin/super/upgrades/users/:userId (controllers/upgrade.controller.ts).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { OUTCOME, STEP_LABEL, STEP_ORDER, freeName, type UpgradeOutcome, type UpgradeStepName } from "@/lib/upgrade/labels";
import { C } from "./types";
import { Card, Empty, Skeleton, Pill, Stat, fmt, fmtAgo } from "./ui";
import TemplateThumb from "../../TemplateThumb";

interface OfferJourney {
  from: string;
  to: string;
  title: string;
  steps: UpgradeStepName[];
  counts: Partial<Record<UpgradeStepName, number>>;
  outcome: UpgradeOutcome;
  firstAt: string;
  lastAt: string;
}
interface Journey {
  offers: OfferJourney[];
  events: { from: string; to: string; event: UpgradeStepName; pageId: string | null; at: string }[];
}

/** The path a person can walk, in order; the dots fill as they reach each one. */
const PATH: UpgradeStepName[] = ["shown", "try_clicked", "preview_ready", "edit_opened", "premium_published"];

const STEP_TONE: Partial<Record<UpgradeStepName, string>> = {
  try_clicked: "#6d4ad1",
  preview_ready: "#8b6fd4",
  edit_opened: "#c2405c",
  premium_published: "#1e7a4b",
  free_published: C.muted,
  back_to_free: "#b7791f",
  free_chosen: "#b7791f",
  preview_failed: "#b3261e",
};

export default function UpgradesTab({ userId, hdr }: { userId: string; hdr: () => Record<string, string> }) {
  const [data, setData] = useState<Journey | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/upgrades/users/${userId}`, { headers: hdr() });
      const j = await r.json();
      if (j.success) { setData(j.data); setErr(""); } else setErr(j.error || "Could not load.");
    } catch {
      setErr("Could not load.");
    } finally {
      setLoading(false);
    }
  }, [userId, hdr]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <Card title="Premium upgrades"><Skeleton h={90} /><Skeleton h={54} /><Skeleton h={54} /></Card>;
  if (err) return <Card title="Premium upgrades"><Empty>{err}</Empty></Card>;
  if (!data || !data.offers.length) {
    return (
      <Card title="Premium upgrades">
        <Empty>This person has not met a premium offer yet. It appears when they publish a free template that has a premium version (birthday, bouquet, apology, miss you, proposal, anniversary, Halloween…).</Empty>
      </Card>
    );
  }

  const tried = data.offers.filter((o) => o.steps.includes("try_clicked")).length;
  const bought = data.offers.filter((o) => o.outcome === "premium").length;
  const free = data.offers.filter((o) => o.steps.includes("free_published")).length;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <style>{CSS}</style>
      <div className="ut-stats">
        <Stat label="Offers seen" value={data.offers.length} i={0} />
        <Stat label="Tried Premium" value={tried} tone="#6d4ad1" i={1} />
        <Stat label="Bought Premium" value={bought} tone="#1e7a4b" i={2} />
        <Stat label="Published free" value={free} tone={C.muted} i={3} />
      </div>

      <Card title="By template" note={`${data.offers.length} offer${data.offers.length === 1 ? "" : "s"}`}>
        <div className="ut-offers">
          {data.offers.map((o) => {
            const out = OUTCOME[o.outcome];
            return (
              <div key={o.from} className="ut-offer">
                <div className="ut-head">
                  <TemplateThumb slug={o.from} templateType={o.from} label={o.from} size={36} radius={9} />
                  <span className="ut-arrow">→</span>
                  <TemplateThumb slug={o.to} templateType={o.to} label={o.to} size={36} radius={9} />
                  <div className="ut-names">
                    <b>{freeName(o.from)} → {o.title}</b>
                    <small>first {fmtAgo(o.firstAt)}</small>
                  </div>
                  <Pill text={out.text} color={out.tone} solid={o.outcome === "premium"} />
                </div>
                <ol className="ut-path" aria-label="Steps reached">
                  {PATH.map((st) => {
                    const on = o.steps.includes(st);
                    return (
                      <li key={st} data-on={on ? "1" : "0"} title={STEP_LABEL[st].text}>
                        <span className="ut-dot">{STEP_LABEL[st].emoji}</span>
                        <span className="ut-lbl">{STEP_LABEL[st].text}{o.counts[st] && o.counts[st]! > 1 ? ` ×${o.counts[st]}` : ""}</span>
                      </li>
                    );
                  })}
                </ol>
                {STEP_ORDER.filter((st) => !PATH.includes(st) && o.steps.includes(st)).length > 0 && (
                  <div className="ut-also">
                    {STEP_ORDER.filter((st) => !PATH.includes(st) && o.steps.includes(st)).map((st) => (
                      <Pill key={st} text={`${STEP_LABEL[st].emoji} ${STEP_LABEL[st].text}${o.counts[st] && o.counts[st]! > 1 ? ` ×${o.counts[st]}` : ""}`} color={STEP_TONE[st] ?? C.muted} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Every step" note={`${data.events.length} recorded`} action={<Link href="/admin/upgrades" className="ut-link">All upgrades →</Link>}>
        <div className="ut-tl">
          <span aria-hidden className="ut-rail" />
          {data.events.map((e, i) => {
            const tone = STEP_TONE[e.event] ?? C.gold;
            return (
              <div key={i} className="ut-ev" style={{ animationDelay: `${Math.min(i, 14) * 25}ms` }}>
                <span className="ut-evdot" style={{ background: tone, boxShadow: `0 0 0 3px ${tone}22` }} />
                <div className="sa-mini ut-evbody">
                  <div className="ut-evtop">
                    <Pill text={`${STEP_LABEL[e.event]?.emoji ?? ""} ${STEP_LABEL[e.event]?.text ?? e.event}`} color={tone} />
                    <span title={fmt(e.at)}>{fmtAgo(e.at)}</span>
                  </div>
                  <div className="ut-evsub">{freeName(e.from)} → {e.to}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

const CSS = `
.ut-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.ut-offers { display: grid; gap: 12px; }
.ut-offer { padding: 12px; border-radius: 14px; border: 1px solid ${C.border}; background: rgba(255,255,255,.6); }
.ut-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ut-arrow { color: ${C.muted}; font-weight: 800; }
.ut-names { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.ut-names b { font-size: 14px; color: ${C.text}; }
.ut-names small { font-size: 11.5px; color: ${C.muted}; }
.ut-path { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; position: relative; }
.ut-path li { display: flex; flex-direction: column; align-items: center; gap: 5px; text-align: center; }
.ut-dot { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-size: 16px; background: #fff; border: 1.5px solid ${C.border}; filter: grayscale(1); opacity: .4; }
.ut-path li[data-on="1"] .ut-dot { filter: none; opacity: 1; border-color: ${C.gold}; box-shadow: 0 0 0 3px ${C.gold}22; }
.ut-lbl { font-size: 11px; line-height: 1.3; color: ${C.muted}; }
.ut-path li[data-on="1"] .ut-lbl { color: ${C.text}; font-weight: 600; }
.ut-also { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.ut-link { font-size: 12.5px; font-weight: 700; color: ${C.accent}; text-decoration: none; }
.ut-tl { position: relative; display: grid; gap: 2px; padding-left: 4px; }
.ut-rail { position: absolute; left: 7.5px; top: 10px; bottom: 10px; width: 1px; background: linear-gradient(${C.gold}66, ${C.border}); }
.ut-ev { display: flex; gap: 11px; padding: 6px 0; animation: saRise .3s cubic-bezier(.22,1,.36,1) both; }
.ut-evdot { position: relative; width: 8px; height: 8px; border-radius: 999px; margin-top: 5px; flex-shrink: 0; }
.ut-evbody { min-width: 0; flex: 1; padding: 8px 10px; animation: none; }
.ut-evtop { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; align-items: center; }
.ut-evtop > span { font-size: 11px; color: ${C.muted}; }
.ut-evsub { font-size: 12px; color: ${C.muted}; margin-top: 4px; }
@media (max-width: 560px) { .ut-path { grid-template-columns: repeat(5, 1fr); } .ut-lbl { font-size: 9.5px; } .ut-dot { width: 28px; height: 28px; font-size: 13px; } }
`;
