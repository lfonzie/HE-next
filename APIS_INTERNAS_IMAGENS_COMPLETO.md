# 🖼️ APIs INTERNAS DE IMAGENS - SISTEMA COMPLETO

## 🎯 **VISÃO GERAL**

As APIs internas de imagens foram criadas para integrar `/teste-imggen` e `/teste-imagens` ao sistema principal, permitindo:

- **Geração de aulas**: 6 imagens automáticas por aula
- **Chat contextual**: Imagens explicativas baseadas no tema
- **Busca inteligente**: Múltiplos provedores com fallback
- **Geração automática**: IA decide a melhor estratégia

## 📋 **APIS CRIADAS**

### **1. API de Geração de Imagens**
- **Endpoint**: `/api/internal/images/generate`
- **Função**: Gerar imagens puras baseadas em tema
- **IA**: Grok 4 Fast para processamento + Gemini 2.5 Flash para geração

### **2. API de Busca de Imagens**
- **Endpoint**: `/api/internal/images/search`
- **Função**: Buscar imagens existentes por tema
- **Provedores**: Unsplash, Pixabay, Pexels

### **3. API Unificada de Imagens**
- **Endpoint**: `/api/internal/images/unified`
- **Função**: Buscar primeiro, gerar se necessário
- **Estratégias**: search_first, generate_first, hybrid

### **4. API de Aulas com Imagens**
- **Endpoint**: `/api/internal/lessons/with-images`
- **Função**: Gerar aulas com 6 imagens automáticas
- **Slides**: [1, 3, 6, 8, 11, 14] com imagens

### **5. API de Chat Contextual**
- **Endpoint**: `/api/internal/chat/contextual`
- **Função**: Chat com imagens explicativas automáticas
- **Detecção**: Automática de necessidade visual

## 🚀 **COMO USAR**

### **1. Geração de Imagens para Aulas**

```typescript
// Exemplo: Gerar 6 imagens para aula de fotossíntese
const response = await fetch('/api/internal/images/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'fotossíntese',
    count: 6,
    context: 'aula_biologia'
  })
});

const result = await response.json();
// result.images[] - Array com 6 imagens geradas
// result.aiStrategy - Estratégia escolhida pela IA
// result.aiProcessing - Processamento com Grok 4 Fast
```

### **2. Busca de Imagens Existentes**

```typescript
// Exemplo: Buscar imagens de sistema solar
const response = await fetch('/api/internal/images/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'sistema solar',
    count: 6,
    filters: { type: 'photo', style: 'educational' }
  })
});

const result = await response.json();
// result.images[] - Array com imagens encontradas
// result.found - Quantas imagens foram encontradas
// result.searchStrategy - Estratégia de busca usada
```

### **3. API Unificada (Recomendada)**

```typescript
// Exemplo: Buscar primeiro, gerar se necessário
const response = await fetch('/api/internal/images/unified', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'revolução francesa',
    count: 6,
    context: 'aula_historia',
    strategy: 'search_first' // ou 'generate_first', 'hybrid'
  })
});

const result = await response.json();
// result.images[] - Array com imagens (busca + geração)
// result.searchResults - Resultados da busca
// result.generationResults - Resultados da geração
```

### **4. Geração de Aula Completa**

```typescript
// Exemplo: Gerar aula completa com imagens
const response = await fetch('/api/internal/lessons/with-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'fotossíntese',
    subject: 'biologia',
    level: 'ensino_medio',
    duration: 45,
    slides: [1, 3, 6, 8, 11, 14], // Slides com imagens
    imageStrategy: 'search_first'
  })
});

const result = await response.json();
// result.lesson.slides[] - Slides da aula
// result.images.bySlide - Imagens por slide
// result.images.total - Total de imagens geradas
```

### **5. Chat Contextual com Imagens**

```typescript
// Exemplo: Chat que detecta necessidade de imagem
const response = await fetch('/api/internal/chat/contextual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Como funciona a fotossíntese?',
    context: 'educacional',
    imageStrategy: 'search_first'
  })
});

const result = await response.json();
// result.response.text - Resposta textual
// result.response.image - Imagem contextual (se aplicável)
// result.visualContext - Contexto visual detectado
```

## 🎯 **CASOS DE USO ESPECÍFICOS**

### **📚 Para Aulas:**

#### **Biologia:**
```typescript
{
  topic: 'fotossíntese',
  context: 'aula_biologia',
  count: 6
}
// IA gera: Diagramas do processo, estruturas das folhas, ciclo do carbono
```

#### **História:**
```typescript
{
  topic: 'revolução francesa',
  context: 'aula_historia',
  count: 6
}
// IA gera: Linha do tempo, mapas, personagens históricos, eventos
```

#### **Geografia:**
```typescript
{
  topic: 'sistema solar',
  context: 'aula_geografia',
  count: 6
}
// IA gera: Diagramas dos planetas, órbitas, comparações de tamanho
```

### **💬 Para Chat:**

#### **Perguntas que Geram Imagens:**
- "Como funciona a fotossíntese?" → Diagrama do processo
- "Qual a estrutura do DNA?" → Diagrama molecular
- "Como é o sistema solar?" → Ilustração dos planetas
- "O que foi a revolução francesa?" → Linha do tempo visual

#### **Perguntas que NÃO Geram Imagens:**
- "Qual sua opinião sobre isso?"
- "Me ajude com matemática"
- "Explique este conceito abstrato"

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente Necessárias:**

```bash
# Para geração de imagens
GEMINI_API_KEY=your_gemini_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key

# Para busca de imagens
UNSPLASH_ACCESS_KEY=your_unsplash_key
PIXABAY_API_KEY=your_pixabay_key
PEXELS_API_KEY=your_pexels_key

# Para processamento com IA
GROK_API_KEY=your_grok_key
```

### **Estratégias Disponíveis:**

1. **search_first**: Busca primeiro, gera se necessário
2. **generate_first**: Gera primeiro, busca se necessário  
3. **hybrid**: Busca e gera em paralelo

### **Contextos Suportados:**

- `aula_educacional` - Aulas gerais
- `aula_biologia` - Aulas de biologia
- `aula_historia` - Aulas de história
- `aula_geografia` - Aulas de geografia
- `chat_contextual` - Chat com contexto visual

## 📊 **FLUXO DE INTEGRAÇÃO**

### **1. Geração de Aula:**
```
Aula Request → API Unificada → Busca Imagens → Gera Faltantes → Distribui por Slides
```

### **2. Chat Contextual:**
```
Chat Message → Detecta Visual → Extrai Tópico → API Unificada → 1 Imagem Contextual
```

### **3. Fallback Inteligente:**
```
Busca Imagens → Se < 6 → Gera Faltantes → Se Falha → Placeholder SVG
```

## 🎉 **BENEFÍCIOS**

### **🎓 Para Aulas:**
- **6 imagens automáticas** por aula
- **Contexto específico** por matéria
- **Qualidade consistente** educacional
- **Velocidade otimizada** com IA

### **💬 Para Chat:**
- **Detecção automática** de necessidade visual
- **Imagens explicativas** contextuais
- **Melhor compreensão** visual
- **Engajamento aumentado**

### **🔧 Para Sistema:**
- **APIs internas** não expostas
- **Reutilização** de código
- **Manutenção centralizada**
- **Performance otimizada**

## 🚀 **PRÓXIMOS PASSOS**

1. **Testar APIs** com diferentes temas
2. **Integrar com sistema de aulas** existente
3. **Integrar com chat** existente
4. **Otimizar performance** para produção
5. **Adicionar cache** para imagens frequentes

---

**🖼️ SISTEMA COMPLETO DE APIS INTERNAS DE IMAGENS PRONTO PARA INTEGRAÇÃO!**
