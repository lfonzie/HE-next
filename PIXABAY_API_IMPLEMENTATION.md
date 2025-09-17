# Implementação da API Pixabay para Imagens Educacionais

## 📋 Visão Geral

Esta implementação integra a API Pixabay ao sistema HubEdu, fornecendo acesso a imagens e vídeos educacionais de alta qualidade para aulas, apresentações e conteúdo didático.

## 🚀 Funcionalidades Implementadas

### 1. Serviço Pixabay (`lib/pixabay.ts`)
- ✅ Classe `PixabayService` completa
- ✅ Busca de imagens educacionais
- ✅ Busca por disciplina específica
- ✅ Imagens para apresentações
- ✅ Conteúdo científico e tecnológico
- ✅ Vídeos educacionais
- ✅ Imagens inspiradoras
- ✅ Otimização de queries para contexto educacional

### 2. Endpoints da API (`app/api/pixabay/`)
- ✅ `POST /api/pixabay` - Busca geral com múltiplas ações
- ✅ `GET /api/pixabay/[id]` - Busca imagem específica por ID
- ✅ `GET /api/pixabay?action=info` - Informações da API

### 3. Hook Personalizado (`hooks/usePixabayImage.ts`)
- ✅ `usePixabayImage` - Hook completo para busca
- ✅ `usePixabayQuickSearch` - Hook simplificado
- ✅ Suporte a todas as funcionalidades da API

### 4. Componentes React (`components/pixabay/`)
- ✅ `PixabayImageGallery` - Galeria completa com filtros
- ✅ `PixabayImageCard` - Card individual para imagens
- ✅ `PixabayImageGrid` - Grid de imagens
- ✅ `PixabayImageById` - Componente para busca por ID

### 5. Integração com Sistema de Aulas
- ✅ Integração no endpoint `/api/aulas/generate`
- ✅ Prioridade alta na busca de imagens
- ✅ Fallback para outras APIs

### 6. Página de Demonstração
- ✅ `/pixabay-demo` - Página completa de demonstração
- ✅ Interface interativa
- ✅ Estatísticas da API
- ✅ Modal para visualização detalhada

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao seu arquivo `.env.local`:

```bash
# Pixabay API
PIXABAY_API_KEY="sua-chave-da-api-pixabay"

# Configurações da Pixabay
PIXABAY_API_PRIORITY=api
PIXABAY_ENABLE_IMAGE_SEARCH=true
PIXABAY_ENABLE_AUTO_IMAGES=true
PIXABAY_EDUCATIONAL_FOCUS=true
```

### Obter Chave da API Pixabay

1. Acesse [https://pixabay.com/api/docs/](https://pixabay.com/api/docs/)
2. Crie uma conta gratuita
3. Obtenha sua chave de API
4. Adicione ao arquivo de ambiente

## 📚 Como Usar

### 1. Busca Básica de Imagens

```typescript
import { usePixabayImage } from '@/hooks/usePixabayImage';

function MyComponent() {
  const { data, loading, error, searchImages } = usePixabayImage({
    query: 'matemática',
    perPage: 10
  });

  const handleSearch = () => {
    searchImages({
      query: 'educação',
      category: 'education',
      type: 'images'
    });
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {data && (
        <div>
          {data.data.map(image => (
            <img key={image.id} src={image.url} alt={image.description} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Busca por Disciplina

```typescript
const { searchBySubject } = usePixabayImage({}, false);

const handleSubjectSearch = () => {
  searchBySubject('matematica', 1, 20);
};
```

### 3. Busca para Apresentações

```typescript
const { searchForPresentation } = usePixabayImage({}, false);

const handlePresentationSearch = () => {
  searchForPresentation('tecnologia', 1, 15);
};
```

### 4. Busca Científica

```typescript
const { searchScienceImages } = usePixabayImage({}, false);

const handleScienceSearch = () => {
  searchScienceImages('laboratório', 1, 10);
};
```

### 5. Busca de Vídeos

```typescript
const { searchVideos } = usePixabayImage({}, false);

const handleVideoSearch = () => {
  searchVideos('educação', 1, 5);
};
```

### 6. Componente de Galeria

```typescript
import PixabayImageGallery from '@/components/pixabay/PixabayImageGallery';

function MyPage() {
  const handleImageSelect = (image) => {
    console.log('Imagem selecionada:', image);
  };

  return (
    <PixabayImageGallery
      initialQuery="educação"
      onImageSelect={handleImageSelect}
      showFilters={true}
    />
  );
}
```

## 🔌 Endpoints da API

### POST /api/pixabay

Busca imagens e vídeos educacionais.

**Ações disponíveis:**
- `search` - Busca geral
- `subject` - Busca por disciplina
- `presentation` - Imagens para apresentações
- `science` - Conteúdo científico
- `inspirational` - Imagens inspiradoras
- `videos` - Vídeos educacionais

**Exemplo de requisição:**

```json
{
  "action": "search",
  "query": "matemática",
  "page": 1,
  "perPage": 20,
  "category": "education",
  "type": "images"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pixabay_123456",
      "url": "https://cdn.pixabay.com/photo/...",
      "thumbnail": "https://cdn.pixabay.com/photo/...",
      "description": "Matemática, educação, aprendizado",
      "author": "Nome do Autor",
      "authorUrl": "https://pixabay.com/users/...",
      "source": "pixabay",
      "width": 1920,
      "height": 1080,
      "tags": ["matemática", "educação", "aprendizado"],
      "quality": "good",
      "educational": true,
      "views": 1500,
      "likes": 25
    }
  ],
  "metadata": {
    "query": "matemática",
    "category": "education",
    "totalResults": 1,
    "source": "pixabay",
    "educational": true
  }
}
```

### GET /api/pixabay/[id]

Busca uma imagem específica por ID.

**Exemplo:**
```
GET /api/pixabay/123456
```

### GET /api/pixabay?action=info

Retorna informações sobre a API.

## 🎯 Disciplinas Suportadas

- **Matemática** - Números, geometria, álgebra, fórmulas
- **Português** - Literatura, livros, leitura, escrita
- **História** - Civilizações, museus, patrimônio
- **Geografia** - Mapas, paisagens, natureza
- **Ciências** - Laboratório, experimentos, pesquisa
- **Física** - Energia, força, tecnologia
- **Química** - Moléculas, reações, fórmulas
- **Biologia** - Natureza, plantas, animais, células
- **Artes** - Pintura, desenho, criatividade
- **Educação Física** - Esportes, fitness, movimento

## 📊 Limites da API

- **Requisições por hora:** 5.000
- **Imagens por requisição:** 200
- **Vídeos por requisição:** 200
- **Qualidade:** Boa a Excelente
- **Foco:** 100% Educacional

## 🧪 Testes

Execute o arquivo de teste para verificar se tudo está funcionando:

```bash
node test-pixabay-api.js
```

O teste verifica:
- ✅ Todas as funcionalidades da API
- ✅ Integração com sistema de aulas
- ✅ Busca por ID específico
- ✅ Tratamento de erros
- ✅ Formato das respostas

## 🔄 Integração Automática

A API Pixabay está integrada automaticamente ao sistema de geração de aulas:

1. **Prioridade Alta** - Primeira opção após Wikimedia Commons
2. **Fallback Inteligente** - Se Pixabay falhar, tenta Unsplash
3. **Contexto Educacional** - Queries otimizadas para educação
4. **Qualidade Garantida** - Filtros para conteúdo apropriado

## 🎨 Interface de Usuário

### Página de Demonstração
Acesse `/pixabay-demo` para:
- 🖼️ Galeria interativa de imagens
- 🔍 Busca avançada com filtros
- 📊 Estatísticas da API
- 🎯 Busca por disciplina
- 🎬 Visualização de vídeos
- 📱 Interface responsiva

### Componentes Disponíveis
- `PixabayImageGallery` - Galeria completa
- `PixabayImageCard` - Card individual
- `PixabayImageGrid` - Grid de imagens
- `PixabayImageById` - Busca por ID

## 🚨 Tratamento de Erros

A implementação inclui tratamento robusto de erros:

- ✅ Validação de entrada com Zod
- ✅ Fallback para outras APIs
- ✅ Mensagens de erro claras
- ✅ Logs detalhados para debug
- ✅ Retry automático em falhas temporárias

## 📈 Performance

- ⚡ Cache inteligente de resultados
- 🔄 Paginação eficiente
- 📱 Otimização para mobile
- 🖼️ Lazy loading de imagens
- 🎯 Queries otimizadas

## 🔒 Segurança

- 🛡️ Validação de entrada
- 🔐 Chaves de API seguras
- 🚫 Filtros de conteúdo seguro
- 📝 Logs de auditoria
- ⚠️ Rate limiting

## 📝 Logs e Monitoramento

A implementação inclui logs detalhados:

```javascript
console.log('🖼️ [PIXABAY] Buscando imagens para:', query);
console.log('✅ [PIXABAY] Imagem encontrada:', imageUrl);
console.log('❌ [PIXABAY] Erro na busca:', error);
```

## 🎉 Conclusão

A implementação da API Pixabay está **100% completa e funcional**, oferecendo:

- 🎯 **Foco Educacional** - Conteúdo otimizado para educação
- 🚀 **Alta Performance** - 5.000 requisições por hora
- 🔧 **Fácil Integração** - Hooks e componentes prontos
- 📱 **Interface Moderna** - UI responsiva e intuitiva
- 🛡️ **Segurança** - Validação e filtros robustos
- 📊 **Monitoramento** - Logs e métricas detalhadas

A API está pronta para uso em produção e integrada ao sistema HubEdu!
