# Configuração Firebase — Portal de Oportunidades de Melhoria

Este guia documenta a fundação Firebase da Fase 2: Authentication, Cloud Firestore, Security Rules, realtime listeners e variáveis de ambiente.

## 1. Criar o projeto

1. Crie um projeto no Firebase Console.
2. Registre um app Web.
3. Copie a configuração pública do app Web.
4. Crie um arquivo `.env` local baseado em `.env.example`.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_BASE=/sugestoes/
```

Essas variáveis são públicas do app Web. Mesmo assim, nunca commite `.env`.

## 2. Authentication

Ative **Authentication > Sign-in method > Email/Password**.

Todos os usuários precisam autenticar pelo Firebase Auth. O frontend valida o domínio `@protege.med.br` antes de criar conta, e as Security Rules também exigem:

- usuário autenticado;
- e-mail verificado;
- e-mail terminado em `@protege.med.br`.

Admins autorizados:

- `fabio@protege.med.br`
- `abner@protege.med.br`
- `esocial@protege.med.br`

## 3. Cloud Firestore

Crie o banco em modo production e publique as regras de `firebase.rules`.

Coleções planejadas:

- `usuarios`
- `solicitacoes`
- `solicitacoes_publicas`
- `historico_status`
- `setores`
- `cargos`
- `contadores`

As collections `setores` e `cargos` devem ser populadas com a estrutura real da empresa antes do formulário final.

O MVP não terá anexos físicos nem Firebase Storage. Quando o colaborador precisar indicar evidências, o documento de solicitação poderá receber o campo opcional:

```text
referencia_evidencia
```

Esse campo pode conter link, caminho interno, observação, referência de documento ou informação complementar.

### `solicitacoes_publicas`

A Fase 7 usa a colecao `solicitacoes_publicas` para a area **Minhas demandas** do colaborador.

Essa colecao e um espelho reduzido e seguro de `solicitacoes`. O colaborador comum nao le a colecao administrativa `solicitacoes`, porque ela contem campos internos como score, prioridade, observacao interna e dados de gestao.

Campos permitidos no espelho publico:

- `solicitacao_id`
- `protocolo`
- `created_by`
- `created_by_email`
- `solicitante_nome`
- `setor`
- `cargo`
- `processo_atividade`
- `status_publico`
- `status_interno`
- `resposta_publica`
- `created_at`
- `updated_at`

Nao incluir em `solicitacoes_publicas`:

- `score`
- `prioridade_calculada`
- `observacao_interna`
- responsavel administrativo
- historico administrativo
- qualquer campo sensivel de gestao

## 4. Protocolo

Formato obrigatório:

```text
PRO-YYYY-XXXX
```

Sem backend/Cloud Functions, o protocolo não deve ser gerado por contador em memória do frontend. A estratégia adotada é transação Firestore:

1. Ler `contadores/protocolos_YYYY`.
2. Incrementar `ultimo_numero`.
3. Gerar `PRO-YYYY-XXXX`.
4. Criar `solicitacoes/{id}` na mesma transação.

Limitação: Security Rules conseguem validar autenticação, domínio, campos imutáveis e parte do formato, mas não provam sozinhas toda a relação contador/protocolo. A transação reduz risco de colisão e concorrência, mas uma garantia absoluta de sequência sem lacunas exigiria lógica server-side, como Cloud Functions, que está fora do MVP aprovado.

## 5. Realtime

O realtime administrativo será feito por Firestore listeners:

- `onSnapshot` de `solicitacoes` para `INSERT` e `UPDATE`;
- `onSnapshot` de `historico_status` para novos registros.

Não será usado polling.

## 6. Deploy GitHub Pages

O deploy do frontend continua via GitHub Pages. Configure `VITE_BASE=/sugestoes/` no build.

## 7. Comandos úteis

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Se usar Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

GitHub Pages nao publica Firestore Rules. Sempre que `firebase.rules` mudar, publique as regras manualmente pelo Firebase Console ou pela Firebase CLI.

## 8. Segurança

- Não usar service account no frontend.
- Não usar token manual.
- Não commitar `.env`.
- Não ativar Firebase Storage no MVP.
- Não permitir dashboard para colaborador.
- Não permitir alteração de status por colaborador.
- Não permitir leitura global de solicitações por colaborador.
- Colaborador le apenas `solicitacoes_publicas` com `created_by` igual ao proprio UID.
- Não permitir exclusão física.
