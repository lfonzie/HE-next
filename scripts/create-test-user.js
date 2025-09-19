#!/usr/bin/env node

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...\n');

    const testUser = {
      name: 'Usuário Teste',
      email: 'teste@hubedu.ai',
      password: '123456',
      role: 'STUDENT'
    };

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });

    if (existingUser) {
      console.log('⚠️ Usuário de teste já existe!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nome: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log('\n🔑 Credenciais de teste:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Senha: ${testUser.password}`);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password_hash: hashedPassword,
        role: testUser.role
      }
    });

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    console.log('\n🔑 Credenciais de teste:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Senha: ${testUser.password}`);
    
    console.log('\n🚀 Agora você pode:');
    console.log('   1. Executar: npm run dev');
    console.log('   2. Acessar: http://localhost:3000/login');
    console.log('   3. Fazer login com as credenciais acima');

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Dica: Verifique se o banco de dados está rodando');
      console.log('   Execute: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

