"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import { PORTAL_THEME_TOKENS } from "@/lib/v2/design-tokens";
import type {
  Locale,
  LocaleDictionary,
  PortalDefinition,
  PortalLocaleCopy,
} from "@/lib/v2/types";

export interface PortalSceneProps {
  copy: PortalLocaleCopy;
  dict: LocaleDictionary;
  portal: PortalDefinition;
}

type HqTab = "missions" | "agents" | "approvals" | "audit";
type ApprovalDecision = "pending" | "approved" | "revise";

const TAB_UI_STRINGS: Record<
  Locale,
  {
    scopeLabel: string;
    activeOutputLabel: string;
    decisionBannerLabel: string;
    missionOutputs: [string, string, string];
    agentScopes: [string, string, string, string];
    auditEvents: [string, string, string, string];
    auditApprovedEvent: string;
    auditReviseEvent: string;
    actorHuman: string;
    actorNex: string;
    actorSpecialists: string;
  }
> = {
  pt: {
    scopeLabel: "Âmbito autorizado",
    activeOutputLabel: "Artefacto sintético em preparação",
    decisionBannerLabel: "Estado do portão humano",
    missionOutputs: [
      "Pacote editorial multi-idioma (PT/EN/FR/ES) com 4 fontes validadas — a aguardar aprovação humana.",
      "Resumo de 2 divergências de prazo em fornecedores com proposta de resposta para validação.",
      "Triagem de pedidos classificados por prioridade; casos sensíveis encaminhados para supervisão.",
    ],
    agentScopes: [
      "Coordenação HQ · Zero escrita externa",
      "Leitura apenas de documentos aprovados",
      "Rascunhos estruturados PT/EN/FR/ES",
      "Bloqueio preventivo de ações sem revisão",
    ],
    auditEvents: [
      "Missão iniciada por responsável humano com limites explícitos",
      "NeX repartiu o contexto em 3 frentes isoladas",
      "Especialistas concluíram síntese sobre fontes autorizadas",
      "Artefacto submetido ao portão de aprovação humana",
    ],
    auditApprovedEvent: "Decisão humana: artefacto aprovado em modo simulação",
    auditReviseEvent: "Decisão humana: artefacto devolvido para revisão editorial",
    actorHuman: "Responsável Humana",
    actorNex: "NeX · Coordenador",
    actorSpecialists: "Especialistas HQ",
  },
  en: {
    scopeLabel: "Authorized scope",
    activeOutputLabel: "Synthetic artifact in preparation",
    decisionBannerLabel: "Human gate status",
    missionOutputs: [
      "Multilingual release outline (PT/EN/FR/ES) citing 4 approved sources — awaiting human approval.",
      "Summary of 2 supplier schedule discrepancies with draft response queued for operations review.",
      "Categorized support triage queue; sensitive requests routed directly to human leads.",
    ],
    agentScopes: [
      "HQ orchestration · Zero external write access",
      "Read-only access to approved mission docs",
      "Structured multi-language draft preparation",
      "Preventive block on unapproved external actions",
    ],
    auditEvents: [
      "Mission created by human lead with explicit scope boundaries",
      "NeX decomposed mission into 3 isolated workstreams",
      "Specialists compiled synthesis from authorized sources",
      "Artifact placed in the Human Approval Gate queue",
    ],
    auditApprovedEvent: "Human decision: artifact approved (simulated log)",
    auditReviseEvent: "Human decision: artifact returned for editorial revision",
    actorHuman: "Human Reviewer",
    actorNex: "NeX · Coordinator",
    actorSpecialists: "HQ Specialists",
  },
  fr: {
    scopeLabel: "Périmètre autorisé",
    activeOutputLabel: "Livrable synthétique en préparation",
    decisionBannerLabel: "État du portail humain",
    missionOutputs: [
      "Plan de communication multilingue (PT/EN/FR/ES) avec 4 sources validées — en attente d'approbation.",
      "Synthèse de 2 écarts fournisseurs avec proposition de réponse soumise à l'équipe.",
      "File de tri classée par priorité ; dossiers sensibles orientés vers les responsables humains.",
    ],
    agentScopes: [
      "Orchestration HQ · Aucune écriture externe",
      "Lecture seule sur documents autorisés",
      "Préparation de brouillons PT/EN/FR/ES",
      "Blocage préventif sans validation humaine",
    ],
    auditEvents: [
      "Mission ouverte par un responsable humain avec limites explicites",
      "NeX a réparti le contexte en 3 fils isolés",
      "Les spécialistes ont compilé les sources autorisées",
      "Livrable déposé au portail d'approbation humaine",
    ],
    auditApprovedEvent: "Décision humaine : livrable approuvé (journal simulé)",
    auditReviseEvent: "Décision humaine : livrable renvoyé pour révision",
    actorHuman: "Responsable humaine",
    actorNex: "NeX · Coordinateur",
    actorSpecialists: "Spécialistes HQ",
  },
  es: {
    scopeLabel: "Ámbito autorizado",
    activeOutputLabel: "Artefacto sintético en preparación",
    decisionBannerLabel: "Estado de la compuerta humana",
    missionOutputs: [
      "Plan editorial multilingüe (PT/EN/FR/ES) con 4 fuentes validadas — pendiente de aprobación humana.",
      "Resumen de 2 desviaciones de entrega de proveedores listo para revisión operativa.",
      "Cola clasificada de solicitudes; los casos sensibles se escalan a responsables humanos.",
    ],
    agentScopes: [
      "Orquestación HQ · Cero escritura externa",
      "Lectura exclusiva de documentos autorizados",
      "Redacción estructurada en PT/EN/FR/ES",
      "Bloqueo preventivo ante falta de revisión humana",
    ],
    auditEvents: [
      "Misión iniciada por responsable humano con límites explícitos",
      "NeX dividió el contexto en 3 hilos aislados",
      "Especialistas completaron la síntesis sobre fuentes aprobadas",
      "Artefacto enviado a la compuerta de aprobación humana",
    ],
    auditApprovedEvent: "Decisión humana: artefacto aprobado (registro simulado)",
    auditReviseEvent: "Decisión humana: artefacto devuelto para revisión",
    actorHuman: "Responsable humana",
    actorNex: "NeX · Coordinador",
    actorSpecialists: "Especialistas HQ",
  },
};

export function AtlasHqScene({ copy, dict, portal }: PortalSceneProps) {
  const { reducedMotion } = useAtlasMotion();
  const s = copy.sceneLabels;
  const localCopy = TAB_UI_STRINGS[dict.locale];
  const theme = PORTAL_THEME_TOKENS.atlashq;

  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [timelineCompleted, setTimelineCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<HqTab>("missions");
  const [selectedMission, setSelectedMission] = useState(0);
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>("pending");

  const effectivePlaying = isPlaying && !reducedMotion;

  useEffect(() => {
    if (!effectivePlaying) return;
    const timer = window.setInterval(() => {
      setActivePhase((prev) => {
        if (prev >= 4) {
          setIsPlaying(false);
          setTimelineCompleted(true);
          return 4;
        }
        return prev + 1;
      });
    }, 1900);
    return () => window.clearInterval(timer);
  }, [effectivePlaying]);

  const phases = useMemo(
    () => [
      {
        num: "01",
        title: s.phase1Title,
        actor: s.phase1Actor,
        detail: s.phase1Detail,
        icon: UserCheck,
      },
      {
        num: "02",
        title: s.phase2Title,
        actor: s.phase2Actor,
        detail: s.phase2Detail,
        icon: Layers,
      },
      {
        num: "03",
        title: s.phase3Title,
        actor: s.phase3Actor,
        detail: s.phase3Detail,
        icon: Bot,
      },
      {
        num: "04",
        title: s.phase4Title,
        actor: s.phase4Actor,
        detail: s.phase4Detail,
        icon: FileText,
      },
      {
        num: "05",
        title: s.phase5Title,
        actor: s.phase5Actor,
        detail: s.phase5Detail,
        icon: ShieldCheck,
      },
    ],
    [s],
  );

  const missions = useMemo(
    () => [
      {
        id: "HQ-M-101",
        title: s.mission1Title,
        desc: s.mission1Desc,
        output: localCopy.missionOutputs[0],
      },
      {
        id: "HQ-M-102",
        title: s.mission2Title,
        desc: s.mission2Desc,
        output: localCopy.missionOutputs[1],
      },
      {
        id: "HQ-M-103",
        title: s.mission3Title,
        desc: s.mission3Desc,
        output: localCopy.missionOutputs[2],
      },
    ],
    [localCopy.missionOutputs, s],
  );

  const agents = useMemo(
    () => [
      {
        id: "nex",
        name: s.agentNexName,
        role: s.agentNexRole,
        scope: localCopy.agentScopes[0],
        isCoordinator: true,
      },
      {
        id: "research",
        name: s.agentResearchName,
        role: s.agentResearchRole,
        scope: localCopy.agentScopes[1],
        isCoordinator: false,
      },
      {
        id: "content",
        name: s.agentContentName,
        role: s.agentContentRole,
        scope: localCopy.agentScopes[2],
        isCoordinator: false,
      },
      {
        id: "compliance",
        name: s.agentComplianceName,
        role: s.agentComplianceRole,
        scope: localCopy.agentScopes[3],
        isCoordinator: false,
      },
    ],
    [localCopy.agentScopes, s],
  );

  const auditEntries = useMemo(() => {
    const base = [
      { id: "EVT-01", actor: localCopy.actorHuman, note: localCopy.auditEvents[0] },
      { id: "EVT-02", actor: localCopy.actorNex, note: localCopy.auditEvents[1] },
      { id: "EVT-03", actor: localCopy.actorSpecialists, note: localCopy.auditEvents[2] },
      { id: "EVT-04", actor: localCopy.actorNex, note: localCopy.auditEvents[3] },
    ];
    if (approvalDecision === "approved") {
      base.push({
        id: "EVT-05",
        actor: localCopy.actorHuman,
        note: localCopy.auditApprovedEvent,
      });
    } else if (approvalDecision === "revise") {
      base.push({
        id: "EVT-05",
        actor: localCopy.actorHuman,
        note: localCopy.auditReviseEvent,
      });
    }
    return base;
  }, [approvalDecision, localCopy]);

  const handleReplay = () => {
    setActivePhase(0);
    setTimelineCompleted(false);
    setIsPlaying(!reducedMotion);
  };

  const currentMission = missions[selectedMission];
  const currentPhase = phases[activePhase];
  const PhaseIcon = currentPhase.icon;

  return (
    <div
      className="flex h-full flex-col gap-4 rounded-2xl border bg-[#0A1118]/95 p-4 text-[#ECF4F6] md:p-5"
      style={{ borderColor: theme.border }}
    >
      {/* Architectural header banner with real office backdrop */}
      <div className="relative overflow-hidden rounded-xl border border-slate-400/20 bg-[#0E151D]">
        <picture className="pointer-events-none absolute inset-0">
          <source media="(max-width: 640px)" srcSet={portal.mobilePosterSrc} />
          <img
            src={portal.posterSrc}
            alt={copy.name}
            loading="eager"
            decoding="sync"
            className="h-full w-full object-cover object-center opacity-55"
          />
        </picture>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#080D12]/95 via-[#080D12]/75 to-[#080D12]/45"
        />
        <div className="relative z-10 flex min-h-[9.5rem] flex-col justify-between gap-4 p-4 sm:min-h-[10rem]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <MaturityBadge
                status={portal.maturity}
                label={dict.maturityLabels[portal.maturity]}
                size="sm"
              />
              <span className="rounded-full border border-[#36BDD0]/35 bg-[#080D12]/80 px-2.5 py-0.5 font-mono text-[11px] text-[#67E8F9]">
                {s.sandboxBadge}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {!reducedMotion ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activePhase >= 4 && !effectivePlaying) {
                      handleReplay();
                    } else {
                      setIsPlaying((prev) => !prev);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#36BDD0]/45 bg-[#080D12]/85 px-3 py-1 text-xs font-medium text-[#ECF4F6] transition-colors hover:border-[#2DD4BF]"
                >
                  {effectivePlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-[#36BDD0]" aria-hidden="true" />
                      <span>{s.pauseTimeline}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-[#2DD4BF]" aria-hidden="true" />
                      <span>{s.playTimeline}</span>
                    </>
                  )}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/30 bg-[#080D12]/85 px-3 py-1 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#CDA66C] hover:text-[#ECF4F6]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{dict.portalsSection.replayScene}</span>
              </button>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#67E8F9]">
              {s.stepPrefix} {currentPhase.num} / 05 · {currentPhase.actor}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#ECF4F6] sm:text-base">
              {currentPhase.title}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Phase Interactive Mission Timeline */}
      <div className="rounded-xl border border-slate-400/15 bg-[#0E151D]/90 p-3.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label={copy.chapterTitle}>
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            const isActive = idx === activePhase;
            const isPast = idx < activePhase;
            return (
              <button
                key={phase.num}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setActivePhase(idx);
                }}
                aria-current={isActive ? "step" : undefined}
                className={`flex flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  isActive
                    ? "border-[#36BDD0] bg-[#132630] text-[#ECF4F6]"
                    : isPast
                      ? "border-[#2DD4BF]/35 bg-[#0E1C22] text-[#CBD5E1]"
                      : "border-slate-400/15 bg-[#0B1117] text-[#94A8B8] hover:border-slate-400/35"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-mono text-[10px] text-[#67E8F9]">{phase.num}</span>
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive ? "text-[#2DD4BF]" : isPast ? "text-[#36BDD0]" : "text-[#94A8B8]"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <span className="line-clamp-2 text-xs font-medium leading-snug">{phase.title}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#36BDD0]/25 bg-[#080D12]/80 p-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#36BDD0]/35 bg-[#0E2129] text-[#2DD4BF]">
            <PhaseIcon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#ECF4F6]">
                {currentPhase.title} — {currentPhase.actor}
              </span>
              {timelineCompleted ? (
                <span className="font-mono text-[10px] text-[#2DD4BF]">
                  {dict.portalsSection.sceneComplete}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">{currentPhase.detail}</p>
          </div>
        </div>
      </div>

      {/* Interactive Workspace Tabs */}
      <div className="flex flex-1 flex-col rounded-xl border border-slate-400/15 bg-[#0E151D]/90 p-3.5">
        <div
          role="tablist"
          aria-label={copy.name}
          className="flex flex-wrap gap-1.5 border-b border-slate-400/15 pb-3"
        >
          {(
            [
              ["missions", s.tabMissions],
              ["agents", s.tabAgents],
              ["approvals", s.tabApprovals],
              ["audit", s.tabAudit],
            ] as const
          ).map(([tabKey, tabLabel]) => {
            const selected = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tabKey)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-[#36BDD0] bg-[#132630] text-[#ECF4F6]"
                    : "border-slate-400/15 bg-[#080D12]/70 text-[#94A8B8] hover:border-slate-400/35 hover:text-[#ECF4F6]"
                }`}
              >
                {tabLabel}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex-1">
          {activeTab === "missions" ? (
            <div className="space-y-3" role="tabpanel">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#94A8B8]">
                {s.missionSelectLabel}
              </p>
              <div className="grid gap-2 md:grid-cols-3">
                {missions.map((mission, idx) => {
                  const active = idx === selectedMission;
                  return (
                    <button
                      key={mission.id}
                      type="button"
                      onClick={() => {
                        setSelectedMission(idx);
                        setApprovalDecision("pending");
                      }}
                      className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                        active
                          ? "border-[#36BDD0] bg-[#11242D]"
                          : "border-slate-400/15 bg-[#080D12]/70 hover:border-slate-400/35"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-[#67E8F9]">{mission.id}</span>
                      <span className="mt-1 text-xs font-semibold text-[#ECF4F6]">
                        {mission.title}
                      </span>
                      <span className="mt-1 text-xs leading-relaxed text-[#94A8B8]">
                        {mission.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-lg border border-[#2DD4BF]/25 bg-[#080D12]/80 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#2DD4BF]">
                  {localCopy.activeOutputLabel} · {currentMission.id}
                </p>
                <p className="mt-1 text-xs text-[#ECF4F6]">{currentMission.output}</p>
              </div>
            </div>
          ) : null}

          {activeTab === "agents" ? (
            <div className="grid gap-2.5 sm:grid-cols-2" role="tabpanel">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`rounded-lg border p-3 ${
                    agent.isCoordinator
                      ? "border-[#36BDD0]/45 bg-[#10222B]"
                      : "border-slate-400/15 bg-[#080D12]/75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#ECF4F6]">{agent.name}</span>
                    <span className="rounded-full border border-[#36BDD0]/30 bg-[#0E151D] px-2 py-0.5 font-mono text-[10px] text-[#67E8F9]">
                      {portal.maturity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">{agent.role}</p>
                  <p className="mt-2 font-mono text-[10px] text-[#94A8B8]">
                    {localCopy.scopeLabel}: {agent.scope}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "approvals" ? (
            <div className="space-y-3" role="tabpanel">
              <div className="rounded-lg border border-[#CDA66C]/35 bg-[#121922] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#E5C287]">
                    {localCopy.decisionBannerLabel} · {currentMission.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${
                      approvalDecision === "approved"
                        ? "border-emerald-400/45 bg-emerald-950/70 text-emerald-200"
                        : approvalDecision === "revise"
                          ? "border-amber-400/45 bg-amber-950/70 text-amber-200"
                          : "border-cyan-400/35 bg-cyan-950/60 text-cyan-100"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {approvalDecision === "approved"
                        ? s.approvedStatus
                        : approvalDecision === "revise"
                          ? s.reviseStatus
                          : s.pendingStatus}
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#ECF4F6]">
                  {s.approvalPrompt}
                </p>
                <p className="mt-1.5 text-xs text-[#94A8B8]">{currentMission.output}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalDecision("approved");
                      setActivePhase(4);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#2DD4BF] bg-[#103330] px-3.5 py-1.5 text-xs font-semibold text-[#ECF4F6] transition-colors hover:bg-[#154541]"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#2DD4BF]" aria-hidden="true" />
                    <span>{s.approveBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalDecision("revise");
                      setActivePhase(4);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C]/60 bg-[#231B11] px-3.5 py-1.5 text-xs font-semibold text-[#F3DFB8] transition-colors hover:border-[#E5C287]"
                  >
                    <span>{s.reviseBtn}</span>
                  </button>
                  {approvalDecision !== "pending" ? (
                    <button
                      type="button"
                      onClick={() => setApprovalDecision("pending")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/30 bg-[#080D12] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-slate-300"
                    >
                      <span>{s.resetApprovalBtn}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "audit" ? (
            <div className="space-y-2.5" role="tabpanel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#67E8F9]">
                  {s.auditHeader} · {currentMission.id}
                </p>
              </div>
              <ul className="space-y-2">
                {auditEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-400/15 bg-[#080D12]/80 px-3 py-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[10px] text-[#2DD4BF]">{entry.id}</span>
                      <span className="text-[#ECF4F6]">{entry.note}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-[#94A8B8]">
                      {entry.actor}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#94A8B8]">{s.auditNote}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AtlasHqScene;
