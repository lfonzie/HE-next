#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script para inicializar configurações padrão de quotas
 */
async function initializeQuotaSettings() {
  try {
    console.log('🚀 Inicializando configurações de quotas...')

    // Configurações padrão por role - LIMITES ATUALIZADOS (setembro 2025)
    // Baseadas nos novos limites solicitados com distribuição otimizada de uso
    const defaultSettings = [
      {
        role: 'STUDENT',
        monthly_token_limit: 500000,       // Aumentado para 500K
        daily_token_limit: 20000,          // Ajustado proporcionalmente
        hourly_token_limit: 2000,          // Ajustado proporcionalmente
        cost_limit_usd: 0.28,             // Custo real mensal calculado
        cost_limit_brl: 1.48
      },
      {
        role: 'TEACHER',
        monthly_token_limit: 1000000,      // Aumentado para 1M
        daily_token_limit: 40000,          // Ajustado proporcionalmente
        hourly_token_limit: 4000,          // Ajustado proporcionalmente
        cost_limit_usd: 0.57,             // Custo real mensal calculado
        cost_limit_brl: 2.96
      },
      {
        role: 'STAFF',
        monthly_token_limit: 1000000,      // Aumentado para 1M
        daily_token_limit: 40000,          // Ajustado proporcionalmente
        hourly_token_limit: 4000,          // Ajustado proporcionalmente
        cost_limit_usd: 0.57,             // Custo real mensal calculado
        cost_limit_brl: 2.96
      },
      {
        role: 'ADMIN',
        monthly_token_limit: 2000000,     // Aumentado para 2M
        daily_token_limit: 80000,          // Ajustado proporcionalmente
        hourly_token_limit: 8000,          // Ajustado proporcionalmente
        cost_limit_usd: 1.14,             // Custo real mensal calculado
        cost_limit_brl: 5.92
      },
      {
        role: 'SUPER_ADMIN',
        monthly_token_limit: 5000000,     // Aumentado para 5M
        daily_token_limit: 200000,         // Ajustado proporcionalmente
        hourly_token_limit: 20000,         // Ajustado proporcionalmente
        cost_limit_usd: 2.85,             // Custo real mensal calculado
        cost_limit_brl: 14.80
      }
    ]

    // Criar ou atualizar configurações
    for (const setting of defaultSettings) {
      await prisma.quota_settings.upsert({
        where: { role: setting.role },
        update: {
          monthly_token_limit: setting.monthly_token_limit,
          daily_token_limit: setting.daily_token_limit,
          hourly_token_limit: setting.hourly_token_limit,
          cost_limit_usd: setting.cost_limit_usd,
          cost_limit_brl: setting.cost_limit_brl,
          updated_at: new Date()
        },
        create: {
          role: setting.role,
          monthly_token_limit: setting.monthly_token_limit,
          daily_token_limit: setting.daily_token_limit,
          hourly_token_limit: setting.hourly_token_limit,
          cost_limit_usd: setting.cost_limit_usd,
          cost_limit_brl: setting.cost_limit_brl,
          is_active: true
        }
      })

      console.log(`✅ Configuração criada/atualizada para role: ${setting.role}`)
    }

    // Criar quotas mensais para usuários existentes
    const currentMonth = getCurrentMonth()
    const users = await prisma.user.findMany({
      select: { id: true, role: true }
    })

    console.log(`📊 Criando quotas para ${users.length} usuários...`)

    for (const user of users) {
      const settings = defaultSettings.find(s => s.role === user.role)
      const tokenLimit = settings?.monthly_token_limit || 50000

      await prisma.quotas.upsert({
        where: {
          user_id_month: {
            user_id: user.id,
            month: currentMonth
          }
        },
        update: {
          token_limit: tokenLimit,
          updated_at: new Date()
        },
        create: {
          user_id: user.id,
          month: currentMonth,
          token_limit: tokenLimit,
          token_used: 0,
          is_active: true
        }
      })
    }

    console.log(`✅ Quotas criadas para ${users.length} usuários no mês ${currentMonth}`)
    console.log('🎉 Inicialização de quotas concluída!')

  } catch (error) {
    console.error('❌ Erro ao inicializar configurações de quotas:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Executar
initializeQuotaSettings()
  .then(() => {
    console.log('✅ Script executado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error)
    process.exit(1)
  })
