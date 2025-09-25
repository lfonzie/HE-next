import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'
import { getLanguageInstructions } from './system-prompts/language-config'
import { generateBNCCPrompt, getCompetenciasByDisciplina } from './system-prompts/bncc-config'
import { createBNCCClassifier } from './ai/bncc-classifier'
import { getSystemPrompt as getSystemPromptFromJSON, getModuleSettings } from './system-message-loader'

export const aiConfig = {
  openai: process.env.OPENAI_API_KEY ? openai({
    apiKey: process.env.OPENAI_API_KEY,
  }) : null,
  perplexity: process.env.PERPLEXITY_API_KEY ? perplexity(process.env.PERPLEXITY_MODEL_SELECTION || 'sonar', {
    apiKey: process.env.PERPLEXITY_API_KEY,
  }) : null,
  model: 'gpt-4o-mini',
  perplexityModel: process.env.PERPLEXITY_MODEL_SELECTION || 'sonar',
  maxTokens: 2048,
  temperature: 0.7,
}

export function getSystemPrompt(module: string = 'professor'): string {
  // Usar o novo sistema de carregamento de prompts do JSON
  const systemPrompt = getSystemPromptFromJSON(module)
  
  // Adicionar instruções de linguagem se necessário
  const baseInstructions = getLanguageInstructions(module)
  
  // Para módulos específicos, adicionar instruções especiais
  if (module === 'professor') {
    const enemInstructions = `

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
- Oriente o aluno a identificar palavras-chave e eliminar alternativas`
    
    return `${systemPrompt}${enemInstructions}\n\n${baseInstructions}`
  }
  
  return `${systemPrompt}\n\n${baseInstructions}`
}

// Função para validar alinhamento BNCC
export async function validateBNCCAlignment(content: string, subject: string): Promise<boolean> {
  try {
    if (!aiConfig.openai) {
      console.warn('OpenAI não disponível para validação BNCC');
      return false;
    }
    
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
    if (!aiConfig.openai) {
      console.warn('OpenAI não disponível para geração de conteúdo BNCC');
      return content;
    }
    
    const bnccClassifier = createBNCCClassifier(aiConfig.openai);
    return await bnccClassifier.generateBNCCAlignedContent(content, subject, level);
  } catch (error) {
    console.error('Error generating BNCC aligned content:', error);
    return content;
  }
}

export default aiConfig
