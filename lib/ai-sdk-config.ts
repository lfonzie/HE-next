import { openai } from '@ai-sdk/openai'
import { getLanguageInstructions } from './system-prompts/language-config'
import { generateBNCCPrompt, getCompetenciasByDisciplina } from './system-prompts/bncc-config'
import { createBNCCClassifier } from './ai/bncc-classifier'

export const aiConfig = {
  openai: openai({
    apiKey: process.env.OPENAI_API_KEY!,
  }),
  model: 'gpt-4o-mini',
  maxTokens: 2048,
  temperature: 0.7,
}

export function getSystemPrompt(module: string = 'professor'): string {
  const baseInstructions = getLanguageInstructions(module);

  const prompts = {
    professor: `Você é um assistente especializado em preparação para o ENEM, criando aulas interativas que focam especificamente nos conteúdos e habilidades exigidas pelo Exame Nacional do Ensino Médio.

🎯 METODOLOGIA EDUCACIONAL ESPECÍFICA PARA ENEM:
- Foque nos conteúdos que mais caem no ENEM conforme estatísticas oficiais
- Use a TRI (Teoria de Resposta ao Item) como base para criar questões
- Prepare o aluno para interpretar textos, gráficos e tabelas
- Desenvolva habilidades de análise crítica e argumentação
- Conecte teoria com situações do cotidiano brasileiro
- Use linguagem clara e objetiva, adequada ao nível do ENEM

IMPORTANTE SOBRE AS PERGUNTAS (ESTILO ENEM):
- Crie questões que exijam interpretação de textos, gráficos ou tabelas
- Use linguagem clara e objetiva, sem ambiguidades
- Inclua situações do cotidiano brasileiro
- Teste habilidades de análise, síntese e argumentação
- Use alternativas plausíveis que testem conhecimento real
- Foque em competências e habilidades específicas da BNCC
- Identifique e desenvolva as competências BNCC relacionadas ao conteúdo
- Exercite habilidades específicas da BNCC em cada atividade
- Sempre indique quais competências BNCC estão sendo desenvolvidas
- Oriente o aluno a identificar palavras-chave e eliminar alternativas

${baseInstructions}`,
    enem: `Você é um especialista em preparação para o ENEM.${baseInstructions}`,
    ti: `Você é um especialista em tecnologia da informação.${baseInstructions}`,
    atendimento: `Você é um especialista em atendimento ao cliente.${baseInstructions}`,
    coordenacao: `Você é um especialista em coordenação pedagógica.${baseInstructions}`,
    financeiro: `Você é um especialista em gestão financeira.${baseInstructions}`,
    rh: `Você é um especialista em recursos humanos.${baseInstructions}`,
    'social-media': `Você é um especialista em marketing digital.${baseInstructions}`,
    'bem-estar': `Você é um especialista em bem-estar escolar.${baseInstructions}`,
    secretaria: `Você é um especialista em administração escolar.${baseInstructions}`,
  }
  
  return prompts[module as keyof typeof prompts] || prompts.professor
}

// Função para validar alinhamento BNCC
export async function validateBNCCAlignment(content: string, subject: string): Promise<boolean> {
  try {
    const bnccClassifier = createBNCCClassifier(aiConfig.openai);
    const competencias = getCompetenciasByDisciplina(subject);
    const expectedCompetencies = competencias.map(comp => comp.id);
    
    return await bnccClassifier.validateBNCCAlignment(content, expectedCompetencies);
  } catch (error) {
    console.error('Error validating BNCC alignment:', error);
    return false;
  }
}

// Função para gerar conteúdo alinhado à BNCC
export async function generateBNCCAlignedContent(content: string, subject: string, level: string): Promise<string> {
  try {
    const bnccClassifier = createBNCCClassifier(aiConfig.openai);
    return await bnccClassifier.generateBNCCAlignedContent(content, subject, level);
  } catch (error) {
    console.error('Error generating BNCC aligned content:', error);
    return content;
  }
}

export default aiConfig
