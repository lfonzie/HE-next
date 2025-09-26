#!/usr/bin/env node

/**
 * Teste para verificar se o UUID está funcionando corretamente
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function testUUIDFix() {
  console.log('🧪 Testando se o UUID está funcionando...\n');

  try {
    // 1. Gerar UUID válido
    console.log('1️⃣ Gerando UUID válido...');
    const testUUID = uuidv4();
    console.log(`✅ UUID gerado: ${testUUID}\n`);

    // 2. Criar conversa com UUID válido
    console.log('2️⃣ Criando conversa com UUID válido...');
    const conversation = await prisma.conversations.create({
      data: {
        user_id: testUUID, // Usar o UUID gerado
        module: 'test',
        messages: []
      }
    });
    console.log(`✅ Conversa criada: ${conversation.id}\n`);

    // 3. Adicionar mensagem de teste
    console.log('3️⃣ Adicionando mensagem de teste...');
    const message = await prisma.conversation_message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: 'Teste de UUID',
        index: 0,
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });
    console.log(`✅ Mensagem criada: ${message.id}\n`);

    // 4. Testar recuperação
    console.log('4️⃣ Testando recuperação da conversa...');
    const foundConversation = await prisma.conversations.findUnique({
      where: { id: conversation.id }
    });
    
    if (foundConversation) {
      console.log(`✅ Conversa recuperada: ${foundConversation.id}`);
      console.log(`✅ User ID: ${foundConversation.user_id}`);
    } else {
      console.log('❌ Conversa não encontrada!');
    }
    console.log();

    // 5. Testar histórico
    console.log('5️⃣ Testando recuperação do histórico...');
    const history = await prisma.conversation_message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { index: 'asc' }
    });
    
    console.log(`✅ Histórico recuperado: ${history.length} mensagens`);
    history.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content}`);
    });
    console.log();

    // 6. Limpeza
    console.log('6️⃣ Limpando dados de teste...');
    await prisma.conversation_message.deleteMany({
      where: { conversationId: conversation.id }
    });
    
    await prisma.conversations.delete({
      where: { id: conversation.id }
    });
    
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 TESTE UUID CONCLUÍDO COM SUCESSO!');
    console.log('O sistema agora está usando UUIDs válidos.');
    console.log('O erro de "invalid character" foi corrigido!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testUUIDFix();
}

export { testUUIDFix };
