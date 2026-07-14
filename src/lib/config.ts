import siteJson from '../../.site/config/site.json';
import scenesJson from '../../.site/config/scenes.json';
import musicJson from '../../.site/config/music.json';
import htmlJson from '../../.site/generated/html-manifest.json';
import type { HtmlContentData, MusicConfig, SceneConfig, SiteConfig } from './types';

export const siteConfig = validateSite(siteJson as SiteConfig);
export const sceneConfig = validateScenes(scenesJson as SceneConfig);
export const musicConfig = validateMusic(musicJson as MusicConfig);
export const htmlContent = htmlJson as HtmlContentData[];

function validateSite(value: SiteConfig): SiteConfig {
  if (!value.name || !value.description || !Array.isArray(value.navigation)) {
    throw new Error('site.json is missing required fields');
  }
  if (!value.brand?.text || !['text', 'image'].includes(value.brand.mode)) {
    throw new Error('site.json brand must define mode and text');
  }
  if (value.brand.mode === 'image' && !value.brand.image) {
    throw new Error('Image brand mode requires brand.image');
  }
  return value;
}

function validateScenes(value: SceneConfig): SceneConfig {
  if (!value.scenes.some((scene) => scene.id === value.fallback)) {
    throw new Error('Scene fallback must reference an existing scene');
  }
  if (new Set(value.scenes.map((scene) => scene.id)).size !== value.scenes.length) {
    throw new Error('Scene ids must be unique');
  }
  return value;
}

function validateMusic(value: MusicConfig): MusicConfig {
  if (value.initialVolume < 0 || value.initialVolume > 1) throw new Error('Invalid initial volume');
  return value;
}
