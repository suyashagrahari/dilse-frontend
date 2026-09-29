"use client";

// ─── Searched — the template ─────────────────────────────────────────────────
//
// Two screens, exactly like the real thing: the doodle home page and the
// results page (seven tabs). Everything that floats — the image panel, the
// video player, the page behind a result, toasts and the letter — lives here.
// "I'm Feeling Lucky" is the shortcut to the letter: the #1 result, opened
// full screen by LetterPop's "searched" reveal.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LetterPop from "../../_love/LetterPop";
import Home from "./Home";
import Results from "./Results";
import { ImageViewer, SitePage, Toast, VideoModal } from "./Overlays";
import { CSS } from "./styles";
import { normaliseSearchData } from "./coerce";
import { firstNameOf, type SearchData, type Tab } from "./types";

export interface SearchedTemplateProps {
  data: SearchData;
  mode: "demo" | "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** The editor hides the letter while its own sheets are open. */
  hideLetter?: boolean;
}

function useWidth() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

export default function SearchedTemplate({ data: raw, mode, hideLetter }: SearchedTemplateProps) {
  // Idempotent — also turns any AI pipe-strings still in a live form into rows.
  const data = useMemo(() => normaliseSearchData(raw), [raw]);
  const width = useWidth();
  const narrow = width < 760;
  const wide = width >= 1100;

  const [screen, setScreen] = useState<"home" | "results">("home");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [dark, setDark] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const [video, setVideo] = useState<number | null>(null);
  const [site, setSite] = useState<{ kind: "result" | "story"; i: number } | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [openLetter, setOpenLetter] = useState(false);
  const toastTimer = useRef(0);

  useEffect(() => {
    const apply = () => {
      setDark(!!window.matchMedia?.("(prefers-color-scheme: dark)").matches);
      setReduce(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    };
    apply();
  }, []);

  const pushToast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), msg });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const toTop = useCallback(() => window.scrollTo({ top: 0 }), []);

  const search = useCallback(
    (q: string) => {
      setQuery(q.trim() || data.recipient.name);
      setTab("all");
      setScreen("results");
      toTop();
    },
    [data.recipient.name, toTop],
  );

  const goTab = useCallback(
    (t: Tab) => {
      setTab(t);
      setScreen("results");
      setQuery((cur) => cur || data.recipient.name);
      toTop();
    },
    [data.recipient.name, toTop],
  );

  const hasLetter = !!data.letter.trim();
  const letterNow = useCallback(() => {
    if (!hasLetter) {
      search(data.recipient.name);
      return;
    }
    setOpenLetter(true);
  }, [hasLetter, search, data.recipient.name]);
  useEffect(() => {
    if (!openLetter) return;
    const id = window.setTimeout(() => setOpenLetter(false), 60);
    return () => window.clearTimeout(id);
  }, [openLetter]);

  const toggleDark = useCallback(() => setDark((d) => !d), []);
  const from = firstNameOf(data.sender.name);
  const siteResult = site?.kind === "result" ? data.results[site.i] : undefined;
  const siteStory = site?.kind === "story" ? data.topStories[site.i] : undefined;
  const photoAt = (i: number) => (data.photos.length ? data.photos[i % data.photos.length] : undefined);

  return (
    <div className={`sr${dark ? " is-dark" : ""}${reduce ? " is-reduced" : ""}`} data-mode={mode}>
      <style>{CSS}</style>

      {screen === "home" ? (
        <Home
          data={data}
          narrow={narrow}
          autoType={width > 0}
          autoSubmit={mode === "demo"}
          reduce={reduce}
          dark={dark}
          onSearch={search}
          onLucky={letterNow}
          onTab={goTab}
          onLetter={letterNow}
          onDark={toggleDark}
          onToast={pushToast}
        />
      ) : (
        <Results
          data={data}
          query={query}
          tab={tab}
          narrow={narrow}
          wide={wide}
          reduce={reduce}
          dark={dark}
          onSearch={search}
          onTab={goTab}
          onHome={() => {
            setScreen("home");
            toTop();
          }}
          onLetter={letterNow}
          onDark={toggleDark}
          onToast={pushToast}
          onPhoto={(i) => data.photos.length && setPhoto(i % data.photos.length)}
          onVideo={setVideo}
          onResult={(i) => setSite({ kind: "result", i })}
          onStory={(i) => setSite({ kind: "story", i })}
        />
      )}

      {photo !== null && data.photos[photo] && (
        <ImageViewer photos={data.photos} index={photo} onIndex={setPhoto} onClose={() => setPhoto(null)} name={data.recipient.name} />
      )}
      {video !== null && data.videos[video] && (
        <VideoModal video={data.videos[video]} photo={photoAt(video + 2)} reduce={reduce} onClose={() => setVideo(null)} />
      )}
      {site && (siteResult || siteStory) && (
        <SitePage
          result={siteResult}
          story={siteStory}
          photo={photoAt((site.i + (site.kind === "story" ? 1 : 0)) % Math.max(1, data.photos.length))}
          name={data.recipient.name}
          sender={data.sender.name}
          onClose={() => setSite(null)}
        />
      )}

      {toast && <Toast key={toast.id} msg={toast.msg} />}

      {hasLetter && !hideLetter && (
        <LetterPop
          letter={data.letter}
          from={data.sender.name}
          to={firstNameOf(data.recipient.name) || undefined}
          question={data.lockQuestion.trim() || undefined}
          answer={data.lockAnswer.trim() || "Accept all 💗"}
          accent="#E8445E"
          accent2="#3F76EE"
          paper="#ffffff"
          ink="#1f1f1f"
          bottom={narrow ? 18 : 24}
          right={narrow ? 14 : 24}
          delay={screen === "home" ? 4200 : 1800}
          teaser={`top result: a letter${from ? ` from ${from}` : ""} 💌`}
          sign="yours, in every search,"
          variant="searched"
          photos={data.photos.map((p) => p.url)}
          avatar={data.photos[0]?.url}
          title="Searched"
          forceOpen={openLetter}
          zIndex={95}
        />
      )}
    </div>
  );
}
