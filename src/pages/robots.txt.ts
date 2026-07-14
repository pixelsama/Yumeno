import { BASE_URL } from '@/lib/base';
export function GET(context: { site?: URL }) {
  const sitemap = new URL(`${BASE_URL.replace(/^\//, '')}sitemap-index.xml`, context.site);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
