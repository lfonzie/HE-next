// lib/system-prompts/bncc-config.ts
// Configuração completa da BNCC (Base Nacional Comum Curricular) para implementação nos prompts

export interface BNCCCompetencia {
  id: string;
  nome: string;
  descricao: string;
  habilidades: string[];
}

export interface BNCCArea {
  id: string;
  nome: string;
  disciplinas: string[];
  competencias: string[];
  habilidades_especificas: string[];
}

export interface BNCCSkill {
  id: string;
  nome: string;
  descricao: string;
  competencia_relacionada: string;
  area_conhecimento: string;
}

// 10 Competências Gerais da BNCC
export const BNCC_COMPETENCIAS: Record<string, BNCCCompetencia> = {
  competencia1: {
    id: "competencia1",
    nome: "Conhecimento",
    descricao: "Valorizar e utilizar conhecimentos historicamente construídos sobre o mundo físico, social, cultural e digital para entender e explicar a realidade, continuar aprendendo e colaborar para a construção de uma sociedade justa, democrática e inclusiva.",
    habilidades: [
      "Identificar e relacionar conhecimentos de diferentes áreas",
      "Aplicar conhecimentos históricos para compreender o presente",
      "Utilizar conhecimentos científicos para explicar fenômenos",
      "Valorizar a diversidade de saberes e culturas"
    ]
  },
  competencia2: {
    id: "competencia2",
    nome: "Pensamento Científico, Crítico e Criativo",
    descricao: "Exercitar a curiosidade intelectual e recorrer à abordagem própria das ciências, incluindo a investigação, a reflexão, a análise crítica, a imaginação e a criatividade, para investigar causas, elaborar e testar hipóteses, formular e resolver problemas e criar soluções (inclusive tecnológicas) com base nos conhecimentos das diferentes áreas.",
    habilidades: [
      "Formular hipóteses e testá-las",
      "Analisar criticamente informações",
      "Resolver problemas de forma criativa",
      "Investigar causas e efeitos",
      "Criar soluções inovadoras"
    ]
  },
  competencia3: {
    id: "competencia3",
    nome: "Repertório Cultural",
    descricao: "Valorizar e fruir as diversas manifestações artísticas e culturais, das locais às mundiais, e também participar de práticas diversificadas da produção artístico-cultural.",
    habilidades: [
      "Reconhecer e valorizar manifestações culturais",
      "Participar de práticas artísticas",
      "Fruir diferentes formas de arte",
      "Respeitar a diversidade cultural"
    ]
  },
  competencia4: {
    id: "competencia4",
    nome: "Comunicação",
    descricao: "Utilizar diferentes linguagens – verbal (oral ou visual-motora, como Libras, e escrita), corporal, visual, sonora e digital –, bem como conhecimentos das linguagens artísticas, matemáticas e científicas, para se expressar e partilhar informações, experiências, ideias e sentimentos em diferentes contextos e produzir sentidos que levem ao entendimento mútuo.",
    habilidades: [
      "Expressar-se claramente em diferentes linguagens",
      "Comunicar ideias de forma eficaz",
      "Utilizar linguagens digitais",
      "Adaptar comunicação ao contexto",
      "Promover entendimento mútuo"
    ]
  },
  competencia5: {
    id: "competencia5",
    nome: "Cultura Digital",
    descricao: "Compreender, utilizar e criar tecnologias digitais de informação e comunicação de forma crítica, significativa, reflexiva e ética nas diversas práticas sociais (incluindo as escolares) para se comunicar, acessar e disseminar informações, produzir conhecimentos, resolver problemas e exercer protagonismo e autoria na vida pessoal e coletiva.",
    habilidades: [
      "Utilizar tecnologias digitais de forma crítica",
      "Criar conteúdo digital",
      "Acessar e disseminar informações",
      "Resolver problemas com tecnologia",
      "Exercer protagonismo digital"
    ]
  },
  competencia6: {
    id: "competencia6",
    nome: "Trabalho e Projeto de Vida",
    descricao: "Valorizar a diversidade de saberes e vivências culturais, apropriando-se de conhecimentos e experiências que lhe possibilitem entender as relações próprias do mundo do trabalho e fazer escolhas alinhadas ao exercício da cidadania e ao seu projeto de vida, com liberdade, autonomia, consciência crítica e responsabilidade.",
    habilidades: [
      "Fazer escolhas conscientes",
      "Desenvolver projeto de vida",
      "Exercer cidadania",
      "Valorizar diversidade de saberes",
      "Agir com autonomia e responsabilidade"
    ]
  },
  competencia7: {
    id: "competencia7",
    nome: "Argumentação",
    descricao: "Argumentar com base em fatos, dados e informações confiáveis, para formular, negociar e defender ideias, pontos de vista e decisões comuns que respeitem e promovam os direitos humanos e a consciência socioambiental em âmbito local, regional e global, com posicionamento ético em relação ao cuidado de si mesmo e dos outros.",
    habilidades: [
      "Argumentar com base em fatos e dados",
      "Defender ideias com ética",
      "Promover direitos humanos",
      "Desenvolver consciência socioambiental",
      "Negociar soluções comuns"
    ]
  },
  competencia8: {
    id: "competencia8",
    nome: "Autoconhecimento e Autocuidado",
    descricao: "Conhecer-se, apreciar-se e cuidar de sua saúde física e emocional, compreendendo-se na diversidade humana e reconhecendo suas emoções e as dos outros, com autocrítica e capacidade para lidar com elas.",
    habilidades: [
      "Conhecer-se e apreciar-se",
      "Cuidar da saúde física e emocional",
      "Reconhecer e lidar com emoções",
      "Desenvolver autocrítica",
      "Reconhecer diversidade humana"
    ]
  },
  competencia9: {
    id: "competencia9",
    nome: "Empatia e Cooperação",
    descricao: "Exercitar a empatia, o diálogo, a resolução de conflitos e a cooperação, fazendo-se respeitar e promovendo o respeito ao outro e aos direitos humanos, com acolhimento e valorização da diversidade de indivíduos e de grupos sociais, seus saberes, identidades, culturas e potencialidades, sem preconceitos de qualquer natureza.",
    habilidades: [
      "Exercitar empatia e diálogo",
      "Resolver conflitos pacificamente",
      "Cooperar com outros",
      "Promover respeito aos direitos humanos",
      "Valorizar diversidade sem preconceitos"
    ]
  },
  competencia10: {
    id: "competencia10",
    nome: "Responsabilidade e Cidadania",
    descricao: "Agir pessoal e coletivamente com autonomia, responsabilidade, flexibilidade, resiliência e determinação, tomando decisões com base em princípios éticos, democráticos, inclusivos, sustentáveis e solidários.",
    habilidades: [
      "Agir com autonomia e responsabilidade",
      "Tomar decisões éticas",
      "Promover valores democráticos",
      "Agir de forma sustentável",
      "Exercer solidariedade"
    ]
  }
};

// Áreas do Conhecimento (ENEM) com competências específicas
export const BNCC_AREAS: Record<string, BNCCArea> = {
  linguagens: {
    id: "linguagens",
    nome: "Linguagens e suas Tecnologias",
    disciplinas: ["Português", "Literatura", "Inglês", "Espanhol", "Artes", "Educação Física"],
    competencias: ["competencia1", "competencia3", "competencia4", "competencia5"],
    habilidades_especificas: [
      "Interpretar textos em diferentes linguagens",
      "Produzir textos adequados ao contexto",
      "Analisar obras literárias",
      "Comunicar-se em línguas estrangeiras",
      "Criar e fruir manifestações artísticas"
    ]
  },
  ciencias_humanas: {
    id: "ciencias_humanas",
    nome: "Ciências Humanas e Sociais Aplicadas",
    disciplinas: ["História", "Geografia", "Filosofia", "Sociologia"],
    competencias: ["competencia1", "competencia7", "competencia9", "competencia10"],
    habilidades_especificas: [
      "Analisar processos históricos e geográficos",
      "Compreender questões sociais e políticas",
      "Desenvolver pensamento crítico",
      "Relacionar diferentes áreas do conhecimento",
      "Exercer cidadania responsável"
    ]
  },
  ciencias_natureza: {
    id: "ciencias_natureza",
    nome: "Ciências da Natureza e suas Tecnologias",
    disciplinas: ["Física", "Química", "Biologia"],
    competencias: ["competencia2", "competencia5", "competencia7"],
    habilidades_especificas: [
      "Compreender fenômenos naturais",
      "Aplicar conhecimentos científicos",
      "Relacionar ciência, tecnologia e sociedade",
      "Desenvolver pensamento científico",
      "Resolver problemas científicos"
    ]
  },
  matematica: {
    id: "matematica",
    nome: "Matemática e suas Tecnologias",
    disciplinas: ["Matemática"],
    competencias: ["competencia2", "competencia4", "competencia5"],
    habilidades_especificas: [
      "Resolver problemas matemáticos",
      "Utilizar linguagem matemática",
      "Aplicar conceitos matemáticos",
      "Desenvolver raciocínio lógico",
      "Interpretar dados e gráficos"
    ]
  }
};

// Habilidades específicas da BNCC por disciplina
export const BNCC_HABILIDADES_ESPECIFICAS: Record<string, BNCCSkill[]> = {
  portugues: [
    {
      id: "EF01LP01",
      nome: "Reconhecer diferentes gêneros textuais",
      descricao: "Identificar características de diferentes gêneros textuais",
      competencia_relacionada: "competencia4",
      area_conhecimento: "linguagens"
    },
    {
      id: "EF01LP02",
      nome: "Produzir textos adequados ao contexto",
      descricao: "Criar textos considerando propósito, interlocutor e contexto",
      competencia_relacionada: "competencia4",
      area_conhecimento: "linguagens"
    }
  ],
  matematica: [
    {
      id: "EF01MA01",
      nome: "Resolver problemas matemáticos",
      descricao: "Aplicar estratégias para resolver problemas matemáticos",
      competencia_relacionada: "competencia2",
      area_conhecimento: "matematica"
    },
    {
      id: "EF01MA02",
      nome: "Utilizar linguagem matemática",
      descricao: "Comunicar ideias matemáticas usando linguagem apropriada",
      competencia_relacionada: "competencia4",
      area_conhecimento: "matematica"
    }
  ],
  historia: [
    {
      id: "EF01HI01",
      nome: "Analisar processos históricos",
      descricao: "Compreender e analisar processos históricos",
      competencia_relacionada: "competencia1",
      area_conhecimento: "ciencias_humanas"
    },
    {
      id: "EF01HI02",
      nome: "Relacionar passado e presente",
      descricao: "Estabelecer relações entre acontecimentos históricos e o presente",
      competencia_relacionada: "competencia1",
      area_conhecimento: "ciencias_humanas"
    }
  ],
  biologia: [
    {
      id: "EF01BI01",
      nome: "Compreender fenômenos biológicos",
      descricao: "Explicar fenômenos biológicos usando conhecimentos científicos",
      competencia_relacionada: "competencia2",
      area_conhecimento: "ciencias_natureza"
    },
    {
      id: "EF01BI02",
      nome: "Relacionar biologia e sociedade",
      descricao: "Conectar conhecimentos biológicos com questões sociais",
      competencia_relacionada: "competencia7",
      area_conhecimento: "ciencias_natureza"
    }
  ]
};

// Funções utilitárias para trabalhar com BNCC
export function getCompetenciasByArea(area: string): BNCCCompetencia[] {
  const areaConfig = BNCC_AREAS[area];
  if (!areaConfig) return [];
  
  return areaConfig.competencias.map(compId => BNCC_COMPETENCIAS[compId]);
}

export function getHabilidadesByDisciplina(disciplina: string): BNCCSkill[] {
  const disciplinaKey = disciplina.toLowerCase().replace(/\s+/g, '_');
  return BNCC_HABILIDADES_ESPECIFICAS[disciplinaKey] || [];
}

export function getCompetenciasByDisciplina(disciplina: string): BNCCCompetencia[] {
  const disciplinaKey = disciplina.toLowerCase().replace(/\s+/g, '_');
  const habilidades = BNCC_HABILIDADES_ESPECIFICAS[disciplinaKey] || [];
  const competenciasIds = [...new Set(habilidades.map(h => h.competencia_relacionada))];
  
  return competenciasIds.map(compId => BNCC_COMPETENCIAS[compId]);
}

export function generateBNCCPrompt(disciplina: string, conteudo: string): string {
  const competencias = getCompetenciasByDisciplina(disciplina);
  const habilidades = getHabilidadesByDisciplina(disciplina);
  
  let prompt = `\n🎯 ALINHAMENTO BNCC OBRIGATÓRIO:\n`;
  prompt += `- Conteúdo: ${conteudo}\n`;
  prompt += `- Disciplina: ${disciplina}\n\n`;
  
  if (competencias.length > 0) {
    prompt += `COMPETÊNCIAS BNCC DESENVOLVIDAS:\n`;
    competencias.forEach(comp => {
      prompt += `- ${comp.nome}: ${comp.descricao}\n`;
    });
    prompt += `\n`;
  }
  
  if (habilidades.length > 0) {
    prompt += `HABILIDADES BNCC EXERCITADAS:\n`;
    habilidades.forEach(habilidade => {
      prompt += `- ${habilidade.nome}: ${habilidade.descricao}\n`;
    });
    prompt += `\n`;
  }
  
  prompt += `IMPORTANTE: Sempre identifique e desenvolva as competências e habilidades BNCC relacionadas ao conteúdo abordado.`;
  
  return prompt;
}

export function validateBNCCAlignment(content: string, competencias: string[]): boolean {
  // Validação básica - verificar se o conteúdo menciona as competências
  const contentLower = content.toLowerCase();
  return competencias.some(comp => contentLower.includes(comp.toLowerCase()));
}

export function getBNCCRecommendations(disciplina: string, nivel: string): string[] {
  const competencias = getCompetenciasByDisciplina(disciplina);
  const recomendacoes: string[] = [];
  
  competencias.forEach(comp => {
    recomendacoes.push(`Desenvolver ${comp.nome} através de atividades práticas`);
    recomendacoes.push(`Exercitar habilidades relacionadas a ${comp.nome}`);
    recomendacoes.push(`Avaliar progresso em ${comp.nome}`);
  });
  
  return recomendacoes;
}
