"use client";

// ─── Christian Wedding (chapel doors): the editor's state and its publish ───
//
// Same flow as before the rebuild (and as every standalone template): the
// demo page → Create → the AI's guided questions (or "I'll fill it myself") →
// the editor → Save shows the page with Publish → sign in if needed (the
// publish resumes by itself) → the share sheet. What changed is the shape of
// the form (`CwData`, chapel/model.ts) and the converters to the stored model.
//
// The old hook (useChristianWeddingEditor) stays in place untouched for
// christian-wedding-2, which still uses it with the same collection.

import { useCallback, useEffect, useRef, useState } from "react";
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
import { DEMO, SLUG, fromDb, fromDraft, newEventId, toBody, toHHMM, verseFor, type CwData } from "../chapel/model";

const DRAFT_KEY = "cw_chapel_draft:v1";
/** Older editors' keys: still read once, so nobody loses a half-made invitation. */
const OLD_DRAFT_KEYS = ["christian_wedding_draft", "christian_wedding_mf_draft"];

export type ChapelMode = null | "edit" | "preview";

/** Keep the derived fields in step after any change (typing, the AI, a draft). */
export function tidy(n: CwData): CwData {
  const verse = verseFor(n.scripture.ref);
  const taken = new Set<string>();
  const events = n.events.map((e) => {
    let id = e.id;
    if (!id || taken.has(id)) id = newEventId(taken);
    taken.add(id);
    const time = /^\d{2}:\d{2}$/.test(e.time) ? e.time : toHHMM(e.time);
    return id === e.id && time === e.time ? e : { ...e, id, time };
  });
  return {
    ...n,
    // The model chose a verse: the words come from our own list, never generated.
    scripture: verse && n.scripture.text !== verse.text && (!n.scripture.text.trim() || n.scripture.text === DEMO.scripture.text) ? { ...verse } : n.scripture,
    weddingTime: n.weddingTime && !/^\d{2}:\d{2}$/.test(n.weddingTime) ? toHHMM(n.weddingTime) || n.weddingTime : n.weddingTime,
    bride: n.bride.name === n.brideName ? n.bride : { ...n.bride, name: n.brideName },
    groom: n.groom.name === n.groomName ? n.groom : { ...n.groom, name: n.groomName },
    events,
  };
}

const sameRow = (a: object, b: object | undefined) => !!b && JSON.stringify(a) === JSON.stringify(b);

export function useChapelEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  const { pushToast } = useToast();

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const [content, setContent] = useState<CwData>(DEMO);
  const [mf, setMfRaw] = useState<CwData>(DEMO);
  const setMf = useCallback((next: CwData | ((p: CwData) => CwData)) => setMfRaw((p) => tidy(typeof next === "function" ? (next as (p: CwData) => CwData)(p) : next)), []);
  const [mode, setMode] = useState<ChapelMode>(null);
  const [starter, setStarter] = useState(false);
  const [step, setStep] = useState(0);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [replayKey, setReplayKey] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const pendingPublishRef = useRef<{ data: CwData; password: string } | null>(null);
  const resumedPublishRef = useRef(false);
  const publishInFlightRef = useRef(false);
  const preEditRef = useRef<CwData>(DEMO);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  // ── The AI: guided questions → the whole form → the review screen ─────────
  const fill = useStoryFill<CwData>({
    slug: SLUG,
    demo: DEMO,
    current: mf,
    onFilled: (n) => setMf(n),
    namePaths: { recipient: "brideName", sender: "groomName" },
  });

  // After a fill: demo rows the model left untouched are dropped, so a short
  // description gives a short page (never a stranger's Betrothal on it).
  const lastFilled = useRef<string[] | null>(null);
  useEffect(() => {
    if (fill.mode !== "done" || fill.filled === lastFilled.current) return;
    lastFilled.current = fill.filled;
    const touched = new Set(fill.filled.map((p) => p.replace(/\.[^.]+$/, "")));
    setMf((p) => ({
      ...p,
      events: p.events.filter((e, i) => touched.has(`events[${i}]`) || !sameRow(e, DEMO.events[i])),
      story: p.story.filter((r, i) => touched.has(`story[${i}]`) || !sameRow(r, DEMO.story[i])),
      contacts: p.contacts.filter((c, i) => touched.has(`contacts[${i}]`) || !sameRow(c, DEMO.contacts[i])),
      // A fill that wrote a new invitation also gets a fresh order of service only if it is still the demo's.
    }));
  }, [fill.mode, fill.filled, setMf]);

  // ── Load an existing page (?edit=<id>) ────────────────────────────────────
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !accessToken || !ready) return;
    fetch(`${API_URL}/christian-wedding-pages/${editId}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const loaded = tidy(fromDb(result.data as Record<string, unknown>));
          setContent(loaded);
          setMf(loaded);
          setPageId(editId);
          setShareId((result.data as { shareId?: string }).shareId ?? null);
          if ((result.data as { isPublished?: boolean }).isPublished && (result.data as { shareId?: string }).shareId) {
            setShareUrl(`${SITE_URL.replace(/\/$/, "")}/${(result.data as { shareId: string }).shareId}`);
          }
          setIsPersonalized(true);
          fill.setMode("manual");
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, ready]);

  // ── Drafts ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || searchParams.get("edit")) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY) ?? OLD_DRAFT_KEYS.map((k) => sessionStorage.getItem(k)).find(Boolean) ?? null;
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const d = fromDraft(saved.data ?? saved);
      if (!d) return;
      setMf(d);
      if (typeof saved.password === "string") setPagePassword(saved.password);
      if (typeof saved.step === "number") setStep(Math.max(0, Math.min(7, saved.step)));
      if (saved.completed) {
        setContent(tidy(d));
        setIsPersonalized(true);
        setMode("preview");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (mode !== "edit") return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: mf, password: pagePassword, step }));
        setSavedAt(Date.now());
      } catch {}
    }, 400);
    return () => window.clearTimeout(t);
  }, [mf, mode, step, pagePassword]);

  // Prefill from a viewer's inline "create your own".
  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    try {
      const s = sessionStorage.getItem("christian_wedding_prefill");
      if (!s) return;
      sessionStorage.removeItem("christian_wedding_prefill");
      const p = JSON.parse(s) as Partial<CwData>;
      setMf((m) => ({ ...m, ...(p.brideName ? { brideName: p.brideName } : {}), ...(p.groomName ? { groomName: p.groomName } : {}) }));
      setMode("edit");
    } catch {}
  }, [ready, isAuthenticated, setMf]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = useCallback(() => router.push("/templates"), [router]);

  /** "Create" / "Edit": the guided AI first on a fresh page, the form otherwise. */
  const startCreate = useCallback(() => {
    preEditRef.current = content;
    if (!isPersonalized && fill.schema) {
      fill.setMode("idle");
      setStarter(true);
      return;
    }
    setMf(isPersonalized ? content : mf);
    setMode("edit");
  }, [content, isPersonalized, fill, mf, setMf]);

  const openAi = useCallback(() => {
    fill.setMode("idle");
    setStarter(true);
  }, [fill]);

  /** The AI sheet closed ("Looks good" or "I'll fill it myself"): into the form. */
  const closeStarter = useCallback(() => {
    setStarter(false);
    setMode("edit");
  }, []);

  const save = useCallback(() => {
    if (!mf.brideName.trim() || !mf.groomName.trim()) {
      setStep(0);
      pushToast({ type: "info", title: "Add both names", message: "The bride's and the groom's names are all we need to save." });
      return false;
    }
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: mf, password: pagePassword, step, completed: true }));
    } catch {}
    setContent(mf);
    setIsPersonalized(true);
    setMode("preview");
    setReplayKey((k) => k + 1);
    window.scrollTo({ top: 0 });
    return true;
  }, [mf, pagePassword, step, pushToast]);

  const editFromPreview = useCallback(() => {
    setMf(content);
    setMode("edit");
  }, [content, setMf]);

  const discardPreview = useCallback(() => {
    setMode("edit");
  }, []);

  const closeEditor = useCallback(() => {
    // Back from the form: keep what they typed in the draft; show the page as it was.
    setMode(isPersonalized ? "preview" : null);
  }, [isPersonalized]);

  // ── Server ────────────────────────────────────────────────────────────────
  // One row per invitation: the auto-draft and Publish can both want to
  // create it in the same second, so the first POST is shared and the other
  // caller waits for it, then updates the row it made.
  const pageIdRef = useRef<string | null>(null);
  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);
  const creating = useRef<Promise<{ success?: boolean; data?: { _id: string; shareId: string } }> | null>(null);
  const saveToServer = useCallback(
    async (data: CwData, password?: string) => {
      if (!accessToken) return null;
      const body = JSON.stringify(toBody(data, password, "tabs"));
      if (!pageIdRef.current && creating.current) await creating.current.catch(() => null);
      const id = pageIdRef.current;
      if (id) {
        const res = await fetch(`${API_URL}/christian-wedding-pages/${id}`, { method: "PUT", headers: headers(), body });
        return res.json();
      }
      creating.current = fetch(`${API_URL}/christian-wedding-pages`, { method: "POST", headers: headers(), body }).then((r) => r.json());
      try {
        const result = await creating.current;
        if (result.success && result.data) {
          pageIdRef.current = result.data._id;
          setPageId(result.data._id);
          setShareId(result.data.shareId);
        }
        return result;
      } finally {
        creating.current = null;
      }
    },
    [accessToken, headers],
  );

  const draft = useDraft({
    publishInFlight: publishInFlightRef,
    templateType: SLUG,
    content,
    enabled: isPersonalized,
    busy: publishing,
    isAuthenticated,
    accessToken,
    pageId,
    persist: async (d) => {
      const r = await saveToServer(d, pagePassword);
      const id = r?.data?._id ? String(r.data._id) : pageId;
      return id || null;
    },
    onAdopted: (d) => {
      setContent(d);
      setMf(d);
      setIsPersonalized(true);
    },
  });
  useEffect(() => {
    if (mode === null || mode === "preview") void draft.saveNow();
  }, [mode, draft]);

  const finishPublish = useCallback(
    async (pid: string) => {
      const gate = await ensurePublishAllowed({ slug: SLUG, templateType: "christian-wedding", pageId: pid, templateTitle: "Christian Wedding Invitation" }, setPublishing);
      if (gate === "cancelled") return false;
      const pub = await fetch(`${API_URL}/christian-wedding-pages/${pid}/publish`, { method: "POST", headers: headers() });
      const pj = await pub.json();
      if (!pj.success) throw new Error(pj.error || "Publish failed");
      const sid = pj.data.shareId as string;
      setShareUrl(sid ? `${SITE_URL.replace(/\/$/, "")}/${sid}` : (pj.data.shareUrl as string));
      setShareId(sid);
      setIsPersonalized(true);
      setMode("preview");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
        OLD_DRAFT_KEYS.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
      void fill.persistStory({ title: "Our wedding" });
      pushToast({ type: "publish", title: "Published! 🕊️", message: "Tap Share to send it" });
      return true;
    },
    [headers, pushToast, fill],
  );

  const handlePublish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: SLUG, is_authenticated: isAuthenticated });
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: SLUG });
      resumedPublishRef.current = false;
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      const r = await saveToServer(content, pagePassword);
      const pid = (r?.data?._id as string) || pageIdRef.current;
      if (!r?.success || !pid) throw new Error("Save failed");
      if (await finishPublish(pid)) track(EVENTS.PUBLISH_SUCCESS, { template: SLUG, source: "direct" });
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [isAuthenticated, accessToken, content, pagePassword, saveToServer, finishPublish, pushToast]);

  // Auto-publish after sign-in.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    resumedPublishRef.current = true;
    publishInFlightRef.current = true;
    setShowAuth(false);
    (async () => {
      setPublishing(true);
      try {
        const json = await saveToServer(data, password);
        const pid = (json?.data?._id as string) || pageIdRef.current;
        if (!json?.success || !pid) throw new Error("Create failed");
        await finishPublish(pid);
      } catch {
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      } finally {
        publishInFlightRef.current = false;
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    resumedPublishRef.current = false;
  }, []);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const couple = `${content.brideName || "Bride"} & ${content.groomName || "Groom"}`;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      text: `With joy, ${couple} invite you to their Holy Matrimony. Open the doors ⛪`,
      title: "Wedding Invitation",
      cardTitle: "You are invited to our wedding",
      cardNote: "Scan for the church, the timings and the whole day's programme.",
      senderName: couple,
      accent: "#6f8a6c",
      slug: SLUG,
    });
  }, [shareUrl, pagePassword, content]);

  return {
    ready,
    content,
    mf,
    setMf,
    mode,
    setMode,
    step,
    setStep,
    starter,
    fill,
    isPersonalized,
    pageId,
    shareId,
    shareUrl,
    publishing,
    showAuth,
    pagePassword,
    setPagePassword,
    replayKey,
    replay: () => setReplayKey((k) => k + 1),
    savedAt,
    accessToken,
    goBack,
    startCreate,
    openAi,
    closeStarter,
    save,
    editFromPreview,
    discardPreview,
    closeEditor,
    handlePublish,
    handleShare,
    closeAuth,
    closeAuthSuccess,
  };
}

export type ChapelEditor = ReturnType<typeof useChapelEditor>;
