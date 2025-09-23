#!/usr/bin/env node

/**
 * Teste simples da função de extração de termos principais
 */

// Função para extrair termos principais de consultas educacionais
function extractMainTerms(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Padrões comuns em consultas educacionais
  const educationalPatterns = [
    // Padrão: "matéria de [termo]" ou "física de [termo]" - PRIORIDADE ALTA
    // Captura o termo após "de" (grupo 1)
    /^(?:física|química|biologia|história|geografia|matemática|português|literatura|filosofia|sociologia|educação física|artes)\s+de\s+(.+)$/,
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

// Testes
const testCases = [
  'física do terremoto',
  'biologia da fotossíntese', 
  'terremoto em geografia',
  'química da tabela periódica',
  'história do Brasil',
  'terremoto',
  'fotossíntese'
];

console.log('🧪 Teste da Função de Extração de Termos Principais');
console.log('==================================================');

testCases.forEach(testCase => {
  const result = extractMainTerms(testCase);
  console.log(`\n📝 "${testCase}"`);
  console.log(`   → Termo principal: "${result.mainTerm}"`);
  console.log(`   → Termos contexto: [${result.contextTerms.join(', ')}]`);
});

console.log('\n✅ Teste concluído!');
