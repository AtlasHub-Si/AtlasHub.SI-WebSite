import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/v2/i18n";
import { isValidLocale } from "@/lib/v2/navigation";
import {
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildWebsiteJsonLd,
} from "@/lib/v2/seo";
import { LOCALES } from "@/lib/v2/types";
import { LocaleChrome } from "./_lib/LocaleChrome";
import { LocaleHtmlSync } from "./_lib/LocaleHtmlSync";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  return buildPageMetadata({ locale, pathname: "/" });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const orgJsonLd = buildOrganizationJsonLd(locale);
  const websiteJsonLd = buildWebsiteJsonLd(locale);
  const langUpdateScript = `document.documentElement.lang=${JSON.stringify(dict.htmlLang)};`;

  return (
    <>
      <script
        // Static locale enum serialization only; keeps <html lang> aligned before hydration.
        dangerouslySetInnerHTML={{ __html: langUpdateScript }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <LocaleHtmlSync htmlLang={dict.htmlLang} />
      <LocaleChrome locale={locale} dict={dict}>
        {children}
      </LocaleChrome>
    </>
  );
}
