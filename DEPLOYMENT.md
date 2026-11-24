# AtlasHub.SI V2 — Next.js e publicação

## Entrega V2 — 24/11/2026

Fonte oficial: `AtlasHub-Si/AtlasHub.SI-WebSite`, branch `main`, raiz do projeto. A V2 usa Inter, Manrope e JetBrains Mono locais, cinco portais e rotas `/pt`, `/en`, `/fr` e `/es`. Consultar [docs/V2_MIGRATION_AND_DECISIONS.md](docs/V2_MIGRATION_AND_DECISIONS.md).

A instrução atual do proprietário autoriza substituir o conteúdo e reiniciar o histórico Git neste repositório, sem backup. Essa instrução substitui o fluxo antigo de contribuição entre repositórios descrito em versões anteriores deste documento.

O upload no GitHub não comprova deploy nem autoriza alterações independentes de DNS, configuração de credenciais, abertura de vendas ou migrações em bases de produção. Ver [docs/REPOSITORY_REPLACEMENT.md](docs/REPOSITORY_REPLACEMENT.md) para verificações e pendências reais. As secções seguintes preservam os contratos operacionais; as descrições antigas da interface são contexto anterior à V2.

Next.js 16 App Router, React 19, TypeScript e Node.js 24.x. Landing em Server Components; Clara e interações em Client Components. Imagens em public/assets, API em app/api/lead/route.ts. A Clara é uma simulação guiada por regras.

## Local e validação

Executar npm ci, npm run typecheck, npm run lint, npm test e npm run build. Produção local: npm start. Desenvolvimento: npm run dev -- --port 3104. O antigo servidor Python já não serve a aplicação. Os testes de entrega usam mocks e não enviam contactos reais.

## Vercel

Importar o repositório, Production Branch main, Root Directory na raiz, Framework Preset Next.js. Instalação npm ci, build npm run build, Output Directory padrão Next.js. Retirar overrides anteriores de Other, diretório ponto ou build vazio. O vercel.json identifica o framework; o package.json fixa Node 24.x.

Validar o preview em desktop e telemóvel, oito entradas da Clara, diagnóstico descarregável, âncoras e estados do formulário. Depois associar atlashub.si e configurar o DNS indicado pela Vercel. Um commit no GitHub não confirma o deploy nem a resolução do domínio.

## Contactos e entrega

O browser usa exclusivamente POST /api/lead na mesma origem. Sucesso: 202 com { id, route: "human" }. meeting_url é null. Recolhe a janela preferida; a reunião depende de confirmação posterior por WhatsApp/email. Não há ligações para subdomínios Clara ou agenda inativos.

Variáveis de servidor: LEAD_WEBHOOK_URL (HTTPS), LEAD_WEBHOOK_TOKEN e PUBLIC_ORIGIN (origem exata, sem barra final, por exemplo https://atlashub.si). Para testar o formulário num preview, configurar a origem exata desse preview e um destino de teste nesse ambiente.

O webhook deve deduplicar requestId, guardar lead, consentimento e diagnóstico e só depois devolver 202 {id,route:"human"}. Sem configuração, a API devolve 503; se o destino não confirmar, 502. A Clara não inventa receção, encaminhamento, consulta a CRM/agenda nem marcação.

WhatsApp oficial: +55 62 99190-3462, configurado em public/clara-config.json. O email continua por definir. O contacto WhatsApp funciona sem webhook e só envia a mensagem após ação do visitante. O formulário de entrega automática só é apresentado quando LEAD_WEBHOOK_URL e LEAD_WEBHOOK_TOKEN estão definidos no build; após os configurar, fazer novo deploy. Nunca colocar tokens nesse ficheiro público. LEAD_WEBHOOK_TOKEN fica apenas nas variáveis de servidor da Vercel.

Antes de ativar a recolha real: configurar rate limiting/antiabuso, responsável por retenção/eliminação, aviso de privacidade e validar entrega ponta a ponta. Origin e honeypot não substituem proteção contra bots.

## Contribuição futura

O desenvolvimento passa a seguir `AtlasHub-Si/AtlasHub.SI-WebSite`, branch `main`. Novas alterações devem passar pelo workflow Quality. A reinicialização do histórico é uma operação única expressamente pedida pelo proprietário; contribuições posteriores seguem o histórico novo. Editions continua uma aplicação independente.


### Comunicação pós-pagamento (005)

Aplicar `db/si_workshops/005_registration_communications.sql` antes do deploy.
Nenhuma migração ativa gates. O webhook emite `workshop.registration.confirmed`
após confirmação canónica e persiste o evento uma vez por inscrição.
`registration_communications` guarda histórico com timestamps e estados por canal
(`sending`, `sent`, `failed`, `uncertain`). O primeiro canal aceite pelo fornecedor
marca `welcome_sent` e `book_pending`; o outro canal mantém o seu estado independente.
A migração respeita os e-mails já marcados pela 004, sem os reenviar.

E-mail: mantém `NODE_ENV=production`, `LL01_TICKET_EMAIL=live`, `RESEND_API_KEY`
e `RESEND_FROM`. WhatsApp: `LL01_WA_CONFIRM=live` (default off),
`ATENDIMENTO_EVOLUTION_URL=https://evo-relay.lia.doctor` e
`ATENDIMENTO_EVOLUTION_KEY` em segredo server-side. Usa o adaptador Evolution
existente: `POST /message/sendText/atlashub-wa`, header `apikey`.
Não altera consentimentos nem adiciona participantes a grupos.

No servidor, com `SI_DATABASE_URL` do papel da aplicação:

```bash
npx tsx scripts/registration-communication.ts UUID status
npx tsx scripts/registration-communication.ts UUID retry
npx tsx scripts/registration-communication.ts UUID book_sent
npx tsx scripts/registration-communication.ts UUID live_access_sent
```

`retry` envia apenas canais pendentes/falhados e respeita os gates; não revalida
pagamento nem cria inscrição. Transições manuais só registam entrega já realizada,
não enviam mensagens; são ordenadas e idempotentes. Para presenciais, o estado
`live_access_*` representa as instruções de acesso presencial; o conteúdo nunca
inclui link de live.

Evolution não oferece idempotência comprovada: uma resposta falhada/ambígua após
iniciar o pedido fica `uncertain`, sem reenvio automático. Uma interrupção do
processo pode deixar `sending`. Nesses casos o operador deve reconciliar com o
fornecedor antes de corrigir o estado por SQL administrativo. A mesma cautela
aplica-se a falhas de e-mail antigas: a aplicação suspende retries após 23 horas
da primeira tentativa, dentro da [janela de 24 horas do Resend](https://resend.com/changelog/idempotency-keys).
Nunca limpar uma marca `sent` para forçar reenvio.
