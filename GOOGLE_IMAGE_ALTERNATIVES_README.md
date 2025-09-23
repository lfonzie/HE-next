# 🔍 Bing Image Search API + Pexels API Implementation

Este documento descreve a implementação do Bing Image Search API e Pexels API para o sistema de busca de imagens educacionais do HubEdu.

## 🎯 Visão Geral

Implementamos duas APIs principais para busca de imagens educacionais: **Bing Image Search API** e **Pexels API**, oferecendo uma solução robusta e confiável com diversidade de fontes.

## 🚀 APIs Implementadas

### 1. **Bing Image Search API** 🔎
- **Descrição**: API oficial da Microsoft para busca de imagens
- **Vantagens**: API oficial, boa qualidade, metadados ricos, confiável, vasta base de dados
- **Limitações**: Requer API key
- **Plano Gratuito**: 1.000 consultas/mês
- **Custo**: A partir de $7/mês
- **Documentação**: https://azure.microsoft.com/en-us/services/cognitive-services/bing-image-search-api/

### 2. **Pexels API** 📸
- **Descrição**: Banco de fotos stock de alta qualidade
- **Vantagens**: Imagens profissionais, licenças claras, alta qualidade, gratuito
- **Limitações**: Foco em fotos stock, não busca web
- **Plano Gratuito**: 200 consultas/hora
- **Custo**: Gratuito com limites
- **Documentação**: https://www.pexels.com/api/documentation/

## 🔧 Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Bing Image Search API
BING_SEARCH_API_KEY=your_bing_search_api_key_here

# Pexels API - High-quality stock photos
PEXELS_API_KEY=your_pexels_api_key_here
```

### Como Obter as Chaves

**Bing Search API**:
- Crie uma conta Azure em https://azure.microsoft.com/
- Crie um recurso "Bing Search v7"
- Obtenha a chave de API
- Plano gratuito: 1.000 consultas/mês

**Pexels API**:
- Registre-se em https://www.pexels.com/api/
- Obtenha sua API key
- Plano gratuito: 200 consultas/hora

## 📁 Estrutura de Arquivos

```
lib/services/
└── google-image-alternatives.ts

app/api/images/
└── google-alternatives/
    └── route.ts

env.google-image-alternatives.example
```

## 🎮 Como Usar

### API Endpoint

```bash
POST /api/images/google-alternatives
```

**Parâmetros:**
```json
{
  "query": "photosynthesis biology",
  "subject": "biologia",
  "count": 3,
  "safeSearch": true,
  "imageType": "photo",
  "color": "color",
  "size": "large",
  "aspectRatio": "wide",
  "orientation": "horizontal"
}
```

### Integração com Sistema Existente

O serviço é automaticamente integrado ao sistema de busca de imagens existente:

```typescript
// Uso direto
import { googleImageAlternativesService } from '@/lib/services/google-image-alternatives';

const results = await googleImageAlternativesService.searchImages({
  query: "mathematics equations",
  subject: "matemática",
  count: 3
});

// Uso via API existente (com fallback automático)
const response = await fetch('/api/images/enhanced-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "photosynthesis",
    subject: "biologia",
    count: 3,
    useGoogleAlternatives: true
  })
});
```

## 🔄 Fluxo de Busca

1. **Cache Check**: Verifica cache primeiro (30 min)
2. **Bing Images**: Busca principal usando Bing Image Search API
3. **Pexels Images**: Busca secundária usando Pexels API
4. **Fallback**: Se ambos falharem, usa provedores existentes (Unsplash, Pixabay, Wikimedia)
5. **Scoring**: Pontuação por relevância, adequação educacional e qualidade
6. **Deduplication**: Remove duplicatas por URL
7. **Ranking**: Ordena por score combinado
8. **Cache**: Armazena resultados para próximas consultas

## 📊 Sistema de Pontuação

### Relevância (40% do score final)
- Correspondências exatas com query
- Termos específicos do assunto
- Palavras-chave educacionais
- Penalização por conteúdo não educacional

### Adequação Educacional (40% do score final)
- Confiabilidade da fonte
- Qualidade da imagem
- Tags educacionais
- Conteúdo apropriado para educação

### Qualidade (20% do score final)
- Resolução da imagem
- Proporção adequada para slides
- Aspecto técnico

## 🎯 Casos de Uso Educacionais

### Matemática
- Equações e fórmulas
- Gráficos e diagramas
- Geometria e formas
- Cálculos e números

### Ciências
- Experimentos de laboratório
- Microorganismos e células
- Fenômenos naturais
- Equipamentos científicos

### História
- Artefatos históricos
- Monumentos e locais
- Figuras históricas
- Períodos e civilizações

### Geografia
- Paisagens e relevos
- Mapas e cartografia
- Clima e meio ambiente
- Culturas e sociedades

## 🔒 Segurança e Privacidade

- Todas as chaves de API são armazenadas como variáveis de ambiente
- Validação de entrada em todas as rotas
- Sanitização de queries de busca
- Tratamento seguro de erros
- Logs de auditoria para monitoramento

## 📈 Métricas e Monitoramento

### Logs Implementados
- ✅ Sucesso de busca por provedor
- ❌ Falhas de API
- 🔄 Fallbacks utilizados
- 📊 Tempo de resposta
- 💾 Cache hits/misses

### Métricas Sugeridas
- Taxa de sucesso por provedor
- Tempo médio de resposta
- Qualidade dos resultados
- Uso de cache
- Custo por consulta

## 🚀 Próximos Passos

### Melhorias Planejadas
1. **Implementação completa do DuckDuckGo** com serviço de scraping
2. **Cache Redis** para melhor performance
3. **Métricas avançadas** com Prometheus
4. **A/B Testing** entre provedores
5. **Machine Learning** para melhorar scoring
6. **CDN Integration** para otimizar carregamento

### Novos Provedores
1. **Shutterstock API** - Banco de imagens premium
2. **Getty Images API** - Imagens profissionais
3. **Flickr API** - Banco de imagens da comunidade
4. **Google Custom Search** - Como fallback oficial

## 🐛 Troubleshooting

### Problemas Comuns

1. **"API key not configured"**
   - Verifique se as variáveis de ambiente estão definidas
   - Confirme se as chaves são válidas

2. **"Search failed"**
   - Verifique conectividade de rede
   - Confirme limites de API
   - Verifique logs para detalhes específicos

3. **"No results found"**
   - Tente queries mais específicas
   - Verifique se o assunto está correto
   - Use fallback para provedores existentes

### Logs de Debug

```bash
# Habilitar logs detalhados
DEBUG=google-image-alternatives npm run dev

# Verificar cache
curl "http://localhost:3000/api/images/google-alternatives" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "count": 1}'
```

## 📚 Referências

- [SerpAPI Documentation](https://serpapi.com/)
- [Bing Image Search API](https://docs.microsoft.com/en-us/azure/cognitive-services/bing-image-search/)
- [Pexels API Documentation](https://www.pexels.com/api/)
- [Google Image Search API Alternatives](https://scrapfly.io/blog/guide-to-google-image-search-api-and-alternatives/)

## 🤝 Contribuição

Para contribuir com melhorias:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente testes
4. Documente as mudanças
5. Submeta um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.
