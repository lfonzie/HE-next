# Guia de Classificação de Módulos - HubEdu.ai

## Visão Geral
Este documento descreve todos os módulos disponíveis no sistema de classificação automática do HubEdu.ai e como cada tipo de mensagem é direcionado para o módulo apropriado.

## Módulos Disponíveis

### 1. PROFESSOR
**Descrição**: Dúvidas acadêmicas, conceitos, exercícios, matérias escolares
**Palavras-chave**: matemática, física, química, biologia, história, geografia, português, inglês, artes, redação, literatura, gramática, interpretação de texto, produção textual, conceitos acadêmicos, teorias, fórmulas, exercícios, provas, simulados
**Exemplos**:
- "como resolver equação"
- "história do Brasil"
- "redação ENEM"
- "fórmula de Bhaskara"
- "dúvida de geometria"
- "explicar conceito"
- "ajuda com exercício"

### 2. AULA_EXPANDIDA
**Descrição**: Solicitações por aulas completas ou detalhadas
**Palavras-chave**: aula expandida, aula completa, aula detalhada, explicação completa
**Exemplos**:
- "quero uma aula expandida sobre fotossíntese"
- "aula completa de matemática"
- "aula detalhada sobre"
- "explicação completa de"
**Regra especial**: Se o usuário mencionou um tópico acadêmico anteriormente e agora diz "comece", "iniciar", "começar", classifique como AULA_EXPANDIDA

### 3. ENEM_INTERATIVO
**Descrição**: Solicitações por simulados ENEM interativos
**Palavras-chave**: enem interativo, simulado com explicações detalhadas, simulado ENEM, questões do ENEM, prova do ENEM
**Exemplos**:
- "quero um enem interativo"
- "simulado com explicações detalhadas"
- "simulado ENEM"
- "questões do ENEM"
- "prova do ENEM"

### 4. AULA_INTERATIVA
**Descrição**: Solicitações por aulas interativas ou dinâmicas
**Palavras-chave**: aula interativa, aula dinâmica, aula participativa, aula com atividades
**Exemplos**:
- "aula interativa"
- "aula dinâmica"
- "aula participativa"
- "aula com atividades"

### 5. ENEM
**Descrição**: Simulados rápidos ou questões ENEM simples
**Palavras-chave**: simulado rápido, questões ENEM, prova rápida, teste rápido
**Exemplos**:
- "simulado rápido"
- "questões ENEM"
- "prova rápida"
- "teste rápido"

### 6. BEM_ESTAR
**Descrição**: Apoio emocional, ansiedade, conflitos, saúde mental
**Palavras-chave**: ansioso, conflito com colega, apoio emocional, estresse, depressão, bullying, conflito familiar
**Exemplos**:
- "estou ansioso"
- "conflito com colega"
- "apoio emocional"
- "estresse"
- "depressão"
- "bullying"
- "conflito familiar"

### 7. TI_TROUBLESHOOTING
**Descrição**: Problemas técnicos, equipamentos, sistemas
**Palavras-chave**: internet, login, bugs, projetores, TVs, computadores, impressoras, sistemas
**Exemplos**:
- "projetor não funciona"
- "internet lenta"
- "login não funciona"
- "configurar impressora"
- "bug no sistema"
- "computador travou"

### 8. FAQ_ESCOLA
**Descrição**: Perguntas frequentes sobre a escola, documentos, procedimentos
**Palavras-chave**: horário de funcionamento, como funciona a matrícula, documentos necessários, regulamento da escola, normas da escola
**Exemplos**:
- "horário de funcionamento"
- "como funciona a matrícula"
- "documentos necessários"
- "regulamento da escola"
- "normas da escola"

### 9. FINANCEIRO
**Descrição**: Pagamentos de alunos/famílias
**Palavras-chave**: mensalidade, boleto, pagamento, desconto, valor da matrícula, taxa de matrícula, parcelamento
**Exemplos**:
- "mensalidade"
- "boleto"
- "pagamento"
- "desconto"
- "valor da matrícula"
- "taxa de matrícula"
- "parcelamento"

### 10. RH
**Descrição**: Questões de funcionários/colaboradores
**Palavras-chave**: benefícios, férias, atestados, treinamentos, salário, carreira, recursos humanos
**Exemplos**:
- "benefícios disponíveis"
- "saldo de férias"
- "atestado médico"
- "salário"
- "treinamento"
- "carreira"
- "promoção"

### 11. COORDENACAO
**Descrição**: Gestão pedagógica, calendário escolar
**Palavras-chave**: calendário de provas, coordenador pedagógico, gestão acadêmica, planejamento pedagógico, metodologia de ensino
**Exemplos**:
- "calendário de provas"
- "coordenador pedagógico"
- "gestão acadêmica"
- "planejamento pedagógico"
- "metodologia de ensino"

### 12. SOCIAL_MEDIA
**Descrição**: Criação de conteúdo para redes sociais
**Palavras-chave**: criar post, post social media, destacar conquistas, celebrar resultados, instagram, facebook, redes sociais, conteúdo digital, marketing digital, postagem, compartilhar nas redes
**Exemplos**:
- "criar post"
- "post social media"
- "destacar conquistas"
- "celebrar resultados"
- "instagram"
- "facebook"
- "redes sociais"
- "conteúdo digital"
- "marketing digital"
- "postagem"
- "compartilhar nas redes"

### 13. CONTEUDO_MIDIA
**Descrição**: Solicitações por conteúdo visual, imagens, diagramas
**Palavras-chave**: preciso de uma imagem, diagrama de fotossíntese, gráfico, ilustração, infográfico, conteúdo visual, material visual
**Exemplos**:
- "preciso de uma imagem"
- "diagrama de fotossíntese"
- "gráfico"
- "ilustração"
- "infográfico"
- "conteúdo visual"
- "material visual"

### 14. ATENDIMENTO
**Descrição**: APENAS quando não se encaixa em nenhum módulo específico
**Palavras-chave**: informações gerais, dúvidas básicas, primeiro contato, ajuda geral
**Exemplos**:
- "informações gerais"
- "dúvidas básicas"
- "primeiro contato"
- "ajuda geral"

## Regras Críticas de Classificação

1. **PROFESSOR**: Para QUALQUER dúvida acadêmica, conceito, exercício, matéria escolar
2. **TI_TROUBLESHOOTING**: Para QUALQUER problema técnico, equipamento, sistema
3. **RH**: Para funcionários/colaboradores (benefícios, férias, atestados, salário)
4. **FINANCEIRO**: Para pagamentos de alunos/famílias (mensalidades, boletos)
5. **SOCIAL_MEDIA**: Para QUALQUER criação de conteúdo, posts, marketing digital, redes sociais
6. **CONTEUDO_MIDIA**: Para solicitações de imagens, diagramas, conteúdo visual
7. **BEM_ESTAR**: Para questões emocionais, psicológicas, conflitos, bullying
8. **FAQ_ESCOLA**: Para perguntas sobre procedimentos, normas, regulamentos da escola
9. **COORDENACAO**: Para questões pedagógicas, calendários, gestão acadêmica
10. **ATENDIMENTO**: APENAS como último recurso

## Contexto Importante

- Se o histórico menciona um tópico acadêmico (como "fotossíntese") e a mensagem atual é "comece", "iniciar", "começar", classifique como AULA_EXPANDIDA
- Se o histórico menciona um módulo específico e a mensagem atual é uma continuação, mantenha o mesmo módulo
- Considere sempre o contexto da conversa anterior
- Para mensagens ambíguas, escolha o módulo mais específico possível

## Mapeamento de Módulos

### API → Sistema Interno
- `PROFESSOR` → `professor`
- `AULA_EXPANDIDA` → `aula-expandida`
- `ENEM_INTERATIVO` → `enem-interativo`
- `AULA_INTERATIVA` → `aula_interativa`
- `ENEM` → `enem`
- `TI_TROUBLESHOOTING` → `ti_troubleshooting`
- `FAQ_ESCOLA` → `faq_escola`
- `FINANCEIRO` → `financeiro`
- `RH` → `rh`
- `COORDENACAO` → `coordenacao`
- `BEM_ESTAR` → `bem-estar`
- `SOCIAL_MEDIA` → `social-media`
- `CONTEUDO_MIDIA` → `conteudo_midia`
- `ATENDIMENTO` → `atendimento`

## Testes de Validação

### ✅ Testes Realizados
- **"post social media zoo sp"** → `SOCIAL_MEDIA` (confidence: 0.9)
- **"Me ajude com: Quero tirar uma dúvida de geometria"** → `PROFESSOR` (confidence: 0.9)
- **"quero uma aula expandida sobre fotossíntese"** → `AULA_EXPANDIDA` (confidence: 1.0)
- **"projetor não funciona"** → `TI_TROUBLESHOOTING` (confidence: 1.0)
- **"estou ansioso com as provas"** → `BEM_ESTAR` (confidence: 0.9)
- **"valor da mensalidade"** → `FINANCEIRO` (confidence: 0.9)
- **"preciso de uma imagem de fotossíntese"** → `CONTEUDO_MIDIA` (confidence: 0.9)
- **"horário de funcionamento da escola"** → `FAQ_ESCOLA` (confidence: 0.9)

## Arquivos Modificados

1. `lib/system-prompts/classification.ts` - Prompt principal de classificação
2. `app/api/classify/route.ts` - Lista de módulos válidos na API
3. `lib/orchestrator.ts` - Mapeamento de módulos no orquestrador
4. `hooks/useChat.ts` - Mapeamento de módulos no hook de chat

## Status
✅ **Concluído** - Todos os módulos foram atualizados e testados com sucesso.
