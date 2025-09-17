# API de Ilustrações Educacionais - Documentação Completa

## Visão Geral

A API de Ilustrações Educacionais foi desenvolvida para facilitar a busca e obtenção de imagens educacionais de alta qualidade, especialmente focada em processos científicos como fotossíntese, respiração celular, e outros conceitos educacionais.

## Características Principais

### 🎯 **Busca Inteligente**
- Integração com múltiplos serviços de imagens (Unsplash, Pixabay, Pexels)
- Otimização automática de queries baseada em processos educacionais
- Sistema de cache para melhor performance
- Relevância educacional calculada automaticamente

### 🔬 **Processos Específicos**
- Base de dados de processos educacionais detalhados
- Busca otimizada para conceitos científicos
- Suporte a diferentes níveis educacionais
- Diagramas e ilustrações específicas

### 🎨 **Múltiplas Fontes**
- **Unsplash**: Imagens de alta qualidade
- **Pixabay**: Banco de imagens educacionais
- **Pexels**: Fotografias profissionais

## Endpoints da API

### 1. Busca Geral de Ilustrações

**Endpoint:** `POST /api/illustrations/search`

**Parâmetros:**
```json
{
  "query": "fotossíntese",
  "category": "biology",
  "process": "fotossintese",
  "style": "scientific",
  "language": "pt",
  "limit": 10,
  "includeMetadata": true
}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456",
      "url": "https://images.unsplash.com/photo-123456",
      "thumbnail": "https://images.unsplash.com/photo-123456?w=300",
      "description": "Diagrama de fotossíntese",
      "author": "João Silva",
      "authorUrl": "https://unsplash.com/@joao",
      "source": "unsplash",
      "downloadUrl": "https://unsplash.com/photos/123456/download",
      "width": 1920,
      "height": 1080,
      "tags": ["fotossíntese", "biologia", "plantas"],
      "metadata": {
        "category": "biology",
        "process": "fotossintese",
        "style": "scientific",
        "language": "pt",
        "searchQuery": "fotossíntese",
        "optimizedQuery": "photosynthesis fotossíntese chlorophyll",
        "educationalRelevance": 0.85
      }
    }
  ],
  "cached": false,
  "metadata": {
    "query": "fotossíntese",
    "optimizedQuery": "photosynthesis fotossíntese chlorophyll",
    "category": "biology",
    "process": "fotossintese",
    "totalResults": 10,
    "services": ["unsplash", "pixabay", "pexels"]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Busca por Processos Específicos

**Endpoint:** `POST /api/illustrations/processes`

**Parâmetros:**
```json
{
  "process": "fotossintese",
  "level": "medio",
  "language": "pt",
  "limit": 8,
  "includeSteps": true,
  "includeDiagrams": true
}
```

**Resposta:**
```json
{
  "success": true,
  "process": {
    "id": "fotossintese",
    "name": "Fotossíntese",
    "description": "Processo pelo qual plantas convertem luz solar em energia química",
    "categories": ["biology", "chemistry"],
    "difficulty": "medio",
    "ageRange": "12-18",
    "relatedProcesses": ["respiração-celular", "respiração-vegetal"],
    "steps": [
      "Captação de luz solar pela clorofila",
      "Quebra da molécula de água (fotólise)",
      "Liberação de oxigênio",
      "Formação de ATP e NADPH",
      "Fixação do CO2",
      "Síntese de glicose"
    ]
  },
  "images": [...],
  "diagrams": [
    {
      "type": "flowchart",
      "title": "Fluxo da Fotossíntese",
      "description": "Diagrama mostrando as etapas da fotossíntese",
      "elements": ["Luz Solar", "Clorofila", "H2O", "CO2", "Glicose", "O2"]
    }
  ],
  "metadata": {
    "totalImages": 8,
    "requestedLimit": 8,
    "level": "medio",
    "language": "pt",
    "includeSteps": true,
    "includeDiagrams": true
  }
}
```

### 3. Listar Processos Disponíveis

**Endpoint:** `GET /api/illustrations/processes?action=list`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "fotossintese",
      "name": "Fotossíntese",
      "description": "Processo pelo qual plantas convertem luz solar em energia química",
      "categories": ["biology", "chemistry"],
      "difficulty": "medio",
      "ageRange": "12-18",
      "keywords": ["photosynthesis", "fotossíntese", "chlorophyll", "clorofila"],
      "relatedProcesses": ["respiração-celular", "respiração-vegetal"]
    }
  ],
  "total": 15
}
```

### 4. Listar Categorias

**Endpoint:** `GET /api/illustrations/search?action=categories`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "biology",
      "name": "Biologia",
      "description": "Processos biológicos, anatomia, fisiologia"
    },
    {
      "id": "chemistry",
      "name": "Química",
      "description": "Reações químicas, elementos, compostos"
    }
  ]
}
```

## Processos Educacionais Suportados

### Biologia
- **fotossintese**: Fotossíntese
- **respiração-celular**: Respiração Celular
- **digestão**: Digestão
- **circulação**: Circulação Sanguínea
- **mitose**: Mitose
- **meiose**: Meiose
- **evolução**: Evolução

### Química
- **química-orgânica**: Química Orgânica
- **tabela-periódica**: Tabela Periódica
- **reação-química**: Reação Química

### Física
- **movimento**: Movimento
- **eletricidade**: Eletricidade
- **ondas**: Ondas

## Uso com React Hooks

### Hook Básico
```typescript
import { useIllustrations } from '@/hooks/useIllustrations';

function MyComponent() {
  const { images, loading, error, searchImages } = useIllustrations();

  const handleSearch = async () => {
    try {
      await searchImages({
        query: 'fotossíntese',
        category: 'biology',
        limit: 10
      });
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSearch}>Buscar Fotossíntese</button>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {images.map(image => (
        <img key={image.id} src={image.thumbnail} alt={image.description} />
      ))}
    </div>
  );
}
```

### Hook para Fotossíntese
```typescript
import { usePhotosynthesisImages } from '@/hooks/useIllustrations';

function PhotosynthesisComponent() {
  const { images, loading, searchPhotosynthesis } = usePhotosynthesisImages();

  const handleSearch = async () => {
    await searchPhotosynthesis('medio');
  };

  return (
    <div>
      <button onClick={handleSearch}>Buscar Imagens de Fotossíntese</button>
      {/* Renderizar imagens */}
    </div>
  );
}
```

### Hook de Busca Inteligente
```typescript
import { useEducationalSearch } from '@/hooks/useIllustrations';

function SmartSearchComponent() {
  const { images, loading, smartSearch } = useEducationalSearch();

  const handleSmartSearch = async () => {
    await smartSearch('fotossíntese', {
      level: 'medio',
      preferProcesses: true,
      limit: 8
    });
  };

  return (
    <div>
      <button onClick={handleSmartSearch}>Busca Inteligente</button>
      {/* Renderizar imagens */}
    </div>
  );
}
```

## Componente React Completo

```typescript
import { IllustrationSearch } from '@/components/illustrations/IllustrationSearch';

function App() {
  const handleImageSelect = (image) => {
    console.log('Imagem selecionada:', image);
    // Implementar lógica de seleção
  };

  const handleProcessSelect = (process) => {
    console.log('Processo selecionado:', process);
    // Implementar lógica de processo
  };

  return (
    <IllustrationSearch
      onImageSelect={handleImageSelect}
      onProcessSelect={handleProcessSelect}
      initialQuery="fotossíntese"
      showProcesses={true}
      showCategories={true}
      maxResults={12}
    />
  );
}
```

## Configuração de Variáveis de Ambiente

```env
# Unsplash API
UNSPLASH_ACCESS_KEY=sua_chave_unsplash

# Pixabay API
PIXABAY_API_KEY=sua_chave_pixabay

# Pexels API
PEXELS_API_KEY=sua_chave_pexels

# Base URL (para desenvolvimento)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Exemplos de Uso

### 1. Buscar Imagens de Fotossíntese
```javascript
const response = await fetch('/api/illustrations/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'fotossíntese',
    category: 'biology',
    process: 'fotossintese',
    limit: 8
  })
});

const data = await response.json();
console.log('Imagens encontradas:', data.data);
```

### 2. Buscar Processo Específico
```javascript
const response = await fetch('/api/illustrations/processes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    process: 'fotossintese',
    level: 'medio',
    includeSteps: true,
    includeDiagrams: true
  })
});

const data = await response.json();
console.log('Processo:', data.process);
console.log('Imagens:', data.images);
console.log('Diagramas:', data.diagrams);
```

### 3. Listar Processos Disponíveis
```javascript
const response = await fetch('/api/illustrations/processes?action=list');
const data = await response.json();
console.log('Processos disponíveis:', data.data);
```

## Características Técnicas

### Cache
- Cache em memória com TTL de 5 minutos
- Chave de cache baseada em query, categoria e processo
- Reduz chamadas desnecessárias às APIs externas

### Rate Limiting
- Implementado para evitar exceder limites das APIs
- Fallback gracioso quando serviços estão indisponíveis

### Validação
- Validação de entrada com Zod
- Sanitização de dados
- Tratamento de erros robusto

### Relevância Educacional
- Algoritmo de cálculo de relevância baseado em:
  - Presença de termos educacionais
  - Keywords específicos do processo
  - Tags e metadados da imagem
  - Fonte da imagem

## Melhores Práticas

1. **Use cache**: A API implementa cache automático
2. **Especifique categoria**: Melhora a relevância dos resultados
3. **Use processos específicos**: Para conceitos científicos conhecidos
4. **Limite resultados**: Use `limit` para controlar performance
5. **Trate erros**: Sempre implemente tratamento de erro
6. **Use hooks**: Para melhor experiência de desenvolvimento

## Troubleshooting

### Erro: "API key não configurada"
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se as chaves de API são válidas

### Erro: "Processo não encontrado"
- Use `GET /api/illustrations/processes?action=list` para ver processos disponíveis
- Verifique se o ID do processo está correto

### Imagens não carregam
- Verifique se as URLs das imagens são válidas
- Confirme se não há bloqueios de CORS
- Teste com diferentes serviços (Unsplash, Pixabay, Pexels)

### Performance lenta
- Use cache (implementado automaticamente)
- Limite o número de resultados
- Use processos específicos em vez de busca geral

## Roadmap

### Próximas Funcionalidades
- [ ] Integração com mais serviços de imagens
- [ ] Geração automática de diagramas
- [ ] Suporte a vídeos educacionais
- [ ] API de tradução automática
- [ ] Sistema de favoritos
- [ ] Análise de qualidade educacional
- [ ] Integração com IA para descrição de imagens

### Melhorias Planejadas
- [ ] Cache Redis para produção
- [ ] Compressão de imagens
- [ ] CDN para thumbnails
- [ ] Métricas de uso
- [ ] Dashboard de administração
