# OpenTelemetry Setup - Painel de Status Interno

Este documento descreve como configurar o sistema de telemetria com OpenTelemetry, persistindo dados no Neon (Postgres) e exibindo um painel de status interno.

## Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │ OTel Collector   │    │   Neon DB       │
│                 │    │ (Private Service)│    │   (Postgres)    │
│ ┌─────────────┐ │    │                  │    │                 │
│ │   Browser   │ │───▶│ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Instrument. │ │    │ │   Receivers  │ │    │ │ TraceSpan   │ │
│ └─────────────┘ │    │ │   (OTLP)     │ │    │ │ MetricPoint │ │
│                 │    │ └──────────────┘ │    │ │ LogRecord   │ │
│ ┌─────────────┐ │    │        │         │    │ └─────────────┘ │
│ │   Server    │ │───▶│ ┌──────▼──────┐ │    │                 │
│ │ Instrument. │ │    │ │  Processors  │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
│                 │    │        │         │    │                 │
│ ┌─────────────┐ │    │ ┌──────▼──────┐ │───▶│                 │
│ │ /api/otel/  │ │◀───│ │  Exporters  │ │    │                 │
│ │ v1/traces   │ │    │ │ http/intake │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Componentes

### 1. Next.js App (Web Service)
- **Instrumentação**: Server-side e browser-side
- **Proxy CORS**: `/api/otel/v1/traces` para browser
- **Intake API**: `/api/telemetry-intake` para receber dados do Collector
- **Status Dashboard**: `/status` com métricas em tempo real

### 2. OTel Collector (Private Service)
- **Receivers**: OTLP HTTP/GRPC (portas 4317/4318)
- **Processors**: Batch, Memory Limiter, Resource
- **Exporters**: 
  - `logging` (debug)
  - `http/intake` (para Next.js → Neon)

### 3. Neon Database
- **TraceSpan**: Traces com spans, duração, status, atributos
- **MetricPoint**: Métricas com timestamps, valores, tipos
- **LogRecord**: Logs com severidade, corpo, contexto

## Configuração

### 1. Variáveis de Ambiente

#### Para Desenvolvimento Local
```bash
# OTel Collector
OTEL_COLLECTOR_URL="http://localhost:4318"
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="/api/otel/v1/traces"

# Server-side OTel
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/traces"
OTEL_SERVICE_NAME="he-next"
OTEL_DEPLOYMENT_ENVIRONMENT="development"

# Segurança
INTAKE_SECRET="your-secure-secret-here"
```

#### Para Produção (Render)
```bash
# OTel Collector (Private Service)
OTEL_COLLECTOR_URL="http://he-next-collector:4318"
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="/api/otel/v1/traces"

# Server-side OTel
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://he-next-collector:4318/v1/traces"
OTEL_SERVICE_NAME="he-next"
OTEL_DEPLOYMENT_ENVIRONMENT="production"

# Segurança
INTAKE_SECRET="your-secure-secret-here"
```

### 2. Banco de Dados

Execute as migrações do Prisma:

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma migrate deploy

# Ou usar o script
node scripts/migrate-telemetry.js
```

### 3. OTel Collector

#### Desenvolvimento Local
```bash
# Usar Docker Compose
docker-compose -f docker-compose.otel.yml up -d

# Ou executar diretamente
docker run -p 4317:4317 -p 4318:4318 \
  -v $(pwd)/collector/otel-collector.yaml:/etc/otelcol-contrib/otel-collector.yaml \
  -e NEXT_APP_URL=http://localhost:3000 \
  -e INTAKE_SECRET=your-secret \
  otel/opentelemetry-collector-contrib:0.88.0 \
  --config=/etc/otelcol-contrib/otel-collector.yaml
```

#### Produção (Render)
1. Crie um **Private Service** (Worker)
2. Use o Dockerfile em `collector/Dockerfile`
3. Configure as variáveis de ambiente
4. O Collector se conectará automaticamente ao Next.js

### 4. Deploy no Render

1. **Database**: Crie um PostgreSQL no Neon
2. **Web Service**: Deploy do Next.js com as variáveis de ambiente
3. **Private Service**: Deploy do Collector
4. **Configuração**: Use `render-telemetry.yaml` como referência

## Uso

### Dashboard de Status
Acesse `/status` para ver:
- Status geral do sistema
- Latência P95 por rota
- Taxa de erro por endpoint
- Requisições por minuto (RPS)
- Logs de erro recentes
- Métricas do sistema

### API de Status
```bash
# Resumo de métricas
GET /api/status/summary

# Dados de telemetria (apenas Collector)
POST /api/telemetry-intake
```

### Instrumentação

#### Server-side (já configurado)
```typescript
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
// ... configuração automática
```

#### Browser-side (já configurado)
```typescript
// lib/otel-browser.ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
// ... configuração automática
```

## Monitoramento

### Métricas Disponíveis
- **Latência**: P50, P95, P99 por rota
- **Taxa de Erro**: % de requisições com erro
- **Throughput**: RPS (Requests Per Second)
- **Logs**: Erros, warnings, info
- **Métricas Customizadas**: Via OpenTelemetry

### Alertas (Futuro)
- P95 > 1000ms por 5 minutos
- Taxa de erro > 5% por 2 minutos
- RPS < 10 por 10 minutos (degradação)

## Troubleshooting

### Collector não recebe dados
1. Verifique se as portas 4317/4318 estão abertas
2. Confirme as variáveis de ambiente
3. Verifique os logs do Collector

### Dashboard vazio
1. Verifique se o Collector está enviando para `/api/telemetry-intake`
2. Confirme se `INTAKE_SECRET` está correto
3. Verifique os logs do Next.js

### Performance
1. Ajuste `OTEL_TRACES_SAMPLER_ARG` para reduzir volume
2. Configure retenção de dados no Neon
3. Use índices adequados no banco

## Próximos Passos

1. **Alertas**: Integrar com Slack/Email
2. **Métricas de Negócio**: Tempo de geração de aula, % de sucesso por provider IA
3. **Dashboards Avançados**: Grafana, custom charts
4. **Retenção**: Política de limpeza de dados antigos
5. **Análise**: Queries SQL customizadas para insights

## Arquivos Importantes

- `collector/otel-collector.yaml` - Configuração do Collector
- `app/api/telemetry-intake/route.ts` - API de ingestão
- `app/api/status/summary/route.ts` - API de métricas
- `app/status/page.tsx` - Dashboard UI
- `prisma/schema.prisma` - Modelos de dados
- `render-telemetry.yaml` - Configuração Render