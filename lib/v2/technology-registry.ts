import type { Locale, TechRegistryEntry } from "./types";

const NOTE_TECH_USED = (
  pt: string,
  en: string,
  fr: string,
  es: string,
): Record<Locale, string> => ({ pt, en, fr, es });

/**
 * Technologies actively used or evaluated in the AtlasHub.SI engineering stack.
 * Listed strictly as technical tools — never implies commercial partnership or endorsement.
 */
export const technologies_used: readonly TechRegistryEntry[] = [
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend_runtime",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://nextjs.org",
    monogram: "NX",
    evidenceNote: NOTE_TECH_USED(
      "Framework React App Router utilizada na interface institucional.",
      "React App Router framework used for the institutional web application.",
      "Framework React App Router utilisé pour l'application web institutionnelle.",
      "Framework React App Router utilizado en la aplicación web institucional.",
    ),
  },
  {
    id: "react",
    name: "React",
    category: "frontend_runtime",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://react.dev",
    monogram: "RC",
    evidenceNote: NOTE_TECH_USED(
      "Biblioteca de interface utilizada nos componentes interativos e cenas de portal.",
      "UI library used across interactive components and portal scenes.",
      "Bibliothèque d'interface utilisée pour les composants interactifs et les scènes de portail.",
      "Biblioteca de interfaz utilizada en componentes interactivos y escenas de portal.",
    ),
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "frontend_runtime",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://www.typescriptlang.org",
    monogram: "TS",
    evidenceNote: NOTE_TECH_USED(
      "Tipagem estrita aplicada aos contratos de dados, internacionalização e APIs.",
      "Strict typing applied across data contracts, localization, and APIs.",
      "Typage strict appliqué aux contrats de données, à l'internationalisation et aux API.",
      "Tipado estricto aplicado a contratos de datos, internacionalización y APIs.",
    ),
  },
  {
    id: "tailwind-css",
    name: "Tailwind CSS",
    category: "frontend_runtime",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://tailwindcss.com",
    monogram: "TW",
    evidenceNote: NOTE_TECH_USED(
      "Sistema utilitário de estilos acoplado aos tokens semânticos Living Atlas.",
      "Utility CSS system paired with Living Atlas semantic design tokens.",
      "Système CSS utilitaire associé aux jetons sémantiques Living Atlas.",
      "Sistema CSS utilitario acoplado a los tokens semánticos Living Atlas.",
    ),
  },
  {
    id: "python",
    name: "Python",
    category: "frontend_runtime",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://www.python.org",
    monogram: "PY",
    evidenceNote: NOTE_TECH_USED(
      "Linguagem utilizada em serviços de orquestração, automação e tratamento de media.",
      "Language used in orchestration services, automation, and media pipelines.",
      "Langage utilisé dans les services d'orchestration, d'automatisation et de traitement média.",
      "Lenguaje utilizado en servicios de orquestación, automatización y tratamiento multimedia.",
    ),
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "data_knowledge",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://www.postgresql.org",
    monogram: "PG",
    evidenceNote: NOTE_TECH_USED(
      "Base de dados relacional utilizada em persistência transacional e registos operacionais.",
      "Relational database used for transactional persistence and operational records.",
      "Base de données relationnelle utilisée pour la persistance transactionnelle et les journaux opérationnels.",
      "Base de datos relacional utilizada para persistencia transaccional y registros operacionales.",
    ),
  },
  {
    id: "docker",
    name: "Docker",
    category: "cloud_infra",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://www.docker.com",
    monogram: "DK",
    evidenceNote: NOTE_TECH_USED(
      "Contentorização utilizada para isolamento de ambientes e execução reprodutível.",
      "Containerization used for environment isolation and reproducible execution.",
      "Conteneurisation utilisée pour l'isolation des environnements et l'exécution reproductible.",
      "Contenerización utilizada para aislamiento de entornos y ejecución reproducible.",
    ),
  },
  {
    id: "github",
    name: "GitHub",
    category: "cloud_infra",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://github.com/AtlasHub-Si",
    guidelineUrl: "https://brand.github.com/",
    monogram: "GH",
    evidenceNote: NOTE_TECH_USED(
      "Alojamento de código, versionamento Git e revisão de alterações em produção.",
      "Source code hosting, Git versioning, and change review workflows.",
      "Hébergement de code source, gestion de versions Git et revue des modifications.",
      "Alojamiento de código fuente, control de versiones Git y revisión de cambios.",
    ),
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "cloud_infra",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://vercel.com",
    monogram: "VC",
    evidenceNote: NOTE_TECH_USED(
      "Plataforma de publicação e pré-visualização utilizada para aplicações web Next.js.",
      "Deployment and preview platform used for Next.js web applications.",
      "Plateforme de déploiement et de prévisualisation utilisée pour les applications web Next.js.",
      "Plataforma de despliegue y previsualización utilizada para aplicaciones web Next.js.",
    ),
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "cloud_infra",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://www.cloudflare.com",
    monogram: "CF",
    evidenceNote: NOTE_TECH_USED(
      "Gestão de DNS, encaminhamento e camadas de proteção de rede.",
      "DNS management, edge routing, and network protection layers.",
      "Gestion DNS, routage périphérique et couches de protection réseau.",
      "Gestión de DNS, enrutamiento y capas de protección de red.",
    ),
  },
  {
    id: "aws",
    name: "AWS",
    category: "cloud_infra",
    relationshipType: "tested",
    status: "verified",
    externalUrl: "https://aws.amazon.com",
    monogram: "AW",
    evidenceNote: NOTE_TECH_USED(
      "Infraestrutura cloud avaliada e utilizada em cargas selecionadas; não implica parceria AWS.",
      "Cloud infrastructure evaluated and used in selected workloads; implies no AWS partnership.",
      "Infrastructure cloud évaluée et utilisée sur certaines charges ; n'implique aucun partenariat AWS.",
      "Infraestructura cloud evaluada y utilizada en cargas seleccionadas; no implica alianza con AWS.",
    ),
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    category: "cloud_infra",
    relationshipType: "tested",
    status: "verified",
    externalUrl: "https://cloud.google.com",
    guidelineUrl: "https://about.google/brand-resource-center/guidance/partnerships/",
    monogram: "GC",
    evidenceNote: NOTE_TECH_USED(
      "Serviços cloud utilizados/avaliados em engenharia; não confere estatuto de parceiro comercial.",
      "Cloud services used and evaluated in engineering; does not confer commercial partner status.",
      "Services cloud utilisés et évalués en ingénierie ; ne confère pas le statut de partenaire commercial.",
      "Servicios cloud utilizados y evaluados en ingeniería; no otorga condición de socio comercial.",
    ),
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    category: "cloud_infra",
    relationshipType: "tested",
    status: "verified",
    externalUrl: "https://www.nvidia.com",
    monogram: "NV",
    evidenceNote: NOTE_TECH_USED(
      "Stack de aceleração GPU avaliado para computação e inferência; sem endosso comercial.",
      "GPU acceleration stack evaluated for compute and inference; implies no commercial endorsement.",
      "Pile d'accélération GPU évaluée pour le calcul et l'inférence ; sans parrainage commercial.",
      "Pila de aceleración GPU evaluada para cómputo e inferencia; sin respaldo comercial.",
    ),
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "data_knowledge",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://supabase.com",
    monogram: "SB",
    evidenceNote: NOTE_TECH_USED(
      "Camada Postgres e autenticação avaliada e utilizada em protótipos e produtos internos.",
      "Postgres and authentication stack evaluated and used in prototypes and internal products.",
      "Couche Postgres et authentification évaluées et utilisées dans des prototypes et produits internes.",
      "Capa Postgres y autenticación evaluada y utilizada en prototipos y productos internos.",
    ),
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "data_knowledge",
    relationshipType: "tested",
    status: "verified",
    externalUrl: "https://firebase.google.com",
    monogram: "FB",
    evidenceNote: NOTE_TECH_USED(
      "Serviços de aplicação e telemetria avaliados em fluxos selecionados.",
      "Application and telemetry services evaluated in selected workflows.",
      "Services applicatifs et télémétrie évalués sur certains flux.",
      "Servicios de aplicación y telemetría evaluados en flujos seleccionados.",
    ),
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    category: "ai_models",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://openrouter.ai",
    monogram: "OR",
    evidenceNote: NOTE_TECH_USED(
      "Camada de encaminhamento multi-modelo avaliada para interoperabilidade controlada.",
      "Multi-model routing layer evaluated for controlled model interoperability.",
      "Couche de routage multi-modèles évaluée pour une interopérabilité contrôlée.",
      "Capa de enrutamiento multimodelo evaluada para interoperabilidad controlada.",
    ),
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "ai_models",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://openai.com",
    guidelineUrl: "https://openai.com/brand/",
    monogram: "OA",
    evidenceNote: NOTE_TECH_USED(
      "APIs de modelos de linguagem utilizadas conforme termos aplicáveis; sem parceria comercial.",
      "Language model APIs integrated under standard terms; implies no commercial partnership.",
      "API de modèles de langage utilisées selon les conditions standard ; sans partenariat commercial.",
      "APIs de modelos de lenguaje integradas bajo términos estándar; sin alianza comercial.",
    ),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    category: "ai_models",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://www.anthropic.com",
    monogram: "AN",
    evidenceNote: NOTE_TECH_USED(
      "Modelos Claude avaliados e utilizados em fluxos assistidos e engenharia de software.",
      "Claude models evaluated and used in assisted workflows and software engineering.",
      "Modèles Claude évalués et utilisés dans des flux assistés et en génie logiciel.",
      "Modelos Claude evaluados y utilizados en flujos asistidos e ingeniería de software.",
    ),
  },
  {
    id: "obsidian",
    name: "Obsidian",
    category: "data_knowledge",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://obsidian.md",
    monogram: "OB",
    evidenceNote: NOTE_TECH_USED(
      "Editor Markdown local utilizado na organização documental do ecossistema AtlasCortex.",
      "Local Markdown workspace used in document organization workflows for AtlasCortex.",
      "Éditeur Markdown local utilisé pour l'organisation documentaire dans AtlasCortex.",
      "Editor Markdown local utilizado en la organización documental de AtlasCortex.",
    ),
  },
  {
    id: "gbrain",
    name: "GBrain",
    category: "data_knowledge",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://github.com/AtlasHub-Si/Atlas-Cortex",
    monogram: "GB",
    evidenceNote: NOTE_TECH_USED(
      "Motor de indexação e recuperação semântica utilizado em pilotos do AtlasCortex.",
      "Indexing and semantic retrieval engine used in AtlasCortex knowledge pilots.",
      "Moteur d'indexation et de recherche sémantique utilisé dans les pilotes AtlasCortex.",
      "Motor de indexación y recuperación semántica utilizado en pilotos de AtlasCortex.",
    ),
  },
  {
    id: "kilo-code",
    name: "Kilo Code",
    category: "ai_models",
    relationshipType: "used",
    status: "verified",
    externalUrl: "https://kilocode.ai",
    monogram: "KC",
    evidenceNote: NOTE_TECH_USED(
      "Ferramenta de apoio ao desenvolvimento utilizada em fluxos internos de engenharia.",
      "Developer assistance tool used within internal engineering workflows.",
      "Outil d'assistance au développement utilisé dans les flux d'ingénierie internes.",
      "Herramienta de asistencia al desarrollo utilizada en flujos internos de ingeniería.",
    ),
  },
] as const;

/**
 * Developer communities and startup programs kept strictly separate from commercial partnerships.
 */
export const communities_and_programs: readonly TechRegistryEntry[] = [
  {
    id: "google-cloud-nvidia-community",
    name: "Google Cloud & NVIDIA Developer Community",
    category: "communities_programs",
    relationshipType: "community_member",
    status: "verified",
    externalUrl: "https://developers.google.com/community/nvidia",
    guidelineUrl: "https://about.google/brand-resource-center/guidance/partnerships/",
    monogram: "GN",
    evidenceNote: NOTE_TECH_USED(
      "Participação na comunidade técnica conjunta de developers; não confere estatuto de parceiro comercial Google Cloud ou NVIDIA.",
      "Technical participation in the joint developer community; does not confer Google Cloud or NVIDIA commercial partner status.",
      "Participation technique à la communauté de développeurs ; ne confère pas le statut de partenaire commercial Google Cloud ou NVIDIA.",
      "Participación técnica en la comunidad de desarrolladores; no otorga condición de socio comercial de Google Cloud ni NVIDIA.",
    ),
  },
  {
    id: "aws-activate",
    name: "AWS Activate",
    category: "communities_programs",
    relationshipType: "program_participant",
    status: "pending",
    externalUrl: "https://aws.amazon.com/activate/",
    guidelineUrl: "https://aws.amazon.com/activate/terms/",
    monogram: "AA",
    evidenceNote: NOTE_TECH_USED(
      "Programa para startups — estatuto em confirmação documental; não equivale a filiação na AWS Partner Network.",
      "Startup program — participation status pending formal confirmation; not equivalent to AWS Partner Network membership.",
      "Programme pour startups — statut en attente de confirmation documentaire ; n'équivaut pas à l'adhésion à l'AWS Partner Network.",
      "Programa para startups — estado pendiente de confirmación documental; no equivale a membresía en AWS Partner Network.",
    ),
  },
] as const;

/**
 * Intentionally empty until signed partnership agreements and brand authorization proofs exist.
 */
export const verified_partnerships: readonly TechRegistryEntry[] = [] as const;

export const TECHNOLOGY_REGISTRY = {
  technologies_used,
  communities_and_programs,
  verified_partnerships,
} as const;

export const ALL_TECH_ENTRIES: readonly TechRegistryEntry[] = [
  ...technologies_used,
  ...communities_and_programs,
  ...verified_partnerships,
];

export function getTechnologiesUsed(): TechRegistryEntry[] {
  return [...technologies_used];
}

export function getCommunitiesAndPrograms(): TechRegistryEntry[] {
  return [...communities_and_programs];
}

export function getVerifiedPartnerships(): TechRegistryEntry[] {
  return [...verified_partnerships];
}

export function getTechEntriesByCategory(
  category: TechRegistryEntry["category"],
): TechRegistryEntry[] {
  return ALL_TECH_ENTRIES.filter((entry) => entry.category === category);
}
