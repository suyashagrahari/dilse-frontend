"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  type VendingData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  vendingDataToBody,
  dbToVendingData,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";

const DRAFT_KEY = "vending-machine_draft";
const BASE = `${API_URL}/vending-machine-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "vending-machine";

// Draft is persisted to localStorage so a page refresh (or accidental tab close)
// keeps everything the user filled in. Falls back to sessionStorage if unavailable.
// This key and `vending-machine_unlocked_<shareId>` are the ONLY browser storage
// this template is allowed to use.
const draftStore = (): Storage | null => {
  try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
};
const saveDraft = (payload: unknown) => {
  try { draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch {}
};
const clearDraft = () => {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
};
const readDraft = (): { data?: VendingData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/**
 * Run editor state through the same coercion the recipient's page uses.
 *
 * `dbToVendingData` is the one place that knows A1 never vends and that at most
 * one slot may jam. Passing the form data through it means the preview is
 * byte-for-byte what the recipient will get — no second copy of those rules.
 */
const normalise = (d: VendingData): VendingData =>
  dbToVendingData(d as unknown as Record<string, unknown>);

export function useVendingMachineEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<VendingData>(DEMO_DATA);
  const [mf, setMf] = useState<VendingData>({ ...DEMO_DATA, slots: DEMO_DATA.slots.map((s) => ({ ...s })) });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // The labels and payloads on eight of the eighteen slots, plus the machine
  // name, the two names and the credit prompts. Slot A1 — the reserved
  // never-vends joke — and prices, codes and stock are not on the schema.
  const fill = useStoryFill<VendingData>({
    slug: "vending-machine",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter renders nothing at all
  // when this template has no schema.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a *new* preview should be shown → remounts the machine so
  // credit, the tray, sold-out state and the display all restart from zero with
  // the freshly-saved slots.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds draft when user tries to publish while unauthenticated → auto-resume after login.
  const pendingPublishRef = useRef<{ data: VendingData; password: string } | null>(null);

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

  // ── Load existing page (?edit=<id>) or restore a completed local draft ──────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToVendingData(result.data);
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

    // Restore a locally-saved draft on refresh. The typed form data (mf) always
    // comes back; if it was saved from the preview ("completed"), we also reopen
    // the preview so the machine is already stocked with their slots.
    const draft = readDraft();
    if (draft?.data) {
      setMf(draft.data);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(normalise(draft.data));
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume publish after successful auth ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(vendingDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "vending-machine", pageId: savedId, templateTitle: "Affection Dispenser" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is authored by the server. Never build it here.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          // The auth-deferred path: user hit Publish while logged out, logged in,
          // and this resumed automatically. Tracked separately from the direct
          // path so the login detour's completion rate is visible.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Machine stocked 🎰", message: "Your link is ready" });
        } else {
          track(EVENTS.PUBLISH_FAILED, {
            template: TEMPLATE,
            source: "auth_deferred",
            reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
          });
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft on every keystroke while the sheet is open ──────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(
    (key: keyof VendingData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized
      ? { ...content, slots: content.slots.map((s) => ({ ...s })) }
      : { ...DEMO_DATA, slots: DEMO_DATA.slots.map((s) => ({ ...s })) });
    // The starter goes first, but only while there is a schema to fill from and
    // only until the sender has said no once. Everything else opens the form
    // exactly as it did before.
    if (fill.schema && fill.mode !== "manual") {
      setStoryStarter(true);
      return;
    }
    setEditMode("manual");
  }, [isPersonalized, content, fill.schema, fill.mode]);

  /** The starter's only exit — into the same form Create would have opened. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content, slots: content.slots.map((s) => ({ ...s })) });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.senderName.trim()) { pushToast({ type: "info", title: "Put your name on the machine first" }); return; }
    const next = normalise(mf);
    setContent(next);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh machine: credit back to zero, tray empty, slots restocked
    saveDraft({ data: mf, password: pagePassword, completed: true });
    // The form was completed and the preview reached — the step before Publish.
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
    pushToast({ type: "success", title: "Restocked!", message: "Try it, then publish 🎰" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(vendingDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(vendingDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check so this measures *intent*.
    // The gap between this and PUBLISH_SUCCESS is the entire publish drop-off.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.senderName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_sender_name" });
      pushToast({ type: "info", title: "Your name is missing", message: "Add it in Edit — the machine needs an owner" });
      setEditMode("manual");
      setMf({ ...content, slots: content.slots.map((s) => ({ ...s })) });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      // AUTH-DEFERRED, not auth-gated: stash the intent and let the effect above
      // finish the job the moment the login lands.
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
        { slug: TEMPLATE, templateType: "vending-machine", pageId: id, templateTitle: "Affection Dispenser" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await fill.persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Machine stocked 🎰", message: "Your link is ready" });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          source: "direct",
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, fill]);

  const closeAuth = useCallback(() => { setShowAuth(false); pendingPublishRef.current = null; }, []);
  const closeAuthSuccess = useCallback(() => { setShowAuth(false); }, []);

  const handleCopy = useCallback((url?: string) => {
    const link = url || shareUrl;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    }
  }, [shareUrl, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "There's a machine here. Punch a code. 🎰",
      accent: "#0f766e",
      senderName: content.senderName,
      slug: "vending-machine",
    });
  }, [shareUrl, content.senderName, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    fill, storyStarter, openManualForm,

    setEditMode, setPagePassword, updateMf, setMf,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
