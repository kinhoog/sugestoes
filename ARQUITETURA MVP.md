> **IMPLEMENTAÇÃO CODEX:** Este documento é a especificação absoluta, estrita e imutável do sistema. Qualquer geração de código, esquema ou componente deve seguir este conteúdo à risca, sem inferências externas, extensões de escopo ou adivinhações.

---

## 0. CONTEXTO DO PROJETO
Sistema interno focado estritamente na captura, análise e triagem de gargalos operacionais (foco na dor/problema, não na proposição de soluções).
- **Padrão Arquitetural:** SPA (Frontend) + Firebase (BaaS).
- **Backend Customizado:** NÃO EXISTE. Toda inteligência de dados reside em Firebase Security Rules, transações Firestore e client-side.
- **Sincronização:** Firestore realtime listeners obrigatórios para visualizações administrativas.

---

## 1. STACK OBRIGATÓRIA

### Frontend
- React (v18+)
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Código-fonte modular com build estático final gerado pelo Vite.

### Backend as a Service (BaaS)
- **Firebase Core:**
  - Firebase Authentication (Email/Senha)
  - Cloud Firestore
  - Firebase Storage
  - Firebase Security Rules
  - Firestore realtime listeners

### Deploy
- GitHub Pages

---

## 2. FLUXOS CORE DO SISTEMA

### 2.1. Fluxo do Colaborador (Público)

1. Acessa a rota raiz `/`.
2. Realiza cadastro/login com Firebase Auth.
3. Confirma e-mail corporativo.
4. Preenche o formulário estruturado de dores operacionais.
3. **Validações síncronas de Entrada:**
* O campo de e-mail deve obrigatoriamente terminar com o sufixo `@protege.med.br`.
* Todos os campos mandatórios devem ser preenchidos antes do envio.


5. Upload de arquivos anexos para Firebase Storage (opcional).
6. **Cálculo de Prioridade:** Processado no frontend (`/lib/priority.ts`) gerando score e classificação.
7. **Persistência no Firestore (Transaction/Batch):**
* Executa transação Firestore para incrementar contador anual e criar documento em `solicitacoes`.
* O protocolo único é gerado na transação Firestore, não manualmente fora dela.
* Cria documentos em `anexos` vinculando os metadados dos arquivos à solicitação (se aplicável).


7. Redireciona imediatamente para `/sucesso`.

### 2.2. Fluxo do Administrador (Comitê)

1. Realiza autenticação com e-mail e senha
2. Redireciona para o painel consolidado
3. Monitoramento de eventos em tempo real via Firestore realtime listeners (sem refresh).
4. Gerenciamento do ciclo de vida
* Transição assistida de Status (aderente à State Machine).
* Inserção obrigatória de parecer técnico.
* Inserção de anotações e observações internas.


5. **Persistência de Auditoria:** O sistema grava de forma automatizada e imutável cada alteração na tabela `historico_status`.

---

## 3. AUTENTICAÇÃO E POLÍTICAS DE ACESSO (FIREBASE AUTH)

### Whitelist Estrita de Administradores

Apenas as credenciais explicitadas abaixo possuem permissão administrativa no Firebase Auth:

* `fabio@protege.med.br`
* `abner@protege.med.br`
* `esocial@protege.med.br`

---

## 4. MODELO DE DADOS RELACIONAL

O modelo do Cloud Firestore é composto pelas seguintes coleções:

* `usuarios`: Perfil mínimo do usuário autenticado.
* `solicitacoes`: Registro principal das dores reportadas e metadados associados.
* `anexos`: Caminhos de referência e metadados dos arquivos salvos no storage.
* `historico_status`: Linha do tempo cumulativa e imutável das transições de estados.
* `setores`: Coleção auxiliar para categorização estruturada das áreas da empresa.
* `cargos`: Coleção auxiliar contendo os cargos operacionais mapeados.
* `contadores`: Metadados de contador anual para protocolo.

Me ajude a elaborar melhor caso tenha outra ideia/rota.

---

## 5. MÁQUINA DE ESTADOS (STATE MACHINE OBRIGATÓRIA)

As transições de ciclo de vida das solicitações devem seguir estritamente o fluxo finito mapeado abaixo:

```text
[ Nova ]
   │
   ▼
[ Em Análise ] ◄──────────────────────────┐
   │                                      │
   ├─────────────────► [ Aguardando Inf. ]┘
   │
   ├──► [ Rejeitada ] ───┐
   │                     ▼
   └──► [ Aprovada ] ──► [ Concluída ]

```

### Regras Estritas de Transição:

* Apenas usuários administradores autenticados podem alterar estados de uma solicitação.
* Toda e qualquer alteração de status gera obrigatoriamente um registro
* Transições de estado que violem a lógica visualizada acima devem ser barradas programaticamente na interface e protegidas por Firebase Security Rules.

---

## 6. ENGINE DE CÁLCULO DE PRIORIDADE (FRONTEND ONLY)

📍 **Diretório de Implementação:**

### Regras Operacionais

* O cálculo da prioridade deve ocorrer **exclusivamente no frontend** antes do disparo do comando `INSERT`.
* Uma vez inserida a solicitação, os valores de `score` e `prioridade` tornam-se **imutáveis**, não sendo editáveis em nenhuma tela administrativa.

### Matriz Crítica de Pontuação

| Critério Analítico | Opção Selecionada | Pontuação Atribuída |
| --- | --- | --- |
| **Impacto Operacional** | Baixo | 10 |
|  | Médio | 20 |
|  | Alto | 30 |
|  | Crítico | 40 |
| **Pessoas Impactadas** | 1 pessoa | 5 |
|  | 2 a 5 pessoas | 10 |
|  | 6 a 10 pessoas | 15 |
|  | 11 a 20 pessoas | 20 |
|  | Mais de 20 pessoas (20+) | 25 |
| **Tempo Perdido** | Menos de 30 minutos (<30min) | 5 |
|  | Entre 30 minutos e 2 horas | 10 |
|  | Entre 2 e 5 horas | 15 |
|  | Entre 5 e 10 horas | 20 |
|  | Mais de 10 horas (10h+) | 25 |
| **Frequência da Dor** | Esporádico | 5 |
|  | Mensal | 10 |
|  | Semanal | 15 |
|  | Diário | 20 |
| **Contorno via Planilhas?** | Não | 0 |
|  | Sim | 10 |
| **Contorno via E-mails?** | Não | 0 |
|  | Sim | 5 |
| **Dependência de Pessoa Específica?** | Não | 0 |
|  | Sim | 5 |

### Classificação Final por Faixa (Soma dos Critérios)

| Intervalo da Soma | Classificação de Prioridade |
| --- | --- |
| **0 a 25** | Baixa |
| **26 a 50** | Média |
| **51 a 75** | Alta |
| **76 a 100** | Crítica |

### Contrato de Tipagem (TypeScript)

```typescript
type PriorityResult = {
  score: number; // Fonte de verdade analítica cumulativa
  prioridade: "Baixa" | "Média" | "Alta" | "Crítica"; // Derivado direto do score
};

```

Somente exemplos ok? Quero baseado assim.

---

## 7. REGRAS PARA GERAÇÃO DE PROTOCOLO

### Formato Obrigatório

O padrão identificador deve seguir rigorosamente a máscara: `PRO-YYYY-XXXX`

* `PRO-`: Prefixo fixo.
* `YYYY`: Corresponde ao ano corrente da submissão com 4 dígitos (Ex: `2026`).
* `XXXX`: Contador numérico sequencial incremental com preenchimento à esquerda (zero-padded) com 4 dígitos (Ex: `0001`, `0002`).

> **Exemplo Final:** `PRO-2026-0001`

### Diretriz de Engenharia

A geração sequencial do número incremental do protocolo deve ser gerenciada por transação Firestore sobre a coleção `contadores`, incrementando o contador anual e criando a solicitação na mesma operação lógica. Sem backend próprio, essa é a opção mais segura disponível no MVP.

---

## 8. POLÍTICAS DE SEGURANÇA (FIREBASE SECURITY RULES)

A tabela abaixo dita a configuração esperada das políticas de segurança no Firestore:

| Tabela | Operação `SELECT` | Operação `INSERT` | Operação `UPDATE` | Operação `DELETE` |
| --- | --- | --- | --- | --- |
| `solicitacoes` | Admin ou dono | Usuário autenticado, e-mail verificado e domínio válido | Apenas Admin | Negado Geral |
| `anexos` | Admin ou dono | Usuário autenticado, e-mail verificado e domínio válido | Apenas Admin para soft delete | Negado Geral |
| `historico_status` | Admin ou dono da solicitação | Admin; colaborador apenas log inicial | Negado Geral | Negado Geral |
| `setores` | Usuário autenticado/verificado | Apenas Admin | Apenas Admin | Negado Geral |
| `cargos` | Usuário autenticado/verificado | Apenas Admin | Apenas Admin | Negado Geral |

---

## 9. SINCRONIZAÇÃO EM TEMPO REAL (REALTIME)

O sistema deve escutar ativamente Firestore realtime listeners para atualizar de forma dinâmica a interface do usuário nas views administrativas.

### Eventos Sob Escuta Obrigatória

* `solicitacoes`: Capturar novos documentos e atualizações.
* `historico_status`: Capturar novos documentos.

### Telas Afetadas pela Reatividade

* **Dashboard Admin:** Os contadores de KPIs, listagens e gráficos devem refletir mudanças instantaneamente.
* **Lista Geral de Solicitações:** Inclusão visual instantânea de novos registros na grid sem forçar re-render total.
* **Detalhes da Solicitação:** Sincronização em tempo real de novos logs inseridos na timeline por outros gestores.

*Nota técnica: É terminantemente proibido o uso de polling tradicional (setInterval) ou botões de refresh manual para fins de atualização de views administrativas.*

---

## 10. POLÍTICAS DE ARMAZENAMENTO (STORAGE)

* **Firebase Storage path base:** `solicitacoes/{solicitacaoId}/{arquivo}`
* **Gargalos e Travas de Validação:**
* Quantidade limite: Máximo de **5 arquivos** associados por solicitação.
* Peso limite: Limite máximo individual de **10MB** por arquivo enviado.


* **Segurança de Dados:** É vetada a remoção ou deleção física de arquivos do bucket sem uma rotina explícita homologada. Aplica-se apenas a remoção lógica da referência via banco.

---

## 11. METRICAS DO DASHBOARD (BI ADMINISTRATIVO)

O painel administrativo em `/admin/dashboard` deve conter obrigatoriamente os seguintes cartões de KPI e blocos analíticos:

* `[ ]` Volumetria acumulada geral de solicitações enviadas.
* `[ ]` Gráfico de distribuição de solicitações segregadas por seus respectivos *Status*.
* `[ ]` Gráfico volumétrico de solicitações segregadas por *Setor* de origem.
* `[ ]` Listagem/Ranking analítico: Top 10 maiores dores recorrentes registradas.
* `[ ]` SLA de Triagem: Tempo médio decorrido entre a data de criação e a primeira movimentação de status (Decisão/Análise).
* `[ ]` SLA de Resolução: Tempo médio total decorrido entre a data de criação e o encerramento completo (Fechamento/Conclusão).
* `[ ]` Gráfico demonstrativo de dispersão e distribuição volumétrica baseado no nível de *Prioridade*.

---

## 12. DIRETRIZES DE DESIGN SYSTEM E IDENTIDADE VISUAL

## 

### Comportamento e Experiência do Usuário (UX)

* **Painel do Colaborador (Público):** Layout centralizado em card único, interface minimalista focado em alto desempenho de digitação, ocultação total de sidebars. Foco estrito em navegação fluida em dispositivos móveis (*mobile-first*). Paleta tonal clean: Predomínio de Branco e Azul Claro.
* **Painel Administrativo:** Layout estruturado no formato de aplicação SaaS moderna. Presença de Sidebar fixa de controle e navegação, Cards informativos de KPI com destaque numérico, Tabelas ricas contendo filtros de coluna e paginação síncrona. Estética baseada no Material Design corporativo, limpo, com espaçamentos confortáveis e tipografia nítida.

Faça o UI do jeito que achar melhor...

---

## 13. DIRETRIZES NON-NEGOTIABLE (RESTRIÇÕES ABSOLUTAS)

### O que é Terminantemente PROIBIDO (❌)

1. **DELETE Físico:** Executar chamadas de exclusão física pelo SDK Firebase. A remoção de registros deve ser virtualizada por `deleted_at`.
2. **Manipulação de Prioridade:** Permitir inputs de input de formulário ou botões manuais na tela do administrador que sobrescrevam o score calculado pela engine local.
3. **Bypass Operacional:** Mudar status da solicitação sem registrar de forma atômica o respectivo log na tabela de históricos.
4. **Mutação Direta:** Realizar inserções ou alterações nas coleções críticas que contornem as Firebase Security Rules.

### O que é OBRIGATÓRIO (✔)

1. **Estratégia de Soft Delete:** Utilização do campo incremental `deleted_at` (timestamp) para ocultação lógica de dados indesejados.
2. **Atomicidade de Auditoria:** Toda transição de estado da máquina deve obrigatoriamente gerar um payload de log associado ao UUID do admin executor.
3. **Unicidade de Protocolos:** A estrutura do banco de dados deve garantir a unicidade de chaves primárias e formatos de protocolos de ponta a ponta.

Bom, não sei de nada, me ajude a estruturar. A ideia atual aprovada é usar React + Vite modular com Firebase como BaaS.

Verifique se é necessário o backend.
