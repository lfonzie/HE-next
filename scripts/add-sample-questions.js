#!/usr/bin/env node

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleQuestions = [
  // Matemática
  {
    area: 'matematica',
    disciplina: 'Matemática',
    stem: 'Uma loja vende camisetas por R$ 25,00 cada. Se um cliente comprar 3 camisetas, ele terá um desconto de 10% sobre o valor total. Qual será o valor final da compra?',
    a: 'R$ 67,50',
    b: 'R$ 70,00',
    c: 'R$ 72,50',
    d: 'R$ 75,00',
    e: 'R$ 77,50',
    correct: 'a',
    source: 'Sample Question'
  },
  {
    area: 'matematica',
    disciplina: 'Matemática',
    stem: 'Em uma progressão aritmética, o primeiro termo é 3 e a razão é 5. Qual é o décimo termo dessa progressão?',
    a: '43',
    b: '48',
    c: '53',
    d: '58',
    e: '63',
    correct: 'b',
    source: 'Sample Question'
  },
  {
    area: 'matematica',
    disciplina: 'Matemática',
    stem: 'Um triângulo retângulo tem catetos de 3 cm e 4 cm. Qual é a medida da hipotenusa?',
    a: '5 cm',
    b: '6 cm',
    c: '7 cm',
    d: '8 cm',
    e: '9 cm',
    correct: 'a',
    source: 'Sample Question'
  },
  {
    area: 'matematica',
    disciplina: 'Matemática',
    stem: 'Uma função quadrática f(x) = x² - 4x + 3 tem seu vértice no ponto:',
    a: '(2, -1)',
    b: '(2, 1)',
    c: '(-2, -1)',
    d: '(-2, 1)',
    e: '(4, 3)',
    correct: 'a',
    source: 'Sample Question'
  },
  {
    area: 'matematica',
    disciplina: 'Matemática',
    stem: 'Em um conjunto de dados {2, 4, 6, 8, 10}, qual é a média aritmética?',
    a: '5',
    b: '6',
    c: '7',
    d: '8',
    e: '9',
    correct: 'b',
    source: 'Sample Question'
  },

  // Linguagens
  {
    area: 'linguagens',
    disciplina: 'Português',
    stem: 'Leia o texto: "A tecnologia tem revolucionado a forma como nos comunicamos. As redes sociais criaram novas possibilidades de interação." Com base no texto, é correto afirmar que:',
    a: 'A tecnologia apenas dificulta a comunicação.',
    b: 'As redes sociais não influenciam a comunicação.',
    c: 'A tecnologia criou novas formas de comunicação.',
    d: 'A comunicação não mudou com a tecnologia.',
    e: 'As redes sociais são exclusivamente negativas.',
    correct: 'c',
    source: 'Sample Question'
  },
  {
    area: 'linguagens',
    disciplina: 'Português',
    stem: 'Qual das alternativas apresenta uma figura de linguagem?',
    a: 'O sol brilha no céu.',
    b: 'As estrelas piscam no céu.',
    c: 'A lua sorri para nós.',
    d: 'As nuvens flutuam no ar.',
    e: 'O vento sopra suavemente.',
    correct: 'c',
    source: 'Sample Question'
  },
  {
    area: 'linguagens',
    disciplina: 'Literatura',
    stem: 'O movimento literário que valorizava a subjetividade e os sentimentos individuais foi:',
    a: 'Classicismo',
    b: 'Romantismo',
    c: 'Realismo',
    d: 'Naturalismo',
    e: 'Parnasianismo',
    correct: 'b',
    source: 'Sample Question'
  },

  // Ciências Humanas
  {
    area: 'ciencias-humanas',
    disciplina: 'História',
    stem: 'A Revolução Francesa (1789-1799) foi um marco importante na história mundial. Qual foi uma das principais consequências dessa revolução?',
    a: 'O fortalecimento do absolutismo monárquico.',
    b: 'A disseminação dos ideais de liberdade, igualdade e fraternidade.',
    c: 'O retorno ao sistema feudal.',
    d: 'A centralização do poder religioso.',
    e: 'A eliminação completa da nobreza.',
    correct: 'b',
    source: 'Sample Question'
  },
  {
    area: 'ciencias-humanas',
    disciplina: 'Geografia',
    stem: 'O processo de urbanização brasileiro foi marcado por:',
    a: 'Crescimento equilibrado entre campo e cidade.',
    b: 'Migração em massa do campo para a cidade.',
    c: 'Desenvolvimento igualitário em todas as regiões.',
    d: 'Ausência de problemas sociais urbanos.',
    e: 'Distribuição uniforme da população.',
    correct: 'b',
    source: 'Sample Question'
  },
  {
    area: 'ciencias-humanas',
    disciplina: 'Filosofia',
    stem: 'Para Sócrates, a virtude é:',
    a: 'Conhecimento do bem.',
    b: 'Obediência às leis.',
    c: 'Riqueza material.',
    d: 'Poder político.',
    e: 'Beleza física.',
    correct: 'a',
    source: 'Sample Question'
  },

  // Ciências da Natureza
  {
    area: 'ciencias-natureza',
    disciplina: 'Física',
    stem: 'Um objeto de 2 kg é lançado verticalmente para cima com velocidade inicial de 20 m/s. Desprezando a resistência do ar, qual será sua velocidade após 2 segundos? (g = 10 m/s²)',
    a: '0 m/s',
    b: '10 m/s',
    c: '20 m/s',
    d: '30 m/s',
    e: '40 m/s',
    correct: 'a',
    source: 'Sample Question'
  },
  {
    area: 'ciencias-natureza',
    disciplina: 'Química',
    stem: 'A fórmula molecular da água é:',
    a: 'H2O',
    b: 'H2O2',
    c: 'H3O',
    d: 'HO2',
    e: 'H2O3',
    correct: 'a',
    source: 'Sample Question'
  },
  {
    area: 'ciencias-natureza',
    disciplina: 'Biologia',
    stem: 'O processo pelo qual as plantas produzem seu próprio alimento é chamado de:',
    a: 'Respiração',
    b: 'Fotossíntese',
    c: 'Digestão',
    d: 'Circulação',
    e: 'Excreção',
    correct: 'b',
    source: 'Sample Question'
  }
];

async function addSampleQuestions() {
  try {
    console.log('📚 Adicionando questões de exemplo...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const question of sampleQuestions) {
      try {
        // Verificar se a questão já existe (baseado no enunciado)
        const existingQuestion = await prisma.enemQuestion.findFirst({
          where: {
            stem: question.stem
          }
        });

        if (existingQuestion) {
          console.log(`⚠️ Questão já existe: ${question.stem.substring(0, 50)}...`);
          skippedCount++;
          continue;
        }

        // Criar nova questão
        await prisma.enemQuestion.create({
          data: question
        });

        console.log(`✅ Adicionada questão de ${question.area} - ${question.disciplina}`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Erro ao adicionar questão: ${error.message}`);
      }
    }

    console.log(`\n🎉 Processo concluído!`);
    console.log(`   ✅ Questões adicionadas: ${addedCount}`);
    console.log(`   ⚠️ Questões já existentes: ${skippedCount}`);
    console.log(`   📊 Total processado: ${sampleQuestions.length}`);

    // Verificar total de questões por área
    console.log('\n📊 Questões por área:');
    const questionsByArea = await prisma.enemQuestion.groupBy({
      by: ['area'],
      _count: {
        id: true
      }
    });

    questionsByArea.forEach(group => {
      console.log(`   ${group.area}: ${group._count.id} questões`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleQuestions();
