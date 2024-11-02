// src/app/[locale]/metadata.ts
import { Locale, locales } from '@/config/i18n';

type GenerateMetadataProps = {
  params: { locale: Locale };
};

export function generateMetadata({ params: { locale } }: GenerateMetadataProps) {
  return {
    title: {
      default: locale === 'en' ? 'Vibe - No Lies' : 'Vibe - Sem Mentiras',
      template: locale === 'en' ? '%s | Vibe' : '%s | Vibe'
    },
    description: 
      locale === 'en' 
        ? 'Connect authentically with people who matter'
        : 'Conecte-se autenticamente com pessoas que importam',
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
