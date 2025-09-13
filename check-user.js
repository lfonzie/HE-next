const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    console.log('🔍 Verificando usuário Fonseca no banco Neon...')
    
    const user = await prisma.user.findUnique({
      where: { email: 'fonseca@colegioose.com.br' }
    })
    
    if (user) {
      console.log('✅ Usuário encontrado!')
      console.log('📧 Email:', user.email)
      console.log('👤 Nome:', user.name)
      console.log('🔑 Role:', user.role)
      console.log('🆔 ID:', user.id)
      console.log('📅 Criado em:', user.created_at)
    } else {
      console.log('❌ Usuário não encontrado')
    }
    
    // Listar todos os usuários
    console.log('\n📋 Todos os usuários no banco:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true
      }
    })
    
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.name} (${u.email}) - ${u.role}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
