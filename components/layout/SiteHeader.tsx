"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import { AtlasLogo } from "@/components/brand/AtlasLogo";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import { getHeaderNav, localePath } from "@/lib/v2/navigation";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface SiteHeaderProps {
  locale: Locale;
  dict: LocaleDictionary;
}

function MobileMotionToggle({ dict }: { dict: LocaleDictionary }) {
  const { reducedMotion, toggleReducedMotion } = useAtlasMotion();
  return (
    <button
      type="button"
      onClick={toggleReducedMotion}
      aria-pressed={reducedMotion}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CBD5E1]/20 bg-[#172027] px-3 py-1.5 font-mono text-[11px] text-[#CBD5E1]"
    >
      <Sparkles className="h-3 w-3 text-[#E5C287]" aria-hidden="true" />
      <span>
        {reducedMotion ? dict.nav.reduceMotionOff : dict.nav.reduceMotionOn}
      </span>
    </button>
  );
}

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const pathname = usePathname() || `/${locale}`;
  const navItems = getHeaderNav(locale);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenClara = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
    window.dispatchEvent(new CustomEvent("atlas:open-clara"));
  };

  return (
    <>
      <a href="#main-content" className="atlas-skip-link">
        {dict.skipToContent}
      </a>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-[#CBD5E1]/12 bg-[#080D12]/84 backdrop-blur-md"
      >
        <div className="atlas-container flex h-16 items-center justify-between gap-3 sm:h-[72px]">
          {/* Brand Wordmark */}
          <Link
            href={localePath(locale, "/")}
            aria-label={`AtlasHub.SI — ${dict.nav.ecosystem}`}
            className="shrink-0 whitespace-nowrap rounded-lg py-1"
            onClick={() => {
              setOpenDropdown(null);
              setMobileOpen(false);
            }}
          >
            <AtlasLogo variant="dark" />
          </Link>

          {/* Desktop Navigation — strictly single-line across PT, EN, FR, ES */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          >
            {navItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isOpen = openDropdown === item.id;
              const targetHref = localePath(locale, item.href);
              const isActive =
                pathname === targetHref || pathname.startsWith(`${targetHref}/`);

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={targetHref}
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors xl:px-3.5 xl:text-sm ${
                      isActive
                        ? "bg-[#172027] text-[#E5C287]"
                        : "text-[#CBD5E1] hover:bg-[#172027]/70 hover:text-[#ECF4F6]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div
                  key={item.id}
                  className="relative shrink-0"
                  onMouseLeave={() =>
                    setOpenDropdown((cur) => (cur === item.id ? null : cur))
                  }
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDropdown((cur) => (cur === item.id ? null : item.id))
                    }
                    className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors xl:px-3.5 xl:text-sm ${
                      isOpen || isActive
                        ? "bg-[#172027] text-[#E5C287]"
                        : "text-[#CBD5E1] hover:bg-[#172027]/70 hover:text-[#ECF4F6]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <div className="atlas-glass-raised absolute left-0 top-full mt-2 w-72 rounded-2xl p-2">
                      <div className="mb-1 border-b border-[#CBD5E1]/10 px-3 py-1.5">
                        <Link
                          href={targetHref}
                          onClick={() => setOpenDropdown(null)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-[#E5C287] hover:underline"
                        >
                          <span>{item.label}</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </div>
                      <ul className="space-y-0.5">
                        {item.children?.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={localePath(locale, child.href)}
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-[#CBD5E1] transition-colors hover:bg-[#080D12]/70 hover:text-[#ECF4F6]"
                            >
                              <span>{child.label}</span>
                              {child.badge ? (
                                <span className="shrink-0 whitespace-nowrap rounded-full border border-[#CBD5E1]/15 bg-[#080D12] px-2 py-0.5 font-mono text-[10px] text-[#94A8B8]">
                                  {child.badge}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          {/* Right Controls — mirrors 01_portais_A_dark.png single-line balance */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden shrink-0 md:block">
              <LanguageSwitcher
                locale={locale}
                label={dict.nav.languageLabel}
                compact
              />
            </div>

            <Link
              href={localePath(locale, "/ecosystem")}
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CDA66C]/75 bg-[#0E151D] px-4 py-2 text-xs font-semibold text-[#E5C287] shadow-[0_0_24px_-8px_rgba(205,166,108,0.45)] transition hover:bg-[#CDA66C] hover:text-[#080D12] sm:inline-flex"
            >
              <span>{dict.nav.exploreCta}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={
                mobileOpen ? dict.nav.menuClose : dict.nav.menuOpen
              }
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CBD5E1]/20 bg-[#0E151D] text-[#ECF4F6] lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Progressive Drawer */}
        {mobileOpen ? (
          <div className="border-t border-[#CBD5E1]/12 bg-[#080D12]/98 px-4 pb-6 pt-4 backdrop-blur-lg lg:hidden">
            <div className="atlas-container space-y-5 px-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LanguageSwitcher
                  locale={locale}
                  label={dict.nav.languageLabel}
                  onSelect={() => setMobileOpen(false)}
                />
                <MobileMotionToggle dict={dict} />
              </div>

              <nav aria-label="Mobile navigation" className="space-y-2">
                {navItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#CBD5E1]/10 bg-[#0E151D]/80 p-3"
                  >
                    <Link
                      href={localePath(locale, item.href)}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between text-sm font-semibold text-[#ECF4F6]"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-[#CDA66C]" aria-hidden="true" />
                    </Link>
                    {item.children?.length ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-[#CBD5E1]/10 pt-2.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={localePath(locale, child.href)}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full border border-[#CBD5E1]/14 bg-[#172027] px-2.5 py-1 text-xs text-[#CBD5E1]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleOpenClara}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#36BDD0]/50 bg-[#0E151D] px-4 py-2.5 text-sm font-semibold text-[#ECF4F6]"
                >
                  <MessageSquare className="h-4 w-4 text-[#36BDD0]" aria-hidden="true" />
                  <span>{dict.nav.claraCta}</span>
                </button>
                <Link
                  href={localePath(locale, "/ecosystem")}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E5C287] bg-[#E5C287] px-4 py-2.5 text-sm font-semibold text-[#080D12]"
                >
                  <span>{dict.nav.exploreCta}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

export default SiteHeader;
