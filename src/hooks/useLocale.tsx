import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  detectDeviceLanguage,
  getDirection,
  getTranslation,
  getArabicStrings,
  isRTLLanguage,
  loadTranslations,
} from '@/lib/i18n';

interface LocaleContextType {
  locale: string;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  ready: boolean;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function looksLikeArabicFallback(trans: Record<string, string>, sampleKeys: string[]): boolean {
  const arabic = getArabicStrings();
  return sampleKeys.every((k) => trans[k] && trans[k] === arabic[k]);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => detectDeviceLanguage());
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [dir, setDir] = useState<'rtl' | 'ltr'>(() => getDirection(detectDeviceLanguage()));

  const isRTL = dir === 'rtl';

  useEffect(() => {
    // Load translations for detected language
    setReady(false);

    loadTranslations(locale).then((t) => {
      const sampleKeys = ['appName', 'home', 'more', 'login', 'signup', 'prayerTimes', 'qibla', 'quran'];

      // If translation failed (or blocked) we fall back to Arabic strings.
      // In that case, force RTL so Arabic text doesn’t render in LTR layouts.
      const shouldForceArabicDir =
        locale !== 'ar' && !isRTLLanguage(locale) && looksLikeArabicFallback(t, sampleKeys);

      const effectiveLang = shouldForceArabicDir ? 'ar' : locale;
      const nextDir = getDirection(effectiveLang);

      setTranslations(t);
      setDir(nextDir);
      setReady(true);

      document.documentElement.dir = nextDir;
      document.documentElement.lang = effectiveLang;
    });
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => translations[key] || getTranslation(key, locale) || key;
  }, [translations, locale]);

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
