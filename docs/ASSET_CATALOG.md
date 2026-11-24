# AtlasHub.SI V2.0 — Visual & Documentary Asset Catalog

## 1. Authoritative Source Materials (`C:\Users\conta\Documents\AntiGravity-Data\AtlasHub-WebSite` — Read-Only)

| File | Format / Dimensions | Role & Evaluation |
|---|---|---|
| `ATLAS_ECOSYSTEM_V2_DOSSIER_MESTRE.md` (`.pdf`, `.docx`) | Markdown / PDF / DOCX (50 KB) | Primary architectural & editorial specification (`CONCEPT / SPECIFICATION`), superseded only by explicit Mission directives where noted. |
| `PROMPT_REVISAO_INDEPENDENTE.md` & `README_ENTREGA.md` | Markdown | Independent governance checklist and asset disclaimer ("conceptual renders are not production masters"). |
| `maquetes/01_portais_A_dark.png` | PNG (`1536×512`) | **Primary Homepage Reference:** Dark Graphite mineral field, Champagne Gold accent, Prismatic `A` + Earth horizon, 5 portal windows, Clara trigger bottom-right. |
| `maquetes/02_portais_B_light.png` | PNG (`1536×512`) | **Pearl Editorial Reference:** Warm Pearl (`#EDEBE5`) daylight contrast aesthetic used for Consulting, Methodology & Trust sections. |
| `maquetes/03_ecossistema_A_dark.png` & `04_ecossistema_B_light.png` | PNG (`1536×512`) | **Ecosystem Bridge & `/ecosystem` Route Reference:** `Um ecossistema, múltiplos mundos · Pessoas / Agentes / Conhecimento`. |
| `maquetes/05_multiverse_exploration.png` | PNG (`1672×941`) | **Multiverse Opt-In Reference (`/experience`):** 5 tall glass portal monoliths, Guided & Free tour controls. |
| `AtlasHub.SI_ Dual Cinematic Ecosystems-1.png` | PNG (`1536×1024`) | Composite panel combining `01` and `02`. |
| `AtlasHub.SI_ Dual Ecosystem Concepts-3.png` | PNG (`1536×1024`) | Composite panel combining `03` and `04`. |
| `AtlasHub.SI_ Ecossistema AI-Native Fтurista-2.png` | PNG (`1672×941`) | Duplicate of `05_multiverse_exploration.png`. |

## 2. Production V2 Web Assets (`public/v2/`)

All production visual assets are stored locally in WebP format (`public/v2/`) with exact SHA-256 checksums tracked in `public/v2/asset-manifest.json`, zero unapproved mockup text baked into images, and zero runtime calls to external image URLs.

| Output Path | Source / Generation Method | Dimensions | Intended Component / Portal |
|---|---|---|---|
| `public/v2/scenes/hero-earth.webp` | `GWD_GENESIS/atlas-si-website-v2/.../earth.webp` | Optimized RGBA WebP | Living Atlas Hero planetary horizon layer |
| `public/v2/scenes/hero-cosmos.webp` | `GWD_GENESIS/atlas-si-website-v2/.../cosmos.webp` | `1440×810` | Hero & Multiverse ambient deep-space backdrop |
| `public/v2/scenes/portal-atlashq.webp` (+ `-640.webp`) | `PackVisual_AtlasHub/Team_AtlasHub/Atlas_Office_Real.png` (graded Graphite/Cyan) | `1200×675` / `640×360` | Portal 01 — AtlasHQ window poster & scene stage |
| `public/v2/scenes/portal-atlasbot-bg.webp` (+ `-640.webp`) | Procedural atmospheric midnight-indigo & volumetric cyan/violet stage over `cosmos.webp` | `1200×675` / `640×360` | Portal 02 — AtlasBot backdrop behind approved mascots |
| `public/v2/mascots/{guide,analyst,builder,creator,flow,shield}-{640,960}.webp` | `GWD_GENESIS/atlas-si-website-v2/_reference/03_WEB_OPTIMIZED/` (approved DEV pack) | `640px` / `960px` | Portal 02 — AtlasBot Guide & intelligent team |
| `public/v2/scenes/portal-clubatlas.webp` (+ `-640.webp`) | `PackVisual_AtlasHub/Team_AtlasHub/Team_Atlas_Reuniao.png` (warm amber grade) | `1200×675` / `640×360` | Portal 03 — Club Atlas window poster |
| `public/v2/scenes/club-learner.webp` | `PackVisual_AtlasHub/Team_AtlasHub/Perfil_Laura_Escritorio.png` (warm grade) | `960×540` | Portal 03 — Club Atlas learning module & `/ecosystem` |
| `public/v2/scenes/portal-atlascortex.webp` (+ `-640.webp`) | Headless Chrome Three.js WebGL 3D Spiral Knowledge Galaxy render | `1200×675` / `640×360` | Portal 04 — AtlasCortex LCP poster & reduced-motion fallback |
| `public/v2/scenes/portal-gwd.webp` (+ `-640.webp`) | Headless Chrome Three.js WebGL Champagne-Gold & Navy Waterfront Campus render | `1200×675` / `640×360` | Portal 05 — GWD portal poster & backdrop |
| `public/v2/clara-avatar.webp` | `PackVisual_AtlasHub/Perfil_Clara.png` | `256×256` | Clara Concierge drawer & CTA badge |
| `public/v2/clara-portrait.webp` | `PackVisual_AtlasHub/Clara_Recepçao.png` | `640w` | Clara Concierge invitation section |
| `public/v2/diana-avatar.webp` | `Atlas_Studio_Media/.../Diana_Welcome.mp4` executive frame (`1.5s`) | `360×450` | Portal 05 — GWD Diana narrator avatar |

### Brand Identity Governance Note
- **Institutional Mark:** Reversible geometric Prismatic `A` SVG (`components/brand/AtlasPrismMark.tsx`) inspired by verified vector geometry in `AtlasHQ/workspace/frontend/public/atlashq-mark.svg`, paired with `AtlasHub.SI` editorial typography (`AtlasLogo.tsx`).
- **Prohibited Substitutions:** AtlasBot 3D velvet mascot is strictly confined to AtlasBot product contexts; `Atlas-Hardness` historical typo is prohibited in all V2 files.
