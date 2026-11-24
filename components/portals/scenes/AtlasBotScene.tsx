"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Monitor, Play, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import { PORTAL_THEME_TOKENS } from "@/lib/v2/design-tokens";
import { ATLASBOT_MASCOTS, type AtlasBotMascotAsset } from "@/lib/v2/portal-data";
import type { Locale, LocaleDictionary, PortalDefinition, PortalLocaleCopy } from "@/lib/v2/types";

export interface AtlasBotSceneProps {
  copy: PortalLocaleCopy;
  dict: LocaleDictionary;
  portal: PortalDefinition;
}

type BotMode = "personal" | "family" | "teams";

const BOT_LOCAL_STRINGS: Record<
  Locale,
  {
    simulateBtn: string;
    resetBtn: string;
    activeStageLabel: string;
    modeContextNotes: Record<BotMode, string>;
    workflowLeadMascots: [
      AtlasBotMascotAsset["id"][],
      AtlasBotMascotAsset["id"][],
      AtlasBotMascotAsset["id"][],
    ];
    stageSteps: [string, string, string];
  }
> = {
  pt: {
    simulateBtn: "Simular fluxo",
    resetBtn: "Repor",
    activeStageLabel: "Resultado simulado para revisão",
    modeContextNotes: {
      personal: "Contexto individual · Sem acesso a contas pessoais reais",
      family: "Contexto familiar · Organização partilhada e confirmação manual",
      teams: "Contexto de equipas · Rascunhos estruturados antes de partilhar",
    },
    workflowLeadMascots: [
      ["guide", "flow", "shield"],
      ["guide", "analyst", "builder"],
      ["guide", "creator", "shield"],
    ],
    stageSteps: [
      "1. Guide clarifica o objetivo",
      "2. Companheiros repartem a preparação",
      "3. Utilizador confirma antes de agir",
    ],
  },
  en: {
    simulateBtn: "Run simulation",
    resetBtn: "Reset",
    activeStageLabel: "Simulated output for review",
    modeContextNotes: {
      personal: "Personal context · Zero access to real personal accounts",
      family: "Family context · Shared planning with manual confirmation",
      teams: "Teams context · Structured drafts prior to sharing",
    },
    workflowLeadMascots: [
      ["guide", "flow", "shield"],
      ["guide", "analyst", "builder"],
      ["guide", "creator", "shield"],
    ],
    stageSteps: [
      "1. Guide clarifies goal",
      "2. Companions split preparation",
      "3. User confirms before any action",
    ],
  },
  fr: {
    simulateBtn: "Simuler le flux",
    resetBtn: "Réinitialiser",
    activeStageLabel: "Résultat simulé pour relecture",
    modeContextNotes: {
      personal: "Contexte personnel · Aucun accès aux comptes personnels réels",
      family: "Contexte familial · Organisation partagée et validation manuelle",
      teams: "Contexte d'équipe · Brouillons structurés avant partage",
    },
    workflowLeadMascots: [
      ["guide", "flow", "shield"],
      ["guide", "analyst", "builder"],
      ["guide", "creator", "shield"],
    ],
    stageSteps: [
      "1. Guide clarifie l'objectif",
      "2. Les compagnons répartissent la tâche",
      "3. L'utilisateur confirme avant d'agir",
    ],
  },
  es: {
    simulateBtn: "Simular flujo",
    resetBtn: "Reiniciar",
    activeStageLabel: "Resultado simulado para revisión",
    modeContextNotes: {
      personal: "Contexto personal · Sin acceso a cuentas personales reales",
      family: "Contexto familiar · Organización compartida con confirmación manual",
      teams: "Contexto de equipos · Borradores estructurados antes de compartir",
    },
    workflowLeadMascots: [
      ["guide", "flow", "shield"],
      ["guide", "analyst", "builder"],
      ["guide", "creator", "shield"],
    ],
    stageSteps: [
      "1. Guide aclara el objetivo",
      "2. Los compañeros reparten la tarea",
      "3. El usuario confirma antes de actuar",
    ],
  },
};

export function AtlasBotScene({ copy, dict, portal }: AtlasBotSceneProps) {
  const { reducedMotion } = useAtlasMotion();
  const s = copy.sceneLabels;
  const localCopy = BOT_LOCAL_STRINGS[dict.locale];
  const theme = PORTAL_THEME_TOKENS.atlasbot;

  const [mode, setMode] = useState<BotMode>("personal");
  const [selectedWorkflow, setSelectedWorkflow] = useState(0);
  const [simStep, setSimStep] = useState(2);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedMascotId, setSelectedMascotId] = useState<AtlasBotMascotAsset["id"]>("guide");

  useEffect(() => {
    if (!isSimulating || reducedMotion) return;
    const timer = window.setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 2) {
          setIsSimulating(false);
          return 2;
        }
        return prev + 1;
      });
    }, 1100);
    return () => window.clearInterval(timer);
  }, [isSimulating, reducedMotion]);

  const workflows = useMemo(
    () => [
      {
        id: "trip",
        title: s.workflow1Title,
        desc: s.workflow1Desc,
        output: s.workflow1Output,
        squad: localCopy.workflowLeadMascots[0],
      },
      {
        id: "project",
        title: s.workflow2Title,
        desc: s.workflow2Desc,
        output: s.workflow2Output,
        squad: localCopy.workflowLeadMascots[1],
      },
      {
        id: "content",
        title: s.workflow3Title,
        desc: s.workflow3Desc,
        output: s.workflow3Output,
        squad: localCopy.workflowLeadMascots[2],
      },
    ],
    [localCopy.workflowLeadMascots, s],
  );

  const activeWorkflow = workflows[selectedWorkflow];
  const activeMascot =
    ATLASBOT_MASCOTS.find((m) => m.id === selectedMascotId) ?? ATLASBOT_MASCOTS[0];

  const handleRunSimulation = () => {
    if (reducedMotion) {
      setSimStep(2);
      return;
    }
    setSimStep(0);
    setIsSimulating(true);
  };

  return (
    <div
      className="flex h-full flex-col gap-4 rounded-2xl border bg-[#090F1D]/95 p-4 text-[#ECF4F6] md:p-5"
      style={{ borderColor: theme.border }}
    >
      {/* Volumetric stage header with backdrop + featured Guide/active companion spotlight */}
      <div className="relative overflow-hidden rounded-xl border border-[#22D3EE]/30 bg-[#070C18]">
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070C18] via-[#070C18]/45 to-transparent"
        />

        <div className="relative z-10 flex min-h-[13rem] flex-col justify-between gap-4 p-4 sm:min-h-[14rem]">
          {/* Top bar: maturity + mode toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MaturityBadge
              status={portal.maturity}
              label={dict.maturityLabels[portal.maturity]}
              size="sm"
            />
            <div
              role="group"
              aria-label={s.modeLabel}
              className="inline-flex rounded-full border border-[#22D3EE]/35 bg-[#080D12]/92 p-0.5"
            >
              {(
                [
                  ["personal", s.modePersonal],
                  ["family", s.modeFamily],
                  ["teams", s.modeTeams],
                ] as const
              ).map(([modeKey, modeText]) => (
                <button
                  key={modeKey}
                  type="button"
                  aria-pressed={mode === modeKey}
                  onClick={() => setMode(modeKey)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    mode === modeKey
                      ? "bg-[#22D3EE] text-[#080D12]"
                      : "text-[#CBD5E1] hover:text-[#ECF4F6]"
                  }`}
                >
                  {modeText}
                </button>
              ))}
            </div>
          </div>

          {/* Center spotlight: active mascot framed over volumetric glow */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-[radial-gradient(circle_at_center,#172B49,#090F1E)] p-1 shadow-lg sm:h-24 sm:w-24 ${
                !reducedMotion ? "transition-transform duration-300" : ""
              }`}
              style={{
                borderColor: activeMascot.accentHex,
                boxShadow: `0 0 28px -4px ${activeMascot.accentHex}`,
              }}
            >
              <Image
                src={activeMascot.imageSrc}
                alt={s[activeMascot.nameKey]}
                width={96}
                height={96}
                unoptimized
                preload
                loading="eager"
                decoding="sync"
                className="h-full w-full rounded-xl object-contain"
              />
            </div>

            <div className="min-w-0 flex-1 rounded-xl border border-[#22D3EE]/25 bg-[#080D12]/92 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#ECF4F6]">
                  {s[activeMascot.nameKey]}
                </span>
                <span className="font-mono text-[10px] text-[#67E8F9]">
                  {localCopy.modeContextNotes[mode]}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                {s[activeMascot.roleKey]}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#A5F3FC]">
                {s[activeMascot.sampleKey]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable Companion Roster */}
      <div className="rounded-xl border border-slate-400/15 bg-[#0C1426]/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#67E8F9]">
            {s.rosterTitle}
          </h3>
          <span className="text-[11px] text-[#94A8B8]">{s.rosterHint}</span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ATLASBOT_MASCOTS.map((mascot) => {
            const isSelected = mascot.id === activeMascot.id;
            const inActiveSquad = activeWorkflow.squad.includes(mascot.id);
            return (
              <button
                key={mascot.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMascotId(mascot.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-colors ${
                  isSelected
                    ? "border-[#22D3EE] bg-[#13223F] text-[#ECF4F6]"
                    : inActiveSquad
                      ? "border-[#818CF8]/40 bg-[#0E1830] text-[#CBD5E1] hover:border-[#22D3EE]/70"
                      : "border-slate-400/15 bg-[#080F1E] text-[#94A8B8] hover:border-slate-400/35 hover:text-[#ECF4F6]"
                }`}
              >
                <div
                  className="h-12 w-12 overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_center,#172B49,#090F1E)] p-1"
                  style={{ borderColor: mascot.accentHex }}
                >
                  <Image
                    src={mascot.imageSrc}
                    alt={s[mascot.nameKey]}
                    width={48}
                    height={48}
                    unoptimized
                    preload
                    loading="eager"
                    decoding="sync"
                    className="h-full w-full rounded-lg object-contain"
                  />
                </div>
                <span className="text-xs font-medium">{s[mascot.nameKey]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Interactive Simulated Workflows */}
      <div className="flex-1 rounded-xl border border-slate-400/15 bg-[#0C1426]/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#818CF8]">
            {s.workflowLabel}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunSimulation}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/50 bg-[#0D2136] px-3 py-1 text-xs font-medium text-[#ECF4F6] hover:border-[#22D3EE]"
            >
              <Play className="h-3 w-3 text-[#22D3EE]" aria-hidden="true" />
              <span>{localCopy.simulateBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSimulating(false);
                setSimStep(2);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-400/25 bg-[#080F1E] px-2.5 py-1 text-xs text-[#94A8B8] hover:text-[#ECF4F6]"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>{localCopy.resetBtn}</span>
            </button>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
          {workflows.map((wf, idx) => {
            const active = idx === selectedWorkflow;
            return (
              <button
                key={wf.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedWorkflow(idx);
                  setSelectedMascotId(wf.squad[0]);
                  setSimStep(reducedMotion ? 2 : 0);
                  setIsSimulating(!reducedMotion);
                }}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  active
                    ? "border-[#22D3EE] bg-[#12223C]"
                    : "border-slate-400/15 bg-[#080F1E] hover:border-slate-400/35"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#ECF4F6]">{wf.title}</span>
                  <Sparkles
                    className={`h-3.5 w-3.5 ${active ? "text-[#22D3EE]" : "text-[#94A8B8]"}`}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A8B8]">{wf.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Step strip & Simulated Output Panel */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {localCopy.stageSteps.map((stepText, idx) => {
            const active = idx <= simStep;
            return (
              <div
                key={stepText}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                  active
                    ? "border-[#22D3EE]/45 bg-[#0E2438] text-[#ECF4F6]"
                    : "border-slate-400/15 bg-[#080F1E] text-[#94A8B8]"
                }`}
              >
                <CheckCircle2
                  className={`h-3.5 w-3.5 shrink-0 ${active ? "text-[#22D3EE]" : "text-slate-600"}`}
                  aria-hidden="true"
                />
                <span>{stepText}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg border border-[#818CF8]/35 bg-[#080F1E] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A5B4FC]">
            {localCopy.activeStageLabel} · {activeWorkflow.title}
          </p>
          <p className="mt-1 text-xs text-[#ECF4F6]">{activeWorkflow.output}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#67E8F9]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{s.humanReviewLabel}</span>
          </p>
        </div>
      </div>

      {/* Explicit Desktop Installer Notice (never links to unapproved binaries) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#818CF8]/30 bg-[#0E162B] px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-medium text-[#ECF4F6]">
          <Monitor className="h-4 w-4 text-[#818CF8]" aria-hidden="true" />
          <span>{s.installerLabel}</span>
        </div>
        <span className="font-mono text-[11px] text-[#C7D2FE]">{s.installerStatus}</span>
      </div>
    </div>
  );
}

export default AtlasBotScene;
