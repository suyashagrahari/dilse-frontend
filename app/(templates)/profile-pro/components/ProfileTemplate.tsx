"use client";

// ─── Endorsements — the composer ─────────────────────────────────────────────
//
// A relationship rendered as a professional profile, cloned down to the seams:
// the app on phones (top bar, five tabs), the web on tablets and desktops
// (global nav, main column, right rail). The recipient is looking at THEIR OWN
// profile, which is why they see Analytics ("private to you"), "Open to" and a
// notification badge that is all one person.
//
// The main letter is the sender's recommendation. It waits in the corner as a
// message notification (LetterPop, variant "profile"), and every door on the
// page that could plausibly hold a message opens it: the Messaging icon, the
// Message button, the locked recommendation, the "hiring" ad.
//
// ── THE QUEUE IS THE SENDER'S, AND ONLY THE SENDER'S ──
// `shareId` is only passed on the sender's own editor view. The published
// viewer never passes it, so the recipient never sees pending contributions.
// ── PENDING NEVER REACHES THE PAGE ──
// Recommendations renders `status === "published"` only.

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import LetterPop from "../../_love/LetterPop";
import { EndorsementQueue } from "./EndorsementQueue";
import { MobileTop, NotifPanel, TabBar, WebNav, type Notif } from "./Chrome";
import { TopCard } from "./TopCard";
import {
  About,
  Activity,
  Analytics,
  Certifications,
  Education,
  Experience,
  Featured,
  Interests,
  Languages,
  People,
  PhotoViewer,
  RailExtras,
  Recommendations,
  Skills,
} from "./Sections";
import { firstName, peopleOf } from "./data";
import { Mark } from "./Icons";
import { PROFILE_CSS } from "./styles";
import { LI } from "./theme";
import { useMedia } from "./ui";
import type { ProfileProData } from "./types";

export function ProfileTemplate(props: {
  data: ProfileProData;
  shareId?: string;
  /** Hide the corner letter (while an editor sheet covers the page). */
  hideLetter?: boolean;
  /** Skip the skeleton beat (editor previews re-mount on every save). */
  instant?: boolean;
}): JSX.Element {
  const { data: d, shareId, hideLetter, instant } = props;
  const phone = useMedia("(max-width: 767px)");
  const desk = useMedia("(min-width: 768px)");

  const [ready, setReady] = useState(!!instant);
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 650);
    return () => window.clearTimeout(t);
  }, [ready]);

  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastT = useRef<number | null>(null);
  const onToast = useCallback((text: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast({ id: Date.now(), text });
    toastT.current = window.setTimeout(() => setToast(null), 3400);
  }, []);
  useEffect(() => () => { if (toastT.current) window.clearTimeout(toastT.current); }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(5);
  const [msgCount, setMsgCount] = useState(1);
  const [viewer, setViewer] = useState<number | null>(null);

  const hasLetter = !!d.letter.trim();
  const [kick, setKick] = useState(false);
  const openLetter = useCallback(() => {
    setMsgCount(0);
    if (!hasLetter) {
      onToast(`No new messages. ${d.senderName || "They"} says it in person.`);
      return;
    }
    setKick(true);
    window.setTimeout(() => setKick(false), 80);
  }, [hasLetter, onToast, d.senderName]);

  const people = useMemo(() => peopleOf(d), [d]);
  const names = useMemo(() => people.map((p) => p.name), [people]);
  const sender = d.senderName.trim() || "Someone";
  const her = firstName(d.person.name) || "you";

  const notifs = useMemo<Notif[]>(() => {
    const s0 = d.skills[0]?.label || "being wonderful";
    const post = d.posts[0]?.text.split(/\n/)[0].slice(0, 70) || "your post";
    const company = d.experience[0]?.company;
    return [
      { id: "n1", who: sender, kind: "endorse", ago: "2m", text: <><b>{sender}</b> endorsed you for <b>{s0}</b>. And then for everything else.</> },
      { id: "n2", who: sender, kind: "view", ago: "14m", text: <><b>{sender}</b> viewed your profile. <span className="pf-dim">1,247 times this week.</span></> },
      { id: "n3", who: sender, kind: "react", ago: "1h", text: <><b>{sender}</b> reacted ❤️ to your post: “{post}…”</> },
      { id: "n4", who: "", kind: "search", ago: "3h", text: <>You appeared in <b>1 search</b> this week. Keyword: <b>“the one”</b>.</> },
      { id: "n5", who: sender, kind: "anniv", ago: "1d", text: <>Celebrate <b>{her}</b>&apos;s work anniversary{company ? <> at <b>{company}</b></> : null}. Say congrats 🎉</> },
    ];
  }, [d.skills, d.posts, d.experience, sender, her]);

  const chrome = {
    name: d.person.name,
    photo: { url: d.person.photoUrl, x: d.person.photoCropX, y: d.person.photoCropY, scale: d.person.photoScale },
    notifCount,
    msgCount,
    searches: [`${sender.toLowerCase()} + ${her.toLowerCase()}`, "how to win every argument", "fan speed 3 vs 4"],
    onNotifs: () => { setNotifOpen(true); setNotifCount(0); },
    onMessages: openLetter,
    onToast,
  };

  const half = Math.ceil(people.length / 2);

  return (
    <div className="pf-root">
      <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }} />
      <WebNav {...chrome} />
      <MobileTop {...chrome} />

      <div className="pf-shell">
        <main className="pf-main">
          {!ready ? (
            <>
              <div className="pf-skel" aria-busy="true" aria-label="Loading profile">
                <i className="pf-skelCover" />
                <i className="pf-skelDot" />
                <i style={{ width: "46%", height: 20 }} />
                <i style={{ width: "78%" }} />
                <i style={{ width: "34%" }} />
              </div>
              <div className="pf-skel"><i style={{ width: "30%", height: 18 }} /><i /><i style={{ width: "86%" }} /><i style={{ width: "64%" }} /></div>
            </>
          ) : (
            <>
              <TopCard d={d} people={names} onMessage={openLetter} onToast={onToast} />
              <Analytics d={d} onToast={onToast} />
              <About about={d.about} skills={d.skills} onToast={onToast} />
              <Featured photos={d.photos} onOpen={setViewer} />
              <Activity d={d} people={names} onToast={onToast} />
              <Experience d={d} />
              <Education items={d.education} skills={d.skills} />
              <Certifications d={d} onToast={onToast} />
              <Skills d={d} onToast={onToast} />
              <Recommendations d={d} hasLetter={hasLetter} onLetter={openLetter} />
              <Languages items={d.languages} />
              <Interests d={d} onToast={onToast} />
              {shareId ? <EndorsementQueue shareId={shareId} /> : null}
            </>
          )}
        </main>

        {ready && (
          <aside className="pf-aside" aria-label="More">
            <RailExtras d={d} onLetter={openLetter} onToast={onToast} />
            <People title="People also viewed" people={people.slice(0, half)} sender={sender} onMessage={openLetter} onToast={onToast} />
            {people.length > 1 && <People title="People you may know" people={people.slice(half)} onToast={onToast} />}
            <footer className="pf-foot">
              <span>About</span><span>Accessibility</span><span>Help Center</span><span>Privacy &amp; Terms</span>
              <br />
              <b><Mark size={16} /> Endorsements</b> <span>made with 💙 on SubhSandesh © 2026</span>
            </footer>
          </aside>
        )}
      </div>

      <TabBar {...chrome} />

      {notifOpen && <NotifPanel items={notifs} desktop={desk} onClose={() => setNotifOpen(false)} />}
      {viewer !== null && d.photos.length > 0 && (
        <PhotoViewer photos={d.photos} index={viewer} name={d.person.name} sender={sender} onClose={() => setViewer(null)} onIndex={setViewer} />
      )}

      {toast && (
        <div key={toast.id} className="pf-toast" role="status" aria-live="polite">
          <span className="pf-toastIc" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M12.57 2H15L6 14 1 8.6l1.6-1.6L6 10.5z" /></svg>
          </span>
          <p>{toast.text}</p>
          <button type="button" className="pf-iconBtn" aria-label="Dismiss" onClick={() => setToast(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.42 12L20 18.58 18.58 20 12 13.42 5.42 20 4 18.58 10.58 12 4 5.42 5.42 4 12 10.58 18.58 4 20 5.42z" /></svg>
          </button>
        </div>
      )}

      {hasLetter && !hideLetter && ready && (
        <LetterPop
          letter={d.letter}
          from={d.senderName.trim() || undefined}
          to={her}
          question={d.lockQuestion}
          answer={d.lockAnswer.trim() || "Accept 💙"}
          accent={LI.blue}
          accent2={LI.pink}
          paper="#FFFFFF"
          ink="#191919"
          bottom={phone ? 68 : 20}
          delay={2000}
          teaser={`${sender} wrote you a recommendation ✍️`}
          sign="Recommended, without reservation,"
          variant="profile"
          photos={d.photos.map((p) => p.url)}
          avatar={d.person.photoUrl || undefined}
          title={d.person.headline}
          forceOpen={kick}
          onOpened={() => setMsgCount(0)}
          zIndex={100}
        />
      )}
    </div>
  );
}

export default ProfileTemplate;
