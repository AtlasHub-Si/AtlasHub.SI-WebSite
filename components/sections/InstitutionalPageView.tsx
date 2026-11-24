import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { PortalChromaticFrame } from "@/components/brand/PortalChromaticFrame";
import { localePath } from "@/lib/v2/navigation";
import { PORTALS } from "@/lib/v2/portal-data";
import { OFFICIAL_GITHUB_URL, OFFICIAL_WHATSAPP_URL } from "@/lib/v2/social-registry";
import {
  getCommunitiesAndPrograms,
  getTechnologiesUsed,
  getVerifiedPartnerships,
} from "@/lib/v2/technology-registry";
import type {
  InstitutionalPageCopy,
  Locale,
  LocaleDictionary,
  MaturityStatus,
} from "@/lib/v2/types";

export interface InstitutionalPageViewProps {
  locale: Locale;
  dict: LocaleDictionary;
  page: InstitutionalPageCopy;
}

const VALID_MATURITY: readonly MaturityStatus[] = [
  "VERIFIED",
  "IMPLEMENTED",
  "DEMO",
  "PILOT",
  "PROPOSED",
  "HISTORICAL",
];

function asMaturityStatus(tag?: string): MaturityStatus | null {
  if (!tag) return null;
  return (VALID_MATURITY as readonly string[]).includes(tag)
    ? (tag as MaturityStatus)
    : null;
}

function ActionLink({
  locale,
  href,
  label,
  primary = false,
}: {
  locale: Locale;
  href: string;
  label: string;
  primary?: boolean;
}) {
  const isExternal = /^https?:\/\//i.test(href);
  const resolved = isExternal ? href : localePath(locale, href);
  const className = primary
    ? "inline-flex items-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-5 py-2.5 text-sm font-semibold text-[#080D12] transition hover:brightness-105"
    : "inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/25 bg-[#172027] px-5 py-2.5 text-sm font-semibold text-[#ECF4F6] transition hover:border-[#CDA66C]";

  if (isExternal) {
    return (
      <a
        href={resolved}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span>{label}</span>
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={resolved} className={className}>
      <span>{label}</span>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function InstitutionalPageView({
  locale,
  dict,
  page,
}: InstitutionalPageViewProps) {
  const isTechnologyPage = page.slug === "technology";
  const isProgramsPage = page.slug === "programs-and-communities";
  const isEcosystemPage = page.slug === "ecosystem";
  const isProjectsPage = page.slug === "projects";
  const isInvestorsPage = page.slug === "investors";
  const isConsultingPage = page.slug === "consulting";

  const technologies = getTechnologiesUsed();
  const communities = getCommunitiesAndPrograms();
  const partnerships = getVerifiedPartnerships();
  const scenarioQuestion = dict.claraDrawer.diagnosticQuestions.find(
    (q) => q.id === "scenario",
  );

  return (
    <div className="bg-[#080D12] text-[#ECF4F6]">
      {/* Page Hero */}
      <section className="relative overflow-hidden border-b border-[#CBD5E1]/10 bg-[radial-gradient(85%_65%_at_75%_0%,rgba(54,189,208,0.12),transparent_62%)] py-16 sm:py-24">
        <div className="atlas-container space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={localePath(locale, "/")}
              className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D] px-3.5 py-1.5 font-mono text-xs text-[#CBD5E1] transition hover:border-[#CDA66C] hover:text-[#ECF4F6]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>AtlasHub.SI</span>
            </Link>
            {page.maturity ? (
              <MaturityBadge
                status={page.maturity}
                label={dict.maturityLabels[page.maturity]}
                size="md"
              />
            ) : null}
          </div>

          <div className="max-w-4xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
              {page.eyebrow}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-5xl">
              {page.title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-[#CBD5E1] sm:text-xl">
              {page.lead}
            </p>
          </div>

          {page.ctaPrimary || page.ctaSecondary ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {page.ctaPrimary ? (
                <ActionLink
                  locale={locale}
                  href={page.ctaPrimary.href}
                  label={page.ctaPrimary.label}
                  primary
                />
              ) : null}
              {page.ctaSecondary ? (
                <ActionLink
                  locale={locale}
                  href={page.ctaSecondary.href}
                  label={page.ctaSecondary.label}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* Core Editorial Highlights */}
      <section className="py-16 sm:py-20">
        <div className="atlas-container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {page.highlights.map((item) => {
              const badgeStatus = asMaturityStatus(item.tag);
              return (
                <article
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-xl font-semibold text-[#ECF4F6]">
                        {item.title}
                      </h2>
                      {badgeStatus ? (
                        <MaturityBadge
                          status={badgeStatus}
                          label={dict.maturityLabels[badgeStatus]}
                        />
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-[#CBD5E1]">
                      {item.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Portal Directory */}
      {isEcosystemPage ? (
        <section className="border-t border-[#CBD5E1]/10 bg-[#0A1017] py-16 sm:py-20">
          <div className="atlas-container space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#36BDD0]">
                {dict.portalsSection.eyebrow}
              </p>
              <h2 className="font-display text-2xl font-bold text-[#ECF4F6] sm:text-3xl">
                {dict.portalsSection.title}
              </h2>
              <p className="text-sm leading-relaxed text-[#94A8B8] sm:text-base">
                {dict.portalsSection.lead}
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PORTALS.map((portal) => {
                const copy = dict.portalsSection.items[portal.id];
                return (
                  <PortalChromaticFrame
                    key={portal.id}
                    portalId={portal.id}
                    interactive
                    className="flex flex-col justify-between p-5"
                  >
                    <div>
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-[#CBD5E1]/12 bg-[#080D12]">
                        <Image
                          src={portal.posterSrc}
                          alt={`${copy.name} — ${copy.tagline}`}
                          fill
                          unoptimized
                          loading="eager"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#94A8B8]">
                          {portal.index}
                        </span>
                        <MaturityBadge
                          status={portal.maturity}
                          label={dict.maturityLabels[portal.maturity]}
                        />
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold text-[#ECF4F6]">
                        {copy.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#CBD5E1]">
                        {copy.shortDesc}
                      </p>
                    </div>
                    <Link
                      href={localePath(locale, `/portals/${portal.slug}`)}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#E5C287] hover:underline"
                    >
                      <span>{dict.portalsSection.openPortal}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </PortalChromaticFrame>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Consulting Warm Pearl Band */}
      {isConsultingPage ? (
        <section className="atlas-pearl-band py-16 sm:py-20">
          <div className="atlas-container space-y-8">
            <div className="max-w-3xl space-y-2">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#7D5720]">
                {dict.methodologySection.eyebrow}
              </p>
              <h2 className="font-display text-2xl font-bold text-[#17212B] sm:text-3xl">
                {dict.methodologySection.title}
              </h2>
              <p className="text-sm leading-relaxed text-[#475569] sm:text-base">
                {dict.consultingSection.independenceNote}
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dict.methodologySection.steps.map((step) => (
                <li
                  key={step.num}
                  className="atlas-pearl-card rounded-2xl p-5"
                >
                  <span className="font-mono text-xs font-semibold text-[#7D5720]">
                    {step.num}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold text-[#17212B]">
                    {step.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#475569]">
                    {step.role}
                  </p>
                  <p className="mt-3 text-sm text-[#17212B]">{step.output}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Projects / Sector Scenarios */}
      {isProjectsPage && scenarioQuestion ? (
        <section className="border-t border-[#CBD5E1]/10 bg-[#0A1017] py-16 sm:py-20">
          <div className="atlas-container space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#36BDD0]">
                {dict.claraDrawer.diagnosticTitle}
              </p>
              <h2 className="font-display text-2xl font-bold text-[#ECF4F6] sm:text-3xl">
                {scenarioQuestion.prompt}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {scenarioQuestion.options.map((opt) => (
                <Link
                  key={opt.value}
                  href={`${localePath(locale, "/contact")}?scenario=${opt.value}`}
                  className="flex flex-col justify-between rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-5 transition hover:border-[#CDA66C]/60"
                >
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#E5C287]">
                      {opt.value}
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-[#ECF4F6]">
                      {opt.label}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-[#36BDD0]">
                    <span>{dict.claraDrawer.submitLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Technology Stack Registry */}
      {isTechnologyPage ? (
        <section className="border-t border-[#CBD5E1]/10 bg-[#0A1017] py-16 sm:py-20">
          <div className="atlas-container space-y-12">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-[#ECF4F6]">
                {dict.footer.techUsedLabel}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {technologies.map((entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D] p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#CBD5E1]/20 bg-[#172027] font-mono text-xs font-semibold text-[#E5C287]">
                          {entry.monogram}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A8B8]">
                          {entry.relationshipType}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold text-[#ECF4F6]">
                        {entry.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">
                        {entry.evidenceNote[locale]}
                      </p>
                    </div>
                    <a
                      href={entry.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-[#36BDD0] hover:underline"
                    >
                      <span>{entry.externalUrl.replace(/^https?:\/\//, "")}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-[#CDA66C]/35 bg-[#0E151D] p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#CDA66C]"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <h2 className="font-mono text-xs uppercase tracking-wider text-[#E5C287]">
                    {dict.footer.partnershipsLabel}
                  </h2>
                  <p className="text-sm text-[#CBD5E1]">
                    {partnerships.length === 0
                      ? dict.footer.partnershipsEmptyNote
                      : `${partnerships.length}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Programs & Communities Registry */}
      {isProgramsPage || isTechnologyPage ? (
        <section className="border-t border-[#CBD5E1]/10 bg-[#080D12] py-16">
          <div className="atlas-container space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#ECF4F6]">
              {dict.footer.communitiesProgramsLabel}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {communities.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-6"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-[#ECF4F6]">
                      {item.name}
                    </h3>
                    <MaturityBadge
                      status={item.status === "verified" ? "VERIFIED" : "PROPOSED"}
                      label={
                        item.status === "verified"
                          ? dict.maturityLabels.VERIFIED
                          : dict.maturityLabels.PROPOSED
                      }
                    />
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {item.evidenceNote[locale]}
                  </p>
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#36BDD0] hover:underline"
                  >
                    <span>{item.externalUrl}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FCA / Institutional Compliance Banner on Investors */}
      {isInvestorsPage ? (
        <section className="border-t border-[#CBD5E1]/10 bg-[#0A1017] py-12">
          <div className="atlas-container">
            <div className="flex items-start gap-4 rounded-2xl border border-[#CDA66C]/45 bg-[#0E151D] p-6">
              <ShieldCheck
                className="mt-0.5 h-6 w-6 shrink-0 text-[#E5C287]"
                aria-hidden="true"
              />
              <div className="space-y-2 text-sm leading-relaxed text-[#CBD5E1]">
                <p className="font-semibold text-[#ECF4F6]">
                  {dict.footer.corporateTitle}
                </p>
                <p>{dict.footer.corporateEntitiesNote}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={OFFICIAL_GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#36BDD0] hover:underline"
                  >
                    <span>GitHub AtlasHub-Si</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <a
                    href={OFFICIAL_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5C287] hover:underline"
                  >
                    <span>WhatsApp Oficial</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default InstitutionalPageView;
