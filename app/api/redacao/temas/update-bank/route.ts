import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Banco de temas organizados por categoria
const TEMAS_POR_CATEGORIA = {
  "Meio Ambiente e Sustentabilidade": [
    "Desafios da transição para energias renováveis no Brasil em meio às mudanças climáticas globais.",
    "O impacto do turismo sustentável na preservação da biodiversidade amazônica.",
    "Crescimento urbano sustentável: equilibrando expansão e conservação ambiental nas metrópoles brasileiras.",
    "A onipresença climática: como eventos extremos afetam a vulnerabilidade social no Nordeste brasileiro.",
    "Consumo consciente e redução de resíduos plásticos: caminhos para uma economia circular em 2025.",
    "Desmatamento e direitos indígenas: o papel da legislação ambiental na proteção de territórios tradicionais.",
    "Adaptação às secas prolongadas: políticas públicas para a segurança hídrica no semiárido.",
    "Sustentabilidade nas grandes cidades: o desafio da mobilidade urbana ecológica.",
    "Impactos da mineração ilegal na contaminação de rios e saúde pública.",
    "Transição verde no agronegócio: inovação tecnológica versus preservação do Cerrado.",
    "Mudanças climáticas e migrações internas: o êxodo rural acelerado no Brasil.",
    "Economia de baixo carbono: incentivos fiscais para indústrias sustentáveis.",
    "Preservação de manguezais: barreiras contra o avanço do nível do mar.",
    "Educação ambiental nas escolas: fomentando consciência geracional para 2025.",
    "Biodiversidade marinha e pesca predatória: regulação para o futuro dos oceanos brasileiros."
  ],
  "Tecnologia e Sociedade": [
    "Privacidade de dados em era de IA: os riscos da vigilância digital no cotidiano brasileiro.",
    "Inteligência artificial no mercado de trabalho: oportunidades e desigualdades de qualificação.",
    "Desinformação nas redes sociais: estratégias para combater fake news em eleições.",
    "O impacto do uso excessivo de telas na saúde mental de adolescentes.",
    "Cibersegurança e proteção infantil: desafios na era da conectividade ubíqua.",
    "Automação industrial e desemprego: a necessidade de requalificação profissional.",
    "Ética na edição genética: limites da biotecnologia em contextos sociais vulneráveis.",
    "Realidade aumentada na educação: democratizando o acesso ao conhecimento.",
    "Big data e desigualdade social: o viés algorítmico na inclusão digital.",
    "Blockchain e transparência governamental: combatendo a corrupção administrativa.",
    "IA generativa na criação artística: o equilíbrio entre inovação e direitos autorais.",
    "Conectividade rural: expandindo o acesso à internet em regiões periféricas.",
    "Robótica na saúde: assistentes virtuais para o envelhecimento populacional.",
    "Mídias sociais e polarização política: o papel da regulação em democracias.",
    "Inovação tecnológica e gênero: superando barreiras para mulheres na STEM."
  ],
  "Saúde e Bem-Estar": [
    "Desigualdade no acesso à saúde mental: o estigma e a sobrecarga do SUS.",
    "Envelhecimento populacional: políticas para o cuidado integral aos idosos.",
    "Pressões estéticas e transtornos alimentares: influências das redes sociais.",
    "Pandemias emergentes: lições da COVID-19 para a vigilância sanitária em 2025.",
    "Sedentarismo urbano: promovendo hábitos ativos em rotinas aceleradas.",
    "Violência doméstica: mecanismos de proteção para vítimas em contextos de isolamento.",
    "Saúde indígena: barreiras culturais e geográficas no atendimento médico.",
    "Dependência química e recuperação: o papel da reinserção social.",
    "Obesidade infantil: intervenções educativas contra o marketing alimentar.",
    "Solidão como ameaça global: estratégias comunitárias para o bem-estar emocional.",
    "Acesso a medicamentos genéricos: equidade no tratamento de doenças crônicas.",
    "Saúde mental no trabalho remoto: desafios da Geração Z na era pós-pandemia.",
    "Vacinação e hesitação: combatendo mitos em comunidades vulneráveis.",
    "Cuidados paliativos: humanizando o fim da vida no sistema de saúde.",
    "Nutrição sustentável: integrando dietas saudáveis à agricultura familiar."
  ],
  "Educação e Inclusão": [
    "Acessibilidade nas escolas: garantindo educação inclusiva para alunos com deficiências.",
    "Analfabetismo funcional: o impacto da evasão escolar no desenvolvimento nacional.",
    "Educação bilíngue em comunidades indígenas: preservando línguas nativas.",
    "Qualificação profissional para a economia digital: reformando o ensino médio.",
    "Desigualdades educacionais regionais: o abismo entre Norte e Sul do Brasil.",
    "Bullying cibernético: políticas escolares para a convivência digital.",
    "Educação ambiental obrigatória: preparando gerações para a crise climática.",
    "Mulheres na ciência: incentivando carreiras STEM desde a base educacional.",
    "Educação de adultos: combatendo o analfabetismo em populações idosas.",
    "Inclusão de refugiados: integrando migrantes ao sistema educacional brasileiro."
  ],
  "Desigualdades Sociais e Direitos Humanos": [
    "Crise habitacional: o direito à moradia digna em centros urbanos superlotados.",
    "Violência contra a mulher: avanços da Lei Maria da Penha em 2025.",
    "Direitos LGBTQIA+: combatendo a discriminação no ambiente de trabalho.",
    "Racismo estrutural: políticas afirmativas para a equidade racial.",
    "Pobreza multidimensional: além da renda, dimensões da exclusão social.",
    "Trabalho infantil: erradicação em cadeias produtivas informais.",
    "Direitos dos idosos: proteção contra abusos em instituições de longa permanência.",
    "Migração climática: acolhimento humanitário para deslocados ambientais.",
    "Desigualdade de gênero no mercado de trabalho: igualdade salarial como meta.",
    "Acesso à justiça para populações periféricas: democratizando o sistema judiciário.",
    "Exploração laboral de imigrantes: regulação para o trabalho digno.",
    "Direitos digitais: inclusão de idosos na era da tecnologia.",
    "Pessoas em situação de rua: políticas de reinserção urbana.",
    "Equidade racial na educação superior: cotas e suas evoluções.",
    "Combate à xenofobia: integrando venezuelanos e haitianos na sociedade brasileira."
  ],
  "Economia e Trabalho": [
    "Futuro do trabalho: adaptação à automação e à Geração Z.",
    "Economia gig: proteções trabalhistas para motoristas e entregadores.",
    "Inflação e custo de vida: impactos na classe média brasileira.",
    "Empreendedorismo feminino: financiamentos para startups lideradas por mulheres.",
    "Desemprego juvenil: programas de estágio para a transição ao mercado.",
    "Sustentabilidade econômica: o papel do cooperativismo na redução de desigualdades.",
    "Criptomoedas e regulação financeira: riscos e oportunidades no Brasil.",
    "Turismo pós-pandemia: recuperação econômica via hospitalidade inclusiva.",
    "Agronegócio e segurança alimentar: equilíbrio entre exportação e fome interna.",
    "Economia verde: incentivos para inovação em energias limpas."
  ],
  "Cultura, Identidade e Consumo": [
    "Preservação cultural indígena: o impacto da globalização nas tradições.",
    "Consumismo e sustentabilidade: repensando o fast fashion no Brasil.",
    "Diversidade na mídia: representação de minorias em novelas e séries.",
    "Identidade quilombola: defesa de territórios contra o avanço urbano.",
    "Cultura popular e turismo: valorizando o carnaval como patrimônio imaterial.",
    "Leitura e analfabetismo cultural: bibliotecas públicas como ferramenta de inclusão.",
    "Arte e terapia: o uso da expressão criativa na saúde mental.",
    "Globalização cultural: equilibrando influências estrangeiras e raízes locais.",
    "Consumo ético: boicotes e ativismo contra marcas exploradoras.",
    "Patrimônio histórico: restauração de sítios ameaçados pelo clima."
  ],
  "Política e Governança": [
    "Participação cidadã digital: e-democracia para engajar jovens eleitores.",
    "Corrupção e transparência: o fortalecimento de órgãos de controle.",
    "Federalismo e desigualdades regionais: repactuação de recursos federais.",
    "Direitos humanos em prisões: humanização do sistema carcerário.",
    "Política externa e solidariedade: o Brasil na agenda global de refugiados."
  ],
  "Outros Temas Emergentes": [
    "Vício em apostas online: regulação para proteger jovens vulneráveis.",
    "Bioeconomia na Amazônia: inovação sem destruição ambiental.",
    "Longevidade ativa: envelhecimento saudável em sociedades urbanas.",
    "Personalização no varejo: ética no uso de dados de consumo.",
    "Aprendizado coletivo na liderança: combatendo a solidão executiva."
  ]
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando atualização do banco de temas por IA...')
    
    // Limpar temas antigos de IA (opcional)
    const clearOld = request.nextUrl.searchParams.get('clear') === 'true'
    
    if (clearOld) {
      console.log('🗑️ Limpando temas antigos de IA...')
      await prisma.conversations.deleteMany({
        where: {
          user_id: '00000000-0000-0000-0000-000000000000',
          module: 'redacao',
          subject: {
            startsWith: 'Tema:'
          }
        }
      })
      console.log('✅ Temas antigos removidos')
    }

    let totalTemas = 0
    const temasSalvos = []

    // Processar cada categoria
    for (const [categoria, temas] of Object.entries(TEMAS_POR_CATEGORIA)) {
      console.log(`📝 Processando categoria: ${categoria} (${temas.length} temas)`)
      
      for (let i = 0; i < temas.length; i++) {
        const tema = temas[i]
        const themeId = `ai-${Date.now()}-${categoria.replace(/\s+/g, '-').toLowerCase()}-${i + 1}`
        
        try {
          const savedTheme = await prisma.conversations.create({
            data: {
              user_id: '00000000-0000-0000-0000-000000000000',
              module: 'redacao',
              subject: `Tema: ${tema}`,
              grade: 'ENEM',
              messages: JSON.stringify([{
                role: 'system',
                content: JSON.stringify({
                  type: 'redacao_theme',
                  themeId: themeId,
                  year: 2025,
                  theme: tema,
                  description: `Tema de redação sobre ${categoria.toLowerCase()}. Tema atual e relevante para o ENEM 2025.`,
                  category: categoria,
                  isAIGenerated: true,
                  createdAt: new Date().toISOString()
                })
              }]),
              token_count: 0,
              model: 'redacao-theme-bank',
              created_at: new Date(),
              updated_at: new Date()
            }
          })
          
          temasSalvos.push({
            id: themeId,
            categoria,
            tema,
            saved: true
          })
          
          totalTemas++
          console.log(`✅ Tema salvo: ${tema.substring(0, 50)}...`)
          
        } catch (error) {
          console.error(`❌ Erro ao salvar tema: ${tema}`, error)
          temasSalvos.push({
            id: themeId,
            categoria,
            tema,
            saved: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      }
    }

    console.log(`🎉 Processamento concluído! ${totalTemas} temas salvos com sucesso.`)

    return NextResponse.json({
      success: true,
      message: `Banco de temas atualizado com sucesso! ${totalTemas} temas salvos.`,
      totalTemas,
      categorias: Object.keys(TEMAS_POR_CATEGORIA).length,
      temasPorCategoria: Object.fromEntries(
        Object.entries(TEMAS_POR_CATEGORIA).map(([cat, temas]) => [cat, temas.length])
      ),
      detalhes: temasSalvos
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar banco de temas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Retornar estatísticas do banco atual
    const totalTemas = await prisma.conversations.count({
      where: {
        user_id: '00000000-0000-0000-0000-000000000000',
        module: 'redacao',
        subject: {
          startsWith: 'Tema:'
        }
      }
    })

    // Buscar alguns temas de exemplo
    const temasExemplo = await prisma.conversations.findMany({
      where: {
        user_id: '00000000-0000-0000-0000-000000000000',
        module: 'redacao',
        subject: {
          startsWith: 'Tema:'
        }
      },
      take: 5,
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      totalTemas,
      temasExemplo: temasExemplo.map(t => ({
        id: t.id,
        subject: t.subject,
        createdAt: t.created_at
      })),
      categoriasDisponiveis: Object.keys(TEMAS_POR_CATEGORIA),
      totalTemasPorCategoria: Object.fromEntries(
        Object.entries(TEMAS_POR_CATEGORIA).map(([cat, temas]) => [cat, temas.length])
      )
    })

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
