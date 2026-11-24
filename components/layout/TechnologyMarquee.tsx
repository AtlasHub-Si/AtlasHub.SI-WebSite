"use client";

import { useState } from "react";
import { ArrowUpRight, Pause, Play, ShieldAlert } from "lucide-react";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import {
  getCommunitiesAndPrograms,
  getTechnologiesUsed,
  getVerifiedPartnerships,
} from "@/lib/v2/technology-registry";
import type { Locale, LocaleDictionary, TechRegistryEntry } from "@/lib/v2/types";

export interface TechnologyMarqueeProps {
  locale: Locale;
  dict: LocaleDictionary;
}

function TechChip({
  entry,
  locale,
}: {
  entry: TechRegistryEntry;
  locale: Locale;
}) {
  return (
    <a
      href={entry.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={entry.evidenceNote[locale]}
      aria-label={`${entry.name} — ${entry.evidenceNote[locale]}`}
      className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[#CBD5E1]/14 bg-[#0E151D]/90 px-3.5 py-2 text-xs text-[#CBD5E1] transition-colors hover:border-[#CDA66C]/60 hover:text-[#ECF4F6]"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1]/20 bg-[#172027] font-mono text-[10px] font-semibold text-[#94A8B8] transition-colors group-hover:border-[#CDA66C]/50 group-hover:text-[#E5C287]"
      >
        {entry.monogram}
      </span>
      <span className="font-medium whitespace-nowrap">{entry.name}</span>
      <ArrowUpRight
        className="h-3 w-3 text-[#94A8B8] opacity-70 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </a>
  );
}

/**
 * Strictly separates engineering stack tools (`technologies_used`) from developer
 * communities/programs (`communities_and_programs`) and commercial partnerships
 * (`verified_partnerships`), with pausable motion and reduced-motion compliance.
 */
export function TechnologyMarquee({ locale, dict }: TechnologyMarqueeProps) {
  const { reducedMotion } = useAtlasMotion();
  const [paused, setPaused] = useState(false);

  const technologies = getTechnologiesUsed();
  const communities = getCommunitiesAndPrograms();
  const partnerships = getVerifiedPartnerships();
  const isPaused = paused || reducedMotion;

  return (
    <section
      aria-labelledby="footer-tech-heading"
      className="border-y border-[#CBD5E1]/12 bg-[#0B1118] py-10"
    >
      <div className="atlas-container space-y-8">
        {/* Header & Pause Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              id="footer-tech-heading"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#E5C287]"
            >
              {dict.footer.techSectionTitle}
            </p>
            <p className="mt-1 text-sm text-[#94A8B8]">
              {dict.footer.techUsedLabel}
            </p>
          </div>
          {!reducedMotion ? (
            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              aria-pressed={paused}
              className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/20 bg-[#172027] px-3.5 py-1.5 font-mono text-[11px] text-[#CBD5E1] transition-colors hover:border-[#CDA66C]/60 hover:text-[#ECF4F6]"
            >
              {paused ? (
                <>
                  <Play className="h-3 w-3 text-[#E5C287]" aria-hidden="true" />
                  <span>{dict.footer.resumeMarquee}</span>
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 text-[#36BDD0]" aria-hidden="true" />
                  <span>{dict.footer.pauseMarquee}</span>
                </>
              )}
            </button>
          ) : null}
        </div>

        {/* Band C1: Technologies Used / Evaluated (Pausable marquee with stable zero-reflow geometry) */}
        <div
          className="atlas-marquee"
          data-paused={isPaused ? "true" : "false"}
        >
          <div className="atlas-marquee-track py-1">
            {technologies.map((entry) => (
              <TechChip key={entry.id} entry={entry} locale={locale} />
            ))}
            <div className="flex shrink-0 gap-4" aria-hidden="true">
              {technologies.map((entry) => (
                <span
                  key={`${entry.id}-clone`}
                  className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[#CBD5E1]/14 bg-[#0E151D]/90 px-3.5 py-2 text-xs text-[#CBD5E1]"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1]/20 bg-[#172027] font-mono text-[10px] font-semibold text-[#94A8B8]">
                    {entry.monogram}
                  </span>
                  <span className="font-medium whitespace-nowrap">{entry.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Band C2 & C3: Communities/Programs and Verified Commercial Partnerships strictly separated */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D]/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#36BDD0]">
              {dict.footer.communitiesProgramsLabel}
            </p>
            <ul className="mt-3 space-y-3">
              {communities.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 rounded-xl border border-[#CBD5E1]/10 bg-[#172027]/60 p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ECF4F6] hover:text-[#E5C287]"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <span className="rounded-full border border-[#CBD5E1]/20 bg-[#080D12] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#94A8B8]">
                      {item.status === "verified"
                        ? dict.maturityLabels.VERIFIED
                        : dict.maturityLabels.PROPOSED}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#94A8B8]">
                    {item.evidenceNote[locale]}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#CBD5E1]/12 bg-[#0E151D]/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#E5C287]">
              {dict.footer.partnershipsLabel}
            </p>
            {partnerships.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-3">
                {partnerships.map((partner) => (
                  <li key={partner.id}>
                    <TechChip entry={partner} locale={locale} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-dashed border-[#CDA66C]/30 bg-[#172027]/45 p-4 text-xs leading-relaxed text-[#CBD5E1]">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#CDA66C]"
                  aria-hidden="true"
                />
                <p>{dict.footer.partnershipsEmptyNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TechnologyMarquee;
