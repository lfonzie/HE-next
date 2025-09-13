#!/usr/bin/env node

const bcrypt = require('bcryptjs');

console.log('🧪 Testando configuração de autenticação...\n');

// Teste 1: Verificar variáveis de ambiente
console.log('1️⃣ Verificando variáveis de ambiente:');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET', 
  'NEXTAUTH_URL',
  'OPENAI_API_KEY'
];

let envOk = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: Configurado`);
  } else {
    console.log(`   ❌ ${envVar}: NÃO CONFIGURADO`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n❌ Configure as variáveis de ambiente primeiro!');
  console.log('📝 Crie um arquivo .env.local com as variáveis necessárias');
  process.exit(1);
}

// Teste 2: Verificar NEXTAUTH_SECRET
console.log('\n2️⃣ Verificando NEXTAUTH_SECRET:');
const secret = process.env.NEXTAUTH_SECRET;
if (secret && secret.length >= 32) {
  console.log(`   ✅ Secret tem ${secret.length} caracteres (mínimo: 32)`);
} else {
  console.log(`   ❌ Secret tem apenas ${secret?.length || 0} caracteres (mínimo: 32)`);
  console.log('   💡 Gere um novo secret: openssl rand -base64 32');
}

// Teste 3: Verificar bcrypt
console.log('\n3️⃣ Testando bcrypt:');
try {
  const testPassword = 'test123';
  const hashed = bcrypt.hashSync(testPassword, 12);
  const isValid = bcrypt.compareSync(testPassword, hashed);
  
  if (isValid) {
    console.log('   ✅ bcrypt funcionando corretamente');
  } else {
    console.log('   ❌ bcrypt com problema');
  }
} catch (error) {
  console.log('   ❌ Erro no bcrypt:', error.message);
}

// Teste 4: Verificar URL do banco
console.log('\n4️⃣ Verificando DATABASE_URL:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith('postgresql://')) {
  console.log('   ✅ URL do banco parece válida');
  console.log(`   📍 Host: ${dbUrl.split('@')[1]?.split('/')[0] || 'N/A'}`);
} else {
  console.log('   ❌ URL do banco inválida');
  console.log('   💡 Formato esperado: postgresql://user:pass@host:port/db');
}

console.log('\n🎉 Teste de configuração concluído!');
console.log('\n📋 Próximos passos:');
console.log('   1. Execute: npx prisma db push');
console.log('   2. Execute: npx prisma db seed');
console.log('   3. Execute: npm run dev');
console.log('   4. Acesse: http://localhost:3000/login');

