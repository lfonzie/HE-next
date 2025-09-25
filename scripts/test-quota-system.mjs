#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function testQuotaSystem() {
  try {
    console.log('🧪 Testando sistema de quotas...\n')

    // Buscar um usuário para teste
    const user = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    })

    if (!user) {
      console.log('❌ Nenhum usuário encontrado para teste')
      return
    }

    console.log(`👤 Testando com usuário: ${user.name || user.email} (${user.role})`)

    // Teste 1: Verificar quota atual
    console.log('\n📊 1. Verificando quota atual...')
    const currentMonth = getCurrentMonth()
    const quota = await prisma.quotas.findUnique({
      where: {
        user_id_month: {
          user_id: user.id,
          month: currentMonth
        }
      }
    })
    
    if (quota) {
      const percentage = Math.round((quota.token_used / quota.token_limit) * 100)
      console.log(`   Limite: ${quota.token_limit.toLocaleString()} tokens`)
      console.log(`   Usado: ${quota.token_used.toLocaleString()} tokens`)
      console.log(`   Restante: ${quota.token_limit - quota.token_used} tokens`)
      console.log(`   Percentual: ${percentage}%`)
    }

    // Teste 2: Simular uso de tokens
    console.log('\n🔄 2. Simulando uso de tokens...')
    const testUsage = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      costUsd: 0.00045,
      costBrl: 0.0023,
      module: 'test',
      apiEndpoint: '/api/test',
      success: true
    }

    // Registrar uso diretamente no banco
    await prisma.quota_usage_log.create({
      data: {
        quota_id: quota.id,
        user_id: user.id,
        provider: testUsage.provider,
        model: testUsage.model,
        prompt_tokens: testUsage.promptTokens,
        completion_tokens: testUsage.completionTokens,
        total_tokens: testUsage.totalTokens,
        cost_usd: testUsage.costUsd,
        cost_brl: testUsage.costBrl,
        module: testUsage.module,
        api_endpoint: testUsage.apiEndpoint,
        success: testUsage.success
      }
    })

    // Atualizar contador de tokens usados
    await prisma.quotas.update({
      where: { id: quota.id },
      data: {
        token_used: quota.token_used + testUsage.totalTokens,
        updated_at: new Date()
      }
    })

    console.log(`   ✅ Registrado uso: ${testUsage.totalTokens} tokens ($${testUsage.costUsd})`)

    // Teste 3: Verificar quota após uso
    console.log('\n📊 3. Verificando quota após uso...')
    const updatedQuota = await prisma.quotas.findUnique({
      where: {
        user_id_month: {
          user_id: user.id,
          month: currentMonth
        }
      }
    })
    
    if (updatedQuota) {
      const percentage = Math.round((updatedQuota.token_used / updatedQuota.token_limit) * 100)
      console.log(`   Limite: ${updatedQuota.token_limit.toLocaleString()} tokens`)
      console.log(`   Usado: ${updatedQuota.token_used.toLocaleString()} tokens`)
      console.log(`   Restante: ${updatedQuota.token_limit - updatedQuota.token_used} tokens`)
      console.log(`   Percentual: ${percentage}%`)
    }

    // Teste 4: Verificar logs de uso
    console.log('\n📋 4. Verificando logs de uso...')
    const usageLogs = await prisma.quota_usage_log.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 3
    })

    usageLogs.forEach((log, index) => {
      console.log(`   Log ${index + 1}:`)
      console.log(`     Provider: ${log.provider}/${log.model}`)
      console.log(`     Tokens: ${log.total_tokens} (${log.prompt_tokens} + ${log.completion_tokens})`)
      console.log(`     Custo: $${log.cost_usd} USD / R$ ${log.cost_brl} BRL`)
      console.log(`     Data: ${log.created_at.toLocaleString()}`)
    })

    // Teste 5: Verificar se quota excedida funciona
    console.log('\n⚠️  5. Testando verificação de quota excedida...')
    const largeUsage = {
      provider: 'openai',
      model: 'gpt-5',
      promptTokens: 1000000, // 1M tokens
      completionTokens: 500000, // 500K tokens
      totalTokens: 1500000, // 1.5M tokens
      costUsd: 7.875, // Custo alto
      costBrl: 40.95,
      module: 'test',
      apiEndpoint: '/api/test',
      success: true
    }

    const remainingTokens = updatedQuota.token_limit - updatedQuota.token_used
    const allowed = remainingTokens >= largeUsage.totalTokens
    
    console.log(`   Quota permitida: ${allowed}`)
    console.log(`   Tokens necessários: ${largeUsage.totalTokens.toLocaleString()}`)
    console.log(`   Tokens restantes: ${remainingTokens.toLocaleString()}`)
    console.log(`   Mensagem: ${allowed ? 'Permitido' : 'Quota excedida'}`)

    console.log('\n✅ Teste do sistema de quotas concluído!')

  } catch (error) {
    console.error('❌ Erro ao testar sistema de quotas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testQuotaSystem()
