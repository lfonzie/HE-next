import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
  isSessionGenerated?: boolean
  createdAt?: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para limpar resposta da IA removendo markdown code blocks
// Função removida - não é mais necessária

export async function GET(request: NextRequest) {
  try {
    console.log('API /api/redacao/temas chamada - carregando temas oficiais e salvos')
    
    // Temas oficiais do ENEM
    const officialThemes: EnemTheme[] = [
      {
        id: '2024-1',
        year: 2024,
        theme: 'Inclusão digital como direito de todos',
        description: 'Tema da redação ENEM 2024 - 1º dia',
        isOfficial: true
      },
      {
        id: '2023-1',
        year: 2023,
        theme: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
        description: 'Tema da redação ENEM 2023 - 1º dia',
        isOfficial: true
      },
      {
        id: '2022-1',
        year: 2022,
        theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
        description: 'Tema da redação ENEM 2022 - 1º dia',
        isOfficial: true
      },
      {
        id: '2021-1',
        year: 2021,
        theme: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
        description: 'Tema da redação ENEM 2021 - 1º dia',
        isOfficial: true
      },
      {
        id: '2020-1',
        year: 2020,
        theme: 'O estigma associado às doenças mentais na sociedade brasileira',
        description: 'Tema da redação ENEM 2020 - 1º dia',
        isOfficial: true
      },
      {
        id: '2019-1',
        year: 2019,
        theme: 'Democratização do acesso ao cinema no Brasil',
        description: 'Tema da redação ENEM 2019 - 1º dia',
        isOfficial: true
      },
      {
        id: '2018-1',
        year: 2018,
        theme: 'Manipulação do comportamento do usuário pelo controle de dados na internet',
        description: 'Tema da redação ENEM 2018 - 1º dia',
        isOfficial: true
      },
      {
        id: '2017-1',
        year: 2017,
        theme: 'Desafios para a formação educacional de surdos no Brasil',
        description: 'Tema da redação ENEM 2017 - 1º dia',
        isOfficial: true
      },
      {
        id: '2016-1',
        year: 2016,
        theme: 'Caminhos para combater a intolerância religiosa no Brasil',
        description: 'Tema da redação ENEM 2016 - 1º dia',
        isOfficial: true
      },
      {
        id: '2015-1',
        year: 2015,
        theme: 'A persistência da violência contra a mulher na sociedade brasileira',
        description: 'Tema da redação ENEM 2015 - 1º dia',
        isOfficial: true
      }
    ]

    let allThemes = [...officialThemes]

    // Buscar temas salvos no banco de dados
    try {
      const savedThemes = await prisma.conversations.findMany({
        where: {
          user_id: '00000000-0000-0000-0000-000000000000',
          module: 'redacao',
          subject: {
            startsWith: 'Tema:'
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 20 // Limitar a 20 temas mais recentes de IA
      })

      // Converter para formato EnemTheme
      const aiThemes = savedThemes.map(conversation => {
        try {
          const messages = JSON.parse(conversation.messages)
          const themeData = JSON.parse(messages[0]?.content || '{}')
          
          return {
            id: themeData.themeId || conversation.id,
            year: themeData.year || 2025,
            theme: themeData.theme || conversation.subject?.replace('Tema: ', '') || 'Tema gerado por IA',
            description: themeData.description || 'Tema gerado por IA',
            isAIGenerated: themeData.isAIGenerated || true,
            createdAt: themeData.createdAt || conversation.created_at.toISOString()
          }
        } catch (error) {
          console.warn('Erro ao processar tema salvo:', error)
          return null
        }
      }).filter(Boolean)

      // Adicionar temas de IA à lista (primeiro os de IA, depois os oficiais)
      allThemes = [...aiThemes, ...allThemes]
    } catch (error) {
      console.warn('Erro ao buscar temas salvos:', error)
    }

    // Separar temas oficiais dos temas de IA
    const officialThemesFromDB = allThemes.filter(theme => theme.isOfficial)
    const aiThemes = allThemes.filter(theme => theme.isAIGenerated)
    
    // Ordenar temas oficiais por ano (mais recentes primeiro)
    const sortedOfficialThemes = officialThemesFromDB.sort((a, b) => b.year - a.year)
    
    // Ordenar temas de IA por data de criação (mais recentes primeiro)
    const sortedAIThemes = aiThemes.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      success: true,
      officialThemes: sortedOfficialThemes,
      aiThemes: sortedAIThemes,
      message: `${sortedOfficialThemes.length} temas oficiais + ${sortedAIThemes.length} temas de IA carregados`,
      totalAvailable: allThemes.length,
      officialCount: sortedOfficialThemes.length,
      aiCount: sortedAIThemes.length
    })
    
    // Código antigo comentado - temas oficiais do ENEM não são mais necessários
    /*
    const officialThemes: EnemTheme[] = [
      {
        id: '2024-1',
        year: 2024,
        theme: 'Inclusão digital como direito de todos',
        description: 'Tema da redação ENEM 2024 - 1º dia',
        isOfficial: true
      },
      {
        id: '2023-1',
        year: 2023,
        theme: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
        description: 'Tema da redação ENEM 2023 - 1º dia',
        isOfficial: true
      },
      {
        id: '2022-1',
        year: 2022,
        theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
        description: 'Tema da redação ENEM 2022 - 1º dia',
        isOfficial: true
      },
      {
        id: '2021-1',
        year: 2021,
        theme: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
        description: 'Tema da redação ENEM 2021 - 1º dia',
        isOfficial: true
      },
      {
        id: '2020-1',
        year: 2020,
        theme: 'O estigma associado às doenças mentais na sociedade brasileira',
        description: 'Tema da redação ENEM 2020 - 1º dia',
        isOfficial: true
      },
      {
        id: '2019-1',
        year: 2019,
        theme: 'Democratização do acesso ao cinema no Brasil',
        description: 'Tema da redação ENEM 2019 - 1º dia',
        isOfficial: true
      },
      {
        id: '2018-1',
        year: 2018,
        theme: 'Manipulação do comportamento do usuário pelo controle de dados na internet',
        description: 'Tema da redação ENEM 2018 - 1º dia',
        isOfficial: true
      },
      {
        id: '2017-1',
        year: 2017,
        theme: 'Desafios para a formação educacional de surdos no Brasil',
        description: 'Tema da redação ENEM 2017 - 1º dia',
        isOfficial: true
      },
      {
        id: '2016-1',
        year: 2016,
        theme: 'Caminhos para combater a intolerância religiosa no Brasil',
        description: 'Tema da redação ENEM 2016 - 1º dia',
        isOfficial: true
      },
      {
        id: '2015-1',
        year: 2015,
        theme: 'A persistência da violência contra a mulher na sociedade brasileira',
        description: 'Tema da redação ENEM 2015 - 1º dia',
        isOfficial: true
      },
      {
        id: '2014-1',
        year: 2014,
        theme: 'Publicidade infantil em questão no Brasil',
        description: 'Tema da redação ENEM 2014 - 1º dia',
        isOfficial: true
      },
      {
        id: '2013-1',
        year: 2013,
        theme: 'Efeitos da implantação da Lei Áurea no Brasil',
        description: 'Tema da redação ENEM 2013 - 1º dia',
        isOfficial: true
      },
      {
        id: '2012-1',
        year: 2012,
        theme: 'Movimentos imigratórios para o Brasil no século XXI',
        description: 'Tema da redação ENEM 2012 - 1º dia',
        isOfficial: true
      },
      {
        id: '2011-1',
        year: 2011,
        theme: 'Viver em rede no século XXI: os limites entre o público e o privado',
        description: 'Tema da redação ENEM 2011 - 1º dia',
        isOfficial: true
      },
      {
        id: '2010-1',
        year: 2010,
        theme: 'O trabalho na construção da dignidade humana',
        description: 'Tema da redação ENEM 2010 - 1º dia',
        isOfficial: true
      },
      {
        id: '2009-1',
        year: 2009,
        theme: 'O indivíduo frente à ética nacional',
        description: 'Tema da redação ENEM 2009 - 1º dia',
        isOfficial: true
      },
      {
        id: '2008-1',
        year: 2008,
        theme: 'A preservação da cultura negra no Brasil',
        description: 'Tema da redação ENEM 2008 - 1º dia',
        isOfficial: true
      },
      {
        id: '2007-1',
        year: 2007,
        theme: 'O desafio de conviver com pessoas portadoras de necessidades especiais',
        description: 'Tema da redação ENEM 2007 - 1º dia',
        isOfficial: true
      },
      {
        id: '2006-1',
        year: 2006,
        theme: 'O poder da leitura',
        description: 'Tema da redação ENEM 2006 - 1º dia',
        isOfficial: true
      },
      {
        id: '2005-1',
        year: 2005,
        theme: 'A persistência da violência contra a mulher na sociedade brasileira',
        description: 'Tema da redação ENEM 2005 - 1º dia',
        isOfficial: true
      },
      {
        id: '2004-1',
        year: 2004,
        theme: 'A reforma agrária no Brasil',
        description: 'Tema da redação ENEM 2004 - 1º dia',
        isOfficial: true
      },
      {
        id: '2003-1',
        year: 2003,
        theme: 'Como preservar a floresta amazônica',
        description: 'Tema da redação ENEM 2003 - 1º dia',
        isOfficial: true
      },
      {
        id: '2002-1',
        year: 2002,
        theme: 'O direito de votar tem algum valor?',
        description: 'Tema da redação ENEM 2002 - 1º dia',
        isOfficial: true
      },
      {
        id: '2001-1',
        year: 2001,
        theme: 'As relações entre escola e trabalho; desafios e perspectivas',
        description: 'Tema da redação ENEM 2001 - 1º dia',
        isOfficial: true
      },
      {
        id: '2000-1',
        year: 2000,
        theme: 'Por que o conhecimento?',
        description: 'Tema da redação ENEM 2000 - 1º dia',
        isOfficial: true
      },
      {
        id: '1999-1',
        year: 1999,
        theme: 'A água: como preservar esse recurso tão essencial?',
        description: 'Tema da redação ENEM 1999 - 1º dia',
        isOfficial: true
      },
      {
        id: '1998-1',
        year: 1998,
        theme: 'O que é ser um adolescente no final do século?',
        description: 'Tema da redação ENEM 1998 - 1º dia',
        isOfficial: true
      }
    ]

    let allThemes = [...officialThemes]

    // Buscar temas salvos no banco de dados
    try {
      const savedThemes = await prisma.conversations.findMany({
        where: {
          user_id: '00000000-0000-0000-0000-000000000000',
          module: 'redacao',
          subject: {
            startsWith: 'Tema:'
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 50 // Limitar a 50 temas mais recentes
      })

      // Converter para formato EnemTheme
      const aiThemes = savedThemes.map(conversation => {
        try {
          const messages = JSON.parse(conversation.messages)
          const themeData = JSON.parse(messages[0]?.content || '{}')
          
          return {
            id: themeData.themeId || conversation.id,
            year: themeData.year || 2025,
            theme: themeData.theme || conversation.subject?.replace('Tema: ', '') || 'Tema gerado por IA',
            description: themeData.description || 'Tema gerado por IA',
            isAIGenerated: themeData.isAIGenerated || true,
            createdAt: themeData.createdAt || conversation.created_at.toISOString()
          }
        } catch (error) {
          console.warn('Erro ao processar tema salvo:', error)
          return null
        }
      }).filter(Boolean)

      // Adicionar temas de IA à lista
      allThemes = [...aiThemes, ...allThemes]
    } catch (error) {
      console.warn('Erro ao buscar temas salvos:', error)
    }

    return NextResponse.json({
      success: true,
      themes: allThemes.sort((a, b) => {
        if (a.isAIGenerated && !b.isAIGenerated) return -1
        if (!a.isAIGenerated && b.isAIGenerated) return 1
        return b.year - a.year
      })
    })

    */
  } catch (error) {
    console.error('Erro ao carregar temas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função removida - temas de IA são gerados apenas via /api/redacao/temas/ai
