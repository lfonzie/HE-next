#!/usr/bin/env node

/**
 * Script para corrigir problemas de deploy no Render
 * - Verifica configuração do banco de dados
 * - Testa conexão com Neon PostgreSQL
 * - Valida variáveis de ambiente
 */

import { PrismaClient } from '@prisma/client';

async function checkDatabaseConnection() {
  console.log('🔍 Verificando conexão com banco de dados...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Teste básico de conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Verificar se as tabelas existem
    const userCount = await prisma.user.count();
    console.log(`✅ Tabela User encontrada (${userCount} usuários)`);

    // Teste de query simples
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, role: true }
    });
    
    if (testUser) {
      console.log(`✅ Query de teste bem-sucedida: ${testUser.email}`);
    } else {
      console.log('⚠️ Nenhum usuário encontrado na base');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro de conexão com banco:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔧 Possíveis soluções:');
      console.log('1. Verifique se DATABASE_URL está correto no Render');
      console.log('2. Verifique se o banco Neon está ativo');
      console.log('3. Verifique se a URL inclui ?sslmode=require');
      console.log('4. Execute: npx prisma db push');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔍 Verificando variáveis de ambiente...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'OPENAI_API_KEY'
  ];

  const missing = [];
  const present = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
      console.log(`✅ ${varName}: configurado`);
    } else {
      missing.push(varName);
      console.log(`❌ ${varName}: não encontrado`);
    }
  });

  if (missing.length > 0) {
    console.log('\n⚠️ Variáveis obrigatórias ausentes:', missing.join(', '));
    console.log('\n🔧 Configure no Render Dashboard:');
    missing.forEach(varName => {
      console.log(`- ${varName}=valor`);
    });
    return false;
  }

  return true;
}

async function checkNextAuthConfig() {
  console.log('\n🔍 Verificando configuração NextAuth...');
  
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  if (!nextAuthUrl) {
    console.log('❌ NEXTAUTH_URL não configurado');
    return false;
  }

  if (!nextAuthSecret) {
    console.log('❌ NEXTAUTH_SECRET não configurado');
    return false;
  }

  if (nextAuthSecret.length < 32) {
    console.log('⚠️ NEXTAUTH_SECRET muito curto (mínimo 32 caracteres)');
    return false;
  }

  console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl}`);
  console.log(`✅ NEXTAUTH_SECRET: ${nextAuthSecret.substring(0, 8)}...`);
  
  return true;
}

async function generateNextAuthSecret() {
  console.log('\n🔑 Gerando nova chave NEXTAUTH_SECRET...');
  
  const crypto = await import('crypto');
  const secret = crypto.randomBytes(32).toString('base64');
  
  console.log('Nova chave gerada:');
  console.log(`NEXTAUTH_SECRET="${secret}"`);
  console.log('\n🔧 Adicione esta chave no Render Dashboard');
  
  return secret;
}

async function main() {
  console.log('🚀 Verificação de Deploy Render - HubEdu.ia\n');
  
  const envOk = await checkEnvironmentVariables();
  const authOk = await checkNextAuthConfig();
  const dbOk = await checkDatabaseConnection();

  console.log('\n📊 Resumo da Verificação:');
  console.log(`Variáveis de ambiente: ${envOk ? '✅' : '❌'}`);
  console.log(`Configuração NextAuth: ${authOk ? '✅' : '❌'}`);
  console.log(`Conexão com banco: ${dbOk ? '✅' : '❌'}`);

  if (!envOk || !authOk || !dbOk) {
    console.log('\n❌ Problemas encontrados. Corrija antes do deploy.');
    
    if (!authOk) {
      await generateNextAuthSecret();
    }
    
    process.exit(1);
  } else {
    console.log('\n✅ Tudo configurado corretamente! Pronto para deploy.');
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  checkDatabaseConnection,
  checkEnvironmentVariables,
  checkNextAuthConfig,
  generateNextAuthSecret
};
