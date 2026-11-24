# AtlasHub.SI V2.0 — Living Ecosystem Design System

Visual specification governing typography, surface polarity, chromatic portals, brand components, motion budgets, and WCAG 2.2 AA accessibility across AtlasHub.SI V2.0.

## 1. Living Atlas Surface Polarity & Palette

AtlasHub.SI balances deep **Mineral Graphite** atmospheric canvases with **Warm Pearl** editorial daylight bands for consulting, methodology, and trust sections. Saturated blues and cyans are strictly rationed to active cues, directional focus, and focal highlights—never full-page floods.

| Role | Token | Hex / Value | Usage |
| --- | --- | --- | --- |
| Primary Dark Canvas | `--atlas-bg` | `#080D12` | Page ground, hero cosmos backdrop |
| Dark Surface | `--atlas-surface` | `#0E151D` | Elevated sections, structural bands |
| Raised Dark Surface | `--atlas-surface-raised` | `#172027` | Cards, panels, interactive drawers |
| Warm Pearl Band | `--atlas-pearl` | `#EDEBE5` | Editorial daylight consulting & methodology bands |
| Warm Pearl Raised | `--atlas-pearl-raised` | `#F6F5F1` | Elevated daylight cards (`atlas-pearl-card`) |
| Warm Pearl Ink | `--atlas-pearl-ink` | `#17212B` | Primary headings & body copy inside `.atlas-pearl-band` |
| Warm Pearl Muted | `--atlas-pearl-muted` | `#475569` | Secondary copy inside `.atlas-pearl-band` |
| Champagne Gold | `--atlas-gold` / `--atlas-gold-bright` | `#CDA66C` / `#E5C287` | Brand warmth, borders, focus rings, key word accents |
| Gold on Pearl | `--atlas-gold-pearl` | `#7D5720` | AA-compliant gold accent text on Warm Pearl |
| Light Ink | `--atlas-ink` | `#ECF4F6` | Primary text on Mineral Graphite |
| Muted Mineral | `--atlas-muted` | `#94A8B8` | Metadata, secondary labels on dark surfaces |
| Platinum Silver | `--atlas-silver` | `#CBD5E1` | Secondary body copy, metallic highlights |
| Restrained Energy | `--atlas-cyan` / `--atlas-blue` | `#36BDD0` / `#1377DF` | Active energy paths, focal cues, `.SI` accent only |

## 2. Typography

- **Body & UI:** `Inter` (`--font-inter`, self-hosted) — default readable copy (`16px` base, `17–19px` body lead, max `70–80ch` line length).
- **Editorial Headlines & Wordmark:** `Manrope` (`--font-manrope`, `@fontsource/manrope`, weights `400–700`) — tight tracking (`-0.025em`), fluid `clamp()` sizing.
- **Technical Metadata & Maturity Badges:** `JetBrains Mono` (`--font-jetbrains-mono`, `@fontsource/jetbrains-mono`, weights `400–500`) — strictly for indices (`01 / 05`), maturity tags, provenance records, and log timestamps.

## 3. Five Portals — Chromatic Matrix

All five portals share Mineral Graphite frosted framing (`PortalChromaticFrame`) while expressing a distinct chromatic signature from `PORTAL_THEME_TOKENS`:

| Portal (`PortalId`) | Primary Accent | Secondary Accent | Maturity |
| --- | --- | --- | --- |
| `atlashq` | `#36BDD0` (Cyan) | `#2DD4BF` (Emerald Teal) | `DEMO` |
| `atlasbot` | `#22D3EE` (Electric Cyan) | `#818CF8` (Indigo) | `DEMO` |
| `club-atlas` | `#E5A952` (Warm Gold) | `#F59E0B` (Amber) | `IMPLEMENTED` |
| `atlascortex` | `#A78BFA` (Violet) | `#2DD4BF` (Deep Teal) | `PILOT` |
| `gwd` | `#CDA66C` (Champagne Gold) | `#3B82F6` (Cosmic Blue) | `PILOT` |

## 4. Brand Mark & Truth Governance

- **Institutional Mark (`AtlasPrismMark`):** Precision faceted geometric `"A"` SVG combining brushed platinum-silver wings, champagne-gold interlocking base crossbar, and restrained energy-cyan/Atlas-blue apex facet. Always uses React `useId()` to isolate SVG `<defs>`.
- **Wordmark (`AtlasLogo`):** Combines `AtlasPrismMark` with `AtlasHub.SI` in `Manrope` across `dark` and `pearl` variants plus optional `"Intelligence for the Augmented Enterprise"` tagline.
- **Strict Prohibitions:** Never substitute the AtlasBot mascot character for the institutional AtlasHub.SI logo, and never emit the legacy historical misnomer anywhere in copy, code, or metadata.
- **Editorial Truth (`MaturityBadge`):** Every capability, simulation, or portal card MUST render its explicit maturity status (`VERIFIED`, `IMPLEMENTED`, `DEMO`, `PILOT`, `PROPOSED`, `HISTORICAL`) styled via `MATURITY_STYLES`.

## 5. Motion, Glass & Portal Dive Budgets

- **Duration Scale (`ATLAS_TOKENS.motionMs`):** Micro hover/focus `150ms`, standard menu/panel `280ms`, Portal Dive shared-element expansion `550ms`, narrative phase `1800ms`, ambient cycle `20000ms`.
- **Portal Window Interaction:** Hover/focus elevates `6px` with `<= 1.5deg` perspective tilt and warms the portal hairline border (`PortalChromaticFrame`).
- **Frosted Glass Discipline:** Use `.atlas-glass` and `.atlas-glass-raised` sparingly for header, portal overlays, and Clara trigger/drawer; mobile breakpoints throttle `backdrop-filter` blur radius to protect INP.
- **Mandatory Motion Opt-Out:** Both `@media (prefers-reduced-motion: reduce)` and `:root[data-reduced-motion="true"]` disable smooth scrolling, transitions, marquee motion, and hover tilt.

## 6. Accessibility (WCAG 2.2 AA)

- **Focus Rings:** Crisp `2px solid #E5C287` (`outline-offset: 2px`) across dark Mineral Graphite surfaces; inside `.atlas-pearl-band`, dual-ring `2px solid #17212B` with `#E5C287` halo preserves visibility against daylight surfaces.
- **Contrast Discipline:** Secondary ink switches cleanly between `--atlas-muted` (`#94A8B8`) on dark graphite and `--atlas-pearl-muted` (`#475569`) on Warm Pearl; gold text on Pearl uses `--atlas-gold-pearl` (`#7D5720`).

## 7. Canonical Exports

- `lib/v2/design-tokens.ts`: `ATLAS_TOKENS`, `PORTAL_THEME_TOKENS`, `MATURITY_STYLES`, `getPortalTheme`, `getMaturityStyle`
- `app/globals.css`: Tailwind v4 `@import "tailwindcss";`, `@theme inline`, CSS semantic vars, `.atlas-pearl-band`, `.atlas-glass*`, `.atlas-portal-frame`, `.atlas-marquee*`, and reduced-motion overrides
- `components/brand/AtlasPrismMark.tsx`: `AtlasPrismMark`
- `components/brand/AtlasLogo.tsx`: `AtlasLogo`
- `components/brand/MaturityBadge.tsx`: `MaturityBadge`
- `components/brand/PortalChromaticFrame.tsx`: `PortalChromaticFrame`
