"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookHeart, Check, X, Edit3, Loader2, ChevronRight, ChevronDown,
  Trash2, AlertTriangle, Sparkles, RefreshCw, Lock, Plus, Users,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { STORY_LIMITS, type StoryProfile, type StoryPeople, type StoryEntry } from "@/lib/ai-fill/types";

/* ── shared visual tokens (mirrors app/(app)/profile/page.tsx) ── */
const cardStyle = { background: "rgba(255,255,255,0.8)", border: "1px solid rgba(61,12,17,0.1)", borderRadius: "1rem" };
const sectionLabel = (text: string) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2 px-1 flex items-center gap-1.5" style={{ color: "var(--app-accent)" }}>{text}</p>
);
const inputClass = "app-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all";
const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "var(--app-accent-a35)"; };
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "var(--app-input-border)"; };

const EMPTY_PEOPLE: StoryPeople = { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" };

const PEOPLE_FIELDS: { key: keyof StoryPeople; label: string; placeholder: string; hint: string }[] = [
  { key: "userName", label: "Your name", placeholder: "Meera", hint: "How you sign off" },
  { key: "partnerName", label: "Partner's name", placeholder: "Ananya", hint: "Left blank if not applicable" },
  { key: "bestFriendName", label: "Best friend's name", placeholder: "Riya", hint: "Left blank if not applicable" },
  { key: "partnerPronouns", label: "Partner's pronouns", placeholder: "she/her", hint: "Type it however you say it — she/her, he/him, they/them" },
];

function prettySlug(slug: string): string {
  if (!slug || slug === "profile") return "Written here";
  return slug.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── small building blocks ── */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: "var(--app-accent-a08)", border: "1px solid var(--app-accent-a20)", color: "var(--app-text-muted)" }}
    >
      {children}
    </span>
  );
}

function Disclosure({
  id, icon, title, hint, open, onToggle, children,
}: {
  id: string; icon: React.ReactNode; title: string; hint: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="app-row-hover w-full flex items-center gap-3 px-4 py-3.5 min-h-[44px] transition-colors"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a08)" }}>
          {icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{title}</p>
          <p className="text-xs truncate" style={{ color: "var(--app-text-faint)" }}>{hint}</p>
        </div>
        <ChevronRight size={15} className={`transition-transform shrink-0 ${open ? "rotate-90" : ""}`} style={{ color: "var(--app-text-faint)" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type PanelKey = "people" | "stories" | "context" | null;

export default function MyStorySection() {
  const { accessToken } = useAppSelector((s) => s.auth);

  const [profile, setProfile] = useState<StoryProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openPanel, setOpenPanel] = useState<PanelKey>(null);

  /* people */
  const [editingPeople, setEditingPeople] = useState(false);
  const [peopleDraft, setPeopleDraft] = useState<StoryPeople>(EMPTY_PEOPLE);
  const [peopleSaving, setPeopleSaving] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  /* settings */
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  /* stories */
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storySaving, setStorySaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* add */
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  /* context */
  const [rebuilding, setRebuilding] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  /* one shared, honest status line for the slow context regeneration */
  const [status, setStatus] = useState<string>("");

  const authHeaders = useCallback((extra: Record<string, string> = {}): Record<string, string> => {
    const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}`, ...extra };
    if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";
    return headers;
  }, [accessToken]);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/story/profile`, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Could not load your stories.");
      const next = data.data as StoryProfile;
      setProfile({ ...next, people: { ...EMPTY_PEOPLE, ...(next.people || {}) }, stories: next.stories || [] });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load your stories.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeaders]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  /* Every write regenerates the distilled context server-side, which is slow.
     We say so, then re-read the profile so the UI shows the real new context. */
  const refreshAfterWrite = useCallback(async () => {
    setStatus("Updating what we remember… this takes a few seconds.");
    await loadProfile();
    setStatus("Updated what we remember.");
  }, [loadProfile]);

  const people = profile?.people ?? EMPTY_PEOPLE;
  const stories: StoryEntry[] = profile?.stories ?? [];
  const ctx = profile?.context;
  const autoFillEnabled = profile?.autoFillEnabled ?? false;
  const avoid = ctx?.avoid ?? [];

  /* ── people ── */
  const startEditPeople = () => {
    setPeopleDraft({ ...EMPTY_PEOPLE, ...people });
    setPeopleError(null);
    setEditingPeople(true);
  };

  const savePeople = async () => {
    if (!accessToken) return;
    setPeopleSaving(true);
    setPeopleError(null);
    try {
      const res = await fetch(`${API_URL}/story/profile/people`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ people: peopleDraft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Could not save these names.");
      setProfile((prev) => (prev ? { ...prev, people: { ...peopleDraft } } : prev));
      setEditingPeople(false);
      setStatus("Names saved.");
    } catch (err) {
      setPeopleError(err instanceof Error ? err.message : "Could not save these names.");
    } finally {
      setPeopleSaving(false);
    }
  };

  /* ── master switch ── */
  const toggleAutoFill = async () => {
    if (!accessToken || !profile) return;
    const next = !autoFillEnabled;
    setToggling(true);
    setToggleError(null);
    try {
      const res = await fetch(`${API_URL}/story/profile/settings`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ autoFillEnabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Could not change this setting.");
      setProfile((prev) => (prev ? { ...prev, autoFillEnabled: next } : prev));
      setStatus(next ? "Auto-fill is on." : "Auto-fill is off. Nothing will be filled in for you.");
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "Could not change this setting.");
    } finally {
      setToggling(false);
    }
  };

  /* ── one story ── */
  const openStory = async (entry: StoryEntry) => {
    if (openStoryId === entry.storyId) {
      setOpenStoryId(null);
      setConfirmDeleteId(null);
      return;
    }
    setOpenStoryId(entry.storyId);
    setConfirmDeleteId(null);
    setStoryTitle(entry.title);
    setStoryText("");
    setStoryError(null);
    setStoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/story/profile/stories/${entry.storyId}`, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Could not open this story.");
      setStoryText(data.data?.text ?? "");
      setStoryTitle(data.data?.title ?? entry.title);
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : "Could not open this story.");
    } finally {
      setStoryLoading(false);
    }
  };

  const saveStory = async (storyId: string) => {
    if (!accessToken) return;
    if (storyText.trim().length < STORY_LIMITS.minStory) {
      setStoryError(`Please write at least ${STORY_LIMITS.minStory} characters.`);
      return;
    }
    setStorySaving(true);
    setStoryError(null);
    setStatus("Saving, then updating what we remember… this takes a few seconds.");
    try {
      const res = await fetch(`${API_URL}/story/profile/stories/${storyId}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ title: storyTitle.trim(), text: storyText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Could not save this story.");
      await refreshAfterWrite();
      setOpenStoryId(null);
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : "Could not save this story.");
      setStatus("");
    } finally {
      setStorySaving(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!accessToken) return;
    setDeletingId(storyId);
    setStoryError(null);
    setStatus("Deleting, then updating what we remember… this takes a few seconds.");
    try {
      const res = await fetch(`${API_URL}/story/profile/stories/${storyId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Could not delete this story.");
      setConfirmDeleteId(null);
      setOpenStoryId(null);
      await refreshAfterWrite();
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : "Could not delete this story.");
      setStatus("");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── add a story ── */
  const addStory = async () => {
    if (!accessToken) return;
    if (newText.trim().length < STORY_LIMITS.minStory) {
      setAddError(`Please write at least ${STORY_LIMITS.minStory} characters so there is something to work with.`);
      return;
    }
    setAdding(true);
    setAddError(null);
    setStatus("Saving, then updating what we remember… this takes a few seconds.");
    try {
      const res = await fetch(`${API_URL}/story/profile/stories`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: newTitle.trim() || "Untitled story",
          text: newText.trim(),
          sourceSlug: "profile",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Could not save this story.");
      setNewTitle("");
      setNewText("");
      setAddOpen(false);
      await refreshAfterWrite();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Could not save this story.");
      setStatus("");
    } finally {
      setAdding(false);
    }
  };

  /* ── rebuild context ── */
  const rebuildContext = async () => {
    if (!accessToken) return;
    setRebuilding(true);
    setContextError(null);
    setStatus("Updating what we remember… this takes a few seconds.");
    try {
      const res = await fetch(`${API_URL}/story/profile/context/rebuild`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Could not rebuild this.");
      await loadProfile();
      setStatus("Updated what we remember.");
    } catch (err) {
      setContextError(err instanceof Error ? err.message : "Could not rebuild this.");
      setStatus("");
    } finally {
      setRebuilding(false);
    }
  };

  const busy = peopleSaving || storySaving || adding || rebuilding || deletingId !== null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
      {sectionLabel("My Story")}

      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        {/* ── Intro: whose data this is ── */}
        <div className="px-4 pt-4 pb-3.5 flex items-start gap-3" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--app-accent-a08)" }}>
            <BookHeart size={16} style={{ color: "var(--app-accent)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: "var(--app-text)" }}>Your stories</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
              Private to you. Nobody else can read them, and they are only ever used to fill in
              <span className="font-semibold" style={{ color: "var(--app-text)" }}> your own </span>
              forms when you make a new page.
            </p>
          </div>
        </div>

        {/* ── aria-live status + errors ── */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">{status || loadError || ""}</div>

        {(busy || status) && (
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "var(--app-accent-a06)", borderBottom: "1px solid var(--app-border-faint)" }}>
            {busy ? <Loader2 size={13} className="animate-spin shrink-0" style={{ color: "var(--app-accent)" }} /> : <Check size={13} className="shrink-0" style={{ color: "var(--app-accent)" }} />}
            <p className="text-[11.5px] font-medium" style={{ color: "var(--app-text-muted)" }}>{status || "Working…"}</p>
          </div>
        )}

        {/* ── Master switch — always visible, never behind a disclosure ── */}
        <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--app-border-faint)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: autoFillEnabled ? "var(--app-accent-a10)" : "var(--app-surface)" }}>
              <Sparkles size={16} style={{ color: autoFillEnabled ? "var(--app-accent)" : "var(--app-text-faint)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p id="autofill-label" className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                Fill my forms from my stories
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                When this is off, nothing is ever filled in for you — every new page starts blank.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoFillEnabled}
              aria-labelledby="autofill-label"
              disabled={toggling || loading || !profile}
              onClick={toggleAutoFill}
              className="relative shrink-0 rounded-full transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2"
              style={{
                width: 52, height: 30, minHeight: 30,
                background: autoFillEnabled ? "var(--app-accent)" : "rgba(61,12,17,0.14)",
                border: "1px solid var(--app-border-faint)",
              }}
            >
              <span
                className="absolute top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all"
                style={{ width: 24, height: 24, left: autoFillEnabled ? 25 : 2, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
              >
                {toggling && <Loader2 size={11} className="animate-spin" style={{ color: "var(--app-text-faint)" }} />}
              </span>
            </button>
          </div>
          {!autoFillEnabled && !toggling && (
            <p className="text-[11px] mt-2 px-3 py-2 rounded-lg" style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
              Auto-fill is off. Your stories are still saved here, and you can turn this back on any time.
            </p>
          )}
          {toggleError && (
            <p className="text-[11px] mt-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>{toggleError}</p>
          )}
        </div>

        {/* ── AVOID — the most important thing on this screen ── */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--app-border-faint)", background: "rgba(220,38,38,0.035)" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.1)" }}>
              <Lock size={16} style={{ color: "#dc2626" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold" style={{ color: "#dc2626" }}>Never mentioned</p>
              <p className="text-[11.5px] mt-1 leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                These are the subjects you asked us to keep out. Nothing written into a page for you will
                <span className="font-bold" style={{ color: "#dc2626" }}> ever mention them</span>.
              </p>

              {avoid.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {avoid.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(220,38,38,0.22)" }}
                    >
                      <X size={13} strokeWidth={3} className="shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                      <span className="text-[12.5px] font-semibold leading-snug" style={{ color: "var(--app-text)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11.5px] mt-2.5 px-3 py-2.5 rounded-xl leading-relaxed" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--app-border-faint)", color: "var(--app-text-muted)" }}>
                  Nothing on this list yet. Write it plainly in a story — for example{" "}
                  <span className="font-semibold" style={{ color: "var(--app-text)" }}>&ldquo;please don&rsquo;t mention the breakup&rdquo;</span>{" "}
                  — and it will appear here so you can check it stuck.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading / load error ── */}
        {loading && !profile && (
          <div className="px-4 py-6 flex items-center justify-center gap-2">
            <Loader2 size={15} className="animate-spin" style={{ color: "var(--app-accent)" }} />
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>Loading your stories…</p>
          </div>
        )}

        {loadError && (
          <div className="px-4 py-4">
            <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold" style={{ color: "#dc2626" }}>{loadError}</p>
                <button
                  type="button"
                  onClick={loadProfile}
                  className="mt-2 min-h-[44px] px-4 rounded-xl text-xs font-bold transition-all"
                  style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <>
            {/* ── People ── */}
            <Disclosure
              id="story-people"
              icon={<Users size={16} style={{ color: "var(--app-accent)" }} />}
              title="Names and pronouns"
              hint={people.userName || people.partnerName ? [people.userName, people.partnerName].filter(Boolean).join(" · ") : "Not set yet"}
              open={openPanel === "people"}
              onToggle={() => setOpenPanel(openPanel === "people" ? null : "people")}
            >
              {!editingPeople ? (
                <div className="space-y-2">
                  {PEOPLE_FIELDS.map((f) => (
                    <div key={f.key} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-faint)" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider w-[130px] shrink-0" style={{ color: "var(--app-text-faint)" }}>{f.label}</p>
                      <p className="text-sm font-medium truncate flex-1" style={{ color: people[f.key] ? "var(--app-text)" : "var(--app-text-ultra-faint)" }}>
                        {people[f.key] || "—"}
                      </p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={startEditPeople}
                    className="w-full min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                  >
                    <Edit3 size={14} /> Edit names
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {PEOPLE_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label htmlFor={`people-${f.key}`} className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>
                        {f.label}
                      </label>
                      <input
                        id={`people-${f.key}`}
                        type="text"
                        value={peopleDraft[f.key]}
                        maxLength={STORY_LIMITS.name}
                        placeholder={f.placeholder}
                        onChange={(e) => setPeopleDraft((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        onFocus={focusOn}
                        onBlur={focusOff}
                        className={inputClass}
                      />
                      <p className="text-[10px] mt-1" style={{ color: "var(--app-text-ultra-faint)" }}>{f.hint}</p>
                    </div>
                  ))}
                  {peopleError && (
                    <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>{peopleError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={savePeople}
                      disabled={peopleSaving}
                      className="flex-1 min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                    >
                      {peopleSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingPeople(false); setPeopleError(null); }}
                      disabled={peopleSaving}
                      className="px-4 min-h-[44px] rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                      style={{ background: "var(--app-surface)", color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Disclosure>

            {/* ── Stories ── */}
            <Disclosure
              id="story-list"
              icon={<BookHeart size={16} style={{ color: "var(--app-accent)" }} />}
              title="Stories you've saved"
              hint={stories.length === 0 ? "None yet" : `${stories.length} ${stories.length === 1 ? "story" : "stories"}`}
              open={openPanel === "stories"}
              onToggle={() => setOpenPanel(openPanel === "stories" ? null : "stories")}
            >
              {stories.length === 0 ? (
                <div className="rounded-xl p-4 mb-3" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a15)" }}>
                  <p className="text-sm font-bold mb-1.5" style={{ color: "var(--app-text)" }}>Nothing saved yet</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                    A story is just how you&rsquo;d tell it out loud — how you met, what you call each other, the trip to Goa.
                    Save one and every page you make afterwards starts already written in your own details, so you&rsquo;re editing
                    instead of staring at an empty form.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid var(--app-border-faint)" }}>
                  {stories.map((entry) => {
                    const isOpen = openStoryId === entry.storyId;
                    return (
                      <div key={entry.storyId} style={{ borderBottom: "1px solid var(--app-border-faint)", background: "var(--app-surface)" }}>
                        <button
                          type="button"
                          onClick={() => openStory(entry)}
                          aria-expanded={isOpen}
                          className="app-row-hover w-full text-left flex items-center gap-2.5 px-3 py-3 min-h-[44px] transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-bold truncate" style={{ color: "var(--app-text)" }}>{entry.title || "Untitled story"}</p>
                            <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--app-text-faint)" }}>
                              {formatWhen(entry.createdAt)} · {prettySlug(entry.sourceSlug)}
                            </p>
                          </div>
                          <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--app-text-faint)" }} />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3.5 space-y-2.5" style={{ borderTop: "1px solid var(--app-border-faint)" }}>
                                {storyLoading ? (
                                  <div className="flex items-center gap-2 py-4">
                                    <Loader2 size={14} className="animate-spin" style={{ color: "var(--app-accent)" }} />
                                    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>Opening your story…</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="pt-3">
                                      <label htmlFor={`title-${entry.storyId}`} className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>
                                        Title
                                      </label>
                                      <input
                                        id={`title-${entry.storyId}`}
                                        type="text"
                                        value={storyTitle}
                                        maxLength={STORY_LIMITS.title}
                                        onChange={(e) => setStoryTitle(e.target.value)}
                                        onFocus={focusOn}
                                        onBlur={focusOff}
                                        className={inputClass}
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor={`text-${entry.storyId}`} className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>
                                        Your story
                                      </label>
                                      <textarea
                                        id={`text-${entry.storyId}`}
                                        value={storyText}
                                        maxLength={STORY_LIMITS.story}
                                        rows={7}
                                        onChange={(e) => setStoryText(e.target.value)}
                                        onFocus={focusOn}
                                        onBlur={focusOff}
                                        className={`${inputClass} resize-y leading-relaxed`}
                                      />
                                      <p className="text-[10px] mt-1 text-right" style={{ color: "var(--app-text-ultra-faint)" }}>
                                        {storyText.length} / {STORY_LIMITS.story}
                                      </p>
                                    </div>

                                    {storyError && (
                                      <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>{storyError}</p>
                                    )}

                                    {confirmDeleteId === entry.storyId ? (
                                      <div className="rounded-xl p-3 space-y-2.5" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                                          <div className="min-w-0">
                                            <p className="text-[12.5px] font-bold" style={{ color: "#dc2626" }}>Delete this story?</p>
                                            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                                              This is <span style={{ color: "#dc2626", fontWeight: 700 }}>permanent and cannot be undone</span>. What we remember will be rebuilt without it.
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            disabled={deletingId === entry.storyId}
                                            className="flex-1 min-h-[44px] rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
                                            style={{ background: "var(--app-surface)", color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)" }}
                                          >
                                            Keep it
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => deleteStory(entry.storyId)}
                                            disabled={deletingId === entry.storyId}
                                            className="flex-1 min-h-[44px] rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                                            style={{ background: "#dc2626" }}
                                          >
                                            {deletingId === entry.storyId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            {deletingId === entry.storyId ? "Deleting…" : "Delete forever"}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => saveStory(entry.storyId)}
                                          disabled={storySaving}
                                          className="flex-1 min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                                          style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                                        >
                                          {storySaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save</>}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteId(entry.storyId)}
                                          disabled={storySaving}
                                          className="px-4 min-h-[44px] rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all disabled:opacity-40"
                                          style={{ background: "rgba(220,38,38,0.07)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}
                                        >
                                          <Trash2 size={14} /> Delete
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Add a story ── */}
              {!addOpen ? (
                <button
                  type="button"
                  onClick={() => { setAddOpen(true); setAddError(null); }}
                  className="w-full min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                >
                  <Plus size={15} /> {stories.length === 0 ? "Write your first story" : "Add a story"}
                </button>
              ) : (
                <div className="space-y-3 rounded-xl p-3" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-faint)" }}>
                  <div>
                    <label htmlFor="new-story-title" className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>
                      Title
                    </label>
                    <input
                      id="new-story-title"
                      type="text"
                      value={newTitle}
                      maxLength={STORY_LIMITS.title}
                      placeholder="How we met"
                      onChange={(e) => setNewTitle(e.target.value)}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-story-text" className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>
                      Your story
                    </label>
                    <textarea
                      id="new-story-text"
                      value={newText}
                      maxLength={STORY_LIMITS.story}
                      rows={7}
                      placeholder="We met at Ananya's terrace party in 2021. She calls me bacchu, I call her Meera-jaan. Last winter we drove to Goa on a whim and got caught in the rain outside Anjuna…"
                      onChange={(e) => setNewText(e.target.value)}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      className={`${inputClass} resize-y leading-relaxed`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px]" style={{ color: "var(--app-text-ultra-faint)" }}>
                        At least {STORY_LIMITS.minStory} characters
                      </p>
                      <p className="text-[10px]" style={{ color: newText.length > STORY_LIMITS.story - 200 ? "#dc2626" : "var(--app-text-ultra-faint)" }}>
                        {newText.length} / {STORY_LIMITS.story}
                      </p>
                    </div>
                  </div>

                  {addError && (
                    <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>{addError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addStory}
                      disabled={adding || newText.trim().length < STORY_LIMITS.minStory}
                      className="flex-1 min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                    >
                      {adding ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save story</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddOpen(false); setAddError(null); }}
                      disabled={adding}
                      className="px-4 min-h-[44px] rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                      style={{ background: "var(--app-bg)", color: "var(--app-text-muted)", border: "1px solid var(--app-border-faint)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Disclosure>

            {/* ── What we remember ── */}
            <Disclosure
              id="story-context"
              icon={<Sparkles size={16} style={{ color: "var(--app-accent)" }} />}
              title="What we remember"
              hint={ctx ? `Updated ${formatWhen(ctx.generatedAt)}` : "Nothing yet"}
              open={openPanel === "context"}
              onToggle={() => setOpenPanel(openPanel === "context" ? null : "context")}
            >
              {!ctx ? (
                <div className="rounded-xl p-3.5 mb-3" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-faint)" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                    Nothing has been worked out yet. Once you save a story, we distil it into a short set of notes —
                    shown here in full, so you can always see exactly what a new page would be written from.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {ctx.summary && (
                    <div className="rounded-xl p-3.5" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a15)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-accent)" }}>Summary</p>
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--app-text)" }}>{ctx.summary}</p>
                    </div>
                  )}

                  {(ctx.tone || ctx.languageName) && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>Tone &amp; language</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ctx.tone && <Chip>{ctx.tone}</Chip>}
                        {ctx.languageName && <Chip>{ctx.languageName}</Chip>}
                      </div>
                    </div>
                  )}

                  {ctx.facts.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>Facts</p>
                      <ul className="space-y-1">
                        {ctx.facts.map((f) => (
                          <li key={f} className="text-[12.5px] leading-relaxed pl-3.5 relative" style={{ color: "var(--app-text-muted)" }}>
                            <span className="absolute left-0 top-[0.55em] w-1 h-1 rounded-full" style={{ background: "var(--app-accent)" }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ctx.milestones.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>Milestones</p>
                      <ul className="space-y-1.5">
                        {ctx.milestones.map((m) => (
                          <li key={`${m.label}-${m.when}`} className="flex items-baseline justify-between gap-3 px-3 py-2 rounded-xl" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-faint)" }}>
                            <span className="text-[12.5px] font-medium min-w-0" style={{ color: "var(--app-text)" }}>{m.label}</span>
                            <span className="text-[11px] shrink-0" style={{ color: "var(--app-text-faint)" }}>{m.when}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ctx.insideJokes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>Inside jokes</p>
                      <div className="flex flex-wrap gap-1.5">{ctx.insideJokes.map((j) => <Chip key={j}>{j}</Chip>)}</div>
                    </div>
                  )}

                  {ctx.petNames.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--app-text-faint)" }}>Pet names</p>
                      <div className="flex flex-wrap gap-1.5">{ctx.petNames.map((p) => <Chip key={p}>{p}</Chip>)}</div>
                    </div>
                  )}

                  <p className="text-[10px]" style={{ color: "var(--app-text-ultra-faint)" }}>
                    Built from {ctx.sourceStoryIds.length} {ctx.sourceStoryIds.length === 1 ? "story" : "stories"} · updated {formatWhen(ctx.generatedAt)}
                  </p>
                </div>
              )}

              {contextError && (
                <p className="text-[11px] mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>{contextError}</p>
              )}

              <button
                type="button"
                onClick={rebuildContext}
                disabled={rebuilding || stories.length === 0}
                className="w-full mt-3 min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: "var(--app-surface)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
              >
                {rebuilding
                  ? <><Loader2 size={14} className="animate-spin" /> Updating what we remember…</>
                  : <><RefreshCw size={14} /> Rebuild from my stories</>}
              </button>
              <p className="text-[10px] mt-1.5 text-center" style={{ color: "var(--app-text-ultra-faint)" }}>
                Reads every story again and re-writes these notes. Takes a few seconds.
              </p>
            </Disclosure>
          </>
        )}
      </div>
    </motion.div>
  );
}
