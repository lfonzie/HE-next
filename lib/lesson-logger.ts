/**
 * Sistema de Logging Detalhado para Geração de Aulas
 * Fornece logs estruturados com diferentes níveis de detalhamento
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  topic?: string;
  schoolId?: string;
  mode?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: any;
  duration?: number;
  stack?: string;
}

class LessonLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log estruturado com contexto
   */
  log(level: LogLevel, message: string, context: LogContext = {}, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      context: {
        ...context,
        timestamp
      },
      data,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined
    };

    // Em desenvolvimento, mostrar logs coloridos no console
    if (this.isDevelopment) {
      this.logToConsole(logEntry);
    }

    // Em produção, enviar para serviço de logging (ex: DataDog, CloudWatch)
    if (this.isProduction) {
      this.logToService(logEntry);
    }
  }

  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug(message: string, context: LogContext = {}, data?: any): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context, data);
    }
  }

  /**
   * Log de informação
   */
  info(message: string, context: LogContext = {}, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Log de aviso
   */
  warn(message: string, context: LogContext = {}, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * Log de erro
   */
  error(message: string, context: LogContext = {}, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  /**
   * Log de sucesso
   */
  success(message: string, context: LogContext = {}, data?: any): void {
    this.log(LogLevel.SUCCESS, message, context, data);
  }

  /**
   * Log com medição de tempo
   */
  timeStart(label: string, context: LogContext = {}): string {
    const timerId = `${label}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.debug(`⏱️ Iniciando timer: ${label}`, { ...context, timerId });
    return timerId;
  }

  timeEnd(timerId: string, label: string, context: LogContext = {}): void {
    const startTime = parseInt(timerId.split('_')[1]);
    const duration = Date.now() - startTime;
    this.info(`⏱️ Timer concluído: ${label}`, { ...context, timerId, duration });
  }

  /**
   * Log de performance com métricas
   */
  performance(operation: string, metrics: any, context: LogContext = {}): void {
    this.info(`📊 Performance: ${operation}`, context, {
      metrics,
      performance: {
        duration: metrics.duration,
        tokens: metrics.tokens,
        slides: metrics.slides,
        memory: process.memoryUsage()
      }
    });
  }

  /**
   * Log de API call
   */
  apiCall(method: string, endpoint: string, status: number, duration: number, context: LogContext = {}): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `🌐 API Call: ${method} ${endpoint}`, context, {
      method,
      endpoint,
      status,
      duration,
      success: status < 400
    });
  }

  /**
   * Log de geração de aula com etapas detalhadas
   */
  lessonGeneration(step: string, details: any, context: LogContext = {}): void {
    this.info(`🎓 Aula: ${step}`, context, {
      step,
      details,
      progress: details.progress || 0
    });
  }

  /**
   * Log de erro de validação
   */
  validationError(field: string, value: any, expected: string, context: LogContext = {}): void {
    this.error(`❌ Validação falhou: ${field}`, context, {
      field,
      value,
      expected,
      type: typeof value
    });
  }

  /**
   * Log de parsing de dados
   */
  parsing(operation: string, success: boolean, details: any, context: LogContext = {}): void {
    const level = success ? LogLevel.SUCCESS : LogLevel.ERROR;
    this.log(level, `🔍 Parsing: ${operation}`, context, {
      operation,
      success,
      details
    });
  }

  /**
   * Log para console com cores (desenvolvimento)
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, data, duration } = entry;
    
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[34m',   // Blue
      [LogLevel.WARN]: '\x1b[33m',   // Yellow
      [LogLevel.ERROR]: '\x1b[31m',  // Red
      [LogLevel.SUCCESS]: '\x1b[32m' // Green
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${level}]${reset} ${message}`);
    
    if (context && Object.keys(context).length > 0) {
      console.log(`  📋 Contexto:`, context);
    }
    
    if (data) {
      console.log(`  📊 Dados:`, data);
    }
    
    if (duration) {
      console.log(`  ⏱️ Duração: ${duration}ms`);
    }
    
    if (entry.stack && level === LogLevel.ERROR) {
      console.log(`  🔍 Stack:`, entry.stack);
    }
  }

  /**
   * Log para serviço externo (produção)
   */
  private logToService(entry: LogEntry): void {
    // TODO: Implementar integração com serviço de logging
    // Exemplo: DataDog, CloudWatch, Sentry, etc.
    console.log(`[PRODUCTION LOG] ${JSON.stringify(entry)}`);
  }
}

// Instância singleton
export const lessonLogger = new LessonLogger();

// Funções de conveniência para uso direto
export const log = {
  debug: (message: string, context?: LogContext, data?: any) => lessonLogger.debug(message, context, data),
  info: (message: string, context?: LogContext, data?: any) => lessonLogger.info(message, context, data),
  warn: (message: string, context?: LogContext, data?: any) => lessonLogger.warn(message, context, data),
  error: (message: string, context?: LogContext, data?: any) => lessonLogger.error(message, context, data),
  success: (message: string, context?: LogContext, data?: any) => lessonLogger.success(message, context, data),
  timeStart: (label: string, context?: LogContext) => lessonLogger.timeStart(label, context),
  timeEnd: (timerId: string, label: string, context?: LogContext) => lessonLogger.timeEnd(timerId, label, context),
  performance: (operation: string, metrics: any, context?: LogContext) => lessonLogger.performance(operation, metrics, context),
  apiCall: (method: string, endpoint: string, status: number, duration: number, context?: LogContext) => lessonLogger.apiCall(method, endpoint, status, duration, context),
  lessonGeneration: (step: string, details: any, context?: LogContext) => lessonLogger.lessonGeneration(step, details, context),
  validationError: (field: string, value: any, expected: string, context?: LogContext) => lessonLogger.validationError(field, value, expected, context),
  parsing: (operation: string, success: boolean, details: any, context?: LogContext) => lessonLogger.parsing(operation, success, details, context)
};

export default lessonLogger;
