// lib/enem-local-database.ts
// Cliente para acessar a base de dados local das questões do ENEM

import fs from 'fs'
import path from 'path'

export interface LocalEnemExam {
  title: string
  year: number
  disciplines: Array<{
    label: string
    value: string
  }>
  languages: Array<{
    label: string
    value: string
  }>
  questions: Array<{
    title: string
    index: number
    discipline: string
    language: string | null
  }>
}

export interface LocalEnemQuestion {
  title: string
  index: number
  year: number
  language: string | null
  discipline: string
  context: string | null
  files: string[]
  correctAlternative: string
  alternativesIntroduction: string
  alternatives: Array<{
    letter: string
    text: string
    file: string | null
    isCorrect: boolean
  }>
}

export interface LocalEnemFilters {
  year?: number
  discipline?: string
  language?: string
  limit?: number
  random?: boolean
}

class EnemLocalDatabase {
  private basePath: string
  private cache: Map<string, any> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutos

  constructor() {
    this.basePath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public')
  }

  /**
   * Verifica se a base de dados local está disponível
   */
  isAvailable(): boolean {
    try {
      return fs.existsSync(this.basePath) && fs.existsSync(path.join(this.basePath, 'exams.json'))
    } catch {
      return false
    }
  }

  /**
   * Lista todos os exames disponíveis
   */
  async getExams(): Promise<LocalEnemExam[]> {
    const cacheKey = 'exams'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const examsPath = path.join(this.basePath, 'exams.json')
      const data = fs.readFileSync(examsPath, 'utf-8')
      const exams = JSON.parse(data)
      
      this.setCache(cacheKey, exams)
      return exams
    } catch (error) {
      console.error('Error reading exams.json:', error)
      return []
    }
  }

  /**
   * Busca questões com filtros
   */
  async getQuestions(filters: LocalEnemFilters = {}): Promise<LocalEnemQuestion[]> {
    const { year, discipline, language, limit = 20, random = false } = filters

    // Se não especificou ano, busca em todos os anos disponíveis
    const years = year ? [year] : await this.getAvailableYears()
    let allQuestions: LocalEnemQuestion[] = []

    console.log(`🔍 Buscando questões com filtros:`, { year, discipline, language, limit, random })

    for (const targetYear of years) {
      try {
        // Busca mais questões para compensar as que podem ser puladas
        const multiplier = year ? 2 : 1.5 // Se especificou ano, busca mais questões
        const questionsToRequest = Math.ceil(limit * multiplier)
        
        const yearQuestions = await this.getQuestionsByYear(targetYear, {
          discipline,
          language,
          limit: questionsToRequest,
          random: false
        })
        allQuestions.push(...yearQuestions)
        
        // Se já temos questões suficientes e especificou um ano, para de buscar
        if (year && allQuestions.length >= limit) {
          break
        }
      } catch (error) {
        console.error(`Error loading questions for year ${targetYear}:`, error)
      }
    }

    // Aplica filtros adicionais
    let filteredQuestions = allQuestions

    if (discipline) {
      filteredQuestions = filteredQuestions.filter(q => q.discipline === discipline)
    }

    if (language) {
      filteredQuestions = filteredQuestions.filter(q => q.language === language)
    }

    // Embaralha se solicitado
    if (random) {
      filteredQuestions = this.shuffleArray(filteredQuestions)
    }

    // Limita o resultado
    const finalQuestions = filteredQuestions.slice(0, limit)
    
    console.log(`✅ Retornando ${finalQuestions.length} questões válidas (solicitadas: ${limit})`)
    
    return finalQuestions
  }

  /**
   * Busca questões de um ano específico
   */
  async getQuestionsByYear(year: number, filters: Omit<LocalEnemFilters, 'year'> = {}): Promise<LocalEnemQuestion[]> {
    const cacheKey = `questions_${year}_${JSON.stringify(filters)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const yearPath = path.join(this.basePath, year.toString())
      if (!fs.existsSync(yearPath)) {
        console.log(`Year ${year} not found in local database`)
        return []
      }

      const detailsPath = path.join(yearPath, 'details.json')
      if (!fs.existsSync(detailsPath)) {
        console.log(`Details file not found for year ${year}`)
        return []
      }

      const detailsData = fs.readFileSync(detailsPath, 'utf-8')
      const yearDetails = JSON.parse(detailsData)

      // Filtra questões baseado nos critérios
      let questionsToLoad = yearDetails.questions || []
      
      if (filters.discipline) {
        questionsToLoad = questionsToLoad.filter((q: any) => q.discipline === filters.discipline)
      }

      if (filters.language) {
        questionsToLoad = questionsToLoad.filter((q: any) => q.language === filters.language)
      }

      // Carrega as questões individuais, pulando as que não existem
      const questions: LocalEnemQuestion[] = []
      const skippedQuestions: Array<{index: number, reason: string}> = []
      const questionsPath = path.join(yearPath, 'questions')

      console.log(`📚 Carregando questões do ano ${year}...`)

      for (const questionInfo of questionsToLoad) {
        try {
          // Verifica se a questão existe antes de tentar carregar
          const exists = await this.questionExists(year, questionInfo.index, questionInfo.language)
          if (!exists) {
            skippedQuestions.push({
              index: questionInfo.index,
              reason: 'questão não encontrada nos arquivos'
            })
            continue
          }

          const question = await this.loadQuestion(year, questionInfo.index, questionInfo.language)
          if (question) {
            questions.push(question)
          } else {
            skippedQuestions.push({
              index: questionInfo.index,
              reason: 'erro ao carregar questão'
            })
          }
        } catch (error) {
          console.error(`Error loading question ${questionInfo.index} from year ${year}:`, error)
          skippedQuestions.push({
            index: questionInfo.index,
            reason: `erro: ${error instanceof Error ? error.message : 'erro desconhecido'}`
          })
        }
      }

      // Log das questões puladas
      if (skippedQuestions.length > 0) {
        console.log(`⚠️ ${skippedQuestions.length} questões puladas em ${year}:`)
        skippedQuestions.forEach(skipped => {
          console.log(`   - Questão ${skipped.index}: ${skipped.reason}`)
        })
      }

      console.log(`✅ ${questions.length} questões carregadas com sucesso de ${year}`)

      // Limita a quantidade se especificado
      const finalQuestions = filters.limit ? questions.slice(0, filters.limit) : questions

      this.setCache(cacheKey, finalQuestions)
      return finalQuestions
    } catch (error) {
      console.error(`Error loading questions for year ${year}:`, error)
      return []
    }
  }

  /**
   * Verifica se uma questão existe nos arquivos
   */
  async questionExists(year: number, index: number, language?: string | null): Promise<boolean> {
    try {
      const yearPath = path.join(this.basePath, year.toString(), 'questions')
      
      // Determina o caminho da questão baseado no idioma
      let questionPath: string
      if (language && language !== 'null') {
        questionPath = path.join(yearPath, `${index}-${language}`)
      } else {
        questionPath = path.join(yearPath, index.toString())
      }

      // Se não encontrou com idioma, tenta sem
      if (!fs.existsSync(questionPath)) {
        questionPath = path.join(yearPath, index.toString())
      }

      if (!fs.existsSync(questionPath)) {
        return false
      }

      const detailsPath = path.join(questionPath, 'details.json')
      return fs.existsSync(detailsPath)
    } catch (error) {
      console.error(`Error checking if question ${index} exists for year ${year}:`, error)
      return false
    }
  }

  /**
   * Carrega uma questão específica
   */
  async loadQuestion(year: number, index: number, language?: string | null): Promise<LocalEnemQuestion | null> {
    try {
      const yearPath = path.join(this.basePath, year.toString(), 'questions')
      
      // Determina o caminho da questão baseado no idioma
      let questionPath: string
      if (language && language !== 'null') {
        questionPath = path.join(yearPath, `${index}-${language}`)
      } else {
        questionPath = path.join(yearPath, index.toString())
      }

      // Se não encontrou com idioma, tenta sem
      if (!fs.existsSync(questionPath)) {
        questionPath = path.join(yearPath, index.toString())
      }

      if (!fs.existsSync(questionPath)) {
        console.log(`⚠️ Questão ${index} não encontrada para o ano ${year} - pulando`)
        return null
      }

      const detailsPath = path.join(questionPath, 'details.json')
      if (!fs.existsSync(detailsPath)) {
        console.log(`⚠️ Arquivo details.json não encontrado para questão ${index} do ano ${year} - pulando`)
        return null
      }

      const data = fs.readFileSync(detailsPath, 'utf-8')
      const question = JSON.parse(data)

      // Lista arquivos de imagem se existirem
      const files: string[] = []
      try {
        const filesInDir = fs.readdirSync(questionPath)
        const imageFiles = filesInDir.filter(file => 
          /\.(png|jpg|jpeg|gif|bmp|svg)$/i.test(file)
        )
        files.push(...imageFiles.map(file => `/QUESTOES_ENEM/public/${year}/questions/${index}/${file}`))
      } catch (error) {
        // Ignora erro se não conseguir listar arquivos
      }

      return {
        ...question,
        files
      }
    } catch (error) {
      console.error(`Error loading question ${index} from year ${year}:`, error)
      return null
    }
  }

  /**
   * Busca questões aleatórias
   */
  async getRandomQuestions(filters: LocalEnemFilters = {}): Promise<LocalEnemQuestion[]> {
    const questions = await this.getQuestions({ ...filters, random: true })
    return questions
  }

  /**
   * Lista anos disponíveis
   */
  async getAvailableYears(): Promise<number[]> {
    const cacheKey = 'available_years'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const years: number[] = []
      const entries = fs.readdirSync(this.basePath, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
          years.push(parseInt(entry.name))
        }
      }

      years.sort((a, b) => b - a) // Ordem decrescente (mais recente primeiro)
      this.setCache(cacheKey, years)
      return years
    } catch (error) {
      console.error('Error getting available years:', error)
      return []
    }
  }

  /**
   * Lista disciplinas disponíveis
   */
  async getAvailableDisciplines(): Promise<string[]> {
    return ['ciencias-humanas', 'ciencias-natureza', 'linguagens', 'matematica']
  }

  /**
   * Lista idiomas disponíveis
   */
  async getAvailableLanguages(): Promise<string[]> {
    return ['espanhol', 'ingles']
  }

  /**
   * Converte questão local para formato do simulador
   */
  convertToSimulatorFormat(question: LocalEnemQuestion): any {
    // Converte para o formato EnemItem esperado pelo gerador
    return {
      item_id: `local_${question.year}_${question.index}`,
      area: question.discipline,
      year: question.year,
      text: question.context || '',
      alternatives: {
        A: question.alternatives[0]?.text || 'Alternativa A',
        B: question.alternatives[1]?.text || 'Alternativa B',
        C: question.alternatives[2]?.text || 'Alternativa C',
        D: question.alternatives[3]?.text || 'Alternativa D',
        E: question.alternatives[4]?.text || 'Alternativa E'
      },
      correct_answer: question.correctAlternative,
      topic: question.discipline,
      estimated_difficulty: 'MEDIUM',
      asset_refs: question.files || [],
      content_hash: `hash_${question.year}_${question.index}`,
      dataset_version: '1.0',
      metadata: {}
    }
  }

  /**
   * Estatísticas da base de dados
   */
  async getStats(): Promise<{
    totalYears: number
    totalQuestions: number
    questionsByYear: Record<number, number>
    questionsByDiscipline: Record<string, number>
  }> {
    const years = await this.getAvailableYears()
    const stats = {
      totalYears: years.length,
      totalQuestions: 0,
      questionsByYear: {} as Record<number, number>,
      questionsByDiscipline: {} as Record<string, number>
    }

    for (const year of years) {
      try {
        const yearPath = path.join(this.basePath, year.toString(), 'details.json')
        const data = fs.readFileSync(yearPath, 'utf-8')
        const yearDetails = JSON.parse(data)
        const questionCount = yearDetails.questions?.length || 0
        
        stats.totalQuestions += questionCount
        stats.questionsByYear[year] = questionCount

        // Conta por disciplina
        if (yearDetails.questions) {
          for (const q of yearDetails.questions) {
            const discipline = q.discipline
            stats.questionsByDiscipline[discipline] = (stats.questionsByDiscipline[discipline] || 0) + 1
          }
        }
      } catch (error) {
        console.error(`Error getting stats for year ${year}:`, error)
      }
    }

    return stats
  }

  /**
   * Estatísticas das questões realmente disponíveis (que existem nos arquivos)
   */
  async getAvailableStats(): Promise<{
    totalYears: number
    totalAvailableQuestions: number
    totalListedQuestions: number
    availabilityRate: number
    questionsByYear: Record<number, { listed: number, available: number, rate: number }>
    questionsByDiscipline: Record<string, { listed: number, available: number, rate: number }>
  }> {
    const years = await this.getAvailableYears()
    const stats = {
      totalYears: years.length,
      totalAvailableQuestions: 0,
      totalListedQuestions: 0,
      availabilityRate: 0,
      questionsByYear: {} as Record<number, { listed: number, available: number, rate: number }>,
      questionsByDiscipline: {} as Record<string, { listed: number, available: number, rate: number }>
    }

    console.log('📊 Calculando estatísticas de disponibilidade das questões...')

    for (const year of years) {
      try {
        const yearPath = path.join(this.basePath, year.toString(), 'details.json')
        const data = fs.readFileSync(yearPath, 'utf-8')
        const yearDetails = JSON.parse(data)
        const listedQuestions = yearDetails.questions || []
        
        let availableCount = 0
        const yearStats = { listed: listedQuestions.length, available: 0, rate: 0 }

        for (const questionInfo of listedQuestions) {
          const exists = await this.questionExists(year, questionInfo.index, questionInfo.language)
          if (exists) {
            availableCount++
          }
        }

        yearStats.available = availableCount
        yearStats.rate = listedQuestions.length > 0 ? (availableCount / listedQuestions.length) * 100 : 0

        stats.totalListedQuestions += listedQuestions.length
        stats.totalAvailableQuestions += availableCount
        stats.questionsByYear[year] = yearStats

        // Conta por disciplina
        for (const q of listedQuestions) {
          const discipline = q.discipline
          if (!stats.questionsByDiscipline[discipline]) {
            stats.questionsByDiscipline[discipline] = { listed: 0, available: 0, rate: 0 }
          }
          stats.questionsByDiscipline[discipline].listed++
          
          const exists = await this.questionExists(year, q.index, q.language)
          if (exists) {
            stats.questionsByDiscipline[discipline].available++
          }
        }

        console.log(`📅 ${year}: ${availableCount}/${listedQuestions.length} questões disponíveis (${yearStats.rate.toFixed(1)}%)`)

      } catch (error) {
        console.error(`Error getting available stats for year ${year}:`, error)
      }
    }

    // Calcula taxas por disciplina
    Object.keys(stats.questionsByDiscipline).forEach(discipline => {
      const discStats = stats.questionsByDiscipline[discipline]
      discStats.rate = discStats.listed > 0 ? (discStats.available / discStats.listed) * 100 : 0
    })

    stats.availabilityRate = stats.totalListedQuestions > 0 ? 
      (stats.totalAvailableQuestions / stats.totalListedQuestions) * 100 : 0

    console.log(`📊 Taxa geral de disponibilidade: ${stats.availabilityRate.toFixed(1)}%`)
    console.log(`📊 Total: ${stats.totalAvailableQuestions}/${stats.totalListedQuestions} questões disponíveis`)

    return stats
  }

  // Métodos de cache
  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Utilitários
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// Instância singleton
export const enemLocalDB = new EnemLocalDatabase()

// Mapeamento de áreas para o formato local
export const AREA_MAPPING = {
  'CN': 'ciencias-natureza',
  'CH': 'ciencias-humanas',
  'LC': 'linguagens',
  'MT': 'matematica',
  'linguagens': 'linguagens',
  'ciencias-humanas': 'ciencias-humanas',
  'ciencias-natureza': 'ciencias-natureza',
  'matematica': 'matematica'
} as const

export const DISCIPLINE_MAPPING = {
  'linguagens': 'Linguagens, Códigos e suas Tecnologias',
  'ciencias-humanas': 'Ciências Humanas e suas Tecnologias',
  'ciencias-natureza': 'Ciências da Natureza e suas Tecnologias',
  'matematica': 'Matemática e suas Tecnologias'
} as const

