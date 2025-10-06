# 🎯 HIERARQUIA AJUSTADA: GROK > OPENAI > GOOGLE

## ✅ **MUDANÇAS IMPLEMENTADAS**

### 🔄 **Nova Hierarquia de Provedores:**

1. **🥇 Grok 4 Fast** (Prioridade 0) - `grok-4-fast-reasoning`
2. **🥈 OpenAI** (Prioridade 1) - `gpt-4o-mini`
3. **🥉 Google Gemini** (Prioridade 2) - `gemini-2.0-flash-exp`
4. **🔍 Perplexity** (Prioridade 3) - `sonar` - **APENAS para busca na web**

### 📊 **Configurações Atualizadas:**

#### **AI Providers (`lib/ai-providers.ts`):**
```typescript
export const AI_PROVIDERS = {
  grok: {
    priority: 0,        // 🥇 Primeiro
    timeout: 15000,     // 15 segundos
    description: 'Grok 4 Fast Reasoning - Ultra-rápido e eficiente'
  },
  openai: {
    priority: 1,        // 🥈 Segundo
    timeout: 30000,     // 30 segundos
    description: 'OpenAI GPT-4o Mini - Alta qualidade e confiabilidade'
  },
  google: {
    priority: 2,        // 🥉 Terceiro
    timeout: 60000,     // 1 minuto
    description: 'Google Gemini 2.0 Flash - Rápido e eficiente'
  },
  perplexity: {
    priority: 3,        // 🔍 Especializado
    timeout: 120000,     // 2 minutos
    description: 'Perplexity Sonar - Para busca na web em tempo real'
  }
}
```

#### **AI Model Router (`lib/ai-model-router.ts`):**
```typescript
export const USE_CASE_ROUTING = {
  chat: {
    preferred: ['grok', 'openai', 'google'],        // ✅ Nova ordem
    description: 'Conversação geral e atendimento'
  },
  education: {
    preferred: ['grok', 'openai', 'google'],        // ✅ Nova ordem
    description: 'Conteúdo educacional e explicações'
  },
  analysis: {
    preferred: ['grok', 'openai', 'google'],        // ✅ Nova ordem
    description: 'Análise de dados e raciocínio complexo'
  },
  creative: {
    preferred: ['grok', 'openai', 'google'],        // ✅ Nova ordem
    description: 'Conteúdo criativo e inovador'
  },
  technical: {
    preferred: ['grok', 'openai', 'google'],        // ✅ Nova ordem
    description: 'Suporte técnico e resolução de problemas'
  },
  research: {
    preferred: ['grok', 'openai', 'google'],        // ✅ Nova ordem
    description: 'Pesquisa e síntese de informações'
  },
  web_search: {
    preferred: ['perplexity'],                       // 🔍 Especializado
    description: 'Busca na web em tempo real'
  }
}
```

#### **Chat Providers (`lib/chat-providers-config.ts`):**
```typescript
export const CHAT_PROVIDERS = {
  grok: {
    priority: 0,        // 🥇 Primeiro
    description: 'Grok 4 Fast Reasoning - Ultra-rápido e eficiente',
    useCase: 'ENEM, Redação, conversas rápidas, raciocínio avançado'
  },
  openai: {
    priority: 1,        // 🥈 Segundo
    description: 'OpenAI GPT - Alta qualidade para tarefas complexas',
    useCase: 'Tarefas complexas, análise detalhada, ENEM'
  },
  google: {
    priority: 2,        // 🥉 Terceiro
    description: 'Google Gemini - Rápido e eficiente para conversas',
    useCase: 'Conversas gerais, aulas, explicações'
  },
  perplexity: {
    priority: 3,        // 🔍 Especializado
    description: 'Perplexity Sonar - Para busca na web em tempo real',
    useCase: 'Busca na web, informações atualizadas, pesquisa em tempo real'
  }
}
```

## 🎯 **Casos de Uso Específicos:**

### **📝 Processamento Geral:**
1. **Grok 4 Fast** → Correção de português, extração de tema, tradução
2. **OpenAI** → Fallback para análise complexa
3. **Google Gemini** → Fallback final

### **💬 Chat e Conversação:**
1. **Grok 4 Fast** → Respostas rápidas e precisas
2. **OpenAI** → Análise detalhada e complexa
3. **Google Gemini** → Conversas gerais

### **🎓 Educação:**
1. **Grok 4 Fast** → Explicações rápidas e claras
2. **OpenAI** → Conteúdo educacional complexo
3. **Google Gemini** → Aulas e explicações gerais

### **🔍 Busca na Web:**
1. **Perplexity** → **EXCLUSIVO** para buscas em tempo real
2. **Não usa** outros provedores para este caso

## 🚀 **Benefícios da Nova Hierarquia:**

### **⚡ Performance:**
- **Grok 4 Fast**: Máxima velocidade (15s timeout)
- **OpenAI**: Alta qualidade com velocidade moderada (30s timeout)
- **Google Gemini**: Confiabilidade com velocidade adequada (60s timeout)

### **🎯 Especialização:**
- **Grok**: Raciocínio rápido e eficiente
- **OpenAI**: Análise complexa e detalhada
- **Google**: Conversas gerais e educacionais
- **Perplexity**: **APENAS** busca na web em tempo real

### **💰 Custo Otimizado:**
- **Grok**: Custo baixo, velocidade máxima
- **OpenAI**: Custo médio, qualidade alta
- **Google**: Custo baixo, confiabilidade alta
- **Perplexity**: Custo alto, **usado apenas quando necessário**

### **🔄 Fallback Inteligente:**
- **Sequência**: Grok → OpenAI → Google
- **Especialização**: Perplexity apenas para web search
- **Recuperação**: Automática em caso de falha

## 📋 **Resumo Final:**

### **🎯 Nova Tabela de Prioridades:**

| **Prioridade** | **Provedor** | **Modelo** | **Uso Principal** | **Timeout** |
|----------------|--------------|------------|-------------------|-------------|
| **0** | **Grok** | `grok-4-fast-reasoning` | Processamento geral, chat, educação | 15s |
| **1** | **OpenAI** | `gpt-4o-mini` | Análise complexa, tarefas detalhadas | 30s |
| **2** | **Google** | `gemini-2.0-flash-exp` | Conversas gerais, aulas | 60s |
| **3** | **Perplexity** | `sonar` | **APENAS busca na web** | 120s |

### **🔄 Fluxo de Fallback:**
```
Grok 4 Fast (15s) → OpenAI (30s) → Google Gemini (60s)
                    ↓
              Perplexity (120s) - APENAS para web search
```

### **✅ Casos de Uso Atualizados:**
- **Chat**: Grok → OpenAI → Google
- **Educação**: Grok → OpenAI → Google
- **Análise**: Grok → OpenAI → Google
- **Criativo**: Grok → OpenAI → Google
- **Técnico**: Grok → OpenAI → Google
- **Pesquisa**: Grok → OpenAI → Google
- **Web Search**: **APENAS Perplexity**

---

**🎉 HIERARQUIA AJUSTADA: GROK > OPENAI > GOOGLE, COM PERPLEXITY EXCLUSIVO PARA BUSCA NA WEB!**
