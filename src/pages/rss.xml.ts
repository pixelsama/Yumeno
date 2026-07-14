import rss from '@astrojs/rss';
import { getAllEntries, dataOf, publishedOf, routeFor } from '@/lib/content';
import { siteConfig } from '@/lib/config';
import { BASE_URL } from '@/lib/base';
export async function GET(context: { site?: URL }) {
  const entries = await getAllEntries();
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: new URL(BASE_URL, context.site),
    items: entries.map((item) => ({
      title: dataOf(item).title,
      description: dataOf(item).description,
      pubDate: publishedOf(item),
      link: routeFor(item),
    })),
  });
}
