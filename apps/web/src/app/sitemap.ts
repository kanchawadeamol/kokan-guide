import { SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { MetadataRoute } from 'next';

import { buildAlternates, getSiteUrl } from '../lib/site';

/** One entry per locale and page, each listing its hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return SUPPORTED_LOCALES.map((locale) => {
    const { canonical, languages } = buildAlternates(site, locale);
    return { url: canonical, alternates: { languages }, changeFrequency: 'weekly', priority: 1 };
  });
}
