# Portal de Oportunidades de Melhoria

Sistema de Sugestões - eProtege.

Sistema interno para captura, análise e triagem de gargalos operacionais, retrabalho, desperdício de tempo, dependência de planilhas/e-mails e riscos operacionais. O foco é registrar a dor ou problema real da operação, não soluções técnicas propostas pelo colaborador.

Status atual: **Fase 2 — Firebase Auth, Firestore, Storage e regras de segurança configurados**.

## Stack

O projeto usa:

- React
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Security Rules
- Firestore realtime listeners
- GitHub Pages

## Instalação

```bash
npm install
```

Crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis públicas do Firebase Web App:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
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

## Firebase

Configure Firebase Authentication, Cloud Firestore, Firebase Storage e publique as rules versionadas em `firebase.rules` e `storage.rules`.

## Scripts

- `npm run dev`: ambiente de desenvolvimento.
- `npm run build`: typecheck e build de produção.
- `npm run preview`: pré-visualização do build.
- `npm run typecheck`: checagem de tipos TypeScript.

## Documentação

Decisões de arquitetura, modelo de dados, Security Rules e roadmap: [`docs/FUNDACAO-TECNICA.md`](docs/FUNDACAO-TECNICA.md).

Configuração operacional do Firebase: [`docs/FIREBASE.md`](docs/FIREBASE.md).

## Princípios não-negociáveis

- Soft delete, sem DELETE físico.
- Firebase Security Rules protegendo Firestore e Storage.
- Realtime nas views administrativas, sem polling.
- Prioridade calculada somente no frontend e persistida como valor imutável.
- Histórico obrigatório a cada mudança de status.
