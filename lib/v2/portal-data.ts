import type { PortalDefinition, PortalId } from "./types";

/**
 * Canonical definitions for the five Living Atlas portals.
 * Poster and avatar assets strictly reference verified files in public/v2/.
 */
export const PORTALS: PortalDefinition[] = [
  {
    id: "atlashq",
    index: "01",
    slug: "atlashq",
    name: "AtlasHQ",
    maturity: "DEMO",
    accentHex: "#36BDD0",
    accentSecondaryHex: "#2DD4BF",
    glowRgba: "rgba(54, 189, 208, 0.34)",
    posterSrc: "/v2/scenes/portal-atlashq.webp",
    mobilePosterSrc: "/v2/scenes/portal-atlashq-640.webp",
    externalUrl: null,
    externalUrlVerified: false,
    assistantName: "NeX",
  },
  {
    id: "atlasbot",
    index: "02",
    slug: "atlasbot",
    name: "AtlasBot",
    maturity: "DEMO",
    accentHex: "#22D3EE",
    accentSecondaryHex: "#818CF8",
    glowRgba: "rgba(34, 211, 238, 0.32)",
    posterSrc: "/v2/scenes/portal-atlasbot-bg.webp",
    mobilePosterSrc: "/v2/scenes/portal-atlasbot-bg-640.webp",
    externalUrl: null,
    externalUrlVerified: false,
    assistantName: "Guide",
  },
  {
    id: "club-atlas",
    index: "03",
    slug: "club-atlas",
    name: "Club Atlas",
    maturity: "IMPLEMENTED",
    accentHex: "#E5A952",
    accentSecondaryHex: "#F59E0B",
    glowRgba: "rgba(229, 169, 82, 0.34)",
    posterSrc: "/v2/scenes/portal-clubatlas.webp",
    mobilePosterSrc: "/v2/scenes/portal-clubatlas-640.webp",
    externalUrl: null,
    externalUrlVerified: false,
    assistantName: "Club Mentors",
  },
  {
    id: "atlascortex",
    index: "04",
    slug: "atlascortex",
    name: "AtlasCortex",
    maturity: "PILOT",
    accentHex: "#A78BFA",
    accentSecondaryHex: "#2DD4BF",
    glowRgba: "rgba(167, 139, 250, 0.34)",
    posterSrc: "/v2/scenes/portal-atlascortex.webp",
    mobilePosterSrc: "/v2/scenes/portal-atlascortex-640.webp",
    externalUrl: null,
    externalUrlVerified: false,
    assistantName: "Cortex Navigator",
  },
  {
    id: "gwd",
    index: "05",
    slug: "gwd",
    name: "GWD",
    maturity: "PILOT",
    accentHex: "#CDA66C",
    accentSecondaryHex: "#3B82F6",
    glowRgba: "rgba(205, 166, 108, 0.36)",
    posterSrc: "/v2/scenes/portal-gwd.webp",
    mobilePosterSrc: "/v2/scenes/portal-gwd-640.webp",
    externalUrl: "https://explore.goworld.digital",
    externalUrlVerified: true,
    isIndependentEntity: true,
    assistantName: "Diana",
  },
];

export const PORTAL_IDS: readonly PortalId[] = PORTALS.map((portal) => portal.id);

export function getPortalBySlug(slug: string): PortalDefinition | undefined {
  return PORTALS.find((portal) => portal.slug === slug || portal.id === slug);
}

export interface AtlasBotMascotAsset {
  id: "guide" | "analyst" | "builder" | "creator" | "flow" | "shield";
  imageSrc: string;
  hdImageSrc: string;
  accentHex: string;
  nameKey: string;
  roleKey: string;
  sampleKey: string;
}

export const ATLASBOT_MASCOTS: AtlasBotMascotAsset[] = [
  {
    id: "guide",
    imageSrc: "/v2/mascots/guide-640.webp",
    hdImageSrc: "/v2/mascots/guide-960.webp",
    accentHex: "#22D3EE",
    nameKey: "mascotGuideName",
    roleKey: "mascotGuideRole",
    sampleKey: "mascotGuideSample",
  },
  {
    id: "analyst",
    imageSrc: "/v2/mascots/analyst-640.webp",
    hdImageSrc: "/v2/mascots/analyst-960.webp",
    accentHex: "#34D399",
    nameKey: "mascotAnalystName",
    roleKey: "mascotAnalystRole",
    sampleKey: "mascotAnalystSample",
  },
  {
    id: "builder",
    imageSrc: "/v2/mascots/builder-640.webp",
    hdImageSrc: "/v2/mascots/builder-960.webp",
    accentHex: "#FBBF24",
    nameKey: "mascotBuilderName",
    roleKey: "mascotBuilderRole",
    sampleKey: "mascotBuilderSample",
  },
  {
    id: "creator",
    imageSrc: "/v2/mascots/creator-640.webp",
    hdImageSrc: "/v2/mascots/creator-960.webp",
    accentHex: "#EC4899",
    nameKey: "mascotCreatorName",
    roleKey: "mascotCreatorRole",
    sampleKey: "mascotCreatorSample",
  },
  {
    id: "flow",
    imageSrc: "/v2/mascots/flow-640.webp",
    hdImageSrc: "/v2/mascots/flow-960.webp",
    accentHex: "#818CF8",
    nameKey: "mascotFlowName",
    roleKey: "mascotFlowRole",
    sampleKey: "mascotFlowSample",
  },
  {
    id: "shield",
    imageSrc: "/v2/mascots/shield-640.webp",
    hdImageSrc: "/v2/mascots/shield-960.webp",
    accentHex: "#60A5FA",
    nameKey: "mascotShieldName",
    roleKey: "mascotShieldRole",
    sampleKey: "mascotShieldSample",
  },
];
