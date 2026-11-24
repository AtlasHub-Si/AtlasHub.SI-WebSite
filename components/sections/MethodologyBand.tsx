import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { LocaleDictionary } from "@/lib/v2/types";

export interface MethodologyBandProps {
  dict: LocaleDictionary;
}

/**
 * Six-step execution methodology rendered on Warm Pearl daylight canvas.
 */
export function MethodologyBand({ dict }: MethodologyBandProps) {
  const section = dict.methodologySection;

  return (
    <section
      id="methodology"
      aria-labelledby="methodology-heading"
      className="atlas-pearl-band scroll-mt-24 border-t-0 pb-20 pt-6 sm:pb-24"
    >
      <div className="atlas-container">
        <ScrollReveal>
          <div className="max-w-3xl space-y-3">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#7D5720]">
              {section.eyebrow}
            </p>
            <h2
              id="methodology-heading"
              className="font-display text-3xl font-bold tracking-tight text-[#17212B] sm:text-4xl"
            >
              {section.title}
            </h2>
            <p className="text-base leading-relaxed text-[#475569] sm:text-lg">
              {section.lead}
            </p>
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.steps.map((step) => (
              <li
                key={step.num}
                className="atlas-pearl-card flex flex-col justify-between rounded-2xl p-6"
              >
                <div>
                  <span className="inline-flex rounded-full border border-[#7D5720]/30 bg-[#EDEBE5] px-3 py-1 font-mono text-xs font-semibold text-[#7D5720]">
                    {step.num}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#17212B]">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-mono text-xs uppercase tracking-wider text-[#475569]">
                    {step.role}
                  </p>
                </div>
                <p className="mt-4 border-t border-[#17212B]/10 pt-3 text-sm leading-relaxed text-[#17212B]">
                  {step.output}
                </p>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default MethodologyBand;
