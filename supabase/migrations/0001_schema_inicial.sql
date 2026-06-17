-- =============================================================================
-- Portal de Oportunidades de Melhoria — Schema inicial
-- Fonte da verdade: "CONTEXTO DO PROJETO.md" + "ARQUITETURA MVP.md"
--
-- Decisões arquiteturais aplicadas (conciliando divergências entre os dois docs):
--   1. Prioridade: matriz absoluta (ARQUITETURA §7) NORMALIZADA para 0–100.
--      O score é calculado SOMENTE no frontend (/src/lib/priority.ts) e enviado já
--      pronto; o banco apenas persiste e protege contra alteração (imutável).
--   2. Coluna `score` (integer 0–100) adicionada à tabela `solicitacoes`.
--   3. INSERT do colaborador anônimo via RPC `criar_solicitacao` (SECURITY DEFINER),
--      que devolve o protocolo gerado sem abrir SELECT para o papel anon.
--   4. `historico_status` gravado automaticamente por triggers (e-mail + UUID do admin).
--   5. Protocolo gerado por PostgreSQL SEQUENCE + BEFORE INSERT TRIGGER.
--
-- Não-negociáveis honrados: Soft Delete (deleted_at), RLS em 100% das tabelas,
-- proibição de DELETE físico, protocolo único nativo, imutabilidade de score/prioridade.
-- =============================================================================

-- pgcrypto fornece gen_random_uuid() (disponível por padrão no Supabase).
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. TIPOS ENUM (máquina de estados e níveis de prioridade)
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'solicitacao_status') then
    create type public.solicitacao_status as enum (
      'Nova',
      'Em Análise',
      'Aguardando Informações',
      'Aprovada',
      'Rejeitada',
      'Concluída'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'prioridade_nivel') then
    create type public.prioridade_nivel as enum ('Baixa', 'Média', 'Alta', 'Crítica');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. TABELAS AUXILIARES E DE CONFIGURAÇÃO
-- -----------------------------------------------------------------------------

-- Whitelist administrativa (config). Apenas estes e-mails são tratados como Comitê.
create table if not exists public.admins (
  email      varchar(160) primary key,
  created_at timestamptz  not null default now(),
  constraint chk_admin_email_normalizado check (
    email = lower(email)
    and email ~* '@protege\.med\.br$'
  )
);

create table if not exists public.setores (
  id         bigint generated always as identity primary key,
  nome       varchar(120) not null unique,
  created_at timestamptz  not null default now(),
  deleted_at timestamptz
);

create table if not exists public.cargos (
  id         bigint generated always as identity primary key,
  setor_id   bigint       not null references public.setores(id),
  nome       varchar(120) not null,
  created_at timestamptz  not null default now(),
  deleted_at timestamptz,
  unique (id, setor_id),
  unique (setor_id, nome)
);

-- Sequencial atômico para o protocolo (PRO-YYYY-XXXX), conforme ARQUITETURA §7.
create sequence if not exists public.protocolo_solicitacoes_seq
  as bigint
  start with 1
  increment by 1
  minvalue 1
  cache 1;

-- -----------------------------------------------------------------------------
-- 3. TABELA PRINCIPAL: solicitacoes
-- -----------------------------------------------------------------------------
create table if not exists public.solicitacoes (
  id                              uuid primary key default gen_random_uuid(),
  protocolo                       varchar(32) not null unique,   -- preenchido por trigger

  -- Bloco 1 — Identificação
  nome_completo                   varchar(160) not null,
  email                           varchar(160) not null,
  setor_id                        bigint       not null references public.setores(id),
  cargo_id                        bigint       not null,

  -- Bloco 2 — O problema atual
  processo_alvo                   text         not null,
  funcionamento_atual             text         not null,
  frequencia                      varchar(40)  not null,
  impacto_operacional             varchar(20)  not null,
  pessoas_impactadas              varchar(40)  not null,
  tempo_perdido                   varchar(40)  not null,
  informacoes_complementares      text,

  -- Bloco 3 — Lógica condicional (Sim/Não + descrição)
  usa_planilha                    boolean      not null default false,
  descricao_planilha              text,
  usa_email                       boolean      not null default false,
  descricao_email                 text,
  atividade_repetitiva            boolean      not null default false,
  descricao_atividade_repetitiva  text,
  dependencia_pessoa              boolean      not null default false,
  descricao_dependencia_pessoa    text,

  -- Bloco 4 — Cenário esperado
  resultado_ideal                 text         not null,
  urgencia                        varchar(40)  not null,

  -- Prioridade (calculada no frontend, imutável)
  score                           integer            not null,
  prioridade_calculada            public.prioridade_nivel not null,

  -- Ciclo de vida / triagem
  status                          public.solicitacao_status not null default 'Nova',
  parecer_tecnico                 text,
  observacao_interna              text,

  -- Carimbos de SLA (preenchidos automaticamente por trigger)
  data_criacao                    timestamptz  not null default now(),
  data_inicio_analise             timestamptz,
  data_decisao                    timestamptz,
  data_fechamento                 timestamptz,

  -- Soft delete
  deleted_at                      timestamptz,

  -- Integridade de domínio (defesa em profundidade; espelha /src/lib/constants.ts)
  constraint chk_email_dominio   check (email ~* '@protege\.med\.br$'),
  constraint chk_impacto         check (impacto_operacional in ('Baixo','Médio','Alto','Crítico')),
  constraint chk_frequencia      check (frequencia in ('Esporádico','Mensal','Semanal','Diário')),
  constraint chk_pessoas         check (pessoas_impactadas in ('1','2-5','6-10','11-20','20+')),
  constraint chk_tempo           check (tempo_perdido in ('<30min','30min-2h','2-5h','5-10h','10h+')),
  constraint chk_urgencia        check (urgencia in ('Baixa','Média','Alta','Imediata')),
  constraint chk_score           check (score between 0 and 100),
  constraint chk_protocolo       check (protocolo ~ '^PRO-[0-9]{4}-[0-9]{4,}$'),
  constraint chk_desc_planilha   check (not usa_planilha or descricao_planilha is not null),
  constraint chk_desc_email      check (not usa_email or descricao_email is not null),
  constraint chk_desc_atividade  check (not atividade_repetitiva or descricao_atividade_repetitiva is not null),
  constraint chk_desc_dependenc  check (not dependencia_pessoa or descricao_dependencia_pessoa is not null),
  constraint fk_solicitacoes_cargo_setor
    foreign key (cargo_id, setor_id) references public.cargos(id, setor_id)
);

create index if not exists idx_solicitacoes_status     on public.solicitacoes (status);
create index if not exists idx_solicitacoes_setor      on public.solicitacoes (setor_id);
create index if not exists idx_solicitacoes_prioridade on public.solicitacoes (prioridade_calculada);
create index if not exists idx_solicitacoes_criacao    on public.solicitacoes (data_criacao);
create index if not exists idx_solicitacoes_deleted    on public.solicitacoes (deleted_at);

-- -----------------------------------------------------------------------------
-- 4. anexos
-- -----------------------------------------------------------------------------
create table if not exists public.anexos (
  id              uuid primary key default gen_random_uuid(),
  solicitacao_id  uuid         not null references public.solicitacoes(id),
  nome_arquivo    varchar(255) not null,
  caminho_storage varchar(512) not null,
  tamanho_bytes   bigint       not null,
  data_upload     timestamptz  not null default now(),
  deleted_at      timestamptz,
  constraint chk_anexo_tamanho check (tamanho_bytes <= 10485760), -- 10 MB
  constraint anexos_caminho_storage_unique unique (caminho_storage)
);

create index if not exists idx_anexos_solicitacao on public.anexos (solicitacao_id);

-- -----------------------------------------------------------------------------
-- 5. historico_status (append-only, imutável)
-- -----------------------------------------------------------------------------
create table if not exists public.historico_status (
  id                uuid primary key default gen_random_uuid(),
  solicitacao_id    uuid         not null references public.solicitacoes(id),
  status_anterior   public.solicitacao_status,                 -- nulo no primeiro log
  status_novo       public.solicitacao_status not null,
  usuario_comite_id uuid         references auth.users(id),     -- UUID do admin executor
  usuario_comite    varchar(160),                              -- e-mail legível (CONTEXTO §6)
  data_alteracao    timestamptz  not null default now()
);

create index if not exists idx_historico_solicitacao on public.historico_status (solicitacao_id);

-- =============================================================================
-- 6. FUNÇÕES E TRIGGERS
-- =============================================================================

-- 6.1 — É administrador? (whitelist via tabela admins). SECURITY DEFINER para
-- ler a tabela admins sem depender de RLS e evitar recursão de política.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(auth.jwt() ->> 'email')
  );
$$;

-- 6.2 — Geração do protocolo PRO-YYYY-XXXX (BEFORE INSERT).
create or replace function public.fn_gerar_protocolo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ano smallint := extract(year from now())::smallint;
  v_seq bigint;
begin
  if new.protocolo is not null then
    return new; -- nunca sobrescreve um protocolo já definido
  end if;

  v_seq := nextval('public.protocolo_solicitacoes_seq'::regclass);
  new.protocolo := 'PRO-' || v_ano::text || '-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

create trigger trg_gerar_protocolo
before insert on public.solicitacoes
for each row execute function public.fn_gerar_protocolo();

-- 6.3 — Proteção de campos imutáveis (protocolo, score, prioridade, data_criacao).
-- Garante a regra non-negotiable de não-manipulação de prioridade/protocolo.
create or replace function public.fn_proteger_campos_imutaveis()
returns trigger
language plpgsql
as $$
begin
  if new.protocolo is distinct from old.protocolo then
    raise exception 'O campo protocolo é imutável.' using errcode = 'restrict_violation';
  end if;
  if new.score is distinct from old.score then
    raise exception 'O campo score é imutável.' using errcode = 'restrict_violation';
  end if;
  if new.prioridade_calculada is distinct from old.prioridade_calculada then
    raise exception 'O campo prioridade_calculada é imutável.' using errcode = 'restrict_violation';
  end if;
  if new.data_criacao is distinct from old.data_criacao then
    raise exception 'O campo data_criacao é imutável.' using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_campos_imutaveis
before update on public.solicitacoes
for each row execute function public.fn_proteger_campos_imutaveis();

-- 6.4 — Bloqueio defensivo de DELETE físico. A regra oficial é soft delete.
create or replace function public.fn_bloquear_delete_fisico()
returns trigger
language plpgsql
as $$
begin
  raise exception 'DELETE físico não é permitido. Use soft delete via deleted_at.'
    using errcode = 'restrict_violation';
end;
$$;

create trigger trg_bloquear_delete_solicitacoes
before delete on public.solicitacoes
for each row execute function public.fn_bloquear_delete_fisico();

create trigger trg_bloquear_delete_anexos
before delete on public.anexos
for each row execute function public.fn_bloquear_delete_fisico();

create trigger trg_bloquear_delete_setores
before delete on public.setores
for each row execute function public.fn_bloquear_delete_fisico();

create trigger trg_bloquear_delete_cargos
before delete on public.cargos
for each row execute function public.fn_bloquear_delete_fisico();

-- 6.5 — Validação da máquina de estados + carimbos de SLA (BEFORE UPDATE OF status).
create or replace function public.fn_validar_transicao_status()
returns trigger
language plpgsql
as $$
declare
  v_permitido boolean;
begin
  if new.status = old.status then
    return new; -- sem mudança de status; nada a validar
  end if;

  v_permitido := case old.status
    when 'Nova'                   then new.status in ('Em Análise')
    when 'Em Análise'             then new.status in ('Aguardando Informações','Aprovada','Rejeitada')
    when 'Aguardando Informações' then new.status in ('Em Análise')
    when 'Aprovada'               then new.status in ('Concluída')
    when 'Rejeitada'              then new.status in ('Concluída')
    when 'Concluída'              then false
    else false
  end;

  if not v_permitido then
    raise exception 'Transição de status inválida: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  -- Carimbos de SLA (preenchidos apenas na primeira ocorrência).
  if new.status = 'Em Análise' and new.data_inicio_analise is null then
    new.data_inicio_analise := now();
  end if;
  if new.status in ('Aprovada','Rejeitada') and new.data_decisao is null then
    new.data_decisao := now();
  end if;
  if new.status = 'Concluída' and new.data_fechamento is null then
    new.data_fechamento := now();
  end if;

  return new;
end;
$$;

create trigger trg_validar_transicao_status
before update of status on public.solicitacoes
for each row execute function public.fn_validar_transicao_status();

-- 6.6 — Registro automático e imutável do histórico de status.
create or replace function public.fn_registrar_historico_status()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.status is distinct from old.status then
    insert into public.historico_status
      (solicitacao_id, status_anterior, status_novo, usuario_comite_id, usuario_comite)
    values
      (new.id, old.status, new.status, auth.uid(), (auth.jwt() ->> 'email'));
  end if;
  return new;
end;
$$;

create trigger trg_registrar_historico_status
after update of status on public.solicitacoes
for each row execute function public.fn_registrar_historico_status();

-- 6.7 — Log inicial na criação (status_anterior nulo).
create or replace function public.fn_registrar_historico_inicial()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.historico_status
    (solicitacao_id, status_anterior, status_novo, usuario_comite_id, usuario_comite)
  values
    (new.id, null, new.status, auth.uid(), (auth.jwt() ->> 'email'));
  return new;
end;
$$;

create trigger trg_registrar_historico_inicial
after insert on public.solicitacoes
for each row execute function public.fn_registrar_historico_inicial();

-- 6.8 — Histórico é append-only.
create or replace function public.fn_bloquear_mutacao_historico()
returns trigger
language plpgsql
as $$
begin
  raise exception 'historico_status é imutável.'
    using errcode = 'restrict_violation';
end;
$$;

create trigger trg_bloquear_update_historico
before update on public.historico_status
for each row execute function public.fn_bloquear_mutacao_historico();

create trigger trg_bloquear_delete_historico
before delete on public.historico_status
for each row execute function public.fn_bloquear_mutacao_historico();

-- 6.9 — RPC de criação pública (colaborador anônimo).
-- Insere a solicitação + anexos atomicamente e retorna o protocolo gerado.
-- NÃO calcula prioridade: recebe score/prioridade já calculados no frontend.
create or replace function public.criar_solicitacao(
  p_solicitacao jsonb,
  p_anexos      jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id        uuid;
  v_protocolo varchar(32);
  v_anexo     jsonb;
begin
  if jsonb_array_length(coalesce(p_anexos, '[]'::jsonb)) > 5 then
    raise exception 'Máximo de 5 anexos por solicitação.';
  end if;

  insert into public.solicitacoes (
    nome_completo, email, setor_id, cargo_id,
    processo_alvo, funcionamento_atual, frequencia, impacto_operacional,
    pessoas_impactadas, tempo_perdido, informacoes_complementares,
    usa_planilha, descricao_planilha, usa_email, descricao_email,
    atividade_repetitiva, descricao_atividade_repetitiva,
    dependencia_pessoa, descricao_dependencia_pessoa,
    resultado_ideal, urgencia, score, prioridade_calculada
  )
  values (
    p_solicitacao->>'nome_completo',
    p_solicitacao->>'email',
    (p_solicitacao->>'setor_id')::bigint,
    (p_solicitacao->>'cargo_id')::bigint,
    p_solicitacao->>'processo_alvo',
    p_solicitacao->>'funcionamento_atual',
    p_solicitacao->>'frequencia',
    p_solicitacao->>'impacto_operacional',
    p_solicitacao->>'pessoas_impactadas',
    p_solicitacao->>'tempo_perdido',
    nullif(p_solicitacao->>'informacoes_complementares', ''),
    coalesce((p_solicitacao->>'usa_planilha')::boolean, false),
    nullif(p_solicitacao->>'descricao_planilha', ''),
    coalesce((p_solicitacao->>'usa_email')::boolean, false),
    nullif(p_solicitacao->>'descricao_email', ''),
    coalesce((p_solicitacao->>'atividade_repetitiva')::boolean, false),
    nullif(p_solicitacao->>'descricao_atividade_repetitiva', ''),
    coalesce((p_solicitacao->>'dependencia_pessoa')::boolean, false),
    nullif(p_solicitacao->>'descricao_dependencia_pessoa', ''),
    p_solicitacao->>'resultado_ideal',
    p_solicitacao->>'urgencia',
    (p_solicitacao->>'score')::integer,
    (p_solicitacao->>'prioridade_calculada')::public.prioridade_nivel
  )
  returning id, protocolo into v_id, v_protocolo;

  for v_anexo in
    select * from jsonb_array_elements(coalesce(p_anexos, '[]'::jsonb))
  loop
    insert into public.anexos (solicitacao_id, nome_arquivo, caminho_storage, tamanho_bytes)
    values (
      v_id,
      v_anexo->>'nome_arquivo',
      v_anexo->>'caminho_storage',
      (v_anexo->>'tamanho_bytes')::bigint
    );
  end loop;

  return jsonb_build_object('id', v_id, 'protocolo', v_protocolo);
end;
$$;

-- =============================================================================
-- 7. ROW LEVEL SECURITY
-- =============================================================================
alter table public.admins              enable row level security;
alter table public.setores             enable row level security;
alter table public.cargos              enable row level security;
alter table public.solicitacoes        enable row level security;
alter table public.anexos              enable row level security;
alter table public.historico_status    enable row level security;

-- admins: leitura apenas para o próprio Comitê; escrita só via service_role/SQL.
create policy admins_select_admin on public.admins
  for select to authenticated using (public.is_admin());

-- setores / cargos: leitura pública (dropdowns); escrita só admin; sem delete.
create policy setores_select_publico on public.setores
  for select to anon, authenticated using (deleted_at is null);
create policy setores_insert_admin on public.setores
  for insert to authenticated with check (public.is_admin());
create policy setores_update_admin on public.setores
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy cargos_select_publico on public.cargos
  for select to anon, authenticated using (deleted_at is null);
create policy cargos_insert_admin on public.cargos
  for insert to authenticated with check (public.is_admin());
create policy cargos_update_admin on public.cargos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- solicitacoes: SELECT/UPDATE apenas admin; INSERT do anônimo é feito pela RPC
-- criar_solicitacao (SECURITY DEFINER), portanto NÃO há policy de INSERT direto.
-- DELETE negado (sem policy) — usa-se soft delete via UPDATE de deleted_at.
create policy solicitacoes_select_admin on public.solicitacoes
  for select to authenticated using (public.is_admin());
create policy solicitacoes_update_admin on public.solicitacoes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- anexos: idem solicitacoes (INSERT via RPC; soft delete via UPDATE).
create policy anexos_select_admin on public.anexos
  for select to authenticated using (public.is_admin());
create policy anexos_update_admin on public.anexos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- historico_status: SELECT apenas admin; INSERT só via triggers (SECURITY DEFINER);
-- UPDATE e DELETE negados (imutável).
create policy historico_select_admin on public.historico_status
  for select to authenticated using (public.is_admin());

-- protocolo_solicitacoes_seq: sem grant direto para anon/authenticated; manipulada
-- apenas pela trigger SECURITY DEFINER `fn_gerar_protocolo`.

-- =============================================================================
-- 8. GRANTS (o acesso efetivo continua governado pela RLS acima)
-- =============================================================================
grant usage on schema public to anon, authenticated;

grant select on public.setores, public.cargos to anon, authenticated;
grant insert, update on public.setores, public.cargos to authenticated;

grant select, update on public.solicitacoes, public.anexos to authenticated;
grant select on public.historico_status to authenticated;
grant select on public.admins to authenticated;

revoke all on function public.criar_solicitacao(jsonb, jsonb) from public;
grant execute on function public.criar_solicitacao(jsonb, jsonb) to anon, authenticated;

-- =============================================================================
-- 9. REALTIME (replicação para as views administrativas)
-- =============================================================================
do $$
begin
  alter table public.solicitacoes replica identity full;
  alter table public.historico_status replica identity full;

  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'solicitacoes'
     ) then
    alter publication supabase_realtime add table public.solicitacoes;
  end if;

  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'historico_status'
     ) then
    alter publication supabase_realtime add table public.historico_status;
  end if;
end
$$;

-- =============================================================================
-- 10. STORAGE (bucket privado de anexos)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('anexos-solicitacoes', 'anexos-solicitacoes', false, 10485760)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760;

-- Upload liberado para o colaborador anônimo; leitura apenas para admin (via signed URL).
-- Sem policies de UPDATE/DELETE => remoção física vedada (apenas soft delete da referência).
create policy anexos_storage_upload on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'anexos-solicitacoes');

create policy anexos_storage_leitura_admin on storage.objects
  for select to authenticated
  using (bucket_id = 'anexos-solicitacoes' and public.is_admin());

-- =============================================================================
-- 11. SEED
-- =============================================================================

-- Whitelist administrativa (ARQUITETURA §4).
insert into public.admins (email) values
  ('fabio@protege.med.br'),
  ('abner@protege.med.br'),
  ('esocial@protege.med.br')
on conflict (email) do nothing;

-- >>> PLACEHOLDER: substituir pela estrutura organizacional real da Protege. <<<
insert into public.setores (nome) values
  ('Operações'),
  ('Tecnologia da Informação'),
  ('Recursos Humanos'),
  ('Faturamento'),
  ('Atendimento')
on conflict (nome) do nothing;

insert into public.cargos (setor_id, nome)
select s.id, c.nome
from public.setores s
join (values
  ('Operações', 'Analista de Operações'),
  ('Operações', 'Coordenador de Operações'),
  ('Tecnologia da Informação', 'Desenvolvedor'),
  ('Tecnologia da Informação', 'Analista de Suporte'),
  ('Recursos Humanos', 'Analista de RH'),
  ('Faturamento', 'Analista de Faturamento'),
  ('Atendimento', 'Atendente')
) as c(setor, nome) on c.setor = s.nome
on conflict (setor_id, nome) do nothing;
