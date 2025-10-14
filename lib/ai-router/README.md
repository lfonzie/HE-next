# Sistema de Roteamento Multi-Fornecedor de IA

## Visão Geral

Este sistema implementa um roteador inteligente que seleciona dinamicamente o melhor provedor de IA para cada requisição, preservando a funcionalidade atual do sistema enquanto introduz capacidades avançadas de otimização.

## Arquitetura

### Componentes Principais

1. **Provider Registry** (`provider-registry.ts`)
   - Catálogo centralizado de provedores de IA
   - Metadados de capacidades, custos e conformidade
   - Métricas de performance em tempo real

2. **Feature Extractor** (`feature-extractor.ts`)
   - Análise contextual de requisições
   - Detecção de idioma, complexidade e domínio
   - Extração de características para roteamento

3. **Model Router** (`model-router.ts`)
   - Algoritmo de seleção inteligente
   - Aprendizado online baseado em feedback
   - Otimização multi-objetiva (qualidade, velocidade, custo)

4. **Safety Layer** (`safety-layer.ts`)
   - Validação pré e pós-processamento
   - Conformidade LGPD e detecção de PII
   - Validação de JSON e qualidade de resposta

5. **AI Router** (`ai-router.ts`)
   - Orquestrador principal
   - Coordenação entre componentes
   - Gerenciamento de métricas e aprendizado

## Modos de Operação

### Modo Shadow (Observação)
- Analisa requisições sem impactar respostas
- Coleta telemetria comparativa
- Grok 4 Fast continua sendo usado para todas as respostas

### Modo Canário (Teste Parcial)
- Roteia 1-5% das requisições para modelos alternativos
- Monitoramento em tempo real
- Rollback automático em caso de problemas

### Modo AUTO (Operação Completa)
- Roteamento inteligente para todas as requisições
- Otimização contínua baseada em aprendizado
- Grok 4 Fast como fallback de segurança

## Configuração

### Provedores (`config/providers.yml`)
```yaml
providers:
  grok:
    id: "xai-grok-4-fast"
    enabled: true
    capabilities:
      supportsJsonStrict: true
      supportsToolUse: true
      maxContextTokens: 128000
    # ... outras configurações
```

### Roteamento (`config/routing.json`)
```json
{
  "mode": "shadow",
  "canaryPercentage": 5,
  "weights": {
    "quality": 0.4,
    "speed": 0.3,
    "cost": 0.2,
    "reliability": 0.1
  }
}
```

### Segurança (`config/safety.json`)
```json
{
  "piiDetection": {
    "enabled": true,
    "patterns": [
      {
        "name": "CPF",
        "pattern": "\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b",
        "severity": "high",
        "action": "mask"
      }
    ]
  }
}
```

## Uso

### Teste Básico
```typescript
import { aiRouter } from '@/lib/ai-router';

const result = await aiRouter.route(
  'Crie uma aula sobre fotossíntese',
  { module: 'aula_interativa' },
  { userType: 'teacher' }
);
```

### Configuração de Modo
```typescript
// Habilitar modo shadow
aiRouter.setMode('shadow');

// Configurar percentual canário
aiRouter.setCanaryPercentage(10);

// Habilitar roteamento
aiRouter.enable();
```

### Monitoramento
```typescript
// Obter métricas
const metrics = aiRouter.getMetrics();

// Verificar saúde dos provedores
const health = aiRouter.getProviderHealth();

// Estatísticas de aprendizado
const learning = aiRouter.getLearningStats();
```

## API de Teste

### Endpoint de Teste
```
POST /api/ai-router/test
```

**Exemplo de requisição:**
```json
{
  "text": "Crie uma aula sobre fotossíntese",
  "context": { "module": "aula_interativa" },
  "userProfile": { "userType": "teacher" },
  "mode": "shadow",
  "canaryPercentage": 5
}
```

### Endpoints de Monitoramento
```
GET /api/ai-router/test?action=status    # Status do roteador
GET /api/ai-router/test?action=metrics   # Métricas de performance
GET /api/ai-router/test?action=config    # Configuração atual
GET /api/ai-router/test?action=enable    # Habilitar roteador
GET /api/ai-router/test?action=disable    # Desabilitar roteador
```

## Estratégias por Módulo

### Aula Interativa
- Prioriza modelos com suporte a JSON estrito
- Validação rigorosa de estrutura de slides
- Otimização para consistência pedagógica

### ENEM
- Foco em precisão factual
- Validação cruzada com gabaritos
- Penalização severa por alucinações

### TI/Debug
- Prioriza velocidade de resposta
- Suporte a tool-use para linting
- Streaming para responsividade

## Conformidade e Segurança

### LGPD
- Detecção automática de PII
- Mascaramento de dados sensíveis
- Controle de residência de dados

### Validação de Conteúdo
- Filtros de tópicos sensíveis
- Validação de qualidade de resposta
- Detecção de conteúdo inadequado

### Auditoria
- Logs imutáveis de decisões
- Rastreamento completo de fluxo
- Métricas de conformidade

## Métricas e Observabilidade

### Métricas Técnicas
- Latência por percentil (P50, P95, P99)
- Taxa de sucesso por provedor
- Custos por token e por tarefa

### Métricas de Qualidade
- Validade de JSON por módulo
- Aderência temática via embeddings
- Satisfação do usuário

### Métricas Pedagógicas
- Eficácia de aprendizagem
- Taxa de conclusão de aulas
- Precisão em avaliações

## Implementação Gradual

### Fase 1: Preparação (Semanas 1-2)
- [x] Implementação da estrutura base
- [x] Configuração de provedores
- [x] Sistema de telemetria

### Fase 2: Modo Shadow (Semanas 3-4)
- [x] Coleta de métricas comparativas
- [x] Validação de algoritmos
- [x] Análise de performance

### Fase 3: Modo Canário (Semanas 5-6)
- [ ] Roteamento parcial (1-5%)
- [ ] Sistema de rollback
- [ ] Monitoramento em tempo real

### Fase 4: Modo AUTO (Semanas 7-8)
- [ ] Roteamento completo
- [ ] Aprendizado online
- [ ] Otimização contínua

## Troubleshooting

### Problemas Comuns

1. **Provedor não disponível**
   - Verificar configuração de API keys
   - Checar limites de rate limiting
   - Validar conectividade de rede

2. **JSON inválido**
   - Verificar schema de validação
   - Ajustar parâmetros de temperatura
   - Considerar provedor alternativo

3. **Latência alta**
   - Verificar saúde dos provedores
   - Ajustar pesos de roteamento
   - Considerar provedores mais rápidos

### Logs e Debug
```typescript
// Habilitar logs detalhados
process.env.AI_ROUTER_DEBUG = 'true';

// Verificar métricas de provedor
const metrics = providerRegistry.getProviderMetrics('xai-grok-4-fast');
console.log('Provider metrics:', metrics);
```

## Contribuição

### Adicionando Novo Provedor
1. Atualizar `config/providers.yml`
2. Implementar adapter específico
3. Adicionar testes de integração
4. Documentar capacidades e limitações

### Modificando Algoritmo de Roteamento
1. Atualizar `model-router.ts`
2. Ajustar pesos em `config/routing.json`
3. Validar com testes A/B
4. Monitorar métricas de performance

## Licença

Este sistema é parte do projeto HubEdu e segue as mesmas diretrizes de licenciamento.
