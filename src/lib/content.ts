import { getCollection, type CollectionEntry } from 'astro:content';
import { htmlContent } from './config';
import type { ContentSection, HtmlContentData } from './types';

export type MarkdownEntry = CollectionEntry<'content'>;
export type UnifiedEntry =
  { kind: 'markdown'; entry: MarkdownEntry } | { kind: 'html'; entry: HtmlContentData };
export const sectionInfo: Record<ContentSection, { label: string; path: string; note: string }> = {
  article: { label: '文章', path: 'articles', note: '技术、AI 与认真展开的思考' },
  essay: { label: '杂笔', path: 'essays', note: '一些不必被论证完整的片刻' },
  game: { label: '游戏', path: 'games', note: '推荐、体验与长篇分析' },
  anime: { label: '动漫', path: 'anime', note: '动画推荐、评论与观看札记' },
  'light-novel': { label: '轻小说', path: 'light-novels', note: '书评、推荐与原创长篇' },
};

export async function getMarkdownEntries(): Promise<MarkdownEntry[]> {
  return (await getCollection('content', ({ data }) => !data.draft || import.meta.env.DEV)).sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf(),
  );
}
export async function getAllEntries(): Promise<UnifiedEntry[]> {
  const markdown = (await getMarkdownEntries()).map(
    (entry) => ({ kind: 'markdown', entry }) as const,
  );
  const html = htmlContent
    .filter((entry) => !entry.draft || import.meta.env.DEV)
    .map((entry) => ({ kind: 'html', entry }) as const);
  return [...markdown, ...html].sort(
    (a, b) =>
      Number(Boolean(dataOf(b).pinned)) - Number(Boolean(dataOf(a).pinned)) ||
      publishedOf(b).valueOf() - publishedOf(a).valueOf(),
  );
}
export function dataOf(item: UnifiedEntry) {
  return item.kind === 'markdown' ? item.entry.data : item.entry;
}
export function publishedOf(item: UnifiedEntry): Date {
  return item.kind === 'markdown' ? item.entry.data.published : new Date(item.entry.published);
}
export function routeFor(item: UnifiedEntry | MarkdownEntry | HtmlContentData): string {
  if ('kind' in item)
    return item.kind === 'html' ? `/html/${item.entry.slug}/` : routeFor(item.entry);
  if ('data' in item) return `/${sectionInfo[item.data.section].path}/${item.data.slug}/`;
  return `/html/${item.slug}/`;
}
export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(typeof value === 'string' ? new Date(value) : value);
}
export function readingMinutes(body: string): number {
  const cjk = (body.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = (body.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.ceil(cjk / 350 + words / 220));
}
export function getOriginalChapters(entries: MarkdownEntry[], series: string) {
  return entries
    .filter((entry) => entry.data.subtype === 'original' && entry.data.series === series)
    .sort((a, b) => (a.data.chapterOrder ?? 0) - (b.data.chapterOrder ?? 0));
}
