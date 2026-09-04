"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type Toast, type WeddingData, DEMO_DATA } from "../components/types";

import { API_URL, IS_NGROK, SITE_URL } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { requestFeedback } from "@/lib/feedback/feedbackBus";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "wedding-shaadi";

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const parseTimeToMinutes = (time: string): number => {
  const cleaned = time.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hourRaw = Number(match[1]);
  const minutes = Number(match[2] || "0");
  const ampm = match[3];
  let hour = hourRaw % 12;
  if (ampm === "PM") hour += 12;
  return hour * 60 + minutes;
};

const parseDateAndTimeToEpoch = (date: string, time: string): number => {
  const trimmedDate = date.trim();
  if (!trimmedDate) return Number.MAX_SAFE_INTEGER;
  const parts = trimmedDate.split(/\s+/);
  if (parts.length < 2) return Number.MAX_SAFE_INTEGER;

  const day = Number(parts[0]);
  const monthIdx = MONTH_MAP[parts[1].toLowerCase()];
  if (!Number.isFinite(day) || monthIdx === undefined) return Number.MAX_SAFE_INTEGER;

  const year = new Date().getFullYear();
  const eventDate = new Date(year, monthIdx, day);
  eventDate.setHours(0, 0, 0, 0);
  eventDate.setMinutes(parseTimeToMinutes(time));
  return eventDate.getTime();
};

const sortWeddingEvents = (events: WeddingData["events"]) =>
  [...events].sort((a, b) => {
    if (Boolean(a.disabled) !== Boolean(b.disabled)) return a.disabled ? 1 : -1;
    const aEpoch = parseDateAndTimeToEpoch(a.date, a.time);
    const bEpoch = parseDateAndTimeToEpoch(b.date, b.time);
    if (aEpoch === bEpoch) return a.name.localeCompare(b.name);
    return aEpoch - bEpoch;
  });

// ── Helper: map DB fields → WeddingData ────────────────────────────────────────
function dbToWeddingData(d: Record<string, unknown>): WeddingData {
  const rawEvents = ((d.events as WeddingData["events"]) || DEMO_DATA.events).map((ev) => ({
    ...ev,
    disabled: Boolean(ev.disabled),
  }));

  return {
    ...DEMO_DATA,
    brideName: (d.brideName as string) || "",
    groomName: (d.groomName as string) || "",
    weddingDate: (d.weddingDate as string) || DEMO_DATA.weddingDate,
    venue: (d.venue as string) || DEMO_DATA.venue,
    blessing: (d.blessing as string) || DEMO_DATA.blessing,
    bride: {
      ...DEMO_DATA.bride,
      name: (d.brideName as string) || DEMO_DATA.bride.name,
      photo: (d.bridePhoto as string) || "",
      description: (d.brideDescription as string) || DEMO_DATA.bride.description,
      tags: (d.brideTags as { emoji: string; label: string }[]) || DEMO_DATA.bride.tags,
    },
    groom: {
      ...DEMO_DATA.groom,
      name: (d.groomName as string) || DEMO_DATA.groom.name,
      photo: (d.groomPhoto as string) || "",
      description: (d.groomDescription as string) || DEMO_DATA.groom.description,
      tags: (d.groomTags as { emoji: string; label: string }[]) || DEMO_DATA.groom.tags,
    },
    brideFamily: {
      title: "Bride's Family",
      parents: (d.brideFamilyParents as string) || DEMO_DATA.brideFamily.parents,
      grandparents: (d.brideFamilyGrandparents as string) || DEMO_DATA.brideFamily.grandparents,
    },
    groomFamily: {
      title: "Groom's Family",
      parents: (d.groomFamilyParents as string) || DEMO_DATA.groomFamily.parents,
      grandparents: (d.groomFamilyGrandparents as string) || DEMO_DATA.groomFamily.grandparents,
    },
    events: sortWeddingEvents(rawEvents),
    galleryImages: ((d.galleryImages as { src: string; alt: string }[]) || []).map((g, i) => ({
      src: g.src,
      alt: g.alt || `Photo ${i + 1}`,
      span: i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : "",
    })),
    wishes: (d.blessings as { name: string; message: string }[]) || DEMO_DATA.wishes,
    sharePhoto: (d.sharePhoto as string) || "",
  };
}

// ── Helper: WeddingData → DB body ─────────────────────────────────────────────
function weddingDataToBody(data: WeddingData, password?: string) {
  return {
    brideName: data.brideName,
    groomName: data.groomName,
    weddingDate: data.weddingDate,
    venue: data.venue,
    blessing: data.blessing,
    bridePhoto: data.bride.photo,
    brideDescription: data.bride.description,
    brideTags: data.bride.tags,
    brideFamilyParents: data.brideFamily.parents,
    brideFamilyGrandparents: data.brideFamily.grandparents,
    groomPhoto: data.groom.photo,
    groomDescription: data.groom.description,
    groomTags: data.groom.tags,
    groomFamilyParents: data.groomFamily.parents,
    groomFamilyGrandparents: data.groomFamily.grandparents,
    events: sortWeddingEvents(data.events),
    galleryImages: data.galleryImages.map((g) => ({ src: g.src, alt: g.alt })),
    sharePhoto: data.sharePhoto || "",
    password: password || "",
  };
}

export function useWeddingEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("wedding-shaadi-theme");
    if (saved) {
      // User previously changed theme within this template — respect it
      setDarkMode(saved === "dark");
    } else {
      // Default is always dark for the wedding template
      setDarkMode(true);
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("wedding-shaadi-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("wedding-shaadi-theme", "light");
    }
  }, [darkMode, themeReady]);

  // Restore global theme when navigating away so next-themes stays in sync
  useEffect(() => {
    return () => {
      const global = localStorage.getItem("theme");
      if (global === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  const [tab, setTab] = useState<TabId>("home");
  const [content, setContent] = useState<WeddingData>(DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<WeddingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [showPwValue, setShowPwValue] = useState(false);
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  // AI text mode
  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // AI card extraction
  const [extractLoading, setExtractLoading] = useState(false);
  const [aiEditData, setAiEditData] = useState<WeddingData | null>(null);

  const [mf, setMf] = useState<WeddingData>({ ...DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);
  const preEditContentRef = useRef<WeddingData>(DEMO_DATA);
  const previewSourceRef = useRef<"manual" | "ai-edit" | null>(null);
  const fromPreviewRef = useRef(false);
  const pendingPublishRef = useRef<{ data: WeddingData; password: string } | null>(null);

  // Persist form WIP draft while filling
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "ai-edit") return;
    try {
      sessionStorage.setItem("wedding_draft", JSON.stringify({ data: mf, step: manualStep, completed: false }));
    } catch {}
  }, [mf, manualStep, editMode]);

  // After successful auth: auto-publish if pendingPublishRef has stored data
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;

    const { data, password: pw } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    const authHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    };

    setPublishing(true);
    setEditMode(null);

    (async () => {
      try {
        const body = weddingDataToBody(data, pw);
        const res = await fetch(`${API_URL}/wedding-pages`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");

        const savedId = result.data._id as string;
        setPageId(savedId);
        setShareId(result.data.shareId || null);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "wedding", pageId: savedId, templateTitle: "Royal Indian Wedding" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${API_URL}/wedding-pages/${savedId}/publish`, { method: "POST", headers: authHeaders, });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          const publishedShareId = pubResult.data.shareId as string;
          const normalizedShareUrl = publishedShareId
            ? `${SITE_URL.replace(/\/$/, "")}/${publishedShareId}`
            : (pubResult.data.shareUrl as string);
          setShareUrl(normalizedShareUrl);
          setShareId(publishedShareId);
          try { sessionStorage.removeItem("wedding_draft"); } catch {}
          pushToast({
            type: "publish",
            title: "Published! 🎊",
            message: "Your wedding invitation is now live",
            shareUrl: normalizedShareUrl,
          });
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

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  // Load existing page for editing (?edit=<id>)
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !accessToken || !themeReady) return;
    fetch(`${API_URL}/wedding-pages/${editId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const loaded = dbToWeddingData(result.data as Record<string, unknown>);
          setContent(loaded);
          setMf({ ...loaded });
          setPageId(editId);
          setIsPersonalized(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, themeReady]);

  // Restore completed draft on fresh load (no ?edit= param)
  useEffect(() => {
    if (!themeReady) return;
    const editId = searchParams.get("edit");
    if (editId) return;
    try {
      const raw = sessionStorage.getItem("wedding_draft");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.data && (saved.data.brideName || saved.data.groomName)) {
          setContent((prev) => ({ ...prev, ...saved.data }));
          setMf((prev) => ({ ...prev, ...saved.data }));
          setIsPersonalized(true);
          if (saved.data.password) setPagePassword(saved.data.password);
          if (saved.completed) setEditMode("preview");
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeReady]);

  const handleTabChange = useCallback((id: TabId) => setTab(id), []);
  const goBack = useCallback(() => router.push("/templates"), [router]);
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);

  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    if (!pendingPublishRef.current) {
      setEditMode("choose");
    }
    // if pendingPublishRef.current exists, auto-publish useEffect fires
  }, []);

  // No auth check — anyone can open the form
  const handleEditClick = useCallback(() => {
    preEditContentRef.current = content;
    setEditMode("choose");
  }, [content]);

  // Wrapped setEditMode for EditSheet: returns to preview when editing from preview
  const setEditModeFromSheet = useCallback((mode: EditMode) => {
    if (mode === null && fromPreviewRef.current) {
      fromPreviewRef.current = false;
      setEditMode("preview");
    } else {
      if (mode === null || mode === "preview") fromPreviewRef.current = false;
      setEditMode(mode);
    }
  }, []);

  // From preview: go back into the manual form to edit
  const handleEditFromPreview = useCallback(() => {
    fromPreviewRef.current = true;
    setMf({ ...content });
    setManualStep(0);
    setEditMode("manual");
  }, [content]);

  const startAiMode = useCallback(() => {
    setAiName(isPersonalized ? content.brideName : "");
    setAiSender(isPersonalized ? content.groomName : "");
    setAiPrompt("");
    setEditMode("ai");
  }, [isPersonalized, content.brideName, content.groomName]);

  const startManualMode = useCallback(() => {
    if (isPersonalized) {
      setMf({ ...content });
    } else {
      try {
        const draft = sessionStorage.getItem("wedding_mf_draft");
        setMf(draft ? JSON.parse(draft) : { ...DEMO_DATA });
      } catch {
        setMf({ ...DEMO_DATA });
      }
    }
    setManualStep(0);
    setEditMode("manual");
  }, [isPersonalized, content]);

  // ── AI: extract from shaadi card ──────────────────────────────────────────
  const handleCardExtract = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setExtractLoading(true);
      try {
        // Convert each file to base64
        const images = await Promise.all(
          files.slice(0, 3).map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              }),
          ),
        );

        const res = await fetch(`${API_URL}/wedding-pages/extract-card`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ images }),
        });
        const data = await res.json();

        if (data.success && data.data) {
          const d = data.data as Record<string, unknown>;
          const extracted: WeddingData = {
            ...DEMO_DATA,
            brideName: (d.brideName as string) || "",
            groomName: (d.groomName as string) || "",
            weddingDate: (d.weddingDate as string) || DEMO_DATA.weddingDate,
            venue: (d.venue as string) || "",
            blessing: (d.blessing as string) || DEMO_DATA.blessing,
            bride: {
              ...DEMO_DATA.bride,
              name: (d.brideName as string) || "",
              description: (d.brideDescription as string) || DEMO_DATA.bride.description,
              photo: "",
            },
            groom: {
              ...DEMO_DATA.groom,
              name: (d.groomName as string) || "",
              description: (d.groomDescription as string) || DEMO_DATA.groom.description,
              photo: "",
            },
            brideFamily: {
              title: "Bride's Family",
              parents: (d.brideFamilyParents as string) || "",
              grandparents: (d.brideFamilyGrandparents as string) || "",
            },
            groomFamily: {
              title: "Groom's Family",
              parents: (d.groomFamilyParents as string) || "",
              grandparents: (d.groomFamilyGrandparents as string) || "",
            },
            events: ((d.events as { name: string; date: string; time: string; venue: string }[]) || []).map((ev, i) => ({
              ...DEMO_DATA.events[i] || DEMO_DATA.events[4],
              date: ev.date || "",
              time: ev.time || "",
              venue: ev.venue || "",
              disabled: false,
            })),
          };
          setAiEditData(extracted);
          setMf(extracted);
          setEditMode("ai-edit");
        } else {
          pushToast({ type: "info", title: "Extraction failed", message: data.error || "Please try again" });
        }
      } catch {
        pushToast({ type: "info", title: "Extraction failed", message: "Could not read the card. Please try manual entry." });
      } finally {
        setExtractLoading(false);
      }
    },
    [headers, pushToast],
  );

  // ── AI: text prompt generate ──────────────────────────────────────────────
  const handleAiGenerate = useCallback(async () => {
    if (!aiName.trim() && !aiSender.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Wedding invitation for ${aiName.trim() || "the bride"} & ${aiSender.trim() || "the groom"}. ${aiPrompt}`,
          templateId: "wedding-shaadi",
          templateType: "wedding",
        }),
      });
      const data = await res.json();

      const generated: WeddingData = {
        ...DEMO_DATA,
        brideName: aiName.trim() || DEMO_DATA.brideName,
        groomName: aiSender.trim() || DEMO_DATA.groomName,
        blessing: data.blessing || data.body || DEMO_DATA.blessing,
        bride: {
          ...DEMO_DATA.bride,
          name: aiName.trim() || DEMO_DATA.bride.name,
          photo: mf.bride.photo, // preserve uploaded photo from AiTextPanel
          description: data.brideDescription || data.body || DEMO_DATA.bride.description,
        },
        groom: {
          ...DEMO_DATA.groom,
          name: aiSender.trim() || DEMO_DATA.groom.name,
          photo: mf.groom.photo, // preserve uploaded photo from AiTextPanel
          description: data.groomDescription || data.body || DEMO_DATA.groom.description,
        },
      };

      setAiEditData(generated);
      setMf(generated);
      setEditMode("ai-edit");
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiSender, aiPrompt, mf, headers, pushToast]);

  // When user confirms ai-edit, go to preview (local only — no server save yet)
  const handleAiEditPreview = useCallback(() => {
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev;
      return mf;
    });
    previewSourceRef.current = "ai-edit";
    fromPreviewRef.current = false;
    try {
      sessionStorage.setItem("wedding_draft", JSON.stringify({ data: mf, password: pagePassword, completed: true }));
    } catch {}
    setEditMode("preview");
  }, [mf, pagePassword]);

  const handleManualPreview = useCallback(() => {
    if (!mf.brideName.trim() && !mf.groomName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev;
      return mf;
    });
    previewSourceRef.current = "manual";
    fromPreviewRef.current = false;
    try {
      sessionStorage.setItem("wedding_draft", JSON.stringify({ data: mf, password: pagePassword, completed: true }));
    } catch {}
    /* Publish is gated on isPersonalized, so without this the sender finishes all
     * seven wizard steps, lands on the preview, and finds no way to publish at
     * all — the invitation cannot go live. The only route through was to reload
     * the page, because the draft-restore effect above sets the flag; nobody
     * would guess that. reception, shaadi-card and christian-wedding all set it
     * on this same path. */
    setIsPersonalized(true);
    setEditMode("preview");
  }, [mf, pagePassword]);

  const updateMf = useCallback(
    (key: keyof WeddingData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: WeddingData, password?: string) => {
      if (!accessToken) return;
      const body = weddingDataToBody(data, password);

      if (pageId) {
        const res = await fetch(`${API_URL}/wedding-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        return res.json();
      } else {
        const res = await fetch(`${API_URL}/wedding-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) {
          setPageId(result.data._id);
          setShareId(result.data.shareId);
        }
        return result;
      }
    },
    [accessToken, pageId, headers],
  );

  // handlePasswordDone defined first so handleConfirmSave can call it
  const handlePasswordDone = useCallback(
    async (pw: string) => {
      if (!pendingContent) return;
      setSaving(true);
      try {
        await saveToServer({ ...pendingContent }, pw);
        setIsPersonalized(true);
        setEditMode(null);
        setPendingContent(null);
        setHasPasswordSet(!!pw);
        // Clear draft from sessionStorage after successful save
        try { sessionStorage.removeItem("wedding_mf_draft"); } catch {}
        pushToast({
          type: "success",
          title: pw ? "Saved with password!" : "Changes saved!",
          message: pw ? "Share the password with guests" : "Your invitation is ready to publish",
        });
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setSaving(false);
      }
    },
    [pendingContent, saveToServer, pushToast],
  );

  // Uses pagePassword already set in pre-password step — no param needed
  const handleConfirmSave = useCallback(
    () => {
      handlePasswordDone(pagePassword);
    },
    [handlePasswordDone, pagePassword],
  );

  const handleDiscardPreview = useCallback(() => {
    if (!pendingContent) { setEditMode(null); return; }
    setContent(preEditContentRef.current);
    setPendingContent(null);
    const source = previewSourceRef.current;
    previewSourceRef.current = null;
    if (source === "manual") {
      setManualStep(5); // go back to password step
      setEditMode("manual");
    } else if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setEditMode("choose");
    }
  }, [pendingContent]);

  // ── Auto-draft ────────────────────────────────────────────────────────────
  //
  // What this adds that `saveToServer` did not: work built while signed OUT is
  // held in the browser and promoted to a real draft — photos to S3 — the moment
  // the visitor signs up or logs in. `saveToServer` returns early without a
  // token, so everything built before signing in was lost at the first
  // navigation.
  //
  // `enabled: isPersonalized` keeps every visitor who merely opened the editor
  // out of their own profile: the demo content is not a draft.
  const draft = useDraft({
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing || saving,
    isAuthenticated,
    accessToken,
    pageId,
    // The editor's own save, which already handles create vs update and already
    // sets `pageId`. Nothing about the wire shape is restated here.
    persist: async (d) => {
      const r = await saveToServer(d, pagePassword);
      const id = r?.data?._id ? String(r.data._id) : pageId;
      return id || null;
    },
    onAdopted: (d) => {
      // The adopted payload carries CDN URLs where the browser held base64, so
      // the form has to be told — otherwise the next save sends the base64 back
      // and re-uploads it.
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
    },
  });

  // ── The milestones ────────────────────────────────────────────────────────
  //
  // Watching `editMode` rather than calling `saveNow()` from each place that
  // sets it: a transition is impossible to forget in a way a call site is not.
  // Leaving the editor and backgrounding the tab are handled inside the hook.
  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  const handlePublish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    // Auth gate at publish time only
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      if (!id) {
        const body = weddingDataToBody(content, pagePassword);
        const res = await fetch(`${API_URL}/wedding-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        id = result.data._id as string;
        setPageId(id);
        setShareId(result.data.shareId || null);
        setIsPersonalized(true);
      }
      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "wedding", pageId: id, templateTitle: "Royal Indian Wedding" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${API_URL}/wedding-pages/${id}/publish`, { method: "POST", headers: headers(), });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        const publishedShareId = pubResult.data.shareId as string;
        const normalizedShareUrl = publishedShareId
          ? `${SITE_URL.replace(/\/$/, "")}/${publishedShareId}`
          : (pubResult.data.shareUrl as string);
        setShareUrl(normalizedShareUrl);
        setShareId(publishedShareId);
        setEditMode(null);
        try { sessionStorage.removeItem("wedding_draft"); } catch {}
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        // Ask how it went, before this editor's own "Published!" panel takes
        // over. Unlike most templates it does not raise the house share sheet,
        // so the interception inside `openShareSheet` never runs here — see
        // lib/feedback/feedbackBus. Asking twice is impossible: the bus marks
        // the page the moment it raises, and this is a no-op if it already has.
        requestFeedback({ templateSlug: TEMPLATE, pageUrl: normalizedShareUrl }, () => {});
        pushToast({
          type: "publish",
          title: "Published! 🎊",
          message: "Your wedding invitation is now live",
          shareUrl: normalizedShareUrl,
        });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [isAuthenticated, accessToken, pageId, content, pagePassword, headers, pushToast]);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (link) {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (!url) pushToast({ type: "success", title: "Link copied!" });
      }
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    setShowShareSheet(true);
  }, [shareUrl]);

  const closeShareSheet = useCallback(() => setShowShareSheet(false), []);

  // Add blessing (from editor preview - same page)
  const addBlessing = useCallback(
    async (name: string, message: string) => {
      if (!shareId) return false;
      try {
        const res = await fetch(`${API_URL}/wedding-pages/share/${shareId}/blessings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message }),
        });
        const result = await res.json();
        if (result.success) {
          setContent((prev) => ({
            ...prev,
            wishes: result.data.map((b: { name: string; message: string }) => ({ name: b.name, message: b.message })),
          }));
          return true;
        }
      } catch { /* ignore */ }
      return false;
    },
    [shareId],
  );

  return {
    tab, content, editMode, isPersonalized, shareUrl, showShareSheet, shareId, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading, extractLoading,
    mf, manualStep, aiEditData,
    darkMode, themeReady, toggleDark,

    setEditMode, setEditModeFromSheet, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess, closeShareSheet,
    handleEditClick, handleEditFromPreview, startAiMode, startManualMode,
    handleCardExtract, handleAiGenerate, handleAiEditPreview,
    handleManualPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast, addBlessing,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
