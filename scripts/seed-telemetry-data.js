import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTelemetryData() {
  console.log('🌱 Inserindo dados de telemetria de exemplo...');

  try {
    // Criar alguns traces de exemplo
    const traces = [];
    const now = new Date();
    
    // Simular dados dos últimos 15 minutos
    for (let i = 0; i < 50; i++) {
      const startTime = new Date(now.getTime() - Math.random() * 15 * 60 * 1000);
      const duration = Math.floor(Math.random() * 2000) + 100; // 100-2100ms
      const isError = Math.random() < 0.05; // 5% de erro
      
      const routes = [
        '/api/aulas',
        '/api/chat',
        '/api/enem',
        '/api/redacao',
        '/api/lessons',
        '/api/profile',
        '/api/dashboard'
      ];
      
      const route = routes[Math.floor(Math.random() * routes.length)];
      
      traces.push({
        traceId: `trace-${Date.now()}-${i}`,
        spanId: `span-${Date.now()}-${i}`,
        parentSpanId: i > 0 ? `span-${Date.now()}-${i-1}` : null,
        name: `HTTP ${Math.random() > 0.5 ? 'GET' : 'POST'} ${route}`,
        kind: 'SERVER',
        startTime,
        endTime: new Date(startTime.getTime() + duration),
        durationMs: duration,
        statusCode: isError ? 'ERROR' : 'OK',
        statusMessage: isError ? 'Internal Server Error' : null,
        attributes: {
          'http.route': route,
          'http.method': Math.random() > 0.5 ? 'GET' : 'POST',
          'http.status_code': isError ? 500 : 200,
          'user.id': `user-${Math.floor(Math.random() * 10)}`,
          'service.name': 'he-next'
        },
        resource: {
          'service.name': 'he-next',
          'service.version': '0.0.32',
          'deployment.environment': 'development'
        },
        scope: {
          'name': 'opentelemetry-instrumentation-http',
          'version': '1.0.0'
        }
      });
    }

    // Inserir traces
    await prisma.traceSpan.createMany({
      data: traces
    });

    // Criar métricas de exemplo
    const metrics = [];
    const metricNames = [
      'http_requests_total',
      'http_request_duration_ms',
      'active_users',
      'lesson_generation_time_ms',
      'ai_requests_total',
      'ai_request_duration_ms',
      'database_connections',
      'memory_usage_mb'
    ];

    const routes = [
      '/api/aulas',
      '/api/chat',
      '/api/enem',
      '/api/redacao',
      '/api/lessons',
      '/api/profile',
      '/api/dashboard'
    ];

    for (let i = 0; i < 100; i++) {
      const time = new Date(now.getTime() - Math.random() * 15 * 60 * 1000);
      const metricName = metricNames[Math.floor(Math.random() * metricNames.length)];
      
      metrics.push({
        name: metricName,
        time,
        value: Math.random() * 1000,
        unit: metricName.includes('duration') ? 'ms' : 'count',
        attr: {
          route: routes[Math.floor(Math.random() * routes.length)],
          method: Math.random() > 0.5 ? 'GET' : 'POST'
        },
        resource: {
          'service.name': 'he-next',
          'service.version': '0.0.32'
        },
        type: metricName.includes('total') ? 'COUNTER' : 'GAUGE'
      });
    }

    // Inserir métricas
    await prisma.metricPoint.createMany({
      data: metrics
    });

    // Criar logs de exemplo
    const logs = [];
    const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const logMessages = [
      'User logged in successfully',
      'Lesson generated successfully',
      'AI request completed',
      'Database connection established',
      'Cache miss for key',
      'Rate limit exceeded',
      'Invalid request parameters',
      'External API timeout',
      'Memory usage high',
      'Request processed'
    ];

    for (let i = 0; i < 30; i++) {
      const time = new Date(now.getTime() - Math.random() * 15 * 60 * 1000);
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];
      
      logs.push({
        time,
        severity: level,
        body: message,
        attr: {
          'service.name': 'he-next',
          'user.id': `user-${Math.floor(Math.random() * 10)}`,
          'request.id': `req-${Date.now()}-${i}`
        },
        resource: {
          'service.name': 'he-next',
          'service.version': '0.0.32'
        },
        traceId: Math.random() > 0.7 ? `trace-${Date.now()}-${i}` : null,
        spanId: Math.random() > 0.7 ? `span-${Date.now()}-${i}` : null
      });
    }

    // Inserir logs
    await prisma.logRecord.createMany({
      data: logs
    });

    console.log('✅ Dados de telemetria inseridos com sucesso!');
    console.log(`📊 ${traces.length} traces criados`);
    console.log(`📈 ${metrics.length} métricas criadas`);
    console.log(`📝 ${logs.length} logs criados`);

  } catch (error) {
    console.error('❌ Erro ao inserir dados de telemetria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTelemetryData();
