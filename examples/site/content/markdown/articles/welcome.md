---
title: Welcome to Yumeno
description: The minimal public demo for the Yumeno publishing engine.
published: 2026-07-14
section: article
tags: [Yumeno, Astro]
featured: true
pinned: true
slug: welcome
---

Yumeno keeps the engine reusable and lets a separate private overlay provide the real site.

## A normal Markdown workflow

Write standard Markdown, commit it to the private source, and let the build create routes, search, RSS, tags and SEO.

```mermaid
flowchart LR
  A[Private source] --> B[Yumeno]
  B --> C[Public static site]
```
