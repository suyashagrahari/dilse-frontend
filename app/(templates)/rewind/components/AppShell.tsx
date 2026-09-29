"use client";

// ─── Rewind — the "Lovify" app around the story ──────────────────────────────
//
// A music-streaming app, played dead straight: Home with the "Your Rewind is
// here" banner, quick-access tiles, "Made for you" shelves, a docked player
// with a playlist of their songs, Liked Songs (= the memories, each photo a
// track with its note as the lyrics), Search's colour tiles, Your Library.
//
// Phone: one scrolling column, floating player above the tab bar, full-screen
// Now Playing. Tablet: collapsed library rail + wide player bar. Desktop: the
// web player — library sidebar, main view, Now Playing panel on the right,
// player bar across the bottom.

import React from "react";
import { hash32 } from "@/lib/seededRandom";
import { fmt, type Year } from "./derive";
import { C, FONT, HeartMark, Logo, Pic, tint } from "./theme";
import {
  IBell, ICheckCircle, IClock, IDevices, IDots, IDown, IDownload, IHeart, IHome, ILibrary, ILock, ILyrics,
  INext, IPause, IPlay, IPlus, IPlusCircle, IPrev, IQueue, IRepeat, ISearch, IShuffle, IVolume,
} from "./icons";
import type { LovePhoto, RewindData } from "./types";

type View = "home" | "search" | "library" | "liked" | "playlist";

interface Track {
  id: string;
  title: string;
  sub: string;
  photo?: LovePhoto;
  lyrics: string[];
  dur: number;
  from: "playlist" | "liked";
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const durOf = (k: string) => 150 + (hash32(k) % 100);
const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Up late?" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function AppShell({
  data,
  y,
  onOpenStory,
  letterLocked,
}: {
  data: RewindData;
  y: Year;
  onOpenStory: () => void;
  /** Whether the bonus-track row shows in Liked Songs. */
  letterLocked: boolean;
}) {
  const P = data.photos;
  const cover = (i: number) => (P.length ? P[i % P.length] : undefined);

  const playlist: Track[] = React.useMemo(
    () =>
      y.songs.map((s, i) => ({
        id: `s${i}`,
        title: s.title,
        sub: s.artist || y.from,
        photo: P.length ? P[i % P.length] : undefined,
        lyrics: y.reasons.length ? y.reasons : [`${y.to}, this one's yours.`],
        dur: durOf(s.title + i),
        from: "playlist" as const,
      })),
    [y, P],
  );
  const liked: Track[] = React.useMemo(
    () =>
      P.map((p, i) => ({
        id: `m${i}`,
        title: p.caption?.trim() || `memory no. ${i + 1}`,
        sub: `${y.from}, ${y.to}`,
        photo: p,
        lyrics: (p.note?.trim() || "No lyrics. Just the two of you.").split(/(?<=[.!?])\s+/),
        dur: durOf(p.url + i),
        from: "liked" as const,
      })),
    [P, y.from, y.to],
  );
  const queue = playlist.length ? playlist : liked;

  const [view, setView] = React.useState<View>("home");
  const [cur, setCur] = React.useState<Track | undefined>(queue[0]);
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0);
  const [full, setFull] = React.useState(false);
  const [likedIds, setLikedIds] = React.useState<Set<string>>(() => new Set());
  const [toast, setToast] = React.useState("");
  const mainRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // A track that disappears on edit falls back to the head of the queue.
  const track = cur && [...playlist, ...liked].find((t) => t.id === cur.id) ? [...playlist, ...liked].find((t) => t.id === cur.id) : queue[0];
  const list = track?.from === "liked" ? liked : playlist;

  const say = React.useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((t) => (t === m ? "" : t)), 2200);
  }, []);

  const play = React.useCallback((t: Track) => {
    setCur(t);
    setPos(0);
    setPlaying(true);
  }, []);
  const step = React.useCallback(
    (d: number) => {
      if (!track || !list.length) return;
      const i = list.findIndex((t) => t.id === track.id);
      const n = list[(i + d + list.length) % list.length];
      play(n);
    },
    [track, list, play],
  );

  // Simulated playback clock (the real clip, when there is one, rides on top).
  React.useEffect(() => {
    if (!playing || !track) return;
    const id = window.setInterval(() => {
      setPos((p) => {
        if (p + 0.5 >= track.dur) { window.setTimeout(() => step(1), 0); return 0; }
        return p + 0.5;
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [playing, track, step]);

  const hasAudio = !!data.audioUrl.trim();
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing && track?.id === "s0") void a.play().catch(() => {});
    else a.pause();
  }, [playing, track]);

  const go = setView;
  React.useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [view]);
  const toggleLike = (id: string) => {
    setLikedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); say("Removed from Liked Songs"); }
      else { n.add(id); say("Added to Liked Songs 💚"); }
      return n;
    });
  };

  const isLiked = (t?: Track) => !!t && (t.from === "liked" || likedIds.has(t.id));
  const pct = track ? Math.min(100, (pos / track.dur) * 100) : 0;

  // ── pieces ───────────────────────────────────────────────────────────────

  const mosaic = (size: string) =>
    P.length >= 4 ? (
      <span className="lvMosaic" style={{ width: size, height: size }}>
        {[0, 1, 2, 3].map((i) => <Pic key={i} photo={P[i]} style={{ width: "100%", height: "100%" }} />)}
      </span>
    ) : (
      <Pic photo={cover(0)} label={y.playlist} style={{ width: size, height: size }} />
    );

  const likedCover = (size: string) => (
    <span className="lvLikedCover" style={{ width: size, height: size }}><IHeart filled size={24} style={{ width: "42%", height: "42%" }} /></span>
  );

  const rewindCover = (size: string) => (
    <span className="lvRwCover" style={{ width: size, height: size }}>
      <b>Rewind</b><i>{y.year}</i>
    </span>
  );

  const quick = [
    { k: "liked", label: "Liked Songs", art: likedCover("100%"), on: () => go("liked") },
    { k: "pl", label: y.playlist, art: mosaic("100%"), on: () => go("playlist") },
    { k: "rw", label: `Your Rewind ${y.year}`, art: rewindCover("100%"), on: onOpenStory },
    { k: "rep", label: "On Repeat", art: <Pic photo={cover(2)} label="On Repeat" style={{ width: "100%", height: "100%" }} />, on: () => go("playlist") },
    ...(y.genres[0] ? [{ k: "g0", label: `${y.genres[0]} Mix`, art: <Pic photo={cover(1)} label={y.genres[0]} style={{ width: "100%", height: "100%" }} />, on: () => go("playlist") }] : []),
    ...(y.places[0] ? [{ k: "p0", label: y.places[0], art: <Pic photo={cover(3)} label={y.places[0]} style={{ width: "100%", height: "100%" }} />, on: () => go("liked") }] : []),
  ].slice(0, 6);

  const made = [
    { t: `Daily Mix 1`, s: y.genres[0] ? `${y.genres[0]}, ${y.genres[1] ?? "chai-core"} and more` : `${y.from}, ${y.to} and more`, p: cover(0), c: "#E13300" },
    { t: `Daily Mix 2`, s: y.genres[1] ? `${y.genres[1]} and more` : "soft songs, loud feelings", p: cover(1), c: "#1E3264" },
    { t: "On Repeat", s: "Songs you can't stop playing. Mostly one person.", p: cover(2), c: "#AF2896" },
    { t: `Rewind ${y.year}`, s: `${y.to}'s year in review`, p: cover(3), c: "#148A08", rw: true },
    { t: y.playlist, s: `by ${y.from} · ${playlist.length} songs`, p: cover(4), c: "#503750" },
  ];

  const trackRow = (t: Track, i: number, numbered?: boolean) => {
    const on = track?.id === t.id;
    return (
      <button key={t.id} type="button" className={`lvRow ${on ? "is-on" : ""}`} onClick={() => play(t)}>
        {numbered && <span className="lvRowN">{on && playing ? <span className="lvEq"><i /><i /><i /></span> : i + 1}</span>}
        <Pic photo={t.photo} label={t.title} className="lvRowArt" />
        <span className="lvRowTx">
          <b>{t.title}</b>
          <small>{t.from === "liked" && <span className="lvDl" aria-hidden>↓</span>}{t.from === "liked" ? t.lyrics.join(" ") : t.sub}</small>
        </span>
        <span className="lvRowDur">{mmss(t.dur)}</span>
        <span className="lvRowDots" aria-hidden><IDots size={18} /></span>
      </button>
    );
  };

  const playBig = (onClick: () => void, label: string) => (
    <button type="button" className="lvPlayBig" onClick={onClick} aria-label={label}>
      {playing && list === (label.includes("Liked") ? liked : playlist) ? <IPause size={24} /> : <IPlay size={24} />}
    </button>
  );

  // ── views ────────────────────────────────────────────────────────────────

  const Home = (
    <div className="lvHome">
      <div className="lvChips">
        {["All", "Music", "Rewind", "Podcasts"].map((c) => (
          <button key={c} type="button" className={`lvChip ${c === "All" ? "is-on" : ""}`} onClick={c === "Rewind" ? onOpenStory : undefined}>{c}</button>
        ))}
      </div>

      <button type="button" className="lvBanner" onClick={onOpenStory} aria-label={`Open your ${y.year} Rewind`}>
        <span className="lvBanShapes" aria-hidden>
          <i className="lvB1" /><i className="lvB2" /><i className="lvB3" />
          <svg className="lvB4" viewBox="0 0 100 100"><path d="M50 0l9 36 36-9-27 25 27 26-36-9-9 31-9-31-36 9 27-26L5 27l36 9z" fill="#000" /></svg>
        </span>
        <span className="lvBanTx">
          <small>REWIND {y.year}</small>
          <b>Your {y.year} Rewind is here.</b>
          <span>{y.to}, {y.from} ran the numbers on your year. {fmt(y.minutes)} minutes, one verdict.</span>
          <span className="lvBanCta">Let&apos;s go <IPlay size={14} /></span>
        </span>
        <span className="lvBanPics" aria-hidden>
          {[0, 1, 2].map((i) => <Pic key={i} photo={cover(i)} label={`b${i}`} className={`lvBanPic lvBanPic${i}`} />)}
        </span>
      </button>

      <div className="lvQuick">
        {quick.map((q) => (
          <button key={q.k} type="button" className="lvQ" onClick={q.on}>
            <span className="lvQArt">{q.art}</span>
            <b>{q.label}</b>
            {q.k === "rw" && <span className="lvDot" aria-label="new" />}
          </button>
        ))}
      </div>

      <section className="lvShelf">
        <h2><small>Made for</small>{y.to}</h2>
        <div className="lvRail">
          {made.map((m, i) => (
            <button key={i} type="button" className="lvCard" onClick={m.rw ? onOpenStory : () => { if (playlist[i % Math.max(1, playlist.length)]) play(playlist[i % playlist.length]); go("playlist"); }}>
              <span className="lvCardArt">
                <Pic photo={m.p} label={m.t} style={{ width: "100%", height: "100%" }} />
                <span className="lvMixBand" style={{ background: m.c }} />
                <span className="lvMixTag" style={{ color: m.c }}>{m.t}</span>
                <span className="lvCardPlay" aria-hidden><IPlay size={20} /></span>
              </span>
              <small>{m.s}</small>
            </button>
          ))}
        </div>
      </section>

      {y.places.length > 0 && (
        <section className="lvShelf">
          <h2>Your top places</h2>
          <div className="lvRail">
            {y.places.map((pl, i) => (
              <button key={i} type="button" className="lvCard" onClick={() => go("liked")}>
                <span className="lvCardArt">
                  <Pic photo={cover(i + 1)} label={pl} style={{ width: "100%", height: "100%" }} />
                  <span className="lvCardPlay" aria-hidden><IPlay size={20} /></span>
                </span>
                <b>{pl}</b>
                <small>Place · {fmt(Math.max(3, Math.round(y.stats.days / (i + 3))))} visits</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="lvShelf">
        <h2>Your favourite artists</h2>
        <div className="lvRail">
          {[{ n: data.senderName || y.from, p: cover(0), s: "Artist · 1 monthly listener: you" }, { n: data.recipientName || y.to, p: cover(1), s: `Artist · ${y.from}'s top artist` }].map((a, i) => (
            <button key={i} type="button" className="lvCard lvArtist" onClick={() => go(i ? "liked" : "playlist")}>
              <span className="lvCardArt"><Pic photo={a.p} label={a.n} style={{ width: "100%", height: "100%" }} /></span>
              <b>{a.n}</b>
              <small>{a.s}</small>
            </button>
          ))}
        </div>
      </section>
      <p className="lvFine">Lovify · Rewind {y.year} · made with love for {y.to}</p>
    </div>
  );

  const head = ({ art, kind, title, meta, grad, onPlay, label }: { art: React.ReactNode; kind: string; title: string; meta: React.ReactNode; grad: string; onPlay: () => void; label: string }) => (
    <>
      <div className="lvHead" style={{ background: `linear-gradient(180deg, ${grad} 0%, ${grad}99 60%, ${C.base} 100%)` }}>
        <button type="button" className="lvHeadBack" onClick={() => go("home")} aria-label="Back"><IDown size={22} style={{ transform: "rotate(90deg)" }} /></button>
        <span className="lvHeadArt">{art}</span>
        <span className="lvHeadTx">
          <small>{kind}</small>
          <h1 style={{ fontSize: title.length > 18 ? "clamp(26px, 6vw, 56px)" : undefined }}>{title}</h1>
          <span className="lvHeadMeta">{meta}</span>
        </span>
      </div>
      <div className="lvCtl">
        <IDownload size={26} />
        <IPlusCircle size={26} />
        <IDots size={24} />
        <span style={{ flex: 1 }} />
        <IShuffle size={24} />
        {playBig(onPlay, label)}
      </div>
    </>
  );

  const Liked = (
    <div>
      {head({ art: likedCover("100%"), kind: "Playlist", title: "Liked Songs", grad: "#5038A0", label: "Play Liked Songs", onPlay: () => (playing && track?.from === "liked" ? setPlaying(false) : liked[0] && play(liked[0])), meta: <><Pic photo={cover(0)} label={y.to} className="lvMiniAv" /> <b>{data.recipientName || y.to}</b> · {liked.length} memories</> })}
      <div className="lvRows">
        {liked.map((t, i) => trackRow(t, i))}
        {letterLocked && (
          <button type="button" className="lvRow lvLockedRow" onClick={() => { say("Finish your Rewind to unlock the bonus track 🔒"); onOpenStory(); }}>
            <span className="lvRowArt lvLockArt"><ILock size={18} /></span>
            <span className="lvRowTx"><b>Bonus track</b><small>hidden · finish your Rewind to unlock</small></span>
            <span className="lvRowDur">?:??</span>
          </button>
        )}
        {!liked.length && <p className="lvEmpty">Songs you like will appear here. (So will photos, apparently.)</p>}
      </div>
    </div>
  );

  const Playlist = (
    <div>
      {head({ art: mosaic("100%"), kind: "Public Playlist", title: y.playlist, grad: tint(y.playlist), label: "Play playlist", onPlay: () => (playing && track?.from === "playlist" ? setPlaying(false) : playlist[0] && play(playlist[0])), meta: <><HeartMark size={16} color={C.green} cut="#000" /> <b>{data.senderName || y.from}</b> · {playlist.length} songs, about {y.playlistMins} min</> })}
      <div className="lvRows">
        <div className="lvRowsHead"><span>#</span><span>Title</span><span><IClock size={16} /></span></div>
        {playlist.map((t, i) => trackRow(t, i, true))}
        {!playlist.length && <p className="lvEmpty">No songs yet. {y.from} is still choosing.</p>}
      </div>
    </div>
  );

  const tiles = [
    { t: `Rewind ${y.year}`, c: "#FF4FB4", p: cover(0), on: onOpenStory },
    { t: "Liked Songs", c: "#5038A0", p: cover(1), on: () => go("liked") },
    ...y.genres.map((g, i) => ({ t: g, c: ["#E13300", "#1E3264", "#8D67AB", "#148A08"][i % 4], p: cover(i + 2), on: () => go("playlist") })),
    ...y.places.map((pl, i) => ({ t: pl, c: ["#BA5D07", "#0D73EC", "#DC148C", "#27856A", "#503750"][i % 5], p: cover(i), on: () => go("liked") })),
    { t: "Made for you", c: "#477D95", p: cover(3), on: () => go("playlist") },
  ];
  const Search = (
    <div className="lvPad">
      <h1 className="lvH1">Search</h1>
      <label className="lvSearch"><ISearch size={22} /><input placeholder="What do you want to listen to?" aria-label="Search" /></label>
      <h2 className="lvH2">Browse all</h2>
      <div className="lvTiles">
        {tiles.map((t, i) => (
          <button key={i} type="button" className="lvTile" style={{ background: t.c }} onClick={t.on}>
            <b>{t.t}</b>
            <Pic photo={t.p} label={t.t} className="lvTileArt" />
          </button>
        ))}
      </div>
    </div>
  );

  const libItems = [
    { k: "liked", art: likedCover("100%"), t: "Liked Songs", s: <><span className="lvPin">📌</span> Playlist · {liked.length} memories</>, on: () => go("liked") },
    { k: "pl", art: mosaic("100%"), t: y.playlist, s: `Playlist · ${data.senderName || y.from}`, on: () => go("playlist") },
    { k: "rw", art: rewindCover("100%"), t: `Your Rewind ${y.year}`, s: "Story · new", on: onOpenStory },
    ...y.places.slice(0, 3).map((pl, i) => ({ k: `p${i}`, art: <Pic photo={cover(i + 1)} label={pl} style={{ width: "100%", height: "100%" }} />, t: `${pl}`, s: `Playlist · ${data.senderName || y.from}`, on: () => go("liked") })),
    { k: "ar", art: <Pic photo={cover(0)} label={y.from} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />, t: data.senderName || y.from, s: "Artist", on: () => go("playlist") },
  ];
  const libList = (compact?: boolean) => (
    <div className={`lvLib ${compact ? "is-compact" : ""}`}>
      {libItems.map((it) => (
        <button key={it.k} type="button" className="lvLibRow" onClick={it.on} title={it.t}>
          <span className={`lvLibArt ${it.k === "ar" ? "is-round" : ""}`}>{it.art}</span>
          {!compact && <span className="lvLibTx"><b>{it.t}</b><small>{it.s}</small></span>}
        </button>
      ))}
    </div>
  );
  const Library = (
    <div className="lvPad">
      <div className="lvLibHead"><Pic photo={cover(0)} label={y.to} className="lvMiniAv lvMiniAvL" /><h1 className="lvH1" style={{ margin: 0 }}>Your Library</h1><span style={{ flex: 1 }} /><IPlus size={26} /></div>
      <div className="lvChips" style={{ padding: "12px 0" }}>{["Playlists", "Artists", "Stories"].map((c) => <span key={c} className="lvChip">{c}</span>)}</div>
      {libList()}
    </div>
  );

  const body = view === "home" ? Home : view === "search" ? Search : view === "library" ? Library : view === "liked" ? Liked : Playlist;

  // ── players ──────────────────────────────────────────────────────────────

  const scrub = () => (
    <div className="lvScrub">
      <span>{mmss(pos)}</span>
      <span className="lvScrubBar" onClick={(e) => { if (!track) return; const r = e.currentTarget.getBoundingClientRect(); setPos(((e.clientX - r.left) / r.width) * track.dur); }}>
        <i style={{ width: `${pct}%` }} /><em style={{ left: `${pct}%` }} />
      </span>
      <span>{track ? mmss(track.dur) : "0:00"}</span>
    </div>
  );
  const controls = (big?: boolean) => (
    <div className={`lvCtrls ${big ? "is-big" : ""}`}>
      <button type="button" className="lvC is-on" aria-label="Shuffle"><IShuffle size={big ? 26 : 18} /></button>
      <button type="button" className="lvC" onClick={() => step(-1)} aria-label="Previous"><IPrev size={big ? 30 : 18} /></button>
      <button type="button" className="lvCPlay" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>{playing ? <IPause size={big ? 30 : 18} /> : <IPlay size={big ? 30 : 18} />}</button>
      <button type="button" className="lvC" onClick={() => step(1)} aria-label="Next"><INext size={big ? 30 : 18} /></button>
      <button type="button" className="lvC" aria-label="Repeat"><IRepeat size={big ? 26 : 18} /></button>
    </div>
  );

  const tcol = track ? tint(track.title) : "#333";

  return (
    <div className="lvApp">
      {hasAudio && <audio ref={audioRef} src={data.audioUrl} loop playsInline preload="none" style={{ display: "none" }} />}

      {/* desktop / tablet top bar */}
      <header className="lvTop">
        <Logo size={30} />
        <span style={{ flex: 1 }} />
        <button type="button" className="lvHomeBtn" onClick={() => go("home")} aria-label="Home"><IHome active={view === "home"} size={24} /></button>
        <label className="lvTopSearch"><ISearch size={20} /><input placeholder="What do you want to play?" aria-label="Search" onFocus={() => go("search")} /></label>
        <span style={{ flex: 1 }} />
        <button type="button" className="lvTopPill" onClick={onOpenStory}>Rewind {y.year} <span className="lvDot" /></button>
        <IBell size={20} />
        <Pic photo={cover(0)} label={y.to} className="lvMiniAv lvMiniAvL" />
      </header>

      {/* library sidebar */}
      <aside className="lvSide">
        <div className="lvSideHead"><ILibrary active size={24} /> <b>Your Library</b><span style={{ flex: 1 }} /><IPlus size={20} /></div>
        <div className="lvSideChips">{["Playlists", "Artists"].map((c) => <span key={c} className="lvChip">{c}</span>)}</div>
        {libList()}
        {libList(true)}
      </aside>

      <main className="lvMain" ref={mainRef}>
        {view === "home" && (
          <div className="lvPhoneHead">
            <Pic photo={cover(0)} label={y.to} className="lvMiniAv lvMiniAvL" />
            <b>{greeting()}</b>
            <span style={{ flex: 1 }} />
            <IBell size={22} />
          </div>
        )}
        <div key={view} className="lvView">{body}</div>
      </main>

      {/* now playing panel (desktop) */}
      <aside className="lvRight">
        {track && (
          <>
            <div className="lvRightHead"><b>{track.from === "liked" ? "Liked Songs" : y.playlist}</b><IDots size={18} /></div>
            <Pic photo={track.photo} label={track.title} className="lvRightArt" />
            <div className="lvRightTitle">
              <span><b>{track.title}</b><small>{track.sub}</small></span>
              <button type="button" className="lvC" onClick={() => toggleLike(track.id)} aria-label="Like">{isLiked(track) ? <ICheckCircle size={22} style={{ color: C.green }} /> : <IPlusCircle size={22} />}</button>
            </div>
            <div className="lvLyricCard" style={{ background: tcol }}>
              <small>Lyrics</small>
              {track.lyrics.slice(0, 5).map((l, i) => <p key={i}>{l}</p>)}
            </div>
            <div className="lvAbout">
              <Pic photo={cover(1)} label={y.from} className="lvAboutArt" />
              <div><small>About the artist</small><b>{data.senderName || y.from}</b><span>1 monthly listener. It&apos;s you. It has always been you.</span></div>
            </div>
            <div className="lvNext">
              <b>Next in queue</b>
              {list.filter((t) => t.id !== track.id).slice(0, 3).map((t) => (
                <button key={t.id} type="button" className="lvNextRow" onClick={() => play(t)}>
                  <Pic photo={t.photo} label={t.title} className="lvRowArt" />
                  <span className="lvRowTx"><b>{t.title}</b><small>{t.sub}</small></span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* player: floating bar on phones, full-width bar on wide screens */}
      {track && (
        <div className="lvPlayer" style={{ "--tc": tcol } as React.CSSProperties}>
          <button type="button" className="lvPlNow" onClick={() => setFull(true)}>
            <Pic photo={track.photo} label={track.title} className="lvPlArt" />
            <span className="lvPlTx"><b>{track.title}</b><small>{track.sub}</small></span>
          </button>
          <button type="button" className="lvC lvPlLike" onClick={() => toggleLike(track.id)} aria-label="Like">{isLiked(track) ? <ICheckCircle size={20} style={{ color: C.green }} /> : <IPlusCircle size={20} />}</button>
          <span className="lvPlDev lvPhoneOnly"><IDevices size={22} /></span>
          <button type="button" className="lvC lvPlToggle lvPhoneOnly" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>{playing ? <IPause size={24} /> : <IPlay size={24} />}</button>
          <div className="lvPlMid">{controls()}{scrub()}</div>
          <div className="lvPlRight">
            <ILyrics size={18} /><IQueue size={18} /><IDevices size={18} /><IVolume size={18} />
            <span className="lvVol"><i /></span>
          </div>
          <span className="lvPlProg" aria-hidden><i style={{ width: `${pct}%` }} /></span>
        </div>
      )}

      {/* phone tab bar */}
      <nav className="lvTabs" aria-label="Main">
        <button type="button" className={view === "home" ? "is-on" : ""} onClick={() => go("home")}><IHome active={view === "home"} size={24} /><small>Home</small></button>
        <button type="button" className={view === "search" ? "is-on" : ""} onClick={() => go("search")}><ISearch active={view === "search"} size={24} /><small>Search</small></button>
        <button type="button" className={view === "library" || view === "liked" || view === "playlist" ? "is-on" : ""} onClick={() => go("library")}><ILibrary active={view === "library"} size={24} /><small>Your Library</small></button>
        <button type="button" onClick={onOpenStory}><span className="lvTabRw"><HeartMark size={20} color="#000" cut={C.lime} /></span><small>Rewind</small></button>
      </nav>

      {/* full-screen now playing (phone + tablet) */}
      {full && track && (
        <div className="lvFull" style={{ background: `linear-gradient(180deg, ${tcol} 0%, #121212 85%)` }} role="dialog" aria-modal="true" aria-label="Now playing">
          <div className="lvFullIn">
            <div className="lvFullHead">
              <button type="button" className="lvC" onClick={() => setFull(false)} aria-label="Close"><IDown size={26} /></button>
              <span><small>PLAYING FROM {track.from === "liked" ? "YOUR LIBRARY" : "PLAYLIST"}</small><b>{track.from === "liked" ? "Liked Songs" : y.playlist}</b></span>
              <IDots size={22} />
            </div>
            <div className="lvFullArt"><Pic photo={track.photo} label={track.title} style={{ width: "100%", height: "100%" }} /></div>
            <div className="lvFullTitle">
              <span><b>{track.title}</b><small>{track.sub}</small></span>
              <button type="button" className="lvC" onClick={() => toggleLike(track.id)} aria-label="Like">{isLiked(track) ? <ICheckCircle size={28} style={{ color: C.green }} /> : <IPlusCircle size={28} />}</button>
            </div>
            {scrub()}
            {controls(true)}
            <div className="lvFullRow"><IDevices size={20} /><span style={{ flex: 1 }} /><IShareSmall /><IQueue size={20} /></div>
            <div className="lvLyricCard" style={{ background: tcol }}>
              <small>Lyrics</small>
              {track.lyrics.map((l, i) => <p key={i} className={i === Math.floor((pos / track.dur) * track.lyrics.length) ? "is-now" : ""}>{l}</p>)}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="lvToast" role="status">{toast}</div>}
      <style>{SHELL_CSS}</style>
    </div>
  );
}

const IShareSmall = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const SHELL_CSS = `
.lvApp { position: relative; height: 100vh; height: 100dvh; display: grid; grid-template-columns: 1fr; grid-template-rows: 1fr; background: #000; color: #fff; font-family: ${FONT}; overflow: hidden; -webkit-font-smoothing: antialiased; }
.lvApp *, .lvApp *::before, .lvApp *::after { box-sizing: border-box; }
:where(.lvApp) :where(button) { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.lvTop, .lvSide, .lvRight, .lvPlMid, .lvPlRight { display: none; }
.lvMain { grid-area: 1 / 1; overflow-y: auto; overflow-x: hidden; background: ${C.base}; padding-bottom: calc(150px + env(safe-area-inset-bottom, 0px)); overscroll-behavior: contain; }
.lvView { animation: lvIn .35s ease both; }
.lvPhoneHead { display: flex; align-items: center; gap: 10px; padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 4px; font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
.lvMiniAv { width: 24px; height: 24px; border-radius: 50%; display: inline-block; vertical-align: middle; flex: none; }
.lvMiniAvL { width: 34px; height: 34px; }
.lvHome { padding: 0 0 12px; }
.lvChips { display: flex; gap: 8px; padding: 10px 16px 14px; overflow-x: auto; scrollbar-width: none; }
.lvChip { flex: none; padding: 7px 14px; border-radius: 99px; background: ${C.highlight}; font-size: 13.5px; font-weight: 600; transition: background .15s; }
.lvChip:hover { background: #3a3a3a; }
.lvChip.is-on { background: ${C.green}; color: #000; }

.lvBanner { position: relative; display: flex !important; align-items: stretch; width: calc(100% - 32px); margin: 0 16px 18px; min-height: 196px; border-radius: 10px; overflow: hidden; text-align: left;
  background: linear-gradient(120deg, #FF4FB4 0%, #FF6437 45%, #CDF564 100%); color: #000 !important; box-shadow: 0 16px 40px -18px rgba(255,79,180,.7); transition: transform .2s ease; }
.lvBanner:hover { transform: translateY(-2px); }
.lvBanner:active { transform: scale(.985); }
.lvBanShapes { position: absolute; inset: 0; pointer-events: none; }
.lvBanShapes i { position: absolute; border-radius: 50%; }
.lvB1 { width: 160px; height: 160px; right: -40px; top: -50px; background: #000; animation: lvFloat 7s ease-in-out infinite; }
.lvB2 { width: 70px; height: 70px; left: 55%; bottom: -30px; border: 14px solid #7358FF; animation: lvFloat 5s ease-in-out infinite reverse; }
.lvB3 { width: 26px; height: 26px; left: 44%; top: 16px; background: #fff; animation: lvFloat 4s ease-in-out infinite; }
.lvB4 { position: absolute; width: 38px; height: 38px; right: 34%; top: 20px; animation: lvSpin 12s linear infinite; }
.lvBanTx { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 6px; padding: 18px 16px; max-width: 64%; }
.lvBanTx small { font-size: 11px; font-weight: 900; letter-spacing: .16em; }
.lvBanTx b { font-size: 25px; line-height: 1; font-weight: 900; letter-spacing: -.045em; }
.lvBanTx > span:not(.lvBanCta) { font-size: 12.5px; font-weight: 600; line-height: 1.35; opacity: .85; }
.lvBanCta { margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 99px; background: #000; color: #fff; font-size: 14px; font-weight: 800; animation: lvPulse 2.2s ease-in-out infinite; }
.lvBanPics { position: absolute; right: 0; top: 0; bottom: 0; width: 42%; z-index: 1; }
.lvBanPic { position: absolute !important; width: 74px; height: 74px; border-radius: 4px; box-shadow: 0 10px 24px -8px rgba(0,0,0,.6); border: 3px solid #fff; }
.lvBanPic0 { right: 18px; top: 26px; transform: rotate(8deg); animation: lvFloat 6s ease-in-out infinite; }
.lvBanPic1 { right: 64px; top: 84px; transform: rotate(-9deg); animation: lvFloat 7s ease-in-out infinite reverse; }
.lvBanPic2 { right: 10px; bottom: 16px; width: 60px; height: 60px; transform: rotate(4deg); }

.lvQuick { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 16px; margin-bottom: 26px; }
.lvQ { position: relative; display: flex !important; align-items: center; gap: 8px; height: 56px; border-radius: 5px; overflow: hidden; background: rgba(255,255,255,.08) !important; text-align: left; transition: background .15s; }
.lvQ:hover { background: rgba(255,255,255,.16) !important; }
.lvQArt { width: 56px; height: 56px; flex: none; display: block; box-shadow: 0 6px 12px rgba(0,0,0,.4); }
.lvQ b { font-size: 12.5px; font-weight: 700; line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; padding-right: 14px; }
.lvDot { position: absolute; right: 8px; top: 50%; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: ${C.green}; box-shadow: 0 0 0 0 ${C.green}; animation: lvPing 1.8s infinite; }
.lvLikedCover { display: grid !important; place-items: center; background: linear-gradient(135deg, #450AF5, #8E8EE5 60%, #C4EFD9); color: #fff; }
.lvRwCover { container-type: inline-size; display: flex !important; flex-direction: column; justify-content: flex-end; padding: 10%; background: ${C.lime}; color: #000; overflow: hidden; position: relative; }
.lvRwCover::before { content: ""; position: absolute; right: -25%; top: -25%; width: 70%; height: 70%; border-radius: 50%; background: #FF4FB4; }
.lvRwCover b { position: relative; font-size: 25cqw; font-weight: 900; letter-spacing: -.05em; line-height: .9; }
.lvRwCover i { position: relative; font-style: normal; font-weight: 900; font-size: 17cqw; }
.lvMosaic { display: grid !important; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; overflow: hidden; }

.lvShelf { margin: 0 0 26px; }
.lvShelf h2 { margin: 0 16px 12px; font-size: 22px; font-weight: 800; letter-spacing: -.03em; line-height: 1.1; }
.lvShelf h2 small { display: block; font-size: 13px; font-weight: 500; color: ${C.sub}; letter-spacing: 0; }
.lvRail { display: flex; gap: 14px; overflow-x: auto; padding: 0 16px 4px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.lvRail::-webkit-scrollbar, .lvChips::-webkit-scrollbar { display: none; }
.lvCard { flex: none; width: 150px; display: flex !important; flex-direction: column; gap: 6px; text-align: left; scroll-snap-align: start; border-radius: 8px; transition: background .2s; }
.lvCardArt { position: relative; width: 150px; height: 150px; border-radius: 4px; overflow: hidden; display: block; box-shadow: 0 8px 24px rgba(0,0,0,.5); }
.lvArtist .lvCardArt { border-radius: 50%; }
.lvCard b { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvCard small { font-size: 12.5px; color: ${C.sub}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.lvMixBand { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; }
.lvMixTag { position: absolute; left: 8px; bottom: 12px; padding: 3px 7px; border-radius: 3px; background: #fff; font-size: 12px; font-weight: 900; letter-spacing: -.02em; max-width: calc(100% - 16px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvCardPlay { position: absolute; right: 8px; bottom: 8px; width: 46px; height: 46px; border-radius: 50%; background: ${C.green}; color: #000; display: grid; place-items: center; box-shadow: 0 8px 16px rgba(0,0,0,.4); opacity: 0; transform: translateY(8px); transition: all .25s ease; }
.lvCard:hover .lvCardPlay { opacity: 1; transform: none; }
.lvFine { margin: 8px 16px 0; font-size: 11px; color: #6a6a6a; }

.lvHead { position: relative; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: calc(52px + env(safe-area-inset-top, 0px)) 16px 14px; }
.lvHeadBack { position: absolute; left: 10px; top: calc(10px + env(safe-area-inset-top, 0px)); width: 40px; height: 40px; border-radius: 50%; display: grid !important; place-items: center; background: rgba(0,0,0,.3) !important; }
.lvHeadArt { width: min(62vw, 240px); aspect-ratio: 1; display: block; box-shadow: 0 16px 40px rgba(0,0,0,.55); }
.lvHeadArt > * { width: 100% !important; height: 100% !important; }
.lvHeadTx { align-self: stretch; display: grid; gap: 4px; }
.lvHeadTx small { display: none; font-size: 13px; font-weight: 600; }
.lvHeadTx h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -.04em; line-height: 1.05; overflow-wrap: anywhere; }
.lvHeadMeta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; color: ${C.sub}; }
.lvHeadMeta b { color: #fff; }
.lvCtl { display: flex; align-items: center; gap: 20px; padding: 6px 16px 14px; color: ${C.sub}; }
.lvPlayBig { width: 54px; height: 54px; border-radius: 50%; background: ${C.green} !important; color: #000 !important; display: grid !important; place-items: center; transition: transform .15s; box-shadow: 0 8px 18px -6px rgba(30,215,96,.6); }
.lvPlayBig:hover { transform: scale(1.05); }
.lvRows { display: grid; padding: 0 6px; }
.lvRowsHead { display: none; }
.lvRow { display: grid !important; grid-template-columns: 48px 1fr auto; align-items: center; gap: 12px; padding: 6px 10px; border-radius: 6px; text-align: left; transition: background .12s; }
.lvRow:hover { background: rgba(255,255,255,.08) !important; }
.lvRow.is-on .lvRowTx b { color: ${C.green}; }
.lvRowN { display: none; width: 16px; text-align: right; color: ${C.sub}; font-size: 15px; }
.lvRowArt { width: 48px; height: 48px; border-radius: 3px; flex: none; }
.lvRowTx { display: grid; min-width: 0; gap: 2px; }
.lvRowTx b { font-size: 15.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvRowTx small { font-size: 13px; color: ${C.sub}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvDl { display: inline-grid; place-items: center; width: 13px; height: 13px; border-radius: 50%; background: ${C.green}; color: #000; font-size: 9px; font-weight: 900; margin-right: 5px; vertical-align: 1px; }
.lvRowDur { display: none; font-size: 13.5px; color: ${C.sub}; font-variant-numeric: tabular-nums; }
.lvRowDots { color: ${C.sub}; }
.lvLockedRow { opacity: .8; }
.lvLockArt { display: grid !important; place-items: center; background: repeating-linear-gradient(45deg, #282828 0 6px, #1f1f1f 6px 12px); color: ${C.green}; }
.lvEq { display: inline-flex; gap: 2px; align-items: flex-end; height: 14px; }
.lvEq i { width: 3px; background: ${C.green}; animation: lvEq .9s ease-in-out infinite; }
.lvEq i:nth-child(2) { animation-delay: -.3s; } .lvEq i:nth-child(3) { animation-delay: -.6s; }
.lvEmpty { padding: 20px 10px; color: ${C.sub}; font-size: 14px; }

.lvPad { padding: calc(16px + env(safe-area-inset-top, 0px)) 16px 12px; }
.lvH1 { margin: 0 0 14px; font-size: 26px; font-weight: 900; letter-spacing: -.04em; }
.lvH2 { margin: 22px 0 12px; font-size: 17px; font-weight: 800; }
.lvSearch, .lvTopSearch { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 14px; border-radius: 6px; background: #fff; color: #121212; }
.lvSearch input, .lvTopSearch input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: 600 16px ${FONT}; color: inherit; }
.lvTiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.lvTile { position: relative; height: 100px; border-radius: 8px; overflow: hidden; text-align: left; padding: 12px !important; display: block !important; transition: transform .15s; }
.lvTile:active { transform: scale(.97); }
.lvTile b { position: relative; z-index: 1; font-size: 16px; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; display: block; max-width: 76%; }
.lvTileArt { position: absolute !important; right: -14px; bottom: -6px; width: 64px; height: 64px; transform: rotate(25deg); box-shadow: 0 4px 12px rgba(0,0,0,.45); }

.lvLibHead { display: flex; align-items: center; gap: 12px; }
.lvLib { display: grid; gap: 2px; }
.lvLibRow { display: flex !important; align-items: center; gap: 12px; padding: 6px; border-radius: 6px; text-align: left; transition: background .12s; }
.lvLibRow:hover { background: rgba(255,255,255,.07) !important; }
.lvLibArt { width: 64px; height: 64px; flex: none; display: block; border-radius: 4px; overflow: hidden; }
.lvLibArt.is-round { border-radius: 50%; }
.lvLibTx { display: grid; min-width: 0; gap: 3px; }
.lvLibTx b { font-size: 15.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvLibTx small { font-size: 13px; color: ${C.sub}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvPin { color: ${C.green}; font-size: 11px; }

/* phone player */
.lvPlayer { position: fixed; z-index: 60; left: 8px; right: 8px; bottom: calc(64px + env(safe-area-inset-bottom, 0px)); height: 56px; border-radius: 8px; display: flex; align-items: center; gap: 4px; padding: 0 8px;
  background: color-mix(in srgb, var(--tc) 55%, #121212); box-shadow: 0 10px 30px -10px rgba(0,0,0,.8); transition: background .5s ease; }
.lvPlNow { flex: 1; min-width: 0; display: flex !important; align-items: center; gap: 10px; text-align: left; }
.lvPlArt { width: 40px; height: 40px; border-radius: 4px; flex: none; }
.lvPlTx { display: grid; min-width: 0; }
.lvPlTx b { font-size: 13.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvPlTx small { font-size: 12.5px; color: rgba(255,255,255,.72); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvC { width: 40px; height: 40px; display: grid !important; place-items: center; border-radius: 50%; color: ${C.sub} !important; transition: color .15s, transform .15s; flex: none; }
.lvC:hover { color: #fff !important; }
.lvC.is-on { color: ${C.green} !important; }
.lvPlayer .lvC, .lvPlDev { color: #fff !important; }
.lvPlDev { display: grid; place-items: center; width: 34px; }
.lvPlProg { position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px; border-radius: 2px; background: rgba(255,255,255,.25); overflow: hidden; }
.lvPlProg i { display: block; height: 100%; background: #fff; transition: width .5s linear; }
.lvTabs { position: fixed; z-index: 59; left: 0; right: 0; bottom: 0; display: flex; padding: 22px 0 calc(6px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(180deg, transparent, rgba(0,0,0,.86) 38%, #000); }
.lvTabs button { flex: 1; display: grid !important; justify-items: center; gap: 4px; color: ${C.sub} !important; }
.lvTabs button.is-on { color: #fff !important; }
.lvTabs small { font-size: 10.5px; font-weight: 600; }
.lvTabRw { width: 26px; height: 26px; border-radius: 6px; background: ${C.lime}; display: grid; place-items: center; animation: lvPulse 2.2s ease-in-out infinite; }

/* full-screen now playing */
.lvFull { position: fixed; inset: 0; z-index: 115; overflow-y: auto; animation: lvUp .35s cubic-bezier(.2,1,.3,1) both; }
.lvFullIn { max-width: 560px; margin: 0 auto; padding: calc(10px + env(safe-area-inset-top, 0px)) 22px 40px; display: grid; gap: 18px; }
.lvFullHead { display: flex; align-items: center; gap: 8px; }
.lvFullHead > span { flex: 1; display: grid; text-align: center; }
.lvFullHead small { font-size: 10.5px; letter-spacing: .12em; font-weight: 700; opacity: .8; }
.lvFullHead b { font-size: 13.5px; }
.lvFullHead .lvC { color: #fff !important; }
.lvFullArt { width: 100%; aspect-ratio: 1; margin-top: 18px; box-shadow: 0 24px 60px -20px rgba(0,0,0,.8); border-radius: 6px; overflow: hidden; }
.lvFullTitle { display: flex; align-items: center; gap: 10px; margin-top: 16px; }
.lvFullTitle span { flex: 1; display: grid; min-width: 0; }
.lvFullTitle b { font-size: 23px; font-weight: 800; letter-spacing: -.02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lvFullTitle small { font-size: 15px; color: rgba(255,255,255,.72); }
.lvFullTitle .lvC { color: #fff !important; }
.lvFullRow { display: flex; align-items: center; gap: 22px; color: rgba(255,255,255,.8); }
.lvScrub { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; font-size: 11.5px; color: rgba(255,255,255,.72); font-variant-numeric: tabular-nums; }
.lvFull .lvScrub { grid-template-columns: 1fr 1fr; }
.lvFull .lvScrub .lvScrubBar { grid-column: 1 / -1; grid-row: 1; }
.lvFull .lvScrub span:last-child { text-align: right; }
.lvScrubBar { position: relative; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); cursor: pointer; }
.lvScrubBar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: #fff; transition: width .5s linear; }
.lvScrubBar em { position: absolute; top: 50%; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: #fff; transition: left .5s linear; opacity: 0; }
.lvScrubBar:hover i { background: ${C.green}; } .lvScrubBar:hover em, .lvFull .lvScrubBar em { opacity: 1; }
.lvCtrls { display: flex; align-items: center; justify-content: center; gap: 14px; }
.lvCtrls.is-big { justify-content: space-between; }
.lvCtrls.is-big .lvC { color: #fff !important; width: 48px; height: 48px; }
.lvCtrls.is-big .lvC.is-on { color: ${C.green} !important; }
.lvCPlay { width: 34px; height: 34px; border-radius: 50%; background: #fff !important; color: #000 !important; display: grid !important; place-items: center; transition: transform .15s; }
.lvCPlay:hover { transform: scale(1.06); }
.lvCtrls.is-big .lvCPlay { width: 68px; height: 68px; }
.lvLyricCard { border-radius: 10px; padding: 16px 16px 22px; display: grid; gap: 8px; box-shadow: inset 0 0 0 999px rgba(0,0,0,.18); }
.lvLyricCard small { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.lvLyricCard p { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -.02em; line-height: 1.3; color: rgba(0,0,0,.72); transition: color .3s; }
.lvLyricCard p.is-now, .lvRight .lvLyricCard p { color: #fff; }
.lvToast { position: fixed; z-index: 140; left: 50%; bottom: calc(136px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); padding: 10px 16px; border-radius: 8px; background: #fff; color: #000; font-size: 14px; font-weight: 700; white-space: nowrap; max-width: calc(100vw - 32px); overflow: hidden; text-overflow: ellipsis; box-shadow: 0 10px 30px rgba(0,0,0,.5); animation: lvToast .3s cubic-bezier(.2,1.3,.4,1) both; }

/* ── tablet & desktop: the web player ─────────────────────────────── */
@media (min-width: 768px) {
  .lvApp { grid-template-columns: 84px 1fr; grid-template-rows: 64px 1fr 80px; gap: 8px; padding: 0 8px; }
  .lvTop { display: flex; grid-column: 1 / -1; grid-row: 1; align-items: center; gap: 12px; padding: 0 8px; }
  .lvHomeBtn { width: 48px; height: 48px; border-radius: 50%; background: ${C.highlight} !important; display: grid !important; place-items: center; }
  .lvTopSearch { width: min(460px, 40vw); height: 48px; border-radius: 99px; background: ${C.highlight}; color: #fff; }
  .lvTopSearch input::placeholder { color: ${C.sub}; }
  .lvTopPill { display: inline-flex !important; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 99px; background: #fff !important; color: #000 !important; font-weight: 800 !important; font-size: 14px !important; position: relative; }
  .lvTopPill .lvDot { position: static; margin: 0; }
  .lvSide { display: flex; flex-direction: column; grid-column: 1; grid-row: 2; background: ${C.base}; border-radius: 8px; overflow-y: auto; padding: 10px 8px; gap: 8px; }
  .lvSideHead, .lvSideChips, .lvSide .lvLib:not(.is-compact) { display: none; }
  .lvLib.is-compact .lvLibRow { justify-content: center; }
  .lvLib.is-compact .lvLibArt { width: 52px; height: 52px; }
  .lvMain { grid-column: 2; grid-row: 2; border-radius: 8px; padding-bottom: 32px; }
  .lvPhoneHead, .lvTabs, .lvPhoneOnly { display: none !important; }
  .lvPlayer { position: static; grid-column: 1 / -1; grid-row: 3; height: 80px; border-radius: 0; background: #000; box-shadow: none; padding: 0 8px; gap: 12px; }
  .lvPlNow { flex: 0 1 30%; }
  .lvPlArt { width: 56px; height: 56px; }
  .lvPlLike { margin-left: -6px; }
  .lvPlMid { display: grid; flex: 1 1 40%; max-width: 720px; gap: 6px; }
  .lvPlRight { display: flex; flex: 0 1 30%; justify-content: flex-end; align-items: center; gap: 14px; color: ${C.sub}; }
  .lvVol { width: 92px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); overflow: hidden; }
  .lvVol i { display: block; width: 70%; height: 100%; background: #fff; }
  .lvPlProg { display: none; }
  .lvBanner { width: calc(100% - 48px); margin: 0 24px 26px; min-height: 250px; }
  .lvBanTx { padding: 28px 28px; max-width: 58%; gap: 10px; }
  .lvBanTx b { font-size: clamp(30px, 4vw, 52px); }
  .lvBanTx > span:not(.lvBanCta) { font-size: 15px; }
  .lvBanPic { width: 118px; height: 118px; }
  .lvBanPic0 { right: 40px; top: 30px; } .lvBanPic1 { right: 150px; top: 100px; } .lvBanPic2 { right: 28px; bottom: 20px; width: 92px; height: 92px; }
  .lvChips { padding: 16px 24px; }
  .lvQuick { grid-template-columns: repeat(3, 1fr); padding: 0 24px; }
  .lvQ { height: 64px; } .lvQArt { width: 64px; height: 64px; } .lvQ b { font-size: 14px; }
  .lvShelf h2 { margin: 0 24px 14px; font-size: 24px; }
  .lvRail { padding: 0 24px 4px; gap: 10px; }
  .lvCard { width: 180px; padding: 10px; } .lvCard:hover { background: ${C.elevated}; }
  .lvCardArt { width: 160px; height: 160px; }
  .lvFine { margin: 8px 24px 0; }
  .lvHead { flex-direction: row; align-items: flex-end; gap: 24px; padding: 64px 24px 24px; min-height: 300px; }
  .lvHeadBack { display: none !important; }
  .lvHeadArt { width: 210px; flex: none; }
  .lvHeadTx small { display: block; }
  .lvHeadTx h1 { font-size: clamp(40px, 6vw, 88px); line-height: .95; letter-spacing: -.05em; margin: 4px 0 10px; }
  .lvCtl { padding: 16px 24px 20px; gap: 26px; }
  .lvPlayBig { order: -1; width: 56px; height: 56px; }
  .lvRows { padding: 0 16px; }
  .lvRowsHead { display: grid; grid-template-columns: 24px 1fr 60px; gap: 16px; padding: 0 16px 8px; margin-bottom: 8px; border-bottom: 1px solid ${C.line}; color: ${C.sub}; font-size: 13px; }
  .lvRowsHead span:last-child { display: flex; justify-content: flex-end; }
  .lvRow { grid-template-columns: 40px 1fr 60px 24px; padding: 8px 16px; }
  .lvRow:has(.lvRowN) { grid-template-columns: 24px 40px 1fr 60px 24px; gap: 16px; }
  .lvRowN { display: block; }
  .lvRowArt { width: 40px; height: 40px; }
  .lvRowDur { display: block; text-align: right; }
  .lvRowDots { opacity: 0; } .lvRow:hover .lvRowDots { opacity: 1; }
  .lvPad { padding: 24px; }
  .lvTiles { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
  .lvTile { height: auto; aspect-ratio: 1.1; } .lvTile b { font-size: 22px; } .lvTileArt { width: 96px; height: 96px; right: -18px; bottom: -8px; }
  .lvFull .lvFullIn { padding-top: 30px; }
  .lvToast { bottom: 100px; }
}
@media (min-width: 1200px) {
  .lvApp { grid-template-columns: 300px 1fr 330px; }
  .lvSide { padding: 14px 8px; }
  .lvSideHead { display: flex; align-items: center; gap: 12px; padding: 4px 10px; color: ${C.sub}; }
  .lvSideHead b { color: #fff; font-size: 16px; }
  .lvSideChips { display: flex; gap: 8px; padding: 4px 8px 6px; }
  .lvSide .lvLib:not(.is-compact) { display: grid; }
  .lvSide .lvLib.is-compact { display: none; }
  .lvSide .lvLibArt { width: 48px; height: 48px; }
  .lvRight > * { flex: none; }
  .lvRight { display: flex; flex-direction: column; gap: 16px; grid-column: 3; grid-row: 2; background: ${C.base}; border-radius: 8px; padding: 16px; overflow-y: auto; }
  .lvRightHead { display: flex; align-items: center; justify-content: space-between; font-size: 16px; }
  .lvRightArt { width: 100%; aspect-ratio: 1; border-radius: 8px; }
  .lvRightTitle { display: flex; align-items: center; gap: 8px; }
  .lvRightTitle span { flex: 1; display: grid; min-width: 0; }
  .lvRightTitle b { font-size: 24px; font-weight: 800; letter-spacing: -.02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lvRightTitle small { color: ${C.sub}; font-size: 15px; }
  .lvRight .lvLyricCard p { font-size: 17px; }
  .lvAbout { border-radius: 8px; background: ${C.elevated}; overflow: hidden; }
  .lvAboutArt { width: 100%; height: 160px; }
  .lvAbout div { display: grid; gap: 4px; padding: 14px 16px 18px; }
  .lvAbout small { font-size: 14px; font-weight: 700; }
  .lvAbout b { font-size: 17px; }
  .lvAbout span { font-size: 13.5px; color: ${C.sub}; line-height: 1.4; }
  .lvNext { display: grid; gap: 6px; padding: 14px; border-radius: 8px; background: ${C.elevated}; }
  .lvNextRow { display: flex !important; align-items: center; gap: 10px; text-align: left; padding: 4px; border-radius: 6px; }
  .lvNextRow:hover { background: rgba(255,255,255,.07) !important; }
  .lvQuick { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1500px) { .lvQuick { grid-template-columns: repeat(4, 1fr); } }
@keyframes lvIn { from { opacity: 0; transform: translateY(8px); } }
@keyframes lvUp { from { transform: translateY(100%); } }
@keyframes lvFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -8px; } }
@keyframes lvSpin { to { transform: rotate(360deg); } }
@keyframes lvPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes lvPing { 0% { box-shadow: 0 0 0 0 rgba(30,215,96,.7); } 100% { box-shadow: 0 0 0 10px rgba(30,215,96,0); } }
@keyframes lvEq { 0%,100% { height: 4px; } 50% { height: 14px; } }
@keyframes lvToast { from { opacity: 0; transform: translate(-50%, 12px) scale(.9); } }
@media (prefers-reduced-motion: reduce) { .lvApp *, .lvFull { animation: none !important; transition: none !important; } }
`;
