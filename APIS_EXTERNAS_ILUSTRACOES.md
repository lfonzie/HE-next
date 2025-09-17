# APIs Externas Públicas para Ilustrações Educacionais

## 🎨 APIs de Imagens Gratuitas

### 1. **Unsplash API** ⭐ (Recomendado)
- **URL**: https://api.unsplash.com
- **Limite**: 50 requisições/hora (gratuito)
- **Qualidade**: Excelente (alta resolução)
- **Educacional**: ✅ Boa para conceitos científicos
- **Exemplo**: `https://api.unsplash.com/search/photos?query=photosynthesis&per_page=10`

```javascript
// Exemplo de uso
const response = await fetch('https://api.unsplash.com/search/photos?query=photosynthesis&per_page=10', {
  headers: {
    'Authorization': 'Client-ID SUA_CHAVE_AQUI'
  }
});
```

### 2. **Pixabay API** ⭐ (Recomendado)
- **URL**: https://pixabay.com/api/
- **Limite**: 5.000 requisições/hora (gratuito)
- **Qualidade**: Boa
- **Educacional**: ✅ Excelente para educação
- **Exemplo**: `https://pixabay.com/api/?key=SUA_CHAVE&q=photosynthesis&image_type=photo`

```javascript
// Exemplo de uso
const response = await fetch('https://pixabay.com/api/?key=SUA_CHAVE&q=photosynthesis&image_type=photo&per_page=20');
```

### 3. **Pexels API** ⭐ (Recomendado)
- **URL**: https://api.pexels.com/v1
- **Limite**: 200 requisições/hora (gratuito)
- **Qualidade**: Excelente
- **Educacional**: ✅ Boa para conceitos gerais
- **Exemplo**: `https://api.pexels.com/v1/search?query=photosynthesis&per_page=15`

```javascript
// Exemplo de uso
const response = await fetch('https://api.pexels.com/v1/search?query=photosynthesis&per_page=15', {
  headers: {
    'Authorization': 'SUA_CHAVE_AQUI'
  }
});
```

## 🔬 APIs Especializadas em Educação/Ciência

### 4. **Wikimedia Commons API**
- **URL**: https://commons.wikimedia.org/w/api.php
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Variável (mas muitas imagens educacionais)
- **Educacional**: ✅ Excelente para ciência
- **Exemplo**: `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=photosynthesis&format=json`

```javascript
// Exemplo de uso
const response = await fetch('https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=photosynthesis&format=json');
```

### 5. **OpenClipart API**
- **URL**: https://openclipart.org/api
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Ilustrações vetoriais
- **Educacional**: ✅ Excelente para diagramas
- **Exemplo**: `https://openclipart.org/api/search?query=photosynthesis`

### 6. **Flaticon API**
- **URL**: https://api.flaticon.com/v2
- **Limite**: 100 requisições/mês (gratuito)
- **Qualidade**: Excelente (ícones e ilustrações)
- **Educacional**: ✅ Boa para ícones científicos
- **Exemplo**: `https://api.flaticon.com/v2/search?query=science&limit=20`

## 🎓 APIs Educacionais Específicas

### 7. **NASA Image and Video Library**
- **URL**: https://images-api.nasa.gov
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Excelente
- **Educacional**: ✅ Perfeito para astronomia/física
- **Exemplo**: `https://images-api.nasa.gov/search?q=solar%20energy&media_type=image`

### 8. **Smithsonian Open Access API**
- **URL**: https://api.si.edu/openaccess/api/v1.0
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Excelente (museus)
- **Educacional**: ✅ Excelente para história/ciência
- **Exemplo**: `https://api.si.edu/openaccess/api/v1.0/search?q=biology&rows=20`

### 9. **Europeana API**
- **URL**: https://www.europeana.eu/api/v2
- **Limite**: 5.000 requisições/dia (gratuito)
- **Qualidade**: Variável (patrimônio cultural)
- **Educacional**: ✅ Boa para história/arte
- **Exemplo**: `https://www.europeana.eu/api/v2/search.json?query=science&rows=12`

## 🧪 APIs Científicas Especializadas

### 10. **PubMed Central Images**
- **URL**: https://www.ncbi.nlm.nih.gov/pmc/
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Excelente (artigos científicos)
- **Educacional**: ✅ Perfeito para biologia/medicina
- **Exemplo**: `https://www.ncbi.nlm.nih.gov/pmc/?term=photosynthesis[title]&report=images`

### 11. **PLOS ONE API**
- **URL**: https://api.plos.org/search
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Excelente (artigos científicos)
- **Educacional**: ✅ Excelente para pesquisa científica
- **Exemplo**: `https://api.plos.org/search?q=photosynthesis&rows=10&fl=id,title,abstract`

## 🎨 APIs de Ilustrações e Diagramas

### 12. **Noun Project API**
- **URL**: https://api.thenounproject.com
- **Limite**: 500 requisições/mês (gratuito)
- **Qualidade**: Excelente (ícones)
- **Educacional**: ✅ Boa para ícones científicos
- **Exemplo**: `https://api.thenounproject.com/icons/photosynthesis?limit=20`

### 13. **Iconfinder API**
- **URL**: https://api.iconfinder.com/v4
- **Limite**: 100 requisições/mês (gratuito)
- **Qualidade**: Excelente (ícones)
- **Educacional**: ✅ Boa para ícones educacionais
- **Exemplo**: `https://api.iconfinder.com/v4/icons/search?query=science&count=20`

## 🌐 APIs de Conteúdo Educacional

### 14. **Khan Academy API**
- **URL**: https://www.khanacademy.org/api/v1
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Excelente (conteúdo educacional)
- **Educacional**: ✅ Perfeito para educação
- **Exemplo**: `https://www.khanacademy.org/api/v1/topics/biology`

### 15. **CK-12 API**
- **URL**: https://api.ck12.org
- **Limite**: Sem limite (gratuito)
- **Qualidade**: Boa (recursos educacionais)
- **Educacional**: ✅ Excelente para educação K-12
- **Exemplo**: `https://api.ck12.org/flexbook/biology/photosynthesis`

## 🔧 Implementação Prática

### Exemplo de Integração Múltipla:

```javascript
// Função para buscar em múltiplas APIs
async function searchMultipleAPIs(query) {
  const apis = [
    {
      name: 'Unsplash',
      url: `https://api.unsplash.com/search/photos?query=${query}&per_page=5`,
      headers: { 'Authorization': 'Client-ID SUA_CHAVE_UNSPLASH' }
    },
    {
      name: 'Pixabay',
      url: `https://pixabay.com/api/?key=SUA_CHAVE_PIXABAY&q=${query}&per_page=5`
    },
    {
      name: 'Pexels',
      url: `https://api.pexels.com/v1/search?query=${query}&per_page=5`,
      headers: { 'Authorization': 'SUA_CHAVE_PEXELS' }
    }
  ];

  const results = await Promise.allSettled(
    apis.map(async (api) => {
      const response = await fetch(api.url, { headers: api.headers });
      const data = await response.json();
      return { source: api.name, data };
    })
  );

  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
}
```

### Exemplo Específico para Fotossíntese:

```javascript
// Busca otimizada para fotossíntese
async function searchPhotosynthesisImages() {
  const queries = [
    'photosynthesis',
    'chlorophyll',
    'plant biology',
    'light reaction',
    'calvin cycle'
  ];

  const allImages = [];
  
  for (const query of queries) {
    // Unsplash
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=3`,
      { headers: { 'Authorization': 'Client-ID SUA_CHAVE' } }
    );
    const unsplashData = await unsplashResponse.json();
    
    // Pixabay
    const pixabayResponse = await fetch(
      `https://pixabay.com/api/?key=SUA_CHAVE&q=${query}&per_page=3`
    );
    const pixabayData = await pixabayResponse.json();
    
    allImages.push(...unsplashData.results, ...pixabayData.hits);
  }
  
  return allImages;
}
```

## 📊 Comparação de APIs

| API | Limite Gratuito | Qualidade | Educacional | Facilidade |
|-----|----------------|-----------|-------------|------------|
| Unsplash | 50/hora | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Pixabay | 5.000/hora | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Pexels | 200/hora | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Wikimedia | Ilimitado | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| NASA | Ilimitado | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Smithsonian | Ilimitado | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Recomendações por Uso

### Para Fotossíntese Especificamente:
1. **Pixabay** - Maior variedade de imagens educacionais
2. **Wikimedia Commons** - Imagens científicas de alta qualidade
3. **Unsplash** - Imagens de plantas e natureza
4. **NASA** - Para aspectos de energia solar

### Para Educação Geral:
1. **Pixabay** - Melhor custo-benefício
2. **Unsplash** - Melhor qualidade visual
3. **Pexels** - Boa qualidade e facilidade
4. **Khan Academy** - Conteúdo educacional específico

### Para Diagramas Científicos:
1. **Wikimedia Commons** - Diagramas técnicos
2. **OpenClipart** - Ilustrações vetoriais
3. **Noun Project** - Ícones científicos
4. **PubMed Central** - Imagens de artigos científicos

## 🚀 Implementação Recomendada

Para o seu projeto, recomendo usar uma combinação de:

1. **Pixabay** (principal) - 5.000 req/hora, excelente para educação
2. **Unsplash** (secundária) - 50 req/hora, alta qualidade
3. **Pexels** (terciária) - 200 req/hora, boa qualidade
4. **Wikimedia Commons** (fallback) - ilimitado, imagens científicas

Esta combinação oferece:
- ✅ Alto volume de requisições
- ✅ Diversidade de fontes
- ✅ Qualidade educacional
- ✅ Fallback para casos especiais
- ✅ Custo zero
