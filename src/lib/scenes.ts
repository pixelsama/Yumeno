import { sceneConfig } from './config';
import { responsiveImage } from './images';

// Shared build-time view of the scene configuration: resolves every scene
// image through the responsive-image manifest so both the head preload and
// the backdrop component talk about the same URLs.
export function sceneRuntimeConfig() {
  return {
    ...sceneConfig,
    scenes: sceneConfig.scenes.map((scene) => {
      const image = responsiveImage(scene.image);
      return { ...scene, image: image.src, srcset: image.srcset };
    }),
  };
}
