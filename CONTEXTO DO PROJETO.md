# Especificação de Produto e Técnica - Portal de Oportunidades de Melhoria

## 1. Visão Geral e Princípios Fundamentais
O Portal de Oportunidades de Melhoria é um sistema interno projetado para mapear gargalos operacionais, retrabalhos e necessidades de automação na organização.

### Princípios de Design Fundamentais
* **Foco no Problema, Não na Solução:** O sistema deve coletar detalhadamente a dor, o desperdício e o impacto. O usuário não deve propor soluções técnicas.
* **Anti-Escopo:** Este sistema NÃO é uma caixa de sugestões genéricas, não substitui sistemas vigentes (como o SOC), não realiza integrações externas no MVP e não utiliza Inteligência Artificial nesta fase.

## 2. Objetivos do MVP
* Validar a adesão e engajamento dos colaboradores da base.
* Mensurar o volume de desperdício de tempo e falhas operacionais por setor por meio de métricas quantificáveis.
* Ranquear automaticamente as dores mais críticas da empresa para triagem eficiente.
* Manter a arquitetura o mais simples possível, com autenticação Firebase obrigatória para todos os usuários.

## 3. Stack Tecnológica e Arquitetura
* **Frontend:** React, TypeScript, Vite, HTML5, CSS3.
* **Banco de Dados:** Cloud Firestore.
* **Hospedagem:** GitHub Pages (Build estático como Single Page Application - SPA).
* **Arquitetura:** Aplicação com Firebase Auth para colaborador e administrador. Comunicação direta com Firebase.

## 4. Estrutura Organizacional, Governança e Regras Gerais

### Comitê de Triagem e Perfis
* **Perfil Colaborador:** Qualquer pessoa autenticada com e-mail verificado e finalizado estritamente em `@protege.med.br`.
* **Perfil Administrador (Comitê):** Fábio, Erick e Abner. Controle total do sistema, inserção de pareceres e encerramento de processos. O acesso ao Dashboard não faz parte do fluxo do colaborador.
* **Regra de Negócio Exclusiva:** Somente membros do Comitê de Triagem podem alterar o status das solicitações.

### Regra de Exclusão e Auditoria (Soft Delete)
* **Proibição de Exclusão Física:** Solicitações e históricos nunca poderão ser excluídos fisicamente do banco de dados (`DELETE` restrito).
* **Soft Delete:** Toda exclusão deverá ser lógica, utilizando o preenchimento do campo `deleted_at` para preservar o histórico e garantir a auditoria da informação.

## 5. Máquina de Status e Métricas de Tempo (SLA)
O sistema registra automaticamente o histórico de evolução e captura carimbos de data/hora (*timestamps*).

### Fluxo de Status
1. `Nova` (Estado inicial)
2. `Em Análise`
3. `Aguardando Informações`
4. `Aprovada`
5. `Rejeitada`
6. `Concluída`

### Métricas de SLA
* **Tempo Médio de Análise:** `data_inicio_analise` - `data_criacao`.
* **Tempo Médio até Decisão:** `data_decisao` - `data_criacao`.
* **Tempo Médio até Conclusão:** `data_fechamento` - `data_criacao`.

## 6. Dicionário de Dados (Cloud Firestore)

### Tabela Principal: `solicitacoes`
| Campo                          | Tipo        | Observação                                  |
| ------------------------------ | ----------- | ------------------------------------------- |
| id                             | uuid        | Primary Key                                 |
| protocolo                      | varchar     | Gerado auto. Único (Ex: PRO-2026-0001)      |
| nome_completo                  | varchar     |                                             |
| email                          | varchar     |                                             |
| setor_id                       | bigint      | Foreign Key -> setores.id                   |
| cargo_id                       | bigint      | Foreign Key -> cargos.id                    |
| processo_alvo                  | text        |                                             |
| funcionamento_atual            | text        |                                             |
| frequencia                     | varchar     |                                             |
| impacto_operacional            | varchar     | Baixo, Médio, Alto, Crítico                 |
| pessoas_impactadas             | varchar     |                                             |
| tempo_perdido                  | varchar     |                                             |
| informacoes_complementares     | text        |                                             |
| usa_planilha                   | boolean     |                                             |
| descricao_planilha             | text        |                                             |
| usa_email                      | boolean     |                                             |
| descricao_email                | text        |                                             |
| atividade_repetitiva           | boolean     |                                             |
| descricao_atividade_repetitiva | text        |                                             |
| dependencia_pessoa             | boolean     |                                             |
| descricao_dependencia_pessoa   | text        |                                             |
| resultado_ideal                | text        |                                             |
| urgencia                       | varchar     |                                             |
| prioridade_calculada           | varchar     | Baixa, Média, Alta, Crítica (Via Algoritmo) |
| status                         | varchar     |                                             |
| parecer_tecnico                | text        |                                             |
| observacao_interna             | text        | Visível apenas para o Comitê                |
| data_criacao                   | timestamptz | Timestamp de envio                          |
| data_inicio_analise            | timestamptz | Timestamp alteração status                  |
| data_decisao                   | timestamptz | Timestamp alteração status                  |
| data_fechamento                | timestamptz | Timestamp alteração status                  |
| deleted_at                     | timestamptz | Controle de Soft Delete                     |

### Evidências
O MVP não terá anexos físicos. A solicitação poderá conter `referencia_evidencia` como texto opcional para link, caminho interno, observação ou referência de documento.

### Tabela: `historico_status`
| Campo           | Tipo        | Observação                     |
| --------------- | ----------- | ------------------------------ |
| id              | uuid        | Primary Key                    |
| solicitacao_id  | uuid        | Foreign Key -> solicitacoes.id |
| status_anterior | varchar     | Pode ser nulo no primeiro log  |
| status_novo     | varchar     |                                |
| data_alteracao  | timestamptz |                                |
| usuario_comite  | varchar     | E-mail de quem alterou         |

### Tabelas Auxiliares (Prevenção de Hardcode)
* **`setores`**: `id` (bigint), `nome` (varchar).
* **`cargos`**: `id` (bigint), `setor_id` (fk), `nome` (varchar).

## 7. Lógicas e Formulário

### 7.1 Fórmula da Prioridade Calculada (`prioridade_calculada`)
| Critério              | Peso |
| --------------------- | ---- |
| Impacto Operacional   | 25%  |
| Pessoas impactadas    | 20%  |
| Tempo perdido         | 20%  |
| Frequência            | 15%  |
| Planilhas             | 10%  |
| E-mails               | 5%   |
| Dependência de pessoa | 5%   |

* **Escala de Resultado:** `0-25` (Baixa), `26-50` (Média), `51-75` (Alta), `76-100` (Crítica).

### 7.2 Formulário do Colaborador
**Bloco 1: Identificação**
* Nome Completo, E-mail (Validação `@protege.med.br`), Setor e Cargo.

**Bloco 2: O Problema Atual**
* Processo/Atividade Alvo e Funcionamento Atual.
* **Frequência:** Diário, Semanal, Mensal, Esporádico.
* **Impacto Operacional (Risco):** Qual o impacto caso o problema continue acontecendo? (Baixo, Médio, Alto, Crítico). *Ex: Impedir emissão de ASO.*
* **Pessoas Impactadas:** 1 pessoa, 2-5, 6-10, 11-20, 20+.
* **Tempo Perdido Estimado:** Menos de 30m/semana, 30m a 2h, 2h a 5h, 5h a 10h, Mais de 10h.

**Bloco 3: Lógica Condicional (Sim/Não + Descrição)**
* Dependência de Planilhas, Dependência de E-mails, Atividades Repetitivas e Dependência de Pessoa Única.

**Bloco 4: Cenário Esperado**
* Resultado Ideal e Nível de Urgência Percebida.

**Bloco 5: Evidência textual opcional**
* Link, caminho interno, observação ou referência de documento.

## 8. Interfaces do Sistema (Frontend)
* **Tela 1: Formulário Público:** Submissão livre. Dropdowns dinâmicos.
* **Tela 2: Tela de Sucesso:** Exibição do número do Protocolo.
* **Tela 3: Dashboard Administrativo:** * **Módulo de Indicadores / BI:**
    * Top 10 Dores (processos mais citados/recorrentes).
    * Ranking de Setores com maior volume de solicitações.
    * Cards de SLA (Tempos médios).
  * **Fila de Gestão:** Listagem ordenada pela `prioridade_calculada`.
  * **Painel de Edição:** Parecer Técnico e Observação Interna.


Decisões Arquiteturais Definidas
Autenticação Administrativa

Será utilizado Firebase Authentication.

Usuários autorizados:

fabio@protege.med.br
abner@protege.med.br
esocial@protege.med.br

Somente esses usuários poderão acessar o Dashboard Administrativo.

O colaborador realiza autenticação e precisa ter e-mail verificado.

Design System
Área do Colaborador
Interface minimalista
Formulário centralizado
Navegação simplificada
Sem sidebar
Foco em rapidez de preenchimento
Responsivo para desktop e mobile
Área Administrativa
Sidebar lateral
Dashboard moderno
Cards de indicadores
Tabelas com filtros
Gráficos interativos
Responsivo
Identidade Visual

Referência:

Logo institucional da Protege

Paleta:

Branco
Azul claro institucional

Diretrizes:

Visual corporativo moderno
Material Design
Espaçamento amplo
Pouco texto visual
Ícones sutis
Aparência semelhante a SaaS modernos
