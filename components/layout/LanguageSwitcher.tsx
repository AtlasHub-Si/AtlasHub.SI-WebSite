"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { localePath, stripLocaleFromPath } from "@/lib/v2/navigation";
import { LOCALES, type Locale } from "@/lib/v2/types";

export interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
  compact?: boolean;
  onSelect?: () => void;
  className?: string;
}

const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  fr: "FR",
  es: "ES",
};

const LOCALE_FULL_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  es: "Español",
};

/**
 * Preserves the active route suffix when switching between PT, EN, FR, and ES
 * and persists the visitor's explicit choice via the `atlas_locale` cookie.
 */
export function LanguageSwitcher({
  locale,
  label,
  compact = false,
  onSelect,
  className = "",
}: LanguageSwitcherProps) {
  const pathname = usePathname() || `/${locale}`;
  const isWorkshopRoute = pathname.startsWith("/workshops");
  const routeSuffix = isWorkshopRoute ? "/" : stripLocaleFromPath(pathname);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  useEffect(() => {
    if (!selectedLocale) return;
    try {
      document.cookie = `atlas_locale=${selectedLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage restrictions in embedded previews.
    }
  }, [selectedLocale]);

  const handleSelect = (targetLocale: Locale) => {
    setSelectedLocale(targetLocale);
    onSelect?.();
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-full border border-[#CBD5E1]/15 bg-[#0E151D]/85 p-0.5 ${className}`.trim()}
    >
      {!compact ? (
        <span className="hidden pl-2 pr-1 text-[#94A8B8] xl:inline-flex" aria-hidden="true">
          <Globe className="h-3.5 w-3.5" />
        </span>
      ) : null}
      {LOCALES.map((loc) => {
        const active = loc === locale;
        const href = localePath(loc, routeSuffix);
        return (
          <Link
            key={loc}
            href={href}
            hrefLang={loc}
            lang={loc}
            onClick={() => handleSelect(loc)}
            aria-current={active ? "page" : undefined}
            aria-label={`${LOCALE_FULL_NAMES[loc]} (${LOCALE_SHORT_LABELS[loc]})`}
            className={`inline-flex min-h-[28px] min-w-[30px] items-center justify-center rounded-full px-2 font-mono text-[11px] font-medium tracking-wider transition-colors ${
              active
                ? "bg-[#E5C287] text-[#080D12]"
                : "text-[#CBD5E1] hover:bg-[#172027] hover:text-[#ECF4F6]"
            }`}
          >
            {LOCALE_SHORT_LABELS[loc]}
          </Link>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
