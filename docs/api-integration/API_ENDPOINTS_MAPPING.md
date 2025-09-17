# 🔌 Mapeamento Detalhado de APIs para Aula de Fotossíntese

## 📋 Resumo Executivo

Este documento fornece endpoints específicos, campos de dados e exemplos de implementação para integrar as APIs públicas na aula de fotossíntese do HE-next.

---

## 🌐 APIs por Bloco de Aula

### Bloco 1: Contexto Visual 🖼️

#### Unsplash API
```typescript
// Endpoint
GET https://api.unsplash.com/search/photos?query=chloroplast+leaf&per_page=5&orientation=landscape

// Headers
Authorization: Client-ID YOUR_ACCESS_KEY

// Campos utilizados
interface UnsplashResponse {
  results: Array<{
    id: string;
    urls: {
      regular: string;    // Imagem principal
      thumb: string;      // Thumbnail
    };
    alt_description: string;  // Alt text para acessibilidade
    user: {
      name: string;       // Atribuição
      links: {
        html: string;     // Link do fotógrafo
      };
    };
    links: {
      html: string;       // Link da imagem
    };
  }>;
}
```

#### Pexels API
```typescript
// Endpoint
GET https://api.pexels.com/v1/search?query=photosynthesis+forest&per_page=3&orientation=landscape

// Headers
Authorization: YOUR_API_KEY

// Campos utilizados
interface PexelsResponse {
  photos: Array<{
    id: number;
    src: {
      large: string;     // Imagem principal
      medium: string;    // Imagem média
    };
    alt: string;         // Descrição alternativa
    photographer: string; // Atribuição
    photographer_url: string;
  }>;
}
```

#### Pixabay API
```typescript
// Endpoint
GET https://pixabay.com/api/?key=YOUR_KEY&q=plant+cell+microscope&image_type=photo&per_page=4&safesearch=true

// Campos utilizados
interface PixabayResponse {
  hits: Array<{
    id: number;
    webformatURL: string;    // Imagem principal
    previewURL: string;      // Thumbnail
    tags: string;            // Tags para contexto
    user: string;            // Username do autor
    userImageURL: string;    // Avatar do autor
  }>;
}
```

---

### Bloco 2: Mundo Real 🌍

#### iNaturalist API
```typescript
// Endpoint
GET https://api.inaturalist.org/v1/observations?taxon_id=47126&per_page=10&order=desc&order_by=created_at&quality_grade=research

// Campos utilizados
interface iNaturalistResponse {
  results: Array<{
    id: number;
    species_guess: string;   // Nome da espécie
    place_guess: string;      // Localização
    observed_on: string;      // Data da observação
    photos: Array<{
      url: string;           // URL da foto
      attribution: string;    // Atribuição
    }>;
    user: {
      login: string;         // Username do observador
      icon: string;          // Avatar
    };
    location: string;        // Coordenadas (se disponível)
  }>;
}
```

#### GBIF API
```typescript
// Endpoint
GET https://api.gbif.org/v1/occurrence/search?taxonKey=6&country=BR&limit=20&hasCoordinate=true

// Campos utilizados
interface GBIFResponse {
  results: Array<{
    species: string;         // Nome científico
    country: string;         // País
    decimalLatitude: number; // Latitude
    decimalLongitude: number; // Longitude
    year: number;           // Ano da observação
    basisOfRecord: string;   // Tipo de registro
    datasetName: string;     // Fonte dos dados
  }>;
}
```

#### Encyclopedia of Life (EOL)
```typescript
// Endpoint
GET https://eol.org/api/pages/1.0/1045608.json?images=10&texts=2&videos=0&sounds=0&maps=0&subjects=overview&licenses=all&details=true

// Campos utilizados
interface EOLResponse {
  dataObjects: Array<{
    title: string;          // Nome da espécie
    summary: string;         // Descrição resumida
    dataObjectURL: string;   // URL do objeto
    mimeType: string;       // Tipo de mídia
    agents: Array<{
      full_name: string;     // Autor do conteúdo
    }>;
  }>;
  taxonConcept: {
    scientificName: string;  // Nome científico
    commonNames: Array<{
      name: string;          // Nome comum
      language: string;     // Idioma
    }>;
  };
}
```

---

### Bloco 3: Dentro da Célula 🔬

#### RCSB PDB API
```typescript
// Endpoint
GET https://data.rcsb.org/rest/v1/core/entry/1FE1

// Campos utilizados
interface PDBResponse {
  entry: {
    id: string;             // ID da estrutura
    title: string;           // Título da estrutura
    experimental_method: string; // Método experimental
    resolution: number;      // Resolução em Angstroms
    deposition_date: string; // Data de depósito
  };
  struct: {
    title: string;          // Título da estrutura
    pdbx_descriptor: string; // Descrição
  };
  citation: Array<{
    title: string;          // Título do artigo
    journal_abbrev: string; // Revista
    year: number;           // Ano de publicação
  }>;
}
```

#### UniProt API
```typescript
// Endpoint
GET https://rest.uniprot.org/uniprotkb/P12345.json

// Campos utilizados
interface UniProtResponse {
  proteinName: string;       // Nome da proteína
  organism: {
    scientificName: string; // Nome científico
    commonName: string;     // Nome comum
  };
  function: string;          // Função da proteína
  pathway: Array<{
    name: string;           // Nome da via metabólica
  }>;
  sequence: {
    value: string;          // Sequência de aminoácidos
    length: number;         // Comprimento
  };
  gene: Array<{
    geneName: {
      value: string;       // Nome do gene
    };
  }>;
}
```

---

### Bloco 4: Leitura Guiada 📚

#### Wikimedia API
```typescript
// Endpoint
GET https://en.wikipedia.org/api/rest_v1/page/summary/Photosynthesis

// Campos utilizados
interface WikimediaResponse {
  title: string;            // Título da página
  extract: string;           // Resumo do conteúdo
  content_urls: {
    desktop: {
      page: string;          // URL da página completa
    };
  };
  thumbnail: {
    source: string;          // URL da imagem
    width: number;
    height: number;
  };
  originalimage: {
    source: string;          // URL da imagem original
  };
}
```

#### Wikidata SPARQL
```typescript
// Endpoint
POST https://query.wikidata.org/sparql

// Query
const query = `
SELECT ?item ?itemLabel WHERE {
  ?item wdt:P31 wd:Q11173 .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en" }
} LIMIT 10
`;

// Campos utilizados
interface WikidataResponse {
  results: {
    bindings: Array<{
      item: {
        value: string;       // URI do item
      };
      itemLabel: {
        value: string;       // Label do item
      };
    }>;
  };
}
```

---

### Bloco 5: Impacto Planetário 🌍

#### NASA Image & Video Library
```typescript
// Endpoint
GET https://images-api.nasa.gov/search?q=vegetation+satellite&media_type=image&year_start=2020

// Campos utilizados
interface NASAResponse {
  collection: {
    items: Array<{
      data: Array<{
        title: string;       // Título da imagem
        description: string; // Descrição
        keywords: Array<string>; // Palavras-chave
        date_created: string; // Data de criação
      }>;
      links: Array<{
        href: string;        // URL da imagem
        rel: string;         // Tipo de link
      }>;
    }>;
  };
}
```

#### OpenAlex API
```typescript
// Endpoint
GET https://api.openalex.org/works?search=photosynthesis+climate&per_page=5&sort=cited_by_count:desc

// Campos utilizados
interface OpenAlexResponse {
  results: Array<{
    title: string;           // Título do artigo
    authorships: Array<{
      author: {
        display_name: string; // Nome do autor
        orcid: string;       // ORCID ID
      };
    }>;
    publication_year: number; // Ano de publicação
    cited_by_count: number;   // Número de citações
    doi: string;             // DOI do artigo
    abstract_inverted_index: object; // Resumo indexado
    concepts: Array<{
      display_name: string;  // Conceito relacionado
      score: number;         // Relevância
    }>;
  }>;
}
```

---

## 🔧 Implementação Prática

### Serviço de Integração
```typescript
// lib/api-services/photosynthesis-integration.ts
export class PhotosynthesisAPIIntegration {
  private readonly API_KEYS = {
    unsplash: process.env.UNSPLASH_ACCESS_KEY,
    pexels: process.env.PEXELS_API_KEY,
    pixabay: process.env.PIXABAY_API_KEY,
    nasa: process.env.NASA_API_KEY, // Opcional
  };

  async getVisualContext(): Promise<VisualContextData> {
    const [unsplash, pexels, pixabay] = await Promise.allSettled([
      this.fetchUnsplash(),
      this.fetchPexels(),
      this.fetchPixabay()
    ]);

    return {
      unsplash: unsplash.status === 'fulfilled' ? unsplash.value : null,
      pexels: pexels.status === 'fulfilled' ? pexels.value : null,
      pixabay: pixabay.status === 'fulfilled' ? pixabay.value : null,
    };
  }

  private async fetchUnsplash(): Promise<UnsplashResponse> {
    const response = await fetch(
      'https://api.unsplash.com/search/photos?query=chloroplast+leaf&per_page=5&orientation=landscape',
      {
        headers: {
          'Authorization': `Client-ID ${this.API_KEYS.unsplash}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    return response.json();
  }

  private async fetchPexels(): Promise<PexelsResponse> {
    const response = await fetch(
      'https://api.pexels.com/v1/search?query=photosynthesis+forest&per_page=3&orientation=landscape',
      {
        headers: {
          'Authorization': this.API_KEYS.pexels,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    return response.json();
  }

  private async fetchPixabay(): Promise<PixabayResponse> {
    const response = await fetch(
      `https://pixabay.com/api/?key=${this.API_KEYS.pixabay}&q=plant+cell+microscope&image_type=photo&per_page=4&safesearch=true`
    );
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }
    
    return response.json();
  }

  // ... outros métodos para diferentes blocos
}
```

### Cache Inteligente
```typescript
// lib/cache/api-cache.ts
export class APICache {
  private static readonly CACHE_PREFIX = 'photosynthesis_api_';
  private static readonly CACHE_DURATION = {
    images: 7 * 24 * 60 * 60 * 1000,    // 7 dias para imagens
    data: 24 * 60 * 60 * 1000,          // 1 dia para dados
    research: 7 * 24 * 60 * 60 * 1000,  // 7 dias para pesquisa
  };

  static async get<T>(key: string, type: keyof typeof APICache.CACHE_DURATION): Promise<T | null> {
    try {
      const cached = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const duration = this.CACHE_DURATION[type];
        
        if (Date.now() - timestamp < duration) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    
    return null;
  }

  static async set<T>(key: string, data: T, type: keyof typeof APICache.CACHE_DURATION): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        type,
      };
      
      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }
}
```

### Rate Limiting e Fallbacks
```typescript
// lib/api-services/rate-limiter.ts
export class APIRateLimiter {
  private static readonly LIMITS = {
    unsplash: { requests: 50, window: 60 * 60 * 1000 }, // 50 req/hora
    pexels: { requests: 200, window: 60 * 60 * 1000 },  // 200 req/hora
    pixabay: { requests: 5000, window: 60 * 60 * 1000 }, // 5000 req/hora
    nasa: { requests: 1000, window: 60 * 60 * 1000 },   // 1000 req/hora
  };

  private static requestCounts = new Map<string, { count: number; resetTime: number }>();

  static canMakeRequest(apiName: keyof typeof APIRateLimiter.LIMITS): boolean {
    const limit = this.LIMITS[apiName];
    const now = Date.now();
    const current = this.requestCounts.get(apiName);

    if (!current || now > current.resetTime) {
      this.requestCounts.set(apiName, { count: 1, resetTime: now + limit.window });
      return true;
    }

    if (current.count >= limit.requests) {
      return false;
    }

    current.count++;
    return true;
  }

  static getFallbackData(apiName: string): any {
    const fallbacks = {
      unsplash: {
        results: [{
          id: 'fallback-1',
          urls: { regular: '/images/fallback-leaf.jpg' },
          alt_description: 'Green leaf with chloroplasts',
          user: { name: 'HE-next Team' }
        }]
      },
      pexels: {
        photos: [{
          id: 1,
          src: { large: '/images/fallback-forest.jpg' },
          alt: 'Tropical forest',
          photographer: 'HE-next Team'
        }]
      },
      // ... outros fallbacks
    };

    return fallbacks[apiName] || null;
  }
}
```

---

## 📊 Monitoramento e Métricas

### Logging de Uso
```typescript
// lib/analytics/api-usage.ts
export class APIUsageAnalytics {
  static trackAPICall(apiName: string, endpoint: string, success: boolean, responseTime: number) {
    const event = {
      timestamp: new Date().toISOString(),
      api: apiName,
      endpoint,
      success,
      responseTime,
      userAgent: navigator.userAgent,
    };

    // Enviar para serviço de analytics
    this.sendToAnalytics(event);
  }

  static trackCacheHit(apiName: string, cacheKey: string) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'cache_hit',
      api: apiName,
      cacheKey,
    };

    this.sendToAnalytics(event);
  }

  private static sendToAnalytics(event: any) {
    // Implementar envio para serviço de analytics
    console.log('API Analytics:', event);
  }
}
```

---

## 🎯 Benefícios da Implementação

1. **Conteúdo Dinâmico**: Aulas sempre atualizadas com dados reais
2. **Engajamento**: Imagens e dados reais despertam interesse
3. **Conexão Global**: Dados de diferentes partes do mundo
4. **Científico**: Informações de fontes confiáveis e atualizadas
5. **Interativo**: Múltiplas formas de interação com o conteúdo
6. **Acessível**: Fallbacks garantem funcionamento offline
7. **Escalável**: Cache inteligente reduz custos de API
8. **Monitorado**: Métricas de uso para otimização contínua

Este mapeamento detalhado fornece tudo que é necessário para implementar a integração das APIs na aula de fotossíntese, com foco em robustez, performance e experiência do usuário.
