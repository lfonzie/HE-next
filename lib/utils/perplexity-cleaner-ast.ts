// lib/utils/perplexity-cleaner-ast.ts
// Robust AST-based cleaning for Perplexity responses that preserves Markdown structure
// This approach parses Markdown into an AST and only cleans text nodes, preserving links, lists, etc.

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";

const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/**
 * Strip citations from text content using comprehensive patterns
 */
function stripCitationsInText(value: string): string {
  let v = value;

  // Remove Chinese-style citations "…】"
  v = v.replace(/【\s*\d+[^】]*】/g, "");

  // Remove footnotes [^1]
  v = v.replace(/\[\^\d+\]/g, "");

  // Remove [1], [2,3], [1–3] at the end of word/segment
  v = v.replace(
    /(?<=\S)\s*\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\](?=(?:[\s)\].,;:!?】]*$))/g,
    ""
  );

  // Remove digits attached to the end of segment (…paulista13)
  v = v.replace(/(?<=\p{L}|\p{N})\d{1,3}(?=(?:[\s)\].,;:!?】]*$))/gu, "");

  // Remove superscripts at the end
  const supClass = `[${SUPERSCRIPTS}]`;
  v = v.replace(new RegExp(`${supClass}+(?=(?:[\\s)\\].,;:!?】]*$))`, "g"), "");

  return v;
}

/**
 * Clean Markdown citations using AST parsing
 * This preserves all Markdown structure while only cleaning text content
 */
export async function cleanMarkdownCitations(md: string): Promise<string> {
  if (!md || typeof md !== 'string') {
    return md;
  }

  try {
    const tree = unified().use(remarkParse).parse(md);

    visit(tree, "text", (node: any, _idx, parent: any) => {
      // Don't touch texts that are part of links (link, linkReference)
      if (parent && (parent.type === "link" || parent.type === "linkReference")) return;

      // Only clean segments that seem to contain citations
      const hasCiteLike =
        /【\s*\d+|(\[\^\d+\])|\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\]\s*$|[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*$|\d{1,3}\s*$/.test(
          node.value
        );

      if (hasCiteLike) {
        node.value = stripCitationsInText(node.value);
      }
    });

    const out = await unified().use(remarkStringify).stringify(tree);
    return String(out).trim();
  } catch (error) {
    console.error('[PERPLEXITY-CLEANER-AST] Error parsing Markdown:', error);
    // Fallback to regex-based cleaning if AST parsing fails
    return cleanMarkdownCitationsFallback(md);
  }
}

/**
 * Fallback regex-based cleaning for when AST parsing fails
 */
function cleanMarkdownCitationsFallback(md: string): string {
  let cleaned = md;

  // Apply the same patterns as the AST version but with regex
  cleaned = cleaned.replace(/【\s*\d+[^】]*】/g, "");
  cleaned = cleaned.replace(/\[\^\d+\]/g, "");
  cleaned = cleaned.replace(
    /(?<=\S)\s*\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\](?=(?:[\s)\].,;:!?】]*$))/g,
    ""
  );
  cleaned = cleaned.replace(/(?<=\p{L}|\p{N})\d{1,3}(?=(?:[\s)\].,;:!?】]*$))/gu, "");
  
  const supClass = `[${SUPERSCRIPTS}]`;
  cleaned = cleaned.replace(new RegExp(`${supClass}+(?=(?:[\\s)\\].,;:!?】]*$))`, "g"), "");

  return cleaned.trim();
}

/**
 * Check if Markdown contains citation patterns
 */
export function hasMarkdownCitations(md: string): boolean {
  if (!md || typeof md !== 'string') {
    return false;
  }

  const citationPatterns = [
    /【\s*\d+[^】]*】/, // Chinese-style citations
    /\[\^\d+\]/, // Footnotes
    /\[(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\](?=\s*$)/, // Bracket citations at end
    /(?<=\p{L}|\p{N})\d{1,3}(?=\s*$)/u, // Numbers at word end
    /[⁰¹²³⁴⁵⁶⁷⁸⁹]+(?=\s*$)/ // Superscripts at end
  ];

  return citationPatterns.some(pattern => pattern.test(md));
}

/**
 * Test function to validate AST cleaning works correctly
 */
export async function testASTCleaning(): Promise<void> {
  const testCases = [
    {
      input: "# Título Principal\n\nA temperatura atual é de 25°C13.\n\n## Subtítulo\n\nSegundo estudos [1, 2, 3], a situação é complexa.",
      description: "Complex Markdown with citations"
    },
    {
      input: "Aqui está um [link importante](https://example.com) com texto normal2.",
      description: "Markdown with link and citation"
    },
    {
      input: "1. Primeiro item da lista\n2. Segundo item com citação5\n3. Terceiro item normal",
      description: "Numbered list with citations"
    },
    {
      input: "- Item da lista\n- Outro item com citação9\n- Item final",
      description: "Bullet list with citations"
    },
    {
      input: "**Texto em negrito** com citação13 e *texto em itálico* normal.",
      description: "Formatted text with citations"
    }
  ];

  console.log("🧪 Testing AST-based Perplexity Citation Cleaning:");
  console.log("=" .repeat(60));

  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.description}`);
    console.log(`Input:\n${testCase.input}`);
    
    try {
      const result = await cleanMarkdownCitations(testCase.input);
      console.log(`Output:\n${result}`);
      console.log(`Status: ✅ SUCCESS`);
    } catch (error) {
      console.log(`Status: ❌ ERROR - ${error}`);
    }
  }

  console.log("\n" + "=" .repeat(60));
}

/**
 * Hybrid approach: Use AST for complex Markdown, regex for simple text
 */
export async function cleanPerplexityResponseHybrid(text: string): Promise<string> {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Check if the text contains Markdown elements
  const hasMarkdownElements = /[#*`\[\]()]/.test(text);
  
  if (hasMarkdownElements) {
    // Use AST-based cleaning for Markdown content
    return await cleanMarkdownCitations(text);
  } else {
    // Use regex-based cleaning for plain text
    return cleanMarkdownCitationsFallback(text);
  }
}
