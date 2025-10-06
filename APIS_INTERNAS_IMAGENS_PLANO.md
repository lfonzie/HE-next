# 🖼️ APIs INTERNAS DE IMAGENS - INTEGRAÇÃO COM SISTEMA

## 🎯 **OBJETIVO**
Transformar `/teste-imggen` e `/teste-imagens` em APIs internas para:
- **Geração de aulas**: Buscar/criar 6 imagens necessárias
- **Chat contextual**: Gerar imagens para contexto específico (ex: fotossíntese)

## 📋 **ESTRUTURA PROPOSTA**

### **1. API Interna de Geração de Imagens**
- **Endpoint**: `/api/internal/images/generate`
- **Função**: Gerar imagens puras baseadas em tema
- **Integração**: Usado por aulas e chat

### **2. API Interna de Busca de Imagens**
- **Endpoint**: `/api/internal/images/search`
- **Função**: Buscar imagens existentes por tema
- **Integração**: Usado por aulas e chat

### **3. API Unificada de Imagens**
- **Endpoint**: `/api/internal/images/unified`
- **Função**: Buscar primeiro, gerar se necessário
- **Integração**: Principal para aulas e chat

## 🔧 **IMPLEMENTAÇÃO**

### **API de Geração (`/api/internal/images/generate`)**
```typescript
POST /api/internal/images/generate
{
  "topic": "fotossíntese",
  "count": 6,
  "context": "aula_biologia",
  "style": "educational"
}

Response:
{
  "success": true,
  "images": [
    {
      "id": "img_1",
      "url": "data:image/png;base64...",
      "type": "diagram",
      "style": "educational",
      "context": "fotossíntese"
    }
  ],
  "processingTime": 15000,
  "aiStrategy": {
    "type": "diagram",
    "style": "educational",
    "reasoning": "Tema científico detectado"
  }
}
```

### **API de Busca (`/api/internal/images/search`)**
```typescript
POST /api/internal/images/search
{
  "topic": "fotossíntese",
  "count": 6,
  "filters": {
    "type": "diagram",
    "style": "educational"
  }
}

Response:
{
  "success": true,
  "images": [...],
  "found": 4,
  "generated": 2
}
```

### **API Unificada (`/api/internal/images/unified`)**
```typescript
POST /api/internal/images/unified
{
  "topic": "fotossíntese",
  "count": 6,
  "context": "aula_biologia",
  "fallback": true
}

Response:
{
  "success": true,
  "images": [...],
  "strategy": "search_first_generate_fallback",
  "processingTime": 12000
}
```

## 🎓 **INTEGRAÇÃO COM AULAS**

### **Geração de Aula com Imagens**
```typescript
// Em /api/aulas/generate-with-images
const imageRequest = {
  topic: lessonTopic,
  count: 6,
  context: 'aula_educacional',
  slides: [1, 3, 6, 8, 11, 14] // Slides que precisam de imagens
};

const images = await fetch('/api/internal/images/unified', {
  method: 'POST',
  body: JSON.stringify(imageRequest)
});
```

### **Slides com Imagens Automáticas**
- **Slide 1**: Introdução com imagem conceitual
- **Slide 3**: Conceito principal com diagrama
- **Slide 6**: Processo com fluxograma
- **Slide 8**: Exemplo com ilustração
- **Slide 11**: Aplicação com gráfico
- **Slide 14**: Conclusão com resumo visual

## 💬 **INTEGRAÇÃO COM CHAT**

### **Chat Contextual com Imagens**
```typescript
// Em /api/chat/contextual
if (needsVisualContext(query)) {
  const imageRequest = {
    topic: extractTopic(query),
    count: 1,
    context: 'chat_contextual',
    style: 'educational'
  };
  
  const image = await fetch('/api/internal/images/generate', {
    method: 'POST',
    body: JSON.stringify(imageRequest)
  });
  
  // Adicionar imagem ao contexto do chat
  context.images.push(image);
}
```

### **Exemplos de Contexto Visual**
- **"Como funciona a fotossíntese"** → Diagrama do ciclo
- **"Sistema solar"** → Ilustração dos planetas
- **"Revolução francesa"** → Linha do tempo visual
- **"Estrutura do DNA"** → Diagrama molecular

## 🚀 **BENEFÍCIOS**

### **🎓 Para Aulas:**
- **Imagens automáticas**: 6 imagens por aula
- **Contexto específico**: Imagens relevantes ao tema
- **Qualidade consistente**: Padrão educacional
- **Velocidade**: Geração otimizada

### **💬 Para Chat:**
- **Contexto visual**: Imagens explicativas
- **Compreensão**: Melhor entendimento visual
- **Engajamento**: Conteúdo mais rico
- **Precisão**: Imagens específicas ao tema

### **🔧 Para Sistema:**
- **APIs internas**: Não expostas externamente
- **Reutilização**: Mesmo código para aulas e chat
- **Manutenção**: Centralizada
- **Performance**: Otimizada para uso interno

## 📊 **FLUXO DE INTEGRAÇÃO**

### **1. Geração de Aula:**
```
Aula Request → API Unificada → Busca Imagens → Gera Faltantes → Retorna 6 Imagens
```

### **2. Chat Contextual:**
```
Chat Query → Detecta Necessidade Visual → API Geração → 1 Imagem Contextual
```

### **3. Fallback Inteligente:**
```
Busca Imagens → Se < 6 → Gera Faltantes → Se Falha → Placeholder
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Criar APIs internas** baseadas em `/teste-imggen` e `/teste-imagens`
2. **Integrar com geração de aulas** para 6 imagens automáticas
3. **Integrar com chat** para contexto visual
4. **Testar fluxo completo** de aulas e chat
5. **Otimizar performance** para uso interno

---

**🖼️ APIs INTERNAS DE IMAGENS PRONTAS PARA INTEGRAÇÃO COM AULAS E CHAT!**
