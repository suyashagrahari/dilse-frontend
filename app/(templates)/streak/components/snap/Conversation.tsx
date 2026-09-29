"use client";

// The conversation, in the real app's grammar: no bubbles — runs of text under
// a coloured name label with a matching bar down the left (red for ME, blue
// for them), grey highlight for saved messages, day separators in small caps.
// The history IS the word diary: every day's two words, oldest at the top.
// The input doubles as the check-in — until today's word is sent, "Send a
// chat" reads "Send today's word 🔥".

import { useEffect, useRef, useState } from "react";
import type { Ctx } from "./ctx";
import { C } from "./tokens";
import Bitmoji from "./Bitmoji";
import { IcBack, IcCamera, IcImage, IcMic, IcPhone, IcSend, IcSticker, IcVideo, StatusGlyph } from "./icons";
import { LIMITS, addDays, fmtDay, noteViewFor, unlockedMicroLetters, type Side } from "../types";

interface Msg {
  id: string;
  text: string;
  saved?: boolean;
  kind?: "word" | "note" | "snap" | "letter" | "lock" | "micro" | "local";
  onClick?: () => void;
  glyph?: { kind: "new" | "opened" | "sent" | "seen"; color: string };
  sub?: string;
}

type Block = { t: "sep"; id: string; label: string } | { t: "group"; id: string; from: Side; msgs: Msg[] };

function dayLabel(date: string, today: string, tz: string): string {
  if (date === today) return "TODAY";
  if (date === addDays(today, -1)) return "YESTERDAY";
  const t = Date.parse(`${date}T12:00:00Z`);
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).format(new Date(t)).toUpperCase();
  } catch {
    return date;
  }
}

/** Revealed saved chats persist for the session, so the typing only plays once. */
const revealedFor = new Map<string, number>();

export default function Conversation({ ctx, onBack, embedded }: { ctx: Ctx; onBack: () => void; embedded?: boolean }) {
  const { data, me, them, today, todayView, view } = ctx;
  const sender: Side = "a";
  const chats = data.chats;
  const revealKey = `${data.pair.a.name}|${chats.join("|")}`;
  const [revealed, setRevealed] = useState(() => (ctx.reduced ? chats.length : revealedFor.get(revealKey) ?? 0));
  const [limit, setLimit] = useState(14);
  const [draft, setDraft] = useState("");
  const [local, setLocal] = useState<{ id: string; text: string }[]>([]);
  const [hearted, setHearted] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const name = ctx.themP.name || "them";

  // Their saved lines "type in" one by one, the first time only.
  useEffect(() => {
    if (revealed >= chats.length) {
      revealedFor.set(revealKey, chats.length);
      return;
    }
    const t = window.setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 900 : 1300);
    return () => window.clearTimeout(t);
  }, [revealed, chats.length, revealKey]);

  const blocks: Block[] = (() => {
    const out: Block[] = [];
    const push = (from: Side, m: Msg) => {
      const last = out[out.length - 1];
      if (last && last.t === "group" && last.from === from) last.msgs.push(m);
      else out.push({ t: "group", id: `g${out.length}`, from, msgs: [m] });
    };

    // Saved in chat — the sender's lines, then anything their streak unlocked.
    const micro = unlockedMicroLetters(data, view);
    const letters = [...data.milestones].filter((m) => m.letter.trim()).sort((x, y) => x.atDay - y.atDay);
    if (chats.length || micro.length || letters.length) out.push({ t: "sep", id: "saved", label: "SAVED IN CHAT 💛" });
    chats.slice(0, revealed).forEach((c, i) => push(sender, { id: `c${i}`, text: c, saved: true }));
    micro.forEach((m) => push(sender, { id: `m${m.week}`, text: m.line, saved: true, kind: "micro", sub: `💌 unlocked at week ${m.week}` }));
    letters.forEach((m) => {
      if (view.record >= m.atDay) {
        push(sender, {
          id: `l${m.atDay}`,
          text: `💌 your ${m.atDay}-day letter — tap to open`,
          saved: true,
          kind: "letter",
          onClick: () => ctx.openMilestone(m.atDay),
          sub: m.openedOn ? "opened" : "new",
        });
      } else {
        push(sender, {
          id: `l${m.atDay}`,
          text: `🔒 a letter · opens at 🔥 ${m.atDay}`,
          kind: "lock",
          sub: `${m.atDay - view.record} to go`,
        });
      }
    });

    // The word diary.
    const days = data.checkIns.filter((d) => d.date < today && (d.a?.word || d.b?.word || d.a?.note || d.b?.note));
    const shown = days.slice(-limit);
    if (days.length > shown.length) out.push({ t: "sep", id: "older", label: "__older__" });
    for (const d of shown) {
      out.push({ t: "sep", id: `s${d.date}`, label: dayLabel(d.date, today, data.timezone) });
      const entries = (["a", "b"] as Side[])
        .filter((s) => d[s] && (d[s]?.word || d[s]?.note))
        .sort((x, y) => Date.parse(d[x]!.at) - Date.parse(d[y]!.at));
      for (const s of entries) {
        const e = d[s]!;
        if (e.word) push(s, { id: `${d.date}${s}`, text: e.word, kind: "word" });
        if (e.note) push(s, { id: `${d.date}${s}n`, text: e.note, kind: "note", sub: "🔓 secret line" });
      }
    }

    // Today.
    out.push({ t: "sep", id: "today", label: "TODAY" });
    const t = data.checkIns.find((d) => d.date === today);
    const order = (["a", "b"] as Side[]).filter((s) => t?.[s]).sort((x, y) => Date.parse(t![x]!.at) - Date.parse(t![y]!.at));
    for (const s of order) {
      const e = t![s]!;
      if (s === them) {
        push(s, {
          id: "ts",
          text: ctx.openedToday ? "Opened" : "New Snap",
          kind: "snap",
          glyph: { kind: ctx.openedToday ? "opened" : "new", color: C.snapRed },
          onClick: ctx.openTodaySnap,
        });
        if (todayView.mineIn && e.word) push(s, { id: "tw", text: e.word, kind: "word" });
        const nv = noteViewFor(t, me, data.pair);
        if (nv.state === "locked") push(s, { id: "tn", text: "🔒 left you a secret line — send yours to open", kind: "lock" });
        if (nv.state === "open") push(s, { id: "tn", text: nv.text, kind: "note", sub: "🔓 secret line" });
      } else {
        push(s, {
          id: "ms",
          text: todayView.theirsIn ? "Opened" : "Delivered",
          kind: "snap",
          glyph: { kind: todayView.theirsIn ? "seen" : "sent", color: C.snapRed },
        });
        if (e.word) push(s, { id: "mw", text: e.word, kind: "word" });
        if (e.note) push(s, { id: "mn", text: e.note, kind: "note", sub: "🔒 sealed till they send theirs" });
      }
    }
    local.forEach((l) => push(me, { id: l.id, text: l.text, kind: "local" }));
    return out;
  })();

  // Keep the newest line in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks.length, revealed]);

  const typing = revealed < chats.length;
  const checkIn = !todayView.mineIn;

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (checkIn) {
      ctx.send(text.slice(0, LIMITS.word), "");
      return;
    }
    const id = `x${Date.now()}`;
    setLocal((l) => [...l, { id, text }]);
    window.setTimeout(() => setHearted(id), 1400);
  };

  return (
    <div className={`snConvo${embedded ? " is-embedded" : ""}`}>
      <header className="snConvoHead">
        {!embedded && (
          <button type="button" className="snIconBtn" onClick={onBack} aria-label="Back">
            <IcBack size={24} />
          </button>
        )}
        <button type="button" className="snConvoWho" onClick={ctx.openProfile}>
          <Bitmoji preset={ctx.themAvatar} side={them} photoUrl={ctx.themP.photoUrl} size={36} />
          <span>
            <b>{name}</b>
            <small>
              {view.count > 0 ? `🔥 ${view.count} · ` : ""}
              {ctx.bff.label} {ctx.bff.emoji}
            </small>
          </span>
        </button>
        <div className="snFlex" />
        <button type="button" className="snRound" onClick={() => ctx.toast(`calling ${name}… jk, call them irl 📞`)} aria-label="Call">
          <IcPhone size={19} />
        </button>
        <button type="button" className="snRound" onClick={() => ctx.toast("video call? fix your hair first 💅")} aria-label="Video call">
          <IcVideo size={20} />
        </button>
      </header>

      <div className="snConvoScroll" ref={scrollRef}>
        <div className="snConvoIntro">
          <Bitmoji preset={ctx.themAvatar} side={them} photoUrl={ctx.themP.photoUrl} size={64} />
          <b>{name}</b>
          <span>
            {ctx.themHandle && `${ctx.themHandle} · `}
            {view.count > 0 ? `🔥 ${view.count} day streak` : "start your streak today 🔥"}
          </span>
          <span>friends since {fmtDay(data.startedOn, data.timezone)}</span>
        </div>

        {blocks.map((b) =>
          b.t === "sep" ? (
            b.label === "__older__" ? (
              <button key={b.id} type="button" className="snOlder" onClick={() => setLimit((l) => l + 30)}>
                load older days ↑
              </button>
            ) : (
              <p key={b.id} className="snSep">{b.label}</p>
            )
          ) : (
            <div key={b.id} className="snGroup" style={{ ["--bar" as string]: b.from === me ? C.me : C.them }}>
              <p className="snGroupName" style={{ color: b.from === me ? C.me : C.them }}>
                {b.from === me ? "ME" : name.toUpperCase()}
              </p>
              {b.msgs.map((m) => (
                <div
                  key={m.id}
                  className={`snMsg${m.saved ? " is-saved" : ""} is-${m.kind ?? "text"}${m.onClick ? " is-tap" : ""}`}
                  onClick={m.onClick}
                  role={m.onClick ? "button" : undefined}
                  tabIndex={m.onClick ? 0 : undefined}
                  onKeyDown={m.onClick ? (e) => { if (e.key === "Enter") m.onClick?.(); } : undefined}
                >
                  {m.glyph && <StatusGlyph kind={m.glyph.kind} color={m.glyph.color} />}
                  <span className="snMsgText">{m.text}</span>
                  {m.sub && <small className="snMsgSub">{m.sub}</small>}
                  {m.kind === "local" && hearted === m.id && <span className="snReact" aria-label={`${name} loved this`}>❤️</span>}
                </div>
              ))}
            </div>
          ),
        )}

        {typing && (
          <div className="snTyping" aria-live="polite">
            <Bitmoji preset={ctx.themAvatar} side={them} photoUrl={ctx.themP.photoUrl} size={30} mood="wink" />
            <span className="snTypingDots" aria-label={`${name} is typing`}>
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>

      <div className="snInputBar">
        <button type="button" className="snInCam" onClick={() => ctx.go("camera")} aria-label="Snap">
          <IcCamera size={21} color={C.ink} />
        </button>
        <div className={`snInput${checkIn ? " is-checkin" : ""}`}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder={checkIn ? "Send today's word 🔥" : "Send a chat"}
            maxLength={checkIn ? LIMITS.word : 200}
            aria-label={checkIn ? "Send today's word" : "Send a chat"}
            enterKeyHint="send"
          />
          {draft.trim() ? (
            <button type="button" className="snInSend" onClick={submit} aria-label="Send">
              <IcSend size={18} color="#fff" fill />
            </button>
          ) : (
            <span className="snInIcons">
              <button type="button" onClick={() => ctx.toast("voice notes are for when you miss them extra 🎙️")} aria-label="Voice"><IcMic size={20} /></button>
              <button type="button" onClick={() => setDraft((d) => (d + "🫶").slice(0, LIMITS.word))} aria-label="Sticker"><IcSticker size={20} /></button>
              <button type="button" onClick={ctx.openMemories} aria-label="Memories"><IcImage size={20} /></button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
