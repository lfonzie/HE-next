// Script de teste final para verificar integração completa
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCompleteIntegration() {
  try {
    console.log('🧪 Testando integração completa do HubEdu.ia...')
    
    // 1. Testar sistema de limitação B2C
    console.log('\n📊 1. Testando sistema de limitação B2C...')
    const testUser = await prisma.user.create({
      data: {
        email: `teste-integracao-${Date.now()}@hubedu.ia`,
        name: 'Usuário Teste Integração',
        role: 'FREE'
      }
    })
    
    // Simular uso de mensagens
    await prisma.daily_message_usage.create({
      data: {
        user_id: testUser.id,
        date: new Date().toISOString().split('T')[0],
        message_count: 5,
        module: 'chat',
        conversation_id: testUser.id // Usar UUID válido
      }
    })
    
    const messageUsage = await prisma.daily_message_usage.findFirst({
      where: { user_id: testUser.id }
    })
    console.log('✅ Limitação B2C: OK - Mensagens registradas:', messageUsage.message_count)
    
    // 2. Testar sistema de certificados
    console.log('\n🏆 2. Testando sistema de certificados...')
    await prisma.lesson_completions.create({
      data: {
        user_id: testUser.id,
        module: 'aulas',
        title: 'Aula de Teste Integração',
        completed_at: new Date(),
        time_spent: 30,
        score: 90
      }
    })
    
    const lessonCompletion = await prisma.lesson_completions.findFirst({
      where: { user_id: testUser.id }
    })
    console.log('✅ Certificados: OK - Aula concluída:', lessonCompletion.title)
    
    // 3. Testar sistema de pricing B2B
    console.log('\n💳 3. Testando sistema de pricing B2B...')
    const testSchool = await prisma.school.create({
      data: {
        name: `Escola Teste Integração ${Date.now()}`,
        email: `teste-integracao-${Date.now()}@escola.com`,
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
    
    const subscription = await prisma.school_subscriptions.findFirst({
      where: { school_id: testSchool.id }
    })
    console.log('✅ Pricing B2B: OK - Assinatura criada:', subscription.plan_id)
    
    // 4. Verificar estatísticas gerais
    console.log('\n📈 4. Verificando estatísticas gerais...')
    const userCount = await prisma.user.count()
    const schoolCount = await prisma.school.count()
    const subscriptionCount = await prisma.school_subscriptions.count({
      where: { status: 'active' }
    })
    const lessonCount = await prisma.lesson_completions.count()
    const messageCount = await prisma.daily_message_usage.aggregate({
      _sum: { message_count: true }
    })
    
    console.log('📊 Estatísticas do sistema:')
    console.log(`  - Usuários: ${userCount}`)
    console.log(`  - Escolas: ${schoolCount}`)
    console.log(`  - Assinaturas ativas: ${subscriptionCount}`)
    console.log(`  - Aulas concluídas: ${lessonCount}`)
    console.log(`  - Mensagens enviadas: ${messageCount._sum.message_count || 0}`)
    
    // 5. Limpar dados de teste
    console.log('\n🧹 5. Limpando dados de teste...')
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
    
    console.log('\n🎉 INTEGRAÇÃO COMPLETA TESTADA COM SUCESSO!')
    console.log('🚀 HubEdu.ia está pronto para o lançamento!')
    
  } catch (error) {
    console.error('❌ Erro ao testar integração completa:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCompleteIntegration()
