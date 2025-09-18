import { NextResponse } from 'next/server'

interface EnemTheme {
  id: string
  year: number
  theme: string
  description: string
}

export async function GET() {
  try {
    // Temas oficiais do ENEM dos últimos anos
    const themes: EnemTheme[] = [
      {
        id: '2023-1',
        year: 2023,
        theme: 'Desafios para o combate à invisibilidade e ao registro civil de pessoas em situação de rua no Brasil',
        description: 'Tema da redação ENEM 2023 - 1º dia'
      },
      {
        id: '2022-1',
        year: 2022,
        theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
        description: 'Tema da redação ENEM 2022 - 1º dia'
      },
      {
        id: '2021-1',
        year: 2021,
        theme: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
        description: 'Tema da redação ENEM 2021 - 1º dia'
      },
      {
        id: '2020-1',
        year: 2020,
        theme: 'O estigma associado às doenças mentais na sociedade brasileira',
        description: 'Tema da redação ENEM 2020 - 1º dia'
      },
      {
        id: '2019-1',
        year: 2019,
        theme: 'Democratização do acesso ao cinema no Brasil',
        description: 'Tema da redação ENEM 2019 - 1º dia'
      },
      {
        id: '2018-1',
        year: 2018,
        theme: 'Manipulação do comportamento do usuário pelo controle de dados na internet',
        description: 'Tema da redação ENEM 2018 - 1º dia'
      },
      {
        id: '2017-1',
        year: 2017,
        theme: 'Desafios para a formação educacional de surdos no Brasil',
        description: 'Tema da redação ENEM 2017 - 1º dia'
      },
      {
        id: '2016-1',
        year: 2016,
        theme: 'Caminhos para combater a intolerância religiosa no Brasil',
        description: 'Tema da redação ENEM 2016 - 1º dia'
      },
      {
        id: '2015-1',
        year: 2015,
        theme: 'A persistência da violência contra a mulher na sociedade brasileira',
        description: 'Tema da redação ENEM 2015 - 1º dia'
      },
      {
        id: '2014-1',
        year: 2014,
        theme: 'Publicidade infantil em questão no Brasil',
        description: 'Tema da redação ENEM 2014 - 1º dia'
      }
    ]

    return NextResponse.json({
      success: true,
      themes: themes.sort((a, b) => b.year - a.year) // Ordenar por ano decrescente
    })

  } catch (error) {
    console.error('Erro ao carregar temas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
