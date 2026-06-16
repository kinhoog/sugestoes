> **IMPLEMENTAÇÃO CLAUDE CODE:** Este documento é a especificação absoluta, estrita e imutável do sistema. Qualquer geração de código, esquema ou componente deve seguir este conteúdo à risca, sem inferências externas, extensões de escopo ou adivinhações.

---

## 0. CONTEXTO DO PROJETO
Sistema interno focado estritamente na captura, análise e triagem de gargalos operacionais (foco na dor/problema, não na proposição de soluções).
- **Padrão Arquitetural:** SPA (Frontend) + Supabase (BaaS).
- **Backend Customizado:** NÃO EXISTE. Toda inteligência de dados reside em triggers, RLS e no client-side.
- **Sincronização:** Realtime obrigatório para visualizações administrativas.

---

## 1. STACK OBRIGATÓRIA

### Frontend
- React (v18+)
- TypeScript
- Vite
- TailwindCSS
- React Router DOM

### Backend as a Service (BaaS)
- **Supabase Core:**
  - Auth (Email/Senha)
  - PostgreSQL (Database)
  - Storage (Bucket de Anexos)
  - Realtime (Subscriptions)

### Deploy
- GitHub Pages (Compilação como SPA estática com fallback para SPA Routing)

---

## 2. ESTRUTURA DE PASTAS (OBRIGATÓRIA)

O projeto deve seguir estritamente o mapa de diretórios abaixo. Não crie pastas raiz alternativas.

```text
src/
├── app/
│   ├── router/
│   └── providers/
├── pages/
│   ├── public/
│   │   ├── Formulario/
│   │   └── Sucesso/
│   └── admin/
│       ├── Login/
│       ├── Dashboard/
│       ├── Solicitacoes/
│       └── DetalheSolicitacao/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── charts/
│   └── layout/
├── services/
│   └── supabase/
│       ├── solicitacoes.service.ts
│       ├── anexos.service.ts
│       └── auth.service.ts
├── hooks/
│   ├── useSolicitacoes.ts
│   ├── useRealtimeSolicitacoes.ts
│   └── useAuth.ts
├── lib/
│   ├── priority.ts
│   ├── protocol.ts
│   ├── validators.ts
│   └── formatters.ts
├── store/
│   ├── ui.store.ts
│   └── admin.store.ts
├── types/
│   ├── solicitacao.types.ts
│   └── auth.types.ts
├── styles/
└── assets/

```

---

## 3. FLUXOS CORE DO SISTEMA

### 3.1. Fluxo do Colaborador (Público)

1. Acessa a rota raiz `/`.
2. Preenche o formulário estruturado de dores operacionais.
3. **Validações síncronas de Entrada:**
* O campo de e-mail deve obrigatoriamente terminar com o sufixo `@protege.med.br`.
* Todos os campos mandatórios devem ser preenchidos antes do envio.


4. Upload de arquivos anexos para o bucket (opcional).
5. **Cálculo de Prioridade:** Processado no frontend (`/lib/priority.ts`) gerando score e classificação.
6. **Inserção no Banco (Transaction/Batch):**
* Executa `INSERT` na tabela `solicitacoes`.
* O protocolo único é gerado automaticamente via trigger no PostgreSQL.
* Executa `INSERT` na tabela `anexos` vinculando os IDs dos arquivos ao ID da solicitação (se aplicável).


7. Redireciona imediatamente para `/sucesso`.

### 3.2. Fluxo do Administrador (Comitê)

1. Realiza autenticação com e-mail e senha em `/admin/login`.
2. Redireciona para o painel consolidado em `/admin/dashboard`.
3. Monitoramento de eventos em tempo real via Supabase Realtime (sem refresh).
4. Gerenciamento do ciclo de vida em `/admin/solicitacoes/:id`:
* Transição assistida de Status (aderente à State Machine).
* Inserção obrigatória de parecer técnico.
* Inserção de anotações e observações internas.


5. **Persistência de Auditoria:** O sistema grava de forma automatizada e imutável cada alteração na tabela `historico_status`.

---

## 4. AUTENTICAÇÃO E POLÍTICAS DE ACESSO (SUPABASE AUTH)

### Whitelist Estrita de Administradores

Apenas as credenciais explicitadas abaixo possuem permissão para gerar sessões administrativas no Supabase Auth:

* `fabio@protege.med.br`
* `abner@protege.med.br`
* `esocial@protege.med.br`

### Regras de Acesso

* Rotas iniciadas em `/admin/*` exigem sessão autenticada ativa e pertencente à whitelist.
* O Colaborador comum (usuário final do formulário) **NÃO possui credenciais e não faz login**.
* **Segurança Nativa:** RLS (Row Level Security) ativado em 100% das tabelas do banco de dados.

---

## 5. MODELO DE DADOS RELACIONAL

O esquema do banco de dados PostgreSQL no Supabase é composto obrigatoriamente pelas seguintes tabelas:

* `solicitacoes`: Registro principal das dores reportadas e metadados associados.
* `anexos`: Caminhos de referência e metadados dos arquivos salvos no storage.
* `historico_status`: Linha do tempo cumulativa e imutável das transições de estados.
* `setores`: Tabela auxiliar para categorização estruturada das áreas da empresa.
* `cargos`: Tabela auxiliar contendo os cargos operacionais mapeados.

---

## 6. MÁQUINA DE ESTADOS (STATE MACHINE OBRIGATÓRIA)

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
* Toda e qualquer alteração de status gera obrigatoriamente um registro em `historico_status`.
* Transições de estado que violem a lógica visualizada acima devem ser barradas programaticamente na interface e garantidas via constraints/triggers no banco de dados.

---

## 7. ENGINE DE CÁLCULO DE PRIORIDADE (FRONTEND ONLY)

📍 **Diretório de Implementação:** `/src/lib/priority.ts`

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

---

## 8. REGRAS PARA GERAÇÃO DE PROTOCOLO

### Formato Obrigatório

O padrão identificador deve seguir rigorosamente a máscara: `PRO-YYYY-XXXX`

* `PRO-`: Prefixo fixo.
* `YYYY`: Corresponde ao ano corrente da submissão com 4 dígitos (Ex: `2026`).
* `XXXX`: Contador numérico sequencial incremental com preenchimento à esquerda (zero-padded) com 4 dígitos (Ex: `0001`, `0002`).

> **Exemplo Final:** `PRO-2026-0001`

### Diretriz de Engenharia

A geração sequencial do número incremental do protocolo deve ser gerenciada de forma nativa no PostgreSQL através de uma `SEQUENCE` e associada via `BEFORE INSERT TRIGGER`. Isso previne problemas de concorrência e garante unicidade absoluta.

---

## 9. POLÍTICAS DE ROW LEVEL SECURITY (RLS)

A tabela abaixo dita a configuração exata das políticas de segurança que devem ser executadas no banco de dados do Supabase:

| Tabela | Operação `SELECT` | Operação `INSERT` | Operação `UPDATE` | Operação `DELETE` |
| --- | --- | --- | --- | --- |
| `solicitacoes` | Apenas Admin | Permitido Anônimo | Apenas Admin | Negado Geral |
| `anexos` | Apenas Admin | Permitido Anônimo | Apenas Admin | Negado Geral |
| `historico_status` | Apenas Admin | Apenas Admin | Negado Geral | Negado Geral |
| `setores` | Permitido Público | Apenas Admin | Apenas Admin | Negado Geral |
| `cargos` | Permitido Público | Apenas Admin | Apenas Admin | Negado Geral |

---

## 10. SINCRONIZAÇÃO EM TEMPO REAL (REALTIME)

O sistema deve escutar ativamente o canal de replicação de dados do Supabase para atualizar de forma dinâmica a interface do usuário nas views administrativas.

### Eventos Sob Escuta Obrigatória

* `solicitacoes`: Capturar `INSERT` e `UPDATE`.
* `historico_status`: Capturar `INSERT`.

### Telas Afetadas pela Reatividade

* **Dashboard Admin:** Os contadores de KPIs, listagens e gráficos devem refletir mudanças instantaneamente.
* **Lista Geral de Solicitações:** Inclusão visual instantânea de novos registros na grid sem forçar re-render total.
* **Detalhes da Solicitação:** Sincronização em tempo real de novos logs inseridos na timeline por outros gestores.

*Nota técnica: É terminantemente proibido o uso de polling tradicional (setInterval) ou botões de refresh manual para fins de atualização de views administrativas.*

---

## 11. POLÍTICAS DE ARMAZENAMENTO (STORAGE)

* **Nome Corporativo do Bucket:** `anexos-solicitacoes`
* **Gargalos e Travas de Validação:**
* Quantidade limite: Máximo de **5 arquivos** associados por solicitação.
* Peso limite: Limite máximo individual de **10MB** por arquivo enviado.


* **Segurança de Dados:** É vetada a remoção ou deleção física de arquivos do bucket sem uma rotina explícita homologada. Aplica-se apenas a remoção lógica da referência via banco.

---

## 12. METRICAS DO DASHBOARD (BI ADMINISTRATIVO)

O painel administrativo em `/admin/dashboard` deve conter obrigatoriamente os seguintes cartões de KPI e blocos analíticos:

* `[ ]` Volumetria acumulada geral de solicitações enviadas.
* `[ ]` Gráfico de distribuição de solicitações segregadas por seus respectivos *Status*.
* `[ ]` Gráfico volumétrico de solicitações segregadas por *Setor* de origem.
* `[ ]` Listagem/Ranking analítico: Top 10 maiores dores recorrentes registradas.
* `[ ]` SLA de Triagem: Tempo médio decorrido entre a data de criação e a primeira movimentação de status (Decisão/Análise).
* `[ ]` SLA de Resolução: Tempo médio total decorrido entre a data de criação e o encerramento completo (Fechamento/Conclusão).
* `[ ]` Gráfico demonstrativo de dispersão e distribuição volumétrica baseado no nível de *Prioridade*.

---

## 13. DIRETRIZES DE DESIGN SYSTEM E IDENTIDADE VISUAL

### Comportamento e Experiência do Usuário (UX)

* **Painel do Colaborador (Público):** Layout centralizado em card único, interface minimalista focado em alto desempenho de digitação, ocultação total de sidebars. Foco estrito em navegação fluida em dispositivos móveis (*mobile-first*). Paleta tonal clean: Predomínio de Branco e Azul Claro.
* **Painel Administrativo:** Layout estruturado no formato de aplicação SaaS moderna. Presença de Sidebar fixa de controle e navegação, Cards informativos de KPI com destaque numérico, Tabelas ricas contendo filtros de coluna e paginação síncrona. Estética baseada no Material Design corporativo, limpo, com espaçamentos confortáveis e tipografia nítida.

### Matriz de Paleta Identificadora de Status (UI Colors)

| Status Cadastrado | Semântica Visual | Código Hexadecimal (Tailwind Equivalente) |
| --- | --- | --- |
| **Nova** | Cinza Neutro | `#9CA3AF` (`text-gray-400` / `bg-gray-400`) |
| **Em Análise** | Azul Operacional | `#3B82F6` (`text-blue-500` / `bg-blue-500`) |
| **Aguardando Informações** | Laranja Alerta | `#F59E0B` (`text-amber-500` / `bg-amber-500`) |
| **Aprovada** | Verde Sucesso | `#10B981` (`text-emerald-500` / `bg-emerald-500`) |
| **Rejeitada** | Vermelho Erro | `#EF4444` (`text-red-500` / `bg-red-500`) |
| **Concluída** | Roxo Finalizador | `#8B5CF6` (`text-violet-500` / `bg-violet-500`) |

---

## 14. DIRETRIZES NON-NEGOTIABLE (RESTRIÇÕES ABSOLUTAS)

### O que é Terminantemente PROIBIDO (❌)

1. **DELETE Físico:** Executar comandos SQL `DELETE` ou chamadas `.delete()` pelo SDK do Supabase. A remoção de registros em ambiente de banco de dados deve ser obrigatoriamente virtualizada.
2. **Manipulação de Prioridade:** Permitir inputs de input de formulário ou botões manuais na tela do administrador que sobrescrevam o score calculado pela engine local.
3. **Bypass Operacional:** Mudar status da solicitação sem registrar de forma atômica o respectivo log na tabela de históricos.
4. **Mutação Direta:** Realizar inserções ou alterações nas tabelas críticas que contornem as regras nativas de Row Level Security.

### O que é OBRIGATÓRIO (✔)

1. **Estratégia de Soft Delete:** Utilização do campo incremental `deleted_at` (timestamp) para ocultação lógica de dados indesejados.
2. **Atomicidade de Auditoria:** Toda transição de estado da máquina deve obrigatoriamente gerar um payload de log associado ao UUID do admin executor.
3. **Unicidade de Protocolos:** A estrutura do banco de dados deve garantir a unicidade de chaves primárias e formatos de protocolos de ponta a ponta.

---

## 15. MATRIX DE RESPONSABILIDADE ARQUITETURAL

Para fins de consistência e inteligência na tomada de decisão do modelo de IA, a federação de regras é segregada estritamente conforme a matriz:

* **Camada de Dados & Persistência Contínua:** Supabase PostgreSQL.
* **Camada de Orquestração Reativa:** Supabase Realtime Channels.
* **Processamento de Inteligência de Negócio:** Camada Frontend client-side (`/src/lib/*` e Hooks).
* **Garantia de Integridade e Isolamento:** Triggers de Banco de Dados e RLS Policies.