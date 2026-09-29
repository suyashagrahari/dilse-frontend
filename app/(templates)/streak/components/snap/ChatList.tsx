"use client";

// The Chat tab: the real app's list grammar — avatar, bold name, a status
// glyph + terse time on the second line, the streak and best-friend emoji at
// the end, a camera shortcut on the right. Their row is pinned on top; the
// rest of the list is cheerful set dressing that gently refuses to open.

import type { Ctx } from "./ctx";
import { C, ago } from "./tokens";
import Bitmoji from "./Bitmoji";
import { AppMark, IcAddFriend, IcCamera, IcNewChat, IcSearch, StatusGlyph } from "./icons";

const EXTRAS: { name: string; status: "chat" | "chatSeen" | "opened" | "seen"; label: string; time: string; preset: string; mark?: boolean }[] = [
  { name: "Team Streaks", status: "chatSeen", label: "Received", time: "1w", preset: "a3", mark: true },
  { name: "the group chat 🍕", status: "chat", label: "New Chat", time: "5m", preset: "a6" },
  { name: "mom 🌸", status: "chatSeen", label: "Received", time: "3d", preset: "a5" },
  { name: "priya ✨", status: "opened", label: "Opened", time: "2d", preset: "a7" },
  { name: "gym bro", status: "seen", label: "Opened", time: "1w", preset: "a4" },
];

export function rowStatus(ctx: Ctx) {
  const { todayView } = ctx;
  const day = ctx.data.checkIns.find((d) => d.date === ctx.today);
  const theirs = day?.[ctx.them];
  const mine = day?.[ctx.me];
  if (todayView.theirsIn && !ctx.openedToday) {
    return { kind: "new" as const, color: C.snapRed, label: "New Snap", time: ago(theirs?.at, ctx.now), bold: true };
  }
  if (todayView.mineIn && !todayView.theirsIn) {
    return { kind: "sent" as const, color: C.snapRed, label: "Delivered", time: ago(mine?.at, ctx.now), bold: false };
  }
  if (todayView.mineIn && todayView.theirsIn) {
    const iWasLast = mine && theirs && Date.parse(mine.at) >= Date.parse(theirs.at);
    return iWasLast
      ? { kind: "seen" as const, color: C.snapRed, label: "Opened", time: ago(mine?.at, ctx.now), bold: false }
      : { kind: "opened" as const, color: C.snapRed, label: "Opened", time: ago(theirs?.at, ctx.now), bold: false };
  }
  if (todayView.theirsIn) return { kind: "opened" as const, color: C.snapRed, label: "Opened", time: ago(theirs?.at, ctx.now), bold: false };
  return { kind: "chatSeen" as const, color: C.chat, label: "Tap to chat", time: "", bold: false };
}

export function StreakTag({ ctx }: { ctx: Ctx }) {
  const n = ctx.view.count;
  return (
    <span className={`snStreakTag${ctx.view.status === "dormant" ? " is-paused" : ""}`}>
      {n > 0 && (
        <>
          <b>{n}</b>
          <span aria-hidden>🔥</span>
        </>
      )}
      {ctx.hourglass && <span aria-label="today's snap is still to send">⌛</span>}
      <span aria-label={ctx.bff.label}>{ctx.bff.emoji}</span>
    </span>
  );
}

export default function ChatList({ ctx, embedded }: { ctx: Ctx; embedded?: boolean }) {
  const st = rowStatus(ctx);
  const { view } = ctx;
  const name = ctx.themP.name || "them";

  return (
    <div className={`snChat${embedded ? " is-embedded" : ""}`}>
      <header className="snHead">
        <button type="button" className="snHeadAv" onClick={ctx.openProfile} aria-label="Profile">
          <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={36} />
        </button>
        <button type="button" className="snRound" onClick={() => ctx.toast("searching… found them. it's always them 💛")} aria-label="Search">
          <IcSearch size={19} />
        </button>
        <h1 className="snHeadTitle">Chat</h1>
        <button type="button" className="snRound" onClick={() => ctx.toast("you already have the only friend that matters 💛")} aria-label="Add friends">
          <IcAddFriend size={20} />
        </button>
        <button type="button" className="snRound" onClick={ctx.openConvo} aria-label="New chat">
          <IcNewChat size={19} />
        </button>
      </header>

      <div className="snChatScroll">
        {view.status === "repairable" ? (
          <button type="button" className="snBanner is-restore" onClick={ctx.restore}>
            <span className="snBannerEmoji">❤️‍🩹</span>
            <span>
              <b>Restore your 🔥 {view.count} with {name}</b>
              <small>yesterday got away from you. that&apos;s allowed. tap to restore</small>
            </span>
          </button>
        ) : view.status === "dormant" ? (
          <button type="button" className="snBanner is-paused" onClick={() => ctx.go("camera")}>
            <span className="snBannerEmoji">🔥</span>
            <span>
              <b>Paused at {view.count} — never broken</b>
              <small>send {name} a snap and pick it back up whenever</small>
            </span>
          </button>
        ) : ctx.hourglass ? (
          <button type="button" className="snBanner" onClick={() => ctx.go("camera")}>
            <span className="snBannerEmoji">⌛</span>
            <span>
              <b>Your 🔥 {view.count} with {name} is waiting</b>
              <small>{ctx.todayView.theirsIn ? `${name} already snapped you — send yours back` : `send today's snap to keep it going`}</small>
            </span>
          </button>
        ) : null}

        <ul className="snRows">
          <li>
            <div className={`snRow is-them${st.bold ? " is-new" : ""}`}>
              <button type="button" className="snRowAv" onClick={ctx.openProfile} aria-label={`${name}'s friendship profile`}>
                <Bitmoji
                  preset={ctx.themAvatar}
                  side={ctx.them}
                  photoUrl={ctx.themP.photoUrl}
                  size={50}
                  ring={ctx.photos.length ? "linear-gradient(135deg,#A05DCD,#0EADFF)" : undefined}
                />
              </button>
              <button type="button" className="snRowMain" onClick={st.kind === "new" ? ctx.openTodaySnap : ctx.openConvo}>
                <span className="snRowName">
                  {name} <span className="snPin" aria-label="pinned">📌</span>
                </span>
                <span className="snRowSub" style={{ color: st.bold ? st.color : undefined }}>
                  <StatusGlyph kind={st.kind} color={st.color} />
                  <span className={st.bold ? "is-strong" : ""}>{st.label}</span>
                  {st.time && <span className="snDot">· {st.time}</span>}
                  <StreakTag ctx={ctx} />
                </span>
              </button>
              <button type="button" className="snRowCam" onClick={() => ctx.go("camera")} aria-label={`Snap ${name}`}>
                <IcCamera size={22} color={C.mute} />
              </button>
            </div>
          </li>
          {EXTRAS.map((x) => (
            <li key={x.name}>
              <div className="snRow is-extra">
                <span className="snRowAv">
                  {x.mark ? <AppMark size={50} /> : <Bitmoji preset={x.preset} size={50} />}
                </span>
                <button type="button" className="snRowMain" onClick={() => ctx.toast(`not today, ${x.name.split(" ")[0]}. there's only one chat that matters 💛`)}>
                  <span className="snRowName">{x.name}</span>
                  <span className="snRowSub" style={{ color: x.status === "chat" ? C.chat : undefined }}>
                    <StatusGlyph kind={x.status} color={x.status.startsWith("chat") ? C.chat : C.snapRed} />
                    <span className={x.status === "chat" ? "is-strong" : ""}>{x.label}</span>
                    <span className="snDot">· {x.time}</span>
                  </span>
                </button>
                <span className="snRowCam" aria-hidden>
                  <IcCamera size={22} color="#C9CBCE" />
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="snListFoot">🔒 end-to-end encrypted. and emotionally, too.</p>
      </div>
    </div>
  );
}
