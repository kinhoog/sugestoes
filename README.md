# Portal de Oportunidades de Melhoria

Sistema interno para captura, análise e triagem de gargalos operacionais (foco na dor, não na solução). SPA estática + Supabase (BaaS), sem backend próprio.

## Stack
React 18 · TypeScript · Vite · TailwindCSS · React Router · Supabase (Auth, PostgreSQL, Storage, Realtime). Deploy: GitHub Pages.

## Setup
```bash
cp .env.example .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Banco de dados
Aplique a migration em `supabase/migrations/0001_schema_inicial.sql` no SQL Editor do Supabase (ou via `supabase db push`). Em seguida, crie no Supabase Auth os usuários da whitelist administrativa e substitua o seed de `setores`/`cargos` pela estrutura real.

## Scripts
- `npm run dev` — ambiente de desenvolvimento.
- `npm run build` — build de produção (gera `dist/` + `404.html` para SPA routing).
- `npm run preview` — pré-visualização do build.
- `npm run typecheck` — checagem de tipos.

## Documentação
Decisões de arquitetura, modelo de dados, RLS e roadmap: [`docs/FUNDACAO-TECNICA.md`](docs/FUNDACAO-TECNICA.md).

## Princípios não-negociáveis
Soft delete (sem DELETE físico) · RLS em 100% das tabelas · Realtime nas views admin (sem polling) · prioridade calculada só no frontend e imutável · histórico obrigatório a cada mudança de status.
