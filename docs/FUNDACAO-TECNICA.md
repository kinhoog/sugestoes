# Fundação Técnica — Portal de Oportunidades de Melhoria

Documento de engenharia da **Fase 1** (banco de dados + camada de domínio + bootstrap). Fonte da verdade de produto: `CONTEXTO DO PROJETO.md` e `ARQUITETURA MVP.md`.

## 1. Decisões arquiteturais (resolução de divergências entre os docs)

Os dois documentos de especificação conflitavam em alguns pontos. As decisões abaixo foram tomadas e travadas:

| # | Tema | Conflito | Decisão |
|---|------|----------|---------|
| 1 | **Engine de prioridade** | ARQUITETURA §7 usa matriz absoluta (soma até **130**); CONTEXTO §7.1 usa pesos % (=100). | Manter a **matriz literal do ARQUITETURA** e **normalizar a soma crua (0–130) para 0–100** antes de classificar. Concilia ambos e respeita as faixas escritas. |
| 2 | **Coluna `score`** | ARQUITETURA trata `score` como persistido/imutável; dicionário do CONTEXTO não tem a coluna. | Adicionada coluna `score integer` (0–100) em `solicitacoes`, **imutável** (trigger de proteção). |
| 3 | **Protocolo p/ anônimo** | Protocolo nasce por trigger no INSERT, mas RLS de SELECT é só Admin → anônimo não conseguiria lê-lo. | INSERT público via RPC `criar_solicitacao` (**SECURITY DEFINER**) que insere e **retorna o protocolo**, sem abrir SELECT para anon. |
| 4 | **Histórico de status** | CONTEXTO guarda e-mail (varchar); ARQUITETURA exige UUID. | **Trigger automático** grava cada transição com **e-mail + UUID** do admin. Colunas `usuario_comite` (e-mail) e `usuario_comite_id` (uuid). |

### Itens com default aplicado
- **Whitelist admin:** `fabio@`, `abner@`, `esocial@protege.med.br` (tabela `public.admins`). A menção a "Erick" no CONTEXTO §4 não tem e-mail correspondente — confirmar se precisa de conta própria.
- **Protocolo:** reinício de sequencial **por ano** via tabela-contador atômica (`protocolo_contadores`) em vez de `SEQUENCE` global, para honrar o formato `PRO-YYYY-XXXX` mantendo segurança de concorrência (lock de linha no UPSERT).
- **`setores`/`cargos`:** seed é **placeholder** — substituir pela estrutura organizacional real.
- **`urgencia`:** opções `Baixa | Média | Alta | Imediata` (não definidas explicitamente nos docs; não pontuam).

## 2. Modelo de dados

Tabelas em `public`: `solicitacoes`, `anexos`, `historico_status`, `setores`, `cargos` (negócio) + `admins` e `protocolo_contadores` (infra/config). Tipos enum: `solicitacao_status`, `prioridade_nivel`.

Garantias no banco:
- **Soft delete** via `deleted_at` (sem qualquer policy de `DELETE` → exclusão física vedada).
- **Imutabilidade** de `protocolo`, `score`, `prioridade_calculada` e `data_criacao` (`fn_proteger_campos_imutaveis`).
- **Máquina de estados** validada em `fn_validar_transicao_status` (espelha `TRANSICOES_STATUS` no frontend).
- **Carimbos de SLA** (`data_inicio_analise`, `data_decisao`, `data_fechamento`) preenchidos automaticamente na transição.
- **Histórico atômico** (`trg_registrar_historico_inicial` na criação + `trg_registrar_historico_status` em cada mudança).

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
Bucket privado `anexos-solicitacoes`. Upload liberado a anon/authenticated; leitura só admin (via signed URL). Sem policies de UPDATE/DELETE (remoção física vedada).

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

## 8. Roadmap (próximas fases)
- **Fase 2 — Serviços/hooks:** `services/supabase/{solicitacoes,anexos,auth}.service.ts`, `hooks/{useAuth,useSolicitacoes,useRealtimeSolicitacoes}.ts`, `store/*`.
- **Fase 3 — Público:** roteamento, `pages/public/Formulario`, `pages/public/Sucesso`, componentes de `forms/` e `ui/`.
- **Fase 4 — Admin:** `Login`, `Dashboard` (KPIs/charts), `Solicitacoes` (grid + filtros), `DetalheSolicitacao` (transição de status + parecer + timeline).
- **Fase 5 — Deploy:** GitHub Pages (base path + 404.html já previstos no build).
