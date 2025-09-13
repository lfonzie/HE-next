// lib/system-prompts/classification.ts

export const MODULE_CLASSIFICATION_PROMPT = `Classifique a mensagem em um módulo escolar. CONTEXTO: Esta é uma escola/instituição educacional com funcionários e alunos.

PROFESSOR: Conteúdo educacional, estudos, matérias, exercícios, provas, dúvidas acadêmicas
- Matemática, física, química, biologia, história, geografia, português, inglês, artes
- Redação, literatura, gramática, interpretação de texto, produção textual
- APOIO EM REDAÇÃO: Qualquer solicitação sobre redação, escrita, produção textual, dissertação, ENEM, vestibular
- Perguntas sobre história de qualquer coisa (empresas, pessoas, eventos, lugares)
- Exemplos: "história da Fender", "história do Brasil", "história da matemática", "apoio em redação", "ajuda com redação"
- Conceitos acadêmicos, teorias, fórmulas, exercícios, provas

BEM_ESTAR: Apoio emocional, ansiedade, conflitos, saúde mental, bem-estar

TI: Problemas técnicos, internet, login, bugs, suporte tecnológico, equipamentos audiovisuais, projetores, TVs, computadores, impressoras, sistemas, configurações técnicas, instalação de equipamentos, conectividade, redes, hardware, software, dispositivos eletrônicos
- Exemplos: "projetar tela na TV", "conectar projetor", "configurar impressora", "problema no computador", "internet não funciona", "login não funciona", "bug no sistema", "instalar software", "configurar equipamento", "problema técnico", "suporte tecnológico"

FINANCEIRO: Pagamentos, boletos, valores, mensalidades, questões financeiras de ALUNOS
- Exemplos: "mensalidade", "boleto", "pagamento", "desconto", "renegociação", "valor da matrícula", "como funciona o banco" (para pagamentos)
- IMPORTANTE: Use FINANCEIRO para questões de pagamentos de alunos/famílias

SOCIAL_MEDIA: Posts, redes sociais, marketing digital, conteúdo digital, destacar conquistas, celebrar resultados, compartilhar sucessos, criar posts, fazer posts
- Exemplos: "destacar conquistas", "celebrar resultados", "compartilhar sucessos", "criar posts", "fazer posts", "instagram", "facebook", "marketing digital"
- IMPORTANTE: Use SOCIAL_MEDIA para qualquer questão relacionada a criar conteúdo para redes sociais ou destacar conquistas

SECRETARIA: Documentos de alunos, matrícula, declarações escolares, procedimentos administrativos acadêmicos (NÃO para funcionários)

RH: Funcionários, recursos humanos, trabalho, colaboradores, procedimentos administrativos internos, benefícios, férias, folha de pagamento, atestados, treinamentos, políticas internas, questões trabalhistas, progressão salarial, promoção, carreira, desenvolvimento profissional
- Exemplos: "benefícios disponíveis", "saldo de férias", "atestado médico", "folha de ponto", "treinamentos internos", "políticas da empresa", "informações sobre treinamentos", "salário", "progressão salarial", "promoção", "carreira", "contrato de trabalho", "funcionário", "colaborador"
- IMPORTANTE: Use RH para qualquer questão relacionada a funcionários/colaboradores, mesmo que seja administrativa

COORDENACAO: Gestão pedagógica, calendário, coordenação acadêmica

ATENDIMENTO: Dúvidas gerais, informações, primeiro contato (APENAS quando não se encaixa em nenhum módulo específico)

REGRAS DE CLASSIFICAÇÃO CRÍTICAS:
1. TI: Qualquer questão técnica relacionada a equipamentos, sistemas, configurações, instalações, conectividade, hardware, software, dispositivos eletrônicos, projetores, TVs, computadores, impressoras, internet, login, bugs
2. SOCIAL_MEDIA: Qualquer questão sobre criar posts, destacar conquistas, celebrar resultados, compartilhar sucessos, marketing digital
3. RH: Questões relacionadas a FUNCIONÁRIOS/COLABORADORES da escola: benefícios, férias, atestados, treinamentos, políticas internas, folha de ponto, políticas da empresa, salário, progressão salarial, promoção, carreira, contrato, trabalho
4. FINANCEIRO: Questões de PAGAMENTOS e COBRANÇA: mensalidades, boletos, valores, descontos, renegociação de mensalidades de ALUNOS
5. SECRETARIA: Apenas para documentos de ALUNOS (matrícula, declarações escolares)
6. ATENDIMENTO: APENAS quando não se encaixa em nenhum módulo específico

IMPORTANTE: 
- RH ≠ FINANCEIRO: RH é para funcionários, FINANCEIRO é para pagamentos de alunos
- "Procedimentos bancários" pode ser RH (se for interno/funcionários) ou FINANCEIRO (se for pagamentos)
- "Banco" sozinho → FINANCEIRO (pagamentos), "banco interno" ou "procedimentos bancários internos" → RH

IMPORTANTE: Para o chat geral (ATENDIMENTO), sempre defina needsImages como false.
Apenas para módulos específicos (PROFESSOR, etc.) determine se precisa de imagens:
- true: Conteúdo visual (ciências, geografia, anatomia, arte, processos naturais, história)
- false: Conteúdo textual (matemática básica, português, conceitos abstratos)

Retorne JSON: {"module":"MODULO","confidence":0.0,"rationale":"explicação curta","needsImages":false}`;

export const VISUAL_CLASSIFICATION_PROMPT = `Você é um especialista em educação e design instrucional. Analise se o conteúdo se beneficiaria de imagens específicas e concretas. Evite recomendar imagens para conceitos abstratos, processos educacionais genéricos, ou termos como "educational", "learning", "teaching", "diagrams", "illustrations". Foque em objetos físicos, lugares específicos, animais, plantas, fenômenos naturais visuais. Responda sempre em JSON válido.`;

export const TOPIC_EXTRACTION_PROMPT = `Extract only the concise TOPIC from the request. Return only the topic.`;
