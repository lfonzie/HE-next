#!/usr/bin/env node

// Script para verificar configuração do Gemini Live API
console.log('🔍 Verificando configuração do Gemini Live API...\n');

// Verificar variáveis de ambiente
const requiredVars = [
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY'
];

console.log('📋 Variáveis de ambiente encontradas:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Não encontrada`);
  }
});

console.log('\n🔧 Configuração recomendada:');
console.log('NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg');

console.log('\n📝 Instruções:');
console.log('1. Adicione NEXT_PUBLIC_GEMINI_API_KEY ao seu .env.local');
console.log('2. Reinicie o servidor de desenvolvimento (npm run dev)');
console.log('3. Teste a funcionalidade em /test-live-audio-aulas');

console.log('\n🎯 Teste rápido:');
console.log('Acesse: http://localhost:3000/test-live-audio-aulas');
console.log('Clique em "Conectar" para testar a conexão com Gemini Live API');

