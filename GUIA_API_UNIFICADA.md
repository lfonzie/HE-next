# 🚀 API UNIFICADA - GUIA PRÁTICO DE USO

## 🎯 **API UNIFICADA: `/api/internal/images/unified`**

A API Unificada é a **mais recomendada** porque combina busca e geração de forma inteligente, oferecendo 3 estratégias diferentes.

## 📋 **ENDPOINT:**

```
POST /api/internal/images/unified
```

## 🔧 **PARÂMETROS:**

```typescript
{
  topic: string,           // OBRIGATÓRIO - Tema da imagem
  count?: number,          // OPCIONAL - Quantidade (padrão: 6)
  context?: string,        // OPCIONAL - Contexto (padrão: aula_educacional)
  strategy?: string,       // OPCIONAL - Estratégia (padrão: search_first)
  fallback?: boolean       // OPCIONAL - Fallback (padrão: true)
}
```

## 🎯 **ESTRATÉGIAS DISPONÍVEIS:**

### **1. `search_first` (Recomendada)**
- Busca imagens primeiro nos provedores
- Se não encontrar o suficiente, gera as faltantes
- **Mais rápida** e **econômica**

### **2. `generate_first`**
- Gera imagens primeiro com IA
- Se não gerar o suficiente, busca as faltantes
- **Mais personalizada** e **específica**

### **3. `hybrid`**
- Busca e gera em paralelo
- Combina resultados de ambas
- **Mais completa** mas **mais lenta**

## 🚀 **EXEMPLOS PRÁTICOS:**

### **Exemplo 1: Aula de Biologia (6 imagens)**
```bash
curl -X POST http://localhost:3000/api/internal/images/unified \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "fotossíntese",
    "count": 6,
    "context": "aula_biologia",
    "strategy": "search_first"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "images": [
    {
      "id": "unsplash-123",
      "url": "https://images.unsplash.com/...",
      "title": "Photosynthesis Process",
      "description": "Diagram showing photosynthesis",
      "source": "search",
      "type": "photo",
      "style": "modern",
      "relevance": 0.9,
      "quality": 0.9
    },
    {
      "id": "gemini-456",
      "url": "data:image/png;base64...",
      "title": "Photosynthesis Diagram",
      "description": "Generated diagram of photosynthesis",
      "source": "generation",
      "type": "diagram",
      "style": "educational",
      "relevance": 0.95,
      "quality": 0.9
    }
  ],
  "strategy": "search_first",
  "searchResults": {
    "found": 4,
    "sources": ["unsplash", "pixabay", "pexels"]
  },
  "generationResults": {
    "generated": 2,
    "aiStrategy": {
      "type": "diagram",
      "style": "educational",
      "reasoning": "Tema científico detectado",
      "context": "tema geral"
    }
  },
  "processingTime": 12000
}
```

### **Exemplo 2: Chat Contextual (1 imagem)**
```bash
curl -X POST http://localhost:3000/api/internal/images/unified \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "sistema solar",
    "count": 1,
    "context": "chat_contextual",
    "strategy": "search_first"
  }'
```

### **Exemplo 3: Aula de História (6 imagens)**
```bash
curl -X POST http://localhost:3000/api/internal/images/unified \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "revolução francesa",
    "count": 6,
    "context": "aula_historia",
    "strategy": "search_first"
  }'
```

### **Exemplo 4: Estratégia Híbrida**
```bash
curl -X POST http://localhost:3000/api/internal/images/unified \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "dna",
    "count": 6,
    "context": "aula_biologia",
    "strategy": "hybrid"
  }'
```

## 💻 **USO EM CÓDIGO:**

### **JavaScript/TypeScript:**
```typescript
async function getImagesForLesson(topic: string, subject: string, count: number = 6) {
  try {
    const response = await fetch('/api/internal/images/unified', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        count,
        context: `aula_${subject.toLowerCase()}`,
        strategy: 'search_first',
        fallback: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.images.length} imagens obtidas`);
      console.log(`🔍 Busca: ${result.searchResults?.found || 0} encontradas`);
      console.log(`🎨 Geração: ${result.generationResults?.generated || 0} geradas`);
      console.log(`⏱️ Tempo: ${result.processingTime}ms`);
      
      return result.images;
    } else {
      throw new Error(result.error || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('❌ Erro ao obter imagens:', error);
    return [];
  }
}

// Uso:
const images = await getImagesForLesson('fotossíntese', 'biologia', 6);
```

### **React Hook:**
```typescript
import { useState, useCallback } from 'react';

export function useUnifiedImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getImages = useCallback(async (topic: string, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/internal/images/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          count: 6,
          context: 'aula_educacional',
          strategy: 'search_first',
          fallback: true,
          ...options
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setImages(result.images);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { images, loading, error, getImages };
}

// Uso no componente:
function LessonGenerator() {
  const { images, loading, error, getImages } = useUnifiedImages();

  const handleGenerate = async () => {
    const result = await getImages('fotossíntese', {
      context: 'aula_biologia',
      count: 6
    });
    
    if (result) {
      console.log('Imagens obtidas:', result.images);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar Imagens'}
      </button>
      
      {error && <p>Erro: {error}</p>}
      
      <div className="images-grid">
        {images.map((image) => (
          <img key={image.id} src={image.url} alt={image.title} />
        ))}
      </div>
    </div>
  );
}
```

## 🎯 **CONTEXTOS DISPONÍVEIS:**

- `aula_educacional` - Aulas gerais
- `aula_biologia` - Aulas de biologia
- `aula_historia` - Aulas de história
- `aula_geografia` - Aulas de geografia
- `aula_quimica` - Aulas de química
- `aula_fisica` - Aulas de física
- `chat_contextual` - Chat com contexto visual

## 📊 **INTERPRETAÇÃO DOS RESULTADOS:**

### **Estrutura da Resposta:**
```typescript
{
  success: boolean,           // Sucesso da operação
  images: Image[],           // Array de imagens
  strategy: string,          // Estratégia usada
  processingTime: number,    // Tempo total em ms
  searchResults?: {          // Resultados da busca
    found: number,           // Quantas encontradas
    sources: string[]        // Provedores usados
  },
  generationResults?: {      // Resultados da geração
    generated: number,       // Quantas geradas
    aiStrategy: {            // Estratégia da IA
      type: string,          // Tipo escolhido
      style: string,         // Estilo escolhido
      reasoning: string,     // Motivo da escolha
      context: string        // Contexto detectado
    }
  }
}
```

### **Tipos de Imagem:**
- `photo` - Fotografia real
- `diagram` - Diagrama educativo
- `illustration` - Ilustração artística
- `chart` - Gráfico/dados
- `infographic` - Infográfico

### **Fontes de Imagem:**
- `search` - Encontrada em provedores
- `generation` - Gerada pela IA
- `placeholder` - Placeholder SVG

## 🚀 **CASOS DE USO RECOMENDADOS:**

### **Para Aulas (6 imagens):**
```typescript
const images = await getImagesForLesson('fotossíntese', 'biologia', 6);
// Estratégia: search_first (busca primeiro, gera se necessário)
// Contexto: aula_biologia
// Resultado: 6 imagens distribuídas pelos slides
```

### **Para Chat (1 imagem):**
```typescript
const images = await getImagesForLesson('sistema solar', 'geografia', 1);
// Estratégia: search_first (mais rápida)
// Contexto: chat_contextual
// Resultado: 1 imagem explicativa
```

### **Para Conteúdo Específico (6 imagens):**
```typescript
const images = await getImagesForLesson('dna', 'biologia', 6);
// Estratégia: generate_first (mais específica)
// Contexto: aula_biologia
// Resultado: 6 imagens geradas especificamente
```

## ⚡ **DICAS DE PERFORMANCE:**

1. **Use `search_first`** para máxima velocidade
2. **Use `generate_first`** para máxima personalização
3. **Use `hybrid`** para máxima completude
4. **Configure `fallback: true`** para garantir imagens
5. **Use contextos específicos** para melhores resultados

## 🎉 **VANTAGENS DA API UNIFICADA:**

- ✅ **Inteligente**: Escolhe a melhor estratégia
- ✅ **Flexível**: 3 estratégias diferentes
- ✅ **Confiável**: Fallback automático
- ✅ **Rápida**: Busca primeiro quando possível
- ✅ **Personalizada**: Gera quando necessário
- ✅ **Completa**: Combina busca + geração

---

**🚀 API UNIFICADA - A MELHOR OPÇÃO PARA TODOS OS CASOS DE USO!**
