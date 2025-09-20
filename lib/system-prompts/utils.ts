// lib/system-prompts/utils.ts
import { SystemPromptConfig, SystemPromptMessage } from '../../types/system-prompts';
import { UNIFIED_SYSTEM_PROMPTS } from './unified-config';
import { addUnicodeInstructions } from './common';

export interface PromptRequest {
  key: string;
  userMessage: string;
  context?: Record<string, any>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface PromptResponse {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  tokens?: number;
  timestamp?: string;
}

export class SystemPromptManager {
  private static instance: SystemPromptManager;
  private prompts: Map<string, SystemPromptConfig> = new Map();

  private constructor() {
    this.loadPrompts();
  }

  public static getInstance(): SystemPromptManager {
    if (!SystemPromptManager.instance) {
      SystemPromptManager.instance = new SystemPromptManager();
    }
    return SystemPromptManager.instance;
  }

  private loadPrompts(): void {
    Object.values(UNIFIED_SYSTEM_PROMPTS).forEach(prompt => {
      this.prompts.set(prompt.key, prompt);
    });
  }

  public getPrompt(key: string): SystemPromptConfig | null {
    return this.prompts.get(key) || null;
  }

  public getAllPrompts(): SystemPromptConfig[] {
    return Array.from(this.prompts.values());
  }

  public getActivePrompts(): SystemPromptConfig[] {
    return this.getAllPrompts().filter(prompt => prompt.status === 'active');
  }

  public getPromptsByType(type: string): SystemPromptConfig[] {
    return this.getAllPrompts().filter(prompt => prompt.json.type === type);
  }

  public getPromptsByModule(module: string): SystemPromptConfig[] {
    return this.getAllPrompts().filter(prompt => 
      prompt.key.includes(module.toLowerCase()) || 
      prompt.json.department === module.toUpperCase()
    );
  }

  public buildMessages(request: PromptRequest): SystemPromptMessage[] {
    const prompt = this.getPrompt(request.key);
    if (!prompt) {
      throw new Error(`Prompt not found: ${request.key}`);
    }

    // Adicionar instruções de Unicode ao prompt do sistema
    const systemContent = addUnicodeInstructions(prompt.json.content);

    const messages: SystemPromptMessage[] = [
      {
        role: 'system',
        content: systemContent
      }
    ];

    // Adicionar contexto se fornecido
    if (request.context) {
      const contextMessage = this.buildContextMessage(request.context);
      if (contextMessage) {
        messages.push(contextMessage);
      }
    }

    // Adicionar mensagem do usuário
    messages.push({
      role: 'user',
      content: request.userMessage
    });

    return messages;
  }

  private buildContextMessage(context: Record<string, any>): SystemPromptMessage | null {
    if (!context || Object.keys(context).length === 0) {
      return null;
    }

    const contextText = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return {
      role: 'system',
      content: `Contexto adicional:\n${contextText}`
    };
  }

  public getModelConfig(key: string): { model: string; temperature: number; maxTokens: number } {
    const prompt = this.getPrompt(key);
    if (!prompt) {
      return {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 4000
      };
    }

    return {
      model: prompt.model,
      temperature: 0.7,
      maxTokens: 4000
    };
  }

  public validatePrompt(key: string): { valid: boolean; errors: string[] } {
    const prompt = this.getPrompt(key);
    const errors: string[] = [];

    if (!prompt) {
      errors.push(`Prompt not found: ${key}`);
      return { valid: false, errors };
    }

    if (!prompt.json.content || prompt.json.content.trim().length === 0) {
      errors.push('Prompt content is empty');
    }

    if (!prompt.json.type) {
      errors.push('Prompt type is not defined');
    }

    if (!prompt.model) {
      errors.push('Model is not specified');
    }

    if (!prompt.description) {
      errors.push('Description is missing');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public getPromptStats(): {
    total: number;
    active: number;
    inactive: number;
    deprecated: number;
    byType: Record<string, number>;
    byModel: Record<string, number>;
  } {
    const prompts = this.getAllPrompts();
    const stats = {
      total: prompts.length,
      active: 0,
      inactive: 0,
      deprecated: 0,
      byType: {} as Record<string, number>,
      byModel: {} as Record<string, number>
    };

    prompts.forEach(prompt => {
      // Status counts
      switch (prompt.status) {
        case 'active':
          stats.active++;
          break;
        case 'inactive':
          stats.inactive++;
          break;
        case 'deprecated':
          stats.deprecated++;
          break;
      }

      // Type counts
      const type = prompt.json.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Model counts
      const model = prompt.model;
      stats.byModel[model] = (stats.byModel[model] || 0) + 1;
    });

    return stats;
  }
}

// Funções utilitárias estáticas
export function formatPromptContent(content: string, variables: Record<string, string>): string {
  let formattedContent = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    formattedContent = formattedContent.replace(new RegExp(placeholder, 'g'), value);
  });

  return formattedContent;
}

export function extractPromptVariables(content: string): string[] {
  const matches = content.match(/\{([^}]+)\}/g);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
}

export function sanitizePromptContent(content: string): string {
  // Remove caracteres potencialmente problemáticos
  return content
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function validatePromptContent(content: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (content.length > 10000) {
    warnings.push('Prompt content is very long (>10k chars)');
  }

  if (content.includes('{') && !content.includes('}')) {
    warnings.push('Unclosed variable placeholder detected');
  }

  if (content.includes('$') && content.includes('$')) {
    warnings.push('LaTeX syntax detected - ensure Unicode math symbols are used instead');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

// Exportar instância singleton
export const promptManager = SystemPromptManager.getInstance();
