import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedPlaybook {
  issue: string
  metadata: {
    title: string
    tags: string[]
    category: string
    complexity: 'simple' | 'medium' | 'complex'
  }
  entry: {
    say: string
    checklist: string[]
  }
  steps: Record<string, {
    title: string
    ask?: string
    say?: string
    options?: { label: string; next: string }[]
    actions?: { tool: string; args?: Record<string, any> }[]
    next?: string
    on_yes?: string | { next: string }
    on_no?: string | { next: string }
    resolution?: string
    close?: boolean
    severity?: string
    handoff?: boolean
  }>
}

export class AIPlaybookGenerator {
  private static instance: AIPlaybookGenerator
  private playbookCache = new Map<string, GeneratedPlaybook>()

  static getInstance(): AIPlaybookGenerator {
    if (!AIPlaybookGenerator.instance) {
      AIPlaybookGenerator.instance = new AIPlaybookGenerator()
    }
    return AIPlaybookGenerator.instance
  }

  async generatePlaybook(problemDescription: string, context?: any): Promise<GeneratedPlaybook> {
    // Check cache first
    const cacheKey = this.generateCacheKey(problemDescription)
    if (this.playbookCache.has(cacheKey)) {
      return this.playbookCache.get(cacheKey)!
    }

    // Generate new playbook using AI
    const playbook = await this.generateWithAI(problemDescription, context)
    
    // Cache the result
    this.playbookCache.set(cacheKey, playbook)
    
    return playbook
  }

  private generateCacheKey(problemDescription: string): string {
    // Create a simple hash of the problem description for caching
    return Buffer.from(problemDescription.toLowerCase().trim()).toString('base64').slice(0, 20)
  }

  private async generateWithAI(problemDescription: string, context?: any): Promise<GeneratedPlaybook> {
    const systemPrompt = `Você é um especialista em TI educacional que cria playbooks de diagnóstico estruturados.

Crie um playbook YAML completo para resolver o problema descrito pelo usuário. O playbook deve ser:
1. Estruturado e lógico
2. Adaptado ao ambiente educacional
3. Com passos práticos e acionáveis
4. Com escalação quando necessário

FORMATO DE RESPOSTA:
Retorne APENAS um JSON válido com a estrutura do playbook. Não inclua explicações ou texto adicional.

ESTRUTURA REQUERIDA:
{
  "issue": "identificador_do_problema",
  "metadata": {
    "title": "Título descritivo",
    "tags": ["tag1", "tag2"],
    "category": "categoria",
    "complexity": "simple|medium|complex"
  },
  "entry": {
    "say": "Mensagem inicial para o usuário",
    "checklist": ["step1", "step2"]
  },
  "steps": {
    "step1": {
      "title": "Título do passo",
      "ask": "Pergunta para o usuário",
      "on_yes": "next_step",
      "on_no": "alternative_step"
    }
  }
}

REGRAS:
- Use português brasileiro
- Seja objetivo e prático
- Inclua escalação (handoff: true) quando necessário
- Máximo 10 passos para manter simplicidade
- Sempre termine com "resolve" ou "escalate_p1/p2/p3"`

    const userPrompt = `Problema: "${problemDescription}"

Contexto adicional: ${context ? JSON.stringify(context) : 'Nenhum'}

Crie um playbook completo para resolver este problema.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from AI')
      }

      // Parse JSON response
      const playbookData = JSON.parse(response)
      
      // Validate and structure the playbook
      return this.validateAndStructurePlaybook(playbookData, problemDescription)
      
    } catch (error) {
      console.error('Error generating playbook with AI:', error)
      // Fallback to generic playbook
      return this.getGenericPlaybook(problemDescription)
    }
  }

  private validateAndStructurePlaybook(data: any, originalProblem: string): GeneratedPlaybook {
    // Ensure required fields exist
    const playbook: GeneratedPlaybook = {
      issue: data.issue || 'generated_problem',
      metadata: {
        title: data.metadata?.title || 'Problema de TI',
        tags: data.metadata?.tags || ['ti', 'suporte'],
        category: data.metadata?.category || 'general',
        complexity: data.metadata?.complexity || 'medium'
      },
      entry: {
        say: data.entry?.say || `Vamos resolver seu problema: "${originalProblem}"`,
        checklist: data.entry?.checklist || ['understand_problem']
      },
      steps: data.steps || {}
    }

    // Ensure we have at least basic steps
    if (Object.keys(playbook.steps).length === 0) {
      playbook.steps = this.getDefaultSteps()
    }

    // Ensure we have resolution/escalation steps
    if (!this.hasResolutionStep(playbook.steps)) {
      playbook.steps.resolve = {
        title: 'Problema Resolvido',
        resolution: 'problem_resolved',
        close: true
      }
    }

    if (!this.hasEscalationStep(playbook.steps)) {
      playbook.steps.escalate_p3 = {
        title: 'Escalar para Suporte',
        severity: 'P3',
        handoff: true
      }
    }

    return playbook
  }

  private hasResolutionStep(steps: Record<string, any>): boolean {
    return Object.values(steps).some((step: any) => step.close === true || step.resolution)
  }

  private hasEscalationStep(steps: Record<string, any>): boolean {
    return Object.values(steps).some((step: any) => step.handoff === true || step.severity)
  }

  private getDefaultSteps(): Record<string, any> {
    return {
      understand_problem: {
        title: 'Entender o Problema',
        ask: 'Descreva melhor o que está acontecendo.',
        next: 'gather_info'
      },
      gather_info: {
        title: 'Coletar Informações',
        ask: 'Quando começou o problema? O que você estava fazendo?',
        next: 'basic_troubleshooting'
      },
      basic_troubleshooting: {
        title: 'Solução Básica',
        say: 'Vamos tentar algumas soluções básicas.',
        next: 'resolve'
      }
    }
  }

  private getGenericPlaybook(problemDescription: string): GeneratedPlaybook {
    return {
      issue: 'generic_problem',
      metadata: {
        title: 'Suporte TI Genérico',
        tags: ['ti', 'suporte', 'genérico'],
        category: 'general',
        complexity: 'medium'
      },
      entry: {
        say: `Vou te ajudar a resolver: "${problemDescription}". Vamos diagnosticar passo a passo.`,
        checklist: ['understand_problem', 'gather_info', 'basic_troubleshooting']
      },
      steps: {
        understand_problem: {
          title: 'Entender o Problema',
          ask: 'Descreva melhor o que está acontecendo. Quando começou?',
          next: 'gather_info'
        },
        gather_info: {
          title: 'Coletar Informações',
          ask: 'O problema acontece sempre ou apenas às vezes?',
          options: [
            { label: 'Sempre', next: 'check_system' },
            { label: 'Às vezes', next: 'check_patterns' },
            { label: 'Primeira vez', next: 'check_changes' }
          ]
        },
        check_system: {
          title: 'Verificar Sistema',
          say: 'Vamos verificar o sistema básico.',
          ask: 'Reinicie o computador e teste novamente.',
          on_yes: { next: 'resolve' },
          on_no: { next: 'escalate_p3' }
        },
        check_patterns: {
          title: 'Identificar Padrões',
          ask: 'Você consegue identificar algum padrão? (horário, programa específico)',
          next: 'escalate_p3'
        },
        check_changes: {
          title: 'Verificar Mudanças',
          ask: 'Você instalou algo novo ou mudou configurações recentemente?',
          on_yes: { next: 'check_new_software' },
          on_no: { next: 'escalate_p3' }
        },
        check_new_software: {
          title: 'Verificar Software Novo',
          ask: 'Qual software você instalou? Isso pode estar causando conflito.',
          next: 'escalate_p3'
        },
        resolve: {
          title: 'Problema Resolvido',
          resolution: 'problem_resolved',
          close: true
        },
        escalate_p3: {
          title: 'Escalar para Suporte',
          severity: 'P3',
          handoff: true
        }
      }
    }
  }

  // Method to get cached playbooks
  getCachedPlaybooks(): Map<string, GeneratedPlaybook> {
    return this.playbookCache
  }

  // Method to clear cache
  clearCache(): void {
    this.playbookCache.clear()
  }

  // Method to get playbook by issue type
  async getPlaybookByIssue(issueType: string, problemDescription: string): Promise<GeneratedPlaybook> {
    // Try to generate a specific playbook for this issue type
    const specificPrompt = `Problema de ${issueType}: ${problemDescription}`
    return this.generatePlaybook(specificPrompt, { issueType })
  }
}
