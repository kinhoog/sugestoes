# Configuração Supabase — Portal de Oportunidades de Melhoria

Este guia documenta a fundação Supabase da Fase 2: schema, RLS, protocolo, Storage, Realtime e variáveis de ambiente.

## 1. Criar o projeto

1. Crie um projeto no Supabase.
2. Acesse **Project Settings > API**.
3. Copie a `Project URL` e a `anon public key`.
4. Crie um arquivo `.env` local baseado em `.env.example`.

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
VITE_BASE=/sugestoes/
```

Nunca commite `.env` nem chaves reais.

## 2. Executar o SQL

Execute o arquivo abaixo no **SQL Editor** do Supabase:

```text
supabase/migrations/0001_schema_inicial.sql
```

Alternativa, quando a CLI do Supabase estiver configurada:

```bash
supabase db push
```

## 3. Auth administrativo

O colaborador não faz login.

Crie usuários no **Supabase Auth** para os e-mails autorizados:

- `fabio@protege.med.br`
- `abner@protege.med.br`
- `esocial@protege.med.br`

A tabela `public.admins` também recebe esses e-mails no seed da migration. As policies usam `public.is_admin()` para liberar leitura e atualização administrativa.

## 4. Banco de dados

Tabelas principais:

- `solicitacoes`
- `anexos`
- `historico_status`
- `setores`
- `cargos`
- `admins`

Garantias aplicadas:

- RLS habilitado nas tabelas.
- Soft delete com `deleted_at`.
- Sem policy de `DELETE`.
- Trigger defensiva bloqueando DELETE físico em tabelas de negócio.
- Protocolo único gerado no banco no formato `PRO-YYYY-XXXX`.
- Score e prioridade imutáveis após criação.
- Máquina de estados validada por trigger.
- Histórico de status gravado automaticamente.
- Campos de SLA preenchidos por trigger.

## 5. Criação pública controlada

O envio público será feito pela RPC:

```sql
public.criar_solicitacao(p_solicitacao jsonb, p_anexos jsonb)
```

Essa função é `SECURITY DEFINER`, insere a solicitação, vincula anexos e retorna o protocolo. Isso evita abrir `SELECT` público em `solicitacoes`.

## 6. Storage

Bucket criado pela migration:

```text
anexos-solicitacoes
```

Configuração:

- bucket privado;
- limite individual de arquivo: 10 MB;
- upload permitido para `anon` e `authenticated`;
- leitura permitida apenas para administradores;
- sem policies de update/delete em `storage.objects`.

O limite de até 5 anexos por solicitação é validado na RPC `criar_solicitacao` e também deverá ser validado no frontend.

## 7. Realtime

A migration adiciona as tabelas à publicação `supabase_realtime`:

- `solicitacoes`
- `historico_status`

Eventos previstos para o admin:

- `INSERT` em `solicitacoes`;
- `UPDATE` em `solicitacoes`;
- `INSERT` em `historico_status`.

As subscriptions administrativas dependem de sessão autenticada e RLS aprovada para admin.

## 8. Observações de segurança

- Não usar service role key no frontend.
- Não fazer `.delete()` pelo SDK.
- Não criar backend Node/Express para o MVP.
- Não gerar protocolo no frontend.
- Não permitir edição manual de `score` ou `prioridade_calculada`.
