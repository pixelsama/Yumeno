import manifestJson from '../../.site/generated/image-manifest.json';
import { withBase } from './base';

interface ImageManifestEntry {
  width: number;
  height: number;
  variants: Array<{ src: string; width: number }>;
}

const manifest = manifestJson as Record<string, ImageManifestEntry>;

export function responsiveImage(path: string) {
  const entry = manifest[path];
  return {
    src: withBase(path),
    srcset: entry?.variants
      .map((variant) => `${withBase(variant.src)} ${variant.width}w`)
      .join(', '),
    width: entry?.width,
    height: entry?.height,
  };
}
