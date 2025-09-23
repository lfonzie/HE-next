import { NextResponse } from "next/server";

type Provider = "wikimedia" | "unsplash" | "pixabay";
type ImageItem = {
  id: string;
  provider: Provider;
  title?: string;
  alt?: string;
  thumbUrl?: string;
  url: string;
  width?: number;
  height?: number;
  author?: string;
  sourcePage?: string;
  license?: string;
  score?: number;
  meta?: Record<string, any>;
};

const UNSPLASH_ENDPOINT = "https://api.unsplash.com/search/photos";
const PIXABAY_ENDPOINT  = "https://pixabay.com/api/";
const WIKIMEDIA_ENDPOINT = "https://commons.wikimedia.org/w/api.php";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ---------------- Provedores ---------------- */

async function fetchUnsplash(q: string, page: number, perPage: number, orientation?: string) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [] as ImageItem[];
  const url = new URL(UNSPLASH_ENDPOINT);
  url.searchParams.set("query", q);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  if (orientation) url.searchParams.set("orientation", orientation); // landscape|portrait|squarish
  const res = await fetch(url.toString(), { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((p: any): ImageItem => ({
    id: String(p.id),
    provider: "unsplash",
    title: p.description || p.alt_description || undefined,
    alt: p.alt_description || undefined,
    thumbUrl: p.urls?.small,
    url: p.urls?.regular || p.urls?.full || p.urls?.raw,
    width: p.width,
    height: p.height,
    author: p.user?.name,
    sourcePage: p.links?.html,
    license: "Unsplash License",
    meta: { likes: p.likes, color: p.color },
  }));
}

async function fetchPixabay(q: string, page: number, perPage: number, orientation?: string, safe = true) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [] as ImageItem[];
  const url = new URL(PIXABAY_ENDPOINT);
  url.searchParams.set("key", key);
  url.searchParams.set("q", q);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  if (orientation) url.searchParams.set("orientation", orientation); // horizontal|vertical
  url.searchParams.set("safesearch", String(safe));
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.hits || []).map((h: any): ImageItem => ({
    id: String(h.id),
    provider: "pixabay",
    title: h.tags,
    alt: h.tags,
    thumbUrl: h.previewURL,
    url: h.largeImageURL || h.webformatURL,
    width: h.imageWidth,
    height: h.imageHeight,
    author: h.user,
    sourcePage: h.pageURL,
    license: "Pixabay License",
    meta: { views: h.views, downloads: h.downloads, likes: h.likes },
  }));
}

async function fetchWikimedia(q: string, page: number, perPage: number) {
  const offset = (page - 1) * perPage;
  const url = new URL(WIKIMEDIA_ENDPOINT);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("prop", "imageinfo|info|pageimages");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", q);
  url.searchParams.set("gsrlimit", String(perPage));
  url.searchParams.set("gsroffset", String(offset));
  url.searchParams.set("inprop", "url");
  url.searchParams.set("piprop", "thumbnail|original");
  url.searchParams.set("pithumbsize", "600");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");

  const res = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!res.ok) return [] as ImageItem[];
  const data = await res.json();
  const pages = data?.query?.pages || {};
  return Object.values(pages).map((p: any): ImageItem => {
    const ii = p.imageinfo?.[0];
    const originalUrl = ii?.url;
    const thumb = p.thumbnail?.source || ii?.thumburl;
    const license =
      ii?.extmetadata?.LicenseShortName?.value ||
      ii?.extmetadata?.UsageTerms?.value ||
      "See source";
    return {
      id: String(p.pageid),
      provider: "wikimedia",
      title: p.title,
      alt: p.title,
      thumbUrl: thumb,
      url: originalUrl || thumb,
      width: ii?.width,
      height: ii?.height,
      author: ii?.extmetadata?.Artist?.value?.replace(/<\/?[^>]+(>|$)/g, ""),
      sourcePage: p.fullurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      license,
      meta: { mime: ii?.mime },
    };
  });
}

/* ---------------- Rerank semântico obrigatório ---------------- */

async function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-large", input: texts }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data.map((d: any) => d.embedding as number[]);
}

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

async function semanticRerank(query: string, items: ImageItem[], topK: number): Promise<ImageItem[]> {
  if (!items.length) return [];
  const [qEmb, docEmb] = await Promise.all([
    embedBatch([query]),
    embedBatch(items.map(it =>
      [it.title ?? "", it.alt ?? "", it.author ? `Author: ${it.author}` : "", it.license ?? "", it.provider].join(" | ")
    )),
  ]);
  if (!qEmb.length || !docEmb.length) return items.slice(0, topK);
  const qv = qEmb[0];
  const scored = items.map((it, i) => ({ ...it, score: cosine(qv, docEmb[i]) }));
  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored.slice(0, topK);
}

/* ---------------- Utils ---------------- */

// Função para extrair termos principais de consultas educacionais
function extractMainTerms(query: string): { mainTerm: string; contextTerms: string[] } {
  const lowerQuery = query.toLowerCase().trim();
  
  // Padrões comuns em consultas educacionais
  const educationalPatterns = [
    // Padrão: "matéria de [termo]" ou "física de [termo]" - PRIORIDADE ALTA
    // Captura o termo após "de" (grupo 1)
    /^(?:física|química|biologia|história|geografia|matemática|português|literatura|filosofia|sociologia|educação física|artes)\s+de\s+(.+)$/,
    // Padrão: "matéria do [termo]" ou "física do [termo]" - PRIORIDADE ALTA
    // Captura o termo após "do" (grupo 1)
    /^(?:física|química|biologia|história|geografia|matemática|português|literatura|filosofia|sociologia|educação física|artes)\s+do\s+(.+)$/,
    // Padrão: "matéria da [termo]" ou "física da [termo]" - PRIORIDADE ALTA  
    // Captura o termo após "da" (grupo 1)
    /^(?:física|química|biologia|história|geografia|matemática|português|literatura|filosofia|sociologia|educação física|artes)\s+da\s+(.+)$/,
    // Padrão: "[termo] em física" ou "[termo] na biologia"
    // Captura o termo antes da disciplina (grupo 1)
    /^(.+?)\s+(?:em|na|no)\s+(?:física|química|biologia|história|geografia|matemática|português|literatura|filosofia|sociologia|educação física|artes)$/,
    // Padrão: "estudo de [termo]" ou "análise de [termo]"
    // Captura o termo após "de" (grupo 1)
    /^(?:estudo|análise|pesquisa|investigação)\s+de\s+(.+)$/,
    // Padrão: "[termo] - conceitos" ou "[termo] - teoria"
    // Captura o termo antes do hífen (grupo 1)
    /^(.+?)\s*[-–]\s*(?:conceitos|teoria|fundamentos|princípios|básicos)$/,
  ];

  // Tentar encontrar padrões educacionais
  for (const pattern of educationalPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const mainTerm = match[1].trim();
      const contextTerms = lowerQuery.split(/\s+/).filter(term => 
        term !== mainTerm && term.length > 2
      );
      return { mainTerm, contextTerms };
    }
  }

  // Se não encontrar padrão específico, usar heurística simples
  const words = lowerQuery.split(/\s+/);
  
  // Remover palavras muito comuns que não são termos principais
  const commonWords = new Set([
    'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
    'para', 'por', 'com', 'sem', 'sobre', 'entre', 'durante',
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
    'que', 'qual', 'quais', 'como', 'quando', 'onde', 'porque',
    'estudo', 'análise', 'pesquisa', 'investigação', 'conceitos',
    'teoria', 'fundamentos', 'princípios', 'básicos'
  ]);

  // Filtrar palavras comuns e muito curtas
  const meaningfulWords = words.filter(word => 
    word.length > 2 && !commonWords.has(word)
  );

  if (meaningfulWords.length === 0) {
    return { mainTerm: lowerQuery, contextTerms: [] };
  }

  // O primeiro termo significativo é geralmente o principal
  const mainTerm = meaningfulWords[0];
  const contextTerms = meaningfulWords.slice(1);

  return { mainTerm, contextTerms };
}

// Função para criar consultas otimizadas para busca de imagens
function createOptimizedQueries(originalQuery: string): string[] {
  const { mainTerm, contextTerms } = extractMainTerms(originalQuery);
  
  const queries = [
    mainTerm, // Termo principal isolado
  ];

  // Adicionar variações do termo principal
  if (mainTerm.includes(' ')) {
    // Se o termo principal tem múltiplas palavras, adicionar versão simplificada
    const firstWord = mainTerm.split(' ')[0];
    if (firstWord.length > 3) {
      queries.push(firstWord);
    }
  }

  // Adicionar contexto se relevante
  if (contextTerms.length > 0) {
    const contextQuery = `${mainTerm} ${contextTerms.slice(0, 2).join(' ')}`;
    queries.push(contextQuery);
  }

  // Adicionar termos relacionados educacionais
  const educationalSynonyms: Record<string, string[]> = {
    'terremoto': ['earthquake', 'sismo', 'tremor'],
    'vulcão': ['volcano', 'erupção'],
    'fotossíntese': ['photosynthesis', 'clorofila'],
    'mitose': ['mitosis', 'divisão celular'],
    'evolução': ['evolution', 'darwin'],
    'gravidade': ['gravity', 'gravitational'],
    'eletricidade': ['electricity', 'electrical'],
    'magnetismo': ['magnetism', 'magnetic'],
    'atomo': ['atom', 'atomic'],
    'molécula': ['molecule', 'molecular'],
  };

  const synonyms = educationalSynonyms[mainTerm.toLowerCase()];
  if (synonyms) {
    queries.push(...synonyms.slice(0, 2));
  }

  return [...new Set(queries)]; // Remove duplicatas
}

function dedupByUrl(items: ImageItem[]): ImageItem[] {
  const seen = new Set<string>();
  const out: ImageItem[] = [];
  for (const it of items) {
    const key = it.url || it.thumbUrl || `${it.provider}:${it.id}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/* ---------------- Handler ---------------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const originalQuery = (searchParams.get("q") || "").trim();
    if (!originalQuery) return NextResponse.json({ error: "Parâmetro 'q' é obrigatório." }, { status: 400 });

    // Criar consultas otimizadas para busca mais precisa
    const optimizedQueries = createOptimizedQueries(originalQuery);
    const { mainTerm } = extractMainTerms(originalQuery);

    // Recall antes do rerank (pode ajustar)
    const perProvider = clamp(parseInt(searchParams.get("perProvider") || "12", 10), 3, 50);
    const page = clamp(parseInt(searchParams.get("page") || "1", 10), 1, 50);
    const orientation = searchParams.get("orientation") || undefined; // Unsplash/Pixabay
    const safe = (searchParams.get("safe") ?? "true") !== "false";

    // Buscar com múltiplas consultas otimizadas
    const allResults: ImageItem[] = [];
    
    for (const query of optimizedQueries.slice(0, 3)) { // Limitar a 3 consultas para performance
      const [u, p, w] = await Promise.allSettled([
        fetchUnsplash(query, page, Math.ceil(perProvider / 3), orientation),
        fetchPixabay(query, page, Math.ceil(perProvider / 3), orientation, safe),
        fetchWikimedia(query, page, Math.ceil(perProvider / 3)),
      ]);

      const queryResults = dedupByUrl([
        ...(u.status === "fulfilled" ? u.value : []),
        ...(p.status === "fulfilled" ? p.value : []),
        ...(w.status === "fulfilled" ? w.value : []),
      ]);

      allResults.push(...queryResults);
    }

    // Remover duplicatas de todas as consultas
    const merged = dedupByUrl(allResults);

    // Rerank semântico usando o termo principal para maior precisão
    const topResults = await semanticRerank(mainTerm, merged, 6); // Aumentar para 6 resultados

    return NextResponse.json({
      query: originalQuery,
      mainTerm,
      optimizedQueries,
      count: topResults.length,
      topK: 6,
      page,
      perProvider,
      items: topResults, // cada item já inclui score
    }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });

  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao executar busca semântica", detail: e?.message }, { status: 500 });
  }
}
