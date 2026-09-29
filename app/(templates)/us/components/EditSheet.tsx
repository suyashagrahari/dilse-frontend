"use client";

// ─── Us — the form ───────────────────────────────────────────────────────────
//
// As short as it can be: photos → your two names → bio & note → the letter →
// Save. Everything else (captions, comments, highlights, DMs, numbers) is in
// one collapsed "More" drawer, pre-written, and the AI fills all of it anyway.
//
// Phone: a tall bottom sheet. Tablet/desktop: a right-hand drawer, so the
// profile behind it updates live as they type.
//
// Every photo — posts, carousel extras, the profile picture, story slides —
// goes upload → frame (drag / pinch / zoom, the Dedication adjuster) →
// replace → remove, and renders with that framing everywhere it appears.

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_DEFAULT, type Crop as DCrop } from "../../dedication/components/types";
import Pic from "./Pic";
import {
  DEMO_DATA,
  isDemoImage,
  MAX_BIO_LINES,
  MAX_COMMENTS,
  MAX_DMS,
  MAX_FOLLOWED_BY,
  MAX_HIGHLIGHTS,
  MAX_HIGHLIGHT_SLIDES,
  MAX_LETTER,
  MAX_LOCK_A,
  MAX_LOCK_Q,
  MAX_MORE,
  MAX_NOTE,
  MAX_POSTS,
} from "./data";
import { missingFields, type EditMode } from "../hooks/useUsEditor";
import { commentToLine, parseCommentLine, type Crop, type Highlight, type Post, type ProfileData } from "./types";

const ROSE = "#FF3D7F";
const INK = "#1D1418";
const MUTED = "#7A6870";
const LINE = "#F1DDE5";
const SOFT = "#FFF6F9";

type Target =
  | { kind: "avatar" }
  | { kind: "post"; i: number }
  | { kind: "more"; i: number; j: number }
  | { kind: "slide"; h: number; s: number };

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: ProfileData;
  updateMf: <K extends keyof ProfileData>(key: K, val: ProfileData[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
}

const uid = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const handleFrom = (a: string, b: string) => {
  const clean = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "").slice(0, 9);
  const x = clean(a);
  const y = clean(b);
  return x && y ? `${x}.and.${y}` : x || y || "";
};

// ── Small pieces ────────────────────────────────────────────────────────────

function Section({ n, title, hint, children, done }: { n: string; title: string; hint?: string; children: ReactNode; done?: boolean }) {
  return (
    <section className="rounded-3xl border p-4 sm:p-5" style={{ borderColor: LINE, background: "#fff" }}>
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[15px]" style={{ background: done ? "#E7F8EE" : SOFT }} aria-hidden>
          {done ? "✓" : n}
        </span>
        <div className="min-w-0">
          <h3 className="text-[16px] font-extrabold leading-tight" style={{ color: INK }}>
            {title}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-[13px] leading-snug" style={{ color: MUTED }}>
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children, count, hint }: { label: string; children: ReactNode; count?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-[13px] font-bold" style={{ color: INK }}>
        {label}
        {count ? (
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: MUTED }}>
            {count}
          </span>
        ) : null}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[12px] leading-snug" style={{ color: MUTED }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputCls = "w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4";
const inputStyle = { borderColor: LINE, fontSize: 16, color: INK, background: "#fff", minHeight: 48, ["--tw-ring-color" as string]: "rgba(255,61,127,.15)" };

function Text({ value, onChange, placeholder, max, prefix, ...rest }: { value: string; onChange: (v: string) => void; placeholder?: string; max: number; prefix?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold" style={{ color: MUTED, fontSize: 16 }}>
          {prefix}
        </span>
      ) : null}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder={placeholder}
        className={inputCls}
        style={{ ...inputStyle, paddingLeft: prefix ? 32 : undefined }}
      />
    </div>
  );
}

function Area({ value, onChange, placeholder, max, rows = 3, label }: { value: string; onChange: (v: string) => void; placeholder?: string; max: number; rows?: number; label?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, max))}
      placeholder={placeholder}
      rows={rows}
      aria-label={label}
      className={`${inputCls} resize-y leading-relaxed`}
      style={inputStyle}
    />
  );
}

function Thumb({ src, crop, onClick, label, round, badge }: { src: string; crop?: Crop; onClick: () => void; label: string; round?: boolean; badge?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative block w-full overflow-hidden transition active:scale-95"
      style={{ aspectRatio: round ? "1 / 1" : "3 / 4", borderRadius: round ? "50%" : 14, background: "#eee" }}
    >
      <Pic src={src} crop={crop} style={{ position: "absolute", inset: 0 }} />
      {badge}
    </button>
  );
}

// ── The sheet ───────────────────────────────────────────────────────────────

export default function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave }: Props) {
  const open = editMode === "manual";
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState<Target | null>(null);
  const [framing, setFraming] = useState<Target | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lockOn, setLockOn] = useState(Boolean(mf.lockQuestion));
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);
  const extraFor = useRef<{ kind: "more"; i: number } | { kind: "slide"; h: number } | null>(null);
  const replaceFor = useRef<Target | null>(null);

  const missing = missingFields(mf);
  const sampleOnly = mf.posts.every((p) => !p.imageUrl || isDemoImage(p.imageUrl));

  // ── photo plumbing ──
  const getPhoto = useCallback(
    (t: Target): { url: string; crop?: Crop } | null => {
      if (t.kind === "avatar") return { url: mf.avatarUrl, crop: mf.avatarCrop };
      if (t.kind === "post") return mf.posts[t.i] ? { url: mf.posts[t.i].imageUrl, crop: mf.posts[t.i].crop } : null;
      if (t.kind === "more") return mf.posts[t.i]?.more?.[t.j] ?? null;
      const sl = mf.highlights[t.h]?.slides[t.s];
      return sl ? { url: sl.imageUrl, crop: sl.crop } : null;
    },
    [mf],
  );

  const setPhoto = useCallback(
    (t: Target, patch: { url?: string; crop?: Crop | undefined }) => {
      if (t.kind === "avatar") {
        if (patch.url !== undefined) updateMf("avatarUrl", patch.url);
        if ("crop" in patch) updateMf("avatarCrop", patch.crop);
        return;
      }
      if (t.kind === "post" || t.kind === "more") {
        const posts = mf.posts.map((p, i) => {
          if (i !== t.i) return p;
          if (t.kind === "post") return { ...p, ...(patch.url !== undefined ? { imageUrl: patch.url } : {}), ...("crop" in patch ? { crop: patch.crop } : {}) };
          const moreArr = (p.more ?? []).map((f, j) => (j === t.j ? { ...f, ...(patch.url !== undefined ? { url: patch.url } : {}), ...("crop" in patch ? { crop: patch.crop } : {}) } : f));
          return { ...p, more: moreArr };
        });
        updateMf("posts", posts);
        return;
      }
      const highlights = mf.highlights.map((h, hi) => {
        if (hi !== t.h) return h;
        const slides = h.slides.map((sl, si) =>
          si === t.s ? { ...sl, ...(patch.url !== undefined ? { imageUrl: patch.url } : {}), ...("crop" in patch ? { crop: patch.crop } : {}) } : sl,
        );
        return { ...h, slides, coverUrl: slides[0]?.imageUrl ?? h.coverUrl };
      });
      updateMf("highlights", highlights);
    },
    [mf, updateMf],
  );

  const removePhoto = useCallback(
    (t: Target) => {
      if (t.kind === "avatar") {
        updateMf("avatarUrl", mf.posts.find((p) => p.imageUrl)?.imageUrl ?? "");
        updateMf("avatarCrop", undefined);
      } else if (t.kind === "post") {
        const gone = mf.posts[t.i]?.id;
        updateMf(
          "posts",
          mf.posts.filter((_, i) => i !== t.i),
        );
        updateMf(
          "pinnedPostIds",
          mf.pinnedPostIds.filter((id) => id !== gone),
        );
      } else if (t.kind === "more") {
        updateMf(
          "posts",
          mf.posts.map((p, i) => (i === t.i ? { ...p, more: (p.more ?? []).filter((_, j) => j !== t.j) } : p)),
        );
      } else {
        updateMf(
          "highlights",
          mf.highlights
            .map((h, hi) => {
              if (hi !== t.h) return h;
              const slides = h.slides.filter((_, si) => si !== t.s);
              return { ...h, slides, coverUrl: slides[0]?.imageUrl ?? "" };
            })
            .filter((h) => h.slides.length > 0),
        );
      }
    },
    [mf, updateMf],
  );

  const movePost = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= mf.posts.length) return;
    const next = [...mf.posts];
    [next[i], next[j]] = [next[j], next[i]];
    updateMf("posts", next);
  };

  const readFiles = async (files: FileList | null, room: number): Promise<string[]> => {
    if (!files?.length) return [];
    setErr("");
    setBusy(true);
    const out: string[] = [];
    for (const f of Array.from(files).slice(0, Math.max(0, room))) {
      try {
        out.push(await compressImage(f));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "That photo couldn't be read");
      }
    }
    if (files.length > room) setErr(`Only ${MAX_POSTS} posts fit — the rest were skipped.`);
    setBusy(false);
    return out;
  };

  /** New post photos. The very first batch replaces the sample couple everywhere. */
  const addPosts = async (files: FileList | null) => {
    const room = sampleOnly ? MAX_POSTS : MAX_POSTS - mf.posts.length;
    const urls = await readFiles(files, room);
    if (!urls.length) return;
    if (sampleOnly) {
      const posts: Post[] = urls.map((u, i) => {
        const base = mf.posts[i] ?? DEMO_DATA.posts[i % DEMO_DATA.posts.length];
        return { ...base, id: base.id || uid(), imageUrl: u, crop: undefined, more: undefined, isMultiple: undefined, isVideo: undefined };
      });
      updateMf("posts", posts);
      updateMf(
        "pinnedPostIds",
        mf.pinnedPostIds.filter((id) => posts.some((p) => p.id === id)),
      );
      updateMf(
        "highlights",
        mf.highlights.map((h, hi) => {
          const slides = h.slides.map((sl, si) => (isDemoImage(sl.imageUrl) ? { ...sl, imageUrl: urls[(hi + si) % urls.length], crop: undefined } : sl));
          return { ...h, slides, coverUrl: slides[0].imageUrl };
        }),
      );
      if (isDemoImage(mf.avatarUrl)) {
        updateMf("avatarUrl", urls[0]);
        updateMf("avatarCrop", undefined);
      }
    } else {
      const fresh: Post[] = urls.map((u) => ({ id: uid(), imageUrl: u, caption: "", likes: 100 + Math.floor(Math.random() * 900), likedByName: "", postedAgo: "just now", comments: [] }));
      updateMf("posts", [...fresh, ...mf.posts]);
    }
    if (urls.length === 1) setFraming(sampleOnly ? { kind: "post", i: 0 } : { kind: "post", i: 0 });
  };

  const replace = async (files: FileList | null) => {
    const t = replaceFor.current;
    if (!t) return;
    const [u] = await readFiles(files, 1);
    if (!u) return;
    setPhoto(t, { url: u, crop: undefined });
    setFraming(t);
  };

  const addExtra = async (files: FileList | null) => {
    const t = extraFor.current;
    if (!t) return;
    if (t.kind === "more") {
      const post = mf.posts[t.i];
      const urls = await readFiles(files, MAX_MORE - (post?.more?.length ?? 0));
      if (!urls.length || !post) return;
      updateMf(
        "posts",
        mf.posts.map((p, i) => (i === t.i ? { ...p, more: [...(p.more ?? []), ...urls.map((url) => ({ url }))] } : p)),
      );
    } else {
      const h = mf.highlights[t.h];
      const urls = await readFiles(files, MAX_HIGHLIGHT_SLIDES - (h?.slides.length ?? 0));
      if (!urls.length || !h) return;
      updateMf(
        "highlights",
        mf.highlights.map((x, hi) => (hi === t.h ? { ...x, slides: [...x.slides, ...urls.map((imageUrl) => ({ imageUrl }))], coverUrl: x.slides[0]?.imageUrl ?? urls[0] } : x)),
      );
    }
  };

  const addHighlight = async (files: FileList | null) => {
    const urls = await readFiles(files, MAX_HIGHLIGHT_SLIDES);
    if (!urls.length) return;
    const h: Highlight = { title: "new ✨", coverUrl: urls[0], slides: urls.map((imageUrl) => ({ imageUrl })) };
    updateMf("highlights", [...mf.highlights, h]);
  };
  const hlRef = useRef<HTMLInputElement>(null);

  const pickAvatar = async (files: FileList | null) => {
    const [u] = await readFiles(files, 1);
    if (!u) return;
    updateMf("avatarUrl", u);
    updateMf("avatarCrop", undefined);
    setFraming({ kind: "avatar" });
  };

  const framed = framing ? getPhoto(framing) : null;
  const menuPhoto = menu ? getPhoto(menu) : null;

  const setPost = (i: number, patch: Partial<Post>) => updateMf("posts", mf.posts.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const setHl = (i: number, patch: Partial<Highlight>) => updateMf("highlights", mf.highlights.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));

  const suggested = useMemo(() => handleFrom(mf.from, mf.to), [mf.from, mf.to]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div key="us-sheet" className="fixed inset-0 z-[170]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0" style={{ background: "rgba(20,8,14,.32)" }} onClick={() => setEditMode(null)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Make your account"
            className="us-edit absolute flex flex-col overflow-hidden"
            style={{ background: "#FFFBFC", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <style>{`
              .us-edit{left:0;right:0;bottom:0;height:94dvh;border-radius:28px 28px 0 0;box-shadow:0 -20px 60px -20px rgba(0,0,0,.35)}
              @media (min-width:768px){.us-edit{left:auto;top:0;height:100dvh;width:min(480px,100vw);border-radius:28px 0 0 28px}}
            `}</style>

            {/* Header */}
            <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{ borderColor: LINE }}>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[.14em]" style={{ color: ROSE }}>
                  us. · your couple account
                </p>
                <h2 className="text-[19px] font-extrabold leading-tight" style={{ color: INK }}>
                  Make it yours
                </h2>
              </div>
              <button type="button" onClick={() => setEditMode(null)} className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ background: SOFT, color: INK }} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5" style={{ overscrollBehavior: "contain" }}>
              {/* 1 — photos */}
              <Section n="📸" title="Your photos" hint="They become your posts. Tap one to crop, zoom, replace or remove." done={!sampleOnly}>
                {sampleOnly ? (
                  <p className="rounded-2xl px-3 py-2 text-[13px] font-semibold" style={{ background: "#FFF1CC", color: "#6B4E00" }}>
                    These are sample photos — add yours and they replace them everywhere.
                  </p>
                ) : null}
                <div className="grid grid-cols-3 gap-2">
                  {mf.posts.length < MAX_POSTS || sampleOnly ? (
                    <button
                      type="button"
                      onClick={() => addRef.current?.click()}
                      disabled={busy}
                      className="grid place-items-center rounded-[14px] border-2 border-dashed text-center transition active:scale-95 disabled:opacity-60"
                      style={{ aspectRatio: "3 / 4", borderColor: ROSE, color: ROSE, background: SOFT }}
                    >
                      <span>
                        <span className="block text-2xl leading-none">{busy ? "…" : "+"}</span>
                        <span className="mt-1 block text-[12px] font-extrabold">{busy ? "adding" : "add photos"}</span>
                      </span>
                    </button>
                  ) : null}
                  {mf.posts.map((p, i) => (
                    <Thumb
                      key={p.id}
                      src={p.imageUrl}
                      crop={p.crop}
                      label={`Photo ${i + 1} — options`}
                      onClick={() => setMenu({ kind: "post", i })}
                      badge={
                        <span className="absolute bottom-1 left-1 rounded-full px-1.5 text-[10px] font-bold text-white" style={{ background: "rgba(0,0,0,.55)" }}>
                          {i + 1}
                          {p.more?.length ? ` · +${p.more.length}` : ""}
                        </span>
                      }
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: SOFT }}>
                  <div className="w-14 shrink-0">
                    <Thumb src={mf.avatarUrl} crop={mf.avatarCrop} round label="Profile photo — options" onClick={() => setMenu({ kind: "avatar" })} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold" style={{ color: INK }}>
                      Profile photo
                    </p>
                    <p className="text-[12px]" style={{ color: MUTED }}>
                      The one inside the story ring.
                    </p>
                  </div>
                  <button type="button" onClick={() => avatarRef.current?.click()} className="rounded-full px-3 py-2 text-[13px] font-bold" style={{ background: "#fff", color: ROSE, border: `1px solid ${LINE}` }}>
                    Change
                  </button>
                </div>
                {err ? (
                  <p className="text-[12px] font-semibold" style={{ color: ROSE }}>
                    {err}
                  </p>
                ) : null}
              </Section>

              {/* 2 — names */}
              <Section n="💞" title="You two" done={Boolean(mf.from.trim() && mf.to.trim())}>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Your name">
                    <Text value={mf.from} onChange={(v) => updateMf("from", v)} max={40} placeholder="Rohan" autoComplete="given-name" />
                  </Field>
                  <Field label="Their name">
                    <Text value={mf.to} onChange={(v) => updateMf("to", v)} max={40} placeholder="Ananya" />
                  </Field>
                </div>
                <Field label="Account handle" hint={suggested && suggested !== mf.handle ? undefined : "lowercase, no spaces — dots and underscores are fine"}>
                  <Text value={mf.handle} onChange={(v) => updateMf("handle", v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9._]/g, ""))} max={30} prefix="@" placeholder="ro.and.anu" autoCapitalize="none" />
                </Field>
                {suggested && suggested !== mf.handle ? (
                  <button type="button" onClick={() => updateMf("handle", suggested)} className="-mt-1 rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: SOFT, color: ROSE }}>
                    use @{suggested}
                  </button>
                ) : null}
                <Field label="Display name">
                  <Text value={mf.displayName} onChange={(v) => updateMf("displayName", v)} max={60} placeholder="Rohan & Ananya 💞" />
                </Field>
              </Section>

              {/* 3 — bio & note */}
              <Section n="✍️" title="Bio & note" hint="Fragments, not sentences — that's how real bios read.">
                <Field label="Bio" count={`${mf.bio.length}/${MAX_BIO_LINES} lines`}>
                  <Area
                    value={mf.bio.join("\n")}
                    onChange={(v) => updateMf("bio", v.split("\n").slice(0, MAX_BIO_LINES).map((l) => l.slice(0, 140)))}
                    max={900}
                    rows={4}
                    label="Bio, one line per row"
                    placeholder={"two idiots, one shared calendar\nest. 12.03.2023"}
                  />
                </Field>
                <Field label="Note bubble 💭" count={`${mf.note.length}/${MAX_NOTE}`} hint="The little thought bubble above your profile photo.">
                  <Text value={mf.note} onChange={(v) => updateMf("note", v)} max={MAX_NOTE} placeholder="still not over you tbh 🫶" />
                </Field>
              </Section>

              {/* 4 — letter */}
              <Section n="💌" title="The letter" hint="It pops into the bottom-right corner with an unread badge. Make them cry a little." done={Boolean(mf.letter.trim())}>
                <Field label="Your letter" count={`${mf.letter.length}/${MAX_LETTER}`}>
                  <Area value={mf.letter} onChange={(v) => updateMf("letter", v)} max={MAX_LETTER} rows={7} label="Your letter" placeholder="I made us an account because…" />
                </Field>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: SOFT }}>
                  <input
                    type="checkbox"
                    checked={lockOn}
                    onChange={(e) => {
                      setLockOn(e.target.checked);
                      if (!e.target.checked) {
                        updateMf("lockQuestion", "");
                        updateMf("lockAnswer", "");
                      }
                    }}
                    className="h-5 w-5 accent-pink-500"
                  />
                  <span className="text-[14px] font-bold" style={{ color: INK }}>
                    Ask a question before it opens
                  </span>
                </label>
                {lockOn ? (
                  <div className="grid gap-2.5">
                    <Field label="Question">
                      <Text value={mf.lockQuestion} onChange={(v) => updateMf("lockQuestion", v)} max={MAX_LOCK_Q} placeholder="who texted first? (be honest)" />
                    </Field>
                    <Field label="The 'yes' button says" hint="The 'no' button runs away. Obviously.">
                      <Text value={mf.lockAnswer} onChange={(v) => updateMf("lockAnswer", v)} max={MAX_LOCK_A} placeholder="you did 🙄💗" />
                    </Field>
                  </div>
                ) : null}
              </Section>

              {/* 5 — password */}
              <Section n="🔒" title="Private account" hint="Optional. They'll type this to see the profile.">
                <Text value={pagePassword} onChange={setPagePassword} max={64} placeholder="leave empty for no password" type="text" autoComplete="off" />
              </Section>

              {/* 6 — more */}
              <button
                type="button"
                onClick={() => setMore((m) => !m)}
                className="flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left"
                style={{ borderColor: LINE, background: "#fff" }}
                aria-expanded={more}
              >
                <span>
                  <span className="block text-[15px] font-extrabold" style={{ color: INK }}>
                    More: captions, comments, stories, DMs
                  </span>
                  <span className="block text-[12px]" style={{ color: MUTED }}>
                    Already written for you — tweak anything.
                  </span>
                </span>
                <span className="text-xl transition" style={{ transform: more ? "rotate(180deg)" : "none", color: ROSE }}>
                  ⌄
                </span>
              </button>

              {more ? (
                <div className="space-y-4">
                  <Section n="🖼️" title="Posts" hint="Comments: one per line, like  her_mom: he was sweating">
                    {mf.posts.map((p, i) => (
                      <div key={p.id} className="rounded-2xl border p-3" style={{ borderColor: LINE }}>
                        <div className="flex gap-3">
                          <div className="w-16 shrink-0">
                            <Thumb src={p.imageUrl} crop={p.crop} label={`Post ${i + 1} photo — options`} onClick={() => setMenu({ kind: "post", i })} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <Area value={p.caption} onChange={(v) => setPost(i, { caption: v })} max={600} rows={2} label={`Caption for post ${i + 1}`} placeholder="caption…" />
                            <Text value={p.location ?? ""} onChange={(v) => setPost(i, { location: v || undefined })} max={80} placeholder="📍 location (optional)" aria-label={`Location for post ${i + 1}`} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Area
                            value={p.comments.map(commentToLine).join("\n")}
                            onChange={(v) =>
                              setPost(i, {
                                comments: v
                                  .split("\n")
                                  .slice(0, MAX_COMMENTS)
                                  .map((l, k) => {
                                    const c = parseCommentLine(l);
                                    return c ? { ...c, likes: p.comments[k]?.likes ?? 10 + ((k * 37) % 90) } : null;
                                  })
                                  .filter((c): c is NonNullable<typeof c> => c !== null),
                              })
                            }
                            max={2000}
                            rows={2}
                            label={`Comments for post ${i + 1}`}
                            placeholder={"her_mom: he was sweating\narjun: bro 💀"}
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-2 overflow-x-auto">
                          <span className="shrink-0 text-[12px] font-bold" style={{ color: MUTED }}>
                            carousel
                          </span>
                          {(p.more ?? []).map((f, j) => (
                            <div key={j} className="w-11 shrink-0">
                              <Thumb src={f.url} crop={f.crop} label={`Post ${i + 1} extra photo ${j + 1} — options`} onClick={() => setMenu({ kind: "more", i, j })} />
                            </div>
                          ))}
                          {(p.more?.length ?? 0) < MAX_MORE ? (
                            <button
                              type="button"
                              onClick={() => {
                                extraFor.current = { kind: "more", i };
                                extraRef.current?.click();
                              }}
                              className="grid h-[58px] w-11 shrink-0 place-items-center rounded-[10px] border-2 border-dashed text-lg"
                              style={{ borderColor: LINE, color: ROSE }}
                              aria-label={`Add carousel photos to post ${i + 1}`}
                            >
                              +
                            </button>
                          ) : null}
                          <span className="flex-1" />
                          <button type="button" onClick={() => movePost(i, -1)} disabled={i === 0} className="h-8 w-8 shrink-0 rounded-lg border disabled:opacity-30" style={{ borderColor: LINE }} aria-label="Move earlier">
                            ↑
                          </button>
                          <button type="button" onClick={() => movePost(i, 1)} disabled={i === mf.posts.length - 1} className="h-8 w-8 shrink-0 rounded-lg border disabled:opacity-30" style={{ borderColor: LINE }} aria-label="Move later">
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const pinned = mf.pinnedPostIds.includes(p.id);
                              updateMf("pinnedPostIds", pinned ? mf.pinnedPostIds.filter((x) => x !== p.id) : [...mf.pinnedPostIds, p.id].slice(-3));
                            }}
                            className="h-8 shrink-0 rounded-lg border px-2 text-[12px] font-bold"
                            style={{ borderColor: LINE, background: mf.pinnedPostIds.includes(p.id) ? SOFT : "#fff", color: mf.pinnedPostIds.includes(p.id) ? ROSE : MUTED }}
                          >
                            📌
                          </button>
                        </div>
                      </div>
                    ))}
                  </Section>

                  <Section n="⭕" title="Story highlights" hint="The circles under the bio. Each opens a story.">
                    {mf.highlights.map((h, hi) => (
                      <div key={hi} className="rounded-2xl border p-3" style={{ borderColor: LINE }}>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex-1">
                            <Text value={h.title} onChange={(v) => setHl(hi, { title: v })} max={20} placeholder="title" aria-label={`Highlight ${hi + 1} title`} />
                          </div>
                          <button type="button" onClick={() => updateMf("highlights", mf.highlights.filter((_, x) => x !== hi))} className="h-10 rounded-xl px-3 text-[12px] font-bold" style={{ background: SOFT, color: MUTED }}>
                            remove
                          </button>
                        </div>
                        <div className="space-y-2">
                          {h.slides.map((sl, si) => (
                            <div key={si} className="flex items-center gap-2">
                              <div className="w-11 shrink-0">
                                <Thumb src={sl.imageUrl} crop={sl.crop} label={`Highlight ${hi + 1} slide ${si + 1} — options`} onClick={() => setMenu({ kind: "slide", h: hi, s: si })} />
                              </div>
                              <div className="flex-1">
                                <Text
                                  value={sl.caption ?? ""}
                                  onChange={(v) => setHl(hi, { slides: h.slides.map((x, k) => (k === si ? { ...x, caption: v || undefined } : x)) })}
                                  max={200}
                                  placeholder="text on the story (optional)"
                                  aria-label={`Highlight ${hi + 1} slide ${si + 1} text`}
                                />
                              </div>
                            </div>
                          ))}
                          {h.slides.length < MAX_HIGHLIGHT_SLIDES ? (
                            <button
                              type="button"
                              onClick={() => {
                                extraFor.current = { kind: "slide", h: hi };
                                extraRef.current?.click();
                              }}
                              className="text-[13px] font-bold"
                              style={{ color: ROSE }}
                            >
                              + add story photos
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {mf.highlights.length < MAX_HIGHLIGHTS ? (
                      <button type="button" onClick={() => hlRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed py-3 text-[14px] font-bold" style={{ borderColor: LINE, color: ROSE }}>
                        + new highlight
                      </button>
                    ) : null}
                  </Section>

                  <Section n="💬" title="The DMs" hint={`One message per line. Lines alternate: ${mf.from || "you"} → ${mf.to || "them"} → ${mf.from || "you"}…`}>
                    <Area
                      value={mf.dms.join("\n")}
                      onChange={(v) => updateMf("dms", v.split("\n").slice(0, MAX_DMS).map((l) => l.slice(0, 300)))}
                      max={5000}
                      rows={6}
                      label="DM messages, one per line"
                      placeholder={"u up?\nobviously"}
                    />
                  </Section>

                  <Section n="🔢" title="The details">
                    <div className="grid grid-cols-3 gap-2">
                      {(["posts", "followers", "following"] as const).map((k) => (
                        <Field key={k} label={k}>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={mf.stats[k]}
                            onChange={(e) => updateMf("stats", { ...mf.stats, [k]: Math.max(0, Math.min(999999999, Math.trunc(Number(e.target.value) || 0))) })}
                            className={inputCls}
                            style={inputStyle}
                          />
                        </Field>
                      ))}
                    </div>
                    <Field label="Category (the grey line under the name)">
                      <Text value={mf.category} onChange={(v) => updateMf("category", v)} max={60} placeholder="Long-term situationship (official)" />
                    </Field>
                    <Field label="Link text">
                      <Text
                        value={mf.link?.label ?? ""}
                        onChange={(v) => updateMf("link", v || mf.link?.url ? { label: v, url: mf.link?.url || "https://subhsandesh.in" } : undefined)}
                        max={80}
                        placeholder="our-little-archive.love"
                      />
                    </Field>
                    <Field label="Link goes to" hint="Any https link — a playlist, your album…">
                      <Text value={mf.link?.url ?? ""} onChange={(v) => updateMf("link", v ? { label: mf.link?.label ?? "", url: v } : undefined)} max={300} placeholder="https://" inputMode="url" autoCapitalize="none" />
                    </Field>
                    <Field label="Followed by" hint="Handles, separated by commas — the first two show in bold.">
                      <Text
                        value={mf.followedBy.join(", ")}
                        onChange={(v) =>
                          updateMf(
                            "followedBy",
                            v
                              .split(",")
                              .map((x) => x.trim().replace(/^@+/, "").replace(/\s+/g, "_"))
                              .slice(0, MAX_FOLLOWED_BY),
                          )
                        }
                        max={300}
                        placeholder="her_mom, the_group_chat"
                        autoCapitalize="none"
                      />
                    </Field>
                  </Section>
                </div>
              ) : null}
              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="border-t px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 sm:px-5" style={{ borderColor: LINE, background: "#fff" }}>
              {missing.length ? (
                <p className="mb-2 text-center text-[12.5px] font-semibold" style={{ color: MUTED }}>
                  Still needed: <span style={{ color: ROSE }}>{missing.join(" · ")}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={onSave}
                className="h-[52px] w-full rounded-full text-[16px] font-extrabold text-white shadow-lg transition active:scale-[.98]"
                style={{ background: `linear-gradient(135deg, #FF5E9A, ${ROSE} 55%, #E0287A)`, boxShadow: "0 12px 26px -12px rgba(255,61,127,.8)" }}
              >
                Save & preview
              </button>
            </div>

            {/* Photo options */}
            <AnimatePresence>
              {menu && menuPhoto ? (
                <motion.div className="absolute inset-0 z-10 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0" style={{ background: "rgba(20,8,14,.4)" }} onClick={() => setMenu(null)} />
                  <motion.div className="relative w-full rounded-t-3xl bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))]" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="w-14">
                        <Thumb src={menuPhoto.url} crop={menuPhoto.crop} round={menu.kind === "avatar"} label="Selected photo" onClick={() => undefined} />
                      </div>
                      <p className="text-[15px] font-extrabold" style={{ color: INK }}>
                        {menu.kind === "avatar" ? "Profile photo" : menu.kind === "post" ? `Photo ${menu.i + 1}` : "Photo"}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <MenuBtn
                        onClick={() => {
                          setFraming(menu);
                          setMenu(null);
                        }}
                      >
                        ✂️ Crop & zoom
                      </MenuBtn>
                      <MenuBtn
                        onClick={() => {
                          replaceFor.current = menu;
                          setMenu(null);
                          (menu.kind === "avatar" ? avatarRef : replaceRef).current?.click();
                        }}
                      >
                        🔁 Replace
                      </MenuBtn>
                      {menu.kind === "post" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <MenuBtn onClick={() => (movePost(menu.i, -1), setMenu(null))} disabled={menu.i === 0}>
                            ← Earlier
                          </MenuBtn>
                          <MenuBtn onClick={() => (movePost(menu.i, 1), setMenu(null))} disabled={menu.i === mf.posts.length - 1}>
                            Later →
                          </MenuBtn>
                        </div>
                      ) : null}
                      {menu.kind !== "avatar" && !(menu.kind === "post" && mf.posts.length <= 1) ? (
                        <MenuBtn
                          danger
                          onClick={() => {
                            removePhoto(menu);
                            setMenu(null);
                          }}
                        >
                          🗑️ Remove
                        </MenuBtn>
                      ) : null}
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <input ref={addRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (void addPosts(e.target.files), (e.target.value = ""))} />
            <input ref={replaceRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (void replace(e.target.files), (e.target.value = ""))} />
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => (void (replaceFor.current?.kind === "avatar" ? replace(e.target.files) : pickAvatar(e.target.files)), (replaceFor.current = null), (e.target.value = ""))}
            />
            <input ref={extraRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (void addExtra(e.target.files), (e.target.value = ""))} />
            <input ref={hlRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (void addHighlight(e.target.files), (e.target.value = ""))} />
          </motion.div>

          <PhotoAdjuster
            open={framing !== null && !!framed?.url}
            src={framed?.url ?? ""}
            crop={framed?.crop ?? CROP_DEFAULT}
            title={framing?.kind === "avatar" ? "Frame your profile photo" : "Frame this photo"}
            onChange={(c: DCrop) => framing && setPhoto(framing, { crop: c })}
            onClose={() => setFraming(null)}
            onReplace={() => {
              if (!framing) return;
              replaceFor.current = framing;
              (framing.kind === "avatar" ? avatarRef : replaceRef).current?.click();
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MenuBtn({ children, onClick, danger, disabled }: { children: ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-12 w-full rounded-2xl text-[15px] font-bold transition active:scale-[.98] disabled:opacity-35"
      style={{ background: danger ? "#FFEEF1" : SOFT, color: danger ? "#D6204A" : INK }}
    >
      {children}
    </button>
  );
}
