import { prisma } from '@/lib/db'

/**
 * Script para inicializar configurações padrão de quotas
 */
async function initializeQuotaSettings() {
  try {
    console.log('🚀 Inicializando configurações de quotas...')

    // Configurações padrão por role - ATUALIZADAS para setembro 2025
    // Baseadas nos novos preços das APIs GPT-5 e Gemini 2.5
    const defaultSettings = [
      {
        role: 'STUDENT',
        monthly_token_limit: 100000,      // Aumentado devido aos preços mais altos
        daily_token_limit: 4000,
        hourly_token_limit: 400,
        cost_limit_usd: 10.0,             // Aumentado para cobrir custos mais altos
        cost_limit_brl: 52.0
      },
      {
        role: 'TEACHER',
        monthly_token_limit: 500000,       // Aumentado significativamente
        daily_token_limit: 20000,
        hourly_token_limit: 2000,
        cost_limit_usd: 50.0,             // Aumentado para cobrir custos mais altos
        cost_limit_brl: 260.0
      },
      {
        role: 'STAFF',
        monthly_token_limit: 200000,
        daily_token_limit: 8000,
        hourly_token_limit: 800,
        cost_limit_usd: 20.0,
        cost_limit_brl: 104.0
      },
      {
        role: 'ADMIN',
        monthly_token_limit: 1000000,      // Aumentado significativamente
        daily_token_limit: 50000,
        hourly_token_limit: 5000,
        cost_limit_usd: 100.0,            // Aumentado para cobrir custos mais altos
        cost_limit_brl: 520.0
      },
      {
        role: 'SUPER_ADMIN',
        monthly_token_limit: 2000000,     // Aumentado significativamente
        daily_token_limit: 100000,
        hourly_token_limit: 10000,
        cost_limit_usd: 200.0,            // Aumentado para cobrir custos mais altos
        cost_limit_brl: 1040.0
      }
    ]

    // Criar ou atualizar configurações
    for (const setting of defaultSettings) {
      await prisma.quota_settings.upsert({
        where: { role: setting.role as any },
        update: {
          monthly_token_limit: setting.monthly_token_limit,
          daily_token_limit: setting.daily_token_limit,
          hourly_token_limit: setting.hourly_token_limit,
          cost_limit_usd: setting.cost_limit_usd,
          cost_limit_brl: setting.cost_limit_brl,
          updated_at: new Date()
        },
        create: {
          role: setting.role as any,
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
          unique_user_month_quota: {
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
  }
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeQuotaSettings()
    .then(() => {
      console.log('✅ Script executado com sucesso')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error)
      process.exit(1)
    })
}

export { initializeQuotaSettings }
