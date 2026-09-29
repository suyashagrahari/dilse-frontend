"use client";

// The title details modal. Web: a centred 850px sheet over a dimmed catalogue —
// billboard still, Play / + / like, a metadata row, cast & genres, the season's
// episode list with thumbnails and runtimes, a "Because you watched…" grid and
// an About block. Phone: the app's full-screen details page with full-width
// Play and Download buttons and Episodes / More Like This tabs.

import { useEffect, useRef, useState } from "react";
import { CornerL, SeriesTag, Still, Top10Chip } from "./Brand";
import { titleKey, useLf, type Title } from "./context";
import { describe } from "./describe";
import { HeartBurst } from "./HoverPreview";
import { IcBack, IcCheck, IcChevronDown, IcClose, IcDownload, IcPlay, IcPlus, IcShare, IcThumb } from "./icons";
import { sfxLike } from "./loveflixAudio";
import { captionLines, fmtRuntime } from "./theme";
import { progressOf, runtimeOf } from "./types";

export default function DetailsModal({ t, onClose }: { t: Title; onClose: () => void }) {
  const lf = useLf();
  const { data, play, myList, toggleList, liked, toggleLike, toast, vp, watched } = lf;
  const phone = vp === "phone";
  const d = describe(t, data);
  const show = describe({ kind: "show" }, data);
  const isShowish = t.kind === "show" || t.kind === "episode";
  const hero = isShowish ? (t.kind === "episode" ? d : show) : d;
  const heading = isShowish ? data.showTitle : d.title;
  const k = titleKey(isShowish ? { kind: "show" } : t);
  const inList = myList.has(k);
  const isLiked = liked.has(k);
  const [burst, setBurst] = useState(0);
  const [tab, setTab] = useState<"eps" | "more">("eps");
  const [season, setSeason] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const startEp = t.kind === "episode" ? t.index : Math.min(watched.size, Math.max(0, data.episodes.length - 1));
  const castNames = [data.recipientName, data.senderName, data.thirdProfile].filter(Boolean);
  const moods = ["Heartfelt", "Romantic", ...data.genres].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);

  const like = () => {
    toggleLike(isShowish ? { kind: "show" } : t);
    if (!isLiked) {
      sfxLike();
      setBurst((b) => b + 1);
    }
  };

  const similar: Title[] = [
    ...data.insideJokes.map((_, i) => ({ kind: "joke" as const, index: i })),
    ...data.plans.map((_, i) => ({ kind: "plan" as const, index: i })),
  ].filter((x) => titleKey(x) !== titleKey(t));
  const shownSimilar = moreOpen ? similar : similar.slice(0, 6);

  const episodes = (
    <section className="lf-dm-eps">
      <div className="lf-dm-epshead">
        <h3>{t.kind === "reason" ? "The Full Top 10" : "Episodes"}</h3>
        {t.kind !== "reason" && (
          <div className="lf-dm-season">
            <button type="button" onClick={() => setSeason((s) => !s)} aria-expanded={season}>
              Season 1 <IcChevronDown size={16} />
            </button>
            {season && (
              <ul role="menu">
                <li role="menuitem" className="is-on">Season 1 <span>({data.episodes.length} Episodes)</span></li>
                <li role="menuitem" aria-disabled="true" onClick={() => toast("Season 2 is being filmed right now. You're in it.", "🎬")}>
                  Season 2 <span>(filming)</span>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
      {t.kind === "reason" ? (
        <ol className="lf-dm-reasons">
          {data.reasons.map((r, i) => (
            <li key={i} className={i === t.index ? "is-cur" : ""}>
              <span className="lf-dm-rnum">{i + 1}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="lf-dm-eplist">
          {data.episodes.map((e, i) => {
            const rt = runtimeOf(e.title, i);
            const cur = t.kind === "episode" ? i === t.index : i === startEp;
            const prog = watched.has(i) ? 100 : i < startEp ? 100 : cur ? progressOf(e.title, i) : 0;
            return (
              <li key={i} className={cur ? "is-cur" : ""}>
                <button type="button" className="lf-dm-ep" onClick={() => play(i)} aria-label={`Play episode ${i + 1}: ${e.title}`}>
                  <span className="lf-dm-epn">{i + 1}</span>
                  <span className="lf-dm-thumb">
                    <Still src={e.imageUrl} crop={e.crop} label={e.title} seed={`episode:${i}${e.title}`} artSize="sm">
                      <span className="lf-dm-thumbplay"><IcPlay size={20} /></span>
                    </Still>
                    {prog > 0 && (
                      <span className="lf-prog is-thumb"><i style={{ width: `${prog}%` }} /></span>
                    )}
                  </span>
                  <span className="lf-dm-eptxt">
                    <span className="lf-dm-eptop">
                      <b>{phone ? `${i + 1}. ${e.title}` : e.title}</b>
                      <span>{fmtRuntime(rt)}</span>
                    </span>
                    <span className="lf-dm-syn">{e.synopsis || captionLines(e.subtitle)[0]}</span>
                  </span>
                  {phone && (
                    <span className="lf-dm-dl" aria-hidden>
                      <IcDownload size={20} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );

  const moreLike = similar.length > 0 && (
    <section className="lf-dm-more">
      <h3>Because you watched {data.showTitle}</h3>
      <div className="lf-dm-grid">
        {shownSimilar.map((s) => {
          const sd = describe(s, data);
          const sk = titleKey(s);
          return (
            <div key={sk} className="lf-dm-mcard">
              <Still src={sd.src} crop={sd.crop} label={sd.title} seed={sk + sd.title} artSize="sm" className="lf-dm-mimg">
                <CornerL />
                <span className="lf-dm-mlen">{sd.length}</span>
              </Still>
              <div className="lf-dm-mbody">
                <div className="lf-dm-mtop">
                  <div>
                    <div className="lf-match">{sd.match}% Match</div>
                    <div className="lf-meta is-tight">
                      <span className="lf-mat">{data.rating}</span>
                      {data.metYear && <span>{data.metYear}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`lf-circ is-sm${myList.has(sk) ? " is-on" : ""}`}
                    onClick={() => toggleList(s)}
                    aria-label={myList.has(sk) ? "Remove from My List" : "Add to My List"}
                  >
                    {myList.has(sk) ? <IcCheck size={16} /> : <IcPlus size={16} />}
                  </button>
                </div>
                <p className="lf-dm-mtitle">{sd.title}</p>
                <p className="lf-dm-msyn">{sd.synopsis}</p>
              </div>
            </div>
          );
        })}
      </div>
      {similar.length > 6 && (
        <button type="button" className="lf-dm-showmore" onClick={() => setMoreOpen((m) => !m)} aria-label={moreOpen ? "Show less" : "Show more"}>
          <span style={{ transform: moreOpen ? "rotate(180deg)" : undefined }}>
            <IcChevronDown size={22} />
          </span>
        </button>
      )}
    </section>
  );

  return (
    <div className={`lf-dm-overlay${phone ? " is-phone" : ""}`} onClick={phone ? undefined : onClose} role="presentation">
      <div ref={scroller} className="lf-dm-scroll">
        <div className="lf-dm" role="dialog" aria-modal="true" aria-label={heading} onClick={(e) => e.stopPropagation()}>
          <div className="lf-dm-hero">
            <Still src={hero.src} crop={hero.crop} label={isShowish ? "" : d.title} seed={k + heading} eager artSize="lg" />
            <span className="lf-dm-herofade" />
            <button ref={closeRef} type="button" className="lf-dm-close" onClick={onClose} aria-label="Close">
              {phone ? <IcBack size={24} /> : <IcClose size={22} />}
            </button>
            {!phone && (
              <div className="lf-dm-herotext">
                <SeriesTag size={13} />
                <h2 className="lf-dm-title">{heading}</h2>
                <div className="lf-dm-actions">
                  <button type="button" className="lf-btn is-play" onClick={() => play(startEp)}>
                    <IcPlay size={26} /> {watched.size > 0 && isShowish ? "Resume" : "Play"}
                  </button>
                  <button type="button" className={`lf-circ is-lg${inList ? " is-on" : ""}`} onClick={() => toggleList(isShowish ? { kind: "show" } : t)} aria-label={inList ? "Remove from My List" : "Add to My List"}>
                    {inList ? <IcCheck size={22} /> : <IcPlus size={22} />}
                  </button>
                  <span className="lf-like">
                    <button type="button" className={`lf-circ is-lg${isLiked ? " is-on is-liked" : ""}`} onClick={like} aria-label="Love this">
                      <IcThumb size={20} />
                    </button>
                    {burst > 0 && <HeartBurst key={burst} />}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="lf-dm-body">
            {phone && (
              <>
                <div className="lf-dm-phtitle">
                  <SeriesTag size={11} />
                  <h2>{heading}</h2>
                </div>
                <div className="lf-meta">
                  <span className="lf-match">{d.match}% Match</span>
                  {data.metYear && <span>{data.metYear}</span>}
                  <span className="lf-mat">{data.rating}</span>
                  <span>{isShowish ? show.length : d.length}</span>
                  <span className="lf-hd">HD</span>
                </div>
                <button type="button" className="lf-btn is-play is-block" onClick={() => play(startEp)}>
                  <IcPlay size={22} /> {watched.size > 0 && isShowish ? "Resume" : "Play"}
                </button>
                <button type="button" className="lf-btn is-grey is-block" onClick={() => toast(`Downloaded to your heart. Available offline, forever.`, "⬇️")}>
                  <IcDownload size={20} /> Download S1:E{startEp + 1}
                </button>
              </>
            )}

            <div className="lf-dm-info">
              <div className="lf-dm-left">
                {!phone && (
                  <div className="lf-meta">
                    <span className="lf-match">{d.match}% Match</span>
                    {data.metYear && <span>{data.metYear}</span>}
                    <span>{isShowish ? show.length : d.length}</span>
                    <span className="lf-hd">HD</span>
                    <span className="lf-hd">AD</span>
                  </div>
                )}
                {!phone && (
                  <div className="lf-meta">
                    <span className="lf-mat">{data.rating}</span>
                    <span className="lf-dim">{data.ratingReason}</span>
                  </div>
                )}
                {(isShowish || t.kind === "reason") && (
                  <div className="lf-dm-rank">
                    <Top10Chip size={24} />
                    <b>#1 in {data.recipientName ? `${data.recipientName}'s` : "Your"} Heart Today</b>
                  </div>
                )}
                {t.kind === "episode" && (
                  <p className="lf-dm-epline">
                    <b>S1:E{t.index + 1} “{d.title}”</b>
                  </p>
                )}
                <p className="lf-dm-syn1">{t.kind === "episode" ? d.synopsis : isShowish ? data.tagline : d.synopsis}</p>
              </div>
              <div className="lf-dm-right">
                <p><span>Cast:</span> {castNames.join(", ")}{castNames.length ? ", " : ""}<i>more</i></p>
                <p><span>Genres:</span> {(isShowish ? data.genres : d.tags).join(", ")}</p>
                <p><span>This show is:</span> {moods.join(", ")}</p>
              </div>
            </div>

            {phone && (
              <div className="lf-dm-phacts">
                <button type="button" onClick={() => toggleList(isShowish ? { kind: "show" } : t)}>
                  {inList ? <IcCheck size={24} /> : <IcPlus size={24} />}
                  <span>My List</span>
                </button>
                <span className="lf-like">
                  <button type="button" onClick={like} className={isLiked ? "is-liked" : ""}>
                    <IcThumb size={22} />
                    <span>{isLiked ? "Loved" : "Rate"}</span>
                  </button>
                  {burst > 0 && <HeartBurst key={burst} />}
                </span>
                <button type="button" onClick={() => toast("Shared with exactly one person: you", "💌")}>
                  <IcShare size={22} />
                  <span>Share</span>
                </button>
              </div>
            )}

            {phone ? (
              <>
                <div className="lf-dm-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={tab === "eps"} className={tab === "eps" ? "is-on" : ""} onClick={() => setTab("eps")}>
                    {t.kind === "reason" ? "Top 10" : "Episodes"}
                  </button>
                  <button type="button" role="tab" aria-selected={tab === "more"} className={tab === "more" ? "is-on" : ""} onClick={() => setTab("more")}>
                    More Like This
                  </button>
                </div>
                {tab === "eps" ? episodes : moreLike}
              </>
            ) : (
              <>
                {(isShowish || t.kind === "reason") && episodes}
                {moreLike}
              </>
            )}

            <section className="lf-dm-about">
              <h3>
                About <b>{heading}</b>
              </h3>
              <p><span>Creator:</span> {data.senderName || "someone who loves you"}</p>
              <p><span>Cast:</span> {castNames.join(", ")}</p>
              <p><span>Genres:</span> {data.genres.join(", ") || "Romantic"}</p>
              <p><span>This show is:</span> {moods.join(", ")}</p>
              <p className="lf-dm-matline">
                <span>Maturity rating:</span> <span className="lf-mat">{data.rating}</span> {data.ratingReason}
                {data.ratingReason ? "." : ""} Recommended for {data.recipientName || "you"} only.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
