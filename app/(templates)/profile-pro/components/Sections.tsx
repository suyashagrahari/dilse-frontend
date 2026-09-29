"use client";

// ─── Endorsements — the profile sections ─────────────────────────────────────
//
// Each section is the genre's, drawn straight: Analytics (private to you),
// About with "…see more" and Top skills, Featured (the memories, a carousel),
// Activity (posts with reactions, a long-press reaction picker and comments),
// Experience as a grouped timeline, Education, Licenses & certifications,
// Skills with one-tap endorse, Recommendations (the sender's is locked and
// opens the letter), Languages, Interests and the people cards.
//
// ── THE JOKE IS IN THE NUMBERS, SO THE SKILL ROWS ARE FLAT ──
// "Punctuality (2)" is drawn identically to "Being Right (47)". No colour ramp.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LovePhoto } from "../../_love/types";
import type { ProfileEducation, ProfileLanguage, ProfilePost, ProfileProData, ProfileSkill, Recommendation } from "./types";
import { firstName, groupExperience } from "./data";
import { Avatar } from "./Avatar";
import { Face, FaceStack, Pic, Section, SeeMore, ShowAll, Tile } from "./ui";
import {
  IArrowRt,
  ICheck,
  IChart,
  IChevL,
  IChevR,
  IClock,
  IComment,
  IDiamond,
  IExternal,
  IEye,
  ILikeOutline,
  ILock,
  IPersonAdd,
  IRepost,
  ISearchPeople,
  ISend,
  REACTIONS,
  ReactionDisc,
  type ReactionId,
} from "./Icons";

type Toast = (t: string) => void;

const hashOf = (s: string) => {
  let h = 5;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
};
const fmt = (n: number) => n.toLocaleString("en-IN");

/* ── Analytics ────────────────────────────────────────────────────────────── */

export function Analytics({ d, onToast }: { d: ProfileProData; onToast: Toast }) {
  const s = d.senderName.trim() || "someone";
  const views = 1000 + (hashOf(d.person.name + s) % 900);
  const imps = 2000 + (hashOf(d.posts.map((p) => p.text).join("")) % 7000);
  const rows = [
    { ic: <IEye size={24} />, n: `${fmt(views)} profile views`, sub: `Discover who's viewed your profile. (It's ${s}. Every day.)`, t: `${s} viewed your profile ${fmt(views)} times. Normal behaviour.` },
    { ic: <IChart size={24} />, n: `${fmt(imps)} post impressions`, sub: "Check out who's engaging with your posts.", t: "Engagement up 300%. Mostly one person refreshing." },
    { ic: <ISearchPeople size={24} />, n: "1 search appearance", sub: "See how often you appear in search results.", t: 'You appeared in 1 search. Keyword: "the one".' },
  ];
  return (
    <Section title="Analytics" sub={<span className="pf-private"><IEye size={16} /> Private to you</span>}>
      <div className="pf-anRows">
        {rows.map((r) => (
          <button key={r.n} type="button" className="pf-anRow" onClick={() => onToast(r.t)}>
            <span className="pf-anIc">{r.ic}</span>
            <span className="pf-anTx">
              <b>{r.n}</b>
              <span>{r.sub}</span>
            </span>
          </button>
        ))}
      </div>
      <ShowAll label="Show all analytics" onClick={() => onToast(`Top viewer this week: ${s}. Also last week. Also every week.`)} />
    </Section>
  );
}

/* ── About ────────────────────────────────────────────────────────────────── */

export function About({ about, skills, onToast }: { about: string[]; skills: ProfileSkill[]; onToast: Toast }) {
  const text = about.filter(Boolean).join("\n\n");
  const top = skills.slice(0, 5).map((s) => s.label);
  if (!text && !top.length) return null;
  return (
    <Section title="About">
      {text && <SeeMore text={text} lines={4} />}
      {top.length > 0 && (
        <button type="button" className="pf-topSkills" onClick={() => onToast("Top skills, as endorsed by everyone who's met them.")}>
          <IDiamond size={20} className="pf-topSkillsIc" />
          <span>
            <b>Top skills</b>
            <span>{top.join(" • ")}</span>
          </span>
          <IArrowRt size={16} />
        </button>
      )}
    </Section>
  );
}

/* ── Featured (the memories) ──────────────────────────────────────────────── */

function useScroller() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [edge, setEdge] = useState({ l: false, r: true });
  const sync = () => {
    if (!el) return;
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  const by = (dir: number) => el?.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  return { setEl, edge, sync, by };
}

export function Featured({ photos, onOpen }: { photos: LovePhoto[]; onOpen: (i: number) => void }) {
  const { setEl: railEl, edge: railEdge, sync: railSync, by: railBy } = useScroller();
  if (!photos.length) return null;
  return (
    <Section
      title="Featured"
      actions={
        <div className="pf-arrows">
          <button type="button" className="pf-iconBtn" aria-label="Previous" disabled={!railEdge.l} onClick={() => railBy(-1)}><IChevL size={16} /></button>
          <button type="button" className="pf-iconBtn" aria-label="Next" disabled={!railEdge.r} onClick={() => railBy(1)}><IChevR size={16} /></button>
        </div>
      }
    >
      <div className="pf-rail" ref={railEl} onScroll={railSync}>
        {photos.map((p, i) => (
          <button key={`${i}-${p.url.slice(-10)}`} type="button" className="pf-feat" onClick={() => onOpen(i)} style={{ "--i": i } as CSSProperties}>
            <span className="pf-featKind">Memory</span>
            <Pic url={p.url} x={p.cropX} y={p.cropY} scale={p.scale} className="pf-featPic" alt={p.caption || `Memory ${i + 1}`} />
            <span className="pf-featTx">
              <b>{p.caption || `Memory ${i + 1}`}</b>
              {p.note && <span>{p.note}</span>}
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}

export function PhotoViewer({ photos, index, name, sender, onClose, onIndex }: { photos: LovePhoto[]; index: number; name: string; sender: string; onClose: () => void; onIndex: (i: number) => void }) {
  const p = photos[index];
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [index, photos.length, onClose, onIndex]);
  if (!p) return null;
  return (
    <div className="pf-viewer" role="dialog" aria-modal="true" aria-label={p.caption || "Memory"}>
      <div className="pf-viewerBg" onClick={onClose} />
      <div className="pf-viewerBox">
        <div className="pf-viewerPicW">
          <Pic key={p.url + index} url={p.url} x={p.cropX} y={p.cropY} scale={p.scale} className="pf-viewerPic" alt={p.caption || ""} />
          {photos.length > 1 && (
            <>
              <button type="button" className="pf-viewerNav is-l" aria-label="Previous memory" onClick={() => onIndex((index - 1 + photos.length) % photos.length)}><IChevL size={20} /></button>
              <button type="button" className="pf-viewerNav is-r" aria-label="Next memory" onClick={() => onIndex((index + 1) % photos.length)}><IChevR size={20} /></button>
            </>
          )}
          <span className="pf-viewerCount">{index + 1} / {photos.length}</span>
        </div>
        <div className="pf-viewerSide">
          <div className="pf-postHead">
            <Avatar name={sender} size={40} />
            <span className="pf-postWho">
              <b>{sender}</b>
              <span>Featured on {firstName(name)}&apos;s profile</span>
            </span>
          </div>
          <h3 className="pf-viewerCap">{p.caption || `Memory ${index + 1}`}</h3>
          {p.note && <p className="pf-viewerNote">{p.note}</p>}
          <div className="pf-viewerActs">
            <button type="button" className={`pf-act${liked ? " is-love" : ""}`} onClick={() => setLiked((v) => !v)}>
              {liked ? <ReactionDisc id="love" size={18} /> : <ILikeOutline size={20} />} {liked ? "Love" : "Like"}
            </button>
          </div>
        </div>
        <button type="button" className="pf-viewerX" onClick={onClose} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.42 12L20 18.58 18.58 20 12 13.42 5.42 20 4 18.58 10.58 12 4 5.42 5.42 4 12 10.58 18.58 4 20 5.42z" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ── Activity ─────────────────────────────────────────────────────────────── */

const COMMENT_LINES = [
  (n: string) => `Congratulations ${n}! Well deserved 👏`,
  () => "The fan speed discourse continues to be the most important thread on this platform.",
  () => "Insightful. Saving this for my performance review.",
  (n: string) => `${n} has never once been wrong. I've checked.`,
];

function Post({ post, idx, d, people, photo, onToast }: { post: ProfilePost; idx: number; d: ProfileProData; people: string[]; photo?: LovePhoto; onToast: Toast }) {
  const name = d.person.name || "They";
  const sender = d.senderName.trim() || "Someone";
  const h = hashOf(post.text);
  const baseReacts = 60 + (h % 240);
  const baseComments = 4 + (h % 18);
  const [mine, setMine] = useState<ReactionId | null>(null);
  const [picker, setPicker] = useState(false);
  const [pop, setPop] = useState(0);
  const [openC, setOpenC] = useState(false);
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const timer = useRef<number | null>(null);
  const long = useRef(false);
  const hoverT = useRef<number | null>(null);

  const seeded = useMemo(() => {
    const who = [sender, ...people].slice(0, 2);
    return who.map((w, i) => ({ who: w, text: i === 0 ? (idx === 0 ? `Proud of you. Also, I was there for the two years. 🙃` : `Fan speed 4 supporters are welcome to comment below. Respectfully.`) : COMMENT_LINES[(h + i) % COMMENT_LINES.length](firstName(name)) }));
  }, [sender, people, idx, h, name]);

  const react = (r: ReactionId | null) => {
    setMine(r);
    setPicker(false);
    if (r) setPop((x) => x + 1);
  };
  const down = () => {
    long.current = false;
    timer.current = window.setTimeout(() => { long.current = true; setPicker(true); }, 420);
  };
  const up = () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!long.current) react(mine ? null : "like");
  };
  const top3: ReactionId[] = (mine && mine !== "like" ? [mine, "like", "love"] : ["like", "love", "celebrate"]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3) as ReactionId[];
  const count = baseReacts + (mine ? 1 : 0);
  const r = mine ? REACTIONS.find((x) => x.id === mine) : null;

  return (
    <article className="pf-post">
      <div className="pf-postHead">
        <Face name={name} src={d.person.photoUrl} x={d.person.photoCropX} y={d.person.photoCropY} scale={d.person.photoScale} size={40} />
        <span className="pf-postWho">
          <b>{name} <span className="pf-dim">• You</span></b>
          <span className="pf-clip">{d.person.headline}</span>
          <span>{post.ago || "2w"} • <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden style={{ verticalAlign: -1 }}><path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zM3 8a5 5 0 0 1 1-3l.55.55A1.5 1.5 0 0 1 5 6.62v1.07a.75.75 0 0 0 .22.53l.56.56a.75.75 0 0 0 .53.22H7v.69a.75.75 0 0 0 .22.53l.56.56a.75.75 0 0 1 .22.53V13a5 5 0 0 1-5-5z" /></svg></span>
        </span>
      </div>
      <SeeMore text={post.text} lines={3} className="pf-postTx" more="…more" />
      {photo && <Pic url={photo.url} x={photo.cropX} y={photo.cropY} scale={photo.scale} className="pf-postPic" alt={photo.caption || ""} />}
      <div className="pf-social">
        <span className="pf-reacts">
          <span className="pf-discs">{top3.map((id) => <span key={id}><ReactionDisc id={id} size={16} /></span>)}</span>
          <span>{mine ? `You and ${fmt(count - 1)} others` : `${sender} and ${fmt(count - 1)} others`}</span>
        </span>
        <button type="button" className="pf-dimBtn" onClick={() => setOpenC((v) => !v)}>
          {baseComments + extra.length} comments • {1 + (h % 7)} repost{(h % 7) === 0 ? "" : "s"}
        </button>
      </div>
      <div className="pf-actsBar">
        <div className="pf-likeWrap" onMouseEnter={() => { hoverT.current = window.setTimeout(() => setPicker(true), 550); }} onMouseLeave={() => { if (hoverT.current) window.clearTimeout(hoverT.current); window.setTimeout(() => setPicker(false), 250); }}>
          {picker && (
            <div className="pf-picker" role="menu" aria-label="Reactions">
              {REACTIONS.map((x, i) => (
                <button key={x.id} type="button" role="menuitem" aria-label={x.label} className="pf-pickI" style={{ animationDelay: `${i * 35}ms` }} onClick={() => react(x.id)}>
                  <ReactionDisc id={x.id} size={36} />
                  <span className="pf-pickL">{x.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="pf-act"
            style={r ? { color: r.color } : undefined}
            onPointerDown={down}
            onPointerUp={up}
            onPointerLeave={() => timer.current && window.clearTimeout(timer.current)}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); react(mine ? null : "like"); } }}
            aria-label={mine ? `${r?.label} — tap to remove, hold for more reactions` : "Like — hold for more reactions"}
          >
            <span key={pop} className={pop ? "pf-popIc" : undefined}>{mine ? <ReactionDisc id={mine} size={20} /> : <ILikeOutline size={20} />}</span>
            <span>{r?.label ?? "Like"}</span>
          </button>
        </div>
        <button type="button" className="pf-act" onClick={() => setOpenC(true)}><IComment size={20} /><span>Comment</span></button>
        <button type="button" className="pf-act" onClick={() => onToast("Reposted. To the one feed that matters.")}><IRepost size={20} /><span>Repost</span></button>
        <button type="button" className="pf-act" onClick={() => onToast(`Sent to ${sender}. He's already seen it (7 times).`)}><ISend size={18} /><span>Send</span></button>
      </div>
      {openC && (
        <div className="pf-comments">
          <form
            className="pf-cBox"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setExtra((x) => [...x, draft.trim()]);
              setDraft("");
            }}
          >
            <Avatar name="You" size={32} />
            <input value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 200))} placeholder="Add a comment…" aria-label="Add a comment" />
            {draft.trim() && <button type="submit" className="pf-cPost">Post</button>}
          </form>
          {[...extra.map((t) => ({ who: "You", text: t })).reverse(), ...seeded].map((c, i) => (
            <div key={`${c.who}-${i}`} className="pf-c">
              <Avatar name={c.who} size={32} />
              <div className="pf-cBubble">
                <b>{c.who}{c.who === sender ? <span className="pf-dim"> • 1st</span> : null}</b>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function Activity({ d, people, onToast }: { d: ProfileProData; people: string[]; onToast: Toast }) {
  const [tab, setTab] = useState<"posts" | "comments" | "images">("posts");
  const { setEl: railEl, edge: railEdge, sync: railSync, by: railBy } = useScroller();
  const posts = d.posts.filter((p) => p.text.trim());
  if (!posts.length && !d.photos.length) return null;
  const photoFor = (i: number) => d.photos.length ? d.photos[(i + 1) % d.photos.length] : undefined;
  return (
    <Section
      title="Activity"
      sub={<button type="button" className="pf-link pf-strong" onClick={() => onToast(`1 follower: ${d.senderName || "them"}. Quality over quantity.`)}>1 follower 💙</button>}
      actions={<button type="button" className="pf-btn pf-btn--outline pf-btn--sm" onClick={() => onToast("Drafting: 'Grateful to announce…' 🎉")}>Create a post</button>}
      footer={<ShowAll label={`Show all ${tab === "images" ? "images" : "posts"}`} onClick={() => onToast("That's everything. Quality over quantity.")} />}
    >
      <div className="pf-pills" role="tablist">
        {(["posts", "comments", "images"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "posts" && (
        <div className="pf-railWrap">
          <div className="pf-rail pf-rail--posts" ref={railEl} onScroll={railSync}>
            {posts.map((p, i) => (
              <Post key={p.id || i} post={p} idx={i} d={d} people={people} photo={photoFor(i)} onToast={onToast} />
            ))}
          </div>
          {posts.length > 1 && (
            <>
              {railEdge.l && <button type="button" className="pf-railBtn is-l" aria-label="Previous post" onClick={() => railBy(-1)}><IChevL size={16} /></button>}
              {railEdge.r && <button type="button" className="pf-railBtn is-r" aria-label="Next post" onClick={() => railBy(1)}><IChevR size={16} /></button>}
            </>
          )}
        </div>
      )}
      {tab === "comments" && (
        <div className="pf-empty">
          <span aria-hidden>💬</span>
          <b>{firstName(d.person.name) || "They"} doesn&apos;t comment.</b>
          <p>{firstName(d.person.name) || "They"} reacts with a look. {d.senderName || "Someone"} has learned to read it.</p>
        </div>
      )}
      {tab === "images" && (
        <div className="pf-imgGrid">
          {d.photos.map((p, i) => (
            <Pic key={i} url={p.url} x={p.cropX} y={p.cropY} scale={p.scale} className="pf-imgCell" alt={p.caption || ""} />
          ))}
        </div>
      )}
    </Section>
  );
}

/* ── Experience ───────────────────────────────────────────────────────────── */

function skillLine(skills: ProfileSkill[], offset: number) {
  if (!skills.length) return null;
  const a = skills[offset % skills.length]?.label;
  const b = skills[(offset + 1) % skills.length]?.label;
  const more = Math.max(0, Math.min(skills.length - 2, 3));
  return (
    <p className="pf-skillLine">
      <IDiamond size={16} /> <span><b>{a}{b && b !== a ? `, ${b}` : ""}</b>{more ? ` and +${more} skills` : ""}</span>
    </p>
  );
}

export function Experience({ d }: { d: ProfileProData }) {
  const groups = groupExperience(d.experience.filter((e) => e.role || e.company));
  if (!groups.length) return null;
  return (
    <Section title="Experience">
      <ul className="pf-list">
        {groups.map((g, gi) => (
          <li key={gi} className="pf-exp">
            <Tile name={g.company || g.roles[0].role} />
            <div className="pf-expBody">
              {g.roles.length > 1 ? (
                <>
                  <h3 className="pf-h3">{g.company}</h3>
                  <p className="pf-sub">{g.roles[0].type || "Full-time"} · {g.roles.length} roles</p>
                  {g.roles[0].location && <p className="pf-meta">{g.roles[0].location}</p>}
                  <ol className="pf-roles">
                    {g.roles.map((r, ri) => (
                      <li key={ri} className="pf-role">
                        <span className="pf-dot" aria-hidden />
                        <h4 className="pf-h3">{r.role}</h4>
                        {r.type && <p className="pf-sub">{r.type}</p>}
                        <p className="pf-meta">{r.duration}</p>
                        {r.bullets.length > 0 && <SeeMore text={r.bullets.map((b) => `• ${b}`).join("\n")} lines={2} className="pf-bul" />}
                        {skillLine(d.skills, gi * 2 + ri)}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <>
                  <h3 className="pf-h3">{g.roles[0].role}</h3>
                  <p className="pf-sub">{[g.company, g.roles[0].type].filter(Boolean).join(" · ")}</p>
                  {g.roles[0].duration && <p className="pf-meta">{g.roles[0].duration}</p>}
                  {g.roles[0].location && <p className="pf-meta">{g.roles[0].location}</p>}
                  {g.roles[0].bullets.length > 0 && <SeeMore text={g.roles[0].bullets.map((b) => `• ${b}`).join("\n")} lines={2} className="pf-bul" />}
                  {skillLine(d.skills, gi * 2 + 3)}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Education({ items, skills }: { items: ProfileEducation[]; skills: ProfileSkill[] }) {
  const list = items.filter((e) => e.school);
  if (!list.length) return null;
  return (
    <Section title="Education">
      <ul className="pf-list">
        {list.map((e, i) => (
          <li key={i} className="pf-exp">
            <Tile name={e.school} kind="school" />
            <div className="pf-expBody">
              <h3 className="pf-h3">{e.school}</h3>
              {e.degree && <p className="pf-sub">{e.degree}</p>}
              {e.years && <p className="pf-meta">{e.years}</p>}
              {e.note && <SeeMore text={e.note} lines={2} className="pf-bul" />}
              {i === 0 && skillLine(skills, 4)}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Certifications({ d, onToast }: { d: ProfileProData; onToast: Toast }) {
  const list = (d.certifications ?? []).filter((c) => c.name);
  if (!list.length) return null;
  return (
    <Section title="Licenses & certifications">
      <ul className="pf-list">
        {list.map((c, i) => (
          <li key={i} className="pf-exp">
            <Tile name={c.name} kind="cert" />
            <div className="pf-expBody">
              <h3 className="pf-h3">{c.name}</h3>
              {c.issuer && <p className="pf-sub">{c.issuer}</p>}
              {c.date && <p className="pf-meta">Issued {c.date}</p>}
              <button type="button" className="pf-btn pf-btn--ghost pf-btn--sm pf-cred" onClick={() => onToast(`Credential ID ♥-${1000 + (hashOf(c.name) % 9000)} · verified by ${d.senderName || "the only reviewer that matters"} ✓`)}>
                Show credential <IExternal size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ── Skills ───────────────────────────────────────────────────────────────── */

function SkillRow({ s, onToast, name }: { s: ProfileSkill; onToast: Toast; name: string }) {
  const [on, setOn] = useState(false);
  const [bump, setBump] = useState(0);
  const count = s.endorsements + (on ? 1 : 0);
  return (
    <li className="pf-skill">
      {bump > 0 && <span key={bump} className="pf-flash" aria-hidden />}
      <h3 className="pf-h3">{s.label}</h3>
      {count > 0 && (
        <p className="pf-skillMeta">
          <FaceStack names={s.topEndorsers} size={20} you={on} />
          <span>
            {s.topEndorsers.length > 0 || on
              ? `${[...(on ? ["You"] : []), ...s.topEndorsers].slice(0, 2).join(", ")}${count > 2 ? ` and ${fmt(count - Math.min(2, (on ? 1 : 0) + s.topEndorsers.length))} others` : ""}`
              : ""}
            {" "}
            <span className="pf-dim">· {fmt(count)} endorsement{count === 1 ? "" : "s"}</span>
          </span>
        </p>
      )}
      <button
        type="button"
        className={`pf-btn pf-btn--ghost pf-btn--sm pf-endorse${on ? " is-on" : ""}`}
        aria-pressed={on}
        onClick={() => {
          setOn((v) => !v);
          setBump((b) => b + 1);
          if (!on) onToast(`You endorsed ${firstName(name) || "them"} for ${s.label}`);
        }}
      >
        {on ? <><ICheck size={16} /> Endorsed</> : "Endorse"}
      </button>
    </li>
  );
}

export function Skills({ d, onToast }: { d: ProfileProData; onToast: Toast }) {
  const [all, setAll] = useState(false);
  if (!d.skills.length) return null;
  const shown = all ? d.skills : d.skills.slice(0, 4);
  return (
    <Section title="Skills" footer={d.skills.length > 4 ? <ShowAll label={all ? "Show fewer skills" : `Show all ${d.skills.length} skills`} onClick={() => setAll((v) => !v)} /> : null}>
      <ul className="pf-list pf-skills">
        {shown.map((s) => <SkillRow key={s.id} s={s} onToast={onToast} name={d.person.name} />)}
      </ul>
    </Section>
  );
}

/* ── Recommendations ──────────────────────────────────────────────────────── */

function RecItem({ r, name }: { r: Recommendation; name: string }) {
  return (
    <li className="pf-rec">
      <Avatar name={r.author} size={48} />
      <div className="pf-expBody">
        <h3 className="pf-h3">{r.author} <span className="pf-dim">· 1st</span></h3>
        {r.authorHeadline && <p className="pf-sub pf-clip">{r.authorHeadline}</p>}
        <p className="pf-meta">{[r.ago, r.relationship || `${firstName(r.author)} knows ${firstName(name)}`].filter(Boolean).join(", ")}</p>
        <SeeMore text={r.text} lines={4} className="pf-bul" />
      </div>
    </li>
  );
}

export function Recommendations({ d, hasLetter, onLetter }: { d: ProfileProData; hasLetter: boolean; onLetter: () => void }) {
  const [tab, setTab] = useState<"received" | "given">("received");
  const published = d.recommendations.filter((r) => r.status === "published");
  if (!published.length && !hasLetter) return null;
  const sender = d.senderName.trim() || "Someone";
  return (
    <Section title="Recommendations">
      <div className="pf-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "received"} className={tab === "received" ? "is-on" : ""} onClick={() => setTab("received")}>Received</button>
        <button type="button" role="tab" aria-selected={tab === "given"} className={tab === "given" ? "is-on" : ""} onClick={() => setTab("given")}>Given</button>
      </div>
      {tab === "received" ? (
        <ul className="pf-list">
          {hasLetter && (
            <li className="pf-rec pf-recLock">
              <Avatar name={sender} size={48} />
              <div className="pf-expBody">
                <h3 className="pf-h3">{sender} <span className="pf-dim">· 1st</span></h3>
                <p className="pf-sub">Your person, full-time</p>
                <p className="pf-meta">Today, {sender} loves {firstName(d.person.name) || "you"} directly</p>
                <div className="pf-lockBox">
                  <p className="pf-lockBlur" aria-hidden>I have worked alongside you across every role you&apos;ve ever had and I recommend you without reservation, for every…</p>
                  <button type="button" className="pf-btn pf-btn--primary pf-btn--sm" onClick={onLetter}>
                    <ILock size={14} /> Read {firstName(sender)}&apos;s recommendation
                  </button>
                </div>
              </div>
            </li>
          )}
          {published.map((r) => <RecItem key={r.id} r={r} name={d.person.name} />)}
        </ul>
      ) : (
        <div className="pf-empty">
          <span aria-hidden>✍️</span>
          <b>Nothing given yet</b>
          <p>{firstName(d.person.name) || "They"} is saving every recommendation for {sender}. Allegedly.</p>
        </div>
      )}
    </Section>
  );
}

export function Languages({ items }: { items: ProfileLanguage[] }) {
  if (!items.length) return null;
  return (
    <Section title="Languages">
      <ul className="pf-list pf-langs">
        {items.map((l, i) => (
          <li key={i}>
            <h3 className="pf-h3">{l.name}</h3>
            {l.level && <p className="pf-meta">{l.level}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ── Interests ────────────────────────────────────────────────────────────── */

export function Interests({ d, onToast }: { d: ProfileProData; onToast: Toast }) {
  const [tab, setTab] = useState<"voices" | "companies" | "schools">("voices");
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const sender = d.senderName.trim() || "Someone";
  const companies = [...new Set(d.experience.map((e) => e.company).filter(Boolean))];
  const schools = [...new Set(d.education.map((e) => e.school).filter(Boolean))];
  const rows =
    tab === "voices"
      ? [{ k: sender, sub: `Top Voice · Loving ${firstName(d.person.name) || "you"}`, f: "1 follower (you)", person: true }]
      : (tab === "companies" ? companies : schools).map((c, i) => ({ k: c, sub: "", f: `${fmt(2 + i)} followers`, person: false }));
  return (
    <Section title="Interests">
      <div className="pf-tabs" role="tablist">
        {([["voices", "Top Voices"], ["companies", "Companies"], ["schools", "Schools"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "is-on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <ul className="pf-list">
        {rows.map((r) => (
          <li key={r.k} className="pf-exp">
            {r.person ? <Avatar name={r.k} size={48} /> : <Tile name={r.k} kind={tab === "schools" ? "school" : "company"} />}
            <div className="pf-expBody">
              <h3 className="pf-h3">{r.k}</h3>
              {r.sub && <p className="pf-sub">{r.sub}</p>}
              <p className="pf-meta">{r.f}</p>
              <button
                type="button"
                className={`pf-btn pf-btn--ghost pf-btn--sm${following[r.k] ? " is-on" : ""}`}
                onClick={() => {
                  setFollowing((f) => ({ ...f, [r.k]: !f[r.k] }));
                  if (!following[r.k]) onToast(`Following ${r.k}. Notifications: all of them.`);
                }}
              >
                {following[r.k] ? <><ICheck size={16} /> Following</> : "+ Follow"}
              </button>
            </div>
          </li>
        ))}
        {!rows.length && <li className="pf-meta">Nothing here yet.</li>}
      </ul>
    </Section>
  );
}

/* ── People cards (rail on desktop, bottom on phones) ─────────────────────── */

export function People({ title, people, sender, onMessage, onToast }: { title: string; people: { name: string; headline: string }[]; sender?: string; onMessage?: () => void; onToast: Toast }) {
  const [state, setState] = useState<Record<string, "pending">>({});
  if (!people.length && !sender) return null;
  return (
    <Section title={title} className="pf-peopleCard">
      <ul className="pf-list pf-people">
        {sender && (
          <li className="pf-person">
            <Avatar name={sender} size={48} />
            <div className="pf-expBody">
              <h3 className="pf-h3">{sender} <span className="pf-dim">· 1st</span></h3>
              <p className="pf-sub pf-clip">Viewed your profile. Again.</p>
              <button type="button" className="pf-btn pf-btn--ghost pf-btn--sm" onClick={onMessage}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M14 2L0 6.67l5 2.64 5.67-3.98L6.7 11l2.63 5L14 2z" /></svg> Message
              </button>
            </div>
          </li>
        )}
        {people.slice(0, 5).map((p) => (
          <li key={p.name} className="pf-person">
            <Avatar name={p.name} size={48} />
            <div className="pf-expBody">
              <h3 className="pf-h3">{p.name} <span className="pf-dim">· 2nd</span></h3>
              <p className="pf-sub pf-clip">{p.headline}</p>
              <button
                type="button"
                className={`pf-btn pf-btn--ghost pf-btn--sm${state[p.name] ? " is-pending" : ""}`}
                onClick={() => {
                  if (state[p.name]) return;
                  setState((s) => ({ ...s, [p.name]: "pending" }));
                  onToast(`Invitation sent to ${firstName(p.name)}`);
                }}
              >
                {state[p.name] ? <><IClock size={16} /> Pending</> : <><IPersonAdd size={16} /> Connect</>}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function RailExtras({ d, onLetter, onToast }: { d: ProfileProData; onLetter: () => void; onToast: Toast }) {
  const sender = d.senderName.trim() || "Someone";
  const slug = (d.person.name || "you").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <>
      <section className="pf-card pf-railSm">
        <div className="pf-railRow">
          <span><b>Profile language</b><span>English</span></span>
        </div>
        <div className="pf-railRow">
          <span><b>Public profile &amp; URL</b><span className="pf-clip">subhsandesh.in/in/{slug}-💙</span></span>
        </div>
      </section>
      <section className="pf-card pf-ad" aria-label="Promoted">
        <p className="pf-adTop"><span>Ad</span><span aria-hidden>···</span></p>
        <p className="pf-adLine">{firstName(d.person.name) || "You"}, one role is waiting for you</p>
        <div className="pf-adFaces">
          <Face name={d.person.name} src={d.person.photoUrl} x={d.person.photoCropX} y={d.person.photoCropY} scale={d.person.photoScale} size={64} />
          <span className="pf-adHeart" aria-hidden>💙</span>
          <Avatar name={sender} size={64} />
        </div>
        <p className="pf-adBig">{sender} is hiring: <b>Lifetime Partner</b></p>
        <p className="pf-meta">On-site · Full-time · Forever</p>
        <button type="button" className="pf-btn pf-btn--outline" onClick={onLetter}>Read the job description</button>
      </section>
      <button type="button" className="pf-card pf-prem" onClick={() => onToast("Premium unlocked: unlimited hugs, forever.")}>
        <span className="pf-premBadge" aria-hidden>▰</span>
        <span><b>See who viewed your heart</b><span>Try Premium for ₹0 · {sender} is paying</span></span>
      </button>
    </>
  );
}
