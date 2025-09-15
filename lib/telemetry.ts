interface TelemetryEvent {
  event: string
  timestamp: number
  userId?: string
  sessionId: string
  properties: Record<string, any>
  metadata: {
    userAgent: string
    url: string
    referrer?: string
    viewport: {
      width: number
      height: number
    }
  }
}

interface PerformanceMetrics {
  classificationLatency: number
  generationLatency: number
  imageLoadLatency: number
  navigationLatency: number
  totalLessonTime: number
}

interface QualityMetrics {
  classificationAccuracy: number
  contentQualityScore: number
  userSatisfactionScore?: number
  completionRate: number
}

class TelemetryService {
  private events: TelemetryEvent[] = []
  private sessionId: string
  private userId?: string
  private isEnabled: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.TELEMETRY_ENABLED === 'true'
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  track(event: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return

    const telemetryEvent: TelemetryEvent = {
      event,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        viewport: {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
        },
      },
    }

    this.events.push(telemetryEvent)
    this.sendEvent(telemetryEvent)
  }

  private async sendEvent(event: TelemetryEvent) {
    try {
      // In production, send to analytics service
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/telemetry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })
      } else {
        // In development, log to console
        console.log('📊 Telemetry Event:', event)
      }
    } catch (error) {
      console.error('Failed to send telemetry event:', error)
    }
  }

  // Performance tracking
  trackPerformance(metrics: PerformanceMetrics) {
    this.track('performance_metrics', {
      ...metrics,
      timestamp: Date.now(),
    })
  }

  // Quality tracking
  trackQuality(metrics: QualityMetrics) {
    this.track('quality_metrics', {
      ...metrics,
      timestamp: Date.now(),
    })
  }

  // User interaction tracking
  trackUserInteraction(action: string, target: string, properties: Record<string, any> = {}) {
    this.track('user_interaction', {
      action,
      target,
      ...properties,
    })
  }

  // Error tracking
  trackError(error: Error, context: Record<string, any> = {}) {
    this.track('error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
    })
  }

  // Lesson generation tracking
  trackLessonGeneration(topic: string, level: string, success: boolean, metrics: PerformanceMetrics) {
    this.track('lesson_generation', {
      topic,
      level,
      success,
      ...metrics,
    })
  }

  // Classification tracking
  trackClassification(input: string, classification: string, confidence: number, latency: number) {
    this.track('classification', {
      input: input.substring(0, 100), // Truncate for privacy
      classification,
      confidence,
      latency,
    })
  }

  // Image loading tracking
  trackImageLoad(prompt: string, success: boolean, latency: number, source: string) {
    this.track('image_load', {
      prompt: prompt.substring(0, 50), // Truncate for privacy
      success,
      latency,
      source,
    })
  }

  // Navigation tracking
  trackNavigation(fromSlide: number, toSlide: number, method: 'click' | 'keyboard' | 'touch') {
    this.track('navigation', {
      fromSlide,
      toSlide,
      method,
      latency: Date.now(),
    })
  }

  // Question interaction tracking
  trackQuestionInteraction(questionId: string, answer: string, correct: boolean, timeSpent: number) {
    this.track('question_interaction', {
      questionId,
      answer,
      correct,
      timeSpent,
    })
  }

  // Get session summary
  getSessionSummary() {
    const events = this.events
    const lessonEvents = events.filter(e => e.event === 'lesson_generation')
    const errorEvents = events.filter(e => e.event === 'error')
    const interactionEvents = events.filter(e => e.event === 'user_interaction')

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: events.length,
      lessonGenerations: lessonEvents.length,
      errors: errorEvents.length,
      interactions: interactionEvents.length,
      duration: events.length > 0 ? events[events.length - 1].timestamp - events[0].timestamp : 0,
    }
  }

  // Export events for analysis
  exportEvents() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      summary: this.getSessionSummary(),
    }
  }
}

// Create singleton instance
export const telemetry = new TelemetryService()

// Performance monitoring utilities
export class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map()

  startTiming(label: string) {
    this.startTimes.set(label, performance.now())
  }

  endTiming(label: string): number {
    const startTime = this.startTimes.get(label)
    if (!startTime) {
      console.warn(`No start time found for ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.startTimes.delete(label)
    
    telemetry.track('performance_timing', {
      label,
      duration,
    })

    return duration
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(label)
    return fn().finally(() => {
      this.endTiming(label)
    })
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Quality scoring utilities
export class QualityScorer {
  static scoreContent(content: string): number {
    const factors = {
      length: this.scoreLength(content),
      structure: this.scoreStructure(content),
      educationalTerms: this.scoreEducationalTerms(content),
      coherence: this.scoreCoherence(content),
    }

    return Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length
  }

  private static scoreLength(content: string): number {
    const length = content.length
    if (length < 100) return 0.3
    if (length < 500) return 0.6
    if (length < 2000) return 1.0
    return 0.8 // Too long might be repetitive
  }

  private static scoreStructure(content: string): number {
    const hasNumbers = /\d+\./.test(content)
    const hasBullets = /[•\-\*]/.test(content)
    const hasParagraphs = content.split('\n\n').length > 1
    
    let score = 0
    if (hasNumbers) score += 0.4
    if (hasBullets) score += 0.3
    if (hasParagraphs) score += 0.3
    
    return Math.min(score, 1.0)
  }

  private static scoreEducationalTerms(content: string): number {
    const educationalTerms = [
      'aprendizado', 'ensino', 'educação', 'conceito', 'exemplo',
      'explicação', 'definição', 'característica', 'propriedade',
      'processo', 'método', 'técnica', 'aplicação', 'prática'
    ]
    
    const foundTerms = educationalTerms.filter(term => 
      content.toLowerCase().includes(term)
    )
    
    return Math.min(foundTerms.length / 5, 1.0)
  }

  private static scoreCoherence(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length < 3) return 0.3
    
    // Check for repetitive content
    const words = content.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    const repetitionRatio = uniqueWords.size / words.length
    
    return Math.min(repetitionRatio * 1.5, 1.0)
  }
}

// Error boundary for React components
export class TelemetryErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    telemetry.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo deu errado</h2>
          <p>Ocorreu um erro inesperado. Nossa equipe foi notificada.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Web Vitals integration
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS((metric) => {
      telemetry.track('web_vital', {
        name: 'CLS',
        value: metric.value,
        delta: metric.delta,
      })
    })

    getFID((metric) => {
      telemetry.track('web_vital', {
        name: 'FID',
        value: metric.value,
        delta: metric.delta,
      })
    })

    getFCP((metric) => {
      telemetry.track('web_vital', {
        name: 'FCP',
        value: metric.value,
        delta: metric.delta,
      })
    })

    getLCP((metric) => {
      telemetry.track('web_vital', {
        name: 'LCP',
        value: metric.value,
        delta: metric.delta,
      })
    })

    getTTFB((metric) => {
      telemetry.track('web_vital', {
        name: 'TTFB',
        value: metric.value,
        delta: metric.delta,
      })
    })
  })
}
