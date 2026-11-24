import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { localePath } from "@/lib/v2/navigation";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";

export interface CommunityResearchBandProps {
  locale: Locale;
  dict: LocaleDictionary;
}

export function CommunityResearchBand({
  locale,
  dict,
}: CommunityResearchBandProps) {
  const section = dict.communitySection;

  return (
    <section
      aria-labelledby="community-research-heading"
      className="border-t border-[#CBD5E1]/10 bg-[#0B1118] py-20 sm:py-24"
    >
      <div className="atlas-container">
        <ScrollReveal>
          <div className="max-w-3xl space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#36BDD0]">
              {section.eyebrow}
            </p>
            <h2
              id="community-research-heading"
              className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-4xl"
            >
              {section.title}
            </h2>
            <p className="text-base leading-relaxed text-[#94A8B8] sm:text-lg">
              {section.lead}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {section.cards.map((card) => (
              <article
                key={card.title}
                className="atlas-glass flex flex-col justify-between rounded-2xl p-6 sm:p-7"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E5C287]">
                      {card.eyebrow}
                    </span>
                    <MaturityBadge
                      status={card.status}
                      label={dict.maturityLabels[card.status]}
                    />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-[#ECF4F6]">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {card.body}
                  </p>
                </div>

                <Link
                  href={localePath(locale, card.href)}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#E5C287] transition hover:text-[#ECF4F6]"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default CommunityResearchBand;
