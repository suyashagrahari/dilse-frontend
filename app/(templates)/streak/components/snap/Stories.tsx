"use client";

// Stories + Spotlight — the two feed tabs. Stories: a row of friend rings on
// top (theirs glowing unseen) and a Discover grid of their memories as tiles.
// Spotlight: a full-height vertical feed of the same memories with the note
// as the caption and a heart counter that only goes up.

import { useState } from "react";
import type { Ctx } from "./ctx";
import { photoStyle } from "./tokens";
import Bitmoji from "./Bitmoji";
import { AppMark, IcAddFriend, IcComment, IcHeart, IcSearch, IcShare } from "./icons";
import { rnd } from "../../../_love/LetterReveal";

export function StoriesTab({ ctx }: { ctx: Ctx }) {
  const [seen, setSeen] = useState(false);
  const name = ctx.themP.name || "them";
  const openStory = (start = 0) => {
    setSeen(true);
    ctx.openViewer({
      kind: "story",
      from: "a",
      time: "Our Story",
      items: ctx.photos.map((p) => ({ photo: p, caption: p.caption, sub: p.note, secs: 6 })),
      start,
    });
  };
  return (
    <div className="snStories">
      <header className="snHead">
        <button type="button" className="snHeadAv" onClick={ctx.openProfile} aria-label="Profile">
          <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={36} />
        </button>
        <button type="button" className="snRound" onClick={() => ctx.toast("only one story worth watching 👀")} aria-label="Search">
          <IcSearch size={19} />
        </button>
        <h1 className="snHeadTitle">Stories</h1>
        <button type="button" className="snRound" onClick={() => ctx.toast("you already have the only friend that matters 💛")} aria-label="Add friends">
          <IcAddFriend size={20} />
        </button>
        <span className="snRoundGhost" />
      </header>
      <div className="snStoriesScroll">
        <h3 className="snSecTitle is-pad">Friends</h3>
        <div className="snRings">
          {ctx.photos.length > 0 && (
            <button type="button" className="snRingItem" onClick={() => openStory(0)}>
              <Bitmoji
                preset={ctx.themAvatar}
                side={ctx.them}
                photoUrl={ctx.themP.photoUrl}
                size={68}
                ring={seen ? "#D6D7DA" : "linear-gradient(135deg,#A05DCD,#0EADFF)"}
              />
              <span>{name}</span>
            </button>
          )}
          <button type="button" className="snRingItem" onClick={() => ctx.go("camera")}>
            <span className="snRingAdd">
              <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={64} />
              <i>+</i>
            </span>
            <span>My Story</span>
          </button>
          <button type="button" className="snRingItem" onClick={() => ctx.toast("Team Streaks says: go snap them 🔥")}>
            <Bitmoji preset="a3" size={68} ring="#D6D7DA" />
            <span>Team Streaks</span>
          </button>
        </div>

        {ctx.photos.length > 0 && (
          <>
            <h3 className="snSecTitle is-pad">For You</h3>
            <div className="snDiscover">
              {ctx.photos.map((p, i) => (
                <button key={i} type="button" className="snDisc" onClick={() => openStory(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" draggable={false} style={photoStyle(p)} />
                  <span className="snDiscShade" />
                  <span className="snDiscTx">
                    <b>{p.caption || "a memory"}</b>
                    <small>
                      <AppMark size={14} /> {ctx.themHandle}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function SpotlightTab({ ctx }: { ctx: Ctx }) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const photos = ctx.photos;
  return (
    <div className="snSpot">
      <div className="snSpotTop">
        <span className="is-dim">Following</span>
        <span className="is-on">For You</span>
      </div>
      <div className="snSpotFeed">
        {photos.length === 0 && <div className="snSpotEmpty">no memories yet — add photos in the editor 📸</div>}
        {photos.map((p, i) => {
          const base = 1200 + Math.round(rnd(i, 4) * 88000);
          const n = base + (liked[i] ? 1 : 0);
          return (
            <section key={i} className="snSpotItem">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" draggable={false} style={photoStyle(p)} onDoubleClick={() => setLiked((l) => ({ ...l, [i]: true }))} />
              <div className="snSpotShade" />
              <div className="snSpotRail">
                <button type="button" className={liked[i] ? "is-on" : ""} onClick={() => setLiked((l) => ({ ...l, [i]: !l[i] }))} aria-label="Like">
                  <IcHeart size={30} color={liked[i] ? "#FF3B5C" : "#fff"} fill={liked[i]} />
                  <small>{n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n}</small>
                </button>
                <button type="button" onClick={ctx.openConvo} aria-label="Comment">
                  <IcComment size={28} color="#fff" />
                  <small>{Math.round(rnd(i, 8) * 400) + 12}</small>
                </button>
                <button type="button" onClick={() => ctx.toast("shared with: only them 💛")} aria-label="Share">
                  <IcShare size={28} color="#fff" />
                </button>
              </div>
              <div className="snSpotMeta">
                <span className="snSpotWho">
                  <Bitmoji preset={ctx.data.avatarA} side="a" size={30} /> {ctx.data.handleA || ctx.data.pair.a.name || "them"}
                </span>
                {p.caption && <b>{p.caption}</b>}
                {p.note && <p>{p.note}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
