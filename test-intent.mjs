// Test script for intent detection - Simplified version
// This will show you the patterns that should trigger study path detection

const studypathPatterns = [
  /trilha de estudo/i,
  /trilha de estudos/i,
  /plano de estudo/i,
  /plano de estudos/i,
  /cronograma de estudo/i,
  /cronograma de estudos/i,
  /roteiro de estudo/i,
  /roteiro de estudos/i,
  /caminho de estudo/i,
  /caminho de estudos/i,
  /estudo.*sistematico/i,
  /estudo.*sistemático/i,
  /preparação.*enem/i,
  /preparacao.*enem/i,
  /estudar.*enem/i,
  /preparar.*enem/i,
  /plano.*enem/i,
  /trilha.*enem/i,
  /cronograma.*enem/i,
  /estudo.*completo/i,
  /estudo.*integrado/i,
  /estudo.*organizado/i,
  /estudo.*estruturado/i,
  /preparação.*completa/i,
  /preparacao.*completa/i,
  /estudo.*longo prazo/i,
  /estudo.*longo prazo/i,
  /planejamento.*estudo/i,
  /planejamento.*estudos/i,
  /metodologia.*estudo/i,
  /metodologia.*estudos/i,
  /estratégia.*estudo/i,
  /estratégia.*estudos/i,
  /estratégia.*enem/i,
  /estratégia.*enem/i,
  /guia.*estudo/i,
  /guia.*estudos/i,
  /guia.*enem/i,
  /guia.*enem/i,
  /mapa.*estudo/i,
  /mapa.*estudos/i,
  /roadmap.*estudo/i,
  /roadmap.*estudos/i,
  /caminho.*enem/i,
  /jornada.*estudo/i,
  /jornada.*estudos/i,
  /jornada.*enem/i,
  /itinerário.*estudo/i,
  /itinerário.*estudos/i,
  /itinerario.*estudo/i,
  /itinerario.*estudos/i,
  /planejar.*estudos/i,
  /planejar.*estudo/i,
  /organizar.*estudos/i,
  /organizar.*estudo/i,
  /estrutura.*estudo/i,
  /estrutura.*estudos/i
];

const testMessages = [
  "quero uma trilha de estudo para o enem",
  "crie um plano de estudos para enem",
  "trilha enem",
  "cronograma de estudo enem",
  "estratégia para enem",
  "preparação enem",
  "resumo para prova",
  "material de estudo",
  "como está o clima em são paulo",
  "qual é a capital do brasil",
];

console.log('🧪 Testing study path pattern matching:\n');

testMessages.forEach(message => {
  const matches = studypathPatterns.some(pattern => pattern.test(message));
  console.log(`"${message}"`);
  console.log(`  → Would trigger studypath: ${matches ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

console.log('✅ Pattern test completed!');
