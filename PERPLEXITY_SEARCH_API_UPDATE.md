# ✅ Perplexity Search API - Atualização Completa

## 🔄 Migração para Nova Search API

A integração do Perplexity foi atualizada para usar a nova **Search API** oficial, conforme documentação em [https://docs.perplexity.ai/guides/search-quickstart](https://docs.perplexity.ai/guides/search-quickstart).

## 📦 Pacotes Instalados

### 1. SDK Oficial Perplexity
```bash
npm install @perplexity-ai/perplexity_ai
```

### 2. Removido Pacote Incorreto
```bash
npm uninstall perplexityai  # Era um web scraper, não a API oficial
```

## 🔧 Arquivos Atualizados

### 1. **lib/providers/perplexity.ts**
- ✅ Migrado para usar `@perplexity-ai/perplexity_ai`
- ✅ Implementado `client.search.create()` em vez de chat completions
- ✅ Suporte para busca regional (`country` parameter)
- ✅ Suporte para multi-query search
- ✅ Controle de extração de conteúdo (`max_tokens_per_page`)

### 2. **app/api/chat/perplexity/route.ts**
- ✅ Atualizado para usar nova Search API
- ✅ Removido streaming (Search API não suporta streaming nativo)
- ✅ Implementado formatação de resultados de busca
- ✅ Headers atualizados para refletir mudança

### 3. **lib/model-pricing.ts**
- ✅ Preços atualizados para Search API
- ✅ Modelo renomeado de `sonar` para `search-api`
- ✅ Custos reduzidos: $0.50 entrada/saída por 1M tokens

## 🆕 Funcionalidades da Nova Search API

### Busca Básica
```typescript
const searchResult = await client.search.create({
  query: "latest AI developments 2024",
  max_results: 5,
  max_tokens_per_page: 1024
});
```

### Busca Regional
```typescript
const regionalSearch = await client.search.create({
  query: "government policies on renewable energy",
  country: "US",  // ISO country code
  max_results: 5
});
```

### Multi-Query Search
```typescript
const multiSearch = await client.search.create({
  query: [
    "artificial intelligence trends 2024",
    "machine learning breakthroughs recent",
    "AI applications in healthcare"
  ],
  max_results: 5
});
```

### Controle de Extração de Conteúdo
```typescript
const detailedSearch = await client.search.create({
  query: "artificial intelligence research methodology",
  max_results: 5,
  max_tokens_per_page: 2048  // Mais conteúdo extraído
});
```

## 💰 Preços Atualizados

### Search API vs Sonar (Anterior)
| Modelo | Entrada | Saída | Contexto | Uso |
|--------|---------|-------|----------|-----|
| **Search API** | $0.50/M | $0.50/M | 128K | API de busca otimizada |
| ~~Sonar~~ | ~~$1.00/M~~ | ~~$1.00/M~~ | ~~128K~~ | ~~Depreciado~~ |

### Comparação de Custos (1000 entrada + 500 saída)
| Modelo | Custo USD | Custo BRL | Posição |
|--------|-----------|-----------|---------|
| **Gemini 1.5 Flash** | $0.000225 | R$ 0.0012 | 1º (mais barato) |
| **GPT-4o Mini** | $0.00045 | R$ 0.0023 | 2º |
| **Perplexity Search** | $0.00075 | R$ 0.0039 | 3º |
| **GPT-5** | $0.00525 | R$ 0.027 | 4º (mais caro) |

## ⚠️ Requisitos Importantes

### 1. Nova Chave de API
A Search API requer uma **nova chave de API** criada após o cutoff da API antiga:

```
❌ Erro: 451 {"error":{"message":"This endpoint requires a new API key. Create one at: https://www.perplexity.ai/account/api/keys","type":"api_key_created_before_search_api_cutoff","code":451}}
```

**Solução:** Criar nova chave em [https://www.perplexity.ai/account/api/keys](https://www.perplexity.ai/account/api/keys)

### 2. Variáveis de Ambiente
```env
# .env.local
PERPLEXITY_API_KEY=nova_chave_de_api_aqui
```

## 🧪 Teste da Integração

### Script de Teste
```bash
node test-perplexity-search-api.js
```

### Funcionalidades Testadas
- ✅ Busca básica
- ✅ Busca regional
- ✅ Multi-query search
- ✅ Controle de extração de conteúdo
- ✅ Tratamento de erros

## 📊 Estrutura de Resposta

```typescript
interface SearchResult {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    date?: string;
    last_updated?: string;
  }>;
  id: string;
}
```

## 🔄 Migração de Código Existente

### Antes (Chat Completions)
```typescript
const response = await fetch("https://api.perplexity.ai/chat/completions", {
  method: "POST",
  headers: { "Authorization": `Bearer ${apiKey}` },
  body: JSON.stringify({
    model: "sonar",
    messages: [...],
    stream: false
  })
});
```

### Depois (Search API)
```typescript
const client = new Perplexity({ apiKey });
const searchResult = await client.search.create({
  query: "search query",
  max_results: 5,
  max_tokens_per_page: 1024
});
```

## 🎯 Benefícios da Nova API

1. **Custos Reduzidos**: 50% mais barato que Sonar
2. **Busca Otimizada**: Focada especificamente em busca web
3. **Funcionalidades Avançadas**: Regional, multi-query, controle de conteúdo
4. **SDK Oficial**: Type-safe com TypeScript
5. **Documentação Atualizada**: Guias oficiais e exemplos

## 📝 Próximos Passos

1. **Criar Nova Chave de API** em [Perplexity API Keys](https://www.perplexity.ai/account/api/keys)
2. **Atualizar Variável de Ambiente** no `.env.local`
3. **Testar Integração** com o script fornecido
4. **Monitorar Custos** com os novos preços
5. **Atualizar Documentação** do projeto

## 🔗 Links Úteis

- [Perplexity Search API Quickstart](https://docs.perplexity.ai/guides/search-quickstart)
- [Perplexity API Keys](https://www.perplexity.ai/account/api/keys)
- [SDK Oficial NPM](https://www.npmjs.com/package/@perplexity-ai/perplexity_ai)
- [Documentação Completa](https://docs.perplexity.ai/)

---

**Status:** ✅ **COMPLETO** - Integração atualizada para nova Search API
**Data:** Janeiro 2025
**Versão:** 0.0.46
