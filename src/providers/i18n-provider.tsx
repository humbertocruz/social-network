// src/providers/i18n-provider.tsx
'use client';

import { IntlProvider } from 'react-intl';
import { en } from '@/locales/en';
import { pt } from '@/locales/pt';
import { createContext, useContext, useState } from 'react';

const languages = {
  pt,
  en
};

type Language = keyof typeof languages;

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      <IntlProvider
        messages={languages[language]}
        locale={language}
        defaultLocale="pt"
      >
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}
