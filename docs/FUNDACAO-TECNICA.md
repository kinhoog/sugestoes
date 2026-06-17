# Fundação Técnica — Portal de Oportunidades de Melhoria

Documento de engenharia da **Fase 2** (Supabase, banco, segurança e camada de domínio). Fonte da verdade de produto: `CONTEXTO DO PROJETO.md` e `ARQUITETURA MVP.md`.

## 1. Decisões arquiteturais (resolução de divergências entre os docs)

Os dois documentos de especificação conflitavam em alguns pontos. As decisões abaixo foram tomadas e travadas:

| # | Tema | Conflito | Decisão |
|---|------|----------|---------|
| 1 | **Engine de prioridade** | ARQUITETURA §7 usa matriz absoluta (soma até **130**); CONTEXTO §7.1 usa pesos % (=100). | Manter a **matriz literal do ARQUITETURA** e **normalizar a soma crua (0–130) para 0–100** antes de classificar. Concilia ambos e respeita as faixas escritas. |
| 2 | **Coluna `score`** | ARQUITETURA trata `score` como persistido/imutável; dicionário do CONTEXTO não tem a coluna. | Adicionada coluna `score integer` (0–100) em `solicitacoes`, **imutável** (trigger de proteção). |
| 3 | **Protocolo p/ anônimo** | Protocolo nasce por trigger no INSERT, mas RLS de SELECT é só Admin → anônimo não conseguiria lê-lo. | INSERT público via RPC `criar_solicitacao` (**SECURITY DEFINER**) que insere e **retorna o protocolo**, sem abrir SELECT para anon. |
| 4 | **Histórico de status** | CONTEXTO guarda e-mail (varchar); ARQUITETURA exige UUID. | **Trigger automático** grava cada transição com **e-mail + UUID** do admin. Colunas `usuario_comite` (e-mail) e `usuario_comite_id` (uuid). |

### Itens com default aplicado
- **Whitelist admin:** `fabio@protege.med.br`, `abner@protege.med.br`, `esocial@protege.med.br` (Erick) na tabela `public.admins`.
- **Protocolo:** gerado por `public.protocolo_solicitacoes_seq` + trigger `fn_gerar_protocolo`, no formato `PRO-YYYY-XXXX`, sem geração manual no frontend.
- **`setores`/`cargos`:** seed é **placeholder** — substituir pela estrutura organizacional real.
- **`urgencia`:** opções `Baixa | Média | Alta | Imediata` (não definidas explicitamente nos docs; não pontuam).

## 2. Modelo de dados

Tabelas em `public`: `solicitacoes`, `anexos`, `historico_status`, `setores`, `cargos` (negócio) + `admins` (config). Infra de protocolo: sequence `protocolo_solicitacoes_seq`. Tipos enum: `solicitacao_status`, `prioridade_nivel`.

Garantias no banco:
- **Soft delete** via `deleted_at` (sem qualquer policy de `DELETE` → exclusão física vedada).
- **Imutabilidade** de `protocolo`, `score`, `prioridade_calculada` e `data_criacao` (`fn_proteger_campos_imutaveis`).
- **Máquina de estados** validada em `fn_validar_transicao_status` (espelha `TRANSICOES_STATUS` no frontend).
- **Carimbos de SLA** (`data_inicio_analise`, `data_decisao`, `data_fechamento`) preenchidos automaticamente na transição.
- **Histórico atômico** (`trg_registrar_historico_inicial` na criação + `trg_registrar_historico_status` em cada mudança).
- **Bloqueio defensivo de DELETE físico** por trigger nas tabelas de negócio.
- **Histórico append-only** por trigger bloqueando update/delete em `historico_status`.

## 3. RLS (resumo)

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `solicitacoes` | Admin | via RPC (definer) | Admin | negado |
| `anexos` | Admin | via RPC (definer) | Admin (soft delete) | negado |
| `historico_status` | Admin | via triggers (definer) | negado | negado |
| `setores` / `cargos` | público | Admin | Admin | negado |
| `admins` | Admin | — (service role/SQL) | — | — |

`public.is_admin()` resolve o Comitê pela tabela `admins` comparando com `auth.jwt()->>'email'`.

## 4. Realtime
Publicação `supabase_realtime` inclui `solicitacoes` (INSERT/UPDATE) e `historico_status` (INSERT). Subscriptions só funcionam para sessões `authenticated` que passem na RLS (admins).

## 5. Storage
Bucket privado `anexos-solicitacoes`, com `file_size_limit = 10485760` (10 MB). Upload liberado a anon/authenticated; leitura só admin (via signed URL). Sem policies de UPDATE/DELETE (remoção física vedada). O limite de até 5 anexos por solicitação é validado na RPC `criar_solicitacao`.

## 6. Camada de domínio (frontend)
- `src/lib/constants.ts` — **fonte única** de opções, pontuações, faixas, máquina de estados, cores, limites e rotas.
- `src/lib/priority.ts` — `calcularPrioridade()` / `classificarPrioridade()`.
- `src/lib/protocol.ts`, `src/lib/validators.ts`, `src/lib/formatters.ts`.
- `src/types/*.ts` — uniões derivadas das constantes (sem duplicação).

## 7. Como aplicar
1. Criar projeto no Supabase; copiar URL e anon key para `.env` (ver `.env.example`).
2. Rodar a migration `supabase/migrations/0001_schema_inicial.sql` (SQL Editor ou `supabase db push`).
3. Criar os 3 usuários da whitelist no Supabase Auth (Email/Senha).
4. Substituir o seed de `setores`/`cargos` pela estrutura real.
5. `npm install && npm run dev`.

Guia operacional detalhado: [`docs/SUPABASE.md`](SUPABASE.md).

## 8. Roadmap (próximas fases)
- **Fase 3 — Formulário público:** serviços de criação, upload, validações e tela de sucesso.
- **Fase 4 — Admin:** Auth, Dashboard (KPIs/charts), Solicitações (grid + filtros), DetalheSolicitação (transição de status + parecer + timeline).
- **Fase 5 — Deploy:** GitHub Pages (base path já previsto no build).
