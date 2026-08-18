"use client";

// ─── Endorsements — the body sections ────────────────────────────────────────
//
// About, Experience, Education, Certifications. Four white cards with a hairline
// border and no shadow, stacked by the template with a 12px gap.
//
// ── THE CHROME KEEPS A STRAIGHT FACE ─────────────────────────────────────────
// Every line in here is a joke written by the sender ("Reduced his overthinking
// by 12% QoQ"), which only lands if the layout around it is completely sincere.
// So: no colour on the bullets, no icons in the margins, no pull quotes, no
// emphasis anywhere the real thing wouldn't have it. If a reader notices the
// styling of an experience entry, the entry has stopped being funny.
//
// ── ABOUT COLLAPSES BY MEASUREMENT, NOT BY GUESS ─────────────────────────────
// The fold is three lines. Getting there with a fixed `max-height` means picking
// a pixel number that is wrong for every other font size and every other width,
// and it makes the expand animation start late and finish early. Instead we read
// the content's `scrollHeight` and animate `height` between 60px and that, in
// 300ms — a real measurement, re-taken whenever the box resizes.
//
// ── SEPARATORS ARE INSET PAST THE LOGO ───────────────────────────────────────
// Each entry's rule starts at 64px (48px mark + 16px gap), so it aligns with the
// text column rather than cutting the whole card in half. Education and
// Certifications use a 40px mark and a 56px inset for the same reason.

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Avatar } from "./Avatar";
import { PP, Card } from "./theme";
import type { ProfileCertification, ProfileEducation, ProfileExperience } from "./types";

/** 3 lines × the 20px line-height the About copy is set in. */
const ABOUT_FOLD = 60;

function Heading(props: { children: ReactNode }) {
  return (
    <h2 style={{ margin: "0 0 12px", fontSize: 20, lineHeight: "24px", fontWeight: 600, color: PP.ink }}>
      {props.children}
    </h2>
  );
}

function Rule(props: { inset: number }) {
  return <div aria-hidden="true" style={{ height: 1, background: PP.edge, margin: `12px 0 12px ${props.inset}px` }} />;
}

/** True while the OS asks for no motion. Read on the client, so SSR stays calm. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export function AboutSection(props: { about: string[] }) {
  const paragraphs = props.about.filter((p) => p.trim());
  const bodyRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  // scrollHeight is the CONTENT height even while the box is clipped to 60px,
  // so measuring never depends on which state we happen to be in — and never
  // feeds its own animation back into a loop.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const measure = () => setFull(el.scrollHeight);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paragraphs.length]);

  if (paragraphs.length === 0) return null;

  const clamped = full !== null && full > ABOUT_FOLD + 1;
  const height = !clamped ? undefined : open ? full : ABOUT_FOLD;

  return (
    <Card>
      <Heading>About</Heading>
      <div
        id="pp-about-body"
        ref={bodyRef}
        style={{
          height,
          overflow: clamped ? "hidden" : undefined,
          transition: reduced ? "none" : "height 300ms ease",
        }}
      >
        {paragraphs.map((text, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : "12px 0 0", fontSize: 14, lineHeight: "20px", color: PP.ink }}>
            {text}
          </p>
        ))}
      </div>
      {clamped ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="pp-about-body"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 44,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontFamily: PP.font,
            fontSize: 14,
            fontWeight: 600,
            color: PP.inkSoft,
          }}
        >
          {open ? "see less" : "…see more"}
        </button>
      ) : null}
    </Card>
  );
}

/** One row: a square mark on the left, a text column on the right. */
function Entry(props: { name: string; logoUrl?: string; size: number; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
      <Avatar name={props.name} src={props.logoUrl} size={props.size} square />
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>{props.children}</div>
    </div>
  );
}

export function ExperienceSection(props: { items: ProfileExperience[] }) {
  if (props.items.length === 0) return null;
  return (
    <Card>
      <Heading>Experience</Heading>
      {props.items.map((item, i) => (
        <div key={`${item.company}-${i}`}>
          {i > 0 ? <Rule inset={64} /> : null}
          <Entry name={item.company} logoUrl={item.logoUrl} size={48}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: "20px", fontWeight: 600, color: PP.ink }}>{item.role}</p>
            <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.ink }}>
              {item.company}
              {item.type ? ` · ${item.type}` : ""}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.inkSoft }}>
              {item.duration}
              {item.location ? ` · ${item.location}` : ""}
            </p>
            {item.bullets.length > 0 ? (
              <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", listStyle: "disc" }}>
                {item.bullets.map((line, b) => (
                  <li key={b} style={{ fontSize: 14, lineHeight: "20px", color: PP.ink }}>
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </Entry>
        </div>
      ))}
    </Card>
  );
}

export function EducationSection(props: { items: ProfileEducation[] }) {
  if (props.items.length === 0) return null;
  return (
    <Card>
      <Heading>Education</Heading>
      {props.items.map((item, i) => (
        <div key={`${item.school}-${i}`}>
          {i > 0 ? <Rule inset={56} /> : null}
          <Entry name={item.school} size={40}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: "19px", fontWeight: 600, color: PP.ink }}>{item.school}</p>
            <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.ink }}>{item.degree}</p>
            <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.inkSoft }}>{item.years}</p>
            {item.note ? (
              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px", color: PP.ink }}>{item.note}</p>
            ) : null}
          </Entry>
        </div>
      ))}
    </Card>
  );
}

export function CertificationsSection(props: { items: ProfileCertification[] }) {
  if (props.items.length === 0) return null;
  return (
    <Card>
      <Heading>Licenses &amp; certifications</Heading>
      {props.items.map((item, i) => (
        <div key={`${item.name}-${i}`}>
          {i > 0 ? <Rule inset={56} /> : null}
          <Entry name={item.issuer || item.name} size={40}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: "19px", fontWeight: 600, color: PP.ink }}>{item.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.ink }}>{item.issuer}</p>
            <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.inkSoft }}>{item.date}</p>
          </Entry>
        </div>
      ))}
    </Card>
  );
}
