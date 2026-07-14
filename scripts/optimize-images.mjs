import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rasterPattern = /\.(?:jpe?g|png|webp)$/i;
const generatedPattern = /\.w\d+\.webp$/i;
const targetWidths = [320, 640, 960, 1280];

async function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    if (entry.isFile() && rasterPattern.test(entry.name) && !generatedPattern.test(entry.name)) {
      files.push(absolute);
    }
  }
  return files;
}

const publicUrl = (publicRoot, file) =>
  `/${path.relative(publicRoot, file).split(path.sep).join('/')}`;

export async function optimizeImages({ mediaRoot, publicRoot, manifestPath }) {
  const manifest = {};
  let variantsCreated = 0;

  for (const file of await walk(mediaRoot)) {
    const image = sharp(file, { animated: true });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) continue;

    const variants = [];
    for (const width of targetWidths.filter((candidate) => candidate < metadata.width)) {
      const parsed = path.parse(file);
      const output = path.join(parsed.dir, `${parsed.name}.w${width}.webp`);
      await sharp(file)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 72, effort: 4, smartSubsample: true })
        .toFile(output);
      variants.push({ src: publicUrl(publicRoot, output), width });
      variantsCreated += 1;
    }

    variants.push({ src: publicUrl(publicRoot, file), width: metadata.width });
    manifest[publicUrl(publicRoot, file)] = {
      width: metadata.width,
      height: metadata.height,
      variants,
    };
  }

  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { images: Object.keys(manifest).length, variants: variantsCreated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const publicRoot = path.join(root, 'public');
  const result = await optimizeImages({
    mediaRoot: path.resolve(process.argv[2] ?? publicRoot),
    publicRoot: path.resolve(process.argv[3] ?? publicRoot),
    manifestPath: path.resolve(
      process.argv[4] ?? path.join(root, '.site', 'generated', 'image-manifest.json'),
    ),
  });
  console.log(
    `Optimized ${result.images} image(s); created ${result.variants} responsive variant(s).`,
  );
}
