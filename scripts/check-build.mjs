import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const base = `/${(process.env.ASTRO_BASE ?? '/Yumeno').replace(/^\/+|\/+$/g, '')}`;
const site = process.env.ASTRO_SITE ?? 'https://example.github.io';
const expectedCanonical = new URL(`${base}/`, site).href;

async function walk(directory) {
  const output = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isDirectory()) output.push(...(await walk(full)));
    else output.push(full);
  }
  return output;
}

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (
    !file.includes(`${path.sep}html-docs${path.sep}`) &&
    !html.includes('<link rel="canonical"')
  ) {
    throw new Error(`Missing canonical: ${path.relative(dist, file)}`);
  }
  const badRoot = [...html.matchAll(/(?:href|src)="\/(?!\/)([^"#?]+)"/g)].find(
    (match) => !match[0].includes(`${base}/`) && !match[0].includes('href="/#'),
  );
  if (badRoot) throw new Error(`Base path leak in ${path.relative(dist, file)}: ${badRoot[0]}`);
  const sceneImage = html.match(/<img\b[^>]*\bid="scene-image"[^>]*>/i)?.[0];
  if (sceneImage && /\bsrc=/.test(sceneImage)) {
    throw new Error(`Scene image must be selected before requesting media: ${file}`);
  }
  const musicAudio = html.match(/<audio\b[^>]*\bid="music-audio"[^>]*>/i)?.[0];
  if (musicAudio && (!/\bpreload="none"/.test(musicAudio) || /\bsrc=/.test(musicAudio))) {
    throw new Error(`Music must stay unloaded before user interaction: ${file}`);
  }
  if (/<\/html>\s*\S+/i.test(html)) throw new Error(`Content after </html>: ${file}`);
}
for (const required of ['index.html', 'rss.xml', 'robots.txt', 'sitemap-index.xml', '.nojekyll']) {
  if (!files.some((file) => path.relative(dist, file) === required))
    throw new Error(`Missing ${required}`);
}
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!home.includes(expectedCanonical))
  throw new Error(`Home canonical must be ${expectedCanonical}`);
console.log(`Validated ${htmlFiles.length} HTML files and GitHub Pages base ${base}.`);
