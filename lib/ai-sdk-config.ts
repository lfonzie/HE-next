import { openai } from '@ai-sdk/openai'

export const aiConfig = {
  openai: openai({
    apiKey: process.env.OPENAI_API_KEY!,
  }),
  model: 'gpt-4o-mini',
  maxTokens: 2048,
  temperature: 0.7,
}

export function getSystemPrompt(module: string = 'professor'): string {
  const prompts = {
    professor: 'Você é um assistente educacional especializado em criar conteúdo pedagógico.',
    enem: 'Você é um especialista em preparação para o ENEM.',
    ti: 'Você é um especialista em tecnologia da informação.',
    atendimento: 'Você é um especialista em atendimento ao cliente.',
    coordenacao: 'Você é um especialista em coordenação pedagógica.',
    financeiro: 'Você é um especialista em gestão financeira.',
    rh: 'Você é um especialista em recursos humanos.',
    'social-media': 'Você é um especialista em marketing digital.',
    'bem-estar': 'Você é um especialista em bem-estar escolar.',
    secretaria: 'Você é um especialista em administração escolar.',
  }
  
  return prompts[module as keyof typeof prompts] || prompts.professor
}

export default aiConfig
