import type { Metadata } from "next";
import { getDictionary } from "./i18n";
import { stripLocaleFromPath } from "./navigation";
import { OFFICIAL_GITHUB_URL } from "./social-registry";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./types";

export const SITE_URL =
  process.env.PUBLIC_ORIGIN?.replace(/\/$/, "") || "https://atlashub.si";

export interface BuildPageMetadataInput {
  locale: Locale;
  pathname?: string;
  title?: string;
  description?: string;
  noIndex?: boolean;
  imagePath?: string;
}

function normalizeRouteSuffix(pathname?: string): string {
  if (!pathname) return "";
  const stripped = stripLocaleFromPath(pathname).trim();
  if (!stripped || stripped === "/") return "";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

function absoluteLocaleUrl(locale: Locale, suffix: string): string {
  return `${SITE_URL}/${locale}${suffix}`;
}

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  noIndex = false,
  imagePath = "/v2/scenes/portal-atlashq.webp",
}: BuildPageMetadataInput): Metadata {
  const dict = getDictionary(locale);
  const suffix = normalizeRouteSuffix(pathname);
  const canonicalUrl = absoluteLocaleUrl(locale, suffix);

  const resolvedTitle = title
    ? title.includes("AtlasHub")
      ? title
      : `${title} · AtlasHub.SI`
    : dict.siteTitle;
  const resolvedDescription = description || dict.siteDescription;
  const resolvedImageUrl = imagePath.startsWith("http")
    ? imagePath
    : `${SITE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;

  const languageAlternates: Record<string, string> = {};
  for (const loc of LOCALES) {
    languageAlternates[loc] = absoluteLocaleUrl(loc, suffix);
  }
  languageAlternates["x-default"] = absoluteLocaleUrl(DEFAULT_LOCALE, suffix);

  return {
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      locale: dict.ogLocale,
      alternateLocale: LOCALES.filter((loc) => loc !== locale).map(
        (loc) => getDictionary(loc).ogLocale,
      ),
      url: canonicalUrl,
      siteName: "AtlasHub.SI",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [
        {
          url: resolvedImageUrl,
          width: 1200,
          height: 675,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export function buildOrganizationJsonLd(locale: Locale) {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AtlasHub.SI",
    legalName: "ATLASHUB DIGITAL LTD",
    url: SITE_URL,
    description: dict.siteDescription,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "UK Companies House",
      value: "17379237",
    },
    sameAs: [OFFICIAL_GITHUB_URL],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteLocaleUrl(locale, "/contact"),
      availableLanguage: ["Portuguese", "English", "French", "Spanish"],
    },
  };
}

export function buildWebsiteJsonLd(locale: Locale) {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AtlasHub.SI",
    url: absoluteLocaleUrl(locale, ""),
    inLanguage: dict.htmlLang,
    description: dict.siteDescription,
    publisher: {
      "@type": "Organization",
      name: "AtlasHub.SI",
      legalName: "ATLASHUB DIGITAL LTD",
    },
  };
}
