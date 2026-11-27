# EcliPsi — Plataforma Digital de Saúde Mental

**Projeto Integrador III · Análise e Desenvolvimento de Sistemas · Faculdade Senac Pernambuco**

O EcliPsi é uma aplicação multiplataforma em **React Native com Expo**, desenvolvida a partir do PWA original para conectar pacientes a profissionais de saúde mental. No mobile e na Web PWA, o paciente pode comparar preços, consultar o registro profissional (CRP/CRM e UF quando cadastrados), fazer uma triagem orientativa com compatibilidade de 0 a 100%, reservar um horário real e abrir o checkout PIX. A exibição do registro permite consultá-lo no conselho profissional correspondente. A triagem orienta a busca e não substitui avaliação clínica.

| Recurso | Link oficial |
| --- | --- |
| Aplicação em produção | [eclipsi.dev](https://eclipsi.dev) |
| API em produção | [API EcliPsi no Render](https://eclipsi-pi-backend-ptcv.onrender.com) |
| Repositório frontend | [JoaoVitorMeloDev/Eclipsi-React](https://github.com/JoaoVitorMeloDev/Eclipsi-React) |
| Repositório backend | [JoaoVitorMeloDev/eclipsi-pi-BackEnd](https://github.com/JoaoVitorMeloDev/eclipsi-pi-BackEnd) |

## Equipe

- Erik Melado Carvalho
- Gabriel Felipe Belo de Moura
- João Vitor Lima Braga Graciliano de Melo
- Júlia Maria Silva Parra Torres
- Luís Filipe Harten Nogueira
- Maria Sophia Lima dos Santos
- Valentina Matias

## Recursos React Native e Expo

| Recurso | Aplicação |
| --- | --- |
| Stack Navigator e menu lateral | O Expo Router organiza Home, Login, escolha de cadastro e formulários de paciente e profissional (`/`, `/auth/login`, `/auth/cadastro`, `/auth/cadastro-user`, `/auth/cadastro-medico`). Os menus laterais dos painéis dão acesso às seções do perfil e ao logout. O `RouteGuard.tsx` valida sessão e perfil antes de renderizar `/profile/user`, `/profile/medico` e `/profile/admin`. |
| `Modal` | Triagem, escolha de horários livres, detalhes da consulta com CRP/CRM e UF, e checkout PIX com QR Code e código copiável. |
| `ScrollView` e `FlatList` | O catálogo ordenado por compatibilidade, a agenda e o histórico usam `ScrollView` com itens renderizados por mapeamento. A revisão da versão documentada não identificou uso de `FlatList` nessas telas. |
| `TextInput` | Campos de login e cadastro, orçamento da triagem e filtros de busca. Pode ser usado diretamente ou pelo componente `FormInput`. |
| `TouchableOpacity` e `Pressable` | `TouchableOpacity` atende, por exemplo, cancelamento, logout e seleção de opções de horário. Botões de confirmar reserva, copiar PIX e adicionar ou remover horários usam `Pressable` pelo componente `PrimaryButton`. |
| `useState` | Mantém estado de formulários, modais, carregamento, seleção de horários, estado de liberação da guarda e confirmação do pagamento na sessão. A identidade e o perfil vêm da API. |
| `Ionicons`, `fade` e `slide` | Ícones vetoriais de `@expo/vector-icons` e transições dos modais. A identidade é centralizada em `eclipsi/lib/palette.ts`. |

| Cor | Hex |
| --- | --- |
| Índigo principal | `#2E2382` |
| Magenta vibrante | `#FF0066` |
| Vinho | `#B8005C` |
| Salmão | `#FFA089` |
| Creme | `#FFF0C2` |

## Arquitetura de produção

| Camada | Implementação |
| --- | --- |
| Frontend e PWA | React Native, Expo Router e TypeScript. A exportação Web está hospedada na **Vercel**, com domínio registrado na **Name.com** e DNS, SSL e proteção de borda pela **Cloudflare**. O deploy usa HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, manifest Web e Service Worker v3. O worker preserva a navegação online e exclui requisições da API do cache. |
| Backend | API REST em Python e Flask no **Render**. O JWT identifica a sessão e o RBAC distingue `paciente`, `medico` e `admin`. CORS permite as origens oficiais e `http://localhost:8081`. A reserva concorrente é protegida no banco e a API retorna `409 Conflict` quando um slot fica ocupado ou indisponível. |
| Dados | **Supabase / PostgreSQL**, com `public.users` para perfis e `public.consultas` para agendamentos. A migração versionada acrescenta `public.disponibilidades`, `public.triagens` e suporte a PIX em `public.pagamentos`, com RLS nessas três tabelas e o índice parcial `ux_consultas_active_time`. A política efetiva de RLS em `users` e `consultas` e a presença de `ck_users_especialidade` precisam ser confirmadas no schema do Supabase de produção. |
| Checkout PIX | Com `MERCADO_PAGO_ACCESS_TOKEN` no Render, a API usa `/v1/payments` para receber QR Code e código EMV Copia e Cola. O webhook `/api/v1/payments/webhook/mercadopago` consulta o provedor e valida referência, moeda, método e valor antes de marcar como pago. O modo `sandbox_mock` usa código de demonstração sem cobrança bancária. Credenciais ficam no backend. |

## Fluxos e API

| Fluxo | Endpoints principais |
| --- | --- |
| Autenticação | `POST /api/v1/auth/register/user`, `POST /api/v1/auth/register/doctor`, `POST /api/v1/auth/login`, `GET /api/me` |
| Triagem e catálogo | `POST /api/v1/patient/triage`, `GET /api/v1/patient/doctors/recommended`, `GET /api/v1/patient/doctors` |
| Agenda e consultas | `GET /api/v1/professionals/{id}/availability`, `POST /api/v1/professional/availability`, `DELETE /api/v1/professional/availability/{slot_id}`, `POST /api/v1/patient/appointments`, `GET /api/v1/appointments` |
| Pagamentos | `POST /api/v1/payments/pix/create`, `POST /api/v1/payments/pix/{payment_id}/confirm` (demonstração), `POST /api/v1/payments/webhook/mercadopago` |

O logout limpa a sessão local e volta para `/`. Uma resposta `401` em requisição autenticada invalida a sessão. Ao tentar reservar um horário que acabou de ser ocupado, a interface atualiza a grade após o `409`.

## Execução local

Use uma versão do Node.js compatível com o Expo SDK 58 e npm.

```bash
git clone https://github.com/JoaoVitorMeloDev/Eclipsi-React.git
cd Eclipsi-React/eclipsi
npm install
cp .env.example .env
```

No `.env`:

```dotenv
EXPO_PUBLIC_API_URL=https://eclipsi-pi-backend-ptcv.onrender.com
```

```bash
npx expo start
```

Para abrir diretamente na Web, use `npx expo start --web`. A origem local autorizada pela API é `http://localhost:8081`.

### Verificação e build Web

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

O Expo grava a exportação em `eclipsi/dist/`.

## Capturas de Tela

Evidências de produção obtidas via Playwright e Chromium em 23/11/2026 (horário de Recife). As capturas registram o conteúdo da página. O título da aba e a resposta HTTP do favicon foram verificados à parte no navegador. A exportação Web deste PR contém a meta tag de viewport. Na recaptura mobile de 390 × 844, o HTML publicado ainda não a servia. O Playwright aplicou apenas essa meta tag à sessão de captura, sobre a página de produção, para mostrar o enquadramento previsto. A captura do login usa a página de produção sem intervenção.

A revisão da migração confirmou as declarações de RLS para `disponibilidades`, `triagens` e `pagamentos` no código. As políticas efetivas e a constraint `ck_users_especialidade` não puderam ser verificadas no Supabase de produção sem acesso ao catálogo do banco.

Na sessão de teste, Lívia Andrade (Demo) ficou em primeiro com 100% e a API retornou 13 horários livres. O checkout de R$ 110,00 retornou `201` em modo `mercadopago`, com QR e código EMV. A captura e o trecho correspondente do vídeo ocultam as partes pagáveis. A cobrança ficou sem pagamento. O horário criado pela conta profissional fictícia foi removido após o teste.

| Fluxo | Evidência |
| --- | --- |
| Home, desktop e mobile | [1366 × 768](docs/screenshots/01-home-desktop.png) · [390 × 844](docs/screenshots/02-home-mobile.png) |
| Entrada e cadastro | [Login](docs/screenshots/03-login-e-cadastro.png) · [Opções de cadastro](docs/screenshots/03b-opcoes-cadastro.png) |
| Triagem e catálogo | [Formulário preenchido](docs/screenshots/04-triagem-compatibilidade.png) · [Ranking e motivos](docs/screenshots/05-catalogo-ranqueado.png) |
| Agendamento e consulta | [Horários reais](docs/screenshots/06-agenda-slots-reais.png) · [Detalhes e registro profissional](docs/screenshots/07-detalhes-consulta-crp.png) |
| Pagamento | [Checkout Mercado Pago de R$ 110,00 com dados pagáveis ocultos](docs/screenshots/08-pagamento-pix-qrcode.png) |
| Profissional | [Minha Disponibilidade](docs/screenshots/09-painel-profissional-disponibilidade.png) |

[Vídeo WebM da demonstração, com a captura do PIX inserida após os detalhes da consulta](docs/demo-eclipsi.webm) · [README pronto para o backend](docs/README-BACKEND.md)
