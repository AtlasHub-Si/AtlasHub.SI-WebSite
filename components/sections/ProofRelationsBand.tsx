import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { localePath } from "@/lib/v2/navigation";
import type { Locale, LocaleDictionary, MaturityStatus } from "@/lib/v2/types";

export interface ProofRelationsBandProps {
  locale: Locale;
  dict: LocaleDictionary;
}

const MATURITY_ORDER: readonly MaturityStatus[] = [
  "VERIFIED",
  "IMPLEMENTED",
  "DEMO",
  "PILOT",
  "PROPOSED",
  "HISTORICAL",
] as const;

export function ProofRelationsBand({
  locale,
  dict,
}: ProofRelationsBandProps) {
  const section = dict.proofSection;

  return (
    <section
      aria-labelledby="proof-relations-heading"
      className="border-t border-[#CBD5E1]/10 bg-[#080D12] py-20 sm:py-24"
    >
      <div className="atlas-container space-y-16">
        <ScrollReveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
                {section.eyebrow}
              </p>
              <h2
                id="proof-relations-heading"
                className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-4xl"
              >
                {section.title}
              </h2>
              <p className="text-base leading-relaxed text-[#94A8B8] sm:text-lg">
                {section.lead}
              </p>
            </div>

            {/* Maturity Legend */}
            <div
              aria-label="Maturity classification legend"
              className="flex flex-wrap gap-2 rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D] p-3"
            >
              {MATURITY_ORDER.map((status) => (
                <MaturityBadge
                  key={status}
                  status={status}
                  label={dict.maturityLabels[status]}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {section.items.map((item) => (
              <article
                key={item.title}
                className="flex flex-col justify-between rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#94A8B8]">
                      {item.kind}
                    </span>
                    <MaturityBadge
                      status={item.status}
                      label={dict.maturityLabels[item.status]}
                    />
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[#ECF4F6]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                    {item.body}
                  </p>
                </div>
                <Link
                  href={localePath(locale, item.href)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#36BDD0] transition hover:text-[#E5C287]"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </ScrollReveal>

        {/* Institutional Relations */}
        <ScrollReveal>
          <div className="space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-[#E5C287]">
              {section.relationsTitle}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.relationsLinks.map((rel) => (
                <Link
                  key={rel.href}
                  href={localePath(locale, rel.href)}
                  className="group rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D]/85 p-5 transition hover:border-[#CDA66C]/55 hover:bg-[#172027]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-semibold text-[#ECF4F6] group-hover:text-[#E5C287]">
                      {rel.title}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[#94A8B8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#E5C287]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#94A8B8]">
                    {rel.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ProofRelationsBand;
