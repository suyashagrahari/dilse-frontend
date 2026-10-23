"use client";

// ─── Christian Wedding — Scroll Edition: the editor's state ─────────────────
//
// `data` is what the page shows; `mf` is the form while the editor is open
// (the live preview beside it follows `mf`). Create → the AI's few questions
// (useStoryFill + our wedding question set) → the review screen → the form.
// Save → the page; Publish → sign in if needed (the publish resumes after),
// the paywall, then the share link. Drafts live in sessionStorage, and for a
// signed-in sender on the server too (useDraft).

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK, SITE_URL } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { openShareSheet } from "@/lib/share/shareBus";
import { useStoryFill } from "@/hooks/useStoryFill";
import { DEMO, fromDoc, namesOf, newEventId, toBody, type Cw2Data } from "../lib/model";
import { factCheck, takeFillSource } from "../lib/factCheck";
import type { Wish } from "../components/Wishes";

const SLUG = "christian-wedding-2";
/** The paywall and the publish gate price both editions as one template. */
const PAY_SLUG = "christian-wedding";
const DRAFT_KEY = "c2_draft_v1";
const API = `${API_URL}/christian-wedding-pages`;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * After an AI fill: names mirrored into the couple cards, demo rows the model
 * left untouched dropped, demo-only facts (families, descriptions, contact,
 * hashtag) cleared — so a short description gives a short, TRUE page.
 */
export function tidyAfterFill(n: Cw2Data): Cw2Data {
  const next = clone(n);
  next.bride.name = next.brideName;
  next.groom.name = next.groomName;
  const demoEv = DEMO.events.map((e) => [e.title, e.date, e.time, e.venue].join("|"));
  const taken = new Set<string>();
  next.events = next.events
    .map((e, i) => ({ e, d: DEMO.events[i], untouched: [e.title, e.date, e.time, e.venue].join("|") === demoEv[i] }))
    .filter(({ e, untouched }) => !untouched && (e.title || e.date))
    .map(({ e, d }) => {
      // A row the model rewrote gets its own id (RSVPs refer to it), never the demo's.
      const id = !e.id || (d && e.id === d.id && e.title !== d.title) ? newEventId(taken) : e.id;
      taken.add(id);
      if (!d) return { ...e, id };
      // The model rewrote this row: any field it left on the demo's value is the demo's, not theirs.
      const keep = (k: "date" | "time" | "endTime" | "venue" | "address" | "dressCode" | "note" | "mapUrl") => (e[k] === d[k] ? "" : e[k] ?? "");
      const dressCode = keep("dressCode");
      return { ...e, id, date: keep("date"), time: keep("time"), endTime: keep("endTime"), venue: keep("venue"), address: keep("address"), dressCode, note: keep("note"), mapUrl: keep("mapUrl"), dressColor: dressCode && e.dressColor !== d.dressColor ? e.dressColor : "" };
    });
  next.story = next.story
    .filter((c, i) => !(DEMO.story[i] && c.title === DEMO.story[i].title && c.line === DEMO.story[i].line))
    .map((c) => {
      const d = DEMO.story.find((x) => x.photo === c.photo);
      return d ? { ...c, when: c.when === d.when ? "" : c.when, line: c.line === d.line ? "" : c.line, title: c.title === d.title ? "" : c.title } : c;
    });
  next.contacts = next.contacts.filter((c, i) => !(DEMO.contacts[i] && same(c, DEMO.contacts[i])));
  if (same(next.brideFamily, DEMO.brideFamily)) next.brideFamily = { parents: "", grandparents: "" };
  else if (next.brideFamily.grandparents === DEMO.brideFamily.grandparents) next.brideFamily.grandparents = "";
  if (same(next.groomFamily, DEMO.groomFamily)) next.groomFamily = { parents: "", grandparents: "" };
  else if (next.groomFamily.grandparents === DEMO.groomFamily.grandparents) next.groomFamily.grandparents = "";
  if (next.bride.description === DEMO.bride.description) next.bride.description = "";
  if (next.groom.description === DEMO.groom.description) next.groom.description = "";
  if (next.blessingsOf === DEMO.blessingsOf) next.blessingsOf = "";
  if (same(next.things, DEMO.things)) next.things = [];
  if (next.gettingThere === DEMO.gettingThere) next.gettingThere = "";
  if (next.hashtag === DEMO.hashtag) {
    const [a, b] = namesOf(next);
    next.hashtag = `#${a.replace(/\W+/g, "")}Weds${b.replace(/\W+/g, "")}`.slice(0, 40);
  }
  if (next.closing === DEMO.closing) next.closing = "";
  // Dated functions in date order (the model keeps the order it was told; undated rows keep their place after their neighbour).
  next.events = next.events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.date && b.e.date && a.e.date !== b.e.date ? (a.e.date < b.e.date ? -1 : 1) : a.i - b.i))
    .map(({ e }) => e);
  return next;
}

function readDraft(): { mf: Cw2Data; step: number; password: string } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { mf?: unknown; step?: unknown; password?: unknown };
    if (!j.mf || typeof j.mf !== "object") return null;
    return { mf: { ...clone(DEMO), ...(j.mf as Cw2Data) }, step: typeof j.step === "number" ? j.step : 0, password: typeof j.password === "string" ? j.password : "" };
  } catch {
    return null;
  }
}

export function useCw2Editor() {
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  const { pushToast } = useToast();

  const [data, setData] = useState<Cw2Data>(() => clone(DEMO));
  const [mf, setMf] = useState<Cw2Data>(() => clone(DEMO));
  const [editorOpen, setEditorOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [storyStarter, setStoryStarter] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedStamp, setSavedStamp] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const pendingPublish = useRef(false);
  // The page id as of now (state lags inside callbacks), and the one create in flight:
  // Save, the draft sync and Publish can all ask for a save at once, and only one may POST.
  const pageIdRef = useRef<string | null>(null);
  const shareIdRef = useRef<string | null>(null);
  const creating = useRef<Promise<{ id: string | null; shareId: string | null }> | null>(null);
  const publishInFlight = useRef(false);

  const fill = useStoryFill<Cw2Data>({
    slug: SLUG,
    demo: DEMO,
    current: mf,
    // A fresh generation is checked against the words that were sent (one-shot; edits pass straight through).
    onFilled: (n) => setMf(factCheck(tidyAfterFill(n), takeFillSource())),
    namePaths: { recipient: "brideName", sender: "groomName" },
  });

  const headers = useCallback(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) }),
    [accessToken],
  );

  // ── Restore: ?edit=<id> (a published page) or this tab's draft ──────────
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) return;
    const d = readDraft();
    if (!d) return;
    // A one-time restore after mount (sessionStorage is client-only).
     
    setMf(d.mf);
    setData(d.mf);
    setStep(d.step);
    setPassword(d.password);
    setIsPersonalized(true);
     
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !accessToken) return;
    fetch(`${API}/${encodeURIComponent(editId)}`, { headers: headers() })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success || !j.data) return;
        const loaded = fromDoc(j.data);
        setData(loaded);
        setMf(clone(loaded));
        setPageId(String(j.data._id));
        setShareId(j.data.shareId || null);
        pageIdRef.current = String(j.data._id);
        shareIdRef.current = j.data.shareId || null;
        if (j.data.isPublished && j.data.shareId) setShareUrl(`${SITE_URL.replace(/\/$/, "")}/${j.data.shareId}`);
        setWishes(((j.data.blessings as Wish[]) || []).slice().reverse());
        setIsPersonalized(true);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Autosave the form to this tab.
  useEffect(() => {
    if (!editorOpen) return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ mf, step, password }));
        setSavedStamp(Date.now());
      } catch {
        /* a full quota (big photos) must not break typing */
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [mf, step, password, editorOpen]);

  // ── Server save (create or update) ────────────────────────────────────────
  const saveToServer = useCallback(
    async (d: Cw2Data): Promise<{ id: string | null; shareId: string | null }> => {
      if (!accessToken) return { id: null, shareId: null };
      const body = JSON.stringify(toBody(d, password));
      if (!pageIdRef.current && creating.current) await creating.current.catch(() => undefined);
      const id = pageIdRef.current;
      if (id) {
        const r = await fetch(`${API}/${id}`, { method: "PUT", headers: headers(), body });
        const j = await r.json();
        if (!j.success) throw new Error(j.error || "Save failed");
        if (j.data) {
          const back = fromDoc(j.data);
          // The server swapped uploaded photos for URLs: keep the form in step.
          setData((cur) => ({ ...cur, gallery: back.gallery, bridePhoto: back.bridePhoto, groomPhoto: back.groomPhoto, couplePhoto: back.couplePhoto, story: back.story }));
        }
        return { id, shareId: shareIdRef.current };
      }
      const create = (async () => {
        const r = await fetch(API, { method: "POST", headers: headers(), body });
        const j = await r.json();
        if (!j.success) throw new Error(j.error || "Create failed");
        const made = { id: String(j.data._id), shareId: (j.data.shareId as string) || null };
        pageIdRef.current = made.id;
        shareIdRef.current = made.shareId;
        setPageId(made.id);
        setShareId(made.shareId);
        return made;
      })();
      creating.current = create;
      try {
        return await create;
      } finally {
        if (creating.current === create) creating.current = null;
      }
    },
    [accessToken, password, headers],
  );

  const draft = useDraft({
    publishInFlight,
    templateType: SLUG,
    content: data,
    enabled: isPersonalized,
    busy: publishing || saving,
    isAuthenticated,
    accessToken,
    pageId,
    persist: async (d: Cw2Data) => (await saveToServer(d)).id,
    onAdopted: (d: Cw2Data) => {
      setData(d);
      setMf(clone(d));
      setIsPersonalized(true);
    },
  });

  // ── Editor open/close ─────────────────────────────────────────────────────
  const openEditor = useCallback(
    (atStep?: number) => {
      setMf(clone(data));
      if (typeof atStep === "number") setStep(atStep);
      setEditorOpen(true);
    },
    [data],
  );

  /** "Create" / "Edit": the AI's questions first when the template has a schema and the page is still the demo. */
  const startCreate = useCallback(() => {
    track(EVENTS.CREATE_CTA_CLICKED, { template: SLUG, source: "editor" });
    setMf(clone(data));
    if (fill.schema && !isPersonalized) {
      fill.setMode("idle");
      setStoryStarter(true);
      setEditorOpen(true);
      setStep(0);
      return;
    }
    setEditorOpen(true);
  }, [data, fill, isPersonalized]);

  const openAi = useCallback(() => {
    fill.setMode("idle");
    setStoryStarter(true);
  }, [fill]);

  const closeAi = useCallback(() => {
    setStoryStarter(false);
    fill.dismiss();
  }, [fill]);

  const updateMf = useCallback(<K extends keyof Cw2Data>(key: K, val: Cw2Data[K]) => setMf((p) => ({ ...p, [key]: val })), []);

  const save = useCallback(async () => {
    const next = clone(mf);
    next.bride.name = next.brideName;
    next.groom.name = next.groomName;
    setData(next);
    setEditorOpen(false);
    setIsPersonalized(true);
    setReplayKey((k) => k + 1);
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ mf: next, step, password }));
    } catch {}
    if (accessToken) {
      setSaving(true);
      try {
        await saveToServer(next);
        pushToast({ type: "success", title: "Saved", message: shareUrl ? "Your guests see the new version" : "Preview it, then publish" });
      } catch {
        pushToast({ type: "info", title: "Saved on this device", message: "We'll sync it when you publish" });
      } finally {
        setSaving(false);
      }
    }
  }, [mf, step, password, accessToken, saveToServer, pushToast, shareUrl]);

  const discard = useCallback(() => {
    setMf(clone(data));
    setEditorOpen(false);
  }, [data]);

  useEffect(() => {
    if (!editorOpen) void draft.saveNow();
  }, [editorOpen, draft]);

  // ── Publish ───────────────────────────────────────────────────────────────
  const doPublish = useCallback(async () => {
    setPublishing(true);
    publishInFlight.current = true;
    try {
      const { id, shareId: sid } = await saveToServer(data);
      if (!id) throw new Error("No page");
      const gate = await ensurePublishAllowed({ slug: PAY_SLUG, templateType: "christian-wedding", pageId: id, templateTitle: "Christian Wedding Invitation" }, setPublishing);
      if (gate === "cancelled") return;
      const pub = await fetch(`${API}/${id}/publish`, { method: "POST", headers: headers() });
      const pj = await pub.json();
      if (!pj.success) throw new Error(pj.error || "Publish failed");
      const published = String(pj.data.shareId || sid || "");
      setShareId(published);
      shareIdRef.current = published;
      setShareUrl(published ? `${SITE_URL.replace(/\/$/, "")}/${published}` : String(pj.data.shareUrl));
      setEditorOpen(false);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      void fill.persistStory();
      track(EVENTS.PUBLISH_SUCCESS, { template: SLUG, source: "direct" });
      pushToast({ type: "publish", title: "Published! 💐", message: "Tap Share to send it to your guests" });
    } catch (e) {
      pushToast({ type: "info", title: "Publish failed", message: e instanceof Error && e.message ? e.message : "Please try again" });
    } finally {
      publishInFlight.current = false;
      setPublishing(false);
    }
  }, [data, saveToServer, headers, fill, pushToast]);

  const publish = useCallback(() => {
    track(EVENTS.PUBLISH_CLICKED, { template: SLUG, is_authenticated: isAuthenticated });
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: SLUG });
      pendingPublish.current = true;
      publishInFlight.current = true;
      setShowAuth(true);
      return;
    }
    void doPublish();
  }, [isAuthenticated, accessToken, doPublish]);

  // Signed in from the auth modal: carry on with the publish they asked for.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublish.current) return;
    pendingPublish.current = false;
     
    setShowAuth(false);
    void doPublish();
  }, [isAuthenticated, accessToken, doPublish]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublish.current = false;
    publishInFlight.current = false;
  }, []);

  const share = useCallback(() => {
    if (!shareUrl) return;
    const [a, b] = namesOf(data);
    openShareSheet({
      url: shareUrl,
      password,
      text: `${a} & ${b} invite you to their wedding 💐`,
      title: "Wedding Invitation",
      cardTitle: "You are invited to our wedding",
      cardNote: "Scan for the church, the timings and the whole day's programme.",
      senderName: `${a} & ${b}`,
      accent: "#4c6852",
      slug: SLUG,
    });
  }, [shareUrl, password, data]);

  return {
    data, mf, setMf, updateMf, editorOpen, openEditor, startCreate, save, discard, step, setStep,
    storyStarter, openAi, closeAi, fill,
    isPersonalized, pageId, shareId, shareUrl, password, setPassword, wishes,
    showAuth, closeAuth, publishing, saving, publish, share, savedStamp, replayKey, setReplayKey,
    token: accessToken ?? null,
  };
}

export type Cw2Editor = ReturnType<typeof useCw2Editor>;
