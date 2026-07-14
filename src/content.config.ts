import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const content = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './.site/content/markdown' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    section: z.enum(['article', 'essay', 'game', 'anime', 'light-novel']),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    slug: z.string(),
    lang: z.string().default('zh-CN'),
    gameTitle: z.string().optional(),
    developer: z.string().optional(),
    platform: z.array(z.string()).optional(),
    releaseYear: z.number().int().optional(),
    rating: z.number().min(0).max(10).optional(),
    animeTitle: z.string().optional(),
    season: z.string().optional(),
    studio: z.string().optional(),
    year: z.number().int().optional(),
    subtype: z.enum(['recommendation', 'original']).optional(),
    series: z.string().optional(),
    seriesTitle: z.string().optional(),
    seriesDescription: z.string().optional(),
    volume: z.string().optional(),
    chapter: z.string().optional(),
    chapterOrder: z.number().optional(),
  }),
});

export const collections = { content };
