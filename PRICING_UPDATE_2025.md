# 💰 Preços Atualizados das APIs de IA - Setembro 2025

## 📊 Resumo dos Novos Preços

Baseado nas informações oficiais das APIs da OpenAI e Google em setembro de 2025, os preços foram significativamente atualizados:

### 🤖 OpenAI (Modelos Utilizados)

| Modelo | Entrada (por 1M tokens) | Saída (por 1M tokens) | Contexto | Uso |
|--------|-------------------------|----------------------|----------|-----|
| **GPT-5** | $1.25 | $10.00 | 400K tokens | Modelo principal |
| **GPT-4o Mini** | $0.15 | $0.60 | 128K tokens | Modelo econômico |

### 🔍 Google (Modelo Utilizado)

| Modelo | Entrada (por 1M tokens) | Saída (por 1M tokens) | Contexto | Uso |
|--------|-------------------------|----------------------|----------|-----|
| **Gemini 1.5 Flash** | $0.075 | $0.30 | 1M tokens | Modelo mais econômico |

### 🔍 Perplexity (API Utilizada)

| Modelo | Entrada (por 1M tokens) | Saída (por 1M tokens) | Contexto | Uso |
|--------|-------------------------|----------------------|----------|-----|
| **Sonar** | $1.00 | $1.00 | 128K tokens | API de busca com IA |

## 📈 Impacto nos Custos

### Comparação de Custos (Exemplo: 1000 tokens entrada + 500 tokens saída)

| Modelo | Custo USD | Custo BRL (USD 5.20) | Recomendação |
|--------|-----------|----------------------|--------------|
| **GPT-5** | $0.00525 | R$ 0.027 | Tarefas complexas |
| **GPT-4o Mini** | $0.00045 | R$ 0.0023 | Tarefas simples |
| **Gemini 1.5 Flash** | $0.000225 | R$ 0.0012 | Tarefas rápidas |
| **Perplexity Sonar** | $0.00150 | R$ 0.0078 | Buscas com IA |

## 🔄 Quotas Atualizadas

Devido ao aumento significativo dos preços, as quotas foram ajustadas:

### 📋 Novas Configurações por Role

| Role | Limite Mensal | Limite Diário | Limite Horário | Custo USD | Custo BRL |
|------|---------------|---------------|----------------|-----------|-----------|
| **STUDENT** | 500,000 | 20,000 | 2,000 | $0.28 | R$ 1.48 |
| **TEACHER** | 1,000,000 | 40,000 | 4,000 | $0.57 | R$ 2.96 |
| **STAFF** | 1,000,000 | 40,000 | 4,000 | $0.57 | R$ 2.96 |
| **ADMIN** | 2,000,000 | 80,000 | 8,000 | $1.14 | R$ 5.92 |
| **SUPER_ADMIN** | 5,000,000 | 200,000 | 20,000 | $2.85 | R$ 14.80 |

### 📊 Comparação com Valores Anteriores

| Role | Tokens Antes | Tokens Agora | Aumento | Custo Antes | Custo Agora | Status |
|------|--------------|--------------|---------|-------------|-------------|--------|
| **STUDENT** | 100,000 | 500,000 | +400% | $0.06 | $0.28 | ✅ Atualizado |
| **TEACHER** | 500,000 | 1,000,000 | +100% | $0.28 | $0.57 | ✅ Atualizado |
| **STAFF** | 200,000 | 1,000,000 | +400% | $0.11 | $0.57 | ✅ Atualizado |
| **ADMIN** | 1,000,000 | 2,000,000 | +100% | $0.57 | $1.14 | ✅ Atualizado |
| **SUPER_ADMIN** | 2,000,000 | 5,000,000 | +150% | $1.14 | $2.85 | ✅ Atualizado |

## 🎯 Recomendações de Uso

### 💡 Para Otimizar Custos

1. **Use Gemini 1.5 Flash** para tarefas simples e rápidas (mais econômico)
2. **Use GPT-4o Mini** para tarefas que precisam de qualidade mas com custo controlado
3. **Use Perplexity Sonar** para buscas e pesquisas com IA
4. **Use GPT-5** apenas para tarefas críticas que precisam da máxima qualidade
5. **Priorize Gemini Flash** sempre que possível para reduzir custos

### 📊 Monitoramento de Custos

- **Alunos**: Limite de $0.28/mês permite ~9,500 requisições GPT-5, ~111,000 GPT-4o Mini, ~220,000 Gemini Flash ou ~33,000 Perplexity Sonar
- **Professores**: Limite de $0.57/mês permite ~19,000 requisições GPT-5, ~222,000 GPT-4o Mini, ~440,000 Gemini Flash ou ~67,000 Perplexity Sonar
- **Admins**: Limite de $1.14/mês permite ~38,000 requisições GPT-5, ~444,000 GPT-4o Mini, ~880,000 Gemini Flash ou ~133,000 Perplexity Sonar
- **Super Admins**: Limite de $2.85/mês permite ~95,000 requisições GPT-5, ~1,111,000 GPT-4o Mini, ~2,200,000 Gemini Flash ou ~333,000 Perplexity Sonar

## 🔧 Implementação Técnica

### Arquivo de Configuração
```typescript
// lib/model-pricing.ts
export const MODEL_PRICING: ModelPricing[] = [
  {
    provider: 'openai',
    model: 'gpt-5',
    inputCostPerMillionTokens: 1.25,
    outputCostPerMillionTokens: 10.00,
    contextWindow: 400000
  },
  // ... outros modelos
]
```

### Cálculo Automático de Custos
```typescript
import { calculateCost } from '@/lib/model-pricing'

const cost = calculateCost('openai', 'gpt-5', 1000, 500)
// Retorna: { costUsd: 0.00525, costBrl: 0.027 }
```

## 📝 Atualizações Necessárias

### 1. Executar Script de Atualização
```bash
node scripts/initialize-quotas.js
```

### 2. Verificar Configurações
- Acessar `/admin/quotas`
- Verificar se os novos limites foram aplicados
- Monitorar uso de custos

### 3. Notificar Usuários
- Enviar comunicado sobre aumento de quotas
- Explicar os novos limites de custo
- Orientar sobre otimização de uso

## ⚠️ Considerações Importantes

1. **Taxa de Câmbio**: USD/BRL = 5.20 (setembro 2025)
2. **Preços Sujeitos a Mudança**: Verificar periodicamente
3. **Modelos Beta**: Alguns modelos podem ter preços diferentes
4. **Descontos por Volume**: Empresas grandes podem ter preços especiais

## 📞 Suporte

Para dúvidas sobre preços ou configurações:
- Consultar documentação oficial das APIs
- Verificar painel administrativo
- Contatar equipe de desenvolvimento

---

**Última atualização**: Setembro 2025  
**Próxima revisão**: Outubro 2025
