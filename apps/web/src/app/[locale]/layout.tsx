import '../globals.css';

import { toThemeStylesheet } from '@konkan/design-tokens';
import { isLocale, LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { SiteHeader } from '../../components/SiteHeader';
import { messages } from '../../i18n/messages';
import { buildAlternates, getSiteUrl } from '../../lib/site';

// Not exported: Next.js only allows its own named exports from layout files.
const MAIN_CONTENT_ID = 'main-content';

/** Only supported locales exist; anything else (e.g. /fr) is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = messages[locale];
  const site = getSiteUrl();
  return {
    metadataBase: site,
    title: { default: t.siteName, template: `%s | ${t.siteName}` },
    description: t.metaDescription,
    alternates: buildAlternates(site, locale),
    openGraph: {
      type: 'website',
      siteName: t.siteName,
      locale: LOCALE_INFO[locale].bcp47.replace('-', '_'),
    },
  };
}

// Trusted, build-time constant generated from design tokens (no user input).
const themeCss = toThemeStylesheet();

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = messages[locale];

  return (
    <html lang={LOCALE_INFO[locale].bcp47}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>
        <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
          {t.skipToContent}
        </a>
        <SiteHeader locale={locale} />
        <main id={MAIN_CONTENT_ID} className="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
