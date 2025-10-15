// lib/cleanCitations.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

// Remove apenas tokens de citação típicos da Perplexity/afins
function stripCiteTokens(segment: string): string {
  let v = segment;

  // 1) Blocos tipo " … 】"
  v = v.replace(/【\s*\d+[^】]*】/g, "");

  // 2) Footnotes tipo [^1]
  v = v.replace(/\[\^\d+\]/g, "");

  // 3) Citações numéricas entre colchetes: [1], [2,3], [1–3]
  //    Remove tanto no meio quanto no fim da frase
  v = v.replace(/\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\]/g, "");

  // 4) Superscritos (¹²³ etc.) - remove em qualquer posição
  v = v.replace(new RegExp(`[${SUP}]+`, "g"), "");

  // 5) Dígitos grudados ao fim de palavra (…paulista19) — padrão de citação da Perplexity
  //    Requer que antes tenha letra e depois seja fim/fecho/pontuação.
  //    Limita a 1–3 dígitos para não apagar anos como 2025.
  v = v.replace(
    /([a-zA-ZáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])\d{1,3}(?=[.!?]|$|\s)/g,
    '$1'
  );

  // 6) Limpeza de espaços duplos e pontuação
  v = v.replace(/\s+([.!?])/g, '$1');
  v = v.replace(/([.!?])\s*([.!?])/g, '$1');
  v = v.replace(/\s+/g, ' ');
  v = v.replace(/,\s*,/g, ','); // Remove vírgulas duplas
  v = v.replace(/,\s*\./g, '.'); // Remove vírgula antes de ponto
  v = v.replace(/,\s+/g, ', '); // Normaliza espaço após vírgula

  return v;
}

export async function cleanMarkdownCitations(md: string): Promise<string> {
  if (!md || typeof md !== 'string' || md.trim().length === 0) {
    return md;
  }

  try {
    const processor = unified().use(remarkParse);
    const tree = processor.parse(md);

    visit(tree, "text", (node: any, _idx: number | null, parent: any) => {
      // Não tocar em âncoras (links) e referências de link
      if (parent && (parent.type === "link" || parent.type === "linkReference")) return;

      // Heurística: só processar se há "cara de citação"
      const looksLikeCite =
        /【\s*\d+|(\[\^\d+\])|\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\]\s*$|[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*$|\d{1,3}\s*$/.test(
          node.value
        );
      if (looksLikeCite) {
        node.value = stripCiteTokens(node.value);
      }
    });

    const out = await unified().use(remarkStringify).stringify(tree);
    // Trim final sem mexer no conteúdo
    return String(out).trim();
  } catch (error) {
    console.warn('[CLEAN-CITATIONS] AST parsing failed, falling back to original text:', error);
    return md;
  }
}
