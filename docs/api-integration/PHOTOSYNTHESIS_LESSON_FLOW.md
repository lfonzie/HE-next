# 🌱 Fluxo de Aula Interativa: Fotossíntese
## Integração com APIs Públicas para Conteúdo Rico

### 📋 Visão Geral

Este documento define um fluxo completo de aula interativa sobre fotossíntese, integrando APIs públicas para criar uma experiência educacional rica em mídia, dados reais e atividades práticas. O fluxo é projetado para funcionar com a arquitetura existente do HE-next.

### 🏗️ Arquitetura de Integração

```
HE-next Lesson System
├── Lesson Generation API (/api/generate-lesson)
├── Dynamic Stage Component
├── Interactive Components (Quiz, Drawing, Animation, etc.)
└── API Integration Layer
    ├── External API Services
    ├── Caching Layer (Redis/LocalStorage)
    ├── Media Processing
    └── Offline Fallback
```

### 🎯 Fluxo de Aula: 6 Blocos Interativos

## Bloco 1: "Contexto Visual" 🖼️
**Objetivo**: Despertar curiosidade e contextualizar o tema

### APIs Utilizadas:
- **Unsplash API**: `https://api.unsplash.com/search/photos?query=chloroplast+leaf&per_page=5`
- **Pexels API**: `https://api.pexels.com/v1/search?query=photosynthesis+forest&per_page=3`
- **Pixabay API**: `https://pixabay.com/api/?key=KEY&q=plant+cell+microscope&image_type=photo&per_page=4`

### Componente HE-next:
```typescript
{
  type: 'reading',
  title: 'O que você vê?',
  html: `
    <div class="visual-context">
      <h3>🌿 Observando a Natureza</h3>
      <div class="image-grid">
        <!-- Imagens dinâmicas das APIs -->
        <img src="${unsplashImage}" alt="Folha com cloroplastos" />
        <img src="${pexelsImage}" alt="Floresta tropical" />
        <img src="${pixabayImage}" alt="Célula vegetal" />
      </div>
      <div class="reflection-questions">
        <p><strong>🤔 Perguntas para reflexão:</strong></p>
        <ul>
          <li>O que essas imagens têm em comum?</li>
          <li>Por que as plantas são verdes?</li>
          <li>Como você acha que a luz solar se transforma em energia?</li>
        </ul>
      </div>
    </div>
  `
}
```

### Dados da API:
```json
{
  "unsplash": {
    "urls": { "regular": "https://..." },
    "alt_description": "Green leaf with visible chloroplasts",
    "user": { "name": "Photographer Name" }
  },
  "pexels": {
    "src": { "large": "https://..." },
    "alt": "Tropical forest canopy",
    "photographer": "Photographer Name"
  },
  "pixabay": {
    "webformatURL": "https://...",
    "tags": "plant, cell, microscope",
    "user": "username"
  }
}
```

---

## Bloco 2: "Mundo Real" 🌍
**Objetivo**: Conectar conceitos com observações reais e distribuição geográfica

### APIs Utilizadas:
- **iNaturalist API**: `https://api.inaturalist.org/v1/observations?taxon_id=47126&per_page=10&order=desc&order_by=created_at`
- **GBIF API**: `https://api.gbif.org/v1/occurrence/search?taxonKey=6&country=BR&limit=20`
- **Encyclopedia of Life**: `https://eol.org/api/pages/1.0/1045608.json?images=10&texts=2`

### Componente HE-next:
```typescript
{
  type: 'quiz',
  title: 'Plantas ao Redor do Mundo',
  question: 'Com base nos dados reais de observações, qual região tem mais diversidade de plantas fotossintetizantes?',
  choices: [
    'Floresta Amazônica (Brasil)',
    'Floresta do Congo (África)',
    'Sudeste Asiático',
    'Todas têm diversidade similar'
  ],
  correctIndex: 0,
  explanation: `
    <div class="real-world-data">
      <h4>📊 Dados Reais do iNaturalist e GBIF:</h4>
      <div class="observation-map">
        <!-- Mapa interativo com pontos de observação -->
        <img src="${gbifMapImage}" alt="Mapa de distribuição global" />
      </div>
      <div class="species-info">
        <h5>🌿 Espécies Observadas Hoje:</h5>
        <ul>
          ${iNaturalistObservations.map(obs => `
            <li>
              <strong>${obs.species_guess}</strong> - ${obs.place_guess}
              <br><small>Observado por: ${obs.user.login}</small>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `
}
```

### Dados da API:
```json
{
  "inaturalist": {
    "results": [
      {
        "id": 12345,
        "species_guess": "Helianthus annuus",
        "place_guess": "São Paulo, SP",
        "observed_on": "2024-01-15",
        "photos": [{"url": "https://..."}],
        "user": {"login": "biologist_user"}
      }
    ]
  },
  "gbif": {
    "results": [
      {
        "species": "Helianthus annuus",
        "country": "Brazil",
        "decimalLatitude": -23.5505,
        "decimalLongitude": -46.6333,
        "year": 2023
      }
    ]
  }
}
```

---

## Bloco 3: "Dentro da Célula" 🔬
**Objetivo**: Explorar estruturas moleculares e processos bioquímicos

### APIs Utilizadas:
- **RCSB PDB**: `https://data.rcsb.org/rest/v1/core/entry/1FE1`
- **UniProt**: `https://rest.uniprot.org/uniprotkb/P12345.json`
- **PDB GraphQL**: `https://data.rcsb.org/graphql`

### Componente HE-next:
```typescript
{
  type: 'whiteboard',
  title: 'Estrutura Molecular do Fotossistema II',
  html: `
    <div class="molecular-exploration">
      <h3>🧬 Zoom Molecular</h3>
      <div class="protein-structure">
        <h4>Estrutura 3D do Fotossistema II (PDB: 1FE1)</h4>
        <div class="pdb-viewer">
          <!-- Integração com 3D viewer -->
          <iframe src="https://3dmol.org/viewer.html?pdbid=1FE1" width="100%" height="400px"></iframe>
        </div>
        <div class="protein-info">
          <h5>📋 Informações da Proteína:</h5>
          <ul>
            <li><strong>Nome:</strong> ${uniprotData.proteinName}</li>
            <li><strong>Função:</strong> ${uniprotData.function}</li>
            <li><strong>Organismo:</strong> ${uniprotData.organism}</li>
            <li><strong>Vias:</strong> ${uniprotData.pathways.join(', ')}</li>
          </ul>
        </div>
      </div>
      <div class="interactive-diagram">
        <h4>🎨 Desenhe o Processo:</h4>
        <p>Use o quadro branco para desenhar como você imagina que a luz solar é capturada e transformada em energia química.</p>
      </div>
    </div>
  `
}
```

### Dados da API:
```json
{
  "pdb": {
    "entry": {
      "id": "1FE1",
      "title": "Photosystem II from Thermosynechococcus vulcanus",
      "experimental_method": "X-RAY DIFFRACTION",
      "resolution": 1.9
    },
    "struct": {
      "title": "Crystal structure of photosystem II"
    }
  },
  "uniprot": {
    "proteinName": "Photosystem II reaction center protein D1",
    "function": "Core subunit of photosystem II",
    "organism": "Thermosynechococcus vulcanus",
    "pathways": ["Photosynthesis", "Electron transport chain"]
  }
}
```

---

## Bloco 4: "Leitura Guiada" 📚
**Objetivo**: Aprofundar conhecimento com conteúdo estruturado

### APIs Utilizadas:
- **Wikimedia API**: `https://en.wikipedia.org/api/rest_v1/page/summary/Photosynthesis`
- **Wikidata SPARQL**: `https://query.wikidata.org/sparql?query=SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q11173 }`
- **Encyclopedia of Life**: `https://eol.org/api/pages/1.0/1045608.json?texts=5&images=5`

### Componente HE-next:
```typescript
{
  type: 'reading',
  title: 'Fotossíntese: O Motor da Vida',
  html: `
    <div class="guided-reading">
      <div class="content-source">
        <p><em>Conteúdo adaptado de: ${wikimediaData.source}</em></p>
      </div>
      
      <div class="main-content">
        <h3>${wikimediaData.title}</h3>
        <div class="extract">
          ${wikimediaData.extract}
        </div>
        
        <div class="knowledge-graph">
          <h4>🔗 Conceitos Relacionados:</h4>
          <div class="related-concepts">
            ${wikidataResults.map(concept => `
              <span class="concept-tag">${concept.itemLabel}</span>
            `).join('')}
          </div>
        </div>
        
        <div class="species-examples">
          <h4>🌱 Exemplos de Espécies:</h4>
          ${eolData.map(species => `
            <div class="species-card">
              <img src="${species.image}" alt="${species.title}" />
              <h5>${species.title}</h5>
              <p>${species.summary}</p>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="comprehension-check">
        <h4>✅ Verificação de Compreensão:</h4>
        <p>Após a leitura, você será capaz de explicar:</p>
        <ul>
          <li>O que é fotossíntese?</li>
          <li>Quais são os produtos da fotossíntese?</li>
          <li>Por que é importante para a vida na Terra?</li>
        </ul>
      </div>
    </div>
  `
}
```

### Dados da API:
```json
{
  "wikimedia": {
    "title": "Photosynthesis",
    "extract": "Photosynthesis is the process used by plants...",
    "source": "Wikipedia",
    "thumbnail": {"source": "https://..."}
  },
  "wikidata": {
    "results": [
      {"item": "Q11173", "itemLabel": "Photosynthesis"},
      {"item": "Q11174", "itemLabel": "Chlorophyll"},
      {"item": "Q11175", "itemLabel": "Carbon dioxide"}
    ]
  },
  "eol": {
    "dataObjects": [
      {
        "title": "Helianthus annuus",
        "summary": "Sunflower is a plant that...",
        "dataObjectURL": "https://..."
      }
    ]
  }
}
```

---

## Bloco 5: "Impacto Planetário" 🌍
**Objetivo**: Compreender a importância global da fotossíntese

### APIs Utilizadas:
- **NASA Image & Video Library**: `https://images-api.nasa.gov/search?q=vegetation+satellite&media_type=image`
- **OpenAlex**: `https://api.openalex.org/works?search=photosynthesis+climate&per_page=5`

### Componente HE-next:
```typescript
{
  type: 'animation',
  title: 'Fotossíntese Vista do Espaço',
  html: `
    <div class="planetary-impact">
      <h3>🛰️ Perspectiva Global</h3>
      
      <div class="nasa-imagery">
        <h4>Imagens da NASA:</h4>
        <div class="satellite-images">
          ${nasaImages.map(img => `
            <div class="image-card">
              <img src="${img.links[0].href}" alt="${img.data[0].title}" />
              <p><strong>${img.data[0].title}</strong></p>
              <p><em>${img.data[0].description}</em></p>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="research-insights">
        <h4>📊 Pesquisa Científica Recente:</h4>
        <div class="research-papers">
          ${openAlexResults.map(paper => `
            <div class="paper-card">
              <h5>${paper.title}</h5>
              <p><strong>Autores:</strong> ${paper.authorships.map(a => a.author.display_name).join(', ')}</p>
              <p><strong>Ano:</strong> ${paper.publication_year}</p>
              <p><strong>Citações:</strong> ${paper.cited_by_count}</p>
              <a href="${paper.doi}" target="_blank">Ver artigo</a>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="interactive-timeline">
        <h4>⏰ Linha do Tempo Interativa:</h4>
        <p>Clique nos pontos para ver como a fotossíntese afeta diferentes aspectos do planeta:</p>
        <!-- Timeline interativa com dados climáticos -->
      </div>
    </div>
  `
}
```

### Dados da API:
```json
{
  "nasa": {
    "collection": {
      "items": [
        {
          "data": [{
            "title": "Global Vegetation Index",
            "description": "Satellite view of global vegetation patterns"
          }],
          "links": [{"href": "https://..."}]
        }
      ]
    }
  },
  "openalex": {
    "results": [
      {
        "title": "Photosynthesis and Climate Change",
        "authorships": [{"author": {"display_name": "Dr. Smith"}}],
        "publication_year": 2023,
        "cited_by_count": 45,
        "doi": "https://doi.org/..."
      }
    ]
  }
}
```

---

## Bloco 6: "Avaliação e Desafio" 🎯
**Objetivo**: Consolidar aprendizagem e aplicar conhecimento

### Componente HE-next:
```typescript
{
  type: 'quiz',
  title: 'Desafio Final: Fotossíntese em Ação',
  question: 'Com base em tudo que você aprendeu, qual é o impacto mais significativo da fotossíntese para a vida na Terra?',
  choices: [
    'Produção de oxigênio atmosférico',
    'Captura de dióxido de carbono',
    'Produção de alimentos para toda a cadeia alimentar',
    'Todas as alternativas acima'
  ],
  correctIndex: 3,
  explanation: `
    <div class="final-challenge">
      <h4>🎉 Parabéns! Você completou a jornada!</h4>
      
      <div class="knowledge-summary">
        <h5>📚 O que você aprendeu:</h5>
        <ul>
          <li>✅ Identificou estruturas visuais da fotossíntese</li>
          <li>✅ Conectou conceitos com dados reais do mundo</li>
          <li>✅ Explorou estruturas moleculares</li>
          <li>✅ Aprofundou conhecimento teórico</li>
          <li>✅ Compreendeu o impacto planetário</li>
        </ul>
      </div>
      
      <div class="next-steps">
        <h5>🚀 Próximos Passos:</h5>
        <p>Continue explorando com:</p>
        <ul>
          <li>🔬 <strong>Laboratório Virtual:</strong> Experimentos de fotossíntese</li>
          <li>🌱 <strong>Observação de Campo:</strong> Identifique plantas locais</li>
          <li>📊 <strong>Análise de Dados:</strong> Explore mais dados do iNaturalist</li>
        </ul>
      </div>
      
      <div class="achievement-badge">
        <h5>🏆 Conquista Desbloqueada:</h5>
        <div class="badge">
          <img src="/badges/photosynthesis-master.png" alt="Mestre da Fotossíntese" />
          <p><strong>Mestre da Fotossíntese</strong></p>
          <p>Você dominou os conceitos fundamentais da fotossíntese!</p>
        </div>
      </div>
    </div>
  `
}
```

---

## 🔧 Implementação Técnica

### 1. Serviços de API

```typescript
// lib/api-services/photosynthesis-apis.ts
export class PhotosynthesisAPIService {
  private cache = new Map();
  
  async getVisualContext() {
    const [unsplash, pexels, pixabay] = await Promise.all([
      this.fetchUnsplash('chloroplast+leaf'),
      this.fetchPexels('photosynthesis+forest'),
      this.fetchPixabay('plant+cell+microscope')
    ]);
    
    return { unsplash, pexels, pixabay };
  }
  
  async getRealWorldData() {
    const [inaturalist, gbif, eol] = await Promise.all([
      this.fetchiNaturalist('47126'), // Plant taxon ID
      this.fetchGBIF('6'), // Plant kingdom
      this.fetchEOL('1045608') // Example species
    ]);
    
    return { inaturalist, gbif, eol };
  }
  
  async getMolecularData() {
    const [pdb, uniprot] = await Promise.all([
      this.fetchPDB('1FE1'), // Photosystem II structure
      this.fetchUniProt('P12345') // Example protein
    ]);
    
    return { pdb, uniprot };
  }
  
  // ... outros métodos
}
```

### 2. Cache e Offline-First

```typescript
// lib/cache/photosynthesis-cache.ts
export class PhotosynthesisCache {
  private static CACHE_KEY = 'photosynthesis-lesson-data';
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  
  static async getCachedData(blockType: string) {
    const cached = localStorage.getItem(`${this.CACHE_KEY}-${blockType}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return data;
      }
    }
    return null;
  }
  
  static async setCachedData(blockType: string, data: any) {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${this.CACHE_KEY}-${blockType}`, JSON.stringify(cacheData));
  }
}
```

### 3. Integração com Lesson Generation

```typescript
// app/api/generate-lesson/route.ts (modificação)
export async function POST(request: NextRequest) {
  const { subject, topic, level } = await request.json();
  
  if (subject === 'Biologia' && topic.includes('fotossíntese')) {
    // Usar fluxo especializado com APIs
    return await generatePhotosynthesisLesson(level);
  }
  
  // Fluxo normal para outros tópicos
  return await generateStandardLesson(subject, topic, level);
}

async function generatePhotosynthesisLesson(level: string) {
  const apiService = new PhotosynthesisAPIService();
  
  // Buscar dados de todas as APIs
  const [visualData, realWorldData, molecularData, readingData, planetaryData] = await Promise.all([
    apiService.getVisualContext(),
    apiService.getRealWorldData(),
    apiService.getMolecularData(),
    apiService.getReadingContent(),
    apiService.getPlanetaryImpact()
  ]);
  
  // Gerar cards com dados integrados
  const cards = [
    createVisualContextCard(visualData),
    createRealWorldCard(realWorldData),
    createMolecularCard(molecularData),
    createReadingCard(readingData),
    createPlanetaryCard(planetaryData),
    createFinalChallengeCard()
  ];
  
  return {
    title: "Fotossíntese: O Motor da Vida",
    subject: "Biologia",
    level,
    objective: "Compreender o processo de fotossíntese e sua importância para a vida na Terra",
    outline: [
      "Contexto visual e despertar curiosidade",
      "Conexão com dados reais do mundo",
      "Exploração molecular e estrutural",
      "Aprofundamento teórico",
      "Impacto planetário e global",
      "Consolidação e aplicação"
    ],
    cards
  };
}
```

---

## 📋 Checklist de Implementação

### ✅ Preparação
- [ ] Configurar chaves de API (Unsplash, Pexels, Pixabay, NASA, etc.)
- [ ] Implementar serviços de cache
- [ ] Configurar rate limiting
- [ ] Preparar fallbacks offline

### ✅ Integração
- [ ] Modificar `/api/generate-lesson` para detectar fotossíntese
- [ ] Criar `PhotosynthesisAPIService`
- [ ] Implementar cache local
- [ ] Testar todos os endpoints

### ✅ Componentes
- [ ] Adaptar componentes existentes para dados dinâmicos
- [ ] Implementar visualizador 3D para estruturas moleculares
- [ ] Criar mapa interativo para dados geográficos
- [ ] Desenvolver timeline interativa

### ✅ Qualidade
- [ ] Implementar atribuição adequada de imagens
- [ ] Adicionar alt text para acessibilidade
- [ ] Testar em diferentes dispositivos
- [ ] Validar dados de entrada

### ✅ Monitoramento
- [ ] Implementar logging de uso de APIs
- [ ] Monitorar performance de cache
- [ ] Acompanhar taxa de erro
- [ ] Coletar feedback de usuários

---

## 🎯 Benefícios Pedagógicos

1. **Engajamento**: Imagens reais e dados atuais despertam interesse
2. **Conexão**: Liga conceitos abstratos ao mundo real
3. **Investigação**: Dados reais incentivam pensamento científico
4. **Multimodalidade**: Combina texto, imagem, vídeo e interação
5. **Personalização**: Dados locais tornam conteúdo relevante
6. **Atualização**: Conteúdo sempre atualizado via APIs

Este fluxo transforma uma aula tradicional de fotossíntese em uma experiência imersiva e interativa, usando dados reais para criar conexões significativas entre teoria e prática.
