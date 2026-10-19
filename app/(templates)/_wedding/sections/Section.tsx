"use client";
// ─── <Section> / <WeddingCard> — the page's building blocks ─────────────────
import type { CSSProperties, ReactNode } from "react";
import { Corners, Divider, type CornerId, type DividerId, type OrnamentId } from "../ornaments";
import { Reveal } from "../WeddingRoot";

export interface SectionProps {
  id?: string;
  /** Small engraved caps above the title ("Save the date"). */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Title in foil (default true). */
  foilTitle?: boolean;
  /** Ornament under the title; null = none. Default "divider-lotus". */
  ornament?: DividerId | OrnamentId | null;
  /** Content max width: "narrow" 640 · "normal" 960 (default) · "wide" 1200 · "full". */
  width?: "narrow" | "normal" | "wide" | "full";
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Section({ id, eyebrow, title, foilTitle = true, ornament = "divider-lotus", width = "normal", children, className, style }: SectionProps) {
  return (
    <section id={id} className={`wk-section wk-w-${width}${className ? ` ${className}` : ""}`} style={style}>
      {(eyebrow || title) && (
        <Reveal className="wk-section-head">
          {eyebrow && <p className="wk-eyebrow">{eyebrow}</p>}
          {title && <h2 className={`wk-h2${foilTitle ? " wk-foil-text wk-shimmer" : ""}`}>{title}</h2>}
          {ornament && <Divider ornament={ornament} space={14} width={260} />}
        </Reveal>
      )}
      {children}
    </section>
  );
}

export interface WeddingCardProps {
  children: ReactNode;
  /** Foil hairline border (default true). */
  foil?: boolean;
  /** Silk paper surface instead of the translucent one. */
  paper?: boolean;
  /** Corner ornaments; null = none (default). */
  corners?: CornerId | OrnamentId | null;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article" | "li";
}

export function WeddingCard({ children, foil = true, paper = false, corners = null, className, style, as: Tag = "div" }: WeddingCardProps) {
  return (
    <Tag className={`wk-card${foil ? " wk-foil-border" : ""}${paper ? " wk-paper" : ""}${className ? ` ${className}` : ""}`} style={style}>
      {corners && <Corners ornament={corners} size="clamp(40px, 11vw, 72px)" inset={6} />}
      {children}
    </Tag>
  );
}
