"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  type TabId,
  type EditMode,
  type Toast,
  type ShaadiData,
  CHRISTIAN_DEMO_DATA,
} from "../components/types";

import { API_URL, IS_NGROK, SITE_URL } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "christian-wedding";

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

const sortWeddingEvents = (events: ShaadiData["events"]) =>
  [...events].sort((a, b) => {
    if (Boolean(a.disabled) !== Boolean(b.disabled)) return a.disabled ? 1 : -1;
    const aEpoch = parseDateAndTimeToEpoch(a.date, a.time);
    const bEpoch = parseDateAndTimeToEpoch(b.date, b.time);
    if (aEpoch === bEpoch) return a.name.localeCompare(b.name);
    return aEpoch - bEpoch;
  });

// ── Helper: map DB fields → ShaadiData ────────────────────────────────────────
function dbToShaadiData(d: Record<string, unknown>): ShaadiData {
  const rawEvents = ((d.events as ShaadiData["events"]) || CHRISTIAN_DEMO_DATA.events).map((ev) => ({
    ...ev,
    disabled: Boolean(ev.disabled),
    details: typeof ev.details === "string" ? ev.details : "",
  }));

  return {
    ...CHRISTIAN_DEMO_DATA,
    brideName: (d.brideName as string) || "",
    groomName: (d.groomName as string) || "",
    weddingDate: (d.weddingDate as string) || CHRISTIAN_DEMO_DATA.weddingDate,
    venue: (d.venue as string) || CHRISTIAN_DEMO_DATA.venue,
    blessing: (d.blessing as string) || CHRISTIAN_DEMO_DATA.blessing,
    bride: {
      ...CHRISTIAN_DEMO_DATA.bride,
      name: (d.brideName as string) || CHRISTIAN_DEMO_DATA.bride.name,
      photo: (d.bridePhoto as string) || "",
      description: (d.brideDescription as string) || CHRISTIAN_DEMO_DATA.bride.description,
      tags: (d.brideTags as { emoji: string; label: string }[]) || CHRISTIAN_DEMO_DATA.bride.tags,
    },
    groom: {
      ...CHRISTIAN_DEMO_DATA.groom,
      name: (d.groomName as string) || CHRISTIAN_DEMO_DATA.groom.name,
      photo: (d.groomPhoto as string) || "",
      description: (d.groomDescription as string) || CHRISTIAN_DEMO_DATA.groom.description,
      tags: (d.groomTags as { emoji: string; label: string }[]) || CHRISTIAN_DEMO_DATA.groom.tags,
    },
    brideFamily: {
      title: "Bride's Family",
      parents: (d.brideFamilyParents as string) || CHRISTIAN_DEMO_DATA.brideFamily.parents,
      grandparents: (d.brideFamilyGrandparents as string) || CHRISTIAN_DEMO_DATA.brideFamily.grandparents,
    },
    groomFamily: {
      title: "Groom's Family",
      parents: (d.groomFamilyParents as string) || CHRISTIAN_DEMO_DATA.groomFamily.parents,
      grandparents: (d.groomFamilyGrandparents as string) || CHRISTIAN_DEMO_DATA.groomFamily.grandparents,
    },
    events: sortWeddingEvents(rawEvents),
    galleryImages: ((d.galleryImages as { src: string; alt: string }[]) || []).map((g, i) => ({
      src: g.src,
      alt: g.alt || `Photo ${i + 1}`,
      span: i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : "",
    })),
    wishes: ((d.blessings as { name: string; message: string; voiceUrl?: string }[]) || CHRISTIAN_DEMO_DATA.wishes).map((b) => ({
      name: b.name,
      message: b.message,
      ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}),
    })),
    sharePhoto: (d.sharePhoto as string) || "",
  };
}

// ── Helper: ShaadiData → DB body ──────────────────────────────────────────────
function shaadiDataToBody(
  data: ShaadiData,
  password?: string,
  templateVariant?: "tabs" | "scroll",
) {
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
    ...(templateVariant ? { templateVariant } : {}),
  };
}

export interface UseChristianWeddingEditorOptions {
  variant?: "tabs" | "scroll";
}

export function useChristianWeddingEditor(options: UseChristianWeddingEditorOptions = {}) {
  const templateVariant = options.variant ?? "tabs";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const [tab, setTab] = useState<TabId>("home");
  const [content, setContent] = useState<ShaadiData>(CHRISTIAN_DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<ShaadiData | null>(null);
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
  const [aiEditData, setAiEditData] = useState<ShaadiData | null>(null);

  const [mf, setMf] = useState<ShaadiData>({ ...CHRISTIAN_DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);
  const preEditContentRef = useRef<ShaadiData>(CHRISTIAN_DEMO_DATA);
  const previewSourceRef = useRef<"manual" | "ai-edit" | null>(null);
  const pendingPublishRef = useRef<{ data: ShaadiData; password: string } | null>(null);
  const fromPreviewRef = useRef(false);

  // Persist draft form data to sessionStorage
  useEffect(() => {
    const isDemoData =
      mf.brideName === CHRISTIAN_DEMO_DATA.brideName &&
      mf.groomName === CHRISTIAN_DEMO_DATA.groomName &&
      !mf.bride.photo &&
      !mf.groom.photo;
    if (!isDemoData) {
      try { sessionStorage.setItem("christian_wedding_mf_draft", JSON.stringify(mf)); } catch {}
    }
  }, [mf]);

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
    fetch(`${API_URL}/christian-wedding-pages/${editId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const loaded = dbToShaadiData(result.data as Record<string, unknown>);
          setContent(loaded);
          setMf({ ...loaded });
          setPageId(editId);
          setIsPersonalized(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, themeReady]);

  // Check for prefill from viewer inline create
  useEffect(() => {
    if (!themeReady || !isAuthenticated) return;
    try {
      const prefillStr = sessionStorage.getItem("christian_wedding_prefill");
      if (!prefillStr) return;
      sessionStorage.removeItem("christian_wedding_prefill");
      const prefill = JSON.parse(prefillStr) as Partial<ShaadiData>;
      setMf((prev) => ({ ...prev, ...prefill }));
      setEditMode("manual");
    } catch {}
  }, [themeReady, isAuthenticated]);

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
  }, []);

  const handleEditClick = useCallback(() => {
    setEditMode("choose");
  }, []);

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
        const draft = sessionStorage.getItem("christian_wedding_mf_draft");
        setMf(draft ? JSON.parse(draft) : { ...CHRISTIAN_DEMO_DATA });
      } catch {
        setMf({ ...CHRISTIAN_DEMO_DATA });
      }
    }
    setManualStep(0);
    setEditMode("manual");
  }, [isPersonalized, content]);

  const setEditModeFromSheet = useCallback((mode: EditMode) => {
    if (mode === null && fromPreviewRef.current) {
      fromPreviewRef.current = false;
      setEditMode("preview");
      return;
    }
    fromPreviewRef.current = false;
    setEditMode(mode);
  }, []);

  const handleEditFromPreview = useCallback(() => {
    fromPreviewRef.current = true;
    const source = previewSourceRef.current;
    if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setManualStep(0);
      setEditMode("manual");
    }
  }, []);

  // ── AI: extract from shaadi card ──────────────────────────────────────────
  const handleCardExtract = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setExtractLoading(true);
      try {
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

        const res = await fetch(`${API_URL}/christian-wedding-pages/extract-card`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ images }),
        });
        const data = await res.json();

        if (data.success && data.data) {
          const d = data.data as Record<string, unknown>;
          const extracted: ShaadiData = {
            ...CHRISTIAN_DEMO_DATA,
            brideName: (d.brideName as string) || "",
            groomName: (d.groomName as string) || "",
            weddingDate: (d.weddingDate as string) || CHRISTIAN_DEMO_DATA.weddingDate,
            venue: (d.venue as string) || "",
            blessing: (d.blessing as string) || CHRISTIAN_DEMO_DATA.blessing,
            bride: {
              ...CHRISTIAN_DEMO_DATA.bride,
              name: (d.brideName as string) || "",
              description: (d.brideDescription as string) || CHRISTIAN_DEMO_DATA.bride.description,
              photo: "",
            },
            groom: {
              ...CHRISTIAN_DEMO_DATA.groom,
              name: (d.groomName as string) || "",
              description: (d.groomDescription as string) || CHRISTIAN_DEMO_DATA.groom.description,
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
            events: ((d.events as { name: string; date: string; time: string; venue: string; details?: string }[]) || []).map((ev, i) => ({
              ...CHRISTIAN_DEMO_DATA.events[i] || CHRISTIAN_DEMO_DATA.events[4],
              date: ev.date || "",
              time: ev.time || "",
              venue: ev.venue || "",
              details: ev.details || "",
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
          templateId: "christian-wedding",
          templateType: "christian-wedding",
        }),
      });
      const data = await res.json();

      const generated: ShaadiData = {
        ...CHRISTIAN_DEMO_DATA,
        brideName: aiName.trim() || CHRISTIAN_DEMO_DATA.brideName,
        groomName: aiSender.trim() || CHRISTIAN_DEMO_DATA.groomName,
        blessing: data.blessing || data.body || CHRISTIAN_DEMO_DATA.blessing,
        bride: {
          ...CHRISTIAN_DEMO_DATA.bride,
          name: aiName.trim() || CHRISTIAN_DEMO_DATA.bride.name,
          photo: mf.bride.photo,
          description: data.brideDescription || data.body || CHRISTIAN_DEMO_DATA.bride.description,
        },
        groom: {
          ...CHRISTIAN_DEMO_DATA.groom,
          name: aiSender.trim() || CHRISTIAN_DEMO_DATA.groom.name,
          photo: mf.groom.photo,
          description: data.groomDescription || data.body || CHRISTIAN_DEMO_DATA.groom.description,
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

  // When user confirms ai-edit, go to preview
  const handleAiEditPreview = useCallback(() => {
    try {
      sessionStorage.setItem("christian_wedding_draft", JSON.stringify({ ...mf, completed: true }));
    } catch {}
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev;
      return mf;
    });
    previewSourceRef.current = "ai-edit";
    setEditMode("preview");
  }, [mf]);

  const handleManualPreview = useCallback(() => {
    if (!mf.brideName.trim() && !mf.groomName.trim()) return;
    try {
      sessionStorage.setItem("christian_wedding_draft", JSON.stringify({
        ...mf, password: pagePassword, step: manualStep, completed: true,
      }));
    } catch {}
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev;
      return mf;
    });
    previewSourceRef.current = "manual";
    setEditMode("preview");
  }, [mf, pagePassword, manualStep]);

  const updateMf = useCallback(
    (key: keyof ShaadiData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: ShaadiData, password?: string) => {
      if (!accessToken) return;
      const body = shaadiDataToBody(data, password, templateVariant);

      if (pageId) {
        const res = await fetch(`${API_URL}/christian-wedding-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        return res.json();
      } else {
        const res = await fetch(`${API_URL}/christian-wedding-pages`, {
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
    [accessToken, pageId, headers, templateVariant],
  );

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
        try { sessionStorage.removeItem("christian_wedding_mf_draft"); } catch {}
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
      setManualStep(5);
      setEditMode("manual");
    } else if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setEditMode("choose");
    }
  }, [pendingContent]);

  const handlePublish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let pid = pageId;
      const body = shaadiDataToBody(content, pagePassword, templateVariant);
      if (pid) {
        await fetch(`${API_URL}/christian-wedding-pages/${pid}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch(`${API_URL}/christian-wedding-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error("Create failed");
        pid = json.data._id;
        setPageId(pid);
        setShareId(json.data.shareId);
      }
      const pub = await fetch(`${API_URL}/christian-wedding-pages/${pid}/publish`, {
        method: "POST",
        headers: headers(),
      });
      const pj = await pub.json();
      if (pj.success) {
        const publishedShareId = pj.data.shareId as string;
        const normalizedShareUrl = publishedShareId
          ? `${SITE_URL.replace(/\/$/, "")}/${publishedShareId}`
          : (pj.data.shareUrl as string);
        setShareUrl(normalizedShareUrl);
        setShareId(publishedShareId);
        setIsPersonalized(true);
        setEditMode(null);
        try { sessionStorage.removeItem("christian_wedding_draft"); } catch {}
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({
          type: "publish",
          title: "Published! 🎊",
          message: pagePassword ? "Invitation is password-protected" : "Your wedding invitation is now live",
          shareUrl: normalizedShareUrl,
        });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [isAuthenticated, accessToken, content, pagePassword, pageId, headers, templateVariant, pushToast]);

  // Auto-publish after login when pendingPublishRef is set
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password: pw } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    setShowAuth(false);
    (async () => {
      setPublishing(true);
      try {
        const body = shaadiDataToBody(data, pw, templateVariant);
        const res = await fetch(`${API_URL}/christian-wedding-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error("Create failed");
        const pid = json.data._id;
        setPageId(pid);
        const pub = await fetch(`${API_URL}/christian-wedding-pages/${pid}/publish`, {
          method: "POST",
          headers: headers(),
        });
        const pj = await pub.json();
        if (pj.success) {
          const publishedShareId = pj.data.shareId as string;
          const normalizedShareUrl = publishedShareId
            ? `${SITE_URL.replace(/\/$/, "")}/${publishedShareId}`
            : (pj.data.shareUrl as string);
          setShareUrl(normalizedShareUrl);
          setShareId(publishedShareId);
          setIsPersonalized(true);
          setEditMode(null);
          try { sessionStorage.removeItem("christian_wedding_draft"); } catch {}
          pushToast({
            type: "publish",
            title: "Published! 🎊",
            message: pw ? "Invitation is password-protected" : "Your wedding invitation is now live",
            shareUrl: normalizedShareUrl,
          });
        }
      } catch {
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // Persist draft to sessionStorage while in manual edit mode
  useEffect(() => {
    if (editMode !== "manual") return;
    try {
      sessionStorage.setItem("christian_wedding_draft", JSON.stringify({
        ...mf, password: pagePassword, step: manualStep,
      }));
    } catch {}
  }, [mf, editMode, manualStep, pagePassword]);

  // Restore completed draft on mount (only if no ?edit=id param)
  useEffect(() => {
    if (!themeReady) return;
    if (searchParams.get("edit")) return;
    try {
      const raw = sessionStorage.getItem("christian_wedding_draft");
      if (raw) {
        const saved = JSON.parse(raw);
        setMf((prev) => ({ ...prev, ...saved }));
        if (saved.password) setPagePassword(saved.password);
        if (saved.completed) {
          setContent((prev) => ({ ...prev, ...saved }));
          setEditMode("preview");
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeReady]);

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

  // Add blessing
  const addBlessing = useCallback(
    async (name: string, message: string, voiceDataUrl?: string) => {
      if (!shareId) return false;
      try {
        const res = await fetch(`${API_URL}/christian-wedding-pages/share/${shareId}/blessings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            message: message || "",
            ...(voiceDataUrl ? { voiceDataUrl } : {}),
          }),
        });
        const result = await res.json();
        if (result.success) {
          setContent((prev) => ({
            ...prev,
            wishes: result.data.map((b: { name: string; message: string; voiceUrl?: string }) => ({
              name: b.name,
              message: b.message,
              ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}),
            })),
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
    toasts, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading, extractLoading,
    mf, manualStep, aiEditData,
    themeReady,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess, closeShareSheet,
    handleEditClick, startAiMode, startManualMode,
    handleCardExtract, handleAiGenerate, handleAiEditPreview,
    handleManualPreview,
    handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast, addBlessing,
    setEditModeFromSheet, handleEditFromPreview,

    showPublish: editMode === "preview" && !shareUrl,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
