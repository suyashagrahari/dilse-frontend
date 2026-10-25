"use client";

// ─── The Reception Night editor: form state, AI fill, save, publish ──────────
//
// Flow (the share-page-builder pattern): the demo invitation → Create → the AI
// guided questions (or "I'll fill it myself") → the stepped form, with the
// invitation itself as the live preview → Save shows the preview → Publish
// (sign in first when needed, then it publishes on its own) → Share.
//
// Every value that arrives from outside (a draft, a page reopened from the
// profile, the AI) goes through normalizeReception. Saves always send the
// original fields too (withLegacyFields keeps receptionDate / venue in step
// with the main event), so older readers of the page keep working.

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { openShareSheet } from "@/lib/share/shareBus";
import { useResumeDraft } from "@/lib/draft/resume";
import { useStoryFill } from "@/hooks/useStoryFill";
import { readAt, parsePath } from "@/lib/ai-fill/applyPatch";
import { DEMO_DATA, DEMO_EVENTS, type EditMode, type ReceptionData } from "../components/types";
import { normalizeReception, withLegacyFields } from "../components/model";
import { goBackFromTemplate } from "@/lib/backNav";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "reception";
const TITLE = "Reception Night";
const DRAFT_KEY = "reception_draft";
const WIP_KEY = "reception_mf_draft";
const STEP_KEY = "reception_step";

export const EDITOR_STEPS = [
  { id: "couple", label: "Couple", emoji: "💍" },
  { id: "evening", label: "Evening", emoji: "🥂" },
  { id: "photos", label: "Photos", emoji: "📸" },
  { id: "invite", label: "Invitation", emoji: "✉️" },
  { id: "story", label: "Story", emoji: "📖" },
  { id: "guests", label: "Guest info", emoji: "🧭" },
  { id: "look", label: "Look & music", emoji: "🎼" },
  { id: "send", label: "RSVP & send", emoji: "💌" },
] as const;

export const DEMO = normalizeReception(DEMO_DATA);

/** Everything the server stores, the original fields included. */
export function toBody(raw: ReceptionData, password: string) {
  const d = withLegacyFields(raw);
  return {
    brideName: d.brideName,
    groomName: d.groomName,
    receptionDate: d.receptionDate,
    venue: d.venue,
    venueAddress: d.venueAddress,
    venueMapQuery: d.venueMapQuery,
    venueTimings: d.venueTimings,
    tagline: d.tagline,
    heroImage: d.heroImage,
    bride: d.bride,
    groom: d.groom,
    families: d.families,
    galleryImages: d.galleryImages,
    sharePhoto: d.sharePhoto || "",
    events: d.events.filter((e) => e.title || e.venue || e.date),
    story: d.story.filter((c) => c.title || c.line),
    contacts: d.contacts.filter((c) => c.name && c.phone),
    things: d.things.filter((t) => t.text),
    music: d.music,
    theme: d.theme,
    lang: d.lang,
    invitation: d.invitation,
    hindiMessage: d.hindiMessage,
    blessingsOf: d.blessingsOf,
    hashtag: d.hashtag,
    closingLine: d.closingLine,
    gettingThere: d.gettingThere,
    videoUrl: d.videoUrl,
    liveUrl: d.liveUrl,
    upiId: d.upiId,
    upiName: d.upiName,
    rsvpBy: d.rsvpBy,
    maxGuests: d.maxGuests,
    rsvpMeal: d.rsvpMeal,
    password: password || "",
  };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

type Seg = NonNullable<ReturnType<typeof parsePath>>[number];
/** Set a leaf to "" (the parents must exist; nothing is created). */
function clearAt(root: unknown, segs: Seg[]) {
  let o: unknown = root;
  for (let i = 0; i < segs.length - 1; i++) {
    const s = segs[i];
    o = s.kind === "key" ? (o as Record<string, unknown> | null)?.[s.key] : (o as unknown[] | null)?.[s.index];
    if (!o || typeof o !== "object") return;
  }
  const last = segs[segs.length - 1];
  if (last.kind === "key") (o as Record<string, unknown>)[last.key] = "";
  else (o as unknown[])[last.index] = "";
}

/**
 * After an AI fill: clear what is still the DEMO's (a field the model left
 * empty would otherwise keep "Priya's" details), drop demo rows nobody wrote,
 * and copy the names where the page also prints them.
 */
export function tidyAfterFill(next: ReceptionData, before: ReceptionData, declared: string[]): ReceptionData {
  const d: ReceptionData = JSON.parse(JSON.stringify(next));
  // 1. Declared fields the model left as the demo had them (and the sender never changed).
  for (const path of declared) {
    if (path === "tagline" || path === "brideName" || path === "groomName") continue;
    const segs = parsePath(path);
    if (!segs) continue;
    const demoVal = readAt(DEMO, segs);
    if (!same(readAt(d, segs), demoVal) || !same(readAt(before, segs), demoVal)) continue;
    // A row the model rewrote keeps every value it wrote, even one that happens to
    // match the demo (a first part called "Wedding Reception", like the demo's).
    // Clearing that title would drop the whole row and its new date and venue.
    const row = segs.findIndex((s) => s.kind === "index");
    if (row > 0 && row < segs.length - 1) {
      const rowSegs = segs.slice(0, row + 1);
      if (!same(readAt(next, rowSegs), readAt(DEMO, rowSegs))) continue;
    }
    clearAt(d, segs);
  }
  // 2. Rows: an event / chapter / contact with nothing left is dropped; the
  //    undeclared demo details of a row the model rewrote are cleared.
  d.events = d.events
    .map((e, i) => {
      const demo = DEMO.events[i];
      if (!demo || !same(before.events[i], demo)) return e;
      return {
        ...e,
        address: e.address === demo.address ? "" : e.address,
        endTime: e.endTime === demo.endTime ? "" : e.endTime,
        note: e.note === demo.note ? "" : e.note,
        mapUrl: e.mapUrl === demo.mapUrl ? "" : e.mapUrl,
        dressColor: e.dressColor === demo.dressColor ? "" : e.dressColor,
      };
    })
    .filter((e) => e.title);
  // A part on the same night takes the main date when the model gave it none.
  const mainDate = d.events.find((e) => e.date)?.date ?? "";
  d.events = d.events.map((e) => (e.date || !mainDate ? e : { ...e, date: mainDate }));
  d.story = d.story
    .map((c, i) => (DEMO.story[i] && same(before.story[i], DEMO.story[i]) && c.when === DEMO.story[i].when ? { ...c, when: "" } : c))
    .filter((c) => c.title || c.line);
  d.contacts = d.contacts.filter((c) => c.name && c.phone);
  // 3. Undeclared demo details.
  if (same(before.things, DEMO.things)) d.things = [];
  if (before.gettingThere === DEMO.gettingThere) d.gettingThere = "";
  if (before.hashtag === DEMO.hashtag) d.hashtag = `#${d.brideName.replace(/\s+/g, "")}Weds${d.groomName.replace(/\s+/g, "")}`.slice(0, 40);
  for (const k of ["bride", "groom"] as const) {
    const p = d[k];
    const demo = DEMO[k];
    const first = k === "bride" ? d.brideName : d.groomName;
    if (before[k].name === demo.name) p.name = first;
    if (same(before[k].tags, demo.tags)) p.tags = [];
  }
  if (same(before.wishes, DEMO.wishes)) d.wishes = [];
  return d;
}

function readDraft(key: string): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function useReceptionEditor() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  const { pushToast } = useToast();

  const [ready, setReady] = useState(false);
  const [content, setContent] = useState<ReceptionData>(DEMO);
  const [mf, setMf] = useState<ReceptionData>(DEMO);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [step, setStep] = useState(0);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const pendingPublishRef = useRef<{ data: ReceptionData; password: string } | null>(null);
  // The post-sign-in effect takes the pending publish BEFORE AuthModal's
  // onSuccess runs; this tells closeAuthSuccess not to reopen the editor.
  const resumedPublishRef = useRef(false);
  /** True while the auth-deferred publish is creating the row (useDraft stands down). */
  const publishInFlightRef = useRef(false);
  /** The form as it was when the sender started the questions (tidyAfterFill compares against it). */
  const mfBeforeFill = useRef<ReceptionData>(DEMO);
  const declaredRef = useRef<string[]>([]);

  // ── AI guided fill ───────────────────────────────────────────────────────
  const fill = useStoryFill<ReceptionData>({
    slug: TEMPLATE,
    demo: DEMO,
    current: mf,
    onFilled: (n) => setMf(normalizeReception(tidyAfterFill(normalizeReception(n), mfBeforeFill.current, declaredRef.current))),
    namePaths: { recipient: "brideName", sender: "groomName" },
  });
  useEffect(() => {
    declaredRef.current = fill.schema?.fields.map((f) => f.path) ?? [];
  }, [fill.schema]);

  // ── Restore on mount: a saved preview, or names typed on a guest's page ──
  useEffect(() => {
    const saved = readDraft(DRAFT_KEY);
    if (saved) {
      const d = normalizeReception(saved);
      setContent(d);
      setMf(d);
      if (typeof saved.password === "string") setPagePassword(saved.password);
      if (saved.completed) {
        setIsPersonalized(true);
        setEditMode("preview");
      }
    } else {
      const pre = readDraft("reception_prefill");
      if (pre) {
        try {
          sessionStorage.removeItem("reception_prefill");
        } catch {}
        setMf((m) => ({ ...m, brideName: String(pre.brideName || m.brideName), groomName: String(pre.groomName || m.groomName) }));
      }
    }
    try {
      const s = Number(sessionStorage.getItem(STEP_KEY));
      if (s >= 0 && s < EDITOR_STEPS.length) setStep(s);
    } catch {}
    setReady(true);
  }, []);

  // Autosave the form while it is open, with a quiet "Saved" stamp.
  useEffect(() => {
    if (editMode !== "manual") return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(WIP_KEY, JSON.stringify(mf));
        sessionStorage.setItem(STEP_KEY, String(step));
        setSavedAt(Date.now());
      } catch {}
    }, 400);
    return () => window.clearTimeout(t);
  }, [mf, step, editMode]);

  const headers = useCallback(
    (token: string | null | undefined = accessToken) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);

  const updateMf = useCallback(<K extends keyof ReceptionData>(key: K, val: ReceptionData[K]) => setMf((p) => ({ ...p, [key]: val })), []);
  const patchMf = useCallback((patch: Partial<ReceptionData>) => setMf((p) => ({ ...p, ...patch })), []);

  // ── Entering the editor ──────────────────────────────────────────────────
  /** Create / Edit: the AI questions first (when there is a schema), else the form. */
  const handleEditClick = useCallback(() => {
    if (isPersonalized) {
      setMf(normalizeReception(content));
      setEditMode("manual");
      return;
    }
    const wip = readDraft(WIP_KEY);
    if (wip) {
      setMf(normalizeReception(wip));
      setEditMode("manual");
      return;
    }
    setMf(DEMO);
    mfBeforeFill.current = DEMO;
    setEditMode(fill.schema ? "ai" : "manual");
  }, [isPersonalized, content, fill.schema]);

  const startManual = useCallback(() => {
    fill.dismiss();
    setEditMode("manual");
  }, [fill]);

  /** "✦ Let AI write it" from inside the form. */
  const openAi = useCallback(() => {
    mfBeforeFill.current = mf;
    fill.reset();
    setEditMode("ai");
  }, [fill, mf]);

  const closeEditor = useCallback(() => {
    fill.dismiss();
    setEditMode(isPersonalized ? "preview" : null);
  }, [isPersonalized, fill]);

  // ── The printed card: a photo of it → the form (kept as a second door) ───
  const handleCardExtract = useCallback(
    async (images: string[]) => {
      if (images.length === 0) return;
      setExtractLoading(true);
      try {
        const res = await fetch(`${API_URL}/reception-pages/extract-card`, { method: "POST", headers: headers(), body: JSON.stringify({ images }) });
        const result = await res.json();
        if (result.success && result.data) {
          const x = result.data as Record<string, string>;
          setMf((prev) => {
            const ev0 = prev.events[0] ?? DEMO_EVENTS[0];
            const iso = /^\d{4}-\d{2}-\d{2}/.test(x.receptionDate || "") ? x.receptionDate : "";
            return normalizeReception({
              ...prev,
              brideName: x.brideName || prev.brideName,
              groomName: x.groomName || prev.groomName,
              tagline: x.tagline || prev.tagline,
              bride: { ...prev.bride, name: x.brideName || prev.bride.name, description: x.brideDescription || prev.bride.description },
              groom: { ...prev.groom, name: x.groomName || prev.groom.name, description: x.groomDescription || prev.groom.description },
              families: { bride: x.familyBride || prev.families.bride, groom: x.familyGroom || prev.families.groom },
              events: [
                {
                  ...ev0,
                  date: iso ? iso.slice(0, 10) : ev0.date,
                  time: iso && /T(\d{2}:\d{2})/.test(iso) ? iso.slice(11, 16) : ev0.time,
                  venue: x.venue || ev0.venue,
                  address: x.venueAddress || ev0.address,
                  note: "",
                },
                ...prev.events.slice(1),
              ],
            });
          });
          setEditMode("manual");
          setStep(0);
          pushToast({ type: "success", title: "Read your card", message: "Check every detail below" });
        } else {
          pushToast({ type: "info", title: "Couldn't read that card", message: result.error || "Try a clearer photo" });
        }
      } catch {
        pushToast({ type: "info", title: "Couldn't read that card", message: "Please try again" });
      } finally {
        setExtractLoading(false);
      }
    },
    [headers, pushToast],
  );

  // ── Save → preview ───────────────────────────────────────────────────────
  const handleSavePreview = useCallback(() => {
    if (!mf.brideName.trim() || !mf.groomName.trim()) {
      setStep(0);
      pushToast({ type: "info", title: "Add both names first", message: "The bride's and the groom's names are needed" });
      return false;
    }
    const d = withLegacyFields(mf);
    setContent(d);
    setIsPersonalized(true);
    setEditMode("preview");
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, password: pagePassword, completed: true }));
    } catch {}
    return true;
  }, [mf, pagePassword, pushToast]);

  const saveToServer = useCallback(
    async (data: ReceptionData, password?: string) => {
      if (!accessToken) return;
      const body = toBody(data, password ?? "");
      if (pageId) {
        const res = await fetch(`${API_URL}/reception-pages/${pageId}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
        return res.json();
      }
      const res = await fetch(`${API_URL}/reception-pages`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) setPageId(result.data._id);
      return result;
    },
    [accessToken, pageId, headers],
  );

  // ── Reopening from the profile (?edit=<id>) ─────────────────────────────
  useResumeDraft({
    base: `${API_URL}/reception-pages`,
    accessToken,
    // Every key, with the new fields EMPTY — an older page must not inherit the demo's story.
    defaults: normalizeReception({}, { fillEvents: false }),
    ready,
    onLoaded: (data, id) => {
      const d = normalizeReception(data);
      setContent(d);
      setMf(d);
      setPageId(id);
      setIsPersonalized(true);
      setEditMode("preview");
    },
  });

  // ── Auto-draft (signed-out work is promoted on sign-in) ──────────────────
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
      const r = await saveToServer(d, pagePassword);
      const id = r?.data?._id ? String(r.data._id) : pageId;
      return id || null;
    },
    onAdopted: (d) => {
      const n = normalizeReception(d);
      setContent(n);
      setMf(n);
      setIsPersonalized(true);
    },
  });

  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  // ── Publish ──────────────────────────────────────────────────────────────
  const publishWith = useCallback(
    async (data: ReceptionData, password: string, token: string, existingId: string | null) => {
      setPublishing(true);
      try {
        const h = headers(token);
        const body = toBody(data, password);
        let id = existingId;
        if (!id) {
          const res = await fetch(`${API_URL}/reception-pages`, { method: "POST", headers: h, body: JSON.stringify(body) });
          const result = await res.json();
          if (!result.success) throw new Error(result.error || "Create failed");
          id = String(result.data._id);
          setPageId(id);
        } else {
          const res = await fetch(`${API_URL}/reception-pages/${id}`, { method: "PUT", headers: h, body: JSON.stringify(body) });
          const result = await res.json().catch(() => ({}));
          if (!res.ok || result.success === false) throw new Error(result.error || "Save failed");
        }
        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet.
        const gate = await ensurePublishAllowed({ slug: TEMPLATE, templateType: "reception", pageId: id, templateTitle: TITLE }, setPublishing);
        if (gate === "cancelled") return;
        const pubRes = await fetch(`${API_URL}/reception-pages/${id}/publish`, { method: "POST", headers: h });
        const pub = await pubRes.json();
        if (pub.success) {
          setShareUrl(pub.data.shareUrl as string);
          setEditMode(null);
          try {
            sessionStorage.removeItem(DRAFT_KEY);
            sessionStorage.removeItem(WIP_KEY);
          } catch {}
          void fill.persistStory({ title: `${data.brideName} & ${data.groomName}'s reception` });
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
          pushToast({ type: "publish", title: "Published!", message: "Tap Share to send it" });
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: typeof pub?.error === "string" ? pub.error : "publish_rejected" });
          pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
        }
      } catch (e) {
        pushToast({ type: "info", title: "Publish failed", message: e instanceof Error && e.message.length < 90 ? e.message : "Please try again" });
      } finally {
        setPublishing(false);
        publishInFlightRef.current = false;
      }
    },
    [headers, pushToast, fill],
  );

  const handlePublish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      resumedPublishRef.current = false;
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    await publishWith(content, pagePassword, accessToken, pageId);
  }, [isAuthenticated, accessToken, content, pagePassword, pageId, publishWith]);

  // Auto-publish after sign-in when a publish was waiting.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    resumedPublishRef.current = true;
    publishInFlightRef.current = true;
    void publishWith(data, password, accessToken, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    const resumed = resumedPublishRef.current;
    resumedPublishRef.current = false;
    if (!pendingPublishRef.current && !resumed) setEditMode((m) => m ?? "preview");
  }, []);

  /** Save edits to an already-published page (the same link). */
  const handleSaveChanges = useCallback(async () => {
    if (!accessToken || !pageId) return;
    setSaving(true);
    try {
      const r = await saveToServer(content, pagePassword);
      if (r && r.success === false) throw new Error();
      pushToast({ type: "success", title: "Changes saved", message: "Your guests see them on the same link" });
    } catch {
      pushToast({ type: "info", title: "Save failed", message: "Please try again" });
    } finally {
      setSaving(false);
    }
  }, [accessToken, pageId, saveToServer, content, pagePassword, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      text: `${content.brideName} & ${content.groomName} warmly invite you to their wedding reception 🥂`,
      title: "Reception Invitation",
      cardTitle: "You are invited to our reception",
      cardNote: "Scan for the venue, the timings and the evening's programme.",
      senderName: `${content.brideName} & ${content.groomName}`,
      accent: "#B8892E",
      slug: "reception",
    });
  }, [shareUrl, pagePassword, content]);

  return {
    ready,
    content,
    mf,
    setMf,
    updateMf,
    patchMf,
    editMode,
    setEditMode,
    step,
    setStep,
    isPersonalized,
    pageId,
    shareUrl,
    showAuth,
    publishing,
    saving,
    extractLoading,
    pagePassword,
    setPagePassword,
    savedAt,
    accessToken,
    fill,
    goBack,
    handleEditClick,
    startManual,
    openAi,
    closeEditor,
    handleCardExtract,
    handleSavePreview,
    handlePublish,
    handleSaveChanges,
    handleShare,
    closeAuth,
    closeAuthSuccess,
  };
}

export type ReceptionEditor = ReturnType<typeof useReceptionEditor>;
