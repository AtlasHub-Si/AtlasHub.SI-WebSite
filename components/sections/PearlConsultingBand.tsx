"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { localePath } from "@/lib/v2/navigation";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";

export interface PearlConsultingBandProps {
  locale: Locale;
  dict: LocaleDictionary;
}

/**
 * Warm Pearl (#EDEBE5) editorial daylight band inspired by `02_portais_B_light.png`.
 */
export function PearlConsultingBand({
  locale,
  dict,
}: PearlConsultingBandProps) {
  const section = dict.consultingSection;

  const handleOpenClara = () => {
    window.dispatchEvent(new CustomEvent("atlas:open-clara"));
  };

  return (
    <section
      aria-labelledby="pearl-consulting-heading"
      className="atlas-pearl-band scroll-mt-24 py-20 sm:py-24"
    >
      <div className="atlas-container">
        <ScrollReveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-7">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#7D5720]">
                {section.eyebrow}
              </p>
              <h2
                id="pearl-consulting-heading"
                className="font-display text-3xl font-bold tracking-tight text-[#17212B] sm:text-4xl lg:text-5xl"
              >
                {section.title}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-[#475569] sm:text-lg">
                {section.lead}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <button
                type="button"
                onClick={handleOpenClara}
                className="inline-flex items-center gap-2 rounded-full bg-[#17212B] px-5 py-3 text-sm font-semibold text-[#F6F5F1] transition hover:bg-[#080D12]"
              >
                <MessageSquare className="h-4 w-4 text-[#E5C287]" aria-hidden="true" />
                <span>{section.ctaDiagnostic}</span>
              </button>
              <Link
                href={localePath(locale, "/consulting")}
                className="inline-flex items-center gap-2 rounded-full border border-[#17212B]/25 bg-[#F6F5F1] px-5 py-3 text-sm font-semibold text-[#17212B] transition hover:border-[#7D5720]"
              >
                <span>{section.ctaConsulting}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {section.deliverables.map((item) => (
              <article
                key={item.title}
                className="atlas-pearl-card rounded-2xl p-6 sm:p-7"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#7D5720]"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#17212B]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                      {item.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 rounded-2xl border border-[#17212B]/15 bg-[#F6F5F1]/80 px-5 py-4 text-sm leading-relaxed text-[#17212B]">
            {section.independenceNote}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default PearlConsultingBand;
