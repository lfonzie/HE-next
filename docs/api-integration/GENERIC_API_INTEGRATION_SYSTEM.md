# 🌐 Sistema Genérico de Integração de APIs para Qualquer Tema
## Arquitetura Universal para Enriquecimento Automático de Aulas

### 📋 Visão Geral

Este sistema transforma **qualquer aula ou tema** em uma experiência rica em mídia e dados reais, detectando automaticamente o assunto e integrando as APIs mais relevantes. Funciona como um "motor de enriquecimento" que analisa o conteúdo e adiciona camadas de interatividade e dados reais.

---

## 🧠 Sistema de Detecção Inteligente de Temas

### 1. Mapeamento de Temas para APIs

```typescript
// lib/api-services/topic-detector.ts
export class TopicDetector {
  private static readonly TOPIC_MAPPINGS = {
    // BIOLOGIA
    biology: {
      photosynthesis: {
        visual: ['unsplash', 'pexels', 'pixabay'],
        realWorld: ['inaturalist', 'gbif', 'eol'],
        molecular: ['pdb', 'uniprot'],
        research: ['openalex', 'wikidata'],
        planetary: ['nasa']
      },
      'cell-division': {
        visual: ['unsplash', 'pexels'],
        molecular: ['pdb', 'uniprot'],
        research: ['openalex'],
        educational: ['wikimedia', 'wikidata']
      },
      'dna-replication': {
        molecular: ['pdb', 'uniprot'],
        visual: ['unsplash', 'pixabay'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      'evolution': {
        realWorld: ['gbif', 'eol'],
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia', 'wikidata']
      },
      'ecosystem': {
        realWorld: ['gbif', 'inaturalist'],
        visual: ['unsplash', 'pexels', 'nasa'],
        research: ['openalex'],
        educational: ['wikimedia']
      }
    },

    // QUÍMICA
    chemistry: {
      'periodic-table': {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia', 'wikidata']
      },
      'chemical-bonds': {
        molecular: ['pdb'],
        visual: ['unsplash', 'pixabay'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      'reactions': {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia']
      }
    },

    // FÍSICA
    physics: {
      'quantum-mechanics': {
        visual: ['unsplash', 'pexels'],
        research: ['openalex', 'nasa'],
        educational: ['wikimedia', 'wikidata']
      },
      'thermodynamics': {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      'electromagnetism': {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      'astronomy': {
        visual: ['nasa', 'unsplash'],
        research: ['openalex'],
        educational: ['wikimedia', 'wikidata']
      }
    },

    // GEOGRAFIA
    geography: {
      'climate': {
        visual: ['nasa', 'unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia', 'wikidata']
      },
      'ecosystems': {
        realWorld: ['gbif', 'inaturalist'],
        visual: ['nasa', 'unsplash'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      'geology': {
        visual: ['unsplash', 'pexels', 'nasa'],
        research: ['openalex'],
        educational: ['wikimedia']
      }
    },

    // HISTÓRIA
    history: {
      'ancient-civilizations': {
        visual: ['unsplash', 'pexels', 'wikimedia'],
        educational: ['wikimedia', 'wikidata'],
        research: ['openalex']
      },
      'world-wars': {
        visual: ['unsplash', 'pexels'],
        educational: ['wikimedia'],
        research: ['openalex']
      },
      'renaissance': {
        visual: ['unsplash', 'pexels', 'wikimedia'],
        educational: ['wikimedia', 'wikidata'],
        research: ['openalex']
      }
    },

    // MATEMÁTICA
    mathematics: {
      'geometry': {
        visual: ['unsplash', 'pexels', 'pixabay'],
        educational: ['wikimedia'],
        research: ['openalex']
      },
      'calculus': {
        visual: ['unsplash', 'pexels'],
        educational: ['wikimedia'],
        research: ['openalex']
      },
      'statistics': {
        visual: ['unsplash', 'pexels'],
        educational: ['wikimedia'],
        research: ['openalex']
      }
    }
  };

  static detectTopic(subject: string, topic: string, keywords: string[] = []): TopicMapping {
    const normalizedSubject = subject.toLowerCase();
    const normalizedTopic = topic.toLowerCase();
    
    // Buscar mapeamento específico
    const subjectMapping = this.TOPIC_MAPPINGS[normalizedSubject];
    if (subjectMapping && subjectMapping[normalizedTopic]) {
      return {
        subject: normalizedSubject,
        topic: normalizedTopic,
        apis: subjectMapping[normalizedTopic],
        confidence: 0.9
      };
    }

    // Buscar por palavras-chave
    const keywordMatch = this.findByKeywords(keywords);
    if (keywordMatch) {
      return keywordMatch;
    }

    // Fallback genérico
    return this.getGenericMapping(normalizedSubject);
  }

  private static findByKeywords(keywords: string[]): TopicMapping | null {
    const keywordMap = {
      'plant': 'biology.photosynthesis',
      'animal': 'biology.ecosystem',
      'cell': 'biology.cell-division',
      'dna': 'biology.dna-replication',
      'evolution': 'biology.evolution',
      'space': 'physics.astronomy',
      'planet': 'physics.astronomy',
      'star': 'physics.astronomy',
      'chemical': 'chemistry.chemical-bonds',
      'reaction': 'chemistry.reactions',
      'element': 'chemistry.periodic-table',
      'war': 'history.world-wars',
      'ancient': 'history.ancient-civilizations',
      'art': 'history.renaissance',
      'shape': 'mathematics.geometry',
      'function': 'mathematics.calculus',
      'data': 'mathematics.statistics'
    };

    for (const keyword of keywords) {
      const mapping = keywordMap[keyword.toLowerCase()];
      if (mapping) {
        const [subject, topic] = mapping.split('.');
        return {
          subject,
          topic,
          apis: this.TOPIC_MAPPINGS[subject][topic],
          confidence: 0.7
        };
      }
    }

    return null;
  }

  private static getGenericMapping(subject: string): TopicMapping {
    const genericMappings = {
      biology: {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      chemistry: {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      physics: {
        visual: ['unsplash', 'pexels'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      geography: {
        visual: ['unsplash', 'pexels', 'nasa'],
        research: ['openalex'],
        educational: ['wikimedia']
      },
      history: {
        visual: ['unsplash', 'pexels'],
        educational: ['wikimedia'],
        research: ['openalex']
      },
      mathematics: {
        visual: ['unsplash', 'pexels'],
        educational: ['wikimedia'],
        research: ['openalex']
      }
    };

    return {
      subject,
      topic: 'generic',
      apis: genericMappings[subject] || genericMappings.biology,
      confidence: 0.5
    };
  }
}

interface TopicMapping {
  subject: string;
  topic: string;
  apis: {
    visual?: string[];
    realWorld?: string[];
    molecular?: string[];
    research?: string[];
    educational?: string[];
    planetary?: string[];
  };
  confidence: number;
}
```

---

## 🔄 Motor de Enriquecimento Automático

### 2. Sistema de Geração Dinâmica de Conteúdo

```typescript
// lib/api-services/content-enricher.ts
export class ContentEnricher {
  private apiServices: Map<string, APIService> = new Map();

  constructor() {
    this.initializeAPIServices();
  }

  async enrichLesson(lessonData: LessonData): Promise<EnrichedLessonData> {
    const topicMapping = TopicDetector.detectTopic(
      lessonData.subject,
      lessonData.topic,
      lessonData.keywords || []
    );

    const enrichedCards = await Promise.all(
      lessonData.cards.map(card => this.enrichCard(card, topicMapping))
    );

    return {
      ...lessonData,
      cards: enrichedCards,
      metadata: {
        ...lessonData.metadata,
        enrichmentLevel: this.calculateEnrichmentLevel(topicMapping),
        apisUsed: this.extractAPIsUsed(topicMapping),
        lastEnriched: new Date().toISOString()
      }
    };
  }

  private async enrichCard(card: LessonCard, topicMapping: TopicMapping): Promise<EnrichedLessonCard> {
    const enrichmentStrategy = this.selectEnrichmentStrategy(card.type, topicMapping);
    
    if (!enrichmentStrategy) {
      return card; // Sem enriquecimento
    }

    const enrichedData = await this.fetchEnrichmentData(enrichmentStrategy, card);
    
    return {
      ...card,
      enrichedContent: enrichedData,
      enrichmentMetadata: {
        strategy: enrichmentStrategy.name,
        apisUsed: enrichmentStrategy.apis,
        confidence: topicMapping.confidence
      }
    };
  }

  private selectEnrichmentStrategy(cardType: string, topicMapping: TopicMapping): EnrichmentStrategy | null {
    const strategies = {
      'reading': {
        name: 'visual-context',
        apis: topicMapping.apis.visual || [],
        priority: 1
      },
      'quiz': {
        name: 'real-world-data',
        apis: topicMapping.apis.realWorld || [],
        priority: 2
      },
      'video': {
        name: 'educational-content',
        apis: topicMapping.apis.educational || [],
        priority: 3
      },
      'whiteboard': {
        name: 'molecular-structures',
        apis: topicMapping.apis.molecular || [],
        priority: 4
      }
    };

    return strategies[cardType] || null;
  }

  private async fetchEnrichmentData(strategy: EnrichmentStrategy, card: LessonCard): Promise<any> {
    const results = await Promise.allSettled(
      strategy.apis.map(apiName => this.fetchFromAPI(apiName, card))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }

  private async fetchFromAPI(apiName: string, card: LessonCard): Promise<any> {
    const apiService = this.apiServices.get(apiName);
    if (!apiService) {
      throw new Error(`API service not found: ${apiName}`);
    }

    const query = this.generateQuery(apiName, card);
    return await apiService.fetch(query);
  }

  private generateQuery(apiName: string, card: LessonCard): string {
    const queryGenerators = {
      unsplash: () => this.extractKeywords(card).join('+'),
      pexels: () => this.extractKeywords(card).join('+'),
      pixabay: () => this.extractKeywords(card).join('+'),
      nasa: () => this.extractKeywords(card).join('+'),
      inaturalist: () => this.extractTaxonKeywords(card),
      gbif: () => this.extractTaxonKeywords(card),
      eol: () => this.extractSpeciesKeywords(card),
      pdb: () => this.extractProteinKeywords(card),
      uniprot: () => this.extractProteinKeywords(card),
      openalex: () => this.extractKeywords(card).join('+'),
      wikimedia: () => this.extractKeywords(card)[0] || 'general',
      wikidata: () => this.extractKeywords(card)[0] || 'general'
    };

    return queryGenerators[apiName]?.() || 'general';
  }

  private extractKeywords(card: LessonCard): string[] {
    const text = `${card.title} ${card.html || ''} ${card.question || ''}`.toLowerCase();
    const keywords = text.match(/\b\w{3,}\b/g) || [];
    return keywords.slice(0, 5); // Limitar a 5 palavras-chave
  }

  private extractTaxonKeywords(card: LessonCard): string {
    // Lógica específica para extrair termos taxonômicos
    const biologyTerms = ['plant', 'animal', 'species', 'organism', 'cell'];
    const foundTerms = this.extractKeywords(card).filter(term => 
      biologyTerms.includes(term)
    );
    return foundTerms[0] || 'organism';
  }

  private extractSpeciesKeywords(card: LessonCard): string {
    // Lógica específica para extrair nomes de espécies
    const speciesPattern = /[A-Z][a-z]+ [a-z]+/g;
    const matches = card.title?.match(speciesPattern);
    return matches?.[0] || 'general';
  }

  private extractProteinKeywords(card: LessonCard): string {
    // Lógica específica para extrair nomes de proteínas
    const proteinTerms = ['protein', 'enzyme', 'dna', 'rna', 'molecule'];
    const foundTerms = this.extractKeywords(card).filter(term => 
      proteinTerms.includes(term)
    );
    return foundTerms[0] || 'protein';
  }
}
```

---

## 🎯 Estratégias de Enriquecimento por Tipo de Card

### 3. Templates Dinâmicos de Enriquecimento

```typescript
// lib/api-services/enrichment-templates.ts
export class EnrichmentTemplates {
  static getTemplate(cardType: string, enrichmentData: any[]): string {
    const templates = {
      'reading': this.getReadingTemplate(enrichmentData),
      'quiz': this.getQuizTemplate(enrichmentData),
      'video': this.getVideoTemplate(enrichmentData),
      'whiteboard': this.getWhiteboardTemplate(enrichmentData),
      'flashcards': this.getFlashcardsTemplate(enrichmentData)
    };

    return templates[cardType] || this.getGenericTemplate(enrichmentData);
  }

  private static getReadingTemplate(data: any[]): string {
    const images = data.filter(d => d.type === 'image');
    const research = data.filter(d => d.type === 'research');
    const educational = data.filter(d => d.type === 'educational');

    return `
      <div class="enriched-reading">
        ${images.length > 0 ? `
          <div class="visual-context">
            <h4>🖼️ Contexto Visual</h4>
            <div class="image-grid">
              ${images.map(img => `
                <img src="${img.url}" alt="${img.alt}" />
                <p><em>${img.attribution}</em></p>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${research.length > 0 ? `
          <div class="research-insights">
            <h4>📊 Pesquisa Atual</h4>
            ${research.map(paper => `
              <div class="research-card">
                <h5>${paper.title}</h5>
                <p><strong>Autores:</strong> ${paper.authors}</p>
                <p><strong>Citações:</strong> ${paper.citations}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${educational.length > 0 ? `
          <div class="educational-resources">
            <h4>📚 Recursos Adicionais</h4>
            ${educational.map(resource => `
              <div class="resource-card">
                <h5>${resource.title}</h5>
                <p>${resource.description}</p>
                <a href="${resource.url}" target="_blank">Ver mais</a>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private static getQuizTemplate(data: any[]): string {
    const realWorld = data.filter(d => d.type === 'realWorld');
    const visual = data.filter(d => d.type === 'image');

    return `
      <div class="enriched-quiz">
        ${realWorld.length > 0 ? `
          <div class="real-world-data">
            <h4>🌍 Dados do Mundo Real</h4>
            ${realWorld.map(obs => `
              <div class="observation-card">
                <h5>${obs.species}</h5>
                <p><strong>Local:</strong> ${obs.location}</p>
                <p><strong>Data:</strong> ${obs.date}</p>
                ${obs.image ? `<img src="${obs.image}" alt="${obs.species}" />` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${visual.length > 0 ? `
          <div class="visual-aid">
            <h4>👁️ Ajuda Visual</h4>
            <img src="${visual[0].url}" alt="${visual[0].alt}" />
          </div>
        ` : ''}
      </div>
    `;
  }

  private static getWhiteboardTemplate(data: any[]): string {
    const molecular = data.filter(d => d.type === 'molecular');
    const visual = data.filter(d => d.type === 'image');

    return `
      <div class="enriched-whiteboard">
        ${molecular.length > 0 ? `
          <div class="molecular-structures">
            <h4>🧬 Estruturas Moleculares</h4>
            ${molecular.map(structure => `
              <div class="structure-card">
                <h5>${structure.name}</h5>
                <p><strong>PDB ID:</strong> ${structure.pdbId}</p>
                <p><strong>Resolução:</strong> ${structure.resolution}Å</p>
                <iframe src="https://3dmol.org/viewer.html?pdbid=${structure.pdbId}" 
                        width="100%" height="300px"></iframe>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${visual.length > 0 ? `
          <div class="reference-images">
            <h4>📸 Imagens de Referência</h4>
            <div class="image-grid">
              ${visual.map(img => `
                <img src="${img.url}" alt="${img.alt}" />
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private static getVideoTemplate(data: any[]): string {
    const educational = data.filter(d => d.type === 'educational');
    const visual = data.filter(d => d.type === 'image');

    return `
      <div class="enriched-video">
        ${educational.length > 0 ? `
          <div class="educational-content">
            <h4>📚 Conteúdo Educacional</h4>
            ${educational.map(content => `
              <div class="content-card">
                <h5>${content.title}</h5>
                <p>${content.description}</p>
                <a href="${content.url}" target="_blank">Acessar</a>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${visual.length > 0 ? `
          <div class="thumbnail">
            <img src="${visual[0].url}" alt="${visual[0].alt}" />
          </div>
        ` : ''}
      </div>
    `;
  }

  private static getFlashcardsTemplate(data: any[]): string {
    const visual = data.filter(d => d.type === 'image');
    const educational = data.filter(d => d.type === 'educational');

    return `
      <div class="enriched-flashcards">
        ${visual.length > 0 ? `
          <div class="visual-aids">
            <h4>🖼️ Ajudas Visuais</h4>
            <div class="image-grid">
              ${visual.map(img => `
                <img src="${img.url}" alt="${img.alt}" />
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${educational.length > 0 ? `
          <div class="additional-info">
            <h4>ℹ️ Informações Adicionais</h4>
            ${educational.map(info => `
              <div class="info-card">
                <h5>${info.title}</h5>
                <p>${info.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private static getGenericTemplate(data: any[]): string {
    return `
      <div class="enriched-content">
        <h4>🔍 Conteúdo Enriquecido</h4>
        <div class="content-grid">
          ${data.map(item => `
            <div class="content-item">
              <h5>${item.title || 'Recurso'}</h5>
              <p>${item.description || ''}</p>
              ${item.url ? `<a href="${item.url}" target="_blank">Ver mais</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
```

---

## 🔧 Integração com Sistema Existente

### 4. Modificação do Lesson Generation API

```typescript
// app/api/generate-lesson/route.ts (modificação)
import { ContentEnricher } from '@/lib/api-services/content-enricher';
import { TopicDetector } from '@/lib/api-services/topic-detector';

export async function POST(request: NextRequest) {
  try {
    const { subject, topic, level, keywords } = await request.json();
    
    // Detectar se o tema pode ser enriquecido
    const topicMapping = TopicDetector.detectTopic(subject, topic, keywords);
    
    if (topicMapping.confidence > 0.6) {
      // Usar sistema de enriquecimento automático
      return await generateEnrichedLesson(subject, topic, level, keywords, topicMapping);
    } else {
      // Usar sistema padrão
      return await generateStandardLesson(subject, topic, level);
    }
  } catch (error) {
    console.error('Lesson generation error:', error);
    return NextResponse.json({ error: 'Failed to generate lesson' }, { status: 500 });
  }
}

async function generateEnrichedLesson(
  subject: string, 
  topic: string, 
  level: string, 
  keywords: string[],
  topicMapping: TopicMapping
): Promise<NextResponse> {
  // Gerar aula base
  const baseLesson = await generateBaseLesson(subject, topic, level);
  
  // Enriquecer com APIs
  const enricher = new ContentEnricher();
  const enrichedLesson = await enricher.enrichLesson(baseLesson);
  
  // Adicionar metadados de enriquecimento
  enrichedLesson.metadata = {
    ...enrichedLesson.metadata,
    enrichmentLevel: 'high',
    apisUsed: Object.values(topicMapping.apis).flat(),
    topicMapping: topicMapping,
    generatedAt: new Date().toISOString()
  };
  
  return NextResponse.json(enrichedLesson);
}

async function generateBaseLesson(subject: string, topic: string, level: string): Promise<LessonData> {
  // Usar o sistema existente de geração de aulas
  const prompt = `Create an interactive lesson about ${topic} in ${subject} for ${level} level.`;
  
  // ... lógica existente de geração
  return lessonData;
}
```

---

## 📊 Sistema de Monitoramento e Otimização

### 5. Analytics e Feedback Loop

```typescript
// lib/analytics/enrichment-analytics.ts
export class EnrichmentAnalytics {
  static trackEnrichmentSuccess(topic: string, apisUsed: string[], responseTime: number) {
    const event = {
      type: 'enrichment_success',
      topic,
      apisUsed,
      responseTime,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(event);
  }

  static trackEnrichmentFailure(topic: string, error: string, fallbackUsed: boolean) {
    const event = {
      type: 'enrichment_failure',
      topic,
      error,
      fallbackUsed,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(event);
  }

  static trackUserEngagement(cardType: string, enrichmentType: string, timeSpent: number) {
    const event = {
      type: 'user_engagement',
      cardType,
      enrichmentType,
      timeSpent,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(event);
  }

  private static sendToAnalytics(event: any) {
    // Implementar envio para serviço de analytics
    console.log('Enrichment Analytics:', event);
  }
}
```

---

## 🎯 Benefícios do Sistema Genérico

### ✅ **Universalidade**
- Funciona com **qualquer matéria** e **qualquer tema**
- Detecção automática de contexto e APIs relevantes
- Fallbacks inteligentes para temas não mapeados

### ✅ **Escalabilidade**
- Fácil adição de novas APIs e mapeamentos
- Sistema de templates reutilizáveis
- Cache inteligente para performance

### ✅ **Inteligência**
- Detecção automática de temas por palavras-chave
- Mapeamento inteligente de APIs por contexto
- Estratégias de enriquecimento adaptativas

### ✅ **Robustez**
- Rate limiting e fallbacks automáticos
- Cache offline para funcionamento sem internet
- Monitoramento e otimização contínua

### ✅ **Flexibilidade**
- Templates personalizáveis por tipo de card
- Estratégias de enriquecimento configuráveis
- Integração transparente com sistema existente

---

## 🚀 Implementação em Etapas

### **Fase 1: Core System**
1. Implementar `TopicDetector`
2. Criar `ContentEnricher` básico
3. Modificar `/api/generate-lesson`

### **Fase 2: Templates**
1. Implementar `EnrichmentTemplates`
2. Criar templates para cada tipo de card
3. Testar com diferentes temas

### **Fase 3: APIs**
1. Integrar APIs principais (Unsplash, Pexels, etc.)
2. Implementar cache e rate limiting
3. Adicionar fallbacks

### **Fase 4: Otimização**
1. Implementar analytics
2. Otimizar performance
3. Expandir mapeamentos de temas

Este sistema transforma **qualquer aula** em uma experiência rica e interativa, detectando automaticamente o melhor conjunto de APIs para enriquecer o conteúdo! 🌟
