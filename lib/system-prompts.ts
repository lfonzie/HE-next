// Sistema de Prompts Institucionais para Módulos de Comunicação
// Integração com o sistema de chat existente

import { InstitutionalPrompt, createInstitutionalPrompt } from './institutional-prompts'

// Cache de prompts por escola
const schoolPromptsCache = new Map<string, string>()

// Função para obter prompt institucional baseado no contexto
export function getInstitutionalPrompt(
  module: string, 
  schoolId?: string, 
  context?: Record<string, any>
): string {
  // Se não há schoolId, usar prompt padrão genérico
  if (!schoolId) {
    return getDefaultPrompt(module)
  }

  // Verificar cache primeiro
  const cacheKey = `${module}-${schoolId}`
  if (schoolPromptsCache.has(cacheKey)) {
    return schoolPromptsCache.get(cacheKey)!
  }

  // TODO: Buscar dados da escola no banco de dados
  // Por enquanto, usar prompt padrão genérico
  const prompt = getDefaultPrompt(module)
  schoolPromptsCache.set(cacheKey, prompt)
  
  return prompt
}

// Prompts padrão genéricos para cada módulo (sem dados específicos da escola)
function getDefaultPrompt(module: string): string {
  const basePrompt = `# HubEdu.ia - ${getModuleName(module)}

You are a professional virtual assistant representing HubEdu.ia educational platform.

## Your Role
- Role: ${getModuleRole(module)}
- Tone: Professional, helpful, and always include relevant emojis for WhatsApp communication
- Language: Always respond in Portuguese (Brazilian Portuguese)
- Communication Style: Clear, objective, and always mention when information should be confirmed with the school

## Important Guidelines
1. Always be helpful and provide accurate information
2. If you're unsure about specific details, always recommend contacting the school directly
3. Always mention that information should be confirmed with the school administration
4. Use emojis appropriately to make communication friendly
5. Never provide information that could be outdated or incorrect
6. Always be respectful and professional

## Disclaimer
Always end responses with: "Para informações específicas ou confirmações, recomendo entrar em contato diretamente com a secretaria da escola. 📞"

Remember: You represent HubEdu.ia and should always maintain professional standards in your interactions.`

  const moduleSpecificGuidelines = getModuleSpecificGuidelines(module)
  
  return `${basePrompt}\n\n${moduleSpecificGuidelines}`
}

function getModuleName(module: string): string {
  const moduleNames: Record<string, string> = {
    'secretaria': 'Secretaria Virtual',
    'financeiro': 'Financeiro Virtual', 
    'coordenacao': 'Coordenação Pedagógica',
    'rh': 'RH Interno',
    'atendimento': 'Atendimento Geral'
  }
  return moduleNames[module] || 'Assistente Virtual'
}

function getModuleRole(module: string): string {
  const moduleRoles: Record<string, string> = {
    'secretaria': 'Virtual Secretary Assistant',
    'financeiro': 'Financial Assistant',
    'coordenacao': 'Pedagogical Coordination Assistant',
    'rh': 'Human Resources Assistant',
    'atendimento': 'General Support Assistant'
  }
  return moduleRoles[module] || 'Virtual Assistant'
}

function getModuleSpecificGuidelines(module: string): string {
  const guidelines: Record<string, string> = {
    'secretaria': `## Secretaria Guidelines
- Help with enrollment information, available spots, required documents
- Provide school calendar and operating hours
- Assist with scholarship and discount information
- Always emphasize the need to confirm specific details with the school
- Be especially helpful with administrative procedures`,

    'financeiro': `## Financeiro Guidelines  
- Help with tuition fees, payment methods, and discounts
- Provide information about school materials and their costs
- Explain available discounts (family, early payment, etc.)
- Always highlight applied discounts
- Be transparent about costs and payment options`,

    'coordenacao': `## Coordenação Guidelines
- Help with pedagogical programs (Integral, Bilíngue, LIV, CODE)
- Provide information about school rules and discipline
- Assist with uniform and agenda requirements
- Explain teaching methodology and academic calendar
- Be supportive with academic guidance`,

    'rh': `## RH Guidelines
- Help with payroll, benefits, and internal processes
- Provide information about company policies
- Assist with vacation and leave procedures
- Explain internal communication processes
- Maintain confidentiality and professionalism
- This module is restricted to school employees only`,

    'atendimento': `## Atendimento Guidelines
- Provide general assistance and direct users to appropriate modules
- Help with basic questions about the platform
- Offer guidance on available features
- Be welcoming and helpful to all users
- Direct complex queries to specialized modules`
  }
  
  return guidelines[module] || ''
}

// Função para atualizar prompt de uma escola específica
export async function updateSchoolPrompt(
  schoolId: string, 
  module: string, 
  promptData: Partial<InstitutionalPrompt>
): Promise<void> {
  // TODO: Implementar atualização no banco de dados
  // Por enquanto, apenas limpar cache
  const cacheKey = `${module}-${schoolId}`
  schoolPromptsCache.delete(cacheKey)
  
  console.log(`Updated prompt for school ${schoolId}, module ${module}`)
}

// Função para obter lista de módulos disponíveis
export function getAvailableModules(): string[] {
  return ['secretaria', 'financeiro', 'coordenacao', 'rh', 'atendimento']
}

// Função para validar se um módulo existe
export function isValidModule(module: string): boolean {
  return getAvailableModules().includes(module)
}

// Função para obter informações do módulo
export function getModuleInfo(module: string) {
  const moduleInfo: Record<string, { name: string; description: string; requiresAuth: boolean }> = {
    'secretaria': {
      name: 'Secretaria Virtual',
      description: 'Informações sobre vagas, matrícula, documentos e calendário escolar',
      requiresAuth: false
    },
    'financeiro': {
      name: 'Financeiro Virtual', 
      description: 'Valores, descontos, formas de pagamento e materiais escolares',
      requiresAuth: false
    },
    'coordenacao': {
      name: 'Coordenação Pedagógica',
      description: 'Programas pedagógicos, regras institucionais e orientações acadêmicas',
      requiresAuth: false
    },
    'rh': {
      name: 'RH Interno',
      description: 'Folha de pagamento, processos internos e políticas da empresa',
      requiresAuth: true
    },
    'atendimento': {
      name: 'Atendimento Geral',
      description: 'Assistência geral e direcionamento para módulos especializados',
      requiresAuth: false
    }
  }
  
  return moduleInfo[module] || null
}
