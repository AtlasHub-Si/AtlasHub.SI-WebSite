"use client";

import Image from "next/image";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { OFFICIAL_WHATSAPP_URL } from "@/lib/v2/social-registry";
import type { LocaleDictionary } from "@/lib/v2/types";

export interface ClaraInvitationBandProps {
  dict: LocaleDictionary;
}

export function ClaraInvitationBand({ dict }: ClaraInvitationBandProps) {
  const band = dict.claraBand;

  const handleOpenClara = () => {
    window.dispatchEvent(new CustomEvent("atlas:open-clara"));
  };

  return (
    <section
      aria-labelledby="clara-invitation-heading"
      className="border-t border-[#CBD5E1]/10 bg-gradient-to-b from-[#0A1017] to-[#080D12] py-20 sm:py-24"
    >
      <div className="atlas-container">
        <ScrollReveal>
          <div className="atlas-glass-gold overflow-hidden rounded-3xl p-7 sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E5C287]">
                  {band.eyebrow}
                </p>
                <h2
                  id="clara-invitation-heading"
                  className="font-display text-2xl font-bold tracking-tight text-[#ECF4F6] sm:text-3xl lg:text-4xl"
                >
                  {band.title}
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-[#CBD5E1]">
                  {band.body}
                </p>
                <p className="text-xs leading-relaxed text-[#94A8B8]">
                  {dict.claraDrawer.aiDisclosure}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenClara}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-6 py-3 text-sm font-semibold text-[#080D12] transition hover:brightness-105"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    <span>{band.cta}</span>
                  </button>
                  <a
                    href={OFFICIAL_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/25 bg-[#0E151D] px-5 py-3 text-sm font-semibold text-[#ECF4F6] transition hover:border-[#36BDD0]"
                  >
                    <span>{band.whatsappCta}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="flex justify-center lg:col-span-4 lg:justify-end">
                <div className="relative h-56 w-56 overflow-hidden rounded-2xl border border-[#CDA66C]/45 bg-[#080D12] sm:h-64 sm:w-64">
                  <Image
                    src="/v2/clara-portrait.webp"
                    alt={`${dict.claraDrawer.title} — ${dict.claraDrawer.role}`}
                    fill
                    unoptimized
                    loading="eager"
                    decoding="sync"
                    sizes="(max-width: 1024px) 256px, 280px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ClaraInvitationBand;
