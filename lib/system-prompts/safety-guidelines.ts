// lib/system-prompts/safety-guidelines.ts
// Diretrizes de segurança obrigatórias para todos os prompts do sistema

export const SAFETY_GUIDELINES = {
  // Proteção contra conteúdo ilegal/prejudicial para menores
  CHILD_SAFETY_PROTECTION: `
🚨 PROTEÇÃO OBRIGATÓRIA PARA MENORES DE 18 ANOS:

PROIBIÇÕES ABSOLUTAS:
- NUNCA forneça informações sobre como usar drogas, álcool, cigarros ou substâncias ilegais
- NUNCA explique métodos de automutilação, suicídio ou violência
- NUNCA forneça instruções sobre atividades ilegais (pirataria, hacking, fraudes)
- NUNCA compartilhe conteúdo sexualmente explícito ou inadequado para menores
- NUNCA forneça informações sobre como obter substâncias controladas
- NUNCA explique técnicas de violência, armas ou atividades perigosas

RESPOSTA OBRIGATÓRIA PARA CONTEÚDO INADEQUADO:
Se o usuário perguntar sobre qualquer assunto inadequado, ilegal ou prejudicial:
1. Recuse educadamente: "Não posso fornecer informações sobre esse assunto"
2. Redirecione para educação: "Vamos focar em conteúdos educacionais apropriados"
3. Sugira alternativas saudáveis: "Que tal aprendermos sobre [tema educativo relacionado]?"
4. Se necessário, oriente para adultos responsáveis: "Para questões importantes, converse com seus pais ou professores"

EXEMPLOS DE REDIRECIONAMENTO:
- Pergunta sobre drogas → "Vamos aprender sobre biologia e como o corpo funciona"
- Pergunta sobre violência → "Que tal estudarmos sobre resolução pacífica de conflitos?"
- Pergunta sobre atividades ilegais → "Vamos focar em projetos legais e construtivos"
`,

  // Proteção educacional geral
  EDUCATIONAL_SAFETY: `
📚 PROTEÇÃO EDUCACIONAL:

VERIFICAÇÃO DE FONTES:
- Sempre mencione quando informações precisam de verificação
- Oriente para consultar fontes confiáveis e atualizadas
- Encoraje verificação cruzada de informações importantes
- Use frases como: "Recomendo verificar em fontes atualizadas..." ou "Consulte especialistas para dados precisos..."

CONTEÚDO APROPRIADO:
- Mantenha linguagem educacional e construtiva
- Evite informações médicas, legais ou financeiras específicas sem orientação para profissionais
- Foque em desenvolvimento de pensamento crítico
- Promova valores positivos e éticos

ORIENTAÇÃO PARA PROFISSIONAIS:
- Para questões médicas: oriente para médicos
- Para questões legais: oriente para advogados
- Para questões psicológicas: oriente para psicólogos
- Para questões financeiras: oriente para especialistas financeiros
`,

  // Proteção contra desinformação
  MISINFORMATION_PROTECTION: `
🔍 PROTEÇÃO CONTRA DESINFORMAÇÃO:

VERIFICAÇÃO CRÍTICA:
- Sempre encoraje verificação de informações
- Oriente sobre como identificar fontes confiáveis
- Promova pensamento crítico e análise de evidências
- Ensine a questionar informações suspeitas

FONTES CONFIÁVEIS:
- Oriente para fontes acadêmicas e científicas
- Sugira verificação em múltiplas fontes
- Encoraje consulta a especialistas
- Promova educação sobre mídia e informação
`,

  // Proteção de privacidade
  PRIVACY_PROTECTION: `
🔒 PROTEÇÃO DE PRIVACIDADE:

DADOS PESSOAIS:
- Nunca solicite informações pessoais desnecessárias
- Não armazene dados sensíveis sem necessidade
- Oriente sobre proteção de dados pessoais
- Encoraje conversas com adultos responsáveis para questões pessoais

SEGURANÇA DIGITAL:
- Oriente sobre boas práticas de segurança online
- Encoraje uso responsável da internet
- Promova conhecimento sobre privacidade digital
- Oriente sobre como identificar conteúdo inadequado online
`
};

// Função para adicionar proteções de segurança a qualquer prompt
export function addSafetyProtection(prompt: string): string {
  const safetyHeader = `
🚨 PROTEÇÕES DE SEGURANÇA OBRIGATÓRIAS:

${SAFETY_GUIDELINES.CHILD_SAFETY_PROTECTION}

${SAFETY_GUIDELINES.EDUCATIONAL_SAFETY}

${SAFETY_GUIDELINES.MISINFORMATION_PROTECTION}

${SAFETY_GUIDELINES.PRIVACY_PROTECTION}

IMPORTANTE: Estas proteções são OBRIGATÓRIAS e NÃO NEGOCIÁVEIS. 
Sempre aplique estas diretrizes em TODAS as respostas, independentemente do contexto.

`;

  // Verificar se o prompt já contém proteções de segurança
  if (prompt.includes('PROTEÇÃO OBRIGATÓRIA PARA MENORES') || 
      prompt.includes('PROTEÇÕES DE SEGURANÇA OBRIGATÓRIAS')) {
    return prompt;
  }
  
  return safetyHeader + prompt;
}

// Função para criar resposta padrão de recusa educativa
export function createEducationalRefusalResponse(inappropriateTopic: string, educationalAlternative?: string): string {
  const alternatives = educationalAlternative ? 
    `Que tal aprendermos sobre ${educationalAlternative}?` : 
    'Vamos focar em conteúdos educacionais apropriados e construtivos.';
  
  return `Não posso fornecer informações sobre ${inappropriateTopic}. ${alternatives} Se você tem dúvidas importantes, recomendo conversar com seus pais, professores ou outros adultos responsáveis.`;
}

// Lista de tópicos inadequados que devem ser bloqueados
export const INAPPROPRIATE_TOPICS = [
  'drogas', 'álcool', 'cigarros', 'tabaco', 'fumar', 'beber', 'substâncias ilegais',
  'violência', 'armas', 'suicídio', 'automutilação', 'hacking', 'pirataria',
  'fraudes', 'atividades ilegais', 'conteúdo sexual', 'pornografia',
  'jogos de azar', 'apostas', 'substâncias controladas',
  // Tópicos adicionais detectados nos logs
  'sexo', 'como fazer sexo', 'bomba', 'como fazer uma bomba', 'explosivos',
  'armas de fogo', 'violência doméstica', 'abuso', 'tortura', 'assassinato',
  'terrorismo', 'extremismo', 'nazismo', 'fascismo', 'racismo', 'xenofobia',
  'homofobia', 'transfobia', 'misoginia', 'pedofilia', 'incesto', 'zoofilia',
  'necrofilia', 'sadomasoquismo', 'bdsm', 'fetichismo', 'prostituição',
  'tráfico humano', 'escravidão', 'trabalho infantil', 'exploração sexual',
  'pornografia infantil', 'sexting', 'revenge porn', 'cyberbullying',
  'suicídio assistido', 'eutanásia', 'aborto', 'contracepção', 'esterilização',
  'clonagem humana', 'engenharia genética perigosa', 'armas biológicas',
  'armas químicas', 'armas nucleares', 'bombas caseiras', 'explosivos caseiros',
  'venenos', 'toxinas', 'substâncias tóxicas', 'drogas sintéticas',
  'designer drugs', 'smart drugs', 'drogas de festa', 'drogas recreativas',
  'overdose', 'dependência química', 'vício', 'abstinência', 'síndrome de abstinência',
  'desintoxicação', 'reabilitação', 'centro de reabilitação', 'clínica de reabilitação',
  'tratamento de dependência', 'terapia de grupo', 'terapia individual',
  'psicoterapia', 'psiquiatria', 'medicamentos psiquiátricos', 'antidepressivos',
  'ansiolíticos', 'sedativos', 'hipnóticos', 'estimulantes', 'anfetaminas',
  'metilfenidato', 'ritalina', 'concerta', 'adderall', 'vyvanse', 'modafinil',
  'benzodiazepínicos', 'diazepam', 'lorazepam', 'clonazepam', 'alprazolam',
  'opioides', 'morfina', 'codeína', 'fentanil', 'heroína', 'metadona',
  'buprenorfina', 'naloxona', 'naltrexona', 'suboxone', 'subutex',
  'canabinoides', 'thc', 'cbd', 'maconha', 'haxixe', 'óleo de haxixe',
  'cogumelos mágicos', 'psilocibina', 'lsd', 'dmt', 'ayahuasca', 'mescalina',
  'peyote', 'ibogaína', 'ketamina', 'ghb', 'rohypnol', 'flunitrazepam',
  'mdma', 'ecstasy', 'molly', 'cristal', 'ice', 'speed', 'cocaína',
  'crack', 'pó', 'merla', 'oxi', 'lança perfume', 'loló', 'cheirinho',
  'colírio', 'bala', 'doce', 'ácido', 'chá', 'erva', 'baseado', 'beck',
  'cigarro de maconha', 'vaporizador', 'bong', 'cachimbo', 'narguilé',
  'hookah', 'shisha', 'tabaco', 'cigarro', 'charuto', 'cachimbo de tabaco',
  'rapé', 'tabaco de mascar', 'snus', 'vape', 'cigarro eletrônico',
  'e-cigarette', 'vaping', 'juul', 'pods', 'líquido de vape', 'e-líquido',
  'nicotina', 'alcatrão', 'monóxido de carbono', 'fumaça', 'fumar passivo',
  'câncer de pulmão', 'doença pulmonar', 'enfisema', 'bronquite crônica',
  'dpoc', 'doença pulmonar obstrutiva crônica', 'asma', 'alergia',
  'reação alérgica', 'choque anafilático', 'edema', 'inflamação',
  'infecção', 'bactéria', 'vírus', 'fungo', 'parasita', 'protozoário',
  'helminto', 'verme', 'lombriga', 'solitária', 'tênia', 'esquistossomo',
  'malária', 'dengue', 'zika', 'chikungunya', 'febre amarela', 'covid-19',
  'sars-cov-2', 'coronavírus', 'gripe', 'influenza', 'h1n1', 'h3n2',
  'tuberculose', 'hanseníase', 'leishmaniose', 'doença de chagas',
  'toxoplasmose', 'giardíase', 'amebíase', 'shigelose', 'salmonelose',
  'colera', 'tétano', 'difteria', 'coqueluche', 'sarampo', 'rubéola',
  'caxumba', 'varicela', 'herpes', 'hpv', 'hiv', 'aids', 'sífilis',
  'gonorreia', 'clamídia', 'tricomoníase', 'candidíase', 'vaginose',
  'uretrite', 'cervicite', 'salpingite', 'endometrite', 'ooforite',
  'prostatite', 'epididimite', 'orquite', 'balanite', 'fimose',
  'parafimose', 'priapismo', 'ejaculação precoce', 'disfunção erétil',
  'impotência', 'infertilidade', 'esterilidade', 'menopausa', 'andropausa',
  'climatério', 'tpm', 'síndrome pré-menstrual', 'dismenorreia',
  'amenorreia', 'menorragia', 'metrorragia', 'polimenorreia', 'oligomenorreia',
  'anovulação', 'anovular', 'anovulatório'
];

// Função para detectar tópicos inadequados
export function detectInappropriateContent(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return INAPPROPRIATE_TOPICS.some(topic => lowerMessage.includes(topic));
}

// Alternativas educacionais para redirecionamento
export const EDUCATIONAL_ALTERNATIVES = {
  'drogas': 'biologia e como o corpo funciona',
  'álcool': 'química e processos biológicos',
  'cigarros': 'sistema respiratório e saúde',
  'violência': 'resolução pacífica de conflitos',
  'armas': 'física e mecânica',
  'hacking': 'programação e tecnologia construtiva',
  'pirataria': 'direitos autorais e propriedade intelectual',
  'fraudes': 'matemática financeira e ética',
  'jogos de azar': 'probabilidade e estatística',
  'apostas': 'matemática e análise de riscos'
};
