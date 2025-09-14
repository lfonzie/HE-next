// lib/enem-api.ts
// Integração com a API enem.dev para questões reais do ENEM

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

export interface EnemApiResponse<T> {
  data: T
  message?: string
  status: number
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
  private baseUrl = 'https://enem.dev/api'
  private localServerUrl = 'http://localhost:3100/v1' // Servidor local ENEM na porta 3100
  private useLocalServer = true // Habilitar servidor local agora que temos endpoints corretos
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

    // Usar servidor local se disponível
    const url = this.useLocalServer ? `${this.localServerUrl}${endpoint}` : `${this.baseUrl}${endpoint}`
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

      const response = await fetch(url, {
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
            console.log('📵 ENEM API endpoint not found, falling back to database/AI (cached for 5 minutes)')
          }
          this.isApiAvailable = false
          this.lastAvailabilityCheck = Date.now()
          // Don't throw error for 404, just return empty array to allow fallback
          return []
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
   * Alterna entre servidor local e API externa
   */
  setUseLocalServer(useLocal: boolean): void {
    this.useLocalServer = useLocal
    this.isApiAvailable = true // Reset availability when switching
    this.lastAvailabilityCheck = 0 // Force immediate check
    console.log(`ENEM client switched to ${useLocal ? 'Local Server' : 'External API'}`)
  }

  /**
   * Verifica se está usando servidor local
   */
  isUsingLocalServer(): boolean {
    return this.useLocalServer
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

      // Verificar servidor local primeiro
      const checkUrl = this.useLocalServer ? `${this.localServerUrl}/exams` : this.baseUrl
      
      const response = await fetch(checkUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HubEdu-Platform/1.0',
        },
      })
      
      clearTimeout(timeoutId)
      this.isApiAvailable = response.ok
      
      if (this.isApiAvailable) {
        console.log(`✅ ENEM ${this.useLocalServer ? 'Local Server' : 'API'} is available`)
      } else {
        console.log(`📵 ENEM ${this.useLocalServer ? 'Local Server' : 'API'} is currently unavailable (cached for 5 minutes)`)
      }
      
      return this.isApiAvailable
    } catch (error) {
      console.log(`ENEM ${this.useLocalServer ? 'Local Server' : 'API'} availability check failed:`, error instanceof Error ? error.message : 'Unknown error')
      this.isApiAvailable = false
      return false
    }
  }

  /**
   * Lista todas as provas disponíveis
   */
  async getExams(): Promise<EnemExam[]> {
    if (!this.isApiAvailable && !this.useLocalServer) {
      console.log('API not available, returning mock data')
      return this.getMockExams()
    }

    try {
      if (this.useLocalServer) {
        // Usar servidor local
        const response = await fetch(`${this.localServerUrl}/exams`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          // Converter formato da API local para formato esperado
          return data.exams?.map((exam: any) => ({
            id: exam.id || `exam-${exam.year}`,
            year: exam.year,
            type: exam.type || 'REGULAR',
            description: exam.description || `ENEM ${exam.year} - Prova Regular`,
            questionsCount: exam.questionsCount || exam.questions?.length || 0
          })) || []
        } else {
          throw new Error(`Local server error: ${response.status}`)
        }
      } else {
        // Usar API externa
        const response = await this.makeRequest<EnemApiResponse<EnemExam[]>>('/exams')
        return response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error)
      return this.getMockExams()
    }
  }

  /**
   * Busca questões com filtros opcionais
   */
  async getQuestions(filters: EnemFilters = {}): Promise<EnemQuestion[]> {
    if (!this.isApiAvailable && !this.useLocalServer) {
      console.log('API not available, returning empty array')
      return []
    }

    try {
      if (this.useLocalServer) {
        // Usar servidor local - primeiro buscar exames disponíveis
        const examsResponse = await fetch(`${this.localServerUrl}/exams`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!examsResponse.ok) {
          throw new Error(`Local server error: ${examsResponse.status}`)
        }
        
        const examsData = await examsResponse.json()
        const exams = examsData.exams || []
        
        if (exams.length === 0) {
          console.log('No exams found in local server')
          return []
        }
        
        // Usar o primeiro exame disponível se não especificado
        const targetYear = filters.year || exams[0].year
        const targetExam = exams.find((exam: any) => exam.year === targetYear)
        
        if (!targetExam) {
          console.log(`No exam found for year ${targetYear}`)
          return []
        }
        
        // Buscar questões do exame específico
        const params = new URLSearchParams()
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())

        const questionsUrl = `${this.localServerUrl}/exams/${targetYear}/questions${params.toString() ? `?${params.toString()}` : ''}`
        const questionsResponse = await fetch(questionsUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json()
          const questions = questionsData.questions || []
          
          // Filtrar por área se especificado
          if (filters.area) {
            return questions.filter((q: any) => 
              q.area && q.area.toLowerCase().includes(filters.area!.toLowerCase())
            )
          }
          
          return questions
        } else {
          throw new Error(`Local server error: ${questionsResponse.status}`)
        }
      } else {
        // Usar API externa
        const params = new URLSearchParams()
        
        if (filters.year) params.append('year', filters.year.toString())
        if (filters.area) params.append('area', filters.area)
        if (filters.subject) params.append('subject', filters.subject)
        if (filters.type) params.append('type', filters.type)
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())

        const endpoint = `/questions${params.toString() ? `?${params.toString()}` : ''}`
        const response = await this.makeRequest<EnemApiResponse<EnemQuestion[]>>(endpoint)
        
        return response.data || []
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      return []
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
      const response = await this.makeRequest<EnemApiResponse<EnemQuestion>>(`/questions/${id}`)
      return response.data || null
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
