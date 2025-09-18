"use client"

import { EventEmitter } from 'events'
import { ModulePlugin, ModuleSettings } from '@/contexts/ModuleContext'

export interface ModuleRegistryConfig {
  enableDynamicLoading: boolean
  enableHotReload: boolean
  enableValidation: boolean
  enableMetrics: boolean
  maxModules: number
  cacheTimeout: number
}

export interface ModuleValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface ModuleMetrics {
  moduleId: string
  loadCount: number
  loadTime: number
  errorCount: number
  lastLoaded: number
  averageLoadTime: number
  successRate: number
}

export interface ModuleDependency {
  moduleId: string
  version: string
  required: boolean
  installed: boolean
}

export class ModuleRegistry extends EventEmitter {
  private modules: Map<string, ModulePlugin> = new Map()
  private config: ModuleRegistryConfig
  private metrics: Map<string, ModuleMetrics> = new Map()
  private dependencies: Map<string, ModuleDependency[]> = new Map()
  private loadingPromises: Map<string, Promise<ModulePlugin>> = new Map()

  constructor(config: Partial<ModuleRegistryConfig> = {}) {
    super()
    
    this.config = {
      enableDynamicLoading: true,
      enableHotReload: true,
      enableValidation: true,
      enableMetrics: true,
      maxModules: 100,
      cacheTimeout: 300000, // 5 minutes
      ...config
    }

    this.initializeDefaultModules()
  }

  // Public methods
  async registerModule(module: ModulePlugin): Promise<boolean> {
    try {
      // Validate module
      if (this.config.enableValidation) {
        const validation = await this.validateModule(module)
        if (!validation.isValid) {
          console.error('Module validation failed:', validation.errors)
          this.emit('moduleValidationFailed', { module, validation })
          return false
        }
      }

      // Check dependencies
      if (module.dependencies.length > 0) {
        const missingDeps = await this.checkDependencies(module.dependencies)
        if (missingDeps.length > 0) {
          console.error('Missing dependencies:', missingDeps)
          this.emit('moduleDependenciesMissing', { module, missingDeps })
          return false
        }
      }

      // Check if module already exists
      if (this.modules.has(module.id)) {
        console.warn(`Module ${module.id} already registered, updating...`)
        this.emit('moduleUpdated', { module })
      } else {
        this.emit('moduleRegistered', { module })
      }

      // Register module
      this.modules.set(module.id, module)
      this.dependencies.set(module.id, module.dependencies.map(dep => ({
        moduleId: dep,
        version: 'latest',
        required: true,
        installed: this.modules.has(dep)
      })))

      // Update metrics
      if (this.config.enableMetrics) {
        this.updateMetrics(module.id, 'registered')
      }

      return true
    } catch (error) {
      console.error('Error registering module:', error)
      this.emit('moduleRegistrationError', { module, error })
      return false
    }
  }

  async unregisterModule(moduleId: string): Promise<boolean> {
    try {
      const module = this.modules.get(moduleId)
      if (!module) {
        return false
      }

      // Check if other modules depend on this one
      const dependents = this.findDependents(moduleId)
      if (dependents.length > 0) {
        console.warn(`Cannot unregister module ${moduleId}: ${dependents.length} modules depend on it`)
        this.emit('moduleUnregisterBlocked', { moduleId, dependents })
        return false
      }

      this.modules.delete(moduleId)
      this.dependencies.delete(moduleId)
      this.metrics.delete(moduleId)

      this.emit('moduleUnregistered', { moduleId })
      return true
    } catch (error) {
      console.error('Error unregistering module:', error)
      this.emit('moduleUnregisterError', { moduleId, error })
      return false
    }
  }

  async loadModule(moduleId: string): Promise<ModulePlugin | null> {
    try {
      // Check if already loading
      if (this.loadingPromises.has(moduleId)) {
        return await this.loadingPromises.get(moduleId)!
      }

      // Check if already loaded
      const existingModule = this.modules.get(moduleId)
      if (existingModule) {
        return existingModule
      }

      // Start loading
      const loadingPromise = this.performModuleLoad(moduleId)
      this.loadingPromises.set(moduleId, loadingPromise)

      try {
        const module = await loadingPromise
        this.loadingPromises.delete(moduleId)
        return module
      } catch (error) {
        this.loadingPromises.delete(moduleId)
        throw error
      }
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error)
      this.emit('moduleLoadError', { moduleId, error })
      return null
    }
  }

  getModule(moduleId: string): ModulePlugin | null {
    return this.modules.get(moduleId) || null
  }

  getAllModules(): ModulePlugin[] {
    return Array.from(this.modules.values())
  }

  getEnabledModules(): ModulePlugin[] {
    return Array.from(this.modules.values()).filter(module => module.isEnabled)
  }

  getModulesByCategory(category: string): ModulePlugin[] {
    return Array.from(this.modules.values()).filter(module => module.category === category)
  }

  findBestModule(context: {
    message: string
    history: any[]
    userId?: string
    preferences?: string[]
  }): ModulePlugin | null {
    try {
      const enabledModules = this.getEnabledModules()
      if (enabledModules.length === 0) {
        return null
      }

      // Score modules based on context
      const scoredModules = enabledModules.map(module => ({
        module,
        score: this.calculateModuleScore(module, context)
      }))

      // Sort by score and return best match
      scoredModules.sort((a, b) => b.score - a.score)
      
      const bestMatch = scoredModules[0]
      return bestMatch.score > 0.5 ? bestMatch.module : null
    } catch (error) {
      console.error('Error finding best module:', error)
      return null
    }
  }

  async validateModule(module: ModulePlugin): Promise<ModuleValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Required fields validation
    if (!module.id) errors.push('Module ID is required')
    if (!module.name) errors.push('Module name is required')
    if (!module.description) errors.push('Module description is required')
    if (!module.component) errors.push('Module component is required')

    // ID format validation
    if (module.id && !/^[a-z0-9-]+$/.test(module.id)) {
      errors.push('Module ID must contain only lowercase letters, numbers, and hyphens')
    }

    // Version validation
    if (module.version && !/^\d+\.\d+\.\d+$/.test(module.version)) {
      warnings.push('Module version should follow semantic versioning (e.g., 1.0.0)')
    }

    // Keywords validation
    if (!module.keywords || module.keywords.length === 0) {
      warnings.push('Module should have keywords for better classification')
    }

    // Models validation
    if (!module.models || module.models.length === 0) {
      warnings.push('Module should specify compatible models')
    }

    // Settings validation
    if (module.settings) {
      const settingsValidation = this.validateModuleSettings(module.settings)
      errors.push(...settingsValidation.errors)
      warnings.push(...settingsValidation.warnings)
    }

    // Suggestions
    if (module.keywords && module.keywords.length < 3) {
      suggestions.push('Consider adding more keywords for better classification')
    }

    if (!module.icon) {
      suggestions.push('Consider adding an icon for better UI representation')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  getModuleMetrics(moduleId: string): ModuleMetrics | null {
    return this.metrics.get(moduleId) || null
  }

  getAllMetrics(): Map<string, ModuleMetrics> {
    return new Map(this.metrics)
  }

  getDependencies(moduleId: string): ModuleDependency[] {
    return this.dependencies.get(moduleId) || []
  }

  findDependents(moduleId: string): string[] {
    const dependents: string[] = []
    
    for (const [id, deps] of this.dependencies) {
      if (deps.some(dep => dep.moduleId === moduleId)) {
        dependents.push(id)
      }
    }
    
    return dependents
  }

  // Private methods
  private async performModuleLoad(moduleId: string): Promise<ModulePlugin> {
    const startTime = Date.now()
    
    try {
      // Try to load from registered modules first
      let module = this.modules.get(moduleId)
      
      if (!module && this.config.enableDynamicLoading) {
        // Try to load dynamically
        module = await this.loadDynamicModule(moduleId)
      }

      if (!module) {
        throw new Error(`Module ${moduleId} not found`)
      }

      // Update metrics
      if (this.config.enableMetrics) {
        const loadTime = Date.now() - startTime
        this.updateMetrics(moduleId, 'loaded', loadTime)
      }

      this.emit('moduleLoaded', { module, loadTime: Date.now() - startTime })
      return module
    } catch (error) {
      if (this.config.enableMetrics) {
        this.updateMetrics(moduleId, 'error')
      }
      throw error
    }
  }

  private async loadDynamicModule(moduleId: string): Promise<ModulePlugin | null> {
    try {
      // Try to load from various sources
      const sources = [
        `/modules/${moduleId}/index.js`,
        `/modules/${moduleId}.js`,
        `/api/modules/${moduleId}`
      ]

      for (const source of sources) {
        try {
          const response = await fetch(source)
          if (response.ok) {
            const moduleData = await response.json()
            return moduleData as ModulePlugin
          }
        } catch (error) {
          // Continue to next source
        }
      }

      return null
    } catch (error) {
      console.error('Error loading dynamic module:', error)
      return null
    }
  }

  private calculateModuleScore(module: ModulePlugin, context: {
    message: string
    history: any[]
    userId?: string
    preferences?: string[]
  }): number {
    let score = 0

    // Keyword matching
    const messageLower = context.message.toLowerCase()
    const keywordMatches = module.keywords.filter(keyword =>
      messageLower.includes(keyword.toLowerCase())
    ).length

    score += (keywordMatches / module.keywords.length) * 0.4

    // User preferences
    if (context.preferences && context.preferences.includes(module.id)) {
      score += 0.3
    }

    // Module priority
    score += (module.priority / 10) * 0.2

    // Recent usage (if metrics available)
    const metrics = this.metrics.get(module.id)
    if (metrics && metrics.successRate > 0) {
      score += metrics.successRate * 0.1
    }

    return Math.min(score, 1.0)
  }

  private validateModuleSettings(settings: ModuleSettings): {
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate response style
    const validStyles = ['formal', 'casual', 'technical', 'creative']
    if (settings.responseStyle && !validStyles.includes(settings.responseStyle)) {
      errors.push(`Invalid response style: ${settings.responseStyle}`)
    }

    // Validate max response length
    if (settings.maxResponseLength && settings.maxResponseLength < 100) {
      warnings.push('Max response length seems too low')
    }

    if (settings.maxResponseLength && settings.maxResponseLength > 10000) {
      warnings.push('Max response length seems too high')
    }

    return { errors, warnings }
  }

  private async checkDependencies(dependencies: string[]): Promise<string[]> {
    const missing: string[] = []
    
    for (const dep of dependencies) {
      if (!this.modules.has(dep)) {
        missing.push(dep)
      }
    }
    
    return missing
  }

  private updateMetrics(moduleId: string, action: 'registered' | 'loaded' | 'error', loadTime?: number): void {
    const existing = this.metrics.get(moduleId) || {
      moduleId,
      loadCount: 0,
      loadTime: 0,
      errorCount: 0,
      lastLoaded: 0,
      averageLoadTime: 0,
      successRate: 0
    }

    switch (action) {
      case 'registered':
        existing.lastLoaded = Date.now()
        break
        
      case 'loaded':
        existing.loadCount++
        existing.lastLoaded = Date.now()
        if (loadTime) {
          existing.loadTime = loadTime
          existing.averageLoadTime = (
            (existing.averageLoadTime * (existing.loadCount - 1) + loadTime) / existing.loadCount
          )
        }
        break
        
      case 'error':
        existing.errorCount++
        break
    }

    // Calculate success rate
    const totalAttempts = existing.loadCount + existing.errorCount
    existing.successRate = totalAttempts > 0 ? existing.loadCount / totalAttempts : 0

    this.metrics.set(moduleId, existing)
  }

  private initializeDefaultModules(): void {
    // Initialize with default modules
    const defaultModules: ModulePlugin[] = [
      {
        id: 'professor',
        name: 'Professor',
        description: 'Módulo para questões acadêmicas e educacionais',
        icon: 'graduation-cap',
        color: '#3B82F6',
        keywords: ['aula', 'matéria', 'estudo', 'prova', 'exercício', 'conteúdo'],
        aiPrompt: 'Você é um professor experiente e paciente...',
        component: null as any, // Will be set by actual component
        models: ['gpt-3.5-turbo', 'gpt-4'],
        settings: {
          autoClassification: true,
          preferredModel: 'gpt-3.5-turbo',
          customPrompt: '',
          enableWebSearch: true,
          enableImageGeneration: false,
          maxResponseLength: 2000,
          enableNotifications: true,
          enableAnalytics: true,
          customKeywords: [],
          responseStyle: 'formal',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo'
        },
        isEnabled: true,
        priority: 8,
        category: 'academic',
        version: '1.0.0',
        author: 'HubEdu',
        dependencies: []
      },
      {
        id: 'atendimento',
        name: 'Atendimento',
        description: 'Módulo geral de atendimento ao cliente',
        icon: 'headphones',
        color: '#10B981',
        keywords: ['ajuda', 'suporte', 'dúvida', 'problema', 'atendimento'],
        aiPrompt: 'Você é um atendente profissional e prestativo...',
        component: null as any,
        models: ['gpt-3.5-turbo'],
        settings: {
          autoClassification: true,
          preferredModel: 'gpt-3.5-turbo',
          customPrompt: '',
          enableWebSearch: false,
          enableImageGeneration: false,
          maxResponseLength: 1500,
          enableNotifications: true,
          enableAnalytics: true,
          customKeywords: [],
          responseStyle: 'casual',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo'
        },
        isEnabled: true,
        priority: 5,
        category: 'support',
        version: '1.0.0',
        author: 'HubEdu',
        dependencies: []
      }
    ]

    defaultModules.forEach(module => {
      this.modules.set(module.id, module)
    })
  }

  // Cleanup
  destroy(): void {
    this.modules.clear()
    this.metrics.clear()
    this.dependencies.clear()
    this.loadingPromises.clear()
    this.removeAllListeners()
  }
}

// Singleton instance
let moduleRegistryInstance: ModuleRegistry | null = null

export function getModuleRegistry(config?: Partial<ModuleRegistryConfig>): ModuleRegistry {
  if (!moduleRegistryInstance) {
    moduleRegistryInstance = new ModuleRegistry(config)
  }
  return moduleRegistryInstance
}

export function destroyModuleRegistry(): void {
  if (moduleRegistryInstance) {
    moduleRegistryInstance.destroy()
    moduleRegistryInstance = null
  }
}
