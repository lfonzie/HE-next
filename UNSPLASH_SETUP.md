# 🚀 Configuração do Unsplash - HubEdu.ai

## ✅ Status: Credenciais Validadas

Suas credenciais do Unsplash foram testadas e estão funcionando corretamente!

- **Application ID:** 802552
- **Access Key:** QLwU2RvlL-4pIi5UP3_YYbgyyxXGt5unln1xBzzkezM
- **Status:** ✅ Funcionando

## 🔧 Configuração Rápida

### 1. Criar arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# Unsplash API Configuration
UNSPLASH_ACCESS_KEY="QLwU2RvlL-4pIi5UP3_YYbgyyxXGt5unln1xBzzkezM"
UNSPLASH_SECRET_KEY="UYj7_oSSR8PLsTcMqHHFvTnqywW_ZT7U-L6OKjCY3Ng"

# Application ID: 802552
```

### 2. Instalar dependências (se necessário)

```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

### 4. Testar a integração

Acesse: **http://localhost:3000/unsplash-demo**

## 🎯 Funcionalidades Disponíveis

### ✅ Busca de Imagens
- **Busca geral:** Digite qualquer termo
- **Educação:** Imagens relacionadas à educação
- **Apresentações:** Imagens profissionais
- **Por disciplina:** Matemática, português, história, etc.

### ✅ Seleção de Imagens
- **Múltiplos tamanhos:** Thumbnail, pequena, regular, completa
- **Informações detalhadas:** Autor, curtidas, dimensões
- **Download direto:** Baixe em alta qualidade
- **URLs prontas:** Para usar em apresentações

## 📱 Como Usar nos Componentes

### UnsplashImagePicker (Modal simples)
```tsx
import { UnsplashImagePicker } from '@/components/ui/UnsplashImagePicker';

<UnsplashImagePicker
  onImageSelect={(image) => {
    console.log('URL da imagem:', image.urls.regular);
    console.log('Descrição:', image.alt_description);
  }}
  trigger={<Button>Escolher Imagem</Button>}
/>
```

### UnsplashImageSearch (Busca completa)
```tsx
import { UnsplashImageSearch } from '@/components/ui/UnsplashImageSearch';

<UnsplashImageSearch
  onImageSelect={(image) => console.log(image)}
  onImageSelectUrl={(url, alt) => console.log(url, alt)}
/>
```

### Hook useUnsplash
```tsx
import { useUnsplash } from '@/hooks/useUnsplash';

const { images, loading, searchImages } = useUnsplash();

// Buscar imagens
searchImages('natureza');
```

## 🔍 Teste das Credenciais

Execute o teste para verificar se tudo está funcionando:

```bash
node test-unsplash.js
```

**Resultado esperado:**
- ✅ Imagens de educação encontradas
- ✅ Imagens de matemática encontradas  
- ✅ Imagens para apresentações encontradas

## 📊 Limites da API

- **50 requisições por hora** por aplicação
- **Imagens gratuitas** para uso comercial
- **Alta qualidade** em todos os tamanhos

## 🎨 Exemplos de Uso

### Para Apresentações de Aula
```tsx
// Buscar imagens relacionadas à disciplina
const { searchSubjectImages } = useUnsplash();
searchSubjectImages('matematica');
```

### Para Materiais Educacionais
```tsx
// Buscar imagens de educação
const { searchEducationImages } = useUnsplash();
searchEducationImages();
```

### Para Documentos Institucionais
```tsx
// Buscar imagens profissionais
const { searchPresentationImages } = useUnsplash();
searchPresentationImages();
```

## 🚨 Troubleshooting

### Erro 401 Unauthorized
- Verifique se `UNSPLASH_ACCESS_KEY` está no `.env.local`
- Reinicie o servidor após adicionar a variável

### Imagens não carregam
- Verifique a conexão com a internet
- Confirme se as URLs estão acessíveis

### Rate limit exceeded
- Aguarde antes de fazer novas requisições
- Implemente cache se necessário

## 🎉 Pronto para Usar!

Sua integração com o Unsplash está configurada e funcionando. Agora você pode:

1. **Buscar imagens** de alta qualidade
2. **Integrar nos componentes** existentes
3. **Usar em apresentações** e materiais educacionais
4. **Baixar imagens** diretamente da plataforma

Todas as imagens são gratuitas para uso comercial e não comercial! 🖼️✨
