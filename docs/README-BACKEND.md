# EcliPsi — API de Saúde Mental

**Projeto Integrador III · Análise e Desenvolvimento de Sistemas · Faculdade Senac Pernambuco**

API REST em Python e Flask para autenticação por perfil, catálogo, triagem orientativa, agenda, consultas e checkout PIX. A aplicação Web PWA está em [eclipsi.dev](https://eclipsi.dev). A API de produção está no [Render](https://eclipsi-pi-backend-ptcv.onrender.com). O cliente React Native e Expo é mantido no [Eclipsi-React](https://github.com/JoaoVitorMeloDev/Eclipsi-React).

## Equipe

- Erik Melado Carvalho
- Gabriel Felipe Belo de Moura
- João Vitor Lima Braga Graciliano de Melo
- Júlia Maria Silva Parra Torres
- Luís Filipe Harten Nogueira
- Maria Sophia Lima dos Santos
- Valentina Matias

## Arquitetura

| Componente | Responsabilidade |
| --- | --- |
| Flask no Render | Validação e autorização JWT por perfil, persistência por `psycopg2` e endpoints REST. CORS permite `https://eclipsi.dev`, `https://www.eclipsi.dev` e `http://localhost:8081`. |
| Supabase PostgreSQL | Perfis em `public.users` e consultas em `public.consultas`. A migração `supabase/migrations/20261124_full_mvp.sql` mantém os IDs e acrescenta disponibilidade, triagem e PIX com RLS em `public.disponibilidades`, `public.triagens` e `public.pagamentos`. O índice parcial `ux_consultas_active_time` protege o horário ativo de reservas concorrentes. |
| Mercado Pago | Integração com `/v1/payments` quando o token do provedor é fornecido pelo ambiente. O webhook valida a cobrança consultando a API oficial, confere referência, valor, moeda e método e atualiza o pagamento. Sem token, o PIX roda em `sandbox_mock`, com confirmação manual e sem cobrança. |

A API filtra recursos por conta autenticada e verifica o papel no banco nas operações protegidas. A migração versionada documenta as políticas que instala. As políticas de RLS aplicadas diretamente no Supabase e constraints adicionais, como `ck_users_especialidade`, devem ser conferidas no catálogo do banco de destino.

## Endpoints principais

As rotas autenticadas recebem `Authorization: Bearer <token>`.

| Método | Rota | Acesso e operação |
| --- | --- | --- |
| GET | `/health` | Público. Verifica se o serviço responde. |
| GET | `/api/v1/openapi.json` | Público. Contrato HTTP. |
| POST | `/api/v1/auth/register/user` | Público. Cadastro de paciente. |
| POST | `/api/v1/auth/register/doctor` | Público. Cadastro de profissional. |
| POST | `/api/v1/auth/login` | Público. Login e emissão de JWT. |
| GET | `/api/me` | Autenticado. Perfil e papel atuais. |
| POST | `/api/v1/patient/triage` | Paciente. Cria ou atualiza a triagem. |
| GET | `/api/v1/patient/doctors` | Paciente. Catálogo de especialistas. |
| GET | `/api/v1/patient/doctors/recommended` | Paciente. Catálogo ordenado por compatibilidade. |
| GET | `/api/v1/professionals/{id}/availability` | Autenticado. Horários futuros livres do profissional. |
| POST | `/api/v1/professional/availability` | Profissional. Adiciona um horário ISO 8601 com fuso. |
| DELETE | `/api/v1/professional/availability/{slot_id}` | Profissional. Desativa um horário próprio. |
| POST | `/api/v1/patient/appointments` | Paciente. Reserva por `slot_id` ou valida data e profissional contra a grade. Responde `409` se indisponível. |
| GET | `/api/v1/appointments` | Autenticado. Lista consultas vinculadas à conta. |
| POST | `/api/v1/payments/pix/create` | Paciente. Cria ou recupera o pagamento da própria consulta. |
| POST | `/api/v1/payments/pix/{payment_id}/confirm` | Paciente. Confirma pagamento próprio em `sandbox_mock`. |
| POST | `/api/v1/payments/webhook/mercadopago` | Mercado Pago. Valida a notificação consultando a cobrança no provedor. |

A triagem recebe `motivo_principal`, `abordagem_preferida`, `modalidade`, `faixa_valor_max` e `urgencia`. A recomendação retorna `compatibility_score` de 0 a 100 e `match_reasons`. A pontuação orienta a busca por profissional.

## Execução local

```bash
git clone https://github.com/JoaoVitorMeloDev/eclipsi-pi-BackEnd.git
cd eclipsi-pi-BackEnd
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configure `DATABASE_URL` para um PostgreSQL de desenvolvimento com TLS, ou os parâmetros `DB_*` descritos em `.env.example`. Defina `JWT_SECRET` com um valor secreto no ambiente. Mantenha o arquivo `.env` fora do Git. Use um schema com as tabelas legadas `users` e `consultas` e aplique `supabase/migrations/20261124_full_mvp.sql` em um banco de desenvolvimento antes de iniciar a API.

```bash
python check_database.py
pytest -q
python app.py
```

A API local escuta em `http://localhost:5000`. Configure a URL no `EXPO_PUBLIC_API_URL` do frontend para testar a API local. Para gerar perfis e slots fictícios, execute `python scripts/seed_demo.py --demo` com `DATABASE_URL` apontando para o ambiente de demonstração.

Para habilitar PIX real, configure `MERCADO_PAGO_ACCESS_TOKEN` no Render e registre o endpoint HTTPS do webhook no Mercado Pago. Valide primeiro em ambiente de testes do provedor.
