// ─── Screen 2 — the call, connected ──────────────────────────────────────────
//
// The ongoing-call screen: the green timer pill, the name and a ticking clock,
// the waveform, and a live transcript where what they called to say arrives
// one spoken line at a time — with photos "shared while on call" dropping in
// between the lines. Underneath, the six buttons every phone has (mute,
// keypad, speaker, add call, video, hold), each of which does something — and
// the red button at the bottom.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckBadgeGlyph, PhoneDownGlyph } from "./icons";
import { Face, Heart, Keypad, Lock, MicOff, Pause, Pic, PlusPerson, Speaker, StatusBar, Video, mmss } from "./kit";
import type { CallData } from "./types";

type Item = { kind: "line"; text: string; i: number } | { kind: "photo"; index: number };

const KEYS: [string, string][] = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"], ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"], ["*", ""], ["0", "+"], ["#", ""],
];

/** Photos that drop into the transcript — the rest wait in "shared media". */
const IN_CALL_PHOTOS = 3;

export interface InCallProps {
  data: CallData;
  reduce: boolean;
  onEnd: () => void;
  onOpenPhoto: (index: number) => void;
  onToast: (message: string) => void;
}

export default function InCall({ data, reduce, onEnd, onOpenPhoto, onToast }: InCallProps) {
  const { caller } = data;
  const first = caller.name.trim().split(/\s+/)[0] || "They";
  const portrait = caller.photoUrl ? { url: caller.photoUrl, cropX: caller.cropX, cropY: caller.cropY, scale: caller.scale } : null;

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    data.message.forEach((text, i) => {
      out.push({ kind: "line", text, i });
      if (i < Math.min(IN_CALL_PHOTOS, data.photos.length)) out.push({ kind: "photo", index: i });
    });
    return out;
  }, [data.message, data.photos.length]);

  const [secs, setSecs] = useState(0);
  const [shown, setShown] = useState(reduce ? items.length : 0);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [video, setVideo] = useState(false);
  const [hold, setHold] = useState(false);
  const [pad, setPad] = useState(false);
  const [digits, setDigits] = useState("");
  const [hearts, setHearts] = useState(0);
  const [slide, setSlide] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  // The clock.
  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  // One spoken line at a time, paced by its length. Hold pauses the talking.
  useEffect(() => {
    if (hold || shown >= items.length) return;
    const it = items[shown];
    const ms = shown === 0 ? 1100 : it.kind === "photo" ? 1300 : 1500 + Math.min(2600, it.text.length * 38);
    const id = window.setTimeout(() => setShown((n) => n + 1), ms);
    return () => window.clearTimeout(id);
  }, [shown, items, hold]);

  // Keep the newest line in view, inside the transcript only.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [shown, reduce]);

  // Video mode flips through the memories like a real camera feed would not.
  useEffect(() => {
    if (!video || data.photos.length < 2) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % data.photos.length), 3200);
    return () => window.clearInterval(id);
  }, [video, data.photos.length]);

  const talking = !hold && shown < items.length;
  const finished = shown >= items.length;

  const press = (digit: string) => {
    const next = (digits + digit).slice(-14);
    setDigits(next);
    if (next.endsWith("143")) {
      setHearts((h) => h + 1);
      onToast(`1-4-3 → "I love you". ${first} read it instantly ✓✓`);
    } else if (next.endsWith("520")) {
      onToast("5-2-0 → 我爱你. Multilingual romance unlocked.");
    }
  };

  const liveLine = [...items.slice(0, shown)].reverse().find((x) => x.kind === "line") as Extract<Item, { kind: "line" }> | undefined;
  const bgPhoto = video && data.photos.length ? data.photos[slide % data.photos.length] : null;

  return (
    <div className={`cxCall${video ? " is-video" : ""}`} data-stage="connected">
      <div className="cxCallBg" aria-hidden>
        {bgPhoto ? (
          <Pic key={slide} photo={bgPhoto} className="cxCallVid" />
        ) : portrait ? (
          <Pic photo={portrait} className="cxCallBlur" />
        ) : null}
        <span className="cxCallShade" />
      </div>

      <StatusBar pill={<span className="cxTimerPill"><i />{mmss(secs)}</span>} />

      {video && (
        <div className="cxPip" aria-hidden>
          <span>you</span>
          <small>{hearts > 0 ? "😳" : "🙂"}</small>
        </div>
      )}

      <header className="cxCallHead">
        {!video && <Face name={caller.name} photo={portrait} size={84} className={`cxCallFace${talking ? " is-talking" : ""}`} />}
        <h2 className="cxCallName">{caller.name}{data.verified && <CheckBadgeGlyph size={18} color="#F4C95D" style={{ display: "inline-block", verticalAlign: "-2px", marginLeft: 6 }} />}</h2>
        <p className="cxCallMeta">{hold ? "On hold · still yours" : mmss(secs)} <i>·</i> <Lock size={10} /> HD voice</p>
        <Wave on={talking} />
      </header>

      {video ? (
        <p className="cxCaption" aria-live="polite">{liveLine ? liveLine.text : `${first} is smiling at the camera…`}</p>
      ) : (
        <div className="cxTx">
          <p className="cxTxHead"><span className="cxLiveDot" /> Live transcript <small>by Sacch Assistant</small></p>
          <ol className="cxTxList" ref={listRef} aria-live="polite">
            {items.slice(0, shown).map((it, k) =>
              it.kind === "line" ? (
                <li key={k} className={`cxTxLine${k === shown - 1 ? " is-now" : ""}`}>
                  <b>{first}</b>
                  <span>{it.text}</span>
                </li>
              ) : (
                <li key={k} className="cxTxPhoto">
                  <button type="button" onClick={() => onOpenPhoto(it.index)} aria-label={`Open photo: ${data.photos[it.index]?.caption || "shared photo"}`}>
                    <Pic photo={data.photos[it.index]} />
                    <span>
                      <small>📷 {first} shared a photo</small>
                      <b>{data.photos[it.index]?.caption || "look at us"}</b>
                    </span>
                  </button>
                </li>
              ),
            )}
            {talking && <li className="cxTxTyping" aria-hidden><i /><i /><i /></li>}
            {finished && <li className="cxTxEnd">{first} is waiting for you to say something back 🫶</li>}
          </ol>
        </div>
      )}

      <div className="cxCtl">
        <div className="cxCtlGrid">
          <Ctl label="mute" on={mute} onClick={() => { setMute(!mute); onToast(mute ? "Unmuted. Say it back." : `Muted. ${first} can still hear your heartbeat.`); }}><MicOff /></Ctl>
          <Ctl label="keypad" on={pad} onClick={() => setPad(true)}><Keypad /></Ctl>
          <Ctl label="speaker" on={speaker} onClick={() => { setSpeaker(!speaker); onToast(speaker ? "Speaker off. Private again." : "On speaker. The whole room now knows."); }}><Speaker /></Ctl>
          <Ctl label="add call" onClick={() => onToast("Can't add anyone. It's a two-person call. Always was.")}><PlusPerson /></Ctl>
          <Ctl label="video" on={video} onClick={() => { setVideo(!video); if (!video) onToast(data.photos.length ? "Camera on. Memories streaming in HD." : "Camera on. Fix your hair."); }}><Video /></Ctl>
          <Ctl label="hold" on={hold} onClick={() => { setHold(!hold); onToast(hold ? "Back on the call." : `On hold. ${first} is holding… forever, apparently.`); }}><Pause /></Ctl>
        </div>
        <button type="button" className="cxEnd" onClick={onEnd} aria-label="End call">
          <PhoneDownGlyph size={32} color="#fff" />
        </button>
      </div>

      {pad && (
        <div className="cxPad" role="dialog" aria-label="Keypad">
          <p className="cxPadDigits" aria-live="polite">{digits || <span>psst — try 1 4 3</span>}</p>
          <div className="cxPadGrid">
            {KEYS.map(([d, l]) => (
              <button key={d} type="button" onClick={() => press(d)} aria-label={d}>
                <b>{d}</b>
                <small>{l || " "}</small>
              </button>
            ))}
          </div>
          <div className="cxPadFoot">
            <span />
            <button type="button" className="cxEnd" onClick={onEnd} aria-label="End call"><PhoneDownGlyph size={30} color="#fff" /></button>
            <button type="button" className="cxPadHide" onClick={() => setPad(false)}>Hide</button>
          </div>
          {hearts > 0 && (
            <div className="cxPadHearts" key={hearts} aria-hidden>
              {Array.from({ length: 9 }, (_, i) => <span key={i} style={{ left: `${8 + i * 10.5}%`, animationDelay: `${(i % 4) * 90}ms` }}><Heart size={18 + (i % 3) * 8} color={i % 2 ? "#FF5C93" : "#F4C95D"} /></span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Ctl({ label, on, onClick, children }: { label: string; on?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`cxCtlBtn${on ? " is-on" : ""}`} onClick={onClick} aria-pressed={on ?? undefined}>
      <span>{children}</span>
      <small>{label}</small>
    </button>
  );
}

/** The voice, drawn. Bars breathe while they talk and lie flat on hold. */
export function Wave({ on, bars = 32 }: { on: boolean; bars?: number }) {
  return (
    <span className={`cxWave${on ? " is-on" : ""}`} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <i key={i} style={{ animationDelay: `${((i * 137) % 900) / 1000}s`, height: `${30 + ((i * 53) % 70)}%` }} />
      ))}
    </span>
  );
}
