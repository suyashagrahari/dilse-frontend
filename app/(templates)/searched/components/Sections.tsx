// ─── The results-page modules ────────────────────────────────────────────────
//
// Each one is a faithful copy of a real results-page module — spacing, type
// scale and behaviour — filled with the sender's words and photos.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { ChevronDown, ChevronRight, DirectionsIcon, DotsIcon, PlayIcon, SearchIcon, ShareIcon, Sparkle, StarIcon, ThumbDown, ThumbUp } from "./icons";
import {
  boldTerms,
  colorForIndex,
  firstNameOf,
  hashOf,
  initialCircle,
  splitAlso,
  splitFact,
  stretchName,
  groupIndian,
  type LovePhoto,
  type PaaItem,
  type Place,
  type Review,
  type SearchData,
  type SearchResult,
  type Story,
  type Video,
} from "./types";

// ── atoms ────────────────────────────────────────────────────────────────────

export function Pic({ photo, className, style }: { photo?: LovePhoto; className?: string; style?: CSSProperties }) {
  return (
    <span className={`srPic ${className ?? ""}`} style={style}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt={photo.caption ?? ""} draggable={false} loading="lazy" style={cropStyle(photoCrop(photo))} />
      )}
    </span>
  );
}

export function Snip({ text, name }: { text: string; name: string }) {
  return (
    <>
      {boldTerms(text, name).map((t, i) => (t.bold ? <b key={i}>{t.text}</b> : <span key={i}>{t.text}</span>))}
    </>
  );
}

export function Fav({ label, size = 26 }: { label: string; size?: number }) {
  const ic = initialCircle(label || "?");
  return (
    <span className="srFav" style={{ width: size, height: size }} aria-hidden>
      <span style={{ background: ic.bg }}>{ic.initial}</span>
    </span>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="srStars" aria-label={`Rated ${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} size={size} fill={Math.max(0, Math.min(1, value - i))} />
      ))}
    </span>
  );
}

const pickPhoto = (photos: LovePhoto[], i: number): LovePhoto | undefined => (photos.length ? photos[i % photos.length] : undefined);

// ── a single organic result ─────────────────────────────────────────────────

export function ResultRow({ r, name, photo, onOpen, i }: { r: SearchResult; name: string; photo?: LovePhoto; onOpen: () => void; i: number }) {
  return (
    <div className="srR srIn" style={{ animationDelay: `${i * 60}ms` }}>
      {r.badge && <p className="srRAd">{/sponsor|^ad$/i.test(r.badge) ? "Sponsored" : r.badge}</p>}
      <div className="srRBody">
        <div className="srRMain">
          <button type="button" className="srRLink" onClick={onOpen}>
            <span className="srRSite">
              <Fav label={r.site} />
              <span className="srRSiteTx">
                <span className="srRName">{r.site}</span>
                <span className="srRUrl">{r.url.replace(/^https?:\/\//, "")}</span>
              </span>
            </span>
            <h3 className="srRTitle">{r.title}</h3>
          </button>
          <span className="srRDots" aria-hidden><DotsIcon size={18} /></span>
          <p className="srRSnip">
            {r.date && <span className="srRDate">{r.date} — </span>}
            <Snip text={r.snippet} name={name} />
          </p>
        </div>
        {photo && (
          <button type="button" className="srRThumb" onClick={onOpen} aria-label={`Open ${r.title}`}>
            <Pic photo={photo} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── AI Overview ──────────────────────────────────────────────────────────────

export function AiOverview({ data, reduce, full, onPhoto }: { data: SearchData; reduce: boolean; full?: boolean; onPhoto: (i: number) => void }) {
  const name = data.recipient.name;
  const text = data.aiOverview.trim();
  const paras = useMemo(() => text.split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean), [text]);
  const words = useMemo(() => paras.map((p) => p.split(/\s+/)), [paras]);
  const total = words.reduce((a, w) => a + w.length, 0);
  const [phase, setPhase] = useState<"think" | "stream" | "done">(reduce ? "done" : "think");
  const [n, setN] = useState(reduce ? total : 0);
  const [open, setOpen] = useState(!!full);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    let t1 = 0;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          t1 = window.setTimeout(() => setPhase("stream"), 1100);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t1);
    };
  }, [reduce]);

  useEffect(() => {
    if (phase !== "stream") return;
    const id = window.setInterval(() => {
      setN((v) => {
        const next = v + 2;
        if (next >= total) {
          window.clearInterval(id);
          setPhase("done");
          return total;
        }
        return next;
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [phase, total]);

  if (!text && !data.aiPoints.length) return null;

  const starts = words.map((_, i) => words.slice(0, i).reduce((a, w) => a + w.length, 0));
  const shown = words.map((w, i) => w.slice(0, Math.max(0, Math.min(w.length, n - starts[i]))).join(" "));
  let lastIdx = -1;
  shown.forEach((x, i) => { if (x) lastIdx = i; });
  const sources = data.photos.slice(0, 4);
  const done = phase === "done";

  return (
    <section ref={ref} className={`srAio${open ? " is-open" : ""}${full ? " is-full" : ""}`} aria-label="AI Overview">
      <div className="srAioHead">
        <Sparkle size={22} id="srSpkAio" className={phase === "think" ? "srSpin" : undefined} />
        <span>AI Overview</span>
      </div>
      {phase === "think" ? (
        <div className="srAioSkel" aria-label="Generating">
          <i style={{ width: "92%" }} />
          <i style={{ width: "100%" }} />
          <i style={{ width: "78%" }} />
          <i style={{ width: "60%" }} />
        </div>
      ) : (
        <div className="srAioGrid">
          <div className="srAioBody">
            {shown.map((s, i) =>
              s ? (
                <p key={i} className="srAioP">
                  <Snip text={s} name={name} />
                  {!done && i === lastIdx && <span className="srCaret" aria-hidden />}
                </p>
              ) : null,
            )}
            {done && data.aiPoints.length > 0 && (
              <ul className="srAioPts">
                {data.aiPoints.map((pt, i) => {
                  const f = splitFact(pt);
                  return (
                    <li key={i} className="srIn" style={{ animationDelay: `${i * 90}ms` }}>
                      {f.label ? <b>{f.label}: </b> : null}
                      {f.value}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {sources.length > 0 && (
            <div className="srAioSrc" aria-label="Sources">
              {sources.map((ph, i) => (
                <button key={i} type="button" className="srAioCard" onClick={() => onPhoto(i)}>
                  <span className="srAioCardTx">
                    <b>{ph.caption || `memory #${i + 1}`}</b>
                    <span>{ph.note ? ph.note.slice(0, 70) + (ph.note.length > 70 ? "…" : "") : "from the camera roll"}</span>
                    <small><Fav label={ph.caption || "m"} size={16} /> memories.love</small>
                  </span>
                  <Pic photo={ph} className="srAioCardPic" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {done && (
        <div className="srAioFoot">
          <span>AI responses may include mistakes. <b>This one doesn&apos;t.</b></span>
          <span className="srAioVote">
            <button type="button" className={vote === "up" ? "is-on" : ""} aria-label="Helpful" onClick={() => setVote("up")}><ThumbUp size={16} /></button>
            <button type="button" className={vote === "down" ? "is-on" : ""} aria-label="Not helpful" onClick={() => setVote("down")}><ThumbDown size={16} /></button>
          </span>
        </div>
      )}
      {vote && <p className="srAioThanks">{vote === "up" ? `Thanks! ${firstNameOf(data.sender.name) || "Someone"} agrees. Strongly.` : "Feedback rejected. The overview stands. 💅"}</p>}
      {!full && !open && (
        <div className="srAioMoreWrap">
          <button type="button" className="srAioMore" onClick={() => setOpen(true)}>
            Show more <ChevronDown size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

// ── the knowledge panel ─────────────────────────────────────────────────────

export function KnowledgePanel({
  data,
  variant,
  onPhoto,
  onSearch,
  onToast,
}: {
  data: SearchData;
  variant: "side" | "top" | "about";
  onPhoto: (i: number) => void;
  onSearch: (q: string) => void;
  onToast: (m: string) => void;
}) {
  const kp = data.knowledgePanel;
  const name = data.recipient.name || "You";
  const photos = data.photos;
  const avg = data.reviews.length ? data.reviews.reduce((a, r) => a + r.stars, 0) / data.reviews.length : 5;
  const count = groupIndian(1000 + (hashOf(name) % 9000));

  const header = (
    <>
      {photos.length > 0 && (
        <div className={`srKpPics n${Math.min(photos.length, 5)}`}>
          {photos.slice(0, 5).map((ph, i) => (
            <button key={i} type="button" className="srKpPic" onClick={() => onPhoto(i)} aria-label={ph.caption || `Photo ${i + 1}`}>
              <Pic photo={ph} />
              {i === 4 && photos.length > 5 && <span className="srKpMore">+{photos.length - 5}</span>}
            </button>
          ))}
        </div>
      )}
      <div className="srKpHead">
        <div>
          <h2 className="srKpTitle">{name}</h2>
          {kp.subtitle && <p className="srKpSub">{kp.subtitle}</p>}
        </div>
        <button type="button" className="srKpShare" aria-label="Share" onClick={() => onToast("link copied to your heart 💗")}>
          <ShareIcon size={20} />
        </button>
      </div>
    </>
  );

  const body = (
    <>
      {kp.description && (
        <p className="srKpDesc">
          {kp.description} <span className="srKpSrc">Unencyclopedia</span>
        </p>
      )}
      {kp.facts.length > 0 && (
        <dl className="srKpFacts">
          {kp.facts.map((f, i) => (
            <div key={i}>
              {f.label && <dt>{f.label}: </dt>}
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {kp.quote && <blockquote className="srKpQuote">“{kp.quote}”</blockquote>}
      {data.reviews.length > 0 && (
        <div className="srKpRev">
          <h3 className="srKpH">Reviews</h3>
          <div className="srKpRevSum">
            <span className="srKpRevBig">{avg.toFixed(1)}</span>
            <Stars value={avg} size={16} />
            <span className="srKpRevN">{count} reviews</span>
          </div>
          {data.reviews.map((r, i) => (
            <ReviewRow key={i} r={r} />
          ))}
        </div>
      )}
      {kp.alsoSearchFor.length > 0 && (
        <div className="srKpAlso">
          <h3 className="srKpH">People also search for</h3>
          <div className="srKpAlsoRow">
            {kp.alsoSearchFor.map((s, i) => {
              const a = splitAlso(s);
              const ic = initialCircle(a.name);
              return (
                <button key={i} type="button" className="srKpAlsoItem" onClick={() => onSearch(a.name)}>
                  <span className="srKpAlsoPic" style={{ background: ic.bg }}>{ic.initial}</span>
                  <b>{a.name}</b>
                  {a.caption && <small>{a.caption}</small>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="srKpFeedback">Feedback</p>
    </>
  );

  if (variant === "top") return <section className="srKp srKp--top">{header}</section>;
  if (variant === "about") return <section className="srKp srKp--about"><h3 className="srKpH srKpAboutH">About {firstNameOf(name)}</h3>{body}</section>;
  return (
    <section className="srKp srKp--side">
      {header}
      {body}
    </section>
  );
}

function ReviewRow({ r }: { r: Review }) {
  const ic = initialCircle(r.author);
  return (
    <div className="srRev">
      <span className="srRevAv" style={{ background: ic.bg }}>{ic.initial}</span>
      <div>
        <p className="srRevTop"><b>{r.author}</b></p>
        <p className="srRevMeta"><Stars value={r.stars} size={12} /> {r.when && <span>{r.when}</span>}</p>
        <p className="srRevTx">“{r.text}”</p>
      </div>
    </div>
  );
}

// ── People also ask ─────────────────────────────────────────────────────────

export function PeopleAlsoAsk({ items, name, onSearch }: { items: PaaItem[]; name: string; onSearch: (q: string) => void }) {
  const [shown, setShown] = useState(Math.min(4, items.length));
  const [open, setOpen] = useState<Set<number>>(new Set());
  if (!items.length) return null;
  const toggle = (i: number) => {
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else {
        n.add(i);
        setShown((v) => Math.min(items.length, v + 2));
      }
      return n;
    });
  };
  return (
    <section className="srPaa srIn" aria-label="People also ask">
      <h2 className="srSecH">People also ask <span className="srDotsSm"><DotsIcon size={18} /></span></h2>
      {items.slice(0, shown).map((it, i) => (
        <div key={i} className={`srPaaRow${open.has(i) ? " is-open" : ""}${i >= 4 ? " srIn" : ""}`}>
          <button type="button" className="srPaaQ" aria-expanded={open.has(i)} onClick={() => toggle(i)}>
            <span>{it.question}</span>
            <ChevronDown size={24} />
          </button>
          <div className="srPaaA" role="region">
            <div>
              <p><Snip text={it.answer} name={name} /></p>
              <button type="button" className="srPaaSrc" onClick={() => onSearch(it.question)}>
                <Fav label={it.source || name} size={18} />
                <span>
                  <b>{(it.source || `${firstNameOf(name).toLowerCase()}.love`).split("›")[0].trim()}</b>
                  <small>{it.source || "the heart › answers"}</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
      <p className="srPaaFeedback">Feedback</p>
    </section>
  );
}

// ── Top stories ─────────────────────────────────────────────────────────────

export function TopStories({ stories, photos, onOpen, list }: { stories: Story[]; photos: LovePhoto[]; onOpen: (i: number) => void; list?: boolean }) {
  if (!stories.length) return null;
  if (list) {
    return (
      <section className="srNewsList">
        {stories.map((s, i) => (
          <button key={i} type="button" className="srNewsRow srIn" style={{ animationDelay: `${i * 70}ms` }} onClick={() => onOpen(i)}>
            <span className="srNewsTx">
              <span className="srStorySrc"><Fav label={s.source} size={16} /> {s.source}</span>
              <b>{s.title}</b>
              <small>{s.time}</small>
            </span>
            <Pic photo={pickPhoto(photos, i + 1)} className="srNewsPic" />
          </button>
        ))}
      </section>
    );
  }
  return (
    <section className="srStories srIn" aria-label="Top stories">
      <h2 className="srSecH"><NewsGlyph /> Top stories</h2>
      <div className="srScroller">
        {stories.map((s, i) => (
          <button key={i} type="button" className="srStory" onClick={() => onOpen(i)}>
            <Pic photo={pickPhoto(photos, i + 1)} className="srStoryPic" />
            <span className="srStoryBody">
              <span className="srStorySrc"><Fav label={s.source} size={16} /> {s.source}</span>
              <b className="srStoryTitle">{s.title}</b>
              <small>{s.time}</small>
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="srMoreBar" onClick={() => onOpen(0)}>
        More news <ChevronRight size={18} />
      </button>
    </section>
  );
}

const NewsGlyph = () => (
  <span className="srSecIc" aria-hidden>
    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-9 12H5v-2h6v2zm0-4H5v-2h6v2zm8 4h-6V8h6v8zm-8-8H5V8h6v2z" /></svg>
  </span>
);

// ── Images pack ─────────────────────────────────────────────────────────────

export function ImagesPack({ photos, name, onPhoto, onMore }: { photos: LovePhoto[]; name: string; onPhoto: (i: number) => void; onMore: () => void }) {
  if (!photos.length) return null;
  return (
    <section className="srImgs srIn" aria-label="Images">
      <h2 className="srSecH">Images</h2>
      <div className="srImgChips srScroller">
        {photos.slice(0, 5).map((ph, i) => (
          <button key={i} type="button" className="srChip" onClick={() => onPhoto(i)}>
            <Pic photo={ph} className="srChipPic" />
            {ph.caption || firstNameOf(name)}
          </button>
        ))}
      </div>
      <div className="srImgRow">
        {photos.slice(0, 6).map((ph, i) => (
          <button key={i} type="button" className={`srImgTile t${i}`} onClick={() => onPhoto(i)}>
            <Pic photo={ph} />
          </button>
        ))}
      </div>
      <button type="button" className="srMoreBar" onClick={onMore}>
        Show more images <ChevronRight size={18} />
      </button>
    </section>
  );
}

// ── Videos pack ─────────────────────────────────────────────────────────────

export function Videos({ videos, photos, onPlay, big }: { videos: Video[]; photos: LovePhoto[]; onPlay: (i: number) => void; big?: boolean }) {
  if (!videos.length) return null;
  return (
    <section className={`srVids srIn${big ? " is-big" : ""}`} aria-label="Videos">
      {!big && <h2 className="srSecH">Videos</h2>}
      {videos.map((v, i) => (
        <button key={i} type="button" className="srVid" onClick={() => onPlay(i)}>
          <span className="srVidThumb">
            <Pic photo={pickPhoto(photos, i + 2)} />
            <span className="srVidPlay"><PlayIcon size={22} /></span>
            <span className="srVidDur">{v.duration}</span>
          </span>
          <span className="srVidTx">
            <b>{v.title}</b>
            <small>{v.channel} · Camera Roll</small>
            <small>{["Feb 14, 2025", "Oct 3, 2025", "Jan 1, 2026", "Mar 14, 2026"][i % 4]}</small>
          </span>
        </button>
      ))}
    </section>
  );
}

// ── Local pack: places we've been ───────────────────────────────────────────

const PINS = [
  [26, 32],
  [60, 18],
  [76, 44],
  [42, 50],
  [88, 26],
];

export function MapArt({ places, active, onPin, tall }: { places: Place[]; active: number; onPin: (i: number) => void; tall?: boolean }) {
  return (
    <div className={`srMap${tall ? " is-tall" : ""}`} aria-label="Map of places we've been">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="srMapSvg" aria-hidden>
        <rect width="100" height="60" className="srMapLand" />
        <path d="M-5 44 C 20 38, 30 58, 55 50 S 90 30, 110 36 L110 70 L-5 70 Z" className="srMapWater" />
        <rect x="8" y="6" width="16" height="10" rx="2" className="srMapPark" />
        <rect x="66" y="44" width="14" height="9" rx="2" className="srMapPark" />
        <path d="M0 20 L100 26" className="srMapRoad big" />
        <path d="M34 0 L44 60" className="srMapRoad big" />
        <path d="M0 8 L60 12 M70 0 L64 60 M0 32 L100 30 M80 0 L96 60 M10 60 L22 0" className="srMapRoad" />
        <path d="M26 32 Q44 20 60 18 T76 44 T42 50" className="srMapTrail" />
      </svg>
      {places.slice(0, PINS.length).map((pl, i) => (
        <button
          key={i}
          type="button"
          className={`srPin${active === i ? " is-on" : ""}`}
          style={{ left: `${PINS[i][0]}%`, top: `${(PINS[i][1] / 60) * 100}%` }}
          onClick={() => onPin(i)}
          aria-label={pl.name}
        >
          <svg viewBox="0 0 24 34" width="22" height="31" aria-hidden>
            <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.5 12 34 12 34s12-13.5 12-22.3C24 5.2 18.6 0 12 0z" fill={active === i ? "#E8445E" : "#EA6A7E"} />
            <path d="M12 16.8l-1-.9C7.5 12.8 5.4 11 5.4 8.8a3.2 3.2 0 0 1 3.3-3.2c1.1 0 2.2.5 3.3 1.3 1.1-.8 2.2-1.3 3.3-1.3a3.2 3.2 0 0 1 3.3 3.2c0 2.2-2.1 4-5.6 7.1l-1 .9z" fill="#fff" />
          </svg>
          <span className="srPinLbl">{pl.name}</span>
        </button>
      ))}
    </div>
  );
}

export function LocalPack({ places, photos, name, full }: { places: Place[]; photos: LovePhoto[]; name: string; full?: boolean }) {
  const [active, setActive] = useState(0);
  const [openNote, setOpenNote] = useState<number | null>(null);
  if (!places.length) return null;
  return (
    <section className={`srLocal srIn${full ? " is-full" : ""}`} aria-label="Places">
      {!full && <h2 className="srSecH">Places {firstNameOf(name)} has been <small>(with me)</small></h2>}
      <MapArt places={places} active={active} onPin={(i) => { setActive(i); setOpenNote(i); }} tall={full} />
      <div className="srPlaces">
        {places.map((pl, i) => {
          const r = parseFloat(pl.rating) || 5;
          return (
            <div key={i} className={`srPlace${active === i ? " is-on" : ""}`}>
              <button type="button" className="srPlaceMain" onClick={() => { setActive(i); setOpenNote(openNote === i ? null : i); }}>
                <span className="srPlaceTx">
                  <b>{pl.name}</b>
                  <span className="srPlaceRate">{r.toFixed(1)} <Stars value={r} size={12} /> <small>({groupIndian(40 + (hashOf(pl.name) % 3000))})</small></span>
                  <small>{pl.kind}</small>
                  <small className="srOpen">Open 24 hours · <span>Closes never</span></small>
                  {openNote === i && pl.note && <span className="srPlaceNote srIn">“{pl.note}”</span>}
                </span>
                <Pic photo={pickPhoto(photos, i + 3)} className="srPlacePic" />
              </button>
              <div className="srPlaceActs">
                <button type="button" onClick={() => setOpenNote(i)}><SearchIcon size={16} /> Memory</button>
                <button type="button" onClick={() => setOpenNote(i)}><DirectionsIcon size={16} /> Directions</button>
              </div>
            </div>
          );
        })}
      </div>
      {!full && (
        <button type="button" className="srMoreBar" onClick={() => setOpenNote(active)}>
          More places <ChevronRight size={18} />
        </button>
      )}
    </section>
  );
}

// ── related searches + pagination ───────────────────────────────────────────

export function Related({ items, onSearch }: { items: string[]; onSearch: (q: string) => void }) {
  if (!items.length) return null;
  return (
    <section className="srRel srIn" aria-label="People also search for">
      <h2 className="srSecH">People also search for</h2>
      <div className="srRelGrid">
        {items.map((s, i) => (
          <button key={i} type="button" className="srRelChip" onClick={() => onSearch(s)}>
            <SearchIcon size={18} />
            <span>{s}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Pager({ name, page, setPage }: { name: string; page: number; setPage: (n: number) => void }) {
  const s = stretchName(name);
  const pages = 10;
  return (
    <nav className="srPager" aria-label="Pages">
      <div className="srPagerRow">
        {page > 1 && (
          <button type="button" className="srPagerPrev" onClick={() => setPage(page - 1)}>
            <span className="srPagerL" style={{ color: colorForIndex(0) }}>‹</span>
            <span className="srPagerN">Previous</span>
          </button>
        )}
        <span className="srPagerCell">
          <span className="srPagerL">
            {[...s.head].map((c, i) => (
              <span key={i} style={{ color: colorForIndex(i) }}>{c}</span>
            ))}
          </span>
          <span className="srPagerN">&nbsp;</span>
        </span>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} type="button" className={`srPagerCell${page === i + 1 ? " is-on" : ""}`} onClick={() => setPage(i + 1)} aria-label={`Page ${i + 1}`} aria-current={page === i + 1}>
            <span className="srPagerL srPagerV">{s.vowel}</span>
            <span className="srPagerN">{i + 1}</span>
          </button>
        ))}
        <span className="srPagerCell">
          <span className="srPagerL">
            {[...s.tail].map((c, i) => (
              <span key={i} style={{ color: colorForIndex(i + 3) }}>{c}</span>
            ))}
          </span>
          <span className="srPagerN">&nbsp;</span>
        </span>
        {page < pages && (
          <button type="button" className="srPagerNext" onClick={() => setPage(page + 1)}>
            <span className="srPagerL" style={{ color: colorForIndex(3) }}>›</span>
            <span className="srPagerN">Next</span>
          </button>
        )}
      </div>
    </nav>
  );
}
