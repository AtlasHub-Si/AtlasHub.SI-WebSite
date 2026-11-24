import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { LocaleDictionary } from "@/lib/v2/types";

export interface ArchitectureLayersBandProps {
  dict: LocaleDictionary;
}

export function ArchitectureLayersBand({ dict }: ArchitectureLayersBandProps) {
  const section = dict.architectureSection;

  return (
    <section
      aria-labelledby="architecture-layers-heading"
      className="border-t border-[#CBD5E1]/10 bg-[#080D12] py-20 sm:py-24"
    >
      <div className="atlas-container">
        <ScrollReveal>
          <div className="max-w-3xl space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
              {section.eyebrow}
            </p>
            <h2
              id="architecture-layers-heading"
              className="font-display text-3xl font-bold tracking-tight text-[#ECF4F6] sm:text-4xl"
            >
              {section.title}
            </h2>
            <p className="text-base leading-relaxed text-[#94A8B8] sm:text-lg">
              {section.lead}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {section.layers.map((layer) => (
              <article
                key={layer.index}
                className="flex flex-col justify-between rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D] p-6 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs tracking-[0.16em] text-[#E5C287]">
                      {layer.index}
                    </span>
                    <MaturityBadge
                      status={layer.tag}
                      label={dict.maturityLabels[layer.tag]}
                    />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-[#ECF4F6]">
                    {layer.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {layer.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ArchitectureLayersBand;
