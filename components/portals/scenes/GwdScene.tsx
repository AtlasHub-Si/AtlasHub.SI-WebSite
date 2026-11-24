"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ExternalLink,
  Filter,
  Globe2,
  Landmark,
  Layers,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import { PORTAL_THEME_TOKENS } from "@/lib/v2/design-tokens";
import type {
  Locale,
  LocaleDictionary,
  MaturityStatus,
  PortalDefinition,
  PortalLocaleCopy,
} from "@/lib/v2/types";

export interface GwdSceneProps {
  copy: PortalLocaleCopy;
  dict: LocaleDictionary;
  portal: PortalDefinition;
}

type SphereKey = "governance" | "ventures" | "cortex";
type MaturityFilter = "ALL" | "PROPOSED" | "DEMO" | "VERIFIED";

interface GwdObservableItem {
  id: string;
  sphere: SphereKey;
  maturity: Extract<MaturityStatus, "PROPOSED" | "DEMO" | "VERIFIED">;
  title: Record<Locale, string>;
  note: Record<Locale, string>;
}

const GWD_ITEMS: GwdObservableItem[] = [
  {
    id: "gwd-gov-1",
    sphere: "governance",
    maturity: "VERIFIED",
    title: {
      pt: "Separação de marca e titularidade GoWorld.Digital",
      en: "Independent GoWorld.Digital brand and ownership boundary",
      fr: "Séparation de marque et propriété GoWorld.Digital",
      es: "Separación de marca y titularidad GoWorld.Digital",
    },
    note: {
      pt: "Identidade própria sem vínculo de subsidiária com a AtlasHub.SI.",
      en: "Distinct brand identity without subsidiary ties to AtlasHub.SI.",
      fr: "Identité distincte sans lien de filiale avec AtlasHub.SI.",
      es: "Identidad propia sin vínculo de filial con AtlasHub.SI.",
    },
  },
  {
    id: "gwd-gov-2",
    sphere: "governance",
    maturity: "DEMO",
    title: {
      pt: "Simulador de mandatos e limites humanos no Explorer",
      en: "Explorer mandate and human boundary simulator",
      fr: "Simulateur de mandats et limites humaines dans Explorer",
      es: "Simulador de mandatos y límites humanos en Explorer",
    },
    note: {
      pt: "Fluxo ilustrativo de aprovação prévia antes da execução.",
      en: "Illustrative pre-execution approval checkpoint workflow.",
      fr: "Flux illustratif d'approbation préalable à l'exécution.",
      es: "Flujo ilustrativo de aprobación previa a la ejecución.",
    },
  },
  {
    id: "gwd-gov-3",
    sphere: "governance",
    maturity: "PROPOSED",
    title: {
      pt: "Estatuto operacional de conselho multi-entidade",
      en: "Multi-entity operational steering charter",
      fr: "Charte opérationnelle de pilotage multi-entités",
      es: "Estatuto operativo de consejo multientidad",
    },
    note: {
      pt: "Proposta conceptual sujeita a validação jurídica por jurisdição.",
      en: "Conceptual proposal subject to jurisdiction-specific legal review.",
      fr: "Proposition conceptuelle soumise à validation juridique locale.",
      es: "Propuesta conceptual sujeta a validación jurídica por jurisdicción.",
    },
  },
  {
    id: "gwd-ven-1",
    sphere: "ventures",
    maturity: "DEMO",
    title: {
      pt: "Campus visual 3D no Explorer (explore.goworld.digital)",
      en: "3D visual campus in Explorer (explore.goworld.digital)",
      fr: "Campus visuel 3D dans Explorer (explore.goworld.digital)",
      es: "Campus visual 3D en Explorer (explore.goworld.digital)",
    },
    note: {
      pt: "Representação conceptual; não retrata instalações físicas nem sociedades constituídas.",
      en: "Conceptual rendering; does not depict physical buildings or incorporated firms.",
      fr: "Rendu conceptuel ; ne représente ni locaux physiques ni sociétés constituées.",
      es: "Representación conceptual; no retrata edificios físicos ni sociedades constituidas.",
    },
  },
  {
    id: "gwd-ven-2",
    sphere: "ventures",
    maturity: "PROPOSED",
    title: {
      pt: "Tese de incubação AI-Native orientada por evidência",
      en: "Evidence-gated AI-Native venture thesis",
      fr: "Thèse d'incubation AI-Native guidée par la preuve",
      es: "Tesis de incubación AI-Native orientada a evidencia",
    },
    note: {
      pt: "Modelo informativo sem oferta de participações nem promoção financeira.",
      en: "Informational blueprint without equity offers or financial promotions.",
      fr: "Modèle informatif sans offre de titres ni promotion financière.",
      es: "Modelo informativo sin oferta de participaciones ni promoción financiera.",
    },
  },
  {
    id: "gwd-ven-3",
    sphere: "ventures",
    maturity: "VERIFIED",
    title: {
      pt: "Destino web dedicado GWD publicado externamente",
      en: "Dedicated external GWD Explorer showcase",
      fr: "Vitrine externe dédiée GWD Explorer",
      es: "Escaparate externo dedicado de GWD Explorer",
    },
    note: {
      pt: "Acesso independente fora do domínio institucional atlashub.si.",
      en: "Operated externally outside the institutional atlashub.si domain.",
      fr: "Opéré en externe hors du domaine institutionnel atlashub.si.",
      es: "Operado externamente fuera del dominio institucional atlashub.si.",
    },
  },
  {
    id: "gwd-ctx-1",
    sphere: "cortex",
    maturity: "PROPOSED",
    title: {
      pt: "Repositório de teses e lições aprendidas sob domínio GWD",
      en: "GWD-owned thesis and lessons-learned memory layer",
      fr: "Couche mémoire de thèses et retours d'expérience propre à GWD",
      es: "Capa de memoria de tesis y aprendizajes bajo dominio GWD",
    },
    note: {
      pt: "Sem partilha nem federação automática com bases da AtlasHub.",
      en: "Zero automatic sharing or cross-federation with AtlasHub datasets.",
      fr: "Aucun partage ni fédération automatique avec les bases AtlasHub.",
      es: "Sin intercambio ni federación automática con bases de AtlasHub.",
    },
  },
  {
    id: "gwd-ctx-2",
    sphere: "cortex",
    maturity: "DEMO",
    title: {
      pt: "Rastreio simulado de sinal até evidência documentada",
      en: "Simulated signal-to-evidence trace",
      fr: "Traçage simulé du signal jusqu'à la preuve",
      es: "Trazabilidad simulada de señal hasta evidencia",
    },
    note: {
      pt: "Demonstra critérios de passagem entre etapas na interface piloto.",
      en: "Demonstrates stage-gate passage criteria inside the pilot interface.",
      fr: "Illustre les critères de passage d'étape dans l'interface pilote.",
      es: "Demuestra criterios de paso entre etapas en la interfaz piloto.",
    },
  },
];

const GWD_LOCAL_STRINGS: Record<
  Locale,
  {
    stepStages: string;
    emptyFilter: string;
    stageNotes: [string, string, string, string, string];
  }
> = {
  pt: {
    stepStages: "Simular ciclo",
    emptyFilter: "Nenhum item registado nesta esfera para o filtro selecionado.",
    stageNotes: [
      "Recolha de necessidade ou tendência observada com fonte inicial.",
      "Enquadramento da hipótese sem compromisso de capital ou execução.",
      "Mandato delimitado aprovado por decisores humanos da iniciativa.",
      "Execução acompanhada com fronteiras de risco e acesso definidas.",
      "Registo verificável dos resultados antes de decidir o passo seguinte.",
    ],
  },
  en: {
    stepStages: "Step cycle",
    emptyFilter: "No items registered in this sphere for the active filter.",
    stageNotes: [
      "Capture of an observed opportunity signal with source citation.",
      "Structured hypothesis framing without premature commitments.",
      "Bounded mandate reviewed and approved by human decision-makers.",
      "Supervised execution within explicit risk and access boundaries.",
      "Verifiable evidence logged prior to any further commitment.",
    ],
  },
  fr: {
    stepStages: "Parcourir le cycle",
    emptyFilter: "Aucun élément enregistré dans cette sphère pour ce filtre.",
    stageNotes: [
      "Collecte d'un signal d'opportunité avec référence source.",
      "Formulation structurée de l'hypothèse sans engagement prématuré.",
      "Mandat borné validé par les décideurs humains de l'initiative.",
      "Exécution supervisée dans des limites de risque et d'accès explicites.",
      "Consignation de preuves vérifiables avant toute étape suivante.",
    ],
  },
  es: {
    stepStages: "Simular ciclo",
    emptyFilter: "No hay elementos registrados en esta esfera para el filtro activo.",
    stageNotes: [
      "Captura de una señal de oportunidad con cita de origen.",
      "Formulación estructurada de hipótesis sin compromisos prematuros.",
      "Mandato acotado aprobado por responsables humanos de la iniciativa.",
      "Ejecución supervisada con límites explícitos de riesgo y acceso.",
      "Registro verificable de evidencia antes de decidir el siguiente paso.",
    ],
  },
};

export function GwdScene({ copy, dict, portal }: GwdSceneProps) {
  const { reducedMotion } = useAtlasMotion();
  const s = copy.sceneLabels;
  const localCopy = GWD_LOCAL_STRINGS[dict.locale];
  const theme = PORTAL_THEME_TOKENS.gwd;

  const [activeSphere, setActiveSphere] = useState<SphereKey>("governance");
  const [activeStage, setActiveStage] = useState(0);
  const [isStepping, setIsStepping] = useState(false);
  const [maturityFilter, setMaturityFilter] = useState<MaturityFilter>("ALL");

  useEffect(() => {
    if (!isStepping || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= 4) {
          setIsStepping(false);
          return 4;
        }
        return prev + 1;
      });
    }, 1450);
    return () => window.clearInterval(timer);
  }, [isStepping, reducedMotion]);

  const spheres = useMemo(
    () => [
      {
        key: "governance" as const,
        title: s.sphereGovernance,
        desc: s.sphereGovernanceDesc,
        icon: Landmark,
      },
      {
        key: "ventures" as const,
        title: s.sphereVentures,
        desc: s.sphereVenturesDesc,
        icon: Building2,
      },
      {
        key: "cortex" as const,
        title: s.sphereCortex,
        desc: s.sphereCortexDesc,
        icon: Layers,
      },
    ],
    [s],
  );

  const stages = useMemo(
    () => [
      s.stageSignal,
      s.stageHypothesis,
      s.stageMandate,
      s.stageExecution,
      s.stageEvidence,
    ],
    [s],
  );

  const filteredItems = useMemo(() => {
    return GWD_ITEMS.filter((item) => {
      if (item.sphere !== activeSphere) return false;
      if (maturityFilter !== "ALL" && item.maturity !== maturityFilter) return false;
      return true;
    });
  }, [activeSphere, maturityFilter]);

  return (
    <div
      className="flex h-full flex-col gap-4 rounded-2xl border bg-[#090E18]/95 p-4 text-[#ECF4F6] md:p-5"
      style={{ borderColor: theme.border }}
    >
      {/* Explicit Independent Entity Disclaimer Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#CDA66C]/45 bg-[#19150E] px-3.5 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[#F3DFB8]">
          <Globe2 className="h-4 w-4 shrink-0 text-[#CDA66C]" aria-hidden="true" />
          <span>{s.independenceBanner}</span>
        </div>
        <MaturityBadge
          status={portal.maturity}
          label={dict.maturityLabels[portal.maturity]}
          size="sm"
        />
      </div>

      {/* Waterfront Campus Backdrop + Diana Host Welcome */}
      <div className="relative overflow-hidden rounded-xl border border-[#CDA66C]/30 bg-[#070C14]">
        <picture className="pointer-events-none absolute inset-0">
          <source media="(max-width: 640px)" srcSet={portal.mobilePosterSrc} />
          <img
            src={portal.posterSrc}
            alt={copy.name}
            loading="eager"
            decoding="sync"
            className="h-full w-full object-cover object-center opacity-85"
          />
        </picture>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D16] via-[#080D16]/45 to-transparent"
        />
        <div className="relative z-10 flex min-h-[11rem] items-end p-4 sm:min-h-[12rem]">
          <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-3.5">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-[#CDA66C]/65 shadow-lg sm:h-24 sm:w-20">
              <Image
                src="/v2/diana-avatar.webp"
                alt={s.dianaRole}
                fill
                unoptimized
                preload
                loading="eager"
                decoding="sync"
                sizes="80px"
                className="object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-[#CDA66C]/30 bg-[#080D16]/94 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#E5C287]">
                {s.dianaRole}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#ECF4F6]">{s.dianaWelcome}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Sphere Switcher + Maturity Filter */}
      <div className="rounded-xl border border-slate-400/15 bg-[#0D1422]/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#E5C287]">
            {s.spheresTitle}
          </h3>

          {/* Maturity Filter (PROPOSED / DEMO / VERIFIED) */}
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label={s.filterLabel}>
            <Filter className="mr-1 h-3.5 w-3.5 text-[#94A8B8]" aria-hidden="true" />
            {(["ALL", "PROPOSED", "DEMO", "VERIFIED"] as const).map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                aria-pressed={maturityFilter === statusKey}
                onClick={() => setMaturityFilter(statusKey)}
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] transition-colors ${
                  maturityFilter === statusKey
                    ? "border-[#CDA66C] bg-[#241C10] text-[#F3DFB8]"
                    : "border-slate-400/20 bg-[#080D16] text-[#94A8B8] hover:text-[#ECF4F6]"
                }`}
              >
                {statusKey === "ALL" ? s.filterAll : dict.maturityLabels[statusKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
          {spheres.map((sphere) => {
            const Icon = sphere.icon;
            const active = sphere.key === activeSphere;
            return (
              <button
                key={sphere.key}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveSphere(sphere.key)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-[#CDA66C] bg-[#1D1812] text-[#ECF4F6]"
                    : "border-slate-400/15 bg-[#080D16] text-[#CBD5E1] hover:border-[#CDA66C]/45"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 ${active ? "text-[#E5C287]" : "text-[#3B82F6]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold">{sphere.title}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A8B8]">{sphere.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Filtered Observable Elements */}
        <div className="mt-3 space-y-2">
          {filteredItems.length === 0 ? (
            <p className="rounded-lg border border-slate-400/15 bg-[#080D16] px-3 py-2.5 text-xs text-[#94A8B8]">
              {localCopy.emptyFilter}
            </p>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-400/15 bg-[#080D16]/90 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#ECF4F6]">{item.title[dict.locale]}</p>
                  <p className="mt-0.5 text-xs text-[#94A8B8]">{item.note[dict.locale]}</p>
                </div>
                <MaturityBadge
                  status={item.maturity}
                  label={dict.maturityLabels[item.maturity]}
                  size="sm"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Opportunity-to-Mandate Stage Pipeline */}
      <div className="rounded-xl border border-slate-400/15 bg-[#0D1422]/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#60A5FA]">
            {s.pipelineTitle}
          </span>
          <div className="flex items-center gap-1.5">
            {!reducedMotion ? (
              <button
                type="button"
                onClick={() => {
                  setActiveStage(0);
                  setIsStepping(true);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[#3B82F6]/45 bg-[#0D192E] px-2.5 py-1 text-[11px] font-medium text-[#ECF4F6] hover:border-[#CDA66C]"
              >
                <Play className="h-3 w-3 text-[#CDA66C]" aria-hidden="true" />
                <span>{localCopy.stepStages}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setIsStepping(false);
                setActiveStage(0);
              }}
              aria-label={dict.portalsSection.replayScene}
              className="inline-flex items-center rounded-full border border-slate-400/25 bg-[#080D16] p-1.5 text-[#94A8B8] hover:text-[#ECF4F6]"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          {stages.map((stageLabel, idx) => {
            const active = idx === activeStage;
            return (
              <button
                key={stageLabel}
                type="button"
                aria-current={active ? "step" : undefined}
                onClick={() => {
                  setIsStepping(false);
                  setActiveStage(idx);
                }}
                className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                  active
                    ? "border-[#CDA66C] bg-[#201A11] font-semibold text-[#F3DFB8]"
                    : idx < activeStage
                      ? "border-[#3B82F6]/40 bg-[#0D192D] text-[#CBD5E1]"
                      : "border-slate-400/15 bg-[#080D16] text-[#94A8B8] hover:border-slate-400/35"
                }`}
              >
                <span className="block font-mono text-[10px] text-[#CDA66C]">0{idx + 1}</span>
                <span className="mt-0.5 block">{stageLabel}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-2.5 rounded-lg border border-slate-400/15 bg-[#080D16] px-3 py-2 text-xs text-[#CBD5E1]">
          {localCopy.stageNotes[activeStage]}
        </p>
      </div>

      {/* Disclaimer & Verified External Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#CDA66C]/30 bg-[#0D131F] px-3.5 py-2.5">
        <p className="flex max-w-xl items-start gap-2 text-[11px] leading-relaxed text-[#CBD5E1]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#CDA66C]" aria-hidden="true" />
          <span>{s.statusNote}</span>
        </p>
        {portal.externalUrl && portal.externalUrlVerified ? (
          <a
            href={portal.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C] bg-[#221A0E] px-4 py-1.5 text-xs font-semibold text-[#F3DFB8] transition-colors hover:bg-[#322614]"
          >
            <span>{s.externalCta}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default GwdScene;
