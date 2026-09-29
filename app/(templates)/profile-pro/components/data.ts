// ─── Endorsements — wire format, normalising and small derivations ───────────
//
// One description of the shape that travels: `profileDataToBody` is what the
// editor sends, `dbToProfileData` is what every reader (editor reload, draft
// restore, the published viewer) runs raw data through. Old pages published
// before photos / posts / languages / the letter existed simply get none of
// them — `fromServer` decides whether a missing field falls back to the demo
// (a fresh editor) or to empty (a real page that never had it).

import { clampNum, list, obj, str, strOr, type Raw } from "@/lib/wire";
import {
  MAX_LETTER_LEN,
  MAX_LOCK_ANSWER_LEN,
  MAX_LOCK_QUESTION_LEN,
  parseLovePhotos,
} from "../../_love/types";
import DEMO_PROFILE from "./demo";
import type {
  ProfileCertification,
  ProfileEducation,
  ProfileExperience,
  ProfileLanguage,
  ProfilePost,
  ProfileProData,
  ProfileSkill,
  Recommendation,
} from "./types";

export const LIMITS = {
  name: 60,
  headline: 120,
  location: 80,
  connections: 40,
  openTo: 120,
  aboutLine: 600,
  role: 80,
  company: 80,
  duration: 60,
  bullet: 240,
  school: 120,
  degree: 120,
  years: 40,
  note: 240,
  skill: 60,
  cert: 120,
  post: 1200,
  language: 40,
  level: 60,
  prompt: 240,
  maxSkills: 20,
  maxPosts: 4,
  maxLanguages: 6,
} as const;

export const CONTENT_KEYS: (keyof ProfileProData)[] = [
  "person", "senderName", "about", "experience", "education", "skills", "recommendations",
  "certifications", "contributorPrompt", "photos", "posts", "languages", "letter", "lockQuestion", "lockAnswer",
];

/** Everything the server accepts. `contribToken` and the secrets are its business. */
export function profileDataToBody(data: ProfileProData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of CONTENT_KEYS) body[k] = data[k] ?? null;
  if (!body.certifications) body.certifications = [];
  if (password) body.password = password;
  return body;
}

const lines = (v: unknown, max: number): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, max)) : [];

const httpsOrData = (v: unknown): string => {
  const s = strOr(v, "").trim();
  return /^(https:\/\/|data:image\/)/.test(s) ? s : "";
};

export function dbToProfileData(db: Raw | null | undefined, opts: { fromServer?: boolean } = {}): ProfileProData {
  const src = obj(db);
  const fromServer = opts.fromServer ?? db != null;
  const D = DEMO_PROFILE;
  const p = obj(src.person);
  const demoOr = <T,>(v: T): T | undefined => (fromServer ? undefined : v);

  const person: ProfileProData["person"] = {
    name: strOr(p.name, fromServer ? "" : D.person.name).slice(0, LIMITS.name),
    headline: strOr(p.headline, fromServer ? "" : D.person.headline).slice(0, LIMITS.headline),
    location: strOr(p.location, fromServer ? "" : D.person.location).slice(0, LIMITS.location),
    photoUrl: src.person ? httpsOrData(p.photoUrl) : D.person.photoUrl,
    bannerUrl: src.person ? httpsOrData(p.bannerUrl) : D.person.bannerUrl,
    // String all the way through. Never Number().
    connections: strOr(p.connections, fromServer ? "" : D.person.connections).slice(0, LIMITS.connections),
    degreeNote: strOr(p.degreeNote, demoOr(D.person.degreeNote) ?? ""),
    openTo: strOr(p.openTo, fromServer ? "" : D.person.openTo ?? "").slice(0, LIMITS.openTo),
    photoCropX: clampNum(p.photoCropX, 50, 0, 100),
    photoCropY: clampNum(p.photoCropY, 50, 0, 100),
    photoScale: clampNum(p.photoScale, 100, 100, 300),
    bannerCropX: clampNum(p.bannerCropX, 50, 0, 100),
    bannerCropY: clampNum(p.bannerCropY, 50, 0, 100),
    bannerScale: clampNum(p.bannerScale, 100, 100, 300),
  };
  if (!src.person && !fromServer) Object.assign(person, D.person);

  const arrOr = <T,>(v: unknown, parse: (v: unknown[]) => T[], demo: T[]): T[] =>
    Array.isArray(v) ? parse(v) : fromServer ? [] : demo;

  return {
    person,
    senderName: strOr(src.senderName, fromServer ? "" : D.senderName).slice(0, LIMITS.name),
    about: arrOr(src.about, (v) => lines(v, LIMITS.aboutLine), D.about),
    experience: arrOr(
      src.experience,
      (v) =>
        list<ProfileExperience>(v, (o) => ({
          role: str(o.role, "").slice(0, LIMITS.role),
          company: str(o.company, "").slice(0, LIMITS.company),
          type: strOr(o.type, ""),
          duration: strOr(o.duration, "").slice(0, LIMITS.duration),
          location: strOr(o.location, ""),
          logoUrl: strOr(o.logoUrl, ""),
          bullets: lines(o.bullets, LIMITS.bullet),
        }), []),
      D.experience,
    ),
    education: arrOr(
      src.education,
      (v) =>
        list<ProfileEducation>(v, (o) => ({
          school: str(o.school, "").slice(0, LIMITS.school),
          degree: strOr(o.degree, "").slice(0, LIMITS.degree),
          years: strOr(o.years, "").slice(0, LIMITS.years),
          note: strOr(o.note, "").slice(0, LIMITS.note),
        }), []),
      D.education,
    ),
    skills: arrOr(
      src.skills,
      (v) =>
        list<ProfileSkill>(v, (o, i) => {
          const label = str(o.label, "").slice(0, LIMITS.skill);
          if (!label) return null;
          return {
            id: str(o.id, `skill-${i}`),
            label,
            endorsements: clampNum(o.endorsements, 0, 0, 100000),
            topEndorsers: lines(o.topEndorsers, LIMITS.name),
            isTop3: o.isTop3 === true,
          };
        }, []).slice(0, LIMITS.maxSkills),
      D.skills,
    ),
    recommendations: arrOr(
      src.recommendations,
      (v) =>
        list<Recommendation>(v, (o, i) => ({
          id: str(o.id, `rec-${i}`),
          author: strOr(o.author, ""),
          authorHeadline: strOr(o.authorHeadline, ""),
          relationship: strOr(o.relationship, ""),
          text: strOr(o.text, ""),
          ago: strOr(o.ago, ""),
          status: o.status === "published" ? "published" : "pending",
        }), []),
      D.recommendations,
    ),
    certifications: arrOr(
      src.certifications,
      (v) =>
        list<ProfileCertification>(v, (o) => {
          const name = str(o.name, "").slice(0, LIMITS.cert);
          return name ? { name, issuer: strOr(o.issuer, ""), date: strOr(o.date, "") } : null;
        }, []),
      D.certifications ?? [],
    ),
    contributorPrompt: strOr(src.contributorPrompt, fromServer ? "" : D.contributorPrompt).slice(0, LIMITS.prompt),
    photos: parseLovePhotos(src.photos, fromServer ? [] : D.photos),
    posts: arrOr(
      src.posts,
      (v) =>
        list<ProfilePost>(v, (o, i) => {
          const text = str(o.text, "").slice(0, LIMITS.post);
          return text ? { id: str(o.id, `post-${i}`), text, ago: strOr(o.ago, "") } : null;
        }, []).slice(0, LIMITS.maxPosts),
      D.posts,
    ),
    languages: arrOr(
      src.languages,
      (v) =>
        list<ProfileLanguage>(v, (o) => {
          const name = str(o.name, "").slice(0, LIMITS.language);
          return name ? { name, level: strOr(o.level, "").slice(0, LIMITS.level) } : null;
        }, []).slice(0, LIMITS.maxLanguages),
      D.languages,
    ),
    letter: typeof src.letter === "string" ? src.letter.slice(0, MAX_LETTER_LEN) : fromServer ? "" : D.letter,
    lockQuestion: typeof src.lockQuestion === "string" ? src.lockQuestion.slice(0, MAX_LOCK_QUESTION_LEN) : fromServer ? "" : D.lockQuestion,
    lockAnswer: typeof src.lockAnswer === "string" ? src.lockAnswer.slice(0, MAX_LOCK_ANSWER_LEN) : fromServer ? "" : D.lockAnswer,
  };
}

/** A work-in-progress draft from localStorage: fill anything an older draft lacks from the demo. */
export function restoreDraft(raw: unknown): ProfileProData | null {
  const d = obj(raw);
  if (!d.person || typeof d.person !== "object") return null;
  const base = dbToProfileData(d, { fromServer: false });
  // Drafts keep half-written rows verbatim — the coercer above drops empty ones.
  return {
    ...base,
    experience: Array.isArray(d.experience) ? (d.experience as ProfileExperience[]) : base.experience,
    skills: Array.isArray(d.skills) ? (d.skills as ProfileSkill[]) : base.skills,
    posts: Array.isArray(d.posts) ? (d.posts as ProfilePost[]) : base.posts,
  };
}

/** Photos the AI may have stubbed (a caption on a slot with no picture) are dropped. */
export function tidyProfile(d: ProfileProData): ProfileProData {
  return {
    ...d,
    photos: (d.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url),
    posts: (d.posts ?? []).map((p, i) => ({ id: p.id || `post-${i}`, text: p.text ?? "", ago: p.ago || (i === 0 ? "2w" : `${i + 1}mo`) })).filter((p) => p.text.trim()),
    about: (d.about ?? []).map((a) => a.trim()).filter(Boolean),
    skills: (d.skills ?? []).map((s) => ({ ...s, label: s.label.trim() })).filter((s) => s.label),
    certifications: (d.certifications ?? []).filter((c) => c.name.trim()),
    languages: (d.languages ?? []).filter((l) => l.name.trim()),
    experience: (d.experience ?? []).map((e) => ({ ...e, bullets: (e.bullets ?? []).map((b) => b.trim()).filter(Boolean) })).filter((e) => e.role.trim() || e.company.trim()),
  };
}

/** Exactly what still stops Save, in the words the form uses. */
export function missingForSave(d: ProfileProData): string[] {
  const out: string[] = [];
  if (!d.person.name.trim()) out.push("their name");
  if (!d.senderName.trim()) out.push("your name");
  if (!d.person.headline.trim()) out.push("a headline");
  return out;
}

// ─── derivations the page draws from data it already has ─────────────────────

export const firstName = (n: string) => n.trim().split(/\s+/)[0] || n.trim();

export const slugOf = (n: string) =>
  n.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "you";

/** Everyone who appears on the page — endorsers and recommenders — deduplicated. */
export function peopleOf(d: ProfileProData): { name: string; headline: string }[] {
  // Keyed on first name: "Sneha Iyer" who recommended and "Sneha" who endorsed are one person.
  const key = (n: string) => firstName(n).toLowerCase();
  const seen = new Set<string>([key(d.person.name), key(d.senderName)]);
  const out: { name: string; headline: string }[] = [];
  for (const r of d.recommendations) {
    if (r.status !== "published") continue;
    const k = key(r.author);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push({ name: r.author, headline: r.authorHeadline || `Recommended ${firstName(d.person.name)}` });
  }
  for (const s of d.skills) {
    for (const e of s.topEndorsers) {
      const k = key(e);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push({ name: e, headline: `Endorsed ${firstName(d.person.name)} for ${s.label}` });
    }
  }
  return out;
}

/** Companies grouped the way the Experience section groups repeat employers. */
export function groupExperience(items: ProfileExperience[]): { company: string; roles: ProfileExperience[] }[] {
  const out: { company: string; roles: ProfileExperience[] }[] = [];
  for (const e of items) {
    const last = out[out.length - 1];
    if (last && e.company.trim() && last.company.trim().toLowerCase() === e.company.trim().toLowerCase()) last.roles.push(e);
    else out.push({ company: e.company, roles: [e] });
  }
  return out;
}
