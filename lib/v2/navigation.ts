import { getDictionary, isSupportedLocale } from "./i18n";
import type { Locale, NavItem, PortalId } from "./types";

export const PORTAL_SLUGS: readonly PortalId[] = [
  "atlashq",
  "atlasbot",
  "club-atlas",
  "atlascortex",
  "gwd",
] as const;

export const INSTITUTIONAL_PAGE_SLUGS = [
  "ecosystem",
  "experience",
  "solutions",
  "consulting",
  "cortex",
  "projects",
  "news",
  "radar",
  "company",
  "contact",
  "partners",
  "contributors",
  "investors",
  "programs-and-communities",
  "technology",
  "press",
] as const;

export const LEGAL_PAGE_SLUGS = [
  "legal",
  "privacy",
  "cookies",
  "terms",
  "accessibility",
  "security",
  "licenses",
] as const;

export const V2_ROUTE_SLUGS = [
  "ecosystem",
  "experience",
  "portals/atlashq",
  "portals/atlasbot",
  "portals/club-atlas",
  "portals/atlascortex",
  "portals/gwd",
  "solutions",
  "consulting",
  "cortex",
  "projects",
  "news",
  "radar",
  "company",
  "contact",
  "partners",
  "contributors",
  "investors",
  "programs-and-communities",
  "technology",
  "press",
  "legal",
  "privacy",
  "cookies",
  "terms",
  "accessibility",
  "security",
  "licenses",
] as const;

export type V2RouteSlug = (typeof V2_ROUTE_SLUGS)[number];

export interface RouteDefinition {
  slug: "" | V2RouteSlug;
  kind: "home" | "portal" | "experience" | "institutional" | "legal";
  indexable: boolean;
}

export const ROUTE_DEFINITIONS: readonly RouteDefinition[] = [
  { slug: "", kind: "home", indexable: true },
  ...V2_ROUTE_SLUGS.map((slug): RouteDefinition => {
    if (slug.startsWith("portals/")) {
      return { slug, kind: "portal", indexable: true };
    }
    if (slug === "experience") {
      return { slug, kind: "experience", indexable: false };
    }
    if ((LEGAL_PAGE_SLUGS as readonly string[]).includes(slug)) {
      return { slug, kind: "legal", indexable: true };
    }
    return { slug, kind: "institutional", indexable: true };
  }),
] as const;

export function isValidLocale(value: string | undefined | null): value is Locale {
  return isSupportedLocale(value);
}

/**
 * Resolves a route relative to a locale, preserving external URLs and anchors.
 */
export function localePath(locale: Locale, path = "/"): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") {
    return `/${locale}`;
  }
  if (trimmed.startsWith("#")) {
    return `/${locale}${trimmed}`;
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (
    normalized === `/${locale}` ||
    normalized.startsWith(`/${locale}/`) ||
    normalized.startsWith(`/${locale}#`)
  ) {
    return normalized;
  }
  return `/${locale}${normalized}`;
}

/**
 * Strips any leading locale segment (/pt, /en, /fr, /es) so locale switching keeps the active route.
 */
export function stripLocaleFromPath(pathname: string): string {
  const cleaned = pathname.trim();
  if (!cleaned || cleaned === "/") {
    return "/";
  }
  const match = cleaned.match(/^\/(pt|en|fr|es)(\/.*)?$/);
  if (!match) {
    return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  }
  return match[2] && match[2].length > 0 ? match[2] : "/";
}

/**
 * Primary navigation schema consumed by SiteHeader and mobile navigation drawer.
 */
export function getHeaderNav(locale: Locale): NavItem[] {
  const dict = getDictionary(locale);
  const portals = dict.portalsSection.items;

  return [
    {
      id: "ecosystem",
      label: dict.nav.ecosystem,
      href: "/ecosystem",
      children: [
        {
          label: portals.atlashq.name,
          href: "/portals/atlashq",
          badge: dict.maturityLabels.DEMO,
        },
        {
          label: portals.atlasbot.name,
          href: "/portals/atlasbot",
          badge: dict.maturityLabels.DEMO,
        },
        {
          label: portals["club-atlas"].name,
          href: "/portals/club-atlas",
          badge: dict.maturityLabels.IMPLEMENTED,
        },
        {
          label: portals.atlascortex.name,
          href: "/portals/atlascortex",
          badge: dict.maturityLabels.PILOT,
        },
        {
          label: portals.gwd.name,
          href: "/portals/gwd",
          badge: dict.maturityLabels.PILOT,
        },
        {
          label: dict.multiverse.title,
          href: "/experience",
        },
      ],
    },
    {
      id: "solutions",
      label: dict.nav.solutions,
      href: "/solutions",
      children: [
        { label: dict.pages.solutions.title, href: "/solutions" },
        { label: dict.pages.cortex.eyebrow, href: "/cortex" },
        { label: dict.pages.projects.eyebrow, href: "/projects" },
        { label: dict.pages.technology.eyebrow, href: "/technology" },
      ],
    },
    {
      id: "consulting",
      label: dict.nav.consulting,
      href: "/consulting",
    },
    {
      id: "community",
      label: dict.nav.community,
      href: "/portals/club-atlas",
      children: [
        { label: portals["club-atlas"].name, href: "/portals/club-atlas" },
        { label: dict.pages["programs-and-communities"].eyebrow, href: "/programs-and-communities" },
        { label: dict.pages.contributors.eyebrow, href: "/contributors" },
      ],
    },
    {
      id: "news",
      label: dict.nav.news,
      href: "/news",
      children: [
        { label: "AtlasNews", href: "/news" },
        { label: "AtlasRadar", href: "/radar" },
        { label: dict.pages.press.eyebrow, href: "/press" },
      ],
    },
    {
      id: "company",
      label: dict.nav.company,
      href: "/company",
      children: [
        { label: dict.pages.company.eyebrow, href: "/company" },
        { label: dict.pages.partners.eyebrow, href: "/partners" },
        { label: dict.pages.investors.eyebrow, href: "/investors" },
        { label: dict.pages.contact.eyebrow, href: "/contact" },
        { label: dict.legalPages.legal.title, href: "/legal" },
      ],
    },
  ];
}

export function getFooterNav(locale: Locale) {
  const dict = getDictionary(locale);
  return {
    columns: dict.footer.columns,
    links: dict.footer.links,
  };
}
