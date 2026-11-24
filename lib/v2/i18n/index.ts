import { DEFAULT_LOCALE, LOCALES, type Locale, type LocaleDictionary } from "../types";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { pt } from "./pt";

export { pt, en, fr, es };
export { LOCALES, DEFAULT_LOCALE };
export type { Locale, LocaleDictionary };

export const DICTIONARIES: Record<Locale, LocaleDictionary> = {
  pt,
  en,
  fr,
  es,
};

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionary(locale?: string | null): LocaleDictionary {
  return DICTIONARIES[resolveLocale(locale)];
}
