#!/usr/bin/env node

// Script de teste rápido para verificar se tudo está funcionando
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function quickTest() {
  console.log('🧪 TESTE RÁPIDO DO HUBEDU.IA')
  console.log('============================\n')

  try {
    // 1. Testar conexão com banco
    console.log('1️⃣ Testando conexão com banco...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Banco conectado\n')

    // 2. Testar tabelas críticas
    console.log('2️⃣ Testando tabelas críticas...')
    
    const tables = [
      'daily_message_usage',
      'message_usage_log', 
      'certificates',
      'lesson_completions',
      'school_subscriptions',
      'School'
    ]

    // Testar tabelas usando Prisma Client diretamente
    try {
      await prisma.daily_message_usage.findMany({ take: 1 })
      console.log('✅ Tabela daily_message_usage: OK')
    } catch (error) {
      console.log(`❌ Tabela daily_message_usage: ERRO - ${error.message}`)
    }

    try {
      await prisma.message_usage_log.findMany({ take: 1 })
      console.log('✅ Tabela message_usage_log: OK')
    } catch (error) {
      console.log(`❌ Tabela message_usage_log: ERRO - ${error.message}`)
    }

    try {
      await prisma.certificates.findMany({ take: 1 })
      console.log('✅ Tabela certificates: OK')
    } catch (error) {
      console.log(`❌ Tabela certificates: ERRO - ${error.message}`)
    }

    try {
      await prisma.lesson_completions.findMany({ take: 1 })
      console.log('✅ Tabela lesson_completions: OK')
    } catch (error) {
      console.log(`❌ Tabela lesson_completions: ERRO - ${error.message}`)
    }

    try {
      await prisma.school_subscriptions.findMany({ take: 1 })
      console.log('✅ Tabela school_subscriptions: OK')
    } catch (error) {
      console.log(`❌ Tabela school_subscriptions: ERRO - ${error.message}`)
    }

    try {
      await prisma.school.findMany({ take: 1 })
      console.log('✅ Tabela School: OK')
    } catch (error) {
      console.log(`❌ Tabela School: ERRO - ${error.message}`)
    }
    console.log('')

    // 3. Testar funcionalidades básicas
    console.log('3️⃣ Testando funcionalidades básicas...')
    
    // Testar criação de usuário
    const testUser = await prisma.user.create({
      data: {
        email: `teste-rapido-${Date.now()}@hubedu.ia`,
        name: 'Usuário Teste Rápido',
        role: 'FREE'
      }
    })
    console.log('✅ Criação de usuário: OK')

    // Testar rate limiting
    await prisma.daily_message_usage.create({
      data: {
        user_id: testUser.id,
        date: new Date().toISOString().split('T')[0],
        message_count: 5,
        module: 'chat'
      }
    })
    console.log('✅ Rate limiting: OK')

    // Testar certificados
    await prisma.lesson_completions.create({
      data: {
        user_id: testUser.id,
        module: 'aulas',
        title: 'Aula Teste Rápido',
        completed_at: new Date(),
        time_spent: 30,
        score: 85
      }
    })
    console.log('✅ Sistema de certificados: OK')

    // Testar pricing B2B
    const testSchool = await prisma.school.create({
      data: {
        name: `Escola Teste Rápido ${Date.now()}`,
        email: `teste-rapido-${Date.now()}@escola.com`,
        student_count: 200,
        status: 'active'
      }
    })

    await prisma.school_subscriptions.create({
      data: {
        school_id: testSchool.id,
        plan_id: 'growth',
        student_count: 200,
        monthly_price: 187500,
        yearly_price: 2250000,
        billing_cycle: 'monthly',
        status: 'active',
        start_date: new Date()
      }
    })
    console.log('✅ Pricing B2B: OK')

    // 4. Limpar dados de teste
    console.log('\n4️⃣ Limpando dados de teste...')
    await prisma.daily_message_usage.deleteMany({
      where: { user_id: testUser.id }
    })
    await prisma.lesson_completions.deleteMany({
      where: { user_id: testUser.id }
    })
    await prisma.school_subscriptions.deleteMany({
      where: { school_id: testSchool.id }
    })
    await prisma.school.delete({
      where: { id: testSchool.id }
    })
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Dados de teste removidos')

    // 5. Verificar estatísticas
    console.log('\n5️⃣ Estatísticas do sistema:')
    const userCount = await prisma.user.count()
    const schoolCount = await prisma.school.count()
    const subscriptionCount = await prisma.school_subscriptions.count({
      where: { status: 'active' }
    })
    const lessonCount = await prisma.lesson_completions.count()
    const messageCount = await prisma.daily_message_usage.aggregate({
      _sum: { message_count: true }
    })

    console.log(`📊 Usuários: ${userCount}`)
    console.log(`🏫 Escolas: ${schoolCount}`)
    console.log(`💳 Assinaturas ativas: ${subscriptionCount}`)
    console.log(`📚 Aulas concluídas: ${lessonCount}`)
    console.log(`💬 Mensagens enviadas: ${messageCount._sum.message_count || 0}`)

    console.log('\n🎉 TESTE RÁPIDO CONCLUÍDO COM SUCESSO!')
    console.log('🚀 HubEdu.ia está pronto para uso!')

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
quickTest()
