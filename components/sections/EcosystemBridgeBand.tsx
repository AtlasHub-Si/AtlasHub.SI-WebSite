import Link from "next/link";
import { ArrowRight, Compass, Cpu, Network, Users } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { localePath } from "@/lib/v2/navigation";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";

export interface EcosystemBridgeBandProps {
  locale: Locale;
  dict: LocaleDictionary;
}

const PILLAR_ICONS = {
  people: Users,
  agents: Cpu,
  knowledge: Network,
} as const;

export function EcosystemBridgeBand({
  locale,
  dict,
}: EcosystemBridgeBandProps) {
  const bridge = dict.ecosystemBridge;

  return (
    <section
      aria-labelledby="ecosystem-bridge-heading"
      className="relative border-t border-[#CBD5E1]/10 bg-[#0A1017] py-20 sm:py-24"
    >
      <div className="atlas-container">
        <ScrollReveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#36BDD0]">
                {bridge.eyebrow}
              </p>
              <h2
                id="ecosystem-bridge-heading"
                className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-4xl lg:text-5xl"
              >
                {bridge.title}{" "}
                <span className="text-[#E5C287]">{bridge.titleAccent}</span>
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
                {bridge.lead}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <Link
                href={localePath(locale, "/ecosystem")}
                className="inline-flex items-center gap-2 rounded-full border border-[#CDA66C]/70 bg-[#0E151D] px-5 py-2.5 text-sm font-semibold text-[#E5C287] transition hover:bg-[#CDA66C] hover:text-[#080D12]"
              >
                <span>{bridge.ctaEcosystem}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={localePath(locale, "/experience")}
                className="inline-flex items-center gap-2 rounded-full border border-[#36BDD0]/45 bg-[#172027] px-5 py-2.5 text-sm font-medium text-[#ECF4F6] transition hover:border-[#36BDD0]"
              >
                <Compass className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
                <span>{bridge.ctaMultiverse}</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {bridge.pillars.map((pillar) => {
              const Icon =
                PILLAR_ICONS[pillar.key as keyof typeof PILLAR_ICONS] ?? Users;
              return (
                <article
                  key={pillar.key}
                  className="atlas-glass rounded-2xl p-6 transition-colors hover:border-[#CDA66C]/45"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#36BDD0]/30 bg-[#080D12] text-[#36BDD0]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-[#ECF4F6]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#94A8B8]">
                    {pillar.subtitle}
                  </p>
                </article>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default EcosystemBridgeBand;
