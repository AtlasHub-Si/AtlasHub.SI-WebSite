import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstitutionalPageView } from "@/components/sections/InstitutionalPageView";
import { LegalPageView } from "@/components/sections/LegalPageView";
import { getDictionary } from "@/lib/v2/i18n";
import { isValidLocale } from "@/lib/v2/navigation";
import { buildPageMetadata } from "@/lib/v2/seo";
import { LOCALES } from "@/lib/v2/types";

export type LocaleRouteParams = { params: Promise<{ locale: string }> };

export function buildLocaleStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function getValidatedLocale(paramsPromise: Promise<{ locale: string }>) {
  const { locale } = await paramsPromise;
  if (!isValidLocale(locale)) {
    notFound();
  }
  return locale;
}

export async function buildInstitutionalMetadata(
  slug: string,
  paramsPromise: Promise<{ locale: string }>,
  options?: { noIndex?: boolean },
): Promise<Metadata> {
  const { locale } = await paramsPromise;
  if (!isValidLocale(locale)) {
    return {};
  }
  const dict = getDictionary(locale);
  const page = dict.pages[slug];
  if (!page) {
    return buildPageMetadata({ locale, pathname: `/${slug}` });
  }
  return buildPageMetadata({
    locale,
    pathname: `/${slug}`,
    title: page.title,
    description: page.lead,
    noIndex: options?.noIndex ?? false,
  });
}

export async function renderInstitutionalRoute(
  slug: string,
  paramsPromise: Promise<{ locale: string }>,
) {
  const locale = await getValidatedLocale(paramsPromise);
  const dict = getDictionary(locale);
  const page = dict.pages[slug];
  if (!page) {
    notFound();
  }
  return <InstitutionalPageView locale={locale} dict={dict} page={page} />;
}

export async function buildLegalMetadata(
  slug: string,
  paramsPromise: Promise<{ locale: string }>,
): Promise<Metadata> {
  const { locale } = await paramsPromise;
  if (!isValidLocale(locale)) {
    return {};
  }
  const dict = getDictionary(locale);
  const page = dict.legalPages[slug];
  if (!page) {
    return buildPageMetadata({ locale, pathname: `/${slug}` });
  }
  return buildPageMetadata({
    locale,
    pathname: `/${slug}`,
    title: page.title,
    description: page.lead,
  });
}

export async function renderLegalRoute(
  slug: string,
  paramsPromise: Promise<{ locale: string }>,
) {
  const locale = await getValidatedLocale(paramsPromise);
  const dict = getDictionary(locale);
  const page = dict.legalPages[slug];
  if (!page) {
    notFound();
  }
  return <LegalPageView locale={locale} dict={dict} page={page} />;
}
