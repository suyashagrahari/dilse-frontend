"use client";

// ─── AppTemplate — the composer ──────────────────────────────────────────────
//
// Assembles the listing and owns its little bits of state: the GET pill's
// install run, the pushed Version History page, review sheets, the island
// toast, heart bursts, the "Tap to Rate" stars and the corner letter. Nothing
// here fetches and nothing reads storage.
//
// ── THREE LAYOUTS, ONE TREE ──────────────────────────────────────────────────
// Phone gets the nav bar + bottom tab bar; tablet the floating pill tabs;
// desktop the sidebar. All of it is CSS (listing/css.ts) — the markup is the
// same at every width, so nothing reflows through React on resize.
//
// ── THE INSTALL ──────────────────────────────────────────────────────────────
// GET → a spinner ring (authorising) → a progress ring with a stop square →
// OPEN. Guarded on `idle` so repeated taps never race. OPEN opens the letter.
//
// ── THE RATING IS DERIVED, NEVER TRUSTED ─────────────────────────────────────
// Average and histogram are recomputed from the PUBLISHED reviews printed under
// them; `count` stays the sender's label ("8,472").

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import LetterPop from "../../_love/LetterPop";
import { AP } from "./theme";
import { LISTING_CSS } from "./listing/css";
import { Bursts, Toast, haptic, type Burst, type GetState } from "./listing/parts";
import {
  AlsoLike,
  Description,
  Facts,
  Header,
  Information,
  Preview,
  Privacy,
  Ratings,
  Supports,
  WhatsNew,
} from "./listing/sections";
import { NavBar, Sidebar, TabBar } from "./listing/chrome";
import { AllReviewsSheet, ReviewSheet, VersionHistoryPage } from "./listing/sheets";
import { ReviewQueue } from "./ReviewQueue";
import { aggregateOf, publishedReviews } from "./demo";
import type { AppData, AppRating, AppReview, AppVersion } from "./types";

const WAIT_MS = 750;
const LOAD_MS = 1900;

function useWide(query: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return on;
}

export function AppTemplate({
  data,
  shareId,
  capture = false,
  chromeTop = 0,
  live = false,
}: {
  /** The published page a recipient opened: shows the brand pill + "make yours". */
  live?: boolean;
  data: AppData;
  /** Present only on the sender's own view. Gates the moderation queue. */
  shareId?: string;
  /** True while a PNG is being taken: no animation, no chrome, no panels. */
  capture?: boolean;
  /** Space reserved above the listing for the editor's floating bar. */
  chromeTop?: number;
}) {
  const [get, setGet] = useState<GetState>("idle");
  const [solid, setSolid] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [allReviews, setAllReviews] = useState(false);
  const [review, setReview] = useState<AppReview | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [myStars, setMyStars] = useState(0);
  const [boop, setBoop] = useState(false);
  const [letterForce, setLetterForce] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const iconTaps = useRef(0);
  const getRef = useRef<HTMLDivElement>(null);
  const tablet = useWide("(min-width: 740px)");
  const desktop = useWide("(min-width: 1180px)");

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t);
      timers.current = [];
    },
    []
  );

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const say = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  useEffect(() => () => void (toastTimer.current && clearTimeout(toastTimer.current)), []);

  const burst = useCallback(
    (x: number, y: number, n = 12) => {
      const id = Date.now() + Math.floor(x);
      setBursts((b) => [...b.slice(-3), { id, x, y, n }]);
      later(() => setBursts((b) => b.filter((z) => z.id !== id)), 1400);
    },
    [later]
  );

  const burstFrom = useCallback(
    (el: Element | null, n?: number) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, n);
    },
    [burst]
  );

  // The nav bar turns solid and shows the mini icon + GET once the header's
  // GET row has scrolled under it.
  useEffect(() => {
    const el = getRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setSolid(!e.isIntersecting && e.boundingClientRect.top < 80 + chromeTop),
      { rootMargin: `-${60 + chromeTop}px 0px 0px 0px`, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chromeTop]);

  const hasLetter = !!data.letter?.trim();
  // A letter that already opens with its own greeting ("Riyu," / "Hey you!")
  // must not get a second "Dear Meera," stacked on top of it.
  const firstLine = (data.letter ?? "").trim().split("\n")[0]?.trim() ?? "";
  const ownGreeting = firstLine.length > 0 && firstLine.length <= 36 && /[,!:]$/.test(firstLine);

  const openLetter = useCallback(() => {
    setLetterForce(true);
    later(() => setLetterForce(false), 60);
  }, [later]);

  const onGet = useCallback(() => {
    if (get === "done") {
      haptic(6);
      if (hasLetter) openLetter();
      else say(`Already open. ${data.app.name || "She"} has been open the whole time.`);
      return;
    }
    if (get !== "idle") return;
    haptic(10);
    setGet("wait");
    later(() => setGet("load"), WAIT_MS);
    later(() => {
      setGet("done");
      haptic([10, 50, 14]);
      burstFrom(getRef.current?.querySelector(".al-get") ?? null, 16);
      say(hasLetter ? `${data.app.name || "She"} is installed. Tap OPEN — something’s inside.` : "Installed. No uninstall option.");
    }, WAIT_MS + LOAD_MS);
  }, [get, hasLetter, openLetter, say, later, burstFrom, data.app.name]);

  const onIcon = useCallback(() => {
    iconTaps.current += 1;
    setBoop(false);
    requestAnimationFrame(() => setBoop(true));
    later(() => setBoop(false), 520);
    haptic(6);
    const icon = document.querySelector(".al-head .al-icon");
    if (iconTaps.current % 5 === 0) {
      burstFrom(icon, 22);
      say(`Easter egg: ${data.app.seller.trim() || "someone"} has been in love since version 1.0 💗`);
    } else {
      burstFrom(icon, 5);
    }
  }, [burstFrom, say, later, data.app.seller]);

  const onShare = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = `${data.app.name} — ${data.app.subtitle}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    window.navigator.clipboard
      ?.writeText(url)
      .then(() => say("Link copied."))
      .catch(() => say("Copy the address bar — that’s the link."));
  }, [data.app.name, data.app.subtitle, say]);

  const onRate = useCallback(
    (n: number, e: React.MouseEvent) => {
      setMyStars(n);
      haptic(8);
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      burst(r.left + r.width / 2, r.top, n === 5 ? 16 : 6);
      say(n === 5 ? "Thank you for your feedback. She’s a five. Always was." : "Thank you for your feedback. (It’s a 5. We fixed it.)");
      if (n < 5) later(() => setMyStars(5), 900);
    },
    [burst, say, later]
  );

  const published = useMemo(() => publishedReviews(data), [data]);

  const rating: AppRating = useMemo(() => {
    if (published.length === 0) return { average: 0, count: "", distribution: [0, 0, 0, 0, 0] };
    const agg = aggregateOf(published);
    return { average: agg.average, count: data.rating.count || String(agg.count), distribution: agg.distribution };
  }, [published, data.rating.count]);

  const latest: AppVersion | null = useMemo(() => {
    const v = data.versionHistory[0];
    if (v) return v;
    const w = data.whatsNew;
    return w.version ? { version: w.version, date: w.date, size: "", notes: w.notes } : null;
  }, [data.versionHistory, data.whatsNew]);

  const tab = useCallback(
    (label: string) => {
      haptic(5);
      const her = data.app.name || "her";
      const lines: Record<string, string> = {
        Today: `Today’s pick: ${her}. Tomorrow’s too.`,
        Us: "Coming soon: the two of you, in one app.",
        Apps: "You’re already on the best one.",
        Dates: "Next date: whenever you say yes.",
        Search: `Searched everywhere. Only found ${her}.`,
        Discover: `Discovered: ${her}. Search complete.`,
        Create: "Built with love. Mostly love, some caffeine.",
        Play: "Now playing: your song.",
        "Our Songs": "212 songs. All of them remind me of you.",
        Updates: `1 update available: ${data.app.seller.trim() || "he"} loves you more today.`,
        Purchased: "Purchased: one heart. Non-refundable.",
      };
      say(lines[label] ?? "You’re exactly where you should be.");
    },
    [data.app.name, data.app.seller, say]
  );

  const rootStyle = { "--al-top": `${chromeTop}px` } as CSSProperties;

  return (
    <div className={`al-root${capture ? " al-still" : ""}`} style={rootStyle}>
      <style>{LISTING_CSS}</style>

      {!capture ? <Sidebar data={data} onItem={tab} /> : null}

      <div className="al-main">
        {chromeTop > 0 ? <div style={{ height: chromeTop }} aria-hidden="true" /> : null}
        {!capture ? (
          <NavBar data={data} solid={solid} get={get} onGet={onGet} onBack={() => tab("Today")} onTab={tab} brand={live} />
        ) : null}

        <main className="al-content">
          <Header
            data={data}
            rating={rating}
            get={get}
            onGet={onGet}
            onShare={onShare}
            onIcon={onIcon}
            iconBoop={boop}
            getRef={getRef}
            onDeveloper={() => say(`More by ${data.app.developer}: nothing. They only ever made one.`)}
          />
          <Facts data={data} rating={rating} />
          <WhatsNew latest={latest} onHistory={() => setHistoryOpen(true)} />
          <Preview data={data} />
          <Description data={data} onDeveloper={() => say(`More by ${data.app.developer}: nothing. They only ever made one.`)} />
          <Ratings
            rating={rating}
            reviews={published}
            onOpenReview={setReview}
            onSeeAll={() => setAllReviews(true)}
            myStars={myStars}
            onRate={onRate}
            onWrite={() => say("Reviews come from her friends. Ask whoever sent you this for the link.")}
            onSupport={() => say(`Support hours: 24/7. Response time: instant. Agent: ${data.app.seller.trim() || "him"}.`)}
          />
          <Privacy data={data} onDetails={() => say("Details: it’s all stored in one heart. Encrypted. No backups needed.")} />
          <Supports data={data} />
          <Information
            data={data}
            onLink={(w) =>
              say(w === "site" ? "The website is her smile. It’s always up." : "Privacy policy: whatever she says goes.")
            }
          />
          <AlsoLike data={data} onPick={say} />

          {shareId && !capture ? (
            <div style={{ padding: "8px var(--al-g) 0" }}>
              <ReviewQueue shareId={shareId} />
            </div>
          ) : null}

          <p className="al-foot">
            {data.app.name} is a one-of-a-kind build. Not available in any other store, country or universe.
            {live ? (
              <>
                <br />
                <Link href="/app">Publish your person as an app →</Link>
              </>
            ) : null}
          </p>
        </main>
      </div>

      {!capture ? <TabBar onTab={tab} /> : null}

      {historyOpen && !capture ? (
        <VersionHistoryPage versions={data.versionHistory} onClose={() => setHistoryOpen(false)} />
      ) : null}
      {allReviews && !review && !capture ? (
        <AllReviewsSheet reviews={published} onOpen={setReview} onClose={() => setAllReviews(false)} />
      ) : null}
      {review && !capture ? <ReviewSheet review={review} name={data.app.name} onClose={() => setReview(null)} /> : null}

      {toast && !capture ? <Toast key={toast.id} text={toast.text} /> : null}
      {!capture ? <Bursts bursts={bursts} /> : null}

      {hasLetter && !capture ? (
        <LetterPop
          letter={data.letter}
          from={data.app.seller.trim() || undefined}
          to={ownGreeting ? undefined : data.app.name.trim() || undefined}
          question={data.lockQuestion?.trim() || undefined}
          answer={data.lockAnswer?.trim() || undefined}
          accent={AP.accent}
          accent2="#FF8A65"
          paper="#FFFBF8"
          ink="#1C1C1E"
          bottom={tablet ? 24 : 70}
          right={desktop ? 28 : 16}
          teaser="1 unread letter 💌"
          sign="yours, every version,"
          forceOpen={letterForce}
          zIndex={90}
          variant="app"
          avatar={data.app.iconUrl || undefined}
          title={data.app.name.trim() || undefined}
          photos={data.screenshots.map((s) => s.imageUrl)}
        />
      ) : null}
    </div>
  );
}

export default AppTemplate;
