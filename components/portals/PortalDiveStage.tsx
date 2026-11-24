"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  X,
} from "lucide-react";
import { MaturityBadge } from "../brand/MaturityBadge";
import { PortalChromaticFrame } from "../brand/PortalChromaticFrame";
import { AtlasSymbolGuide } from "../motion/AtlasSymbolGuide";
import { broadcastOverlayActive, useAtlasMotion } from "../motion/MotionContext";
import { PORTAL_THEME_TOKENS } from "../../lib/v2/design-tokens";
import { PORTALS, getPortalBySlug } from "../../lib/v2/portal-data";
import type { LocaleDictionary, PortalId } from "../../lib/v2/types";
import { PortalSceneRouter } from "./PortalSceneRouter";

export interface PortalDiveStageProps {
  dict: LocaleDictionary;
  initialPortal?: PortalId | null;
}

const DIVE_EASE = [0.16, 1, 0.3, 1] as const;
const PORTAL_URL_EVENT = "atlas:portal-url-change";

function subscribePortalUrl(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("popstate", callback);
  window.addEventListener(PORTAL_URL_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(PORTAL_URL_EVENT, callback);
  };
}

function readPortalFromWindowSearch(): PortalId | null {
  if (typeof window === "undefined") {
    return null;
  }
  const slug = new URLSearchParams(window.location.search).get("portal");
  if (!slug) {
    return null;
  }
  return getPortalBySlug(slug)?.id ?? null;
}

/**
 * Five-portal showcase matching `01_portais_A_dark.png` with "O Efeito de Mergulho":
 * hover elevation & tilt, Dive transition into a full-viewport 65%/35% split
 * Portal Chapter without transform-squashing or click-frame layout reflow,
 * `?portal=<slug>` URL & `popstate` sync, and guaranteed Escape / Back / Return exit
 * with scroll and focus restoration.
 */
export function PortalDiveStage({
  dict,
  initialPortal = null,
}: PortalDiveStageProps) {
  const { reducedMotion } = useAtlasMotion();

  const activePortalId = useSyncExternalStore(
    subscribePortalUrl,
    readPortalFromWindowSearch,
    () => initialPortal,
  );

  const savedScrollYRef = useRef<number>(0);
  const prevPortalIdRef = useRef<PortalId | null>(initialPortal);
  const cardRefs = useRef<Partial<Record<PortalId, HTMLButtonElement | null>>>({});
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const [sceneReadyPortalId, setSceneReadyPortalId] = useState<PortalId | null>(
    initialPortal,
  );

  const restoreScrollAndFocus = useCallback((portalIdToFocus: PortalId | null) => {
    const targetY = savedScrollYRef.current;
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: "auto" });
        if (portalIdToFocus) {
          cardRefs.current[portalIdToFocus]?.focus({ preventScroll: true });
        }
      });
    }, 80);
  }, []);

  const syncPortalQueryParam = useCallback(
    (slug: PortalId | null, mode: "push" | "replace") => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (slug) {
        url.searchParams.set("portal", slug);
      } else {
        url.searchParams.delete("portal");
      }
      const nextHref = `${url.pathname}${url.search}${url.hash}`;
      if (mode === "push") {
        window.history.pushState({ portal: slug }, "", nextHref);
      } else {
        window.history.replaceState({ portal: slug }, "", nextHref);
      }
      window.dispatchEvent(new Event(PORTAL_URL_EVENT));
    },
    [],
  );

  const openPortal = useCallback(
    (portalId: PortalId) => {
      if (typeof window !== "undefined" && !activePortalId) {
        savedScrollYRef.current = window.scrollY;
      }
      syncPortalQueryParam(portalId, activePortalId ? "replace" : "push");
    },
    [activePortalId, syncPortalQueryParam],
  );

  const closePortal = useCallback(() => {
    syncPortalQueryParam(null, "replace");
  }, [syncPortalQueryParam]);

  const activeIndex = activePortalId
    ? PORTALS.findIndex((p) => p.id === activePortalId)
    : -1;
  const activePortal = activeIndex >= 0 ? PORTALS[activeIndex] : null;

  const stepPortal = useCallback(
    (delta: number) => {
      if (activeIndex < 0) return;
      const nextIdx = (activeIndex + delta + PORTALS.length) % PORTALS.length;
      const target = PORTALS[nextIdx];
      syncPortalQueryParam(target.id, "replace");
    },
    [activeIndex, syncPortalQueryParam],
  );

  useEffect(() => {
    const previousPortalId = prevPortalIdRef.current;
    prevPortalIdRef.current = activePortalId;

    if (previousPortalId && !activePortalId) {
      restoreScrollAndFocus(previousPortalId);
    }

    if (!activePortalId) {
      broadcastOverlayActive(false, "portal-dive");
      const clearTimer = window.setTimeout(() => {
        setSceneReadyPortalId(null);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    broadcastOverlayActive(true, "portal-dive");
    const previousOverflow = document.body.style.overflow;

    // Defer heavy inner scene mount & body scrollbar reflow 80ms post-paint for <100ms INP
    const sceneTimer = window.setTimeout(() => {
      setSceneReadyPortalId(activePortalId);
    }, 80);
    const overflowTimer = window.setTimeout(() => {
      document.body.style.overflow = "hidden";
    }, 80);
    const focusTimer = window.setTimeout(() => {
      backButtonRef.current?.focus({ preventScroll: true });
    }, 90);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePortal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(sceneTimer);
      window.clearTimeout(overflowTimer);
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => {
        document.body.style.overflow = previousOverflow;
      }, 80);
      broadcastOverlayActive(false, "portal-dive");
    };
  }, [activePortalId, closePortal, restoreScrollAndFocus]);

  const activeCopy = activePortal
    ? dict.portalsSection.items[activePortal.id]
    : null;
  const activeTheme = activePortal
    ? PORTAL_THEME_TOKENS[activePortal.id]
    : null;

  return (
    <>
      <section
        id="portals"
        aria-labelledby="portals-section-title"
        className="relative bg-[#080D12] pt-3 pb-10 sm:pt-4 sm:pb-12 lg:pt-5 lg:pb-14"
      >
        <div className="atlas-container">
          {/* Compact Section Header + Orientation Beacon */}
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#E5C287]">
                {dict.portalsSection.eyebrow}
              </p>
              <h2
                id="portals-section-title"
                className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#ECF4F6] sm:text-3xl"
              >
                {dict.portalsSection.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#CBD5E1]">
                {dict.portalsSection.lead}
              </p>
            </div>

            <div className="shrink-0 self-start md:self-end">
              <AtlasSymbolGuide
                activePortalId={activePortalId}
                progressLabel={
                  activePortal
                    ? `${activePortal.index} / 0${PORTALS.length}`
                    : "05 PORTALS"
                }
                dismissLabel={dict.portalsSection.closePortal}
              />
            </div>
          </div>

          {/* Five-Column Widescreen Showcase (2-col tablet, stacked mobile) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PORTALS.map((portal) => {
              const copy = dict.portalsSection.items[portal.id];
              const theme = PORTAL_THEME_TOKENS[portal.id];
              const isSelected = activePortalId === portal.id;

              return (
                <div key={portal.id} className="flex">
                  <PortalChromaticFrame
                    portalId={portal.id}
                    interactive
                    active={isSelected}
                    className="group flex w-full flex-col"
                  >
                    <button
                      ref={(el) => {
                        cardRefs.current[portal.id] = el;
                      }}
                      type="button"
                      onClick={() => openPortal(portal.id)}
                      aria-label={`${copy.name} — ${dict.portalsSection.openPortal}`}
                      aria-expanded={isSelected}
                      className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-none"
                    >
                      {/* Portal visual window */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0E151D]">
                        <Image
                          src={portal.mobilePosterSrc}
                          alt={copy.name}
                          width={640}
                          height={360}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                          unoptimized
                          loading="eager"
                          className={`h-full w-full object-cover ${
                            reducedMotion
                              ? ""
                              : "transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          }`}
                        />

                        {/* Layered DEV mascots for Portal 02 (AtlasBot) over glowing stage backdrop */}
                        {portal.id === "atlasbot" ? (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden"
                          >
                            <Image
                              src="/v2/mascots/builder-640.webp"
                              alt=""
                              width={640}
                              height={640}
                              sizes="120px"
                              unoptimized
                              loading="eager"
                              className="h-[52%] w-auto translate-x-2 object-contain opacity-90"
                            />
                            <Image
                              src="/v2/mascots/guide-640.webp"
                              alt=""
                              width={640}
                              height={640}
                              sizes="160px"
                              unoptimized
                              loading="eager"
                              className="relative z-10 h-[86%] w-auto object-contain drop-shadow-[0_10px_22px_rgba(34,211,238,0.35)]"
                            />
                            <Image
                              src="/v2/mascots/creator-640.webp"
                              alt=""
                              width={640}
                              height={640}
                              sizes="120px"
                              unoptimized
                              loading="eager"
                              className="h-[50%] w-auto -translate-x-2 object-contain opacity-90"
                            />
                          </div>
                        ) : null}

                        {/* Bottom gradient fade for crisp legibility */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D12] via-[#080D12]/30 to-transparent" />

                        {/* Maturity badge & Portal index */}
                        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
                          <MaturityBadge
                            status={portal.maturity}
                            label={dict.maturityLabels[portal.maturity]}
                            size="sm"
                          />
                          <span className="rounded-full border border-[#CBD5E1]/20 bg-[#080D12]/78 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-[#CBD5E1]">
                            {portal.index}
                          </span>
                        </div>
                      </div>

                      {/* Portal Window Content & Circular Dive Trigger */}
                      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                        <div>
                          <h3 className="font-display text-lg font-bold tracking-tight text-[#ECF4F6]">
                            <span style={{ color: theme.textAccent }}>
                              {copy.name}
                            </span>
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                            {copy.tagline}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-[#CBD5E1]/10 pt-2.5">
                          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#94A8B8] transition-colors group-hover:text-[#ECF4F6]">
                            {dict.portalsSection.openPortal}
                          </span>

                          <span
                            aria-hidden="true"
                            style={{
                              borderColor: theme.border,
                              backgroundColor: theme.badgeBg,
                              color: theme.textAccent,
                            }}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 group-hover:translate-x-0.5"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  </PortalChromaticFrame>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-center">
            <a
              href="#ecosystem-bridge"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-[#94A8B8] transition-colors hover:text-[#E5C287]"
            >
              <span>{dict.hero.scrollCue}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Full-Viewport Portal Dive Chapter Overlay ("O Efeito de Mergulho") */}
      <AnimatePresence>
        {activePortal && activeCopy && activeTheme ? (
          <motion.div
            key="portal-dive-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-chapter-title"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0.92 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{
              duration: reducedMotion ? 0.05 : 0.35,
              ease: DIVE_EASE,
            }}
            className="fixed inset-0 z-50 flex flex-col bg-[#070B10]"
          >
            {/* Chromatic Portal Energy Beam Backdrop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background: `radial-gradient(ellipse 80% 55% at 32% 15%, ${activeTheme.glowStrong}, transparent 68%)`,
              }}
            />

            {/* Persistent Top Navigation Chrome inside the Portal Chapter */}
            <header className="shrink-0 border-b border-[#CBD5E1]/14 bg-[#080D12]">
              <div className="atlas-container flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <button
                    ref={backButtonRef}
                    type="button"
                    onClick={closePortal}
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#CBD5E1]/22 bg-[#0E151D] px-4 py-1.5 text-xs font-semibold text-[#ECF4F6] transition-colors hover:border-[#E5C287] hover:text-[#E5C287]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{dict.portalsSection.backToEcosystem}</span>
                  </button>

                  <div className="hidden md:block">
                    <AtlasSymbolGuide
                      activePortalId={activePortal.id}
                      progressLabel={`${activePortal.index} / 0${PORTALS.length}`}
                      label={activeCopy.name}
                      dismissLabel={dict.portalsSection.closePortal}
                    />
                  </div>
                </div>

                {/* Progress Indicator (01 / 05 .. 05 / 05) + Free Previous/Next Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepPortal(-1)}
                    aria-label={dict.portalsSection.previousPortal}
                    className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D] px-3 py-1.5 text-xs text-[#CBD5E1] transition-colors hover:border-[#E5C287]/60 hover:text-[#ECF4F6]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">
                      {dict.portalsSection.previousPortal}
                    </span>
                  </button>

                  <span
                    aria-live="polite"
                    className="rounded-full border border-[#CBD5E1]/16 bg-[#172027]/80 px-3 py-1 font-mono text-xs tracking-[0.12em] text-[#E5C287]"
                  >
                    {activePortal.index} / 0{PORTALS.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => stepPortal(1)}
                    aria-label={dict.portalsSection.nextPortal}
                    className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1]/18 bg-[#0E151D] px-3 py-1.5 text-xs text-[#CBD5E1] transition-colors hover:border-[#E5C287]/60 hover:text-[#ECF4F6]"
                  >
                    <span className="hidden sm:inline">
                      {dict.portalsSection.nextPortal}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Standalone Route & Close */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${dict.locale}${activeCopy.exploreHref}`}
                    onClick={() => {
                      document.body.style.overflow = "";
                    }}
                    className="hidden items-center gap-1.5 rounded-full border border-[#CDA66C]/45 bg-[#172027]/85 px-3.5 py-1.5 text-xs font-medium text-[#E5C287] transition-colors hover:border-[#E5C287] sm:inline-flex"
                  >
                    <span>{dict.portalsSection.exploreStandalone}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={closePortal}
                    aria-label={dict.portalsSection.closePortal}
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1]/22 bg-[#0E151D] text-[#CBD5E1] transition-colors hover:border-[#E5C287] hover:text-[#ECF4F6]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </header>

            {/* Full-Width Expanded Dive Stage */}
            <div className="flex-1 overflow-y-auto">
              <div className="atlas-container py-6 sm:py-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)] lg:items-start">
                  {/* Left 65% Interactive Portal Demonstration Stage */}
                  <PortalChromaticFrame
                    portalId={activePortal.id}
                    active
                    className="min-w-0 p-4 sm:p-6"
                  >
                    {sceneReadyPortalId !== null ? (
                      <PortalSceneRouter
                        portalId={activePortal.id}
                        dict={dict}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="h-[380px] rounded-xl border border-[#CBD5E1]/12 bg-[#0E151D]"
                      />
                    )}
                  </PortalChromaticFrame>

                  {/* Right 35% Narrative, 3 Steps, Proof & Limitation Sidebar */}
                  <aside className="flex flex-col gap-5 rounded-2xl border border-[#CBD5E1]/14 bg-[#0E151D]/92 p-5 sm:p-6">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className="font-mono text-[11px] uppercase tracking-[0.16em]"
                          style={{ color: activeTheme.textAccent }}
                        >
                          {activeCopy.eyebrow}
                        </span>
                        <MaturityBadge
                          status={activePortal.maturity}
                          label={dict.maturityLabels[activePortal.maturity]}
                          size="md"
                        />
                      </div>

                      <h2
                        id="portal-chapter-title"
                        className="mt-3 font-display text-2xl font-bold tracking-tight text-[#ECF4F6] sm:text-3xl"
                      >
                        {activeCopy.name}
                      </h2>
                      <p className="mt-1.5 text-base font-medium text-[#E5C287]">
                        {activeCopy.chapterTitle}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">
                        {activeCopy.chapterLead}
                      </p>
                    </div>

                    {/* 3 Operational Steps */}
                    <ol className="space-y-2.5 border-t border-[#CBD5E1]/12 pt-4">
                      {activeCopy.steps.map((stepText, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 rounded-xl border border-[#CBD5E1]/10 bg-[#172027]/72 p-3 text-xs leading-relaxed text-[#ECF4F6]"
                        >
                          <span
                            style={{
                              borderColor: activeTheme.border,
                              color: activeTheme.textAccent,
                            }}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-[#080D12] font-mono text-[11px] font-semibold"
                          >
                            0{idx + 1}
                          </span>
                          <span>{stepText}</span>
                        </li>
                      ))}
                    </ol>

                    {/* Proof Card */}
                    <div
                      style={{ borderColor: activeTheme.border }}
                      className="rounded-xl border bg-[#172027]/65 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          style={{ color: activeTheme.accent }}
                          aria-hidden="true"
                        />
                        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#ECF4F6]">
                          {activeCopy.proofLabel}
                        </h3>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">
                        {activeCopy.proofDetail}
                      </p>
                    </div>

                    {/* Limitation Notice */}
                    <div className="rounded-xl border border-[#CDA66C]/28 bg-[#080D12]/75 p-4">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C287]"
                          aria-hidden="true"
                        />
                        <p className="text-xs leading-relaxed text-[#CBD5E1]">
                          {activeCopy.limitationNotice}
                        </p>
                      </div>
                    </div>

                    {/* Chapter Links & Actions */}
                    <div className="flex flex-col gap-2.5 border-t border-[#CBD5E1]/12 pt-4">
                      <Link
                        href={`/${dict.locale}${activeCopy.exploreHref}`}
                        onClick={() => {
                          document.body.style.overflow = "";
                        }}
                        className="atlas-glass-gold inline-flex min-h-[44px] items-center justify-between gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-[#ECF4F6] transition-colors hover:border-[#E5C287]"
                      >
                        <span>{dict.portalsSection.exploreStandalone}</span>
                        <ArrowUpRight className="h-4 w-4 text-[#E5C287]" aria-hidden="true" />
                      </Link>

                      {activePortal.externalUrlVerified &&
                      activePortal.externalUrl ? (
                        <a
                          href={activePortal.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[42px] items-center justify-between gap-2 rounded-full border border-[#CBD5E1]/20 bg-[#172027]/80 px-5 py-2 text-xs font-medium text-[#ECF4F6] transition-colors hover:border-[#CDA66C]/60"
                        >
                          <span>{activeCopy.primaryCta}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-[#CDA66C]" aria-hidden="true" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("atlas:open-clara", {
                                detail: { path: "diagnostic" },
                              }),
                            );
                          }}
                          className="inline-flex min-h-[42px] cursor-pointer items-center justify-between gap-2 rounded-full border border-[#CBD5E1]/20 bg-[#172027]/80 px-5 py-2 text-xs font-medium text-[#ECF4F6] transition-colors hover:border-[#36BDD0]/60"
                        >
                          <span>{activeCopy.secondaryCta}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#36BDD0]" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default PortalDiveStage;
