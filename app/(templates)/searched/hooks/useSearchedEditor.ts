// ─── The editor, all of it ───────────────────────────────────────────────────
//
// One hook owns every piece of state; `page.tsx` renders over it. Three
// booleans drive the dock's polymorphic button — `isPersonalized`, `shareUrl`,
// `publishing` — and the publish is auth-DEFERRED: anyone can build the page,
// login is asked for only at Publish, and the publish resumes by itself.
//
// The AI fill writes structured rows (results, questions, places…) as pipe
// strings; `normaliseSearchData` turns them into rows at every boundary.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";
import type { SearchData } from "../components/types";
import { DEMO_DATA, searchedDataToBody } from "../components/demoData";
import { dbToSearchData, normaliseSearchData, personaliseLeftovers } from "../components/coerce";

const TEMPLATE = "searched";
const DRAFT_KEY = "searched_draft";
const BASE = `${API_URL}/searched-pages`;

export type EditMode = null | "preview" | "manual";

/* ── Draft (survives a refresh) ───────────────────────────────────────────── */

const store = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
};
const saveDraft = (payload: unknown) => {
  try {
    store()?.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota — a lost draft is survivable */
  }
};
const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {}
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
};
const readDraft = (): { data?: unknown; password?: string; completed?: boolean } | null => {
  try {
    const raw = store()?.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** What Save needs. Everything else has a sensible default. */
export function missingForSave(d: SearchData): string[] {
  const out: string[] = [];
  if (!d.recipient.name.trim()) out.push("their name");
  if (!d.sender.name.trim()) out.push("your name");
  return out;
}

/** Blank rows are fine while typing, not on the published page. */
function cleanData(d: SearchData): SearchData {
  const n = normaliseSearchData(d);
  const s = (v: string) => v.trim();
  return {
    ...n,
    sender: { name: s(n.sender.name) },
    recipient: { name: s(n.recipient.name) },
    autocomplete: n.autocomplete.map(s).filter(Boolean),
    aiPoints: n.aiPoints.map(s).filter(Boolean),
    relatedSearches: n.relatedSearches.map(s).filter(Boolean),
    knowledgePanel: { ...n.knowledgePanel, alsoSearchFor: n.knowledgePanel.alsoSearchFor.map(s).filter(Boolean) },
    resultCount: s(n.resultCount) || DEMO_DATA.resultCount,
    searchSeconds: s(n.searchSeconds) || DEMO_DATA.searchSeconds,
  };
}

export function useSearchedEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<SearchData>(DEMO_DATA);
  const [mf, setMf] = useState<SearchData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);
  const [showAuth, setShowAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { pushToast } = useToast();

  const pendingPublishRef = useRef<{ data: SearchData; password: string } | null>(null);
  /** Tells `useDraft`'s adoption to stand down while the resumed publish owns the row. */
  const publishInFlightRef = useRef(false);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Held RAW while the AI review is on screen (its list editors read plain
  // strings); normalised the moment the form opens.
  const applyFilled = useCallback((next: SearchData) => setMf(next), []);
  const storyFill = useStoryFill<SearchData>({
    slug: TEMPLATE,
    demo: DEMO_DATA,
    current: mf,
    onFilled: applyFilled,
    namePaths: { sender: "sender.name", recipient: "recipient.name" },
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  // ── Load an existing page (?edit=<id>) or restore the draft ────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (!result?.success || !result.data) return;
          const d = dbToSearchData(result.data);
          setContent(d);
          setMf(d);
          setPageId(id);
          setIsPersonalized(true);
          setEditMode("preview");
          bumpPreview();
          if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
        })
        .catch(() => {});
      return;
    }
    const draft = readDraft();
    if (draft?.data && typeof draft.data === "object") {
      const d = dbToSearchData(draft.data as Record<string, unknown>, false);
      setMf(d);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(d);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume the publish after login ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    publishInFlightRef.current = true;
    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(searchedDataToBody(data, password)) });
        const result = await res.json();
        if (!result?.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "searched", pageId: savedId, templateTitle: "Searched" },
          setPublishing,
        );
        if (gate === "cancelled") return;
        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult?.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Indexed 🔍", message: "Tap Share to send it" });
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "publish_rejected" });
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        publishInFlightRef.current = false;
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Autosave the work in progress ──────────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: searchedDataToBody(mf), password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(<K extends keyof SearchData>(key: K, val: SearchData[K]) => setMf((p) => ({ ...p, [key]: val })), []);

  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  /** Create. Falls back to the plain form when there is no AI schema. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) {
      handleEditClick();
      return;
    }
    seedManualForm();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [storySchema, handleEditClick, seedManualForm, setStoryMode]);

  /** StoryStarter's way out — the form, every field still hand-editable. */
  const handleStoryManual = useCallback(() => {
    setMf((m) => normaliseSearchData(m));
    setEditMode("manual");
  }, []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleSave = useCallback(() => {
    const missing = missingForSave(mf);
    if (missing.length) {
      pushToast({ type: "info", title: "Almost there", message: `Add ${missing.join(" and ")} first` });
      return;
    }
    const clean = personaliseLeftovers(cleanData(mf));
    setContent(clean);
    setMf(clean);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: searchedDataToBody(clean), password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword), results: clean.results.length, photos: clean.photos.length });
    pushToast({ type: "success", title: "Saved", message: "Watch it type their name, then publish" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(searchedDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result?.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(searchedDataToBody(content, pagePassword)) });
    },
    [content, pagePassword, headers],
  );

  // ── Auto-draft (signed-out work promoted to a real draft on sign-in) ───────
  const draft = useDraft({
    publishInFlight: publishInFlightRef,
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing,
    isAuthenticated,
    accessToken,
    pageId,
    persist: (d) => persistDraft({ base: BASE, headers: headers(), pageId, setPageId, body: searchedDataToBody(d, pagePassword) }),
    onAdopted: (d) => {
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
      // The preview is keyed on previewVersion; re-seat it or it keeps the demo.
      bumpPreview();
    },
  });

  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    const missing = missingForSave(content);
    if (missing.length || !isPersonalized) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "incomplete" });
      pushToast({ type: "info", title: "Finish the page first", message: missing.length ? `Add ${missing.join(" and ")}` : "Tap Create" });
      setMf({ ...content });
      setEditMode("manual");
      return;
    }
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("Save failed");
      const gate = await ensurePublishAllowed({ slug: TEMPLATE, templateType: "searched", pageId: id, templateTitle: "Searched" }, setPublishing);
      if (gate === "cancelled") return;
      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult?.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Indexed 🔍", message: "Tap Share to send it" });
      } else {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "publish_rejected" });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, isPersonalized, accessToken, pageId, create, update, headers, pushToast, persistStory]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const first = content.recipient.name.trim().split(/\s+/)[0] || "you";
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Go on. Search your name. 🔍",
      text: `${first}, search your name. The internet has opinions. 🔍`,
      accent: "#E8445E",
      slug: TEMPLATE,
    });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [shareUrl, pagePassword, content.recipient.name]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  return {
    content,
    mf,
    displayData,
    editMode,
    pagePassword,
    pageId,
    shareUrl,
    isPersonalized,
    showAuth,
    publishing,
    previewVersion,
    storyFill,
    storyStarted,
    setEditMode,
    setPagePassword,
    updateMf,
    setMf,
    handleStartCreate,
    handleStoryManual,
    handleEditClick,
    handleEditFromPreview,
    handleSave,
    publish,
    closeAuth,
    closeAuthSuccess,
    handleShare,
    goBack,
    pushToast,
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Shared" : "Share",
  };
}
