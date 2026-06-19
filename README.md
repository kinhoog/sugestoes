# Portal de Oportunidades de Melhoria

Sistema de Sugestões — eProtege.

Sistema interno para captura, análise e triagem de gargalos operacionais, retrabalho, desperdício de tempo, dependência de planilhas/e-mails e riscos operacionais.

O foco do sistema é registrar a dor ou problema real da operação, não exigir que o colaborador proponha uma solução técnica.

## Status

**Versão atual:** `v1.0.0`
**Status:** MVP completo, validado e publicado via GitHub Pages.

O sistema já contempla:

* login corporativo;
* registro de demandas internas;
* geração automática de protocolo;
* painel administrativo;
* workflow administrativo;
* histórico de alterações;
* resposta ao colaborador;
* área “Minhas demandas”;
* exportação CSV;
* regras de segurança no Firestore.

## Acesso

Ambiente publicado:

```text
https://kinhoog.github.io/sugestoes/
```

O site é público em nível de acesso ao link, mas os dados são protegidos por autenticação Firebase e Firestore Security Rules.

Usuários comuns acessam apenas:

* nova demanda;
* minhas demandas;
* detalhe das próprias demandas;
* status público;
* resposta da equipe.

Administradores autorizados acessam também:

* dashboard administrativo;
* lista de solicitações;
* detalhe administrativo;
* workflow;
* observação interna;
* resposta ao colaborador;
* histórico;
* exportação CSV.

## Stack

O projeto usa:

* React;
* TypeScript;
* Vite;
* TailwindCSS;
* React Router DOM;
* Firebase Authentication;
* Cloud Firestore;
* Firebase Security Rules;
* Firestore realtime listeners;
* GitHub Actions;
* GitHub Pages.

## Instalação

```bash
npm install
```

Crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis públicas do Firebase Web App:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
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

O build executa a checagem de tipos TypeScript e gera a pasta `dist/`, que contém os arquivos estáticos finais da aplicação.

## Deploy

O deploy é feito via **GitHub Actions** para o GitHub Pages.

O fluxo atual:

```text
merge na main
→ GitHub Actions executa o build
→ variáveis VITE_FIREBASE_* são injetadas via GitHub Secrets
→ pasta dist/ é publicada no GitHub Pages
```

Não utilizar “Deploy from a branch” para este projeto, pois a aplicação depende de build Vite e variáveis de ambiente configuradas no workflow.

## Firebase

O sistema utiliza:

* Firebase Authentication;
* Cloud Firestore;
* Firebase Security Rules.

As regras estão versionadas em:

```text
firebase.rules
```

Sempre que `firebase.rules` for alterado, as regras precisam ser publicadas no Firebase Console ou via Firebase CLI.

Exemplo via CLI:

```bash
firebase deploy --only firestore:rules
```

O GitHub Pages não publica Firestore Rules automaticamente.

## Estrutura de dados

Coleções principais:

```text
solicitacoes
historico_status
contadores
solicitacoes_publicas
```

### `solicitacoes`

Coleção administrativa completa.

Contém os dados completos da demanda, incluindo campos internos de análise e gestão.

Acesso restrito aos administradores.

### `solicitacoes_publicas`

Coleção segura para o portal do colaborador.

Contém apenas os campos necessários para que o usuário acompanhe as próprias demandas.

Não contém:

* score;
* prioridade;
* observação interna;
* responsável administrativo;
* histórico administrativo completo;
* campos internos de gestão.

## Funcionalidades principais

### Colaborador

* cadastro/login com e-mail corporativo;
* registro de nova demanda;
* geração automática de protocolo;
* área “Minhas demandas”;
* visualização das próprias demandas;
* visualização de status público;
* visualização da resposta da equipe.

### Administração

* dashboard administrativo;
* listagem de demandas;
* detalhe administrativo;
* assumir demanda;
* reatribuir responsável;
* alterar status;
* registrar observação interna;
* registrar resposta ao colaborador;
* confirmação obrigatória antes de salvar resposta pública;
* histórico administrativo;
* exportação CSV compatível com Excel.

## Segurança

Regras principais:

* usuário comum não acessa rotas administrativas;
* usuário comum não lê a coleção administrativa `solicitacoes`;
* usuário comum lê apenas documentos próprios em `solicitacoes_publicas`;
* score, prioridade e observação interna não são expostos ao colaborador;
* resposta ao colaborador fica separada da observação interna;
* apenas administradores autorizados podem acessar dados administrativos.

Administradores autorizados são controlados por allowlist no código e pelas regras do Firestore.

## Scripts

```bash
npm run dev
```

Inicia o ambiente de desenvolvimento.

```bash
npm run build
```

Executa typecheck e build de produção.

```bash
npm run preview
```

Pré-visualiza o build localmente.

```bash
npm run typecheck
```

Executa checagem de tipos TypeScript.

```bash
npm audit
```

Verifica vulnerabilidades nas dependências.

## Validação da versão 1.0.0

A versão `v1.0.0` foi validada com:

```text
npm run typecheck
npm run build
npm audit
```

Resultado:

* typecheck aprovado;
* build aprovado;
* audit sem vulnerabilidades;
* aviso conhecido de bundle acima de 500 kB devido ao Firebase.

## Roadmap futuro

Possíveis melhorias futuras, após validação com usuários reais:

* refinamentos visuais;
* melhorias no dashboard;
* filtros avançados;
* arquivamento controlado de demandas;
* relatório executivo;
* integração futura com outros sistemas internos.

Itens descartados no MVP:

* notificação automática por e-mail;
* SLA automático;
* anexos físicos;
* chat;
* consulta pública por protocolo;
* edição da demanda pelo colaborador.

## Documentação

Decisões de arquitetura, modelo de dados, Security Rules e roadmap:

[`docs/FUNDACAO-TECNICA.md`](docs/FUNDACAO-TECNICA.md)

Configuração operacional do Firebase:

[`docs/FIREBASE.md`](docs/FIREBASE.md)

## Princípios não-negociáveis

* Firestore protegido por Security Rules.
* Usuário comum nunca acessa dados administrativos.
* Observação interna nunca aparece para o colaborador.
* Resposta ao colaborador sempre separada da observação interna.
* Histórico obrigatório nas mudanças administrativas relevantes.
* Realtime nas views administrativas, sem polling.
* Prioridade e score visíveis somente para administradores.
* Deploy via GitHub Actions, não por branch estática.
