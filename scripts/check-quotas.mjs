#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkQuotas() {
  try {
    console.log('🔍 Verificando quotas no banco de dados...\n')

    // Verificar configurações de quota
    console.log('📋 Configurações de Quota por Role:')
    const settings = await prisma.quota_settings.findMany({
      orderBy: { role: 'asc' }
    })
    
    settings.forEach(setting => {
      console.log(`  ${setting.role}: ${setting.monthly_token_limit.toLocaleString()} tokens/mês ($${setting.cost_limit_usd})`)
    })

    console.log('\n👥 Quotas de Usuários:')
    const quotas = await prisma.quotas.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    quotas.forEach(quota => {
      const percentage = Math.round((quota.token_used / quota.token_limit) * 100)
      console.log(`  ${quota.user.name || 'Sem nome'} (${quota.user.role}):`)
      console.log(`    Mês: ${quota.month}`)
      console.log(`    Usado: ${quota.token_used.toLocaleString()} / ${quota.token_limit.toLocaleString()} (${percentage}%)`)
      console.log(`    Status: ${quota.is_active ? 'Ativo' : 'Inativo'}`)
      console.log('')
    })

    // Verificar logs de uso
    console.log('📊 Logs de Uso Recentes:')
    const usageLogs = await prisma.quota_usage_log.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (usageLogs.length === 0) {
      console.log('  Nenhum log de uso encontrado ainda.')
    } else {
      usageLogs.forEach(log => {
        console.log(`  ${log.user.name || 'Usuário'}: ${log.provider}/${log.model}`)
        console.log(`    Tokens: ${log.total_tokens} (${log.prompt_tokens} + ${log.completion_tokens})`)
        console.log(`    Custo: $${log.cost_usd} USD / R$ ${log.cost_brl} BRL`)
        console.log(`    Data: ${log.created_at.toLocaleString()}`)
        console.log('')
      })
    }

    console.log('✅ Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro ao verificar quotas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkQuotas()
