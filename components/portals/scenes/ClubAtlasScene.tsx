"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Hammer,
  Play,
  RotateCcw,
  Share2,
  Users,
} from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import { PORTAL_THEME_TOKENS } from "@/lib/v2/design-tokens";
import type { Locale, LocaleDictionary, PortalDefinition, PortalLocaleCopy } from "@/lib/v2/types";

export interface ClubAtlasSceneProps {
  copy: PortalLocaleCopy;
  dict: LocaleDictionary;
  portal: PortalDefinition;
}

const CLUB_LOCAL_STRINGS: Record<
  Locale,
  {
    learnerCaption: string;
    stationPrefix: string;
    playJourney: string;
    trackFocusLabel: string;
  }
> = {
  pt: {
    learnerCaption: "Estúdio de aprendizagem aplicada e prototipagem",
    stationPrefix: "Estação",
    playJourney: "Percorrer jornada",
    trackFocusLabel: "Percurso Genesis selecionado",
  },
  en: {
    learnerCaption: "Applied learning studio & collaborative prototyping",
    stationPrefix: "Station",
    playJourney: "Walk journey",
    trackFocusLabel: "Selected Genesis track",
  },
  fr: {
    learnerCaption: "Atelier d'apprentissage appliqué et de prototypage",
    stationPrefix: "Étape",
    playJourney: "Parcourir le trajet",
    trackFocusLabel: "Parcours Genesis sélectionné",
  },
  es: {
    learnerCaption: "Estudio de aprendizaje aplicado y prototipado",
    stationPrefix: "Estación",
    playJourney: "Recorrer ruta",
    trackFocusLabel: "Itinerario Genesis seleccionado",
  },
};

export function ClubAtlasScene({ copy, dict, portal }: ClubAtlasSceneProps) {
  const { reducedMotion } = useAtlasMotion();
  const s = copy.sceneLabels;
  const localCopy = CLUB_LOCAL_STRINGS[dict.locale];
  const theme = PORTAL_THEME_TOKENS["club-atlas"];

  const [activeStation, setActiveStation] = useState(0);
  const [isAutoStepping, setIsAutoStepping] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    if (!isAutoStepping || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveStation((prev) => {
        if (prev >= 3) {
          setIsAutoStepping(false);
          return 3;
        }
        return prev + 1;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [isAutoStepping, reducedMotion]);

  const stations = useMemo(
    () => [
      {
        num: "01",
        title: s.station1Title,
        desc: s.station1Desc,
        detail: s.station1Detail,
        icon: Users,
      },
      {
        num: "02",
        title: s.station2Title,
        desc: s.station2Desc,
        detail: s.station2Detail,
        icon: BookOpen,
      },
      {
        num: "03",
        title: s.station3Title,
        desc: s.station3Desc,
        detail: s.station3Detail,
        icon: Hammer,
      },
      {
        num: "04",
        title: s.station4Title,
        desc: s.station4Desc,
        detail: s.station4Detail,
        icon: Share2,
      },
    ],
    [s],
  );

  const tracks = useMemo(
    () => [
      { id: "GEN-01", title: s.track1Title, desc: s.track1Desc },
      { id: "GEN-02", title: s.track2Title, desc: s.track2Desc },
      { id: "GEN-03", title: s.track3Title, desc: s.track3Desc },
    ],
    [s],
  );

  const currentStation = stations[activeStation];
  const StationIcon = currentStation.icon;

  return (
    <div
      className="flex h-full flex-col gap-4 rounded-2xl border bg-gradient-to-br from-[#23190D] via-[#14100B] to-[#0D0A06] p-4 text-[#ECF4F6] md:p-5"
      style={{
        borderColor: theme.border,
      }}
    >
      {/* Dual golden-amber studio imagery header */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-[#E5A952]/30 bg-[#1B140C] md:col-span-2">
          <picture className="pointer-events-none absolute inset-0">
            <source media="(max-width: 640px)" srcSet={portal.mobilePosterSrc} />
            <img
              src={portal.posterSrc}
              alt={copy.name}
              loading="eager"
              decoding="sync"
              className="h-full w-full object-cover object-center"
            />
          </picture>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14100B] via-[#14100B]/40 to-transparent"
          />
          <div className="relative z-10 flex min-h-[11rem] flex-col justify-between gap-4 p-4 sm:min-h-[12rem]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <MaturityBadge
                  status={portal.maturity}
                  label={dict.maturityLabels[portal.maturity]}
                  size="sm"
                />
                <span className="rounded-full border border-[#E5A952]/40 bg-[#1B140C]/85 px-2.5 py-0.5 font-mono text-[11px] text-[#FCD34D]">
                  {s.communityBadge}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {!reducedMotion ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStation(0);
                      setIsAutoStepping(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E5A952]/50 bg-[#1B140C]/90 px-3 py-1 text-xs font-medium text-[#FDE68A] hover:border-[#F59E0B]"
                  >
                    <Play className="h-3 w-3" aria-hidden="true" />
                    <span>{localCopy.playJourney}</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoStepping(false);
                    setActiveStation(0);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200/20 bg-[#1B140C]/85 px-2.5 py-1 text-xs text-[#CBD5E1] hover:text-[#ECF4F6]"
                  aria-label={dict.portalsSection.replayScene}
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-[#FDE68A] sm:text-xl">
                {s.motto}
              </p>
            </div>
          </div>
        </div>

        {/* Secondary warm learner visual */}
        <div className="relative flex min-h-[11rem] items-end overflow-hidden rounded-xl border border-[#E5A952]/25 bg-[#1B140C] sm:min-h-[12rem]">
          <Image
            src="/v2/scenes/club-learner.webp"
            alt={localCopy.learnerCaption}
            fill
            unoptimized
            preload
            loading="eager"
            decoding="sync"
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14100B] via-transparent to-transparent"
          />
          <div className="relative z-10 w-full p-3">
            <p className="text-xs font-medium text-[#FDE68A]">{localCopy.learnerCaption}</p>
          </div>
        </div>
      </div>

      {/* 4-Station Community Journey */}
      <div className="rounded-xl border border-[#E5A952]/20 bg-[#1A140D]/90 p-3.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stations.map((station, idx) => {
            const Icon = station.icon;
            const active = idx === activeStation;
            return (
              <button
                key={station.num}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setIsAutoStepping(false);
                  setActiveStation(idx);
                }}
                className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-[#E5A952] bg-[#2B2012] text-[#ECF4F6]"
                    : "border-[#E5A952]/15 bg-[#120E09] text-[#CBD5E1] hover:border-[#E5A952]/45"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-mono text-[10px] text-[#F59E0B]">
                    {localCopy.stationPrefix} {station.num}
                  </span>
                  <Icon
                    className={`h-4 w-4 ${active ? "text-[#FCD34D]" : "text-[#CDA66C]"}`}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-semibold text-[#ECF4F6]">{station.title}</span>
                <span className="line-clamp-2 text-xs leading-relaxed text-[#CBD5E1]">
                  {station.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#E5A952]/30 bg-[#120E09]/90 p-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5A952]/40 bg-[#2B2012] text-[#FCD34D]">
            <StationIcon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#FDE68A]">
              {currentStation.num} · {currentStation.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#ECF4F6]">{currentStation.detail}</p>
          </div>
        </div>
      </div>

      {/* Genesis Learning & Prototyping Tracks */}
      <div className="flex-1 rounded-xl border border-[#E5A952]/20 bg-[#1A140D]/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#FDE68A]">
              <Compass className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
              <span>{s.genesisTitle}</span>
            </h3>
            <p className="mt-0.5 text-xs text-[#CBD5E1]">{s.genesisLead}</p>
          </div>
          <span className="font-mono text-[10px] text-[#E5A952]">
            {localCopy.trackFocusLabel}: {tracks[activeTrack].id}
          </span>
        </div>

        <div className="mt-3 grid gap-2.5 md:grid-cols-3">
          {tracks.map((track, idx) => {
            const active = idx === activeTrack;
            return (
              <button
                key={track.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveTrack(idx)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-[#E5A952] bg-[#2B2012]"
                    : "border-[#E5A952]/15 bg-[#120E09] hover:border-[#E5A952]/40"
                }`}
              >
                <span className="font-mono text-[10px] text-[#F59E0B]">{track.id}</span>
                <p className="mt-1 text-xs font-semibold text-[#ECF4F6]">{track.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">{track.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5A952]/15 pt-3">
          <p className="text-[11px] text-[#CBD5E1]">{s.honestyNote}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${dict.locale}/programs-and-communities`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5A952] bg-[#2B2012] px-3.5 py-1.5 text-xs font-semibold text-[#FDE68A] transition-colors hover:bg-[#3A2B18]"
            >
              <span>{s.exploreCommunityCta}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href={`/${dict.locale}/projects`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5A952]/35 bg-[#120E09] px-3.5 py-1.5 text-xs font-medium text-[#ECF4F6] transition-colors hover:border-[#E5A952]"
            >
              <span>{s.discoverGenesisCta}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubAtlasScene;
