const cleanBase = `/${import.meta.env.BASE_URL.replace(/^\/+|\/+$/g, '')}`;
export const BASE_URL = cleanBase === '/' ? '/' : `${cleanBase}/`;

export function withBase(value: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('#')) return value;
  const path = value.startsWith('/') ? value.slice(1) : value;
  return `${BASE_URL}${path}`.replace(/\/{2,}/g, '/');
}

export function absoluteUrl(value: string): string {
  return new URL(withBase(value), AstroSite()).href;
}

function AstroSite(): string {
  return import.meta.env.SITE || 'https://example.github.io';
}
