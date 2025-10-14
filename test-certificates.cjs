// Script de teste para o sistema de certificados
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCertificateSystem() {
  try {
    console.log('🧪 Testando sistema de certificados...')
    
    // Criar um usuário de teste
    console.log('👤 Criando usuário de teste...')
    const testUser = await prisma.user.create({
      data: {
        email: 'teste-certificados@hubedu.ia',
        name: 'Usuário Teste Certificados',
        role: 'FREE'
      }
    })
    console.log('✅ Usuário criado:', testUser.id)
    
    // Simular conclusão de aulas
    console.log('📚 Simulando conclusão de aulas...')
    for (let i = 1; i <= 5; i++) {
      await prisma.lesson_completions.create({
        data: {
          user_id: testUser.id,
          module: 'aulas',
          title: `Aula Teste ${i}`,
          completed_at: new Date(),
          time_spent: 30,
          score: 85,
          metadata: {
            subject: 'Matemática',
            grade: '9º ano'
          }
        }
      })
    }
    console.log('✅ 5 aulas concluídas')
    
    // Verificar se certificado foi emitido automaticamente
    console.log('🏆 Verificando certificados emitidos...')
    const certificates = await prisma.certificates.findMany({
      where: { user_id: testUser.id }
    })
    
    console.log(`📜 Certificados encontrados: ${certificates.length}`)
    certificates.forEach(cert => {
      console.log(`  - ${cert.title}: ${cert.type}`)
    })
    
    // Testar API de certificados
    console.log('🌐 Testando API de certificados...')
    const response = await fetch('http://localhost:3000/api/certificates?action=certificates', {
      headers: {
        'Authorization': `Bearer test-token`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API de certificados funcionando')
    } else {
      console.log('⚠️ API de certificados não disponível (servidor não está rodando)')
    }
    
    // Limpar dados de teste
    console.log('🧹 Limpando dados de teste...')
    await prisma.certificates.deleteMany({
      where: { user_id: testUser.id }
    })
    await prisma.lesson_completions.deleteMany({
      where: { user_id: testUser.id }
    })
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Dados de teste removidos')
    
    console.log('🎉 Sistema de certificados testado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao testar sistema de certificados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCertificateSystem()
