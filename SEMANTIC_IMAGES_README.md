# 🔍 Sistema de Busca Semântica de Imagens

Sistema unificado que busca imagens em **Wikimedia Commons**, **Unsplash** e **Pixabay** com reranqueamento semântico obrigatório usando embeddings OpenAI.

## ✨ Funcionalidades

- **Busca Unificada**: Consulta simultânea nos 3 provedores
- **Reranqueamento Semântico**: Usa embeddings OpenAI para encontrar as melhores correspondências
- **Deduplicação**: Remove imagens duplicadas automaticamente
- **Resposta Normalizada**: Mesmo formato para todos os provedores
- **Cache Inteligente**: Cache de 60s com stale-while-revalidate
- **Licenças**: Informações completas de licenciamento

## 🚀 Como Usar

### API Endpoint

```bash
GET /api/semantic-images?q=sua+busca+aqui
```

**Parâmetros:**
- `q` (obrigatório): Query de busca
- `orientation` (opcional): `landscape`, `portrait`, `squarish`
- `safe` (opcional): `true` ou `false` (padrão: `true`)
- `perProvider` (opcional): Resultados por provedor (padrão: 12, máx: 50)
- `page` (opcional): Página (padrão: 1)

### Exemplo de Uso

```bash
curl "http://localhost:3000/api/semantic-images?q=aula%20sobre%20como%20funciona%20a%20internet"
```

### Resposta

```json
{
  "query": "aula sobre como funciona a internet",
  "count": 3,
  "topK": 3,
  "page": 1,
  "perProvider": 12,
  "items": [
    {
      "id": "123",
      "provider": "wikimedia",
      "title": "OSI model diagram",
      "alt": "OSI model diagram",
      "thumbUrl": "https://...",
      "url": "https://...",
      "width": 800,
      "height": 600,
      "author": "Alice",
      "sourcePage": "https://commons.wikimedia.org/...",
      "license": "CC BY-SA 3.0",
      "score": 0.84,
      "meta": { "mime": "image/jpeg" }
    }
  ]
}
```

## 🎯 Componentes React

### Hook `useSemanticImages`

```tsx
import { useSemanticImages } from '@/components/semantic-images';

function MyComponent() {
  const { data, isLoading, error, refetch } = useSemanticImages({
    query: 'fotossíntese em plantas',
    orientation: 'landscape',
    perProvider: 15
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {data?.items.map(image => (
        <img key={image.id} src={image.url} alt={image.alt} />
      ))}
    </div>
  );
}
```

### Componente `SemanticImageGrid`

```tsx
import { SemanticImageGrid } from '@/components/semantic-images';

function ImageSearch() {
  return (
    <SemanticImageGrid
      query="sistema solar e planetas"
      orientation="landscape"
      onImageSelect={(image) => console.log('Selecionada:', image)}
    />
  );
}
```

### Seletor de Imagens para Aulas

```tsx
import { ImageSelector } from '@/components/aulas/ImageSelector';

function LessonEditor() {
  const [selectedImages, setSelectedImages] = useState([]);

  return (
    <ImageSelector
      onImageSelect={(image) => setSelectedImages(prev => [...prev, image])}
      selectedImages={selectedImages}
      maxImages={5}
    />
  );
}
```

## 🧪 Testando

### Script de Teste

```bash
# Teste básico
./test-semantic-images.sh "fotossíntese em plantas"

# Teste com orientação
curl "http://localhost:3000/api/semantic-images?q=fotossíntese&orientation=landscape"
```

### Página de Demonstração

Acesse `/semantic-images-demo` para testar a funcionalidade completa.

## 🔧 Configuração

### Variáveis de Ambiente

Certifique-se de ter as seguintes chaves no seu `.env.local`:

```env
UNSPLASH_ACCESS_KEY=sua_chave_unsplash
PIXABAY_API_KEY=sua_chave_pixabay
OPENAI_API_KEY=sua_chave_openai
```

### Dependências

- Next.js 15+
- React 18+
- OpenAI API (para embeddings)
- Tailwind CSS (para componentes)

## 📊 Performance

- **Cache**: 60s com stale-while-revalidate de 120s
- **Busca Concorrente**: Consulta os 3 provedores simultaneamente
- **Reranqueamento**: Usa embeddings OpenAI text-embedding-3-large
- **Limites**: Máximo 50 resultados por provedor

## 🎨 Licenças

- **Wikimedia Commons**: Licenças Creative Commons
- **Unsplash**: Unsplash License (livre para uso)
- **Pixabay**: Pixabay License (livre para uso)

Sempre exiba as informações de licença e link para a fonte original.

## 🔍 Exemplos de Queries Educacionais

- "aula sobre como funciona a internet"
- "fotossíntese em plantas"
- "sistema solar e planetas"
- "história do Brasil colonial"
- "matemática e geometria"
- "laboratório de química"
- "ecossistema amazônico"
- "revolução industrial"

## 🚨 Observações Importantes

1. **Licenças**: Sempre exiba informações de licença
2. **Qualidade**: O reranqueamento melhora com títulos/descrições mais ricas
3. **Performance**: Para alta taxa de requisições, considere cache KV
4. **Rate Limits**: Respeite os limites dos provedores
5. **Fallbacks**: O sistema funciona mesmo se um provedor falhar
