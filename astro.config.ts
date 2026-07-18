import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import { rehypeBasePath } from './scripts/rehype-base-path.mjs';
import { rehypeMermaidBlock } from './scripts/rehype-mermaid-block.mjs';

const site = process.env.ASTRO_SITE ?? 'https://example.github.io';
const base = process.env.ASTRO_BASE ?? '/Yumeno';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex, rehypeMermaidBlock, [rehypeBasePath, { base }]],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: { build: { chunkSizeWarningLimit: 900 } },
});
