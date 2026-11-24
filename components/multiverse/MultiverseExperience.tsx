"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Grid2x2,
  Pause,
  Play,
  Sparkles,
  VolumeX,
} from "lucide-react";
import { AtlasLogo } from "../brand/AtlasLogo";
import { MaturityBadge } from "../brand/MaturityBadge";
import { PortalChromaticFrame } from "../brand/PortalChromaticFrame";
import { useAtlasMotion } from "../motion/MotionContext";
import { PORTAL_THEME_TOKENS } from "../../lib/v2/design-tokens";
import { PORTALS } from "../../lib/v2/portal-data";
import type { LocaleDictionary, PortalId } from "../../lib/v2/types";
import { MultiverseThreeCanvas } from "./MultiverseThreeCanvas";

export interface MultiverseExperienceProps {
  dict: LocaleDictionary;
  initialPortalId?: PortalId;
}

/**
 * Full-viewport opt-in orbital exploration stage for `/{locale}/experience`,
 * matching `05_multiverse_exploration.png`. Provides Guided Tour vs Free Explore,
 * full keyboard navigation (Arrows, Enter, Escape), persistent Exit to home,
 * and automatic 2D accessible grid fallback for reduced motion or non-WebGL browsers.
 */
export function MultiverseExperience({
  dict,
  initialPortalId = "club-atlas",
}: MultiverseExperienceProps) {
  const router = useRouter();
  const { reducedMotion, toggleReducedMotion } = useAtlasMotion();

  const [mode, setMode] = useState<"guided" | "free">("guided");
  const [activeId, setActiveId] = useState<PortalId>(initialPortalId);
  const [guidedPlaying, setGuidedPlaying] = useState(true);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [prefer2DGrid, setPrefer2DGrid] = useState(false);

  const activeIndex = Math.max(
    0,
    PORTALS.findIndex((p) => p.id === activeId),
  );
  const activePortal = PORTALS[activeIndex] ?? PORTALS[0];
  const activeCopy = dict.portalsSection.items[activePortal.id];
  const activeTheme = PORTAL_THEME_TOKENS[activePortal.id];

  const show2DFallback = reducedMotion || webglUnavailable || prefer2DGrid;

  const homeHref = `/${dict.locale}`;
  const activePortalHref = `/${dict.locale}/portals/${activePortal.slug}`;

  const goToIndex = useCallback((nextIndex: number) => {
    const wrapped = (nextIndex + PORTALS.length) % PORTALS.length;
    setActiveId(PORTALS[wrapped].id);
  }, []);

  const handleOpenPortalRoute = useCallback(
    (portalId: PortalId) => {
      const target = PORTALS.find((p) => p.id === portalId) ?? activePortal;
      router.push(`/${dict.locale}/portals/${target.slug}`);
    },
    [activePortal, dict.locale, router],
  );

  // Guided Tour progression (auto-advances only when guided, playing, and motion allowed)
  useEffect(() => {
    if (mode !== "guided" || !guidedPlaying || reducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const idx = PORTALS.findIndex((p) => p.id === current);
        const nextIdx = (idx + 1) % PORTALS.length;
        return PORTALS[nextIdx].id;
      });
    }, 8500);
    return () => window.clearInterval(timer);
  }, [mode, guidedPlaying, reducedMotion]);

  // Keyboard navigation: Left/Right arrows cycle monoliths, Enter opens route, Escape exits
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToIndex(activeIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToIndex(activeIndex - 1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        router.push(homeHref);
      } else if (
        event.key === "Enter" &&
        (!target || target === document.body || target.dataset.multiverseCard === "true")
      ) {
        event.preventDefault();
        handleOpenPortalRoute(activePortal.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, activePortal.id, goToIndex, handleOpenPortalRoute, homeHref, router]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#060B13] text-[#ECF4F6]">
      {/* Top persistent Multiverse bar */}
      <header className="relative z-30 border-b border-[#CBD5E1]/12 bg-[#080D12]/82 backdrop-blur-md">
        <div className="atlas-container flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-4">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/20 bg-[#0E151D]/85 px-3.5 py-2 text-xs font-semibold text-[#ECF4F6] transition-colors hover:border-[#E5C287]/65 hover:text-[#E5C287]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.multiverse.exitExperience}</span>
            </Link>
            <div className="hidden sm:block">
              <AtlasLogo variant="dark" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Guided vs Free mode tabs */}
            <div
              role="group"
              aria-label={dict.multiverse.title}
              className="inline-flex rounded-full border border-[#CBD5E1]/16 bg-[#0E151D]/90 p-0.5"
            >
              <button
                type="button"
                onClick={() => {
                  setMode("guided");
                  setGuidedPlaying(true);
                }}
                aria-pressed={mode === "guided"}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  mode === "guided"
                    ? "bg-[#CDA66C]/22 text-[#E5C287]"
                    : "text-[#CBD5E1] hover:text-[#ECF4F6]"
                }`}
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{dict.multiverse.modeGuided}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("free");
                  setGuidedPlaying(false);
                }}
                aria-pressed={mode === "free"}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  mode === "free"
                    ? "bg-[#36BDD0]/20 text-[#67E8F9]"
                    : "text-[#CBD5E1] hover:text-[#ECF4F6]"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{dict.multiverse.modeFree}</span>
              </button>
            </div>

            {!reducedMotion && !webglUnavailable ? (
              <button
                type="button"
                onClick={() => setPrefer2DGrid((prev) => !prev)}
                aria-pressed={prefer2DGrid}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D]/85 px-3 py-1.5 text-xs text-[#CBD5E1] transition-colors hover:border-[#E5C287]/50 hover:text-[#ECF4F6]"
              >
                <Grid2x2 className="h-3.5 w-3.5 text-[#CDA66C]" aria-hidden="true" />
                <span>2D / 3D</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={toggleReducedMotion}
              aria-pressed={reducedMotion}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D]/85 px-3 py-1.5 font-mono text-[11px] text-[#CBD5E1] transition-colors hover:border-[#CDA66C]/50 hover:text-[#ECF4F6]"
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
        </div>
      </header>

      {/* Main Orbital Stage or Accessible 2D Card Grid Fallback */}
      <main className="relative flex flex-1 flex-col justify-between">
        {/* Background 3D Canvas (only when motion enabled and WebGL available) */}
        {!show2DFallback ? (
          <div className="absolute inset-0 z-0">
            <MultiverseThreeCanvas
              activePortalId={activeId}
              onSelectPortal={(id) => {
                setMode("free");
                setGuidedPlaying(false);
                setActiveId(id);
              }}
              onActivatePortal={handleOpenPortalRoute}
              onWebglUnavailable={() => setWebglUnavailable(true)}
              paused={mode === "guided" && !guidedPlaying}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_30%,rgba(6,11,19,0.72)_100%)]"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
          >
            <Image
              src="/v2/scenes/hero-cosmos.webp"
              alt=""
              width={1440}
              height={810}
              sizes="100vw"
              unoptimized
              loading="eager"
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#060B13]/85 via-[#060B13]/72 to-[#060B13]" />
          </div>
        )}

        {/* Foreground Editorial Header & Notices */}
        <div className="atlas-container relative z-20 pt-6 pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#E5C287]">
                {dict.multiverse.eyebrow}
              </p>
              <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#ECF4F6] sm:text-4xl">
                {dict.multiverse.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1] sm:text-base">
                {dict.multiverse.subtitle}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/15 bg-[#0E151D]/82 px-3 py-1 font-mono text-[11px] text-[#94A8B8]">
                <VolumeX className="h-3.5 w-3.5 text-[#CDA66C]" aria-hidden="true" />
                <span>{dict.multiverse.audioOptInNotice}</span>
              </span>
              {show2DFallback ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#36BDD0]/35 bg-[#0B2834]/80 px-3 py-1 font-mono text-[11px] text-[#CFFAFE]">
                  <span>{dict.multiverse.webglFallbackNotice}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Accessible 5-Monolith Card Grid in 2D mode, or open unobstructed 3D viewport stage */}
        <div className="atlas-container relative z-20 my-auto flex-1 py-4">
          {show2DFallback ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PORTALS.map((portal) => {
                const copy = dict.portalsSection.items[portal.id];
                const isActive = portal.id === activeId;
                return (
                  <PortalChromaticFrame
                    key={portal.id}
                    portalId={portal.id}
                    active={isActive}
                    interactive
                    className="flex flex-col"
                  >
                    <button
                      type="button"
                      data-multiverse-card="true"
                      onClick={() => setActiveId(portal.id)}
                      onDoubleClick={() => handleOpenPortalRoute(portal.id)}
                      aria-pressed={isActive}
                      className="flex flex-1 cursor-pointer flex-col text-left"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#080D12]">
                        <Image
                          src={portal.mobilePosterSrc}
                          alt={copy.name}
                          width={640}
                          height={360}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                          unoptimized
                          loading="eager"
                          className="h-full w-full object-cover"
                        />
                        {portal.id === "atlasbot" ? (
                          <Image
                            src="/v2/mascots/guide-640.webp"
                            alt=""
                            width={640}
                            height={640}
                            sizes="140px"
                            unoptimized
                            loading="eager"
                            className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[84%] w-auto object-contain"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080D12] via-[#080D12]/25 to-transparent" />
                        <div className="absolute left-3 top-3">
                          <MaturityBadge
                            status={portal.maturity}
                            label={dict.maturityLabels[portal.maturity]}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <span className="font-mono text-[10px] tracking-[0.16em] text-[#94A8B8]">
                            {portal.index}
                          </span>
                          <h2 className="mt-1 font-display text-lg font-bold text-[#ECF4F6]">
                            {copy.name}
                          </h2>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">
                            {copy.shortDesc}
                          </p>
                        </div>
                      </div>
                    </button>
                  </PortalChromaticFrame>
                );
              })}
            </div>
          ) : (
            <div className="min-h-[300px] sm:min-h-[360px]" aria-hidden="true" />
          )}
        </div>

        {/* Bottom Dock: Selector Pills (3D mode) + Guided/Captioned Stage Panel */}
        <section
          aria-live="polite"
          className="relative z-20 border-t border-[#CBD5E1]/12 bg-[#080D12]/88 backdrop-blur-xl"
        >
          <div className="atlas-container py-5">
            {!show2DFallback ? (
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {PORTALS.map((portal) => {
                  const copy = dict.portalsSection.items[portal.id];
                  const isActive = portal.id === activeId;
                  const theme = PORTAL_THEME_TOKENS[portal.id];
                  return (
                    <button
                      key={portal.id}
                      type="button"
                      data-multiverse-card="true"
                      onClick={() => {
                        setMode("free");
                        setGuidedPlaying(false);
                        setActiveId(portal.id);
                      }}
                      aria-pressed={isActive}
                      style={{
                        borderColor: isActive ? theme.accent : undefined,
                        boxShadow: isActive
                          ? `0 0 24px -6px ${theme.glowStrong}`
                          : undefined,
                      }}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium backdrop-blur-md transition-all ${
                        isActive
                          ? "bg-[#0E151D]/92 text-[#ECF4F6]"
                          : "border-[#CBD5E1]/20 bg-[#080D12]/72 text-[#CBD5E1] hover:border-[#CBD5E1]/45 hover:text-[#ECF4F6]"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[10px] text-[#94A8B8]">
                        {portal.index}
                      </span>
                      <span>{copy.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div
              style={{ borderColor: activeTheme.border }}
              className="rounded-2xl border bg-[#0E151D]/85 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:pr-56">
                <div className="max-w-3xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs tracking-[0.14em] text-[#E5C287]">
                      {activePortal.index} / 0{PORTALS.length}
                    </span>
                    <MaturityBadge
                      status={activePortal.maturity}
                      label={dict.maturityLabels[activePortal.maturity]}
                      size="sm"
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#94A8B8]">
                      {activeCopy.eyebrow}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-[#ECF4F6] sm:text-2xl">
                    {activeCopy.name} — {activeCopy.chapterTitle}
                  </h2>

                  <p className="text-sm leading-relaxed text-[#CBD5E1]">
                    {activeCopy.chapterLead}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => goToIndex(activeIndex - 1)}
                    aria-label={dict.multiverse.prevStop}
                    className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/20 bg-[#172027]/85 px-3.5 py-2 text-xs font-medium text-[#ECF4F6] transition-colors hover:border-[#E5C287]/60"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{dict.multiverse.prevStop}</span>
                  </button>

                  {mode === "guided" && !reducedMotion ? (
                    <button
                      type="button"
                      onClick={() => setGuidedPlaying((prev) => !prev)}
                      aria-pressed={guidedPlaying}
                      className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/20 bg-[#172027]/85 px-3.5 py-2 text-xs font-medium text-[#E5C287] transition-colors hover:border-[#E5C287]/60"
                    >
                      {guidedPlaying ? (
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>{dict.multiverse.modeGuided}</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => goToIndex(activeIndex + 1)}
                    aria-label={dict.multiverse.nextStop}
                    className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/20 bg-[#172027]/85 px-3.5 py-2 text-xs font-medium text-[#ECF4F6] transition-colors hover:border-[#E5C287]/60"
                  >
                    <span>{dict.multiverse.nextStop}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <Link
                    href={activePortalHref}
                    className="atlas-glass-gold inline-flex min-h-[42px] items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-[#ECF4F6] transition-colors hover:border-[#E5C287]"
                  >
                    <span>{dict.multiverse.openPortalRoute}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#E5C287]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Capabilities footer strip matching 05_multiverse_exploration.png */}
            <ul className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#CBD5E1]/10 pt-3.5 pb-12 font-mono text-[11px] text-[#94A8B8] lg:pb-0 lg:pr-56">
              {dict.multiverse.capabilitiesStrip.map((capability, idx) => (
                <li key={idx} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-[#CDA66C]"
                  />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MultiverseExperience;
