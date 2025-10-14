// Test script for study path detection
const { detectIntent } = require('./lib/intent-detection.ts');

const testMessages = [
  "quero uma trilha de estudo para o enem",
  "crie um plano de estudos para enem",
  "trilha enem",
  "cronograma de estudo enem",
  "estratégia para enem",
  "preparação enem",
  "estudar enem",
  "material para enem"
];

console.log('🧪 Testing study path detection:\n');

testMessages.forEach(message => {
  const intent = detectIntent(message);
  console.log(`"${message}" -> ${intent.type} (confidence: ${intent.confidence})`);
});

console.log('\n✅ Test completed!');
