/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  __YUMENO_SCENES__?: unknown;
  __YUMENO_SCENE_BOUND__?: boolean;
  __YUMENO_SCENE_PICK__?: (context: Record<string, unknown>) => any;
  __YUMENO_SCENE_FALLBACK__?: () => any;
}
