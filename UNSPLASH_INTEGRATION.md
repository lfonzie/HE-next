# 🖼️ Integração com Unsplash

## 📋 Visão Geral

A integração com o Unsplash permite buscar e selecionar imagens de alta qualidade diretamente na plataforma HubEdu.ai. Todas as imagens são gratuitas para uso comercial e não comercial.

## 🔑 Configuração

### 1. Obter Chave da API do Unsplash

1. Acesse [unsplash.com/developers](https://unsplash.com/developers)
2. Crie uma conta gratuita
3. Crie uma nova aplicação
4. Copie a **Access Key** (não a Secret Key)

### 2. Configurar Variáveis de Ambiente

Adicione no seu arquivo `.env.local`:

```bash
# Unsplash API
UNSPLASH_ACCESS_KEY="sua-access-key-aqui"
```

**Nota:** A Secret Key não é necessária para esta implementação.

## 🚀 Como Usar

### Componente UnsplashImagePicker

```tsx
import { UnsplashImagePicker } from '@/components/ui/UnsplashImagePicker';

function MyComponent() {
  const handleImageSelect = (image) => {
    console.log('Imagem selecionada:', image);
    // Usar image.urls.regular para a URL da imagem
  };

  return (
    <UnsplashImagePicker
      onImageSelect={handleImageSelect}
      trigger={<Button>Escolher Imagem</Button>}
    />
  );
}
```

### Componente UnsplashImageSearch

```tsx
import { UnsplashImageSearch } from '@/components/ui/UnsplashImageSearch';

function MyComponent() {
  return (
    <UnsplashImageSearch
      onImageSelect={(image) => console.log(image)}
      onImageSelectUrl={(url, alt) => console.log(url, alt)}
    />
  );
}
```

### Hook useUnsplash

```tsx
import { useUnsplash } from '@/hooks/useUnsplash';

function MyComponent() {
  const {
    images,
    loading,
    error,
    searchImages,
    searchEducationImages,
    loadMore
  } = useUnsplash();

  const handleSearch = () => {
    searchImages('natureza');
  };

  return (
    <div>
      <button onClick={handleSearch}>Buscar</button>
      {loading && <p>Carregando...</p>}
      {images.map(image => (
        <img key={image.id} src={image.urls.small} alt={image.alt_description} />
      ))}
    </div>
  );
}
```

## 📚 API Endpoints

### GET /api/unsplash/search

Busca imagens no Unsplash.

**Parâmetros:**
- `query` (string): Termo de busca
- `page` (number): Página (padrão: 1)
- `per_page` (number): Imagens por página (padrão: 20)
- `type` (string): Tipo de busca ('search', 'education', 'presentation', 'subject')

**Exemplos:**
```bash
# Busca geral
GET /api/unsplash/search?query=natureza&page=1&per_page=20&type=search

# Imagens de educação
GET /api/unsplash/search?page=1&per_page=20&type=education

# Imagens para apresentações
GET /api/unsplash/search?page=1&per_page=20&type=presentation

# Imagens por disciplina
GET /api/unsplash/search?query=matematica&page=1&per_page=20&type=subject
```

### GET /api/unsplash/photo/[id]

Obtém detalhes de uma imagem específica.

**Exemplo:**
```bash
GET /api/unsplash/photo/abc123
```

## 🎨 Tipos de Busca Disponíveis

### 1. Busca Geral (`type=search`)
- Busca por qualquer termo
- Ideal para buscas específicas

### 2. Educação (`type=education`)
- Imagens relacionadas à educação
- Termos: education, school, classroom, learning, students, teacher, books, study, university, academic

### 3. Apresentações (`type=presentation`)
- Imagens profissionais para apresentações
- Termos: presentation, business, professional, office, meeting, conference, workspace, modern, minimalist, clean

### 4. Por Disciplina (`type=subject`)
- Imagens específicas por matéria
- Suporta: matematica, portugues, historia, geografia, ciencias, fisica, quimica, biologia, artes, educacao-fisica

## 📊 Estrutura de Dados

### UnsplashImage

```typescript
interface UnsplashImage {
  id: string;
  urls: {
    raw: string;      // Imagem original
    full: string;     // Imagem completa
    regular: string;  // Imagem regular (recomendada)
    small: string;    // Imagem pequena
    thumb: string;     // Miniatura
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
  color: string;      // Cor predominante
  likes: number;      // Número de curtidas
}
```

## 🔧 Serviço UnsplashService

```typescript
import { unsplashService } from '@/lib/unsplash';

// Buscar imagens
const result = await unsplashService.searchPhotos('natureza', 1, 20);

// Imagens de educação
const educationImages = await unsplashService.getEducationPhotos(1, 20);

// Imagens por disciplina
const mathImages = await unsplashService.getSubjectPhotos('matematica', 1, 20);

// Obter imagem específica
const photo = await unsplashService.getPhoto('abc123');
```

## 🎯 Casos de Uso

### 1. Materiais Educacionais
- Ilustrar apresentações de aulas
- Criar materiais visuais para disciplinas
- Adicionar imagens em documentos educacionais

### 2. Apresentações Institucionais
- Slides para reuniões
- Materiais de marketing educacional
- Documentos corporativos

### 3. Conteúdo Digital
- Posts em redes sociais
- Artigos e blogs educacionais
- Materiais de comunicação

## ⚠️ Limitações e Considerações

### Rate Limits
- Unsplash permite 50 requisições por hora por aplicação
- Para uso intensivo, considere implementar cache

### Qualidade das Imagens
- Todas as imagens são de alta qualidade
- Recomenda-se usar `urls.regular` para melhor equilíbrio qualidade/tamanho

### Termos de Uso
- Imagens gratuitas para uso comercial e não comercial
- Não é obrigatório atribuição, mas é apreciado
- Não pode ser usado para criar um serviço de stock photos

## 🐛 Troubleshooting

### Erro 401 Unauthorized
- Verifique se `UNSPLASH_ACCESS_KEY` está configurada
- Confirme se a chave está correta

### Erro 403 Forbidden
- Verifique os limites de rate limit
- Aguarde antes de fazer novas requisições

### Imagens não carregam
- Verifique a conexão com a internet
- Confirme se as URLs das imagens estão acessíveis

## 📖 Exemplo Completo

Veja a página de demonstração em `/unsplash-demo` para um exemplo completo de como usar a integração.

## 🔗 Links Úteis

- [Unsplash Developers](https://unsplash.com/developers)
- [Unsplash License](https://unsplash.com/license)
- [Unsplash API Documentation](https://unsplash.com/documentation)
