// ─── The results page ────────────────────────────────────────────────────────
//
// Phone: logo row, full-width box, scrolling tabs, then one column where the
// entity header sits on top and modules interleave with results. Desktop: the
// wordmark and box share a row, results run in a 652px column 180px from the
// left edge, and the knowledge panel owns the right column.

import { useEffect, useRef, useState } from "react";
import { AccountButton, AppsButton } from "./HeaderBits";
import { Wordmark } from "./Doodle";
import { CloseIcon, FlaskIcon, GearIcon, LensIcon, MicIcon, SearchIcon, Sparkle, StarIcon } from "./icons";
import {
  AiOverview,
  ImagesPack,
  KnowledgePanel,
  LocalPack,
  Pager,
  PeopleAlsoAsk,
  Pic,
  Related,
  ResultRow,
  Stars,
  TopStories,
  Videos,
  Fav,
} from "./Sections";
import { firstNameOf, TABS, type SearchData, type Tab } from "./types";

export interface ResultsProps {
  data: SearchData;
  query: string;
  tab: Tab;
  narrow: boolean;
  wide: boolean;
  reduce: boolean;
  dark: boolean;
  onSearch: (q: string) => void;
  onTab: (t: Tab) => void;
  onHome: () => void;
  onLetter: () => void;
  onDark: () => void;
  onToast: (m: string) => void;
  onPhoto: (i: number) => void;
  onVideo: (i: number) => void;
  onResult: (i: number) => void;
  onStory: (i: number) => void;
}

export default function Results(p: ResultsProps) {
  const { data, narrow, wide } = p;
  const name = data.recipient.name.trim() || "You";
  const first = firstNameOf(name) || "you";
  const [q, setQ] = useState(p.query);
  const [apps, setApps] = useState(false);
  const [acct, setAcct] = useState(false);
  const [gear, setGear] = useState(false);
  const [page, setPage] = useState(1);
  const tabsRef = useRef<HTMLDivElement>(null);

  const [lastQuery, setLastQuery] = useState(p.query);
  if (lastQuery !== p.query) {
    setLastQuery(p.query);
    setQ(p.query);
  }
  useEffect(() => {
    tabsRef.current?.querySelector(".is-on")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [p.tab]);

  const setPageTop = (n: number) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: p.reduce ? "auto" : "smooth" });
  };

  const aboutQuery = p.query.toLowerCase().includes(first.toLowerCase());
  const results = data.results;
  const photos = data.photos;
  const photoAt = (i: number) => (photos.length ? photos[i % photos.length] : undefined);

  // The modules, interleaved the way a real page interleaves them.
  const allColumn = (
    <>
      <p className="srCount">About {data.resultCount} results ({data.searchSeconds || "0.42"} seconds)</p>
      {page > 1 && (
        <div className="srNote srIn">
          <b>Page {page}.</b> Still only {first}. It&apos;s always going to be {first}.
        </div>
      )}
      {!aboutQuery && (
        <p className="srDym srIn">
          Showing results for <button type="button" onClick={() => p.onSearch(name)}><b><i>{name}</i></b></button>
          <br />
          <small>Search instead for {p.query} — we checked, it&apos;s the same thing.</small>
        </p>
      )}
      {aboutQuery && data.didYouMean && (
        <p className="srDym">
          Did you mean:{" "}
          <button type="button" onClick={() => p.onSearch(data.didYouMean)}>
            <b><i>{data.didYouMean}</i></b>
          </button>
        </p>
      )}
      {!wide && <KnowledgePanel data={data} variant="top" onPhoto={p.onPhoto} onSearch={p.onSearch} onToast={p.onToast} />}
      <AiOverview data={data} reduce={p.reduce} onPhoto={p.onPhoto} key={`aio-${p.query}-${page}`} />
      {results.slice(0, 2).map((r, i) => (
        <ResultRow key={r.id + i} r={r} i={i} name={name} photo={i === 1 ? photoAt(1) : undefined} onOpen={() => p.onResult(i)} />
      ))}
      <PeopleAlsoAsk items={data.paa} name={name} onSearch={p.onSearch} />
      <ImagesPack photos={photos} name={name} onPhoto={p.onPhoto} onMore={() => p.onTab("images")} />
      {results.slice(2, 3).map((r, i) => (
        <ResultRow key={r.id + "b"} r={r} i={i} name={name} onOpen={() => p.onResult(2)} />
      ))}
      <TopStories stories={data.topStories} photos={photos} onOpen={p.onStory} />
      {!wide && <KnowledgePanel data={data} variant="about" onPhoto={p.onPhoto} onSearch={p.onSearch} onToast={p.onToast} />}
      {results.slice(3, 4).map((r, i) => (
        <ResultRow key={r.id + "c"} r={r} i={i} name={name} photo={photoAt(4)} onOpen={() => p.onResult(3)} />
      ))}
      <Videos videos={data.videos} photos={photos} onPlay={p.onVideo} />
      {results.slice(4, 5).map((r, i) => (
        <ResultRow key={r.id + "d"} r={r} i={i} name={name} onOpen={() => p.onResult(4)} />
      ))}
      <LocalPack places={data.places} photos={photos} name={name} />
      {results.slice(5).map((r, i) => (
        <ResultRow key={r.id + "e" + i} r={r} i={i} name={name} onOpen={() => p.onResult(5 + i)} />
      ))}
      <Related items={data.relatedSearches} onSearch={p.onSearch} />
      <Pager name={name} page={page} setPage={setPageTop} />
    </>
  );

  let body: React.ReactNode;
  if (p.tab === "all") {
    body = (
      <div className="srCols">
        <div className="srMain">{allColumn}</div>
        {wide && (
          <aside className="srSide">
            <KnowledgePanel data={data} variant="side" onPhoto={p.onPhoto} onSearch={p.onSearch} onToast={p.onToast} />
          </aside>
        )}
      </div>
    );
  } else if (p.tab === "ai") {
    body = (
      <div className="srCols">
        <div className="srMain srAiMode">
          <div className="srAiQ srIn">{p.query || name}</div>
          <AiOverview data={data} reduce={p.reduce} full onPhoto={p.onPhoto} key={`aim-${p.query}`} />
          <div className="srAiFollow">
            {data.relatedSearches.slice(0, 4).map((s, i) => (
              <button key={i} type="button" className="srAiChipQ" onClick={() => p.onSearch(s)}>
                {s}
              </button>
            ))}
          </div>
          <button type="button" className="srAiAsk" onClick={() => p.onToast(`the answer is ${first}. it's always ${first}.`)}>
            <Sparkle size={18} id="srSpkAsk" /> Ask anything about {first}
          </button>
        </div>
      </div>
    );
  } else if (p.tab === "images") {
    body = (
      <div className="srGallery">
        <div className="srImgChips srScroller srGalChips">
          {["Cute", "Candid", "Date night", "Sunsets", "Us", "Blurry but iconic"].map((c, i) => (
            <button key={c} type="button" className="srChip" onClick={() => p.onPhoto(i % Math.max(1, photos.length))}>
              {photos.length > 0 && <Pic photo={photoAt(i)} className="srChipPic" />}
              {c}
            </button>
          ))}
        </div>
        {photos.length ? (
          <div className="srMasonry">
            {photos.map((ph, i) => (
              <button key={i} type="button" className="srMasItem srIn" style={{ animationDelay: `${i * 50}ms` }} onClick={() => p.onPhoto(i)}>
                <Pic photo={ph} className={`srMasPic h${i % 3}`} />
                <span className="srMasSite"><Fav label="memories" size={16} /> memories.love</span>
                <span className="srMasCap">{ph.caption || `${first} #${i + 1}`}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="srEmpty">No images. You&apos;ll have to remember.</p>
        )}
      </div>
    );
  } else if (p.tab === "videos") {
    body = (
      <div className="srCols">
        <div className="srMain">
          <p className="srCount">About {data.videos.length} results · all of them rewatched at 2 AM</p>
          {data.videos.length ? <Videos videos={data.videos} photos={photos} onPlay={p.onVideo} big /> : <p className="srEmpty">Nothing recorded. You had to be there.</p>}
        </div>
      </div>
    );
  } else if (p.tab === "news") {
    body = (
      <div className="srCols">
        <div className="srMain">
          <p className="srCount">Breaking: {first} is still the main character</p>
          {data.topStories.length ? <TopStories stories={data.topStories} photos={photos} onOpen={p.onStory} list /> : <p className="srEmpty">No news. We&apos;re private people.</p>}
        </div>
      </div>
    );
  } else if (p.tab === "maps") {
    body = (
      <div className="srMapsTab">
        {data.places.length ? <LocalPack places={data.places} photos={photos} name={name} full /> : <p className="srEmpty">No pins yet. Let&apos;s go somewhere.</p>}
      </div>
    );
  } else {
    body = (
      <div className="srShop">
        <p className="srCount">Shopping results for {name} · <b>0 in stock</b></p>
        <div className="srShopGrid">
          {(photos.length ? photos : [undefined, undefined, undefined]).slice(0, 6).map((ph, i) => (
            <button key={i} type="button" className="srShopCard srIn" style={{ animationDelay: `${i * 60}ms` }} onClick={() => p.onToast("sold out. permanently. taken. 💍")}>
              <Pic photo={ph} className="srShopPic" />
              <span className="srShopTx">
                <b>{ph?.caption ? `${first} — ${ph.caption}` : `${first}, limited edition`}</b>
                <span className="srShopPrice">Priceless</span>
                <span className="srShopRate">5.0 <Stars value={5} size={12} /> (∞)</span>
                <small>memories.love · <span className="srShopOos">Out of stock · Taken</span></small>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="srRes">
      <header className="srHead">
        <div className="srHeadRow">
          {narrow && (
            <button type="button" className="srIconBtn srLabs" aria-label="Search Labs" onClick={() => p.onToast("labs: experimenting with loving you more")}>
              <FlaskIcon size={22} />
            </button>
          )}
          <button type="button" className="srHeadWord" onClick={p.onHome} aria-label="Home">
            <Wordmark name={name} size={narrow ? 26 : 28} />
          </button>
          {!narrow && <SearchField q={q} setQ={setQ} onSubmit={() => p.onSearch(q)} onToast={p.onToast} onLens={() => p.onTab("images")} />}
          <div className="srHeadR">
            {!narrow && (
              <span className="srPopWrap">
                <button type="button" className="srIconBtn" aria-label="Quick settings" onClick={() => setGear(!gear)}>
                  <GearIcon size={22} />
                </button>
                {gear && (
                  <div className="srPop srGear" role="dialog" aria-label="Quick settings">
                    <p className="srGearH">Quick settings</p>
                    <button type="button" className="srGearRow" onClick={() => { p.onDark(); setGear(false); }}>
                      <span>Dark theme</span>
                      <span className={`srSwitch${p.dark ? " is-on" : ""}`} aria-hidden><i /></span>
                    </button>
                    <button type="button" className="srGearRow" onClick={() => { setGear(false); p.onToast("SafeSearch: on. your heart is safe here."); }}>
                      <span>SafeSearch</span>
                      <small>On (always)</small>
                    </button>
                    <button type="button" className="srGearRow" onClick={() => { setGear(false); p.onToast(`language: ${first}.`); }}>
                      <span>Language</span>
                      <small>{first}</small>
                    </button>
                  </div>
                )}
              </span>
            )}
            <AppsButton open={apps} setOpen={setApps} onTab={p.onTab} onLetter={p.onLetter} onDark={p.onDark} hasLetter={!!data.letter.trim()} />
            <AccountButton open={acct} setOpen={setAcct} name={name} sender={data.sender.name} photo={photos[0]} />
          </div>
        </div>
        {narrow && <SearchField q={q} setQ={setQ} onSubmit={() => p.onSearch(q)} onToast={p.onToast} onLens={() => p.onTab("images")} />}
        <div className="srTabsWrap">
          <div className="srTabs" ref={tabsRef} role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={p.tab === t.id}
                className={`srTab${p.tab === t.id ? " is-on" : ""}${t.id === "ai" ? " is-ai" : ""}`}
                onClick={() => p.onTab(t.id)}
              >
                {t.id === "ai" && <Sparkle size={16} id="srSpkTab" />}
                {t.label}
              </button>
            ))}
            {!narrow && (
              <button type="button" className="srTab srTools" onClick={() => p.onToast(`filter: any time — ${first} is timeless.`)}>
                Tools
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="srBody" key={p.tab}>{body}</div>

      <footer className="srResFoot">
        <div className="srResFootLoc">
          <span className="srDot" /> <b>In {firstNameOf(data.sender.name) || "someone"}&apos;s heart</b> · From your IP address · <button type="button" onClick={() => p.onToast("location can't be updated. it's permanent.")}>Update location</button>
        </div>
        <div className="srResFootLinks">
          <button type="button" onClick={() => p.onToast("help: just hug them.")}>Help</button>
          <button type="button" onClick={() => p.onToast("feedback noted: more of this person, please.")}>Send feedback</button>
          <button type="button" onClick={() => p.onToast("privacy: we have none. we share fries.")}>Privacy</button>
          <button type="button" onClick={() => p.onToast("terms: forever.")}>Terms</button>
          <button type="button" onClick={p.onDark}>{p.dark ? "Light theme" : "Dark theme"}</button>
        </div>
        <p className="srResFootStar"><StarIcon size={12} /> made with too much love</p>
      </footer>
    </div>
  );
}

function SearchField({ q, setQ, onSubmit, onToast, onLens }: { q: string; setQ: (v: string) => void; onSubmit: () => void; onToast: (m: string) => void; onLens: () => void }) {
  return (
    <form
      className="srHBox"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input className="srHBoxIn" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" autoComplete="off" spellCheck={false} enterKeyHint="search" />
      {q && (
        <button type="button" className="srBoxBtn srBoxClear" aria-label="Clear" onClick={() => setQ("")}>
          <CloseIcon size={22} />
        </button>
      )}
      <span className="srBoxSep" aria-hidden />
      <button type="button" className="srBoxBtn" aria-label="Search by voice" onClick={() => onToast("listening… you're humming their name again 🎙️")}>
        <MicIcon size={22} />
      </button>
      <button type="button" className="srBoxBtn" aria-label="Search by image" onClick={onLens}>
        <LensIcon size={22} />
      </button>
      <button type="submit" className="srBoxBtn srBoxGo" aria-label="Search">
        <SearchIcon size={22} />
      </button>
    </form>
  );
}
