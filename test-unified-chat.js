#!/usr/bin/env node

/**
 * Script de teste para o sistema de chat unificado
 * Testa persistência de contexto, múltiplos provedores e trimming
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChatSystem() {
  console.log('🧪 Iniciando testes do sistema de chat unificado...\n');

  try {
    // 1. Teste de criação de conversa
    console.log('1️⃣ Testando criação de conversa...');
    const conversation = await prisma.conversations.create({
      data: {
        user_id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
        module: 'test',
        messages: []
      }
    });
    console.log(`✅ Conversa criada: ${conversation.id}\n`);

    // 2. Teste de adição de mensagens
    console.log('2️⃣ Testando adição de mensagens...');
    
    const userMessage = await prisma.conversation_message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: 'Olá, como você está?',
        index: 0,
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });
    
    const assistantMessage = await prisma.conversation_message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: 'Olá! Estou bem, obrigado por perguntar. Como posso ajudá-lo hoje?',
        index: 1,
        provider: 'openai',
        model: 'gpt-4o-mini'
      }
    });
    
    console.log(`✅ Mensagens adicionadas: ${userMessage.id}, ${assistantMessage.id}\n`);

    // 3. Teste de recuperação de histórico
    console.log('3️⃣ Testando recuperação de histórico...');
    const history = await prisma.conversation_message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { index: 'asc' }
    });
    
    console.log(`✅ Histórico recuperado: ${history.length} mensagens`);
    history.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });
    console.log();

    // 4. Teste de estatísticas
    console.log('4️⃣ Testando estatísticas...');
    const stats = await prisma.conversation_message.aggregate({
      where: { conversationId: conversation.id },
      _count: { id: true },
      _sum: { tokenCount: true }
    });
    
    console.log(`✅ Estatísticas: ${stats._count.id} mensagens, ${stats._sum.tokenCount || 0} tokens\n`);

    // 5. Teste de múltiplos provedores
    console.log('5️⃣ Testando múltiplos provedores...');
    const providers = ['openai', 'gemini', 'groq'];
    
    for (const provider of providers) {
      await prisma.conversation_message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: `Resposta do provedor ${provider}`,
          index: history.length + providers.indexOf(provider),
          provider: provider,
          model: provider === 'openai' ? 'gpt-4o-mini' : 
                 provider === 'gemini' ? 'gemini-pro' : 'llama3-8b-8192'
        }
      });
    }
    
    console.log(`✅ Mensagens de ${providers.length} provedores adicionadas\n`);

    // 6. Teste de trimming (simulação)
    console.log('6️⃣ Testando simulação de trimming...');
    const allMessages = await prisma.conversation_message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { index: 'asc' }
    });
    
    // Simular trimming: manter apenas as últimas 3 mensagens
    const trimmedMessages = allMessages.slice(-3);
    console.log(`✅ Trimming simulado: ${allMessages.length} → ${trimmedMessages.length} mensagens`);
    console.log(`   Mensagens mantidas: ${trimmedMessages.map(m => m.role).join(', ')}\n`);

    // 7. Teste de limpeza
    console.log('7️⃣ Testando limpeza...');
    await prisma.conversation_message.deleteMany({
      where: { conversationId: conversation.id }
    });
    
    await prisma.conversations.delete({
      where: { id: conversation.id }
    });
    
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 Todos os testes passaram com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('   ✅ Criação de conversa');
    console.log('   ✅ Adição de mensagens');
    console.log('   ✅ Recuperação de histórico');
    console.log('   ✅ Estatísticas');
    console.log('   ✅ Múltiplos provedores');
    console.log('   ✅ Trimming simulado');
    console.log('   ✅ Limpeza de dados');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testChatSystem();
}

export { testChatSystem };
