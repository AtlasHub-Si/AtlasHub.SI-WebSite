"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageSquare } from "lucide-react";
import { AtlasLogo } from "@/components/brand/AtlasLogo";
import { localePath } from "@/lib/v2/navigation";
import {
  getPendingSocialChannels,
  getVerifiedSocialChannels,
} from "@/lib/v2/social-registry";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TechnologyMarquee } from "./TechnologyMarquee";

export interface SiteFooterProps {
  locale: Locale;
  dict: LocaleDictionary;
}

const COLUMN_ORDER = [
  "ecosystem",
  "solutions",
  "organization",
  "community",
  "relations",
  "supportLegal",
] as const;

/**
 * Full 5-band institutional footer:
 * A) Editorial Close
 * B) 6-Column Ecosystem & Legal Navigation
 * C) Separated Pausable Technology & Communities Registry
 * D) Corporate Disclosure (17379237 / 17401190) & Verified Channels Only
 * E) Legal Bar & Language Switcher
 */
export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const verifiedChannels = getVerifiedSocialChannels();
  const pendingChannels = getPendingSocialChannels();

  const handleOpenClara = () => {
    window.dispatchEvent(new CustomEvent("atlas:open-clara"));
  };

  return (
    <footer className="border-t border-[#CBD5E1]/12 bg-[#080D12] text-[#ECF4F6]">
      {/* Band A: Editorial Close */}
      <div className="atlas-container py-12 sm:py-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-4">
            <AtlasLogo variant="dark" showTagline />
            <p className="text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
              {dict.footer.editorialStatement}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={localePath(locale, "/ecosystem")}
              className="inline-flex items-center gap-2 rounded-full border border-[#CDA66C]/70 bg-[#0E151D] px-5 py-2.5 text-sm font-semibold text-[#E5C287] transition hover:bg-[#CDA66C] hover:text-[#080D12]"
            >
              <span>{dict.footer.exploreBtn}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleOpenClara}
              className="inline-flex items-center gap-2 rounded-full border border-[#36BDD0]/55 bg-[#172027] px-5 py-2.5 text-sm font-semibold text-[#ECF4F6] transition hover:border-[#36BDD0]"
            >
              <MessageSquare className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
              <span>{dict.footer.claraBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Band B: 6-Column Navigation */}
      <div className="border-t border-[#CBD5E1]/10 bg-[#0A1017]">
        <div className="atlas-container py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {COLUMN_ORDER.map((colKey) => {
              const title = dict.footer.columns[colKey];
              const items = dict.footer.links[colKey] || [];
              return (
                <div key={colKey}>
                  <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#E5C287]">
                    {title}
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {items.map((item) => {
                      const isExternal = /^https?:\/\//i.test(item.href);
                      const resolvedHref = isExternal
                        ? item.href
                        : localePath(locale, item.href);
                      return (
                        <li key={`${colKey}-${item.label}`}>
                          {isExternal ? (
                            <a
                              href={resolvedHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#94A8B8] transition-colors hover:text-[#ECF4F6]"
                            >
                              <span>{item.label}</span>
                              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                            </a>
                          ) : (
                            <Link
                              href={resolvedHref}
                              className="text-sm text-[#94A8B8] transition-colors hover:text-[#ECF4F6]"
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Band C: Separated Pausable Technology, Communities & Partnerships Marquee */}
      <TechnologyMarquee locale={locale} dict={dict} />

      {/* Band D: Corporate Disclosure & Verified Channels */}
      <div className="border-b border-[#CBD5E1]/10 bg-[#080D12]">
        <div className="atlas-container grid gap-8 py-10 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E5C287]">
              {dict.footer.corporateTitle}
            </h2>
            <p className="max-w-3xl text-xs leading-relaxed text-[#94A8B8] sm:text-sm">
              {dict.footer.corporateEntitiesNote}
            </p>
          </div>

          <div className="space-y-3 lg:col-span-5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#36BDD0]">
              {dict.footer.verifiedChannelsLabel}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {verifiedChannels.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#CDA66C]/45 bg-[#172027] px-3.5 py-1.5 text-xs font-medium text-[#ECF4F6] transition hover:border-[#E5C287]"
                >
                  <span>{channel.network}</span>
                  {channel.handle ? (
                    <span className="font-mono text-[11px] text-[#E5C287]">
                      {channel.handle}
                    </span>
                  ) : null}
                  <ArrowUpRight className="h-3 w-3 text-[#94A8B8]" aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-[#94A8B8]">
              {dict.footer.pendingChannelsNote}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Pending social verification">
              {pendingChannels.map((channel) => (
                <span
                  key={channel.id}
                  className="rounded-full border border-[#CBD5E1]/10 bg-[#0E151D] px-2.5 py-0.5 font-mono text-[10px] text-[#94A8B8]"
                >
                  {channel.network} · {dict.maturityLabels.PROPOSED}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Band E: Legal Bar & Locale Selector */}
      <div className="bg-[#060A0E]">
        <div className="atlas-container flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 text-xs text-[#94A8B8]">
            <p className="font-medium text-[#CBD5E1]">
              © {new Date().getFullYear()} {dict.footer.copyrightOwner} · AtlasHub.SI
            </p>
            <p>{dict.footer.legalNotice}</p>
            <p>{dict.footer.thirdPartyNotice}</p>
          </div>
          <div className="shrink-0">
            <LanguageSwitcher
              locale={locale}
              label={dict.nav.languageLabel}
              compact
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
