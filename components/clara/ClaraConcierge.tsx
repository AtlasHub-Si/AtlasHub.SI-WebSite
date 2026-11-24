"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  ExternalLink,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { MaturityBadge } from "@/components/brand/MaturityBadge";
import { useAtlasMotion } from "@/components/motion/MotionContext";
import { PORTALS } from "@/lib/v2/portal-data";
import type { Locale, LocaleDictionary } from "@/lib/v2/types";

export interface ClaraConciergeProps {
  dict: LocaleDictionary;
}

type ClaraPath = "menu" | "explore" | "diagnostic" | "consulting" | "human";

interface DiagnosticState {
  scenario: string;
  channel: string;
  systems: string;
  frequency: string;
  approach: string;
  model: string;
}

const DEFAULT_WHATSAPP_NUMBER = "5562991903462";
const DEFAULT_LEAD_ENDPOINT = "/api/lead";

const CLARA_UI_STRINGS: Record<
  Locale,
  {
    openPortalLabel: string;
    stepPrefix: string;
    nextQuestion: string;
    prevQuestion: string;
    viewRecommendation: string;
    proceedToContact: string;
    runDiagnosticCta: string;
    consultingHighlightTitle: string;
    recommendedTrackLabel: string;
    suggestedPortalLabel: string;
    readinessNoteLabel: string;
    validationNameOrContact: string;
    validationEmailFormat: string;
    validationPhoneFormat: string;
    validationWindowRequired: string;
    validationConsentRequired: string;
    optionalLabel: string;
    tracks: Record<
      "managed" | "build" | "cobuild" | "discovery",
      { title: string; summary: string; portalId: "atlashq" | "atlascortex" | "club-atlas" }
    >;
    readinessBySystems: Record<string, string>;
    whatsappTemplatePrefix: string;
  }
> = {
  pt: {
    openPortalLabel: "Explorar portal",
    stepPrefix: "Pergunta",
    nextQuestion: "Seguinte",
    prevQuestion: "Anterior",
    viewRecommendation: "Ver enquadramento sugerido",
    proceedToContact: "Avançar para envio humano",
    runDiagnosticCta: "Iniciar diagnóstico guiado (6 passos)",
    consultingHighlightTitle: "Modelos independentes de consultoria",
    recommendedTrackLabel: "Modelo sugerido",
    suggestedPortalLabel: "Portal de referência",
    readinessNoteLabel: "Pré-requisito de arranque",
    validationNameOrContact: "Indique o seu nome e um e-mail ou telefone válido.",
    validationEmailFormat: "O e-mail introduzido não tem um formato válido.",
    validationPhoneFormat: "O telefone deve começar com indicativo internacional (ex.: +351...).",
    validationWindowRequired: "Para agendar reunião, indique a sua janela horária preferida.",
    validationConsentRequired: "É obrigatório assinalar o consentimento explícito antes de enviar.",
    optionalLabel: "opcional",
    tracks: {
      managed: {
        title: "Missão Supervisionada AI Workforce",
        summary: "Capacidade operada com aprovação humana em cada compromisso e âmbito delimitado.",
        portalId: "atlashq",
      },
      build: {
        title: "Enterprise Transformation · Build & Transfer",
        summary: "Desenho, integração, documentação e transferência para a infraestrutura da sua organização.",
        portalId: "atlascortex",
      },
      cobuild: {
        title: "Co-Build & Enablement",
        summary: "Construção conjunta com as suas equipas e capacitação contínua em governação.",
        portalId: "club-atlas",
      },
      discovery: {
        title: "Diagnóstico Operacional Inicial",
        summary: "Mapeamento prévio de sistemas, fontes documentais e limites humanos antes da implementação.",
        portalId: "atlashq",
      },
    },
    readinessBySystems: {
      api: "Sistemas com API facilitam integração controlada e trilha de auditoria desde a primeira fase.",
      sheets: "Folhas de cálculo requerem normalização de esquema e regras explícitas de validação.",
      docs: "Documentos e PDFs beneficiam de estruturação de proveniência e permissões ao estilo AtlasCortex.",
      unknown: "Começamos por um diagnóstico breve para inventariar fontes, acessos e prioridades.",
    },
    whatsappTemplatePrefix: "Olá equipa AtlasHub.SI, gostaria de dar seguimento ao pedido",
  },
  en: {
    openPortalLabel: "Explore portal",
    stepPrefix: "Question",
    nextQuestion: "Next",
    prevQuestion: "Previous",
    viewRecommendation: "View suggested framing",
    proceedToContact: "Proceed to human routing",
    runDiagnosticCta: "Start guided diagnostic (6 steps)",
    consultingHighlightTitle: "Independent consulting models",
    recommendedTrackLabel: "Suggested track",
    suggestedPortalLabel: "Reference portal",
    readinessNoteLabel: "Starting readiness note",
    validationNameOrContact: "Please enter your name and at least one valid email or phone number.",
    validationEmailFormat: "Please enter a valid email address.",
    validationPhoneFormat: "Phone number must start with an international prefix (e.g. +44...).",
    validationWindowRequired: "Preferred time window is required when requesting a meeting.",
    validationConsentRequired: "Explicit consent must be checked before submitting.",
    optionalLabel: "optional",
    tracks: {
      managed: {
        title: "Supervised AI Workforce Pilot",
        summary: "Bounded operational capacity with mandatory human approval gates and audit trail.",
        portalId: "atlashq",
      },
      build: {
        title: "Enterprise Transformation · Build & Transfer",
        summary: "Architecture, integration, acceptance tests, and handover into your own environment.",
        portalId: "atlascortex",
      },
      cobuild: {
        title: "Co-Build & Enablement",
        summary: "Collaborative delivery alongside your team to establish permanent internal capability.",
        portalId: "club-atlas",
      },
      discovery: {
        title: "Initial Operational Discovery",
        summary: "Process, data source, and governance mapping prior to any production commitment.",
        portalId: "atlashq",
      },
    },
    readinessBySystems: {
      api: "Documented APIs support bounded integration and auditable execution from phase one.",
      sheets: "Spreadsheets benefit from schema validation and human review checkpoints.",
      docs: "Documents and PDFs align naturally with AtlasCortex provenance and access-policy structuring.",
      unknown: "We begin with a concise discovery session to map systems, permissions, and scope.",
    },
    whatsappTemplatePrefix: "Hello AtlasHub.SI team, I would like to follow up on inquiry",
  },
  fr: {
    openPortalLabel: "Explorer le portail",
    stepPrefix: "Question",
    nextQuestion: "Suivant",
    prevQuestion: "Précédent",
    viewRecommendation: "Voir le cadrage suggéré",
    proceedToContact: "Passer à l'envoi humain",
    runDiagnosticCta: "Lancer le diagnostic guidé (6 étapes)",
    consultingHighlightTitle: "Modèles de conseil indépendants",
    recommendedTrackLabel: "Approche suggérée",
    suggestedPortalLabel: "Portail de référence",
    readinessNoteLabel: "Prérequis de démarrage",
    validationNameOrContact: "Veuillez saisir votre nom ainsi qu'un e-mail ou téléphone valide.",
    validationEmailFormat: "Le format de l'adresse e-mail semble invalide.",
    validationPhoneFormat: "Le numéro doit commencer par un indicatif international (ex. : +33...).",
    validationWindowRequired: "Un créneau horaire préféré est requis pour planifier un rendez-vous.",
    validationConsentRequired: "Le consentement explicite doit être coché avant l'envoi.",
    optionalLabel: "optionnel",
    tracks: {
      managed: {
        title: "Mission Supervisée AI Workforce",
        summary: "Capacité opérée dans un périmètre borné avec validation humaine à chaque jalon critique.",
        portalId: "atlashq",
      },
      build: {
        title: "Enterprise Transformation · Build & Transfer",
        summary: "Conception, intégration, documentation et transfert complet dans votre environnement.",
        portalId: "atlascortex",
      },
      cobuild: {
        title: "Co-Build & Enablement",
        summary: "Réalisation conjointe avec vos équipes pour développer une autonomie interne durable.",
        portalId: "club-atlas",
      },
      discovery: {
        title: "Diagnostic Opérationnel Initial",
        summary: "Cartographie des flux, sources et limites humaines avant tout déploiement.",
        portalId: "atlashq",
      },
    },
    readinessBySystems: {
      api: "Des API documentées facilitent une intégration contrôlée et traçable dès le départ.",
      sheets: "Les tableurs nécessitent un schéma clair et des points de contrôle humains.",
      docs: "Les documents et PDF s'alignent avec l'architecture de provenance et de droits AtlasCortex.",
      unknown: "Nous commençons par un diagnostic ciblé pour recenser sources, droits et priorités.",
    },
    whatsappTemplatePrefix: "Bonjour l'équipe AtlasHub.SI, je souhaite donner suite à la demande",
  },
  es: {
    openPortalLabel: "Explorar portal",
    stepPrefix: "Pregunta",
    nextQuestion: "Siguiente",
    prevQuestion: "Anterior",
    viewRecommendation: "Ver encuadre sugerido",
    proceedToContact: "Pasar al envío humano",
    runDiagnosticCta: "Iniciar diagnóstico guiado (6 pasos)",
    consultingHighlightTitle: "Modelos independientes de consultoría",
    recommendedTrackLabel: "Modelo sugerido",
    suggestedPortalLabel: "Portal de referencia",
    readinessNoteLabel: "Nota de preparación",
    validationNameOrContact: "Indique su nombre y al menos un correo o teléfono válido.",
    validationEmailFormat: "El formato del correo electrónico no es válido.",
    validationPhoneFormat: "El teléfono debe incluir prefijo internacional (ej.: +34...).",
    validationWindowRequired: "Debe indicar una franja horaria preferida para solicitar reunión.",
    validationConsentRequired: "Es obligatorio marcar el consentimiento explícito antes de enviar.",
    optionalLabel: "opcional",
    tracks: {
      managed: {
        title: "Misión Supervisada AI Workforce",
        summary: "Capacidad acotada con aprobación humana en cada paso crítico y pista de auditoría.",
        portalId: "atlashq",
      },
      build: {
        title: "Enterprise Transformation · Build & Transfer",
        summary: "Diseño, integración, pruebas documentadas y transferencia a su propia infraestructura.",
        portalId: "atlascortex",
      },
      cobuild: {
        title: "Co-Build & Enablement",
        summary: "Construcción conjunta con sus equipos para consolidar capacidad técnica interna.",
        portalId: "club-atlas",
      },
      discovery: {
        title: "Diagnóstico Operativo Inicial",
        summary: "Mapeo previo de procesos, fuentes y límites humanos antes de implementar.",
        portalId: "atlashq",
      },
    },
    readinessBySystems: {
      api: "Las APIs documentadas permiten una integración acotada y auditable desde el inicio.",
      sheets: "Las hojas de cálculo requieren validación de esquema y controles humanos claros.",
      docs: "Los documentos y PDFs encajan con la trazabilidad y permisos de AtlasCortex.",
      unknown: "Comenzamos con un diagnóstico breve para mapear fuentes, accesos y prioridades.",
    },
    whatsappTemplatePrefix: "Hola equipo de AtlasHub.SI, deseo continuar con la solicitud",
  },
};

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ClaraConcierge({ dict }: ClaraConciergeProps) {
  const { reducedMotion } = useAtlasMotion();
  const c = dict.claraDrawer;
  const ui = CLARA_UI_STRINGS[dict.locale];

  const headingId = useId();
  const descId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState<ClaraPath>("menu");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const [leadEndpoint, setLeadEndpoint] = useState(DEFAULT_LEAD_ENDPOINT);
  const [whatsappDigits, setWhatsappDigits] = useState(DEFAULT_WHATSAPP_NUMBER);

  const [diagnostic, setDiagnostic] = useState<DiagnosticState>({
    scenario: "operations",
    channel: "email",
    systems: "unknown",
    frequency: "daily",
    approach: "bounded",
    model: "unsure",
  });

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<"contact" | "meeting" | "quote">("contact");
  const [preferredWindow, setPreferredWindow] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypotWebsite, setHoneypotWebsite] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "fallback">("idle");
  const [submittedRequestId, setSubmittedRequestId] = useState<string>("");

  // Load public/clara-config.json once on mount without blocking UI
  useEffect(() => {
    let active = true;
    fetch("/clara-config.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (!active || !cfg) return;
        if (typeof cfg.leadEndpoint === "string" && cfg.leadEndpoint.startsWith("/")) {
          setLeadEndpoint(cfg.leadEndpoint);
        }
        const rawWa = cfg?.commercial?.whatsapp;
        if (typeof rawWa === "string") {
          const digits = rawWa.replace(/[^\d]/g, "");
          if (digits) setWhatsappDigits(digits);
        }
      })
      .catch(() => {
        // Safe defaults already populated
      });
    return () => {
      active = false;
    };
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => {
      previousFocusRef.current?.focus();
    }, 0);
  }, []);

  // Open strictly on explicit custom event "atlas:open-clara" — NEVER auto-opens
  useEffect(() => {
    const handleOpenEvent = (ev: Event) => {
      const customEv = ev as CustomEvent<{ path?: ClaraPath }>;
      if (document.activeElement instanceof HTMLElement) {
        previousFocusRef.current = document.activeElement;
      }
      const requested = customEv.detail?.path;
      if (
        requested === "explore" ||
        requested === "diagnostic" ||
        requested === "consulting" ||
        requested === "human"
      ) {
        setActivePath(requested);
        if (requested === "diagnostic") {
          setShowRecommendation(false);
          setQuestionIdx(0);
        }
      } else {
        setActivePath("menu");
      }
      setIsOpen(true);
    };

    window.addEventListener("atlas:open-clara", handleOpenEvent);
    return () => window.removeEventListener("atlas:open-clara", handleOpenEvent);
  }, []);

  // Notify background ambient fields (e.g. LivingParticleField) to pause while Clara is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("atlas:overlay-active", {
        detail: { active: isOpen, source: "clara" },
      }),
    );
    return () => {
      if (isOpen) {
        window.dispatchEvent(
          new CustomEvent("atlas:overlay-active", {
            detail: { active: false, source: "clara" },
          }),
        );
      }
    };
  }, [isOpen]);

  // Move focus into drawer when opened & bind Escape key
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer, isOpen]);

  // Deterministic recommendation engine aligned with diagnostic answers
  const recommendation = useMemo(() => {
    let trackKey: "managed" | "build" | "cobuild" | "discovery" = "discovery";
    if (diagnostic.model === "managed") trackKey = "managed";
    else if (diagnostic.model === "build") trackKey = "build";
    else if (diagnostic.model === "cobuild") trackKey = "cobuild";
    else if (diagnostic.approach === "bounded" && diagnostic.frequency === "high") {
      trackKey = "managed";
    } else if (diagnostic.systems === "docs") {
      trackKey = "build";
    }

    const track = ui.tracks[trackKey];
    const readiness =
      ui.readinessBySystems[diagnostic.systems] ?? ui.readinessBySystems.unknown;
    const portalCopy = dict.portalsSection.items[track.portalId];
    return { track, readiness, portalCopy };
  }, [diagnostic, dict.portalsSection.items, ui.readinessBySystems, ui.tracks]);

  const buildWhatsappUrl = (reqId?: string) => {
    const scenarioLabel =
      c.diagnosticQuestions
        .find((q) => q.id === "scenario")
        ?.options.find((o) => o.value === diagnostic.scenario)?.label ?? diagnostic.scenario;
    const msg = `${ui.whatsappTemplatePrefix}${reqId ? ` (${reqId.slice(0, 8)})` : ""}: ${scenarioLabel}${company ? ` — ${company}` : ""}.`;
    return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(msg)}`;
  };

  const handleSelectQuestionOption = (
    qId: DiagnosticState extends Record<infer K, string> ? K : never,
    value: string,
  ) => {
    setDiagnostic((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedWindow = preferredWindow.trim();

    if (!trimmedName || (!trimmedEmail && !trimmedPhone)) {
      setFormError(ui.validationNameOrContact);
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError(ui.validationEmailFormat);
      return;
    }
    if (trimmedPhone && !/^\+[\d ()-]{7,25}$/.test(trimmedPhone)) {
      setFormError(ui.validationPhoneFormat);
      return;
    }
    if (intent === "meeting" && !trimmedWindow) {
      setFormError(ui.validationWindowRequired);
      return;
    }
    if (!consent) {
      setFormError(ui.validationConsentRequired);
      return;
    }

    const requestId = generateUuidV4();
    setSubmittedRequestId(requestId);
    setIsSubmitting(true);

    try {
      const payload = {
        requestId,
        name: trimmedName,
        company: company.trim(),
        email: trimmedEmail,
        phone: trimmedPhone,
        intent,
        preferredWindow: trimmedWindow,
        consent: true,
        website: honeypotWebsite,
        diagnostic,
      };

      const res = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 202) {
        setSubmitState("success");
      } else {
        setSubmitState("fallback");
      }
    } catch {
      setSubmitState("fallback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentQuestion = c.diagnosticQuestions[questionIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#04070B]/88"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descId}
        className={`flex h-full w-full max-w-lg flex-col border-l border-[#CDA66C]/35 bg-[#0A1017] text-[#ECF4F6] shadow-2xl ${
          !reducedMotion ? "transition-transform duration-300" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-400/15 bg-[#0E151D] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Image
              src="/v2/clara-avatar.webp"
              alt={c.title}
              width={48}
              height={48}
              unoptimized
              preload
              loading="eager"
              decoding="sync"
              className="h-12 w-12 rounded-full border border-[#CDA66C]/70 object-cover"
            />
            <div>
              <h2 id={headingId} className="text-base font-semibold text-[#ECF4F6]">
                {c.title}
              </h2>
              <p className="text-xs text-[#E5C287]">{c.role}</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            aria-label={c.closeLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-400/25 bg-[#080D12] text-[#CBD5E1] transition-colors hover:border-[#CDA66C] hover:text-[#ECF4F6]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* AI Assistant & Privacy Disclosure */}
        <div
          id={descId}
          className="border-b border-[#CDA66C]/20 bg-[#0D141C] px-4 py-2.5 text-[11px] leading-relaxed text-[#CBD5E1] sm:px-5"
        >
          <p>{c.aiDisclosure}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[#94A8B8]">{c.privacySummary}</span>
            <Link
              href={`/${dict.locale}/privacy`}
              onClick={closeDrawer}
              className="font-medium text-[#E5C287] underline underline-offset-2 hover:text-[#ECF4F6]"
            >
              {c.privacyLinkLabel}
            </Link>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {activePath !== "menu" ? (
            <button
              type="button"
              onClick={() => {
                setActivePath("menu");
                setSubmitState("idle");
                setFormError(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/25 bg-[#0E151D] px-3 py-1 text-xs font-medium text-[#CBD5E1] hover:border-[#CDA66C] hover:text-[#ECF4F6]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{c.backLabel}</span>
            </button>
          ) : null}

          {/* Path: Root Menu */}
          {activePath === "menu" ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-slate-400/15 bg-[#0E151D] p-3.5">
                <div className="relative hidden h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-[#CDA66C]/30 sm:block">
                  <Image
                    src="/v2/clara-portrait.webp"
                    alt=""
                    aria-hidden="true"
                    fill
                    unoptimized
                    preload
                    loading="eager"
                    decoding="sync"
                    sizes="64px"
                    className="object-cover object-top"
                  />
                </div>
                <p className="text-xs leading-relaxed text-[#ECF4F6] sm:text-sm">
                  {c.welcomeMessage}
                </p>
              </div>

              <div className="grid gap-2.5">
                {c.paths.map((pathItem) => (
                  <button
                    key={pathItem.id}
                    type="button"
                    onClick={() => {
                      setActivePath(pathItem.id);
                      if (pathItem.id === "diagnostic") {
                        setQuestionIdx(0);
                        setShowRecommendation(false);
                      }
                    }}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-slate-400/20 bg-[#0E151D] p-3.5 text-left transition-colors hover:border-[#CDA66C]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#ECF4F6] group-hover:text-[#E5C287]">
                        {pathItem.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#94A8B8]">{pathItem.desc}</p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[#CDA66C] transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>

              <a
                href={buildWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/55 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition-colors hover:border-emerald-400"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>{c.whatsappDirect}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : null}

          {/* Path 1: Explore Ecosystem */}
          {activePath === "explore" ? (
            <div className="space-y-3">
              {PORTALS.map((portal) => {
                const pCopy = dict.portalsSection.items[portal.id];
                return (
                  <div
                    key={portal.id}
                    className="rounded-xl border border-slate-400/20 bg-[#0E151D] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#ECF4F6]">{pCopy.name}</span>
                      <MaturityBadge
                        status={portal.maturity}
                        label={dict.maturityLabels[portal.maturity]}
                        size="sm"
                      />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                      {pCopy.shortDesc}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Link
                        href={`/${dict.locale}${pCopy.exploreHref}`}
                        onClick={closeDrawer}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5C287] hover:underline"
                      >
                        <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{ui.openPortalLabel}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Path 2: Interactive 6-Step Diagnostic + Recommendation Engine */}
          {activePath === "diagnostic" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#E5C287]">{c.diagnosticTitle}</h3>
                {!showRecommendation ? (
                  <span className="font-mono text-[11px] text-[#94A8B8]">
                    {ui.stepPrefix} {questionIdx + 1} / {c.diagnosticQuestions.length}
                  </span>
                ) : null}
              </div>

              {!showRecommendation ? (
                <div className="space-y-3 rounded-xl border border-slate-400/20 bg-[#0E151D] p-4">
                  <p className="text-sm font-medium text-[#ECF4F6]">{currentQuestion.prompt}</p>
                  <div className="grid gap-2">
                    {currentQuestion.options.map((opt) => {
                      const currentVal = diagnostic[currentQuestion.id];
                      const selected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => handleSelectQuestionOption(currentQuestion.id, opt.value)}
                          className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors ${
                            selected
                              ? "border-[#CDA66C] bg-[#211A10] font-semibold text-[#F3DFB8]"
                              : "border-slate-400/15 bg-[#080D12] text-[#CBD5E1] hover:border-slate-400/40"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selected ? (
                            <CheckCircle2
                              className="h-4 w-4 shrink-0 text-[#CDA66C]"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      disabled={questionIdx === 0}
                      onClick={() => setQuestionIdx((idx) => Math.max(0, idx - 1))}
                      className="rounded-full border border-slate-400/25 px-3 py-1.5 text-xs text-[#CBD5E1] disabled:opacity-40"
                    >
                      {ui.prevQuestion}
                    </button>
                    {questionIdx < c.diagnosticQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setQuestionIdx((idx) => idx + 1)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C] bg-[#211A10] px-4 py-1.5 text-xs font-semibold text-[#F3DFB8]"
                      >
                        <span>{ui.nextQuestion}</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowRecommendation(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#36BDD0] bg-[#0D232A] px-4 py-1.5 text-xs font-semibold text-[#ECF4F6]"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#36BDD0]" aria-hidden="true" />
                        <span>{ui.viewRecommendation}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-[#CDA66C]/40 bg-[#0E151D] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#E5C287]">
                    {c.recommendationTitle}
                  </p>
                  <div>
                    <p className="text-[11px] text-[#94A8B8]">{ui.recommendedTrackLabel}</p>
                    <p className="text-sm font-semibold text-[#ECF4F6]">
                      {recommendation.track.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                      {recommendation.track.summary}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-400/15 bg-[#080D12] p-3 text-xs">
                    <p className="font-medium text-[#67E8F9]">{ui.suggestedPortalLabel}</p>
                    <p className="mt-0.5 text-[#ECF4F6]">
                      {recommendation.portalCopy.name} — {recommendation.portalCopy.tagline}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-400/15 bg-[#080D12] p-3 text-xs">
                    <p className="font-medium text-[#E5C287]">{ui.readinessNoteLabel}</p>
                    <p className="mt-0.5 text-[#CBD5E1]">{recommendation.readiness}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePath("human")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C] bg-[#221A0E] px-4 py-2 text-xs font-semibold text-[#F3DFB8]"
                    >
                      <span>{ui.proceedToContact}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecommendation(false);
                        setQuestionIdx(0);
                      }}
                      className="rounded-full border border-slate-400/25 px-3 py-2 text-xs text-[#CBD5E1]"
                    >
                      {c.backLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Path 3: Consulting Models */}
          {activePath === "consulting" ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#E5C287]">
                {ui.consultingHighlightTitle}
              </h3>
              {dict.consultingSection.deliverables.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-400/20 bg-[#0E151D] p-3.5"
                >
                  <p className="text-xs font-semibold text-[#ECF4F6]">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">{item.body}</p>
                </div>
              ))}
              <p className="rounded-lg border border-[#CDA66C]/25 bg-[#12161D] p-3 text-xs text-[#CBD5E1]">
                {dict.consultingSection.independenceNote}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivePath("diagnostic");
                    setQuestionIdx(0);
                    setShowRecommendation(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#CDA66C] bg-[#221A0E] px-4 py-2 text-xs font-semibold text-[#F3DFB8]"
                >
                  <span>{ui.runDiagnosticCta}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <Link
                  href={`/${dict.locale}/consulting`}
                  onClick={closeDrawer}
                  className="inline-flex items-center rounded-full border border-slate-400/25 px-4 py-2 text-xs font-medium text-[#ECF4F6]"
                >
                  {dict.consultingSection.ctaConsulting}
                </Link>
              </div>
            </div>
          ) : null}

          {/* Path 4: Human Contact Form (POST /api/lead) + Instant WhatsApp Handoff */}
          {activePath === "human" ? (
            <div className="space-y-4">
              {submitState === "success" ? (
                <div className="space-y-3 rounded-xl border border-emerald-400/40 bg-emerald-950/35 p-4">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <h3 className="text-sm font-semibold">{c.successTitle}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-[#ECF4F6]">{c.successBody}</p>
                  <p className="font-mono text-[10px] text-[#94A8B8]">ID: {submittedRequestId}</p>
                  <a
                    href={buildWhatsappUrl(submittedRequestId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-950/70 px-4 py-2 text-xs font-semibold text-emerald-100"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{c.whatsappDirect}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              ) : null}

              {submitState === "fallback" ? (
                <div className="space-y-3 rounded-xl border border-[#CDA66C]/50 bg-[#1B160D] p-4">
                  <h3 className="text-sm font-semibold text-[#F3DFB8]">{c.fallbackTitle}</h3>
                  <p className="text-xs leading-relaxed text-[#ECF4F6]">{c.fallbackBody}</p>
                  <a
                    href={buildWhatsappUrl(submittedRequestId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#CDA66C] bg-[#281F11] px-4 py-2 text-xs font-semibold text-[#F3DFB8]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{c.whatsappDirect}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              ) : null}

              {submitState === "idle" ? (
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#E5C287]">{c.formTitle}</h3>

                  {/* Honeypot field checked server-side in lib/leads.ts */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="clara-website-field">Website</label>
                    <input
                      id="clara-website-field"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypotWebsite}
                      onChange={(e) => setHoneypotWebsite(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="clara-name"
                      className="mb-1 block text-xs font-medium text-[#CBD5E1]"
                    >
                      {c.nameLabel} *
                    </label>
                    <input
                      id="clara-name"
                      type="text"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-400/25 bg-[#080D12] px-3 py-2 text-xs text-[#ECF4F6]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="clara-company"
                      className="mb-1 block text-xs font-medium text-[#CBD5E1]"
                    >
                      {c.companyLabel} ({ui.optionalLabel})
                    </label>
                    <input
                      id="clara-company"
                      type="text"
                      maxLength={160}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-lg border border-slate-400/25 bg-[#080D12] px-3 py-2 text-xs text-[#ECF4F6]"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="clara-email"
                        className="mb-1 block text-xs font-medium text-[#CBD5E1]"
                      >
                        {c.emailLabel}
                      </label>
                      <input
                        id="clara-email"
                        type="email"
                        maxLength={160}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-400/25 bg-[#080D12] px-3 py-2 text-xs text-[#ECF4F6]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clara-phone"
                        className="mb-1 block text-xs font-medium text-[#CBD5E1]"
                      >
                        {c.phoneLabel}
                      </label>
                      <input
                        id="clara-phone"
                        type="tel"
                        maxLength={30}
                        placeholder="+351..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-400/25 bg-[#080D12] px-3 py-2 text-xs text-[#ECF4F6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="clara-intent"
                      className="mb-1 block text-xs font-medium text-[#CBD5E1]"
                    >
                      {c.intentLabel}
                    </label>
                    <select
                      id="clara-intent"
                      value={intent}
                      onChange={(e) =>
                        setIntent(e.target.value as "contact" | "meeting" | "quote")
                      }
                      className="w-full rounded-lg border border-slate-400/25 bg-[#080D12] px-3 py-2 text-xs text-[#ECF4F6]"
                    >
                      {c.intentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {intent === "meeting" ? (
                    <div>
                      <label
                        htmlFor="clara-window"
                        className="mb-1 block text-xs font-medium text-[#CBD5E1]"
                      >
                        {c.preferredWindowLabel} *
                      </label>
                      <input
                        id="clara-window"
                        type="text"
                        required
                        maxLength={160}
                        value={preferredWindow}
                        onChange={(e) => setPreferredWindow(e.target.value)}
                        className="w-full rounded-lg border border-slate-400/25 bg-[#080D12] px-3 py-2 text-xs text-[#ECF4F6]"
                      />
                    </div>
                  ) : null}

                  {/* Mandatory explicit consent checkbox (never pre-checked) */}
                  <label className="flex items-start gap-2.5 rounded-lg border border-slate-400/20 bg-[#0E151D] p-3 text-xs leading-relaxed text-[#CBD5E1]">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 bg-[#080D12] accent-[#CDA66C]"
                    />
                    <span>{c.consentText}</span>
                  </label>

                  {formError ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-rose-400/40 bg-rose-950/50 px-3 py-2 text-xs text-rose-200"
                    >
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E5C287] bg-gradient-to-r from-[#E5C287] to-[#CDA66C] px-4 py-2.5 text-xs font-semibold text-[#080D12] transition-opacity disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isSubmitting ? c.submittingLabel : c.submitLabel}</span>
                  </button>

                  <div className="pt-1 text-center">
                    <a
                      href={buildWhatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#67E8F9] hover:underline"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{c.whatsappDirect}</span>
                    </a>
                  </div>
                </form>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export default ClaraConcierge;
