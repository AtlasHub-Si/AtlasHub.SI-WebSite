# AtlasHub.SI — Official Institutional Website

**Portfolio status:** Primary institutional experience; deployment unverified.

Present AtlasHub's global product ecosystem and route visitors to official product experiences. Galaxy is the complementary ecosystem showcase and future role-aware entry point. Keep product status, corporate information, contacts and technology references accurate.

> Existing engineering reference below is retained for provenance. The [AtlasHub institutional profile](https://github.com/AtlasHub-Si) defines current product scope.

---

# AtlasHub.SI V2 — Living Ecosystem

Website institucional da AtlasHub.SI: cinco portais (AtlasHQ, AtlasBot, Club Atlas, AtlasCortex e GWD), consultoria, ecossistema, Clara e navegação em português, inglês, francês e espanhol.

Repositório oficial: https://github.com/AtlasHub-Si/AtlasHub.SI-WebSite

## Desenvolvimento

Next.js 16 App Router, React 19, TypeScript e Node.js 24.x. Tailwind CSS 4, Motion e Three.js com carregamento sob demanda e alternativas 2D. Inter, Manrope e JetBrains Mono são alojadas localmente.

Instalar com npm ci e iniciar com npm run dev. Validar com npm run typecheck, npm run lint, npm test e npm run build. Produção local: npm start.

As páginas institucionais vivem em /pt, /en, /fr e /es. A raiz escolhe o idioma guardado ou português. A experiência espacial é opcional em /{locale}/experience; workshops e checkout mantêm os seus contratos e gates comerciais.

## Documentação e estado da entrega

- [Índice técnico](docs/README.md)
- [Arquitetura e decisões V2](docs/V2_MIGRATION_AND_DECISIONS.md)
- [Sistema visual](docs/DESIGN_SYSTEM_V2.md) e [catálogo de assets](docs/ASSET_CATALOG.md)
- [Revisão de publicação no GitHub](docs/REPOSITORY_REPLACEMENT.md)
- [Pendências de produção](docs/APPROVAL_BOARD.md)
- [Publicação e integrações](DEPLOYMENT.md)

A V2 substitui o projeto anterior através de um commit inicial sem ascendentes. A publicação do código não comprova deploy, domínio, integração CRM, vendas homologadas ou aprovação jurídica. O relatório de QA existente regista metas de desempenho ainda não cumpridas; consultar a revisão da entrega.


---
[AtlasHub.SI](https://atlashub.si) · [Galaxy](https://github.com/AtlasHub-Si/AtlasHub-Command-Center) · London · Lisbon · Goiânia
