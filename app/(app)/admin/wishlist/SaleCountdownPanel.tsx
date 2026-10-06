"use client";

// ─── Super admin: the wishlist sale countdown ───────────────────────────────
//
// The switch behind the "30% off — ends in 09d 14h" banners on the blog and the
// template gallery. On starts a countdown from now for the chosen length; at
// zero the banners vanish by themselves and this card offers a restart (a
// "Last chance" run, say); off removes them everywhere within seconds. Every
// start and stop is in the audit log. The discount is the wishlist's own and is
// not edited here, so a banner can never promise what the join doesn't save.

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, Power, RotateCcw, Timer } from "lucide-react";
import { API_URL } from "@/lib/config";
import { useNow, countdown, pad2, promoCopy, type PromoStyle } from "@/hooks/usePromo";
import { A, ChipGroup, Panel, fmtNum } from "../adminKit";

interface PromoView {
  campaign: string;
  label: string;
  discountPercent: number;
  enabled: boolean;
  live: boolean;
  ended: boolean;
  startedAt: string | null;
  endsAt: string | null;
  durationHours: number;
  style: PromoStyle;
  runNumber: number;
  updatedByEmail: string;
  serverNow: string;
  stats: { total: number; duringRun: number; bySource: { source: string; n: number }[] };
}

const DURATIONS = [
  { value: 24, label: "1 day" },
  { value: 72, label: "3 days" },
  { value: 168, label: "7 days" },
  { value: 240, label: "10 days" },
  { value: 336, label: "14 days" },
];

const STYLES: { value: PromoStyle; label: string }[] = [
  { value: "sale", label: "💘 Wishlist sale" },
  { value: "last-chance", label: "⏳ Last chance" },
  { value: "extended", label: "🎉 Extended" },
];

export const PROMO_SOURCE_LABEL: Record<string, string> = {
  "blog-banner": "Blog banner",
  "blog-card": "Blog countdown card",
  "templates-banner": "Templates banner",
  "deep-link": "Sale link",
};

export default function SaleCountdownPanel({ campaign, accessToken, onChange }: {
  campaign: string;
  accessToken: string | null;
  onChange?: () => void;
}) {
  const [v, setV] = useState<PromoView | null>(null);
  const [skew, setSkew] = useState(0);
  const [busy, setBusy] = useState<"start" | "stop" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(240);
  const [style, setStyle] = useState<PromoStyle>("sale");
  const [editing, setEditing] = useState(false);
  const t = useNow();

  const apply = useCallback((d: PromoView) => {
    setV(d);
    setSkew(new Date(d.serverNow).getTime() - Date.now());
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    let live = true;
    void (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/promo/${campaign}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const json = await res.json();
        if (!live) return;
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to load");
        apply(json.data);
        // A restart defaults to "Last chance" — the natural second run.
        if (json.data.runNumber > 0) setStyle("last-chance");
        if (json.data.runNumber > 0) setHours(72);
      } catch (e) {
        if (live) setError((e as Error).message);
      }
    })();
    return () => { live = false; };
  }, [accessToken, campaign, apply]);

  const act = async (kind: "start" | "stop", body?: { durationHours: number; style: PromoStyle }) => {
    if (!accessToken || busy) return;
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/promo/${campaign}/${kind}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to ${kind}`);
      apply(json.data);
      setEditing(false);
      onChange?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (!v) {
    return (
      <Panel title="Sale countdown" icon={<Timer size={15} color={A.goldDeep} />}>
        {error ? <div className="scp-err">{error}</div> : <div className="scp-muted"><Loader2 size={14} className="animate-spin" /> Loading…</div>}
        <style>{SCP_CSS}</style>
      </Panel>
    );
  }

  const endsLocal = v.endsAt ? new Date(v.endsAt).getTime() - skew : 0;
  const live = v.enabled && !!t && endsLocal > t;
  const ended = v.enabled && !!v.endsAt && !!t && endsLocal <= t;
  const c = countdown(endsLocal, t || Date.now());
  const preview = promoCopy({ style, discountPercent: v.discountPercent });
  const showControls = !live || editing;
  const state = live ? "live" : ended ? "ended" : "off";

  return (
    <Panel
      title="Sale countdown"
      icon={<Timer size={15} color={A.goldDeep} />}
      note={`${v.discountPercent}% off · banners on the blog and templates`}
      right={
        <button
          type="button"
          role="switch"
          aria-checked={v.enabled}
          aria-label={v.enabled ? "Switch the sale off" : "Start the sale"}
          className={`scp-switch${v.enabled ? " on" : ""}`}
          disabled={!!busy}
          onClick={() => (v.enabled ? act("stop") : act("start", { durationHours: hours, style }))}
        >
          <span />
        </button>
      }
    >
      <style>{SCP_CSS}</style>

      <div className={`scp-status is-${state}`}>
        {state === "live" && (
          <>
            <span className="scp-dot" aria-hidden />
            <div className="scp-status-txt">
              <b>Live{v.runNumber > 1 ? ` · run ${v.runNumber}` : ""} — {promoCopy(v).tag.toLowerCase()}</b>
              <span>Ends {new Date(v.endsAt!).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <div className="scp-clock" role="timer">
              {[{ n: c.d, l: "d" }, { n: c.h, l: "h" }, { n: c.m, l: "m" }, { n: c.s, l: "s" }].map((x) => (
                <span key={x.l}><b>{pad2(x.n)}</b>{x.l}</span>
              ))}
            </div>
          </>
        )}
        {state === "ended" && (
          <div className="scp-status-txt">
            <b>⌛ The countdown ended — banners are hidden</b>
            <span>Restart it below, e.g. as a 3-day “Last chance”.</span>
          </div>
        )}
        {state === "off" && (
          <div className="scp-status-txt">
            <b>Off — no sale banners anywhere</b>
            <span>Pick a length and style, then switch it on. The timer is the same for every visitor and never resets.</span>
          </div>
        )}
      </div>

      {v.runNumber > 0 && v.startedAt && (
        <div className="scp-stats">
          <span className="scp-stat"><b>{fmtNum(v.stats.duringRun)}</b> joined since this run started</span>
          {v.stats.bySource.map((s) => (
            <span key={s.source} className="scp-stat">{PROMO_SOURCE_LABEL[s.source] ?? (s.source === "wishlist-page" ? "Wishlist page" : s.source)} <b>{fmtNum(s.n)}</b></span>
          ))}
          <span className="scp-stat">All time <b>{fmtNum(v.stats.total)}</b></span>
        </div>
      )}

      {showControls ? (
        <div className="scp-controls">
          <div className="scp-row">
            <span className="scp-lbl">Length</span>
            <ChipGroup id="scp-len" value={hours} onChange={setHours} options={DURATIONS} />
          </div>
          <div className="scp-row">
            <span className="scp-lbl">Banner</span>
            <ChipGroup id="scp-style" value={style} onChange={setStyle} options={STYLES} />
          </div>
          <div className="scp-preview" aria-label="Banner preview">
            <span className="scp-preview-tag">{preview.tag}</span>
            <span className="scp-preview-txt">{preview.emoji} {preview.title}</span>
            <span className="scp-preview-clock">Ends in <b>{Math.floor(hours / 24) > 0 ? `${Math.floor(hours / 24)}d ` : ""}{pad2(hours % 24)}:00:00</b></span>
          </div>
          <div className="scp-actions">
            <button type="button" className="scp-btn primary" disabled={!!busy} onClick={() => act("start", { durationHours: hours, style })}>
              {busy === "start" ? <Loader2 size={14} className="animate-spin" /> : v.runNumber > 0 ? <RotateCcw size={14} /> : <Play size={14} />}
              {live ? "Restart with these settings" : v.runNumber > 0 ? "Restart countdown" : "Start countdown"}
            </button>
            {editing && <button type="button" className="scp-btn" onClick={() => setEditing(false)}>Cancel</button>}
          </div>
          {live && <p className="scp-note">Restarting replaces the current end time and counts as a new run, so the banner can say “Last chance” or “Extended”.</p>}
        </div>
      ) : (
        <div className="scp-actions">
          <button type="button" className="scp-btn" onClick={() => setEditing(true)}><RotateCcw size={14} /> Restart or change</button>
          <button type="button" className="scp-btn danger" disabled={!!busy} onClick={() => act("stop")}>
            {busy === "stop" ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />} Switch off now
          </button>
        </div>
      )}

      {error && <div className="scp-err">{error}</div>}
    </Panel>
  );
}

const SCP_CSS = `
.scp-muted { display: flex; align-items: center; gap: 8px; font-size: 13px; color: ${A.muted}; }
.scp-err { margin-top: 10px; padding: 8px 12px; border-radius: 10px; font-size: 12.5px; color: ${A.danger}; background: rgba(179,38,30,.08); }
.scp-switch { position: relative; width: 46px; height: 26px; border: 0; border-radius: 999px; cursor: pointer; background: rgba(61,12,17,.18); transition: background .25s ease; }
.scp-switch span { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 999px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.25); transition: transform .25s cubic-bezier(.22,1,.36,1); }
.scp-switch.on { background: linear-gradient(90deg, #a01d3a, #6d0f26); }
.scp-switch.on span { transform: translateX(20px); }
.scp-switch:disabled { opacity: .6; cursor: progress; }
.scp-status { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 14px; border-radius: 14px; }
.scp-status.is-live { color: #fff4f1; background: linear-gradient(100deg, #3d0c11, #7a1229 55%, #a01d3a); }
.scp-status.is-ended { background: rgba(183,121,31,.1); box-shadow: inset 0 0 0 1px rgba(183,121,31,.3); }
.scp-status.is-off { background: rgba(61,12,17,.04); box-shadow: inset 0 0 0 1px ${A.edge}; }
.scp-dot { width: 10px; height: 10px; border-radius: 999px; background: #4ade80; box-shadow: 0 0 0 0 rgba(74,222,128,.7); animation: scpPing 1.6s ease-out infinite; }
@keyframes scpPing { to { box-shadow: 0 0 0 10px rgba(74,222,128,0); } }
.scp-status-txt { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; }
.scp-status-txt b { font-size: 13.5px; }
.scp-status.is-live .scp-status-txt span { color: rgba(255,244,241,.75); }
.scp-status:not(.is-live) .scp-status-txt span { color: ${A.soft}; }
.scp-status:not(.is-live) .scp-status-txt b { color: ${A.ink}; }
.scp-clock { display: flex; gap: 6px; }
.scp-clock span { display: flex; align-items: baseline; gap: 1px; padding: 6px 8px; border-radius: 9px; background: rgba(0,0,0,.25); font-size: 10px; color: #f6d58a; }
.scp-clock b { font-size: 17px; font-variant-numeric: tabular-nums; color: #fff; }
.scp-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.scp-stat { padding: 5px 10px; border-radius: 999px; font-size: 12px; color: ${A.soft}; background: rgba(201,168,76,.12); }
.scp-stat b { color: ${A.ink}; }
.scp-controls { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.scp-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.scp-lbl { width: 56px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: ${A.muted}; }
.scp-preview { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 8px 10px; border-radius: 12px; color: #fff4f1; overflow: hidden;
  background: linear-gradient(100deg, #3d0c11, #7a1229 45%, #a01d3a 70%, #6d0f26); }
.scp-preview-tag { flex: none; padding: 4px 9px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .14em; color: #3d0c11; background: linear-gradient(180deg, #ffe7a8, #e8bf5f); }
.scp-preview-txt { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.scp-preview-clock { flex: none; padding: 5px 8px; border-radius: 8px; font-size: 10px; color: #f6d58a; background: rgba(0,0,0,.28); }
.scp-preview-clock b { font-size: 12.5px; color: #fff; font-variant-numeric: tabular-nums; }
.scp-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.scp-controls .scp-actions { margin-top: 2px; }
.scp-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; border-radius: 11px; border: 1px solid ${A.edge}; background: #fff; color: ${A.ink}; font-size: 13px; font-weight: 700; cursor: pointer; }
.scp-btn.primary { border: 0; color: #fff4f1; background: linear-gradient(180deg, #8a1730, #5a1520); box-shadow: 0 8px 18px -10px rgba(90,21,32,.9); }
.scp-btn.danger { color: ${A.danger}; border-color: rgba(179,38,30,.25); }
.scp-btn:disabled { opacity: .6; cursor: progress; }
.scp-note { margin: 0; font-size: 12px; color: ${A.muted}; }
@media (max-width: 560px) {
  .scp-lbl { width: 100%; }
  .scp-preview-txt { display: none; }
  .scp-preview { justify-content: space-between; }
  .scp-btn { flex: 1; justify-content: center; }
}
`;
