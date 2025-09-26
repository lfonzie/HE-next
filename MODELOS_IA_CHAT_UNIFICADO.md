# 🤖 Modelos de IA do Chat Unificado

## 📋 Provedores Suportados

O chat unificado suporta **3 provedores principais**:

### 1. **OpenAI** 🟢
- **Provedor**: `openai`
- **Modelo padrão**: `gpt-4o-mini`
- **Modelos disponíveis**:
  - `gpt-4o` (mais avançado)
  - `gpt-4o-mini` (padrão, mais rápido e econômico)
  - `gpt-4-turbo`
  - `gpt-3.5-turbo`
  - `gpt-4`
  - `gpt-3.5-turbo-16k`

### 2. **Google Gemini** 🟡
- **Provedor**: `gemini`
- **Modelo padrão**: `gemini-pro`
- **Modelos disponíveis**:
  - `gemini-pro` (padrão)
  - `gemini-pro-vision` (com visão)
  - `gemini-1.5-pro`
  - `gemini-1.5-flash`

### 3. **Groq** 🔵
- **Provedor**: `groq`
- **Modelo padrão**: `llama3-8b-8192`
- **Modelos disponíveis**:
  - `llama3-8b-8192` (padrão)
  - `llama3-70b-8192` (mais avançado)
  - `mixtral-8x7b-32768`
  - `gemma2-9b-it`
  - `gemma2-27b-it`

## 🎯 Configuração Atual

### **Interface Principal** (`/chat`)
- **Provedor padrão**: OpenAI
- **Modelo padrão**: `gpt-4o-mini`
- **Streaming**: Habilitado por padrão

### **Interface de Teste** (`/test-unified-chat`)
- **Provedor padrão**: OpenAI
- **Modelo padrão**: `gpt-4o-mini`
- **Controles**: Dropdown para trocar provedor e campo livre para modelo

## 🔧 Como Usar

### **1. Via Interface Web**
```typescript
// Selecionar provedor
<select value={provider} onChange={e => setProvider(e.target.value)}>
  <option value="openai">OpenAI</option>
  <option value="gemini">Gemini</option>
  <option value="groq">Groq</option>
</select>

// Definir modelo
<input 
  value={model} 
  onChange={e => setModel(e.target.value)}
  placeholder="Modelo (ex: gpt-4o-mini)"
/>
```

### **2. Via API**
```typescript
// POST /api/chat/unified
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "input": "Olá, como você está?",
  "system": "Você é um assistente útil.",
  "conversationId": "uuid-opcional"
}
```

## 📊 Comparação de Modelos

| Provedor | Modelo | Velocidade | Qualidade | Custo | Uso Recomendado |
|----------|--------|------------|-----------|-------|-----------------|
| OpenAI | gpt-4o-mini | ⚡⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | Uso geral, rápido |
| OpenAI | gpt-4o | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Tarefas complexas |
| Gemini | gemini-pro | ⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | Análise de texto |
| Groq | llama3-8b | ⚡⚡⚡⚡ | ⭐⭐⭐ | 💰 | Respostas rápidas |
| Groq | llama3-70b | ⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | Tarefas médias |

## 🚀 Exemplos de Uso

### **OpenAI - GPT-4o Mini**
```bash
curl -X POST http://localhost:3000/api/chat/unified \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "input": "Explique equações do 2º grau"
  }'
```

### **Gemini - Pro**
```bash
curl -X POST http://localhost:3000/api/chat/unified \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "model": "gemini-pro",
    "input": "Analise este texto em português"
  }'
```

### **Groq - Llama3**
```bash
curl -X POST http://localhost:3000/api/chat/unified \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "groq",
    "model": "llama3-8b-8192",
    "input": "Resposta rápida sobre matemática"
  }'
```

## 🔑 Variáveis de Ambiente Necessárias

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Google Gemini
GEMINI_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...
```

## 📈 Performance

- **OpenAI**: Mais estável, melhor qualidade
- **Gemini**: Bom para análise, suporte a visão
- **Groq**: Mais rápido, ideal para respostas instantâneas

## 🎯 Recomendações

1. **Uso geral**: `gpt-4o-mini` (OpenAI)
2. **Tarefas complexas**: `gpt-4o` (OpenAI)
3. **Análise de texto**: `gemini-pro` (Google)
4. **Respostas rápidas**: `llama3-8b-8192` (Groq)
5. **Orçamento limitado**: `gpt-3.5-turbo` (OpenAI)

**O sistema permite trocar entre provedores e modelos dinamicamente!** 🚀
