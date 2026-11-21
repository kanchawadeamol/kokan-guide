import { isLocale } from '@konkan/shared-types';
import { notFound } from 'next/navigation';

import { messages } from '../../i18n/messages';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = messages[locale];

  return (
    <>
      <h1>{t.homeHeading}</h1>
      <p>{t.homeIntro}</p>
      <p>{t.comingSoon}</p>
    </>
  );
}
