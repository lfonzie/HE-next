import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface EnemQuestion {
  title: string;
  index: number;
  year: number;
  language: string | null;
  discipline: string;
  context: string;
  files: any[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Array<{
    letter: string;
    text: string;
    file: any;
    isCorrect: boolean;
  }>;
}

interface QuestionFilter {
  year?: number;
  discipline?: string;
  language?: string;
  limit?: number;
  random?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const discipline = searchParams.get('discipline');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '10');
    const random = searchParams.get('random') === 'true';

    const filter: QuestionFilter = {
      limit,
      random: random || false
    };

    if (year) filter.year = parseInt(year);
    if (discipline) filter.discipline = discipline;
    if (language) filter.language = language;

    const questions = await getQuestionsFromLocalDB(filter);

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
      filter
    });

  } catch (error) {
    console.error('Error fetching local ENEM questions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch questions from local database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      areas, 
      numQuestions, 
      year, 
      language,
      difficultyDistribution 
    } = body;

    // Validate input
    if (!areas || !Array.isArray(areas) || areas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Areas are required' },
        { status: 400 }
      );
    }

    if (!numQuestions || numQuestions <= 0) {
      return NextResponse.json(
        { success: false, error: 'Number of questions must be positive' },
        { status: 400 }
      );
    }

    const questions = await generateSimulationFromLocalDB({
      areas,
      numQuestions,
      year,
      language,
      difficultyDistribution
    });

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
      metadata: {
        areas,
        numQuestions,
        year,
        language,
        source: 'local_database'
      }
    });

  } catch (error) {
    console.error('Error generating simulation from local DB:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate simulation from local database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getQuestionsFromLocalDB(filter: QuestionFilter): Promise<EnemQuestion[]> {
  const questionsPath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');
  
  try {
    // Get available years
    const years = await fs.readdir(questionsPath);
    const availableYears = years.filter(year => 
      year.match(/^\d{4}$/) && 
      fs.stat(path.join(questionsPath, year)).then(stats => stats.isDirectory())
    );

    let allQuestions: EnemQuestion[] = [];

    // If year is specified, only look in that year
    const yearsToSearch = filter.year ? [filter.year.toString()] : availableYears;

    for (const year of yearsToSearch) {
      const yearPath = path.join(questionsPath, year);
      
      try {
        const yearStats = await fs.stat(yearPath);
        if (!yearStats.isDirectory()) continue;

        const detailsPath = path.join(yearPath, 'details.json');
        const detailsData = await fs.readFile(detailsPath, 'utf-8');
        const yearDetails = JSON.parse(detailsData);

        // Get questions for this year
        const questionsDir = path.join(yearPath, 'questions');
        const questionDirs = await fs.readdir(questionsDir);

        for (const questionDir of questionDirs) {
          const questionPath = path.join(questionsDir, questionDir, 'details.json');
          
          try {
            const questionData = await fs.readFile(questionPath, 'utf-8');
            const question: EnemQuestion = JSON.parse(questionData);
            
            // Apply filters
            if (filter.discipline && question.discipline !== filter.discipline) continue;
            if (filter.language && question.language !== filter.language) continue;
            
            allQuestions.push(question);
          } catch (error) {
            console.warn(`Error reading question ${questionDir}:`, error);
            continue;
          }
        }
      } catch (error) {
        console.warn(`Error reading year ${year}:`, error);
        continue;
      }
    }

    // Apply random selection if requested
    if (filter.random) {
      allQuestions = shuffleArray(allQuestions);
    }

    // Apply limit
    if (filter.limit && filter.limit > 0) {
      allQuestions = allQuestions.slice(0, filter.limit);
    }

    return allQuestions;

  } catch (error) {
    console.error('Error reading local database:', error);
    throw new Error('Failed to read local ENEM database');
  }
}

async function generateSimulationFromLocalDB(params: {
  areas: string[];
  numQuestions: number;
  year?: number;
  language?: string;
  difficultyDistribution?: any;
}): Promise<any[]> {
  const { areas, numQuestions, year, language } = params;
  
  // Calculate questions per area
  const questionsPerArea = Math.floor(numQuestions / areas.length);
  const remainingQuestions = numQuestions % areas.length;
  
  let allQuestions: any[] = [];
  
  for (let i = 0; i < areas.length; i++) {
    const areaQuestions = questionsPerArea + (i < remainingQuestions ? 1 : 0);
    
    const areaQuestionsData = await getQuestionsFromLocalDB({
      year,
      discipline: areas[i],
      language,
      limit: areaQuestions,
      random: true
    });
    
    // Convert to the format expected by the simulator
    const convertedQuestions = areaQuestionsData.map(question => ({
      item_id: `enem_${question.year}_${question.index}`,
      text: question.context,
      alternatives: {
        A: question.alternatives[0]?.text || '',
        B: question.alternatives[1]?.text || '',
        C: question.alternatives[2]?.text || '',
        D: question.alternatives[3]?.text || '',
        E: question.alternatives[4]?.text || ''
      },
      correct_answer: question.correctAlternative,
      area: question.discipline,
      year: question.year,
      estimated_difficulty: 'medium', // Default difficulty
      metadata: {
        source: 'LOCAL_DATABASE',
        is_official_enem: true,
        original_year: question.year,
        original_index: question.index,
        language: question.language
      }
    }));
    
    allQuestions.push(...convertedQuestions);
  }
  
  // Shuffle all questions
  return shuffleArray(allQuestions);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to get available years and areas
async function getAvailableData() {
  try {
    const questionsPath = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');
    const years = await fs.readdir(questionsPath);
    
    const availableYears = [];
    const availableAreas = new Set<string>();
    
    for (const year of years) {
      if (year.match(/^\d{4}$/)) {
        const yearPath = path.join(questionsPath, year);
        const yearStats = await fs.stat(yearPath);
        
        if (yearStats.isDirectory()) {
          availableYears.push(parseInt(year));
          
          // Get areas from details.json
          try {
            const detailsPath = path.join(yearPath, 'details.json');
            const detailsData = await fs.readFile(detailsPath, 'utf-8');
            const yearDetails = JSON.parse(detailsData);
            
            yearDetails.disciplines?.forEach((discipline: any) => {
              availableAreas.add(discipline.value);
            });
          } catch (error) {
            console.warn(`Error reading details for year ${year}:`, error);
          }
        }
      }
    }
    
    return {
      years: availableYears.sort((a, b) => b - a), // Most recent first
      areas: Array.from(availableAreas)
    };
  } catch (error) {
    console.error('Error getting available data:', error);
    return { years: [], areas: [] };
  }
}
