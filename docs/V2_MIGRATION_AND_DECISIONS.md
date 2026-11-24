# AtlasHub.SI V2.0 — Migration Notes & Architecture Decisions

## 1. Architectural Direction ("Living Ecosystem")

AtlasHub.SI V2.0 unifies the institutional web presence around the **Living Atlas** visual language and multi-portal architecture while preserving all production backend, ARO commerce, and lead-intake contracts:

- **Surface Polarity:** Deep **Mineral Graphite** (`#080D12`, `#0E151D`, `#172027`) establishes atmospheric depth for hero, portal showcase, governance layers, and institutional footer; **Warm Pearl** (`#EDEBE5`, `#F6F5F1`, `#17212B`) frames editorial daylight consulting (`PearlConsultingBand`) and execution methodology (`MethodologyBand`).
- **Typography:** Self-hosted `Inter` (`next/font/local`, `app/inter-latin-wght-normal.woff2`) for UI/body, `@fontsource/manrope` (`400`, `500`, `600`, `700`) for display headlines and wordmark, and `@fontsource/jetbrains-mono` (`400`, `500`) strictly for indices, maturity badges, and provenance records.
- **Five Distinct Portals (`PortalDiveStage` + `/[locale]/portals/[slug]`):**
  1. `atlashq` (`DEMO`) — Collaborative Human + Agent workspace (`NeX`)
  2. `atlasbot` (`DEMO`) — Personal, Family & Teams companion (`Guide` + approved DEV mascot roster)
  3. `club-atlas` (`IMPLEMENTED`) — Community, applied learning & Genesis tracks
  4. `atlascortex` (`PILOT`) — Organizational memory (`Obsidian` + `Git` + `GBrain`) with dynamic Three.js 3D Galaxy and searchable 2D fallback
  5. `gwd` (`PILOT`) — Independent AI-Native Venture Group presentation (`GoWorld.Digital`, `explore.goworld.digital`)
- **Opt-In Spatial Experience (`/[locale]/experience`):** Client-only `MultiverseExperience` (`noindex`, excluded from `public/sitemap.xml`) with Guided Tour, Free Explore, Escape/Exit control, and full 2D accessible fallback.

## 2. Technical & Library Decisions

| Area | Decision | Rationale |
| --- | --- | --- |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + semantic tokens in `app/globals.css` & `lib/v2/design-tokens.ts` | Single utility/token foundation across Graphite and Pearl bands; replaces fragmented V1 CSS sheets |
| Motion | `motion/react` + Canvas 2D `LivingParticleField` + `MotionProvider` | Respects `prefers-reduced-motion`, persists user opt-out in `localStorage`, and pauses loops when tabs or fullscreen overlays hide the hero |
| 3D WebGL | Client-only `three` (`CortexGalaxy3D`, `MultiverseThreeCanvas`) dynamically loaded & governed | Keeps SSR/LCP unblocked; provides immediate 2D accessible fallbacks on WebGL failure or reduced motion |
| i18n | Route-segmented `/pt`, `/en`, `/fr`, `/es` (`LocaleDictionary` in `lib/v2/i18n/*`) | Typed 4-locale parity, localized `canonical` + `hreflang` + `x-default`, and `atlas_locale` cookie persistence on `/` |
| Security | Strict HTTP security headers in `next.config.ts` | Enforces CSP (`default-src 'self'`, `object-src 'none'`, `connect-src 'self'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and restrictive `Permissions-Policy` |

## 3. Preserved Backend, Lead & Workshop Commerce Contracts

All server APIs, validation schemas, database/PostgreSQL adapters, and ARO PIX commerce logic remain intact:

- **Lead Intake:** `app/api/lead/route.ts`, `lib/leads.ts`, `app/api/fr/lead/route.ts`, `lib/francophonie-leads.ts` (`ClaraConcierge` and `ContactPageView` align 1:1 with `validateLead` options, UUID `requestId`, honeypot, and mandatory explicit `consent`).
- **ARO Commerce & Workshops:** `aro.project.yaml`, `lib/aro/**`, `lib/commerce/**`, `lib/sales/**`, `lib/workshops.ts`, `app/api/aro/webhook/route.ts`, `app/api/workshops/**`, `app/api/sales/ll01/**`, `components/Workshops.tsx`, `components/WorkshopSignup.tsx`, `components/CheckoutView.tsx`, and `tests/workshops.test.ts`.
- **Workshop Shell Alignment:** `app/workshops/**` and `components/WorkshopDetail.tsx` now wrap preserved content and checkout flows with `SiteHeader`, `SiteFooter`, and scoped `app/workshops/workshops.css`, retaining `robots: { index: false }` on pre-launch workshops and excluding `/workshops` from `public/sitemap.xml`.

## 4. Removed Legacy Frontend Assets & 308 Redirect Map

Superseded V1 landing components (`components/{Header,Footer,Hero,ArchitectureHero,Offers,Areas,Cases,Clara,Closing,ClubBridge,CommercialPackages,Ecosystem,Editions,Method,MockupCanvas,OfferTabs,OperationLab,RoleLibrary,SalesLanding,SalesQuickReserve,SiteInteractions,FrancophonieLeadForm,AroCheckoutSheet}.tsx`), fragmented V1 stylesheets (`app/{tokens,theme,mockup,cro-v2,architecture-v2,commercial-packs}.css`), and legacy V1 landing tests (`tests/{cro-v2,experience-v2,mockups,simulation,site}.test.ts`) were retired.

Legacy routes preserve continuity via Next.js `permanentRedirect` (HTTP 308) or direct localized routing:

| Legacy Path | V2 Destination | Mechanism |
| --- | --- | --- |
| `/` | `/pt` (or saved `atlas_locale` cookie) | `app/page.tsx` |
| `/fr` | `/fr` (`locale = "fr"`) | Direct `app/[locale]/page.tsx` (removed old static `app/fr/page.tsx` conflict) |
| `/sobre` | `/pt/company` | `permanentRedirect` (`app/sobre/page.tsx`) |
| `/metodo` | `/pt/consulting` | `permanentRedirect` (`app/metodo/page.tsx`) |
| `/diagnostico` | `/pt/contact` | `permanentRedirect` (`app/diagnostico/page.tsx`) |
| `/solucoes/ai-workforce` | `/pt/solutions` | `permanentRedirect` (`app/solucoes/ai-workforce/page.tsx`) |
| `/solucoes/enterprise-transformation` | `/pt/consulting` | `permanentRedirect` (`app/solucoes/enterprise-transformation/page.tsx`) |
| `/casos` | `/pt/projects` | `permanentRedirect` (`app/casos/page.tsx`) |
| `/academy` | `/pt/programs-and-communities` | `permanentRedirect` (`app/academy/page.tsx`) |
| `/servicos/setup-agentico` | `/pt/solutions` | `permanentRedirect` (`app/servicos/setup-agentico/page.tsx`) |

## 5. Summary of Architecture Decision Records (ADRs)

- **ADR-V2-01 (Single Canonical Institutional Home):** `/{locale}` serves the unified Portals home; `/ecosystem` provides structured directory depth; `/experience` operates as an opt-in spatial showcase (`noindex`) without duplicating institutional SEO targets.
- **ADR-V2-02 (Editorial Truth & Registry Separation):** `lib/v2/technology-registry.ts` strictly isolates `technologies_used` and `communities_and_programs` from `verified_partnerships` (`[]`), while `MaturityBadge` enforces explicit classification (`VERIFIED | IMPLEMENTED | DEMO | PILOT | PROPOSED | HISTORICAL`) across all UI capabilities.
- **ADR-V2-03 (Lazy Portal & WebGL Boundaries):** Heavy 3D/scene modules (`CortexGalaxy3D`, `MultiverseThreeCanvas`, and portal scenes inside `PortalSceneRouter`) load client-side on demand with explicit reduced-motion and 2D fallbacks.
