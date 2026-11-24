"use client";

import Image from "next/image";
import { ArrowRight, Pause, Play, Sparkles } from "lucide-react";
import type { LocaleDictionary } from "../../lib/v2/types";
import { useAtlasMotion } from "../motion/MotionContext";
import { LivingParticleField } from "../motion/LivingParticleField";
import { PrismaticSculpture } from "./PrismaticSculpture";

export interface LivingAtlasHeroProps {
  dict: LocaleDictionary;
}

/**
 * Primary Living Atlas hero stage matching `01_portais_A_dark.png`.
 * Renders editorial typography, CTAs, planetary horizon, and the faceted
 * prismatic "A" centerpiece immediately in SSR HTML without JS/Canvas blocking.
 */
export function LivingAtlasHero({ dict }: LivingAtlasHeroProps) {
  const { reducedMotion, toggleReducedMotion } = useAtlasMotion();

  const handleOpenClara = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("atlas:open-clara", {
        detail: { path: "diagnostic" },
      }),
    );
  };

  return (
    <section
      aria-labelledby="living-atlas-hero-title"
      className="relative isolate overflow-hidden bg-[#080D12] pt-6 pb-6 sm:pt-8 sm:pb-7 lg:pt-9 lg:pb-7"
    >
      {/* Layer 1: Deep cosmic backdrop + planetary Earth arc (SSR-first, zero CLS) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
      >
        <Image
          src="/v2/scenes/hero-cosmos.webp"
          alt=""
          width={1440}
          height={810}
          sizes="100vw"
          unoptimized
          loading="lazy"
          className="h-full w-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_24%_32%,rgba(8,13,18,0.86)_0%,rgba(8,13,18,0.62)_52%,rgba(8,13,18,0.92)_100%)]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-14%] bottom-[-10%] -z-10 w-[112%] max-w-[1040px] sm:right-[-6%] sm:bottom-[-12%] lg:right-[-3%] lg:bottom-[-16%] lg:w-[68%]"
      >
        <Image
          src="/v2/scenes/hero-earth.webp"
          alt=""
          width={1672}
          height={941}
          sizes="(max-width: 1024px) 110vw, 68vw"
          unoptimized
          preload
          fetchPriority="high"
          className="h-auto w-full object-contain opacity-90 drop-shadow-[0_-12px_48px_rgba(54,189,208,0.2)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#080D12] via-[#080D12]/70 to-transparent" />
      </div>

      {/* Layer 2: Reactive Canvas 2D mineral wave field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-95"
      >
        <LivingParticleField density="hero" interactive />
      </div>

      {/* Bottom fade bridging seamlessly into the 5 portal windows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#080D12] to-transparent"
      />

      {/* Layer 3: Editorial Content + Prismatic "A" Centerpiece */}
      <div className="atlas-container relative z-10">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
          {/* Left editorial column */}
          <div className="max-w-2xl">
            <div className="mb-3.5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#CDA66C]/35 bg-[#0E151D]/82 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#E5C287] backdrop-blur-md">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[#36BDD0]"
                />
                {dict.hero.eyebrow}
              </span>

              <button
                type="button"
                onClick={toggleReducedMotion}
                aria-pressed={reducedMotion}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D]/78 px-3 py-1 font-mono text-[11px] text-[#CBD5E1] backdrop-blur-md transition-colors hover:border-[#CDA66C]/50 hover:text-[#ECF4F6]"
              >
                {reducedMotion ? (
                  <Play className="h-3 w-3 text-[#E5C287]" aria-hidden="true" />
                ) : (
                  <Pause className="h-3 w-3 text-[#36BDD0]" aria-hidden="true" />
                )}
                <span>
                  {reducedMotion
                    ? dict.nav.reduceMotionOff
                    : dict.nav.reduceMotionOn}
                </span>
              </button>
            </div>

            <h1
              id="living-atlas-hero-title"
              className="font-display text-[clamp(2.1rem,4.15vw,3.85rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[#ECF4F6]"
            >
              <span>{dict.hero.headlineStart}</span>
              <span className="block text-[#E5C287] sm:inline">
                {dict.hero.headlineAccent}
              </span>
            </h1>

            <div className="mt-4 flex items-start gap-4">
              <span
                aria-hidden="true"
                className="mt-3 hidden h-px w-10 shrink-0 bg-gradient-to-r from-[#E5C287] to-transparent sm:block"
              />
              <p className="max-w-xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
                {dict.hero.subheadline}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3.5">
              <a
                href="#portals"
                className="atlas-glass-gold inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full px-6 py-2.5 text-sm font-semibold text-[#ECF4F6] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#E5C287]"
              >
                <span>{dict.hero.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4 text-[#E5C287]" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={handleOpenClara}
                className="atlas-glass inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2.5 rounded-full px-6 py-2.5 text-sm font-semibold text-[#ECF4F6] transition-colors duration-200 hover:border-[#36BDD0]/65 hover:bg-[#172027]/85"
              >
                <Sparkles className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
                <span>{dict.hero.ctaSecondary}</span>
              </button>
            </div>

            <p className="mt-4 font-mono text-[11px] tracking-[0.06em] text-[#94A8B8]">
              {dict.hero.statusBanner}
            </p>
          </div>

          {/* Right-center architectural Prismatic "A" sculpture */}
          <div className="flex justify-center lg:justify-end">
            <PrismaticSculpture size="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LivingAtlasHero;
