# 🔍 Integração de Busca Semântica de Imagens no Módulo /aulas

## ✅ Integração Completa Implementada

O sistema de busca semântica de imagens foi totalmente integrado ao módulo `/aulas` do HubEdu.ai, permitindo que professores selecionem imagens educacionais relevantes durante a criação de aulas.

## 🎯 Funcionalidades Implementadas

### 1. **Seletor de Imagens na Interface de Criação**
- **Localização**: Formulário de criação de aulas (`/aulas`)
- **Funcionalidade**: Permite selecionar até 5 imagens educacionais
- **Busca**: Integrada com Wikimedia Commons, Unsplash e Pixabay
- **Reranqueamento**: Semântico obrigatório usando embeddings OpenAI

### 2. **API Modificada para Processar Imagens**
- **Endpoint**: `/api/aulas/generate-gemini`
- **Novo Parâmetro**: `selectedImages` (array de imagens selecionadas)
- **Priorização**: Imagens do usuário têm prioridade sobre busca automática
- **Distribuição**: Imagens são distribuídas automaticamente pelos slides

### 3. **Interface de Seleção Intuitiva**
- **Modal**: Abre seletor de imagens em modal responsivo
- **Preview**: Visualização das imagens selecionadas
- **Controles**: Adicionar/remover imagens facilmente
- **Feedback**: Informações de licença e fonte

## 🚀 Como Usar

### Para Professores:

1. **Acesse** `/aulas`
2. **Digite** o tópico da aula
3. **Clique** em "Adicionar Imagem" (opcional)
4. **Busque** por imagens relacionadas ao tópico
5. **Selecione** até 5 imagens relevantes
6. **Gere** a aula - as imagens serão incluídas automaticamente

### Exemplo de Fluxo:

```typescript
// 1. Usuário seleciona imagens
const selectedImages = [
  {
    id: "123",
    provider: "wikimedia",
    title: "Fotossíntese em plantas",
    url: "https://commons.wikimedia.org/...",
    license: "CC BY-SA 3.0",
    score: 0.89
  },
  // ... mais imagens
];

// 2. API processa as imagens
const response = await fetch('/api/aulas/generate-gemini', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'fotossíntese em plantas',
    selectedImages: selectedImages
  })
});

// 3. Imagens são distribuídas pelos slides automaticamente
```

## 🔧 Implementação Técnica

### Frontend (`app/aulas/page.tsx`):

```typescript
// Estado para imagens selecionadas
const [selectedImages, setSelectedImages] = useState<SemanticImageItem[]>([]);

// Função para adicionar imagem
const handleImageSelect = useCallback((image: SemanticImageItem) => {
  setSelectedImages(prev => [...prev, image]);
}, []);

// Componente de seleção
<ImageSelector
  onImageSelect={handleImageSelect}
  selectedImages={selectedImages}
  maxImages={5}
/>
```

### Backend (`app/api/aulas/generate-gemini/route.js`):

```javascript
// Receber imagens selecionadas
const { topic, selectedImages = [] } = await request.json();

// Priorizar imagens do usuário
if (selectedImages && selectedImages.length > 0) {
  const imageIndex = (slideNumber - 1) % selectedImages.length;
  const selectedImage = selectedImages[imageIndex];
  imageUrl = selectedImage.url;
  imageSource = `user-selected-${selectedImage.provider}`;
}
```

## 📊 Benefícios da Integração

### Para Professores:
- **Controle Total**: Escolhem exatamente quais imagens usar
- **Relevância**: Imagens semanticamente relacionadas ao tópico
- **Qualidade**: Acesso a 3 dos melhores provedores de imagens
- **Licenças**: Informações claras sobre uso e atribuição

### Para Estudantes:
- **Experiência Visual**: Aulas mais ricas e envolventes
- **Compreensão**: Imagens que realmente ajudam no aprendizado
- **Variedade**: Diferentes estilos e perspectivas visuais

### Para o Sistema:
- **Eficiência**: Menos busca automática desnecessária
- **Personalização**: Aulas mais únicas e personalizadas
- **Qualidade**: Maior controle sobre o conteúdo visual

## 🎨 Interface Visual

### Seletor de Imagens:
- **Design**: Modal responsivo com grid de imagens
- **Filtros**: Por provedor, orientação, segurança
- **Preview**: Thumbnails com informações de licença
- **Ações**: Selecionar, visualizar, remover

### Visualização de Selecionadas:
- **Grid**: Layout responsivo 2x3 em desktop
- **Badges**: Indicadores de provedor
- **Controles**: Botões de remoção com hover
- **Contador**: "X/5 imagens selecionadas"

## 🔍 Busca Semântica Integrada

### Provedores Unificados:
- **Wikimedia Commons**: Conteúdo educacional de alta qualidade
- **Unsplash**: Imagens profissionais e artísticas
- **Pixabay**: Banco diversificado de recursos visuais

### Reranqueamento Inteligente:
- **Embeddings**: OpenAI text-embedding-3-large
- **Similaridade**: Cosseno entre query e metadados da imagem
- **Top-3**: Sempre retorna as 3 melhores correspondências

## 📝 Exemplos de Uso

### Busca por "Fotossíntese":
```bash
curl "http://localhost:3000/api/semantic-images?q=fotossíntese%20em%20plantas"
```

**Resultado esperado:**
- Diagramas de cloroplastos (Wikimedia)
- Plantas em laboratório (Unsplash)
- Ilustrações científicas (Pixabay)

### Busca por "Sistema Solar":
```bash
curl "http://localhost:3000/api/semantic-images?q=sistema%20solar%20e%20planetas"
```

**Resultado esperado:**
- Diagramas orbitais (Wikimedia)
- Fotografias astronômicas (Unsplash)
- Ilustrações educacionais (Pixabay)

## 🚨 Considerações Importantes

### Licenças:
- **Wikimedia**: Creative Commons (requer atribuição)
- **Unsplash**: Unsplash License (livre para uso)
- **Pixabay**: Pixabay License (livre para uso)

### Limites:
- **Máximo**: 5 imagens por aula
- **Rate Limits**: Respeitar limites dos provedores
- **Cache**: 60s com stale-while-revalidate

### Fallbacks:
- **Sem Imagens**: Busca automática semântica
- **Falha na Busca**: Wikimedia como fallback
- **Erro Total**: Slides sem imagens (não quebra a aula)

## 🎯 Próximos Passos

1. **Analytics**: Rastrear uso de imagens por professores
2. **Favoritos**: Sistema de imagens favoritas por usuário
3. **Upload**: Permitir upload de imagens próprias
4. **IA Visual**: Geração automática de imagens com IA
5. **Colaboração**: Compartilhamento de bibliotecas de imagens

## 📚 Documentação Relacionada

- [Sistema de Busca Semântica](./SEMANTIC_IMAGES_README.md)
- [API de Imagens](./app/api/semantic-images/route.ts)
- [Componentes React](./components/semantic-images/)
- [Hook useSemanticImages](./hooks/useSemanticImages.ts)

---

**Status**: ✅ **Integração Completa e Funcional**

A busca semântica de imagens está totalmente integrada ao módulo `/aulas` e pronta para uso em produção!
