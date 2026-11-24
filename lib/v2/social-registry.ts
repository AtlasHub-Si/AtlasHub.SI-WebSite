import type { Locale, SocialRegistryEntry } from "./types";

export const OFFICIAL_GITHUB_URL = "https://github.com/AtlasHub-Si";
export const OFFICIAL_WHATSAPP_NUMBER = "+5562991903462";
export const OFFICIAL_WHATSAPP_DISPLAY = "+55 62 99190-3462";
export const OFFICIAL_WHATSAPP_URL = "https://wa.me/5562991903462";

const PENDING_NOTE: Record<Locale, string> = {
  pt: "Canal corporativo em inventário e validação de titularidade; contas pessoais não substituem canais institucionais.",
  en: "Corporate channel under ownership and activity validation; personal profiles do not substitute for institutional accounts.",
  fr: "Canal d'entreprise en cours d'inventaire et de validation de titularité ; les profils personnels ne remplacent pas les comptes institutionnels.",
  es: "Canal corporativo en inventario y validación de titularidad; los perfiles personales no sustituyen a las cuentas institucionales.",
};

export const SOCIAL_REGISTRY: readonly SocialRegistryEntry[] = [
  {
    id: "github",
    network: "GitHub",
    status: "verified",
    url: OFFICIAL_GITHUB_URL,
    handle: "@AtlasHub-Si",
    note: {
      pt: "Organização pública oficial no GitHub com repositórios técnicos e documentação aberta.",
      en: "Official public GitHub organization hosting technical repositories and open documentation.",
      fr: "Organisation publique officielle sur GitHub hébergeant des dépôts techniques et de la documentation ouverte.",
      es: "Organización pública oficial en GitHub con repositorios técnicos y documentación abierta.",
    },
  },
  {
    id: "whatsapp",
    network: "WhatsApp",
    status: "verified",
    url: OFFICIAL_WHATSAPP_URL,
    handle: OFFICIAL_WHATSAPP_DISPLAY,
    note: {
      pt: "Canal comercial verificado para contacto direto após ação explícita do visitante.",
      en: "Verified business contact channel triggered exclusively by explicit visitor action.",
      fr: "Canal commercial vérifié pour un contact direct uniquement sur action explicite du visiteur.",
      es: "Canal comercial verificado para contacto directo únicamente tras acción explícita del visitante.",
    },
  },
  { id: "linkedin", network: "LinkedIn", status: "pending", url: null, note: PENDING_NOTE },
  { id: "instagram", network: "Instagram", status: "pending", url: null, note: PENDING_NOTE },
  { id: "facebook", network: "Facebook", status: "pending", url: null, note: PENDING_NOTE },
  { id: "x", network: "X", status: "pending", url: null, note: PENDING_NOTE },
  { id: "youtube", network: "YouTube", status: "pending", url: null, note: PENDING_NOTE },
  { id: "tiktok", network: "TikTok", status: "pending", url: null, note: PENDING_NOTE },
  { id: "discord", network: "Discord", status: "pending", url: null, note: PENDING_NOTE },
  { id: "slack", network: "Slack", status: "pending", url: null, note: PENDING_NOTE },
  { id: "telegram", network: "Telegram", status: "pending", url: null, note: PENDING_NOTE },
] as const;

export const VERIFIED_SOCIAL_CHANNELS: readonly SocialRegistryEntry[] =
  SOCIAL_REGISTRY.filter((entry) => entry.status === "verified" && entry.url !== null);

export const PENDING_SOCIAL_CHANNELS: readonly SocialRegistryEntry[] =
  SOCIAL_REGISTRY.filter((entry) => entry.status === "pending");

export function getVerifiedSocialChannels(): SocialRegistryEntry[] {
  return [...VERIFIED_SOCIAL_CHANNELS];
}

export function getPendingSocialChannels(): SocialRegistryEntry[] {
  return [...PENDING_SOCIAL_CHANNELS];
}
