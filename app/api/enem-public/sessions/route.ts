import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { PrismaClient } from '@prisma/client';


import { enemLocalDB } from '@/lib/enem-local-database';



const prisma = new PrismaClient();

interface EnemSessionRequest {
  mode: string;
  area: string[];
  config: {
    num_questions: number;
    time_limit?: number;
    difficulty_distribution?: {
      easy: number;
      medium: number;
      hard: number;
    };
    year?: number;
  };
}

// Generate exam from local ENEM database
async function generateExamFromLocalDB({
  mode,
  areas,
  numQuestions,
  timeLimit,
  year,
  difficultyDistribution
}: {
  mode: string;
  areas: string[];
  numQuestions: number;
  timeLimit?: number;
  year?: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}) {
  try {
    console.log('Generating exam from local database with params:', {
      mode,
      areas,
      numQuestions,
      timeLimit,
      year,
      difficultyDistribution
    });

    // Check if local database is available
    if (!enemLocalDB.isAvailable()) {
      console.log('Local ENEM database not available, falling back to example questions');
      return generateExampleQuestions({ mode, areas, numQuestions, timeLimit, year });
    }

    const examItems = [];
    const questionsPerArea = Math.ceil(numQuestions / areas.length);

    for (const area of areas) {
      try {
        // Map area codes to discipline names (based on exams.json structure)
        const disciplineMap: Record<string, string> = {
          'CN': 'ciencias-natureza',
          'CH': 'ciencias-humanas', 
          'LC': 'linguagens',
          'MT': 'matematica'
        };

        const discipline = disciplineMap[area];
        if (!discipline) continue;

        // Get questions from local database
        const localQuestions = await enemLocalDB.getQuestions({
          discipline,
          year: year || undefined,
          limit: questionsPerArea,
          random: true
        });

        if (localQuestions.length > 0) {
          // Convert to EnemItem format
          const convertedQuestions = localQuestions.map(q => enemLocalDB.convertToSimulatorFormat(q));
          examItems.push(...convertedQuestions);
          console.log(`✅ Loaded ${convertedQuestions.length} real questions for area ${area}`);
        } else {
          console.log(`⚠️ No questions found for area ${area}, generating examples`);
          // Generate example questions for this area if no real ones found
          for (let i = 1; i <= questionsPerArea; i++) {
            examItems.push(generateExampleQuestion(area, i, year));
          }
        }
      } catch (error) {
        console.error(`Error loading questions for area ${area}:`, error);
        // Generate example questions for this area
        for (let i = 1; i <= questionsPerArea; i++) {
          examItems.push(generateExampleQuestion(area, i, year));
        }
      }
    }

    // Limit to requested number of questions
    const finalItems = examItems.slice(0, numQuestions);

    return {
      items: finalItems,
      total_questions: finalItems.length,
      areas: areas,
      time_limit: timeLimit || 180, // Default 3 hours
      mode: mode
    };
  } catch (error) {
    console.error('Error generating exam from local database:', error);
    // Fallback to example questions
    return generateExampleQuestions({ mode, areas, numQuestions, timeLimit, year });
  }
}

// Generate example questions as fallback
function generateExampleQuestions({
  mode,
  areas,
  numQuestions,
  timeLimit,
  year
}: {
  mode: string;
  areas: string[];
  numQuestions: number;
  timeLimit?: number;
  year?: number;
}) {
  const examItems = [];
  
  for (let i = 1; i <= numQuestions; i++) {
    const area = areas[i % areas.length];
    examItems.push(generateExampleQuestion(area, i, year));
  }

  return {
    items: examItems,
    total_questions: numQuestions,
    areas: areas,
    time_limit: timeLimit || 180,
    mode: mode
  };
}

// Generate a single example question
function generateExampleQuestion(area: string, index: number, year?: number) {
  return {
    item_id: `example_${area}_${index}`,
    year: year || 2023,
    area: area,
    text: `Esta é uma questão de exemplo ${index} da área ${area}. Em uma implementação real, esta seria uma questão oficial do ENEM.`,
    alternatives: {
      A: `Alternativa A da questão ${index}`,
      B: `Alternativa B da questão ${index}`,
      C: `Alternativa C da questão ${index}`,
      D: `Alternativa D da questão ${index}`,
      E: `Alternativa E da questão ${index}`
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'][index % 5],
    topic: `Tópico ${index}`,
    estimated_difficulty: ['EASY', 'MEDIUM', 'HARD'][index % 3],
    asset_refs: [],
    content_hash: `example_hash_${index}`,
    dataset_version: '1.0',
    metadata: {
      source: 'EXAMPLE',
      is_official_enem: false,
      is_ai_generated: false,
      has_image: false,
      original_year: year || 2023,
      formatted_at: new Date().toISOString()
    }
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: NextRequest) {
  try {
    // No authentication required for public version
    const userId = 'public-user';

    const body: EnemSessionRequest = await request.json();
    
    // Validações mais robustas
    if (!body.mode) {
      return NextResponse.json({ error: 'mode is required' }, { status: 400 });
    }

    if (!body.area || !Array.isArray(body.area) || body.area.length === 0) {
      return NextResponse.json({ error: 'area must be a non-empty array' }, { status: 400 });
    }

    if (!body.config?.num_questions || body.config.num_questions < 5 || body.config.num_questions > 180) {
      return NextResponse.json({ error: 'num_questions must be between 5 and 180' }, { status: 400 });
    }

    // Validar áreas
    const validAreas = ['CN', 'CH', 'LC', 'MT'];
    for (const area of body.area) {
      if (!validAreas.includes(area)) {
        return NextResponse.json({ error: `Invalid area: ${area}` }, { status: 400 });
      }
    }

    // Generate exam using local ENEM database
    console.log('Generating exam from local ENEM database:', {
      mode: body.mode,
      areas: body.area,
      numQuestions: body.config.num_questions
    });
    
    const examResult = await generateExamFromLocalDB({
      mode: body.mode,
      areas: body.area as any[],
      numQuestions: body.config.num_questions,
      timeLimit: body.config.time_limit,
      year: body.config.year || undefined,
      difficultyDistribution: body.config.difficulty_distribution
    });
    
    console.log('Exam generated successfully from local database:',
      examResult.items?.length, 'items');

    // Shuffle questions for better randomization
    const shuffledItems = shuffleArray(examResult.items || []);
    
    // Generate session ID
    const sessionId = `public_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      session_id: sessionId,
      items: shuffledItems,
      total_questions: examResult.total_questions,
      areas: examResult.areas,
      time_limit: examResult.time_limit,
      mode: examResult.mode,
      success: true
    });

  } catch (error) {
    console.error('Error creating ENEM public session:', error);
    return NextResponse.json({ 
      error: 'Failed to create session',
      success: false 
    }, { status: 500 });
  }
}
