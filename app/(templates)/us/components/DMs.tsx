"use client";

// ─── The DM thread ───────────────────────────────────────────────────────────
//
// "Message" opens the chat between the two of them. The sender's lines are
// the grey bubbles on the left; the recipient — who is the one holding the
// phone — owns the pink bubbles on the right. Lines arrive one at a time with
// the typing dots, a double-tap hearts a bubble, and anything they type gets
// a reply.

import { useEffect, useMemo, useRef, useState } from "react";
import Pic from "./Pic";
import { BackArrow, CameraIcon, CloseIcon, ImageIcon, MicIcon, PhoneIcon, SmileIcon, VideoIcon } from "./icons";
import { BUBBLE, PALETTE as P, type ProfileData } from "./types";

interface Msg {
  side: "them" | "me";
  text: string;
}

const COMEBACKS = ["stoppp 🥹", "come here rn", "i love you, idiot", "ok that made me smile", "screenshotted. framing it.", "same. always. 🫶"];

export default function DMs({ data, web, onClose, onToast }: { data: ProfileData; web: boolean; onClose: () => void; onToast: (t: string) => void }) {
  const script: Msg[] = useMemo(() => data.dms.map((text, i) => ({ side: i % 2 === 0 ? "them" : "me", text })), [data.dms]);
  const [shown, setShown] = useState(0);
  const [extra, setExtra] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [hearts, setHearts] = useState<Record<number, boolean>>({});
  const lastTap = useRef<{ i: number; t: number }>({ i: -1, t: 0 });
  const scroller = useRef<HTMLDivElement>(null);

  // Reveal the scripted thread one bubble at a time.
  useEffect(() => {
    if (shown >= script.length) return;
    const nextMsg = script[shown];
    const think = nextMsg.side === "them" ? 900 + Math.min(900, nextMsg.text.length * 18) : 520;
    const t1 = window.setTimeout(() => setTyping(nextMsg.side === "them"), shown === 0 ? 350 : 120);
    const t2 = window.setTimeout(() => {
      setTyping(false);
      setShown((n) => n + 1);
    }, think);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [shown, script]);

  const msgs = [...script.slice(0, shown), ...extra];

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs.length, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setShown(script.length);
    setExtra((x) => [...x, { side: "me", text }]);
    window.setTimeout(() => setTyping(true), 700);
    window.setTimeout(() => {
      setTyping(false);
      setExtra((x) => [...x, { side: "them", text: COMEBACKS[Math.floor(Math.random() * COMEBACKS.length)] }]);
    }, 2200);
  };

  const tap = (i: number, now: number) => {
    if (lastTap.current.i === i && now - lastTap.current.t < 320) {
      setHearts((h) => ({ ...h, [i]: !h[i] }));
      lastTap.current = { i: -1, t: 0 };
    } else lastTap.current = { i, t: now };
  };

  const name = data.from || data.displayName || data.handle;
  const lastMine = msgs.map((m) => m.side).lastIndexOf("me");

  const panel = (
    <div className={web ? "us-dm is-web" : "us-dm"} role="dialog" aria-modal="true" aria-label={`Messages with ${name}`} onClick={(e) => e.stopPropagation()}>
      <header className="us-dm-top">
        <button type="button" className="us-ico" onClick={onClose} aria-label="Back">
          {web ? <CloseIcon size={22} /> : <BackArrow size={24} />}
        </button>
        <span style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
          <Pic src={data.avatarUrl} crop={data.avatarCrop} eager style={{ width: 36, height: 36, borderRadius: "50%" }} />
          <i className="us-dm-online" />
        </span>
        <div style={{ flex: 1, minWidth: 0, lineHeight: "17px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontSize: 12, color: P.grey }}>{typing ? "typing…" : "Active now"}</div>
        </div>
        <button type="button" className="us-ico" onClick={() => onToast("don't call. come over. 📞")} aria-label="Audio call">
          <PhoneIcon size={24} />
        </button>
        <button type="button" className="us-ico" onClick={() => onToast("video call? only if you fix your hair first 😌")} aria-label="Video call">
          <VideoIcon size={26} />
        </button>
      </header>

      <div ref={scroller} className="us-dm-scroll">
        <div className="us-dm-intro">
          <Pic src={data.avatarUrl} crop={data.avatarCrop} eager style={{ width: 88, height: 88, borderRadius: "50%" }} />
          <b style={{ fontSize: 18, marginTop: 10 }}>{name}</b>
          <span style={{ color: P.grey }}>{data.handle} · us.</span>
          <span style={{ color: P.grey, fontSize: 13, marginTop: 2 }}>You follow each other · since forever 💞</span>
          <button type="button" className="us-btn" style={{ marginTop: 12, height: 32 }} onClick={onClose}>
            View profile
          </button>
        </div>
        <div className="us-dm-time">Today 11:48 PM</div>

        {msgs.map((m, i) => {
          const nextSame = msgs[i + 1]?.side === m.side;
          const prevSame = msgs[i - 1]?.side === m.side;
          return (
            <div key={i} className={`us-dm-row is-${m.side}`} style={{ marginTop: prevSame ? 2 : 10 }}>
              {m.side === "them" ? (
                <span className="us-dm-av">{!nextSame ? <Pic src={data.avatarUrl} crop={data.avatarCrop} style={{ width: 28, height: 28, borderRadius: "50%" }} /> : null}</span>
              ) : null}
              <div style={{ position: "relative", maxWidth: "72%" }}>
                <button
                  type="button"
                  className={`us-dm-b is-${m.side}${prevSame ? " p" : ""}${nextSame ? " n" : ""}`}
                  onClick={(e) => tap(i, e.timeStamp)}
                  aria-label={`${m.side === "me" ? "You" : name}: ${m.text}. Double-tap to heart.`}
                >
                  {m.text}
                </button>
                {hearts[i] ? <span className="us-dm-react">❤️</span> : null}
              </div>
            </div>
          );
        })}
        {lastMine >= 0 && lastMine === msgs.length - 1 && !typing ? <div className="us-dm-seen">Seen just now</div> : null}
        {typing ? (
          <div className="us-dm-row is-them" style={{ marginTop: 10 }}>
            <span className="us-dm-av">
              <Pic src={data.avatarUrl} crop={data.avatarCrop} style={{ width: 28, height: 28, borderRadius: "50%" }} />
            </span>
            <div className="us-dm-b is-them us-dm-typing" aria-label="typing">
              <i />
              <i />
              <i />
            </div>
          </div>
        ) : null}
      </div>

      <form
        className="us-dm-compose"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <span className="us-dm-cam" aria-hidden>
          <CameraIcon size={20} color="#fff" />
        </span>
        <input value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 300))} placeholder="Message…" aria-label="Message" enterKeyHint="send" />
        {draft.trim() ? (
          <button type="submit" className="us-postbtn" style={{ padding: "0 6px", fontWeight: 700 }}>
            Send
          </button>
        ) : (
          <>
            <MicIcon size={22} />
            <ImageIcon size={22} />
            <SmileIcon size={22} />
          </>
        )}
      </form>
    </div>
  );

  if (!web) return panel;
  return (
    <div className="us-pm-scrim" onClick={onClose}>
      {panel}
    </div>
  );
}

export const DM_CSS = `
.us-dm{position:fixed;inset:0;z-index:230;background:#fff;display:flex;flex-direction:column;animation:us-slide-in .28s cubic-bezier(.2,.9,.3,1)}
.us-dm.is-web{position:relative;inset:auto;width:min(480px,calc(100vw - 48px));height:min(760px,90vh);border-radius:14px;overflow:hidden;animation:us-zoom .22s ease;box-shadow:0 24px 80px rgba(0,0,0,.35)}
.us-dm-top{height:60px;display:flex;align-items:center;gap:10px;padding:0 6px;border-bottom:1px solid ${P.hair};flex-shrink:0}
.us-dm-online{position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:50%;background:#1CD14F;border:2px solid #fff}
.us-dm-scroll{flex:1;overflow-y:auto;padding:0 12px 12px;overscroll-behavior:contain}
.us-dm-intro{display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 12px 22px;gap:2px}
.us-dm-time{text-align:center;color:${P.grey};font-size:12px;font-weight:600;margin:6px 0 4px}
.us-dm-row{display:flex;align-items:flex-end;gap:8px;animation:us-bubble-in .32s cubic-bezier(.2,1.2,.4,1)}
.us-dm-row.is-me{justify-content:flex-end}
.us-dm-av{width:28px;flex-shrink:0}
.us-dm-b{display:block;text-align:left;padding:9px 13px;border-radius:22px;font-size:15px;line-height:20px;word-break:break-word;white-space:pre-wrap;user-select:none}
.us-dm-b.is-them{background:${P.button};color:${P.ink}}
.us-dm-b.is-me{background:${BUBBLE}!important;color:#fff!important}
.us-dm-b.is-them.p{border-top-left-radius:6px}.us-dm-b.is-them.n{border-bottom-left-radius:6px}
.us-dm-b.is-me.p{border-top-right-radius:6px}.us-dm-b.is-me.n{border-bottom-right-radius:6px}
.us-dm-react{position:absolute;bottom:-12px;right:8px;font-size:13px;background:#fff;border-radius:12px;padding:1px 4px;box-shadow:0 1px 4px rgba(0,0,0,.18);animation:us-pop .35s cubic-bezier(.2,1.6,.4,1)}
.us-dm-row.is-them .us-dm-react{right:auto;left:8px}
.us-dm-row:has(.us-dm-react){margin-bottom:12px}
.us-dm-seen{text-align:right;color:${P.grey};font-size:12px;margin:4px 4px 0}
.us-dm-typing{display:flex;gap:4px;padding:13px 14px}
.us-dm-typing i{width:7px;height:7px;border-radius:50%;background:#8E8E8E;animation:us-typing 1.1s infinite}
.us-dm-typing i:nth-child(2){animation-delay:.15s}.us-dm-typing i:nth-child(3){animation-delay:.3s}
.us-dm-compose{display:flex;align-items:center;gap:12px;margin:8px 12px calc(10px + env(safe-area-inset-bottom,0px));padding:6px 14px 6px 6px;border-radius:24px;background:${P.button};flex-shrink:0}
.us-dm-cam{width:34px;height:34px;border-radius:50%;background:${BUBBLE};display:grid;place-items:center;flex-shrink:0}
.us-dm-compose input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:16px;color:${P.ink}}
`;
