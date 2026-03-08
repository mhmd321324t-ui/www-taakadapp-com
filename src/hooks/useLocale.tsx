import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectDeviceLanguage, getDirection, isRTLLanguage, loadTranslations, getTranslation } from '@/lib/i18n';

interface LocaleContextType {
  locale: string;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  ready: boolean;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => detectDeviceLanguage());
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const dir = getDirection(locale);
  const isRTL = isRTLLanguage(locale);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;

    // Load translations for detected language
    setReady(false);
    loadTranslations(locale).then(t => {
      setTranslations(t);
      setReady(true);
    });
  }, [locale, dir]);

  const t = (key: string) => translations[key] || getTranslation(key, locale) || key;

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, t, dir, isRTL, ready, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
