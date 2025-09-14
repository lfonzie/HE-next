// lib/enem-api.ts
// Integração com a API pública enem.dev para questões reais do ENEM
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ENEM_API_BASE = 'https://api.enem.dev/v1';

export interface EnemExam {
  id: string
  year: number
  type: 'PPL' | 'REAPLICAÇÃO' | 'DIGITAL' | 'REGULAR'
  description: string
  questionsCount: number
}

export interface EnemQuestion {
  id: string
  examId: string
  year: number
  type: 'PPL' | 'REAPLICAÇÃO' | 'DIGITAL' | 'REGULAR'
  area: string
  subject: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  topics?: string[]
  competencies?: string[]
  difficulty?: 'Fácil' | 'Médio' | 'Difícil'
}

export interface EnemFilters {
  year?: number
  area?: string
  subject?: string
  type?: 'PPL' | 'REAPLICAÇÃO' | 'DIGITAL' | 'REGULAR'
  limit?: number
  offset?: number
}

class EnemApiClient {
  private rateLimitDelay = 1000 // 1 segundo entre requisições
  private lastRequestTime = 0
  private isApiAvailable = true
  private failureCount = 0
  private maxFailures = 3 // After 3 failures, mark as unavailable for longer
  private lastAvailabilityCheck = 0
  private availabilityCheckInterval = 300000 // 5 minutes between availability checks

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Rate limiting - 1 requisição por segundo
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

      const response = await fetch(`${ENEM_API_BASE}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HubEdu-Platform/1.0',
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Rate limit exceeded, marking API as unavailable')
          this.isApiAvailable = false
          throw new Error('Rate limit exceeded. Please wait before making another request.')
        }
        if (response.status === 404) {
          // Only log once per availability check interval to avoid spam
          if (this.isApiAvailable) {
            console.log('📵 ENEM API endpoint not found, falling back to AI generation (cached for 5 minutes)')
          }
          this.isApiAvailable = false
          this.lastAvailabilityCheck = Date.now()
          // Don't throw error for 404, just return empty array to allow fallback
          return [] as T
        }
        if (response.status >= 500) {
          console.log('Server error from ENEM API, marking as unavailable')
          this.isApiAvailable = false
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      this.isApiAvailable = true
      this.failureCount = 0 // Reset failure count on success
      const data = await response.json()
      return data
    } catch (error) {
      this.failureCount++
      
      // Only log detailed errors for the first few failures to avoid spam
      if (this.failureCount <= 2) {
        console.error('Enem API request failed:', error)
      }
      
      // Mark as unavailable after multiple failures
      if (this.failureCount >= this.maxFailures) {
        this.isApiAvailable = false
        this.lastAvailabilityCheck = Date.now()
        console.log(`ENEM API marked as unavailable after ${this.failureCount} failures (cached for 5 minutes)`)
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection.')
        }
        throw error
      }
      
      throw new Error('Unknown error occurred while making API request')
    }
  }

  /**
   * Reseta o status da API para tentar novamente
   */
  resetApiStatus(): void {
    this.isApiAvailable = true
    this.failureCount = 0
    this.lastAvailabilityCheck = 0 // Force immediate check on next call
    console.log('ENEM API status reset - will attempt to use external API again')
  }

  /**
   * Marca a API como indisponível por um período específico
   */
  markApiUnavailable(): void {
    this.isApiAvailable = false
    this.lastAvailabilityCheck = Date.now()
    console.log('ENEM API marked as unavailable (will retry in 5 minutes)')
  }

  /**
   * Verifica se a API está disponível com cache inteligente
   */
  async checkApiAvailability(): Promise<boolean> {
    const now = Date.now()
    
    // Se já sabemos que a API não está disponível e não passou tempo suficiente, retorna false
    if (!this.isApiAvailable && (now - this.lastAvailabilityCheck) < this.availabilityCheckInterval) {
      return false
    }
    
    // Se a API está disponível e não passou tempo suficiente, retorna true
    if (this.isApiAvailable && (now - this.lastAvailabilityCheck) < this.availabilityCheckInterval) {
      return true
    }
    
    // Atualiza timestamp da última verificação
    this.lastAvailabilityCheck = now
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos

      const response = await fetch(`${ENEM_API_BASE}/exams`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HubEdu-Platform/1.0',
        },
      })
      
      clearTimeout(timeoutId)
      this.isApiAvailable = response.ok
      
      if (this.isApiAvailable) {
        console.log('✅ ENEM API is available')
      } else {
        console.log('📵 ENEM API is currently unavailable (cached for 5 minutes)')
      }
      
      return this.isApiAvailable
    } catch (error) {
      console.log('ENEM API availability check failed:', error instanceof Error ? error.message : 'Unknown error')
      this.isApiAvailable = false
      return false
    }
  }

  /**
   * Lista todas as provas disponíveis
   */
  async getExams(): Promise<EnemExam[]> {
    if (!this.isApiAvailable) {
      console.log('API not available, returning mock data')
      return this.getMockExams()
    }

    try {
      const response = await this.makeRequest<any>('/exams')
      console.log("DEBUG examsData from enem.dev:", JSON.stringify(response).slice(0, 300)); // Debug log

      // Normalizar: A API retorna array ou { data: [...] } ou { exams: [...] }
      const examsList = Array.isArray(response) ? response : response.data || response.exams || []

      if (examsList.length === 0) {
        console.log("No exams found in enem.dev API")
        return this.getMockExams()
      }

      console.log(`✅ Loaded ${examsList.length} exams from enem.dev API`)
      
      // Converter formato da API para formato esperado
      return examsList.map((exam: any) => ({
        id: exam.id || `exam-${exam.year}`,
        year: exam.year,
        type: exam.type || 'REGULAR',
        description: exam.description || `ENEM ${exam.year} - Prova Regular`,
        questionsCount: exam.questionsCount || exam.questions?.length || 0
      }))
    } catch (error) {
      console.error('Failed to fetch exams:', error)
      return this.getMockExams()
    }
  }

  /**
   * Busca questões com filtros opcionais
   */
  async getQuestions(filters: EnemFilters = {}): Promise<EnemQuestion[]> {
    if (!this.isApiAvailable) {
      console.log('API not available, returning empty array')
      return []
    }

    try {
      const params = new URLSearchParams()
      
      if (filters.year) params.append('year', filters.year.toString())
      if (filters.area) params.append('discipline', filters.area) // Ajuste o parâmetro conforme docs
      if (filters.subject) params.append('subject', filters.subject)
      if (filters.type) params.append('type', filters.type)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const endpoint = filters.year 
        ? `/exams/${filters.year}/questions${params.toString() ? `?${params.toString()}` : ''}`
        : `/questions${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await this.makeRequest<any>(endpoint)
      console.log("DEBUG questionsData from enem.dev:", JSON.stringify(response).slice(0, 300)); // Debug log

      // Normalizar: A API retorna { metadata: {...}, questions: [...] }
      const questionsList = Array.isArray(response) 
        ? response 
        : response.questions || response.data || []

      if (questionsList.length === 0) {
        console.log("No questions found in enem.dev API, falling back to AI")
        return await generateFallbackQuestions(filters.area || 'geral', filters.limit || 10)
      }

      // Filtrar questões por área se especificado (a API pode retornar questões de outras áreas)
      let filteredQuestions = questionsList
      if (filters.area && filters.area !== 'geral') {
        filteredQuestions = questionsList.filter((q: any) => {
          const questionArea = q.discipline || q.area || ''
          const targetArea = filters.area!.toLowerCase()
          
          // Mapear áreas para corresponder com a API
          const areaMapping: { [key: string]: string[] } = {
            'matematica': ['matematica', 'matemática'],
            'linguagens': ['linguagens', 'linguagens-codigos'],
            'natureza': ['ciencias-natureza', 'natureza'],
            'humanas': ['ciencias-humanas', 'humanas']
          }
          
          const mappedAreas = areaMapping[targetArea] || [targetArea]
          return mappedAreas.some(area => questionArea.toLowerCase().includes(area))
        })
        
        console.log(`Filtered ${filteredQuestions.length} questions for area: ${filters.area}`)
      }

      // Se não encontrou questões da área específica, usar fallback IA
      if (filteredQuestions.length === 0 && filters.area && filters.area !== 'geral') {
        console.log(`No questions found for area ${filters.area} in enem.dev API, falling back to AI`)
        return await generateFallbackQuestions(filters.area, filters.limit || 10)
      }

      console.log(`✅ Loaded ${filteredQuestions.length} questions from enem.dev API`)
      
      // Converter formato da API para formato esperado
      return filteredQuestions.map((question: any) => ({
        id: question.id || `q-${Date.now()}-${Math.random()}`,
        examId: question.examId || `exam-${question.year || 2023}`,
        year: question.year || filters.year || 2023,
        type: question.type || 'REGULAR',
        area: question.discipline || question.area || filters.area || 'geral',
        subject: question.subject || question.discipline || question.area || filters.area || 'geral',
        question: question.context || question.question || question.text || question.enunciado || '',
        options: question.alternatives || question.options || [],
        correctAnswer: question.correctAlternative || question.correctAnswer || question.resposta || 0,
        explanation: question.explanation || question.gabarito,
        topics: question.topics || question.temas || [],
        competencies: question.competencies || question.competencias || [],
        difficulty: question.difficulty || 'Médio'
      }))
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      return await generateFallbackQuestions(filters.area || 'geral', filters.limit || 10)
    }
  }

  /**
   * Retorna dados mock quando a API não está disponível
   */
  private getMockExams(): EnemExam[] {
    return [
      {
        id: 'mock-2023',
        year: 2023,
        type: 'REGULAR',
        description: 'ENEM 2023 - Prova Regular',
        questionsCount: 180
      },
      {
        id: 'mock-2022',
        year: 2022,
        type: 'REGULAR',
        description: 'ENEM 2022 - Prova Regular',
        questionsCount: 180
      }
    ]
  }

  /**
   * Busca uma questão específica por ID
   */
  async getQuestionById(id: string): Promise<EnemQuestion | null> {
    try {
      const response = await this.makeRequest<any>(`/questions/${id}`)
      const question = Array.isArray(response) ? response[0] : response
      
      if (!question) return null
      
      return {
        id: question.id || id,
        examId: question.examId || `exam-${question.year || 2023}`,
        year: question.year || 2023,
        type: question.type || 'REGULAR',
        area: question.area || question.discipline || 'geral',
        subject: question.subject || question.area || 'geral',
        question: question.question || question.text || question.enunciado || '',
        options: question.options || question.alternatives || [],
        correctAnswer: question.correctAnswer || question.resposta || 0,
        explanation: question.explanation || question.gabarito,
        topics: question.topics || question.temas || [],
        competencies: question.competencies || question.competencias || [],
        difficulty: question.difficulty || 'Médio'
      }
    } catch (error) {
      console.error('Failed to fetch question:', error)
      return null
    }
  }

  /**
   * Busca questões por área específica
   */
  async getQuestionsByArea(area: string, limit = 20): Promise<EnemQuestion[]> {
    return this.getQuestions({ area, limit })
  }

  /**
   * Busca questões por ano específico
   */
  async getQuestionsByYear(year: number, limit = 20): Promise<EnemQuestion[]> {
    return this.getQuestions({ year, limit })
  }

  /**
   * Busca questões aleatórias para simulado
   */
  async getRandomQuestions(area: string, count: number): Promise<EnemQuestion[]> {
    try {
      console.log(`🔍 Searching for ${count} random questions in area: ${area}`)
      
      // Tratar área "geral" como todas as áreas
      if (area.toLowerCase() === 'geral') {
        console.log('🎯 Area "geral" detected, searching across all ENEM areas')
        const allAreas = ['linguagens', 'matematica', 'natureza', 'humanas']
        const questionsPerArea = Math.ceil(count / allAreas.length)
        
        let allQuestions: EnemQuestion[] = []
        for (const specificArea of allAreas) {
          try {
            const areaQuestions = await this.getQuestions({ area: specificArea, limit: questionsPerArea })
            allQuestions.push(...areaQuestions)
          } catch (error) {
            console.log(`⚠️ Failed to get questions for area ${specificArea}:`, error instanceof Error ? error.message : 'Unknown error')
          }
        }
        
        if (allQuestions.length === 0) {
          console.log('📵 No questions found for any area in "geral"')
          return []
        }
        
        // Embaralha e pega apenas a quantidade necessária
        const shuffled = allQuestions.sort(() => Math.random() - 0.5)
        const selectedQuestions = shuffled.slice(0, count)
        
        console.log(`✅ Found ${selectedQuestions.length} questions for area "geral"`)
        return selectedQuestions
      }
      
      // Busca questões usando o método getQuestions com filtro de área
      const allQuestions = await this.getQuestions({ area, limit: count * 3 })
      
      if (allQuestions.length === 0) {
        console.log(`📵 No questions found for area: ${area}`)
        return []
      }
      
      // Embaralha e pega apenas a quantidade necessária
      const shuffled = allQuestions.sort(() => Math.random() - 0.5)
      const selectedQuestions = shuffled.slice(0, count)
      
      console.log(`✅ Found ${selectedQuestions.length} questions for area: ${area}`)
      return selectedQuestions
    } catch (error) {
      console.error('Failed to get random questions:', error)
      return []
    }
  }

  /**
   * Converte questão da API para formato interno
   */
  convertToInternalFormat(apiQuestion: EnemQuestion): any {
    return {
      id: apiQuestion.id,
      subject: apiQuestion.subject,
      area: apiQuestion.area,
      difficulty: apiQuestion.difficulty || 'Médio',
      year: apiQuestion.year,
      question: apiQuestion.question,
      options: apiQuestion.options,
      correctAnswer: apiQuestion.correctAnswer,
      explanation: apiQuestion.explanation,
      topics: apiQuestion.topics || [],
      competencies: apiQuestion.competencies || []
    }
  }
}

// Instância singleton
export const enemApi = new EnemApiClient()

// Funções utilitárias
export const ENEM_AREAS = {
  'Linguagens, Códigos e suas Tecnologias': 'linguagens',
  'Matemática e suas Tecnologias': 'matematica',
  'Ciências da Natureza e suas Tecnologias': 'natureza',
  'Ciências Humanas e suas Tecnologias': 'humanas'
} as const

export const ENEM_SUBJECTS = {
  'linguagens': ['Português', 'Literatura', 'Inglês', 'Espanhol', 'Artes', 'Educação Física'],
  'matematica': ['Matemática'],
  'natureza': ['Física', 'Química', 'Biologia'],
  'humanas': ['História', 'Geografia', 'Filosofia', 'Sociologia']
} as const

export const ENEM_YEARS = Array.from({ length: 15 }, (_, i) => 2023 - i) // 2009-2023

/**
 * Generates fallback questions using AI when ENEM API is unavailable
 */
async function generateFallbackQuestions(area: string, limit: number): Promise<EnemQuestion[]> {
  const model = process.env.ENEM_FALLBACK_MODEL || "gpt-4o-mini";
  console.log(`Generating ${limit} fallback questions for ${area} using model: ${model}`);

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `Você é um gerador de questões do ENEM para a área "${area}". Gere ${limit} questões realistas, com alternativas A/B/C/D/E, incluindo a correta. Formato JSON: [{ id: "fallback_${area}_1", examId: "fallback_2023", year: 2023, type: "REGULAR", area: "${area}", subject: "${area}", question: "...", options: ["A", "B", "C", "D", "E"], correctAnswer: 0 }]`
        }
      ],
      max_tokens: 2000, // Ajuste para evitar timeouts
    });

    const response = completion.choices[0]?.message?.content
    if (!response) return []

    // Clean the response to extract JSON from markdown if present
    let cleanResponse = response.trim()
    
    // Remove markdown code blocks if present
    if (cleanResponse.includes('```json')) {
      cleanResponse = cleanResponse.split('```json')[1].split('```')[0]
    } else if (cleanResponse.includes('```')) {
      cleanResponse = cleanResponse.split('```')[1].split('```')[0]
    }

    const generatedQuestions = JSON.parse(cleanResponse);
    console.log(`✅ Generated ${generatedQuestions.length} fallback questions using ${model}`);
    return generatedQuestions;
  } catch (error) {
    console.error("Error in fallback AI generation:", error);
    return []; // Retorna vazio se IA falhar
  }
}