// Script de teste para o sistema de pricing B2B
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testB2BPricingSystem() {
  try {
    console.log('🧪 Testando sistema de pricing B2B...')
    
    // Criar uma escola de teste
    console.log('🏫 Criando escola de teste...')
    const testSchool = await prisma.school.create({
      data: {
        name: 'Escola Teste Pricing',
        email: 'teste-pricing@escola.com',
        phone: '11999999999',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        cnpj: '12345678000199',
        student_count: 300,
        status: 'active'
      }
    })
    console.log('✅ Escola criada:', testSchool.id)
    
    // Testar criação de assinatura
    console.log('💳 Testando criação de assinatura...')
    const subscription = await prisma.school_subscriptions.create({
      data: {
        school_id: testSchool.id,
        plan_id: 'growth',
        student_count: 300,
        monthly_price: 187500, // R$ 1.875 em centavos
        yearly_price: 2250000, // R$ 22.500 em centavos
        billing_cycle: 'monthly',
        status: 'active',
        start_date: new Date(),
        auto_renew: true
      }
    })
    console.log('✅ Assinatura criada:', subscription.id)
    
    // Testar busca de assinatura
    console.log('🔍 Testando busca de assinatura...')
    const foundSubscription = await prisma.school_subscriptions.findFirst({
      where: {
        school_id: testSchool.id,
        status: 'active'
      }
    })
    
    if (foundSubscription) {
      console.log('✅ Assinatura encontrada:', foundSubscription.plan_id)
      console.log(`  - Plano: ${foundSubscription.plan_id}`)
      console.log(`  - Alunos: ${foundSubscription.student_count}`)
      console.log(`  - Preço mensal: R$ ${foundSubscription.monthly_price / 100}`)
      console.log(`  - Ciclo: ${foundSubscription.billing_cycle}`)
    }
    
    // Testar estatísticas
    console.log('📊 Testando estatísticas...')
    const stats = await prisma.school_subscriptions.aggregate({
      where: { status: 'active' },
      _count: { id: true },
      _sum: { student_count: true }
    })
    
    console.log('✅ Estatísticas calculadas:')
    console.log(`  - Total de assinaturas: ${stats._count.id}`)
    console.log(`  - Total de alunos: ${stats._sum.student_count}`)
    
    // Testar cancelamento
    console.log('❌ Testando cancelamento...')
    await prisma.school_subscriptions.update({
      where: { id: subscription.id },
      data: {
        status: 'inactive',
        end_date: new Date(),
        auto_renew: false
      }
    })
    console.log('✅ Assinatura cancelada')
    
    // Limpar dados de teste
    console.log('🧹 Limpando dados de teste...')
    await prisma.school_subscriptions.deleteMany({
      where: { school_id: testSchool.id }
    })
    await prisma.school.delete({
      where: { id: testSchool.id }
    })
    console.log('✅ Dados de teste removidos')
    
    console.log('🎉 Sistema de pricing B2B testado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao testar sistema de pricing B2B:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testB2BPricingSystem()
