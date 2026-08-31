"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { SearchData } from "../components/types";
import { DEMO_DATA, retargetToRecipient, searchedDataToBody } from "../components/demoData";
import { dbToSearchData } from "../components/coerce";
import { openShareSheet } from "@/lib/share/shareBus";
import { publishFetch } from "@/lib/paywall/publishRequest";

const BASE = `${API_URL}/searched-pages`;
const TEMPLATE = "searched";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "info" | "success" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/* ── Draft handling ──────────────────────────────────────────────────────────
 *
 * The draft lives in component state and NOWHERE ELSE. No localStorage, no
 * sessionStorage: everything the sender types is being written about a real
 * person, and this template in particular ends with a letter. It does not get
 * left behind on a shared laptop for the next person to open the tab and find.
 *
 * The cost is honest and small: a refresh loses the draft. The editor never
 * claims otherwise.
 */

export const MAX_SUGGESTIONS = 6;
export const MAX_RESULTS = 8;
export const MAX_PAA = 5;
export const MAX_RESERVE = 5;
export const MAX_FACTS = 8;
export const MAX_RELATED = 8;
export const MAX_IMAGES = 12;

/** A page needs a name and something to find. */
export function validate(d: SearchData): string | null {
  if (!d.recipient.name.trim()) return "Their name is the whole page — it is the wordmark, the box and the panel.";
  if (d.autocomplete.filter((s) => s.trim()).length === 0) return "One autocomplete line, at least. It is the first joke they see.";
  if (d.results.filter((r) => r.title.trim()).length === 0) return "One result, at least. The last one should be the letter.";
  return null;
}

/** Blank rows are fine to keep typing on; they are not fine to publish. */
export function cleanData(d: SearchData): SearchData {
  const name = d.recipient.name.trim();
  return {
    ...d,
    sender: { name: d.sender.name.trim() },
    recipient: { name, photoUrl: d.recipient.photoUrl.trim() },
    autocomplete: d.autocomplete.map((s) => s.trim()).filter(Boolean).slice(0, MAX_SUGGESTIONS),
    didYouMean: d.didYouMean?.trim() || undefined,
    resultCount: d.resultCount.trim() || DEMO_DATA.resultCount,
    searchSeconds: d.searchSeconds.trim() || DEMO_DATA.searchSeconds,
    results: d.results
      .filter((r) => r.title.trim())
      .slice(0, MAX_RESULTS)
      .map((r, i) => ({
        ...r,
        id: r.id || `r${i + 1}`,
        title: r.title.trim(),
        url: r.url.trim(),
        snippet: r.snippet.trim(),
        page: r.page && (r.page.title.trim() || r.page.body.some((p) => p.trim()))
          ? { ...r.page, title: r.page.title.trim(), url: (r.page.url || r.url).trim(), body: r.page.body.map((p) => p.trim()).filter(Boolean) }
          : undefined,
        badge: r.badge?.trim() || undefined,
      })),
    paa: d.paa.filter((p) => p.question.trim() && p.answer.trim()).slice(0, MAX_PAA),
    paaReserve: d.paaReserve.filter((p) => p.question.trim() && p.answer.trim()).slice(0, MAX_RESERVE),
    knowledgePanel: {
      ...d.knowledgePanel,
      subtitle: d.knowledgePanel.subtitle.trim(),
      description: d.knowledgePanel.description.trim(),
      facts: d.knowledgePanel.facts.filter((f) => f.label.trim() || f.value.trim()).slice(0, MAX_FACTS),
      quote: d.knowledgePanel.quote?.trim() || undefined,
      alsoSearchFor: d.knowledgePanel.alsoSearchFor.map((s) => s.trim()).filter(Boolean),
    },
    relatedSearches: d.relatedSearches.map((s) => s.trim()).filter(Boolean).slice(0, MAX_RELATED),
    images: d.images.filter((im) => im.url.trim()).slice(0, MAX_IMAGES),
  };
}

export function useSearchedEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<SearchData>(DEMO_DATA);
  const [mf, setMf] = useState<SearchData>(DEMO_DATA);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toastIdRef = useRef(0);
  const hasWipRef = useRef(false);
  const pendingPublishRef = useRef<{ data: SearchData; password: string } | null>(null);

  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  //
  // Inert when the server has no schema for this slug: `schema` stays null,
  // StoryStarter renders nothing and the entry points below fall straight back
  // to the sheet this editor has always shown. Only the sender-authored copy is
  // declared — the result urls and the wordmark are the template's own and
  // stay under the deny-list checks in `components/types.ts`.
  /** Anything a fill writes is work in progress — a re-seed must never eat it. */
  const applyStoryFill = useCallback((next: SearchData) => {
    hasWipRef.current = true;
    setMf(next);
  }, []);

  const storyFill = useStoryFill<SearchData>({
    slug: "searched",
    demo: DEMO_DATA,
    current: mf,
    onFilled: applyStoryFill,
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

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 6000 : 3500;
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load an existing page (?edit=<id>) ──────────────────────────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;
    let cancelled = false;
    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (cancelled || !result?.success || !result.data) return;
        const d = dbToSearchData(result.data);
        setContent(d);
        setMf(d);
        hasWipRef.current = false;
        setPageId(id);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
        if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, searchParams, headers, bumpPreview]);

  // ── Auto-resume the publish the moment they come back logged in ─────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    (async () => {
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(searchedDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result?.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await publishFetch(
          { slug: TEMPLATE, templateType: "searched", pageId: savedId, templateTitle: "Searched" },
          () => fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() })
        );
        const pubResult = await pubRes.json();
        if (pubResult?.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          // Never throws, never blocks — the page is already live either way.
          await persistStory();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published 🔍", message: "Send it. Let them type their own name.", shareUrl: String(pubResult.data.shareUrl) });
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "publish_rejected" });
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
  }, [isAuthenticated, accessToken, headers, pushToast, persistStory]);

  const displayData = editMode === "manual" ? mf : content;

  /**
   * Every field edit funnels through here. Changing the recipient's name also
   * rewrites the copy, so the jokes never end up addressed to the demo person.
   */
  const updateMf = useCallback((next: Partial<SearchData> | ((cur: SearchData) => SearchData)) => {
    hasWipRef.current = true;
    setMf((cur) => (typeof next === "function" ? next(cur) : { ...cur, ...next }));
  }, []);

  const setRecipientName = useCallback((name: string) => {
    hasWipRef.current = true;
    setMf((cur) => retargetToRecipient(cur, cur.recipient.name, name));
  }, []);

  const updatePassword = useCallback((v: string) => {
    hasWipRef.current = true;
    setPagePassword(v);
  }, []);

  const openSheet = useCallback(() => {
    // Work in progress always wins over re-seeding, in both open paths.
    setMf((cur) => (hasWipRef.current ? cur : isPersonalized ? { ...content } : { ...DEMO_DATA }));
    setEditMode("manual");
  }, [isPersonalized, content]);

  // ── StoryStarter entry points ──────────────────────────────────────────────
  //
  // The manual form is opened and seeded FIRST, then StoryStarter is laid over
  // it. "I'll fill it in myself" therefore reveals exactly the sheet this
  // editor has always shown, and a generated draft lands in an `mf` that was
  // seeded from the right place. Nothing ever becomes read-only.
  const openStoryStarter = useCallback(() => {
    openSheet();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [openSheet, setStoryMode]);

  /** Create tap. With no schema this is the old Create, unchanged. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) {
      openSheet();
      return;
    }
    openStoryStarter();
  }, [storySchema, openSheet, openStoryStarter]);

  /** StoryStarter's way out — the normal form, every field still editable. */
  const handleStoryManual = useCallback(() => setEditMode("manual"), []);

  const handleSave = useCallback(() => {
    const problem = validate(mf);
    if (problem) {
      pushToast({ type: "info", title: "Nearly", message: problem });
      return;
    }
    const cleaned = cleanData(mf);
    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      results: cleaned.results.length,
      questions: cleaned.paa.length,
    });
    pushToast({ type: "success", title: "Saved", message: "Type their name into the box, then publish." });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(searchedDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result?.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(searchedDataToBody(content, pagePassword)),
      });
    },
    [content, pagePassword, headers],
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    const problem = validate(content);
    if (problem) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "incomplete" });
      pushToast({ type: "info", title: "Finish the page first", message: problem });
      setEditMode("manual");
      return;
    }

    // Auth-deferred, never auth-gated.
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

      const pubRes = await publishFetch(
        { slug: TEMPLATE, templateType: "searched", pageId: id, templateTitle: "Searched" },
        () => fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() })
      );
      const pubResult = await pubRes.json();
      if (pubResult?.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        // Never throws, never blocks — the page is already live either way.
        await persistStory();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published 🔍", message: "Send it. Let them type their own name.", shareUrl: String(pubResult.data.shareUrl) });
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
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, persistStory]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied" });
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Go on. Type your name. 🔍",
      accent: "#6d28d9",
      slug: "searched",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl,
    isPersonalized, showAuth, publishing, copied, toasts, previewVersion,
    storyFill, storyStarted,

    setEditMode, setPagePassword: updatePassword, updateMf, setRecipientName,
    openSheet, handleStartCreate, handleStoryManual, handleSave, publish, closeAuth, closeAuthSuccess,
    handleCopy, handleShare, goBack, pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "Copied" : "Share",
  };
}
