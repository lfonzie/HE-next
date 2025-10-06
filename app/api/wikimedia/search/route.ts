// app/api/wikimedia/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, count = 1 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🖼️ Buscando imagem no Wikimedia Commons para:', query);

    // Traduzir query para inglês se necessário
    const englishQuery = await translateToEnglish(query, subject);
    console.log('🌍 Query traduzida:', englishQuery);

    // Melhorar a query com termos educacionais e científicos
    const enhancedQuery = enhanceQueryForWikimedia(englishQuery, subject);
    console.log('🔍 Query melhorada para Wikimedia:', enhancedQuery);

    // Buscar no Wikimedia Commons
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(enhancedQuery)}&srnamespace=6&srlimit=${count}&srprop=size&origin=*`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Wikimedia API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check for empty search result
    if (!data.query || !data.query.search || data.query.search.length === 0) {
      console.log('⚠️ Nenhuma imagem encontrada no Wikimedia Commons:', data);
      return NextResponse.json({
        success: false,
        photos: [],
        query: englishQuery,
        source: 'wikimedia',
        fallback: true
      });
    }

    // Buscar informações detalhadas das imagens encontradas
    const imageTitles = data.query.search.map((item: any) => item.title);
    const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${imageTitles.join('|')}&prop=imageinfo&iiprop=url|size|mime&origin=*`;
    
    const imageInfoResponse = await fetch(imageInfoUrl);
    if (!imageInfoResponse.ok) {
      throw new Error(`Wikimedia image info API error: ${imageInfoResponse.status}`);
    }

    const imageInfoData = await imageInfoResponse.json();
    
    const photos = [];
    const pages = imageInfoData.query.pages;
    
    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.imageinfo && page.imageinfo.length > 0) {
        const imageInfo = page.imageinfo[0];
        
        // Filtrar apenas arquivos de imagem válidos (não PDFs, documentos, etc.)
        const isValidImage = imageInfo.mime && (
          imageInfo.mime.startsWith('image/') ||
          imageInfo.mime === 'image/jpeg' ||
          imageInfo.mime === 'image/png' ||
          imageInfo.mime === 'image/gif' ||
          imageInfo.mime === 'image/webp' ||
          imageInfo.mime === 'image/svg+xml'
        );
        
        // Verificar se a URL é realmente uma imagem (não PDF)
        const isImageUrl = imageInfo.url && (
          imageInfo.url.includes('.jpg') ||
          imageInfo.url.includes('.jpeg') ||
          imageInfo.url.includes('.png') ||
          imageInfo.url.includes('.gif') ||
          imageInfo.url.includes('.webp') ||
          imageInfo.url.includes('.svg') ||
          imageInfo.url.includes('commons/') // Wikimedia Commons images
        );
        
        // Verificação adicional para excluir PDFs e documentos
        const isNotDocument = !imageInfo.mime?.includes('pdf') && 
                             !imageInfo.mime?.includes('document') &&
                             !imageInfo.mime?.includes('text') &&
                             !imageInfo.url?.includes('.pdf') &&
                             !imageInfo.url?.includes('.doc') &&
                             !imageInfo.url?.includes('.txt');
        
        if (isValidImage && isImageUrl && isNotDocument) {
          photos.push({
            id: pageId,
            title: page.title,
            url: imageInfo.url,
            width: imageInfo.width,
            height: imageInfo.height,
            mime: imageInfo.mime,
            source: 'wikimedia',
            description: page.title.replace('File:', ''),
            urls: {
              regular: imageInfo.url,
              small: imageInfo.url
            }
          });
        } else {
          console.log(`⚠️ Arquivo não é uma imagem válida: ${page.title} (${imageInfo.mime})`);
        }
      }
    }

    console.log(`✅ ${photos.length} imagens encontradas no Wikimedia Commons`);

    return NextResponse.json({
      success: true,
      photos: photos.slice(0, count),
      query: englishQuery,
      source: 'wikimedia',
      fallback: false
    });

  } catch (error: any) {
    console.error('❌ Erro na busca do Wikimedia Commons:', error);
    return NextResponse.json({
      success: false,
      photos: [],
      error: error.message,
      source: 'wikimedia',
      fallback: true
    });
  }
}

// Função para traduzir query para inglês
async function translateToEnglish(query: string, subject?: string): Promise<string> {
  try {
    // Se já estiver em inglês, retornar como está
    if (/^[a-zA-Z\s]+$/.test(query)) {
      return query;
    }

    // Usar a API de detecção de tema que já está funcionando
    try {
      const themeDetectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/theme-detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, subject }),
      });

      if (themeDetectionResponse.ok) {
        const themeData = await themeDetectionResponse.json();
        if (themeData.englishTheme) {
          console.log('🎯 Tema detectado para tradução:', themeData);
          return themeData.englishTheme;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro na detecção de tema para tradução:', error);
    }

    // Fallback: tradução manual básica
    const translations: Record<string, string> = {
      'fotossíntese': 'photosynthesis',
      'cloroplastos': 'chloroplasts',
      'clorofila': 'chlorophyll',
      'glicose': 'glucose',
      'oxigênio': 'oxygen',
      'dióxido de carbono': 'carbon dioxide',
      'água': 'water',
      'luz solar': 'sunlight',
      'energia': 'energy',
      'plantas': 'plants',
      'folhas': 'leaves',
      'células': 'cells',
      'mitocôndrias': 'mitochondria',
      'respiração': 'respiration',
      'metabolismo': 'metabolism',
      'enzimas': 'enzymes',
      'proteínas': 'proteins',
      'DNA': 'DNA',
      'RNA': 'RNA',
      'cromossomos': 'chromosomes',
      'núcleo': 'nucleus',
      'citoplasma': 'cytoplasm',
      'membrana': 'membrane',
      'organelas': 'organelles',
      'ribossomos': 'ribosomes',
      'retículo endoplasmático': 'endoplasmic reticulum',
      'aparelho de golgi': 'golgi apparatus',
      'lisossomos': 'lysosomes',
      'vacúolos': 'vacuoles',
      'parede celular': 'cell wall',
      'flagelos': 'flagella',
      'cérebro': 'brain',
      'neurônios': 'neurons',
      'sistema nervoso': 'nervous system',
      'medula espinhal': 'spinal cord',
      'córtex cerebral': 'cerebral cortex',
      'hipocampo': 'hippocampus',
      'cerebelo': 'cerebellum',
      'tronco cerebral': 'brainstem',
      'sinapses': 'synapses',
      'neurotransmissores': 'neurotransmitters',
      'dendritos': 'dendrites',
      'axônios': 'axons',
      'mielina': 'myelin',
      'impulso nervoso': 'nerve impulse',
      'reflexos': 'reflexes',
      'memória': 'memory',
      'como funciona': 'how does work',
      'funcionamento': 'functioning',
      'processo': 'process',
      'mecanismo': 'mechanism',
      'aprendizado': 'learning',
      'cognição': 'cognition',
      'percepção': 'perception',
      'consciência': 'consciousness',
      'cílios': 'cilia',
      'microscópio': 'microscope',
      'laboratório': 'laboratory',
      'experimento': 'experiment',
      'pesquisa': 'research',
      'ciência': 'science',
      'biologia': 'biology',
      'química': 'chemistry',
      'física': 'physics',
      'matemática': 'mathematics',
      'história': 'history',
      'geografia': 'geography',
      'literatura': 'literature',
      'arte': 'art',
      'música': 'music',
      'educação': 'education',
      'escola': 'school',
      'universidade': 'university',
      'professor': 'teacher',
      'estudante': 'student',
      'aula': 'lesson',
      'curso': 'course',
      'conhecimento': 'knowledge',
      'habilidades': 'skills',
      'competências': 'competencies',
      'avaliação': 'assessment',
      'prova': 'exam',
      'teste': 'test',
      'quiz': 'quiz',
      'exercício': 'exercise',
      'atividade': 'activity',
      'projeto': 'project',
      'trabalho': 'work',
      'estudo': 'study',
      'investigação': 'investigation',
      'descoberta': 'discovery',
      'inovação': 'innovation',
      'tecnologia': 'technology',
      'computador': 'computer',
      'internet': 'internet',
      'software': 'software',
      'programação': 'programming',
      'algoritmo': 'algorithm',
      'dados': 'data',
      'informação': 'information',
      'comunicação': 'communication',
      'colaboração': 'collaboration',
      'trabalho em equipe': 'teamwork',
      'liderança': 'leadership',
      'criatividade': 'creativity',
      'imaginação': 'imagination',
      'inspiração': 'inspiration',
      'motivação': 'motivation',
      'dedicação': 'dedication',
      'persistência': 'persistence',
      'determinação': 'determination',
      'sucesso': 'success',
      'realização': 'achievement',
      'conquista': 'conquest',
      'vitória': 'victory',
      'triumfo': 'triumph',
      'celebração': 'celebration',
      'felicidade': 'happiness',
      'alegria': 'joy',
      'satisfação': 'satisfaction',
      'orgulho': 'pride',
      'confiança': 'confidence',
      'autoestima': 'self-esteem',
      'respeito': 'respect',
      'dignidade': 'dignity',
      'honra': 'honor',
      'integridade': 'integrity',
      'honestidade': 'honesty',
      'transparência': 'transparency',
      'ética': 'ethics',
      'moral': 'morality',
      'valores': 'values',
      'princípios': 'principles',
      'virtudes': 'virtues',
      'qualidades': 'qualities',
      'características': 'characteristics',
      'atributos': 'attributes',
      'propriedades': 'properties',
      'aspectos': 'aspects',
      'elementos': 'elements',
      'componentes': 'components',
      'partes': 'parts',
      'seções': 'sections',
      'divisões': 'divisions',
      'categorias': 'categories',
      'tipos': 'types',
      'classes': 'classes',
      'grupos': 'groups',
      'famílias': 'families',
      'espécies': 'species',
      'gêneros': 'genera',
      'ordens': 'orders',
      'filos': 'phyla',
      'reinos': 'kingdoms',
      'domínios': 'domains',
      'taxonomia': 'taxonomy',
      'classificação': 'classification',
      'sistema': 'system',
      'organização': 'organization',
      'estrutura': 'structure',
      'arquitetura': 'architecture',
      'design': 'design',
      'plano': 'plan',
      'estratégia': 'strategy',
      'método': 'method',
      'técnica': 'technique',
      'procedimento': 'procedure',
      'protocolo': 'protocol',
      'padrão': 'pattern',
      'modelo': 'model',
      'exemplo': 'example',
      'caso': 'case',
      'situação': 'situation',
      'contexto': 'context',
      'ambiente': 'environment',
      'ecossistema': 'ecosystem',
      'habitat': 'habitat',
      'biodiversidade': 'biodiversity',
      'sustentabilidade': 'sustainability',
      'conservação': 'conservation',
      'preservação': 'preservation',
      'proteção': 'protection',
      'segurança': 'security',
      'defesa': 'defense',
      'prevenção': 'prevention',
      'cuidado': 'care',
      'atenção': 'attention',
      'foco': 'focus',
      'concentração': 'concentration',
      'compromisso': 'commitment',
      'responsabilidade': 'responsibility',
      'obrigação': 'obligation',
      'dever': 'duty',
      'missão': 'mission',
      'propósito': 'purpose',
      'objetivo': 'objective',
      'meta': 'goal',
      'alvo': 'target',
      'destino': 'destination',
      'direção': 'direction',
      'caminho': 'path',
      'rota': 'route',
      'jornada': 'journey',
      'viagem': 'trip',
      'aventura': 'adventure',
      'experiência': 'experience',
      'vivência': 'living',
      'realidade': 'reality',
      'verdade': 'truth',
      'fato': 'fact',
      'evidência': 'evidence',
      'demonstração': 'demonstration',
      'explicação': 'explanation',
      'justificativa': 'justification',
      'argumento': 'argument',
      'razão': 'reason',
      'causa': 'cause',
      'efeito': 'effect',
      'consequência': 'consequence',
      'resultado': 'result',
      'outcome': 'outcome',
      'produto': 'product',
      'produção': 'production',
      'criação': 'creation',
      'invenção': 'invention',
      'desenvolvimento': 'development',
      'evolução': 'evolution',
      'progresso': 'progress',
      'avanço': 'advance',
      'melhoria': 'improvement',
      'otimização': 'optimization',
      'eficiência': 'efficiency',
      'efetividade': 'effectiveness',
      'qualidade': 'quality',
      'excelência': 'excellence',
      'perfeição': 'perfection',
      'ideal': 'ideal',
      'critério': 'criterion',
      'medida': 'measure',
      'métrica': 'metric',
      'indicador': 'indicator',
      'parâmetro': 'parameter',
      'variável': 'variable',
      'fator': 'factor',
      'elemento': 'element',
      'componente': 'component',
      'ingrediente': 'ingredient',
      'material': 'material',
      'substância': 'substance',
      'composto': 'compound',
      'molécula': 'molecule',
      'átomo': 'atom',
      'partícula': 'particle',
      'força': 'force',
      'potência': 'power',
      'intensidade': 'intensity',
      'magnitude': 'magnitude',
      'tamanho': 'size',
      'dimensão': 'dimension',
      'escala': 'scale',
      'proporção': 'proportion',
      'percentual': 'percentage',
      'fração': 'fraction',
      'decimal': 'decimal',
      'número': 'number',
      'valor': 'value',
      'quantidade': 'quantity',
      'unidade': 'unit',
      'metro': 'meter',
      'quilômetro': 'kilometer',
      'centímetro': 'centimeter',
      'milímetro': 'millimeter',
      'micrômetro': 'micrometer',
      'nanômetro': 'nanometer',
      'picômetro': 'picometer',
      'femtômetro': 'femtometer',
      'attômetro': 'attometer',
      'zeptômetro': 'zeptometer',
      'yoctômetro': 'yoctometer',
      'grama': 'gram',
      'quilograma': 'kilogram',
      'tonelada': 'ton',
      'libra': 'pound',
      'onça': 'ounce',
      'segundo': 'second',
      'minuto': 'minute',
      'hora': 'hour',
      'dia': 'day',
      'semana': 'week',
      'mês': 'month',
      'ano': 'year',
      'década': 'decade',
      'século': 'century',
      'milênio': 'millennium',
      'era': 'era',
      'época': 'epoch',
      'período': 'period',
      'fase': 'phase',
      'etapa': 'stage',
      'estágio': 'stage',
      'nível': 'level',
      'grau': 'degree',
      'categoria': 'category',
      'classe': 'class',
      'tipo': 'type',
      'espécie': 'species',
      'gênero': 'genus',
      'família': 'family',
      'ordem': 'order',
      'filo': 'phylum',
      'reino': 'kingdom',
      'domínio': 'domain'
    };

    // Tentar tradução de frases completas primeiro
    const lowerQuery = query.toLowerCase().trim();
    
    // Traduções de frases completas
    const phraseTranslations: Record<string, string> = {
      'como funciona a memória': 'how memory works',
      'como funciona a memória?': 'how memory works',
      'como funciona a eletricidade': 'how electricity works',
      'como funciona a eletricidade?': 'how electricity works',
      'como funciona a fotossíntese': 'how photosynthesis works',
      'como funciona a fotossíntese?': 'how photosynthesis works',
      'como funciona o cérebro': 'how brain works',
      'como funciona o cérebro?': 'how brain works',
      'como funciona o sistema nervoso': 'how nervous system works',
      'como funciona o sistema nervoso?': 'how nervous system works',
      'como funciona a respiração': 'how respiration works',
      'como funciona a respiração?': 'how respiration works',
      'como funciona o metabolismo': 'how metabolism works',
      'como funciona o metabolismo?': 'how metabolism works',
      'como funciona o dna': 'how dna works',
      'como funciona o dna?': 'how dna works',
      'como funciona a célula': 'how cell works',
      'como funciona a célula?': 'how cell works',
      'como funciona o corpo humano': 'how human body works',
      'como funciona o corpo humano?': 'how human body works'
    };
    
    // Verificar se há tradução de frase completa
    if (phraseTranslations[lowerQuery]) {
      return phraseTranslations[lowerQuery];
    }
    
    // Tentar tradução palavra por palavra
    const words = query.toLowerCase().split(' ');
    const translatedWords = words.map(word => {
      // Remover pontuação
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      return translations[cleanWord] || cleanWord;
    });

    return translatedWords.join(' ');
  } catch (error) {
    console.warn('⚠️ Erro na tradução, usando query original:', error);
    return query;
  }
}

// Função para melhorar a query para busca no Wikimedia Commons
function enhanceQueryForWikimedia(query: string, subject?: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Para Metallica, usar termos específicos da banda
  if (lowerQuery.includes('metallica')) {
    return 'Metallica band OR "Metallica" OR "James Hetfield" OR "Metallica concert" OR "Metallica live" OR "Metallica tour" OR "Metallica album"';
  }
  
  // Para eletricidade, usar termos científicos e visuais específicos
  if (lowerQuery.includes('eletricidade') || lowerQuery.includes('electricity')) {
    return 'electricity physics OR "electrical circuit" OR "electrical current" OR "electrical field" OR "electrical energy" OR "electrical power" OR "electrical voltage" OR "electrical resistance" OR "electrical conductor" OR "electrical insulator" OR "electrical generator" OR "electrical motor" OR "electrical transformer" OR "electrical wire" OR "electrical cable" OR "electrical plug" OR "electrical socket" OR "electrical switch" OR "electrical bulb" OR "electrical lightning" OR "electrical spark" OR "electrical discharge" OR "electrical magnetism" OR "electromagnetic" OR "electrical diagram" OR "electrical schematic" OR "electrical experiment" OR "electrical laboratory" OR "electrical equipment" OR "electrical device" OR "electrical appliance" OR "electrical technology" OR "electrical engineering" OR "electrical science" OR "electrical physics" OR "electrical phenomenon" OR "electrical wave" OR "electrical frequency" OR "electrical amplitude" OR "electrical signal" OR "electrical transmission" OR "electrical distribution" OR "electrical grid" OR "electrical power plant" OR "electrical substation" OR "electrical tower" OR "electrical pole" OR "electrical line" OR "electrical infrastructure"';
  }
  
  // Para outros termos, retornar a query original
  return query;
}
