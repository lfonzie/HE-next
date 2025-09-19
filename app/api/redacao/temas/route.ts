import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
  isOfficial?: boolean
  isAIGenerated?: boolean
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para limpar resposta da IA removendo markdown code blocks
function cleanAIResponse(response: string): string {
  // Remove markdown code blocks se existirem
  const cleaned = response
    .replace(/^```json\s*/i, '')  // Remove início do bloco
    .replace(/\s*```$/i, '')       // Remove fim do bloco
    .trim()
  
  return cleaned
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAI = searchParams.get('includeAI') === 'true'
    
    // Temas oficiais do ENEM - Lista completa desde 1998
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

    // Gerar temas com IA se solicitado
    if (includeAI && process.env.OPENAI_API_KEY) {
      try {
        const aiThemes = await generateAIThemes()
        allThemes = [...aiThemes, ...officialThemes]
      } catch (error) {
        console.error('Erro ao gerar temas com IA:', error)
        // Continuar apenas com temas oficiais se IA falhar
      }
    }

    return NextResponse.json({
      success: true,
      themes: allThemes.sort((a, b) => {
        if (a.isAIGenerated && !b.isAIGenerated) return -1
        if (!a.isAIGenerated && b.isAIGenerated) return 1
        return b.year - a.year
      })
    })

  } catch (error) {
    console.error('Erro ao carregar temas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateAIThemes(): Promise<EnemTheme[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em temas de redação do ENEM. Gere 5 temas de redação inéditos e relevantes para o Brasil contemporâneo, seguindo o padrão dos temas oficiais do ENEM.

Cada tema deve:
- Ser relevante para a sociedade brasileira atual
- Permitir argumentação e proposta de intervenção
- Seguir o formato: "Desafios para [tópico] no Brasil" ou similar
- Ser adequado para estudantes do ensino médio
- Não repetir temas já utilizados oficialmente

Responda apenas com um JSON array contendo objetos com as propriedades: id, year, theme, description, isAIGenerated.`
        },
        {
          role: "user",
          content: "Gere 5 temas de redação para o ENEM seguindo os critérios mencionados."
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia da IA')
    }

    const cleanedResponse = cleanAIResponse(response)
    const aiThemes = JSON.parse(cleanedResponse)
    
    // Validar e formatar os temas gerados
    return aiThemes.map((theme: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      year: 2025,
      theme: theme.theme || theme.title || 'Tema gerado por IA',
      description: theme.description || 'Tema gerado por IA para prática',
      isAIGenerated: true
    }))

  } catch (error) {
    console.error('Erro ao gerar temas com IA:', error)
    // Retornar temas de fallback se IA falhar
    return [
      {
        id: `ai-fallback-${Date.now()}`,
        year: 2025,
        theme: 'Desafios para a sustentabilidade ambiental nas cidades brasileiras',
        description: 'Tema gerado por IA para prática',
        isAIGenerated: true
      },
      {
        id: `ai-fallback-${Date.now()}-2`,
        year: 2025,
        theme: 'Impactos da inteligência artificial na educação brasileira',
        description: 'Tema gerado por IA para prática',
        isAIGenerated: true
      }
    ]
  }
}
