"use client";

// ─── Challan — the editor controller ─────────────────────────────────────────
//
// The house state machine, unchanged: one hook owns everything, `page.tsx` is a
// thin renderer, and three booleans (`isPersonalized`, `shareUrl`, `publishing`)
// drive the polymorphic top-bar button.
//
// Two things here are worth reading before editing:
//
//   1. PUBLISH IS AUTH-DEFERRED, NOT AUTH-GATED. Anyone may open the editor and
//      write a whole challan. Login is asked for at the Publish click, the
//      payload is stashed in a ref, and the effect below resumes the publish by
//      itself once auth lands. `persistStory()` runs in BOTH paths — the one
//      that published directly and the one that resumed — because that is what
//      makes this sender's NEXT template pre-fill itself.
//
//   2. NOTHING IN THIS FILE PARSES `totalFine`. It is free text from the form to
//      Mongo and back. "one date" is the demo value; `Number("one date")` is
//      NaN, and NaN on the TOTAL row of a challan is the one bug that stops the
//      joke working.

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";
import {
  DEMO_CHALLAN,
  challanDataToBody,
  dbToChallanData,
  type EditMode,
  type Toast,
} from "../components/demo";
import type { ChallanData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "challan";

const DRAFT_KEY = "challan_draft";
const BASE = `${API_URL}/challan-pages`;

const draftStore = (): Storage | null => {
  try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
};
const saveDraft = (payload: unknown) => { try { draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch {} };
const clearDraft = () => {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
};
const readDraft = (): { data?: ChallanData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function useChallanEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<ChallanData>(DEMO_CHALLAN);
  const [mf, setMf] = useState<ChallanData>({ ...DEMO_CHALLAN });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Inert until the server has a schema for this slug: `schema` stays null,
  // StoryStarter renders nothing, and Create falls back to the plain form.
  const storyFill = useStoryFill<ChallanData>({
    slug: "challan",
    demo: DEMO_CHALLAN,
    current: mf,
    onFilled: setMf,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pendingPublishRef = useRef<{ data: ChallanData; password: string } | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load existing page (?edit=<id>) or restore a completed draft ──
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToChallanData(result.data);
            setContent(d);
            setMf(d);
            setPageId(id);
            setIsPersonalized(true);
            setEditMode("preview");
            bumpPreview();
            if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
          }
        })
        .catch(() => {});
      return;
    }
    const draft = readDraft();
    if (draft?.data) {
      setMf(draft.data);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(draft.data);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume publish after auth ──
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(challanDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "challan", pageId: savedId, templateTitle: "Challan" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_resume" });
          pushToast({ type: "publish", title: "Published", message: "The challan is served" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft while editing ──
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback((key: keyof ChallanData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_CHALLAN });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  /** Create. Falls back to the plain form when there is no schema. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) { handleEditClick(); return; }
    seedManualForm();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [storySchema, handleEditClick, seedManualForm, setStoryMode]);

  /** StoryStarter's way out — the normal form, every field still hand-editable. */
  const handleStoryManual = useCallback(() => {
    setEditMode("manual");
  }, []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleSave = useCallback(() => {
    if (!mf.accused.name.trim()) { pushToast({ type: "info", title: "Name the accused first" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved", message: "Read it back, then publish" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(challanDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(challanDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!content.accused.name.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_accused_name" });
      pushToast({ type: "info", title: "Name the accused first", message: "Open Edit and add their name" });
      setEditMode("manual");
      setMf({ ...content });
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

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "challan", pageId: id, templateTitle: "Challan" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published", message: "The challan is served" });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, persistStory]);

  const closeAuth = useCallback(() => { setShowAuth(false); pendingPublishRef.current = null; }, []);
  const closeAuthSuccess = useCallback(() => { setShowAuth(false); }, []);

  const handleCopy = useCallback((url?: string) => {
    const link = url || shareUrl;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied" });
    }
  }, [shareUrl, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const text = `E-Challan ${content.challanNo}. Pay or contest.`;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "E-Challan",
      text,
      accent: "#b91c1c",
      slug: "challan",
    });
  }, [shareUrl, content.challanNo, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    setEditMode, setPagePassword, updateMf, setMf,
    storyFill, storyStarted, handleStartCreate, handleStoryManual,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied" : "Share",
  };
}
