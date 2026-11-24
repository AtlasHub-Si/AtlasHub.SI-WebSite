import type { MaturityStatus, PortalId } from "./types";

/**
 * Semantic color, typography, focus, and motion tokens for AtlasHub.SI V2.0 (Living Ecosystem).
 * Surface contrast pairs are tuned for WCAG 2.2 AA across both Mineral Graphite and Warm Pearl bands.
 */
export const ATLAS_TOKENS = {
  surfaces: {
    bg: "#080D12",
    surface: "#0E151D",
    surfaceRaised: "#172027",
    glass: "rgba(14, 21, 29, 0.72)",
    glassRaised: "rgba(23, 32, 39, 0.80)",
    pearl: "#EDEBE5",
    pearlRaised: "#F6F5F1",
  },
  ink: {
    light: "#ECF4F6",
    muted: "#94A8B8",
    silver: "#CBD5E1",
    pearlInk: "#17212B",
    pearlMuted: "#475569",
  },
  accents: {
    gold: "#CDA66C",
    goldBright: "#E5C287",
    goldPearl: "#7D5720",
    cyan: "#36BDD0",
    blue: "#1377DF",
    bluePearl: "#0F5FB5",
  },
  borders: {
    subtle: "rgba(203, 213, 225, 0.14)",
    strong: "rgba(203, 213, 225, 0.24)",
    gold: "rgba(205, 166, 108, 0.36)",
    pearlSubtle: "rgba(23, 33, 43, 0.12)",
  },
  focus: {
    ringColor: "#E5C287",
    ringWidth: "2px",
    ringOffset: "2px",
    pearlContrastRing: "#17212B",
  },
  typography: {
    body: "var(--font-inter), 'Inter', ui-sans-serif, system-ui, sans-serif",
    display:
      "var(--font-manrope), 'Manrope', var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    mono: "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    pill: "9999px",
  },
  motionMs: {
    micro: 150,
    normal: 280,
    portalDive: 550,
    narrativePhase: 1800,
    ambientCycle: 20000,
  },
  easings: {
    standard: [0.22, 1, 0.36, 1] as const,
    dive: [0.16, 1, 0.3, 1] as const,
  },
} as const;

export type AtlasTokens = typeof ATLAS_TOKENS;

export interface PortalThemeToken {
  id: PortalId;
  accent: string;
  accentSecondary: string;
  textAccent: string;
  border: string;
  borderHover: string;
  glow: string;
  glowStrong: string;
  surfaceTint: string;
  badgeBg: string;
  ring: string;
}

/**
 * Portal-specific chromatic accents layered over shared Mineral Graphite glass DNA.
 */
export const PORTAL_THEME_TOKENS: Record<PortalId, PortalThemeToken> = {
  atlashq: {
    id: "atlashq",
    accent: "#36BDD0",
    accentSecondary: "#2DD4BF",
    textAccent: "#67E8F9",
    border: "rgba(54, 189, 208, 0.34)",
    borderHover: "rgba(45, 212, 191, 0.72)",
    glow: "rgba(54, 189, 208, 0.24)",
    glowStrong: "rgba(45, 212, 191, 0.38)",
    surfaceTint: "rgba(14, 32, 40, 0.76)",
    badgeBg: "rgba(13, 44, 52, 0.85)",
    ring: "#36BDD0",
  },
  atlasbot: {
    id: "atlasbot",
    accent: "#22D3EE",
    accentSecondary: "#818CF8",
    textAccent: "#67E8F9",
    border: "rgba(34, 211, 238, 0.36)",
    borderHover: "rgba(129, 140, 248, 0.76)",
    glow: "rgba(34, 211, 238, 0.26)",
    glowStrong: "rgba(129, 140, 248, 0.38)",
    surfaceTint: "rgba(16, 25, 48, 0.78)",
    badgeBg: "rgba(22, 34, 68, 0.85)",
    ring: "#22D3EE",
  },
  "club-atlas": {
    id: "club-atlas",
    accent: "#E5A952",
    accentSecondary: "#F59E0B",
    textAccent: "#FCD34D",
    border: "rgba(229, 169, 82, 0.36)",
    borderHover: "rgba(245, 158, 11, 0.76)",
    glow: "rgba(229, 169, 82, 0.24)",
    glowStrong: "rgba(245, 158, 11, 0.38)",
    surfaceTint: "rgba(32, 24, 15, 0.78)",
    badgeBg: "rgba(46, 33, 18, 0.85)",
    ring: "#E5A952",
  },
  atlascortex: {
    id: "atlascortex",
    accent: "#A78BFA",
    accentSecondary: "#2DD4BF",
    textAccent: "#C4B5FD",
    border: "rgba(167, 139, 250, 0.36)",
    borderHover: "rgba(45, 212, 191, 0.72)",
    glow: "rgba(167, 139, 250, 0.26)",
    glowStrong: "rgba(167, 139, 250, 0.40)",
    surfaceTint: "rgba(24, 19, 44, 0.80)",
    badgeBg: "rgba(33, 25, 62, 0.85)",
    ring: "#A78BFA",
  },
  gwd: {
    id: "gwd",
    accent: "#CDA66C",
    accentSecondary: "#3B82F6",
    textAccent: "#E5C287",
    border: "rgba(205, 166, 108, 0.38)",
    borderHover: "rgba(229, 194, 135, 0.78)",
    glow: "rgba(205, 166, 108, 0.24)",
    glowStrong: "rgba(59, 130, 246, 0.36)",
    surfaceTint: "rgba(20, 24, 34, 0.82)",
    badgeBg: "rgba(32, 34, 46, 0.88)",
    ring: "#CDA66C",
  },
};

export interface MaturityStyleToken {
  status: MaturityStatus;
  dotHex: string;
  darkClasses: string;
  pearlClasses: string;
  textHexDark: string;
  bgHexDark: string;
  borderHexDark: string;
  textHexPearl: string;
  bgHexPearl: string;
  borderHexPearl: string;
}

/**
 * Editorial truth badge styling across both Graphite (dark) and Warm Pearl (daylight) surfaces.
 */
export const MATURITY_STYLES: Record<MaturityStatus, MaturityStyleToken> = {
  VERIFIED: {
    status: "VERIFIED",
    dotHex: "#2DD4BF",
    darkClasses: "border-emerald-400/35 bg-emerald-950/75 text-emerald-200",
    pearlClasses: "border-emerald-800/30 bg-emerald-100/90 text-emerald-950",
    textHexDark: "#A7F3D0",
    bgHexDark: "rgba(6, 78, 59, 0.55)",
    borderHexDark: "rgba(52, 211, 153, 0.38)",
    textHexPearl: "#064E3B",
    bgHexPearl: "rgba(209, 250, 229, 0.90)",
    borderHexPearl: "rgba(6, 95, 70, 0.30)",
  },
  IMPLEMENTED: {
    status: "IMPLEMENTED",
    dotHex: "#E5C287",
    darkClasses: "border-[#CDA66C]/45 bg-[#2A2012]/80 text-[#F3DFB8]",
    pearlClasses: "border-[#7D5720]/30 bg-amber-100/90 text-[#5C3D12]",
    textHexDark: "#F3DFB8",
    bgHexDark: "rgba(42, 32, 18, 0.82)",
    borderHexDark: "rgba(205, 166, 108, 0.45)",
    textHexPearl: "#5C3D12",
    bgHexPearl: "rgba(254, 243, 199, 0.90)",
    borderHexPearl: "rgba(125, 87, 32, 0.32)",
  },
  DEMO: {
    status: "DEMO",
    dotHex: "#36BDD0",
    darkClasses: "border-cyan-400/35 bg-cyan-950/75 text-cyan-100",
    pearlClasses: "border-cyan-800/30 bg-cyan-100/90 text-cyan-950",
    textHexDark: "#CFFAFE",
    bgHexDark: "rgba(11, 40, 52, 0.80)",
    borderHexDark: "rgba(54, 189, 208, 0.40)",
    textHexPearl: "#0E4A5C",
    bgHexPearl: "rgba(207, 250, 254, 0.90)",
    borderHexPearl: "rgba(14, 116, 144, 0.30)",
  },
  PILOT: {
    status: "PILOT",
    dotHex: "#A78BFA",
    darkClasses: "border-violet-400/35 bg-violet-950/75 text-violet-200",
    pearlClasses: "border-violet-800/30 bg-violet-100/90 text-violet-950",
    textHexDark: "#DDD6FE",
    bgHexDark: "rgba(38, 24, 68, 0.80)",
    borderHexDark: "rgba(167, 139, 250, 0.40)",
    textHexPearl: "#4C1D95",
    bgHexPearl: "rgba(237, 233, 254, 0.90)",
    borderHexPearl: "rgba(91, 33, 182, 0.28)",
  },
  PROPOSED: {
    status: "PROPOSED",
    dotHex: "#60A5FA",
    darkClasses: "border-sky-400/35 bg-slate-900/80 text-sky-200",
    pearlClasses: "border-blue-800/30 bg-blue-100/85 text-blue-950",
    textHexDark: "#BAE6FD",
    bgHexDark: "rgba(15, 29, 51, 0.82)",
    borderHexDark: "rgba(96, 165, 250, 0.36)",
    textHexPearl: "#1E3A8A",
    bgHexPearl: "rgba(219, 234, 254, 0.90)",
    borderHexPearl: "rgba(30, 64, 175, 0.28)",
  },
  HISTORICAL: {
    status: "HISTORICAL",
    dotHex: "#94A8B8",
    darkClasses: "border-slate-400/30 bg-slate-900/75 text-slate-300",
    pearlClasses: "border-slate-600/30 bg-slate-200/85 text-slate-800",
    textHexDark: "#CBD5E1",
    bgHexDark: "rgba(23, 32, 39, 0.82)",
    borderHexDark: "rgba(148, 168, 184, 0.32)",
    textHexPearl: "#1E293B",
    bgHexPearl: "rgba(226, 232, 240, 0.90)",
    borderHexPearl: "rgba(71, 85, 105, 0.28)",
  },
};

export function getPortalTheme(portalId: PortalId): PortalThemeToken {
  return PORTAL_THEME_TOKENS[portalId];
}

export function getMaturityStyle(status: MaturityStatus): MaturityStyleToken {
  return MATURITY_STYLES[status];
}
