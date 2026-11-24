"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ClaraConcierge } from "@/components/clara/ClaraConcierge";
import { ClaraTrigger } from "@/components/clara/ClaraTrigger";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { stripLocaleFromPath } from "@/lib/v2/navigation";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";

export interface LocaleChromeProps {
  locale: Locale;
  dict: LocaleDictionary;
  children: ReactNode;
}

/**
 * Renders global SiteHeader/SiteFooter for standard institutional routes while
 * allowing `/experience` (Multiverse) to control its own full-viewport chrome,
 * keeping Clara accessible sitewide without auto-opening.
 */
export function LocaleChrome({ locale, dict, children }: LocaleChromeProps) {
  const pathname = usePathname() || `/${locale}`;
  const isExperience = stripLocaleFromPath(pathname) === "/experience";

  return (
    <>
      {!isExperience ? <SiteHeader locale={locale} dict={dict} /> : null}
      {isExperience ? (
        children
      ) : (
        <main id="main-content" className="min-h-[60vh]">
          {children}
        </main>
      )}
      {!isExperience ? <SiteFooter locale={locale} dict={dict} /> : null}
      <ClaraTrigger dict={dict} className={isExperience ? "bottom-20 sm:bottom-24" : ""} />
      <ClaraConcierge dict={dict} />
    </>
  );
}

export default LocaleChrome;
