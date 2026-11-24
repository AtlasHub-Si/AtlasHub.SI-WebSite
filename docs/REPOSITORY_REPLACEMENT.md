# Substituição do repositório — AtlasHub.SI V2

Data da revisão: 24/11/2026 (America/Sao_Paulo).

## Âmbito autorizado

Substituir `AtlasHub-Si/AtlasHub.SI-WebSite` pelo estado de trabalho local de `C:\Users\conta\Documents\AntiGravity-Data\AtlasHub.SI-WebSite`, incluindo alterações ainda não commitadas. Criar um único commit inicial sem pais, substituir `main` e eliminar a outra branch remota antiga (`feat/atlashub-v2-living-ecosystem`). Não criar branches, tags ou ficheiros de backup do projeto antigo.

O snapshot inclui o código, os assets e a documentação do projeto atual. Exclui dependências, builds, metadados Git, configuração local do editor e segredos. Documentos e maquetes que já pertencem ao projeto atual são referências de desenvolvimento, não cópias recuperadas do repositório antigo.

## Resultado da análise

- A arquitetura V2 corresponde a cinco portais, quatro idiomas, identidade Graphite/Pearl e Clara, com alternativas de movimento reduzido e 2D.
- Os contratos de leads, ARO, workshops, checkout e confirmação continuam presentes. Testes locais usam adaptadores simulados; não comprovam entrega nem pagamentos em produção.
- O README anterior descrevia componentes e CSS eliminados e outro repositório. O README, o índice de documentação e a orientação de contribuição foram atualizados para a V2.
- O workflow Quality valida tipos, lint, testes, build e SQL num Postgres efémero; não executa migrações de produção.

## Verificação da versão local

- `npm run typecheck`: aprovado.
- `npm test`: 70 testes aprovados, zero falhas.
- `npm run lint`: zero erros; um aviso preexistente de variável `text` não usada em `lib/commerce/ll01-ticket-email.ts`.
- `npm run build`: aprovado, incluindo compilação TypeScript e geração de 129 páginas.
- Manifesto `public/v2/asset-manifest.json`: 28 ficheiros, zero divergências SHA-256.

## Pendências de produção

- `docs/evidence/qa-metrics.json`, de 24/11/2026, regista 121 rotas auditadas e nenhum erro de consola, página, pedidos HTTP ou CSP, mas contém **duas assertions falhadas**: LCP `4396 ms` (meta `2500 ms`) e INP `4264 ms` (meta `200 ms`). CLS `0.0119`. Não declarar QA integral aprovado; estas medições locais também não equivalem a dados de campo.
- `APPROVAL_BOARD.md` mantém aprovações de marca, revisão visual, operação, responsabilidades legais, canais e produção pendentes. `docs/VISUAL_COMPARISON.md`, referido nesse quadro, não existe na entrega.
- Parte da documentação de backend descreve a V1 e infraestrutura observada em outubro de 2026; foi identificada como contexto datado no índice.

## Limite da reinicialização Git

A substituição remove o histórico acessível pelas branches e tags do repositório. A retenção interna do GitHub, caches, forks e clones externos não é controlada por um force push. Nenhuma cópia de segurança do projeto antigo é criada por esta operação.
