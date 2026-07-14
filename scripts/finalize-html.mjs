import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import manifest from '../.site/generated/html-manifest.json' with { type: 'json' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = `/${(process.env.ASTRO_BASE ?? '/Yumeno').replace(/^\/+|\/+$/g, '')}`;

for (const item of manifest) {
  const source = path.join(root, '.site', 'content', 'html', item.source);
  const target = path.join(root, 'dist', 'html-docs', item.slug);
  await cp(source, target, { recursive: true });
  const sourceHtml = path.join(target, `${item.source}.html`);
  const fallbackHtml = path.join(target, `${item.slug}.html`);
  const htmlPath = await readFile(sourceHtml, 'utf8').then(
    () => sourceHtml,
    async () => {
      await readFile(fallbackHtml, 'utf8');
      return fallbackHtml;
    },
  );
  const html = (await readFile(htmlPath, 'utf8')).replace(
    /(href|src)=(['"])\/(?!\/)/g,
    `$1=$2${base}/`,
  );
  await writeFile(path.join(target, 'index.html'), html);
  if (htmlPath !== path.join(target, 'index.html')) {
    const { rm } = await import('node:fs/promises');
    await rm(htmlPath);
  }
}
await mkdir(path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist', '.nojekyll'), '');
console.log(`Finalized ${manifest.length} complete HTML document(s).`);
