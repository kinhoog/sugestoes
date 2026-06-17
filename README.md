# Portal de Oportunidades de Melhoria

Sistema de Sugestões - eProtege.

Sistema interno para captura, análise e triagem de gargalos operacionais, retrabalho, desperdício de tempo, dependência de planilhas/e-mails e riscos operacionais. O foco é registrar a dor ou problema real da operação, não soluções técnicas propostas pelo colaborador.

Status atual: **Fase 2 — Supabase, schema, RLS e segurança configurados**.

## Stack

O projeto usa:

- React
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime
- GitHub Pages

## Instalação

```bash
npm install
```

Crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis públicas do Supabase:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BASE=/sugestoes/
```

## Rodar localmente

```bash
npm run dev
```

O Vite inicia o servidor local de desenvolvimento e informa a URL no terminal.

## Build

```bash
npm run build
```

O build gera a pasta `dist/`, que contém os arquivos estáticos finais da aplicação.

## Deploy

O deploy será feito via GitHub Pages. O GitHub Pages publica a versão estática gerada pelo build, não os arquivos-fonte da pasta `src/`.

## Banco de dados

Aplique a migration em `supabase/migrations/0001_schema_inicial.sql` no SQL Editor do Supabase (ou via `supabase db push`). Em seguida, crie no Supabase Auth os usuários da whitelist administrativa e substitua o seed de `setores`/`cargos` pela estrutura real.

## Scripts

- `npm run dev`: ambiente de desenvolvimento.
- `npm run build`: typecheck e build de produção.
- `npm run preview`: pré-visualização do build.
- `npm run typecheck`: checagem de tipos TypeScript.

## Documentação

Decisões de arquitetura, modelo de dados, RLS e roadmap: [`docs/FUNDACAO-TECNICA.md`](docs/FUNDACAO-TECNICA.md).

Configuração operacional do Supabase: [`docs/SUPABASE.md`](docs/SUPABASE.md).

## Princípios não-negociáveis

- Soft delete, sem DELETE físico.
- RLS em 100% das tabelas.
- Realtime nas views administrativas, sem polling.
- Prioridade calculada somente no frontend e persistida como valor imutável.
- Histórico obrigatório a cada mudança de status.
