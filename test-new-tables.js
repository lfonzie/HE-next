// Script de teste para verificar se as novas tabelas foram criadas
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNewTables() {
  try {
    console.log('🧪 Testando novas tabelas...')
    
    // Testar tabela daily_message_usage
    console.log('📊 Testando daily_message_usage...')
    const messageUsage = await prisma.daily_message_usage.findMany({
      take: 1
    })
    console.log('✅ daily_message_usage: OK')
    
    // Testar tabela message_usage_log
    console.log('📊 Testando message_usage_log...')
    const messageLogs = await prisma.message_usage_log.findMany({
      take: 1
    })
    console.log('✅ message_usage_log: OK')
    
    // Testar tabela certificates
    console.log('📊 Testando certificates...')
    const certificates = await prisma.certificates.findMany({
      take: 1
    })
    console.log('✅ certificates: OK')
    
    // Testar tabela lesson_completions
    console.log('📊 Testando lesson_completions...')
    const lessonCompletions = await prisma.lesson_completions.findMany({
      take: 1
    })
    console.log('✅ lesson_completions: OK')
    
    // Testar tabela school_subscriptions
    console.log('📊 Testando school_subscriptions...')
    const schoolSubscriptions = await prisma.school_subscriptions.findMany({
      take: 1
    })
    console.log('✅ school_subscriptions: OK')
    
    // Testar tabela School
    console.log('📊 Testando School...')
    const schools = await prisma.school.findMany({
      take: 1
    })
    console.log('✅ School: OK')
    
    console.log('🎉 Todas as tabelas foram criadas com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao testar tabelas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNewTables()
