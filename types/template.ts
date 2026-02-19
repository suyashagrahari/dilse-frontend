export interface Template {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  previewText: string;
  bodyText: string;
  bgGradient: string;
}

export interface TemplateCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface TemplateType {
  id: string;
  label: string;
  emoji: string;
}
