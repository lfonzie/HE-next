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
    const q = (searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ error: "Parâmetro 'q' é obrigatório." }, { status: 400 });

    // Recall antes do rerank (pode ajustar)
    const perProvider = clamp(parseInt(searchParams.get("perProvider") || "12", 10), 3, 50);
    const page = clamp(parseInt(searchParams.get("page") || "1", 10), 1, 50);
    const orientation = searchParams.get("orientation") || undefined; // Unsplash/Pixabay
    const safe = (searchParams.get("safe") ?? "true") !== "false";

    // Busca concorrente nos 3 provedores
    const [u, p, w] = await Promise.allSettled([
      fetchUnsplash(q, page, perProvider, orientation),
      fetchPixabay(q, page, perProvider, orientation, safe),
      fetchWikimedia(q, page, perProvider),
    ]);

    const merged = dedupByUrl([
      ...(u.status === "fulfilled" ? u.value : []),
      ...(p.status === "fulfilled" ? p.value : []),
      ...(w.status === "fulfilled" ? w.value : []),
    ]);

    // Rerank obrigatório + Top-3
    const top3 = await semanticRerank(q, merged, 3);

    return NextResponse.json({
      query: q,
      count: top3.length,
      topK: 3,
      page,
      perProvider,
      items: top3, // cada item já inclui score
    }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });

  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao executar busca semântica", detail: e?.message }, { status: 500 });
  }
}
