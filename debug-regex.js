#!/usr/bin/env node

// Teste específico do regex para "física do terremoto"
const testQuery = "física do terremoto";
const lowerQuery = testQuery.toLowerCase().trim();

console.log('🔍 Debug do Regex');
console.log('================');
console.log(`Query: "${lowerQuery}"`);

const pattern = /^(?:física|química|biologia|história|geografia|matemática|português|literatura|filosofia|sociologia|educação física|artes)\s+de\s+(.+)$/;

console.log(`Pattern: ${pattern}`);
console.log(`Match: ${pattern.test(lowerQuery)}`);

const match = lowerQuery.match(pattern);
if (match) {
  console.log(`Groups: [${match.map((g, i) => `"${g}"`).join(', ')}]`);
  console.log(`Group 1 (main term): "${match[1]}"`);
} else {
  console.log('No match found');
}

// Teste com diferentes variações
const variations = [
  'física do terremoto',
  'física de terremoto', 
  'física da terremoto',
  'química do átomo',
  'biologia da célula'
];

console.log('\n🧪 Teste de Variações');
console.log('====================');

variations.forEach(variation => {
  const match = variation.toLowerCase().match(pattern);
  if (match) {
    console.log(`✅ "${variation}" → "${match[1]}"`);
  } else {
    console.log(`❌ "${variation}" → no match`);
  }
});
