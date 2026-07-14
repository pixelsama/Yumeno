# Yumeno agent guide

Yumeno is the **public engine**. Never add a real site's private writing, drafts, credentials or licensed media here. The default demo lives in `examples/site`; a private site is supplied with `SITE_SOURCE=/path/to/site`.

## Work safely

- Node 22.12+; run `npm ci`, `npm run check`, `npm run build`, and `npm run format:check`.
- Always test a non-root base such as `ASTRO_BASE=/Yumeno`; route assets through `withBase()`.
- Engine output is `dist/`; `.site/` and copied `public/media/` are generated and ignored.
- Do not weaken complete-HTML trust boundaries: HTML is owner-authored and unsanitized, rendered in a sandboxed iframe and copied as an independent document.

## Configuration

`site/config/site.json` controls name, description, author, hero, navigation, social links, about page, feature switches, home counts, footer and `brand`:

- text logo: `{ "mode": "text", "text": "My Blog" }`
- image logo: `{ "mode": "image", "text": "My Blog", "image": "/brand.png", "width": 168 }`

`scenes.json` controls images, focus, mask, accent, priority/weight and combined time/date/theme/page/section rules. `music.json` controls local files and directly playable remote audio URLs.

## Content

- Markdown: `site/content/markdown/**/*.md`; required frontmatter is `title`, `description`, `published`, `section`, `slug`. Optional: `updated`, `tags`, `cover`, `draft`, `featured`, `pinned` and section-specific fields.
- Sections: `article`, `essay`, `game`, `anime`, `light-novel`.
- Original novels use `subtype: original`, `series`, `seriesTitle`, `volume`, `chapter`, `chapterOrder`—one Markdown file per chapter.
- Complete HTML: pair `name.html` with `name.meta.json`; adjacent CSS/JS are copied. It participates in archive, tags, RSS, SEO and Pagefind.
- Standard GFM, math, Mermaid, code fences, footnotes and raw HTML are supported. Bilibili embeds use a normal responsive iframe.

## Changes and commits

Keep reusable behavior in this repository and site-specific data in the private source repository. Use small conventional commits; update docs/schema whenever a config shape changes. Never commit `dist/`, dependencies or a private overlay.
