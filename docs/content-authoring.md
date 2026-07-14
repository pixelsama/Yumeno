# Content authoring

Markdown files live under `site/content/markdown/` and may be grouped freely.

```yaml
---
title: Example title
description: Search and SEO summary
published: 2026-07-14
section: article # article | essay | game | anime | light-novel
tags: [Astro, Writing]
cover: /media/covers/example.webp
draft: false
featured: false
pinned: false
slug: stable-url
---
```

Games may add `gameTitle`, `developer`, `platform`, `releaseYear`, `rating`; anime may add `animeTitle`, `season`, `studio`, `year`. Light-novel recommendations use `subtype: recommendation`. Original chapters use `subtype: original`, `series`, `seriesTitle`, `volume`, `chapter`, and numeric `chapterOrder`.

For Bilibili, place a normal iframe inside `<div class="video-embed">`. For a complete HTML document, pair `document.html` with `document.meta.json`; keep its CSS/JS beside it. Complete HTML is trusted and is not sanitized.
