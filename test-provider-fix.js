#!/usr/bin/env node

/**
 * Teste para verificar se o erro de provider foi corrigido
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function testProviderFix() {
  console.log('🧪 Testando se o erro de provider foi corrigido...\n');

  try {
    // 1. Testar criação de conversa sem campo provider
    console.log('1️⃣ Testando criação de conversa...');
    const conversation = await prisma.conversations.create({
      data: {
        user_id: uuidv4(),
        module: 'test',
        messages: []
      }
    });
    console.log(`✅ Conversa criada: ${conversation.id}\n`);

    // 2. Testar adição de mensagem
    console.log('2️⃣ Testando adição de mensagem...');
    const message = await prisma.conversation_message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: 'Teste de provider fix',
        index: 0,
        provider: 'openai', // Este campo existe na tabela conversation_message
        model: 'gpt-4o-mini'
      }
    });
    console.log(`✅ Mensagem criada: ${message.id}\n`);

    // 3. Testar recuperação
    console.log('3️⃣ Testando recuperação...');
    const foundConversation = await prisma.conversations.findUnique({
      where: { id: conversation.id },
      include: {
        conversation_messages: {
          orderBy: { index: 'asc' }
        }
      }
    });
    
    if (foundConversation) {
      console.log(`✅ Conversa recuperada: ${foundConversation.id}`);
      console.log(`✅ Mensagens: ${foundConversation.conversation_messages.length}`);
      foundConversation.conversation_messages.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.role}] ${msg.content} (provider: ${msg.provider})`);
      });
    } else {
      console.log('❌ Conversa não encontrada!');
    }
    console.log();

    // 4. Testar simulação da API
    console.log('4️⃣ Testando simulação da API...');
    const testUserId = uuidv4();
    const testConversationId = uuidv4();
    
    // Simular ensureConversation
    const newConv = await prisma.conversations.create({
      data: {
        id: testConversationId,
        user_id: testUserId,
        module: 'chat',
        messages: []
      }
    });
    console.log(`✅ Conversa da API criada: ${newConv.id}\n`);

    // 5. Limpeza
    console.log('5️⃣ Limpando dados de teste...');
    await prisma.conversation_message.deleteMany({
      where: { conversationId: conversation.id }
    });
    
    await prisma.conversations.delete({
      where: { id: conversation.id }
    });
    
    await prisma.conversations.delete({
      where: { id: newConv.id }
    });
    
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 TESTE PROVIDER FIX CONCLUÍDO COM SUCESSO!');
    console.log('O erro de campo provider inexistente foi corrigido!');
    console.log('Agora o sistema pode criar conversas sem erro.');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testProviderFix();
}

export { testProviderFix };
