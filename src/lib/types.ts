export const sections = ['article', 'essay', 'game', 'anime', 'light-novel'] as const;
export type ContentSection = (typeof sections)[number];

export interface BrandConfig {
  mode: 'text' | 'image';
  text: string;
  image?: string;
  width?: number;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  language: string;
  brand: BrandConfig;
  author: { name: string; bio: string; avatar?: string };
  hero: { eyebrow: string; title: string; description: string };
  navigation: Array<{ label: string; href: string }>;
  social: Array<{ label: string; href: string }>;
  about: {
    title: string;
    lead: string;
    paragraphs: string[];
    interests: string[];
    directions: string[];
  };
  features: { search: boolean; music: boolean; sceneSwitcher: boolean; imageLightbox: boolean };
  home: { recentCount: number; featuredCount: number };
  footer: { copyrightStart: number; note: string };
}

export type SceneTheme = 'light' | 'dark';
export type SceneSlot = 'hero' | 'ambient';
export interface SceneConditions {
  hours?: Array<[number, number]>;
  months?: number[];
  dates?: string[];
  dateRanges?: Array<[string, string]>;
  weekdays?: number[];
  themes?: SceneTheme[];
  pages?: string[];
  sections?: ContentSection[];
  slots?: SceneSlot[];
}
export interface Scene {
  id: string;
  label: string;
  image: string;
  alt: string;
  author?: string;
  source?: string;
  license?: string;
  focus?: string;
  mask?: number;
  accent?: string;
  accentSoft?: string;
  priority: number;
  weight?: number;
  manualSelectable?: boolean;
  conditions?: SceneConditions;
}
export interface SceneConfig {
  fallback: string;
  stableFor: 'day' | 'session';
  scenes: Scene[];
}

export interface TrackBase {
  id: string;
  title: string;
  artist: string;
  cover?: string;
}
export type MusicTrack =
  (TrackBase & { source: 'local'; file: string }) | (TrackBase & { source: 'remote'; url: string });
export interface MusicConfig {
  enabled: boolean;
  initialVolume: number;
  tracks: MusicTrack[];
}

export interface HtmlContentData {
  title: string;
  description: string;
  published: string;
  updated?: string;
  section: ContentSection;
  tags: string[];
  cover?: string;
  draft?: boolean;
  featured?: boolean;
  pinned?: boolean;
  slug: string;
  lang?: string;
  source: string;
  searchText: string;
}
