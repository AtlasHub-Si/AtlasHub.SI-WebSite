export type Locale = "pt" | "en" | "fr" | "es";

export const LOCALES: readonly Locale[] = ["pt", "en", "fr", "es"] as const;
export const DEFAULT_LOCALE: Locale = "pt";

export type PortalId =
  | "atlashq"
  | "atlasbot"
  | "club-atlas"
  | "atlascortex"
  | "gwd";

export type MaturityStatus =
  | "VERIFIED"
  | "IMPLEMENTED"
  | "DEMO"
  | "PILOT"
  | "PROPOSED"
  | "HISTORICAL";

export interface PortalDefinition {
  id: PortalId;
  index: string; // "01" .. "05"
  slug: PortalId;
  name: string;
  maturity: MaturityStatus;
  accentHex: string;
  accentSecondaryHex: string;
  glowRgba: string;
  posterSrc: string;
  mobilePosterSrc: string;
  externalUrl: string | null;
  externalUrlVerified: boolean;
  isIndependentEntity?: boolean;
  assistantName: "NeX" | "Guide" | "Club Mentors" | "Cortex Navigator" | "Diana";
}

export type TechRelationshipType =
  | "used"
  | "tested"
  | "community_member"
  | "program_participant"
  | "certified_partner"
  | "sponsor";

export type RegistryStatus = "verified" | "pending" | "retired";

export interface TechRegistryEntry {
  id: string;
  name: string;
  category:
    | "frontend_runtime"
    | "ai_models"
    | "cloud_infra"
    | "data_knowledge"
    | "communities_programs"
    | "verified_partnerships";
  relationshipType: TechRelationshipType;
  status: RegistryStatus;
  externalUrl: string;
  guidelineUrl?: string;
  evidenceNote: Record<Locale, string>;
  monogram: string;
}

export interface SocialRegistryEntry {
  id: string;
  network:
    | "GitHub"
    | "WhatsApp"
    | "LinkedIn"
    | "Instagram"
    | "Facebook"
    | "X"
    | "YouTube"
    | "TikTok"
    | "Discord"
    | "Slack"
    | "Telegram";
  status: RegistryStatus;
  url: string | null;
  handle?: string;
  note?: Record<Locale, string>;
}

export interface NavItem {
  id: string;
  label: string;
  href: string; // relative to /{locale} e.g. "/ecosystem" or "#portals"
  children?: { label: string; href: string; badge?: string }[];
}

export interface CortexNode {
  id: string;
  title: string;
  cluster: "obsidian" | "git" | "gbrain" | "governance" | "decisions";
  source: string;
  classification: string;
  accessPolicy: string;
  version: string;
  updatedAt: string;
  status: MaturityStatus;
  x: number;
  y: number;
  z: number;
  summary: Record<Locale, string>;
}

export interface CortexEdge {
  source: string;
  target: string;
  relation: "indexes" | "governs" | "supersedes" | "informs";
}

export interface PortalLocaleCopy {
  id: PortalId;
  eyebrow: string;
  name: string;
  shortDesc: string;
  tagline: string;
  chapterTitle: string;
  chapterLead: string;
  steps: [string, string, string];
  proofLabel: string;
  proofDetail: string;
  limitationNotice: string;
  primaryCta: string;
  secondaryCta: string;
  exploreHref: string;
  sceneLabels: Record<string, string>;
}

export interface LegalPageCopy {
  slug: string;
  title: string;
  eyebrow: string;
  lead: string;
  sections: { heading: string; paragraphs: string[]; list?: string[] }[];
}

export interface InstitutionalPageCopy {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  maturity?: MaturityStatus;
  highlights: { title: string; body: string; tag?: string }[];
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}

export interface LocaleDictionary {
  locale: Locale;
  htmlLang: string;
  ogLocale: string;
  localeName: string;
  siteTitle: string;
  siteDescription: string;
  skipToContent: string;
  maturityLabels: Record<MaturityStatus, string>;
  nav: {
    ecosystem: string;
    solutions: string;
    consulting: string;
    community: string;
    news: string;
    company: string;
    exploreCta: string;
    claraCta: string;
    signInLabel: string;
    reduceMotionOn: string;
    reduceMotionOff: string;
    menuOpen: string;
    menuClose: string;
    languageLabel: string;
  };
  hero: {
    eyebrow: string;
    headlineStart: string;
    headlineAccent: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollCue: string;
    statusBanner: string;
  };
  portalsSection: {
    eyebrow: string;
    title: string;
    lead: string;
    openPortal: string;
    closePortal: string;
    backToEcosystem: string;
    previousPortal: string;
    nextPortal: string;
    stepOf: string;
    replayScene: string;
    sceneComplete: string;
    exploreStandalone: string;
    items: Record<PortalId, PortalLocaleCopy>;
  };
  ecosystemBridge: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    lead: string;
    pillars: { key: string; title: string; subtitle: string }[];
    ctaEcosystem: string;
    ctaMultiverse: string;
  };
  architectureSection: {
    eyebrow: string;
    title: string;
    lead: string;
    layers: { index: string; title: string; summary: string; tag: MaturityStatus }[];
  };
  consultingSection: {
    eyebrow: string;
    title: string;
    lead: string;
    deliverables: { title: string; body: string }[];
    independenceNote: string;
    ctaDiagnostic: string;
    ctaConsulting: string;
  };
  methodologySection: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: { num: string; title: string; role: string; output: string }[];
  };
  communitySection: {
    eyebrow: string;
    title: string;
    lead: string;
    cards: {
      eyebrow: string;
      title: string;
      body: string;
      status: MaturityStatus;
      href: string;
      cta: string;
    }[];
  };
  proofSection: {
    eyebrow: string;
    title: string;
    lead: string;
    items: {
      title: string;
      kind: string;
      body: string;
      status: MaturityStatus;
      href: string;
      cta: string;
    }[];
    relationsTitle: string;
    relationsLinks: { title: string; desc: string; href: string }[];
  };
  claraBand: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    whatsappCta: string;
  };
  claraDrawer: {
    triggerLabel: string;
    title: string;
    role: string;
    aiDisclosure: string;
    privacySummary: string;
    welcomeMessage: string;
    paths: {
      id: "explore" | "diagnostic" | "consulting" | "human";
      title: string;
      desc: string;
    }[];
    diagnosticTitle: string;
    diagnosticQuestions: {
      id: "scenario" | "channel" | "systems" | "frequency" | "approach" | "model";
      prompt: string;
      options: { value: string; label: string }[];
    }[];
    recommendationTitle: string;
    formTitle: string;
    nameLabel: string;
    companyLabel: string;
    emailLabel: string;
    phoneLabel: string;
    intentLabel: string;
    intentOptions: { value: "contact" | "meeting" | "quote"; label: string }[];
    preferredWindowLabel: string;
    consentText: string;
    submitLabel: string;
    submittingLabel: string;
    successTitle: string;
    successBody: string;
    fallbackTitle: string;
    fallbackBody: string;
    whatsappDirect: string;
    closeLabel: string;
    backLabel: string;
    privacyLinkLabel: string;
  };
  multiverse: {
    eyebrow: string;
    title: string;
    subtitle: string;
    modeGuided: string;
    modeFree: string;
    exitExperience: string;
    nextStop: string;
    prevStop: string;
    audioOptInNotice: string;
    webglFallbackNotice: string;
    openPortalRoute: string;
    capabilitiesStrip: string[];
  };
  footer: {
    editorialTagline: string;
    editorialStatement: string;
    exploreBtn: string;
    claraBtn: string;
    columns: {
      ecosystem: string;
      solutions: string;
      organization: string;
      community: string;
      relations: string;
      supportLegal: string;
    };
    links: Record<string, { label: string; href: string }[]>;
    techSectionTitle: string;
    techUsedLabel: string;
    communitiesProgramsLabel: string;
    partnershipsLabel: string;
    partnershipsEmptyNote: string;
    pauseMarquee: string;
    resumeMarquee: string;
    corporateTitle: string;
    corporateEntitiesNote: string;
    verifiedChannelsLabel: string;
    pendingChannelsNote: string;
    legalNotice: string;
    thirdPartyNotice: string;
    copyrightOwner: string;
  };
  pages: Record<string, InstitutionalPageCopy>;
  legalPages: Record<string, LegalPageCopy>;
}
