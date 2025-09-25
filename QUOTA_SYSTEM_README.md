# Sistema de Quotas de Tokens

Este documento descreve o sistema completo de quotas de tokens implementado no HubEdu.IA, que permite controlar o uso de tokens por usuário por mês, com painel administrativo e notificações.

## 📋 Visão Geral

O sistema de quotas inclui:

- **Controle de quotas mensais** por usuário baseado no role
- **Limites diários e horários** opcionais
- **Controle de custos** em USD e BRL
- **Painel administrativo** para gerenciar quotas
- **Notificações** quando limites são atingidos
- **Histórico detalhado** de uso de tokens
- **Middleware** para APIs de IA

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `quotas`
Armazena as quotas mensais de cada usuário:
```sql
- id: UUID (PK)
- user_id: UUID (FK para User)
- month: VARCHAR(7) - Formato YYYY-MM
- token_limit: INT - Limite de tokens do mês
- token_used: INT - Tokens já utilizados
- is_active: BOOLEAN - Se a quota está ativa
- created_at, updated_at: TIMESTAMP
```

#### `quota_usage_log`
Registra cada uso de tokens:
```sql
- id: UUID (PK)
- quota_id: UUID (FK para quotas)
- user_id: UUID (FK para User)
- provider: VARCHAR(50) - openai, google, etc
- model: VARCHAR(100) - gpt-4o-mini, etc
- prompt_tokens: INT
- completion_tokens: INT
- total_tokens: INT
- cost_usd, cost_brl: DECIMAL
- module: VARCHAR(50) - aulas, professor, etc
- conversation_id: UUID
- api_endpoint: VARCHAR(100)
- success: BOOLEAN
- error_message: TEXT
- created_at: TIMESTAMP
```

#### `quota_settings`
Configurações padrão por role:
```sql
- id: UUID (PK)
- role: role (UNIQUE) - STUDENT, TEACHER, etc
- monthly_token_limit: INT
- daily_token_limit: INT (opcional)
- hourly_token_limit: INT (opcional)
- cost_limit_usd: DECIMAL (opcional)
- cost_limit_brl: DECIMAL (opcional)
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP
```

## 🔧 Configuração Inicial

### 1. Executar Migração do Banco

```bash
npx prisma db push
```

### 2. Inicializar Configurações Padrão

```bash
node scripts/initialize-quotas.js
```

### 3. Configurações Padrão por Role (Atualizadas - Setembro 2025)

| Role | Limite Mensal | Limite Diário | Limite Horário | Custo USD | Custo BRL |
|------|---------------|---------------|----------------|-----------|-----------|
| STUDENT | 100,000 | 4,000 | 400 | $10.00 | R$ 52.00 |
| TEACHER | 500,000 | 20,000 | 2,000 | $50.00 | R$ 260.00 |
| STAFF | 200,000 | 8,000 | 800 | $20.00 | R$ 104.00 |
| ADMIN | 1,000,000 | 50,000 | 5,000 | $100.00 | R$ 520.00 |
| SUPER_ADMIN | 2,000,000 | 100,000 | 10,000 | $200.00 | R$ 1,040.00 |

> **Nota**: Valores atualizados baseados nos novos preços das APIs GPT-5 e Gemini 2.5 (setembro 2025)

## 🚀 Uso do Sistema

### Serviço de Quotas (`lib/quota-service.ts`)

```typescript
import { QuotaService } from '@/lib/quota-service'

// Verificar se usuário pode fazer requisição
const quotaCheck = await QuotaService.checkQuota(userId, {
  provider: 'openai',
  model: 'gpt-4o-mini',
  promptTokens: 100,
  completionTokens: 50,
  totalTokens: 150,
  module: 'chat'
})

if (!quotaCheck.allowed) {
  // Usuário excedeu quota
  console.log(quotaCheck.message)
}

// Registrar uso após requisição
await QuotaService.recordUsage(userId, {
  provider: 'openai',
  model: 'gpt-4o-mini',
  promptTokens: 100,
  completionTokens: 50,
  totalTokens: 150,
  costUsd: 0.0003,
  module: 'chat',
  success: true
})
```

### Middleware para APIs (`lib/quota-middleware.ts`)

```typescript
import { withChatQuotaCheck } from '@/lib/quota-middleware'

export async function POST(request: NextRequest) {
  return withChatQuotaCheck(request, async (req: NextRequest) => {
    // Sua lógica de API aqui
    // O middleware já verificou a quota antes de chegar aqui
    return new Response('Resposta da API')
  })
}
```

### Hook para Frontend (`hooks/useQuota.ts`)

```typescript
import { useQuota } from '@/hooks/useQuota'

function MyComponent() {
  const { quotaStatus, canMakeRequest, makeRequest } = useQuota()
  
  const handleSendMessage = async () => {
    if (!canMakeRequest(100)) {
      alert('Quota insuficiente')
      return
    }
    
    try {
      const response = await makeRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' })
      }, 100)
      
      // Resposta processada
    } catch (error) {
      if (error.quotaExceeded) {
        alert('Limite de tokens excedido')
      }
    }
  }
  
  return (
    <div>
      {quotaStatus && (
        <div>
          Tokens usados: {quotaStatus.tokenUsed} / {quotaStatus.tokenLimit}
          ({quotaStatus.percentageUsed}%)
        </div>
      )}
    </div>
  )
}
```

## 🎛️ Painel Administrativo

### Acesso
- URL: `/admin/quotas`
- Permissão: ADMIN ou SUPER_ADMIN

### Funcionalidades

1. **Visualizar Estatísticas Gerais**
   - Total de usuários
   - Limite total de tokens
   - Uso total de tokens
   - Uso médio por usuário

2. **Gerenciar Usuários**
   - Lista dos usuários com maior uso
   - Resetar quota de usuário
   - Alterar limite de tokens
   - Visualizar uso por mês

3. **Filtros**
   - Selecionar mês específico
   - Atualizar dados em tempo real

### Componentes

- `app/(dashboard)/admin/quotas/page.tsx` - Página principal do painel
- `components/quota-status-card.tsx` - Card de status para usuários
- `components/quota-notification.tsx` - Notificações de quota

## 📊 APIs Disponíveis

### Para Usuários
- `GET /api/quota/status` - Obter status da quota do usuário atual

### Para Administradores
- `GET /api/quota/admin/stats` - Estatísticas gerais de quotas
- `POST /api/quota/admin/reset` - Resetar quota de usuário
- `PUT /api/quota/admin/limit` - Atualizar limite de quota

## 🔔 Notificações

### Tipos de Notificação

1. **Limite Mensal Excedido** (90%+)
   - Cor: Vermelho
   - Ação: Aguardar próximo mês

2. **Limite Diário Excedido**
   - Cor: Vermelho
   - Ação: Aguardar próximo dia

3. **Limite Horário Excedido**
   - Cor: Amarelo
   - Ação: Aguardar próxima hora

4. **Limite de Custo Excedido**
   - Cor: Vermelho
   - Ação: Contatar administrador

### Implementação

```typescript
import { QuotaNotification } from '@/components/quota-notification'

function ChatPage() {
  const [quotaError, setQuotaError] = useState(null)
  
  return (
    <div>
      {quotaError && (
        <QuotaNotification
          quotaExceeded={quotaError.quotaExceeded}
          dailyLimitExceeded={quotaError.dailyLimitExceeded}
          remainingTokens={quotaError.remainingTokens}
          message={quotaError.message}
          onDismiss={() => setQuotaError(null)}
        />
      )}
    </div>
  )
}
```

## 🔄 Integração com APIs Existentes

### APIs de Chat
Para integrar o sistema de quotas em APIs existentes:

1. **Importar o wrapper:**
```typescript
import { withQuotaWrapper } from '@/lib/quota-wrapper'
```

2. **Envolver a função POST:**
```typescript
export async function POST(request: NextRequest) {
  return withQuotaWrapper(request, async (req: NextRequest) => {
    // Sua lógica de API existente aqui
  }, {
    module: 'chat',
    apiEndpoint: '/api/chat/ai-sdk-fast'
  })
}
```

3. **Adicionar headers de uso:**
```typescript
// Na resposta da API
return new Response(responseBody, {
  headers: {
    'X-Provider': 'openai',
    'X-Model': 'gpt-4o-mini',
    'X-Tokens': '150',
    'X-Cost-USD': '0.0003',
    'X-Cost-BRL': '0.0015'
  }
})
```

## 📈 Monitoramento e Logs

### Logs de Uso
Todos os usos de tokens são registrados em `quota_usage_log` com:
- Timestamp exato
- Provider e modelo utilizados
- Tokens de entrada e saída
- Custo em USD e BRL
- Módulo utilizado
- Status de sucesso/erro

### Métricas Disponíveis
- Uso total por usuário/mês
- Uso por provider/modelo
- Custo total por usuário
- Taxa de sucesso das requisições
- Distribuição de uso por módulo

## 🛠️ Manutenção

### Resetar Quotas Mensalmente
```bash
# Script para resetar todas as quotas (executar no início do mês)
node scripts/reset-monthly-quotas.js
```

### Backup de Dados
```bash
# Backup das tabelas de quota
pg_dump -t quotas -t quota_usage_log -t quota_settings database_name > quota_backup.sql
```

### Limpeza de Logs Antigos
```sql
-- Remover logs de uso com mais de 1 ano
DELETE FROM quota_usage_log 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Usuário não consegue fazer requisições**
   - Verificar se quota existe para o mês atual
   - Verificar se quota está ativa
   - Verificar limites diários/horários

2. **Quotas não são criadas automaticamente**
   - Executar script de inicialização
   - Verificar configurações de role

3. **Uso não está sendo registrado**
   - Verificar se middleware está integrado
   - Verificar headers de resposta da API
   - Verificar logs de erro

### Logs de Debug
```typescript
// Habilitar logs detalhados
console.log('Quota check:', quotaCheck)
console.log('Usage recorded:', usage)
```

## 📝 Próximos Passos

1. **Integração com todas as APIs de IA**
2. **Dashboard de métricas avançadas**
3. **Alertas por email quando quota é excedida**
4. **Sistema de créditos adicionais**
5. **Relatórios de uso detalhados**
6. **API para terceiros consultarem quotas**

---

Para mais informações ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.
