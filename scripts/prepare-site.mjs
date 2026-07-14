import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(root, process.env.SITE_SOURCE ?? 'examples/site');
const target = path.join(root, '.site');

if (!existsSync(path.join(source, 'config', 'site.json'))) {
  throw new Error(`Invalid site overlay: ${source}`);
}

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
await rm(path.join(root, 'public', 'media'), { recursive: true, force: true });
await rm(path.join(root, 'public', 'html-docs'), { recursive: true, force: true });
if (existsSync(path.join(source, 'public', 'media'))) {
  await cp(path.join(source, 'public', 'media'), path.join(root, 'public', 'media'), {
    recursive: true,
  });
}

const htmlRoot = path.join(target, 'content', 'html');
const manifest = [];
if (existsSync(htmlRoot)) {
  for (const directory of await readdir(htmlRoot, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const folder = path.join(htmlRoot, directory.name);
    const files = await readdir(folder);
    const htmlName = files.find((name) => name.endsWith('.html'));
    if (!htmlName) continue;
    const metaName = htmlName.replace(/\.html$/, '.meta.json');
    if (!files.includes(metaName)) throw new Error(`Missing ${metaName}`);
    const html = await readFile(path.join(folder, htmlName), 'utf8');
    if (!/<html[\s>]/i.test(html) || !/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) {
      throw new Error(`${htmlName} must be a complete HTML document`);
    }
    const meta = JSON.parse(await readFile(path.join(folder, metaName), 'utf8'));
    const searchText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    manifest.push({
      ...meta,
      slug: meta.slug ?? directory.name,
      source: directory.name,
      searchText,
    });
  }
}
await mkdir(path.join(target, 'generated'), { recursive: true });
await writeFile(
  path.join(target, 'generated', 'html-manifest.json'),
  JSON.stringify(manifest, null, 2),
);
console.log(`Prepared ${source}; ${manifest.length} complete HTML document(s).`);
