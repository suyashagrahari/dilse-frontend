"use client";

// ─── The Shaadi Card editor: state, AI fill, drafts, publish ────────────────
//
// `content` is what the preview shows; `mf` is the form. Save commits mf →
// content. Publish is auth-deferred (sign in, then it publishes by itself) and
// goes through the paywall gate exactly as before. Pages saved before the
// rebuild load through `fromDb` (model.ts), so editing an old page keeps its
// link and every field it had.
//
// AI: `useStoryFill` against the server schema (aiFill/shaadi-card.ts). The
// editor's own wedding questions (components/ai/ShaadiAi) compose a story;
// before the fill the form's untouched demo values are blanked (blankForAi),
// so the model writes every slot the sender has not typed in and an empty
// answer shows up as "still needs you" in the review. finishAi() then drops
// the rows nobody filled and derives each function's Hindi name, icon and
// dress code from its name.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK, SITE_URL } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { openShareSheet } from "@/lib/share/shareBus";
import { useStoryFill } from "@/hooks/useStoryFill";
import {
  AI_BLANK,
  DEMO,
  MAIN_RE,
  SLUG,
  displayClock,
  displayDay,
  fromDb,
  fromDraft,
  isHHMM,
  isIsoDay,
  joinWeddingDate,
  presetFor,
  toBody,
  withEventIds,
  type ShaadiCardData,
  type ShaadiEvent,
} from "../components/model";
import { goBackFromTemplate } from "@/lib/backNav";

const TEMPLATE = SLUG;
const DRAFT_KEY = "shaadi_card_draft";
const MF_KEY = "shaadi_card_mf_draft";

export type Sheet = "closed" | "form" | "ai";

const clone = <T,>(v: T): T => (typeof structuredClone === "function" ? structuredClone(v) : (JSON.parse(JSON.stringify(v)) as T));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Keep weddingDate in step with the day + time the form edits, and the people's names with the couple's. */
export function tidy(d: ShaadiCardData): ShaadiCardData {
  const weddingDate = joinWeddingDate(d.weddingDay, d.weddingTime) || d.weddingDate;
  const bride = d.bride.name === d.brideName ? d.bride : { ...d.bride, name: d.brideName };
  const groom = d.groom.name === d.groomName ? d.groom : { ...d.groom, name: d.groomName };
  if (weddingDate === d.weddingDate && bride === d.bride && groom === d.groom) return d;
  return { ...d, weddingDate, bride, groom };
}

/** A blank function row (the AI fills rows 0–4). */
export const blankEvent = (id: string): ShaadiEvent => ({ id, name: "", hindi: "", icon: "", date: "", time: "", isoDate: "", startTime: "", endTime: "", venue: "", address: "", mapUrl: "", dressCode: "", dressColor: "", details: "", accent: "", disabled: false });

/**
 * Before an AI fill: every value still exactly the demo's is emptied (the
 * demo couple's venues, dates, story and phone number must never survive on a
 * real couple's page), and the rows the schema writes into exist.
 */
export function blankForAi(cur: ShaadiCardData): ShaadiCardData {
  const n = clone(cur);
  const top: (keyof ShaadiCardData)[] = ["brideName", "groomName", "weddingDay", "venue", "invitation", "hindiMessage", "muhurat", "closingLine", "blessingsOf", "gettingThere", "hashtag"];
  for (const k of top) if (same(n[k], DEMO[k])) (n as unknown as Record<string, unknown>)[k] = "";
  if (same(n.things, DEMO.things)) n.things = [];
  if (n.brideFamily.parents === DEMO.brideFamily.parents) n.brideFamily.parents = "";
  if (n.groomFamily.parents === DEMO.groomFamily.parents) n.groomFamily.parents = "";
  if (n.brideFamily.grandparents === DEMO.brideFamily.grandparents) n.brideFamily.grandparents = "";
  if (n.groomFamily.grandparents === DEMO.groomFamily.grandparents) n.groomFamily.grandparents = "";
  if (n.bride.description === DEMO.bride.description) n.bride.description = "";
  if (n.groom.description === DEMO.groom.description) n.groom.description = "";
  if (same(n.bride.tags, DEMO.bride.tags)) n.bride.tags = [];
  if (same(n.groom.tags, DEMO.groom.tags)) n.groom.tags = [];
  // Function rows: a row still the demo's is emptied whole; at least five rows.
  n.events = n.events.map((e) => {
    const d = DEMO.events.find((x) => x.id === e.id);
    return d && e.name === d.name && e.isoDate === d.isoDate && e.venue === d.venue && (e.startTime || "") === (d.startTime || "") ? blankEvent(e.id || d.id || "") : e;
  });
  while (n.events.length < 5) n.events.push(blankEvent(""));
  n.events = withEventIds(n.events);
  n.story = n.story.map((c, i) => (DEMO.story[i] && c.title === DEMO.story[i].title && c.line === DEMO.story[i].line ? { when: "", title: "", line: "", photo: "", cropX: 50, cropY: 50, scale: 100 } : c));
  while (n.story.length < 2) n.story.push({ when: "", title: "", line: "", photo: "", cropX: 50, cropY: 50, scale: 100 });
  n.contacts = n.contacts.map((c, i) => (DEMO.contacts[i] && c.name === DEMO.contacts[i].name && c.phone === DEMO.contacts[i].phone ? { name: "", relation: "", phone: "" } : c));
  if (!n.contacts.length) n.contacts.push({ name: "", relation: "", phone: "" });
  return n;
}

/**
 * The model transliterates the names well but often misspells the fixed words
 * of the traditional sentence around them (measured: आसिम, आसमीन, साधर). When
 * its Hindi invitation is that sentence, rebuild it around its own names.
 */
export function canonicalNimantran(hi: string): string {
  const m = (hi || "").match(/से,\s*(.+?)\s+और\s+(.+?)\s+के\s+शुभ\s+विवाह/);
  if (!m || hi.length > 260) return hi;
  return `ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, ${m[1]} और ${m[2]} के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं।`;
}

/** A wedding is never in the past: a year-less date the model placed behind today moves to its next occurrence. */
export function nextOccurrence(iso: string, today = new Date()): string {
  if (!isIsoDay(iso)) return iso;
  const t0 = today.toISOString().slice(0, 10);
  const [y0, m, d] = iso.split("-").map(Number);
  let y = y0;
  const pad = (x: number) => String(x).padStart(2, "0");
  let out = iso;
  for (let k = 0; out < t0 && k < 5; k++) out = `${++y}-${pad(m)}-${pad(d)}`;
  return out;
}

/** Story chapters are the couple's past: a line announcing the wedding itself is not one. */
// (Narrow on purpose: "they met at a friend's wedding" is a real chapter.)
const ABOUT_THE_WEDDING = /getting married|will (?:get )?marry|(?:tie|tying) the knot/i;

/** Right after a fill, before the review: guards for what the live model got wrong in testing. */
export function afterFill(d: ShaadiCardData, typed: Partial<ShaadiCardData> = {}): ShaadiCardData {
  const shifted = (iso?: string) => (iso ? nextOccurrence(iso) : iso);
  return {
    ...d,
    brideName: typed.brideName || d.brideName,
    groomName: typed.groomName || d.groomName,
    hindiMessage: canonicalNimantran(d.hindiMessage),
    weddingDay: shifted(d.weddingDay) || "",
    events: d.events.map((e) => (e.isoDate ? { ...e, isoDate: shifted(e.isoDate) } : e)),
    story: d.story.map((c) => (ABOUT_THE_WEDDING.test(`${c.title} ${c.line}`) || /^(?:the|our) wedding$/i.test(c.title.trim()) ? { ...c, title: "", line: "" } : c)),
  };
}

/** "Smt. Radhika & Shri Sameer Khanna" / "The Khanna family" → "Khanna"; "" when there is none. */
export function surnameOf(parents: string): string {
  const words = (parents || "").replace(/\b(family|parivar|ji)\b/gi, " ").replace(/[^\p{L}\s.&-]/gu, " ").trim().split(/\s+/);
  const last = words[words.length - 1] || "";
  const title = /^(smt|shri|sri|mr|mrs|dr|late|the|&)\.?$/i;
  // A word straight after a title is a first name ("Shri Rajesh"), not a surname.
  if (words.length < 2 || !/^\p{Lu}[\p{L}-]{1,}$/u.test(last) || title.test(last) || (title.test(words[words.length - 2]) && !/^the$/i.test(words[words.length - 2]))) return "";
  return last;
}

/** After an AI fill (on "Looks good"): drop empty rows, derive what a function's name implies. */
export function finishAi(cur: ShaadiCardData, answers?: Partial<ShaadiCardData>): ShaadiCardData {
  const n = clone(cur);
  if (answers) {
    // What the sender typed into the questions wins where the model left a blank.
    if (answers.brideName && !n.brideName.trim()) n.brideName = answers.brideName;
    if (answers.groomName && !n.groomName.trim()) n.groomName = answers.groomName;
    if (answers.weddingDay && !n.weddingDay) n.weddingDay = answers.weddingDay;
    if (answers.weddingTime) n.weddingTime = answers.weddingTime;
    if (answers.venue && !n.venue.trim()) n.venue = answers.venue;
    if (answers.nameOrder) n.nameOrder = answers.nameOrder;
    if (answers.lang) n.lang = answers.lang;
    if (answers.blessingsOf && !n.blessingsOf.trim()) n.blessingsOf = answers.blessingsOf;
    if (answers.brideFamily?.parents && !n.brideFamily.parents.trim()) n.brideFamily.parents = answers.brideFamily.parents;
    if (answers.groomFamily?.parents && !n.groomFamily.parents.trim()) n.groomFamily.parents = answers.groomFamily.parents;
  }
  n.events = withEventIds(
    n.events
      .filter((e) => e.name.trim() || e.venue.trim())
      .map((e) => {
        const p = presetFor(e.name);
        const startTime = isHHMM(e.startTime) ? e.startTime : "";
        return {
          ...e,
          name: e.name.trim() || "Celebration",
          hindi: p?.hindi ?? e.hindi ?? "",
          icon: p?.icon ?? (e.icon || "🎊"),
          accent: p?.accent ?? e.accent ?? "",
          dressCode: e.dressCode || p?.dress || "",
          dressColor: e.dressColor || p?.color || "",
          startTime,
          date: isIsoDay(e.isoDate) ? displayDay(e.isoDate) : e.date,
          time: startTime ? displayClock(startTime) : e.time,
        };
      }),
  );
  // The main ceremony carries the wedding's own day and time when it has none.
  const main = n.events.find((e) => MAIN_RE.test(e.name));
  if (main) {
    if (!main.isoDate && n.weddingDay) {
      main.isoDate = n.weddingDay;
      main.date = displayDay(n.weddingDay);
    }
    if (!main.startTime && isHHMM(n.weddingTime)) {
      main.startTime = n.weddingTime;
      main.time = displayClock(n.weddingTime);
    }
    if (!n.weddingDay && main.isoDate) n.weddingDay = main.isoDate;
  }
  n.story = n.story.filter((c) => c.title.trim() || c.line.trim());
  n.contacts = n.contacts.filter((c) => c.name.trim() && c.phone.trim());
  n.things = n.things.filter((t) => t.trim());
  n.hindiMessage = canonicalNimantran(n.hindiMessage);
  // Both families' surnames known: sign the page from the families (the model was unreliable here).
  const a = surnameOf(n.brideFamily.parents);
  const b = surnameOf(n.groomFamily.parents);
  if (a && b && (!n.closingLine.trim() || /^With love, [^&]+ & [^&]+$/.test(n.closingLine.trim()))) n.closingLine = a === b ? `With love, the ${a} families` : `With love, the ${a} & ${b} families`;
  return tidy(n);
}

export function useShaadiCardEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  const { pushToast } = useToast();

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const [content, setContent] = useState<ShaadiCardData>(DEMO);
  const [mf, setMfRaw] = useState<ShaadiCardData>(DEMO);
  const setMf = useCallback((next: ShaadiCardData | ((p: ShaadiCardData) => ShaadiCardData)) => setMfRaw((p) => tidy(typeof next === "function" ? next(p) : next)), []);
  const [sheet, setSheet] = useState<Sheet>("closed");
  const [step, setStep] = useState(0);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [replay, setReplay] = useState(0);
  const [extractLoading, setExtractLoading] = useState(false);

  const pendingPublishRef = useRef<{ data: ShaadiCardData; password: string } | null>(null);
  const publishInFlightRef = useRef(false);

  // ── AI ─────────────────────────────────────────────────────────────────────
  const fill = useStoryFill<ShaadiCardData>({ slug: SLUG, demo: AI_BLANK, current: mf, onFilled: (next) => setMf(next) });

  // ── Restore a draft (new or old shape) ─────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        const d = fromDraft(saved);
        if (d) {
          setContent(tidy(d));
          setMf(d);
          if (typeof saved.password === "string") setPagePassword(saved.password);
          setIsPersonalized(true);
          return;
        }
      }
      const wip = sessionStorage.getItem(MF_KEY);
      if (wip) {
        const d = fromDraft(JSON.parse(wip));
        if (d) setMf(d);
      }
    } catch {
      /* a broken draft: start from the demo */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the form while it is open (a quiet "Saved" stamp).
  useEffect(() => {
    if (sheet === "closed") return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(MF_KEY, JSON.stringify(mf));
        setSavedAt(Date.now());
      } catch {
        /* storage full (big photos): the server draft still saves */
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [mf, sheet]);

  const headers = useCallback(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) }),
    [accessToken],
  );

  // ── ?edit=<id>: load an existing page (old or new) ─────────────────────────
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !accessToken || !ready) return;
    fetch(`${API_URL}/shaadi-card-pages/${editId}`, { headers: { Authorization: `Bearer ${accessToken}`, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) } })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const loaded = fromDb(result.data as Record<string, unknown>);
          setContent(loaded);
          setMf(loaded);
          setPageId(editId);
          setIsPersonalized(true);
          if (result.data.isPublished && result.data.shareId) {
            setShareId(String(result.data.shareId));
            setShareUrl(`${SITE_URL.replace(/\/$/, "")}/${result.data.shareId}`);
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, ready]);

  // A prefill from the viewer's "Make your own" (names only).
  useEffect(() => {
    if (!ready) return;
    try {
      const raw = sessionStorage.getItem("shaadi_card_prefill");
      if (!raw) return;
      sessionStorage.removeItem("shaadi_card_prefill");
      const p = JSON.parse(raw) as { brideName?: string; groomName?: string };
      setMf((prev) => ({ ...prev, brideName: p.brideName || prev.brideName, groomName: p.groomName || prev.groomName }));
      setSheet("form");
    } catch {
      /* nothing to prefill */
    }
  }, [ready, setMf]);

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);

  /** Commit the form into the preview (and the session draft). */
  const commit = useCallback(
    (data: ShaadiCardData = mf) => {
      const d = tidy(data);
      setContent(d);
      setIsPersonalized(true);
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, password: pagePassword, completed: true }));
      } catch {
        /* fine */
      }
      return d;
    },
    [mf, pagePassword],
  );

  const openForm = useCallback(
    (atStep?: number) => {
      if (isPersonalized) setMf(content);
      if (typeof atStep === "number") setStep(atStep);
      setSheet("form");
    },
    [isPersonalized, content, setMf],
  );

  /** Create / Edit: first time with a schema → the AI questions; otherwise the form. */
  const handleEditClick = useCallback(() => {
    if (!isPersonalized && fill.schema) {
      fill.setMode("idle");
      setSheet("ai");
      return;
    }
    openForm();
  }, [isPersonalized, fill, openForm]);

  const openAi = useCallback(() => {
    fill.setMode("idle");
    setSheet("ai");
  }, [fill]);

  const closeSheet = useCallback(() => setSheet("closed"), []);

  const handleSave = useCallback(() => {
    commit();
    setSavedAt(Date.now());
    pushToast({ type: "success", title: "Saved", message: "Your invitation is updated" });
  }, [commit, pushToast]);

  const handlePreview = useCallback(() => {
    commit();
    setSheet("closed");
  }, [commit]);

  const updateMf = useCallback(<K extends keyof ShaadiCardData>(key: K, val: ShaadiCardData[K]) => setMf((p) => ({ ...p, [key]: val })), [setMf]);

  // ── Card photo → AI extraction (kept as a secondary option) ────────────────
  const handleCardExtract = useCallback(
    async (files: File[]) => {
      if (!files.length) return false;
      if (!accessToken) {
        pushToast({ type: "info", title: "Sign in to read a card", message: "Or answer the questions instead" });
        return false;
      }
      setExtractLoading(true);
      try {
        const images = await Promise.all(
          files.slice(0, 3).map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as string);
                r.onerror = reject;
                r.readAsDataURL(file);
              }),
          ),
        );
        const res = await fetch(`${API_URL}/shaadi-card-pages/extract-card`, { method: "POST", headers: headers(), body: JSON.stringify({ images }) });
        const data = await res.json();
        if (!data.success || !data.data) {
          pushToast({ type: "info", title: "Could not read the card", message: data.error || "Try the questions instead" });
          return false;
        }
        const x = data.data as Record<string, unknown>;
        const str = (v: unknown) => (typeof v === "string" ? v : "");
        const base = blankForAi(mf);
        const evs = Array.isArray(x.events) ? (x.events as Record<string, unknown>[]) : [];
        const next: ShaadiCardData = {
          ...base,
          brideName: str(x.brideName) || base.brideName,
          groomName: str(x.groomName) || base.groomName,
          weddingDay: str(x.weddingDate).slice(0, 10) || base.weddingDay,
          weddingTime: str(x.weddingDate).slice(11, 16) || base.weddingTime,
          venue: str(x.venue) || base.venue,
          blessing: str(x.blessing) || base.blessing,
          bride: { ...base.bride, description: str(x.brideDescription) },
          groom: { ...base.groom, description: str(x.groomDescription) },
          brideFamily: { ...base.brideFamily, parents: str(x.brideFamilyParents), grandparents: str(x.brideFamilyGrandparents) },
          groomFamily: { ...base.groomFamily, parents: str(x.groomFamilyParents), grandparents: str(x.groomFamilyGrandparents) },
          events: evs.length
            ? evs.map((e, i) => ({ ...blankEvent(`e${i}`), name: str(e.name), hindi: str(e.hindi), date: str(e.date), time: str(e.time), venue: str(e.venue), details: str(e.details) }))
            : base.events,
        };
        setMf(finishAi(next));
        setSheet("form");
        setStep(0);
        pushToast({ type: "success", title: "Read your card", message: "Check every detail below" });
        return true;
      } catch {
        pushToast({ type: "info", title: "Could not read the card", message: "Try the questions instead" });
        return false;
      } finally {
        setExtractLoading(false);
      }
    },
    [accessToken, headers, mf, pushToast, setMf],
  );

  // ── Server save / draft ────────────────────────────────────────────────────
  const saveToServer = useCallback(
    async (data: ShaadiCardData, password?: string) => {
      if (!accessToken) return;
      const body = toBody(data, password);
      if (pageId) {
        const res = await fetch(`${API_URL}/shaadi-card-pages/${pageId}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
        return res.json();
      }
      const res = await fetch(`${API_URL}/shaadi-card-pages`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        setPageId(result.data._id);
        setShareId(result.data.shareId);
      }
      return result;
    },
    [accessToken, pageId, headers],
  );

  const draft = useDraft({
    publishInFlight: publishInFlightRef,
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing || saving,
    isAuthenticated,
    accessToken,
    pageId,
    persist: async (d) => {
      setSaving(true);
      try {
        const r = await saveToServer(d, pagePassword);
        const id = r?.data?._id ? String(r.data._id) : pageId;
        return id || null;
      } finally {
        setSaving(false);
      }
    },
    onAdopted: (d) => {
      setContent(d);
      setMf(d);
      setIsPersonalized(true);
    },
  });

  useEffect(() => {
    if (sheet === "closed" && isPersonalized) void draft.saveNow();
  }, [sheet, isPersonalized, draft]);

  // ── Publish (auth-deferred) ────────────────────────────────────────────────
  const finishPublish = useCallback(
    (publishedShareId: string, fallbackUrl: string) => {
      const url = publishedShareId ? `${SITE_URL.replace(/\/$/, "")}/${publishedShareId}` : fallbackUrl;
      setShareUrl(url);
      setShareId(publishedShareId);
      setSheet("closed");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(MF_KEY);
      } catch {
        /* fine */
      }
      void fill.persistStory?.();
      pushToast({ type: "publish", title: "Published! 🪔", message: "Tap Share to send it" });
    },
    [fill, pushToast],
  );

  const publishData = useCallback(
    async (data: ShaadiCardData, password: string, auth: Record<string, string>, existingId: string | null) => {
      setPublishing(true);
      try {
        let id = existingId;
        const body = toBody(data, password);
        if (!id) {
          const res = await fetch(`${API_URL}/shaadi-card-pages`, { method: "POST", headers: auth, body: JSON.stringify(body) });
          const result = await res.json();
          if (!result.success) throw new Error("Create failed");
          id = String(result.data._id);
          setPageId(id);
          if (result.data.shareId) setShareId(String(result.data.shareId));
        } else {
          await fetch(`${API_URL}/shaadi-card-pages/${id}`, { method: "PUT", headers: auth, body: JSON.stringify(body) });
        }
        const gate = await ensurePublishAllowed({ slug: TEMPLATE, templateType: "shaadi", pageId: id, templateTitle: "Animated Shaadi Card" }, setPublishing);
        if (gate === "cancelled") return;
        const pubRes = await fetch(`${API_URL}/shaadi-card-pages/${id}/publish`, { method: "POST", headers: auth });
        const pub = await pubRes.json();
        if (pub.success) {
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
          finishPublish(String(pub.data.shareId || ""), String(pub.data.shareUrl || ""));
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: typeof pub?.error === "string" ? pub.error : "publish_rejected" });
          pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "network_error" });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    },
    [finishPublish, pushToast],
  );

  const handlePublish = useCallback(async () => {
    const data = sheet === "form" ? commit() : content;
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!data.brideName.trim() || !data.groomName.trim()) {
      pushToast({ type: "info", title: "Add both names first", message: "The bride's and the groom's names" });
      setStep(0);
      setSheet("form");
      return;
    }
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data, password: pagePassword };
      setShowAuth(true);
      return;
    }
    await publishData(data, pagePassword, headers(), pageId);
  }, [sheet, commit, content, isAuthenticated, accessToken, pagePassword, publishData, headers, pageId, pushToast]);

  // Signed in with a publish waiting: publish it.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    publishInFlightRef.current = true;
    void publishData(data, password, { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) }, null).finally(() => {
      publishInFlightRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const couple = `${content.brideName || "Bride"} & ${content.groomName || "Groom"}`;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      text: `${couple} invite you to their wedding 🪔`,
      title: "Wedding Invitation",
      cardTitle: "You are invited to our wedding",
      cardNote: "Scan for the functions, the venue and the RSVP.",
      senderName: couple,
      accent: "#c2185b",
      slug: TEMPLATE,
    });
  }, [shareUrl, pagePassword, content]);

  const previewData = useMemo(() => (sheet === "closed" ? content : mf), [sheet, content, mf]);

  return {
    ready,
    content,
    mf,
    setMf,
    updateMf,
    previewData,
    sheet,
    setSheet,
    step,
    setStep,
    isPersonalized,
    pageId,
    shareUrl,
    shareId,
    accessToken,
    showAuth,
    pagePassword,
    setPagePassword,
    publishing,
    saving,
    savedAt,
    replay,
    replayOpening: () => setReplay((r) => r + 1),
    extractLoading,
    fill,
    goBack,
    handleEditClick,
    openForm,
    openAi,
    closeSheet,
    handleSave,
    handlePreview,
    handleCardExtract,
    handlePublish,
    handleShare,
    closeAuth,
    closeAuthSuccess,
    commit,
  };
}

export type ShaadiEditor = ReturnType<typeof useShaadiCardEditor>;
