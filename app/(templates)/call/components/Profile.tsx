// ─── The caller-ID profile ───────────────────────────────────────────────────
//
// What the app shows when you open a number: the cover and the big avatar with
// its gold ring, the verified name and the "saved as", the action row (Call,
// Message, Save, Block, Report), the spam gauge reading a confident 0%, the
// crowd tags, SHARED MEDIA (the memories), the voicemail (the main letter),
// "who viewed your profile", and the call history with its filter chips.
//
// On a phone this is the page you land on after the call ends. On a tablet or
// desktop the same sections sit in a panel beside the ringing phone, and the
// call history moves to its own rail.

"use client";

import { useMemo, useState } from "react";
import { CallDirectionGlyph, CheckBadgeGlyph, PhoneGlyph } from "./icons";
import { Wave } from "./InCall";
import { Back, Ban, Bubble, Crown, Dots, Face, Flag, Heart, Mic, Pic, Pin, Play, SavePerson, Search, SimCard, Sparkle, mmss } from "./kit";
import { useCountUp } from "./theme";
import { WORDMARK, spamLabel, type CallData, type CallerTag, type CallKind, type CallLogEntry } from "./types";

export interface ProfileProps {
  data: CallData;
  tags: readonly CallerTag[];
  variant: "page" | "panel";
  /** Seconds the call lasted — shown in the after-call banner. */
  talked?: number;
  showLog?: boolean;
  contribLink?: string | null;
  onTagHer?: () => void;
  onOpenPhoto: (index: number) => void;
  onVoicemail?: () => void;
  onCallBack?: () => void;
  onSaveCard?: () => void;
  onToast: (message: string) => void;
}

export default function Profile(P: ProfileProps) {
  const { data, tags, variant } = P;
  const { caller } = data;
  const first = caller.name.trim().split(/\s+/)[0] || "They";
  const portrait = caller.photoUrl ? { url: caller.photoUrl, cropX: caller.cropX, cropY: caller.cropY, scale: caller.scale } : null;
  const cover = data.photos[0] ?? portrait;
  const risk = Math.max(0, Math.min(100, Math.round(data.spamRisk)));
  const [saved, setSaved] = useState(false);

  return (
    <div className={`cxProf cxProf--${variant}`}>
      {variant === "page" && (
        <div className="cxAppBar">
          <button type="button" aria-label="Back" onClick={P.onCallBack}><Back /></button>
          <span className="cxAppBarBrand"><b>{WORDMARK}</b><i>✓</i></span>
          <span className="cxFlex" />
          <button type="button" aria-label="Search" onClick={() => P.onToast(`Searched "${first}". 1 result. It's always 1 result.`)}><Search /></button>
          <button type="button" aria-label="More" onClick={() => P.onToast("Options: love, love more, love the most.")}><Dots /></button>
        </div>
      )}

      {variant === "page" && (
        <div className="cxAfter">
          <div>
            <p className="cxAfterK">Call ended{P.talked ? ` · ${mmss(P.talked)}` : ""}</p>
            <p className="cxAfterV">Duration: forever <span aria-hidden>∞</span></p>
          </div>
          <button type="button" className="cxAfterBtn" onClick={P.onCallBack}><PhoneGlyph size={16} color="#fff" /> Call back</button>
        </div>
      )}

      {/* hero */}
      <section className="cxHero">
        <div className="cxHeroCover" aria-hidden>
          {cover && <Pic photo={cover} />}
          <span />
        </div>
        <div className="cxHeroMain">
          <div className="cxHeroFaceWrap">
            <Face name={caller.name} photo={portrait} size={variant === "page" ? 104 : 96} className="cxHeroFace" />
            <span className="cxHeroCrown" aria-hidden><Crown size={14} /></span>
          </div>
          <h2 className="cxHeroName">
            {caller.name || "Unknown"}
            {data.verified && <CheckBadgeGlyph size={22} color="#F4C95D" style={{ display: "inline-block", verticalAlign: "-3px", marginLeft: 7 }} />}
          </h2>
          <p className="cxGoldChip"><Sparkle size={11} /> Gold caller ID · reserved for 1 person</p>
          {data.savedAs && <p className="cxSavedAs">Saved in your phone as <b>{data.savedAs}</b></p>}
          <p className="cxHeroNum">
            <span>{caller.number || "Private number"}</span>
            {caller.carrier && <><i>·</i><SimCard size={13} /> {caller.carrier}</>}
          </p>
          {caller.location && <p className="cxHeroLoc"><Pin size={13} /> {caller.location}</p>}
        </div>

        <div className="cxActions">
          <Act label="Call" tone="green" onClick={() => P.onCallBack?.()}><PhoneGlyph size={20} color="currentColor" /></Act>
          <Act label="Message" onClick={() => P.onToast(`Typing… ${first} is already typing too.`)}><Bubble /></Act>
          <Act label={saved ? "Saved ✓" : "Save"} onClick={() => { setSaved(true); P.onToast(`Already saved. In your phone, your heart and 3 group chats.`); }}><SavePerson /></Act>
          <Act label="Block" onClick={() => P.onToast("Blocking unavailable. You tried at 2 AM once. It didn't take.")}><Ban /></Act>
          <Act label="Report" onClick={() => P.onToast("Report filed: 'dangerously cute'. No action taken.")}><Flag /></Act>
        </div>
      </section>

      {/* spam gauge */}
      <section className="cxCard cxSpam">
        <Gauge risk={risk} />
        <div className="cxSpamTx">
          <p className="cxSpamH">{risk === 0 ? "Not spam. Never spam." : spamLabel(data)}</p>
          <p className="cxSpamS">{risk === 0 ? `0 spam reports · ${data.verified ? "identity verified · " : ""}1 person reported being in love with this number` : "Some people report this number."}</p>
        </div>
      </section>

      {/* tags */}
      {tags.length > 0 && (
        <section className="cxCard">
          <SecHead title="Saved by others as" sub={`${tags.length} tags from people who know ${first}`} />
          <ul className="cxTags">
            {tags.slice(0, 10).map((t, i) => <TagChip key={t.label + i} tag={t} i={i} />)}
          </ul>
          {P.contribLink && P.onTagHer && (
            <button type="button" className="cxGhostBtn" onClick={P.onTagHer}>+ Ask friends to tag {first}</button>
          )}
        </section>
      )}

      {/* shared media */}
      {data.photos.length > 0 && (
        <section className="cxCard">
          <SecHead title="Shared media" sub={`${data.photos.length} memories · tap one`} />
          <div className={`cxMedia cxMedia--${Math.min(data.photos.length, 6)}`}>
            {data.photos.map((ph, i) => (
              <button key={i} type="button" className="cxMediaTile" onClick={() => P.onOpenPhoto(i)} aria-label={`Open ${ph.caption || `photo ${i + 1}`}`} style={{ animationDelay: `${i * 60}ms` }}>
                <Pic photo={ph} />
                {ph.caption && <span className="cxMediaCap">{ph.caption}</span>}
                {ph.note && <span className="cxMediaNote" aria-hidden>💌</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* voicemail = the main letter */}
      {data.letter.trim() && P.onVoicemail && (
        <section className="cxCard cxVm">
          <SecHead title="Voicemail" sub="1 new · transcript ready" badge />
          <button type="button" className="cxVmRow" onClick={P.onVoicemail}>
            <span className="cxVmPlay"><Play size={20} color="#0B0E12" /></span>
            <span className="cxVmMid">
              <Wave on bars={26} />
              <small><Mic size={11} /> {first} · {voicemailLength(data.letter)} · tap to listen</small>
            </span>
          </button>
        </section>
      )}

      {/* who viewed */}
      {data.whoViewed && (
        <section className="cxCard cxViewed">
          <SecHead title="Who viewed your profile" sub="this week" />
          <div className="cxViewedRow">
            <Face name={caller.name} photo={portrait} size={40} />
            <p>{data.whoViewed}</p>
          </div>
          <Bars />
        </section>
      )}

      {P.showLog !== false && data.callLog.length > 0 && (
        <section className="cxCard">
          <SecHead title="Call history" sub={`${data.callLog.length} calls with ${first}`} />
          <LogList data={data} />
        </section>
      )}

      <footer className="cxProfFoot">
        {P.onSaveCard && <button type="button" className="cxGhostBtn" onClick={P.onSaveCard}>Save this caller ID as an image</button>}
        <p><b>{WORDMARK}</b> ✓ · know who&apos;s calling. It&apos;s always {first}. <Heart size={11} color="#FF5C93" /></p>
      </footer>
    </div>
  );
}

function voicemailLength(letter: string) {
  const s = Math.max(12, Math.round(letter.split(/\s+/).length / 2.6));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Act({ label, onClick, tone, children }: { label: string; onClick: () => void; tone?: "green"; children: React.ReactNode }) {
  return (
    <button type="button" className={`cxAct${tone ? ` is-${tone}` : ""}`} onClick={onClick}>
      <span>{children}</span>
      <small>{label}</small>
    </button>
  );
}

function SecHead({ title, sub, badge }: { title: string; sub?: string; badge?: boolean }) {
  return (
    <div className="cxSecHead">
      <h3>{title}{badge && <i className="cxDot" aria-hidden />}</h3>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function TagChip({ tag, i }: { tag: CallerTag; i: number }) {
  const n = useCountUp(tag.count);
  return (
    <li className={`cxTag${i === 0 ? " is-top" : ""}`} style={{ animationDelay: `${i * 50}ms` }}>
      <span>{tag.label}</span>
      <b>{n.toLocaleString("en-IN")}</b>
    </li>
  );
}

/** A semicircle gauge. 0% is drawn as a full green "safe" arc with a needle at zero. */
function Gauge({ risk }: { risk: number }) {
  const a = Math.PI * (1 - risk / 100);
  const nx = 60 + Math.cos(a) * 40;
  const ny = 62 - Math.sin(a) * 40;
  return (
    <svg className="cxGauge" viewBox="0 0 120 72" aria-hidden>
      <defs>
        <linearGradient id="cxg" x1="0" x2="1">
          <stop offset="0" stopColor="#1DA362" />
          <stop offset=".55" stopColor="#F4C95D" />
          <stop offset="1" stopColor="#E5484D" />
        </linearGradient>
      </defs>
      <path d="M12 62a48 48 0 0 1 96 0" stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M12 62a48 48 0 0 1 96 0" stroke="url(#cxg)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="151" strokeDashoffset={151 - 151 * Math.max(0.04, risk / 100)} className="cxGaugeArc" />
      <line x1="60" y1="62" x2={nx} y2={ny} stroke="#fff" strokeWidth="3" strokeLinecap="round" className="cxGaugeNeedle" />
      <circle cx="60" cy="62" r="5" fill="#fff" />
      <text x="60" y="48" textAnchor="middle" fontSize="17" fontWeight="800" fill="#fff">{risk}%</text>
    </svg>
  );
}

/** Profile views, Mon–Sun, peaking at the hour nobody admits to. */
function Bars() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const vals = [34, 52, 41, 66, 58, 88, 100];
  return (
    <div className="cxBars" aria-hidden>
      {vals.map((v, i) => (
        <span key={i}>
          <i style={{ height: `${v}%`, animationDelay: `${i * 70}ms` }} />
          <small>{days[i]}</small>
        </span>
      ))}
    </div>
  );
}

/* ── call history ─────────────────────────────────────────────────────────── */

const FILTERS: { id: "all" | CallKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "incoming", label: "Incoming" },
  { id: "outgoing", label: "Outgoing" },
];

const KIND_WORD: Record<CallKind, string> = { missed: "Missed call", incoming: "Incoming", outgoing: "Outgoing", rejected: "Declined" };

export function LogList({ data, compact }: { data: CallData; compact?: boolean }) {
  const [filter, setFilter] = useState<"all" | CallKind>("all");
  const [open, setOpen] = useState<number | null>(compact ? null : 0);
  const rows = useMemo(
    () => data.callLog.map((e, i) => ({ e, i })).filter(({ e }) => filter === "all" || e.kind === filter || (filter === "missed" && e.kind === "rejected")),
    [data.callLog, filter],
  );
  return (
    <div className="cxLog">
      <div className="cxChips" role="tablist" aria-label="Filter calls">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={filter === f.id ? "is-on" : ""} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <ul className="cxLogList">
        {rows.map(({ e, i }) => (
          <LogRow key={i} e={e} name={data.caller.name} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
        ))}
        {rows.length === 0 && <li className="cxLogEmpty">No {filter} calls. Suspicious, honestly.</li>}
      </ul>
    </div>
  );
}

function LogRow({ e, name, open, onToggle }: { e: CallLogEntry; name: string; open: boolean; onToggle: () => void }) {
  const red = e.kind === "missed" || e.kind === "rejected";
  return (
    <li className={`cxLogRow${open ? " is-open" : ""}`}>
      <button type="button" onClick={onToggle} aria-expanded={open}>
        <span className={`cxLogIc${red ? " is-red" : ""}`}><CallDirectionGlyph kind={e.kind} size={17} color={red ? "#FF6369" : e.kind === "outgoing" ? "#6FD6A0" : "#9AA4AE"} /></span>
        <span className="cxLogMid">
          <b className={red ? "is-red" : ""}>{KIND_WORD[e.kind]}{e.duration ? <small> · {e.duration}</small> : null}</b>
          <small>{[e.ago, e.time].filter(Boolean).join(", ") || name}</small>
        </span>
        <span className="cxLogInfo" aria-hidden>i</span>
      </button>
      {e.note && <p className="cxLogNote">{e.note}</p>}
    </li>
  );
}

