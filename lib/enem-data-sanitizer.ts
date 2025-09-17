/**
 * Data sanitization utilities for ENEM simulator
 * Handles duplicate labels, data validation, and content cleaning
 */

export interface SanitizedQuestion {
  id: string
  stem: string
  alternatives: AlternativeOption[]
  correct: string
  rationale: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  image_url?: string
  image_alt?: string
  area: string
  disciplina: string
  skill_tag: string[]
  year: number
  source: 'DATABASE' | 'AI' | 'FALLBACK'
}

export interface AlternativeOption {
  label: string // A, B, C, D, E
  text: string  // Clean text without label prefix
  originalText: string // Original text for reference
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedData?: SanitizedQuestion
}

/**
 * Sanitizes a question object to ensure consistent data structure
 */
export function sanitizeQuestion(question: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Validate required fields
    if (!question.id) errors.push('Question ID is required')
    if (!question.stem) errors.push('Question stem is required')
    if (!question.correct) errors.push('Correct answer is required')
    if (!question.rationale) warnings.push('Question lacks explanation')
    
    // Extract and clean alternatives
    const alternatives = extractAlternatives(question)
    if (alternatives.length === 0) {
      errors.push('No valid alternatives found')
    } else if (alternatives.length < 4) {
      warnings.push(`Only ${alternatives.length} alternatives found (expected 5)`)
    }

    // Validate correct answer
    const validLabels = ['A', 'B', 'C', 'D', 'E']
    if (!validLabels.includes(question.correct?.toUpperCase())) {
      errors.push(`Invalid correct answer: ${question.correct}`)
    }

    // Check if correct answer exists in alternatives
    const correctIndex = validLabels.indexOf(question.correct?.toUpperCase())
    if (correctIndex >= 0 && !alternatives[correctIndex]) {
      errors.push(`Correct answer ${question.correct} not found in alternatives`)
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings }
    }

    // Create sanitized question
    const sanitized: SanitizedQuestion = {
      id: question.id,
      stem: cleanText(question.stem),
      alternatives,
      correct: question.correct.toUpperCase(),
      rationale: cleanText(question.rationale || 'Explicação não disponível'),
      difficulty: validateDifficulty(question.difficulty),
      image_url: question.image_url || undefined,
      image_alt: question.image_alt || undefined,
      area: question.area || 'Indefinida',
      disciplina: question.disciplina || 'Indefinida',
      skill_tag: Array.isArray(question.skill_tag) ? question.skill_tag : [],
      year: question.year || new Date().getFullYear(),
      source: question.source || 'DATABASE'
    }

    return { isValid: true, errors, warnings, sanitizedData: sanitized }
  } catch (error) {
    return { 
      isValid: false, 
      errors: [`Failed to sanitize question: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings 
    }
  }
}

/**
 * Extracts and cleans alternatives from various question formats
 */
function extractAlternatives(question: any): AlternativeOption[] {
  const alternatives: AlternativeOption[] = []
  
  // Handle new format with alternatives array
  if (question.alternatives && Array.isArray(question.alternatives)) {
    question.alternatives.forEach((text: string, index: number) => {
      const label = String.fromCharCode(65 + index) // A, B, C, D, E
      alternatives.push({
        label,
        text: cleanAlternativeText(text),
        originalText: text
      })
    })
  } else {
    // Handle old format with individual fields (a, b, c, d, e)
    const fields = ['a', 'b', 'c', 'd', 'e']
    fields.forEach((field, index) => {
      if (question[field]) {
        const label = String.fromCharCode(65 + index) // A, B, C, D, E
        alternatives.push({
          label,
          text: cleanAlternativeText(question[field]),
          originalText: question[field]
        })
      }
    })
  }
  
  return alternatives
}

/**
 * Cleans alternative text by removing duplicate labels
 */
function cleanAlternativeText(text: string): string {
  if (!text) return ''
  
  // Remove common label patterns
  return text
    .replace(/^[A-E]\)\s*/, '') // Remove "A) " prefix
    .replace(/^[A-E]\.\s*/, '')  // Remove "A. " prefix
    .replace(/^[A-E]\s*/, '')   // Remove "A " prefix
    .trim()
}

/**
 * Cleans general text content
 */
function cleanText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Validates and normalizes difficulty level
 */
function validateDifficulty(difficulty: any): 'EASY' | 'MEDIUM' | 'HARD' {
  if (!difficulty) return 'MEDIUM'
  
  const normalized = difficulty.toString().toUpperCase()
  
  switch (normalized) {
    case 'EASY':
    case 'FÁCIL':
    case 'FACIL':
    case '1':
      return 'EASY'
    case 'HARD':
    case 'DIFÍCIL':
    case 'DIFICIL':
    case '3':
      return 'HARD'
    case 'MEDIUM':
    case 'MÉDIO':
    case 'MEDIO':
    case '2':
    default:
      return 'MEDIUM'
  }
}

/**
 * Validates image URL accessibility
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false
  
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && (response.headers.get('content-type')?.startsWith('image/') || false)
  } catch {
    return false
  }
}

/**
 * Batch sanitizes multiple questions
 */
export function sanitizeQuestions(questions: any[]): {
  valid: SanitizedQuestion[]
  invalid: { question: any; result: ValidationResult }[]
  summary: {
    total: number
    valid: number
    invalid: number
    warnings: number
  }
} {
  const valid: SanitizedQuestion[] = []
  const invalid: { question: any; result: ValidationResult }[] = []
  let warningCount = 0
  
  questions.forEach(question => {
    const result = sanitizeQuestion(question)
    
    if (result.isValid && result.sanitizedData) {
      valid.push(result.sanitizedData)
      warningCount += result.warnings.length
    } else {
      invalid.push({ question, result })
    }
  })
  
  return {
    valid,
    invalid,
    summary: {
      total: questions.length,
      valid: valid.length,
      invalid: invalid.length,
      warnings: warningCount
    }
  }
}

/**
 * Creates a fallback question when data is invalid
 */
export function createFallbackQuestion(originalQuestion: any): SanitizedQuestion {
  return {
    id: originalQuestion.id || `fallback-${Date.now()}`,
    stem: originalQuestion.stem || 'Questão não disponível',
    alternatives: [
      { label: 'A', text: 'Alternativa A', originalText: 'A' },
      { label: 'B', text: 'Alternativa B', originalText: 'B' },
      { label: 'C', text: 'Alternativa C', originalText: 'C' },
      { label: 'D', text: 'Alternativa D', originalText: 'D' },
      { label: 'E', text: 'Alternativa E', originalText: 'E' }
    ],
    correct: 'A',
    rationale: 'Esta questão apresenta problemas de formatação e foi substituída por uma versão de fallback.',
    difficulty: 'MEDIUM',
    area: originalQuestion.area || 'Indefinida',
    disciplina: originalQuestion.disciplina || 'Indefinida',
    skill_tag: [],
    year: originalQuestion.year || new Date().getFullYear(),
    source: 'FALLBACK'
  }
}
