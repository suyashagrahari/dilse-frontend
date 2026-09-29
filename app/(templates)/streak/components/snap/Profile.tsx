"use client";

// "Our Friendship" — the friendship profile. Big avatar on a tinted header,
// name + username + zodiac, the streak card, a row of Charms (the real app's
// little relationship badges, rewritten for two people in love), Our
// Memories, Our Words (the diary, both columns), the sealed letters, and a
// mini map.

import type { CSSProperties } from "react";
import type { Ctx } from "./ctx";
import { C, photoStyle } from "./tokens";
import Bitmoji from "./Bitmoji";
import { IcBack, IcCamera, IcChat, IcDots, IcLock } from "./icons";
import { avatarOf, zodiacOf } from "../skin";
import { buildPoem, deriveStats, fmtDay, truncWord } from "../types";
import { MiniMap } from "./MapView";

export default function Profile({ ctx, onBack, embedded }: { ctx: Ctx; onBack: () => void; embedded?: boolean }) {
  const { data, view } = ctx;
  const name = ctx.themP.name || "them";
  const zT = zodiacOf(ctx.me === "a" ? data.zodiacB : data.zodiacA);
  const zM = zodiacOf(ctx.me === "a" ? data.zodiacA : data.zodiacB);
  const stats = deriveStats(data, view);
  const poem = buildPoem(data).slice(-8).reverse();
  const tint = avatarOf(ctx.themAvatar, ctx.them).bg;
  const since = fmtDay(data.startedOn, data.timezone);
  const year = data.startedOn.slice(0, 4);

  const charms: { emoji: string; title: string; sub: string; bg: string }[] = [
    { emoji: ctx.bff.emoji, title: ctx.bff.label, sub: view.record >= 100 ? "#1 for 100+ days" : view.record >= 30 ? "#1 for a month straight" : "you're each other's #1", bg: "linear-gradient(135deg,#FFF6B8,#FFE066)" },
    ...(view.count > 0 || view.record > 0
      ? [{ emoji: "🔥", title: "Streak", sub: `${view.count} day${view.count === 1 ? "" : "s"}${view.record > view.count ? ` · best ${view.record}` : ""}`, bg: "linear-gradient(135deg,#FFE1C7,#FFB37A)" }]
      : []),
    { emoji: "🎂", title: "Friendiversary", sub: `friends since ${since}${year ? ` ${year}` : ""}`, bg: "linear-gradient(135deg,#FFE3F1,#FFB6D9)" },
    ...(zT && zM
      ? [{ emoji: `${zM.glyph}${zT.glyph}`, title: "Astrological", sub: `${zM.name} × ${zT.name} — written in the stars`, bg: "linear-gradient(135deg,#E7E1FF,#C3B4FF)" }]
      : zT
        ? [{ emoji: zT.glyph, title: zT.name, sub: `${name}'s sign (explains a lot)`, bg: "linear-gradient(135deg,#E7E1FF,#C3B4FF)" }]
        : []),
    ...(stats.firstMoreOften
      ? [{ emoji: "🌅", title: "Early Bird", sub: `${stats.firstMoreOften.name} snaps first ${stats.firstMoreOften.percent}% of days`, bg: "linear-gradient(135deg,#DDF4FF,#9FD8FF)" }]
      : []),
    ...(stats.mostUsedWord
      ? [{ emoji: "🗣️", title: "Your Word", sub: `“${truncWord(stats.mostUsedWord)}” — said the most`, bg: "linear-gradient(135deg,#DFF7E8,#9BE3B8)" }]
      : []),
  ];

  const letters = [...data.milestones].filter((m) => m.letter.trim()).sort((x, y) => x.atDay - y.atDay);

  return (
    <div className={`snProfile${embedded ? " is-embedded" : ""}`}>
      <div className="snProfHero" style={{ background: `linear-gradient(180deg, ${tint}, #fff)` }}>
        <div className="snProfBar">
          <button type="button" className="snRound is-white" onClick={onBack} aria-label="Back">
            <IcBack size={22} />
          </button>
          <div className="snFlex" />
          <button type="button" className="snRound is-white" onClick={() => ctx.toast("options: love them more ✓")} aria-label="More">
            <IcDots size={22} />
          </button>
        </div>
        <div className="snProfAv">
          <Bitmoji preset={ctx.themAvatar} side={ctx.them} photoUrl={ctx.themP.photoUrl} size={132} />
          <span className="snProfMeAv">
            <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={54} mood="love" />
          </span>
        </div>
        <h2 className="snProfName">{name} {ctx.bff.emoji}</h2>
        <p className="snProfHandle">
          {ctx.themHandle}
          {zT && <> · {zT.glyph} {zT.name}</>}
        </p>
        <div className="snProfActs">
          <button type="button" className="snPill is-blue" onClick={ctx.openConvo}>
            <IcChat size={18} color="#fff" fill /> Chat
          </button>
          <button type="button" className="snPill" onClick={() => ctx.go("camera")}>
            <IcCamera size={18} /> Snap
          </button>
        </div>
      </div>

      <div className="snProfBody">
        <section className="snCard snStreakCard">
          <span className="snStreakFire" aria-hidden>🔥</span>
          <div>
            <b>{view.count > 0 ? `${view.count} day streak` : "no streak yet — start one today"}</b>
            <span>
              {view.status === "dormant"
                ? `paused at ${view.count}. never broken, just resting`
                : ctx.hourglass
                  ? `⌛ today's snap is still to send`
                  : view.count > 0
                    ? "you both snapped today ✓"
                    : `send ${name} a snap to light it`}
            </span>
          </div>
        </section>

        <h3 className="snSecTitle">Charms</h3>
        <div className="snCharms">
          {charms.map((c) => (
            <div key={c.title} className="snCharm" style={{ "--bg": c.bg } as CSSProperties}>
              <span className="snCharmEmoji">{c.emoji}</span>
              <b>{c.title}</b>
              <small>{c.sub}</small>
            </div>
          ))}
        </div>

        {ctx.photos.length > 0 && (
          <>
            <h3 className="snSecTitle">
              Our Memories <button type="button" onClick={ctx.openMemories}>See all</button>
            </h3>
            <div className="snProfGrid">
              {ctx.photos.slice(0, 6).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="snProfTile"
                  onClick={() =>
                    ctx.openViewer({
                      kind: "memory",
                      from: "a",
                      time: p.caption || "a memory",
                      items: ctx.photos.map((q) => ({ photo: q, caption: q.caption, sub: q.note, secs: 7 })),
                      start: i,
                    })
                  }
                  aria-label={p.caption || `Memory ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" draggable={false} style={photoStyle(p)} />
                  {p.caption && <span>{p.caption}</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {poem.length > 0 && (
          <>
            <h3 className="snSecTitle">
              Our Words <button type="button" onClick={ctx.openConvo}>Open diary</button>
            </h3>
            <section className="snCard snWords">
              <div className="snWordsHead">
                <span style={{ color: ctx.me === "a" ? C.me : C.them }}>{data.pair.a.name || "them"}</span>
                <span style={{ color: ctx.me === "b" ? C.me : C.them }}>{data.pair.b.name || "you"}</span>
              </div>
              {poem.map((r) => (
                <div key={r.date} className="snWordsRow">
                  <span>{truncWord(r.a) || "·"}</span>
                  <span>{truncWord(r.b) || "·"}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {letters.length > 0 && (
          <>
            <h3 className="snSecTitle">Sealed Letters</h3>
            <section className="snCard snLetters">
              {letters.map((m) => {
                const open = view.record >= m.atDay;
                const pct = Math.min(100, Math.round((view.record / m.atDay) * 100));
                return (
                  <button
                    key={m.atDay}
                    type="button"
                    className={`snLetterRow${open ? " is-open" : ""}`}
                    onClick={() => (open ? ctx.openMilestone(m.atDay) : ctx.toast(`${m.atDay - view.record} more days of snaps and it opens 🔒`))}
                  >
                    <span className="snLetterIc">{open ? "💌" : <IcLock size={18} color={C.mute} />}</span>
                    <span className="snLetterTx">
                      <b>{m.atDay}-day letter</b>
                      <span className="snLetterBar"><i style={{ width: `${pct}%` }} /></span>
                    </span>
                    <small>{open ? "open" : `${m.atDay - view.record} to go`}</small>
                  </button>
                );
              })}
            </section>
          </>
        )}

        <h3 className="snSecTitle">Our Map</h3>
        <button type="button" className="snCard snMiniMapCard" onClick={() => ctx.go("map")}>
          <MiniMap ctx={ctx} />
        </button>

        {data.letter.trim() && (
          <button type="button" className="snCard snMyEyes" onClick={ctx.openLetter}>
            <IcLock size={18} color="#fff" /> <b>My Eyes Only</b> <span>a letter from {data.pair.a.name || "them"} 💌</span>
          </button>
        )}
        <p className="snListFoot">friendship profiles are only visible to the two of you 💛</p>
      </div>
    </div>
  );
}
