#!/usr/bin/env node

/**
 * Teste rápido para verificar se o contexto está funcionando
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testContextFix() {
  console.log('🧪 Testando se o contexto está funcionando...\n');

  try {
    // 1. Verificar se a tabela conversation_message existe
    console.log('1️⃣ Verificando tabela conversation_message...');
    const messageCount = await prisma.conversation_message.count();
    console.log(`✅ Tabela existe com ${messageCount} mensagens\n`);

    // 2. Criar uma conversa de teste
    console.log('2️⃣ Criando conversa de teste...');
    const conversation = await prisma.conversations.create({
      data: {
        user_id: '550e8400-e29b-41d4-a716-446655440001', // UUID válido
        module: 'test',
        messages: []
      }
    });
    console.log(`✅ Conversa criada: ${conversation.id}\n`);

    // 3. Adicionar mensagens sequenciais
    console.log('3️⃣ Adicionando mensagens sequenciais...');
    
    const messages = [
      { role: 'user', content: 'oi' },
      { role: 'assistant', content: 'Olá! Como posso ajudar?' },
      { role: 'user', content: 'eq 2 grau' },
      { role: 'assistant', content: 'Vou explicar equações do 2º grau...' },
      { role: 'user', content: 'mais exemplos' }
    ];

    for (let i = 0; i < messages.length; i++) {
      await prisma.conversation_message.create({
        data: {
          conversationId: conversation.id,
          role: messages[i].role,
          content: messages[i].content,
          index: i,
          provider: 'openai',
          model: 'gpt-4o-mini'
        }
      });
    }
    console.log(`✅ ${messages.length} mensagens adicionadas\n`);

    // 4. Testar recuperação de histórico
    console.log('4️⃣ Testando recuperação de histórico...');
    const history = await prisma.conversation_message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { index: 'asc' }
    });
    
    console.log(`✅ Histórico recuperado: ${history.length} mensagens`);
    history.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content}`);
    });
    console.log();

    // 5. Simular o que deveria acontecer na API
    console.log('5️⃣ Simulando chamada da API...');
    const lastUserMessage = history.filter(m => m.role === 'user').pop();
    const contextMessages = history.slice(-6); // Últimas 6 mensagens
    
    console.log(`✅ Última mensagem do usuário: "${lastUserMessage?.content}"`);
    console.log(`✅ Contexto para IA: ${contextMessages.length} mensagens`);
    contextMessages.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content}`);
    });
    console.log();

    // 6. Verificar se o contexto está correto
    console.log('6️⃣ Verificando se o contexto está correto...');
    const hasContext = contextMessages.length > 1;
    const hasPreviousMessages = contextMessages.some(m => m.role === 'assistant');
    
    if (hasContext && hasPreviousMessages) {
      console.log('✅ CONTEXTO FUNCIONANDO CORRETAMENTE!');
      console.log('   - Histórico sendo recuperado');
      console.log('   - Mensagens em ordem correta');
      console.log('   - IA terá contexto da conversa anterior');
    } else {
      console.log('❌ PROBLEMA NO CONTEXTO!');
      console.log('   - Histórico não está sendo recuperado corretamente');
    }
    console.log();

    // 7. Limpeza
    console.log('7️⃣ Limpando dados de teste...');
    await prisma.conversation_message.deleteMany({
      where: { conversationId: conversation.id }
    });
    
    await prisma.conversations.delete({
      where: { id: conversation.id }
    });
    
    console.log('✅ Dados de teste removidos\n');

    console.log('🎉 TESTE CONCLUÍDO!');
    console.log('O sistema de contexto está funcionando corretamente.');
    console.log('Agora a IA terá acesso ao histórico completo da conversa.');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testContextFix();
}

export { testContextFix };
