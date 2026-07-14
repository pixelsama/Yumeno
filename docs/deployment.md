# Three-repository deployment

Keep the reusable engine public, the real site source private, and the generated site public. The private repository's workflow checks out both source and engine, builds with `SITE_SOURCE=../site`, then pushes only `engine/dist` to the public output repository's `gh-pages` branch.

Set `ASTRO_SITE` to the GitHub Pages origin and `ASTRO_BASE` to the repository path. Configure the output repository Pages source as `gh-pages` `/ (root)`. The private source workflow needs `PAGES_DEPLOY_TOKEN`, a fine-grained token limited to output-repository `Contents: Read and write`.
