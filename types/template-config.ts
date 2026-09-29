import type { LucideIcon } from "lucide-react";

export interface TabConfig {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface CoverPageConfig {
  subtitle: string;
  ctaText: string;
  floatingEmojis: string[];
}

export interface LetterPageConfig {
  headerEmoji: string;
  title: string;
  greeting: string;
  decorEmojis: string[];
}

export interface FinalPageConfig {
  headerEmoji: string;
  title: string;
  subtitle: string;
  wishes: string[];
  closingEmoji: string;
  closingSubtext: string;
}

export interface TemplatePageConfig {
  slug: string;
  type: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  previewText: string;
  bodyText: string;
  bgGradient: string;
  coverImage?: string;

  tabs: TabConfig[];
  navActiveColor: string;
  navActiveBg: string;
  floatStyle: "circles" | "hearts" | "stars";

  pages: {
    cover: CoverPageConfig;
    letter: LetterPageConfig;
    final: FinalPageConfig;
  };
}

export interface TemplateListItem {
  slug: string;
  type: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  bgGradient: string;
  coverImage?: string;
  /** Part of the premium collection — shown in its own gallery section with a luxury card. */
  premium?: boolean;
}
