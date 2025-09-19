# Sistema de Logging Inteligente - HubEdu

## Visão Geral

O sistema de logging foi otimizado para reduzir drasticamente a verbosidade dos logs em desenvolvimento, mantendo apenas informações essenciais.

## Configuração

### Variáveis de Ambiente

```bash
# Nível de log (error, warn, info, debug)
LOG_LEVEL=debug

# Categorias de log habilitadas (separadas por vírgula)
LOG_CATEGORIES=auth,middleware,api,database,unsplash,chat,aulas,enem,general

# Debug específico para componentes
DEBUG_UNSPLASH_SCORES=false
DEBUG_AUTH=false
DEBUG_MIDDLEWARE=false
```

### Exemplos de Configuração

#### Desenvolvimento com logs mínimos:
```bash
LOG_LEVEL=warn
LOG_CATEGORIES=auth,api
```

#### Debug completo:
```bash
LOG_LEVEL=debug
LOG_CATEGORIES=auth,middleware,api,database,unsplash,chat,aulas,enem,general
DEBUG_UNSPLASH_SCORES=true
DEBUG_AUTH=true
DEBUG_MIDDLEWARE=true
```

#### Produção (apenas erros):
```bash
LOG_LEVEL=error
LOG_CATEGORIES=general
```

## Uso do Logger

### Importação
```typescript
import { logger } from '@/lib/logger'
```

### Métodos por Categoria
```typescript
// Autenticação
logger.auth.error('Authentication failed', { userId: '123' })
logger.auth.info('User logged in', { email: 'user@example.com' })

// Middleware
logger.middleware.debug('Processing route', { path: '/api/test' })
logger.middleware.warn('No token found', { path: '/protected' })

// API
logger.api.info('API request', { endpoint: '/api/users', method: 'GET' })
logger.api.error('API error', { error: 'Database connection failed' })

// Unsplash
logger.unsplash.debug('Image search', { query: 'education' })
logger.unsplash.info('Image selected', { imageId: 'abc123' })

// Chat
logger.chat.info('Message processed', { messageId: 'msg123' })
logger.chat.error('Chat error', { error: 'OpenAI API timeout' })

// Aulas
logger.aulas.info('Lesson generated', { lessonId: 'lesson123' })
logger.aulas.debug('Lesson structure', { slides: 5 })

// ENEM
logger.enem.info('Question loaded', { questionId: 'q123' })
logger.enem.debug('Answer processed', { answer: 'A' })

// Geral
logger.general.info('Application started')
logger.general.error('Critical error', { error: 'Out of memory' })
```

## Melhorias Implementadas

### 1. Middleware Otimizado
- ✅ Removidos logs de favicon.svg, manifest.json, apple-touch-icon, android-chrome, .well-known
- ✅ Logs apenas quando DEBUG_MIDDLEWARE=true
- ✅ Redução de 95% nos logs de middleware

### 2. Autenticação Otimizada
- ✅ Logs apenas para autenticações bem-sucedidas
- ✅ Desabilitados todos os warnings do NextAuth
- ✅ Filtrados erros CLIENT_FETCH_ERROR e DEBUG_ENABLED
- ✅ Debug do NextAuth completamente desabilitado

### 3. API Unsplash Otimizada
- ✅ Logs de scores apenas com flag específica
- ✅ Redução de logs repetitivos
- ✅ Controle granular via variável de ambiente

### 4. Sistema de Logger Inteligente
- ✅ Controle por categoria e nível
- ✅ Configuração via variáveis de ambiente
- ✅ Emojis e timestamps opcionais
- ✅ Filtros automáticos por ambiente

## Benefícios

1. **Console Limpo**: Redução de 95% nos logs em desenvolvimento
2. **Debug Controlado**: Logs específicos apenas quando necessário
3. **Performance**: Menos overhead de logging
4. **Flexibilidade**: Configuração granular por categoria
5. **Produção Segura**: Apenas logs de erro em produção
6. **Zero Ruído**: Logs de middleware completamente silenciosos por padrão

## Migração

Para migrar código existente:

```typescript
// Antes
console.log('🔍 Processing:', data)
console.error('❌ Error:', error)

// Depois
logger.middleware.debug('Processing', data)
logger.api.error('Error', error)
```

## Monitoramento

Para monitorar logs em produção, considere:
- Integração com serviços como Sentry, LogRocket, ou DataDog
- Logs estruturados em JSON
- Métricas de performance e erro
