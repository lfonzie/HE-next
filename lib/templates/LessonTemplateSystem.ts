/**
 * Reusable Lesson Template System
 * Provides consistent content creation with customizable templates
 */

export interface TemplateSection {
  id: string;
  type: 'content' | 'quiz' | 'interactive' | 'assessment' | 'video' | 'image' | 'discussion';
  title: string;
  description: string;
  required: boolean;
  order: number;
  config: TemplateSectionConfig;
  validation?: TemplateValidation;
}

export interface TemplateSectionConfig {
  // Content specific
  duration?: number; // in minutes
  slides?: number;
  contentType?: 'text' | 'multimedia' | 'interactive';
  
  // Quiz specific
  questions?: number;
  timeLimit?: number; // in minutes
  questionTypes?: ('multiple-choice' | 'open-ended' | 'true-false' | 'matching')[];
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // Interactive specific
  activityType?: 'drawing' | 'simulation' | 'game' | 'collaboration';
  tools?: string[];
  
  // Assessment specific
  rubric?: any;
  grading?: 'automatic' | 'manual' | 'peer';
  
  // Media specific
  mediaType?: 'image' | 'video' | 'audio' | 'animation';
  maxSize?: number; // in MB
  formats?: string[];
  
  // Discussion specific
  moderation?: boolean;
  anonymity?: boolean;
  maxParticipants?: number;
}

export interface TemplateValidation {
  minLength?: number;
  maxLength?: number;
  requiredFields?: string[];
  customRules?: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  condition?: (value: any) => boolean;
}

export interface TemplateMetadata {
  version: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  targetAudience: string[];
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  structure: TemplateSection[];
  metadata: TemplateMetadata;
  variables?: TemplateVariable[];
  conditions?: TemplateCondition[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue: any;
  description: string;
  required: boolean;
  validation?: TemplateValidation;
}

export interface TemplateCondition {
  id: string;
  condition: string;
  action: 'show' | 'hide' | 'require' | 'optional';
  target: string; // section id
}

export class TemplateBuilder {
  private template: Partial<LessonTemplate> = {};

  constructor(name: string, description: string) {
    this.template.name = name;
    this.template.description = description;
    this.template.structure = [];
    this.template.metadata = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'System',
      tags: [],
      category: 'General',
      difficulty: 'intermediate',
      estimatedDuration: 0,
      targetAudience: [],
      learningObjectives: []
    };
    this.template.variables = [];
    this.template.conditions = [];
  }

  setName(name: string): TemplateBuilder {
    this.template.name = name;
    return this;
  }

  setDescription(description: string): TemplateBuilder {
    this.template.description = description;
    return this;
  }

  setCategory(category: string): TemplateBuilder {
    if (this.template.metadata) {
      this.template.metadata.category = category;
    }
    return this;
  }

  setDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): TemplateBuilder {
    if (this.template.metadata) {
      this.template.metadata.difficulty = difficulty;
    }
    return this;
  }

  setTargetAudience(audience: string[]): TemplateBuilder {
    if (this.template.metadata) {
      this.template.metadata.targetAudience = audience;
    }
    return this;
  }

  addLearningObjective(objective: string): TemplateBuilder {
    if (this.template.metadata) {
      this.template.metadata.learningObjectives.push(objective);
    }
    return this;
  }

  addTag(tag: string): TemplateBuilder {
    if (this.template.metadata) {
      this.template.metadata.tags.push(tag);
    }
    return this;
  }

  addSection(section: TemplateSection): TemplateBuilder {
    if (!this.template.structure) {
      this.template.structure = [];
    }
    this.template.structure.push(section);
    this.updateEstimatedDuration(section);
    return this;
  }

  addVariable(variable: TemplateVariable): TemplateBuilder {
    if (!this.template.variables) {
      this.template.variables = [];
    }
    this.template.variables.push(variable);
    return this;
  }

  addCondition(condition: TemplateCondition): TemplateBuilder {
    if (!this.template.conditions) {
      this.template.conditions = [];
    }
    this.template.conditions.push(condition);
    return this;
  }

  private updateEstimatedDuration(section: TemplateSection): void {
    if (this.template.metadata && section.config.duration) {
      this.template.metadata.estimatedDuration += section.config.duration;
    }
  }

  build(): LessonTemplate {
    if (!this.template.structure) {
      throw new Error('Template must have at least one section');
    }

    // Sort sections by order
    this.template.structure.sort((a, b) => a.order - b.order);

    // Update metadata
    if (this.template.metadata) {
      this.template.metadata.updatedAt = new Date().toISOString();
    }

    return {
      id: this.generateId(),
      name: this.template.name || 'Untitled Template',
      description: this.template.description || '',
      structure: this.template.structure,
      metadata: this.template.metadata!,
      variables: this.template.variables || [],
      conditions: this.template.conditions || []
    };
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Predefined template sections
export const TemplateSections = {
  introduction: (): TemplateSection => ({
    id: 'introduction',
    type: 'content',
    title: 'Introduction',
    description: 'Welcome and learning objectives',
    required: true,
    order: 1,
    config: {
      duration: 5,
      slides: 2,
      contentType: 'text'
    }
  }),

  content: (title: string, duration: number = 10): TemplateSection => ({
    id: `content_${title.toLowerCase().replace(/\s+/g, '_')}`,
    type: 'content',
    title,
    description: `Main content section: ${title}`,
    required: true,
    order: 2,
    config: {
      duration,
      slides: Math.ceil(duration / 5),
      contentType: 'multimedia'
    }
  }),

  quiz: (questions: number = 5, timeLimit: number = 10): TemplateSection => ({
    id: 'quiz',
    type: 'quiz',
    title: 'Knowledge Check',
    description: 'Quiz to assess understanding',
    required: true,
    order: 3,
    config: {
      questions,
      timeLimit,
      questionTypes: ['multiple-choice', 'true-false'],
      difficulty: 'medium'
    }
  }),

  interactive: (activityType: 'drawing' | 'simulation' | 'game' | 'collaboration'): TemplateSection => ({
    id: `interactive_${activityType}`,
    type: 'interactive',
    title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Activity`,
    description: `Interactive ${activityType} exercise`,
    required: false,
    order: 4,
    config: {
      activityType,
      tools: activityType === 'drawing' ? ['canvas', 'colors', 'shapes'] : []
    }
  }),

  assessment: (): TemplateSection => ({
    id: 'assessment',
    type: 'assessment',
    title: 'Final Assessment',
    description: 'Comprehensive evaluation',
    required: true,
    order: 5,
    config: {
      grading: 'automatic',
      duration: 15
    }
  }),

  conclusion: (): TemplateSection => ({
    id: 'conclusion',
    type: 'content',
    title: 'Conclusion',
    description: 'Summary and next steps',
    required: true,
    order: 6,
    config: {
      duration: 3,
      slides: 1,
      contentType: 'text'
    }
  })
};

// Predefined templates
export const PredefinedTemplates = {
  science: (): LessonTemplate => {
    return new TemplateBuilder('Science Lesson Template', 'Standard template for science lessons')
      .setCategory('Science')
      .setDifficulty('intermediate')
      .setTargetAudience(['middle-school', 'high-school'])
      .addLearningObjective('Understand scientific concepts')
      .addLearningObjective('Apply scientific methods')
      .addTag('science')
      .addTag('education')
      .addSection(TemplateSections.introduction())
      .addSection(TemplateSections.content('Scientific Concepts', 15))
      .addSection(TemplateSections.interactive('simulation'))
      .addSection(TemplateSections.quiz(8, 12))
      .addSection(TemplateSections.content('Applications', 10))
      .addSection(TemplateSections.assessment())
      .addSection(TemplateSections.conclusion())
      .build();
  },

  mathematics: (): LessonTemplate => {
    return new TemplateBuilder('Mathematics Lesson Template', 'Comprehensive math lesson structure')
      .setCategory('Mathematics')
      .setDifficulty('intermediate')
      .setTargetAudience(['middle-school', 'high-school'])
      .addLearningObjective('Solve mathematical problems')
      .addLearningObjective('Understand mathematical concepts')
      .addTag('mathematics')
      .addTag('problem-solving')
      .addSection(TemplateSections.introduction())
      .addSection(TemplateSections.content('Mathematical Concepts', 20))
      .addSection(TemplateSections.interactive('simulation'))
      .addSection(TemplateSections.quiz(10, 15))
      .addSection(TemplateSections.content('Problem Solving', 15))
      .addSection(TemplateSections.interactive('drawing'))
      .addSection(TemplateSections.assessment())
      .addSection(TemplateSections.conclusion())
      .build();
  },

  language: (): LessonTemplate => {
    return new TemplateBuilder('Language Arts Template', 'Template for language and literature lessons')
      .setCategory('Language Arts')
      .setDifficulty('intermediate')
      .setTargetAudience(['elementary', 'middle-school'])
      .addLearningObjective('Improve reading comprehension')
      .addLearningObjective('Develop writing skills')
      .addTag('language')
      .addTag('literature')
      .addSection(TemplateSections.introduction())
      .addSection(TemplateSections.content('Reading Material', 12))
      .addSection(TemplateSections.content('Vocabulary', 8))
      .addSection(TemplateSections.quiz(6, 10))
      .addSection(TemplateSections.interactive('collaboration'))
      .addSection(TemplateSections.content('Writing Exercise', 15))
      .addSection(TemplateSections.assessment())
      .addSection(TemplateSections.conclusion())
      .build();
  },

  history: (): LessonTemplate => {
    return new TemplateBuilder('History Lesson Template', 'Template for historical content and analysis')
      .setCategory('History')
      .setDifficulty('intermediate')
      .setTargetAudience(['middle-school', 'high-school'])
      .addLearningObjective('Understand historical events')
      .addLearningObjective('Analyze historical sources')
      .addTag('history')
      .addTag('analysis')
      .addSection(TemplateSections.introduction())
      .addSection(TemplateSections.content('Historical Context', 15))
      .addSection(TemplateSections.content('Key Events', 12))
      .addSection(TemplateSections.quiz(7, 12))
      .addSection(TemplateSections.content('Historical Analysis', 10))
      .addSection(TemplateSections.interactive('collaboration'))
      .addSection(TemplateSections.assessment())
      .addSection(TemplateSections.conclusion())
      .build();
  }
};

// Template manager for CRUD operations
export class TemplateManager {
  private templates: Map<string, LessonTemplate> = new Map();

  constructor() {
    this.loadPredefinedTemplates();
  }

  private loadPredefinedTemplates(): void {
    Object.values(PredefinedTemplates).forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  createTemplate(template: LessonTemplate): string {
    this.templates.set(template.id, template);
    return template.id;
  }

  getTemplate(id: string): LessonTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): LessonTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): LessonTemplate[] {
    return this.getAllTemplates().filter(t => t.metadata.category === category);
  }

  getTemplatesByDifficulty(difficulty: string): LessonTemplate[] {
    return this.getAllTemplates().filter(t => t.metadata.difficulty === difficulty);
  }

  updateTemplate(id: string, updates: Partial<LessonTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    this.templates.set(id, updatedTemplate);
    return true;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  searchTemplates(query: string): LessonTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      template.metadata.learningObjectives.some(obj => obj.toLowerCase().includes(lowercaseQuery))
    );
  }

  validateTemplate(template: LessonTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!template.name) errors.push('Template name is required');
    if (!template.description) errors.push('Template description is required');
    if (!template.structure || template.structure.length === 0) {
      errors.push('Template must have at least one section');
    }

    // Check metadata
    if (!template.metadata.category) errors.push('Category is required');
    if (!template.metadata.targetAudience || template.metadata.targetAudience.length === 0) {
      errors.push('Target audience is required');
    }
    if (!template.metadata.learningObjectives || template.metadata.learningObjectives.length === 0) {
      errors.push('At least one learning objective is required');
    }

    // Check sections
    template.structure.forEach((section, index) => {
      if (!section.title) errors.push(`Section ${index + 1}: Title is required`);
      if (!section.type) errors.push(`Section ${index + 1}: Type is required`);
      if (section.order < 1) errors.push(`Section ${index + 1}: Order must be positive`);
    });

    // Check for duplicate section orders
    const orders = template.structure.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push('Section orders must be unique');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  exportTemplate(id: string): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    return JSON.stringify(template, null, 2);
  }

  importTemplate(jsonString: string): { success: boolean; id?: string; error?: string } {
    try {
      const template = JSON.parse(jsonString) as LessonTemplate;
      const validation = this.validateTemplate(template);
      
      if (!validation.valid) {
        return {
          success: false,
          error: `Template validation failed: ${validation.errors.join(', ')}`
        };
      }

      const id = this.createTemplate(template);
      return { success: true, id };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse template: ${error}`
      };
    }
  }
}

// Singleton instance
export const templateManager = new TemplateManager();

// Utility functions
export function generateLessonFromTemplate(
  template: LessonTemplate,
  variables: Record<string, any> = {}
): any {
  const lesson = {
    id: `lesson_${Date.now()}`,
    templateId: template.id,
    title: template.name,
    description: template.description,
    sections: template.structure.map(section => ({
      ...section,
      content: generateSectionContent(section, variables)
    })),
    metadata: {
      ...template.metadata,
      createdAt: new Date().toISOString(),
      variables
    }
  };

  return lesson;
}

function generateSectionContent(section: TemplateSection, variables: Record<string, any>): any {
  // This would integrate with the AI generation system
  return {
    placeholder: `Content for ${section.title}`,
    variables: variables,
    generated: false
  };
}

export function estimateTemplateDuration(template: LessonTemplate): number {
  return template.structure.reduce((total, section) => {
    return total + (section.config.duration || 0);
  }, 0);
}

export function getTemplateComplexity(template: LessonTemplate): 'simple' | 'moderate' | 'complex' {
  const sectionCount = template.structure.length;
  const interactiveSections = template.structure.filter(s => s.type === 'interactive').length;
  const quizSections = template.structure.filter(s => s.type === 'quiz').length;

  if (sectionCount <= 3 && interactiveSections === 0) return 'simple';
  if (sectionCount <= 6 && interactiveSections <= 2) return 'moderate';
  return 'complex';
}

