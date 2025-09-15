export interface PromptTemplate {
  system: string;
  user: string;
  examples?: string[];
}

export interface AreaConfig {
  name: string;
  disciplines: string[];
  competencies: string[];
  skills: string[];
  commonTopics: string[];
}

export const ENEM_AREAS: Record<string, AreaConfig> = {
  matematica: {
    name: 'Matemática e suas Tecnologias',
    disciplines: ['Matemática', 'Física', 'Química'],
    competencies: [
      'Compreender e utilizar conceitos matemáticos',
      'Aplicar conhecimentos matemáticos em situações práticas',
      'Resolver problemas utilizando raciocínio lógico'
    ],
    skills: [
      'Álgebra', 'Geometria', 'Trigonometria', 'Estatística', 'Probabilidade',
      'Funções', 'Logaritmos', 'Progressões', 'Análise Combinatória'
    ],
    commonTopics: [
      'Funções do 1º e 2º grau', 'Geometria plana e espacial', 'Trigonometria',
      'Estatística e probabilidade', 'Análise combinatória', 'Logaritmos'
    ]
  },
  linguagens: {
    name: 'Linguagens, Códigos e suas Tecnologias',
    disciplines: ['Língua Portuguesa', 'Literatura', 'Língua Estrangeira', 'Artes', 'Educação Física'],
    competencies: [
      'Compreender e interpretar textos',
      'Produzir textos adequados ao contexto',
      'Reconhecer diferentes linguagens e códigos'
    ],
    skills: [
      'Leitura e interpretação', 'Produção textual', 'Gramática', 'Literatura',
      'Língua estrangeira', 'Artes visuais', 'Educação física'
    ],
    commonTopics: [
      'Interpretação de texto', 'Gramática normativa', 'Literatura brasileira',
      'Produção textual', 'Língua estrangeira', 'Artes e cultura'
    ]
  },
  ciencias_natureza: {
    name: 'Ciências da Natureza e suas Tecnologias',
    disciplines: ['Biologia', 'Física', 'Química'],
    competencies: [
      'Compreender fenômenos naturais',
      'Aplicar conhecimentos científicos',
      'Relacionar ciência, tecnologia e sociedade'
    ],
    skills: [
      'Biologia celular', 'Genética', 'Evolução', 'Ecologia', 'Física mecânica',
      'Termodinâmica', 'Química orgânica', 'Química inorgânica'
    ],
    commonTopics: [
      'Biologia celular e molecular', 'Genética e evolução', 'Ecologia e meio ambiente',
      'Física mecânica', 'Química orgânica', 'Termodinâmica'
    ]
  },
  ciencias_humanas: {
    name: 'Ciências Humanas e suas Tecnologias',
    disciplines: ['História', 'Geografia', 'Filosofia', 'Sociologia'],
    competencies: [
      'Compreender processos históricos e geográficos',
      'Analisar questões sociais e políticas',
      'Relacionar diferentes áreas do conhecimento'
    ],
    skills: [
      'História do Brasil', 'História mundial', 'Geografia física', 'Geografia humana',
      'Filosofia', 'Sociologia', 'Política', 'Economia'
    ],
    commonTopics: [
      'História do Brasil', 'História mundial', 'Geografia física e humana',
      'Filosofia e ética', 'Sociologia e política', 'Economia'
    ]
  }
};

export class PromptTemplateManager {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Mathematics template
    this.templates.set('matematica', {
      system: `Você é um especialista em questões de Matemática do ENEM. Gere questões autênticas que:

1. Testem competências matemáticas essenciais
2. Apliquem conceitos em situações práticas
3. Variem entre álgebra, geometria, trigonometria, estatística
4. Sigam o formato oficial ENEM (5 alternativas A-E)
5. Incluam explicações detalhadas e educativas

Foque em: ${ENEM_AREAS.matematica.skills.join(', ')}`,
      user: `Gere questões de Matemática seguindo os exemplos fornecidos. Varie os tópicos e níveis de dificuldade.`,
      examples: [
        'Funções do 1º grau',
        'Geometria plana',
        'Estatística descritiva',
        'Probabilidade',
        'Trigonometria'
      ]
    });

    // Languages template
    this.templates.set('linguagens', {
      system: `Você é um especialista em questões de Linguagens do ENEM. Gere questões que:

1. Testem interpretação e compreensão textual
2. Avaliem conhecimentos gramaticais
3. Incluam literatura brasileira e mundial
4. Abordem diferentes gêneros textuais
5. Sigam o formato oficial ENEM

Foque em: ${ENEM_AREAS.linguagens.skills.join(', ')}`,
      user: `Gere questões de Linguagens seguindo os exemplos fornecidos. Varie entre interpretação, gramática e literatura.`,
      examples: [
        'Interpretação de texto',
        'Gramática normativa',
        'Literatura brasileira',
        'Produção textual',
        'Língua estrangeira'
      ]
    });

    // Natural Sciences template
    this.templates.set('ciencias_natureza', {
      system: `Você é um especialista em questões de Ciências da Natureza do ENEM. Gere questões que:

1. Testem conhecimentos de Biologia, Física e Química
2. Relacionem ciência com tecnologia e sociedade
3. Abordem fenômenos naturais e científicos
4. Incluam aplicações práticas dos conceitos
5. Sigam o formato oficial ENEM

Foque em: ${ENEM_AREAS.ciencias_natureza.skills.join(', ')}`,
      user: `Gere questões de Ciências da Natureza seguindo os exemplos fornecidos. Varie entre Biologia, Física e Química.`,
      examples: [
        'Biologia celular',
        'Genética',
        'Física mecânica',
        'Química orgânica',
        'Ecologia'
      ]
    });

    // Human Sciences template
    this.templates.set('ciencias_humanas', {
      system: `Você é um especialista em questões de Ciências Humanas do ENEM. Gere questões que:

1. Testem conhecimentos de História, Geografia, Filosofia e Sociologia
2. Relacionem diferentes áreas do conhecimento humano
3. Abordem questões sociais, políticas e econômicas
4. Incluam análise crítica e reflexiva
5. Sigam o formato oficial ENEM

Foque em: ${ENEM_AREAS.ciencias_humanas.skills.join(', ')}`,
      user: `Gere questões de Ciências Humanas seguindo os exemplos fornecidos. Varie entre História, Geografia, Filosofia e Sociologia.`,
      examples: [
        'História do Brasil',
        'Geografia física',
        'Filosofia',
        'Sociologia',
        'Política'
      ]
    });
  }

  getTemplate(area: string): PromptTemplate {
    return this.templates.get(area) || this.templates.get('matematica')!;
  }

  getAreaConfig(area: string): AreaConfig {
    return ENEM_AREAS[area] || ENEM_AREAS.matematica;
  }

  buildDynamicPrompt(area: string, request: any): string {
    const template = this.getTemplate(area);
    const config = this.getAreaConfig(area);
    
    let prompt = template.system;
    
    if (request.skill_tags?.length) {
      prompt += `\n\nFoque especialmente em: ${request.skill_tags.join(', ')}`;
    }
    
    if (request.difficulty?.length) {
      prompt += `\n\nNíveis de dificuldade: ${request.difficulty.join(', ')}`;
    }
    
    if (request.years?.length) {
      prompt += `\n\nEstilo dos anos: ${request.years.join(', ')}`;
    }
    
    return prompt;
  }

  // Generate contextual examples based on request
  generateContextualExamples(area: string, request: any): string[] {
    const config = this.getAreaConfig(area);
    let examples = [...config.commonTopics];
    
    if (request.skill_tags?.length) {
      examples = examples.filter(topic => 
        request.skill_tags.some((tag: string) => 
          topic.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }
    
    return examples.slice(0, 5);
  }
}

// Singleton instance
export const promptTemplateManager = new PromptTemplateManager();
