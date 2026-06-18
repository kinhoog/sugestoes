# Fundação Técnica — Portal de Oportunidades de Melhoria

Documento de engenharia da **Fase 2** após a mudança aprovada de arquitetura para Firebase. Fonte de produto: `CONTEXTO DO PROJETO.md`, `ARQUITETURA MVP.md` e decisão posterior registrada na thread.

## 1. Decisões arquiteturais

| Tema | Decisão |
|---|---|
| Backend/BaaS | Firebase Authentication, Cloud Firestore, Firebase Security Rules e Firestore realtime listeners. |
| Hospedagem | GitHub Pages continua publicando o build estático do Vite. |
| Autenticação | Todos os usuários fazem cadastro/login. O colaborador não é mais anônimo. |
| Domínio | Apenas e-mails `@protege.med.br`, com e-mail verificado, podem operar o sistema. |
| Admin | Allowlist fixa: `fabio@protege.med.br`, `abner@protege.med.br`, `esocial@protege.med.br`. |
| Prioridade | Mantida no frontend via `src/lib/priority.ts`, normalizando a matriz documentada para escala 0-100. |
| Protocolo | Gerado por transação Firestore usando `contadores/protocolos_YYYY`. |

## 2. Modelo Firestore

Coleções:

- `usuarios`: perfil mínimo por `uid`, e-mail, nome, perfil lógico e status de verificação.
- `solicitacoes`: registro principal da dor operacional, protocolo, status, prioridade, SLA, soft delete e vínculo com `created_by`.
- `historico_status`: histórico append-only das mudanças de status.
- `setores`: catálogo de setores.
- `cargos`: catálogo de cargos vinculados a setores.
- `contadores`: documentos de contador anual para protocolo.

Campos de auditoria e controle:

- `created_by`
- `created_by_email`
- `data_criacao`
- `updated_at`
- `deleted_at`
- `referencia_evidencia`
- `data_inicio_analise`
- `data_decisao`
- `data_fechamento`

## 3. Segurança

As regras estão versionadas em:

- `firebase.rules`

Garantias previstas:

- usuário precisa estar autenticado;
- `email_verified == true`;
- e-mail precisa terminar em `@protege.med.br`;
- admin é resolvido por allowlist;
- colaborador cria solicitações próprias;
- colaborador lê somente suas próprias solicitações;
- colaborador não acessa dashboard;
- colaborador não altera status;
- admin lê e atualiza solicitações;
- entrada visual administrativa aparece somente para usuário autenticado, com e-mail verificado e presente na allowlist;
- rotas `/admin/*` são bloqueadas no frontend para colaboradores comuns até a Fase 4;
- `score`, `prioridade_calculada`, `created_by` e `protocolo` não podem ser alterados em update;
- delete físico bloqueado nas rules;
- histórico sem update/delete.
- sem Firebase Storage no MVP.

## 4. Protocolo

Formato:

```text
PRO-YYYY-XXXX
```

Estratégia no frontend:

1. Abrir transação Firestore.
2. Ler `contadores/protocolos_YYYY`.
3. Incrementar `ultimo_numero`.
4. Gerar o protocolo com `formatarProtocolo`.
5. Criar a solicitação na mesma transação.

Limitação técnica: sem backend/Cloud Functions, as rules não conseguem provar sozinhas que o protocolo sempre corresponde ao contador correto. A transação reduz risco de concorrência e colisão, mas uma garantia absoluta exigiria lógica server-side, fora do escopo atual.

## 5. Evidências

O MVP gratuito não usa anexos físicos nem Firebase Storage. Em vez disso, a solicitação pode receber o campo opcional:

```text
referencia_evidencia
```

Uso esperado:

- link;
- caminho interno;
- observação;
- referência de documento;
- informação complementar.

Anexos físicos ficam para versão futura, caso o projeto aceite Firebase Storage ou outra solução homologada.

## 6. Realtime

O realtime será feito com Firestore listeners:

- `onSnapshot` em `solicitacoes` para novas solicitações e atualizações;
- `onSnapshot` em `historico_status` para novos registros de histórico.

Sem polling.

## 7. Camada de domínio

- `src/lib/constants.ts`: opções, pontuações, status, limites e rotas.
- `src/lib/priority.ts`: cálculo de prioridade.
- `src/lib/protocol.ts`: formatação/validação de protocolo.
- `src/lib/validators.ts`: validações síncronas.
- `src/services/firebase/client.ts`: inicialização Firebase.
- `src/services/firebase/auth.service.ts`: Auth e domínio corporativo.
- `src/services/firebase/firestore.service.ts`: transações/listeners Firestore.

## 8. Como aplicar

1. Criar projeto Firebase.
2. Ativar Authentication com Email/Password.
3. Ativar Cloud Firestore.
4. Publicar `firebase.rules` na aba Regras do Cloud Firestore.
5. Publicar `firestore.indexes.json`, se necessário.
6. Preencher `.env` com variáveis `VITE_FIREBASE_*`.

Guia operacional detalhado: [`docs/FIREBASE.md`](FIREBASE.md).

## 9. Próximas fases

- **Fase 3 — Formulário público autenticado:** cadastro/login, formulário, criação de solicitação, referência textual de evidência e sucesso.
- **Fase 4 — Admin:** login, dashboard, fila, detalhes, status, parecer, observação interna e histórico.
- **Fase 5 — Deploy:** GitHub Pages e configuração final do ambiente Firebase.
