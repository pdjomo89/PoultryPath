import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messages, type Messages } from './messages';

export type Lang = 'en' | 'fr';
export const LANGS: Lang[] = ['en', 'fr'];

/** A value written in every language, e.g. `{ en: 'Pigs', fr: 'Porcs' }`. */
export type L<T = string> = Record<Lang, T>;

/** Locale used for numbers, currency and dates. */
const LOCALES: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR' };
const STORAGE_KEY = 'poultryfarm:lang';

const isLang = (v: unknown): v is Lang => v === 'en' || v === 'fr';

/** ?lang=fr in the URL wins, then the visitor's saved choice, then their browser language. */
function initialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) return fromUrl;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage blocked — fall through */
  }
  const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
  return browser.some((l) => l?.toLowerCase().startsWith('fr')) ? 'fr' : 'en';
}

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Interface text for the current language. */
  t: Messages;
  /** Pick the current language from a bilingual value. */
  tx: <T>(value: L<T>) => T;
  locale: string;
}

const I18nContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const t = messages[lang];

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  }, [lang, t]);

  const value = useMemo<I18n>(
    () => ({ lang, setLang, t, tx: (v) => v[lang], locale: LOCALES[lang] }),
    [lang, setLang, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}
