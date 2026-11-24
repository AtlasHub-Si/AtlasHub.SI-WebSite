import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { PortalChromaticFrame } from "@/components/brand/PortalChromaticFrame";
import { PortalSceneRouter } from "@/components/portals/PortalSceneRouter";
import { PORTAL_THEME_TOKENS } from "@/lib/v2/design-tokens";
import { getDictionary } from "@/lib/v2/i18n";
import { isValidLocale, localePath } from "@/lib/v2/navigation";
import { getPortalBySlug, PORTALS } from "@/lib/v2/portal-data";
import { buildPageMetadata } from "@/lib/v2/seo";
import { LOCALES } from "@/lib/v2/types";

type PortalRouteParams = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    PORTALS.map((portal) => ({ locale, slug: portal.slug })),
  );
}

export async function generateMetadata({
  params,
}: PortalRouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const portal = getPortalBySlug(slug);
  if (!portal) return {};
  const dict = getDictionary(locale);
  const copy = dict.portalsSection.items[portal.id];
  return buildPageMetadata({
    locale,
    pathname: `/portals/${portal.slug}`,
    title: `${copy.name} — ${copy.tagline}`,
    description: copy.shortDesc,
    imagePath: portal.posterSrc,
  });
}

export default async function PortalDetailPage({ params }: PortalRouteParams) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  const portal = getPortalBySlug(slug);
  if (!portal) {
    notFound();
  }

  const dict = getDictionary(locale);
  const copy = dict.portalsSection.items[portal.id];
  const theme = PORTAL_THEME_TOKENS[portal.id];
  const currentIdx = PORTALS.findIndex((p) => p.id === portal.id);
  const prevPortal = PORTALS[(currentIdx - 1 + PORTALS.length) % PORTALS.length];
  const nextPortal = PORTALS[(currentIdx + 1) % PORTALS.length];

  return (
    <div className="bg-[#080D12] py-10 text-[#ECF4F6] sm:py-16">
      <div className="atlas-container space-y-10">
        {/* Top Breadcrumb & Portal Index */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1]/12 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${localePath(locale, "/")}#portals`}
              className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/20 bg-[#0E151D] px-4 py-2 text-xs font-semibold text-[#ECF4F6] transition hover:border-[#CDA66C]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.portalsSection.backToEcosystem}</span>
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#94A8B8]">
              {portal.index} / 05
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <MaturityBadge
              status={portal.maturity}
              label={dict.maturityLabels[portal.maturity]}
              size="md"
            />
            {portal.externalUrlVerified && portal.externalUrl ? (
              <a
                href={portal.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C]/50 bg-[#172027] px-3.5 py-1.5 text-xs font-semibold text-[#E5C287] transition hover:border-[#E5C287]"
              >
                <span>{portal.externalUrl.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Portal Header */}
        <header className="max-w-4xl space-y-4">
          <p
            className="font-mono text-xs uppercase tracking-[0.2em]"
            style={{ color: theme.textAccent }}
          >
            {copy.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-5xl">
            {copy.name} — {copy.chapterTitle}
          </h1>
          <p className="text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
            {copy.chapterLead}
          </p>
        </header>

        {/* Interactive Portal Scene */}
        <PortalChromaticFrame portalId={portal.id} active className="p-4 sm:p-6">
          <PortalSceneRouter portalId={portal.id} dict={dict} />
        </PortalChromaticFrame>

        {/* Narrative Steps, Proof & Limitations */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <ol className="space-y-3">
              {copy.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-4 rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D] p-5"
                >
                  <span
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold text-[#080D12]"
                    style={{ backgroundColor: theme.accent }}
                  >
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-[#ECF4F6] sm:text-base">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#ECF4F6]">
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  style={{ color: theme.accent }}
                  aria-hidden="true"
                />
                <h2>{copy.proofLabel}</h2>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                {copy.proofDetail}
              </p>
            </div>

            <div className="rounded-2xl border border-[#CDA66C]/35 bg-[#14191F] p-6">
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C287]"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-[#CBD5E1] sm:text-sm">
                  {copy.limitationNotice}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={localePath(locale, "/contact")}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-5 py-2.5 text-sm font-semibold text-[#080D12] transition hover:brightness-105"
              >
                <span>{copy.secondaryCta}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={`${localePath(locale, "/")}?portal=${portal.slug}#portals`}
                className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/25 bg-[#172027] px-5 py-2.5 text-sm font-semibold text-[#ECF4F6] transition hover:border-[#CDA66C]"
              >
                <span>{dict.portalsSection.openPortal}</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Previous / Next Portal Chapter Switcher */}
        <nav
          aria-label="Portal sequence"
          className="flex flex-wrap items-center justify-between gap-4 border-t border-[#CBD5E1]/12 pt-8"
        >
          <Link
            href={localePath(locale, `/portals/${prevPortal.slug}`)}
            className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D] px-4 py-2 text-sm text-[#CBD5E1] transition hover:border-[#CDA66C] hover:text-[#ECF4F6]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>
              {dict.portalsSection.previousPortal}:{" "}
              {dict.portalsSection.items[prevPortal.id].name}
            </span>
          </Link>
          <Link
            href={localePath(locale, `/portals/${nextPortal.slug}`)}
            className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D] px-4 py-2 text-sm text-[#CBD5E1] transition hover:border-[#CDA66C] hover:text-[#ECF4F6]"
          >
            <span>
              {dict.portalsSection.nextPortal}:{" "}
              {dict.portalsSection.items[nextPortal.id].name}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </div>
  );
}
