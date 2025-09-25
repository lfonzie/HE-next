#!/usr/bin/env node

// Script para verificar configurações de ambiente com dotenv
require('dotenv').config();

console.log('🔍 Verificando configurações de ambiente...\n');

// Verificar variáveis essenciais
const requiredVars = [
  'OPENAI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'NEXT_PUBLIC_BASE_URL'
];

const optionalVars = [
  'ANTHROPIC_API_KEY',
  'PERPLEXITY_API_KEY',
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('📋 Variáveis obrigatórias:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const masked = value.length > 8 ? value.substring(0, 4) + '...' + value.substring(value.length - 4) : '***';
    console.log(`  ✅ ${varName}: ${masked}`);
  } else {
    console.log(`  ❌ ${varName}: NÃO DEFINIDA`);
  }
});

console.log('\n📋 Variáveis opcionais:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const masked = value.length > 8 ? value.substring(0, 4) + '...' + value.substring(value.length - 4) : '***';
    console.log(`  ✅ ${varName}: ${masked}`);
  } else {
    console.log(`  ⚠️  ${varName}: não definida`);
  }
});

// Verificar se o arquivo .env existe
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.development'];
console.log('\n📁 Arquivos de ambiente:');
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}: existe`);
  } else {
    console.log(`  ❌ ${file}: não encontrado`);
  }
});

// Verificar se há pelo menos uma API key válida
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

console.log('\n🎯 Status das APIs:');
console.log(`  OpenAI: ${hasOpenAI ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`  Google: ${hasGoogle ? '✅ Configurada' : '❌ Não configurada'}`);

if (!hasOpenAI && !hasGoogle) {
  console.log('\n🚨 ERRO: Nenhuma API key configurada!');
  console.log('   Configure pelo menos uma das seguintes:');
  console.log('   - OPENAI_API_KEY');
  console.log('   - GOOGLE_GENERATIVE_AI_API_KEY');
  process.exit(1);
} else {
  console.log('\n✅ Pelo menos uma API está configurada!');
}

// Verificar conectividade básica
console.log('\n🌐 Testando conectividade...');
const https = require('https');

function testAPI(name, url, headers = {}) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers }, (res) => {
      resolve({ name, status: res.statusCode, ok: res.statusCode < 400 });
    });
    
    req.on('error', () => {
      resolve({ name, status: 'ERROR', ok: false });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ name, status: 'TIMEOUT', ok: false });
    });
    
    req.end();
  });
}

async function testConnectivity() {
  const tests = [
    testAPI('OpenAI', 'https://api.openai.com/v1/models'),
    testAPI('Google AI', 'https://generativelanguage.googleapis.com/v1beta/models')
  ];
  
  const results = await Promise.all(tests);
  
  results.forEach(result => {
    if (result.ok) {
      console.log(`  ✅ ${result.name}: Conectado (${result.status})`);
    } else {
      console.log(`  ❌ ${result.name}: ${result.status}`);
    }
  });
}

testConnectivity().then(() => {
  console.log('\n🎉 Verificação concluída!');
});
