// lib/ai-router/safety-layer.ts
// Camada de segurança e conformidade

import { SafetyValidation, SafetyIssue, RouterResponse } from './types';

export class SafetyLayer {
  private readonly piiPatterns = [
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, // CNPJ
    /\b\d{5}-?\d{3}\b/g, // CEP
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, // Telefone
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g // Cartão de crédito
  ];

  private readonly sensitiveTopics = [
    'suicídio', 'suicidio', 'suicide',
    'automutilação', 'automutilacao', 'self-harm',
    'drogas', 'drugs', 'substâncias',
    'violência', 'violencia', 'violence',
    'abuso', 'abuse', 'maus-tratos'
  ];

  private readonly jsonSchemaValidators = new Map<string, any>();

  constructor() {
    this.initializeJsonSchemas();
  }

  private initializeJsonSchemas(): void {
    // Schema para aulas interativas
    this.jsonSchemaValidators.set('aula_interativa', {
      type: 'object',
      required: ['slides'],
      properties: {
        slides: {
          type: 'array',
          minItems: 1,
          maxItems: 9,
          items: {
            type: 'object',
            required: ['titulo', 'conteudo'],
            properties: {
              titulo: { type: 'string', minLength: 1 },
              conteudo: { type: 'string', minLength: 1 },
              tipo: { type: 'string', enum: ['introducao', 'desenvolvimento', 'interativo', 'resumo'] },
              interacao: { type: 'object', required: false }
            }
          }
        }
      }
    });

    // Schema para questões ENEM
    this.jsonSchemaValidators.set('enem', {
      type: 'object',
      required: ['questoes'],
      properties: {
        questoes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['enunciado', 'alternativas', 'resposta', 'explicacao'],
            properties: {
              enunciado: { type: 'string', minLength: 10 },
              alternativas: {
                type: 'array',
                minItems: 5,
                maxItems: 5,
                items: { type: 'string', minLength: 1 }
              },
              resposta: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E'] },
              explicacao: { type: 'string', minLength: 10 }
            }
          }
        }
      }
    });

    // Schema para respostas de TI
    this.jsonSchemaValidators.set('ti', {
      type: 'object',
      required: ['solucao'],
      properties: {
        solucao: { type: 'string', minLength: 1 },
        codigo: { type: 'string', required: false },
        explicacao: { type: 'string', required: false },
        recursos: { type: 'array', required: false }
      }
    });
  }

  async validatePreProcessing(
    text: string,
    context?: Record<string, any>
  ): Promise<SafetyValidation> {
    const issues: SafetyIssue[] = [];
    const recommendations: string[] = [];

    // Verificar PII
    const piiIssues = this.detectPII(text);
    if (piiIssues.length > 0) {
      issues.push({
        type: 'pii',
        severity: 'high',
        description: `PII detectado: ${piiIssues.join(', ')}`,
        suggestion: 'Remover ou mascarar informações pessoais'
      });
      recommendations.push('Aplicar mascaramento de PII antes do processamento');
    }

    // Verificar tópicos sensíveis
    const sensitiveIssues = this.detectSensitiveTopics(text);
    if (sensitiveIssues.length > 0) {
      issues.push({
        type: 'content',
        severity: 'medium',
        description: `Tópicos sensíveis detectados: ${sensitiveIssues.join(', ')}`,
        suggestion: 'Aplicar filtros de conteúdo ou redirecionar para suporte especializado'
      });
      recommendations.push('Considerar roteamento para provedor com filtros avançados');
    }

    // Verificar conformidade LGPD
    const complianceIssues = this.checkLGPDCompliance(text, context);
    if (complianceIssues.length > 0) {
      issues.push({
        type: 'compliance',
        severity: 'high',
        description: `Problemas de conformidade LGPD: ${complianceIssues.join(', ')}`,
        suggestion: 'Garantir que dados sejam processados em jurisdição adequada'
      });
      recommendations.push('Verificar residência de dados do provedor selecionado');
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      recommendations
    };
  }

  async validatePostProcessing(
    response: RouterResponse,
    expectedSchema?: string
  ): Promise<SafetyValidation> {
    const issues: SafetyIssue[] = [];
    const recommendations: string[] = [];

    // Validar JSON se necessário
    if (expectedSchema) {
      const jsonValidation = this.validateJsonSchema(response.content, expectedSchema);
      if (!jsonValidation.valid) {
        issues.push({
          type: 'json',
          severity: 'high',
          description: `JSON inválido: ${jsonValidation.errors.join(', ')}`,
          suggestion: 'Regenerar resposta com schema correto'
        });
        recommendations.push('Retry com provedor alternativo ou ajuste de parâmetros');
      }
    }

    // Verificar timeout
    if (response.metrics.latency > 30000) {
      issues.push({
        type: 'timeout',
        severity: 'medium',
        description: `Resposta muito lenta: ${response.metrics.latency}ms`,
        suggestion: 'Considerar provedor mais rápido para próximas requisições'
      });
      recommendations.push('Ajustar pesos de roteamento para priorizar velocidade');
    }

    // Verificar custo
    if (response.metrics.cost > 0.1) {
      issues.push({
        type: 'content',
        severity: 'low',
        description: `Custo alto: $${response.metrics.cost.toFixed(4)}`,
        suggestion: 'Considerar provedor mais econômico para tarefas similares'
      });
      recommendations.push('Ajustar orçamento ou seleção de provedor');
    }

    // Verificar qualidade da resposta
    const qualityIssues = this.validateResponseQuality(response.content);
    if (qualityIssues.length > 0) {
      issues.push({
        type: 'content',
        severity: 'medium',
        description: `Problemas de qualidade: ${qualityIssues.join(', ')}`,
        suggestion: 'Revisar prompt ou considerar provedor alternativo'
      });
      recommendations.push('Ajustar parâmetros de geração ou seleção de modelo');
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      recommendations
    };
  }

  private detectPII(text: string): string[] {
    const detected: string[] = [];
    
    for (const pattern of this.piiPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        detected.push(...matches);
      }
    }
    
    return detected;
  }

  private detectSensitiveTopics(text: string): string[] {
    const detected: string[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const topic of this.sensitiveTopics) {
      if (normalizedText.includes(topic.toLowerCase())) {
        detected.push(topic);
      }
    }
    
    return detected;
  }

  private checkLGPDCompliance(text: string, context?: Record<string, any>): string[] {
    const issues: string[] = [];
    
    // Verificar se há dados de menores
    if (context?.userType === 'student' && this.containsMinorData(text)) {
      issues.push('Dados de menor de idade detectados');
    }
    
    // Verificar se há dados sensíveis
    if (this.containsSensitiveData(text)) {
      issues.push('Dados sensíveis detectados');
    }
    
    return issues;
  }

  private containsMinorData(text: string): boolean {
    const minorKeywords = ['menor', 'criança', 'adolescente', 'estudante', 'aluno'];
    return minorKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private containsSensitiveData(text: string): boolean {
    const sensitiveKeywords = ['saúde', 'religião', 'política', 'racial', 'genético'];
    return sensitiveKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private validateJsonSchema(content: string, schemaName: string): { valid: boolean; errors: string[] } {
    const schema = this.jsonSchemaValidators.get(schemaName);
    if (!schema) {
      return { valid: true, errors: [] }; // Sem schema definido, assume válido
    }

    try {
      const parsed = JSON.parse(content);
      const errors = this.validateObject(parsed, schema);
      return { valid: errors.length === 0, errors };
    } catch (error) {
      return { valid: false, errors: ['JSON inválido'] };
    }
  }

  private validateObject(obj: any, schema: any, path: string = ''): string[] {
    const errors: string[] = [];

    if (schema.type === 'object') {
      if (typeof obj !== 'object' || obj === null) {
        errors.push(`${path}: deve ser um objeto`);
        return errors;
      }

      // Verificar propriedades obrigatórias
      if (schema.required) {
        for (const prop of schema.required) {
          if (!(prop in obj)) {
            errors.push(`${path}.${prop}: propriedade obrigatória`);
          }
        }
      }

      // Verificar propriedades
      if (schema.properties) {
        for (const [prop, propSchema] of Object.entries(schema.properties)) {
          if (prop in obj) {
            const propErrors = this.validateObject(obj[prop], propSchema, `${path}.${prop}`);
            errors.push(...propErrors);
          }
        }
      }
    } else if (schema.type === 'array') {
      if (!Array.isArray(obj)) {
        errors.push(`${path}: deve ser um array`);
        return errors;
      }

      if (schema.minItems && obj.length < schema.minItems) {
        errors.push(`${path}: deve ter pelo menos ${schema.minItems} itens`);
      }

      if (schema.maxItems && obj.length > schema.maxItems) {
        errors.push(`${path}: deve ter no máximo ${schema.maxItems} itens`);
      }

      if (schema.items) {
        obj.forEach((item, index) => {
          const itemErrors = this.validateObject(item, schema.items, `${path}[${index}]`);
          errors.push(...itemErrors);
        });
      }
    } else if (schema.type === 'string') {
      if (typeof obj !== 'string') {
        errors.push(`${path}: deve ser uma string`);
        return errors;
      }

      if (schema.minLength && obj.length < schema.minLength) {
        errors.push(`${path}: deve ter pelo menos ${schema.minLength} caracteres`);
      }

      if (schema.enum && !schema.enum.includes(obj)) {
        errors.push(`${path}: deve ser um dos valores: ${schema.enum.join(', ')}`);
      }
    }

    return errors;
  }

  private validateResponseQuality(content: string): string[] {
    const issues: string[] = [];

    // Verificar se a resposta não está vazia
    if (!content || content.trim().length === 0) {
      issues.push('Resposta vazia');
    }

    // Verificar se não contém apenas placeholders
    if (content.includes('[PLACEHOLDER]') || content.includes('[TODO]')) {
      issues.push('Contém placeholders não resolvidos');
    }

    // Verificar se não contém erros óbvios
    if (content.includes('ERROR:') || content.includes('FALHA:')) {
      issues.push('Contém mensagens de erro');
    }

    // Verificar se tem tamanho mínimo razoável
    if (content.length < 10) {
      issues.push('Resposta muito curta');
    }

    return issues;
  }

  // Método para sanitizar texto removendo PII
  sanitizeText(text: string): string {
    let sanitized = text;

    // Substituir CPF
    sanitized = sanitized.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]');
    
    // Substituir CNPJ
    sanitized = sanitized.replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ]');
    
    // Substituir email
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Substituir telefone
    sanitized = sanitized.replace(/\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, '[TELEFONE]');

    return sanitized;
  }

  // Método para verificar se provedor é adequado para dados sensíveis
  isProviderSuitableForSensitiveData(providerId: string, dataType: 'minor' | 'sensitive' | 'general'): boolean {
    // Esta seria uma implementação mais sofisticada em produção
    // Por enquanto, considera Grok 4 Fast (padrão) e OpenAI como seguros
    return providerId === 'xai-grok-4-fast' || providerId === 'openai-gpt-4o-mini';
  }
}

// Instância singleton
export const safetyLayer = new SafetyLayer();
