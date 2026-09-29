"use client";

// The catalogue. Three shells over one set of rails:
//   web (tablet + desktop) — fixed top nav that turns solid on scroll, the
//     billboard with its trailer behaviour, 16:9 rails that overlap the
//     billboard, hover previews, a footer;
//   phone — the app: "For <name>" header with chips, a poster-card hero over a
//     colour bleed, portrait rails, and a bottom tab bar with New & Hot and a
//     "My LoveFlix" page.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, BrandPill, CornerL, SeriesTag, Still, Top10Chip, Wordmark } from "./Brand";
import { titleKey, useLf, type Title } from "./context";
import { describe } from "./describe";
import HoverPreview from "./HoverPreview";
import { IcBell, IcCast, IcCheck, IcChevronDown, IcChevronRight, IcDownload, IcHome, IcInfo, IcMenu, IcMute, IcNewHot, IcPlay, IcPlus, IcReplay, IcSearch, IcVolume } from "./icons";
import { PosterCard, Rail, Top10Card, WideCard, type PreviewFn } from "./Rows";
import { cropStyle, soonDate } from "./theme";
import { isMuted, setMuted } from "@/lib/webAudio";

export type View = "home" | "new" | "list";

export default function Browse({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { vp, reduced } = useLf();
  const phone = vp === "phone";
  const [ready, setReady] = useState(reduced);
  const [preview, setPreview] = useState<{ t: Title; el: HTMLElement; id: number } | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);
  const onPreview: PreviewFn = useCallback((t, el) => setPreview((p) => ({ t, el, id: (p?.id ?? 0) + 1 })), []);

  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 520);
    return () => window.clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  if (!ready) return <Skeleton phone={phone} />;

  return (
    <div className={`lf-browse ${phone ? "is-phone" : "is-web"}`}>
      {phone ? <PhoneHeader view={view} /> : <WebNav view={view} setView={setView} />}

      {view === "home" && (phone ? <PhoneHome /> : <WebHome onPreview={onPreview} />)}
      {view === "new" && <NewHot phone={phone} onPreview={onPreview} />}
      {view === "list" && (phone ? <MyPage setView={setView} /> : <WebList onPreview={onPreview} />)}

      {!phone && <Footer />}
      {phone && <TabBar view={view} setView={setView} />}
      {preview && !phone && <HoverPreview key={preview.id} t={preview.t} el={preview.el} onClose={closePreview} />}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */

function Skeleton({ phone }: { phone: boolean }) {
  return (
    <div className="lf-skel" aria-label="Loading" aria-busy="true">
      <div className={phone ? "lf-skel-herocard" : "lf-skel-hero"} />
      {[0, 1, 2].map((r) => (
        <div key={r} className="lf-skel-row">
          <div className="lf-skel-h" />
          <div className="lf-skel-cards">
            {Array.from({ length: phone ? 4 : 6 }, (_, i) => (
              <div key={i} className={phone ? "lf-skel-poster" : "lf-skel-card"} style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Web nav ────────────────────────────────────────────────────────────── */

function useScrolled(px = 8) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > px);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [px]);
  return s;
}

function WebNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { data, mode, toast, vp } = useLf();
  const scrolled = useScrolled();
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [bell, setBell] = useState(false);
  const [browse, setBrowse] = useState(false);
  const links: { label: string; go: () => void; on?: boolean }[] = [
    { label: "Home", go: () => setView("home"), on: view === "home" },
    { label: "Shows", go: () => setView("home") },
    { label: "Movies", go: () => toast("No movies. Just one very long show.", "🎬") },
    { label: "New & Popular", go: () => setView("new"), on: view === "new" },
    { label: "My List", go: () => setView("list"), on: view === "list" },
    { label: "Browse by Love Language", go: () => toast("Available love languages: all of them, for you.", "💬") },
  ];
  const notes = useNotifications();

  return (
    <header className={`lf-nav${scrolled ? " is-solid" : ""}`}>
      <button type="button" className="lf-nav-logo" onClick={() => setView("home")} aria-label="LoveFlix home">
        <Wordmark size={vp === "desktop" ? 30 : 26} />
      </button>
      <nav className="lf-nav-links" aria-label="Primary">
        {links.map((l) => (
          <button key={l.label} type="button" className={l.on ? "is-on" : ""} onClick={l.go}>
            {l.label}
          </button>
        ))}
      </nav>
      <div className="lf-nav-browse">
        <button type="button" onClick={() => setBrowse((b) => !b)} aria-expanded={browse}>
          Browse <IcChevronDown size={16} />
        </button>
        {browse && (
          <ul className="lf-menu is-browse" onClick={() => setBrowse(false)}>
            {links.map((l) => (
              <li key={l.label}>
                <button type="button" className={l.on ? "is-on" : ""} onClick={l.go}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="lf-nav-right">
        {mode === "live" && <BrandPill />}
        <form
          className={`lf-search${search ? " is-open" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            toast(q ? `No results for “${q}”. Only ${data.showTitle}, and you're already in it.` : `Only one title here: ${data.showTitle}`, "🔍");
          }}
        >
          <button type="button" onClick={() => setSearch((s) => !s)} aria-label="Search">
            <IcSearch size={22} />
          </button>
          {search && (
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titles, people, feelings" aria-label="Search" onBlur={() => !q && setSearch(false)} />
          )}
        </form>
        <button type="button" className="lf-nav-kids" onClick={() => toast("Just Us mode is always on", "🔒")}>
          Just Us
        </button>
        <div className="lf-nav-bell">
          <button type="button" onClick={() => setBell((b) => !b)} aria-label="Notifications" aria-expanded={bell}>
            <IcBell size={22} />
            <span className="lf-badge">{notes.length}</span>
          </button>
          {bell && (
            <ul className="lf-menu is-notes" onMouseLeave={() => setBell(false)}>
              {notes.map((n, i) => (
                <li key={i}>
                  <div className="lf-note-thumb">
                    <Still src={n.src} crop={n.crop} label={n.title} seed={`note${i}${n.title}`} artSize="sm" />
                  </div>
                  <div>
                    <b>{n.kicker}</b>
                    <span>{n.title}</span>
                    <i>{n.when}</i>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lf-nav-profile" tabIndex={0}>
          <Avatar src={data.recipientPhotoUrl} crop={data.recipientCrop} variant={0} size={32} />
          <span className="lf-caret"><IcChevronDown size={14} /></span>
          <ul className="lf-menu is-profile">
            <li className="lf-menu-prof">
              <Avatar src={data.senderPhotoUrl} crop={data.senderCrop} variant={1} size={32} /> {data.senderName || "Me"} <span className="lf-dim">(locked)</span>
            </li>
            {data.thirdProfile && (
              <li className="lf-menu-prof">
                <Avatar variant={2} size={32} /> {data.thirdProfile}
              </li>
            )}
            <li><button type="button" onClick={() => toast("Profiles managed. Nothing to change.", "✨")}>Manage Profiles</button></li>
            <li><button type="button" onClick={() => toast("Plan: Premium Forever · renews automatically", "💳")}>Account</button></li>
            <li><button type="button" onClick={() => toast(`Help: call ${data.senderName || "me"}. Any time.`, "📞")}>Help Centre</button></li>
            <li className="lf-menu-sep"><button type="button" onClick={() => toast("You can't sign out of this one", "🔒")}>Sign out of LoveFlix</button></li>
          </ul>
        </div>
      </div>
    </header>
  );
}

function useNotifications() {
  const { data } = useLf();
  return useMemo(() => {
    const out: { kicker: string; title: string; when: string; src?: string; crop?: import("./types").Crop }[] = [];
    const last = data.episodes[data.episodes.length - 1];
    if (last) out.push({ kicker: "New Episode", title: last.title, when: "Today", src: last.imageUrl, crop: last.crop });
    out.push({ kicker: "Reminder", title: `${data.senderName || "Someone"} is thinking about you`, when: "Just now", src: data.senderPhotoUrl, crop: data.senderCrop });
    if (data.plans[0]) out.push({ kicker: "Coming Soon", title: data.plans[0], when: "This year" });
    out.push({ kicker: "Renewed", title: `${data.showTitle} — another season confirmed`, when: "Yesterday", src: data.heroImageUrl, crop: data.heroCrop });
    return out;
  }, [data]);
}

/* ── Billboard (web) ────────────────────────────────────────────────────── */

function Billboard() {
  const { data, play, openDetails, reduced, watched } = useLf();
  const show = describe({ kind: "show" }, data);
  const slides = useMemo(() => {
    const s = [{ src: show.src, crop: show.crop }];
    for (const e of data.episodes) if (e.imageUrl && e.imageUrl !== show.src) s.push({ src: e.imageUrl, crop: e.crop });
    return s.filter((x) => x.src);
  }, [data.episodes, show.src, show.crop]);
  const [trailer, setTrailer] = useState(false);
  const [slide, setSlide] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMutedState] = useState(() => isMuted());

  useEffect(() => {
    if (reduced || slides.length === 0) return;
    const t = window.setTimeout(() => setTrailer(true), 5200);
    return () => window.clearTimeout(t);
  }, [reduced, slides.length]);

  useEffect(() => {
    if (!trailer) return;
    const t = window.setInterval(() => {
      setSlide((s) => {
        if (s + 1 >= slides.length) {
          setTrailer(false);
          setDone(true);
          return 0;
        }
        return s + 1;
      });
    }, 4600);
    return () => window.clearInterval(t);
  }, [trailer, slides.length]);

  const resume = watched.size > 0;
  const startEp = Math.min(watched.size, Math.max(0, data.episodes.length - 1));

  return (
    <section className={`lf-bb${trailer ? " is-trailer" : ""}`} aria-label={data.showTitle}>
      <div className="lf-bb-media">
        {slides.length ? (
          slides.map((s, i) => (
            <div key={i} className={`lf-bb-slide${i === slide ? " is-on" : ""}${trailer && i === slide ? " is-kb" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" draggable={false} fetchPriority={i === 0 ? "high" : undefined} loading={i === 0 ? "eager" : "lazy"} style={cropStyle(s.crop ?? { x: 50, y: 50, scale: 100 })} />
            </div>
          ))
        ) : (
          <Still label="" seed={`bb${data.showTitle}`} artSize="lg" />
        )}
        <span className="lf-bb-vl" />
        <span className="lf-bb-vb" />
      </div>
      <div className="lf-bb-info">
        <SeriesTag size={15} />
        <h1 className="lf-bb-title">{data.showTitle}</h1>
        <div className="lf-bb-rank">
          <Top10Chip size={30} />
          <span>#1 in {data.recipientName ? `${data.recipientName}'s` : "Your"} Heart Today</span>
        </div>
        <p className="lf-bb-syn">{data.tagline}</p>
        <div className="lf-bb-btns">
          <button type="button" className="lf-btn is-play" onClick={() => play(startEp)}>
            <IcPlay size={28} /> {resume ? "Resume" : "Play"}
          </button>
          <button type="button" className="lf-btn is-grey" onClick={() => openDetails({ kind: "show" })}>
            <IcInfo size={26} /> More Info
          </button>
        </div>
      </div>
      <div className="lf-bb-side">
        <button
          type="button"
          className="lf-circ is-outline"
          onClick={() => {
            if (done) {
              setDone(false);
              setSlide(0);
              setTrailer(true);
              return;
            }
            const m = !muted;
            setMuted(m);
            setMutedState(m);
          }}
          aria-label={done ? "Replay" : muted ? "Unmute" : "Mute"}
        >
          {done ? <IcReplay size={20} /> : muted ? <IcMute size={20} /> : <IcVolume size={20} />}
        </button>
        <span className="lf-bb-mat">{data.rating}</span>
      </div>
    </section>
  );
}

/* ── Web home ───────────────────────────────────────────────────────────── */

function HomeRails({ onPreview, phone }: { onPreview?: PreviewFn; phone?: boolean }) {
  const { data, myList } = useLf();
  const Card = phone ? PosterCard : WideCard;
  const listItems = [...myList]
    .map((k): Title | null => {
      if (k === "show") return null;
      const [kind, i] = k.split(":");
      return { kind: kind as "episode", index: Number(i) };
    })
    .filter((x): x is Title => x !== null);
  return (
    <div className="lf-rails">
      <Rail title={`Continue Watching for ${data.recipientName || "You"}`} kind={phone ? "poster" : "wide"}>
        {data.episodes.map((_, i) => (
          <Card key={i} t={{ kind: "episode", index: i }} onPreview={onPreview} />
        ))}
      </Rail>
      {data.reasons.length > 0 && (
        <Rail title={`Top 10 Reasons I Love You Today`} kind="top10">
          {data.reasons.slice(0, 10).map((_, i) => (
            <Top10Card key={i} t={{ kind: "reason", index: i }} rank={i + 1} onPreview={phone ? undefined : onPreview} />
          ))}
        </Rail>
      )}
      {listItems.length > 0 && (
        <Rail title="My List" kind={phone ? "poster" : "wide"}>
          {listItems.map((t) => (
            <Card key={titleKey(t)} t={t} onPreview={onPreview} />
          ))}
        </Rail>
      )}
      {data.insideJokes.length > 0 && (
        <Rail title="Critically Acclaimed Inside Jokes" kind={phone ? "poster" : "wide"}>
          {data.insideJokes.map((_, i) => (
            <Card key={i} t={{ kind: "joke", index: i }} onPreview={onPreview} />
          ))}
        </Rail>
      )}
      {data.plans.length > 0 && (
        <Rail title="Coming Soon" kind={phone ? "poster" : "wide"}>
          {data.plans.map((_, i) => (
            <Card key={i} t={{ kind: "plan", index: i }} onPreview={onPreview} />
          ))}
        </Rail>
      )}
      <Rail title={`Because You Watched ${data.showTitle}`} kind={phone ? "poster" : "wide"}>
        {[...data.episodes.map((_, i) => ({ kind: "episode" as const, index: i }))].reverse().map((t) => (
          <Card key={titleKey(t)} t={t} onPreview={onPreview} />
        ))}
      </Rail>
    </div>
  );
}

function WebHome({ onPreview }: { onPreview: PreviewFn }) {
  return (
    <main>
      <Billboard />
      <div className="lf-rails-lift">
        <HomeRails onPreview={onPreview} />
      </div>
    </main>
  );
}

function WebList({ onPreview }: { onPreview: PreviewFn }) {
  const { data, myList } = useLf();
  const all: Title[] = [
    { kind: "show" },
    ...[...myList].filter((k) => k !== "show").map((k) => {
      const [kind, i] = k.split(":");
      return { kind: kind as "joke", index: Number(i) } as Title;
    }),
  ];
  const cards = all.length > 1 ? all.slice(1) : data.episodes.map((_, i) => ({ kind: "episode" as const, index: i }));
  return (
    <main className="lf-listpage">
      <h1>My List</h1>
      {all.length <= 1 && <p className="lf-dim">Nothing added yet — so here&apos;s everything {data.senderName || "they"} thinks you&apos;d love.</p>}
      <div className="lf-listgrid">
        {cards.map((t) => (
          <WideCard key={titleKey(t)} t={t} onPreview={onPreview} />
        ))}
      </div>
    </main>
  );
}

/* ── New & Popular / New & Hot ──────────────────────────────────────────── */

function NewHot({ phone, onPreview }: { phone: boolean; onPreview: PreviewFn }) {
  const { data, toast, openDetails, play } = useLf();
  const [reminded, setReminded] = useState<Set<number>>(new Set());
  const [chip, setChip] = useState(0);
  const jump = (i: number, id: string) => {
    setChip(i);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!phone) {
    return (
      <main className="lf-newweb">
        <h1 className="lf-page-h">New &amp; Popular</h1>
        <div className="lf-rails">
          {data.plans.length > 0 && (
            <Rail title="Coming Soon" kind="wide">
              {data.plans.map((_, i) => (
                <WideCard key={i} t={{ kind: "plan", index: i }} onPreview={onPreview} />
              ))}
            </Rail>
          )}
          {data.reasons.length > 0 && (
            <Rail title="Top 10 Reasons I Love You Today" kind="top10">
              {data.reasons.map((_, i) => (
                <Top10Card key={i} t={{ kind: "reason", index: i }} rank={i + 1} onPreview={onPreview} />
              ))}
            </Rail>
          )}
          <Rail title="Everyone's Watching (It's You)" kind="wide">
            {data.episodes.map((_, i) => (
              <WideCard key={i} t={{ kind: "episode", index: i }} onPreview={onPreview} />
            ))}
          </Rail>
        </div>
      </main>
    );
  }

  return (
    <main className="lf-nh">
      <div className="lf-nh-chips lf-nobar">
        {[
          ["🍿", "Coming Soon", "nh-soon"],
          ["🔥", "Everyone's Watching", "nh-watch"],
          ["🔟", "Top 10 Reasons", "nh-top"],
        ].map(([e, l, id], i) => (
          <button key={id} type="button" className={chip === i ? "is-on" : ""} onClick={() => jump(i, id)}>
            <span aria-hidden>{e}</span> {l}
          </button>
        ))}
      </div>

      <section id="nh-soon" className="lf-nh-sec">
        {data.plans.map((p, i) => {
          const dt = soonDate(i);
          const on = reminded.has(i);
          const d = describe({ kind: "plan", index: i }, data);
          return (
            <article key={i} className="lf-nh-item">
              <div className="lf-nh-date">
                <span>{dt.mon}</span>
                <b>{dt.day}</b>
              </div>
              <div className="lf-nh-body">
                <Still src={d.src} crop={d.crop} label={p} seed={`plan:${i}${p}`} className="lf-nh-img">
                  <CornerL />
                  <span className="lf-ribbon">Coming Soon</span>
                </Still>
                <div className="lf-nh-row">
                  <span className="lf-nh-logo">{p}</span>
                  <div className="lf-nh-acts">
                    <button
                      type="button"
                      onClick={() => {
                        setReminded((s) => {
                          const n = new Set(s);
                          if (on) n.delete(i);
                          else n.add(i);
                          return n;
                        });
                        if (!on) toast(`Reminder set. ${data.senderName || "They"} never forgets.`, "🔔");
                      }}
                    >
                      {on ? <IcCheck size={22} /> : <IcBell size={22} />}
                      <span>{on ? "Reminder Set" : "Remind Me"}</span>
                    </button>
                    <button type="button" onClick={() => openDetails({ kind: "plan", index: i })}>
                      <IcInfo size={22} />
                      <span>Info</span>
                    </button>
                  </div>
                </div>
                <p className="lf-nh-when">Coming {dt.mon.charAt(0) + dt.mon.slice(1).toLowerCase()} {dt.day}</p>
                <SeriesTag size={10} />
                <h3>{p}</h3>
                <p className="lf-nh-syn">{d.synopsis}</p>
                <p className="lf-tags is-sm">
                  {d.tags.map((g, j) => (
                    <span key={g}>
                      {j > 0 && <i>•</i>}
                      {g}
                    </span>
                  ))}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section id="nh-watch" className="lf-nh-sec">
        <h2 className="lf-nh-h">🔥 Everyone&apos;s Watching</h2>
        {data.episodes.map((e, i) => (
          <article key={i} className="lf-nh-watch">
            <button type="button" className="lf-nh-watchimg" onClick={() => play(i)} aria-label={`Play ${e.title}`}>
              <Still src={e.imageUrl} crop={e.crop} label={e.title} seed={`episode:${i}${e.title}`}>
                <CornerL />
                <span className="lf-cw-play is-big"><IcPlay size={22} /></span>
              </Still>
            </button>
            <h3>{e.title}</h3>
            <p className="lf-nh-syn">{e.synopsis}</p>
          </article>
        ))}
      </section>

      <section id="nh-top" className="lf-nh-sec">
        <h2 className="lf-nh-h">🔟 Top 10 Reasons Today</h2>
        <ol className="lf-nh-top">
          {data.reasons.map((r, i) => (
            <li key={i}>
              <span className="lf-num is-sm">{i + 1}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

/* ── Phone ──────────────────────────────────────────────────────────────── */

function PhoneHeader({ view }: { view: View }) {
  const { data, mode, toast } = useLf();
  const scrolled = useScrolled(4);
  const title = view === "home" ? `For ${data.recipientName || "You"}` : view === "new" ? "New & Hot" : "My LoveFlix";
  return (
    <header className={`lf-mh${scrolled ? " is-solid" : ""}`}>
      <div className="lf-mh-top">
        <h1>{title}</h1>
        <div className="lf-mh-ic">
          {mode === "live" && <BrandPill />}
          <button type="button" onClick={() => toast("Casting to your heart…", "📡")} aria-label="Cast">
            <IcCast size={22} />
          </button>
          {view !== "list" && (
            <button type="button" onClick={() => toast("Downloads: every episode, stored in my memory", "⬇️")} aria-label="Downloads">
              <IcDownload size={22} />
            </button>
          )}
          <button type="button" onClick={() => toast(`Only one title on here: ${data.showTitle}`, "🔍")} aria-label="Search">
            <IcSearch size={22} />
          </button>
          {view === "list" && (
            <button type="button" onClick={() => toast("Settings: everything set to “you”", "⚙️")} aria-label="Menu">
              <IcMenu size={22} />
            </button>
          )}
        </div>
      </div>
      {view === "home" && (
        <div className="lf-mh-chips">
          <button type="button" onClick={() => toast("Shows: one. It's this one.", "📺")}>Shows</button>
          <button type="button" onClick={() => toast("No movies. Just one very long show.", "🎬")}>Movies</button>
          <button type="button" onClick={() => toast("Categories: Us, More Us, Us (Extended)", "🗂️")}>
            Categories <IcChevronDown size={14} />
          </button>
        </div>
      )}
    </header>
  );
}

function PhoneHome() {
  const { data, play, toggleList, myList, watched } = useLf();
  const show = describe({ kind: "show" }, data);
  const inList = myList.has("show");
  const startEp = Math.min(watched.size, Math.max(0, data.episodes.length - 1));
  return (
    <main className="lf-ph">
      {show.src && (
        <div className="lf-ph-bleed" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={show.src} alt="" />
        </div>
      )}
      <section className="lf-ph-hero" aria-label={data.showTitle}>
        <Still src={show.src} crop={show.crop} label="" seed={`bb${data.showTitle}`} eager className="lf-ph-heroimg">
          <span className="lf-ph-herofade" />
          <div className="lf-ph-heroinfo">
            <SeriesTag size={11} />
            <h2 className="lf-ph-title">{data.showTitle}</h2>
            <p className="lf-tags is-center">
              {data.genres.map((g, i) => (
                <span key={g}>
                  {i > 0 && <i>•</i>}
                  {g}
                </span>
              ))}
            </p>
            <div className="lf-ph-btns">
              <button type="button" className="lf-btn is-play" onClick={() => play(startEp)}>
                <IcPlay size={22} /> {watched.size ? "Resume" : "Play"}
              </button>
              <button type="button" className="lf-btn is-grey" onClick={() => toggleList({ kind: "show" })}>
                {inList ? <IcCheck size={22} /> : <IcPlus size={22} />} My List
              </button>
            </div>
          </div>
        </Still>
      </section>
      <HomeRails phone />
    </main>
  );
}

function MyPage({ setView }: { setView: (v: View) => void }) {
  const { data, toast, openDetails, liked } = useLf();
  const notes = useNotifications();
  const likedEps = data.episodes.map((_, i) => i).filter((i) => liked.has(`episode:${i}`));
  const likedList = likedEps.length ? likedEps : data.episodes.map((_, i) => i);
  return (
    <main className="lf-my">
      <div className="lf-my-prof">
        <Avatar src={data.recipientPhotoUrl} crop={data.recipientCrop} variant={0} size={72} radius={6} />
        <button type="button" onClick={() => toast("Only one profile here. Yours.", "💗")}>
          {data.recipientName || "You"} <IcChevronDown size={16} />
        </button>
      </div>

      <div className="lf-my-sec">
        <button type="button" className="lf-my-line" onClick={() => toast("All caught up. Except on how much you're loved.", "🔔")}>
          <span className="lf-my-dot is-red"><IcBell size={18} /></span>
          <b>Notifications</b>
          <IcChevronRight size={20} />
        </button>
        <ul className="lf-my-notes">
          {notes.slice(0, 3).map((n, i) => (
            <li key={i}>
              <div className="lf-note-thumb">
                <Still src={n.src} crop={n.crop} label={n.title} seed={`note${i}${n.title}`} artSize="sm" />
              </div>
              <div>
                <b>{n.kicker}</b>
                <span>{n.title}</span>
                <i>{n.when}</i>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lf-my-sec">
        <button type="button" className="lf-my-line" onClick={() => toast("Every episode is already downloaded. Into my heart.", "⬇️")}>
          <span className="lf-my-dot is-blue"><IcDownload size={18} /></span>
          <b>Downloads</b>
          <span className="lf-dim">{data.episodes.length} episodes · offline forever</span>
          <IcChevronRight size={20} />
        </button>
      </div>

      <Rail title="TV Shows & Movies You've Liked" kind="poster">
        {likedList.map((i) => (
          <PosterCard key={i} t={{ kind: "episode", index: i }} />
        ))}
      </Rail>
      {data.reasons.length > 0 && (
        <Rail title="My List" kind="poster">
          {data.reasons.slice(0, 10).map((_, i) => (
            <button key={i} type="button" className="lf-card lf-card-poster lf-reasonposter" onClick={() => openDetails({ kind: "reason", index: i })}>
              <Still seed={`reasonp${i}`} label={data.reasons[i]} artSize="sm" className="lf-card-img">
                <CornerL />
              </Still>
            </button>
          ))}
        </Rail>
      )}
      {data.insideJokes.length > 0 && (
        <Rail title="Trailers You've Watched" kind="poster">
          {data.insideJokes.map((_, i) => (
            <PosterCard key={i} t={{ kind: "joke", index: i }} />
          ))}
        </Rail>
      )}
      <button type="button" className="lf-my-back" onClick={() => setView("home")}>
        Back to {data.showTitle}
      </button>
    </main>
  );
}

function TabBar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { data } = useLf();
  const tabs: { v: View; label: string; icon: React.ReactNode }[] = [
    { v: "home", label: "Home", icon: <IcHome size={24} /> },
    { v: "new", label: "New & Hot", icon: <IcNewHot size={24} /> },
    {
      v: "list",
      label: "My LoveFlix",
      icon: <Avatar src={data.recipientPhotoUrl} crop={data.recipientCrop} variant={0} size={24} radius={4} className="lf-tab-av" />,
    },
  ];
  return (
    <nav className="lf-tabs" aria-label="Tabs">
      {tabs.map((t) => (
        <button key={t.v} type="button" className={view === t.v ? "is-on" : ""} onClick={() => setView(t.v)} aria-current={view === t.v ? "page" : undefined}>
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  const { data, toast } = useLf();
  const links = [
    "Audio Description (soft sighs)",
    "Help Centre (hugs)",
    "Gift Cards (this is one)",
    "Media Centre",
    "Investor Relations (just me)",
    "Jobs (being yours)",
    "Terms of Forever",
    "Privacy (just us two)",
    "Legal Notices",
    "Cookie Preferences (chocolate chip)",
    "Corporate Information",
    "Contact Us (call me)",
  ];
  return (
    <footer className="lf-foot">
      <div className="lf-foot-links">
        {links.map((l) => (
          <button key={l} type="button" onClick={() => toast(l, "💌")}>
            {l}
          </button>
        ))}
      </div>
      <button type="button" className="lf-foot-code" onClick={() => toast("Service code: 143-143. It means what you think.", "🔢")}>
        Service Code
      </button>
      <p>
        © {data.metYear || "2024"}–∞ LoveFlix, Inc. · Made by {data.senderName || "someone"} for {data.recipientName || "you"}
      </p>
    </footer>
  );
}
