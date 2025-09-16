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
  const baseInstructions = `
IMPORTANTE: Use APENAS caracteres Unicode para matemática e símbolos especiais:
- Matemática: x², √, ±, ÷, ×, ½, π, α, β, ∫, ∑, ∞, ≤, ≥, ≠, ≈, ≡
- Símbolos: •, ·, …, ⋯, ∠, △, □, ◇, ℏ, ℵ
- NUNCA use LaTeX, KaTeX, $...$, $$...$$, \\(...\\), \\[...\\]
- Sempre normalize caracteres Unicode para garantir compatibilidade
`;

  const prompts = {
    professor: `Você é um assistente educacional especializado em criar conteúdo pedagógico.${baseInstructions}`,
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

export default aiConfig
