# Yumeno

![Yumeno](public/yumeno-wordmark.png)

Yumeno is an open-source Astro publishing engine for keeping site source private while publishing a beautiful static website. It is designed for long-form Chinese writing, games, anime, light novels, full HTML documents, configurable visual scenes, and persistent music. Chinese serif typography (Source Han Serif SC VF, SIL OFL) is self-hosted as on-demand unicode-range subsets — see `public/fonts/FONTS.md`.

## Run the demo

Requires Node.js 22.12+ (Node 24 recommended).

```bash
npm install
npm run dev
```

Build a separate private site overlay:

```bash
SITE_SOURCE=../my-blog-source/site \
ASTRO_SITE=https://username.github.io \
ASTRO_BASE=/my-blog \
npm run build
```

The engine defaults to `examples/site`. A site overlay contains `config/`, `content/`, and `public/`. See `AGENTS.md` for the concise AI-facing operating guide and `docs/` for author documentation.

## Repository boundary

- **Public engine:** components, pipelines, schemas, demo content.
- **Private source:** real Markdown/HTML, configuration, drafts and source media.
- **Public output:** generated HTML/CSS/JS and browser-visible media only.

Public visitors can always retrieve rendered site assets. The separation protects source files, drafts and history—not content already published on the website.

## License

Engine code is MIT licensed. Content and media supplied by a site overlay do not inherit that license.
